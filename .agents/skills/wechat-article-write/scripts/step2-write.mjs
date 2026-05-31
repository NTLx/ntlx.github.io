#!/usr/bin/env bun
/**
 * Step 2: 文章创作质量门控
 *
 * 校验 draft.md：
 *   - frontmatter 完整（title / date / summary / category / blogSlug / coverImage / sourceUrl）
 *   - blogSlug 为 ASCII kebab-case，且 sourceUrl 与 blogSlug 一致
 *   - 文末互动存在
 *   - 正文无 H1
 *   - ## 原文参考 区块（默认必须，--allow-no-references 可跳过）
 *   - 原文参考区内容验证（至少含 URL 或引用来源）
 *   - materials.md URL 交叉引用检查
 *
 * 字数控制由 ljg-writes 技能自律负责（1000-1500 字），本脚本仅记录字数不设门控。
 *
 * 用法:
 *   bun run step2-write.mjs <date-slug> [--allow-no-references] [--no-humanizer]
 *
 * 退出码: 0 通过；2 frontmatter 缺失；4 互动/原文参考缺失
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { markStepDone, markStepFailed } from "./state-lib.mjs";
import { postsRoot } from "./path-resolver.mjs";
import { VALID_CATEGORIES, ASCII_SLUG_RE, countWords } from "./validation-lib.mjs";
import { readFmValue, extractBody } from "./frontmatter-lib.mjs";

const args = process.argv.slice(2);
const allowNoReferences = args.includes("--allow-no-references");
const noHumanizer = args.includes("--no-humanizer");
// Slug is the positional argument — find args that aren't flags
let slug = null;
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith("--")) continue;
  slug = args[i];
  break;
}
if (!slug) { process.stderr.write("usage: step2-write.mjs <date-slug> [--allow-no-references] [--no-humanizer]\n"); process.exit(1); }

const draftPath = resolve(postsRoot(), slug, "draft.md");
if (!existsSync(draftPath)) {
  process.stderr.write(`step2: draft.md missing: ${draftPath}\n`);
  process.exit(2);
}

const content = readFileSync(draftPath, "utf8");


function fail(code, msg) {
  process.stderr.write(`step2: FAIL - ${msg}\n`);
  markStepFailed(slug, 2, msg);
  process.exit(code);
}

// 1. Frontmatter completeness
const title = readFmValue(content, "title");
const date = readFmValue(content, "date");
const summary = readFmValue(content, "summary");
const category = readFmValue(content, "category");
const blogSlug = readFmValue(content, "blogSlug");
const coverImage = readFmValue(content, "coverImage");
const sourceUrl = readFmValue(content, "sourceUrl");
const targetPath = readFmValue(content, "targetPath");

if (!title) fail(2, "frontmatter.title 缺失");
if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) fail(2, `frontmatter.date 不合法: ${date}`);
if (!summary) fail(2, "frontmatter.summary 缺失（微信草稿箱 digest 必填，需金句式摘要 ≤120 字）");

// Summary quality check: warn if it reads like a bland description
if (/^(本文|这篇文章|这篇文章介绍了|本文介绍了|本文将|本文探讨了)/.test(summary)) {
  process.stderr.write(`step2: WARNING summary 看起来像内容简介（"本文介绍了…"开头），而非金句式摘要。微信推送卡片上展示的就是这句话，请改成概括核心洞察或最反直觉结论的一句金句\n`);
}
if (summary.length > 120) {
  process.stderr.write(`step2: WARNING summary 超过 120 字（当前 ${summary.length} 字），微信 digest 字段上限约 120 字，超长会被截断\n`);
}
if (!coverImage) fail(2, "frontmatter.coverImage 缺失");
if (!category) fail(2, "frontmatter.category 缺失");
if (!VALID_CATEGORIES.includes(category)) fail(2, `category=${category} 不在白名单 ${VALID_CATEGORIES.join(",")}`);
if (!blogSlug) fail(2, "frontmatter.blogSlug 缺失");
if (!ASCII_SLUG_RE.test(blogSlug)) fail(2, `frontmatter.blogSlug 不符合 ASCII kebab-case: ${blogSlug}`);
if (!sourceUrl) fail(2, "frontmatter.sourceUrl 缺失");
// sourceUrl 格式和一致性检查：仅在无 targetPath 时执行。
// 有 targetPath 时（教程策略），sourceUrl 指向博文实际地址，不遵循 articles/{blogSlug} 模式。
if (!targetPath) {
  if (!/^https:\/\/ntlx\.github\.io\/articles\/.+/.test(sourceUrl)) fail(2, `frontmatter.sourceUrl 不合法: ${sourceUrl}`);
  const expectedSourceUrl = `https://ntlx.github.io/articles/${blogSlug}`;
  if (sourceUrl.replace(/\/+$/, "") !== expectedSourceUrl) {
    fail(2, `frontmatter.sourceUrl (${sourceUrl}) 与 blogSlug (${blogSlug}) 不一致，应为 ${expectedSourceUrl}`);
  }
} else {
  // 有 targetPath 时只验证 sourceUrl 是合法的 https URL
  if (!/^https?:\/\/.+/.test(sourceUrl)) fail(2, `frontmatter.sourceUrl 不合法（需为合法 URL）: ${sourceUrl}`);
}

// 2. Word count (informational only — ljg-writes controls its own word count)
const body = extractBody(content);
const { total: wordCount, chineseChars, englishWords } = countWords(body);

// 3. H1 check
if (/^# /m.test(body)) fail(4, "正文出现 H1 标题（Starlight 会重复渲染 title 为 H1）");

// 4. Interaction check
if (!/\*[^*]+\?/.test(body) && !body.includes("*")) {
  process.stderr.write("step2: WARNING 未检测到文末互动问题（*斜体提问* 格式），请确认\n");
  // Non-blocking warning
}

// 5. References check (mandatory for all articles)
const hasRefSection = /^## 原文参考/m.test(body);
if (!hasRefSection && !allowNoReferences) {
  fail(4, "缺少 ## 原文参考 区块（如无需参考文献，使用 --allow-no-references 跳过此检查）");
}

// 5a. Validate reference section has actual content
if (hasRefSection) {
  const refSectionMatch = body.match(/^## 原文参考\s*\n([\s\S]*?)(?=\n## |\n*$)/);
  if (refSectionMatch) {
    const refContent = refSectionMatch[1];
    const hasUrl = /https?:\/\//.test(refContent);
    const hasBlockquoteSource = /^>\s+\S/m.test(refContent);
    if (!hasUrl && !hasBlockquoteSource) {
      process.stderr.write("step2: WARNING ## 原文参考 区块存在但未检测到实际引用内容（URL 或引用来源）\n");
    }
  }
}

// 5b. Cross-check materials.md URLs against draft body
const materialsPath = resolve(postsRoot(), slug, "materials.md");
if (existsSync(materialsPath)) {
  const materialsContent = readFileSync(materialsPath, "utf8");
  const materialUrls = materialsContent.match(/https?:\/\/[^\s)\]>"']+/g) ?? [];
  const unreferenced = materialUrls.filter(url => !body.includes(url));
  if (unreferenced.length > 0) {
    process.stderr.write(`step2: WARNING materials.md 中有 ${unreferenced.length} 个 URL 未在 draft.md 中引用:\n`);
    for (const u of unreferenced) {
      process.stderr.write(`  - ${u}\n`);
    }
  }
}

const stateExtra = { title, date, category, blog_slug: blogSlug, source_url: sourceUrl, word_count: wordCount };
if (noHumanizer) stateExtra.humanizer = "skip";
markStepDone(slug, 2, stateExtra);
process.stdout.write(JSON.stringify({ slug, step: 2, title, date, category, blogSlug, sourceUrl, word_count: wordCount, humanizer: noHumanizer ? "skip" : undefined }) + "\n");

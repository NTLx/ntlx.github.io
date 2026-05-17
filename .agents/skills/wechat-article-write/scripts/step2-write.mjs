#!/usr/bin/env bun
/**
 * Step 2: 文章创作质量门控
 *
 * 校验 draft.md：
 *   - 字数 ≥ 2000（中文字符+英文单词，硬性下限）
 *   - frontmatter 完整（title / date / summary / category / coverImage / sourceUrl）
 *   - 文末互动存在
 *   - 正文无 H1
 *   - ## 原文参考 区块（默认必须，--allow-no-references 可跳过）
 *   - 原文参考区内容验证（至少含 URL 或引用来源）
 *   - materials.md URL 交叉引用检查
 *
 * 用法:
 *   bun run step2-write.mjs <date-slug> [--allow-no-references]
 *
 * 退出码: 0 通过；2 frontmatter 缺失；3 字数不足；4 互动/原文参考缺失
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { markStepDone, markStepFailed } from "./state-lib.mjs";
import { postsRoot, repoRoot } from "./path-resolver.mjs";

const args = process.argv.slice(2);
const allowNoReferences = args.includes("--allow-no-references");
const slug = args.find(a => !a.startsWith("--"));
if (!slug) { process.stderr.write("usage: step2-write.mjs <date-slug> [--allow-no-references]\n"); process.exit(1); }

const draftPath = resolve(postsRoot(), slug, "draft.md");
if (!existsSync(draftPath)) {
  process.stderr.write(`step2: draft.md missing: ${draftPath}\n`);
  process.exit(2);
}

const VALID_CATEGORIES = ["ai-coding", "ai-agents", "ai-industry", "ai-models", "security", "engineering"];
const content = readFileSync(draftPath, "utf8");

// Parse frontmatter
function readFm(file, key) {
  const r = spawnSync("bun", ["run", resolve(repoRoot(), ".agents/skills/wechat-article-write/scripts/set-frontmatter.mjs"), file, "get", key], { encoding: "utf8" });
  return (r.stdout ?? "").trim();
}

function fail(code, msg) {
  process.stderr.write(`step2: FAIL - ${msg}\n`);
  markStepFailed(slug, 2, msg);
  process.exit(code);
}

// 1. Frontmatter completeness
const title = readFm(draftPath, "title");
const date = readFm(draftPath, "date");
const summary = readFm(draftPath, "summary");
const category = readFm(draftPath, "category");
const coverImage = readFm(draftPath, "coverImage");
const sourceUrl = readFm(draftPath, "sourceUrl");

if (!title) fail(2, "frontmatter.title 缺失");
if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) fail(2, `frontmatter.date 不合法: ${date}`);
if (!summary) fail(2, "frontmatter.summary 缺失");
if (!coverImage) fail(2, "frontmatter.coverImage 缺失");
if (!sourceUrl || !/^https:\/\/ntlx\.github\.io\/articles\/.+/.test(sourceUrl)) fail(2, `frontmatter.sourceUrl 不合法: ${sourceUrl}`);
if (!category) fail(2, "frontmatter.category 缺失");
if (!VALID_CATEGORIES.includes(category)) fail(2, `category=${category} 不在白名单 ${VALID_CATEGORIES.join(",")}`);

// 2. Word count (Chinese characters + English words)
const bodyStart = content.indexOf("\n---\n", 4);
const body = bodyStart !== -1 ? content.slice(bodyStart + 5) : content;
const chineseChars = (body.match(/[\u4e00-\u9fff]/g) ?? []).length;
const englishWords = body.replace(/[\u4e00-\u9fff]/g, " ").split(/\s+/).filter(w => /^[a-zA-Z]/.test(w)).length;
const wordCount = chineseChars + englishWords;
if (wordCount < 2000) fail(3, `字数 ${wordCount}（中文${chineseChars}+英文${englishWords}）< 2000（硬性下限）`);

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

markStepDone(slug, 2, { title, date, category, word_count: wordCount });
process.stdout.write(JSON.stringify({ slug, step: 2, title, date, category, word_count: wordCount }) + "\n");
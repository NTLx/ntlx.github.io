#!/usr/bin/env bun
/**
 * Step 2: 文章创作质量门控
 *
 * 校验 draft.md：
 *   - 字数 ≥ 2500（硬性下限）
 *   - frontmatter 完整（title / date / summary / category / coverImage / sourceUrl）
 *   - 文末互动存在
 *   - 正文无 H1
 *   - 读后感类文章含 ## 原文参考
 *
 * 用法:
 *   bun run step2-write.mjs <date-slug>
 *
 * 退出码: 0 通过；2 frontmatter 缺失；3 字数不足；4 互动/原文参考缺失
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { markStepDone, markStepFailed } from "./state-lib.mjs";
import { postsRoot, repoRoot } from "./path-resolver.mjs";

const slug = process.argv[2];
if (!slug) { process.stderr.write("usage: step2-write.mjs <date-slug>\n"); process.exit(1); }

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

// 2. Word count (non-whitespace characters)
const bodyStart = content.indexOf("\n---\n", 4);
const body = bodyStart !== -1 ? content.slice(bodyStart + 5) : content;
const charCount = body.replace(/\s+/g, "").length;
if (charCount < 2500) fail(3, `字数 ${charCount} < 2500（硬性下限）`);

// 3. H1 check
if (/^# /m.test(body)) fail(4, "正文出现 H1 标题（Starlight 会重复渲染 title 为 H1）");

// 4. Interaction check
if (!/\*[^*]+\?/.test(body) && !body.includes("*")) {
  process.stderr.write("step2: WARNING 未检测到文末互动问题（*斜体提问* 格式），请确认\n");
  // Non-blocking warning
}

// 5. References check (for review-style articles)
const isReviewType = /读后感|书评|影评|转述|翻译|review|thoughts on/i.test(body);
if (isReviewType && !/^## 原文参考/m.test(body)) {
  fail(4, "读后感类文章缺少 ## 原文参考 区块");
}

markStepDone(slug, 2, { title, date, category, char_count: charCount });
process.stdout.write(JSON.stringify({ slug, step: 2, title, date, category, char_count: charCount }) + "\n");
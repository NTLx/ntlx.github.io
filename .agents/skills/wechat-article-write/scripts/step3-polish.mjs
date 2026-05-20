#!/usr/bin/env bun
/**
 * Step 3: 文本后处理验证
 *
 * 验证 draft.md 经过 humanizer-zh + baoyu-format-markdown 处理后：
 *   - 文件存在且非空
 *   - frontmatter 完整（title / date / summary / category / blogSlug / coverImage / sourceUrl）
 *   - blogSlug 为 ASCII kebab-case，且 sourceUrl 与 blogSlug 一致
 *   - 正文无 H1
 *   - SLOT_IMG 占位符未丢失
 *   - 字数 ≥ 2000
 *   - 原文参考 区块未丢失（若原文存在）
 *
 * 用法:
 *   bun run step3-polish.mjs <date-slug>
 *
 * 退出码: 0 通过（含字数 WARNING）；2 frontmatter/内容损坏；3 字数严重不足（<1800）
 */

import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { markStepDone, markStepFailed } from "./state-lib.mjs";
import { postsRoot } from "./path-resolver.mjs";

const slug = process.argv[2];
if (!slug) { process.stderr.write("usage: step3-polish.mjs <date-slug>\n"); process.exit(1); }

const VALID_CATEGORIES = ["ai-coding", "ai-agents", "ai-industry", "ai-models", "security", "engineering"];
const ASCII_SLUG_RE = /^[a-z][a-z0-9-]*[a-z0-9]$/;

function fail(code, msg) {
  process.stderr.write(`step3: FAIL - ${msg}\n`);
  markStepFailed(slug, 3, msg);
  process.exit(code);
}

const draftPath = resolve(postsRoot(), slug, "draft.md");
if (!existsSync(draftPath)) {
  fail(2, `draft.md missing: ${draftPath}`);
}

const stat = statSync(draftPath);
if (stat.size === 0) {
  fail(2, "draft.md is empty");
}

// --- Re-validation after polish ---

const content = readFileSync(draftPath, "utf8");

// Parse frontmatter (inline, lightweight — no spawn needed)
function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^(\w[\w-]*):\s*(.+)/);
    if (kv) fm[kv[1]] = kv[2].trim().replace(/^['"]|['"]$/g, "");
  }
  return fm;
}

// Extract body (content after closing --- of frontmatter)
function extractBody(text) {
  const m = text.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return m ? text.slice(m[0].length) : text;
}

const fm = parseFrontmatter(content);
const body = extractBody(content);

// 1. Frontmatter integrity
if (!fm) fail(2, "frontmatter 缺失或格式损坏（未找到 --- 开闭标记）");
if (!fm.title) fail(2, "frontmatter.title 缺失（polish 后丢失）");
if (!fm.date || !/^\d{4}-\d{2}-\d{2}$/.test(fm.date)) fail(2, `frontmatter.date 不合法（polish 后损坏）: ${fm.date ?? ""}`);
if (!fm.summary) fail(2, "frontmatter.summary 缺失（polish 后丢失）");
if (!fm.coverImage) fail(2, "frontmatter.coverImage 缺失（polish 后丢失）");
if (!fm.category) fail(2, "frontmatter.category 缺失（polish 后丢失）");
if (!VALID_CATEGORIES.includes(fm.category)) fail(2, `frontmatter.category 不在白名单（polish 后损坏）: ${fm.category}`);
if (!fm.blogSlug) fail(2, "frontmatter.blogSlug 缺失（polish 后丢失）");
if (!ASCII_SLUG_RE.test(fm.blogSlug)) fail(2, `frontmatter.blogSlug 不符合 ASCII kebab-case（polish 后损坏）: ${fm.blogSlug}`);
if (!fm.sourceUrl || !/^https:\/\/ntlx\.github\.io\/articles\/.+/.test(fm.sourceUrl)) fail(2, `frontmatter.sourceUrl 不合法（polish 后损坏）: ${fm.sourceUrl ?? ""}`);
const expectedSourceUrl = `https://ntlx.github.io/articles/${fm.blogSlug}`;
if (fm.sourceUrl.replace(/\/+$/, "") !== expectedSourceUrl) {
  fail(2, `frontmatter.sourceUrl (${fm.sourceUrl}) 与 blogSlug (${fm.blogSlug}) 不一致`);
}

// 2. No H1 in body
if (/^# /m.test(body)) {
  fail(2, "正文出现 H1 标题（polish 可能引入，Starlight 会重复渲染 title 为 H1）");
}

// 3. SLOT_IMG placeholders preserved
const slotPlaceholders = body.match(/<!--\s*SLOT_IMG_\d{2}[^>]*-->/g) || [];
if (slotPlaceholders.length === 0) {
  fail(2, "正文缺少 SLOT_IMG 占位符（polish 可能清除）");
}

// 4. Word count: ≥ 2000 pass; ≥ 1800 WARNING (humanizer trim); < 1800 FAIL
const chineseChars = (body.match(/[\u4e00-\u9fff]/g) ?? []).length;
const englishWords = body.replace(/[\u4e00-\u9fff]/g, " ").split(/\s+/).filter(w => /^[a-zA-Z]/.test(w)).length;
const wordCount = chineseChars + englishWords;
if (wordCount < 1800) {
  fail(3, `字数 ${wordCount}（中文${chineseChars}+英文${englishWords}）< 1800（polish 后字数严重不足，需回到 Step 2 补充内容）`);
} else if (wordCount < 2000) {
  process.stderr.write(`step3: WARNING 字数 ${wordCount} < 2000 但 ≥ 1800 — humanizer 精简导致字数略低，Agent 请补充 1-2 段落使字数达到 2000+\n`);
  // Non-blocking: pass step but include warning for Agent to act on
  markStepDone(slug, 3, { draft_path: draftPath, size_bytes: stat.size, word_count: wordCount, blog_slug: fm.blogSlug, source_url: fm.sourceUrl, word_count_warning: true });
  process.stdout.write(JSON.stringify({ slug, step: 3, size_bytes: stat.size, word_count: wordCount, blogSlug: fm.blogSlug, sourceUrl: fm.sourceUrl, word_count_warning: true }) + "\n");
  process.exit(0);
}

// 5. 原文参考 preserved (if it existed before polish — check current content)
//    Read后感/review-type articles should retain this section
const isReviewType = /读后感|书评|影评|转述|翻译|review|thoughts on/i.test(body);
if (isReviewType && !/^## 原文参考/m.test(body)) {
  fail(2, "读后感类文章缺少 ## 原文参考 区块（polish 可能删除）");
}

markStepDone(slug, 3, { draft_path: draftPath, size_bytes: stat.size, word_count: wordCount, blog_slug: fm.blogSlug, source_url: fm.sourceUrl });
process.stdout.write(JSON.stringify({ slug, step: 3, size_bytes: stat.size, word_count: wordCount, blogSlug: fm.blogSlug, sourceUrl: fm.sourceUrl }) + "\n");

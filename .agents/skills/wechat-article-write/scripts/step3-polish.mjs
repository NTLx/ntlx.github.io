#!/usr/bin/env bun
/**
 * Step 3: 文本后处理验证
 *
 * 验证 draft.md 经过 humanizer-zh + baoyu-format-markdown 处理后：
 *   - 文件存在且非空
 *   - frontmatter 完整（title / date / category）
 *   - 正文无 H1
 *   - SLOT_IMG 占位符未丢失
 *   - 字数 ≥ 2500
 *   - 原文参考 区块未丢失（若原文存在）
 *
 * 用法:
 *   bun run step3-polish.mjs <date-slug>
 *
 * 退出码: 0 通过；2 frontmatter/内容损坏；3 字数不足
 */

import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { markStepDone, markStepFailed } from "./state-lib.mjs";
import { postsRoot } from "./path-resolver.mjs";

const slug = process.argv[2];
if (!slug) { process.stderr.write("usage: step3-polish.mjs <date-slug>\n"); process.exit(1); }

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
if (!fm.date) fail(2, "frontmatter.date 缺失（polish 后丢失）");
if (!fm.category) fail(2, "frontmatter.category 缺失（polish 后丢失）");

// 2. No H1 in body
if (/^# /m.test(body)) {
  fail(2, "正文出现 H1 标题（polish 可能引入，Starlight 会重复渲染 title 为 H1）");
}

// 3. SLOT_IMG placeholders preserved
//    If body has image references like ![](  there should be corresponding SLOT_IMG placeholders
const slotPlaceholders = body.match(/<!--\s*SLOT_IMG_\d+\s*-->/g) || [];
const imageRefs = body.match(/!\[.*?\]\([^)]+\)/g) || [];
if (imageRefs.length > 0 && slotPlaceholders.length === 0) {
  fail(2, `正文含 ${imageRefs.length} 处图片引用但无 SLOT_IMG 占位符（polish 可能清除）`);
}

// 4. Word count still >= 2500
const charCount = body.replace(/\s+/g, "").length;
if (charCount < 2500) {
  fail(3, `字数 ${charCount} < 2500（polish 后字数不足）`);
}

// 5. 原文参考 preserved (if it existed before polish — check current content)
//    Read后感/review-type articles should retain this section
const isReviewType = /读后感|书评|影评|转述|翻译|review|thoughts on/i.test(body);
if (isReviewType && !/^## 原文参考/m.test(body)) {
  fail(2, "读后感类文章缺少 ## 原文参考 区块（polish 可能删除）");
}

markStepDone(slug, 3, { draft_path: draftPath, size_bytes: stat.size, char_count: charCount });
process.stdout.write(JSON.stringify({ slug, step: 3, size_bytes: stat.size, char_count: charCount }) + "\n");
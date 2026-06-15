#!/usr/bin/env bun
/**
 * Step 3: 文本后处理验证
 *
 * 验证 draft.md 经过 renwei-writing + baoyu-format-markdown 处理后：
 *   - 文件存在且非空
 *   - frontmatter 完整（title / date / summary / category / blogSlug / coverImage / sourceUrl）
 *   - blogSlug 为 ASCII kebab-case，且 sourceUrl 与 blogSlug 一致
 *   - 正文无 H1
 *   - SLOT_IMG_00 信息图和至少 3 张文内插图占位符未丢失
 *   - 原文参考 区块未丢失（若原文存在）
 *
 * 字数控制由 ljg-writes 技能自律负责，本脚本仅记录字数不设门控。
 *
 * 用法:
 *   bun run step3-polish.mjs <date-slug>
 *
 * 退出码: 0 通过；2 frontmatter/内容损坏
 */

import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { markStepDone, markStepFailed, loadState } from "./state-lib.mjs";
import { postsRoot } from "./path-resolver.mjs";
import { VALID_CATEGORIES, ASCII_SLUG_RE, MIN_BODY_ILLUSTRATIONS, countWords, countBodyIllustrationSlots, SLOT_EXTRACT_RE, extractSlotNumbers } from "./validation-lib.mjs";
import { parseFrontmatter, extractBody } from "./frontmatter-lib.mjs";

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

const fm = parseFrontmatter(content);
const body = extractBody(content);

// Load pipeline state to check for humanizer skip flag
const state = loadState(slug);
const humanizerSkip = state?.humanizer === "skip";
const allowNoInteraction = state?.allow_no_interaction === true;
const allowNoReferences = state?.allow_no_references === true;
const hasTargetPath = !!fm.targetPath;

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
if (!fm.sourceUrl) fail(2, "frontmatter.sourceUrl 缺失（polish 后丢失）");
// sourceUrl 格式和一致性检查：有 targetPath 时（教程策略）跳过，sourceUrl 指向博文实际地址
if (!hasTargetPath) {
  if (!/^https:\/\/ntlx\.github\.io\/articles\/.+/.test(fm.sourceUrl)) fail(2, `frontmatter.sourceUrl 不合法（polish 后损坏）: ${fm.sourceUrl ?? ""}`);
  const expectedSourceUrl = `https://ntlx.github.io/articles/${fm.blogSlug}`;
  if (fm.sourceUrl.replace(/\/+$/, "") !== expectedSourceUrl) {
    fail(2, `frontmatter.sourceUrl (${fm.sourceUrl}) 与 blogSlug (${fm.blogSlug}) 不一致`);
  }
}

// 2. No H1 in body
if (/^# /m.test(body)) {
  fail(2, "正文出现 H1 标题（polish 可能引入，Starlight 会重复渲染 title 为 H1）");
}

// 3. SLOT_IMG placeholders preserved
const slotPlaceholders = [...body.matchAll(SLOT_EXTRACT_RE)].map(m => m[0]);
if (slotPlaceholders.length === 0) {
  fail(2, "正文缺少 SLOT_IMG 占位符（polish 可能清除）");
}
const slotNumbers = extractSlotNumbers(body);
if (!slotNumbers.includes(0)) {
  fail(2, "正文缺少 SLOT_IMG_00 信息图占位符（polish 可能清除）");
}
const bodyIllustrationCount = countBodyIllustrationSlots(body);
if (bodyIllustrationCount < MIN_BODY_ILLUSTRATIONS) {
  fail(2, `正文至少需要 ${MIN_BODY_ILLUSTRATIONS} 张文内插图（不含封面图和 SLOT_IMG_00 头部信息图），当前 ${bodyIllustrationCount} 张（polish 可能删除）`);
}

// 4. Word count (informational only — ljg-writes controls its own word count)
const { total: wordCount, chineseChars, englishWords } = countWords(body);

// 5. Interaction preserved unless Step 2 explicitly allowed skipping it
const bodyBeforeRefs = body.split(/^## 原文参考/m)[0];
const interactionTail = bodyBeforeRefs.slice(-1200);
const hasInteractionQuestion = /(^|\n)\s*\*[^*\n]{4,}[？?]\*\s*$/m.test(interactionTail);
if (!allowNoInteraction && !hasInteractionQuestion) {
  fail(2, "缺少文末互动问题（polish 可能删除；需要靠近正文末尾的 *斜体提问？*）");
}

// 6. 原文参考 preserved unless Step 2 explicitly allowed skipping it
//    Keep humanizerSkip as a backward-compatible exemption for older tutorial states.
const referencesRequired = !allowNoReferences && !humanizerSkip;
if (referencesRequired && !/^## 原文参考/m.test(body)) {
  fail(2, "缺少 ## 原文参考 区块（polish 可能删除）");
}

markStepDone(slug, 3, { draft_path: draftPath, size_bytes: stat.size, word_count: wordCount, blog_slug: fm.blogSlug, source_url: fm.sourceUrl, humanizer: humanizerSkip ? "skip" : undefined });
process.stdout.write(JSON.stringify({ slug, step: 3, size_bytes: stat.size, word_count: wordCount, blogSlug: fm.blogSlug, sourceUrl: fm.sourceUrl, humanizer: humanizerSkip ? "skip" : undefined }) + "\n");

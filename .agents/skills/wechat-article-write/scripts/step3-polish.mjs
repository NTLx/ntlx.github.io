#!/usr/bin/env bun
/** Step 3 Gate: validate the humanized draft and record its freshness hash. */

import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { markStepDone, markStepFailed, loadState } from "./state-lib.mjs";
import { postsRoot } from "./path-resolver.mjs";
import { ASCII_SLUG_RE, VALID_CATEGORIES, collectDraftSlots, countWords } from "./validation-lib.mjs";
import { parseFrontmatter, extractBody } from "./frontmatter-lib.mjs";
import { sha256File } from "./artifact-integrity-lib.mjs";

const slug = process.argv[2];
if (!slug) { process.stderr.write("usage: step3-polish.mjs <date-slug>\n"); process.exit(1); }

function fail(code, message) {
  process.stderr.write(`step3: FAIL - ${message}\n`);
  markStepFailed(slug, 3, message);
  process.exit(code);
}

const draftPath = resolve(postsRoot(), slug, "draft.md");
if (!existsSync(draftPath)) fail(2, `draft.md missing: ${draftPath}`);
if (statSync(draftPath).size === 0) fail(2, "draft.md is empty");

const content = readFileSync(draftPath, "utf8");
const fm = parseFrontmatter(content);
const body = extractBody(content);
const state = loadState(slug);
if ((state?.last_complete_step ?? 0) < 2) fail(2, "Step 2 must pass before Step 3");

if (!fm) fail(2, "frontmatter 缺失或格式损坏");
if (!fm.title) fail(2, "frontmatter.title 缺失");
if (!/^\d{4}-\d{2}-\d{2}$/.test(fm.date ?? "")) fail(2, `frontmatter.date 不合法: ${fm.date ?? ""}`);
if (!fm.summary) fail(2, "frontmatter.summary 缺失");
if (!fm.coverImage) fail(2, "frontmatter.coverImage 缺失");
if (!VALID_CATEGORIES.includes(fm.category)) fail(2, `frontmatter.category 不合法: ${fm.category ?? ""}`);
if (!ASCII_SLUG_RE.test(fm.blogSlug ?? "")) fail(2, `frontmatter.blogSlug 不符合 ASCII kebab-case: ${fm.blogSlug ?? ""}`);
if (!fm.sourceUrl) fail(2, "frontmatter.sourceUrl 缺失");
if (!fm.targetPath) {
  if (!/^https:\/\/ntlx\.github\.io\/articles\/.+/.test(fm.sourceUrl)) fail(2, `frontmatter.sourceUrl 不合法: ${fm.sourceUrl}`);
  const expected = `https://ntlx.github.io/articles/${fm.blogSlug}`;
  if (fm.sourceUrl.replace(/\/+$/, "") !== expected) fail(2, "sourceUrl 与 blogSlug 不一致");
}
if (/^# /m.test(body)) fail(2, "正文不能包含 H1");

const slots = collectDraftSlots(body);
const counts = new Map();
for (const slot of slots) counts.set(slot.slot, (counts.get(slot.slot) ?? 0) + 1);
const duplicate = [...counts.entries()].filter(([, count]) => count > 1).map(([slot]) => `SLOT_IMG_${String(slot).padStart(2, "0")}`);
if (duplicate.length) fail(2, `SLOT 编号重复: ${duplicate.join(", ")}`);
if (counts.get(0) !== 1) fail(2, "正文必须保留恰好一次 SLOT_IMG_00");

const allowNoInteraction = state?.allow_no_interaction === true;
if (!allowNoInteraction && !/[？?]/.test(body.split(/^## 参考资料/m)[0].slice(-1200))) {
  fail(2, "缺少文末互动问题；若确无互动，复用 Step 2 的 allow_no_interaction 状态");
}
if (state?.allow_no_references !== true && !/^## 参考资料/m.test(body)) {
  fail(2, "缺少 ## 参考资料 区块；若确无参考资料，复用 Step 2 的 allow_no_references 状态");
}

const hash = sha256File(draftPath);
const wordCount = countWords(body);
markStepDone(slug, 3, {
  draft_path: draftPath,
  size_bytes: statSync(draftPath).size,
  word_count: wordCount,
  blog_slug: fm.blogSlug,
  source_url: fm.sourceUrl,
  step3_draft_sha256: hash,
});
process.stdout.write(JSON.stringify({ slug, step: 3, draft_sha256: hash, word_count: wordCount }) + "\n");

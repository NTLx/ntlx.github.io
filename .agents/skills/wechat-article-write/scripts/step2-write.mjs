#!/usr/bin/env bun
/**
 * Step 2: 文章创作质量门控
 *
 * 校验 draft.md：
 *   - frontmatter 完整（title / date / summary / category / blogSlug / coverImage / sourceUrl）
 *   - blogSlug 为 ASCII kebab-case，且 sourceUrl 与 blogSlug 一致
 *   - 正文无 H1
 *   - SLOT_IMG_00 信息图恰好存在一次，正文 SLOT 编号不重复
 *   - 文末互动存在
 *   - 正文无 H1
 *   - ## 参考资料 区块（默认必须，--allow-no-references 可跳过）
 *   - 参考资料区内容验证（至少含 URL 或引用来源）
 *   - materials.md URL 交叉引用检查
 *   - image-plan 的全文视觉覆盖审阅与 SLOT00 head invariant
 *
 * 字数属于内容策略和 Agent 的编辑判断，本脚本仅记录字数不设门控。
 *
 * 用法:
 *   bun run step2-write.mjs <date-slug> [--allow-no-references] [--allow-no-interaction]
 *
 * 退出码: 0 通过；2 frontmatter 缺失；4 互动/参考资料缺失
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { markStepDone, markStepFailed } from "./state-lib.mjs";
import { postsRoot } from "./path-resolver.mjs";
import { VALID_CATEGORIES, ASCII_SLUG_RE, countWords } from "./validation-lib.mjs";
import { readFmValue, extractBody } from "./frontmatter-lib.mjs";
import { collectDraftSlots } from "./validation-lib.mjs";
import { collectMarkdownImages, collectSubstantiveSections } from "./markdown-structure-lib.mjs";

const args = process.argv.slice(2);
const allowedFlags = new Set(["--allow-no-references", "--allow-no-interaction", "--allow-no-related"]);
const unknownFlag = args.find((arg) => arg.startsWith("--") && !allowedFlags.has(arg));
if (unknownFlag) {
  process.stderr.write(`step2: FAIL - unknown flag ${unknownFlag}\n`);
  process.exit(1);
}
const allowNoReferences = args.includes("--allow-no-references");
const allowNoInteraction = args.includes("--allow-no-interaction");
const allowNoRelated = args.includes("--allow-no-related");
// Exactly one positional slug is accepted; do not silently ignore extra args.
const positional = args.filter((arg) => !arg.startsWith("--"));
if (positional.length > 1) {
  process.stderr.write(`step2: FAIL - unexpected argument ${positional[1]}\n`);
  process.exit(1);
}
const slug = positional[0] ?? null;
if (!slug) { process.stderr.write("usage: step2-write.mjs <date-slug> [--allow-no-references] [--allow-no-interaction] [--allow-no-related]\n"); process.exit(1); }

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

// 2. Word count (informational only — the active strategy owns this decision)
const body = extractBody(content);
const { total: wordCount, chineseChars, englishWords } = countWords(body);

if (/^\[[^\]\n]+\]:\s*\S+/m.test(body)) {
  fail(4, "正文使用了 reference-style Markdown 链接。请改用 inline links: [文本](URL)，以便 Step 5 为博客/微信生成不同链接形态");
}

// 3. H1 check
if (/^# /m.test(body)) fail(4, "正文出现 H1 标题（Starlight 会重复渲染 title 为 H1）");

// 3a. SLOT_IMG placeholder check.  SLOT 00 is mandatory; body visual count
// is an editorial/image-plan decision rather than a fixed quantity gate.
const draftSlots = collectDraftSlots(body);
if (draftSlots.length === 0) fail(4, "正文缺少 SLOT_IMG 占位符（必须包含 <!-- SLOT_IMG_00_INFOGRAPHIC -->）");
const slotCounts = new Map();
for (const slot of draftSlots) slotCounts.set(slot.slot, (slotCounts.get(slot.slot) ?? 0) + 1);
const duplicateSlots = [...slotCounts.entries()].filter(([, count]) => count > 1).map(([slot]) => `SLOT_IMG_${String(slot).padStart(2, "0")}`);
if (duplicateSlots.length > 0) fail(4, `正文 SLOT 编号必须唯一，发现重复: ${duplicateSlots.join(", ")}`);
if ((slotCounts.get(0) ?? 0) !== 1) fail(4, "正文必须恰好包含一次 SLOT_IMG_00 信息图占位符（SLOT 00 是必填视觉摘要）");
const bodySlotNumbers = [...slotCounts.keys()].filter((slot) => slot > 0).sort((a, b) => a - b);
if (!bodySlotNumbers.every((slot, index) => slot === index + 1)) fail(4, "正文 generated SLOT 必须从 SLOT_IMG_01 连续编号");

// SLOT00 is the lead visual. Body visual planning happens after humanization,
// when source-image reuse and final assets are known.
const sections = collectSubstantiveSections(body);
if (sections[0] && draftSlots.find((slot) => slot.slot === 0)?.index >= sections[0].start) {
  fail(4, "SLOT_IMG_00 must appear before the first substantive H2");
}
const firstVisual = [...draftSlots.map((slot) => ({ index: slot.index, slot: slot.slot })),
  ...collectMarkdownImages(body).map((item) => ({ index: item.index, slot: null }))]
  .sort((a, b) => a.index - b.index)[0];
if (firstVisual?.slot !== 0) fail(4, "SLOT_IMG_00 must be the first body visual image");

// 4. Interaction check
// 旧正则 /(^|\n)\s*\*[^*\n]{4,}[？?]\*\s*$/m 过于脆弱：
//   - 强制 `*…？*` 斜体 + 行尾（拒绝 "…？* 欢迎留言聊聊"）
//   - 单行锚定（拒绝 "*问1？* *问2？*" 同行多问）
//   - 不接受纯文本问句
// 新规则：正文末尾 1200 字符内出现至少一个中/英文问号即算有互动。
// 仍保留 --allow-no-interaction 作为彻底跳过校验的逃生口（教程策略等场景）。
const bodyBeforeRefs = body.split(/^## 参考资料/m)[0];
const interactionTail = bodyBeforeRefs.slice(-1200);
const hasInteractionQuestion = /[？?]/.test(interactionTail);
if (!hasInteractionQuestion) {
  if (allowNoInteraction) {
    process.stderr.write("step2: WARNING 未检测到文末互动问题（--allow-no-interaction 已允许跳过）\n");
  } else {
    fail(4, "缺少文末互动问题（正文末尾附近需含至少一个中/英文问号；如确无互动，使用 --allow-no-interaction 跳过）");
  }
}

// 5. References check (mandatory for all articles)
const hasRefSection = /^## 参考资料/m.test(body);
if (!hasRefSection && !allowNoReferences) {
  fail(4, "缺少 ## 参考资料 区块（如无需参考文献，使用 --allow-no-references 跳过此检查）");
}

// 5a. Validate reference section has actual content
if (hasRefSection) {
  const refSectionMatch = body.match(/^## 参考资料\s*\n([\s\S]*?)(?=\n## |\n*$)/);
  if (refSectionMatch) {
    const refContent = refSectionMatch[1];
    const hasUrl = /https?:\/\//.test(refContent);
    const hasBlockquoteSource = /^>\s+\S/m.test(refContent);
    if (!hasUrl && !hasBlockquoteSource) {
      process.stderr.write("step2: WARNING ## 参考资料 区块存在但未检测到实际引用内容（URL 或引用来源）\n");
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

const blogMemoryPath = resolve(postsRoot(), slug, "blog-memory.json");
let blogMemoryUsed = false;
let blogMemoryCandidates = 0;
if (existsSync(blogMemoryPath)) {
  try {
    const memory = JSON.parse(readFileSync(blogMemoryPath, "utf8"));
    const highConfidence = (memory.candidates ?? []).filter((c) => c.high_confidence === true || Number(c.score ?? 0) >= 6);
    blogMemoryCandidates = highConfidence.length;
    blogMemoryUsed = highConfidence.some((c) => {
      return (c.url && body.includes(c.url)) || (c.title && body.includes(c.title));
    });
    if (highConfidence.length > 0 && !blogMemoryUsed && !allowNoRelated) {
      fail(4, "站内记忆包中存在高相关旧文，但 draft.md 未提及任何候选标题或 URL；如确实不适合联动，使用 --allow-no-related");
    }
  } catch (err) {
    fail(4, `blog-memory.json 解析失败: ${err.message}`);
  }
} else {
  process.stderr.write("step2: WARNING 未找到 blog-memory.json；Step 1.5 站内记忆检索可能未执行\n");
}

const stateExtra = {
  title,
  date,
  category,
  blog_slug: blogSlug,
  source_url: sourceUrl,
  word_count: wordCount,
  allow_no_references: allowNoReferences,
  allow_no_interaction: allowNoInteraction,
  allow_no_related: allowNoRelated,
  blog_memory_candidates: blogMemoryCandidates,
  blog_memory_used: blogMemoryUsed,
};
markStepDone(slug, 2, stateExtra);
process.stdout.write(JSON.stringify({ slug, step: 2, title, date, category, blogSlug, sourceUrl, word_count: wordCount }) + "\n");

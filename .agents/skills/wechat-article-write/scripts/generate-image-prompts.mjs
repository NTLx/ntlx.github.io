#!/usr/bin/env bun
/**
 * Step 4 helper: generate image prompt files from draft.md using baoyu templates.
 *
 * Usage:
 *   bun run generate-image-prompts.mjs <date-slug> [--overwrite]
 *
 * The script creates:
 *   - imgs/prompts/00-cover-{blogSlug}.md
 *   - imgs/prompts/00-infographic-core-summary.md
 *   - imgs/prompts/{NN}-{desc}.md for SLOT_IMG_01+
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { postDir, repoRoot } from "./path-resolver.mjs";
import { parseFrontmatter, extractBody } from "./frontmatter-lib.mjs";
import { SLOT_EXTRACT_RE, resolveSlotImg } from "./validation-lib.mjs";

const args = process.argv.slice(2);
const overwrite = args.includes("--overwrite");
const slug = args.find((a) => !a.startsWith("--"));

if (!slug) {
  process.stderr.write("usage: generate-image-prompts.mjs <date-slug> [--overwrite]\n");
  process.exit(1);
}

function fail(msg, code = 2) {
  process.stderr.write(`generate-image-prompts: FAIL - ${msg}\n`);
  process.exit(code);
}

function readRequired(path) {
  if (!existsSync(path)) fail(`required file missing: ${path}`);
  return readFileSync(path, "utf8");
}

function skillDir(name) {
  const home = process.env.HOME ?? "";
  const candidates = [
    resolve(repoRoot(), ".agents/skills", name),
    resolve(repoRoot(), ".claude/skills", name),
    home ? resolve(home, ".agents/skills", name) : null,
    home ? resolve(home, ".claude/skills", name) : null,
  ].filter(Boolean);
  const found = candidates.find((p) => existsSync(p));
  if (!found) fail(`skill not found: ${name}`);
  return found;
}

function compactText(text, max = 900) {
  const cleaned = text
    .replace(/^## 原文参考[\s\S]*$/m, " ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/https?:\/\/[^\s)]+/g, " ")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
  return cleaned.length > max ? cleaned.slice(0, max).trimEnd() + "\n..." : cleaned;
}

function extractLabels(body, fm) {
  const headings = (body.match(/^##\s+(.+)$/gm) ?? [])
    .map((h) => h.replace(/^##\s+/, "").trim())
    .filter((h) => h !== "原文参考");
  const summaryParts = String(fm.summary ?? "")
    .split(/[，。；：、,.!?！？;:]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set([fm.title, ...headings, ...summaryParts])]
    .filter(Boolean)
    .slice(0, 8)
    .map((label) => `- ${label}`)
    .join("\n");
}

function extractSection(markdown, header) {
  const escaped = header.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`^## ${escaped}\\n([\\s\\S]*?)(?=\\n## |\\n# |$)`, "m");
  const m = markdown.match(re);
  return m ? `## ${header}\n${m[1].trim()}` : "";
}

function sectionContext(body, index) {
  return compactText(body.slice(Math.max(0, index - 700), index + 1100), 1200);
}

function inferIllustrationType(context, desc) {
  const text = `${desc ?? ""}\n${context}`;
  if (/对比|比较|冲突|相反|vs\.?|versus|两种|二分/i.test(text)) return "comparison";
  if (/流程|路径|步骤|循环|转化|迁移|链条|pipeline|flow/i.test(text)) return "flowchart";
  return "framework";
}

function typeTemplate(type) {
  if (type === "comparison") {
    return `## Type Template: Comparison

Layout: two-sided comparison with a clear center divider.
ZONES:
- Left side: one concept or force from the article
- Right side: contrasting concept or force from the article
- Bottom: one concise takeaway connecting both sides
`;
  }
  if (type === "flowchart") {
    return `## Type Template: Flowchart

Layout: left-to-right process flow with 3-5 nodes.
CONNECTIONS: clear arrows, short Chinese labels, one highlighted turning point.
`;
  }
  return `## Type Template: Framework

Layout: central idea with 3-5 surrounding modules.
ZONES: each module has one icon, one Chinese label, and one short phrase.
`;
}

function safeDesc(desc, fallback) {
  const s = String(desc ?? fallback)
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || fallback;
}

function writePrompt(path, content) {
  if (existsSync(path) && !overwrite) {
    process.stderr.write(`generate-image-prompts: skip existing ${basename(path)} (use --overwrite to replace)\n`);
    return false;
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content.trimEnd() + "\n");
  return true;
}

const dir = postDir(slug);
const draftPath = resolve(dir, "draft.md");
if (!existsSync(draftPath)) fail(`draft.md missing: ${draftPath}`);

const raw = readRequired(draftPath);
const fm = parseFrontmatter(raw);
if (!fm) fail("frontmatter missing in draft.md");
const body = extractBody(raw);

const promptsDir = resolve(dir, "imgs/prompts");
const infographicDir = skillDir("baoyu-infographic");
const illustratorDir = skillDir("baoyu-article-illustrator");
const coverDir = skillDir("baoyu-cover-image");

const infographicBase = readRequired(resolve(infographicDir, "references/base-prompt.md"));
const bentoGrid = readRequired(resolve(infographicDir, "references/layouts/bento-grid.md"));
const craftHandmade = readRequired(resolve(infographicDir, "references/styles/craft-handmade.md"));
const promptConstruction = readRequired(resolve(illustratorDir, "references/prompt-construction.md"));
const vectorStyle = readRequired(resolve(illustratorDir, "references/styles/vector-illustration.md"));
readRequired(resolve(coverDir, "references/workflow/prompt-template.md"));

const slots = [...body.matchAll(SLOT_EXTRACT_RE)].map((m) => {
  const parsed = resolveSlotImg(m[0]);
  return { ...parsed, index: m.index, raw: m[0] };
});
if (!slots.some((s) => s.slot === 0)) fail("SLOT_IMG_00 is required before generating prompts");

const labels = extractLabels(body, fm);
const coreContent = [
  `Title: ${fm.title}`,
  `Summary: ${fm.summary ?? ""}`,
  "",
  compactText(body, 1400),
].join("\n");

const coverSlug = safeDesc(fm.blogSlug ?? slug, "article");
const coverPrompt = `---
type: cover
palette: cool
rendering: flat-vector
---

# Content Context
Article title: ${fm.title}
Content summary: ${fm.summary ?? ""}
Keywords: ${labels.replace(/^- /gm, "").split("\n").filter(Boolean).slice(0, 8).join(", ")}

# Visual Design
Cover theme: conceptual visual hammer
Type: conceptual
Palette: cool
Rendering: flat-vector
Font: none
Text level: none
Mood: bold
Aspect ratio: 16:9
Language: Chinese

# Text Elements
No text elements. Do not render title, labels, captions, logos, watermarks, color names, or hex codes.

# Composition
Type composition: abstract shapes representing the article's central tension; information hierarchy, clean zones.
Visual composition: one strong symbolic metaphor derived from the article, centered with generous negative space.
Color constraint: Color values (#hex) and color names are rendering guidance only — do NOT display color names, hex codes, or palette labels as visible text in the image.
Rendering notes: flat vector, clean outlines, bold contrast, no photorealism.
`;

const infographicPrompt = infographicBase
  .replaceAll("{{LAYOUT}}", "bento-grid")
  .replaceAll("{{STYLE}}", "craft-handmade")
  .replaceAll("{{ASPECT_RATIO}}", "16:9")
  .replaceAll("{{LANGUAGE}}", "Chinese")
  .replaceAll("{{LAYOUT_GUIDELINES}}", bentoGrid.trim())
  .replaceAll("{{STYLE_GUIDELINES}}", craftHandmade.trim())
  .replaceAll("{{CONTENT}}", coreContent)
  .replaceAll("{{TEXT_LABELS}}", labels);

const defaultComposition = extractSection(promptConstruction, "Default Composition Requirements");
const textRequirements = extractSection(promptConstruction, "Text in Illustrations");
const colorRules = extractSection(promptConstruction, "Color Specification Rules");
const commonChineseRule = `## Chinese Text Rule

Visible text should use Chinese labels and Chinese short phrases by default. Keep model names, product names, API/code identifiers, English abbreviations, and quoted source terminology in the original language only when translation would be inaccurate. Do not use English merely for visual style.`;

const outputs = [];
if (writePrompt(resolve(promptsDir, `00-cover-${coverSlug}.md`), coverPrompt)) outputs.push(`00-cover-${coverSlug}.md`);
if (writePrompt(resolve(promptsDir, "00-infographic-core-summary.md"), infographicPrompt)) outputs.push("00-infographic-core-summary.md");

for (const slot of slots.filter((s) => s.slot > 0)) {
  const context = sectionContext(body, slot.index);
  const type = inferIllustrationType(context, slot.desc);
  const nn = String(slot.slot).padStart(2, "0");
  const desc = safeDesc(slot.desc, "illustration");
  const prompt = `---
illustration_id: ${nn}
type: ${type}
style: vector-illustration
---

# Article Illustration Prompt

Article title: ${fm.title}
Slot: SLOT_IMG_${nn}${slot.desc ? `_${slot.desc}` : ""}
Purpose: explain the nearby argument with a high-information visual aid, not decoration.

${typeTemplate(type)}

## Source Context

${context}

${defaultComposition}

${textRequirements}

${commonChineseRule}

${colorRules}

## Style: vector-illustration

${vectorStyle.trim()}

## Final Rendering Instructions

Clean composition with generous white space. Text should be large, prominent, and readable. Color values (#hex) and color names are rendering guidance only — do NOT display color names, hex codes, or palette labels as visible text in the image. Aspect ratio: 16:9.
`;
  const name = `${nn}-${desc}.md`;
  if (writePrompt(resolve(promptsDir, name), prompt)) outputs.push(name);
}

process.stdout.write(JSON.stringify({ slug, prompts_dir: promptsDir, written: outputs }, null, 2) + "\n");

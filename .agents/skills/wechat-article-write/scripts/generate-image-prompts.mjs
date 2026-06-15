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
    .replace(/`([^`]*)`/g, "$1")
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

function compactLabels(body, fm, max = 7) {
  return extractLabels(body, fm)
    .split(/\r?\n/)
    .map((line) => line.replace(/^- /, "").trim())
    .filter(Boolean)
    .slice(0, max);
}

function extractSection(markdown, header) {
  const lines = markdown.split(/\r?\n/);
  const heading = `## ${header}`;
  const start = lines.findIndex((line) => line.trim() === heading);
  if (start === -1) return "";

  const section = [heading];
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i];
    if (/^##\s+/.test(line) || /^#\s+/.test(line)) break;
    section.push(line);
  }

  return section.join("\n").trimEnd();
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

const GPT_IMAGE_2_INFOGRAPHIC_VARIANTS = {
  "hand-drawn": {
    source: "infographics/hand-drawn-infographic.md",
    style: "high-quality bullet journal infographic with hand-drawn wobble, warm Morandi colors, readable Chinese hand-lettered labels",
    palette: "warm cream or off-white paper, dusty sage, terracotta, muted mustard, taupe, charcoal ink",
  },
  "bento": {
    source: "infographics/bento-grid-infographic.md",
    style: "Apple Newsroom / Notion-style bento grid infographic with rounded modules and clear hierarchy",
    palette: "warm off-white background, deep ink text, restrained accent color, soft module tints",
  },
  "comparison": {
    source: "infographics/comparison-infographic.md",
    style: "clean comparison infographic with balanced columns, clear contrast, and concise callouts",
    palette: "neutral background, two restrained comparison colors, one accent for the conclusion",
  },
  "dashboard": {
    source: "infographics/kpi-dashboard-infographic.md",
    style: "polished KPI dashboard infographic with large numbers, concise charts, and editorial spacing",
    palette: "clean light dashboard palette, deep ink text, one vivid metric accent",
  },
  "step-by-step": {
    source: "infographics/step-by-step-infographic.md",
    style: "warm step-by-step infographic with numbered badges, simple illustrations, and clear connectors",
    palette: "warm cream background, friendly orange, sage green, deep brown text",
  },
};

const INFO_STYLE_TO_GPT_VARIANT = {
  "morandi-journal": "hand-drawn",
  "craft-handmade": "hand-drawn",
  "aged-academia": "hand-drawn",
  "technical-schematic": "bento",
  "bold-graphic": "bento",
  "retro-pop-grid": "bento",
};

const INFO_LAYOUT_TO_GPT_VARIANT = {
  "linear-progression": "step-by-step",
  "circular-flow": "step-by-step",
  "winding-roadmap": "step-by-step",
  "comparison-matrix": "comparison",
  "binary-comparison": "comparison",
  "venn-diagram": "comparison",
  "dashboard": "dashboard",
  "dense-modules": "bento",
  "bento-grid": "bento",
};

function selectGptImage2InfographicVariant(config) {
  const explicit = config.gpt_variant ?? config.gptVariant;
  const variantId = explicit
    ?? INFO_STYLE_TO_GPT_VARIANT[config.style]
    ?? INFO_LAYOUT_TO_GPT_VARIANT[config.layout]
    ?? "bento";
  return GPT_IMAGE_2_INFOGRAPHIC_VARIANTS[variantId] ?? GPT_IMAGE_2_INFOGRAPHIC_VARIANTS.bento;
}

function warnIfGptImage2TemplateMissing(source) {
  const path = resolve(repoRoot(), ".agents/skills/gpt-image-2/references", source);
  if (!existsSync(path)) {
    process.stderr.write(`generate-image-prompts: WARN - gpt-image-2 template not found: ${source}; using compact fallback text\n`);
  }
}

function buildCompactInfographicPrompt({ fm, body, labels, layout, style, aspect }) {
  const labelText = labels.map((label) => `"${label}"`).join(", ");
  const gptTemplate = selectGptImage2InfographicVariant({ layout, style });
  warnIfGptImage2TemplateMissing(gptTemplate.source);
  const subject = compactText(body, 760).replace(/\n+/g, " / ");

  return [
    `Template source: gpt-image-2/references/${gptTemplate.source}`,
    "Use case: infographic-diagram",
    `Primary request: Create an article-opening infographic that summarizes the central argument of "${fm.title}" for a WeChat/blog article.`,
    "Scene/background: clean light neutral editorial canvas",
    `Subject: ${subject}`,
    `Style/medium: ${gptTemplate.style}`,
    `Composition/framing: ${aspect} landscape header; layout hint ${layout}; 4-6 clearly separated information zones; strong hierarchy; generous whitespace; arrows or callouts only where they explain relationships`,
    `Color palette: ${gptTemplate.palette}`,
    `Text (verbatim): ${labelText}`,
    "Constraints: Chinese labels must be readable and rendered exactly; use short labels only; strong contrast; no tiny text; no logos, trademarks, watermark, QR code, color names, hex codes, or decorative filler",
    "Avoid: photorealism, dense small print, cluttered dashboards, stock icons, extra slogans, invented data",
  ].join("\n");
}

// --- Style families and article_type → template defaults ---
const STYLE_FAMILIES = {
  journal:   { infoStyle: "morandi-journal",      illStyle: "warm" },
  tech:      { infoStyle: "technical-schematic",   illStyle: "blueprint" },
  editorial: { infoStyle: "craft-handmade",        illStyle: "editorial" },
  bold:      { infoStyle: "bold-graphic",          illStyle: "notion" },
  minimal:   { infoStyle: "ikea-manual",           illStyle: "minimal" },
  retro:     { infoStyle: "retro-pop-grid",        illStyle: "retro" },
  elegant:   { infoStyle: "aged-academia",          illStyle: "elegant" },
};

const ARTICLE_TYPE_DEFAULTS = {
  "deep-analysis":       { family: "journal",   infoLayout: "dense-modules",        cover: { type: "scene",      palette: "elegant", rendering: "painterly" } },
  "opinion-essay":       { family: "journal",   infoLayout: "hub-spoke",            cover: { type: "metaphor",   palette: "warm",    rendering: "hand-drawn" } },
  "technical-deep-dive": { family: "tech",      infoLayout: "structural-breakdown", cover: { type: "conceptual", palette: "cool",    rendering: "flat-vector" } },
  "tutorial":            { family: "minimal",   infoLayout: "linear-progression",   cover: { type: "conceptual", palette: "vivid",   rendering: "digital" } },
  "news-digest":         { family: "retro",     infoLayout: "bento-grid",           cover: { type: "conceptual", palette: "mono",    rendering: "screen-print" } },
  "listicle":            { family: "bold",      infoLayout: "comparison-matrix",    cover: { type: "conceptual", palette: "vivid",   rendering: "flat-vector" } },
  "data-story":          { family: "bold",      infoLayout: "dashboard",            cover: { type: "conceptual", palette: "cool",    rendering: "digital" } },
};

function resolveConfigDefaults(imagePlan) {
  const articleType = imagePlan?.article_type ?? "deep-analysis";
  const typeDefaults = ARTICLE_TYPE_DEFAULTS[articleType];

  if (!typeDefaults) {
    process.stderr.write(`generate-image-prompts: WARN - unknown article_type "${articleType}", falling back to deep-analysis\n`);
  }
  const td = typeDefaults ?? ARTICLE_TYPE_DEFAULTS["deep-analysis"];

  const direction = imagePlan?.direction;
  const familyId = (direction && STYLE_FAMILIES[direction]) ? direction : td.family;
  const family = STYLE_FAMILIES[familyId] ?? STYLE_FAMILIES.journal;

  return {
    cover: { ...td.cover },
    infographic: { layout: td.infoLayout, style: family.infoStyle, aspect: "16:9" },
    illustrationStyle: family.illStyle,
  };
}

function resolveTemplateFile(sourceSkill, subPath) {
  const candidates = [
    resolve(repoRoot(), ".agents/skills", sourceSkill, subPath),
    resolve(repoRoot(), ".claude/skills", sourceSkill, subPath),
  ];
  const found = candidates.find((p) => existsSync(p));
  if (!found) {
    process.stderr.write(`generate-image-prompts: WARN - template not found: ${sourceSkill}/${subPath}, using fallback\n`);
    return null;
  }
  return readFileSync(found, "utf8");
}

const dir = postDir(slug);
const draftPath = resolve(dir, "draft.md");
if (!existsSync(draftPath)) fail(`draft.md missing: ${draftPath}`);

// --- image-plan.json: content-aware template selection ---
const imagePlanPath = resolve(dir, "image-plan.json");
let imagePlan = null;
if (existsSync(imagePlanPath)) {
  try {
    imagePlan = JSON.parse(readFileSync(imagePlanPath, "utf8"));
  } catch (e) {
    process.stderr.write(`generate-image-prompts: WARN - invalid image-plan.json, falling back to defaults: ${e.message}\n`);
  }
}

// --- Resolve template configuration ---
const defaults = resolveConfigDefaults(imagePlan);
const useOldCover = imagePlan?.cover && (imagePlan.cover.type || imagePlan.cover.palette);
const useOldInfo = imagePlan?.infographic && (imagePlan.infographic.layout || imagePlan.infographic.style);
const useOldIllArray = Array.isArray(imagePlan?.illustrations) && imagePlan.illustrations.length > 0;

const raw = readRequired(draftPath);
const fm = parseFrontmatter(raw);
if (!fm) fail("frontmatter missing in draft.md");
const body = extractBody(raw);

const promptsDir = resolve(dir, "imgs/prompts");
const illustratorDir = skillDir("baoyu-article-illustrator");
const coverDir = skillDir("baoyu-cover-image");

const promptConstruction = readRequired(resolve(illustratorDir, "references/prompt-construction.md"));
const vectorStyle = readRequired(resolve(illustratorDir, "references/styles/vector-illustration.md"));
readRequired(resolve(coverDir, "references/workflow/prompt-template.md"));

const slots = [...body.matchAll(SLOT_EXTRACT_RE)].map((m) => {
  const parsed = resolveSlotImg(m[0]);
  return { ...parsed, index: m.index, raw: m[0] };
});
if (!slots.some((s) => s.slot === 0)) fail("SLOT_IMG_00 is required before generating prompts");

const labels = extractLabels(body, fm);

const coverSlug = safeDesc(fm.blogSlug ?? slug, "article");
const coverConfig = useOldCover ? imagePlan.cover : defaults.cover;
const coverType = coverConfig.type ?? "conceptual";
const coverPalette = coverConfig.palette ?? "cool";
const coverRendering = coverConfig.rendering ?? "flat-vector";
const coverText = coverConfig.text ?? "none";
const coverMood = coverConfig.mood ?? "bold";
const coverPrompt = `---
type: cover
palette: ${coverPalette}
rendering: ${coverRendering}
---

# Content Context
Article title: ${fm.title}
Content summary: ${fm.summary ?? ""}
Keywords: ${labels.replace(/^- /gm, "").split("\n").filter(Boolean).slice(0, 8).join(", ")}

# Visual Design
Cover theme: conceptual visual hammer
Type: ${coverType}
Palette: ${coverPalette}
Rendering: ${coverRendering}
Font: none
Text level: ${coverText}
Mood: ${coverMood}
Aspect ratio: 16:9
Language: Chinese

# Text Elements
No text elements. Do not render title, labels, captions, logos, watermarks, color names, or hex codes.

# Composition
Type composition: abstract shapes representing the article's central tension; information hierarchy, clean zones.
Visual composition: one strong symbolic metaphor derived from the article, centered with generous negative space.
Color constraint: Color values (#hex) and color names are rendering guidance only — do NOT display color names, hex codes, or palette labels as visible text in the image.
Rendering notes: ${coverRendering}, clean outlines, bold contrast, no photorealism.
`;

const infographicConfig = useOldInfo ? imagePlan.infographic : defaults.infographic;
const infoLayout = infographicConfig.layout ?? "bento-grid";
const infoStyle = infographicConfig.style ?? "craft-handmade";
const infoAspect = infographicConfig.aspect ?? "16:9";

const infographicPrompt = buildCompactInfographicPrompt({
  fm,
  body,
  labels: compactLabels(body, fm),
  layout: infoLayout,
  style: infoStyle,
  aspect: infoAspect,
});

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

  const planEntry = imagePlan?.illustrations?.find((e) => e.slot === slot.slot);
  const type = planEntry?.type ?? inferIllustrationType(context, slot.desc);
  const style = planEntry?.style ?? defaults.illustrationStyle;

  const nn = String(slot.slot).padStart(2, "0");
  const desc = safeDesc(planEntry?.description ?? slot.desc, "illustration");

  const styleContent = resolveTemplateFile("baoyu-article-illustrator", `references/styles/${style}.md`);

  const prompt = `---
illustration_id: ${nn}
type: ${type}
style: ${style}
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

## Style: ${style}

${(styleContent ?? vectorStyle).trim()}

## Final Rendering Instructions

Clean composition with generous white space. Text should be large, prominent, and readable. Color values (#hex) and color names are rendering guidance only — do NOT display color names, hex codes, or palette labels as visible text in the image. Aspect ratio: 16:9.
`;
  const name = `${nn}-${desc}.md`;
  if (writePrompt(resolve(promptsDir, name), prompt)) outputs.push(name);
}

process.stdout.write(JSON.stringify({ slug, prompts_dir: promptsDir, written: outputs }, null, 2) + "\n");

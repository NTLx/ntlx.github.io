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
const allowDefaultImagePlan = args.includes("--allow-default-image-plan");
const allowCompactFallback = args.includes("--allow-compact-fallback");
const slug = args.find((a) => !a.startsWith("--"));

if (!slug) {
  process.stderr.write("usage: generate-image-prompts.mjs <date-slug> [--overwrite] [--allow-default-image-plan] [--allow-compact-fallback]\n");
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

const IMAGE_TEMPLATE_MAP = JSON.parse(readRequired(resolve(repoRoot(), ".agents/skills/wechat-article-write/references/image-template-map.json")));
const GPT_IMAGE_2_INFOGRAPHIC_VARIANTS = IMAGE_TEMPLATE_MAP.gpt_image_2_templates;
const INFO_STYLE_TO_GPT_VARIANT = IMAGE_TEMPLATE_MAP.infographic_variant_by_style;
const INFO_LAYOUT_TO_GPT_VARIANT = IMAGE_TEMPLATE_MAP.infographic_variant_by_layout;
const STYLE_FAMILIES = IMAGE_TEMPLATE_MAP.style_families;
const ARTICLE_TYPE_DEFAULTS = IMAGE_TEMPLATE_MAP.article_type_defaults;

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
    const msg = `gpt-image-2 template not found: ${source}`;
    if (!allowCompactFallback) fail(`${msg}; pass --allow-compact-fallback only for legacy migration`);
    process.stderr.write(`generate-image-prompts: WARN - ${msg}; using compact fallback text\n`);
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

function resolveConfigDefaults(imagePlan) {
  const articleType = imagePlan?.article_type ?? "deep-analysis";
  const typeDefaults = ARTICLE_TYPE_DEFAULTS[articleType];

  if (!typeDefaults) {
    if (!allowDefaultImagePlan) fail(`unknown article_type "${articleType}" in image-plan.json`);
    process.stderr.write(`generate-image-prompts: WARN - unknown article_type "${articleType}", falling back to deep-analysis\n`);
  }
  const td = typeDefaults ?? ARTICLE_TYPE_DEFAULTS["deep-analysis"];

  const direction = imagePlan?.direction;
  if (direction && !STYLE_FAMILIES[direction] && !allowDefaultImagePlan) {
    fail(`unknown direction "${direction}" in image-plan.json`);
  }
  const familyId = (direction && STYLE_FAMILIES[direction]) ? direction : td.family;
  const family = STYLE_FAMILIES[familyId] ?? STYLE_FAMILIES.journal;

  return {
    cover: { ...td.cover },
    infographic: { layout: td.infoLayout, style: family.infoStyle, aspect: "16:9" },
    illustrationStyle: family.illStyle,
  };
}

function validateImagePlan(imagePlan) {
  if (!imagePlan) return;
  if (imagePlan.article_type && !ARTICLE_TYPE_DEFAULTS[imagePlan.article_type] && !allowDefaultImagePlan) {
    fail(`unknown article_type "${imagePlan.article_type}" in image-plan.json`);
  }
  if (imagePlan.direction && !STYLE_FAMILIES[imagePlan.direction] && !allowDefaultImagePlan) {
    fail(`unknown direction "${imagePlan.direction}" in image-plan.json`);
  }

  const info = imagePlan.infographic;
  if (info) {
    const explicit = info.gpt_variant ?? info.gptVariant;
    if (explicit && !GPT_IMAGE_2_INFOGRAPHIC_VARIANTS[explicit] && !allowDefaultImagePlan) {
      fail(`unknown infographic gpt_variant "${explicit}" in image-plan.json`);
    }
    if (info.style && !INFO_STYLE_TO_GPT_VARIANT[info.style] && !allowDefaultImagePlan) {
      fail(`unknown infographic style "${info.style}" in image-plan.json`);
    }
    if (info.layout && !INFO_LAYOUT_TO_GPT_VARIANT[info.layout] && !allowDefaultImagePlan) {
      fail(`unknown infographic layout "${info.layout}" in image-plan.json`);
    }
  }
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
    if (!allowDefaultImagePlan) fail(`invalid image-plan.json: ${e.message}`);
    process.stderr.write(`generate-image-prompts: WARN - invalid image-plan.json, falling back to defaults: ${e.message}\n`);
  }
}
validateImagePlan(imagePlan);

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

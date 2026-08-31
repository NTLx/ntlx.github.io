#!/usr/bin/env bun
/**
 * Step 4 helper: materialize deterministic image prompt files from draft.md and
 * an Agent-authored image-plan.json.
 *
 * Usage:
 *   bun run generate-image-prompts.mjs <date-slug> [--overwrite]
 *
 * The script creates:
 *   - imgs/prompts/00-cover-{blogSlug}.md
 *   - imgs/prompts/00-infographic-core-summary.md
 *   - imgs/prompts/{NN}-{desc}.md for SLOT_IMG_01+
 *
 * Boundary: this script does not discover, select, or call a visual Skill. It
 * materializes the repository SLOT/prompt protocol. `prompt_source=adapter`
 * uses the current compatibility templates; `prompt_source=external` preserves
 * a prompt already produced by an Agent or another visual capability. Raster
 * rendering happens later via the configured baoyu-image-gen backend.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { postDir, repoRoot } from "./path-resolver.mjs";
import { parseFrontmatter, extractBody } from "./frontmatter-lib.mjs";
import { normalizeSlotDesc } from "./validation-lib.mjs";
import {
  collectDraftSlots,
  normalizePromptSource,
  readImagePlan,
  validateVisualPlanTopology,
  visualPromptDescription,
} from "./visual-plan-lib.mjs";

const args = process.argv.slice(2);
const overwrite = args.includes("--overwrite");
const allowDefaultImagePlan = args.includes("--allow-default-image-plan");
const slug = args.find((a) => !a.startsWith("--"));

if (!slug) {
  process.stderr.write("usage: generate-image-prompts.mjs <date-slug> [--overwrite] [--allow-default-image-plan]\n");
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
    .replace(/^## 参考资料[\s\S]*$/m, " ")
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
    .filter((h) => h !== "参考资料");
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
  return normalizeSlotDesc(desc ?? fallback) || fallback;
}

function promptSource(node, label) {
  try {
    return normalizePromptSource(node?.prompt_source);
  } catch (error) {
    fail(`${label}.${error.message}`);
  }
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
// baoyu-infographic 的正交模型：21 layouts × 22 styles。
// SLOT 00 信息图 prompt 同时读取两个文件并组合，而不是单一 hybrid 模板。
const VALID_INFOGRAPHIC_LAYOUTS = new Set(IMAGE_TEMPLATE_MAP.infographic_layouts ?? []);
const VALID_INFOGRAPHIC_STYLES = new Set(IMAGE_TEMPLATE_MAP.infographic_styles ?? []);
const LEGACY_DEFAULTS = IMAGE_TEMPLATE_MAP.legacy_defaults ?? {
  style_families: IMAGE_TEMPLATE_MAP.style_families ?? {},
  article_type_defaults: IMAGE_TEMPLATE_MAP.article_type_defaults ?? {},
};
const LEGACY_STYLE_FAMILIES = LEGACY_DEFAULTS.style_families ?? {};
const LEGACY_ARTICLE_TYPE_DEFAULTS = LEGACY_DEFAULTS.article_type_defaults ?? {};
const VALID_ARTICLE_TYPES = new Set(Object.keys(LEGACY_ARTICLE_TYPE_DEFAULTS));
const VALID_ILLUSTRATION_TYPES = new Set(["comparison", "flowchart", "framework"]);

// Optional adapter template sources are resolved only when at least one asset
// actually uses the adapter. External producers must not depend on them.
let infographicTemplateDirs = null;
let illustratorResources = null;
let illustratorStyleNames = null;

function getInfographicTemplateDirs() {
  if (!infographicTemplateDirs) {
    const dir = skillDir("baoyu-infographic");
    infographicTemplateDirs = {
      layouts: resolve(dir, "references/layouts"),
      styles: resolve(dir, "references/styles"),
    };
  }
  return infographicTemplateDirs;
}

function getIllustratorResources() {
  if (!illustratorResources) {
    const dir = skillDir("baoyu-article-illustrator");
    illustratorResources = {
      promptConstruction: readRequired(resolve(dir, "references/prompt-construction.md")),
      vectorStyle: readRequired(resolve(dir, "references/styles/vector-illustration.md")),
      stylesDir: resolve(dir, "references/styles"),
    };
  }
  return illustratorResources;
}

function templateNames(dir) {
  if (!existsSync(dir)) return new Set();
  return new Set(
    readdirSync(dir)
      .filter((name) => name.endsWith(".md"))
      .map((name) => name.slice(0, -3)),
  );
}

function validIllustrationStyles() {
  if (!illustratorStyleNames) illustratorStyleNames = templateNames(getIllustratorResources().stylesDir);
  return illustratorStyleNames;
}

function readBaoyuInfographicLayout(layoutName) {
  const path = resolve(getInfographicTemplateDirs().layouts, `${layoutName}.md`);
  if (!existsSync(path)) fail(`baoyu-infographic layout not found: ${layoutName}.md`);
  return readFileSync(path, "utf8");
}

function readBaoyuInfographicStyle(styleName) {
  const path = resolve(getInfographicTemplateDirs().styles, `${styleName}.md`);
  if (!existsSync(path)) fail(`baoyu-infographic style not found: ${styleName}.md`);
  return readFileSync(path, "utf8");
}

function buildCompactInfographicPrompt({ fm, body, labels, intent, layout, style, aspect }) {
  const labelText = labels.map((label) => `"${label}"`).join(", ");
  const layoutDoc = readBaoyuInfographicLayout(layout);
  const styleDoc = readBaoyuInfographicStyle(style);
  const subject = compactText(body, 1200).replace(/\n+/g, " / ");

  return [
    `Template source: baoyu-infographic (layout=${layout}, style=${style})`,
    "Use case: infographic-diagram",
    `Primary request: Create an article-opening infographic that compresses the full article "${fm.title}" into one self-contained visual summary for a WeChat/blog reader.`,
    "Whole-article compression contract: this is not a local body illustration. A time-poor reader who only sees this image should understand the article's core message, reasoning structure, and conclusion.",
    "Required information architecture: central thesis; argument path with 3-5 major supporting points; key contrast, cause-effect link, or decision fork; final takeaway or action cue.",
    "Do not merely visualize one nearby section. Synthesize the full article into a readable map of the author's reasoning.",
    `Agent visual intent: ${intent}`,
    "Scene/background: bright, sunny, clean neutral editorial canvas with high-contrast background",
    "Color/Atmosphere: sunny, bright, vibrant, high saturation, clear distinction between background and content for maximum readability and legibility",
    `Subject: ${subject}`,
    `Composition/framing: ${aspect} landscape header; 4-6 clearly separated information zones; strong hierarchy; generous whitespace; arrows or callouts only where they explain relationships`,
    `Text (verbatim): ${labelText}`,
    "Constraints: Chinese labels must be readable and rendered exactly; use short labels only; high contrast between clean bright background and vivid high-saturation content elements; no tiny text; no logos, trademarks, watermark, QR code, color names, hex codes, or decorative filler",
    "Avoid: photorealism, dense small print, cluttered dashboards, dark dingy tones, low contrast, muted muddy colors, stock icons, extra slogans, invented data",
    "",
    "## Layout specification (from baoyu-infographic/references/layouts/)",
    layoutDoc.trim(),
    "",
    "## Style specification (from baoyu-infographic/references/styles/)",
    styleDoc.trim(),
  ].join("\n");
}

function resolveLegacyDefaults(imagePlan) {
  const articleType = imagePlan?.article_type ?? "deep-analysis";
  const typeDefaults = LEGACY_ARTICLE_TYPE_DEFAULTS[articleType];

  if (!typeDefaults) {
    if (!allowDefaultImagePlan) fail(`unknown article_type "${articleType}" in image-plan.json`);
    process.stderr.write(`generate-image-prompts: WARN - unknown article_type "${articleType}", falling back to deep-analysis\n`);
  }
  const td = typeDefaults ?? LEGACY_ARTICLE_TYPE_DEFAULTS["deep-analysis"];

  const direction = imagePlan?.direction;
  if (direction && !LEGACY_STYLE_FAMILIES[direction] && !allowDefaultImagePlan) {
    fail(`unknown direction "${direction}" in image-plan.json`);
  }
  const familyId = (direction && LEGACY_STYLE_FAMILIES[direction]) ? direction : td.family;
  const family = LEGACY_STYLE_FAMILIES[familyId] ?? LEGACY_STYLE_FAMILIES.journal;

  return {
    cover: { ...td.cover },
    infographic: { layout: td.infoLayout, style: "claymation", aspect: "16:9" },
    illustrationStyle: family.illStyle,
  };
}

function validateImagePlan(imagePlan) {
  if (!imagePlan) return;
  if (typeof imagePlan !== "object" || Array.isArray(imagePlan)) {
    fail("image-plan.json must contain a JSON object");
  }
  if (imagePlan.article_type && !VALID_ARTICLE_TYPES.has(imagePlan.article_type) && !allowDefaultImagePlan) {
    fail(`unknown article_type "${imagePlan.article_type}" in image-plan.json`);
  }
  if (imagePlan.direction && !LEGACY_STYLE_FAMILIES[imagePlan.direction] && !allowDefaultImagePlan) {
    fail(`unknown direction "${imagePlan.direction}" in image-plan.json`);
  }

  const info = imagePlan.infographic;
  if (info) {
    const source = promptSource(info, "image-plan.infographic");
    if (source === "adapter" && info.style && !VALID_INFOGRAPHIC_STYLES.has(info.style)) {
      fail(`unknown infographic style "${info.style}" in image-plan.json (must be one of baoyu-infographic styles)`);
    }
    if (source === "adapter" && info.layout && !VALID_INFOGRAPHIC_LAYOUTS.has(info.layout)) {
      fail(`unknown infographic layout "${info.layout}" in image-plan.json (must be one of baoyu-infographic layouts)`);
    }
  }

  if (imagePlan.illustrations !== undefined && !Array.isArray(imagePlan.illustrations)) {
    fail("image-plan.illustrations must be an array");
  }
  for (const entry of imagePlan.illustrations ?? []) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      fail("image-plan.illustrations entries must be objects");
    }
    const source = promptSource(entry, "image-plan.illustrations entry");
    if (source === "adapter" && entry.type && !VALID_ILLUSTRATION_TYPES.has(entry.type)) {
      fail(`unknown illustration type "${entry.type}" in image-plan.json`);
    }
    if (source === "adapter" && entry.style && !validIllustrationStyles().has(entry.style)) {
      fail(`unknown illustration style "${entry.style}" in image-plan.json (must match baoyu-article-illustrator styles)`);
    }
  }
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function requireText(value, path) {
  if (!hasText(value)) fail(`${path} is required in image-plan.json`);
}

function validateVisualPlan(imagePlan, body) {
  if (allowDefaultImagePlan) return;
  if (!imagePlan) {
    fail("image-plan.json is required; use --allow-default-image-plan only for legacy defaults");
  }

  const topology = validateVisualPlanTopology(imagePlan, body);
  if (!topology.ok) fail(topology.errors.join("; "));

  const cover = imagePlan.cover;
  const coverSource = promptSource(cover, "image-plan.cover");
  requireText(cover.intent, "image-plan.cover.intent");
  if (coverSource === "adapter") {
    requireText(cover.type, "image-plan.cover.type");
    if (!hasText(cover.style) && !(hasText(cover.palette) && hasText(cover.rendering))) {
      fail("image-plan.cover.style or both image-plan.cover.palette and image-plan.cover.rendering are required");
    }
  }

  const infographic = imagePlan.infographic;
  const infographicSource = promptSource(infographic, "image-plan.infographic");
  requireText(infographic.intent, "image-plan.infographic.intent");
  if (infographicSource === "adapter") {
    requireText(infographic.layout, "image-plan.infographic.layout");
    requireText(infographic.style, "image-plan.infographic.style");
  }

  for (const slot of topology.bodySlots) {
    const entry = topology.entriesBySlot.get(slot.slot);
    requireText(entry.intent, `image-plan.illustrations[slot=${slot.slot}].intent`);
    if (promptSource(entry, `image-plan.illustrations[slot=${slot.slot}]`) === "adapter") {
      requireText(entry.type, `image-plan.illustrations[slot=${slot.slot}].type`);
      requireText(entry.style, `image-plan.illustrations[slot=${slot.slot}].style`);
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
try {
  imagePlan = readImagePlan(imagePlanPath);
} catch (e) {
  if (!allowDefaultImagePlan) fail(e.message);
  process.stderr.write(`generate-image-prompts: WARN - invalid image-plan.json, falling back to defaults: ${e.message}\n`);
}
validateImagePlan(imagePlan);

const raw = readRequired(draftPath);
const fm = parseFrontmatter(raw);
if (!fm) fail("frontmatter missing in draft.md");
const body = extractBody(raw);

const promptsDir = resolve(dir, "imgs/prompts");
const slots = collectDraftSlots(body);
if (!slots.some((s) => s.slot === 0)) fail("SLOT_IMG_00 is required before generating prompts");

validateVisualPlan(imagePlan, body);

// Legacy article-type/direction defaults are available only when the caller
// explicitly opts into compatibility mode.  The normal path consumes the
// Agent-authored visual decisions above without consulting a router.
const defaults = allowDefaultImagePlan ? resolveLegacyDefaults(imagePlan) : null;

const labels = extractLabels(body, fm);

function checkExternalPrompt(path, label, node) {
  if (promptSource(node, label) !== "external") return;
  if (!existsSync(path)) {
    fail(`external visual prompt missing for ${label}
producer=${node.producer}
expected: ${path}
Run/delegate the selected producer first, save its final rendering prompt to the expected path, then rerun generate-image-prompts.mjs.`);
  }
  if (readFileSync(path, "utf8").trim().length === 0) {
    fail(`external visual prompt is empty for ${label}
producer=${node.producer}
expected: ${path}
Replace it with the selected producer's final rendering prompt, then rerun generate-image-prompts.mjs.`);
  }
  process.stderr.write(`generate-image-prompts: preserve external prompt ${path} (producer=${node.producer})\n`);
}

const coverSlug = safeDesc(fm.blogSlug ?? slug, "article");
const coverConfig = allowDefaultImagePlan
  ? { ...defaults.cover, ...(imagePlan?.cover ?? {}) }
  : imagePlan.cover;

const infographicConfig = allowDefaultImagePlan
  ? { ...defaults.infographic, ...(imagePlan?.infographic ?? {}) }
  : imagePlan.infographic;
const coverSource = promptSource(coverConfig, "image-plan.cover");
const infographicSource = promptSource(infographicConfig, "image-plan.infographic");

const bodySpecs = slots
  .filter((slot) => slot.slot > 0)
  .map((slot) => {
    const entry = imagePlan?.illustrations?.find((candidate) => candidate.slot === slot.slot) ?? {};
    return {
      slot,
      entry,
      source: promptSource(entry, `image-plan.illustrations[slot=${slot.slot}]`),
      desc: visualPromptDescription(entry, slot),
    };
  });

const coverPromptPath = resolve(promptsDir, `00-cover-${coverSlug}.md`);
const infographicPromptPath = resolve(promptsDir, "00-infographic-core-summary.md");
checkExternalPrompt(coverPromptPath, "cover", coverConfig);
checkExternalPrompt(infographicPromptPath, "SLOT_IMG_00", infographicConfig);
for (const spec of bodySpecs) {
  checkExternalPrompt(resolve(promptsDir, `${String(spec.slot.slot).padStart(2, "0")}-${spec.desc}.md`), `SLOT_IMG_${String(spec.slot.slot).padStart(2, "0")}`, spec.entry);
}

let coverPrompt = null;
if (coverSource === "adapter") {
  // This compatibility adapter is loaded only when the cover actually uses it.
  readRequired(resolve(skillDir("baoyu-cover-image"), "references/workflow/prompt-template.md"));
  const coverIntent = coverConfig.intent ?? "用一个清晰隐喻表达文章中心张力（legacy fallback）";
  const coverType = coverConfig.type ?? "conceptual";
  const coverPalette = coverConfig.palette;
  const coverRendering = coverConfig.rendering;
  const coverStyle = coverConfig.style;
  const coverText = coverConfig.text ?? "none";
  const coverMood = coverConfig.mood ?? "bold";
  const coverHeader = [
    "---",
    "type: cover",
    coverPalette ? `palette: ${coverPalette}` : null,
    coverRendering ? `rendering: ${coverRendering}` : null,
    "---",
  ].filter(Boolean).join("\n");
  const coverVisualDesign = [
    `Visual intent: ${coverIntent}`,
    `Type: ${coverType}`,
    coverStyle ? `Style: ${coverStyle}` : null,
    coverPalette ? `Palette: ${coverPalette}` : null,
    coverRendering ? `Rendering: ${coverRendering}` : null,
    "Font: none",
    `Text level: ${coverText}`,
    `Mood: ${coverMood}`,
    "Aspect ratio: 16:9",
    "Language: Chinese",
  ].filter(Boolean).join("\n");
  coverPrompt = `${coverHeader}

# Content Context
Article title: ${fm.title}
Content summary: ${fm.summary ?? ""}
Keywords: ${labels.replace(/^- /gm, "").split("\n").filter(Boolean).slice(0, 8).join(", ")}

# Visual Design
Cover theme: conceptual visual hammer
${coverVisualDesign}

# Text Elements
No text elements. Do not render title, labels, captions, logos, watermarks, color names, or hex codes.

# Composition
Type composition: abstract shapes representing the article's central tension; information hierarchy, clean zones.
Visual composition: one strong symbolic metaphor derived from the article, centered with generous negative space.
Color constraint: Color values (#hex) and color names are rendering guidance only — do NOT display color names, hex codes, or palette labels as visible text in the image.
${coverRendering ? `Rendering notes: ${coverRendering}, clean outlines, bold contrast, no photorealism.` : "Rendering notes: clean outlines, bold contrast, no photorealism."}
`;
}

let infographicPrompt = null;
if (infographicSource === "adapter") {
  const infographicIntent = infographicConfig.intent ?? "压缩全文中心判断、论证路径和结论（legacy fallback）";
  const infoLayout = infographicConfig.layout ?? "bento-grid";
  const infoStyle = infographicConfig.style ?? "claymation";
  const infoAspect = infographicConfig.aspect ?? "16:9";
  infographicPrompt = buildCompactInfographicPrompt({
    fm,
    body,
    labels: compactLabels(body, fm),
    intent: infographicIntent,
    layout: infoLayout,
    style: infoStyle,
    aspect: infoAspect,
  });
}

const commonChineseRule = `## Chinese Text Rule

Visible text should use Chinese labels and Chinese short phrases by default. Keep model names, product names, API/code identifiers, English abbreviations, and quoted source terminology in the original language only when translation would be inaccurate. Do not use English merely for visual style.`;

const articleIllustrationGuardrails = `## Article Illustration Guardrails

This image is an article illustration, not a CAD sheet, not a blueprint title page, and not an engineering drawing board.

- Do NOT render any date, version number, revision number, figure number, title block, or metadata box
- Do NOT render rulers, dimension lines, coordinate ticks, crop marks, corner targets, or engineering border frames
- Do NOT invent fake labels that look like document control fields
- Use publication infographic language by default, even for technical topics
- Keep only the labels needed to explain the article's nearby argument
`;

const outputs = [];
if (coverPrompt !== null && writePrompt(coverPromptPath, coverPrompt)) outputs.push(`00-cover-${coverSlug}.md`);
if (infographicPrompt !== null && writePrompt(infographicPromptPath, infographicPrompt)) outputs.push("00-infographic-core-summary.md");

for (const spec of bodySpecs) {
  if (spec.source === "external") continue;

  const { slot, entry: planEntry, desc } = spec;
  const context = sectionContext(body, slot.index);

  const type = planEntry?.type ?? (allowDefaultImagePlan ? inferIllustrationType(context, slot.desc) : null);
  const style = planEntry?.style ?? (allowDefaultImagePlan ? defaults.illustrationStyle : null);
  const intent = planEntry?.intent ?? (allowDefaultImagePlan ? "解释正文附近的关键论证节点" : null);
  if (!type || !style || !intent) {
    fail(`visual plan is incomplete for SLOT_IMG_${String(slot.slot).padStart(2, "0")}`);
  }

  const nn = String(slot.slot).padStart(2, "0");

  const styleContent = resolveTemplateFile("baoyu-article-illustrator", `references/styles/${style}.md`);
  const { promptConstruction, vectorStyle } = getIllustratorResources();
  const defaultComposition = extractSection(promptConstruction, "Default Composition Requirements");
  const textRequirements = extractSection(promptConstruction, "Text in Illustrations");
  const colorRules = extractSection(promptConstruction, "Color Specification Rules");

  const prompt = `---
illustration_id: ${nn}
type: ${type}
style: ${style}
---

# Article Illustration Prompt

Article title: ${fm.title}
Slot: SLOT_IMG_${nn}${slot.desc ? `_${slot.desc}` : ""}
Purpose: ${intent}
Visual intent: ${intent}

${typeTemplate(type)}

## Source Context

${context}

${defaultComposition}

${textRequirements}

${commonChineseRule}

${articleIllustrationGuardrails}

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

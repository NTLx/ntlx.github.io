import { existsSync, readdirSync, realpathSync, copyFileSync, readFileSync } from "node:fs";
import { resolve, relative, basename } from "node:path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import sharp from "sharp";
import { extractBody, parseFrontmatter } from "./frontmatter-lib.mjs";
import { NON_SUBSTANTIVE_HEADINGS } from "./markdown-structure-lib.mjs";
import { imageMime, usableImageFile } from "./image-asset-lib.mjs";
import { PROJECT_ROOT, repoRoot } from "./path-resolver.mjs";

const parser = unified().use(remarkParse).use(remarkFrontmatter).use(remarkGfm);
const raster = /\.(?:png|jpe?g|webp|gif)$/iu;
const lead = /^imgs\/00-infographic-core-summary\.(?:png|jpe?g|webp|gif)$/iu;

export function collectVisualImages(markdown) {
  const images = [];
  function visit(node) {
    if (node.type === "imageReference") throw new Error("Use inline Markdown images in visual-draft.md");
    if (node.type === "image") images.push({ src: node.url, alt: node.alt, title: node.title, index: node.position.start.offset, end: node.position.end.offset });
    for (const child of node.children ?? []) visit(child);
  }
  visit(parser.parse(markdown));
  return images;
}

// Compare parsed content, keeping literal code, URLs, quotations and frontmatter.
// Only image nodes and their now-empty paragraphs may disappear.
function textualTree(markdown) {
  function clean(node) {
    if (node.type === "image") return null;
    const result = {};
    for (const [key, value] of Object.entries(node)) {
      if (key === "position") continue;
      if (key !== "children") { result[key] = value; continue; }
      result.children = value.map(clean).filter(Boolean);
      const merged = [];
      for (const child of result.children) {
        if (child.type === "text" && merged.at(-1)?.type === "text") merged.at(-1).value += child.value;
        else merged.push(child);
      }
      result.children = merged;
    }
    if (node.type === "paragraph" && result.children.length === 0) return null;
    return result;
  }
  return JSON.stringify(clean(parser.parse(markdown)));
}

export function assertTextOnlyDraft(draft) {
  function visit(node) {
    if (node.type === "image" || node.type === "imageReference") throw new Error("draft.md must contain no Markdown images; integrate source figures and generated images in Step 4");
    for (const child of node.children ?? []) visit(child);
  }
  visit(parser.parse(draft));
}

export function assertVisualTextParity(draft, visual) {
  assertTextOnlyDraft(draft);
  if (textualTree(draft) !== textualTree(visual)) throw new Error("visual-draft.md changes frozen article text, headings, URLs, code or frontmatter; restore from draft.md and insert images only");
}

function substantiveSections(body) {
  const headings = parser.parse(body).children.filter(node => node.type === "heading" && node.depth === 2);
  const headingText = node => node.value ?? (node.children ?? []).map(headingText).join("");
  const substantive = headings.filter(node => !NON_SUBSTANTIVE_HEADINGS.has(headingText(node).trim()));
  return substantive;
}

/** Explicit initialization; resumes never overwrite an existing visual draft. */
export function initializeVisualDraft(base) {
  const target = resolve(base, "visual-draft.md");
  const source = resolve(base, "draft.md");
  assertTextOnlyDraft(readFileSync(source, "utf8"));
  if (existsSync(target)) return readFileSync(target).equals(readFileSync(source)) ? "ALREADY_INITIALIZED" : "RESUME_EXISTING";
  copyFileSync(source, target);
  return "INITIALIZED";
}

export async function assertUsableRaster(path) {
  if (!usableImageFile(path) || !imageMime(path)) throw new Error(`not a usable raster or unknown MIME: ${path}`);
  try {
    await sharp(path, { failOn: "warning" }).raw().toBuffer();
  } catch {
    throw new Error(`not a usable raster (decode failed): ${path}`);
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function illustratorDensityBounds(density, sectionCount) {
  const root = process.env.PIPELINE_REPO_ROOT ? repoRoot() : PROJECT_ROOT;
  const skillPath = resolve(root, ".agents/skills/baoyu-article-illustrator/SKILL.md");
  const workflowPath = resolve(root, ".agents/skills/baoyu-article-illustrator/references/workflow.md");
  if (!existsSync(skillPath)) throw new Error("baoyu-article-illustrator/SKILL.md missing; cannot verify Specialist contract");
  const skill = readFileSync(skillPath, "utf8");
  const densityLine = skill.split(/\r?\n/u).find(line => line.includes("**Q2: Density**"));
  if (!densityLine || !densityLine.includes(density)) {
    throw new Error(`illustrator outline density '${density}' is not declared by current baoyu-article-illustrator/SKILL.md`);
  }
  const escaped = escapeRegExp(density);
  const range = densityLine.match(new RegExp(`${escaped}\\s*\\((\\d+)\\s*[-–]\\s*(\\d+)\\)`, "iu"));
  if (range) return { min: Number(range[1]), max: Number(range[2]) };
  const openEnded = densityLine.match(new RegExp(`${escaped}\\s*\\((\\d+)\\+\\)`, "iu"));
  if (openEnded) return { min: Number(openEnded[1]), max: Number.POSITIVE_INFINITY };
  if (density === "per-section") {
    if (!existsSync(workflowPath)) throw new Error("baoyu-article-illustrator workflow.md missing; cannot verify per-section density");
    const workflow = readFileSync(workflowPath, "utf8");
    if (!/per-section\s*-\s*At least 1 per section\/chapter/iu.test(workflow)) {
      throw new Error("current baoyu-article-illustrator workflow no longer defines per-section density as at least one visual per section/chapter");
    }
    return { min: Math.max(1, sectionCount), max: Number.POSITIVE_INFINITY };
  }
  throw new Error(`cannot derive density bounds for '${density}' from current baoyu-article-illustrator contract`);
}

/** Verify that Step 4 contains the native baoyu-article-illustrator planning artifact, not a Main-authored substitute. */
export function validateIllustratorCompletion(visual, base) {
  const body = extractBody(visual);
  const bodyImages = collectVisualImages(body).filter(image => !lead.test(image.src));
  const outlinePath = resolve(base, "imgs/outline.md");
  if (!existsSync(outlinePath)) throw new Error("imgs/outline.md missing; complete the native baoyu-article-illustrator workflow before Step 4 Gate");
  const outline = readFileSync(outlinePath, "utf8");
  const fm = parseFrontmatter(outline);
  if (!fm) throw new Error("imgs/outline.md missing required baoyu-article-illustrator frontmatter");
  for (const key of ["type", "density", "style", "palette", "image_count"]) {
    if (fm[key] === undefined || String(fm[key]).trim() === "") throw new Error(`imgs/outline.md missing required frontmatter field: ${key}`);
  }
  const imageCount = Number(fm.image_count);
  if (!Number.isInteger(imageCount) || imageCount < 0) throw new Error("imgs/outline.md image_count must be a non-negative integer");

  const illustrationEntries = [...outline.matchAll(/^##\s+Illustration\s+\d+\s*$/gmu)];
  const filenames = [...outline.matchAll(/^\*\*Filename\*\*:\s*`?([^`\r\n]+)`?\s*$/gmu)]
    .map(match => basename(match[1].trim()));
  if (illustrationEntries.length !== imageCount) {
    throw new Error(`imgs/outline.md must use the native '## Illustration N' entries: image_count=${imageCount}, entries=${illustrationEntries.length}`);
  }
  if (filenames.length !== imageCount) {
    throw new Error(`imgs/outline.md must contain one **Filename** per native illustration entry: image_count=${imageCount}, filenames=${filenames.length}`);
  }
  const actual = bodyImages.map(image => basename(image.src));
  if (JSON.stringify(filenames) !== JSON.stringify(actual)) {
    throw new Error(`illustrator outline/body image mismatch: outline=${filenames.join(", ") || "(none)"}; visual-draft=${actual.join(", ") || "(none)"}`);
  }

  const sectionCount = substantiveSections(body).length;
  const bounds = illustratorDensityBounds(String(fm.density).trim(), sectionCount);
  if (imageCount < bounds.min || imageCount > bounds.max) {
    const upper = Number.isFinite(bounds.max) ? bounds.max : "∞";
    throw new Error(`illustrator density '${fm.density}' requires ${bounds.min}..${upper} body visuals under the current Specialist contract; found ${imageCount}`);
  }
  return { outline: "imgs/outline.md", density: String(fm.density).trim(), image_count: imageCount };
}

export async function validateVisualDraft(draft, visual, base) {
  assertVisualTextParity(draft, visual);
  const body = extractBody(visual);
  const images = collectVisualImages(body);
  const headers = images.filter(image => lead.test(image.src));
  if (headers.length !== 1) throw new Error("requires exactly one header infographic at imgs/00-infographic-core-summary.*");
  if (images[0] !== headers[0]) throw new Error("header infographic must be the first body visual");
  const sections = substantiveSections(body);
  if (sections[0] && headers[0].index >= sections[0].position.start.offset) throw new Error("header infographic must be before the first substantive H2");
  const imgsDir = resolve(base, "imgs");
  if (!existsSync(imgsDir)) throw new Error("imgs/ directory missing");
  if (relative(realpathSync(base), realpathSync(imgsDir)) !== "imgs") throw new Error("imgs/ directory escapes post directory");
  for (const image of images) {
    // Final rasters belong at the top level; auxiliary/candidate subdirectories are private.
    if (!/^imgs\/[^/\\]+$/u.test(image.src) || !raster.test(image.src)) throw new Error(`image path must remain inside imgs/ top level: ${image.src}`);
    const path = resolve(base, image.src);
    if (!existsSync(path)) throw new Error(`missing local image: ${image.src}`);
    if (relative(realpathSync(imgsDir), realpathSync(path)) !== basename(path)) throw new Error(`image path escapes imgs/: ${image.src}`);
    await assertUsableRaster(path);
  }
  const mapped = new Set(images.map(image => basename(image.src)));
  const stale = readdirSync(imgsDir).filter(name => raster.test(name) && !mapped.has(name));
  if (stale.length) throw new Error(`unreferenced final rasters in imgs/: ${stale.join(", ")}; move candidates to a private subdirectory`);
  return images;
}

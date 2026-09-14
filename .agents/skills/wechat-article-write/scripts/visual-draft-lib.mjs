import { existsSync, readdirSync, realpathSync, copyFileSync, readFileSync } from "node:fs";
import { resolve, relative, basename } from "node:path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import sharp from "sharp";
import { extractBody } from "./frontmatter-lib.mjs";
import { NON_SUBSTANTIVE_HEADINGS } from "./markdown-structure-lib.mjs";
import { imageMime, usableImageFile } from "./image-asset-lib.mjs";

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

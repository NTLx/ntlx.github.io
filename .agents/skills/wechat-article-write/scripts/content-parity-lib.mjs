import { extractBody } from "./frontmatter-lib.mjs";
import { collectMarkdownImages, collectSubstantiveSections, normalizeSourceImageKey } from "./visual-plan-lib.mjs";

const IMAGE_RENDERED_FENCES = new Set(["mermaid", "plantuml"]);

function normalizeText(value) {
  return String(value ?? "")
    .replace(/<!--[^]*?-->/gu, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/gu, "")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gu, "$1 $2")
    .replace(/<[^>]+>/gu, "")
    .replace(/[\*_~`]/gu, "")
    .replace(/\\(?=\s|$)/gu, "")
    .replace(/\s+/gu, " ")
    .trim();
}

export function normalizeVisibleText(value) {
  return normalizeText(value).replace(/\s+/gu, "");
}

/** Clause boundaries used for section-window coverage; commas are too fine-grained. */
const FRAGMENT_SPLIT_RE = /[。！？；：!?;:]/u;
const MIN_FRAGMENT_LENGTH = 4;

/**
 * Split a normalized block into clause fragments. gzh-design may hoist one clause
 * out of a paragraph into a callout card, so the HTML track can hold a block's
 * content in several non-adjacent pieces within the same section.
 */
export function splitBlockFragments(block) {
  const text = String(block ?? "");
  const parts = text
    .split(FRAGMENT_SPLIT_RE)
    .map((part) => part.trim())
    .filter((part) => part.length >= MIN_FRAGMENT_LENGTH);
  if (parts.length > 0) return parts;
  return text ? [text] : [];
}

/**
 * Extract paragraphs, list items and code lines together with the substantive
 * section each belongs to. Section indices follow collectSubstantiveSections,
 * so 0 is the lead area before the first substantive H2.
 */
export function extractSubstantiveMarkdownBlockEntries(markdown) {
  const body = extractBody(markdown);
  const sections = collectSubstantiveSections(body);
  const sectionIndexAt = (offset) => sections.filter((section) => section.start <= offset).length;
  const entries = [];
  let paragraph = [];
  let paragraphStart = 0;
  let fence = null;
  let offset = 0;
  const flush = () => {
    const text = normalizeVisibleText(paragraph.join("\n"));
    if (text) entries.push({ text, section_index: sectionIndexAt(paragraphStart) });
    paragraph = [];
  };
  for (const rawLine of body.match(/[^\r\n]*(?:\r?\n|$)/gu) ?? []) {
    const lineStart = offset;
    offset += rawLine.length;
    const current = rawLine.replace(/\r?\n$/u, "");
    const fenceMatch = /^\s*```(.*)$/u.exec(current);
    if (fenceMatch) {
      flush();
      if (fence) {
        fence = null;
      } else {
        const lang = fenceMatch[1].trim().toLowerCase();
        // Mermaid/PlantUML are rendered to images downstream, so their fence body
        // legitimately has no text counterpart in the HTML track.
        fence = { protect: !IMAGE_RENDERED_FENCES.has(lang) };
      }
      continue;
    }
    if (fence) {
      if (!fence.protect) continue;
      // Code lines keep their literal characters: only whitespace is folded, so
      // `Array<int>` is not mistaken for an HTML tag the way prose normalization
      // would strip it.
      const code = current.replace(/\s+/gu, "");
      if (code) entries.push({ text: code, section_index: sectionIndexAt(lineStart) });
      continue;
    }
    const line = current.trim();
    if (!line) { flush(); continue; }
    if (/^#{1,6}\s+/u.test(line)) { flush(); continue; }
    if (/^[-*+]\s+/u.test(line) || /^\d+[.)]\s+/u.test(line)) {
      flush();
      const item = normalizeVisibleText(line.replace(/^(?:[-*+]\s+|\d+[.)]\s+)/u, ""));
      if (item) entries.push({ text: item, section_index: sectionIndexAt(lineStart) });
      continue;
    }
    if (paragraph.length === 0) paragraphStart = lineStart;
    paragraph.push(line);
  }
  flush();
  return entries;
}

/** Extract paragraphs and list items; headings and image-only blocks are not text protection targets. */
export function extractSubstantiveMarkdownBlocks(markdown) {
  return extractSubstantiveMarkdownBlockEntries(markdown).map((entry) => entry.text);
}

// wechat-link-normalizer rewrites `[label](url)` as inline `label（链接：url）`;
// older artifacts also split it into two adjacent visible lines (label, then URL).
// Both forms must canonicalize to the blog track's `label url`, otherwise any
// article carrying an external link mismatches at block 1.
// Markdown↔Markdown parity only: the Markdown→HTML gate compares source against
// HTML rendered from that same source, so both sides already carry the wrapper.
function canonicalizeSubstantiveBlocks(markdown) {
  const blocks = [];
  for (const raw of extractSubstantiveMarkdownBlocks(markdown)) {
    const block = raw.replace(/（链接：([^）]*)）/gu, "$1");
    if (/^https?:\/\//iu.test(block) && blocks.length > 0) {
      blocks[blocks.length - 1] += block;
    } else {
      blocks.push(block);
    }
  }
  return blocks;
}

function mapEntries(imageMap) {
  const raw = imageMap?.files ?? imageMap ?? {};
  return Object.entries(raw).filter(([, value]) => typeof value === "string");
}

function canonicalImageName(src, imageMap) {
  const exact = mapEntries(imageMap).find(([, value]) => value === src);
  return normalizeSourceImageKey(exact?.[0] ?? src);
}

function imageTopology(markdown, imageMap) {
  const body = extractBody(markdown);
  const sections = collectSubstantiveSections(body);
  const sectionIndexAt = (position) => sections.filter((section) => section.start <= position).length;
  return collectMarkdownImages(body).map((image) => ({
    basename: canonicalImageName(image.src, imageMap),
    section_index: sectionIndexAt(image.index),
  }));
}

/** Compare blog Markdown and WeChat source without comparing CDN/local URL spelling. */
export function validateMarkdownParity(articleMarkdown, wechatSourceMarkdown, imageMap = {}) {
  const errors = [];
  const articleBody = extractBody(articleMarkdown);
  const sourceBody = extractBody(wechatSourceMarkdown);
  const articleSections = collectSubstantiveSections(articleBody).map((section) => section.heading);
  const sourceSections = collectSubstantiveSections(sourceBody).map((section) => section.heading);
  if (JSON.stringify(articleSections) !== JSON.stringify(sourceSections)) {
    errors.push(`substantive H2 sequence mismatch: article=${articleSections.join(" → ")}, source=${sourceSections.join(" → ")}`);
  }

  const articleImages = imageTopology(articleMarkdown, imageMap);
  const sourceImages = imageTopology(wechatSourceMarkdown, imageMap);
  if (articleImages.length !== sourceImages.length) errors.push(`body image count mismatch: article=${articleImages.length}, source=${sourceImages.length}`);
  for (let index = 0; index < Math.max(articleImages.length, sourceImages.length); index += 1) {
    const left = articleImages[index];
    const right = sourceImages[index];
    if (!left || !right || left.basename !== right.basename) {
      errors.push(`body image sequence mismatch at position ${index + 1}: article=${left?.basename ?? "(missing)"}, source=${right?.basename ?? "(missing)"}`);
      break;
    }
    if (left.section_index !== right.section_index) errors.push(`body image ${left.basename} section mismatch at position ${index + 1}: article=${left.section_index}, source=${right.section_index}`);
  }

  const articleBlocks = canonicalizeSubstantiveBlocks(articleMarkdown);
  const sourceBlocks = canonicalizeSubstantiveBlocks(wechatSourceMarkdown);
  if (JSON.stringify(articleBlocks) !== JSON.stringify(sourceBlocks)) {
    const max = Math.max(articleBlocks.length, sourceBlocks.length);
    let mismatch = 0;
    while (mismatch < max && articleBlocks[mismatch] === sourceBlocks[mismatch]) mismatch += 1;
    errors.push(`substantive block mismatch at position ${mismatch + 1}: article=${articleBlocks[mismatch] ?? "(missing)"}, source=${sourceBlocks[mismatch] ?? "(missing)"}`);
  }
  return { ok: errors.length === 0, errors, article: { headings: articleSections, images: articleImages, blocks: articleBlocks }, source: { headings: sourceSections, images: sourceImages, blocks: sourceBlocks } };
}

export function assertMarkdownParity(articleMarkdown, wechatSourceMarkdown, imageMap = {}) {
  const result = validateMarkdownParity(articleMarkdown, wechatSourceMarkdown, imageMap);
  if (!result.ok) throw new Error(result.errors.join("; "));
  return result;
}

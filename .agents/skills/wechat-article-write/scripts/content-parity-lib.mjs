import { extractBody } from "./frontmatter-lib.mjs";
import { collectMarkdownImages, collectSubstantiveSections, normalizeSourceImageKey } from "./visual-plan-lib.mjs";

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

/** Extract paragraphs and list items; headings and image-only blocks are not text protection targets. */
export function extractSubstantiveMarkdownBlocks(markdown) {
  const body = extractBody(markdown);
  const blocks = [];
  let paragraph = [];
  let inFence = false;
  const flush = () => {
    const text = normalizeVisibleText(paragraph.join("\n"));
    if (text) blocks.push(text);
    paragraph = [];
  };
  for (const rawLine of body.split(/\r?\n/u)) {
    if (/^\s*```/u.test(rawLine)) {
      flush();
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const line = rawLine.trim();
    if (!line) { flush(); continue; }
    if (/^#{1,6}\s+/u.test(line)) { flush(); continue; }
    if (/^[-*+]\s+/u.test(line) || /^\d+[.)]\s+/u.test(line)) {
      flush();
      const item = normalizeVisibleText(line.replace(/^(?:[-*+]\s+|\d+[.)]\s+)/u, ""));
      if (item) blocks.push(item);
      continue;
    }
    paragraph.push(line);
  }
  flush();
  return blocks;
}

// WeChat link normalization intentionally renders a Markdown link as two
// visible lines (label, then URL). Treat that pair as the same substantive
// block as the original inline Markdown link, while keeping all other block
// order and content checks strict.
function canonicalizeSubstantiveBlocks(markdown) {
  const blocks = [];
  for (const block of extractSubstantiveMarkdownBlocks(markdown)) {
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

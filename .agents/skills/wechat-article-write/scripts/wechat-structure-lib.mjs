/**
 * Structural parity between article-wechat-source.md and gzh-design HTML.
 *
 * This intentionally ignores presentation. It protects only substantive H2
 * order and body image topology (count, basename order, and section index).
 */

import { extractBody } from "./frontmatter-lib.mjs";
import { collectMarkdownImages, collectSubstantiveSections } from "./visual-plan-lib.mjs";

const LEAD_INFOGRAPHIC = "00-infographic-core-summary";

function decodeHtmlEntities(value) {
  return String(value ?? "")
    .replace(/&#x([0-9a-f]+);/giu, (_match, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/gu, (_match, decimal) => String.fromCodePoint(Number(decimal)))
    .replace(/&nbsp;/giu, " ")
    .replace(/&amp;/giu, "&")
    .replace(/&lt;/giu, "<")
    .replace(/&gt;/giu, ">")
    .replace(/&quot;/giu, '"')
    .replace(/&apos;/giu, "'");
}

function basenameWithoutExtension(value) {
  let source = String(value ?? "").trim();
  try { source = decodeURIComponent(source); } catch {}
  source = source.split(/[?#]/u, 1)[0];
  const basename = source.split("/").at(-1) ?? "";
  return basename.replace(/\.(?:png|jpe?g|webp|gif)$/iu, "").toLowerCase();
}

function normalizeHeadingForSearch(value) {
  return decodeHtmlEntities(String(value ?? ""))
    .replace(/<[^>]*>/gu, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/gu, "")
    .replace(/[\*_~`]/gu, "")
    .replace(/\s+/gu, "");
}

function normalizeHeadingForCompare(value) {
  return normalizeHeadingForSearch(value)
    .replace(/^(?:\d{1,3}|∞)[.、:：\s-]*/u, "");
}

function sectionIndexAtPosition(position, sections) {
  let sectionIndex = 0;
  for (const section of sections) {
    if (section.start > position) break;
    sectionIndex = section.section_index;
  }
  return sectionIndex;
}

function sourceEvents(sourceBody, sections, images) {
  return [
    ...sections.map((section) => ({ type: "heading", heading: section.heading, index: section.start })),
    ...images.map((image, imageIndex) => ({
      type: "image",
      image: basenameWithoutExtension(image.src),
      imageIndex,
      index: image.index,
      section_index: sectionIndexAtPosition(image.index, sections),
    })),
  ].sort((left, right) => left.index - right.index);
}

export function extractMarkdownStructure(markdown) {
  const body = extractBody(markdown);
  const sections = collectSubstantiveSections(body);
  const images = collectMarkdownImages(body).map((image) => ({
    basename: basenameWithoutExtension(image.src),
    index: image.index,
    section_index: sectionIndexAtPosition(image.index, sections),
  }));
  return {
    headings: sections.map((section) => section.heading),
    images,
    events: sourceEvents(body, sections, images.map((image) => ({ src: image.basename, index: image.index }))),
  };
}

function flattenHtml(html) {
  let normalized = "";
  const images = [];
  const tagRe = /<!--[\s\S]*?-->|<img\b[^>]*>|<[^>]+>/giu;
  let cursor = 0;
  const appendText = (text) => {
    normalized += decodeHtmlEntities(text).replace(/\s+/gu, "");
  };
  let match;
  while ((match = tagRe.exec(String(html ?? ""))) !== null) {
    appendText(String(html).slice(cursor, match.index));
    if (/^<img\b/iu.test(match[0])) {
      const src = match[0].match(/\bsrc\s*=\s*["']([^"']+)["']/iu)?.[1] ?? "";
      const image = {
        basename: basenameWithoutExtension(src),
        index: normalized.length,
      };
      images.push(image);
      normalized += `\u0000IMG_${images.length - 1}\u0000`;
    }
    cursor = match.index + match[0].length;
  }
  appendText(String(html ?? "").slice(cursor));
  return { normalized, images };
}

function headingTagSequence(html) {
  const headings = [];
  const re = /<h[2-6]\b[^>]*>([\s\S]*?)<\/h[2-6]>/giu;
  let match;
  while ((match = re.exec(String(html ?? ""))) !== null) {
    const text = decodeHtmlEntities(match[1]).replace(/<!--[\s\S]*?-->/gu, "").replace(/<[^>]+>/gu, "");
    headings.push(text);
  }
  return headings;
}

function substantiveHtmlHeadings(htmlHeadings, sourceHeadings) {
  const expected = new Set(sourceHeadings.map(normalizeHeadingForCompare));
  return htmlHeadings.filter((heading) => expected.has(normalizeHeadingForCompare(heading)));
}

function findOccurrence(text, needle, start) {
  if (!needle) return -1;
  return text.indexOf(needle, start);
}

function fallbackHeadingPositions(normalizedHtml, headings) {
  const positions = [];
  let cursor = 0;
  for (const heading of headings) {
    const needle = normalizeHeadingForSearch(heading);
    const position = findOccurrence(normalizedHtml, needle, cursor);
    if (position < 0) return null;
    positions.push(position);
    cursor = position + needle.length;
  }
  return positions;
}

function formatSection(sectionIndex) {
  return sectionIndex === 0 ? "lead section" : `section ${sectionIndex}`;
}

/**
 * Return a diagnostic result instead of throwing so Step 5 can report all
 * content-topology differences before marking the step complete.
 */
export function validateWechatStructuralParity(sourceMarkdown, html) {
  const source = extractMarkdownStructure(sourceMarkdown);
  const flattened = flattenHtml(html);
  const htmlHeadingTags = headingTagSequence(html);
  const htmlSubstantiveHeadings = substantiveHtmlHeadings(htmlHeadingTags, source.headings);
  const errors = [];

  if (source.images.length !== flattened.images.length) {
    errors.push(`body image count mismatch: source=${source.images.length}, html=${flattened.images.length}`);
  }

  const sourceImageNames = source.images.map((image) => image.basename);
  const htmlImageNames = flattened.images.map((image) => image.basename);
  if (JSON.stringify(sourceImageNames) !== JSON.stringify(htmlImageNames)) {
    const max = Math.max(sourceImageNames.length, htmlImageNames.length);
    for (let index = 0; index < max; index++) {
      if (sourceImageNames[index] !== htmlImageNames[index]) {
        errors.push(`image basename sequence mismatch at position ${index + 1}: expected ${sourceImageNames[index] ?? "(missing)"}, found ${htmlImageNames[index] ?? "(missing)"}`);
        break;
      }
    }
  }

  const matchedImageSections = [];
  const headingPositions = [];
  let cursor = 0;
  let imageIndex = 0;
  let sectionIndex = 0;
  for (const event of source.events) {
    if (event.type === "image") {
      const actual = flattened.images[imageIndex++];
      if (!actual) continue;
      if (actual.index < cursor) {
        errors.push(`image ${event.image} moved before its expected structural position`);
      } else {
        matchedImageSections.push({ basename: actual.basename, section_index: sectionIndex });
        cursor = actual.index + `\u0000IMG_${imageIndex - 1}\u0000`.length;
      }
      continue;
    }

    const needle = normalizeHeadingForSearch(event.heading);
    const position = findOccurrence(flattened.normalized, needle, cursor);
    if (position < 0) {
      errors.push(`substantive heading missing or out of order in HTML: ${event.heading}`);
      continue;
    }
    headingPositions.push(position);
    sectionIndex += 1;
    cursor = position + needle.length;
  }

  if (htmlHeadingTags.length > 0) {
    const expected = source.headings.map(normalizeHeadingForCompare);
    const actual = htmlSubstantiveHeadings.map(normalizeHeadingForCompare);
    if (JSON.stringify(expected) !== JSON.stringify(actual)) {
      errors.push(`substantive heading sequence mismatch: expected ${expected.join(" → ") || "(none)"}, found ${actual.join(" → ") || "(none)"}`);
    }
  }

  // Section affiliation must be derived from the final HTML's actual heading
  // positions, even when event matching stopped early. This catches a single
  // lead infographic moved after all headings: image count and order alone
  // would otherwise look unchanged.
  const headingsForPositions = htmlSubstantiveHeadings.length > 0 ? htmlSubstantiveHeadings : source.headings;
  const actualHeadingPositions = fallbackHeadingPositions(flattened.normalized, headingsForPositions);
  let imageSections = matchedImageSections;
  if (actualHeadingPositions) {
    imageSections = flattened.images.map((image) => ({
      basename: image.basename,
      section_index: actualHeadingPositions.filter((position) => position < image.index).length,
    }));
  } else if (imageSections.length !== source.images.length) {
    const fallback = fallbackHeadingPositions(flattened.normalized, source.headings);
    if (fallback) {
      imageSections = flattened.images.map((image) => ({
        basename: image.basename,
        section_index: fallback.filter((position) => position < image.index).length,
      }));
    }
  }

  if (source.images.length === flattened.images.length && sourceImageNames.join("\u0001") === htmlImageNames.join("\u0001")) {
    for (let index = 0; index < source.images.length; index++) {
      const expected = source.images[index];
      const actual = imageSections[index];
      if (!actual) continue;
      if (expected.section_index !== actual.section_index) {
        if (expected.basename === LEAD_INFOGRAPHIC && expected.section_index === 0) {
          errors.push(`${LEAD_INFOGRAPHIC} expected in lead section but found after section ${actual.section_index}`);
        } else {
          errors.push(`image ${expected.basename} expected in ${formatSection(expected.section_index)} but found in ${formatSection(actual.section_index)}`);
        }
      }
    }
  }

  const sourceHeadInfo = source.images.filter((image) => image.basename === LEAD_INFOGRAPHIC);
  const htmlHeadInfo = imageSections.filter((image) => image.basename === LEAD_INFOGRAPHIC);
  if (sourceHeadInfo.length === 1 && sourceHeadInfo[0].section_index === 0 && htmlHeadInfo.length === 1 && htmlHeadInfo[0].section_index !== 0 && !errors.some((error) => error.includes(LEAD_INFOGRAPHIC))) {
    errors.push(`${LEAD_INFOGRAPHIC} expected in lead section but found after section ${htmlHeadInfo[0].section_index}`);
  }

  return {
    ok: errors.length === 0,
    errors,
    source: {
      headings: source.headings,
      images: source.images.map(({ basename, section_index }) => ({ basename, section_index })),
    },
    html: {
      headings: htmlSubstantiveHeadings.length > 0 ? htmlSubstantiveHeadings : source.headings,
      images: imageSections.map(({ basename, section_index }) => ({ basename, section_index })),
    },
  };
}

export function assertWechatStructuralParity(sourceMarkdown, html) {
  const result = validateWechatStructuralParity(sourceMarkdown, html);
  if (!result.ok) throw new Error(result.errors.join("; "));
  return result;
}

import { extractBody } from "./frontmatter-lib.mjs";

export const NON_SUBSTANTIVE_HEADINGS = new Set(["参考资料", "延伸阅读"]);

function normalizedHeading(value) {
  return String(value ?? "").replace(/\s+#+\s*$/u, "").trim().replace(/\s+/gu, " ");
}

function collectH2Headings(body) {
  const headings = [];
  let offset = 0;
  let inFence = false;
  for (const line of String(body ?? "").match(/[^\r\n]*(?:\r?\n|$)/gu) ?? []) {
    if (/^\s*```/u.test(line)) {
      inFence = !inFence;
    } else if (!inFence) {
      const match = line.match(/^\s*##(?!#)\s+(.+?)\s*$/u);
      const heading = normalizedHeading(match?.[1]);
      if (heading) headings.push({ heading, start: offset });
    }
    offset += line.length;
  }
  return headings;
}

export function collectSubstantiveSections(body) {
  return collectH2Headings(body)
    .filter(({ heading }) => !NON_SUBSTANTIVE_HEADINGS.has(heading))
    .map((section, index) => ({ section_index: index + 1, heading: section.heading, start: section.start }));
}

/** Remove trailing non-substantive H2 sections before article word counting. */
export function stripNonSubstantiveTailSections(body) {
  const text = String(body ?? "");
  const headings = collectH2Headings(text);
  let lastSubstantiveIndex = -1;
  for (const [index, { heading }] of headings.entries()) {
    if (!NON_SUBSTANTIVE_HEADINGS.has(heading)) lastSubstantiveIndex = index;
  }
  const firstTrailingNonSubstantive = headings
    .slice(lastSubstantiveIndex + 1)
    .find(({ heading }) => NON_SUBSTANTIVE_HEADINGS.has(heading));
  return firstTrailingNonSubstantive ? text.slice(0, firstTrailingNonSubstantive.start).trimEnd() : text;
}

export function collectMarkdownImages(body) {
  const images = [];
  let offset = 0;
  let inFence = false;
  for (const line of String(body ?? "").match(/[^\r\n]*(?:\r?\n|$)/gu) ?? []) {
    if (/^\s*```/u.test(line)) {
      inFence = !inFence;
    } else if (!inFence) {
      const imageRe = /!\[[^\]]*\]\(([^)\s]+)(?:\s+[^)]*)?\)/gu;
      let match;
      while ((match = imageRe.exec(line)) !== null) images.push({ src: match[1], index: offset + match.index });
    }
    offset += line.length;
  }
  return images;
}

export function normalizeSourceImageKey(value) {
  let source = String(value ?? "").trim();
  try { source = decodeURIComponent(source); } catch {}
  source = source.split(/[?#]/u, 1)[0];
  return (source.split("/").at(-1) ?? "").toLowerCase();
}

export function sectionIndexAtPosition(position, sections) {
  let index = 0;
  for (const section of sections) {
    if (section.start > position) break;
    index = section.section_index;
  }
  return index;
}

export function markdownStructure(markdown) {
  const body = extractBody(markdown);
  const sections = collectSubstantiveSections(body);
  const images = collectMarkdownImages(body).map((image) => ({
    basename: normalizeSourceImageKey(image.src),
    index: image.index,
    section_index: sectionIndexAtPosition(image.index, sections),
  }));
  return { sections, images };
}

import { extractBody } from "./frontmatter-lib.mjs";

const NON_SUBSTANTIVE_HEADINGS = new Set(["参考资料", "延伸阅读"]);

function normalizedHeading(value) {
  return String(value ?? "").replace(/\s+#+\s*$/u, "").trim().replace(/\s+/gu, " ");
}

export function collectSubstantiveSections(body) {
  const sections = [];
  let offset = 0;
  let inFence = false;
  for (const line of String(body ?? "").match(/[^\r\n]*(?:\r?\n|$)/gu) ?? []) {
    if (/^\s*```/u.test(line)) {
      inFence = !inFence;
    } else if (!inFence) {
      const match = line.match(/^\s*##(?!#)\s+(.+?)\s*$/u);
      const heading = normalizedHeading(match?.[1]);
      if (heading && !NON_SUBSTANTIVE_HEADINGS.has(heading)) {
        sections.push({ section_index: sections.length + 1, heading, start: offset });
      }
    }
    offset += line.length;
  }
  return sections;
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

import { existsSync, readFileSync } from "node:fs";
import { normalizeLinksForWechat } from "./wechat-link-normalizer.mjs";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";
import { assertWechatStructuralParity } from "./wechat-structure-lib.mjs";
import { assertNoAuthorPlaceholders, replaceKnownAuthorPlaceholders } from "./author-profile-lib.mjs";

const markdownParser = unified().use(remarkParse).use(remarkFrontmatter, ["yaml"]).use(remarkGfm);
const markdownWriter = unified().use(remarkStringify);

function markdownImages(markdown) {
  const tree = markdownParser.parse(markdown);
  const definitions = new Map();
  const images = [];
  function walk(node) {
    if (node.type === "definition") definitions.set(node.identifier, node);
    if (["image", "imageReference"].includes(node.type)) images.push(node);
    for (const child of node.children ?? []) walk(child);
  }
  walk(tree);
  return images.map(node => ({ node, definition: definitions.get(node.identifier), src: node.url ?? definitions.get(node.identifier)?.url }));
}

/** Apply a validated flat image map to Markdown without invoking any uploader. */
export function applyImageMapToMarkdown(markdown, imgsDir, map) {
  let output = markdown;
  for (const { node, definition, src } of markdownImages(output).reverse()) {
    if (!/^(?:\.\/)?imgs\//u.test(src ?? "")) continue;
    const file = src.replace(/^(?:\.\/)?imgs\//u, "");
    const cdn = map[file];
    if (!cdn) throw new Error(`image-map.json missing CDN URL for ${file}`);
    const replacement = markdownWriter.stringify({ type: "root", children: [{
      type: "image", alt: node.alt, title: node.title ?? definition?.title ?? null, url: cdn,
    }] }).trimEnd();
    output = output.slice(0, node.position.start.offset) + replacement + output.slice(node.position.end.offset);
  }
  return output;
}

export function buildWechatSourceMarkdown(draft) {
  return normalizeLinksForWechat(replaceKnownAuthorPlaceholders(draft));
}

export function validateBlogArtifact(articleContent) {
  if (markdownImages(articleContent).some(({ src }) => /^(?:\.\/|\/)?imgs\//u.test(src ?? ""))) {
    throw new Error("article.md still has local imgs/ paths");
  }
  const authorErrors = assertNoAuthorPlaceholders(articleContent);
  if (authorErrors.length > 0) throw new Error(authorErrors.join("; "));
}

export function finalizeStep5Artifacts({ wechatSourcePath, wechatHtmlPath, markDone }) {
  if (!existsSync(wechatSourcePath)) {
    throw new Error("article-wechat-source.md missing; cannot validate structural parity");
  }
  if (!existsSync(wechatHtmlPath)) {
    throw new Error("article-wechat.html missing; cannot finalize Step 5");
  }

  // The child Skill owns HTML rendering, validation, and preview generation.
  // This parent Gate is intentionally read-only: invalid child output must be
  // repaired by the gzh-design owner rather than silently repaired here.
  const rawHtml = readFileSync(wechatHtmlPath, "utf8");
  const authorErrors = assertNoAuthorPlaceholders(rawHtml);
  if (authorErrors.length > 0) throw new Error(authorErrors.join("; "));
  if (/<a\b[^>]*\bhref\s*=/iu.test(rawHtml)) {
    throw new Error("article-wechat.html contains ordinary <a href>; return to gzh-design and regenerate the child output");
  }

  try {
    assertWechatStructuralParity(
      readFileSync(wechatSourcePath, "utf8"),
      rawHtml,
    );
  } catch (error) {
    throw new Error(`WeChat structural parity validator failed: ${error.message}`);
  }

  markDone();
}

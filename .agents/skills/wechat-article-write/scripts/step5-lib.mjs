import { existsSync, readFileSync, readdirSync } from "node:fs";
import { normalizeLinksForWechat } from "./wechat-link-normalizer.mjs";
import { SLOT_RESIDUAL_RE, replaceSlotPlaceholders, resolveSlotImageFile } from "./validation-lib.mjs";
import { assertWechatStructuralParity } from "./wechat-structure-lib.mjs";
import { assertNoAuthorPlaceholders, replaceKnownAuthorPlaceholders } from "./author-profile-lib.mjs";

function listImageFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(file => /\.(png|jpe?g|webp|gif)$/iu.test(file));
}

function buildImageMapResolver(map, imgsDir) {
  const files = listImageFiles(imgsDir);
  return placeholder => {
    const file = resolveSlotImageFile(placeholder, files);
    if (!file) return null;
    return { file, cdn: map[file] };
  };
}

const INTERNAL_PLANNING_COMMENT_RE = /<!--\s*VISUAL_TOPOLOGY:[\s\S]*?-->\s*/gu;

/** Remove only transient visual-planning comments from outward Markdown artifacts. */
export function stripInternalPlanningComments(markdown) {
  return String(markdown ?? "").replace(INTERNAL_PLANNING_COMMENT_RE, "");
}

export function assertNoInternalPlanningComments(content, artifactName = "artifact") {
  if (/VISUAL_TOPOLOGY/u.test(String(content ?? ""))) {
    throw new Error(`${artifactName} contains VISUAL_TOPOLOGY; internal planning comments must not cross the outward artifact boundary`);
  }
}

/** Apply a validated flat image map to Markdown without invoking any uploader. */
export function applyImageMapToMarkdown(markdown, imgsDir, map) {
  const resolveImage = buildImageMapResolver(map, imgsDir);
  let output = replaceSlotPlaceholders(stripInternalPlanningComments(markdown), match => {
    const image = resolveImage(match);
    return image?.cdn ? `![](${image.cdn})` : match;
  });
  return output.replace(/!\[([^\]]*)\]\((?:\.\/)?imgs\/([^\)\s]+)\)/gu, (_full, alt, file) => {
    const cdn = map[file];
    return cdn ? `![${alt}](${cdn})` : _full;
  });
}

export function buildWechatSourceMarkdown(draft, imgs) {
  let localMd = replaceSlotPlaceholders(replaceKnownAuthorPlaceholders(stripInternalPlanningComments(draft)), match => {
    const file = resolveSlotImageFile(match, imgs);
    if (!file) return match;
    return `![](imgs/${file})`;
  });

  localMd = normalizeLinksForWechat(localMd);
  return localMd;
}

export function validateBlogArtifact(articleContent) {
  assertNoInternalPlanningComments(articleContent, "article.md");
  if (SLOT_RESIDUAL_RE.test(articleContent)) {
    throw new Error("article.md still has SLOT_IMG_ placeholders");
  }

  if (/!\[[^\]]*\]\(\/?imgs\//.test(articleContent)) {
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
  const rawSource = readFileSync(wechatSourcePath, "utf8");
  assertNoInternalPlanningComments(rawSource, "article-wechat-source.md");
  const rawHtml = readFileSync(wechatHtmlPath, "utf8");
  try {
    assertNoInternalPlanningComments(rawHtml, "article-wechat.html");
  } catch (error) {
    throw new Error(`${error.message}; return to gzh-design for owner-local repair or regeneration`);
  }
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

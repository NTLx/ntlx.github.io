import { normalizeLinksForWechat } from "./wechat-link-normalizer.mjs";
import { SLOT_RESIDUAL_RE, replaceSlotPlaceholders, resolveSlotImageFile } from "./validation-lib.mjs";

export function buildWechatSourceMarkdown(draft, imgs) {
  let localMd = replaceSlotPlaceholders(draft, match => {
    const file = resolveSlotImageFile(match, imgs);
    if (!file) return match;
    return `![](imgs/${file})`;
  });

  localMd = normalizeLinksForWechat(localMd);
  return localMd;
}

export function validateBlogArtifact(articleContent) {
  if (SLOT_RESIDUAL_RE.test(articleContent)) {
    throw new Error("article.md still has SLOT_IMG_ placeholders");
  }

  if (/!\[[^\]]*\]\(\/?imgs\//.test(articleContent)) {
    throw new Error("article.md still has local imgs/ paths");
  }
}

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { repoRoot } from "./path-resolver.mjs";
import { normalizeLinksForWechat, stripWechatAnchors } from "./wechat-link-normalizer.mjs";
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

export function finalizeStep5Artifacts({ slug, wechatHtmlPath, generatePreview, markDone }) {
  if (!existsSync(wechatHtmlPath)) {
    throw new Error("article-wechat.html missing; cannot finalize Step 5");
  }

  const skillRoot = resolve(repoRoot(), ".agents/skills/gzh-design");
  const validateScript = resolve(skillRoot, "scripts/validate_gzh_html.py");
  const previewScript = resolve(skillRoot, "scripts/wrap_preview.py");

  // Defense-in-depth: strip residual <a href> from article-wechat.html.
  // Even if wechat-link-normalizer expanded all Markdown links, gzh-design
  // may still produce <a href> tags. This pass ensures the WeChat HTML
  // never contains clickable anchors (platform rule).
  const rawHtml = readFileSync(wechatHtmlPath, "utf8");
  const strippedHtml = stripWechatAnchors(rawHtml);
  if (strippedHtml !== rawHtml) {
    writeFileSync(wechatHtmlPath, strippedHtml, "utf8");
    process.stderr.write("step5: stripped residual <a href> tags from article-wechat.html\n");
  }

  const validate = spawnSync("python3", [validateScript, wechatHtmlPath], { stdio: "inherit", encoding: "utf8" });
  if (validate.status !== 0) {
    throw new Error(`gzh validator failed (exit ${validate.status})`);
  }

  let previewPath = null;
  if (generatePreview) {
    const preview = spawnSync("python3", [previewScript, wechatHtmlPath], { stdio: "inherit", encoding: "utf8" });
    if (preview.status !== 0) {
      throw new Error(`gzh preview wrapper failed (exit ${preview.status})`);
    }
    previewPath = wechatHtmlPath.replace(/\.html$/u, "_预览.html");
  }

  markDone();
  return previewPath;
}

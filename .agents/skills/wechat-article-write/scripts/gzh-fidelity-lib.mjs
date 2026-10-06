import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PROJECT_ROOT, repoRoot } from "./path-resolver.mjs";
import { getWechatAuthorProfile } from "./config-lib.mjs";
import { extractSubstantiveMarkdownBlockEntries } from "./content-parity-lib.mjs";
import { NON_SUBSTANTIVE_HEADINGS } from "./markdown-structure-lib.mjs";

function stripCode(value) {
  return String(value ?? "").trim().replace(/^`|`$/gu, "");
}

function visibleText(html) {
  return String(html ?? "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/giu, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/giu, "")
    .replace(/<!--[\s\S]*?-->/gu, "")
    .replace(/<[^>]+>/gu, " ")
    .replace(/&nbsp;/giu, " ")
    .replace(/&amp;/giu, "&")
    .replace(/&lt;/giu, "<")
    .replace(/&gt;/giu, ">")
    .replace(/&quot;/giu, '"')
    .replace(/\s+/gu, " ")
    .trim();
}

function themeRegistration(themeId) {
  const root = process.env.PIPELINE_REPO_ROOT ? repoRoot() : PROJECT_ROOT;
  const indexPath = resolve(root, ".agents/skills/gzh-design/references/theme-index.md");
  if (!existsSync(indexPath)) throw new Error("gzh-design theme-index.md missing");
  const line = readFileSync(indexPath, "utf8").split(/\r?\n/u)
    .find(row => row.includes(`theme-${themeId}.md`));
  if (!line) throw new Error(`gzh-design theme '${themeId}' is not registered in theme-index.md`);
  const cells = line.split("|").slice(1, -1).map(cell => cell.trim());
  if (cells.length < 5) throw new Error(`gzh-design theme-index row malformed for '${themeId}'`);
  const componentFile = stripCode(cells[3]);
  const underlineCss = stripCode(cells[4]);
  const themePath = resolve(root, ".agents/skills/gzh-design", componentFile);
  if (!existsSync(themePath)) throw new Error(`gzh-design theme component file missing: ${componentFile}`);
  return { theme_name: cells[0], componentFile, underlineCss, themePath, themeText: readFileSync(themePath, "utf8") };
}

function substantiveH2Count(sourceMarkdown) {
  const headings = [...String(sourceMarkdown ?? "").matchAll(/^##\s+(.+)$/gmu)]
    .map(match => match[1].trim())
    .filter(title => !NON_SUBSTANTIVE_HEADINGS.has(title));
  return headings.length;
}

function countThemeUnderlineMarks(html, css) {
  if (!css || css === "-" || !css.includes(":")) return null;
  const tokens = css.split(";").map(token => token.replace(/\s+/gu, "").toLowerCase()).filter(Boolean);
  if (tokens.length === 0) return null;
  let count = 0;
  for (const match of String(html ?? "").matchAll(/<span\b[^>]*\bstyle=(?:"([^"]*)"|'([^']*)')[^>]*>/giu)) {
    const style = (match[1] ?? match[2] ?? "").replace(/\s+/gu, "").toLowerCase();
    if (tokens.every(token => style.includes(token))) count += 1;
  }
  return count;
}

function skeletonSection(themeText) {
  const start = themeText.indexOf("## 完整文章模板骨架");
  if (start < 0) throw new Error("selected gzh-design theme is missing 完整文章模板骨架");
  const rest = themeText.slice(start);
  const next = rest.slice(3).search(/\n##\s/u);
  return next < 0 ? rest : rest.slice(0, next + 3);
}

/**
 * Gross-regression guard derived from the installed gzh-design theme itself.
 * It does not reproduce the theme recipe. It only checks that mandatory, easily
 * observable theme features did not disappear after the Specialist returned.
 */
export function validateGzhDesignFidelity({ sourceMarkdown, html, themeId }) {
  const registration = themeRegistration(themeId);
  const { themeText, underlineCss } = registration;
  const skeleton = skeletonSection(themeText);
  const visible = visibleText(html);
  const h2Count = substantiveH2Count(sourceMarkdown);
  const errors = [];

  const headingMapping = themeText.split(/\r?\n/u).find(line => line.includes("`## 章节标题`")) ?? "";
  if (h2Count > 0 && /(?:01\/02|编号\s*01|01\/02\/03)/u.test(headingMapping)) {
    if (!visible.includes("01")) errors.push("selected gzh theme requires numbered chapters but chapter marker 01 is missing");
    if (h2Count > 1 && !visible.includes("02")) errors.push("selected gzh theme requires numbered chapters but chapter marker 02 is missing");
  }

  if (/\bEND\b/u.test(skeleton) && !visible.includes("END")) {
    errors.push("selected gzh theme skeleton requires END but output has no END marker");
  }

  if (h2Count >= 3 && /前言导读区域/u.test(themeText) && /本文看点/u.test(themeText) && !visible.includes("本文看点")) {
    errors.push("selected gzh theme defines a 本文看点 guide for multi-section articles but output is missing it");
  }

  if (/尾部作者签名|作者签名区/u.test(themeText)) {
    const profile = getWechatAuthorProfile();
    const signatureStem = `我是 ${profile.name}，${profile.bio}`;
    const signatureCount = visible.split(signatureStem).length - 1;
    if (signatureCount !== 1) errors.push(`gzh author signature must appear exactly once (found ${signatureCount})`);
    const cta = "点赞、在看、转发";
    const ctaCount = visible.split(cta).length - 1;
    if (ctaCount !== 1) errors.push(`gzh fixed CTA must appear exactly once (found ${ctaCount})`);
  }

  const underlineCount = countThemeUnderlineMarks(html, underlineCss);
  if (underlineCount !== null && /正文关键词/u.test(themeText)) {
    const eligible = extractSubstantiveMarkdownBlockEntries(sourceMarkdown)
      .filter(entry => entry.kind !== "code" && String(entry.text ?? "").length >= 12).length;
    if (eligible > 0) {
      // gzh-design requires paragraph-level keyword marking. Keep this as a gross
      // regression guard rather than a second layout recipe: the Specialist still
      // decides which phrases and how many (1-3) within each paragraph.
      const minimum = Math.max(1, Math.ceil(eligible * 0.5));
      if (underlineCount < minimum) {
        errors.push(`gzh paragraph keyword marking is grossly incomplete: theme marks=${underlineCount}, expected at least ${minimum} for ${eligible} substantive blocks`);
      }
    }
  }

  if (errors.length > 0) throw new Error(`gzh-design fidelity Gate failed: ${errors.join("; ")}`);
  return { theme_id: themeId, theme_name: registration.theme_name, h2_count: h2Count, underline_marks: underlineCount };
}

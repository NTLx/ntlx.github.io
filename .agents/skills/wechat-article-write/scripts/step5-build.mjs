#!/usr/bin/env bun
/**
 * Step 5: 产物构建（CDN 上传 + 占位符替换 + HTML 转换）
 *
 * 1. 上传 imgs/* 到 GitHub 图床 → image-map.json
 * 2. 占位符替换为 CDN URL → article.md
 * 3. 占位符替换为本地路径（内存中） → baoyu-markdown-to-html → article-wechat.html
 * 4. 验证
 *
 * 用法:
 *   bun run step5-build.mjs <date-slug> [--theme default] [--color blue]
 *
 * 退出码: 0 成功；2 输入缺失；3 上传失败；4 HTML 转换失败
 */

import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { markStepDone, markStepFailed } from "./state-lib.mjs";
import { postsRoot, repoRoot } from "./path-resolver.mjs";

const args = process.argv.slice(2);
let slug = null, theme = "default", color = "blue";
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--theme" && args[i + 1]) { theme = args[++i]; }
  else if (args[i] === "--color" && args[i + 1]) { color = args[++i]; }
  else if (!slug) slug = args[i];
}
if (!slug) { process.stderr.write("usage: step5-build.mjs <date-slug> [--theme T] [--color C]\n"); process.exit(1); }

const base = resolve(postsRoot(), slug);
const draftPath = resolve(base, "draft.md");
const imgsDir = resolve(base, "imgs");
const mapPath = resolve(base, "image-map.json");
const articlePath = resolve(base, "article.md");
const wechatHtmlPath = resolve(base, "article-wechat.html");

function fail(code, msg) {
  process.stderr.write(`step5: FAIL - ${msg}\n`);
  markStepFailed(slug, 5, msg);
  process.exit(code);
}

if (!existsSync(draftPath)) fail(2, "draft.md missing");
if (!existsSync(imgsDir)) fail(2, "imgs/ directory missing");

// Helper: find script dir
function findScriptDir(name) {
  const candidates = [
    resolve(repoRoot(), `.agents/skills/${name}`),
    resolve(process.env.HOME ?? "", `.claude/skills/${name}`),
  ];
  for (const d of candidates) if (existsSync(d)) return d;
  return null;
}

// 1. Upload images to CDN
const githubDir = findScriptDir("github-image-hosting");
if (!githubDir) fail(2, "github-image-hosting skill not found");

const dateStr = slug.slice(0, 10);
const asciiSlug = slug.slice(11).replace(/[^a-zA-Z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
const uploadResult = spawnSync("bun", [
  "run", resolve(githubDir, "scripts/upload.ts"),
  imgsDir,
  "--repo", "NTLx/Pic@master:wechat-articles",
  "--name-prefix", `${dateStr}-${asciiSlug}-img`,
  "--output", mapPath,
], { stdio: "inherit", encoding: "utf8" });

if (uploadResult.status !== 0) fail(3, "CDN upload failed");

if (!existsSync(mapPath)) fail(3, "image-map.json not created");

// 2. Placeholder → CDN URL → article.md
const applyScript = resolve(repoRoot(), ".agents/skills/wechat-article-write/scripts/apply-image-map.mjs");
const applyResult = spawnSync("bun", ["run", applyScript, slug], { stdio: "inherit", encoding: "utf8" });
if (applyResult.status !== 0) fail(4, "apply-image-map failed");

if (!existsSync(articlePath)) fail(4, "article.md not created");

// 3. Generate article-wechat.html from draft.md（本地路径版）
//    Read draft.md, replace SLOT_IMG with local imgs/ paths, feed to markdown-to-html
const htmlSkillDir = findScriptDir("baoyu-markdown-to-html");
if (!htmlSkillDir) fail(2, "baoyu-markdown-to-html skill not found");

const htmlScript = resolve(htmlSkillDir, "scripts/main.ts");
if (!existsSync(htmlScript)) fail(2, `HTML script not found: ${htmlScript}`);

const draft = readFileSync(draftPath, "utf8");

// Build a local-paths version of draft.md in memory
// Replace <!-- SLOT_IMG_NN --> with ![](imgs/NN-xxx.ext)
const tempLocalMd = resolve(base, "_temp_local.md");
let localMd = draft;
const imgs = existsSync(imgsDir) ? require("fs").readdirSync(imgsDir).filter(f => /\.(png|jpe?g|webp|gif)$/i.test(f)) : [];

localMd = localMd.replace(/<!--\s*(SLOT_IMG_\d{2}[^>]*?)\s*-->/g, (_full, raw) => {
  const m = raw.match(/SLOT_IMG_(\d{2})(?:_([A-Za-z0-9_-]+))?/);
  if (!m) return _full;
  const nn = m[1];
  const file = imgs.find(f => f.startsWith(`${nn}-`));
  if (!file) return _full;
  return `![](imgs/${file})`;
});

writeFileSync(tempLocalMd, localMd);

// Convert to HTML
const title = draft.match(/^title:\s*(.+)$/m)?.[1] ?? "";
const htmlResult = spawnSync("bun", [
  "run", htmlScript,
  tempLocalMd,
  "--theme", theme,
  "--title", title,
], { stdio: "inherit", encoding: "utf8", cwd: repoRoot() });

// Cleanup temp file
try { require("fs").unlinkSync(tempLocalMd); } catch {}

if (htmlResult.status !== 0) fail(4, "HTML conversion failed");

// baoyu-markdown-to-html outputs {input}.html
const tempLocalHtml = resolve(base, "_temp_local.html");
if (existsSync(tempLocalHtml)) {
  renameSync(tempLocalHtml, wechatHtmlPath);
} else if (!existsSync(wechatHtmlPath)) {
  fail(4, "HTML output not found");
}

// Post-process: remove font-family declarations (WeChat WebView doesn't load custom fonts)
if (existsSync(wechatHtmlPath)) {
  let html = readFileSync(wechatHtmlPath, "utf8");
  html = html.replace(/font-family:\s*((?:&quot;|")[^;,]+?(?:&quot;|")(?:\s*,\s*(?:&quot;|")[^;,]+?(?:&quot;|"))*)/g, (_m, quoted) => {
    return `font-family: ${quoted.replace(/&quot;/g, "'").replace(/"/g, "'")}`;
  });
  html = html.replace(/font-family:\s*[^;]+;/g, "");
  html = html.replace(/style="\s*"/g, "");
  html = html.replace(/;\s*;(?!\s*important)/g, ";");
  html = html.replace(/; {2,}/g, "; ");
  html = html.replace(/style=" /g, "style=\"");
  writeFileSync(wechatHtmlPath, html);
}

// 4. Validation
if (!existsSync(wechatHtmlPath) || readFileSync(wechatHtmlPath, "utf8").length === 0) fail(4, "article-wechat.html empty");
if (!readFileSync(wechatHtmlPath, "utf8").includes("style=")) {
  process.stderr.write("step5: WARNING article-wechat.html missing inline CSS\n");
}

const articleContent = readFileSync(articlePath, "utf8");
if (/<!--\s*SLOT_IMG_/.test(articleContent)) fail(4, "article.md still has SLOT_IMG_ placeholders");
if (/!\[[^\]]*\]\(\/?imgs\//.test(articleContent)) fail(4, "article.md still has local imgs/ paths");

markStepDone(slug, 5, { article_md: "article.md", article_wechat_html: "article-wechat.html", theme, color });
process.stdout.write(JSON.stringify({ slug, step: 5, theme, color }) + "\n");
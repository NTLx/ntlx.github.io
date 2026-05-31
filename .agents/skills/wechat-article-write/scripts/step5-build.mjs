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
 *   bun run step5-build.mjs <date-slug> [--theme default] [--color blue] [--dry-run] [--reuse-image-map]
 *
 * 退出码: 0 成功；2 输入缺失；3 上传失败；4 HTML 转换失败
 */

import { existsSync, readFileSync, readdirSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { markStepDone, markStepFailed } from "./state-lib.mjs";
import { postsRoot, repoRoot } from "./path-resolver.mjs";
import { getMarkdownToHtmlConfig } from "./config-lib.mjs";
import { readFmValue } from "./frontmatter-lib.mjs";
import { SLOT_EXTRACT_RE, SLOT_RESIDUAL_RE, replaceSlotPlaceholders } from "./validation-lib.mjs";

const cfg = getMarkdownToHtmlConfig();
const args = process.argv.slice(2);
let slug = null, theme = cfg.theme, color = cfg.color, dryRun = false, reuseImageMap = false;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--theme" && args[i + 1]) { theme = args[++i]; }
  else if (args[i] === "--color" && args[i + 1]) { color = args[++i]; }
  else if (args[i] === "--dry-run") { dryRun = true; }
  else if (args[i] === "--reuse-image-map") { reuseImageMap = true; }
  else if (args[i].startsWith("--")) {
    process.stderr.write(`step5: unknown flag ${args[i]}\n`);
    process.exit(1);
  }
  else if (!slug) slug = args[i];
}
if (!slug) { process.stderr.write("usage: step5-build.mjs <date-slug> [--theme T] [--color C] [--dry-run] [--reuse-image-map]\n"); process.exit(1); }

const base = resolve(postsRoot(), slug);
const draftPath = resolve(base, "draft.md");
const imgsDir = resolve(base, "imgs");
const mapPath = resolve(base, "image-map.json");
const articlePath = resolve(base, "article.md");
const wechatHtmlPath = resolve(base, "article-wechat.html");
const coverPng = resolve(base, "cover.png");
const coverJpg = resolve(base, "cover.jpg");

function fail(code, msg) {
  process.stderr.write(`step5: FAIL - ${msg}\n`);
  if (!dryRun) markStepFailed(slug, 5, msg);
  process.exit(code);
}

if (!existsSync(draftPath)) fail(2, "draft.md missing");
if (!existsSync(imgsDir)) fail(2, "imgs/ directory missing");
if (!existsSync(coverPng) && !existsSync(coverJpg)) fail(2, "cover image missing (cover.png/cover.jpg)");

function imageFiles(dir) {
  return readdirSync(dir).filter(f => /\.(png|jpe?g|webp|gif)$/i.test(f)).sort();
}


function loadImageMap() {
  if (!existsSync(mapPath)) fail(3, "image-map.json missing; cannot --reuse-image-map");
  let raw;
  try {
    raw = JSON.parse(readFileSync(mapPath, "utf8"));
  } catch (err) {
    fail(3, `image-map.json invalid JSON: ${err.message}`);
  }
  const files = raw.files ?? raw;
  if (!files || typeof files !== "object" || Array.isArray(files)) {
    fail(3, "image-map.json must be an object or contain a files object");
  }
  return files;
}

function resolveAssetSlug(draft) {
  const blogSlug = readFmValue(draft, "blogSlug");
  if (/^[a-z][a-z0-9-]*[a-z0-9]$/.test(blogSlug)) return blogSlug;
  fail(2, "frontmatter.blogSlug missing or invalid; Step 5 needs an ASCII slug for stable image names");
}

function buildSyntheticMap(files, namePrefix) {
  return Object.fromEntries(files.map(file => [
    file,
    `https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/${namePrefix}-${file}`,
  ]));
}

function validateImageMapCoverage(draft, files, map) {
  const hasUrl = file => typeof map[file] === "string" && /^https?:\/\//.test(map[file]);
  const slotRefs = [...draft.matchAll(SLOT_EXTRACT_RE)].map(m => m[1]);
  for (const slotNum of slotRefs) {
    const file = files.find(f => f.startsWith(`${slotNum}-`));
    if (!file) fail(4, `SLOT_IMG_${slotNum} has no matching image in imgs/`);
    if (!hasUrl(file)) fail(4, `image-map.json missing valid CDN URL for ${file}`);
  }

  const localRefs = [...draft.matchAll(/!\[[^\]]*\]\((?:\.\/)?imgs\/([^)\s]+)\)/g)].map(m => m[1]);
  for (const file of localRefs) {
    if (!files.includes(file)) fail(4, `draft.md references missing local image imgs/${file}`);
    if (!hasUrl(file)) fail(4, `image-map.json missing valid CDN URL for ${file}`);
  }

  if (slotRefs.length === 0 && localRefs.length === 0) {
    fail(4, "draft.md has images in imgs/ but no SLOT_IMG placeholders or local imgs/ references");
  }

  return { slot_count: slotRefs.length, local_ref_count: localRefs.length };
}

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

const draft = readFileSync(draftPath, "utf8");
const imgs = imageFiles(imgsDir);
if (imgs.length === 0) fail(2, "imgs/ contains no image files");

const dateStr = slug.slice(0, 10);
const assetSlug = resolveAssetSlug(draft);
const namePrefix = `${dateStr}-${assetSlug}-img`;

let imageMap = reuseImageMap ? loadImageMap() : buildSyntheticMap(imgs, namePrefix);
const coverage = validateImageMapCoverage(draft, imgs, imageMap);

if (dryRun) {
  const htmlSkillDir = findScriptDir("baoyu-markdown-to-html");
  if (!htmlSkillDir) fail(2, "baoyu-markdown-to-html skill not found");
  const htmlScript = resolve(htmlSkillDir, "scripts/main.ts");
  if (!existsSync(htmlScript)) fail(2, `HTML script not found: ${htmlScript}`);
  process.stdout.write(JSON.stringify({
    slug,
    step: 5,
    dry_run: true,
    reuse_image_map: reuseImageMap,
    image_count: imgs.length,
    name_prefix: namePrefix,
    theme,
    color,
    ...coverage,
  }) + "\n");
  process.exit(0);
}

if (!reuseImageMap) {
  const uploadResult = spawnSync("bun", [
    "run", resolve(githubDir, "scripts/upload.ts"),
    imgsDir,
    "--repo", "NTLx/Pic@master:wechat-articles",
    "--name-prefix", namePrefix,
    "--output", mapPath,
  ], { stdio: "inherit", encoding: "utf8" });

  if (uploadResult.status !== 0) fail(3, "CDN upload failed");

  if (!existsSync(mapPath)) fail(3, "image-map.json not created");
  imageMap = loadImageMap();
  validateImageMapCoverage(draft, imgs, imageMap);
} else {
  process.stdout.write(`step5: reusing existing image-map.json (${Object.keys(imageMap).length} entries)\n`);
}

// 2. Placeholder → CDN URL → article.md
const applyScript = resolve(repoRoot(), ".agents/skills/wechat-article-write/scripts/apply-image-map.mjs");
const applyResult = spawnSync("bun", ["run", applyScript, slug], { stdio: "inherit", encoding: "utf8" });
if (applyResult.status !== 0) fail(4, "apply-image-map failed");

if (!existsSync(articlePath)) fail(4, "article.md not created");

// 3. Generate article-wechat.html from draft.md（本地路径版）
//    Read draft.md, replace SLOT_IMG with local imgs/ paths, feed to markdown-to-html

// Defensive: cover normalization — if cover.png is actually JPEG, rename it
if (existsSync(coverPng)) {
  const fileType = spawnSync("file", ["-b", "--mime-type", coverPng], { encoding: "utf8" });
  if (fileType.stdout?.trim()?.startsWith("image/jpeg")) {
    renameSync(coverPng, coverJpg);
    process.stderr.write("step5: renamed cover.png → cover.jpg (was actually JPEG)\n");
  }
}

const htmlSkillDir = findScriptDir("baoyu-markdown-to-html");
if (!htmlSkillDir) fail(2, "baoyu-markdown-to-html skill not found");

const htmlScript = resolve(htmlSkillDir, "scripts/main.ts");
if (!existsSync(htmlScript)) fail(2, `HTML script not found: ${htmlScript}`);

// Auto-install dependencies if node_modules is missing
const htmlScriptsDir = resolve(htmlSkillDir, "scripts");
const htmlPkgJson = resolve(htmlScriptsDir, "package.json");
const htmlNodeModules = resolve(htmlScriptsDir, "node_modules");
if (existsSync(htmlPkgJson) && !existsSync(htmlNodeModules)) {
  process.stdout.write("step5: installing baoyu-markdown-to-html dependencies...\n");
  const installResult = spawnSync("bun", ["install"], { cwd: htmlScriptsDir, stdio: "inherit" });
  if (installResult.status !== 0) fail(4, "dependency installation failed");
  process.stdout.write("step5: dependencies installed\n");
}

// Build a local-paths version of draft.md in memory
// Replace <!-- SLOT_IMG_NN --> with ![](imgs/NN-xxx.ext)
const tempLocalMd = resolve(base, "_temp_local.md");
let localMd = draft;

localMd = replaceSlotPlaceholders(localMd, (_match, slot, _desc) => {
  const nn = String(slot).padStart(2, "0");
  const file = imgs.find(f => f.startsWith(`${nn}-`));
  if (!file) return _match;
  return `![](imgs/${file})`;
});

writeFileSync(tempLocalMd, localMd);

// Convert to HTML
const title = draft.match(/^title:\s*(.+)$/m)?.[1] ?? "";
const htmlResult = spawnSync("bun", [
  "run", htmlScript,
  tempLocalMd,
  "--theme", theme,
  "--color", color,
  "--title", title,
], { stdio: "inherit", encoding: "utf8", cwd: repoRoot() });

// Cleanup temp file
try { unlinkSync(tempLocalMd); } catch {}

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
  // Normalize img tags: ensure `src` is never the first attribute after `<img`.
  // baoyu-post-to-wechat's imgRegex uses `\ssrc` which requires whitespace before `src`.
  // When `<img src="...">` (src is the first attribute), the greedy `[^>]*` in the regex
  // can consume the space between `<img` and `src`, causing `\s` to fail to match.
  // Injecting `data-img` before `src` guarantees whitespace exists before `src`.
  html = html.replace(/<img(\s)src=/gi, '<img data-img src=');

  writeFileSync(wechatHtmlPath, html);
}

// WeChat HTML preflight validation
if (existsSync(wechatHtmlPath)) {
  const wechatHtml = readFileSync(wechatHtmlPath, "utf8");

  // No SLOT_IMG residuals
  if (SLOT_RESIDUAL_RE.test(wechatHtml)) {
    fail(4, "article-wechat.html still has SLOT_IMG_ placeholders");
  }

  // No empty img src
  if (/<img[^>]+src\s*=\s*["']["'][^>]*>/i.test(wechatHtml)) {
    fail(4, "article-wechat.html has empty img src");
  }

  // No markdown residuals — strip <code> blocks first, then check for ![...] or ]( patterns
  const stripped = wechatHtml.replace(/<code[\s\S]*?<\/code>/gi, "");
  if (/!\[[^\]]*\]\(/.test(stripped)) {
    fail(4, "article-wechat.html has markdown residuals (unconverted image link)");
  }
}

// 4. Validation
if (!existsSync(wechatHtmlPath) || readFileSync(wechatHtmlPath, "utf8").length === 0) fail(4, "article-wechat.html empty");
if (!readFileSync(wechatHtmlPath, "utf8").includes("style=")) {
  process.stderr.write("step5: WARNING article-wechat.html missing inline CSS\n");
}

const articleContent = readFileSync(articlePath, "utf8");
if (SLOT_RESIDUAL_RE.test(articleContent)) fail(4, "article.md still has SLOT_IMG_ placeholders");
if (/!\[[^\]]*\]\(\/?imgs\//.test(articleContent)) fail(4, "article.md still has local imgs/ paths");

markStepDone(slug, 5, { article_md: "article.md", article_wechat_html: "article-wechat.html", theme, color, reuse_image_map: reuseImageMap });
process.stdout.write(JSON.stringify({ slug, step: 5, theme, color, reuse_image_map: reuseImageMap }) + "\n");

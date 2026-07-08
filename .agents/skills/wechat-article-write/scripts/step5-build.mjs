#!/usr/bin/env bun
/**
 * Step 5: 产物构建（CDN 上传 + 占位符替换 + WeChat 源 Markdown 准备）
 *
 * 1. 上传 imgs/* 到 GitHub 图床 → image-map.json
 * 2. 占位符替换为 CDN URL → article.md
 * 3. 占位符替换为本地路径（内存中） → article-wechat-source.md
 * 4. 等待 Agent 调用 gzh-design 生成 article-wechat.html
 *
 * 用法:
 *   bun run step5-build.mjs <date-slug> [--dry-run] [--reuse-image-map]
 *
 * 退出码: 0 成功；2 输入缺失；3 上传失败；4 构建失败
 */

import { existsSync, readFileSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { markStepDone, markStepFailed } from "./state-lib.mjs";
import { postsRoot, repoRoot } from "./path-resolver.mjs";
import { getWechatArticleWriteConfig } from "./config-lib.mjs";
import { readFmValue } from "./frontmatter-lib.mjs";
import { SLOT_EXTRACT_RE, resolveSlotImageFile } from "./validation-lib.mjs";
import { buildWechatSourceMarkdown, finalizeStep5Artifacts, validateBlogArtifact } from "./step5-lib.mjs";
const args = process.argv.slice(2);
const wechatCfg = getWechatArticleWriteConfig();
let slug = null, dryRun = false, reuseImageMap = false, prepareOnly = false, finalizeOnly = false;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--dry-run") { dryRun = true; }
  else if (args[i] === "--reuse-image-map") { reuseImageMap = true; }
  else if (args[i] === "--prepare-only") { prepareOnly = true; }
  else if (args[i] === "--finalize-only") { finalizeOnly = true; }
  else if (args[i].startsWith("--")) {
    process.stderr.write(`step5: unknown flag ${args[i]}\n`);
    process.exit(1);
  }
  else if (!slug) slug = args[i];
}
if (!slug) { process.stderr.write("usage: step5-build.mjs <date-slug> [--dry-run] [--reuse-image-map] [--prepare-only] [--finalize-only]\n"); process.exit(1); }
if (prepareOnly && finalizeOnly) {
  process.stderr.write("step5: --prepare-only and --finalize-only are mutually exclusive\n");
  process.exit(1);
}

const base = resolve(postsRoot(), slug);
const draftPath = resolve(base, "draft.md");
const imgsDir = resolve(base, "imgs");
const mapPath = resolve(base, "image-map.json");
const articlePath = resolve(base, "article.md");
const wechatSourcePath = resolve(base, "article-wechat-source.md");
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
    buildCdnUrl(`${WECHAT_IMAGE_FOLDER}/${namePrefix}-${file}`),
  ]));
}

function validateImageMapCoverage(draft, files, map) {
  const hasUrl = file => typeof map[file] === "string" && /^https?:\/\//.test(map[file]);
  const slotRefs = [...draft.matchAll(SLOT_EXTRACT_RE)];
  for (const match of slotRefs) {
    const file = resolveSlotImageFile(match[0], files);
    const slotNum = match[1];
    if (!file) fail(4, `SLOT_IMG_${slotNum} has no unambiguous matching image in imgs/`);
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

// Read github-image-hosting config from .github-image-hosting.env
// Falls back to the same defaults as upload.ts, keeping both sides in sync.
function readGithubImageConfig() {
  const envPath = resolve(repoRoot(), ".github-image-hosting.env");
  const cfg = { owner: "NTLx", name: "Pic", branch: "master", folder: "blog" };
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq < 0) continue;
      const k = t.slice(0, eq).trim(), v = t.slice(eq + 1).trim();
      if (k === "GITHUB_IMAGE_REPO_OWNER") cfg.owner = v;
      else if (k === "GITHUB_IMAGE_REPO_NAME") cfg.name = v;
      else if (k === "GITHUB_IMAGE_REPO_BRANCH") cfg.branch = v;
      else if (k === "GITHUB_IMAGE_DEFAULT_FOLDER") cfg.folder = v;
    }
  }
  return cfg;
}

const ghImgCfg = readGithubImageConfig();
const WECHAT_IMAGE_FOLDER = "wechat-articles";

function buildCdnUrl(repoPath) {
  return `https://cdn.jsdelivr.net/gh/${ghImgCfg.owner}/${ghImgCfg.name}@${ghImgCfg.branch}/${repoPath}`;
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
  process.stdout.write(JSON.stringify({
    slug,
    step: 5,
    dry_run: true,
    phase: "prepare",
    reuse_image_map: reuseImageMap,
    image_count: imgs.length,
    name_prefix: namePrefix,
    needs_agent_layout: true,
    ...coverage,
  }) + "\n");
  process.exit(0);
}

if (!reuseImageMap) {
  const uploadScript = resolve(githubDir, "scripts/upload.ts");
  const repoSpec = `${ghImgCfg.owner}/${ghImgCfg.name}@${ghImgCfg.branch}:${WECHAT_IMAGE_FOLDER}`;
  const UPLOAD_MAX_RETRIES = 3;

  for (let attempt = 1; attempt <= UPLOAD_MAX_RETRIES; attempt++) {
    const uploadResult = spawnSync("bun", [
      "run", uploadScript,
      imgsDir,
      "--repo", repoSpec,
      "--name-prefix", namePrefix,
      "--output", mapPath,
    ], { stdio: "inherit", encoding: "utf8" });

    if (uploadResult.status === 0) break;

    if (attempt < UPLOAD_MAX_RETRIES) {
      process.stderr.write(`step5: CDN upload failed (attempt ${attempt}/${UPLOAD_MAX_RETRIES}), retrying in 30s...\n`);
      const end = Date.now() + 30000;
      while (Date.now() < end) { /* blocking wait */ }
    } else {
      fail(3, `CDN upload failed after ${UPLOAD_MAX_RETRIES} attempts`);
    }
  }

  if (!existsSync(mapPath)) fail(3, "image-map.json not created");
  imageMap = loadImageMap();
  validateImageMapCoverage(draft, imgs, imageMap);
} else {
  process.stdout.write(`step5: reusing existing image-map.json (${Object.keys(imageMap).length} entries)\n`);
}

// 2. Placeholder → CDN URL → article.md
if (!finalizeOnly) {
  const applyScript = resolve(repoRoot(), ".agents/skills/wechat-article-write/scripts/apply-image-map.mjs");
  const applyResult = spawnSync("bun", ["run", applyScript, slug], { stdio: "inherit", encoding: "utf8" });
  if (applyResult.status !== 0) fail(4, "apply-image-map failed");

  if (!existsSync(articlePath)) fail(4, "article.md not created");

  // 3. Generate article-wechat-source.md from draft.md（本地路径版）

  // Defensive: cover normalization — if cover.png is actually JPEG, rename it
  if (existsSync(coverPng)) {
    const fileType = spawnSync("file", ["-b", "--mime-type", coverPng], { encoding: "utf8" });
    if (fileType.stdout?.trim()?.startsWith("image/jpeg")) {
      renameSync(coverPng, coverJpg);
      process.stderr.write("step5: renamed cover.png → cover.jpg (was actually JPEG)\n");
    }
  }

  writeFileSync(wechatSourcePath, buildWechatSourceMarkdown(draft, imgs));

  // 4. Validation
  const articleContent = readFileSync(articlePath, "utf8");
  try {
    validateBlogArtifact(articleContent);
  } catch (err) {
    fail(4, err.message);
  }

  if (!existsSync(wechatSourcePath) || readFileSync(wechatSourcePath, "utf8").length === 0) {
    fail(4, "article-wechat-source.md empty");
  }

  if (prepareOnly) {
    process.stdout.write(JSON.stringify({
      slug,
      step: 5,
      phase: "prepared",
      article_md: "article.md",
      wechat_source: "article-wechat-source.md",
      reuse_image_map: reuseImageMap,
      needs_agent_layout: true,
    }) + "\n");
    process.exit(0);
  }
}

if (!existsSync(wechatHtmlPath)) {
  process.stdout.write(JSON.stringify({
    slug,
    step: 5,
    phase: "prepared",
    article_md: "article.md",
    wechat_source: "article-wechat-source.md",
    reuse_image_map: reuseImageMap,
    needs_agent_layout: true,
  }) + "\n");
  process.exit(0);
}

let previewPath = null;
try {
  previewPath = finalizeStep5Artifacts({
    slug,
    wechatHtmlPath,
    generatePreview: wechatCfg.wechatLayoutGeneratePreview,
    markDone: () => markStepDone(slug, 5, {
      article_md: "article.md",
      article_wechat_source_md: "article-wechat-source.md",
      article_wechat_html: "article-wechat.html",
      reuse_image_map: reuseImageMap,
    }),
  });
} catch (err) {
  fail(4, err.message);
}

process.stdout.write(JSON.stringify({
  slug,
  step: 5,
  phase: "completed",
  article_md: "article.md",
  wechat_source: "article-wechat-source.md",
  article_wechat_html: "article-wechat.html",
  preview: previewPath ? previewPath.split("/").at(-1) : null,
  reuse_image_map: reuseImageMap,
}) + "\n");

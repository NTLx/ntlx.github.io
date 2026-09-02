#!/usr/bin/env bun
/**
 * Step 5: 双轨产物构建。
 *
 * prepare: 本地校验 → github-image-hosting 一次 → image-map → 双轨中间产物。
 * finalize: 只消费本地准备产物，运行 gzh validator / structural parity。
 */

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { markStepDone, markStepFailed } from "./state-lib.mjs";
import { postsRoot, repoRoot } from "./path-resolver.mjs";
import { getWechatArticleWriteConfig } from "./config-lib.mjs";
import { readFmValue } from "./frontmatter-lib.mjs";
import { SLOT_EXTRACT_RE, resolveSlotImageFile } from "./validation-lib.mjs";
import { buildWechatSourceMarkdown, finalizeStep5Artifacts, validateBlogArtifact } from "./step5-lib.mjs";
import { assertCurrentDraftHumanized } from "./humanizer-lib.mjs";

const args = process.argv.slice(2);
let slug = null;
let dryRun = false;
let prepareOnly = false;
let finalizeOnly = false;
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === "--dry-run") dryRun = true;
  else if (args[i] === "--prepare-only") prepareOnly = true;
  else if (args[i] === "--finalize-only") finalizeOnly = true;
  else if (args[i].startsWith("--")) {
    process.stderr.write(`step5: unknown flag ${args[i]}\n`);
    process.exit(1);
  } else if (!slug) slug = args[i];
}

if (!slug) {
  process.stderr.write("usage: step5-build.mjs <date-slug> [--dry-run] [--prepare-only] [--finalize-only]\n");
  process.exit(1);
}
if (prepareOnly && finalizeOnly) {
  process.stderr.write("step5: --prepare-only and --finalize-only are mutually exclusive\n");
  process.exit(1);
}
if (dryRun && finalizeOnly) {
  process.stderr.write("step5: --dry-run cannot be combined with --finalize-only\n");
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
const WECHAT_IMAGE_FOLDER = "wechat-articles";

function fail(code, message) {
  process.stderr.write(`step5: FAIL - ${message}\n`);
  if (!dryRun) markStepFailed(slug, 5, message);
  process.exit(code);
}

function imageFiles(dir) {
  return readdirSync(dir).filter(file => /\.(png|jpe?g|webp|gif)$/i.test(file)).sort();
}

function validateCoverFormat(path, expectedMime) {
  const fileType = spawnSync("file", ["-b", "--mime-type", path], { encoding: "utf8" });
  const actualMime = fileType.stdout?.trim();
  if (fileType.error || fileType.status !== 0 || !actualMime) {
    fail(2, `unable to detect MIME type for ${path}`);
  }
  if (actualMime !== expectedMime) {
    fail(2, `${path.split("/").at(-1)} has MIME ${actualMime}; run pre-humanizer-normalize.mjs before humanizer-zh`);
  }
}

function validateCoverFormats() {
  if (existsSync(coverPng)) validateCoverFormat(coverPng, "image/png");
  if (existsSync(coverJpg)) validateCoverFormat(coverJpg, "image/jpeg");
}

function readStateWithoutMigration() {
  const statePath = resolve(base, ".pipeline-state.json");
  if (!existsSync(statePath)) return null;
  try {
    return JSON.parse(readFileSync(statePath, "utf8"));
  } catch {
    return null;
  }
}

function loadImageMap() {
  if (!existsSync(mapPath)) fail(3, "image-map.json missing after github-image-hosting");
  let raw;
  try {
    raw = JSON.parse(readFileSync(mapPath, "utf8"));
  } catch (error) {
    fail(3, `image-map.json invalid JSON: ${error.message}`);
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

function validateImageMapCoverage(draft, files, map) {
  const slotRefs = [...draft.matchAll(SLOT_EXTRACT_RE)];
  for (const match of slotRefs) {
    const file = resolveSlotImageFile(match[0], files);
    const slotNum = match[1];
    if (!file) fail(4, `SLOT_IMG_${slotNum} has no unambiguous matching image in imgs/`);
  }

  const localRefs = [...draft.matchAll(/!\[[^\]]*\]\((?:\.\/)?imgs\/([^\)\s]+)\)/g)].map(match => match[1]);
  for (const file of localRefs) {
    if (!files.includes(file)) fail(4, `draft.md references missing local image imgs/${file}`);
  }

  if (slotRefs.length === 0 && localRefs.length === 0) {
    fail(4, "draft.md has images in imgs/ but no SLOT_IMG placeholders or local imgs/ references");
  }
  const hasUrl = file => typeof map[file] === "string" && /^https?:\/\//.test(map[file]);
  for (const match of slotRefs) {
    const file = resolveSlotImageFile(match[0], files);
    if (!hasUrl(file)) fail(4, `image-map.json missing valid CDN URL for ${file}`);
  }
  for (const file of localRefs) {
    if (!hasUrl(file)) fail(4, `image-map.json missing valid CDN URL for ${file}`);
  }
  return { slot_count: slotRefs.length, local_ref_count: localRefs.length };
}

function validateLocalImageReferences(draft, files) {
  const slotRefs = [...draft.matchAll(SLOT_EXTRACT_RE)];
  for (const match of slotRefs) {
    const file = resolveSlotImageFile(match[0], files);
    if (!file) fail(4, `SLOT_IMG_${match[1]} has no unambiguous matching image in imgs/`);
  }
  const localRefs = [...draft.matchAll(/!\[[^\]]*\]\((?:\.\/)?imgs\/([^\)\s]+)\)/g)].map(match => match[1]);
  for (const file of localRefs) {
    if (!files.includes(file)) fail(4, `draft.md references missing local image imgs/${file}`);
  }
  if (slotRefs.length === 0 && localRefs.length === 0) {
    fail(4, "draft.md has images in imgs/ but no SLOT_IMG placeholders or local imgs/ references");
  }
  return { slot_count: slotRefs.length, local_ref_count: localRefs.length };
}

function findScriptDir(name) {
  const candidates = [
    resolve(repoRoot(), `.agents/skills/${name}`),
    resolve(process.env.HOME ?? "", `.claude/skills/${name}`),
  ];
  for (const directory of candidates) if (existsSync(directory)) return directory;
  return null;
}

function finalize() {
  if (!existsSync(articlePath)) fail(4, "article.md missing; cannot finalize Step 5");
  if (!existsSync(wechatSourcePath)) fail(4, "article-wechat-source.md missing; cannot finalize Step 5");
  if (!existsSync(wechatHtmlPath)) fail(4, "article-wechat.html missing; cannot finalize Step 5");

  let previewPath = null;
  try {
    previewPath = finalizeStep5Artifacts({
      slug,
      wechatSourcePath,
      wechatHtmlPath,
      generatePreview: getWechatArticleWriteConfig().wechatLayoutGeneratePreview,
      markDone: () => markStepDone(slug, 5, {
        article_md: "article.md",
        article_wechat_source_md: "article-wechat-source.md",
        article_wechat_html: "article-wechat.html",
      }),
    });
  } catch (error) {
    fail(4, error.message);
  }

  process.stdout.write(JSON.stringify({
    slug,
    step: 5,
    phase: "completed",
    article_md: "article.md",
    wechat_source: "article-wechat-source.md",
    article_wechat_html: "article-wechat.html",
    preview: previewPath ? previewPath.split("/").at(-1) : null,
  }) + "\n");
  process.exit(0);
}

if (!existsSync(draftPath)) fail(2, "draft.md missing");
try {
  assertCurrentDraftHumanized(slug, {
    draftPath,
    ...(dryRun ? { state: readStateWithoutMigration() } : {}),
  });
} catch (error) {
  fail(2, error.message);
}

// finalize-only checks the frozen draft locally, then consumes prepared
// artifacts without resolving or invoking the image-hosting skill.
if (finalizeOnly) finalize();

if (!existsSync(imgsDir)) fail(2, "imgs/ directory missing");
const rootCovers = [
  ...(existsSync(coverPng) ? ["cover.png"] : []),
  ...(existsSync(coverJpg) ? ["cover.jpg"] : []),
];
if (rootCovers.length === 0) fail(2, "cover image missing (cover.png/cover.jpg)");
if (rootCovers.length > 1) fail(2, `multiple root cover images: ${rootCovers.join(", ")}; keep exactly one`);
validateCoverFormats();

const draft = readFileSync(draftPath, "utf8");
const imgs = imageFiles(imgsDir);
if (imgs.length === 0) fail(2, "imgs/ contains no image files");
const dateStr = slug.slice(0, 10);
const assetSlug = resolveAssetSlug(draft);
const namePrefix = `${dateStr}-${assetSlug}-img`;

if (dryRun) {
  const coverage = validateLocalImageReferences(draft, imgs);
  process.stdout.write(JSON.stringify({
    slug,
    step: 5,
    dry_run: true,
    phase: "prepare",
    image_count: imgs.length,
    name_prefix: namePrefix,
    target_folder: WECHAT_IMAGE_FOLDER,
    ...coverage,
  }) + "\n");
  process.exit(0);
}

const githubDir = findScriptDir("github-image-hosting");
if (!githubDir) fail(2, "github-image-hosting skill not found");

// The supervising protocol supplies business folder and naming intent. The
// image-hosting Skill owns config, remote state, collision resolution and retry.
const uploadScript = resolve(githubDir, "scripts/upload.ts");
const uploadResult = spawnSync("bun", [
  "run", uploadScript,
  imgsDir,
  "--folder", WECHAT_IMAGE_FOLDER,
  "--name-prefix", namePrefix,
  "--output", mapPath,
], { stdio: "inherit", encoding: "utf8" });
if (uploadResult.status !== 0) fail(3, "github-image-hosting failed");

const imageMap = loadImageMap();
const coverage = validateImageMapCoverage(draft, imgs, imageMap);

// Placeholder → CDN URL → article.md
const applyScript = resolve(repoRoot(), ".agents/skills/wechat-article-write/scripts/apply-image-map.mjs");
const applyResult = spawnSync("bun", ["run", applyScript, slug], { stdio: "inherit", encoding: "utf8" });
if (applyResult.status !== 0) fail(4, "apply-image-map failed");
if (!existsSync(articlePath)) fail(4, "article.md not created");

// Generate article-wechat-source.md from draft.md (local image paths).
writeFileSync(wechatSourcePath, buildWechatSourceMarkdown(draft, imgs));

try {
  validateBlogArtifact(readFileSync(articlePath, "utf8"));
} catch (error) {
  fail(4, error.message);
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
    needs_agent_layout: true,
    ...coverage,
  }) + "\n");
  process.exit(0);
}

if (!existsSync(wechatHtmlPath)) {
  process.stdout.write(JSON.stringify({
    slug,
    step: 5,
    phase: "prepared",
    article_md: "article.md",
    wechat_source: "article-wechat-source.md",
    needs_agent_layout: true,
    ...coverage,
  }) + "\n");
  process.exit(0);
}

// Backward-compatible default: if HTML already exists, finalize it. This
// branch still performs no second image-hosting invocation.
finalize();

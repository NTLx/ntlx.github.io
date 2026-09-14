#!/usr/bin/env bun
/**
 * Step 5: 双轨产物构建。
 *
 * prepare: 校验 Agent 已生成的 image-map.json → 双轨中间产物。
 * finalize: 只读取 gzh-design 已生成的 HTML，运行项目级 structural/integrity Gate。
 */

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadState, markStepDone, markStepFailed } from "./state-lib.mjs";
import { postsRoot } from "./path-resolver.mjs";
import { readFmValue } from "./frontmatter-lib.mjs";
import { buildWechatSourceMarkdown, finalizeStep5Artifacts, validateBlogArtifact } from "./step5-lib.mjs";
import { assertMarkdownParity } from "./content-parity-lib.mjs";
import { assertMappedArtifactsUnchanged, publicationIdentityMatches, assertFinalizeInputsFresh, readArtifactManifest, sha256File, upstreamIdentityMatches, writeFinalizedArtifactManifest, writePreparedArtifactManifest } from "./artifact-integrity-lib.mjs";
import { validateVisualDraft } from "./visual-draft-lib.mjs";
import { imageMime } from "./image-asset-lib.mjs";
import { applyImageMapToMarkdown } from "./step5-lib.mjs";
import { assertNoAuthorPlaceholders, replaceKnownAuthorPlaceholders } from "./author-profile-lib.mjs";

const args = process.argv.slice(2);
let slug = null;
let dryRun = false;
let prepareOnly = false;
let finalizeOnly = false;
let hostingStatus = false;
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === "--dry-run") dryRun = true;
  else if (args[i] === "--prepare-only") prepareOnly = true;
  else if (args[i] === "--finalize-only") finalizeOnly = true;
  else if (args[i] === "--hosting-status") hostingStatus = true;
  else if (args[i].startsWith("--")) {
    process.stderr.write(`step5: unknown flag ${args[i]}\n`);
    process.exit(1);
  } else if (!slug) slug = args[i];
}

if (!slug) {
  process.stderr.write("usage: step5-build.mjs <date-slug> [--dry-run] [--prepare-only] [--finalize-only] [--hosting-status]\n");
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
const textDraftPath = resolve(base, "draft.md");
const visualDraftPath = resolve(base, "visual-draft.md");
const imgsDir = resolve(base, "imgs");
const mapPath = resolve(base, "image-map.json");
const articlePath = resolve(base, "article.md");
const wechatSourcePath = resolve(base, "article-wechat-source.md");
const wechatHtmlPath = resolve(base, "article-wechat.html");
const coverPng = resolve(base, "cover.png");
const coverJpg = resolve(base, "cover.jpg");
const WECHAT_IMAGE_FOLDER = "wechat-articles";

// State validity has one owner. Invalid checkpoints must never be rewritten as failures.
let state;
try { state = loadState(slug); } catch (error) {
  process.stderr.write(`step5: ${error.message}\n`);
  process.exit(2);
}

if (hostingStatus) {
  process.stdout.write(`${hostingStatusFor(base)}\n`);
  process.exit(0);
}

function fail(code, message) {
  process.stderr.write(`step5: FAIL - ${message}\n`);
  if (!dryRun) markStepFailed(slug, 5, message);
  process.exit(code);
}

function imageFiles(dir) {
  return readdirSync(dir).filter(file => /\.(png|jpe?g|webp|gif)$/i.test(file)).sort();
}

function validateCoverFormat(path, expectedMime) {
  const actualMime = imageMime(path);
  if (!actualMime) fail(2, `unable to detect MIME type for ${path}`);
  if (actualMime !== expectedMime) {
    fail(2, `${path.split("/").at(-1)} has MIME ${actualMime}; regenerate or normalize the cover before Step 5`);
  }
}

function validateCoverFormats() {
  if (existsSync(coverPng)) validateCoverFormat(coverPng, "image/png");
  if (existsSync(coverJpg)) validateCoverFormat(coverJpg, "image/jpeg");
}

/** Deterministic preflight for the hosting dispatch boundary. */
function hostingStatusFor(baseDir) {
  try {
    const manifest = readArtifactManifest(baseDir);
    return manifest && upstreamIdentityMatches(baseDir, manifest) ? "FROZEN" : "NEEDED";
  } catch {
    return "NEEDED";
  }
}

function loadImageMap() {
  if (!existsSync(mapPath)) fail(3, "image-map.json missing; first complete native github-image-hosting delegation");
  let raw;
  try {
    raw = JSON.parse(readFileSync(mapPath, "utf8"));
  } catch (error) {
    fail(3, `image-map.json invalid JSON: ${error.message}`);
  }
  const files = raw?.files ?? raw;
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

function validateImageMapCoverage(images, map) {
  for (const { src } of images) {
    const file = src.replace(/^(?:\.\/)?imgs\//u, "");
    if (typeof map[file] !== "string" || !/^https?:\/\//u.test(map[file])) {
      fail(4, `image-map.json missing valid CDN URL for ${file}`);
    }
  }
  return { local_ref_count: images.length };
}

function assertStep3Fresh() {
  if (!state?.step3_draft_sha256 || state.step3_draft_sha256 !== sha256File(textDraftPath)) {
    fail(2, "draft.md changed after Step 3; rerun humanizer-zh and Step 3");
  }
}

function assertPrepareNotFrozen() {
  const manifest = readArtifactManifest(base);
  if (!manifest || !upstreamIdentityMatches(base, manifest)) return;
  if (!publicationIdentityMatches(base, manifest)) {
    if ((state?.last_complete_step ?? 0) < 4 || state?.failed_step) {
      fail(2, "publication visuals changed; review the cover and complete Step 4 before Step 5 prepare (hosting stays frozen)");
    }
    try { assertMappedArtifactsUnchanged(base, manifest); } catch (error) { fail(2, error.message); }
    return;
  }
  fail(2, "Step 5 publication visuals are unchanged and already mapped; image-map and dual-track artifacts are frozen. Roll back to Step 3/4 before re-running prepare, or run --finalize-only for a WeChat-only recovery.");
}

function finalize() {
  if (!existsSync(articlePath)) fail(4, "article.md missing; cannot finalize Step 5");
  if (!existsSync(wechatSourcePath)) fail(4, "article-wechat-source.md missing; cannot finalize Step 5");
  if (!existsSync(wechatHtmlPath)) fail(4, "article-wechat.html missing; cannot finalize Step 5");
  try {
    assertFinalizeInputsFresh(base);
    const imageMap = loadImageMap();
    const article = readFileSync(articlePath, "utf8");
    const wechatSource = readFileSync(wechatSourcePath, "utf8");
    validateBlogArtifact(article);
    assertMarkdownParity(article, wechatSource, imageMap);
  } catch (error) {
    fail(4, error.message);
  }

  try {
    finalizeStep5Artifacts({
      wechatSourcePath,
      wechatHtmlPath,
      markDone: () => {
        writeFinalizedArtifactManifest(base);
        markStepDone(slug, 5, {
          article_md: "article.md",
          article_wechat_source_md: "article-wechat-source.md",
          article_wechat_html: "article-wechat.html",
        });
      },
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
  }) + "\n");
  process.exit(0);
}

if (!existsSync(textDraftPath)) fail(2, "draft.md missing");
try {
  assertStep3Fresh();
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

if (!existsSync(visualDraftPath)) fail(2, "visual-draft.md missing; complete Step 4");
const textDraft = readFileSync(textDraftPath, "utf8");
const draft = readFileSync(visualDraftPath, "utf8");
const imgs = imageFiles(imgsDir);
let images;
try {
  images = await validateVisualDraft(textDraft, draft, base);
} catch (error) {
  fail(4, error.message);
}
const dateStr = slug.slice(0, 10);
const assetSlug = resolveAssetSlug(draft);
const namePrefix = `${dateStr}-${assetSlug}-img`;

if (dryRun) {
  const coverage = { local_ref_count: images.length };
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

assertPrepareNotFrozen();
const imageMap = loadImageMap();
const coverage = validateImageMapCoverage(images, imageMap);

// Local Markdown images → CDN URLs → article.md
let articleMarkdown;
try {
  articleMarkdown = applyImageMapToMarkdown(draft, imgsDir, imageMap);
  writeFileSync(articlePath, replaceKnownAuthorPlaceholders(articleMarkdown));
} catch (error) {
  fail(4, `image-map application failed: ${error.message}`);
}
if (!existsSync(articlePath)) fail(4, "article.md not created");

// Generate article-wechat-source.md from visual-draft.md (local image paths).
writeFileSync(wechatSourcePath, buildWechatSourceMarkdown(draft, imgs));

try {
  validateBlogArtifact(readFileSync(articlePath, "utf8"));
  const wechatSource = readFileSync(wechatSourcePath, "utf8");
  const authorErrors = assertNoAuthorPlaceholders(wechatSource);
  if (authorErrors.length > 0) throw new Error(authorErrors.join("; "));
} catch (error) {
  fail(4, error.message);
}
if (!existsSync(wechatSourcePath) || readFileSync(wechatSourcePath, "utf8").length === 0) {
  fail(4, "article-wechat-source.md empty");
}
try {
  assertMarkdownParity(readFileSync(articlePath, "utf8"), readFileSync(wechatSourcePath, "utf8"), imageMap);
  writePreparedArtifactManifest(base);
} catch (error) {
  fail(4, error.message);
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

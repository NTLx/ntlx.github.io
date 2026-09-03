#!/usr/bin/env bun
/**
 * 微信草稿发布边界（Step 6.2）。
 *
 * This script owns only repository-specific preflight and state finalization.
 * The actual draft creation is a native delegation to baoyu-post-to-wechat.
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { markStepFailed, markWechatDone, getPublishState } from "./state-lib.mjs";
import { postsRoot } from "./path-resolver.mjs";
import { getWechatAuthorProfile } from "./config-lib.mjs";
import { readFmValue } from "./frontmatter-lib.mjs";
import { assertFinalizedArtifactFreshness } from "./artifact-integrity-lib.mjs";
import { assertCanonicalSignature, assertNoAuthorPlaceholders } from "./author-profile-lib.mjs";

function failArgs(message) {
  process.stderr.write(`publish-wechat: ${message}\n`);
  process.stderr.write("usage: publish-wechat.mjs <date-slug> --prepare-only|--finalize-only [--media-id <id>]\n");
  process.exit(1);
}

function printHelp() {
  process.stdout.write(`publish-wechat.mjs — 微信草稿发布边界 (Step 6.2)

用法:
  bun run publish-wechat.mjs <date-slug> --prepare-only
  bun run publish-wechat.mjs <date-slug> --finalize-only [--media-id <id>]

prepare-only 运行项目级确定性 preflight，并输出传给 baoyu-post-to-wechat 的 JSON capsule。
finalize-only 在子 Skill 明确成功后记录 state v2；不访问网络或调用第三方脚本。
`);
}

function parseArgs(argv) {
  const options = { slug: null, prepareOnly: false, finalizeOnly: false, mediaId: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help") {
      printHelp();
      process.exit(0);
    }
    if (arg === "--prepare-only") options.prepareOnly = true;
    else if (arg === "--finalize-only") options.finalizeOnly = true;
    else if (arg === "--media-id") {
      options.mediaId = argv[++i];
      if (!options.mediaId || options.mediaId.startsWith("--")) failArgs("--media-id requires a value");
    } else if (arg.startsWith("--")) failArgs(`unknown flag ${arg}`);
    else if (!options.slug) options.slug = arg;
    else failArgs(`unexpected positional argument ${arg}`);
  }
  if (!options.slug) failArgs("date-slug is required");
  if (options.prepareOnly === options.finalizeOnly) failArgs("choose exactly one of --prepare-only or --finalize-only");
  if (options.mediaId && !options.finalizeOnly) failArgs("--media-id is only valid with --finalize-only");
  return options;
}

function buildWechatSourceUrl(sourceUrl) {
  let url;
  try {
    url = new URL(sourceUrl);
  } catch {
    throw new Error(`frontmatter.sourceUrl 不合法: ${sourceUrl}`);
  }
  if (!/^https?:$/u.test(url.protocol)) throw new Error(`frontmatter.sourceUrl 必须使用 http(s): ${sourceUrl}`);
  url.searchParams.set("utm_source", "wechat");
  url.searchParams.set("utm_medium", "social");
  url.searchParams.set("utm_campaign", "article_push");
  return url.toString();
}

function failPublish(slug, message, code = 5) {
  process.stderr.write(`publish-wechat: ${message}\n`);
  markStepFailed(slug, 6.2, message);
  process.exit(code);
}

function assertHtmlIntegrity(html, authorProfile) {
  const authorErrors = assertNoAuthorPlaceholders(html);
  if (authorErrors.length > 0) throw new Error(authorErrors.join("; "));
  const signatureErrors = assertCanonicalSignature(html, authorProfile);
  if (signatureErrors.length > 0) throw new Error(signatureErrors.join("; "));

  for (const match of html.matchAll(/<[^>]*>/gu)) {
    if (/[“”‘’]/u.test(match[0])) {
      throw new Error("HTML attributes contain Unicode curly quotes; regenerate HTML with ASCII attribute quotes");
    }
  }

  const imageTags = [...html.matchAll(/<img\b[^>]*>/giu)];
  const images = [...html.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/giu)];
  if (images.length !== imageTags.length) throw new Error("every <img> tag must have a parseable ASCII src attribute");
  for (const [, src] of images) {
    if (!src.trim() || !/^[\x00-\x7F]+$/u.test(src)) throw new Error("every <img> src must be a non-empty ASCII URL or path");
  }
}

function loadContext(slug) {
  const base = resolve(postsRoot(), slug);
  const articlePath = resolve(base, "article.md");
  const htmlPath = resolve(base, "article-wechat.html");
  if (!existsSync(articlePath)) throw new Error(`${articlePath} 缺失`);
  if (!existsSync(htmlPath)) throw new Error(`${htmlPath} 缺失（先完成 Step 5 和 gzh-design 委托）`);

  const article = readFileSync(articlePath, "utf8");
  const html = readFileSync(htmlPath, "utf8");
  if (!article.trim()) throw new Error("article.md 为空");
  if (!html.trim()) throw new Error("article-wechat.html 为空");

  const rootCovers = ["cover.png", "cover.jpg"].filter(name => existsSync(resolve(base, name)));
  if (rootCovers.length === 0) throw new Error("cover.png/cover.jpg 都不存在");
  if (rootCovers.length > 1) throw new Error(`multiple root cover images: ${rootCovers.join(", ")}; keep exactly one`);

  const authorProfile = getWechatAuthorProfile();
  const articleAuthor = readFmValue(article, "author");
  if (articleAuthor && articleAuthor.trim() !== authorProfile.name) {
    throw new Error(`frontmatter.author must equal canonical author ${authorProfile.name}`);
  }
  const title = readFmValue(article, "title")?.trim();
  const summary = readFmValue(article, "summary")?.trim();
  const sourceUrl = readFmValue(article, "sourceUrl")?.trim();
  if (!title || !sourceUrl) throw new Error("frontmatter.title 或 sourceUrl 缺失");
  if (!summary) throw new Error("frontmatter.summary 缺失（微信草稿需要摘要）");
  const wechatSourceUrl = buildWechatSourceUrl(sourceUrl);
  assertHtmlIntegrity(html, authorProfile);

  if (getPublishState(slug).blog === "pending") {
    throw new Error("blog publish is still pending; complete or explicitly block the blog track before WeChat draft delegation");
  }
  assertFinalizedArtifactFreshness(base);
  return {
    base,
    htmlPath,
    coverPath: resolve(base, rootCovers[0]),
    title,
    summary,
    author: authorProfile.name,
    canonicalSourceUrl: sourceUrl,
    wechatSourceUrl,
  };
}

const options = parseArgs(process.argv.slice(2));
let context;
try {
  context = loadContext(options.slug);
} catch (error) {
  const code = /缺失|为空|frontmatter|cover|pending/u.test(error.message) ? 2 : 5;
  failPublish(options.slug, error.message, code);
}

if (options.prepareOnly) {
  process.stdout.write(JSON.stringify({
    slug: options.slug,
    input: `posts/${options.slug}/article-wechat.html`,
    cover: `posts/${options.slug}/${context.coverPath.endsWith("cover.jpg") ? "cover.jpg" : "cover.png"}`,
    title: context.title,
    summary: context.summary,
    author: context.author,
    source_url: context.wechatSourceUrl,
    input_type: "html",
  }) + "\n");
  process.exit(0);
}

const wechatSourceUrl = context.wechatSourceUrl;
markWechatDone(options.slug, {
  sourceUrl: context.canonicalSourceUrl,
  wechatSourceUrl,
  publish_result: {
    wechat: { draft_created: true, ...(options.mediaId ? { media_id: options.mediaId } : {}) },
  },
});
process.stdout.write(JSON.stringify({
  slug: options.slug,
  phase: "finalized",
  source_url: wechatSourceUrl,
  ...(options.mediaId ? { media_id: options.mediaId } : {}),
}) + "\n");

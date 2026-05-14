#!/usr/bin/env bun
/**
 * 将 draft.md 中的语义占位符替换为 CDN URL（产出 article.md）和本地路径（产出 article-local.md）。
 * 同时支持把已生成的 article.html 中的本地路径回写为 CDN URL。
 *
 * 用法:
 *   bun run apply-image-map.mjs <date-slug>
 *     -> 读 posts/<date-slug>/draft.md  + image-map.json
 *     -> 写 posts/<date-slug>/article.md (CDN) 与 article-local.md (本地)
 *
 *   bun run apply-image-map.mjs --html-rewrite <html-path> <image-map.json>
 *     -> 把 html 内 imgs/xxx.png 替换为 CDN URL
 *
 * image-map.json 约定:
 *   { "00-infographic-core-summary.png": "https://cdn.jsdelivr.net/.../00-infographic-core-summary.png",
 *     "01-scene.png": "https://cdn.jsdelivr.net/.../01-scene.png", ... }
 *   或 { "files": { ...同上 } }
 *
 * 退出码: 0 成功；1 参数错误；2 输入缺失；3 占位符未全部消解
 */

import { existsSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

function postsRoot() {
  return resolve(process.env.PIPELINE_POSTS_ROOT ?? "posts");
}

function loadMap(p) {
  if (!existsSync(p)) {
    process.stderr.write(`apply-image-map.mjs: image-map.json not found: ${p}\n`);
    process.exit(2);
  }
  const raw = JSON.parse(readFileSync(p, "utf8"));
  return raw.files ?? raw;
}

function listImgs(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => /\.(png|jpe?g|webp|gif)$/i.test(f));
}

/**
 * 占位符语法约定：`<!-- SLOT_IMG_NN_DESC -->`，NN 必须 2 位数字。
 * 通过 NN 在 imgs/ 目录里找文件名前缀匹配 `^NN-` 的图片，再去 image-map.json 拿 CDN URL。
 */
function buildResolver(map, imgsDir) {
  const files = listImgs(imgsDir);
  return (placeholder) => {
    const m = placeholder.match(/SLOT_IMG_(\d{2})(?:_([A-Za-z0-9_-]+))?/);
    if (!m) return null;
    const nn = m[1];
    const file = files.find((f) => f.startsWith(`${nn}-`));
    if (!file) return null;
    const cdn = map[file];
    return { file, cdn };
  };
}

function replaceWithCdn(md, resolver) {
  return md.replace(/<!--\s*(SLOT_IMG_\d{2}[^>]*?)\s*-->/g, (_full, raw) => {
    const r = resolver(raw);
    if (!r || !r.cdn) return _full; // 留着触发后续 grep 校验
    return `![](${r.cdn})`;
  });
}

function replaceWithLocal(md, resolver) {
  return md.replace(/<!--\s*(SLOT_IMG_\d{2}[^>]*?)\s*-->/g, (_full, raw) => {
    const r = resolver(raw);
    if (!r) return _full;
    return `![](imgs/${r.file})`;
  });
}

function htmlRewrite(htmlPath, mapPath) {
  if (!existsSync(htmlPath)) {
    process.stderr.write(`apply-image-map.mjs: html not found: ${htmlPath}\n`);
    process.exit(2);
  }
  const map = loadMap(mapPath);
  let html = readFileSync(htmlPath, "utf8");
  for (const [file, cdn] of Object.entries(map)) {
    const re = new RegExp(`(?:\\./)?imgs/${file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "g");
    html = html.replace(re, cdn);
  }
  writeFileSync(htmlPath, html);
}

const args = process.argv.slice(2);

if (args[0] === "--html-rewrite") {
  const [, htmlPath, mapPath] = args;
  if (!htmlPath || !mapPath) {
    process.stderr.write("usage: apply-image-map.mjs --html-rewrite <html-path> <image-map.json>\n");
    process.exit(1);
  }
  htmlRewrite(htmlPath, mapPath);
  process.exit(0);
}

const slug = args[0];
if (!slug) {
  process.stderr.write("usage: apply-image-map.mjs <date-slug>\n");
  process.exit(1);
}

const baseDir = resolve(postsRoot(), slug);
const draftPath = resolve(baseDir, "draft.md");
const mapPath = resolve(baseDir, "image-map.json");
const imgsDir = resolve(baseDir, "imgs");

if (!existsSync(draftPath)) {
  process.stderr.write(`apply-image-map.mjs: draft.md missing: ${draftPath}\n`);
  process.exit(2);
}

const map = loadMap(mapPath);
const draft = readFileSync(draftPath, "utf8");
const resolver = buildResolver(map, imgsDir);

const cdnMd = replaceWithCdn(draft, resolver);
const localMd = replaceWithLocal(draft, resolver);

writeFileSync(resolve(baseDir, "article.md"), cdnMd);
writeFileSync(resolve(baseDir, "article-local.md"), localMd);

const stillHasSlot = /<!--\s*SLOT_IMG_/.test(cdnMd);
if (stillHasSlot) {
  process.stderr.write("apply-image-map.mjs: 仍有未消解的占位符，请检查 image-map.json 或 imgs/\n");
  const leftovers = [...cdnMd.matchAll(/<!--\s*(SLOT_IMG_\d{2}[^>]*?)\s*-->/g)].map((m) => m[1]);
  process.stderr.write("  unresolved: " + leftovers.join(", ") + "\n");
  process.exit(3);
}

process.stdout.write(JSON.stringify({
  slug,
  article_md: "article.md",
  article_local_md: "article-local.md",
  image_count: Object.keys(map).length,
}) + "\n");

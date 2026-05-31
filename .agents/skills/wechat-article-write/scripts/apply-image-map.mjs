#!/usr/bin/env bun
/**
 * 将 draft.md 中的语义占位符替换为 CDN URL，产出 article.md。
 * step5-build.mjs 在内存中自行构建本地路径版本（写入 _temp_local.md），
 * 因此本脚本不再生成 article-local.md。
 *
 * 替换覆盖两类引用（CDN 输出端）：
 *   1. 注释占位符: `<!-- SLOT_IMG_NN_DESC -->`
 *   2. 已经被插图 agent 提前替换为 markdown 图片语法: `![alt](imgs/NN-xxx.{ext})`
 *      —— 防止"占位符已消失但本地路径未替换"的中间态遗漏（参考 复盘文档 P0-3）。
 *
 * 用法:
 *   bun run apply-image-map.mjs <date-slug>
 *     -> 读 posts/<date-slug>/draft.md  + image-map.json
 *     -> 写 posts/<date-slug>/article.md (CDN)
 *
 *   bun run apply-image-map.mjs --html-rewrite <html-path> <image-map.json>
 *     -> 把 html 内 imgs/xxx.png 替换为 CDN URL
 *
 * image-map.json 约定:
 *   { "00-infographic-core-summary.png": "https://cdn.jsdelivr.net/.../00-infographic-core-summary.png",
 *     "01-scene.png": "https://cdn.jsdelivr.net/.../01-scene.png", ... }
 *   或 { "files": { ...同上 } }
 *   key 必须是 imgs/ 下的文件名（含正确扩展名，如 .jpg/.png/.webp），不要带 imgs/ 前缀，
 *   也不要重复扩展名（不要写成 01-scene.jpg.jpg —— 这是 github-image-hosting --name 的已知坑）。
 *
 * 退出码: 0 成功；1 参数错误；2 输入缺失；3 占位符或本地路径未全部消解
 */

import { existsSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { postsRoot } from "./path-resolver.mjs";
import { SLOT_EXTRACT_RE, SLOT_RESOLVE_RE, SLOT_RESIDUAL_RE, replaceSlotPlaceholders } from "./validation-lib.mjs";

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

function replaceWithCdn(md, resolver, map) {
  // 1) 替换注释占位符 <!-- SLOT_IMG_NN_xxx -->
  let out = replaceSlotPlaceholders(md, (match, slot, desc) => {
    const r = resolver(match);
    if (!r || !r.cdn) return match; // 留着触发后续 grep 校验
    return `![](${r.cdn})`;
  });
  // 2) 兼容：插图 agent 已经把占位符提前替换为 markdown 图片语法
  //    形如 `![alt](imgs/01-xxx.jpg)` / `![](./imgs/00-xxx.png)`，本步把本地路径换成 CDN URL。
  //    若 image-map.json 没有对应 key 则保留原样，由 cdn 阶段的 grep 出口校验拦截。
  out = out.replace(/!\[([^\]]*)\]\((?:\.\/)?imgs\/([^)\s]+)\)/g, (_full, alt, file) => {
    const cdn = map[file];
    if (!cdn) return _full;
    return `![${alt}](${cdn})`;
  });
  return out;
}

function replaceWithLocal(md, resolver) {
  // article-local.md 用于 CDN 不可达时的降级渲染，保留本地路径即可
  return replaceSlotPlaceholders(md, (match, slot, desc) => {
    const r = resolver(match);
    if (!r) return match;
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

const cdnMd = replaceWithCdn(draft, resolver, map);

writeFileSync(resolve(baseDir, "article.md"), cdnMd);

const stillHasSlot = SLOT_RESIDUAL_RE.test(cdnMd);
const stillHasLocal = /!\[[^\]]*\]\((?:\.\/)?imgs\//.test(cdnMd);
if (stillHasSlot || stillHasLocal) {
  process.stderr.write("apply-image-map.mjs: 仍有未消解的占位符或本地路径，请检查 image-map.json 或 imgs/\n");
  if (stillHasSlot) {
    const leftovers = [...cdnMd.matchAll(SLOT_EXTRACT_RE)].map((m) => m[0]);
    process.stderr.write("  unresolved SLOT placeholders: " + leftovers.join(", ") + "\n");
  }
  if (stillHasLocal) {
    const localLeft = [...cdnMd.matchAll(/!\[[^\]]*\]\((?:\.\/)?imgs\/([^)\s]+)\)/g)].map((m) => m[1]);
    process.stderr.write("  unresolved local image refs: " + localLeft.join(", ") + "\n");
  }
  process.exit(3);
}

process.stdout.write(JSON.stringify({
  slug,
  article_md: "article.md",
  image_count: Object.keys(map).length,
}) + "\n");

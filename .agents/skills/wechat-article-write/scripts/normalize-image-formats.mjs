#!/usr/bin/env bun
/**
 * normalize-image-formats.mjs — MIME 检测 + 扩展名修正 + 引用更新
 *
 * 问题：Gemini 等图片生成后端返回 JPEG 内容但保存为 .png 扩展名，
 *       导致后续流程（CDN 上传、微信 HTML）可能因格式不匹配出错。
 *
 * 行为：
 *   1. 扫描 imgs/ 目录下所有图片文件
 *   2. 用 `file -b --mime-type` 检测实际格式
 *   3. 如果 JPEG 保存为 .png → 原子重命名为 .jpg
 *   4. 更新 draft.md 中所有引用（SLOT_IMG 和 ![]() 两种形式）
 *   5. 如果传入的是文件路径（如 cover.png），也检测并修正
 *
 * 幂等：重复运行结果相同，已正确的文件不会动。
 *
 * 用法:
 *   bun run normalize-image-formats.mjs <postDir> [--dry-run]
 *
 * 退出码: 0 成功（含无需修正）；1 参数错误；2 文件操作失败
 */

import { existsSync, readdirSync, readFileSync, writeFileSync, renameSync } from "node:fs";
import { resolve, basename, extname } from "node:path";
import { spawnSync } from "node:child_process";

const IMG_EXTS = /\.(png|jpe?g|webp|gif)$/i;

function detectMime(filePath) {
  const r = spawnSync("file", ["-b", "--mime-type", filePath], { encoding: "utf8" });
  if (r.status !== 0) {
    // macOS 不支持 --mime-type 时 fallback
    const r2 = spawnSync("file", ["-b", filePath], { encoding: "utf8" });
    if (r2.status !== 0) return null;
    const out = r2.stdout.trim().toLowerCase();
    if (out.includes("jpeg") || out.includes("jpg")) return "image/jpeg";
    if (out.includes("png")) return "image/png";
    if (out.includes("webp")) return "image/webp";
    if (out.includes("gif")) return "image/gif";
    return null;
  }
  return r.stdout.trim();
}

function extForMime(mime) {
  if (!mime) return null;
  if (mime === "image/jpeg") return ".jpg";
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  if (mime === "image/gif") return ".gif";
  return null;
}

/**
 * 修正单个文件：如果 MIME 与扩展名不匹配，重命名并返回变更信息。
 * 返回 null 表示无需修正，否则返回 { oldName, newName }。
 * dryRun 模式下只报告不实际重命名。
 */
function fixFile(dir, filename, dryRun) {
  const filePath = resolve(dir, filename);
  const mime = detectMime(filePath);
  if (!mime) return null;

  const correctExt = extForMime(mime);
  if (!correctExt) return null;

  const currentExt = extname(filename).toLowerCase();
  if (currentExt === correctExt) return null;

  const newName = basename(filename, currentExt) + correctExt;
  const newPath = resolve(dir, newName);

  if (existsSync(newPath)) {
    process.stderr.write(`normalize: target already exists, skipping ${filename} -> ${newName}\n`);
    return null;
  }

  if (!dryRun) renameSync(filePath, newPath);
  return { oldName: filename, newName };
}

/**
 * 更新 draft.md 中图片引用：oldName → newName
 * 同时处理 SLOT_IMG 注释和 ![](imgs/...) 两种形式
 * dryRun 模式下只报告不实际写入。
 */
function updateDraftRefs(draftPath, renames, dryRun) {
  if (!existsSync(draftPath) || renames.length === 0) return;

  let content = readFileSync(draftPath, "utf8");
  let changed = false;

  for (const { oldName, newName } of renames) {
    // ![](imgs/oldName) 或 ![](./imgs/oldName)
    const imgRe = new RegExp(
      `(\\!?\\[[^\\]]*\\]\\((?:\\.\\/)?imgs\\/)${oldName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\)`,
      "g",
    );
    if (imgRe.test(content)) {
      content = content.replace(imgRe, `$1${newName})`);
      changed = true;
    }
  }

  if (changed && !dryRun) {
    writeFileSync(draftPath, content);
  }
}

// ─── CLI ───

const args = process.argv.slice(2);
let dirArg = null, dryRun = false;
for (const a of args) {
  if (a === "--dry-run") dryRun = true;
  else if (!dirArg) dirArg = a;
}
if (!dirArg) {
  process.stderr.write("usage: normalize-image-formats.mjs <postDir> [--dry-run]\n");
  process.exit(1);
}

const postDir = resolve(dirArg);
if (!existsSync(postDir)) {
  process.stderr.write(`normalize: directory not found: ${postDir}\n`);
  process.exit(2);
}

const draftPath = resolve(postDir, "draft.md");
const imgsDir = resolve(postDir, "imgs");
const renames = [];

// 修正 imgs/ 目录下的图片
if (existsSync(imgsDir)) {
  const files = readdirSync(imgsDir).filter((f) => IMG_EXTS.test(f));
  for (const f of files) {
    const result = fixFile(imgsDir, f, dryRun);
    if (result) {
      renames.push(result);
      process.stdout.write(`${dryRun ? "[dry-run] " : ""}renamed: ${result.oldName} -> ${result.newName}\n`);
    }
  }
}

// 修正 cover 图片（在 postDir 根目录）
for (const coverName of ["cover.png", "cover.jpg"]) {
  const coverPath = resolve(postDir, coverName);
  if (!existsSync(coverPath)) continue;
  const result = fixFile(postDir, coverName, dryRun);
  if (result) {
    renames.push(result);
    process.stdout.write(`${dryRun ? "[dry-run] " : ""}renamed cover: ${result.oldName} -> ${result.newName}\n`);
  }
}

// 更新 draft.md 引用
updateDraftRefs(draftPath, renames, dryRun);

// 更新 frontmatter 中的 coverImage
if (renames.some((r) => r.oldName.startsWith("cover."))) {
  if (existsSync(draftPath) && !dryRun) {
    let content = readFileSync(draftPath, "utf8");
    content = content.replace(/coverImage:\s*cover\.png/, "coverImage: cover.jpg");
    writeFileSync(draftPath, content);
  }
}

const summary = renames.length === 0
  ? "all image formats correct"
  : `${dryRun ? "[dry-run] " : ""}fixed ${renames.length} file(s)`;
process.stdout.write(`normalize: ${summary}\n`);
process.exit(0);

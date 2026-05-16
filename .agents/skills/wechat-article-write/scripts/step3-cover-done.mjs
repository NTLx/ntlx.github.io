#!/usr/bin/env bun
/**
 * Step 3: 封面图生成完成后的状态写入
 *
 * 用法:
 *   bun run step3-cover-done.mjs <date-slug> [cover-file]
 *
 * 在 Agent 调用 baoyu-cover-image 完成后执行。
 * 先调用 normalize-image-formats.mjs 修正所有图片扩展名（含 cover），
 * 再验证封面文件存在并写状态。
 */

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { writeStep, writeRunning } from "./state-lib.mjs";
import { postsRoot } from "./path-resolver.mjs";

const SCRIPT_DIR = resolve(new URL(import.meta.url).pathname, "..");

const args = process.argv.slice(2);
const slug = args[0];
if (!slug) { process.stderr.write("usage: step3-cover-done.mjs <date-slug> [cover-file]\n"); process.exit(1); }

writeRunning(slug, "3");

const base = resolve(postsRoot(), slug);

// 格式归一化：修正所有图片（含 cover）的 MIME/扩展名不匹配
const norm = spawnSync("bun", ["run", resolve(SCRIPT_DIR, "normalize-image-formats.mjs"), base], { stdio: "inherit", encoding: "utf8" });
if (norm.status !== 0) {
  process.stderr.write("step3: normalize-image-formats failed (non-blocking, continuing)\n");
}

// 检测封面文件（normalize 可能已将 cover.png 改为 cover.jpg）
let coverFile = args[1] ?? null;
if (!coverFile) {
  if (existsSync(resolve(base, "cover.jpg"))) coverFile = "cover.jpg";
  else if (existsSync(resolve(base, "cover.png"))) coverFile = "cover.png";
}
if (!coverFile) { process.stderr.write("step3: cover.png/cover.jpg not found\n"); process.exit(2); }

writeStep(slug, "3", "done", { cover: coverFile });
process.stdout.write(JSON.stringify({ slug, step: 3, cover: coverFile }) + "\n");

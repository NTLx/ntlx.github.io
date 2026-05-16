#!/usr/bin/env bun
/**
 * Step 4: 插图生成完成后的状态写入
 *
 * 用法:
 *   bun run step4-illustrations-done.mjs <date-slug> [--img-count N] [--refs-ok]
 *
 * 在 Agent 调用 baoyu-article-illustrator 完成后执行。
 *
 * 执行顺序：
 *   1. normalize-image-formats — 修正 MIME/扩展名不匹配
 *   2. normalize-refs — 将 ![](imgs/NN-xxx) 还原为 SLOT_IMG 占位符
 *   3. 统计验证 + 写状态
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { writeStep, writeRunning } from "./state-lib.mjs";
import { postsRoot } from "./path-resolver.mjs";

const SCRIPT_DIR = resolve(new URL(import.meta.url).pathname, "..");

const args = process.argv.slice(2);
const slug = args[0];
if (!slug) { process.stderr.write("usage: step4-illustrations-done.mjs <date-slug> [--img-count N] [--refs-ok]\n"); process.exit(1); }

writeRunning(slug, "4");

const base = resolve(postsRoot(), slug);

// Step 4a: 格式归一化
const norm1 = spawnSync("bun", ["run", resolve(SCRIPT_DIR, "normalize-image-formats.mjs"), base], { stdio: "inherit", encoding: "utf8" });
if (norm1.status !== 0) {
  process.stderr.write("step4: normalize-image-formats failed (non-blocking, continuing)\n");
}

// Step 4b: 引用归一化（![](imgs/NN-xxx) → SLOT_IMG_NN_xxx）
const norm2 = spawnSync("bun", ["run", resolve(SCRIPT_DIR, "step4-normalize-refs.mjs"), base], { stdio: "inherit", encoding: "utf8" });
if (norm2.status !== 0) {
  process.stderr.write("step4: normalize-refs failed (non-blocking, continuing)\n");
}

// 自动统计 imgs/ 目录中的插图数（排除 00 信息图）
const imgsDir = resolve(base, "imgs");
let imgCount = 0;
if (existsSync(imgsDir)) {
  imgCount = readdirSync(imgsDir).filter((f) => !f.startsWith("00-") && /\.(png|jpe?g|webp)$/i.test(f)).length;
}

// 检查 draft.md 中的引用数（SLOT_IMG 占位符 + ![](imgs/NN-) 两种形式）
const draftPath = resolve(base, "draft.md");
let refCount = 0;
if (existsSync(draftPath)) {
  const draft = readFileSync(draftPath, "utf8");
  const slotMatches = draft.match(/<!--\s*SLOT_IMG_\d{2}/g);
  const imgMatches = draft.match(/!\[[^\]]*\]\(imgs\/\d{2}-/g);
  refCount = (slotMatches ? slotMatches.length : 0) + (imgMatches ? imgMatches.length : 0);
}

const refsOk = imgCount === refCount;
writeStep(slug, "4", "done", { images: imgCount, refs_ok: refsOk, ref_count: refCount });
process.stdout.write(JSON.stringify({ slug, step: 4, images: imgCount, refs_ok: refsOk }) + "\n");
process.exit(0);
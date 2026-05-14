#!/usr/bin/env bun
/**
 * Step 4: 插图生成完成后的状态写入
 *
 * 用法:
 *   bun run step4-illustrations-done.mjs <date-slug> [--img-count N] [--refs-ok]
 *
 * 在 Agent 调用 baoyu-article-illustrator 完成后执行。
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { writeStep } from "./state-lib.mjs";

function postsRoot() { return resolve(process.env.PIPELINE_POSTS_ROOT ?? "posts"); }

const args = process.argv.slice(2);
const slug = args[0];
if (!slug) { process.stderr.write("usage: step4-illustrations-done.mjs <date-slug> [--img-count N] [--refs-ok]\n"); process.exit(1); }

const base = resolve(postsRoot(), slug);

// 自动统计 imgs/ 目录中的插图数（排除 00 信息图）
const imgsDir = resolve(base, "imgs");
let imgCount = 0;
if (existsSync(imgsDir)) {
  imgCount = readdirSync(imgsDir).filter((f) => !f.startsWith("00-") && /\.(png|jpe?g|webp)$/i.test(f)).length;
}

// 检查 draft.md 中的引用数
const draftPath = resolve(base, "draft.md");
let refCount = 0;
if (existsSync(draftPath)) {
  const draft = readFileSync(draftPath, "utf8");
  const matches = draft.match(/!\[([^\]]*)\]\(imgs\/[0-9][0-9]-/g);
  refCount = matches ? matches.length : 0;
}

const refsOk = imgCount === refCount;
writeStep(slug, "4", "done", { images: imgCount, refs_ok: refsOk, ref_count: refCount });
process.stdout.write(JSON.stringify({ slug, step: 4, images: imgCount, refs_ok: refsOk }) + "\n");
process.exit(0);

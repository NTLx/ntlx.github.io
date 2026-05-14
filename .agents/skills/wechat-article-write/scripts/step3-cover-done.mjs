#!/usr/bin/env bun
/**
 * Step 3: 封面图生成完成后的状态写入
 *
 * 用法:
 *   bun run step3-cover-done.mjs <date-slug> [cover-file]
 *
 * 在 Agent 调用 baoyu-cover-image 完成后执行。自动检测封面格式并修正扩展名。
 */

import { existsSync, readFileSync, writeFileSync, renameSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { writeStep } from "./state-lib.mjs";

function postsRoot() { return resolve(process.env.PIPELINE_POSTS_ROOT ?? "posts"); }

const args = process.argv.slice(2);
const slug = args[0];
if (!slug) { process.stderr.write("usage: step3-cover-done.mjs <date-slug> [cover-file]\n"); process.exit(1); }

const base = resolve(postsRoot(), slug);

// 检测格式
let coverFile = args[1] ?? null;
if (!coverFile) {
  if (existsSync(resolve(base, "cover.png"))) coverFile = "cover.png";
  else if (existsSync(resolve(base, "cover.jpg"))) coverFile = "cover.jpg";
}
if (!coverFile) { process.stderr.write("step3: cover.png/cover.jpg not found\n"); process.exit(2); }

// 格式检测修正
const coverPath = resolve(base, coverFile);
const ft = spawnSync("file", ["-b", coverPath], { encoding: "utf8" });
let finalName = coverFile;
if (ft.stdout.includes("JPEG") && coverFile.endsWith(".png")) {
  const newName = coverFile.replace(/\.png$/, ".jpg");
  const newPath = resolve(base, newName);
  // 重命名
  renameSync(coverPath, newPath);
  finalName = newName;
  // 更新 draft.md frontmatter
  const draftPath = resolve(base, "draft.md");
  if (existsSync(draftPath)) {
    let d = readFileSync(draftPath, "utf8");
    d = d.replace(/coverImage:\s*cover\.png/, "coverImage: cover.jpg");
    writeFileSync(draftPath, d);
  }
}

writeStep(slug, "3", "done", { cover: finalName });
process.stdout.write(JSON.stringify({ slug, step: 3, cover: finalName }) + "\n");

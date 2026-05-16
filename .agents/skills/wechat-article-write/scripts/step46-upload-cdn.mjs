#!/usr/bin/env bun
/**
 * Step 4.6: 图床上传（前置 CDN）
 *
 * 用法:
 *   bun run step46-upload-cdn.mjs <date-slug> [--repo NTLx/Pic@master:wechat-articles] [--date YYYY-MM-DD]
 *
 * 行为:
 *   1. 把 imgs/ 下所有图片上传到 GitHub 图床
 *   2. 产出 image-map.json
 *   3. 写状态: step 4.6 done
 *
 * 退出码: 0 成功；1 参数错误；2 imgs/ 为空或上传失败
 */

import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { writeStep, writeRunning } from "./state-lib.mjs";
import { postsRoot, findGithubScriptDir } from "./path-resolver.mjs";

const SCRIPT_DIR = resolve(new URL(import.meta.url).pathname, "..");

const args = process.argv.slice(2);
let slug = null, repo = "NTLx/Pic@master:wechat-articles", datePrefix = "";
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--repo" && args[i + 1]) { repo = args[++i]; }
  else if (args[i] === "--date" && args[i + 1]) { datePrefix = args[++i]; }
  else if (!slug) { slug = args[i]; }
}
if (!slug) { process.stderr.write("usage: step46-upload-cdn.mjs <date-slug> [--repo REPO] [--date YYYY-MM-DD]\n"); process.exit(1); }

writeRunning(slug, "4.6");

if (!datePrefix) {
  const m = slug.match(/^(\d{4}-\d{2}-\d{2})/);
  datePrefix = m ? m[1] : "";
}

const base = resolve(postsRoot(), slug);
const imgsDir = resolve(base, "imgs");
if (!existsSync(imgsDir)) { process.stderr.write("step46: imgs/ directory missing\n"); process.exit(2); }

// 防御性格式修正：上传前确保扩展名与 MIME 一致
const norm = spawnSync("bun", ["run", resolve(SCRIPT_DIR, "normalize-image-formats.mjs"), base], { stdio: "inherit", encoding: "utf8" });
if (norm.status !== 0) {
  process.stderr.write("step46: normalize-image-formats failed (non-blocking, continuing)\n");
}

const files = readdirSync(imgsDir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
if (files.length === 0) { process.stderr.write("step46: imgs/ is empty\n"); process.exit(2); }

const ghDir = findGithubScriptDir();
if (!ghDir) { process.stderr.write("step46: github-image-hosting skill not found\n"); process.exit(2); }

const uploadScript = resolve(ghDir, "scripts/upload.ts");
if (!existsSync(uploadScript)) { process.stderr.write("step46: upload.ts not found\n"); process.exit(2); }

const namePrefix = datePrefix ? `${datePrefix}-${slug.replace(/^\d{4}-\d{2}-\d{2}-/, "")}-img` : `${slug}-img`;

process.stdout.write(`uploading ${files.length} images to GitHub image hosting...\n`);
const r = spawnSync("bun", [
  "run", uploadScript,
  imgsDir,
  "--repo", repo,
  "--name-prefix", namePrefix,
  "--output", resolve(base, "image-map.json"),
], { stdio: "inherit", encoding: "utf8" });

if (r.status !== 0) {
  writeStep(slug, "4.6", "failed", { error: `upload exited with ${r.status}` });
  process.stderr.write(`step46: upload failed (exit ${r.status})\n`);
  process.exit(2);
}

// 博客是唯一消费 CDN URL 的渠道，Astro 构建不会 fetch 图片，
// 用户访问时 CDN 早已就绪，无需等待传播。

writeStep(slug, "4.6", "done", { image_map: "image-map.json", count: files.length });
process.stdout.write(JSON.stringify({ slug, step: "4.6", count: files.length }) + "\n");
process.exit(0);

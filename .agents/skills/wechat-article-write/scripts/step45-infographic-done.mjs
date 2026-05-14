#!/usr/bin/env bun
/**
 * Step 4.5: 信息图生成完成后的状态写入
 *
 * 用法:
 *   bun run step45-infographic-done.mjs <date-slug>
 *
 * 在 Agent 调用 baoyu-infographic 完成后执行。自动验证文件存在和 draft.md 引用。
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { writeStep } from "./state-lib.mjs";

function postsRoot() { return resolve(process.env.PIPELINE_POSTS_ROOT ?? "posts"); }

const args = process.argv.slice(2);
const slug = args[0];
if (!slug) { process.stderr.write("usage: step45-infographic-done.mjs <date-slug>\n"); process.exit(1); }

const base = resolve(postsRoot(), slug);
const imgsDir = resolve(base, "imgs");
const draftPath = resolve(base, "draft.md");

// 检查信息图文件
const infoFiles = existsSync(imgsDir)
  ? readdirSync(imgsDir).filter((f) => f.startsWith("00-infographic"))
  : [];

// 检查 draft.md 中的引用
let hasRef = false;
if (existsSync(draftPath)) {
  const draft = readFileSync(draftPath, "utf8");
  hasRef = /!\[.*\]\(imgs\/00-infographic/.test(draft);
}

const status = (infoFiles.length > 0 && hasRef) ? "done" : "failed";
const ext = infoFiles[0]?.split(".").pop() ?? "png";

writeStep(slug, "4.5", status, { infographic: `00-infographic-core-summary.${ext}`, has_file: infoFiles.length > 0, has_ref: hasRef });
process.stdout.write(JSON.stringify({ slug, step: "4.5", status, file: infoFiles[0], has_ref: hasRef }) + "\n");
if (status === "failed") process.exit(2);
process.exit(0);

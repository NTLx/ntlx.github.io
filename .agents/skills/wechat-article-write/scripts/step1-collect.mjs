#!/usr/bin/env bun
/**
 * Step 1: 资料收集验证
 *
 * 验证 materials.md 存在且非空，且包含联网背景调研章节。
 * 低质量检测（字数 < 200 打印警告，非阻塞）。
 *
 * 用法:
 *   bun run step1-collect.mjs <date-slug> [--sources N --failed N]
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { markStepDone } from "./state-lib.mjs";
import { postsRoot } from "./path-resolver.mjs";

const args = process.argv.slice(2);
let slug = null, sources = null, failed = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--sources" && args[i + 1]) { sources = parseInt(args[++i], 10); }
  else if (args[i] === "--failed" && args[i + 1]) { failed = parseInt(args[++i], 10); }
  else if (!slug) slug = args[i];
}
if (!slug) { process.stderr.write("usage: step1-collect.mjs <date-slug> [--sources N --failed N]\n"); process.exit(1); }

const materialsPath = resolve(postsRoot(), slug, "materials.md");
if (!existsSync(materialsPath)) {
  process.stderr.write(`step1: materials.md missing: ${materialsPath}\n`);
  process.exit(2);
}

const content = readFileSync(materialsPath, "utf8");
const charCount = content.replace(/\s+/g, "").length;

const lines = content.split(/\r?\n/);
const headingIndex = lines.findIndex((line) => /^##\s+背景调研\s*$/.test(line));
if (headingIndex === -1) {
  process.stderr.write("step1: FAIL materials.md 缺少 `## 背景调研` 章节。每次写作前必须联网查询相关人物/组织/概念/事件/评论等背景资料\n");
  process.exit(3);
}

const sectionLines = [];
for (const line of lines.slice(headingIndex + 1)) {
  if (/^##\s+/.test(line) || /^---\s*$/.test(line)) break;
  sectionLines.push(line);
}
const backgroundSection = sectionLines.join("\n");
if (!/https?:\/\//.test(backgroundSection)) {
  process.stderr.write("step1: FAIL `## 背景调研` 章节缺少来源 URL。背景资料必须可追溯；找不到可靠来源时也要说明检索结果\n");
  process.exit(3);
}

if (charCount < 200) {
  process.stderr.write(`step1: WARNING materials.md 仅 ${charCount} 字（非空白），可能不足以支撑 2500 字文章\n`);
  // 非阻塞，继续
}

const backgroundUrls = backgroundSection.match(/https?:\/\/[^\s)\]>"']+/g) ?? [];
const info = { materials_path: materialsPath, char_count: charCount, background_urls: backgroundUrls.length };
if (sources !== null) info.sources = sources;
if (failed !== null) info.failed = failed;

markStepDone(slug, 1, info);
process.stdout.write(JSON.stringify({ slug, step: 1, ...info }) + "\n");

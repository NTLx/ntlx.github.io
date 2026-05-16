#!/usr/bin/env bun
/**
 * Step 1: 资料收集验证
 *
 * 验证 materials.md 存在且非空，低质量检测（字数 < 200 打印警告，非阻塞）。
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

if (charCount < 200) {
  process.stderr.write(`step1: WARNING materials.md 仅 ${charCount} 字（非空白），可能不足以支撑 2500 字文章\n`);
  // 非阻塞，继续
}

const info = { materials_path: materialsPath, char_count: charCount };
if (sources !== null) info.sources = sources;
if (failed !== null) info.failed = failed;

markStepDone(slug, 1, info);
process.stdout.write(JSON.stringify({ slug, step: 1, ...info }) + "\n");
#!/usr/bin/env bun
/**
 * Step 6: 去 AI 痕迹完成后的状态写入
 *
 * 用法:
 *   bun run step6-humanize-done.mjs <date-slug> [--score N]
 *
 * 在 Agent 调用 humanizer-zh 完成后执行。
 */

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { writeStep, writeRunning } from "./state-lib.mjs";
import { postsRoot } from "./path-resolver.mjs";

const args = process.argv.slice(2);
let slug = null, score = "";
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--score" && args[i + 1]) { score = args[++i]; }
  else if (!slug) { slug = args[i]; }
}
if (!slug) { process.stderr.write("usage: step6-humanize-done.mjs <date-slug> [--score N]\n"); process.exit(1); }

writeRunning(slug, "6");

const base = resolve(postsRoot(), slug);
const articlePath = resolve(base, "article.md");
if (!existsSync(articlePath)) { process.stderr.write("step6: article.md missing\n"); process.exit(2); }

const extra = {};
if (score) extra.humanize_score = score;

writeStep(slug, "6", "done", extra);
process.stdout.write(JSON.stringify({ slug, step: 6 }) + "\n");
process.exit(0);

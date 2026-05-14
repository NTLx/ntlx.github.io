#!/usr/bin/env bun
/**
 * Step 1: 资料收集完成后的状态写入
 *
 * 用法:
 *   bun run step1-materials-done.mjs <date-slug> [--sources N] [--failed N]
 *
 * 在 Agent 完成资料收集（web-access 或用户手动提供）后执行。
 * 验证 materials.md 存在。
 */

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { writeStep } from "./state-lib.mjs";

function postsRoot() { return resolve(process.env.PIPELINE_POSTS_ROOT ?? "posts"); }

const args = process.argv.slice(2);
let slug = null, sources = 0, failed = 0;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--sources" && args[i + 1]) { sources = +args[++i]; }
  else if (args[i] === "--failed" && args[i + 1]) { failed = +args[++i]; }
  else if (!slug) { slug = args[i]; }
}
if (!slug) { process.stderr.write("usage: step1-materials-done.mjs <date-slug> [--sources N] [--failed N]\n"); process.exit(1); }

const base = resolve(postsRoot(), slug);
const matPath = resolve(base, "materials.md");
if (!existsSync(matPath)) { process.stderr.write("step1: materials.md missing\n"); process.exit(2); }

writeStep(slug, "1", "done", { sources, failed });
process.stdout.write(JSON.stringify({ slug, step: 1, sources, failed }) + "\n");
process.exit(0);

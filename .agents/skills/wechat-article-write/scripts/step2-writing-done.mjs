#!/usr/bin/env bun
/**
 * Step 2: 文章创作完成后的状态写入
 *
 * 用法:
 *   bun run step2-writing-done.mjs <date-slug> [--chars N] [--title TITLE]
 *
 * 在 Agent 调用 ljg-writes 完成后执行。验证 draft.md 存在。
 */

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { writeStep } from "./state-lib.mjs";

function postsRoot() { return resolve(process.env.PIPELINE_POSTS_ROOT ?? "posts"); }

const args = process.argv.slice(2);
let slug = null, chars = 0, title = "";
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--chars" && args[i + 1]) { chars = +args[++i]; }
  else if (args[i] === "--title" && args[i + 1]) { title = args[++i]; }
  else if (!slug) { slug = args[i]; }
}
if (!slug) { process.stderr.write("usage: step2-writing-done.mjs <date-slug> [--chars N] [--title TITLE]\n"); process.exit(1); }

const base = resolve(postsRoot(), slug);
const draftPath = resolve(base, "draft.md");
if (!existsSync(draftPath)) { process.stderr.write("step2: draft.md missing\n"); process.exit(2); }

writeStep(slug, "2", "done", { title, chars });
process.stdout.write(JSON.stringify({ slug, step: 2, title, chars }) + "\n");
process.exit(0);

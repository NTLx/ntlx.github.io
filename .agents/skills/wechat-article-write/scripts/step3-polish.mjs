#!/usr/bin/env bun
/**
 * Step 3: 文本后处理验证
 *
 * 验证 draft.md 经过 humanizer-zh + baoyu-format-markdown 处理后存在且非空。
 *
 * 用法:
 *   bun run step3-polish.mjs <date-slug>
 */

import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { markStepDone, markStepFailed } from "./state-lib.mjs";
import { postsRoot } from "./path-resolver.mjs";

const slug = process.argv[2];
if (!slug) { process.stderr.write("usage: step3-polish.mjs <date-slug>\n"); process.exit(1); }

const draftPath = resolve(postsRoot(), slug, "draft.md");
if (!existsSync(draftPath)) {
  process.stderr.write(`step3: draft.md missing: ${draftPath}\n`);
  markStepFailed(slug, 3, "draft.md missing");
  process.exit(2);
}

const stat = statSync(draftPath);
if (stat.size === 0) {
  process.stderr.write("step3: draft.md is empty\n");
  markStepFailed(slug, 3, "draft.md is empty");
  process.exit(2);
}

markStepDone(slug, 3, { draft_path: draftPath, size_bytes: stat.size });
process.stdout.write(JSON.stringify({ slug, step: 3, size_bytes: stat.size }) + "\n");
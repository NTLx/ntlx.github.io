#!/usr/bin/env bun
/**
 * Step 2: 文章创作完成后的状态写入
 *
 * 用法:
 *   bun run step2-writing-done.mjs <date-slug> [--chars N] [--title TITLE] [--min-chars 2500]
 *
 * 在 Agent 调用 ljg-writes 完成后执行。验证 draft.md 存在。
 * 如果字数低于 --min-chars（默认 2500），写状态为 failed 并给出建议。
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { writeStep, writeRunning } from "./state-lib.mjs";
import { postsRoot } from "./path-resolver.mjs";

const args = process.argv.slice(2);
let slug = null, chars = 0, title = "", minChars = 2500;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--chars" && args[i + 1]) { chars = +args[++i]; }
  else if (args[i] === "--title" && args[i + 1]) { title = args[++i]; }
  else if (args[i] === "--min-chars" && args[i + 1]) { minChars = +args[++i]; }
  else if (!slug) { slug = args[i]; }
}
if (!slug) { process.stderr.write("usage: step2-writing-done.mjs <date-slug> [--chars N] [--title TITLE] [--min-chars 2500]\n"); process.exit(1); }

writeRunning(slug, "2");

const base = resolve(postsRoot(), slug);
const draftPath = resolve(base, "draft.md");
if (!existsSync(draftPath)) { process.stderr.write("step2: draft.md missing\n"); process.exit(2); }

// 如果未传入 --chars，自动统计（排除 frontmatter）
if (!chars) {
  const raw = readFileSync(draftPath, "utf8");
  const fmEnd = raw.indexOf("\n---\n", 4);
  const body = fmEnd !== -1 ? raw.slice(fmEnd + 5) : raw;
  // 去掉代码块、图片引用、HTML 标签后统计中文字数
  const clean = body.replace(/```[\s\S]*?```/g, "").replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/<[^>]+>/g, "");
  chars = clean.replace(/\s/g, "").length;
}

// 字数门控
if (chars < minChars) {
  const gap = minChars - chars;
  const msg = `字数不足：当前 ${chars} 字，最低要求 ${minChars} 字（差 ${gap} 字）`;
  process.stderr.write(`step2: ${msg}\n`);

  // 从 draft.md 提取小节标题作为建议
  const raw = readFileSync(draftPath, "utf8");
  const headings = (raw.match(/^##\s+.+$/gm) ?? []).map((h) => h.replace(/^##\s+/, ""));
  const suggestion = headings.length > 0
    ? `建议：补充「${headings.slice(-2).join("」、「")}」小节内容`
    : `建议：扩展现有段落论述或增加新小节`;

  process.stderr.write(`  ${suggestion}\n`);

  writeStep(slug, "2", "failed", { title, chars, min_chars: minChars, gap, reason: msg });
  process.stdout.write(JSON.stringify({ slug, step: 2, status: "failed", chars, min_chars: minChars, gap }) + "\n");
  process.exit(2);
}

writeStep(slug, "2", "done", { title, chars });
process.stdout.write(JSON.stringify({ slug, step: 2, title, chars }) + "\n");
process.exit(0);
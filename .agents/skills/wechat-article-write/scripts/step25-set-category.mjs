#!/usr/bin/env bun
/**
 * Step 2.5: 文章分类确认 + blog-slug 写入
 *
 * 用法:
 *   bun run step25-set-category.mjs <date-slug> --category <cat> --blog-slug <slug>
 *
 * 行为:
 *   1. 调用 suggest-category.mjs 推荐分类
 *   2. 调用 set-frontmatter.mjs 写入 category + blogSlug
 *   3. 写状态: step 2.5 done
 *
 * 退出码: 0 成功；1 参数错误；2 校验失败
 */

import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { writeStep, writeRunning } from "./state-lib.mjs";
import { resolveBase } from "./path-resolver.mjs";

const SCRIPT_DIR = dirname(new URL(import.meta.url).pathname);

function run(cmd, args) {
  return spawnSync(cmd, args, { stdio: "pipe", encoding: "utf8" });
}

const args = process.argv.slice(2);
let slug = null, category = null, blogSlug = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--category" && args[i + 1]) { category = args[++i]; }
  else if (args[i] === "--blog-slug" && args[i + 1]) { blogSlug = args[++i]; }
  else if (!slug) { slug = args[i]; }
}

if (!slug) {
  process.stderr.write("usage: step25-set-category.mjs <date-slug> --category <cat> --blog-slug <slug>\n");
  process.exit(1);
}

writeRunning(slug, "2.5");

const base = resolveBase(slug);
const draftPath = resolve(base, "draft.md");
if (!existsSync(draftPath)) {
  process.stderr.write(`step25: draft.md missing: ${draftPath}\n`);
  process.exit(2);
}

// 如果未指定 category，调用 suggest-category 推荐
if (!category) {
  const r = run("bun", ["run", resolve(SCRIPT_DIR, "suggest-category.mjs"), draftPath]);
  if (r.status === 0) {
    try {
      const json = JSON.parse(r.stdout.trim());
      category = json.recommended;
      process.stdout.write(`推荐分类: ${category} (confidence ${json.confidence})\n`);
    } catch {
      process.stderr.write("step25: suggest-category.mjs 输出非 JSON\n");
      process.exit(2);
    }
  } else {
    process.stderr.write(`step25: suggest-category.mjs 失败: ${r.stderr}\n`);
    process.exit(2);
  }
}

// 写入 category
const setFm = resolve(SCRIPT_DIR, "set-frontmatter.mjs");
const r1 = run("bun", ["run", setFm, draftPath, "set", "category", category]);
if (r1.status !== 0) { process.stderr.write(`set category failed: ${r1.stderr}\n`); process.exit(2); }

// 写入 blogSlug（如果提供了）
if (blogSlug) {
  const r2 = run("bun", ["run", setFm, draftPath, "set", "blogSlug", blogSlug]);
  if (r2.status !== 0) { process.stderr.write(`set blogSlug failed: ${r2.stderr}\n`); process.exit(2); }
}

// 写状态
writeStep(slug, "2.5", "done", { category, blogSlug: blogSlug ?? "" });
process.stdout.write(JSON.stringify({ slug, category, blogSlug }) + "\n");
process.exit(0);

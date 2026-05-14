#!/usr/bin/env bun
/**
 * Step 8: HTML 转换 + 验证 + 状态写入
 *
 * 用法:
 *   bun run step8-html-convert.mjs <date-slug> [--theme default] [--color blue]
 *
 * 行为:
 *   1. 通过 run-with-cdn-fallback.sh 调用 baoyu-markdown-to-html
 *   2. 运行 validate-pipeline.sh html 验证
 *   3. 写状态: step 8 done
 *
 * 退出码: 0 成功；1 参数错误；2 转换/验证失败
 */

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { writeStep } from "./state-lib.mjs";

function postsRoot() { return resolve(process.env.PIPELINE_POSTS_ROOT ?? "posts"); }
function repoRoot() { return resolve(process.env.PIPELINE_REPO_ROOT ?? "."); }

const args = process.argv.slice(2);
let slug = null, theme = "default", color = "blue";
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--theme" && args[i + 1]) { theme = args[++i]; }
  else if (args[i] === "--color" && args[i + 1]) { color = args[++i]; }
  else if (!slug) { slug = args[i]; }
}
if (!slug) { process.stderr.write("usage: step8-html-convert.mjs <date-slug> [--theme T] [--color C]\n"); process.exit(1); }

const base = resolve(postsRoot(), slug);
const articleMd = resolve(base, "article.md");
if (!existsSync(articleMd)) { process.stderr.write("step8: article.md missing\n"); process.exit(2); }

// 查找 baoyu-markdown-to-html 脚本
function findHtmlScript() {
  const candidates = [
    resolve(repoRoot(), ".agents/skills/baoyu-markdown-to-html"),
    resolve(process.env.HOME ?? "", ".claude/skills/baoyu-markdown-to-html"),
  ];
  for (const d of candidates) {
    const main = resolve(d, "scripts/main.ts");
    if (existsSync(main)) return main;
  }
  return null;
}

const htmlScript = findHtmlScript();
if (!htmlScript) { process.stderr.write("step8: baoyu-markdown-to-html/scripts/main.ts not found\n"); process.exit(2); }

const skillDir = resolve(repoRoot(), ".agents/skills/wechat-article-write");
const fallbackScript = resolve(skillDir, "scripts/run-with-cdn-fallback.sh");

process.stdout.write(`step8: converting ${articleMd} to HTML...\n`);
const r = spawnSync("bash", [
  fallbackScript,
  "--post-dir", base,
  "--stage", "html",
  "--",
  "bun", "run", htmlScript,
  articleMd,
  "--theme", theme,
  "--title", "",
], { stdio: "inherit", encoding: "utf8", cwd: repoRoot() });

if (r.status !== 0) { process.stderr.write("step8: HTML conversion failed\n"); process.exit(2); }

// 验证
const validate = resolve(skillDir, "scripts/validate-pipeline.sh");
const vr = spawnSync("bash", [validate, base, "html"], { stdio: "pipe", encoding: "utf8" });
if (vr.status !== 0) {
  process.stderr.write(`step8: validation failed: ${vr.stderr}\n`);
  process.exit(2);
}

writeStep(slug, "8", "done", { theme, color });
process.stdout.write(JSON.stringify({ slug, step: 8, theme, color }) + "\n");
process.exit(0);

#!/usr/bin/env bun
/**
 * 微信草稿发布编排（Step 10）
 *
 * 行为:
 *   1. 读取 posts/<date-slug>/article.md frontmatter，自动从中提取 title / sourceUrl
 *   2. 探活 sourceUrl（HTTP 200），未就绪则报错并退出（提示先跑 wait-pages-deployed.mjs）
 *   3. 调用 baoyu-post-to-wechat 技能脚本，传入 --cover --theme --color --author --src
 *      具体脚本路径由 BAOYU_POST_TO_WECHAT_BIN 环境变量指定，
 *      默认 .agents/skills/baoyu-post-to-wechat/scripts/post-draft.mjs
 *   4. 成功后 state.mjs set <date-slug> 10 done
 *
 * 用法:
 *   bun run publish-wechat.mjs <date-slug> [--theme baoyu] [--color blue]
 *                              [--author NTLx] [--no-skip-deploy-check] [--dry-run]
 * 退出码:
 *   0 成功；1 参数错误；2 frontmatter 缺字段；3 sourceUrl 探活失败；4 发布脚本失败
 */

import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { writeStep } from "./state-lib.mjs";

const SCRIPT_DIR = dirname(new URL(import.meta.url).pathname);

function postsRoot()  { return resolve(process.env.PIPELINE_POSTS_ROOT ?? "posts"); }
function repoRoot()   { return resolve(process.env.PIPELINE_REPO_ROOT ?? "."); }

function parseArgs(argv) {
  const o = { slug: null, theme: "baoyu", color: "blue", author: "NTLx", skipDeployCheck: true, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--theme") o.theme = argv[++i];
    else if (a === "--color") o.color = argv[++i];
    else if (a === "--author") o.author = argv[++i];
    else if (a === "--no-skip-deploy-check") o.skipDeployCheck = false;
    else if (a === "--skip-deploy-check") o.skipDeployCheck = true;
    else if (a === "--dry-run") o.dryRun = true;
    else if (!o.slug) o.slug = a;
  }
  return o;
}

function readFm(file, key) {
  const r = spawnSync("bun", ["run", resolve(SCRIPT_DIR, "set-frontmatter.mjs"), file, "get", key], { encoding: "utf8" });
  return (r.stdout ?? "").trim();
}

const opts = parseArgs(process.argv.slice(2));
if (!opts.slug) {
  process.stderr.write("usage: publish-wechat.mjs <date-slug> [--theme T] [--color C] [--author A] [--skip-deploy-check] [--dry-run]\n");
  process.exit(1);
}

const base = resolve(postsRoot(), opts.slug);
const articlePath = resolve(base, "article.md");
const htmlPath    = resolve(base, "article.html");
const coverPng    = resolve(base, "cover.png");
const coverJpg    = resolve(base, "cover.jpg");

if (!existsSync(articlePath)) { process.stderr.write(`publish-wechat: ${articlePath} 缺失\n`); process.exit(2); }
if (!existsSync(htmlPath))    { process.stderr.write(`publish-wechat: ${htmlPath} 缺失（先跑 Step 8 HTML 转换）\n`); process.exit(2); }
const cover = existsSync(coverPng) ? coverPng : (existsSync(coverJpg) ? coverJpg : null);
if (!cover) { process.stderr.write("publish-wechat: cover.png/cover.jpg 都不存在\n"); process.exit(2); }

const title = readFm(articlePath, "title");
const sourceUrl = readFm(articlePath, "sourceUrl");
if (!title || !sourceUrl) {
  process.stderr.write("publish-wechat: frontmatter.title 或 sourceUrl 缺失\n");
  process.exit(2);
}

if (!opts.skipDeployCheck) {
  process.stdout.write(`probing sourceUrl: ${sourceUrl}\n`);
  const probe = spawnSync("curl", ["-fsSLI", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "15", sourceUrl], { encoding: "utf8" });
  if (probe.status !== 0 || (probe.stdout ?? "").trim() !== "200") {
    process.stderr.write(`publish-wechat: sourceUrl 未就绪 (HTTP ${(probe.stdout ?? "").trim() || "?"})；先跑 wait-pages-deployed.mjs\n`);
    process.exit(3);
  }
}

const wechatBin = process.env.BAOYU_POST_TO_WECHAT_BIN
  ?? resolve(repoRoot(), ".agents/skills/baoyu-post-to-wechat/scripts/post-draft.mjs");

if (!existsSync(wechatBin)) {
  process.stderr.write(`publish-wechat: post-to-wechat 脚本不存在: ${wechatBin}\n`);
  process.stderr.write("  可通过 BAOYU_POST_TO_WECHAT_BIN 覆盖；或检查 baoyu-post-to-wechat 是否安装。\n");
  process.exit(4);
}

const args = [
  "run", wechatBin,
  "--html", htmlPath,
  "--cover", cover,
  "--title", title,
  "--theme", opts.theme,
  "--color", opts.color,
  "--author", opts.author,
  "--src", sourceUrl,
];

if (opts.dryRun) {
  process.stdout.write(`[dry-run] bun ${args.join(" ")}\n`);
  process.exit(0);
}

const result = spawnSync("bun", args, { stdio: "inherit" });
if (result.status !== 0) {
  process.stderr.write(`publish-wechat: post-draft 退出码 ${result.status}\n`);
  process.exit(4);
}

writeStep(opts.slug, "10", "done", { sourceUrl, theme: opts.theme });
process.stdout.write(JSON.stringify({ slug: opts.slug, sourceUrl, theme: opts.theme, color: opts.color }) + "\n");

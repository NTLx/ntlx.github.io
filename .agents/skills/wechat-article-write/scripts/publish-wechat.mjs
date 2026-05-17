#!/usr/bin/env bun
/**
 * 微信草稿发布（Step 6.2）
 *
 * 行为:
 *   1. 读取 posts/<date-slug>/article.md frontmatter，自动提取 title / sourceUrl
 *   2. 探活 sourceUrl（仅在 --no-skip-deploy-check 时）
 *   3. 调用 baoyu-post-to-wechat，传入 --cover --theme --color --author --src
 *   4. 成功后 markWechatDone
 *
 * 用法:
 *   bun run publish-wechat.mjs <date-slug> [--type news] [--theme <cfg>] [--color <cfg>]
 *                              [--author <cfg>] [--no-skip-deploy-check] [--dry-run]
 * 退出码:
 *   0 成功；1 参数错误；2 frontmatter 缺字段；3 sourceUrl 探活失败；4 发布脚本失败
 */

import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { markStepFailed, markWechatDone } from "./state-lib.mjs";
import { getPostToWechatConfig } from "./config-lib.mjs";
import { postsRoot, repoRoot } from "./path-resolver.mjs";

const SCRIPT_DIR = dirname(new URL(import.meta.url).pathname);

function parseArgs(argv) {
  const cfg = getPostToWechatConfig();
  const o = { slug: null, theme: cfg.theme, color: cfg.color, type: "news", author: cfg.author, skipDeployCheck: true, dryRun: false, postDir: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help") { printHelp(); process.exit(0); }
    else if (a === "--theme") o.theme = argv[++i];
    else if (a === "--color") o.color = argv[++i];
    else if (a === "--type") o.type = argv[++i];
    else if (a === "--author") o.author = argv[++i];
    else if (a === "--no-skip-deploy-check") o.skipDeployCheck = false;
    else if (a === "--skip-deploy-check") o.skipDeployCheck = true;
    else if (a === "--dry-run") o.dryRun = true;
    else if (a === "--post-dir") o.postDir = argv[++i];
    else if (a.startsWith("--")) { process.stderr.write(`publish-wechat: unknown flag "${a}" (typo?)\n`); process.exit(1); }
    else if (!o.slug) o.slug = a;
  }
  return o;
}

function printHelp() {
  process.stdout.write(`publish-wechat.mjs — 微信草稿发布编排 (Step 6.2)

用法:
  bun run publish-wechat.mjs <date-slug> [options]
  bun run publish-wechat.mjs --post-dir <path>  [options]

选项:
  --type <news|newspic>       文章类型（默认 news）
  --theme <name>              主题样式（默认来自 config）
  --color <name>              主题颜色（默认来自 config）
  --author <name>             作者名（默认来自 config）
  --post-dir <path>           posts/ 下的目录路径（替代 date-slug）
  --skip-deploy-check         跳过 sourceUrl 探活（默认开启）
  --no-skip-deploy-check      强制探活 sourceUrl（HTTP 200 校验）
  --dry-run                   只输出将要执行的操作，不实际执行
  --help                      显示此帮助信息

示例:
  bun run publish-wechat.mjs 2026-05-16-langchain
  bun run publish-wechat.mjs --post-dir posts/2026-05-16-langchain --type newspic
`);
}

function readFm(file, key) {
  const r = spawnSync("bun", ["run", resolve(SCRIPT_DIR, "set-frontmatter.mjs"), file, "get", key], { encoding: "utf8" });
  return (r.stdout ?? "").trim();
}

const opts = parseArgs(process.argv.slice(2));
if (!opts.slug && !opts.postDir) {
  process.stderr.write("usage: publish-wechat.mjs <date-slug> [--type news|newspic] [--theme T] [--color C] [--author A] [--post-dir <path>] [--skip-deploy-check] [--dry-run]\n");
  process.exit(1);
}

// --post-dir: 从路径推导 slug
if (opts.postDir && !opts.slug) {
  const p = opts.postDir.replace(/\/+$/, "");
  opts.slug = p.includes("/") ? p.split("/").pop() : p;
}

const base = resolve(postsRoot(), opts.slug);
const articlePath = resolve(base, "article.md");
const htmlPath    = resolve(base, "article-wechat.html");
const coverPng    = resolve(base, "cover.png");
const coverJpg    = resolve(base, "cover.jpg");

if (!existsSync(articlePath)) { process.stderr.write(`publish-wechat: ${articlePath} 缺失\n`); process.exit(2); }
if (!existsSync(htmlPath))    { process.stderr.write(`publish-wechat: ${htmlPath} 缺失（先跑 Step 8 HTML 转换）\n`); process.exit(2); }
const cover = existsSync(coverPng) ? coverPng : (existsSync(coverJpg) ? coverJpg : null);
if (!cover) { process.stderr.write("publish-wechat: cover.png/cover.jpg 都不存在\n"); process.exit(2); }

const title = readFm(articlePath, "title");
const sourceUrl = readFm(articlePath, "sourceUrl");
const digest = readFm(articlePath, "summary");
if (!title || !sourceUrl) {
  process.stderr.write("publish-wechat: frontmatter.title 或 sourceUrl 缺失\n");
  process.exit(2);
}

if (!opts.skipDeployCheck) {
  process.stdout.write(`probing sourceUrl: ${sourceUrl}\n`);
  const probe = spawnSync("curl", ["-fsSLI", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "15", sourceUrl], { encoding: "utf8" });
  if (probe.status !== 0 || (probe.stdout ?? "").trim() !== "200") {
    process.stderr.write(`publish-wechat: sourceUrl 未就绪 (HTTP ${(probe.stdout ?? "").trim() || "?"})；等待 GitHub Pages 部署完成后重试\n`);
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
  "--type", opts.type,
  "--theme", opts.theme,
  "--color", opts.color,
  "--author", opts.author,
  "--src", sourceUrl,
];
// digest/summary: passed for future compatibility (post-draft.mjs may accept --digest later)
if (digest) args.push("--digest", digest);

if (opts.dryRun) {
  process.stdout.write(`[dry-run] bun ${args.join(" ")}\n`);
  process.exit(0);
}

const result = spawnSync("bun", args, { stdio: "inherit" });
if (result.status !== 0) {
  process.stderr.write(`publish-wechat: post-draft 退出码 ${result.status}\n`);
  markStepFailed(opts.slug, 6.2, `post-draft exit ${result.status}`);
  process.exit(4);
}

markWechatDone(opts.slug, { sourceUrl, theme: opts.theme });
process.stdout.write(JSON.stringify({ slug: opts.slug, sourceUrl, theme: opts.theme, color: opts.color }) + "\n");

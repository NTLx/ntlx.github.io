#!/usr/bin/env bun
/**
 * 微信草稿发布（Step 6.2）— API only
 *
 * 行为:
 *   1. 读取 posts/<date-slug>/article.md frontmatter，自动提取 title / sourceUrl / summary
 *   2. 探活 sourceUrl（仅在 --no-skip-deploy-check 时）
 *   3. 调用 wechat-api.ts 通过微信官方 API 发布草稿
 *   4. 自动安装 baoyu-post-to-wechat 依赖（node_modules 缺失时）
 *   5. 成功后 markWechatDone
 *
 * 说明:
 *   sourceUrl 是博客文章公网地址，必须作为微信公众号草稿的“原文链接”
 *   传给底层 wechat-api.ts。该地址由固定规则 https://ntlx.github.io/articles/{blogSlug}
 *   拼接得到，可以在 GitHub Pages 完成公网探活前先传入。
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
  process.stdout.write(`publish-wechat.mjs — 微信草稿发布编排 (Step 6.2, API only)

用法:
  bun run publish-wechat.mjs <date-slug> [options]
  bun run publish-wechat.mjs --post-dir <path>  [options]

选项:
  --type <news|newspic>       文章类型（默认 news）
  --author <name>             作者名（默认来自 config）
  --post-dir <path>           posts/ 下的目录路径（替代 date-slug）
  --skip-deploy-check         跳过 sourceUrl 探活（默认开启）
  --no-skip-deploy-check      强制探活 sourceUrl（HTTP 200 校验）
  --dry-run                   只输出将要执行的操作，不实际执行
  --help                      显示此帮助信息

示例:
  bun run publish-wechat.mjs 2026-05-16-langchain
  bun run publish-wechat.mjs --post-dir posts/2026-05-16-langchain
`);
}

function readFm(file, key) {
  const r = spawnSync("bun", ["run", resolve(SCRIPT_DIR, "set-frontmatter.mjs"), file, "get", key], { encoding: "utf8" });
  return (r.stdout ?? "").trim();
}

function ensureDepsInstalled(scriptsDir) {
  const pkgJson = resolve(scriptsDir, "package.json");
  const nodeModules = resolve(scriptsDir, "node_modules");
  if (existsSync(pkgJson) && !existsSync(nodeModules)) {
    process.stdout.write(`publish-wechat: installing dependencies in ${scriptsDir}...\n`);
    const result = spawnSync("bun", ["install"], { cwd: scriptsDir, stdio: "inherit" });
    if (result.status !== 0) {
      process.stderr.write(`publish-wechat: dependency installation failed (exit ${result.status})\n`);
      process.exit(4);
    }
    process.stdout.write("publish-wechat: dependencies installed\n");
  }
}

function resolveWechatApiScript() {
  if (process.env.BAOYU_POST_TO_WECHAT_BIN) {
    return process.env.BAOYU_POST_TO_WECHAT_BIN;
  }
  const apiScript = resolve(repoRoot(), ".agents/skills/baoyu-post-to-wechat/scripts/wechat-api.ts");
  if (!existsSync(apiScript)) {
    process.stderr.write(`publish-wechat: wechat-api.ts 不存在: ${apiScript}\n`);
    process.stderr.write("  请检查 baoyu-post-to-wechat 技能是否已安装，或设置 BAOYU_POST_TO_WECHAT_BIN 环境变量。\n");
    process.exit(4);
  }
  return apiScript;
}

const opts = parseArgs(process.argv.slice(2));
if (!opts.slug && !opts.postDir) {
  process.stderr.write("usage: publish-wechat.mjs <date-slug> [--type news|newspic] [--author A] [--post-dir <path>] [--skip-deploy-check] [--dry-run]\n");
  process.exit(1);
}

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
if (!existsSync(htmlPath))    { process.stderr.write(`publish-wechat: ${htmlPath} 缺失（先跑 Step 5 产物构建）\n`); process.exit(2); }
const cover = existsSync(coverPng) ? coverPng : (existsSync(coverJpg) ? coverJpg : null);
if (!cover) { process.stderr.write("publish-wechat: cover.png/cover.jpg 都不存在\n"); process.exit(2); }

const title = readFm(articlePath, "title");
const sourceUrl = readFm(articlePath, "sourceUrl");
const digest = readFm(articlePath, "summary");
if (!title || !sourceUrl) {
  process.stderr.write("publish-wechat: frontmatter.title 或 sourceUrl 缺失\n");
  process.exit(2);
}
if (!digest) {
  process.stderr.write("publish-wechat: frontmatter.summary 缺失（微信草稿箱必须有摘要/digest）。请在 Step 2 写作时生成金句式 summary（≤120 字），或在 draft.md frontmatter 中手动补填\n");
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

const wechatBin = resolveWechatApiScript();
const scriptsDir = dirname(wechatBin);
ensureDepsInstalled(scriptsDir);

const args = [
  "run", wechatBin,
  htmlPath,
  "--title", title,
  "--summary", digest,
  "--source-url", sourceUrl,
  "--author", opts.author,
  "--cover", cover,
  "--type", opts.type,
  "--no-cite",
];

if (opts.dryRun) {
  process.stdout.write(`[dry-run] bun ${args.join(" ")}\n`);
  process.exit(0);
}

process.stdout.write(`publish-wechat: API → ${wechatBin}\n`);

const result = spawnSync("bun", args, { stdio: "inherit" });
if (result.status !== 0) {
  process.stderr.write(`publish-wechat: wechat-api.ts 退出码 ${result.status}\n`);
  markStepFailed(opts.slug, 6.2, `wechat-api exit ${result.status}`);
  process.exit(4);
}

markWechatDone(opts.slug, { sourceUrl });
process.stdout.write(JSON.stringify({ slug: opts.slug, sourceUrl }) + "\n");

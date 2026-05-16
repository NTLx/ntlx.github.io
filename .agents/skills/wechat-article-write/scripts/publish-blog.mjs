#!/usr/bin/env bun
/**
 * 博客发布轨一键编排（Step 9）
 *
 * 行为:
 *   1. 校验：frontmatter 含 title / date / summary / category（在 6 枚举内）
 *   2. 转换：summary→description、加 $schema: starlight、删 coverImage / sourceUrl
 *   3. 确定 blog slug：优先 --blog-slug（纯 ASCII）；未传则从 date-slug 去日期前缀，
 *      若非纯 ASCII kebab-case 则报错退出（CLAUDE.md 禁止中文文件名）
 *   4. 写入：复制为 src/content/docs/articles/<slug>.md
 *   5. 构建：npx astro sync && npm run build（任一非零立即中止）
 *   6. 提交：git add → git commit（独立步骤，失败 => exit 4）
 *   7. 推送：git push（独立步骤，失败 => 状态写 blocked + 生成 RESUME.md，进程 exit 0
 *           以便 agent 把后续 Step 9.5/10 标 blocked 而不是 failed；commit 仍然有效）
 *   8. 写状态：bun run state.mjs set <date-slug> 9 done|blocked '{...}'
 *
 * 用法:
 *   bun run publish-blog.mjs <date-slug> [--blog-slug <ascii-slug>] [--no-push] [--no-build] [--dry-run]
 *                              [--commit-template TEMPLATE]
 * 退出码:
 *   0 成功（含 push 失败但 commit 成功 + 已写 RESUME.md 的 blocked 状态）
 *   1 参数错误；2 frontmatter 校验失败或 blog-slug 非 ASCII；3 构建失败；4 git add/commit 失败
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { writeStep, writeRunning } from "./state-lib.mjs";
import { postsRoot, repoRoot } from "./path-resolver.mjs";

const VALID_CATEGORIES = ["ai-coding", "ai-agents", "ai-industry", "ai-models", "security", "engineering"];

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: "inherit", encoding: "utf8", ...opts });
  if (r.status !== 0) {
    process.stderr.write(`publish-blog: ${cmd} ${args.join(" ")} exited with ${r.status}\n`);
    process.exit(opts.failExit ?? 4);
  }
  return r;
}

// 软执行：失败不退出进程，把退出码返回给调用方决定
function trySpawn(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: "inherit", encoding: "utf8", ...opts });
  return r.status ?? 1;
}

function captureStdout(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: "utf8" });
  if (r.status !== 0) return null;
  return r.stdout.trim();
}

function parseArgs(argv) {
  const opts = { noPush: false, noBuild: false, dryRun: false, slug: null, blogSlug: null, commitTemplate: null, postDir: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help") { printHelp(); process.exit(0); }
    else if (a === "--no-push") opts.noPush = true;
    else if (a === "--no-build") opts.noBuild = true;
    else if (a === "--dry-run") opts.dryRun = true;
    else if (a === "--commit-template") opts.commitTemplate = argv[++i];
    else if (a === "--blog-slug") opts.blogSlug = argv[++i];
    else if (a === "--post-dir") opts.postDir = argv[++i];
    else if (a.startsWith("--")) { process.stderr.write(`publish-blog: unknown flag "${a}" (typo?)\n`); }
    else if (!opts.slug) opts.slug = a;
  }
  return opts;
}

function printHelp() {
  process.stdout.write(`publish-blog.mjs — 博客发布编排 (Step 9)

用法:
  bun run publish-blog.mjs <date-slug> [options]
  bun run publish-blog.mjs --post-dir <path>  [options]

选项:
  --blog-slug <ascii-slug>  博客文章 URL slug（必须纯 ASCII kebab-case）
  --post-dir <path>         posts/ 下的目录路径（替代 date-slug）
  --no-push                 不执行 git push
  --no-build                不执行 Astro 构建
  --dry-run                 只输出将要执行的操作，不实际执行
  --commit-template <tmpl>  git commit 消息模板
  --help                    显示此帮助信息

示例:
  bun run publish-blog.mjs 2026-05-16-langchain
  bun run publish-blog.mjs --post-dir posts/2026-05-16-langchain --blog-slug langchain-interrupt
`);
}

function splitFm(raw) {
  if (!raw.startsWith("---\n")) return null;
  const end = raw.indexOf("\n---\n", 4);
  if (end === -1) return null;
  return { fm: raw.slice(4, end), body: raw.slice(end + 5) };
}

function parseFm(fmText) {
  const out = {};
  for (const line of fmText.split("\n")) {
    const m = line.match(/^([\w$]+)\s*:\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[m[1]] = v;
  }
  return out;
}

function buildBlogFm(fm) {
  // 管线专用字段不写入博客文章：infographicPosition（仅 step45 消费）、
  // coverImage（微信轨专用）、sourceUrl（微信轨引用）
  const excluded = ["infographicPosition", "coverImage", "sourceUrl"];
  for (const k of excluded) delete fm[k];

  // 字段顺序：$schema -> title -> description -> date -> category -> tags?
  const lines = [];
  lines.push(`$schema: starlight`);
  lines.push(`title: ${quote(fm.title)}`);
  lines.push(`description: ${quote(fm.summary ?? fm.description ?? "")}`);
  lines.push(`date: ${fm.date}`);
  lines.push(`category: ${fm.category}`);
  if (fm.tags) lines.push(`tags: ${fm.tags}`);
  return "---\n" + lines.join("\n") + "\n---\n";
}
function quote(v) {
  if (v === "") return '""';
  if (/[:#'"\\\n]/.test(v)) return '"' + v.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
  return v;
}

// date-slug -> blog slug：优先使用 --blog-slug；否则去掉前导日期 YYYY-MM-DD- 后剩下的部分
// CLAUDE.md 硬规则：blog slug 必须为小写 ASCII kebab-case，禁止中文
const ASCII_SLUG_RE = /^[a-z][a-z0-9-]*[a-z0-9]$/;
function blogSlug(dateSlug, explicitSlug) {
  if (explicitSlug) {
    if (!ASCII_SLUG_RE.test(explicitSlug)) {
      process.stderr.write(`publish-blog: --blog-slug "${explicitSlug}" 不符合 ASCII kebab-case 规则（${ASCII_SLUG_RE}）\n`);
      process.exit(2);
    }
    return explicitSlug;
  }
  const m = dateSlug.match(/^\d{4}-\d{2}-\d{2}-(.+)$/);
  const auto = m ? m[1] : dateSlug;
  if (!ASCII_SLUG_RE.test(auto)) {
    process.stderr.write(`publish-blog: 自动生成的 blog slug "${auto}" 不是纯 ASCII kebab-case。CLAUDE.md 禁止中文文件名。\n请通过 --blog-slug 参数显式传入 ASCII slug，例如 --blog-slug fake-lossless-detection\n`);
    process.exit(2);
  }
  return auto;
}

const opts = parseArgs(process.argv.slice(2));
if (!opts.slug) {
  process.stderr.write("usage: publish-blog.mjs <date-slug> [--blog-slug <ascii-slug>] [--no-push] [--no-build] [--dry-run] [--commit-template TEMPLATE]\n");
  process.exit(1);
}

writeRunning(opts.slug, "9");

const dateSlug = opts.slug;
const articlePath = resolve(postsRoot(), dateSlug, "article.md");
if (!existsSync(articlePath)) {
  process.stderr.write(`publish-blog: ${articlePath} 不存在\n`);
  process.exit(2);
}

const raw = readFileSync(articlePath, "utf8");
const split = splitFm(raw);
if (!split) {
  process.stderr.write("publish-blog: article.md 缺少 frontmatter\n");
  process.exit(2);
}
const fm = parseFm(split.fm);

// 必填字段校验
for (const k of ["title", "date", "summary", "category"]) {
  if (!fm[k]) {
    process.stderr.write(`publish-blog: frontmatter.${k} 缺失\n`);
    process.exit(2);
  }
}
if (!VALID_CATEGORIES.includes(fm.category)) {
  process.stderr.write(`publish-blog: category=${fm.category} 不在白名单 ${VALID_CATEGORIES.join(",")}\n`);
  process.exit(2);
}

const slug = blogSlug(dateSlug, opts.blogSlug);
const targetPath = resolve(repoRoot(), "src/content/docs/articles", `${slug}.md`);
const blogFm = buildBlogFm(fm);
const blogContent = blogFm + split.body;

if (opts.dryRun) {
  process.stdout.write(`[dry-run] would write ${targetPath} (${blogContent.length} bytes)\n`);
  process.stdout.write(blogFm);
  process.exit(0);
}

writeFileSync(targetPath, blogContent);
process.stdout.write(`written: ${targetPath}\n`);

// 构建验证
if (!opts.noBuild) {
  run("npx", ["astro", "sync"], { cwd: repoRoot(), failExit: 3 });
  run("npm", ["run", "build"], { cwd: repoRoot(), failExit: 3 });
}

// git: commit 与 push 必须分离 —— push 失败时 commit 仍然有效，状态写 blocked 而非 failed
let pushed = false;
let pushBlocked = false;
let pushError = null;

if (!opts.noPush) {
  // Step 5: git add + commit（失败 => exit 4，因为 commit 失败说明本地仓库异常，必须中止）
  run("git", ["add", targetPath], { cwd: repoRoot() });
  const tmpl = opts.commitTemplate ?? `post: ${fm.title} (${slug})`;
  run("git", ["commit", "-m", tmpl], { cwd: repoRoot() });

  // Step 6: git push（软执行，失败 => 写 RESUME.md，进程仍正常退出）
  const pushStatus = trySpawn("git", ["push"], { cwd: repoRoot() });
  if (pushStatus === 0) {
    pushed = true;
  } else {
    pushBlocked = true;
    pushError = `git push exited with ${pushStatus}`;
    process.stderr.write(`publish-blog: ${pushError} — commit 已完成，写入 RESUME.md 并标记 blocked\n`);
  }
}

const sha = captureStdout("git", ["rev-parse", "HEAD"]);

// 写 RESUME.md（push 失败时必须；push 成功时不写）
if (pushBlocked) {
  const resumePath = resolve(postsRoot(), dateSlug, "RESUME.md");
  const resumeBody = `# 流水线断点续跑指引

> 自动生成于 ${new Date().toISOString()}
> 触发原因：Step 9 (publish-blog) git push 失败 — ${pushError}

## 当前状态

- **Step 9 (博客发布)**：commit 已创建（${sha}），但 **push 未完成**，状态 = \`blocked\`
- **Step 9.5 (等待 GitHub Pages 部署)**：依赖 push 完成，未执行
- **Step 10 (微信发布)**：依赖 sourceUrl HTTP 200，未执行

## 需要手动完成的操作

\`\`\`bash
# 1) 在网络通畅的环境（如切换到 https 协议，或使用 GitHub Token over HTTPS）重新推送
git push origin main

# 或使用 gh cli 绕过 SSH
gh repo sync   # 如已配置远端

# 2) 验证推送成功
git log origin/main..HEAD   # 应为空
\`\`\`

## 推送成功后继续执行的步骤

\`\`\`bash
SLUG="${dateSlug}"

# Step 9 状态升级到 done
bun run .agents/skills/wechat-article-write/scripts/state.mjs set "$SLUG" 9 done '{"commit":"${sha}","slug":"${slug}","resumed":true}'

# Step 9.5 等待 GitHub Pages 部署完成
bun run .agents/skills/wechat-article-write/scripts/wait-pages-deployed.mjs "$SLUG"

# Step 10 微信发布（参考 SKILL.md Step 10）
.agents/skills/wechat-article-write/scripts/validate-pipeline.sh "$SLUG" publish-wechat
# 然后调用 baoyu-post-to-wechat
\`\`\`

## 排查 push 失败常见原因

- SSH 端口被阻断 → 切换到 HTTPS：\`git remote set-url origin https://github.com/<owner>/<repo>.git\`
- 网络代理未生效 → 确认 \`git config --get http.proxy\`
- GitHub 临时不可用 → 稍后重试
`;
  writeFileSync(resumePath, resumeBody);
  process.stdout.write(`written: ${resumePath}\n`);
}

// 写 state：push 成功 = done；push 失败 = blocked
const finalStatus = pushBlocked ? "blocked" : "done";
const stateExtra = pushBlocked
  ? { commit: sha, slug, pushed: false, push_error: pushError, resume_file: "RESUME.md" }
  : { commit: sha, slug, pushed };
writeStep(dateSlug, "9", finalStatus, stateExtra);

process.stdout.write(JSON.stringify({
  slug,
  target: targetPath,
  commit: sha,
  pushed,
  blocked: pushBlocked,
  resume_file: pushBlocked ? "RESUME.md" : null,
}) + "\n");

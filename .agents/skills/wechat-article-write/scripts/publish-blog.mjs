#!/usr/bin/env bun
/**
 * 博客发布轨（Step 6.1）
 *
 * 行为:
 *   1. 校验：frontmatter 含 title / date / summary / category（6 枚举内）
 *   2. 确定 blog slug：优先 --blog-slug，其次 frontmatter.blogSlug，最后从 date-slug 去日期前缀
 *   3. 转换：summary→description、加 $schema: starlight、删管线专用字段
 *   4. 写入：src/content/docs/articles/<slug>.md
 *   5. 构建：npx astro sync && npm run build
 *   6. git add → git commit → git push
 *   7. push 失败 → 生成 RESUME.md，commit 不丢失
 *
 * 用法:
 *   bun run publish-blog.mjs <date-slug> [--blog-slug <ascii-slug>] [--no-push] [--no-build] [--dry-run] [--overwrite] [--allow-non-main]
 *
 * 退出码:
 *   0 成功（--no-push 或 push 失败时也返回 0，并把博客发布状态标记为 blocked）
 *   1 参数错误 / 未知 flag；2 frontmatter 校验失败；3 构建失败；4 git add/commit 失败；5 目标文件已存在；6 非 main 分支
 */

import { existsSync, readFileSync, writeFileSync, copyFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { markBlogDone } from "./state-lib.mjs";
import { postsRoot, repoRoot } from "./path-resolver.mjs";
import { VALID_CATEGORIES, ASCII_SLUG_RE } from "./validation-lib.mjs";
import { parseFrontmatter, extractBody } from "./frontmatter-lib.mjs";


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
  const opts = { noPush: false, noBuild: false, dryRun: false, overwrite: false, allowNonMain: false, autoRebase: false, slug: null, blogSlug: null, targetPath: null, commitTemplate: null, postDir: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help") { printHelp(); process.exit(0); }
    else if (a === "--no-push") opts.noPush = true;
    else if (a === "--no-build") opts.noBuild = true;
    else if (a === "--dry-run") opts.dryRun = true;
    else if (a === "--overwrite") opts.overwrite = true;
    else if (a === "--allow-non-main") opts.allowNonMain = true;
    else if (a === "--auto-rebase") opts.autoRebase = true;
    else if (a === "--commit-template") opts.commitTemplate = argv[++i];
    else if (a === "--blog-slug") opts.blogSlug = argv[++i];
    else if (a === "--target-path") opts.targetPath = argv[++i];
    else if (a === "--post-dir") opts.postDir = argv[++i];
    else if (a.startsWith("--")) { process.stderr.write(`publish-blog: unknown flag "${a}" (typo?)\n`); process.exit(1); }
    else if (!opts.slug) opts.slug = a;
  }
  return opts;
}

function printHelp() {
  process.stdout.write(`publish-blog.mjs — 博客发布编排 (Step 6.1)

用法:
  bun run publish-blog.mjs <date-slug> [options]
  bun run publish-blog.mjs --post-dir <path>  [options]

选项:
  --blog-slug <ascii-slug>  博客文章 URL slug（覆盖 frontmatter.blogSlug，必须纯 ASCII kebab-case）
  --post-dir <path>         posts/ 下的目录路径（替代 date-slug）
  --target-path <path>      目标路径，相对于 src/content/docs/（不含 .md）。优先级：CLI > frontmatter.targetPath > articles/{blogSlug}
  --overwrite               强制覆盖已存在的文章文件（覆盖前自动备份）
  --allow-non-main          跳过 main 分支检查
  --auto-rebase             push 失败时自动尝试 git pull --rebase 再 push（最多 1 次）
  --no-push                 不执行 git commit/push，状态标记为 blocked
  --no-build                不执行 Astro 构建
  --dry-run                 只输出将要执行的操作，不实际执行
  --commit-template <tmpl>  git commit 消息模板
  --help                    显示此帮助信息

示例:
  bun run publish-blog.mjs 2026-05-16-langchain
  bun run publish-blog.mjs --post-dir posts/2026-05-16-langchain --blog-slug langchain-interrupt
  bun run publish-blog.mjs 2026-05-16-langchain --auto-rebase
`);
}

function buildBlogFm(fm) {
  // 管线专用字段不写入博客文章：coverImage（微信轨专用）、sourceUrl（微信轨引用）、blogSlug（发布定位）、targetPath（自定义路径）。
  const excluded = ["infographicPosition", "coverImage", "sourceUrl", "blogSlug", "targetPath"];
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

// date-slug -> blog slug：优先使用 --blog-slug，其次 frontmatter.blogSlug，否则去掉前导日期。
// 项目硬规则：blog slug 必须为小写 ASCII kebab-case，禁止中文。
function validateBlogSlug(slug, label) {
  if (!ASCII_SLUG_RE.test(slug)) {
    process.stderr.write(`publish-blog: ${label} "${slug}" 不符合 ASCII kebab-case 规则（${ASCII_SLUG_RE}）\n`);
    process.exit(2);
  }
  return slug;
}

function resolveBlogSlug(dateSlug, explicitSlug, frontmatterSlug) {
  if (explicitSlug) return validateBlogSlug(explicitSlug, "--blog-slug");
  if (frontmatterSlug) return validateBlogSlug(frontmatterSlug, "frontmatter.blogSlug");

  const m = dateSlug.match(/^\d{4}-\d{2}-\d{2}-(.+)$/);
  const auto = m ? m[1] : dateSlug;
  return validateBlogSlug(auto, "自动生成的 blog slug");
}

function validateSourceUrl(fm, slug) {
  if (!fm.sourceUrl) return;
  const expected = `https://ntlx.github.io/articles/${slug}`;
  if (fm.sourceUrl.replace(/\/+$/, "") !== expected) {
    process.stderr.write(`publish-blog: frontmatter.sourceUrl (${fm.sourceUrl}) 与 blog slug (${slug}) 不一致，应为 ${expected}\n`);
    process.exit(2);
  }
}

function assertMainBranchIfNeeded(opts) {
  if (opts.noPush || opts.allowNonMain) return;
  const branch = captureStdout("git", ["branch", "--show-current"]);
  if (branch !== "main") {
    process.stderr.write("publish-blog: 当前分支非 main，拒绝发布（使用 --allow-non-main 跳过检查）\n");
    process.exit(6);
  }
}

const opts = parseArgs(process.argv.slice(2));
// --post-dir 可替代位置参数 date-slug：提取 posts/ 前缀后的最后路径段
if (!opts.slug && opts.postDir) {
  const normalized = opts.postDir.replace(/\\/g, "/");
  const stripped = normalized.replace(/^posts\//, "");
  opts.slug = stripped.split("/").filter(Boolean).pop() || null;
}
if (!opts.slug) {
  process.stderr.write("usage: publish-blog.mjs <date-slug> [--blog-slug <ascii-slug>] [--target-path <path>] [--no-push] [--no-build] [--dry-run] [--overwrite] [--allow-non-main]\n");
  process.exit(1);
}

const dateSlug = opts.slug;
const articlePath = resolve(postsRoot(), dateSlug, "article.md");
if (!existsSync(articlePath)) {
  process.stderr.write(`publish-blog: ${articlePath} 不存在\n`);
  process.exit(2);
}

const raw = readFileSync(articlePath, "utf8");
const fm = parseFrontmatter(raw);
if (!fm) {
  process.stderr.write("publish-blog: article.md 缺少 frontmatter\n");
  process.exit(2);
}
const body = extractBody(raw);

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

const slug = resolveBlogSlug(dateSlug, opts.blogSlug, fm.blogSlug);

// 目标路径解析：CLI --target-path > frontmatter.targetPath > 默认 articles/{blogSlug}
const customTargetPath = opts.targetPath || fm.targetPath || null;
const relativePath = customTargetPath || `articles/${slug}`;
const targetPath = resolve(repoRoot(), "src/content/docs", `${relativePath}.md`);

// sourceUrl 一致性检查：仅在默认路径（articles/{blogSlug}）下执行。
// 自定义 targetPath 时（如教程策略），sourceUrl 指向博文实际地址，不与 blogSlug 绑定。
if (!customTargetPath) {
  validateSourceUrl(fm, slug);
}

const blogFm = buildBlogFm(fm);
const blogContent = blogFm + body;

if (opts.dryRun) {
  process.stdout.write(`[dry-run] would write ${targetPath} (${blogContent.length} bytes)\n`);
  process.stdout.write(blogFm);
  process.exit(0);
}

assertMainBranchIfNeeded(opts);

if (existsSync(targetPath) && !opts.overwrite) {
  process.stderr.write(`publish-blog: ${targetPath} 已存在（使用 --overwrite 强制覆盖）\n`);
  process.exit(5);
}

// 覆盖前自动备份已有文件
let backupPath = null;
if (existsSync(targetPath) && opts.overwrite) {
  const ts = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "").replace("T", "T");
  backupPath = resolve(repoRoot(), "src/content/docs", `${relativePath}.backup-${ts}.md`);
  copyFileSync(targetPath, backupPath);
  process.stdout.write(`backup: ${backupPath}\n`);
}

// 确保目标目录存在（自定义 targetPath 可能指向新目录）
mkdirSync(dirname(targetPath), { recursive: true });

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
  // src/content/docs can be matched by broad ignore rules like "docs/".
  // The target path is script-owned output, so force-add only this article.
  run("git", ["add", "--force", targetPath], { cwd: repoRoot() });
  const tmpl = opts.commitTemplate ?? `post: ${fm.title} (${slug})`;
  run("git", ["commit", "-m", tmpl], { cwd: repoRoot() });

  // Step 6: git push（软执行，失败 => 写 RESUME.md，进程仍正常退出）
  let pushStatus = trySpawn("git", ["push", "origin", "HEAD:main"], { cwd: repoRoot() });

  // --auto-rebase: push reject 时自动 pull --rebase 再 push（最多 1 次）
  if (pushStatus !== 0 && opts.autoRebase) {
    process.stdout.write("publish-blog: push rejected, attempting auto-rebase...\n");
    const rebaseStatus = trySpawn("git", ["pull", "--rebase", "origin", "main"], { cwd: repoRoot() });
    if (rebaseStatus === 0) {
      pushStatus = trySpawn("git", ["push", "origin", "HEAD:main"], { cwd: repoRoot() });
      if (pushStatus === 0) {
        process.stdout.write("publish-blog: auto-rebase succeeded, push completed\n");
      }
    } else {
      process.stderr.write(`publish-blog: auto-rebase failed (pull --rebase exited ${rebaseStatus}), falling back to blocked state\n`);
    }
  }

  if (pushStatus === 0) {
    pushed = true;
  } else {
    pushBlocked = true;
    pushError = `git push exited with ${pushStatus}`;
    process.stderr.write(`publish-blog: ${pushError} — commit 已完成，写入 RESUME.md 并标记 blocked\n`);
  }
}

const sha = opts.noPush ? null : captureStdout("git", ["rev-parse", "HEAD"]);

// 写 RESUME.md（push 失败时必须；push 成功时不写）
let resumeFile = null;
if (pushBlocked) {
  const resumePath = resolve(postsRoot(), dateSlug, "RESUME.md");
  const resumeBody = `# 流水线断点续跑指引

> 自动生成于 ${new Date().toISOString()}
> 触发原因：Step 6.1 (publish-blog) git push 失败 — ${pushError}

## 当前状态

- **Step 6.1 (博客发布)**：commit 已创建（${sha}），但 **push 未完成**，状态 = \`blocked\`
- **Step 6.2 (微信发布)**：未执行；默认可跳过 sourceUrl 探活并预填微信"阅读原文"链接

## 需要手动完成的操作

\`\`\`bash
# 方式 1: 自动 rebase（推荐）
bun run .agents/skills/wechat-article-write/scripts/publish-blog.mjs ${dateSlug} --auto-rebase --no-build

# 方式 2: 手动推送
git pull --rebase origin main && git push origin HEAD:main

# 方式 3: 使用 gh cli 绕过 SSH
gh repo sync   # 如已配置远端

# 验证推送成功
git log origin/main..HEAD   # 应为空
\`\`\`

## 推送成功后继续执行的步骤

\`\`\`bash
SLUG="${dateSlug}"

# Step 6 微信发布
bun run .agents/skills/wechat-article-write/scripts/publish-wechat.mjs --post-dir posts/"$SLUG"
\`\`\`

如需等 GitHub Pages 部署完成并强制探活，再给 publish-wechat.mjs 传 \`--no-skip-deploy-check\`。

## 排查 push 失败常见原因

- SSH 端口被阻断 → 切换到 HTTPS：\`git remote set-url origin https://github.com/<owner>/<repo>.git\`
- 网络代理未生效 → 确认 \`git config --get http.proxy\`
- GitHub 临时不可用 → 稍后重试
`;
  writeFileSync(resumePath, resumeBody);
  process.stdout.write(`written: ${resumePath}\n`);
  resumeFile = "RESUME.md";
}

// 写 state：push 成功 = done；push 失败或 --no-push = blocked
if (opts.noPush) {
  markBlogDone(dateSlug, {
    pushed: false,
    extra: { commit: null, blog_slug: slug, pushed: false, no_push: true, local_only: true },
  });
  process.stderr.write("publish-blog: --no-push enabled; local article written but blog state is blocked until commit/push completes.\n");
} else if (pushBlocked) {
  const stateExtra = { commit: sha, blog_slug: slug, pushed: false, push_error: pushError, resume_file: resumeFile };
  markBlogDone(dateSlug, { pushed: false, extra: stateExtra });
  process.stderr.write("publish-blog: push failed but commit succeeded. Run 'git push origin HEAD:main' manually then mark step complete.\n");
} else {
  const stateExtra = { commit: sha, blog_slug: slug, pushed };
  markBlogDone(dateSlug, { pushed: true, extra: stateExtra });
}

process.stdout.write(JSON.stringify({
  slug,
  target: targetPath,
  commit: sha,
  pushed,
  no_push: opts.noPush,
  blocked: pushBlocked || opts.noPush,
  resume_file: resumeFile,
  backup: backupPath,
}) + "\n");

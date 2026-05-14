#!/usr/bin/env bun
/**
 * 博客发布轨一键编排（Step 9）
 *
 * 行为:
 *   1. 校验：frontmatter 含 title / date / summary / category（在 6 枚举内）
 *   2. 转换：summary→description、加 $schema: starlight、删 coverImage / sourceUrl
 *   3. 写入：复制为 src/content/docs/articles/<slug>.md（slug = date-slug 去掉日期前缀）
 *   4. 构建：npx astro sync && npm run build（任一非零立即中止）
 *   5. 提交：git add / git commit / git push（commit msg 模板可用 --commit-template）
 *   6. 写状态：bun run state.mjs set <date-slug> 9 done '{"commit":"<sha>","slug":"<slug>"}'
 *
 * 用法:
 *   bun run publish-blog.mjs <date-slug> [--no-push] [--no-build] [--dry-run]
 * 退出码:
 *   0 成功；1 参数错误；2 frontmatter 校验失败；3 构建失败；4 git 失败
 */

import { existsSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { spawnSync } from "node:child_process";

const VALID_CATEGORIES = ["ai-coding", "ai-agents", "ai-industry", "ai-models", "security", "engineering"];
const SCRIPT_DIR = dirname(new URL(import.meta.url).pathname);

function postsRoot() {
  return resolve(process.env.PIPELINE_POSTS_ROOT ?? "posts");
}
function repoRoot() {
  return resolve(process.env.PIPELINE_REPO_ROOT ?? ".");
}

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: "inherit", encoding: "utf8", ...opts });
  if (r.status !== 0) {
    process.stderr.write(`publish-blog: ${cmd} ${args.join(" ")} exited with ${r.status}\n`);
    process.exit(opts.failExit ?? 4);
  }
  return r;
}

function captureStdout(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: "utf8" });
  if (r.status !== 0) return null;
  return r.stdout.trim();
}

function parseArgs(argv) {
  const opts = { noPush: false, noBuild: false, dryRun: false, slug: null, commitTemplate: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--no-push") opts.noPush = true;
    else if (a === "--no-build") opts.noBuild = true;
    else if (a === "--dry-run") opts.dryRun = true;
    else if (a === "--commit-template") opts.commitTemplate = argv[++i];
    else if (!opts.slug) opts.slug = a;
  }
  return opts;
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

// date-slug -> blog slug：去掉前导日期 YYYY-MM-DD- 后剩下的部分
function blogSlug(dateSlug) {
  const m = dateSlug.match(/^\d{4}-\d{2}-\d{2}-(.+)$/);
  return m ? m[1] : dateSlug;
}

const opts = parseArgs(process.argv.slice(2));
if (!opts.slug) {
  process.stderr.write("usage: publish-blog.mjs <date-slug> [--no-push] [--no-build] [--dry-run] [--commit-template TEMPLATE]\n");
  process.exit(1);
}

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

const slug = blogSlug(dateSlug);
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

// git push
if (!opts.noPush) {
  run("git", ["add", targetPath], { cwd: repoRoot() });
  const tmpl = opts.commitTemplate ?? `post: ${fm.title} (${slug})`;
  run("git", ["commit", "-m", tmpl], { cwd: repoRoot() });
  run("git", ["push"], { cwd: repoRoot() });
}

const sha = captureStdout("git", ["rev-parse", "HEAD"]);

// 写 state
spawnSync("bun", [
  "run", resolve(SCRIPT_DIR, "state.mjs"),
  "set", dateSlug, "9", "done",
  JSON.stringify({ commit: sha, slug }),
], { stdio: "inherit", cwd: repoRoot() });

process.stdout.write(JSON.stringify({ slug, target: targetPath, commit: sha, pushed: !opts.noPush }) + "\n");

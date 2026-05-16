#!/usr/bin/env bun
/**
 * path-resolver.mjs — 单一来源的路径工具函数
 *
 * 13 个脚本曾各自重复定义 postsRoot / repoRoot / statePath，
 * 现统一导出，所有脚本从此文件 import。
 *
 * resolveBase() 还修复了 step25 的路径双重拼接 bug：
 *   传入 "posts/slug" → 正确返回 "posts/slug"，而非 "posts/posts/slug"
 */

import { resolve, basename } from "node:path";
import { existsSync } from "node:fs";

export function repoRoot() {
  return resolve(process.env.PIPELINE_REPO_ROOT ?? ".");
}

export function postsRoot() {
  return resolve(process.env.PIPELINE_POSTS_ROOT ?? "posts");
}

export function statePath(slug) {
  return resolve(postsRoot(), slug, ".pipeline-state.json");
}

/**
 * resolveBase — 把用户传入的 slug / 路径 / 文件路径 统一解析为
 *               posts 目录下的绝对路径。
 *
 * 支持 5 种输入形式：
 *   1. 纯 slug:         "2026-05-16-langchain"  → postsRoot()/slug
 *   2. 相对路径（含 posts/）: "posts/2026-05-16-langchain" → 去掉前缀 posts/
 *   3. 绝对路径:         "/full/path/posts/slug" → 直接使用
 *   4. 文件路径:         "posts/slug/draft.md"   → 取 dirname
 *   5. legacy 双重拼接:  "posts/posts/slug"      → 去掉重复的 posts/
 *
 * 如果已经是 postsRoot() 下的绝对路径，直接返回。
 * 否则，去掉可能的 "posts/" 前缀后，拼到 postsRoot() 下。
 */
export function resolveBase(slugOrPath) {
  if (!slugOrPath) return null;

  // STRICT 模式：拒绝路径输入，只接受纯 date-slug
  const STRICT = process.env.PIPELINE_STRICT_SLUG === "1";
  if (STRICT && (slugOrPath.includes("/") || slugOrPath.includes("\\"))) {
    process.stderr.write(`path-resolver: STRICT mode rejects path input "${slugOrPath}"\n`);
    process.exit(1);
  }

  const pr = postsRoot();
  const abs = resolve(slugOrPath);

  // 已经在 postsRoot 下 → 直接返回
  if (abs.startsWith(pr + "/") || abs === pr) return abs;

  // 含文件名 → 取 dirname 再重新走解析
  if (abs.includes(".") && !abs.endsWith("/")) {
    const dir = resolve(abs + "/..");
    if (dir.startsWith(pr + "/")) return dir;
  }

  // 去掉 "posts/" 或 "posts/posts/" 前缀后拼到 postsRoot()
  let cleaned = slugOrPath;
  // legacy double-join: "posts/posts/slug" → "slug"
  if (cleaned.startsWith("posts/posts/")) {
    cleaned = cleaned.slice("posts/posts/".length);
  } else if (cleaned.startsWith("posts/")) {
    cleaned = cleaned.slice("posts/".length);
  }

  return resolve(pr, cleaned);
}

/**
 * resolveSlug — 从 base 路径反向提取 date-slug（写状态时需要）
 */
export function resolveSlug(slugOrPath) {
  const base = resolveBase(slugOrPath);
  return basename(base);
}

/**
 * findSkillDir — 按优先级查找技能目录
 * 项目级 > 用户级 > 全局插件
 */
export function findSkillDir(skillName) {
  const candidates = [
    resolve(repoRoot(), ".agents/skills", skillName),
    resolve(process.env.HOME ?? "", ".claude/skills", skillName),
    resolve(
      process.env.HOME ?? "",
      ".claude/plugins/cache/claude-plugins-official/skills",
      skillName,
    ),
  ];
  for (const d of candidates) {
    if (existsSync(d)) return d;
  }
  return null;
}

/**
 * findGithubScriptDir — 查找 github-image-hosting 技能目录
 * 项目级 > 用户级
 */
export function findGithubScriptDir() {
  const candidates = [
    resolve(repoRoot(), ".agents/skills/github-image-hosting"),
    resolve(process.env.HOME ?? "", ".claude/skills/github-image-hosting"),
  ];
  for (const d of candidates) {
    if (existsSync(d)) return d;
  }
  return null;
}
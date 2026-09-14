#!/usr/bin/env bun
/**
 * path-resolver.mjs — 路径工具函数（精简版）
 *
 * 所有脚本统一使用纯 date-slug，不再接受路径/文件路径等输入。
 */

import { resolve } from "node:path";

/** 本项目 checkout 的根目录，锚定在本模块自身位置，与进程 cwd 和环境变量无关。 */
export const PROJECT_ROOT = resolve(import.meta.dir, "../../../..");

export function repoRoot() {
  return resolve(process.env.PIPELINE_REPO_ROOT ?? ".");
}

export function postsRoot() {
  return resolve(process.env.PIPELINE_POSTS_ROOT ?? "posts");
}

/**
 * 文生图后端按进程 cwd 解析项目级 `.baoyu-skills` 配置，因此 Step 4 必须从项目根目录执行，
 * 否则会静默回落到环境级（用户主目录）配置。
 * PIPELINE_REPO_ROOT 显式重定义项目时以它为准；PIPELINE_POSTS_ROOT 只重定向数据目录，不豁免此约束。
 */
export function assertProjectCwd() {
  const expected = process.env.PIPELINE_REPO_ROOT ? resolve(process.env.PIPELINE_REPO_ROOT) : PROJECT_ROOT;
  const cwd = process.cwd();
  if (cwd !== expected) {
    throw new Error(
      `Step 4 must run from the project root ${expected} (cwd is ${cwd}); ` +
      "raster generation would otherwise resolve environment-level backend configuration",
    );
  }
}

export function statePath(slug) {
  return resolve(postsRoot(), slug, ".pipeline-state.json");
}

/** 解析 posts/<slug> 的绝对路径 */
export function postDir(slug) {
  return resolve(postsRoot(), slug);
}
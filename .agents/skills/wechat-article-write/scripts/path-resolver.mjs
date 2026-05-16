#!/usr/bin/env bun
/**
 * path-resolver.mjs — 路径工具函数（精简版）
 *
 * 所有脚本统一使用纯 date-slug，不再接受路径/文件路径等输入。
 */

import { resolve } from "node:path";

export function repoRoot() {
  return resolve(process.env.PIPELINE_REPO_ROOT ?? ".");
}

export function postsRoot() {
  return resolve(process.env.PIPELINE_POSTS_ROOT ?? "posts");
}

export function statePath(slug) {
  return resolve(postsRoot(), slug, ".pipeline-state.json");
}

/** 解析 posts/<slug> 的绝对路径 */
export function postDir(slug) {
  return resolve(postsRoot(), slug);
}
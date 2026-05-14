#!/usr/bin/env bun
/**
 * 流水线状态库 — 供所有 Step 脚本 import 使用，避免重复 spawn。
 *
 * 用法:
 *   import { loadState, saveState, writeStep } from "./state-lib.mjs";
 *   writeStep(dateSlug, "5", "done", { article_md: "article.md" });
 *
 * 每个函数都接受 PIPELINE_POSTS_ROOT 环境变量（默认 "posts"）。
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const STEPS = ["0", "1", "2", "2.5", "3", "4", "4.5", "4.6", "5", "6", "7", "8", "9", "9.5", "10"];
const VALID_STATUS = new Set(["pending", "running", "done", "failed", "skipped", "blocked"]);

function postsRoot() {
  return resolve(process.env.PIPELINE_POSTS_ROOT ?? "posts");
}

function statePath(slug) {
  return resolve(postsRoot(), slug, ".pipeline-state.json");
}

/** 加载已有状态，不存在则返回 null */
export function loadState(slug) {
  const p = statePath(slug);
  if (!existsSync(p)) return null;
  try { return JSON.parse(readFileSync(p, "utf8")); } catch { return null; }
}

/** 写状态文件（自动创建目录） */
export function saveState(slug, state) {
  const p = statePath(slug);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify(state, null, 2) + "\n");
}

/** 初始化状态（如果不存在） */
export function initState(slug) {
  if (loadState(slug)) return loadState(slug);
  const state = { date_slug: slug, started_at: new Date().toISOString(), steps: {} };
  saveState(slug, state);
  return state;
}

/** 写入某一步的状态（自动初始化 + 校验） */
export function writeStep(slug, step, status, extra) {
  if (!STEPS.includes(step)) {
    process.stderr.write(`state-lib: unknown step "${step}". valid: ${STEPS.join(",")}\n`);
    return false;
  }
  if (!VALID_STATUS.has(status)) {
    process.stderr.write(`state-lib: invalid status "${status}". valid: ${[...VALID_STATUS].join(",")}\n`);
    return false;
  }
  const state = initState(slug);
  state.steps[step] = { status, at: new Date().toISOString(), ...(extra ?? {}) };
  saveState(slug, state);
  return true;
}

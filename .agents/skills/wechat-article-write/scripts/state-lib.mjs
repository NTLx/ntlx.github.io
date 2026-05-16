#!/usr/bin/env bun
/**
 * 流水线状态库 — 精简版。
 *
 * 状态结构:
 *   { slug, started_at, last_complete_step: number, failed_step: { step, error } | null }
 *
 * last_complete_step: 0 表示尚未开始，1-6 表示已完成的步骤。
 * state.mjs next 返回 last_complete_step + 1。
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { statePath } from "./path-resolver.mjs";

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
  const existing = loadState(slug);
  if (existing) return existing;
  const state = { slug, started_at: new Date().toISOString(), last_complete_step: 0, failed_step: null };
  saveState(slug, state);
  return state;
}

/** 标记某一步完成 */
export function markStepDone(slug, step, extra = {}) {
  const state = initState(slug);
  state.last_complete_step = step;
  state.failed_step = null;
  Object.assign(state, extra);
  saveState(slug, state);
  return true;
}

/** 标记某一步失败 */
export function markStepFailed(slug, step, error) {
  const state = initState(slug);
  state.failed_step = { step, error, at: new Date().toISOString() };
  saveState(slug, state);
  return true;
}

/** 获取下一个应执行的步骤编号 */
export function nextStep(slug) {
  const state = loadState(slug);
  if (!state) return 1;
  if (state.failed_step) return state.failed_step.step;
  return Math.min(state.last_complete_step + 1, 6);
}
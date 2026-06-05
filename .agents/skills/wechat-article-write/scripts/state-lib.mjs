#!/usr/bin/env bun
/**
 * 流水线状态库 — v2（支持 Step 6 博客/微信子状态）
 *
 * 状态结构:
 *   {
 *     slug, started_at,
 *     last_complete_step: number,   // 1-6（Step 6 表示至少一项发布完成）
 *     publish: {
 *       blog: "done" | "blocked" | "failed" | "pending",
 *       wechat: "done" | "failed" | "pending"
 *     },
 *     failed_step: { step, error, at } | null
 *   }
 *
 * Step 0: 尚未开始；Step 1-5: 对应流水线步骤；Step 6: 发布（至少一项完成）
 * nextStep() 在全部完成（博客 done + 微信 done）时返回 "done"
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { statePath } from "./path-resolver.mjs";

const DEFAULT_PUBLISH = { blog: "pending", wechat: "pending" };
const RESERVED_STATE_KEYS = new Set([
  "slug",
  "started_at",
  "last_complete_step",
  "publish",
  "failed_step",
]);

function applyExtra(state, extra = {}) {
  for (const [key, value] of Object.entries(extra ?? {})) {
    if (RESERVED_STATE_KEYS.has(key)) continue;
    state[key] = value;
  }
}

/** 加载已有状态，不存在则返回 null */
export function loadState(slug) {
  const p = statePath(slug);
  if (!existsSync(p)) return null;
  try {
    const state = JSON.parse(readFileSync(p, "utf8"));
    let changed = false;
    if (state.slug !== slug) {
      state.slug = slug;
      changed = true;
    }
    if (!state.publish) {
      state.publish = { ...DEFAULT_PUBLISH };
      changed = true;
    }
    if (changed) saveState(slug, state);
    return state;
  } catch {
    return null;
  }
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
  if (existing) {
    // v1→v2 迁移: 补 publish 字段
    if (!existing.publish) existing.publish = { ...DEFAULT_PUBLISH };
    return existing;
  }
  const state = {
    slug,
    started_at: new Date().toISOString(),
    last_complete_step: 0,
    publish: { ...DEFAULT_PUBLISH },
    failed_step: null,
  };
  saveState(slug, state);
  return state;
}

/** 标记某一步完成（Step 1-5 使用；Step 6 建议用 markBlogDone/markWechatDone） */
export function markStepDone(slug, step, extra = {}) {
  const state = initState(slug);
  state.last_complete_step = step;
  state.failed_step = null;
  if (step === 6) {
    // 向后兼容：如果直接标记 Step 6 done，设置双轨完成
    state.publish = { blog: "done", wechat: "done" };
  }
  applyExtra(state, extra);
  saveState(slug, state);
  return true;
}

/** 标记某一步失败 */
export function markStepFailed(slug, step, error) {
  const state = initState(slug);
  state.failed_step = { step, error, at: new Date().toISOString() };
  // 同时写 publish 子状态（如果是 Step 6.1/6.2）
  if (step === 6.1) state.publish = { ...state.publish, blog: "failed" };
  if (step === 6.2) state.publish = { ...state.publish, wechat: "failed" };
  saveState(slug, state);
  return true;
}

/** 标记博客发布完成/阻塞 */
export function markBlogDone(slug, { pushed, extra = {} } = {}) {
  const state = initState(slug);
  state.last_complete_step = 6;
  state.failed_step = null;
  state.publish = { ...state.publish, blog: pushed ? "done" : "blocked" };
  applyExtra(state, extra);
  saveState(slug, state);
  return true;
}

/** 标记微信发布完成 */
export function markWechatDone(slug, extra = {}) {
  const state = initState(slug);
  state.last_complete_step = 6;
  state.failed_step = null;
  state.publish = { ...state.publish, wechat: "done" };
  applyExtra(state, extra);
  saveState(slug, state);
  return true;
}

/** 标记微信发布失败 */
export function markWechatFailed(slug, error) {
  const state = initState(slug);
  state.publish = { ...state.publish, wechat: "failed" };
  state.failed_step = { step: 6.2, error, at: new Date().toISOString() };
  saveState(slug, state);
  return true;
}

/** 获取下一个应执行的步骤编号 */
export function nextStep(slug) {
  const state = loadState(slug);
  if (!state) return 1;

  // 有失败步骤 → 从失败步骤恢复
  if (state.failed_step) return state.failed_step.step;

  const pub = state.publish ?? DEFAULT_PUBLISH;
  const allDone = state.last_complete_step >= 6 && pub.blog === "done" && pub.wechat === "done";

  // 如果 Step 6 全部完成 → "done"
  if (allDone) return "done";

  // 如果 Step 5 完成但发布未全部完成 → 返回 6
  if (state.last_complete_step >= 6) return 6;

  // 如果发布部分完成但 last_complete_step < 6，需要补足
  if ((pub.blog !== "pending" || pub.wechat !== "pending") && state.last_complete_step < 6) {
    return 6;
  }

  return Math.min(state.last_complete_step + 1, 6);
}

/** 检查流水线是否全部完成 */
export function isComplete(slug) {
  return nextStep(slug) === "done";
}

/** 获取发布子状态 */
export function getPublishState(slug) {
  const state = loadState(slug);
  if (!state) return { ...DEFAULT_PUBLISH };
  return state.publish ?? { ...DEFAULT_PUBLISH };
}

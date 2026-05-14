#!/usr/bin/env bun
/**
 * .pipeline-state.json 读写工具
 *
 * 用法:
 *   bun run state.mjs init <date-slug>
 *   bun run state.mjs get  <date-slug> <step>            # 输出 status，无记录则输出 "pending"
 *   bun run state.mjs set  <date-slug> <step> <status> [json-extra]
 *   bun run state.mjs next <date-slug>                   # 输出第一个非 done 的 step 编号
 *   bun run state.mjs dump <date-slug>                   # 输出整个 state JSON
 *
 * Step 编号顺序（与 SKILL.md 概览表保持一致）:
 *   "0","1","2","2.5","3","4","4.5","4.6","5","6","7","8","9","9.5","10"
 *
 * 退出码: 0 成功；1 参数错误；2 文件不存在或解析失败；3 step 编号不在白名单
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const STEPS = ["0", "1", "2", "2.5", "3", "4", "4.5", "4.6", "5", "6", "7", "8", "9", "9.5", "10"];
const VALID_STATUS = new Set(["pending", "running", "done", "failed", "skipped"]);

function postsRoot() {
  return resolve(process.env.PIPELINE_POSTS_ROOT ?? "posts");
}

function statePath(slug) {
  return resolve(postsRoot(), slug, ".pipeline-state.json");
}

function loadState(slug) {
  const p = statePath(slug);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch (e) {
    process.stderr.write(`state.mjs: failed to parse ${p}: ${e.message}\n`);
    process.exit(2);
  }
}

function saveState(slug, state) {
  const p = statePath(slug);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify(state, null, 2) + "\n");
}

function ensureStep(step) {
  if (!STEPS.includes(step)) {
    process.stderr.write(`state.mjs: unknown step "${step}". valid: ${STEPS.join(",")}\n`);
    process.exit(3);
  }
}

function init(slug) {
  if (loadState(slug)) return;
  saveState(slug, {
    date_slug: slug,
    started_at: new Date().toISOString(),
    steps: {},
  });
}

function get(slug, step) {
  ensureStep(step);
  const state = loadState(slug);
  const entry = state?.steps?.[step];
  process.stdout.write((entry?.status ?? "pending") + "\n");
}

function set(slug, step, status, extraJson) {
  ensureStep(step);
  if (!VALID_STATUS.has(status)) {
    process.stderr.write(`state.mjs: invalid status "${status}". valid: ${[...VALID_STATUS].join(",")}\n`);
    process.exit(1);
  }
  init(slug);
  const state = loadState(slug);
  const extra = extraJson ? JSON.parse(extraJson) : {};
  state.steps[step] = { status, at: new Date().toISOString(), ...extra };
  saveState(slug, state);
}

function next(slug) {
  const state = loadState(slug);
  if (!state) {
    process.stdout.write("0\n");
    return;
  }
  for (const s of STEPS) {
    const entry = state.steps?.[s];
    if (!entry || entry.status !== "done" && entry.status !== "skipped") {
      process.stdout.write(s + "\n");
      return;
    }
  }
  process.stdout.write("complete\n");
}

function dump(slug) {
  const state = loadState(slug);
  if (!state) {
    process.exit(2);
  }
  process.stdout.write(JSON.stringify(state, null, 2) + "\n");
}

const [, , cmd, slug, step, status, extra] = process.argv;
if (!cmd || !slug) {
  process.stderr.write("usage: state.mjs <init|get|set|next|dump> <date-slug> [step] [status] [json-extra]\n");
  process.exit(1);
}
switch (cmd) {
  case "init": init(slug); break;
  case "get":  get(slug, step); break;
  case "set":  set(slug, step, status, extra); break;
  case "next": next(slug); break;
  case "dump": dump(slug); break;
  default:
    process.stderr.write(`state.mjs: unknown subcommand "${cmd}"\n`);
    process.exit(1);
}

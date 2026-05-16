#!/usr/bin/env bun
/**
 * .pipeline-state.json CLI 工具
 *
 * 用法:
 *   bun run state.mjs init <date-slug>
 *   bun run state.mjs get  <date-slug> <step>            # 输出 status，无记录则输出 "pending"
 *   bun run state.mjs set  <date-slug> <step> <status> [json-extra]
 *   bun run state.mjs next <date-slug>                   # 输出第一个非 done 的 step 编号
 *   bun run state.mjs dump <date-slug>                   # 输出整个 state JSON
 *
 * 所有逻辑从 state-lib.mjs 导入，CLI 只做参数解析和输出格式化。
 */

import { loadState, saveState, STEPS, VALID_STATUS } from "./state-lib.mjs";

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
    if (entry && entry.status === "blocked") {
      process.stdout.write(`blocked:${s}\n`);
      return;
    }
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
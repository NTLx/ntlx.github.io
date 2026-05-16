#!/usr/bin/env bun
/**
 * state-watch.mjs — 监控 .pipeline-state.json 变化，实时打印步骤状态转换
 *
 * 用法:
 *   bun run state-watch.mjs <date-slug> [--watch]
 *
 * --watch: 持续监控模式（轮询间隔 2 秒）；不加则一次性打印当前状态。
 *
 * 输出格式: [HH:MM:SS] step X: old_status → new_status
 */

import { existsSync, readFileSync, watchFile, unwatchFile } from "node:fs";
import { statePath } from "./path-resolver.mjs";

const args = process.argv.slice(2);
let slug = null, watchMode = false;
for (const a of args) {
  if (a === "--watch") watchMode = true;
  else slug = a;
}
if (!slug) {
  process.stderr.write("usage: state-watch.mjs <date-slug> [--watch]\n");
  process.exit(1);
}

function timeStr() {
  const d = new Date();
  return [d.getHours(), d.getMinutes(), d.getSeconds()].map((v) => String(v).padStart(2, "0")).join(":");
}

function printState(state) {
  for (const [step, entry] of Object.entries(state.steps ?? {})) {
    process.stdout.write(`[${timeStr()}] step ${step}: ${entry.status} (at ${entry.at})\n`);
  }
}

const sp = statePath(slug);

if (!watchMode) {
  if (!existsSync(sp)) {
    process.stderr.write(`state-watch: no state file for "${slug}"\n`);
    process.exit(2);
  }
  const state = JSON.parse(readFileSync(sp, "utf8"));
  printState(state);
  process.exit(0);
}

// 持续监控模式
process.stdout.write(`[${timeStr()}] watching ${sp} ...\n`);

let prevState = null;

if (existsSync(sp)) {
  prevState = JSON.parse(readFileSync(sp, "utf8"));
  printState(prevState);
}

watchFile(sp, { interval: 2000 }, () => {
  if (!existsSync(sp)) return;
  try {
    const newState = JSON.parse(readFileSync(sp, "utf8"));
    if (!prevState) {
      printState(newState);
      prevState = newState;
      return;
    }
    for (const [step, entry] of Object.entries(newState.steps ?? {})) {
      const old = prevState.steps?.[step]?.status ?? "pending";
      const newS = entry.status;
      if (old !== newS) {
        process.stdout.write(`[${timeStr()}] step ${step}: ${old} → ${newS}\n`);
      }
    }
    prevState = newState;
  } catch {
    // state 文件可能正在写入中，忽略
  }
});

// Ctrl+C 退出
process.on("SIGINT", () => {
  unwatchFile(sp);
  process.stdout.write(`\n[${timeStr()}] stopped watching\n`);
  process.exit(0);
});
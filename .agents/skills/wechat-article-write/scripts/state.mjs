#!/usr/bin/env bun
/**
 * .pipeline-state.json CLI — 精简版
 *
 * 用法:
 *   bun run state.mjs init <date-slug>
 *   bun run state.mjs get  <date-slug>              # 输出 last_complete_step
 *   bun run state.mjs next <date-slug>              # 输出下一个应执行的 step 编号
 *   bun run state.mjs done <date-slug> <step>       # 标记 step 完成
 *   bun run state.mjs fail <date-slug> <step> <err> # 标记 step 失败
 *   bun run state.mjs dump <date-slug>              # 输出完整 state JSON
 */

import { initState, loadState, markStepDone, markStepFailed, nextStep } from "./state-lib.mjs";

function fail(msg) { process.stderr.write(`state.mjs: ${msg}\n`); process.exit(1); }

const [, , cmd, slug, ...args] = process.argv;
if (!cmd || !slug) {
  process.stderr.write("usage: state.mjs <init|get|next|done|fail|dump> <date-slug> [args...]\n");
  process.exit(1);
}

switch (cmd) {
  case "init":
    initState(slug);
    process.stdout.write("ok\n");
    break;
  case "get": {
    const s = loadState(slug);
    process.stdout.write(s ? String(s.last_complete_step) : "0\n");
    break;
  }
  case "next": {
    process.stdout.write(String(nextStep(slug)) + "\n");
    break;
  }
  case "done": {
    const step = parseInt(args[0], 10);
    if (!step || step < 1 || step > 6) fail(`invalid step: ${args[0]}`);
    markStepDone(slug, step);
    process.stdout.write(`ok: step ${step} done\n`);
    break;
  }
  case "fail": {
    const step = parseInt(args[0], 10);
    const err = args.slice(1).join(" ") || "unknown error";
    if (!step || step < 1 || step > 6) fail(`invalid step: ${args[0]}`);
    markStepFailed(slug, step, err);
    process.stdout.write(`ok: step ${step} failed (${err})\n`);
    break;
  }
  case "dump": {
    const s = loadState(slug);
    if (!s) fail(`no state for "${slug}"`);
    process.stdout.write(JSON.stringify(s, null, 2) + "\n");
    break;
  }
  default:
    fail(`unknown subcommand "${cmd}"`);
}
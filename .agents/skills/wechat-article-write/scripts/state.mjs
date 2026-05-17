#!/usr/bin/env bun
/**
 * .pipeline-state.json CLI — v2（支持 Step 6 子状态）
 *
 * 用法:
 *   bun run state.mjs init  <date-slug>
 *   bun run state.mjs get   <date-slug>              # 输出 last_complete_step
 *   bun run state.mjs next  <date-slug>              # 输出下一个 step 或 "done"
 *   bun run state.mjs done  <date-slug> <step>       # 标记 step 完成
 *   bun run state.mjs fail  <date-slug> <step> <err> # 标记 step 失败
 *   bun run state.mjs blog  <date-slug> <done|blocked> # 博客发布子状态
 *   bun run state.mjs wechat <date-slug> <done|failed> [error] # 微信子状态
 *   bun run state.mjs dump  <date-slug>              # 输出完整 state JSON
 */

import {
  initState, loadState,
  markStepDone, markStepFailed,
  markBlogDone, markWechatDone, markWechatFailed,
  nextStep, isComplete, getPublishState
} from "./state-lib.mjs";

function fail(msg) { process.stderr.write(`state.mjs: ${msg}\n`); process.exit(1); }

const [, , cmd, slug, ...args] = process.argv;
if (!cmd || !slug) {
  process.stderr.write("usage: state.mjs <init|get|next|done|fail|blog|wechat|dump> <date-slug> [args...]\n");
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
    const n = nextStep(slug);
    process.stdout.write(String(n) + "\n");
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
    const step = parseFloat(args[0]); // 支持 6.1/6.2
    const err = args.slice(1).join(" ") || "unknown error";
    if (!step || step < 1 || step > 6) fail(`invalid step: ${args[0]}`);
    markStepFailed(slug, step, err);
    process.stdout.write(`ok: step ${step} failed (${err})\n`);
    break;
  }
  case "blog": {
    const sub = args[0];
    if (sub === "done") { markBlogDone(slug, { pushed: true }); process.stdout.write("ok: blog done\n"); }
    else if (sub === "blocked") { markBlogDone(slug, { pushed: false }); process.stdout.write("ok: blog blocked\n"); }
    else fail(`blog subcommand: done|blocked, got "${sub}"`);
    break;
  }
  case "wechat": {
    const sub = args[0];
    const err = args.slice(1).join(" ") || "";
    if (sub === "done") { markWechatDone(slug); process.stdout.write("ok: wechat done\n"); }
    else if (sub === "failed") { markWechatFailed(slug, err || "wechat publish failed"); process.stdout.write(`ok: wechat failed (${err || "wechat publish failed"})\n`); }
    else fail(`wechat subcommand: done|failed, got "${sub}"`);
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
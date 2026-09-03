#!/usr/bin/env bun
/** Small state-v2 CLI used to resume the article workflow. */

import {
  initState, loadState, markBlogDone, markStepDone, markStepFailed,
  markWechatDone, markWechatFailed, nextStep, getPublishState, setStrategy,
} from "./state-lib.mjs";

const STRATEGIES = new Set(["reader-response", "tutorial", "news-digest"]);
const COMMANDS = new Set(["init", "get", "next", "done", "fail", "blog", "wechat", "dump", "strategy"]);

function usage() {
  process.stdout.write(`state.mjs <command> <date-slug> [args...]\n\ninit/get/next/dump: inspect or create state\ndone/fail: mark a numeric Step 1-6\nblog: done|blocked|get\nwechat: done|failed|get [error]\nstrategy: set|get (reader-response|tutorial|news-digest)\n`);
}

function fail(message) { process.stderr.write(`state.mjs: ${message}\n`); process.exit(1); }

const args = process.argv.slice(2);
if (args[0] === "--help" || args.length === 0) { usage(); process.exit(args.length ? 0 : 1); }
const cmd = args[0];
if (!COMMANDS.has(cmd)) fail(`unknown command ${cmd}`);
let slug = args[1];
let rest = args.slice(2);
if (slug === "--slug") { slug = args[2]; rest = args.slice(3); }
if (!slug || !/^\d{4}-\d{2}-\d{2}-/.test(slug)) fail("missing or invalid <date-slug>");

switch (cmd) {
  case "init": initState(slug, rest[0]); process.stdout.write("ok\n"); break;
  case "get": process.stdout.write(`${loadState(slug)?.last_complete_step ?? 0}\n`); break;
  case "next": process.stdout.write(`${nextStep(slug)}\n`); break;
  case "done": {
    const step = Number(rest[0]);
    if (!Number.isInteger(step) || step < 1 || step > 6) fail("done expects Step 1-6");
    markStepDone(slug, step); process.stdout.write(`ok: step ${step} done\n`); break;
  }
  case "fail": {
    const step = Number(rest[0]);
    if (!Number.isFinite(step) || step < 1 || step > 6) fail("fail expects Step 1-6");
    const error = rest.slice(1).join(" ") || "unknown error";
    markStepFailed(slug, step, error); process.stdout.write(`ok: step ${step} failed\n`); break;
  }
  case "blog": {
    const action = rest[0];
    if (action === "done") markBlogDone(slug, { pushed: true });
    else if (action === "blocked") markBlogDone(slug, { pushed: false });
    else if (action === "get") { process.stdout.write(`${getPublishState(slug).blog}\n`); break; }
    else fail("blog expects done|blocked|get");
    process.stdout.write(`ok: blog ${action}\n`); break;
  }
  case "wechat": {
    const action = rest[0];
    if (action === "done") markWechatDone(slug);
    else if (action === "failed") markWechatFailed(slug, rest.slice(1).join(" ") || "wechat publish failed");
    else if (action === "get") { process.stdout.write(`${getPublishState(slug).wechat}\n`); break; }
    else fail("wechat expects done|failed|get");
    process.stdout.write(`ok: wechat ${action}\n`); break;
  }
  case "strategy": {
    const action = rest[0];
    if (action === "set") {
      if (!STRATEGIES.has(rest[1])) fail(`invalid strategy: ${rest[1] ?? "(missing)"}`);
      setStrategy(slug, rest[1]); process.stdout.write(`ok: strategy=${rest[1]}\n`);
    } else if (action === "get") process.stdout.write(`${loadState(slug)?.strategy ?? "unset"}\n`);
    else fail("strategy expects set|get");
    break;
  }
  case "dump": {
    const state = loadState(slug);
    if (!state) fail(`no state for ${slug}`);
    process.stdout.write(JSON.stringify(state, null, 2) + "\n"); break;
  }
}

#!/usr/bin/env bun
/**
 * .pipeline-state.json CLI — v2.1（支持 --slug 标志 + 改善错误提示）
 *
 * 用法:
 *   bun run state.mjs init  <date-slug>
 *   bun run state.mjs get   <date-slug>              # 输出 last_complete_step
 *   bun run state.mjs next  <date-slug>              # 输出下一个 step 或 "done"
 *   bun run state.mjs done  <date-slug> <step>       # 标记 step 完成
 *   bun run state.mjs fail  <date-slug> <step> <err> # 标记 step 失败
 *   bun run state.mjs blog  <date-slug> <done|blocked|get> # 博客发布子状态
 *   bun run state.mjs wechat <date-slug> <done|failed|get> [error] # 微信子状态
 *   bun run state.mjs dump  <date-slug>              # 输出完整 state JSON
 *
 * 所有子命令都支持 --slug <date-slug> 替代位置参数：
 *   bun run state.mjs wechat --slug <date-slug> done
 *   bun run state.mjs blog --slug <date-slug> get
 */

import {
  initState, loadState,
  markStepDone, markStepFailed,
  markBlogDone, markWechatDone, markWechatFailed,
  nextStep, getPublishState, setStrategy
} from "./state-lib.mjs";
import { isKnownStrategy, nextStageFromStep, stageReadRef } from "./workflow.mjs";

const KNOWN_COMMANDS = new Set(["init", "get", "next", "done", "fail", "blog", "wechat", "dump", "stage", "strategy"]);

function fail(msg) { process.stderr.write(`state.mjs: ${msg}\n`); process.exit(1); }

// 解析参数：支持 --slug 标志和位置参数两种风格
function parseGlobalArgs(argv) {
  if (/^\d{4}-\d{2}-\d{2}-/.test(argv[0] ?? "") && KNOWN_COMMANDS.has(argv[1])) {
    return { cmd: argv[1], slug: argv[0], rest: argv.slice(2) };
  }

  let cmd = null;
  let slug = null;
  const rest = [];

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--slug" && argv[i + 1]) {
      slug = argv[++i];
    } else if (a === "--help" || a === "-h") {
      printUsage();
      process.exit(0);
    } else if (!cmd) {
      cmd = a;
    } else if (!slug) {
      slug = a;
    } else {
      rest.push(a);
    }
  }

  return { cmd, slug, rest };
}

function printUsage() {
  process.stdout.write(`state.mjs — 流水线状态管理 CLI

用法:
  state.mjs <command> <date-slug> [args...]
  state.mjs <command> --slug <date-slug> [args...]

命令:
  init  <date-slug>                     初始化状态
  get   <date-slug>                     输出 last_complete_step
  next  <date-slug>                     输出下一个 step 或 "done"
  done  <date-slug> <step>              标记 step 完成（1-6）
  fail  <date-slug> <step> [error]      标记 step 失败
  blog  <date-slug> <done|blocked|get>  博客发布子状态
  wechat <date-slug> <done|failed|get> [error]  微信发布子状态
  dump  <date-slug>                     输出完整 state JSON
  stage <date-slug> next                输出下一个命名阶段（prepare/research/draft/…；未选策略→unknown）
  strategy <date-slug> set <name>       设置当前文章的写作策略（reader-response|tutorial|news-digest）
  strategy <date-slug> get              查看当前策略

示例:
  state.mjs init  2026-05-23-my-article
  state.mjs wechat 2026-05-23-my-article done
  state.mjs wechat --slug 2026-05-23-my-article failed "API error"
  state.mjs blog --slug 2026-05-23-my-article get
`);
}

const { cmd, slug, rest } = parseGlobalArgs(process.argv.slice(2));

if (!cmd) {
  printUsage();
  process.exit(1);
}
if (!slug) {
  fail(`missing <date-slug>. Usage: state.mjs ${cmd} <date-slug> [args...]\n  或使用 --slug 标志: state.mjs ${cmd} --slug <date-slug> [args...]`);
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
    const step = parseInt(rest[0], 10);
    if (!step || step < 1 || step > 6) fail(`invalid step: ${rest[0]} (expected 1-6)`);
    markStepDone(slug, step);
    process.stdout.write(`ok: step ${step} done\n`);
    break;
  }
  case "fail": {
    const step = parseFloat(rest[0]); // 支持 6.1/6.2
    const err = rest.slice(1).join(" ") || "unknown error";
    if (!step || step < 1 || step > 6) fail(`invalid step: ${rest[0]} (expected 1-6, supports decimals like 6.1/6.2)`);
    markStepFailed(slug, step, err);
    process.stdout.write(`ok: step ${step} failed (${err})\n`);
    break;
  }
  case "blog": {
    const sub = rest[0];
    if (sub === "done") { markBlogDone(slug, { pushed: true }); process.stdout.write("ok: blog done\n"); }
    else if (sub === "blocked") { markBlogDone(slug, { pushed: false }); process.stdout.write("ok: blog blocked\n"); }
    else if (sub === "get") { const pub = getPublishState(slug); process.stdout.write(pub.blog + "\n"); }
    else fail(`blog subcommand: done|blocked|get, got "${sub}"\n  用法: state.mjs blog <date-slug> <done|blocked|get>`);
    break;
  }
  case "wechat": {
    const sub = rest[0];
    const err = rest.slice(1).join(" ") || "";
    if (sub === "done") { markWechatDone(slug); process.stdout.write("ok: wechat done\n"); }
    else if (sub === "failed") { markWechatFailed(slug, err || "wechat publish failed"); process.stdout.write(`ok: wechat failed (${err || "wechat publish failed"})\n`); }
    else if (sub === "get") { const pub = getPublishState(slug); process.stdout.write(pub.wechat + "\n"); }
    else fail(`wechat subcommand: done|failed|get, got "${sub}"\n  用法: state.mjs wechat <date-slug> <done|failed|get> [error]`);
    break;
  }
  case "stage": {
    const sub = rest[0];
    if (sub === "next") {
      const s = loadState(slug);
      const last = s?.last_complete_step ?? 0;
      const pub = s?.publish ?? { blog: "pending", wechat: "pending" };
      const strategy = s?.strategy;
      if (!isKnownStrategy(strategy)) {
        process.stdout.write("unknown\n");
        process.stdout.write(`WARN: 状态未记录写作策略（strategy）。命名阶段无法推导。\n`);
        process.stdout.write(`  旧状态（数字 Step）仍然有效；如需命名阶段，请先设置: state.mjs strategy set ${slug} <reader-response|tutorial|news-digest>\n`);
        break;
      }
      const next = nextStageFromStep(strategy, last, pub);
      process.stdout.write(next + "\n");
      process.stdout.write(`Read: ${stageReadRef(strategy, next)}\n`);
    } else fail(`stage subcommand: next, got "${sub}"\n  用法: state.mjs stage <date-slug> next`);
    break;
  }
  case "strategy": {
    const sub = rest[0];
    if (sub === "set") {
      const name = rest[1];
      if (!isKnownStrategy(name)) {
        fail(`无效策略: ${name ?? "(missing)"}。可选: reader-response, tutorial, news-digest`);
      }
      setStrategy(slug, name);
      process.stdout.write(`ok: strategy=${name}\n`);
    } else if (sub === "get") {
      const s = loadState(slug);
      process.stdout.write(`${s?.strategy ?? "unset"}\n`);
    } else {
      fail(`strategy subcommand: set|get, got "${sub}"\n  用法: state.mjs strategy <date-slug> <set <name>|get>`);
    }
    break;
  }
  case "dump": {
    const s = loadState(slug);
    if (!s) fail(`no state for "${slug}"`);
    process.stdout.write(JSON.stringify(s, null, 2) + "\n");
    break;
  }
  default:
    fail(`unknown command "${cmd}". Known: init, get, next, done, fail, blog, wechat, dump, stage, strategy`);
}

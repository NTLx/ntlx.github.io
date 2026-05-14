#!/usr/bin/env bun
/**
 * 轮询 GitHub Pages 直到目标 URL 返回 HTTP 200。
 *
 * 用法:
 *   bun run wait-pages-deployed.mjs <slug> [--date-slug <date-slug>] [--timeout 180] [--interval 10]
 * 行为:
 *   - 目标 URL: https://ntlx.github.io/articles/<slug>/
 *   - 默认 180s 超时，每 10s 探测一次（HEAD 失败回退 GET）
 *   - 成功返回 0，超时返回 2，参数错误返回 1
 *   - 成功/超时时自动写 .pipeline-state.json（Step 9.5 done/skipped）
 * 备注:
 *   底层只用标准 fetch（Bun 内置），不引入额外 deps；
 *   上层若需要登录/动态渲染，请改用 web-access 技能。本脚本仅做存活探测。
 */

import { writeStep } from "./state-lib.mjs";

const args = process.argv.slice(2);
let slug = null;
let dateSlug = null;
let timeoutSec = 180;
let intervalSec = 10;
let baseUrl = "https://ntlx.github.io/articles";

for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--timeout") timeoutSec = +args[++i];
  else if (a === "--interval") intervalSec = +args[++i];
  else if (a === "--base") baseUrl = args[++i];
  else if (a === "--date-slug") dateSlug = args[++i];
  else if (!slug) slug = a;
}

if (!slug) {
  process.stderr.write("usage: wait-pages-deployed.mjs <slug> [--date-slug <date-slug>] [--timeout 180] [--interval 10] [--base URL]\n");
  process.exit(1);
}

// date-slug 默认回退为 slug
if (!dateSlug) dateSlug = slug;

const target = `${baseUrl.replace(/\/$/, "")}/${slug}/`;
const deadline = Date.now() + timeoutSec * 1000;

async function probe() {
  try {
    const r = await fetch(target, { method: "HEAD", redirect: "follow" });
    if (r.ok) return r.status;
    if (r.status === 405 || r.status === 501) {
      const g = await fetch(target, { method: "GET", redirect: "follow" });
      return g.status;
    }
    return r.status;
  } catch (e) {
    return -1;
  }
}

process.stdout.write(`waiting for ${target} (timeout ${timeoutSec}s)\n`);
let attempt = 0;
while (Date.now() < deadline) {
  attempt++;
  const code = await probe();
  if (code === 200) {
    process.stdout.write(`ok: ${target} -> 200 (after ${attempt} probes)\n`);
    writeStep(dateSlug, "9.5", "done", { url: target, probes: attempt });
    process.exit(0);
  }
  process.stdout.write(`  attempt ${attempt}: status=${code}; sleep ${intervalSec}s\n`);
  await new Promise((r) => setTimeout(r, intervalSec * 1000));
}

process.stderr.write(`timeout: ${target} not reachable within ${timeoutSec}s\n`);
writeStep(dateSlug, "9.5", "skipped", { url: target, reason: "timeout", probes: attempt });
process.exit(2);

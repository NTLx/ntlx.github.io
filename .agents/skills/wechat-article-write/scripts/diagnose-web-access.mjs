#!/usr/bin/env bun
/**
 * web-access 启动问题诊断（只读探测，不修复）
 *
 * 用法:
 *   bun run diagnose-web-access.mjs [--port 9222] [--verbose]
 *
 * 输出: 多维度状态 + 建议
 */

import { spawnSync } from "node:child_process";

const port = process.argv.find((_a, i) => process.argv[i - 1] === "--port") ?? "9222";
const verbose = process.argv.includes("--verbose");

const checks = [];

// 1. 端口占用情况
const lsof = spawnSync("lsof", ["-i", `:${port}`, "-sTCP:LISTEN", "-Pn"], { encoding: "utf8" });
checks.push({ name: `port ${port}`, status: lsof.status === 0 ? "in-use" : "free", detail: lsof.stdout });

// 2. Chrome 进程
const ps = spawnSync("ps", ["-eo", "pid,command"], { encoding: "utf8" });
const chromeLines = (ps.stdout ?? "").split("\n").filter((l) => /Google Chrome/.test(l) && !/grep/.test(l));
checks.push({ name: "chrome processes", status: chromeLines.length > 0 ? `${chromeLines.length} found` : "none" });

// 3. CDP /json/version
const curl = spawnSync("curl", ["-sf", "--max-time", "1", `http://127.0.0.1:${port}/json/version`], { encoding: "utf8" });
checks.push({ name: "cdp /json/version", status: curl.status === 0 ? "ok" : "unreachable", detail: curl.stdout });

// 输出
for (const c of checks) {
  process.stdout.write(`${c.name.padEnd(28)} ${c.status}\n`);
  if (verbose && c.detail) process.stdout.write(c.detail.split("\n").map((l) => `    ${l}`).join("\n") + "\n");
}

// 给建议
process.stdout.write("\n建议：\n");
if (checks[0].status === "free" && checks[1].status === "none") {
  process.stdout.write("  1. 手动启动 Chrome 并开启远程调试：\n");
  process.stdout.write(`     /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=${port}\n`);
  process.stdout.write("  2. 首次启动时 Chrome 可能弹出授权窗口，请点击允许\n");
  process.stdout.write("  3. 重新调用 web-access\n");
} else if (checks[0].status === "in-use" && checks[2].status === "unreachable") {
  process.stdout.write("  端口被占用但 CDP 不响应，可能是非 Chrome 进程占用\n");
  process.stdout.write("  建议运行 lsof -i :9222 -Pn 查看占用进程，或换一个端口\n");
} else if (checks[0].status === "in-use" && checks[2].status === "ok") {
  process.stdout.write("  CDP 端点正常响应，可直接调用 web-access\n");
} else if (checks[0].status === "free" && chromeLines.length > 0) {
  process.stdout.write("  Chrome 已在运行但未开启远程调试端口\n");
  process.stdout.write("  建议关闭 Chrome 后重新以 --remote-debugging-port 启动\n");
}

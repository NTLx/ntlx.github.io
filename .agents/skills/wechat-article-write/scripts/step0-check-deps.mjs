#!/usr/bin/env bun
/**
 * Step 0: 依赖预检与安装
 *
 * 用法:
 *   bun run step0-check-deps.mjs <date-slug> [--skills web-access,github-image-hosting,baoyu-format-markdown,baoyu-markdown-to-html,baoyu-post-to-wechat,baoyu-infographic]
 *
 * 行为:
 *   1. 检查每个技能的 scripts/node_modules 是否存在
 *   2. 对缺失的依赖执行 bun install --cwd {skillDir}/scripts
 *   3. 检测脚本类型（TypeScript vs Bash）
 *   4. 写状态: step 0 done
 *
 * 退出码: 0 全部就绪；1 参数错误；2 安装失败
 */

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { writeStep, writeRunning } from "./state-lib.mjs";
import { findSkillDir } from "./path-resolver.mjs";

const DEFAULT_SKILLS = [
  "web-access",
  "github-image-hosting",
  "baoyu-format-markdown",
  "baoyu-markdown-to-html",
  "baoyu-post-to-wechat",
  "baoyu-infographic",
];

function parseArgs(argv) {
  const o = { slug: null, skills: DEFAULT_SKILLS.slice() };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--skills" && argv[i + 1]) {
      o.skills = argv[i + 1].split(",");
      i++;
    } else if (!o.slug) {
      o.slug = argv[i];
    }
  }
  return o;
}

const opts = parseArgs(process.argv.slice(2));
if (!opts.slug) {
  process.stderr.write("usage: step0-check-deps.mjs <date-slug> [--skills s1,s2,...]\n");
  process.exit(1);
}

writeRunning(opts.slug, "0");

const results = { installed: [], ready: [], failed: [] };

for (const skill of opts.skills) {
  const skillDir = findSkillDir(skill);
  if (!skillDir) {
    results.failed.push(skill);
    process.stderr.write(`step0: skill "${skill}" not found in any search path\n`);
    continue;
  }
  const scriptsDir = resolve(skillDir, "scripts");
  const nodeModules = resolve(scriptsDir, "node_modules");
  if (!existsSync(nodeModules)) {
    process.stdout.write(`  installing ${skill}...\n`);
    const r = spawnSync("bun", ["install", "--cwd", scriptsDir], { stdio: "pipe", encoding: "utf8" });
    if (r.status === 0) {
      results.installed.push(skill);
    } else {
      results.failed.push(skill);
      process.stderr.write(`step0: bun install failed for ${skill}: ${r.stderr}\n`);
    }
  } else {
    results.ready.push(skill);
  }
}

// CDP 健康预检（Theme G）：非阻塞警告，不影响管线继续
const CDP_PORT = process.env.CDP_PORT ?? 9222;
const cdpProbe = spawnSync("curl", ["-fsSL", "--max-time", "2", `http://127.0.0.1:${CDP_PORT}/json/version`], { encoding: "utf8", stdio: "pipe" });
if (cdpProbe.status !== 0) {
  process.stderr.write(
    `\n⚠ CDP 未就绪 (127.0.0.1:${CDP_PORT})。web-access 技能需要 Chrome DevTools Protocol。\n` +
    `  启动方式: /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=${CDP_PORT}\n` +
    `  如本文不需要联网访问，可忽略此警告。\n\n`
  );
  results.cdp_warn = true;
} else {
  process.stdout.write(`  CDP: 127.0.0.1:${CDP_PORT} ✓\n`);
}

// 写状态
const status = results.failed.length === 0 ? "done" : "failed";
writeStep(opts.slug, "0", status, {
  installed: results.installed,
  ready: results.ready,
  failed: results.failed,
  cdp: cdpProbe.status === 0 ? "ready" : "unreachable",
});

// 报告
process.stdout.write(`\n依赖预检完成！\n- 已安装: [${results.installed.join(", ")}]\n- 已就绪: [${results.ready.join(", ")}]\n`);
if (results.failed.length > 0) {
  process.stderr.write(`- 失败: [${results.failed.join(", ")}]\n`);
  process.exit(2);
}

process.exit(0);

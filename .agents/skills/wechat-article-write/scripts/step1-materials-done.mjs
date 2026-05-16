#!/usr/bin/env bun
/**
 * Step 1: 资料收集完成后的状态写入 + 抓取质量后置校验
 *
 * 用法:
 *   bun run step1-materials-done.mjs <date-slug> [--sources N] [--failed N]
 *
 * 在 Agent 完成资料收集（web-access 或用户手动提供）后执行。
 * 验证 materials.md 存在，并检测低质量来源（per-source 字数/段落/反爬模板）。
 *
 * 质量不达标时写 blocked 状态 + exit 2，引导 agent 重抓。
 * 环境变量 SKIP_VALIDATE_STEP1=1 可绕过质量校验。
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { writeStep, writeRunning } from "./state-lib.mjs";
import { postsRoot } from "./path-resolver.mjs";

const args = process.argv.slice(2);
let slug = null, sources = 0, failed = 0;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--sources" && args[i + 1]) { sources = +args[++i]; }
  else if (args[i] === "--failed" && args[i + 1]) { failed = +args[++i]; }
  else if (!slug) { slug = args[i]; }
}
if (!slug) { process.stderr.write("usage: step1-materials-done.mjs <date-slug> [--sources N] [--failed N]\n"); process.exit(1); }

writeRunning(slug, "1");

const base = resolve(postsRoot(), slug);
const matPath = resolve(base, "materials.md");
if (!existsSync(matPath)) { process.stderr.write("step1: materials.md missing\n"); process.exit(2); }

const matContent = readFileSync(matPath, "utf8");

// Per-source 质量检测：按 ## 分段逐 source 检测
function detectLowQualitySources(content) {
  const parts = content.split(/^## /m).slice(1);
  const lowQuality = [];

  for (const part of parts) {
    const lines = part.split("\n");
    const titleLine = lines[0].trim();
    const body = lines.slice(1).join("\n");
    const charCount = body.replace(/\s/g, "").length;
    const paragraphCount = body.split(/\n\s*\n/).filter((p) => p.trim().length > 30).length;

    const issues = [];
    if (charCount < 500) issues.push(`正文过短 (${charCount} 字)`);
    if (paragraphCount < 3) issues.push(`段落过少 (${paragraphCount} 段)`);
    if (/please\s+enable\s+javascript|access\s+denied|cloudflare|just\s+a\s+moment/i.test(body)) {
      issues.push("疑似反爬/登录墙模板");
    }

    if (issues.length > 0) {
      lowQuality.push({ source: titleLine, issues, char_count: charCount });
    }
  }

  return lowQuality;
}

const lowQuality = detectLowQualitySources(matContent);
const matChars = matContent.length;

// 环境变量绕过
const skipValidate = process.env.SKIP_VALIDATE_STEP1 === "1";

if (lowQuality.length > 0 && !skipValidate) {
  writeStep(slug, "1", "blocked", { reason: "low-quality-sources", low_quality: lowQuality, sources, failed, chars: matChars });
  process.stderr.write(`\nstep1: 检测到 ${lowQuality.length} 个低质量来源：\n`);
  for (const lq of lowQuality) {
    process.stderr.write(`  - ${lq.source}\n`);
    for (const issue of lq.issues) process.stderr.write(`      · ${issue}\n`);
  }
  process.stderr.write(`\n建议：\n`);
  process.stderr.write(`  1. 通过 web-access 的 CDP 模式重抓（绕过 Jina 静态抓取）\n`);
  process.stderr.write(`  2. 若来源是 SPA / 反爬严重，手工浏览后粘贴正文到 materials.md\n`);
  process.stderr.write(`  3. 若来源已不可达，从 archive.org 等镜像站获取\n`);
  process.stderr.write(`  4. 重抓后重新跑 step1-materials-done.mjs\n`);
  process.stderr.write(`  5. 紧急绕过：SKIP_VALIDATE_STEP1=1\n`);
  process.exit(2);
}

if (lowQuality.length > 0 && skipValidate) {
  process.stderr.write(`\n⚠ 资料质量警告（SKIP_VALIDATE_STEP1=1 已绕过阻断）：\n`);
  for (const lq of lowQuality) {
    process.stderr.write(`  - ${lq.source}: ${lq.issues.join(", ")}\n`);
  }
  process.stderr.write("\n");
}

const stateExtra = { sources, failed, chars: matChars, low_quality: lowQuality.length > 0 ? lowQuality : undefined };
writeStep(slug, "1", "done", stateExtra);
process.stdout.write(JSON.stringify({ slug, step: 1, sources, failed, chars: matChars, low_quality: lowQuality }) + "\n");
process.exit(0);

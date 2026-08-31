#!/usr/bin/env bun
/**
 * validate-understanding.mjs — understanding-brief.md 的确定性 Gate
 *
 * 它只检查 brief 是否具备可执行的结构和最小完整度，不判断 Agent
 * 采用了哪一个 Skill，也不把某个 Skill 的输出当成成功标准。
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { markStepFailed } from "./state-lib.mjs";
import { postDir } from "./path-resolver.mjs";

const args = process.argv.slice(2);
const slug = args.find((arg) => !arg.startsWith("--"));
const json = args.includes("--json");

if (!slug) {
  process.stderr.write("usage: validate-understanding.mjs <date-slug> [--json]\n");
  process.exit(1);
}

const briefPath = resolve(postDir(slug), "understanding-brief.md");
const requiredSections = [
  "原始材料结构",
  "核心问题链",
  "中心论点下钻",
  "反方与边界",
  "可写成正文的判断",
  "可视觉化的节点",
  "写作契约",
];

function sectionBody(text, heading) {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`);
  if (start === -1) return null;
  const body = [];
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i])) break;
    body.push(lines[i]);
  }
  return body.join("\n").trim();
}

function fail(message) {
  markStepFailed(slug, 2, message);
  if (json) process.stdout.write(JSON.stringify({ slug, ok: false, errors: [message] }) + "\n");
  else process.stderr.write(`validate-understanding: FAIL - ${message}\n`);
  process.exit(2);
}

if (!existsSync(briefPath)) fail(`understanding-brief.md missing: ${briefPath}`);
const text = readFileSync(briefPath, "utf8");
if (!text.trim()) fail("understanding-brief.md is empty");
if (!/^#\s+Understanding Brief\s*$/m.test(text)) {
  fail("understanding-brief.md must start with # Understanding Brief");
}

const missing = requiredSections.filter((heading) => !sectionBody(text, heading));
if (missing.length > 0) fail(`missing or empty sections: ${missing.join(", ")}`);

const contract = sectionBody(text, "写作契约");
const commitments = (contract.match(/^\s*[-*]\s+\S.+$/gm) ?? []).length;
if (commitments < 3) {
  fail(`写作契约至少需要 3 条可执行增量承诺，当前 ${commitments} 条`);
}

const result = { slug, ok: true, brief: briefPath, sections: requiredSections.length };
if (json) process.stdout.write(JSON.stringify(result) + "\n");
else process.stdout.write(`validate-understanding: OK (${briefPath})\n`);

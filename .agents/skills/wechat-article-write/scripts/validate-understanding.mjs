#!/usr/bin/env bun
/**
 * validate-understanding.mjs — understanding-brief.md 的确定性 Gate
 *
 * 它只检查 brief 是否具备可执行的结构和最小完整度，不判断 Agent
 * 采用了哪一个 Skill，也不把某个 Skill 的输出当成成功标准。
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadState, markStepDone, markStepFailed } from "./state-lib.mjs";
import { postDir } from "./path-resolver.mjs";
import { contentSections, LEDGER_HEADINGS } from "./claim-ledger-lib.mjs";

const args = process.argv.slice(2);
const slug = args.find((arg) => !arg.startsWith("--"));
const json = args.includes("--json");

if (!slug) {
  process.stderr.write("usage: validate-understanding.mjs <date-slug> [--json]\n");
  process.exit(1);
}

const briefPath = resolve(postDir(slug), "understanding-brief.md");
// These are minimum content areas, not a prescribed seven-section template.
// Main judges whether the evidence and reasoning are actually sound.
const strategy = loadState(slug)?.strategy;
const areas = [
  { name: "证据", headings: /原始材料|证据|材料来源|sources|evidence/i },
  { name: "中心判断", headings: /中心|核心判断|central|thesis/i },
  { name: "边界", headings: /边界|适用范围|局限|boundar|limitation|scope/i },
  { name: "写作应用", headings: /可写成正文|写作契约|写作应用|writing|application/i },
  { name: "允许援引的事实", headings: LEDGER_HEADINGS },
];
if (strategy === "tutorial") {
  areas[1].headings = /中心|核心判断|工程目标|教程目标|目标与预期|central|thesis|objective/i;
  areas[3].headings = /可写成正文|写作契约|写作应用|工程步骤|操作步骤|验证流程|writing|application|procedure/i;
}

function fail(message) {
  markStepFailed(slug, 1, message);
  if (json) process.stdout.write(JSON.stringify({ slug, ok: false, errors: [message] }) + "\n");
  else process.stderr.write(`validate-understanding: FAIL - ${message}\n`);
  process.exit(2);
}

if (!existsSync(briefPath)) fail(`understanding-brief.md missing: ${briefPath}`);
const text = readFileSync(briefPath, "utf8");
if (!text.trim()) fail("understanding-brief.md is empty");
const sections = contentSections(text);
const missing = areas.filter(({ headings }) => !sections.some(
  (section) => headings.test(section.heading) && section.body.trim(),
));
if (missing.length > 0) fail(`missing or empty content areas: ${missing.map(({ name }) => name).join(", ")}`);

const result = { slug, ok: true, brief: briefPath, sections: sections.length };
markStepDone(slug, 1, {
  understanding_brief: briefPath,
  understanding_sections: sections.length,
});
if (json) process.stdout.write(JSON.stringify(result) + "\n");
else process.stdout.write(`validate-understanding: OK (${briefPath})\n`);

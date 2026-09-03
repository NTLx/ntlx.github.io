#!/usr/bin/env bun
/** Dependency preflight for installed Skills and project-owned adapters. */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { repoRoot } from "./path-resolver.mjs";

const args = process.argv.slice(2);
const json = args.includes("--json");
const stageIndex = args.indexOf("--stage");
const stage = stageIndex >= 0 ? args[stageIndex + 1] ?? "all" : "all";
const validStages = new Set(["all", "architecture", "research", "writing", "images", "build", "publish"]);
if (!validStages.has(stage)) { process.stderr.write(`check-deps: unknown stage ${stage}\n`); process.exit(1); }

const root = repoRoot();
const errors = [];
const warnings = [];
const requirePath = (rel) => { if (!existsSync(resolve(root, rel))) errors.push(`missing: ${rel}`); };
const requireCodexImageConfig = () => {
  const rel = ".baoyu-skills/baoyu-image-gen/EXTEND.md";
  const path = resolve(root, rel);
  requirePath(rel);
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  const provider = text.match(/^\s*default_provider:\s*([^#\r\n]+)\s*$/mu)?.[1]?.trim();
  if (provider !== "codex-cli") errors.push("baoyu-image-gen default_provider must be codex-cli");
};
const warnPath = (rel) => { if (!existsSync(resolve(root, rel))) warnings.push(`missing optional config: ${rel}`); };
const skills = [
  "humanizer-zh", "baoyu-cover-image", "baoyu-xhs-images", "baoyu-infographic",
  "baoyu-diagram", "baoyu-image-gen", "github-image-hosting", "gzh-design",
];

if (stage === "all" || stage === "architecture") {
  const result = spawnSync(process.execPath, [resolve(root, ".agents/skills/wechat-article-write/scripts/validate-architecture.mjs"), "--json"], { encoding: "utf8" });
  try { const payload = JSON.parse(result.stdout ?? "{}"); errors.push(...(payload.errors ?? [])); warnings.push(...(payload.warnings ?? [])); }
  catch { errors.push("validate-architecture.mjs returned invalid JSON"); }
}
if (stage === "all" || stage === "writing" || stage === "images" || stage === "build") {
  for (const name of skills) requirePath(`.agents/skills/${name}/SKILL.md`);
}
if (stage === "all" || stage === "images") {
  requireCodexImageConfig();
}
if (stage === "all" || stage === "build") {
  requirePath(".agents/skills/gzh-design/scripts/validate_gzh_html.py");
  requirePath(".agents/skills/gzh-design/scripts/wrap_preview.py");
}
if (stage === "all" || stage === "publish") warnPath(".baoyu-skills/baoyu-post-to-wechat/EXTEND.md");
if (stage === "all" || stage === "publish") requirePath(".agents/skills/baoyu-post-to-wechat/SKILL.md");
if (stage === "all") warnPath(".baoyu-skills/.env");

const result = { ok: errors.length === 0, stage, errors, warnings };
if (json) process.stdout.write(JSON.stringify(result, null, 2) + "\n");
else {
  for (const warning of warnings) process.stderr.write(`check-deps: WARN - ${warning}\n`);
  for (const error of errors) process.stderr.write(`check-deps: FAIL - ${error}\n`);
  if (!errors.length) process.stdout.write(`check-deps: OK (${stage})\n`);
}
process.exit(errors.length ? 2 : 0);

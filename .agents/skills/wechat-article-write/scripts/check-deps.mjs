#!/usr/bin/env bun
/** Preflight for the workflow's direct Specialist dependencies. */

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { repoRoot } from "./path-resolver.mjs";

const args = process.argv.slice(2);
const json = args.includes("--json");
const stageIndex = args.indexOf("--stage");
const stage = stageIndex >= 0 ? args[stageIndex + 1] ?? "all" : "all";
const stages = new Set(["all", "architecture", "research", "writing", "images", "build", "publish"]);
if (!stages.has(stage)) {
  process.stderr.write(`check-deps: unknown stage ${stage}\n`);
  process.exit(1);
}

const root = repoRoot();
const errors = [];
const warnings = [];
const requirePath = (rel) => {
  if (!existsSync(resolve(root, rel))) errors.push(`missing: ${rel}`);
};
const directSpecialists = {
  writing: ["humanizer-zh"],
  images: ["baoyu-cover-image", "baoyu-infographic"],
  build: ["github-image-hosting", "gzh-design"],
  publish: ["baoyu-post-to-wechat"],
};

if (stage === "all" || stage === "architecture") {
  const result = spawnSync(process.execPath, [
    resolve(root, ".agents/skills/wechat-article-write/scripts/validate-architecture.mjs"),
    "--json",
  ], { encoding: "utf8" });
  try {
    const payload = JSON.parse(result.stdout ?? "{}");
    errors.push(...(payload.errors ?? []));
    warnings.push(...(payload.warnings ?? []));
  } catch {
    errors.push("validate-architecture.mjs returned invalid JSON");
  }
}

for (const [stageName, names] of Object.entries(directSpecialists)) {
  if (stage === "all" || stage === stageName) {
    for (const name of names) requirePath(`.agents/skills/${name}/SKILL.md`);
  }
}

const result = { ok: errors.length === 0, stage, errors, warnings };
if (json) process.stdout.write(JSON.stringify(result, null, 2) + "\n");
else {
  for (const warning of warnings) process.stderr.write(`check-deps: WARN - ${warning}\n`);
  for (const error of errors) process.stderr.write(`check-deps: FAIL - ${error}\n`);
  if (!errors.length) process.stdout.write(`check-deps: OK (${stage})\n`);
}
process.exit(errors.length ? 2 : 0);

#!/usr/bin/env bun
/**
 * Dependency preflight for wechat-article-write.
 *
 * This checks project-level configuration and template/patch dependencies.
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { repoRoot } from "./path-resolver.mjs";

const args = process.argv.slice(2);
const json = args.includes("--json");
let stage = "all";
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--stage") stage = args[++i] ?? "all";
  else if (args[i] === "--help") {
    printHelp();
    process.exit(0);
  }
}

const validStages = new Set(["all", "images", "publish"]);
if (!validStages.has(stage)) {
  process.stderr.write(`check-deps: unknown --stage "${stage}"\n`);
  printHelp();
  process.exit(1);
}

function printHelp() {
  process.stdout.write(`check-deps.mjs — wechat-article-write dependency preflight

Usage:
  bun run check-deps.mjs [--stage all|images|publish] [--json]
`);
}

const root = repoRoot();
const errors = [];
const warnings = [];

function requirePath(rel, label = rel) {
  const path = resolve(root, rel);
  if (!existsSync(path)) errors.push(`${label} missing: ${rel}`);
  return path;
}

function warnPath(rel, label = rel) {
  const path = resolve(root, rel);
  if (!existsSync(path)) warnings.push(`${label} missing: ${rel}`);
  return path;
}

function readIfExists(rel) {
  const path = resolve(root, rel);
  return existsSync(path) ? readFileSync(path, "utf8") : null;
}

function checkSkillDirs(names) {
  for (const name of names) {
    requirePath(`.agents/skills/${name}/SKILL.md`, `skill ${name}`);
  }
}

function checkProjectConfig() {
  requirePath(".baoyu-skills/.env", "project env");
  for (const rel of [
    ".baoyu-skills/baoyu-image-gen/EXTEND.md",
    ".baoyu-skills/baoyu-markdown-to-html/EXTEND.md",
    ".baoyu-skills/baoyu-post-to-wechat/EXTEND.md",
  ]) {
    requirePath(rel, "project EXTEND.md");
  }
}

function checkImageTemplates() {
  checkSkillDirs(["baoyu-cover-image", "baoyu-article-illustrator", "baoyu-image-gen", "baoyu-infographic"]);
  // baoyu-infographic 的 layouts/ 和 styles/ 目录是 SLOT 00 信息图 prompt 的模板来源。
  // 第三方技能可能升级或更换目录名，仅校验关键目录存在，不展开列举每个模板文件。
  requirePath(".agents/skills/baoyu-infographic/SKILL.md", "baoyu-infographic SKILL.md");
  warnPath(".agents/skills/baoyu-infographic/references/layouts", "baoyu-infographic layouts directory");
  warnPath(".agents/skills/baoyu-infographic/references/styles", "baoyu-infographic styles directory");
  requirePath(".agents/skills/wechat-article-write/references/image-template-map.json", "image template map");
  requirePath(".agents/skills/wechat-article-write/references/image-plan.schema.json", "image-plan schema");
}

function checkPublishDeps() {
  checkSkillDirs(["github-image-hosting", "baoyu-markdown-to-html", "baoyu-post-to-wechat"]);
}

checkProjectConfig();

if (stage === "all" || stage === "images") checkImageTemplates();
if (stage === "all" || stage === "publish") checkPublishDeps();

const result = { ok: errors.length === 0, stage, errors, warnings };
if (json) {
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
} else {
  for (const warning of warnings) process.stderr.write(`check-deps: WARN - ${warning}\n`);
  if (errors.length === 0) {
    process.stdout.write(`check-deps: OK (${stage})\n`);
  } else {
    for (const error of errors) process.stderr.write(`check-deps: FAIL - ${error}\n`);
  }
}

process.exit(errors.length === 0 ? 0 : 2);

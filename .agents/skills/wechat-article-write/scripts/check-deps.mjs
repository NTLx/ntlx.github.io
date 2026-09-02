#!/usr/bin/env bun
/**
 * Dependency preflight for wechat-article-write.
 *
 * This checks project-level configuration and template/patch dependencies.
 */

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { repoRoot } from "./path-resolver.mjs";
import { hardDependenciesForStage } from "./workflow.mjs";
import { runImageBackendChecks } from "./check-image-backend.mjs";

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

const validStages = new Set(["all", "architecture", "research", "writing", "images", "build", "publish"]);
if (!validStages.has(stage)) {
  process.stderr.write(`check-deps: unknown --stage "${stage}"\n`);
  printHelp();
  process.exit(1);
}

function printHelp() {
  process.stdout.write(`check-deps.mjs — wechat-article-write dependency preflight

Usage:
  bun run check-deps.mjs [--stage all|architecture|research|writing|images|build|publish] [--json]
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

function checkSkillDirs(names) {
  for (const name of names) {
    requirePath(`.agents/skills/${name}/SKILL.md`, `skill ${name}`);
  }
}

function checkSharedProjectEnv() {
  warnPath(".baoyu-skills/.env", "project env (发布凭据，CI/新 clone 可缺失)");
}

function checkImageConfig() {
  // Image dependencies are a repository/static contract.  Local Codex CLI
  // readiness belongs to the explicit check-image-backend runtime preflight.
  const result = runImageBackendChecks({ root, checkCli: false, checkEnv: false });
  for (const error of result.errors) errors.push(error);
  for (const warning of result.warnings) warnings.push(warning);
}

function checkBuildConfig() {
  // Build configuration is owned by the deterministic adapters below.
}

function checkPublishConfig() {
  for (const rel of [
    ".baoyu-skills/baoyu-post-to-wechat/EXTEND.md",
  ]) {
    warnPath(rel, "project EXTEND.md");
  }
}

function checkImageTemplates() {
  checkSkillDirs(hardDependenciesForStage("illustrate"));
  // The three core Baoyu design Skills and baoyu-diagram are installed
  // capabilities, while the Agent still decides which specialized contributor
  // is useful for a particular article.
  requirePath(".agents/skills/wechat-article-write/references/image-plan.schema.json", "image-plan schema");
  requirePath(".agents/skills/wechat-article-write/references/image-review.schema.json", "image-review schema");
  requirePath(".agents/skills/wechat-article-write/scripts/visual-plan-lib.mjs", "visual plan library");
  requirePath(".agents/skills/wechat-article-write/scripts/render-images-serial.mjs", "serial image renderer");
}

function checkBuildDeps() {
  checkSkillDirs(hardDependenciesForStage("build"));
  requirePath(".agents/skills/gzh-design/scripts/validate_gzh_html.py", "gzh validator");
  requirePath(".agents/skills/gzh-design/scripts/wrap_preview.py", "gzh preview wrapper");
}

function checkPublishDeps() {
  checkSkillDirs(hardDependenciesForStage("publish"));
}

// --stage architecture：委托 validate-architecture.mjs（纯静态架构契约校验）
function checkArchitecture() {
  const r = spawnSync(process.execPath, [resolve(import.meta.dir, "validate-architecture.mjs"), "--json"], {
    encoding: "utf8"
  });
  try {
    const result = JSON.parse(r.stdout ?? "{}");
    for (const e of result.errors ?? []) errors.push(e);
    for (const w of result.warnings ?? []) warnings.push(w);
  } catch {
    errors.push("validate-architecture.mjs 无法执行或输出非法 JSON");
  }
}

// --stage research：资料获取与理解能力由运行时 catalog 发现；没有固定 Skill 依赖。
function checkResearchDeps() {
  return;
}

// --stage writing：adapt + refine 的 mandatory writing protocol 去重并集。
function checkWritingDeps() {
  checkSkillDirs([
    ...new Set([
      ...hardDependenciesForStage("adapt"),
      ...hardDependenciesForStage("refine"),
    ]),
  ]);
}

checkSharedProjectEnv();

if (stage === "all" || stage === "architecture") {
  checkArchitecture();
}

if (stage === "all" || stage === "research") {
  checkResearchDeps();
}

if (stage === "all" || stage === "writing") {
  checkWritingDeps();
}

if (stage === "all" || stage === "images") {
  checkImageConfig();
  checkImageTemplates();
}

if (stage === "all" || stage === "build") {
  checkBuildConfig();
  checkBuildDeps();
}

if (stage === "all" || stage === "publish") {
  checkPublishConfig();
  checkPublishDeps();
}

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

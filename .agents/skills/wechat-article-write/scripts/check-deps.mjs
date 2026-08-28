#!/usr/bin/env bun
/**
 * Dependency preflight for wechat-article-write.
 *
 * This checks project-level configuration and template/patch dependencies.
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { repoRoot } from "./path-resolver.mjs";
import { requiredSkillsForStage } from "./workflow.mjs";

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

function readIfExists(rel) {
  const path = resolve(root, rel);
  return existsSync(path) ? readFileSync(path, "utf8") : null;
}

function checkSkillDirs(names) {
  for (const name of names) {
    requirePath(`.agents/skills/${name}/SKILL.md`, `skill ${name}`);
  }
}

function commandExists(command) {
  const r = spawnSync(command, ["--version"], { stdio: "ignore" });
  return !r.error && r.status === 0;
}

function checkSharedProjectEnv() {
  warnPath(".baoyu-skills/.env", "project env (发布凭据，CI/新 clone 可缺失)");
}

function checkImageConfig() {
  for (const rel of [
    ".baoyu-skills/baoyu-image-gen/EXTEND.md",
  ]) {
    warnPath(rel, "project EXTEND.md");
  }
}

function checkBuildConfig() {
  for (const rel of [
    ".baoyu-skills/baoyu-image-gen/EXTEND.md",
  ]) {
    warnPath(rel, "project EXTEND.md");
  }
}

function checkPublishConfig() {
  for (const rel of [
    ".baoyu-skills/baoyu-post-to-wechat/EXTEND.md",
  ]) {
    warnPath(rel, "project EXTEND.md");
  }
}

function checkImageTemplates() {
  checkSkillDirs(["baoyu-cover-image", "baoyu-article-illustrator", "baoyu-image-gen", "baoyu-infographic"]);
  if (!commandExists("codex")) {
    warnings.push("codex CLI unavailable: Step 4 defaults to baoyu-image-gen --provider codex-cli; install/login codex or use baoyu-image-gen fallback");
  }
  // baoyu-infographic 的 layouts/ 和 styles/ 目录是 SLOT 00 信息图 prompt 的模板来源。
  // 第三方技能可能升级或更换目录名，仅校验关键目录存在，不展开列举每个模板文件。
  requirePath(".agents/skills/baoyu-infographic/SKILL.md", "baoyu-infographic SKILL.md");
  warnPath(".agents/skills/baoyu-infographic/references/layouts", "baoyu-infographic layouts directory");
  warnPath(".agents/skills/baoyu-infographic/references/styles", "baoyu-infographic styles directory");
  requirePath(".agents/skills/wechat-article-write/references/image-template-map.json", "image template map");
  requirePath(".agents/skills/wechat-article-write/references/image-plan.schema.json", "image-plan schema");
}

function checkBuildDeps() {
  checkSkillDirs(["github-image-hosting", "gzh-design"]);
  requirePath(".agents/skills/gzh-design/scripts/validate_gzh_html.py", "gzh validator");
  requirePath(".agents/skills/gzh-design/scripts/wrap_preview.py", "gzh preview wrapper");
}

function checkPublishDeps() {
  checkSkillDirs(["baoyu-post-to-wechat"]);
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

// --stage research：所有策略在 research 阶段 required 技能的并集（workflow.mjs schema 来源）。
// news-digest 需要 aihot / reader-response 需要 ljg-qa+ljg-think；可选理解器不作为缺失阻断。
function checkResearchDeps() {
  checkSkillDirs(requiredSkillsForStage("research"));
}

// --stage writing：写作链路核心技能（draft + refine 的所有策略 required 并集）。
function checkWritingDeps() {
  checkSkillDirs([
    ...requiredSkillsForStage("draft"),
    ...requiredSkillsForStage("refine"),
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

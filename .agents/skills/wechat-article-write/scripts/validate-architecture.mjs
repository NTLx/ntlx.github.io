#!/usr/bin/env bun
/** Static architecture checks for the thin article Skill. */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { parse as parseYaml } from "yaml";

const skillDir = resolve(import.meta.dir, "..");
const repoRoot = resolve(skillDir, "../../..");
const skillsRoot = resolve(repoRoot, ".agents/skills");
const json = process.argv.includes("--json");
const errors = [];
const warnings = [];

function file(rel) { return resolve(skillDir, rel); }
function requireFile(rel) { if (!existsSync(file(rel))) errors.push(`missing: ${rel}`); }
function readProjectExtend(rel) {
  const path = resolve(repoRoot, rel);
  if (!existsSync(path)) {
    errors.push(`missing project config: ${rel}`);
    return null;
  }
  const raw = readFileSync(path, "utf8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\s*$/u);
  if (!match) {
    errors.push(`project config must use YAML frontmatter: ${rel}`);
    return null;
  }
  try {
    return parseYaml(match[1]);
  } catch (error) {
    errors.push(`project config is invalid YAML: ${rel} (${error.message})`);
    return null;
  }
}
function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/u);
  const result = {};
  if (!match) return result;
  let inMetadata = false;
  for (const line of match[1].split(/\r?\n/u)) {
    const item = line.match(/^(\s*)([\w-]+):\s*(.*)$/u);
    if (!item) continue;
    const [, indent, key, raw] = item;
    if (indent.length === 0) inMetadata = key === "metadata" && raw === "";
    else if (inMetadata) result[`metadata.${key}`] = raw.replace(/^['"]|['"]$/gu, "");
    else continue;
    if (indent.length === 0) result[key] = raw.replace(/^['"]|['"]$/gu, "");
  }
  return result;
}

const skillText = readFileSync(file("SKILL.md"), "utf8");
const fm = parseFrontmatter(skillText);
if (fm.name !== "wechat-article-write") errors.push("SKILL.md frontmatter name must be wechat-article-write");
if (fm["metadata.author"] !== "NTLx") errors.push("SKILL.md must declare metadata.author=NTLx");
if (fm["metadata.version"] !== "2.8.0") errors.push("SKILL.md must declare metadata.version=2.8.0");
if (/disable-model-invocation\s*:/u.test(skillText)) errors.push("model invocation must remain enabled");

for (const phrase of [
  "## Main Agent execution boundary", "Main Agent MUST NOT directly", "Main Agent owns understanding and strategic judgement",
  "Execution Unit", "Delegated Executor", "isolated execution context", "runtime-native isolation mechanism",
  "Main chooses", "These are examples, not required implementations", "dispatch", "fresh-context",
  "## Delegation fidelity", "### Native delegation", "### Mandatory child delegation", "fail closed",
  "## Child-owned artifact immutability", "### Ownership matrix", "Skill-via-Executor", "state v2",
]) if (!skillText.includes(phrase)) errors.push(`SKILL.md missing delegation contract: ${phrase}`);

requireFile("references/delegated-execution.md");

const legacyNativeRequirement = ["native", "Subagent", "capability unavailable"].join(" ");
if (skillText.includes(legacyNativeRequirement)) errors.push("SKILL.md retains a runtime-specific native delegation requirement");
const legacyWorkerModel = ["Worker", "Subagent"].join(" ");
if (skillText.includes(legacyWorkerModel)) errors.push("SKILL.md retains the retired delegated execution model");

for (const name of [
  "humanizer-zh", "baoyu-cover-image", "baoyu-xhs-images", "baoyu-infographic",
  "baoyu-diagram", "baoyu-image-gen", "github-image-hosting", "gzh-design", "baoyu-post-to-wechat",
]) {
  if (!existsSync(resolve(skillsRoot, name, "SKILL.md"))) errors.push(`required Skill missing: ${name}`);
}

const coverConfig = readProjectExtend(".baoyu-skills/baoyu-cover-image/EXTEND.md");
const xhsConfig = readProjectExtend(".baoyu-skills/baoyu-xhs-images/EXTEND.md");
const infographicConfig = readProjectExtend(".baoyu-skills/baoyu-infographic/EXTEND.md");
const imageGenConfig = readProjectExtend(".baoyu-skills/baoyu-image-gen/EXTEND.md");
const parentExtendPath = file("EXTEND.md");
const postExtendPath = resolve(repoRoot, ".baoyu-skills/baoyu-post-to-wechat/EXTEND.md");
if (!existsSync(postExtendPath)) errors.push("missing project config: .baoyu-skills/baoyu-post-to-wechat/EXTEND.md");
if (coverConfig && (coverConfig.version !== 3 || coverConfig.default_aspect !== "2.35:1" || coverConfig.quick_mode !== true || coverConfig.preferred_image_backend !== "baoyu-image-gen")) {
  errors.push("baoyu-cover-image project config must use v3, 2.35:1, quick mode, and baoyu-image-gen");
}
if (xhsConfig && (xhsConfig.version !== 1 || xhsConfig.language !== "zh" || xhsConfig.preferred_image_backend !== "baoyu-image-gen" || xhsConfig.generation_batch_size !== 1)) {
  errors.push("baoyu-xhs-images project config must use v1, zh, batch size 1, and baoyu-image-gen");
}
if (infographicConfig && (infographicConfig.version !== 1 || infographicConfig.language !== "zh" || infographicConfig.preferred_image_backend !== "baoyu-image-gen")) {
  errors.push("baoyu-infographic project config must use v1, zh, and baoyu-image-gen");
}
if (imageGenConfig && (imageGenConfig.version !== 1 || imageGenConfig.default_provider !== "codex-cli")) {
  errors.push("baoyu-image-gen project config must use v1 and default_provider codex-cli");
}
if (existsSync(parentExtendPath)) {
  const parentExtend = readFileSync(parentExtendPath, "utf8");
  for (const key of ["default_publish_method", "wechat_layout_generate_preview"]) {
    if (new RegExp(`^${key}:`, "mu").test(parentExtend)) errors.push(`parent EXTEND must not own ${key}`);
  }
  if (/^visual_[^:]+:/mu.test(parentExtend)) errors.push("parent EXTEND must not own visual_* fields");
}
if (existsSync(postExtendPath)) {
  const postExtend = readFileSync(postExtendPath, "utf8");
  if (!/^default_publish_method:\s*api\s*$/mu.test(postExtend)) errors.push("baoyu-post-to-wechat EXTEND must set default_publish_method=api");
  if (!/^default_author:\s*NTLx\s*$/mu.test(postExtend)) errors.push("baoyu-post-to-wechat EXTEND must set default_author=NTLx");
}

for (const match of skillText.matchAll(/`(references\/[^`\s)]+)`/gu)) if (!match[1].includes("*")) requireFile(match[1]);
for (const match of skillText.matchAll(/`(scripts\/[^`\s)]+)`/gu)) requireFile(match[1]);
for (const name of ["reader-response", "tutorial", "news-digest"]) requireFile(`references/strategy-${name}.md`);

for (const rel of [
  "scripts/step1-collect.mjs", "scripts/step2-write.mjs", "scripts/step3-polish.mjs",
  "scripts/step4-images.mjs", "scripts/step5-build.mjs", "scripts/state.mjs",
  "scripts/pipeline.mjs", "scripts/image-plan-lib.mjs", "scripts/markdown-structure-lib.mjs",
  "scripts/source-provenance-lib.mjs",
]) requireFile(rel);

for (const phrase of ["Primary Source Uniqueness", "primarySourceUrls", "same_source_matches"]) {
  if (!skillText.includes(phrase) && !readFileSync(file("references/originality-policy.md"), "utf8").includes(phrase)) {
    errors.push(`source uniqueness contract missing: ${phrase}`);
  }
}

for (const retired of [
  "skill-catalog.mjs", "orchestration-trace.mjs", "workflow.mjs", "generate-image-prompts.mjs",
  "render-images-serial.mjs", "humanizer-lib.mjs", "mark-humanized.mjs", "image-review-lib.mjs",
  "visual-plan-lib.mjs", "pre-humanizer-normalize.mjs", "normalize-image-formats.mjs",
]) if (existsSync(file(`scripts/${retired}`))) errors.push(`retired script remains: scripts/${retired}`);

for (const retired of [
  "worker-trace.json", "delegation.json", "execution-receipt.json", "spawn-log.json",
  "agent-id.json", "producer.json",
]) if (existsSync(file(retired))) errors.push(`retired orchestration artifact remains: ${retired}`);

for (const retired of [
  "orchestration-policy.md", "image-plan.schema.json", "image-review.schema.json",
  "image-template-catalog.md", "image-backends.md", "dependency-manifest.md", "golden-path.md",
]) if (existsSync(file(`references/${retired}`))) errors.push(`retired reference remains: references/${retired}`);

const activeFiles = ["SKILL.md", "EXTEND.md", ...readdirSync(file("references")).filter((name) => name.endsWith(".md")).map((name) => `references/${name}`)];
// Keep the retired phrases escaped so this guard does not itself appear in the
// active-contract scan used by the regression checklist.
const retiredZeroCoverageContract = new RegExp(
  "\\u6b63\\u6587 \\u0067\\u0065\\u006e\\u0065\\u0072\\u0061\\u0074\\u0065\\u0064 SLOT|\\u6570\\u91cf\\u5141\\u8bb8\\u4e3a 0\\.\\.N|\\u6b63\\u6587\\u89c6\\u89c9\\u8282\\u70b9\\u6570\\u91cf\\u53ef\\u4ee5\\u4e3a\\u96f6",
  "u",
);
for (const rel of activeFiles) {
  const text = readFileSync(file(rel), "utf8");
  if (retiredZeroCoverageContract.test(text)) {
    errors.push(`${rel} still advertises the retired zero-coverage visual contract`);
  }
  for (const token of ["skill-catalog", "orchestration-trace", "DESIGN-ONLY", "generate-image-prompts", "render-images-serial", "image-review", "mark-humanized", "producer authority", "Optional Contributors"]) {
    if (text.includes(token)) errors.push(`${rel} still depends on retired concept: ${token}`);
  }
}

const mapping = [
  ["Step 3", "humanizer-zh"], ["Step 5A hosting", "github-image-hosting"],
  ["Step 5B HTML", "gzh-design"], ["Step 6 WeChat draft", "baoyu-post-to-wechat"],
  ["cover", "baoyu-cover-image"], ["SLOT_IMG_00", "baoyu-xhs-images"],
  ["正文生成图", "baoyu-infographic"], ["humanizer-zh", "humanizer-zh"],
  ["gzh-design", "gzh-design"], ["github-image-hosting", "github-image-hosting"],
  ["微信草稿", "baoyu-post-to-wechat"],
];
for (const [left, right] of mapping) if (!skillText.includes(left) || !skillText.includes(right)) errors.push(`native delegation mapping missing: ${left} -> ${right}`);

const stateLibText = readFileSync(file("scripts/state-lib.mjs"), "utf8");
if (!stateLibText.includes("v2")) errors.push("state implementation must remain v2");

const delegatedExecutionText = readFileSync(file("references/delegated-execution.md"), "utf8");
for (const phrase of [
  "Main execution boundary", "Delegated Executor capability contract", "fresh execution context",
  "Execution capsule", "Bounded handoff", "Execution-unit matrix", "Skill-via-Executor",
  "Failure recovery", "deterministic command", "Delegated Execution Fidelity",
]) if (!delegatedExecutionText.includes(phrase)) errors.push(`delegated reference missing contract: ${phrase}`);

const governancePath = resolve(repoRoot, "AGENTS.md");
const claudeAdapterPath = resolve(repoRoot, "CLAUDE.md");
const contentClaudeAdapterPath = resolve(repoRoot, "src/content/CLAUDE.md");
const legacyGovernancePath = resolve(repoRoot, ".agents", "AGENTS.md");
if (!existsSync(governancePath) || !readFileSync(governancePath, "utf8").includes("唯一共享权威源")) {
  errors.push("AGENTS.md must be the shared canonical governance source");
}
for (const [path, expected] of [[claudeAdapterPath, "@AGENTS.md"], [contentClaudeAdapterPath, "@AGENTS.md"]]) {
  if (!existsSync(path) || readFileSync(path, "utf8").trim() !== expected) errors.push(`thin governance adapter invalid: ${path}`);
}
if (existsSync(legacyGovernancePath)) errors.push("legacy .agents governance file must be removed");

const productionFiles = readdirSync(file("scripts"))
  .filter((name) => name.endsWith(".mjs") && name !== "validate-architecture.mjs")
  .map((name) => `scripts/${name}`);
const forbiddenCoupling = [
  "wechat-api.ts", "BAOYU_POST_TO_WECHAT_BIN", "resolveWechatApiScript", "ensureDepsInstalled",
  "github-image-hosting/scripts/upload", "gzh-design/scripts/validate_gzh_html.py",
  "gzh-design/scripts/wrap_preview.py", "render-images-serial", "orchestration-trace",
  "skill-catalog", "image-review receipt",
];
for (const rel of productionFiles) {
  const text = readFileSync(file(rel), "utf8");
  for (const token of forbiddenCoupling) if (text.includes(token)) errors.push(`${rel} contains forbidden coupling: ${token}`);
}

const result = { ok: errors.length === 0, errors, warnings };
if (json) process.stdout.write(JSON.stringify(result, null, 2) + "\n");
else if (errors.length) for (const error of errors) process.stderr.write(`validate-architecture: FAIL - ${error}\n`);
else process.stdout.write(`validate-architecture: OK (${warnings.length} warnings)\n`);
process.exit(errors.length ? 2 : 0);

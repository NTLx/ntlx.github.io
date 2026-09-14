#!/usr/bin/env bun
/** Static architecture checks for the Main-first article Skill. */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const skillDir = resolve(import.meta.dir, "..");
const repoRoot = resolve(skillDir, "../../..");
const skillsRoot = resolve(repoRoot, ".agents/skills");
const json = process.argv.includes("--json");
const errors = [];
const warnings = [];
const file = (rel) => resolve(skillDir, rel);
const read = (rel) => readFileSync(file(rel), "utf8");
const requireFile = (rel) => {
  if (!existsSync(file(rel))) errors.push(`missing: ${rel}`);
};

function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/u);
  const result = {};
  if (!match) return result;
  let block = null;
  for (const line of match[1].split(/\r?\n/u)) {
    const item = line.match(/^(\s*)([\w-]+):\s*(.*)$/u);
    if (!item) continue;
    const [, indent, key, raw] = item;
    const value = raw.replace(/^['"]|['"]$/gu, "");
    if (indent.length === 0) {
      block = raw === "" ? key : null;
      result[key] = value;
    } else if (block) {
      result[`${block}.${key}`] = value;
    }
  }
  return result;
}

const skillText = read("SKILL.md");
const frontmatter = parseFrontmatter(skillText);
if (frontmatter.name !== "wechat-article-write") errors.push("SKILL.md frontmatter name must be wechat-article-write");
if (frontmatter["metadata.author"] !== "NTLx") errors.push("SKILL.md metadata.author must be NTLx");
if (!/^\d+\.\d+\.\d+$/u.test(frontmatter["metadata.version"] ?? "")) errors.push("SKILL.md metadata.version must be semver");
if (/disable-model-invocation\s*:/u.test(skillText)) errors.push("model invocation must remain enabled");

for (const rel of [
  "EXTEND.md",
  "references/research-delegation.md",
  "references/content-invariants.md",
  "references/image-policy.md",
  "references/originality-policy.md",
  "references/material-understanding.md",
  "references/publishing.md",
  "references/adapter-gzh-design.md",
  "references/troubleshooting.md",
  "references/strategy-reader-response.md",
  "references/strategy-tutorial.md",
  "references/strategy-news-digest.md",
]) requireFile(rel);
if (existsSync(file("references/delegated-execution.md"))) errors.push("obsolete delegated-execution reference remains");

for (const name of [
  "humanizer-zh", "baoyu-cover-image", "baoyu-infographic",
  "baoyu-article-illustrator", "baoyu-image-gen", "baoyu-compress-image",
  "github-image-hosting", "gzh-design", "baoyu-post-to-wechat",
]) if (!existsSync(resolve(skillsRoot, name, "SKILL.md"))) errors.push(`direct Specialist missing: ${name}`);

for (const rel of [
  "scripts/step1-collect.mjs", "scripts/step2-write.mjs", "scripts/step3-polish.mjs",
  "scripts/step4-images.mjs", "scripts/step5-build.mjs", "scripts/state.mjs", "scripts/state-lib.mjs",
  "scripts/pipeline.mjs", "scripts/validate-understanding.mjs",
  "scripts/markdown-structure-lib.mjs", "scripts/source-provenance-lib.mjs",
]) requireFile(rel);

// Keep only the execution boundary anchors; editorial wording belongs in documentation review.
for (const contract of [
  "Main is the default executor",
  "Skill invocation does not imply an Agent context",
  "Background research may be delegated",
]) if (!skillText.includes(contract)) errors.push(`SKILL.md missing execution boundary: ${contract}`);

const directSkillRoutes = [
  ["Humanization", "humanizer-zh"],
  ["Cover", "baoyu-cover-image"],
  ["Header infographic", "baoyu-infographic"],
  ["Body illustration analysis + generation", "baoyu-article-illustrator"],
  ["Raster generation backend", "baoyu-image-gen"],
  ["Image compression", "baoyu-compress-image"],
  ["Blog/CDN hosting", "github-image-hosting"],
  ["WeChat HTML layout", "gzh-design"],
  ["WeChat draft publishing", "baoyu-post-to-wechat"],
];
for (const [unit, specialist] of directSkillRoutes) {
  const route = skillText.split("\n").find((line) => line.includes(`| ${unit} |`));
  if (!route || !route.includes(specialist)) errors.push(`Main route missing: ${unit} → ${specialist}`);
}

const baoyuSkillsRoot = resolve(repoRoot, ".baoyu-skills");
const baoyuConfig = (specialist) => {
  const configPath = resolve(baoyuSkillsRoot, specialist, "EXTEND.md");
  return existsSync(configPath) ? readFileSync(configPath, "utf8") : "";
};
// Project visual preferences are pinned policy: the three raster owners keep the documented
// palette, style, and backend so every generated image shares one project tone.
const requirePreferences = (specialist, preferences) => {
  const config = parseFrontmatter(baoyuConfig(specialist));
  for (const [key, expected] of Object.entries(preferences)) {
    if (config[key] !== expected) errors.push(`${specialist} project ${key} must be ${expected}`);
  }
};

requirePreferences("baoyu-cover-image", {
  version: "3",
  preferred_palette: "bright-vivid-warm",
  preferred_text: "none",
  preferred_mood: "bold",
  default_aspect: "2.35:1",
  quick_mode: "true",
  language: "zh",
  preferred_image_backend: "baoyu-image-gen",
});
if (!/^custom_palettes:[\s\S]*?name:\s*bright-vivid-warm\s*$/mu.test(baoyuConfig("baoyu-cover-image"))) {
  errors.push("baoyu-cover-image project custom_palettes must define bright-vivid-warm");
}
requirePreferences("baoyu-infographic", {
  version: "1",
  preferred_style: "claymation",
  preferred_aspect: "landscape",
  language: "zh",
  preferred_image_backend: "baoyu-image-gen",
});
requirePreferences("baoyu-article-illustrator", {
  version: "1",
  "preferred_style.name": "notion",
  preferred_palette: "macaron",
  language: "zh",
  default_output_dir: "imgs-subdir",
  generation_batch_size: "1",
  preferred_image_backend: "baoyu-image-gen",
});

// Batch generation is opt-in per Skill schema. Absent is fine; present must stay serial so each
// raster can be reviewed before the next is dispatched.
for (const entry of existsSync(baoyuSkillsRoot) ? readdirSync(baoyuSkillsRoot, { withFileTypes: true }) : []) {
  if (!entry.isDirectory()) continue;
  const configPath = resolve(baoyuSkillsRoot, entry.name, "EXTEND.md");
  if (!existsSync(configPath)) continue;
  for (const match of readFileSync(configPath, "utf8").matchAll(/^generation_batch_size:\s*(\S+)\s*$/gmu)) {
    if (match[1] !== "1") {
      errors.push(`.baoyu-skills/${entry.name}/EXTEND.md generation_batch_size must remain 1`);
    }
  }
}
const imagePolicy = read("references/image-policy.md");
if (!/conditional|when needed|需要压缩/u.test(imagePolicy)) errors.push("image compression must remain conditional");
for (const artifact of ["draft.md", "visual-draft.md", "imgs/"]) {
  if (!skillText.includes(artifact)) errors.push(`SKILL.md missing visual artifact: ${artifact}`);
}

const contractFiles = [
  "SKILL.md",
  "references/research-delegation.md",
  "references/adapter-gzh-design.md",
  "references/troubleshooting.md",
  "references/publishing.md",
  "references/image-policy.md",
  "references/originality-policy.md",
  "references/content-invariants.md",
  "references/strategy-reader-response.md",
  "scripts/pipeline.mjs",
];
const obsoleteContracts = [
  "SLOT_IMG", "SLOT00", "image-plan",
  "baoyu-diagram", "baoyu-xhs-images", "baoyu-markdown-to-html",
  "Main MUST NOT directly execute actual work",
  "planning-only",
  "Model Context Budget",
  "5–7",
  "5-7 contexts",
  "Subthread Admission",
  "phase Executor",
  "Writing phase",
  "Visual phase",
  "Build phase",
  "Publish phase",
  "RETRY_REQUIRED",
  "fresh Build",
  "bounded handoff",
  "context inheritance",
  "Main MUST NOT fallback to direct execution",
];
for (const rel of contractFiles) {
  const text = read(rel);
  for (const obsolete of obsoleteContracts) {
    if (text.includes(obsolete)) errors.push(`${rel} contains obsolete architecture contract: ${obsolete}`);
  }
}

const pipelineText = read("scripts/pipeline.mjs");
if (pipelineText.includes("spawnSync") || pipelineText.includes("PIPELINE_AUTO")) errors.push("pipeline must remain advisory and non-orchestrating");

const stateLibText = read("scripts/state-lib.mjs");
if (!stateLibText.includes("v2")) errors.push("state implementation must remain v2");
const structureText = read("scripts/wechat-structure-lib.mjs");
if (!structureText.includes("structural-parity/mixed")) errors.push("structural parity must expose subclass failure classes");
if (structureText.includes("unexpected_text_replacement")) errors.push("structural parity must not expose misleading replacement metric");

for (const rel of ["scripts/workflow.mjs", "scripts/orchestration-trace.mjs", "scripts/render-images-serial.mjs", "scripts/image-plan-lib.mjs", "__tests__/image-plan.test.js"]) {
  if (existsSync(file(rel))) errors.push(`retired script remains: ${rel}`);
}
for (const rel of [
  "worker-trace.json", "orchestration-trace.json", "execution-receipt.json", "spawn-log.json", "agent-id.json",
  "parity-debug.json", "execution-trace.json", "gzh-debug.log", "execution-plan.json", "agent-budget.json",
  "thread-registry.json", "token-budget.json",
]) if (existsSync(file(rel))) errors.push(`retired orchestration artifact remains: ${rel}`);

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
  "SLOT_IMG", "image-plan", "collectDraftSlots", "resolveSlotImg", "normalizeSlotDesc", "bodyVisualMinimum",
];
for (const rel of productionFiles) {
  const text = read(rel);
  for (const token of forbiddenCoupling) if (text.includes(token)) errors.push(`${rel} contains forbidden coupling: ${token}`);
}

const result = { ok: errors.length === 0, errors, warnings };
if (json) process.stdout.write(JSON.stringify(result, null, 2) + "\n");
else if (errors.length) for (const error of errors) process.stderr.write(`validate-architecture: FAIL - ${error}\n`);
else process.stdout.write(`validate-architecture: OK (${warnings.length} warnings)\n`);
process.exit(errors.length ? 2 : 0);

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
if (fm["metadata.version"] !== "2.1.0") errors.push("SKILL.md must declare metadata.version=2.1.0");
if (/disable-model-invocation\s*:/u.test(skillText)) errors.push("model invocation must remain enabled");

for (const name of [
  "humanizer-zh", "baoyu-cover-image", "baoyu-xhs-images", "baoyu-infographic",
  "baoyu-diagram", "baoyu-image-gen", "github-image-hosting", "gzh-design",
]) {
  if (!existsSync(resolve(skillsRoot, name, "SKILL.md"))) errors.push(`required Skill missing: ${name}`);
}

const coverConfig = readProjectExtend(".baoyu-skills/baoyu-cover-image/EXTEND.md");
const xhsConfig = readProjectExtend(".baoyu-skills/baoyu-xhs-images/EXTEND.md");
const infographicConfig = readProjectExtend(".baoyu-skills/baoyu-infographic/EXTEND.md");
const imageGenConfig = readProjectExtend(".baoyu-skills/baoyu-image-gen/EXTEND.md");
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

for (const match of skillText.matchAll(/`(references\/[^`\s)]+)`/gu)) if (!match[1].includes("*")) requireFile(match[1]);
for (const match of skillText.matchAll(/`(scripts\/[^`\s)]+)`/gu)) requireFile(match[1]);
for (const name of ["reader-response", "tutorial", "news-digest"]) requireFile(`references/strategy-${name}.md`);

for (const rel of [
  "scripts/step1-collect.mjs", "scripts/step2-write.mjs", "scripts/step3-polish.mjs",
  "scripts/step4-images.mjs", "scripts/step5-build.mjs", "scripts/state.mjs",
  "scripts/pipeline.mjs", "scripts/image-plan-lib.mjs", "scripts/markdown-structure-lib.mjs",
]) requireFile(rel);

for (const retired of [
  "skill-catalog.mjs", "orchestration-trace.mjs", "workflow.mjs", "generate-image-prompts.mjs",
  "render-images-serial.mjs", "humanizer-lib.mjs", "mark-humanized.mjs", "image-review-lib.mjs",
  "visual-plan-lib.mjs", "pre-humanizer-normalize.mjs", "normalize-image-formats.mjs",
]) if (existsSync(file(`scripts/${retired}`))) errors.push(`retired script remains: scripts/${retired}`);

for (const retired of [
  "orchestration-policy.md", "image-plan.schema.json", "image-review.schema.json",
  "image-template-catalog.md", "image-backends.md", "dependency-manifest.md", "golden-path.md",
]) if (existsSync(file(`references/${retired}`))) errors.push(`retired reference remains: references/${retired}`);

const activeFiles = ["SKILL.md", "EXTEND.md", ...readdirSync(file("references")).filter((name) => name.endsWith(".md")).map((name) => `references/${name}`)];
for (const rel of activeFiles) {
  const text = readFileSync(file(rel), "utf8");
  for (const token of ["skill-catalog", "orchestration-trace", "DESIGN-ONLY", "generate-image-prompts", "render-images-serial", "image-review", "mark-humanized", "producer authority", "Optional Contributors"]) {
    if (text.includes(token)) errors.push(`${rel} still depends on retired concept: ${token}`);
  }
}

const mapping = [
  ["cover", "baoyu-cover-image"], ["SLOT_IMG_00", "baoyu-xhs-images"],
  ["正文生成图", "baoyu-infographic"], ["humanizer-zh", "humanizer-zh"],
  ["gzh-design", "gzh-design"],
];
for (const [left, right] of mapping) if (!skillText.includes(left) || !skillText.includes(right)) errors.push(`native delegation mapping missing: ${left} -> ${right}`);

const result = { ok: errors.length === 0, errors, warnings };
if (json) process.stdout.write(JSON.stringify(result, null, 2) + "\n");
else if (errors.length) for (const error of errors) process.stderr.write(`validate-architecture: FAIL - ${error}\n`);
else process.stdout.write(`validate-architecture: OK (${warnings.length} warnings)\n`);
process.exit(errors.length ? 2 : 0);

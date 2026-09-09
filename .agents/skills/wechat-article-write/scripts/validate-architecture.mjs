#!/usr/bin/env bun
/** Static architecture checks for the thin article Skill. */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const skillDir = resolve(import.meta.dir, "..");
const repoRoot = resolve(skillDir, "../../..");
const skillsRoot = resolve(repoRoot, ".agents/skills");
const json = process.argv.includes("--json");
const errors = [];
const warnings = [];

const file = (rel) => resolve(skillDir, rel);
const requireFile = (rel) => {
  if (!existsSync(file(rel))) errors.push(`missing: ${rel}`);
};

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
    if (indent.length === 0) result[key] = raw.replace(/^['"]|['"]$/gu, "");
  }
  return result;
}

const skillText = readFileSync(file("SKILL.md"), "utf8");
const frontmatter = parseFrontmatter(skillText);
if (frontmatter.name !== "wechat-article-write") errors.push("SKILL.md frontmatter name must be wechat-article-write");
if (frontmatter["metadata.author"] !== "NTLx") errors.push("SKILL.md metadata.author must be NTLx");
if (frontmatter["metadata.version"] !== "2.13.0") errors.push("SKILL.md metadata.version must be 2.13.0");
if (/disable-model-invocation\s*:/u.test(skillText)) errors.push("model invocation must remain enabled");

for (const rel of [
  "EXTEND.md",
  "references/delegated-execution.md",
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

for (const name of [
  "humanizer-zh", "baoyu-cover-image", "baoyu-infographic",
  "github-image-hosting", "gzh-design", "baoyu-post-to-wechat",
]) if (!existsSync(resolve(skillsRoot, name, "SKILL.md"))) errors.push(`direct Specialist missing: ${name}`);

for (const rel of [
  "scripts/step1-collect.mjs", "scripts/step2-write.mjs", "scripts/step3-polish.mjs",
  "scripts/step4-images.mjs", "scripts/step5-build.mjs", "scripts/state.mjs", "scripts/state-lib.mjs",
  "scripts/pipeline.mjs", "scripts/validate-understanding.mjs", "scripts/image-plan-lib.mjs",
  "scripts/markdown-structure-lib.mjs", "scripts/source-provenance-lib.mjs",
]) requireFile(rel);

const delegatedText = readFileSync(file("references/delegated-execution.md"), "utf8");
if (!delegatedText.includes("runtime-neutral")) errors.push("delegated reference must remain runtime-neutral");
if (!delegatedText.includes("Main MUST NOT fallback to direct execution")) errors.push("delegated reference must fail closed");

const stateLibText = readFileSync(file("scripts/state-lib.mjs"), "utf8");
if (!stateLibText.includes("v2")) errors.push("state implementation must remain v2");

for (const rel of ["scripts/workflow.mjs", "scripts/orchestration-trace.mjs", "scripts/render-images-serial.mjs"]) {
  if (existsSync(file(rel))) errors.push(`retired script remains: ${rel}`);
}
for (const rel of [
  "worker-trace.json", "orchestration-trace.json", "execution-receipt.json", "spawn-log.json", "agent-id.json",
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

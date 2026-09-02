#!/usr/bin/env bun
/**
 * Materialize canonical prompt files produced by the selected visual Skills.
 *
 * This script is deliberately not a visual planner and not a compatibility
 * adapter. The Agent calls baoyu-cover-image, baoyu-xhs-images and, when body
 * slots exist, baoyu-infographic; those producers write the initial prompt at
 * the deterministic path. This script only validates the fixed route and
 * finalizes the prompt with project-owned immutable constraints.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { postDir } from "./path-resolver.mjs";
import { extractBody, parseFrontmatter } from "./frontmatter-lib.mjs";
import { getVisualStyleProfile } from "./config-lib.mjs";
import {
  finalizeCanonicalPrompt,
  normalizePromptSource,
  readImagePlan,
  validateBaoyuDesign,
  validateCanonicalPrompt,
  validateVisualCoverage,
  validateVisualPlanTopology,
  visualPromptDescription,
} from "./visual-plan-lib.mjs";

const args = process.argv.slice(2);
const slug = args.find((arg) => !arg.startsWith("--"));
const unknownOptions = args.filter((arg) => arg.startsWith("--"));
if (!slug || unknownOptions.length > 0) {
  process.stderr.write("usage: generate-image-prompts.mjs <date-slug>\n");
  process.exit(1);
}

function fail(message) {
  process.stderr.write(`generate-image-prompts: FAIL - ${message}\n`);
  process.exit(2);
}

function requireExternal(node, label) {
  try {
    if (normalizePromptSource(node?.prompt_source) !== "external") fail(`${label}.prompt_source must be external`);
  } catch (error) {
    fail(`${label}.${error.message}`);
  }
  const producerValue = node?.["producer"];
  if (typeof producerValue !== "string" || producerValue.trim() === "") fail(`${label}.producer is required`);
}

function promptPath(promptsDir, basenameValue) {
  return resolve(promptsDir, `${basenameValue}.md`);
}

function readExternalPrompt(path, label, node) {
  requireExternal(node, label);
  if (!existsSync(path)) {
    fail(`external visual prompt missing for ${label}\nproducer=${node.producer}\nexpected: ${path}\nRun the selected producer first and save its final rendering prompt to this path.`);
  }
  const prompt = readFileSync(path, "utf8").trim();
  if (!prompt) fail(`external visual prompt is empty for ${label}: ${path}`);
  return prompt;
}

function profileFor(plan) {
  if (plan.visual_profile === "custom") {
    return { id: "custom", override_reason: plan.visual_override_reason };
  }
  return getVisualStyleProfile();
}

function finalizePrompt(path, label, node, profile, role, options = {}) {
  const initial = readExternalPrompt(path, label, node);
  const prompt = finalizeCanonicalPrompt(initial, {
    profile,
    role,
    aspect: options.aspect,
    textDensity: options.textDensity,
  });
  const errors = validateCanonicalPrompt(prompt, {
    profile,
    role,
    aspect: options.aspect,
    textDensity: options.textDensity,
  });
  if (errors.length > 0) fail(`${label} canonical prompt invalid: ${errors.join("; ")}`);
  if (prompt !== readFileSync(path, "utf8")) {
    writeFileSync(path, prompt);
    return true;
  }
  return false;
}

const base = postDir(slug);
const draftPath = resolve(base, "draft.md");
const planPath = resolve(base, "image-plan.json");
if (!existsSync(draftPath)) fail(`draft.md missing: ${draftPath}`);
if (!existsSync(planPath)) fail(`image-plan.json missing: ${planPath}`);

let plan;
try {
  plan = readImagePlan(planPath);
} catch (error) {
  fail(error.message);
}
if (!plan) fail("image-plan.json must contain an object");

const draft = readFileSync(draftPath, "utf8");
const frontmatter = parseFrontmatter(draft);
if (!frontmatter) fail("frontmatter missing in draft.md");
const body = extractBody(draft);
const topology = validateVisualPlanTopology(plan, body);
if (!topology.ok) fail(`visual plan topology invalid: ${topology.errors.join("; ")}`);
const coverageErrors = validateVisualCoverage(plan, body).errors;
if (coverageErrors.length > 0) fail(`visual coverage review invalid: ${coverageErrors.join("; ")}`);
const designErrors = validateBaoyuDesign(plan);
if (designErrors.length > 0) fail(`Baoyu visual design contract invalid: ${designErrors.join("; ")}`);

const promptsDir = resolve(base, "imgs/prompts");
mkdirSync(promptsDir, { recursive: true });
const profile = profileFor(plan);
const coverSlug = String(frontmatter.blogSlug ?? slug).trim();
const changed = [];

if (finalizePrompt(
  promptPath(promptsDir, `00-cover-${coverSlug}`),
  "cover",
  plan.cover,
  profile,
  "cover",
  { aspect: "2.35:1", textDensity: "none" },
)) changed.push(`00-cover-${coverSlug}.md`);

if (finalizePrompt(
  promptPath(promptsDir, "00-infographic-core-summary"),
  "SLOT_IMG_00",
  plan.infographic,
  profile,
  "header-infographic",
  { textDensity: "low" },
)) changed.push("00-infographic-core-summary.md");

for (const slot of topology.bodySlots) {
  const entry = topology.entriesBySlot.get(slot.slot);
  const desc = visualPromptDescription(entry, slot);
  const nn = String(slot.slot).padStart(2, "0");
  if (finalizePrompt(
    promptPath(promptsDir, `${nn}-${desc}`),
    `SLOT_IMG_${nn}`,
    entry,
    profile,
    "body-illustration",
    { textDensity: entry.text_density },
  )) changed.push(`${nn}-${desc}.md`);
}

process.stdout.write(JSON.stringify({ slug, prompts_dir: promptsDir, finalized: changed }, null, 2) + "\n");

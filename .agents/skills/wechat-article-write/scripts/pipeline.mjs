#!/usr/bin/env bun
/** State-aware advisory CLI. It never runs workflow steps or writes artifacts. */

import { getPublishState, nextStep } from "./state-lib.mjs";

const args = process.argv.slice(2);
if (args.includes("--help")) {
  process.stdout.write("usage: pipeline.mjs <date-slug>\n");
  process.exit(0);
}
if (args.length !== 1 || args[0].startsWith("--")) {
  process.stderr.write("usage: pipeline.mjs <date-slug>\n");
  process.exit(1);
}

const slug = args[0];
const step = nextStep(slug);
process.stdout.write(`current step: ${step}\n`);

if (step === "done") {
  process.stdout.write("Publish states: blog=done, wechat=done\n");
  process.exit(0);
}

function printStep(title, actions, { mode = null, specialist = null, research = false } = {}) {
  process.stdout.write(`NEXT STEP: ${title}\n`);
  process.stdout.write("ACTION: Main executes this workflow directly.\n");
  if (mode) process.stdout.write(`MODE: ${mode}\n`);
  if (specialist) process.stdout.write(`REQUIRED SPECIALIST: ${specialist}\n`);
  if (research) process.stdout.write("OPTIONAL DELEGATION: background research child for external evidence only\n");
  process.stdout.write("ACTIONS:\n");
  actions.forEach((action, index) => process.stdout.write(`${index + 1}. ${action}\n`));
}

if (step === 1) {
  printStep("Step 1 / 1.5 / 1.8 — research, memory, and understanding", [
    "state preflight: state.mjs init/next",
    "Main reads the primary source directly",
    "supporting research only when external evidence is needed",
    "materials.md and Step 1 Gate",
    "Primary Source Uniqueness and site memory",
    "understanding-brief.md and understanding validator",
  ], { research: true });
  process.stdout.write("RESUME: reuse valid existing artifacts; do not repeat completed acquisition merely because Step 1 is incomplete\n");
  process.exit(0);
}

if (step === 2) {
  printStep("Step 2 / 3 — draft and humanization", [
    "draft.md",
    "Step 2 Gate",
    "humanizer-zh",
    "Step 3 Gate and draft hash",
  ], { mode: "full", specialist: "humanizer-zh" });
  process.exit(0);
}

if (step === 3) {
  printStep("Step 3 — humanization recovery", [
    "reuse frozen draft.md",
    "humanizer-zh",
    "Step 3 Gate and draft hash",
    "do not regenerate draft or rerun Step 2 production",
  ], { mode: "humanization recovery", specialist: "humanizer-zh" });
  process.exit(0);
}

if (step === 4) {
  printStep("Step 4 — visual planning and assets", [
    "cover → inspect",
    "SLOT00 → inspect",
    "source body review",
    "generated body visuals → inspect",
    "image-plan.json",
    "Step 4 Gate",
  ], { specialist: "baoyu-cover-image / baoyu-infographic as required" });
  process.exit(0);
}

if (step === 5) {
  printStep("Step 5 — hosting, build, and WeChat layout", [
    `hosting-status: step5-build.mjs ${slug} --hosting-status`,
    "github-image-hosting if status is NEEDED → image-map.json",
    `prepare: step5-build.mjs ${slug} --prepare-only`,
    "gzh-design → article-wechat.html, native validator, and preview",
    `finalize: step5-build.mjs ${slug} --finalize-only`,
  ], { specialist: "github-image-hosting / gzh-design" });
  process.exit(0);
}

if ([6, 6.1, 6.2].includes(step)) {
  const publish = getPublishState(slug);
  process.stdout.write("NEXT STEP: Step 6 — publish\n");
  process.stdout.write("ACTION: Main executes publishing directly.\n");
  process.stdout.write(`Publish states: blog=${publish.blog}, wechat=${publish.wechat}\n`);
  process.stdout.write("ACTIONS:\n");
  process.stdout.write(`1. blog publish if pending/failed: publish-blog.mjs ${slug}; blog first\n`);
  process.stdout.write(`2. WeChat prepare: publish-wechat.mjs ${slug} --prepare-only\n`);
  process.stdout.write("3. baoyu-post-to-wechat with article-wechat.html\n");
  process.stdout.write(`4. WeChat finalize: publish-wechat.mjs ${slug} --finalize-only [--media-id <id>]\n`);
  process.exit(0);
}

process.stdout.write(`Next: complete Step ${step} and rerun this advisory.\n`);

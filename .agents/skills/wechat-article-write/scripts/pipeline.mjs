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

function printPhase(name, units, { context = "reuse one phase context when cheap; compact rehydration is allowed at a real artifact boundary", mode = null, doNot = [] } = {}) {
  process.stdout.write(`NEXT PHASE: ${name}\n`);
  process.stdout.write(`${name} phase executor (default: one isolated context):\n`);
  process.stdout.write(`MODEL CONTEXT: ${context}\n`);
  if (mode) process.stdout.write(`MODE: ${mode}\n`);
  process.stdout.write("UNITS:\n");
  units.forEach((unit, index) => process.stdout.write(`${index + 1}. ${unit}\n`));
  if (doNot.length > 0) {
    process.stdout.write("DO NOT:\n");
    doNot.forEach((item) => process.stdout.write(`${item}\n`));
  }
  process.stdout.write("NEW CHILD THREADS:\n");
  process.stdout.write("do not create for deterministic units, Gates, waits, or diagnostics\n");
  process.stdout.write("Run these ordered units in one phase executor by default. Stop and return only on Gate failure.\n");
}

if (step === 1) {
  printPhase("Research", [
    "state preflight: state.mjs init/next",
    "source acquisition and supporting research",
    "media extraction",
    "materials.md",
    "Step 1 Gate",
    "Primary Source Uniqueness and site memory",
    "understanding brief",
    "understanding validator (Step 1.8)",
    "Step 1 phase completion",
  ], {
    context: "reuse Research context by default; fresh Understanding context only at a real compaction boundary",
  });
  process.stdout.write("RESUME: reuse valid existing phase artifacts; do not repeat completed expensive acquisition merely because durable Step 1 is incomplete\n");
  process.exit(0);
}

if (step === 2) {
  printPhase("Writing", [
    "draft",
    "Step 2 Gate",
    "humanizer-zh (mandatory Specialist workflow)",
    "Step 3 Gate and draft hash",
    "handoff",
  ], {
    mode: "full",
    context: "reuse Writing context by default; fresh Humanizer context allowed after Step 2 at a real compaction boundary",
  });
  process.exit(0);
}

if (step === 3) {
  printPhase("Writing", [
    "reuse frozen draft.md",
    "humanizer-zh (mandatory Specialist workflow)",
    "Step 3 Gate and draft hash",
    "handoff",
  ], {
    mode: "humanization recovery",
    context: "reuse Writing context when cheap; fresh minimal Humanizer context may read only frozen draft.md",
    doNot: [
      "regenerate draft",
      "rerun Step 2 production",
    ],
  });
  process.exit(0);
}

if (step === 4) {
  printPhase("Visual", [
    "cover → inspect",
    "SLOT00 → inspect",
    "source body review",
    "generated body visuals → inspect",
    "image-plan.json",
    "Step 4 Gate",
  ]);
  process.exit(0);
}

if (step === 5) {
  process.stdout.write(`NEXT PHASE: Build
Build phase executor (default: one isolated context):
MODEL CONTEXT: reuse one Build Executor
UNITS:
1. hosting-status
   deterministic action: step5-build --hosting-status
2. hosting if needed
   required skill: github-image-hosting; output: image-map.json
3. prepare
   deterministic action: step5-build --prepare-only
4. gzh-design
   required skill: gzh-design; output: article-wechat.html (including validator and preview)
5. finalize
   deterministic action: step5-build --finalize-only

NEW CHILD THREADS:
do not create for deterministic units, Gates, waits, or diagnostics
Run these ordered units in one phase executor by default. Stop and return only on Gate failure.
`);
  process.exit(0);
}

if ([6, 6.1, 6.2].includes(step)) {
  const publish = getPublishState(slug);
  process.stdout.write(`NEXT PHASE: Publish\n`);
  process.stdout.write(`Publish states: blog=${publish.blog}, wechat=${publish.wechat}\n`);
  process.stdout.write(`Publish phase executor (default: one isolated context):
MODEL CONTEXT: reuse one Publish Executor
UNITS:
1. blog publish if pending/failed
   deterministic action: publish-blog.mjs ${slug}; blog first
2. WeChat prepare
   deterministic action: publish-wechat.mjs ${slug} --prepare-only
3. WeChat publish
   required skill: baoyu-post-to-wechat
4. WeChat finalize
   deterministic action: publish-wechat.mjs ${slug} --finalize-only after child success

NEW CHILD THREADS:
do not create for deterministic units, Gates, waits, or diagnostics
Run these ordered units in one phase executor by default. Stop and return only on Gate failure.
`);
  process.exit(0);
}

process.stdout.write(`Next: complete Step ${step} and rerun this advisory.\n`);

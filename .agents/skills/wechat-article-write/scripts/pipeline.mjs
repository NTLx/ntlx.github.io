#!/usr/bin/env bun
/** State-driven entrypoint for deterministic build and publication steps. */

import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { nextStep } from "./state-lib.mjs";

const repoRoot = resolve(import.meta.dirname, "../../../..");
const scriptsDir = resolve(import.meta.dirname);
const slug = process.argv.slice(2).find((arg) => !arg.startsWith("--"));
const auto = process.argv.includes("--auto") || process.env.PIPELINE_AUTO === "1";
if (!slug) { process.stderr.write("usage: pipeline.mjs <date-slug> [--auto]\n"); process.exit(1); }

function run(script, args = []) {
  const result = spawnSync("bun", ["run", resolve(scriptsDir, script), slug, ...args], { cwd: repoRoot, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function publishState() {
  const result = spawnSync("bun", ["run", resolve(scriptsDir, "state.mjs"), "dump", slug], { cwd: repoRoot, encoding: "utf8" });
  try { return JSON.parse(result.stdout).publish ?? { blog: "pending", wechat: "pending" }; } catch { return { blog: "pending", wechat: "pending" }; }
}

let step = nextStep(slug);
process.stdout.write(`current step: ${step}\n`);
if (step === "done") process.exit(0);
if (!auto) {
  process.stdout.write("Complete the current Agent-owned step and run its Gate, then resume here.\n");
  if (step === 5) process.stdout.write(`Step 5: delegate github-image-hosting to create image-map.json, run step5-build.mjs ${slug} --prepare-only, then delegate gzh-design and run --finalize-only.\n`);
  if (step === 6) process.stdout.write(`Publish states: ${JSON.stringify(publishState())}\n`);
  process.exit(0);
}

if (step === 5) {
  run("step5-build.mjs");
  step = nextStep(slug);
  const postDir = resolve(repoRoot, "posts", slug);
  if (step === 5 && existsSync(resolve(postDir, "article-wechat-source.md")) && !existsSync(resolve(postDir, "article-wechat.html"))) {
    process.stdout.write("gzh-design must create article-wechat.html before Step 5 finalize.\n");
    process.exit(0);
  }
}

if (step === 6) {
  let publish = publishState();
  if (publish.blog === "pending" || publish.blog === "failed") run("publish-blog.mjs");
  publish = publishState();
  if (publish.wechat === "pending" || publish.wechat === "failed") run("publish-wechat.mjs", ["--skip-deploy-check"]);
}

import { describe, expect, test, afterEach } from "bun:test";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const SCRIPT = resolve(import.meta.dir, "../scripts/pipeline.mjs");
const PROJECT_ROOT = resolve(import.meta.dir, "../../../..");

function makeFixture(lastCompleteStep, publish = { blog: "done", wechat: "pending" }, failedStep = null) {
  const root = join(tmpdir(), `pipeline-advisory-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const postsRoot = join(root, "posts");
  const slug = "2026-09-03-pipeline-advisory";
  const postDir = join(postsRoot, slug);
  mkdirSync(postDir, { recursive: true });
  writeFileSync(join(postDir, ".pipeline-state.json"), JSON.stringify({
    slug,
    last_complete_step: lastCompleteStep,
    publish,
    failed_step: failedStep,
  }, null, 2) + "\n");
  return { root, postsRoot, postDir, slug };
}

function run(fixture, ...args) {
  return spawnSync("bun", ["run", SCRIPT, fixture.slug, ...args], {
    cwd: PROJECT_ROOT,
    env: { ...process.env, PIPELINE_POSTS_ROOT: fixture.postsRoot },
    encoding: "utf8",
  });
}

describe("pipeline advisory CLI", () => {
  const cleanup = [];

  afterEach(() => {
    while (cleanup.length > 0) rmSync(cleanup.pop(), { recursive: true, force: true });
  });

  test("reports native next steps without mutating state", () => {
    const fixture = makeFixture(6);
    cleanup.push(fixture.root);
    const before = readFileSync(join(fixture.postDir, ".pipeline-state.json"), "utf8");
    const result = run(fixture);

    expect(result.status, result.stderr || result.stdout).toBe(0);
    expect(result.stdout).toContain("baoyu-post-to-wechat");
    expect(result.stdout).toContain("--prepare-only");
    expect(result.stdout).toContain("ACTION: Main executes publishing directly.");
    expect(result.stdout).toContain("baoyu-post-to-wechat with article-wechat.html");
    expect(result.stdout).not.toContain("phase executor");
    expect(result.stdout).not.toContain("MODEL CONTEXT");
    expect(readFileSync(join(fixture.postDir, ".pipeline-state.json"), "utf8")).toBe(before);
  });

  test("reports direct Main build actions and required Specialists", () => {
    const fixture = makeFixture(4, { blog: "pending", wechat: "pending" });
    cleanup.push(fixture.root);
    const result = run(fixture);

    expect(result.status, result.stderr || result.stdout).toBe(0);
    expect(result.stdout).toContain("ACTION: Main executes this workflow directly.");
    expect(result.stdout).toContain("REQUIRED SPECIALIST: github-image-hosting / gzh-design");
    expect(result.stdout).toContain("github-image-hosting");
    expect(result.stdout).toContain("gzh-design");
    expect(result.stdout).toContain("step5-build.mjs");
    expect(result.stdout).toContain("--finalize-only");
    expect(result.stdout).not.toContain("build-prepare");
    expect(result.stdout).not.toContain("wechat-layout");
  });

  test("reports direct Main actions for each resumable step", () => {
    const cases = [
      [0, "Step 1 / 1.5 / 1.8", ["Main reads the primary source directly", "understanding-brief.md"]],
      [1, "Step 2 / 3", ["MODE: full", "draft.md", "humanizer-zh"]],
      [2, "Step 3", ["MODE: humanization recovery", "reuse frozen draft.md", "humanizer-zh"]],
      [3, "Step 4", ["cover", "image-plan.json"]],
    ];
    for (const [lastCompleteStep, phase, units] of cases) {
      const fixture = makeFixture(lastCompleteStep, { blog: "pending", wechat: "pending" });
      cleanup.push(fixture.root);
      const result = run(fixture);

      expect(result.status, result.stderr || result.stdout).toBe(0);
      expect(result.stdout).toContain(`NEXT STEP: ${phase}`);
      expect(result.stdout).toContain("ACTION: Main executes this workflow directly.");
      for (const unit of units) expect(result.stdout).toContain(unit);
      expect(result.stdout).not.toContain("phase executor");
      expect(result.stdout).not.toContain("MODEL CONTEXT");
    }
  });

  test("resumes Step 3 with frozen draft and skips draft generation", () => {
    const fixture = makeFixture(2, { blog: "pending", wechat: "pending" });
    cleanup.push(fixture.root);
    const result = run(fixture);

    expect(result.status, result.stderr || result.stdout).toBe(0);
    expect(result.stdout).toContain("MODE: humanization recovery");
    expect(result.stdout).toContain("reuse frozen draft.md");
    expect(result.stdout).toContain("humanizer-zh");
    expect(result.stdout).not.toContain("1. draft");
    expect(result.stdout).not.toContain("Step 2 Gate");
  });

  test("failed Understanding resumes Step 1 workflow rather than drafting", () => {
    const fixture = makeFixture(0, { blog: "pending", wechat: "pending" }, {
      step: 1,
      error: "missing or empty sections",
      at: new Date().toISOString(),
    });
    cleanup.push(fixture.root);
    const result = run(fixture);

    expect(result.status, result.stderr || result.stdout).toBe(0);
    expect(result.stdout).toContain("NEXT STEP: Step 1 / 1.5 / 1.8");
    expect(result.stdout).not.toContain("NEXT STEP: Step 2 / 3");
  });

  test("failed Step 3 also resumes humanization recovery", () => {
    const fixture = makeFixture(2, { blog: "pending", wechat: "pending" }, {
      step: 3,
      error: "semantic drift",
      at: new Date().toISOString(),
    });
    cleanup.push(fixture.root);
    const result = run(fixture);

    expect(result.status, result.stderr || result.stdout).toBe(0);
    expect(result.stdout).toContain("MODE: humanization recovery");
    expect(result.stdout).not.toContain("1. draft");
  });

  test("does not retain the removed auto orchestration mode", () => {
    const fixture = makeFixture(6);
    cleanup.push(fixture.root);
    const result = run(fixture, "--auto");
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("usage: pipeline.mjs");
    const source = readFileSync(SCRIPT, "utf8");
    expect(source).not.toContain("spawnSync");
    expect(source).not.toContain("PIPELINE_AUTO");
  });
});

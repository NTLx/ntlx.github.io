import { describe, expect, test, afterEach } from "bun:test";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const SCRIPT = resolve(import.meta.dir, "../scripts/pipeline.mjs");
const PROJECT_ROOT = resolve(import.meta.dir, "../../../..");

function makeFixture(lastCompleteStep) {
  const root = join(tmpdir(), `pipeline-advisory-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const postsRoot = join(root, "posts");
  const slug = "2026-09-03-pipeline-advisory";
  const postDir = join(postsRoot, slug);
  mkdirSync(postDir, { recursive: true });
  writeFileSync(join(postDir, ".pipeline-state.json"), JSON.stringify({
    slug,
    last_complete_step: lastCompleteStep,
    publish: { blog: "done", wechat: "pending" },
    failed_step: null,
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
    expect(result.stdout).toContain("Main chooses an available isolated execution mechanism for each unit.");
    expect(result.stdout).not.toContain("Worker");
    expect(readFileSync(join(fixture.postDir, ".pipeline-state.json"), "utf8")).toBe(before);
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

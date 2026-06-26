#!/usr/bin/env bun
/**
 * check-deps.mjs regression tests.
 */

import { describe, expect, test } from "bun:test";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const SCRIPT = resolve(import.meta.dir, "../scripts/check-deps.mjs");
const REPO_ROOT = resolve(import.meta.dir, "../../../..");

function run(stage, env = {}) {
  return spawnSync(process.execPath, ["run", SCRIPT, "--stage", stage, "--json"], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
}

describe("check-deps", () => {
  test("passes image template preflight using gpt-image-2 as template source only", () => {
    const r = run("images");
    expect(r.status).toBe(0);
    const payload = JSON.parse(r.stdout);
    expect(payload.ok).toBe(true);
    expect(payload.stage).toBe("images");
  });

  test("warns but does not fail image preflight when codex CLI is unavailable", () => {
    const r = run("images", { PATH: "/nonexistent" });
    expect(r.status).toBe(0);
    const payload = JSON.parse(r.stdout);
    expect(payload.ok).toBe(true);
    expect(payload.stage).toBe("images");
    expect(payload.warnings.join("\n")).toContain("codex CLI unavailable");
    expect(payload.warnings.join("\n")).toContain("baoyu-image-gen fallback");
  });

  test("passes publish dependency preflight without source-url patch checks", () => {
    const r = run("publish");
    expect(r.status).toBe(0);
    const payload = JSON.parse(r.stdout);
    expect(payload.ok).toBe(true);
    expect(payload.stage).toBe("publish");
    expect(payload.errors.join("\n")).not.toContain("source-url patch");
    expect(payload.warnings.join("\n")).not.toContain("source-url patch");
  });
});

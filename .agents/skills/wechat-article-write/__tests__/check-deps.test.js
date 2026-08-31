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

  test("fails closed when codex CLI is unavailable", () => {
    const r = run("images", { PATH: "/nonexistent" });
    expect(r.status).toBe(2);
    const payload = JSON.parse(r.stdout);
    expect(payload.ok).toBe(false);
    expect(payload.stage).toBe("images");
    expect(payload.errors.join("\n")).toContain("Codex CLI unavailable");
    expect(payload.errors.join("\n")).not.toMatch(/fallback|openai|google|dashscope/i);
  });

  test("passes build dependency preflight when gzh-design is installed", () => {
    const r = run("build");
    expect(r.status).toBe(0);
    const payload = JSON.parse(r.stdout);
    expect(payload.ok).toBe(true);
    expect(payload.stage).toBe("build");
  });

  test("passes publish dependency preflight without source-url patch checks", () => {
    const r = run("publish");
    expect(r.status).toBe(0);
    const payload = JSON.parse(r.stdout);
    expect(payload.ok).toBe(true);
    expect(payload.stage).toBe("publish");
    expect(payload.errors.join("\n")).not.toContain("baoyu-markdown-to-html");
    expect(payload.errors.join("\n")).not.toContain("source-url patch");
    expect(payload.warnings.join("\n")).not.toContain("source-url patch");
  });
});

#!/usr/bin/env bun
/**
 * check-deps.mjs regression tests.
 */

import { describe, expect, test } from "bun:test";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const SCRIPT = resolve(import.meta.dir, "../scripts/check-deps.mjs");
const REPO_ROOT = resolve(import.meta.dir, "../../../..");

function run(stage) {
  return spawnSync("bun", ["run", SCRIPT, "--stage", stage, "--json"], {
    cwd: REPO_ROOT,
    encoding: "utf8",
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

  test("passes publish preflight and verifies source-url patch", () => {
    const r = run("publish");
    expect(r.status).toBe(0);
    const payload = JSON.parse(r.stdout);
    expect(payload.ok).toBe(true);
    expect(payload.stage).toBe("publish");
  });
});

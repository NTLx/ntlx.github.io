#!/usr/bin/env bun

import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { runImageBackendChecks } from "../scripts/check-image-backend.mjs";

const SCRIPT = resolve(import.meta.dir, "../scripts/check-image-backend.mjs");

function createValidFixture(root) {
  mkdirSync(join(root, ".baoyu-skills", "baoyu-image-gen"), { recursive: true });
  writeFileSync(join(root, ".baoyu-skills", "baoyu-image-gen", "EXTEND.md"), "---\nversion: 1\ndefault_provider: codex-cli\n---\n");
}

function runCli(root, args = [], env = {}) {
  return spawnSync(process.execPath, ["run", SCRIPT, ...args, "--json"], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, PIPELINE_REPO_ROOT: root, ...env },
  });
}

describe("image backend policy preflight", () => {
  test("accepts the project Codex routing contract", () => {
    const root = join(tmpdir(), `image-backend-valid-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    try {
      createValidFixture(root);
      const result = runImageBackendChecks({ root, checkCli: false, checkEnv: false });
      expect(result.ok).toBe(true);
      expect(result.details.default_provider).toBe("codex-cli");
      expect(result.details.high_level).toBeUndefined();
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("rejects a non-Codex default without inspecting provider credentials", () => {
    const root = join(tmpdir(), `image-backend-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    try {
      mkdirSync(join(root, ".baoyu-skills", "baoyu-image-gen"), { recursive: true });
      writeFileSync(join(root, ".baoyu-skills", "baoyu-image-gen", "EXTEND.md"), "---\nversion: 1\ndefault_provider: openai\n---\n");
      const result = runImageBackendChecks({ root, checkCli: false, checkEnv: false });
      expect(result.ok).toBe(false);
      expect(result.errors.join("\n")).toContain("default_provider must be codex-cli");
      expect(JSON.stringify(result)).not.toMatch(/api[_ -]?key|secret|token/i);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("static CLI passes when Codex CLI is unavailable", () => {
    const root = join(tmpdir(), `image-backend-static-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    try {
      createValidFixture(root);
      const result = runCli(root, ["--static"], { PATH: "/nonexistent" });
      expect(result.status).toBe(0);
      const payload = JSON.parse(result.stdout);
      expect(payload.ok).toBe(true);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("runtime CLI fails when Codex CLI is unavailable", () => {
    const root = join(tmpdir(), `image-backend-runtime-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    try {
      createValidFixture(root);
      const result = runCli(root, ["--runtime"], { PATH: "/nonexistent" });
      expect(result.status).toBe(2);
      const payload = JSON.parse(result.stdout);
      expect(payload.ok).toBe(false);
      expect(payload.errors.join("\n")).toContain("Codex CLI unavailable");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("no mode keeps the runtime fail-closed default", () => {
    const root = join(tmpdir(), `image-backend-default-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    try {
      createValidFixture(root);
      const result = runCli(root, [], { PATH: "/nonexistent" });
      expect(result.status).toBe(2);
      expect(JSON.parse(result.stdout).errors.join("\n")).toContain("Codex CLI unavailable");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("both modes reject a non-Codex default provider", () => {
    const root = join(tmpdir(), `image-backend-provider-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    try {
      createValidFixture(root);
      writeFileSync(join(root, ".baoyu-skills", "baoyu-image-gen", "EXTEND.md"), "---\nversion: 1\ndefault_provider: openai\n---\n");
      for (const mode of ["--static", "--runtime"]) {
        const result = runCli(root, [mode], { PATH: "/nonexistent" });
        expect(result.status).toBe(2);
        expect(JSON.parse(result.stdout).errors.join("\n")).toContain("default_provider must be codex-cli");
      }
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

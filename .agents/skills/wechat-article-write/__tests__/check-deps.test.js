#!/usr/bin/env bun
/**
 * check-deps.mjs regression tests.
 */

import { describe, expect, test } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { join } from "node:path";
import { tmpdir } from "node:os";
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
  test("passes image repository preflight without Codex CLI runtime", () => {
    const r = run("images", { PATH: "/nonexistent" });
    expect(r.status).toBe(0);
    const payload = JSON.parse(r.stdout);
    expect(payload.ok).toBe(true);
    expect(payload.stage).toBe("images");
  });

  test("does not require optional visual Skills for the image protocol", () => {
    const root = join(tmpdir(), `check-deps-optional-visual-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    try {
      mkdirSync(join(root, ".baoyu-skills", "baoyu-image-gen"), { recursive: true });
      mkdirSync(join(root, ".agents", "skills", "baoyu-image-gen"), { recursive: true });
      mkdirSync(join(root, ".agents", "skills", "wechat-article-write", "references"), { recursive: true });
      writeFileSync(join(root, ".baoyu-skills", "baoyu-image-gen", "EXTEND.md"), "---\nversion: 1\ndefault_provider: codex-cli\n---\n");
      writeFileSync(join(root, ".agents", "skills", "baoyu-image-gen", "SKILL.md"), "---\nname: baoyu-image-gen\n---\n");
      writeFileSync(join(root, ".agents", "skills", "wechat-article-write", "references", "image-template-map.json"), "{}\n");
      writeFileSync(join(root, ".agents", "skills", "wechat-article-write", "references", "image-plan.schema.json"), "{}\n");

      const r = run("images", { PIPELINE_REPO_ROOT: root, PATH: "/nonexistent" });
      expect(r.status).toBe(0);
      expect(JSON.parse(r.stdout).ok).toBe(true);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
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

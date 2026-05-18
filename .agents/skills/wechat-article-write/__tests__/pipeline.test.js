#!/usr/bin/env bun
/**
 * pipeline.mjs 回归测试
 *
 * 确认默认模式只报告状态，不执行 Step 5/6 的副作用。
 */

import { describe, test, expect, afterEach } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const SCRIPT = resolve(import.meta.dir, "../scripts/pipeline.mjs");

function makeState(postsRoot, slug, lastCompleteStep) {
  const dir = join(postsRoot, slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, ".pipeline-state.json"), JSON.stringify({
    slug,
    started_at: new Date().toISOString(),
    last_complete_step: lastCompleteStep,
    publish: { blog: "pending", wechat: "pending" },
    failed_step: null,
  }, null, 2) + "\n");
}

describe("pipeline", () => {
  let cleanup = [];

  afterEach(() => {
    for (const dir of cleanup) {
      try { rmSync(dir, { recursive: true, force: true }); } catch {}
    }
    cleanup = [];
  });

  test("without --auto it only reports status for Step 5", () => {
    const root = join(tmpdir(), `pipeline-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    const postsRoot = join(root, "posts");
    cleanup.push(root);
    const slug = "2026-05-17-pipeline-status";
    makeState(postsRoot, slug, 4);

    const r = spawnSync("bun", ["run", SCRIPT, slug], {
      cwd: resolve(import.meta.dir, "../../../.."),
      env: { ...process.env, PIPELINE_POSTS_ROOT: postsRoot },
      encoding: "utf8",
    });

    expect(r.status).toBe(0);
    expect(r.stdout).toContain("未传 --auto");
    expect(r.stdout).toContain("Step 5");
    expect(r.stdout).not.toContain("Step 5: 产物构建");
  });
});

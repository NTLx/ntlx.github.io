#!/usr/bin/env bun
/**
 * step1-collect.mjs 回归测试
 *
 * 覆盖联网背景调研门控，确保写作前的背景资料不是可选项。
 */

import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const SCRIPT = resolve(import.meta.dir, "../scripts/step1-collect.mjs");
const REPO_ROOT = resolve(import.meta.dir, "../../../..");

function makeFixture() {
  const root = join(tmpdir(), `step1-collect-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const postsRoot = join(root, "posts");
  return { root, postsRoot };
}

function writeMaterials(postsRoot, slug, content) {
  const dir = join(postsRoot, slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "materials.md"), content);
  return dir;
}

function runStep1(slug, postsRoot) {
  return spawnSync("bun", ["run", SCRIPT, slug], {
    cwd: REPO_ROOT,
    env: { ...process.env, PIPELINE_POSTS_ROOT: postsRoot },
    encoding: "utf8",
  });
}

describe("step1-collect background research gate", () => {
  let cleanup = [];

  afterEach(() => {
    for (const dir of cleanup) {
      try { rmSync(dir, { recursive: true, force: true }); } catch {}
    }
    cleanup = [];
  });

  test("valid materials with background research URL pass", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-24-valid-step1";
    const dir = writeMaterials(fx.postsRoot, slug, `
# 原文资料

原文内容和摘要。

## 背景调研

- 相关公司背景：https://example.com/company
- 相关评论：https://example.com/discussion
`);

    const r = runStep1(slug, fx.postsRoot);
    expect(r.status).toBe(0);

    const state = JSON.parse(readFileSync(join(dir, ".pipeline-state.json"), "utf8"));
    expect(state.last_complete_step).toBe(1);
    expect(state.background_urls).toBe(2);
  });

  test("missing background research section fails", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-24-missing-background";
    writeMaterials(fx.postsRoot, slug, "只有原文资料，没有背景调研。");

    const r = runStep1(slug, fx.postsRoot);
    expect(r.status).toBe(3);
    expect(r.stderr).toContain("背景调研");
  });

  test("background research without URL fails", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-24-background-no-url";
    writeMaterials(fx.postsRoot, slug, `
## 背景调研

- 这里写了背景，但没有可追溯来源。
`);

    const r = runStep1(slug, fx.postsRoot);
    expect(r.status).toBe(3);
    expect(r.stderr).toContain("来源 URL");
  });
});

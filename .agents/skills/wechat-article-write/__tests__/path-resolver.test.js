#!/usr/bin/env bun
/**
 * path-resolver.mjs 单元测试（精简版）
 *
 * 测试 repoRoot / postsRoot / statePath / postDir
 */

import { describe, test, expect, afterEach } from "bun:test";
import { rmSync } from "node:fs";
import { resolve, join } from "node:path";
import { tmpdir } from "node:os";

const SCRIPTS_DIR = resolve(import.meta.dir, "../scripts");
const TMP = join(tmpdir(), `path-resolver-test-${Date.now()}`);

function setupEnv(postsRoot, repoRoot) {
  const origPosts = process.env.PIPELINE_POSTS_ROOT;
  const origRepo = process.env.PIPELINE_REPO_ROOT;
  if (postsRoot !== undefined) process.env.PIPELINE_POSTS_ROOT = postsRoot;
  else delete process.env.PIPELINE_POSTS_ROOT;
  if (repoRoot !== undefined) process.env.PIPELINE_REPO_ROOT = repoRoot;
  else delete process.env.PIPELINE_REPO_ROOT;
  return () => {
    if (origPosts !== undefined) process.env.PIPELINE_POSTS_ROOT = origPosts;
    else delete process.env.PIPELINE_POSTS_ROOT;
    if (origRepo !== undefined) process.env.PIPELINE_REPO_ROOT = origRepo;
    else delete process.env.PIPELINE_REPO_ROOT;
  };
}

async function loadModule() {
  return import(`${SCRIPTS_DIR}/path-resolver.mjs?t=${Date.now()}`);
}

describe("path-resolver", () => {
  afterEach(() => {
    try { rmSync(TMP, { recursive: true, force: true }); } catch {}
  });

  test("repoRoot 默认返回 CWD", async () => {
    const restore = setupEnv(undefined, undefined);
    const m = await loadModule();
    expect(m.repoRoot()).toBe(resolve("."));
    restore();
  });

  test("repoRoot 尊重 PIPELINE_REPO_ROOT", async () => {
    const restore = setupEnv(undefined, TMP);
    const m = await loadModule();
    expect(m.repoRoot()).toBe(TMP);
    restore();
  });

  test("postsRoot 默认返回 CWD/posts", async () => {
    const restore = setupEnv(undefined, undefined);
    const m = await loadModule();
    expect(m.postsRoot()).toBe(resolve("posts"));
    restore();
  });

  test("postsRoot 尊重 PIPELINE_POSTS_ROOT", async () => {
    const postsDir = join(TMP, "posts");
    const restore = setupEnv(postsDir, undefined);
    const m = await loadModule();
    expect(m.postsRoot()).toBe(postsDir);
    restore();
  });

  test("statePath 拼接正确", async () => {
    const postsDir = join(TMP, "posts");
    const restore = setupEnv(postsDir, undefined);
    const m = await loadModule();
    expect(m.statePath("2026-05-16-test")).toBe(join(postsDir, "2026-05-16-test", ".pipeline-state.json"));
    restore();
  });

  test("postDir 返回 postsRoot/slug", async () => {
    const postsDir = join(TMP, "posts");
    const restore = setupEnv(postsDir, undefined);
    const m = await loadModule();
    expect(m.postDir("2026-05-16-test")).toBe(join(postsDir, "2026-05-16-test"));
    restore();
  });
});
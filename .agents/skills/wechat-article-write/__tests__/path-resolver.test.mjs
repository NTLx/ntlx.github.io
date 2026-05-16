#!/usr/bin/env bun
/**
 * path-resolver.mjs 单元测试
 *
 * 测试 resolveBase / resolveSlug / postsRoot / repoRoot / statePath
 */

import { describe, test, expect, afterEach } from "bun:test";
import { rmSync } from "node:fs";
import { resolve, join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

// 被测模块路径
const SCRIPTS_DIR = resolve(import.meta.dir, "../scripts");

// 临时目录
const TMP = join(tmpdir(), `path-resolver-test-${Date.now()}`);

function setupEnv(postsRoot, repoRoot) {
  const origPosts = process.env.PIPELINE_POSTS_ROOT;
  const origRepo = process.env.PIPELINE_REPO_ROOT;
  const origStrict = process.env.PIPELINE_STRICT_SLUG;
  if (postsRoot !== undefined) process.env.PIPELINE_POSTS_ROOT = postsRoot;
  else delete process.env.PIPELINE_POSTS_ROOT;
  if (repoRoot !== undefined) process.env.PIPELINE_REPO_ROOT = repoRoot;
  else delete process.env.PIPELINE_REPO_ROOT;
  delete process.env.PIPELINE_STRICT_SLUG;
  return () => {
    if (origPosts !== undefined) process.env.PIPELINE_POSTS_ROOT = origPosts;
    else delete process.env.PIPELINE_POSTS_ROOT;
    if (origRepo !== undefined) process.env.PIPELINE_REPO_ROOT = origRepo;
    else delete process.env.PIPELINE_REPO_ROOT;
    if (origStrict !== undefined) process.env.PIPELINE_STRICT_SLUG = origStrict;
    else delete process.env.PIPELINE_STRICT_SLUG;
  };
}

// 动态导入以捕获环境变量
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

  test("resolveBase: 纯 slug → postsRoot/slug", async () => {
    const postsDir = join(TMP, "posts");
    const restore = setupEnv(postsDir, undefined);
    const m = await loadModule();
    expect(m.resolveBase("2026-05-16-test")).toBe(join(postsDir, "2026-05-16-test"));
    restore();
  });

  test("resolveBase: 相对路径含 posts/ → 去掉前缀", async () => {
    const postsDir = join(TMP, "posts");
    const restore = setupEnv(postsDir, undefined);
    const m = await loadModule();
    expect(m.resolveBase("posts/2026-05-16-test")).toBe(join(postsDir, "2026-05-16-test"));
    restore();
  });

  test("resolveBase: legacy 双重拼接 posts/posts/ → 去重", async () => {
    const postsDir = join(TMP, "posts");
    const restore = setupEnv(postsDir, undefined);
    const m = await loadModule();
    expect(m.resolveBase("posts/posts/2026-05-16-test")).toBe(join(postsDir, "2026-05-16-test"));
    restore();
  });

  test("resolveBase: null/undefined → null", async () => {
    const restore = setupEnv(undefined, undefined);
    const m = await loadModule();
    expect(m.resolveBase(null)).toBeNull();
    expect(m.resolveBase(undefined)).toBeNull();
    restore();
  });

  test("resolveBase: STRICT 模式拒绝含 / 的路径（进程退出）", async () => {
    const restore = setupEnv(undefined, undefined);
    process.env.PIPELINE_STRICT_SLUG = "1";
    // resolveBase 在 STRICT 模式下 process.exit(1)，无法在子进程内测试
    // 改为用 spawnSync 子进程验证退出码
    const r = spawnSync("bun", ["-e", `
      process.env.PIPELINE_STRICT_SLUG = "1";
      import("${SCRIPTS_DIR}/path-resolver.mjs").then(m => {
        m.resolveBase("posts/slug");
      });
    `], { encoding: "utf8" });
    expect(r.status).toBe(1);
    delete process.env.PIPELINE_STRICT_SLUG;
    restore();
  });

  test("resolveSlug: 从路径提取 basename", async () => {
    const restore = setupEnv(undefined, undefined);
    const m = await loadModule();
    expect(m.resolveSlug("2026-05-16-test")).toBe("2026-05-16-test");
    restore();
  });
});

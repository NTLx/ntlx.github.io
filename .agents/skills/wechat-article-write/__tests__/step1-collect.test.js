#!/usr/bin/env bun
/**
 * step1-collect.mjs 回归测试
 *
 * 覆盖 strategy-aware 调研与来源完整性。
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

function writeState(postsRoot, slug, strategy) {
  writeFileSync(join(postsRoot, slug, ".pipeline-state.json"), JSON.stringify({
    slug,
    strategy,
    last_complete_step: 0,
    publish: { blog: "pending", wechat: "pending" },
    failed_step: null,
  }) + "\n");
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

## 原始来源

- url: https://example.com/primary

## 背景调研

- 相关公司背景：https://example.com/company
- 相关评论：https://example.com/discussion
`);
    writeState(fx.postsRoot, slug, "reader-response");

    const r = runStep1(slug, fx.postsRoot);
    expect(r.status).toBe(0);

    const state = JSON.parse(readFileSync(join(dir, ".pipeline-state.json"), "utf8"));
    expect(state.last_complete_step).toBe(0);
    const result = JSON.parse(r.stdout);
    expect(result.background_urls).toBe(2);
    expect(result.primary_source_urls).toBe(1);
    expect(state.background_urls).toBeUndefined();
    expect(state.primary_source_urls).toBeUndefined();
  });

  test("collector success leaves Step 1 workflow incomplete until Understanding passes", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-24-research-interruption";
    const dir = writeMaterials(fx.postsRoot, slug, `
## 原始来源

- url: https://example.com/primary

## 背景调研

- supporting evidence: https://example.com/context
`);
    writeState(fx.postsRoot, slug, "reader-response");

    const r = runStep1(slug, fx.postsRoot);
    expect(r.status, r.stderr || r.stdout).toBe(0);
    const state = JSON.parse(readFileSync(join(dir, ".pipeline-state.json"), "utf8"));
    expect(state.last_complete_step).toBe(0);
  });

  test("reader-response missing background warns without blocking primary material", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-24-missing-background";
    writeMaterials(fx.postsRoot, slug, "## 原始来源\n- pasted: 用户提供的完整原文\n");
    writeState(fx.postsRoot, slug, "reader-response");
    const r = runStep1(slug, fx.postsRoot);
    expect(r.status).toBe(0);
    expect(r.stderr).toContain("normally needs background evidence");
  });

  test("tutorial accepts local evidence without background section or URL", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-24-local-tutorial";
    writeMaterials(fx.postsRoot, slug, "## 本地验证\n依赖版本和复现步骤见本地日志；命令结果已验证。\n");
    writeState(fx.postsRoot, slug, "tutorial");
    expect(runStep1(slug, fx.postsRoot).status).toBe(0);
  });

  test("empty materials cannot bypass the optional research policy", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-24-empty-tutorial";
    writeMaterials(fx.postsRoot, slug, " \n\t");
    writeState(fx.postsRoot, slug, "tutorial");
    const r = runStep1(slug, fx.postsRoot);
    expect(r.status).toBe(3);
    expect(r.stderr).toContain("is empty");
  });

  test("news-digest needs external evidence but no fixed background heading", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-24-news";
    const dir = writeMaterials(fx.postsRoot, slug, "## 原始来源\n- pasted: 用户新闻摘录\n");
    writeState(fx.postsRoot, slug, "news-digest");
    const missing = runStep1(slug, fx.postsRoot);
    expect(missing.status).toBe(3);
    expect(missing.stderr).toContain("external verification");
    writeFileSync(join(dir, "materials.md"), "## 原始来源\n- url: https://example.com/announcement\n");
    expect(runStep1(slug, fx.postsRoot).status).toBe(0);
  });

  test("reader-response requires an explicit primary source section", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-24-missing-primary-source";
    writeMaterials(fx.postsRoot, slug, [
      "## 背景调研", "", "- https://example.com/context", "",
    ].join("\n"));
    writeState(fx.postsRoot, slug, "reader-response");

    const r = runStep1(slug, fx.postsRoot);
    expect(r.status).toBe(3);
    expect(r.stderr).toContain("原始来源");
  });

  test("accepts a pasted primary source without a URL", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-24-pasted-source";
    const dir = writeMaterials(fx.postsRoot, slug, [
      "## 原始来源", "", "- pasted: user-provided text", "",
      "## 背景调研", "", "- https://example.com/context", "",
    ].join("\n"));
    writeState(fx.postsRoot, slug, "reader-response");

    const r = runStep1(slug, fx.postsRoot);
    expect(r.status, r.stderr || r.stdout).toBe(0);
    expect(JSON.parse(r.stdout).primary_source_urls).toBe(0);
  });
});

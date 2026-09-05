#!/usr/bin/env bun

import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const SCRIPT = resolve(import.meta.dir, "../scripts/step2-write.mjs");
const PROJECT_ROOT = resolve(import.meta.dir, "../../../..");

function makeFixture({ memory = true, draftSources = ["https://example.com/source"], materialSources = ["https://example.com/source"] } = {}) {
  const root = join(tmpdir(), `step2-source-uniqueness-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const slug = "2026-07-02-step2-source-uniqueness";
  const postDir = join(root, slug);
  mkdirSync(postDir, { recursive: true });
  const draft = [
    "---",
    "title: Source uniqueness test",
    "date: 2026-07-02",
    "summary: 用于测试来源唯一性。",
    "category: ai-agents",
    "blogSlug: source-uniqueness-test",
    "coverImage: cover.png",
    "sourceUrl: https://ntlx.github.io/articles/source-uniqueness-test",
    `primarySourceUrls: ${JSON.stringify(draftSources)}`,
    "---", "",
    "<!-- SLOT_IMG_00_INFOGRAPHIC -->", "",
    "## 正文", "", "内容。你会怎么做？", "",
    "## 参考资料", "", "- https://example.com/source", "",
  ].join("\n");
  writeFileSync(join(postDir, "draft.md"), draft);
  if (materialSources !== null) {
    writeFileSync(join(postDir, "materials.md"), [
      "## 原始来源", "", ...materialSources.map((url) => `- url: ${url}`), "",
      "## 背景调研", "", "- https://example.com/context", "",
    ].join("\n"));
  }
  if (memory) writeFileSync(join(postDir, "blog-memory.json"), JSON.stringify({ candidates: [], same_source_matches: [{
    source: "https://example.com/source", article_slug: "old", title: "旧文章", url: "https://ntlx.github.io/articles/old", provenance: "frontmatter",
  }] }) + "\n");
  return { root, postDir, slug };
}

function run(fixture, ...args) {
  return spawnSync("bun", ["run", SCRIPT, fixture.slug, ...args], {
    cwd: PROJECT_ROOT,
    env: { ...process.env, PIPELINE_POSTS_ROOT: fixture.root },
    encoding: "utf8",
  });
}

describe("step2 source uniqueness backstop", () => {
  const cleanup = [];

  afterEach(() => {
    while (cleanup.length > 0) rmSync(cleanup.pop(), { recursive: true, force: true });
  });

  test("fails on same_source_matches even with --allow-no-related", () => {
    const fixture = makeFixture();
    cleanup.push(fixture.root);
    const result = run(fixture, "--allow-no-related");
    expect(result.status).toBe(4);
    expect(result.stderr).toContain("primary source already has published article");
  });

  test("fails closed when primary sources exist but blog memory is missing", () => {
    const fixture = makeFixture({ memory: false });
    cleanup.push(fixture.root);
    const result = run(fixture);
    expect(result.status).toBe(4);
    expect(result.stderr).toContain("source uniqueness");
  });

  test("rejects draft provenance that differs from materials", () => {
    const fixture = makeFixture({ memory: false, draftSources: ["https://example.com/source", "https://example.com/extra"] });
    cleanup.push(fixture.root);
    const result = run(fixture);
    expect(result.status).toBe(2);
    expect(result.stderr).toContain("primarySourceUrls");
    expect(result.stderr).toContain("materials.md");
  });
});

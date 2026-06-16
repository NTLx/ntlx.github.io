#!/usr/bin/env bun
/**
 * generate-image-prompts.mjs regression tests.
 *
 * Covers the compact GPT Image 2-style head infographic prompt.
 */

import { describe, test, expect, afterEach } from "bun:test";
import { mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const SCRIPT = resolve(import.meta.dir, "../scripts/generate-image-prompts.mjs");
const REPO_ROOT = resolve(import.meta.dir, "../../../..");

function makeFixture() {
  const root = join(tmpdir(), `generate-image-prompts-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const postsRoot = join(root, "posts");
  return { root, postsRoot };
}

function writeDraft(postsRoot, slug) {
  const dir = join(postsRoot, slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "draft.md"), `---
title: 测试文章
date: 2026-06-15
summary: 真正重要的不是工具变强，而是组织是否会重新分配判断权。
category: ai-coding
blogSlug: prompt-style-test
coverImage: cover.png
sourceUrl: https://ntlx.github.io/articles/prompt-style-test
---

<!-- SLOT_IMG_00_INFOGRAPHIC -->

## 工具变成同事

<!-- SLOT_IMG_01_AGENT_WORKFLOW -->

AI 编程工具开始接管从需求理解到代码修改的连续流程。

## 判断权重新分配

<!-- SLOT_IMG_02_DECISION_RIGHTS -->

团队需要决定哪些判断交给 Agent，哪些仍然由人承担。

## 组织摩擦

<!-- SLOT_IMG_03_REVIEW_LOOP -->

真正的阻力来自评审、权限、回滚和责任边界。

*你会把哪一类判断交给 Agent？*

## 原文参考

> 来源
> https://example.com/source
`);
  return dir;
}

function runGenerator(slug, postsRoot) {
  return spawnSync("bun", ["run", SCRIPT, slug], {
    cwd: REPO_ROOT,
    env: { ...process.env, PIPELINE_POSTS_ROOT: postsRoot },
    encoding: "utf8",
  });
}

function writeImagePlan(postDir, content) {
  writeFileSync(join(postDir, "image-plan.json"), JSON.stringify(content, null, 2));
}

describe("generate-image-prompts head infographic prompt", () => {
  let cleanup = [];

  afterEach(() => {
    for (const dir of cleanup) {
      try { rmSync(dir, { recursive: true, force: true }); } catch {}
    }
    cleanup = [];
  });

  test("uses compact gpt-image-2 template reference instead of bulky baoyu infographic sections", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-06-15-prompt-style";
    const dir = writeDraft(fx.postsRoot, slug);

    const r = runGenerator(slug, fx.postsRoot);
    expect(r.status).toBe(0);

    const promptPath = join(dir, "imgs/prompts/00-infographic-core-summary.md");
    expect(existsSync(promptPath)).toBe(true);
    const prompt = readFileSync(promptPath, "utf8");
    const wordCount = prompt.split(/\s+/).filter(Boolean).length;

    expect(prompt).toContain("Template source: gpt-image-2/references/infographics/hand-drawn-infographic.md");
    expect(prompt).toContain("Use case: infographic-diagram");
    expect(prompt).toContain("Style/medium: high-quality bullet journal infographic");
    expect(prompt).toContain("Text (verbatim):");
    expect(prompt).toContain("Constraints:");
    expect(prompt).not.toContain("## Layout Guidelines");
    expect(prompt).not.toContain("## Style Guidelines");
    expect(wordCount).toBeLessThan(360);
  });

  test("fails on unknown image-plan article_type instead of silently falling back", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-06-15-invalid-plan";
    const dir = writeDraft(fx.postsRoot, slug);
    writeImagePlan(dir, { article_type: "technical-deepdive" });

    const r = runGenerator(slug, fx.postsRoot);
    expect(r.status).not.toBe(0);
    expect(r.stderr).toContain('unknown article_type "technical-deepdive"');
  });
});

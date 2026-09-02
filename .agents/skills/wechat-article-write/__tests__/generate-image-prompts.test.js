#!/usr/bin/env bun

import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const SCRIPT = resolve(import.meta.dir, "../scripts/generate-image-prompts.mjs");
const REPO_ROOT = resolve(import.meta.dir, "../../../..");

function fixture() {
  const root = join(tmpdir(), `prompt-contract-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const postDir = join(root, "posts", "2026-06-15-prompt-contract");
  mkdirSync(join(postDir, "imgs", "prompts"), { recursive: true });
  writeFileSync(join(postDir, "draft.md"), `---
title: 测试文章
date: 2026-06-15
summary: 测试视觉 Prompt 合同。
category: ai-coding
blogSlug: prompt-contract
coverImage: cover.png
sourceUrl: https://ntlx.github.io/articles/prompt-contract
---

<!-- SLOT_IMG_00_INFOGRAPHIC -->

## 第一章

<!-- SLOT_IMG_01_RELATION -->

正文。
`);
  writeFileSync(join(postDir, "image-plan.json"), JSON.stringify({
    visual_profile: "bright-vivid-warm",
    source_image_policy: "prefer-reuse",
    article_visual_design: {
      planner: "wechat-article-write-agent",
      coverage_review: [{ section_index: 1, heading: "第一章", decision: "illustrate", slot: 1, reason: "需要表达关系" }],
    },
    cover: {
      producer: "baoyu-cover-image",
      intent: "中心视觉",
      baoyu_design: { skill: "baoyu-cover-image", aspect: "2.35:1", text: "none" },
      prompt_source: "external",
    },
    infographic: {
      producer: "baoyu-xhs-images",
      intent: "全文压缩",
      baoyu_design: { skill: "baoyu-xhs-images", card_count: 1 },
      text_density: "low",
      has_long_copy: false,
      prompt_source: "external",
    },
    illustrations: [{
      slot: 1,
      producer: "baoyu-infographic",
      intent: "解释关系",
      baoyu_design: { skill: "baoyu-infographic", layout: "hub-spoke" },
      text_density: "low",
      has_long_copy: false,
      prompt_source: "external",
      description: "relation",
    }],
    source_image_review: [],
  }, null, 2));
  for (const [name, text] of [
    ["00-cover-prompt-contract.md", "A visual metaphor for the article."],
    ["00-infographic-core-summary.md", "A compact map of the main argument."],
    ["01-relation.md", "A clear diagram of the relationship."],
  ]) writeFileSync(join(postDir, "imgs", "prompts", name), `${text}\n`);
  return { root, postsRoot: join(root, "posts"), postDir, slug: "2026-06-15-prompt-contract" };
}

function run(fx, args = []) {
  return spawnSync("bun", ["run", SCRIPT, fx.slug, ...args], {
    cwd: REPO_ROOT,
    env: { ...process.env, PIPELINE_REPO_ROOT: REPO_ROOT, PIPELINE_POSTS_ROOT: fx.postsRoot },
    encoding: "utf8",
  });
}

describe("canonical producer prompts", () => {
  const cleanup = [];
  afterEach(() => {
    for (const root of cleanup.splice(0)) rmSync(root, { recursive: true, force: true });
  });

  test("finalizes all external producer prompts and is idempotent", () => {
    const fx = fixture();
    cleanup.push(fx.root);
    const first = run(fx);
    expect(first.status).toBe(0);
    const promptPath = join(fx.postDir, "imgs/prompts/00-cover-prompt-contract.md");
    const prompt = readFileSync(promptPath, "utf8");
    expect(prompt).toContain("Project visual profile: bright-vivid-warm");
    expect(prompt).toContain("Aspect ratio: 2.35:1");
    expect(prompt.match(/WECHAT_ARTICLE_VISUAL_CONTRACT_START/g)).toHaveLength(1);

    const second = run(fx);
    expect(second.status).toBe(0);
    expect(readFileSync(promptPath, "utf8")).toBe(prompt);
  });

  test("fails closed when a route is crossed or an external prompt is missing", () => {
    const fx = fixture();
    cleanup.push(fx.root);
    const planPath = join(fx.postDir, "image-plan.json");
    const plan = JSON.parse(readFileSync(planPath, "utf8"));
    plan.illustrations[0].producer = "baoyu-xhs-images";
    writeFileSync(planPath, JSON.stringify(plan));
    const wrongRoute = run(fx);
    expect(wrongRoute.status).not.toBe(0);
    expect(wrongRoute.stderr).toContain("producer must be baoyu-infographic");

    plan.illustrations[0].producer = "baoyu-infographic";
    writeFileSync(planPath, JSON.stringify(plan));
    rmSync(join(fx.postDir, "imgs/prompts/01-relation.md"));
    const missing = run(fx);
    expect(missing.status).not.toBe(0);
    expect(missing.stderr).toContain("external visual prompt missing");
    expect(missing.stderr).toContain("producer=baoyu-infographic");
  });

  test("does not retain the removed default-plan path", () => {
    const fx = fixture();
    cleanup.push(fx.root);
    const result = run(fx, ["--allow-default-image-plan"]);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("usage:");
  });
});

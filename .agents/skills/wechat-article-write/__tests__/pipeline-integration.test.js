#!/usr/bin/env bun

import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const REPO_ROOT = resolve(import.meta.dir, "../../../..");
const SCRIPTS = resolve(import.meta.dir, "../scripts");
const PNG_BYTES = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

function makeFixture() {
  const root = join(tmpdir(), `wechat-pipeline-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  return { root, postsRoot: join(root, "posts") };
}

function runScript(name, slug, postsRoot, args = []) {
  return spawnSync("bun", ["run", resolve(SCRIPTS, name), slug, ...args], {
    cwd: REPO_ROOT,
    env: { ...process.env, PIPELINE_REPO_ROOT: REPO_ROOT, PIPELINE_POSTS_ROOT: postsRoot },
    encoding: "utf8",
  });
}

function runState(args, postsRoot) {
  return spawnSync("bun", ["run", resolve(SCRIPTS, "state.mjs"), ...args], {
    cwd: REPO_ROOT,
    env: { ...process.env, PIPELINE_REPO_ROOT: REPO_ROOT, PIPELINE_POSTS_ROOT: postsRoot },
    encoding: "utf8",
  });
}

function expectSuccess(result) {
  expect(result.status).toBe(0);
}

describe("wechat-article-write full dual-track smoke test", () => {
  const cleanup = [];

  afterEach(() => {
    for (const root of cleanup.splice(0)) rmSync(root, { recursive: true, force: true });
  });

  test("runs materials → understanding → draft → polish → images → dual-track build", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-08-30-agentic-orchestration-smoke";
    const dir = join(fx.postsRoot, slug);
    const imgsDir = join(dir, "imgs");
    mkdirSync(imgsDir, { recursive: true });

    expectSuccess(runState(["init", slug], fx.postsRoot));
    expectSuccess(runState(["strategy", slug, "set", "reader-response"], fx.postsRoot));

    writeFileSync(join(dir, "materials.md"), `# 原始材料

## 核心材料

确定性状态、阶段 Gate 和动态能力发现共同构成可续跑的文章管线。

## 背景调研

- 官方资料：https://example.com/agentic-orchestration

## 事实与判断

事实、推断和作者判断需要在写作前分层，视觉节点也应先表达意图再选工具。
`);
    expectSuccess(runScript("step1-collect.mjs", slug, fx.postsRoot));
    expectSuccess(runScript("select-related-articles.mjs", slug, fx.postsRoot));

    writeFileSync(join(dir, "understanding-brief.md"), `# Understanding Brief

## 原始材料结构

材料同时包含协议事实、编排方法和视觉成本边界。

## 核心问题链

固定流程如何在不破坏确定性 Gate 的前提下允许能力自主选择？

## 中心论点下钻

把方法选择交给 Agent，把产物质量交给合同和 Gate，才能兼顾适应性与可验证性。

## 反方与边界

动态选择不能替代来源核验，也不能突破图片 provider 成本约束。

## 可写成正文的判断

- no-skill 在简单任务中是合理路线。
- Skill 返回值必须经过二次判断。
- Gate 失败应触发诊断和改道。

## 可视觉化的节点

用一张全文摘要图表达“缺口—选择—产物—Gate”的闭环，再用局部图解释关系。

## 写作契约

- 说明确定性内核和自适应层各自负责什么。
- 用一个具体流程解释 Gate 失败后的重规划。
- 保留作者对成本边界和可验证性的独立判断。
`);
    expectSuccess(runScript("validate-understanding.mjs", slug, fx.postsRoot));

    writeFileSync(join(dir, "draft.md"), `---
title: Agentic 编排的可验证写作管线
date: 2026-08-30
summary: 把方法选择交给 Agent，把质量判断交给 Gate，文章流程才既灵活又可复现。
category: ai-coding
blogSlug: agentic-orchestration-smoke
coverImage: cover.png
sourceUrl: https://ntlx.github.io/articles/agentic-orchestration-smoke
---

<!-- SLOT_IMG_00_INFOGRAPHIC -->

## 先分清谁负责什么

确定性内核负责状态、文件和发布协议；Agent 负责识别缺口并选择当前真正有用的能力。

<!-- SLOT_IMG_01_CORE_TENSION -->

## 为什么不能把 Skill 链写死

一个简单任务可能不需要 Skill，复杂结构任务才值得引入专门能力。

<!-- SLOT_IMG_02_GATE_LOOP -->

## Gate 让改道变得可见

如果产物没有满足合同，就诊断缺口、修正输入或换路线，而不是把失败当成功。

<!-- SLOT_IMG_03_COST_BOUNDARY -->

## 成本边界不能自适应突破

内容方法可以变化，图片 raster 仍然必须收束到项目固定的 Codex CLI 路径。

*你会把哪一个开放阶段首先改造成这种“先定义缺口、再选择能力”的闭环？*

## 参考资料

- [官方资料](https://example.com/agentic-orchestration)
`);
    writeFileSync(join(dir, "image-plan.json"), JSON.stringify({
      article_type: "future-architecture-analysis",
      direction: "future-style-language",
      article_visual_design: {
        skill: "baoyu-article-illustrator",
        strategy: "先判断视觉增益，再决定正文 SLOT 数量",
      },
      cover: {
        intent: "表达确定性协议与自适应方法之间的边界",
        baoyu_design: {
          skill: "baoyu-cover-image",
          type: "conceptual",
          style: "technical editorial",
          palette: "cool",
          rendering: "flat-vector",
        },
        contributors: [],
        prompt_source: "adapter",
      },
      infographic: {
        intent: "压缩缺口、选择、产物和 Gate 的闭环",
        baoyu_design: {
          skill: "baoyu-infographic",
          layout: "circular-flow",
          style: "technical-schematic",
        },
        contributors: ["baoyu-diagram"],
        prompt_source: "adapter",
      },
      illustrations: [
        { slot: 1, intent: "比较确定性内核与 Agent 自适应层", baoyu_design: { skill: "baoyu-article-illustrator", type: "comparison", style: "editorial" }, contributors: [], description: "core-boundary", prompt_source: "adapter" },
        { slot: 2, intent: "解释 Gate 失败后的改道路径", baoyu_design: { skill: "baoyu-article-illustrator", type: "flowchart", style: "minimal" }, contributors: ["baoyu-diagram"], description: "gate-reroute", prompt_source: "adapter" },
        { slot: 3, intent: "呈现图片成本边界的分层结构", baoyu_design: { skill: "baoyu-article-illustrator", type: "framework", style: "scientific" }, contributors: [], description: "cost-boundary", prompt_source: "adapter" },
      ],
    }, null, 2) + "\n");

    expectSuccess(runScript("step2-write.mjs", slug, fx.postsRoot, ["--allow-no-related"]));
    expectSuccess(runScript("step3-polish.mjs", slug, fx.postsRoot));
    expectSuccess(runScript("generate-image-prompts.mjs", slug, fx.postsRoot));

    writeFileSync(join(dir, "cover.png"), PNG_BYTES);
    const promptFiles = readdirSync(join(imgsDir, "prompts"))
      .filter((file) => /^\d{2}-.+\.md$/u.test(file))
      .filter((file) => !file.startsWith("00-cover-"));
    for (const promptFile of promptFiles) {
      writeFileSync(join(imgsDir, promptFile.replace(/\.md$/u, ".png")), PNG_BYTES);
    }
    expect(promptFiles.length).toBe(4);
    expectSuccess(runScript("step4-images.mjs", slug, fx.postsRoot));

    const imageFiles = readdirSync(imgsDir).filter((file) => /\.png$/u.test(file));
    writeFileSync(join(dir, "image-map.json"), JSON.stringify({
      files: Object.fromEntries(imageFiles.map((file) => [file, `https://cdn.example.com/${file}`])),
    }, null, 2) + "\n");
    expectSuccess(runScript("step5-build.mjs", slug, fx.postsRoot, ["--reuse-image-map"]));

    writeFileSync(join(dir, "article-wechat.html"), [
      '<section style="margin:0 auto;max-width:720px;">',
      '  <p style="margin:0;line-height:1.8;color:#222;">',
      "    <span leaf=\"\">Smoke test 正文</span>",
      "  </p>",
      "</section>",
      "",
    ].join("\n"));
    expectSuccess(runScript("step5-build.mjs", slug, fx.postsRoot, ["--reuse-image-map"]));

    const state = JSON.parse(readFileSync(join(dir, ".pipeline-state.json"), "utf8"));
    const article = readFileSync(join(dir, "article.md"), "utf8");
    const wechatSource = readFileSync(join(dir, "article-wechat-source.md"), "utf8");
    expect(state.strategy).toBe("reader-response");
    expect(state.last_complete_step).toBe(5);
    expect(existsSync(join(dir, "article-wechat.html"))).toBe(true);
    expect(existsSync(join(dir, "article-wechat_预览.html"))).toBe(true);
    expect(article).not.toContain("SLOT_IMG_");
    expect(article).toContain("https://cdn.example.com/");
    expect(wechatSource).toContain("![](imgs/00-infographic-core-summary.png)");
    expect(wechatSource).toContain("https://example.com/agentic-orchestration");
  });
});

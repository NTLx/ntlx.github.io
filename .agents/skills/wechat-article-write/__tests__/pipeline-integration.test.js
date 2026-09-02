#!/usr/bin/env bun

import { afterEach, describe, expect, test } from "bun:test";
import { chmodSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";

const REPO_ROOT = resolve(import.meta.dir, "../../../..");
const SCRIPTS = resolve(import.meta.dir, "../scripts");
const PNG_BYTES = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);
const JPEG_BYTES = Buffer.from([
  0xff, 0xd8, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00,
  0x64, 0x00, 0xeb, 0x01, 0x01, 0x11, 0x00, 0xff,
  0xd9,
]);

function makeFixture() {
  const root = join(tmpdir(), `wechat-pipeline-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const bin = join(root, "bin");
  const uploader = join(root, "fake-uploader.mjs");
  mkdirSync(bin, { recursive: true });
  writeFileSync(uploader, `import { readdirSync, writeFileSync } from "node:fs";
const [imgsDir, output] = process.argv.slice(2);
const files = readdirSync(imgsDir).filter(file => /\\.(png|jpe?g|webp|gif)$/i.test(file)).sort();
const map = Object.fromEntries(files.map(file => [file, \`https://cdn.example.com/\${file}\`]));
writeFileSync(output, JSON.stringify(map, null, 2) + "\\n");
`);
  const fakeBun = join(bin, "bun");
  writeFileSync(fakeBun, `#!/bin/sh
set -eu
script_seen=0
image_dir=""
output=""
for arg in "$@"; do
  if [ "$script_seen" = "1" ]; then
    image_dir="$arg"
    script_seen=2
  elif case "$arg" in *github-image-hosting/scripts/upload.ts) true;; *) false;; esac; then
    script_seen=1
  fi
done
if [ "$script_seen" = "2" ]; then
  previous=""
  for arg in "$@"; do
    if [ "$previous" = "--output" ]; then output="$arg"; fi
    previous="$arg"
  done
  exec "$REAL_BUN" "$FAKE_UPLOADER" "$image_dir" "$output"
fi
exec "$REAL_BUN" "$@"
`);
  chmodSync(fakeBun, 0o755);
  return { root, postsRoot: join(root, "posts"), bin, uploader };
}

function runScript(name, slug, postsRoot, args = []) {
  const fixtureRoot = resolve(postsRoot, "..");
  return spawnSync("bun", ["run", resolve(SCRIPTS, name), slug, ...args], {
    cwd: REPO_ROOT,
    env: {
      ...process.env,
      PIPELINE_REPO_ROOT: REPO_ROOT,
      PIPELINE_POSTS_ROOT: postsRoot,
      PATH: `${join(fixtureRoot, "bin")}:${process.env.PATH}`,
      REAL_BUN: process.execPath,
      FAKE_UPLOADER: join(fixtureRoot, "fake-uploader.mjs"),
    },
    encoding: "utf8",
  });
}

function runState(args, postsRoot) {
  const fixtureRoot = resolve(postsRoot, "..");
  return spawnSync("bun", ["run", resolve(SCRIPTS, "state.mjs"), ...args], {
    cwd: REPO_ROOT,
    env: {
      ...process.env,
      PIPELINE_REPO_ROOT: REPO_ROOT,
      PIPELINE_POSTS_ROOT: postsRoot,
      PATH: `${join(fixtureRoot, "bin")}:${process.env.PATH}`,
      REAL_BUN: process.execPath,
      FAKE_UPLOADER: join(fixtureRoot, "fake-uploader.mjs"),
    },
    encoding: "utf8",
  });
}

function expectSuccess(result) {
  expect(result.status, result.stderr || result.stdout).toBe(0);
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
      visual_profile: "bright-vivid-warm",
      source_image_policy: "prefer-reuse",
      article_visual_design: {
        planner: "wechat-article-write-agent",
        coverage_review: [
          { section_index: 1, heading: "先分清谁负责什么", decision: "illustrate", slot: 1, reason: "比较确定性内核与 Agent 层的职责" },
          { section_index: 2, heading: "为什么不能把 Skill 链写死", decision: "illustrate", slot: 2, reason: "表达 Gate 失败后的改道路径" },
          { section_index: 3, heading: "Gate 让改道变得可见", decision: "illustrate", slot: 3, reason: "展示失败、诊断和重规划的关系" },
          { section_index: 4, heading: "成本边界不能自适应突破", decision: "text-only", reason: "这一节主要是边界判断，额外图片不会增加足够信息" },
        ],
      },
      cover: {
        producer: "baoyu-cover-image",
        intent: "表达确定性协议与自适应方法之间的边界",
        baoyu_design: {
          skill: "baoyu-cover-image",
          type: "conceptual",
          style: "technical editorial",
          palette: "cool",
          rendering: "flat-vector",
          aspect: "2.35:1",
          text: "none",
        },
        contributors: [],
        prompt_source: "external",
      },
      infographic: {
        producer: "baoyu-xhs-images",
        intent: "压缩缺口、选择、产物和 Gate 的闭环",
        baoyu_design: {
          skill: "baoyu-xhs-images",
          layout: "circular-flow",
          style: "technical-schematic",
          card_count: 1,
        },
        text_density: "low",
        has_long_copy: false,
        contributors: ["baoyu-diagram"],
        prompt_source: "external",
      },
      illustrations: [
        { slot: 1, producer: "baoyu-infographic", intent: "比较确定性内核与 Agent 自适应层", baoyu_design: { skill: "baoyu-infographic", type: "comparison", style: "editorial" }, contributors: [], description: "core-boundary", prompt_source: "external", text_density: "low", has_long_copy: false },
        { slot: 2, producer: "baoyu-infographic", intent: "解释 Gate 失败后的改道路径", baoyu_design: { skill: "baoyu-infographic", type: "flowchart", style: "minimal" }, contributors: ["baoyu-diagram"], description: "gate-reroute", prompt_source: "external", text_density: "low", has_long_copy: false },
        { slot: 3, producer: "baoyu-infographic", intent: "呈现图片成本边界的分层结构", baoyu_design: { skill: "baoyu-infographic", type: "framework", style: "scientific" }, contributors: [], description: "cost-boundary", prompt_source: "external", text_density: "low", has_long_copy: false },
      ],
      source_image_review: [],
    }, null, 2) + "\n");

    // Exercise the pre-humanizer normalization boundary: the cover has JPEG
    // bytes under a .png name, so normalization must happen before receipt.
    writeFileSync(join(dir, "cover.png"), JPEG_BYTES);
    mkdirSync(join(imgsDir, "prompts"), { recursive: true });
    for (const name of [
      "00-cover-agentic-orchestration-smoke.md",
      "00-infographic-core-summary.md",
      "01-core-boundary.md",
      "02-gate-reroute.md",
      "03-cost-boundary.md",
    ]) writeFileSync(join(imgsDir, "prompts", name), "Producer canonical design prompt.\n");

    expectSuccess(runScript("step2-write.mjs", slug, fx.postsRoot, ["--allow-no-related"]));
    expectSuccess(runScript("pre-humanizer-normalize.mjs", slug, fx.postsRoot));
    expect(existsSync(join(dir, "cover.jpg"))).toBe(true);
    expect(readFileSync(join(dir, "draft.md"), "utf8")).toContain("coverImage: cover.jpg");
    expectSuccess(runScript("mark-humanized.mjs", slug, fx.postsRoot));
    expectSuccess(runScript("step3-polish.mjs", slug, fx.postsRoot));
    expectSuccess(runScript("generate-image-prompts.mjs", slug, fx.postsRoot));

    const promptFiles = readdirSync(join(imgsDir, "prompts"))
      .filter((file) => /^\d{2}-.+\.md$/u.test(file))
      .filter((file) => !file.startsWith("00-cover-"));
    for (const promptFile of promptFiles) {
      writeFileSync(join(imgsDir, promptFile.replace(/\.md$/u, ".png")), PNG_BYTES);
    }
    const hash = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");
    const style = { bright: true, high_saturation: true, high_contrast: true, clean_background: true, crisp: true, warm: true, positive: true };
    const reviewedAssets = [
      { asset: "cover.jpg", role: "cover", path: join(dir, "cover.jpg"), text_density: "none" },
      { asset: "00-infographic-core-summary.png", role: "header", path: join(imgsDir, "00-infographic-core-summary.png"), text_density: "low" },
      ...["core-boundary", "gate-reroute", "cost-boundary"].map((description, index) => ({ asset: `${String(index + 1).padStart(2, "0")}-${description}.png`, role: "body", path: join(imgsDir, `${String(index + 1).padStart(2, "0")}-${description}.png`), text_density: "low" })),
    ].map(({ path, ...asset }) => ({ ...asset, sha256: hash(path), approved: true, semantic_match: true, legibility: true, visible_text_ok: true, has_long_copy: false, style_review: style, reviewer_note: "测试图片清晰" }));
    writeFileSync(join(dir, "image-review.json"), JSON.stringify({ version: 1, visual_profile: "bright-vivid-warm", assets: reviewedAssets }, null, 2));
    expect(promptFiles.length).toBe(4);
    expectSuccess(runScript("step4-images.mjs", slug, fx.postsRoot));

    expectSuccess(runScript("step5-build.mjs", slug, fx.postsRoot, ["--prepare-only"]));

    writeFileSync(join(dir, "article-wechat.html"), [
      '<section style="margin:0 auto;max-width:720px;">',
      '  <p style="margin:0;line-height:1.8;color:#222;"><img src="imgs/00-infographic-core-summary.png" style="max-width:100%;height:auto;display:block;margin:0 auto;"></p>',
      '  <h3 style="font-size:20px;color:#222;margin:16px 0;"><span leaf="">先分清谁负责什么</span></h3>',
      '  <p style="margin:0;line-height:1.8;color:#222;"><img src="imgs/01-core-boundary.png" style="max-width:100%;height:auto;display:block;margin:0 auto;"></p>',
      '  <p><span leaf="">确定性内核负责状态、文件和发布协议；Agent 负责识别缺口并选择当前真正有用的能力。</span></p>',
      '  <h3 style="font-size:20px;color:#222;margin:16px 0;"><span leaf="">为什么不能把 Skill 链写死</span></h3>',
      '  <p style="margin:0;line-height:1.8;color:#222;"><img src="imgs/02-gate-reroute.png" style="max-width:100%;height:auto;display:block;margin:0 auto;"></p>',
      '  <p><span leaf="">一个简单任务可能不需要 Skill，复杂结构任务才值得引入专门能力。</span></p>',
      '  <h3 style="font-size:20px;color:#222;margin:16px 0;"><span leaf="">Gate 让改道变得可见</span></h3>',
      '  <p style="margin:0;line-height:1.8;color:#222;"><img src="imgs/03-cost-boundary.png" style="max-width:100%;height:auto;display:block;margin:0 auto;"></p>',
      '  <p><span leaf="">如果产物没有满足合同，就诊断缺口、修正输入或换路线，而不是把失败当成功。</span></p>',
      '  <h3 style="font-size:20px;color:#222;margin:16px 0;"><span leaf="">成本边界不能自适应突破</span></h3>',
      '  <p><span leaf="">内容方法可以变化，图片 raster 仍然必须收束到项目固定的 Codex CLI 路径。</span></p>',
      '  <p style="margin:0;line-height:1.8;color:#222;">',
      "    <span leaf=\"\">Smoke test 正文</span>",
      "  </p>",
      '  <p><span leaf="">你会把哪一个开放阶段首先改造成这种“先定义缺口、再选择能力”的闭环？</span></p>',
      '  <p><span leaf="">官方资料</span></p>',
      '  <p><span leaf="">https://example.com/agentic-orchestration</span></p>',
      '  <p style="margin:0;line-height:1.8;color:#222;"><span leaf="">我是 NTLx，热衷于分享 AI 观察与干货。</span></p>',
      "</section>",
      "",
    ].join("\n"));
    expectSuccess(runScript("step5-build.mjs", slug, fx.postsRoot, ["--finalize-only"]));

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

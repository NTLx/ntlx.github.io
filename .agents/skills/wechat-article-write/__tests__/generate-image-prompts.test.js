#!/usr/bin/env bun
/**
 * generate-image-prompts.mjs regression tests.
 *
 * Covers the baoyu-infographic layout/style head infographic prompt.
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

## 参考资料

> 来源
> https://example.com/source
`);
  return dir;
}

function runGenerator(slug, postsRoot, args = [], repoRoot = REPO_ROOT) {
  return spawnSync("bun", ["run", SCRIPT, slug, ...args], {
    cwd: REPO_ROOT,
    env: { ...process.env, PIPELINE_REPO_ROOT: repoRoot, PIPELINE_POSTS_ROOT: postsRoot },
    encoding: "utf8",
  });
}

function writeImagePlan(postDir, content) {
  writeFileSync(join(postDir, "image-plan.json"), JSON.stringify(content, null, 2));
}

function completeImagePlan(overrides = {}) {
  return {
    article_type: "deep-analysis",
    cover: {
      intent: "表达工具变化背后的判断权迁移",
      type: "conceptual",
      style: "technical editorial",
      palette: "cool",
      rendering: "flat-vector",
    },
    infographic: {
      intent: "压缩全文的判断权、组织摩擦和行动路径",
      layout: "bento-grid",
      style: "technical-schematic",
    },
    illustrations: [
      { slot: 1, intent: "比较工具接管与判断权迁移", type: "comparison", style: "minimal", description: "agent-workflow" },
      { slot: 2, intent: "解释判断权重新分配的结构", type: "framework", style: "editorial", description: "decision-rights" },
      { slot: 3, intent: "呈现组织摩擦如何形成闭环", type: "flowchart", style: "warm", description: "review-loop" },
    ],
    ...overrides,
  };
}

function futureProducerImagePlan() {
  return completeImagePlan({
    cover: {
      intent: "测试未知视觉 producer 的封面方案",
      type: "future-cover-type",
      style: "future-cover-style",
      prompt_source: "external",
      producer: "future-visual-skill",
    },
    infographic: {
      intent: "测试未知视觉 producer 的全文摘要方案",
      layout: "future-layout",
      style: "future-infographic-style",
      prompt_source: "external",
      producer: "future-visual-skill",
    },
    illustrations: [
      { slot: 1, intent: "测试未知正文视觉能力", type: "future-type", style: "future-style", prompt_source: "external", producer: "future-visual-skill", description: "agent-workflow" },
      { slot: 2, intent: "测试第二个未知正文视觉能力", type: "future-type", style: "future-style", prompt_source: "external", producer: "future-visual-skill", description: "decision-rights" },
      { slot: 3, intent: "测试第三个未知正文视觉能力", type: "future-type", style: "future-style", prompt_source: "external", producer: "future-visual-skill", description: "review-loop" },
    ],
  });
}

function writeExternalPrompts(postDir, skip = null) {
  const names = [
    "00-cover-prompt-style-test.md",
    "00-infographic-core-summary.md",
    "01-agent-workflow.md",
    "02-decision-rights.md",
    "03-review-loop.md",
  ];
  const promptsDir = join(postDir, "imgs/prompts");
  mkdirSync(promptsDir, { recursive: true });
  for (const name of names) {
    if (name === skip) continue;
    writeFileSync(join(promptsDir, name), `external prompt: ${name}\n`);
  }
  return names;
}

describe("generate-image-prompts head infographic prompt", () => {
  let cleanup = [];

  afterEach(() => {
    for (const dir of cleanup) {
      try { rmSync(dir, { recursive: true, force: true }); } catch {}
    }
    cleanup = [];
  });

  test("uses baoyu-infographic layout and style template sections", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-06-15-prompt-style";
    const dir = writeDraft(fx.postsRoot, slug);
    writeImagePlan(dir, completeImagePlan());

    const r = runGenerator(slug, fx.postsRoot);
    expect(r.status).toBe(0);

    const promptPath = join(dir, "imgs/prompts/00-infographic-core-summary.md");
    expect(existsSync(promptPath)).toBe(true);
    const prompt = readFileSync(promptPath, "utf8");
    expect(prompt).toContain("Template source: baoyu-infographic (layout=");
    expect(prompt).toContain("Use case: infographic-diagram");
    expect(prompt).toContain("Text (verbatim):");
    expect(prompt).toContain("Constraints:");
    expect(prompt).toContain("## Layout specification (from baoyu-infographic/references/layouts/)");
    expect(prompt).toContain("## Style specification (from baoyu-infographic/references/styles/)");
  });

  test("frames the head infographic as a whole-article compression rather than a local illustration", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-06-15-whole-article-infographic";
    const dir = writeDraft(fx.postsRoot, slug);
    writeImagePlan(dir, completeImagePlan());

    const r = runGenerator(slug, fx.postsRoot);
    expect(r.status).toBe(0);

    const prompt = readFileSync(join(dir, "imgs/prompts/00-infographic-core-summary.md"), "utf8");
    expect(prompt).toContain("Whole-article compression contract");
    expect(prompt).toContain("not a local body illustration");
    expect(prompt).toContain("central thesis");
    expect(prompt).toContain("argument path");
    expect(prompt).toContain("final takeaway or action cue");
    expect(prompt).toContain("A time-poor reader who only sees this image");
    expect(prompt).toContain("Do not merely visualize one nearby section");
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

  test("uses the explicit head infographic style instead of direction defaults", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-06-15-tech-infographic-style";
    const dir = writeDraft(fx.postsRoot, slug);
    writeImagePlan(dir, completeImagePlan({
      direction: "tech",
      infographic: {
        intent: "把判断权变化压缩成技术编辑式结构",
        layout: "structural-breakdown",
        style: "technical-schematic",
      },
    }));

    const r = runGenerator(slug, fx.postsRoot);
    expect(r.status).toBe(0);

    const prompt = readFileSync(join(dir, "imgs/prompts/00-infographic-core-summary.md"), "utf8");
    expect(prompt).toContain("style=technical-schematic");
    expect(prompt).toContain("把判断权变化压缩成技术编辑式结构");
  });

  test("uses explicit illustration type, style, and intent without heuristic overrides", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-06-15-explicit-illustration-plan";
    const dir = writeDraft(fx.postsRoot, slug);
    writeImagePlan(dir, completeImagePlan());

    const r = runGenerator(slug, fx.postsRoot);
    expect(r.status).toBe(0);

    const prompt = readFileSync(join(dir, "imgs/prompts/01-agent-workflow.md"), "utf8");
    expect(prompt).toContain("type: comparison");
    expect(prompt).toContain("style: minimal");
    expect(prompt).toContain("Purpose: 比较工具接管与判断权迁移");
  });

  test("fails in normal mode when the visual plan omits required decisions", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-06-15-incomplete-visual-plan";
    const dir = writeDraft(fx.postsRoot, slug);
    writeImagePlan(dir, { article_type: "deep-analysis" });

    const r = runGenerator(slug, fx.postsRoot);
    expect(r.status).not.toBe(0);
    expect(r.stderr).toContain("image-plan.cover is required");
  });

  test("allows legacy defaults only with the explicit compatibility flag", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-06-15-legacy-default-plan";
    const dir = writeDraft(fx.postsRoot, slug);
    writeImagePlan(dir, { article_type: "deep-analysis" });

    const r = runGenerator(slug, fx.postsRoot, ["--allow-default-image-plan"]);
    expect(r.status).toBe(0);
    expect(readFileSync(join(dir, "imgs/prompts/00-infographic-core-summary.md"), "utf8")).toContain("style=claymation");
  });

  test("fails on unknown infographic layout or style", () => {
    for (const [field, value] of [["layout", "made-up-layout"], ["style", "made-up-style"]]) {
      const fx = makeFixture();
      cleanup.push(fx.root);
      const slug = `2026-06-15-invalid-${field}`;
      const dir = writeDraft(fx.postsRoot, slug);
      writeImagePlan(dir, completeImagePlan({
        infographic: {
          intent: "测试非法视觉协议值",
          layout: field === "layout" ? value : "bento-grid",
          style: field === "style" ? value : "technical-schematic",
        },
      }));

      const r = runGenerator(slug, fx.postsRoot);
      expect(r.status).not.toBe(0);
      expect(r.stderr).toContain(`unknown infographic ${field}`);
    }
  });

  test("accepts an unknown external producer without a workflow route or adapter enum", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-06-15-future-visual-producer";
    const dir = writeDraft(fx.postsRoot, slug);
    writeImagePlan(dir, futureProducerImagePlan());
    writeExternalPrompts(dir);

    const before = readFileSync(join(dir, "imgs/prompts/02-decision-rights.md"), "utf8");
    const r = runGenerator(slug, fx.postsRoot);

    expect(r.status).toBe(0);
    expect(r.stderr).not.toContain("unknown skill");
    expect(r.stderr).not.toContain("unknown illustration type");
    expect(r.stderr).not.toContain("unknown infographic style");
    expect(readFileSync(join(dir, "imgs/prompts/02-decision-rights.md"), "utf8")).toBe(before);
  });

  test("external prompts do not load optional adapter templates", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-06-15-external-without-adapters";
    const dir = writeDraft(fx.postsRoot, slug);
    writeImagePlan(dir, futureProducerImagePlan());
    writeExternalPrompts(dir);

    const isolatedRepo = join(fx.root, "repo-without-visual-adapters");
    mkdirSync(join(isolatedRepo, ".agents/skills/wechat-article-write/references"), { recursive: true });
    writeFileSync(
      join(isolatedRepo, ".agents/skills/wechat-article-write/references/image-template-map.json"),
      readFileSync(resolve(REPO_ROOT, ".agents/skills/wechat-article-write/references/image-template-map.json")),
    );

    const r = runGenerator(slug, fx.postsRoot, [], isolatedRepo);

    expect(r.status).toBe(0);
    expect(r.stderr).not.toContain("skill not found");
  });

  test("fails with producer, expected path, and recovery action when an external prompt is missing", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-06-15-missing-external-prompt";
    const dir = writeDraft(fx.postsRoot, slug);
    writeImagePlan(dir, futureProducerImagePlan());
    writeExternalPrompts(dir, "02-decision-rights.md");

    const r = runGenerator(slug, fx.postsRoot);

    expect(r.status).not.toBe(0);
    expect(r.stderr).toContain("producer=future-visual-skill");
    expect(r.stderr).toContain(join(dir, "imgs/prompts/02-decision-rights.md"));
    expect(r.stderr).toContain("Run/delegate the selected producer first");
  });

  test("--overwrite never replaces external prompts", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-06-15-preserve-external-prompt";
    const dir = writeDraft(fx.postsRoot, slug);
    writeImagePlan(dir, futureProducerImagePlan());
    writeExternalPrompts(dir);
    const promptPath = join(dir, "imgs/prompts/01-agent-workflow.md");
    const before = readFileSync(promptPath, "utf8");

    const r = runGenerator(slug, fx.postsRoot, ["--overwrite"]);

    expect(r.status).toBe(0);
    expect(readFileSync(promptPath, "utf8")).toBe(before);
  });

  // §3.5 pinned compatibility: generate-image-prompts 把 baoyu-infographic
  // 的内部目录（references/layouts、references/styles）当模板源。
  // 升级 baoyu-* 前先跑本测试：任一 layout/style 消失或结构损坏都会亮红。
  test("infographic compatibility: every referenced layout/style exists in baoyu-infographic", () => {
    const mapPath = resolve(REPO_ROOT, ".agents/skills/wechat-article-write/references/image-template-map.json");
    const templateMap = JSON.parse(readFileSync(mapPath, "utf8"));

    const layoutsDir = resolve(REPO_ROOT, ".agents/skills/baoyu-infographic/references/layouts");
    const stylesDir = resolve(REPO_ROOT, ".agents/skills/baoyu-infographic/references/styles");

    for (const layout of templateMap.infographic_layouts) {
      const p = resolve(layoutsDir, `${layout}.md`);
      expect(existsSync(p), `layout ${layout}.md missing in baoyu-infographic`).toBe(true);
      const content = readFileSync(p, "utf8").trim();
      expect(content.length, `layout ${layout}.md is empty`).toBeGreaterThan(0);
    }
    for (const style of templateMap.infographic_styles) {
      const p = resolve(stylesDir, `${style}.md`);
      expect(existsSync(p), `style ${style}.md missing in baoyu-infographic`).toBe(true);
      const content = readFileSync(p, "utf8").trim();
      expect(content.length, `style ${style}.md is empty`).toBeGreaterThan(0);
    }
  });
});

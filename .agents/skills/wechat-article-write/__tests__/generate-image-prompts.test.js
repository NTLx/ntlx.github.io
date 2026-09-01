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

function writeIsolatedAdapterSkills(root) {
  const source = (rel) => readFileSync(resolve(REPO_ROOT, rel), "utf8");
  const write = (rel, content) => {
    const path = join(root, rel);
    mkdirSync(resolve(path, ".."), { recursive: true });
    writeFileSync(path, content);
  };

  write(
    ".agents/skills/baoyu-cover-image/references/workflow/prompt-template.md",
    source(".agents/skills/baoyu-cover-image/references/workflow/prompt-template.md"),
  );
  write(
    ".agents/skills/baoyu-infographic/references/layouts/future-layout.md",
    "# Future layout\nUse three clearly separated zones with a central conclusion.\n",
  );
  write(
    ".agents/skills/baoyu-infographic/references/styles/future-style.md",
    "# Future infographic style\nUse a bright editorial palette and clear hierarchy.\n",
  );
  write(
    ".agents/skills/baoyu-article-illustrator/references/prompt-construction.md",
    source(".agents/skills/baoyu-article-illustrator/references/prompt-construction.md"),
  );
  write(
    ".agents/skills/baoyu-article-illustrator/references/styles/vector-illustration.md",
    source(".agents/skills/baoyu-article-illustrator/references/styles/vector-illustration.md"),
  );
  write(
    ".agents/skills/baoyu-article-illustrator/references/styles/future-style.md",
    "# Future illustration style\nUse a restrained editorial visual language.\n",
  );
}

function completeImagePlan(overrides = {}) {
  return {
    article_type: "future-architecture-analysis",
    direction: "future-style-language",
    article_visual_design: {
      skill: "baoyu-article-illustrator",
      strategy: "只在视觉能降低理解成本的位置创建正文 SLOT",
    },
    cover: {
      intent: "表达工具变化背后的判断权迁移",
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
      intent: "压缩全文的判断权、组织摩擦和行动路径",
      baoyu_design: {
        skill: "baoyu-infographic",
        layout: "bento-grid",
        style: "technical-schematic",
      },
      contributors: [],
      prompt_source: "adapter",
    },
    illustrations: [
      { slot: 1, intent: "比较工具接管与判断权迁移", baoyu_design: { skill: "baoyu-article-illustrator", type: "comparison", style: "minimal" }, contributors: [], description: "agent-workflow", prompt_source: "adapter" },
      { slot: 2, intent: "解释判断权重新分配的结构", baoyu_design: { skill: "baoyu-article-illustrator", type: "framework", style: "editorial" }, contributors: [], description: "decision-rights", prompt_source: "adapter" },
      { slot: 3, intent: "呈现组织摩擦如何形成闭环", baoyu_design: { skill: "baoyu-article-illustrator", type: "flowchart", style: "warm" }, contributors: [], description: "review-loop", prompt_source: "adapter" },
    ],
    ...overrides,
  };
}

function futureProducerImagePlan() {
  return completeImagePlan({
    cover: {
      intent: "测试未知视觉 producer 的封面方案",
      baoyu_design: { skill: "baoyu-cover-image", type: "future-cover-type", style: "future-cover-style" },
      contributors: ["future-specialized-skill"],
      prompt_source: "external",
      producer: "baoyu-cover-image",
    },
    infographic: {
      intent: "测试未知视觉 producer 的全文摘要方案",
      baoyu_design: { skill: "baoyu-infographic", layout: "future-layout", style: "future-infographic-style" },
      contributors: ["future-specialized-skill"],
      prompt_source: "external",
      producer: "baoyu-infographic",
    },
    illustrations: [
      { slot: 1, intent: "测试未知正文视觉能力", baoyu_design: { skill: "baoyu-article-illustrator", type: "future-type", style: "future-style" }, contributors: ["baoyu-diagram"], prompt_source: "external", producer: "baoyu-article-illustrator", description: "agent-workflow" },
      { slot: 2, intent: "测试第二个未知正文视觉能力", baoyu_design: { skill: "baoyu-article-illustrator", type: "future-type", style: "future-style" }, contributors: ["future-specialized-skill"], prompt_source: "external", producer: "baoyu-article-illustrator", description: "decision-rights" },
      { slot: 3, intent: "测试第三个未知正文视觉能力", baoyu_design: { skill: "baoyu-article-illustrator", type: "future-type", style: "future-style" }, contributors: [], prompt_source: "external", producer: "baoyu-article-illustrator", description: "review-loop" },
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

  test("accepts future article_type and direction as context metadata", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-06-15-invalid-plan";
    const dir = writeDraft(fx.postsRoot, slug);
    writeImagePlan(dir, completeImagePlan({
      article_type: "future-architecture-analysis",
      direction: "future-style-language",
    }));

    const r = runGenerator(slug, fx.postsRoot);
    expect(r.status).toBe(0);
    expect(r.stderr).not.toContain("unknown article_type");
    expect(r.stderr).not.toContain("unknown direction");
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
        baoyu_design: {
          skill: "baoyu-infographic",
          layout: "structural-breakdown",
          style: "technical-schematic",
        },
        contributors: [],
        prompt_source: "adapter",
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
          baoyu_design: {
            skill: "baoyu-infographic",
            layout: field === "layout" ? value : "bento-grid",
            style: field === "style" ? value : "technical-schematic",
          },
          contributors: [],
          prompt_source: "adapter",
        },
      }));

      const r = runGenerator(slug, fx.postsRoot);
      expect(r.status).not.toBe(0);
      expect(r.stderr).toContain(`baoyu-infographic ${field} not found`);
    }
  });

  test("accepts core external prompt authorities and unknown contributors", () => {
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

  test("fails with core producer, expected path, and recovery action when an external prompt is missing", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-06-15-missing-external-prompt";
    const dir = writeDraft(fx.postsRoot, slug);
    writeImagePlan(dir, futureProducerImagePlan());
    writeExternalPrompts(dir, "02-decision-rights.md");

    const r = runGenerator(slug, fx.postsRoot);

    expect(r.status).not.toBe(0);
    expect(r.stderr).toContain("producer=baoyu-article-illustrator");
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

  test("uses the selected Baoyu templates directly instead of a local enum", () => {
    const layout = resolve(REPO_ROOT, ".agents/skills/baoyu-infographic/references/layouts/circular-flow.md");
    const style = resolve(REPO_ROOT, ".agents/skills/baoyu-infographic/references/styles/technical-schematic.md");
    expect(existsSync(layout)).toBe(true);
    expect(readFileSync(layout, "utf8").trim().length).toBeGreaterThan(0);
    expect(existsSync(style)).toBe(true);
    expect(readFileSync(style, "utf8").trim().length).toBeGreaterThan(0);
  });

  test("accepts a newly installed stable Baoyu template without changing this skill", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-06-15-future-template";
    const dir = writeDraft(fx.postsRoot, slug);
    const isolatedRepo = join(fx.root, "repo-with-future-template");
    writeIsolatedAdapterSkills(isolatedRepo);
    writeImagePlan(dir, completeImagePlan({
      infographic: {
        intent: "使用新模板压缩全文",
        baoyu_design: { skill: "baoyu-infographic", layout: "future-layout", style: "future-style" },
        contributors: [],
        prompt_source: "adapter",
      },
      illustrations: [
        { slot: 1, intent: "使用新模板解释流程", baoyu_design: { skill: "baoyu-article-illustrator", type: "flowchart", style: "future-style" }, contributors: [], description: "agent-workflow", prompt_source: "adapter" },
        { slot: 2, intent: "使用新模板解释结构", baoyu_design: { skill: "baoyu-article-illustrator", type: "framework", style: "future-style" }, contributors: [], description: "decision-rights", prompt_source: "adapter" },
        { slot: 3, intent: "使用新模板解释闭环", baoyu_design: { skill: "baoyu-article-illustrator", type: "flowchart", style: "future-style" }, contributors: [], description: "review-loop", prompt_source: "adapter" },
      ],
    }));

    const r = runGenerator(slug, fx.postsRoot, [], isolatedRepo);
    expect(r.status).toBe(0);
    expect(readFileSync(join(dir, "imgs/prompts/00-infographic-core-summary.md"), "utf8"))
      .toContain("Style specification");
    expect(readFileSync(join(dir, "imgs/prompts/01-agent-workflow.md"), "utf8"))
      .toContain("Future illustration style");
  });
});

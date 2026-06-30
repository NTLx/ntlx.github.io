#!/usr/bin/env bun
/**
 * step4-images.mjs 回归测试
 *
 * 覆盖正文插图数量门控和灵活位置规划。
 */

import { describe, test, expect, afterEach } from "bun:test";
import { mkdirSync, rmSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const SCRIPT = resolve(import.meta.dir, "../scripts/step4-images.mjs");
const REPO_ROOT = resolve(import.meta.dir, "../../../..");
const PNG_BYTES = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function makeFixture() {
  const root = join(tmpdir(), `step4-images-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const postsRoot = join(root, "posts");
  return { root, postsRoot };
}

function writePost(postsRoot, slug, body, imageNames) {
  const dir = join(postsRoot, slug);
  const imgsDir = join(dir, "imgs");
  mkdirSync(imgsDir, { recursive: true });

  const fm = {
    title: "Step 4 测试文章",
    date: "2026-05-18",
    summary: "用于测试 Step 4 图片门控。",
    category: "ai-coding",
    blogSlug: "step-four-test",
    coverImage: "cover.png",
    sourceUrl: "https://ntlx.github.io/articles/step-four-test",
  };
  const frontmatter = Object.entries(fm).map(([k, v]) => `${k}: ${v}`).join("\n");
  writeFileSync(join(dir, "draft.md"), `---\n${frontmatter}\n---\n\n${body}`);
  writeFileSync(join(dir, "cover.png"), PNG_BYTES);
  for (const name of imageNames) {
    writeFileSync(join(imgsDir, name), PNG_BYTES);
  }
  return dir;
}

function runStep4(slug, postsRoot) {
  return spawnSync("bun", ["run", SCRIPT, slug], {
    cwd: REPO_ROOT,
    env: { ...process.env, PIPELINE_POSTS_ROOT: postsRoot },
    encoding: "utf8",
  });
}

describe("step4-images body illustration policy", () => {
  let cleanup = [];

  afterEach(() => {
    for (const dir of cleanup) {
      try { rmSync(dir, { recursive: true, force: true }); } catch {}
    }
    cleanup = [];
  });

  test("allows 3 body illustrations placed where the content needs them", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-flexible-image-placement";
    const dir = writePost(fx.postsRoot, slug, `
<!-- SLOT_IMG_00_INFOGRAPHIC -->

## 第一节

先解释问题，再放图。

<!-- SLOT_IMG_01_CORE_TENSION -->

这一节继续展开。

## 第二节

这一节不需要插图。

## 第三节

先给读者一点上下文。

<!-- SLOT_IMG_02_STAKEHOLDER_MAP -->

继续解释关系。

## 第四节

<!-- SLOT_IMG_03_DECISION_FLOW -->

最后用流程图收束。

## 原文参考

> 来源
> https://example.com/source
`, [
      "00-infographic-core-summary.png",
      "01-core-tension.png",
      "02-stakeholder-map.png",
      "03-decision-flow.png",
    ]);

    const r = runStep4(slug, fx.postsRoot);
    expect(r.status).toBe(0);

    const state = JSON.parse(readFileSync(join(dir, ".pipeline-state.json"), "utf8"));
    expect(state.last_complete_step).toBe(4);
  });

  test("fails when body illustrations are fewer than 3", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-too-few-body-images";
    const dir = writePost(fx.postsRoot, slug, `
<!-- SLOT_IMG_00_INFOGRAPHIC -->

## 正文

<!-- SLOT_IMG_01_CORE_TENSION -->

一些正文内容。

## 原文参考

> 来源
> https://example.com/source
`, [
      "00-infographic-core-summary.png",
      "01-core-tension.png",
    ]);

    const r = runStep4(slug, fx.postsRoot);
    expect(r.status).toBe(4);
    expect(r.stderr).toContain("3 张文内插图");
    expect(existsSync(join(dir, ".pipeline-state.json"))).toBe(true);
  });

  test("moves mistakenly generated imgs/00-cover.png to post root cover.png", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-nested-zero-cover";
    const dir = writePost(fx.postsRoot, slug, `
<!-- SLOT_IMG_00_INFOGRAPHIC -->

## 正文

<!-- SLOT_IMG_01_CORE_TENSION -->

一些正文内容。

<!-- SLOT_IMG_02_STAKEHOLDER_MAP -->

继续解释关系。

<!-- SLOT_IMG_03_DECISION_FLOW -->

## 原文参考

> 来源
> https://example.com/source
`, [
      "00-cover.png",
      "00-infographic-core-summary.png",
      "01-core-tension.png",
      "02-stakeholder-map.png",
      "03-decision-flow.png",
    ]);
    rmSync(join(dir, "cover.png"), { force: true });

    const r = runStep4(slug, fx.postsRoot);

    expect(r.status).toBe(0);
    expect(r.stderr).toContain("moved imgs/00-cover.png");
    expect(existsSync(join(dir, "cover.png"))).toBe(true);
    expect(existsSync(join(dir, "imgs", "00-cover.png"))).toBe(false);
  });

  test("fails when batch.json exists because Step 4 must be serial", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-batch-json-present";
    const dir = writePost(fx.postsRoot, slug, `
<!-- SLOT_IMG_00_INFOGRAPHIC -->

## 正文

<!-- SLOT_IMG_01_CORE_TENSION -->
<!-- SLOT_IMG_02_STAKEHOLDER_MAP -->
<!-- SLOT_IMG_03_DECISION_FLOW -->

## 原文参考

> 来源
> https://example.com/source
`, [
      "00-infographic-core-summary.png",
      "01-core-tension.png",
      "02-stakeholder-map.png",
      "03-decision-flow.png",
    ]);
    writeFileSync(join(dir, "imgs", "batch.json"), JSON.stringify({ jobs: 3, tasks: [] }));

    const r = runStep4(slug, fx.postsRoot);

    expect(r.status).toBe(2);
    expect(r.stderr).toContain("batch.json");
    expect(r.stderr).toContain("串行");
  });

  test("fails when generated image does not match prompt basename", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-prompt-image-mismatch";
    const dir = writePost(fx.postsRoot, slug, `
<!-- SLOT_IMG_00_INFOGRAPHIC -->

## 正文

<!-- SLOT_IMG_01_CORE_TENSION -->
<!-- SLOT_IMG_02_STAKEHOLDER_MAP -->
<!-- SLOT_IMG_03_DECISION_FLOW -->

## 原文参考

> 来源
> https://example.com/source
`, [
      "00-infographic.png",
      "01-core-tension.png",
      "02-stakeholder-map.png",
      "03-decision-flow.png",
    ]);
    const promptsDir = join(dir, "imgs", "prompts");
    mkdirSync(promptsDir, { recursive: true });
    writeFileSync(join(promptsDir, "00-infographic-core-summary.md"), "infographic prompt\n");
    writeFileSync(join(promptsDir, "01-core-tension.md"), "prompt\n");
    writeFileSync(join(promptsDir, "02-stakeholder-map.md"), "prompt\n");
    writeFileSync(join(promptsDir, "03-decision-flow.md"), "prompt\n");

    const r = runStep4(slug, fx.postsRoot);

    expect(r.status).toBe(2);
    expect(r.stderr).toContain("00-infographic-core-summary");
  });
});

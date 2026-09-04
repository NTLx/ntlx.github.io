#!/usr/bin/env bun

import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { requiresBodyVisualCoverage } from "../scripts/validation-lib.mjs";

const STEP2 = resolve(import.meta.dir, "../scripts/step2-write.mjs");
const PROJECT_ROOT = resolve(import.meta.dir, "../../../..");

function fixture() {
  const root = join(tmpdir(), `visual-coverage-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  mkdirSync(root, { recursive: true });
  return root;
}

function draft({ substantiveSections, bodySlots = "" }) {
  const sections = substantiveSections.map((heading, index) => `## ${heading}\n\n第 ${index + 1} 节正文。`).join("\n\n");
  return `---
title: Visual coverage test
date: 2026-09-04
summary: 用于测试正文视觉覆盖。
category: ai-agents
blogSlug: visual-coverage-test
coverImage: cover.png
sourceUrl: https://ntlx.github.io/articles/visual-coverage-test
---

<!-- SLOT_IMG_00_INFOGRAPHIC -->

${bodySlots}
${sections}

**你会怎么做？**

欢迎留言分享你的判断？

## 参考资料

- https://example.com/reference
`;
}

function runStep2(root, content) {
  const slug = "2026-09-04-visual-coverage";
  const postDir = join(root, slug);
  mkdirSync(postDir, { recursive: true });
  writeFileSync(join(postDir, "draft.md"), content);
  return spawnSync("bun", ["run", STEP2, slug], {
    cwd: PROJECT_ROOT,
    env: { ...process.env, PIPELINE_POSTS_ROOT: root },
    encoding: "utf8",
  });
}

function pngWithDimensions(width, height) {
  const bytes = Buffer.alloc(24);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(bytes);
  bytes.writeUInt32BE(width, 16);
  bytes.writeUInt32BE(height, 20);
  return bytes;
}

function runStep4(root, content, bodyPlan = false) {
  const slug = "2026-09-04-step4-visual-coverage";
  const postDir = join(root, slug);
  mkdirSync(join(postDir, "imgs"), { recursive: true });
  writeFileSync(join(postDir, "draft.md"), content);
  writeFileSync(join(postDir, "cover.png"), pngWithDimensions(235, 100));
  writeFileSync(join(postDir, "imgs/00-infographic-core-summary.png"), pngWithDimensions(1, 1));
  const images = [{ slot: "SLOT_IMG_00", kind: "generated", file: "imgs/00-infographic-core-summary.png" }];
  if (bodyPlan) {
    writeFileSync(join(postDir, "imgs/01-source.png"), pngWithDimensions(1, 1));
    images.push({
      slot: "SLOT_IMG_01",
      kind: "source",
      file: "imgs/01-source.png",
      source: "https://example.com/source.png",
      reason: "原图直接承担正文机制表达",
    });
  }
  writeFileSync(join(postDir, "image-plan.json"), JSON.stringify({ cover: "cover.png", images }) + "\n");
  writeFileSync(join(postDir, ".pipeline-state.json"), JSON.stringify({
    slug,
    last_complete_step: 3,
    step3_draft_sha256: createHash("sha256").update(content).digest("hex"),
    publish: { blog: "pending", wechat: "pending" },
    failed_step: null,
  }) + "\n");
  return spawnSync("bun", ["run", resolve(import.meta.dir, "../scripts/step4-images.mjs"), slug], {
    cwd: PROJECT_ROOT,
    env: { ...process.env, PIPELINE_POSTS_ROOT: root },
    encoding: "utf8",
  });
}

describe("visual coverage contract", () => {
  test("uses the simple section-or-length threshold", () => {
    expect(requiresBodyVisualCoverage({ wordCount: 10, substantiveSectionCount: 3 })).toBe(true);
    expect(requiresBodyVisualCoverage({ wordCount: 1400, substantiveSectionCount: 1 })).toBe(true);
    expect(requiresBodyVisualCoverage({ wordCount: 1399, substantiveSectionCount: 2 })).toBe(false);
  });

  test("fails a normal long-form article that has only SLOT00", () => {
    const root = fixture();
    try {
      const result = runStep2(root, draft({ substantiveSections: ["一", "二", "三", "四", "五"] }));
      expect(result.status).toBe(4);
      expect(result.stderr).toContain("normal long-form article requires at least one body visual SLOT beyond SLOT00");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("passes a normal long-form article with one body visual SLOT", () => {
    const root = fixture();
    try {
      const result = runStep2(root, draft({
        substantiveSections: ["一", "二", "三", "四", "五"],
        bodySlots: "<!-- SLOT_IMG_01_TOKEN_VS_OUTCOME -->",
      }));
      expect(result.status, result.stderr || result.stdout).toBe(0);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("passes a short article with only SLOT00", () => {
    const root = fixture();
    try {
      const result = runStep2(root, draft({ substantiveSections: ["一", "二"] }));
      expect(result.status, result.stderr || result.stdout).toBe(0);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("keeps body visual SLOT numbering contiguous", () => {
    const root = fixture();
    try {
      const result = runStep2(root, draft({
        substantiveSections: ["一", "二"],
        bodySlots: "<!-- SLOT_IMG_02_OUT_OF_ORDER -->",
      }));
      expect(result.status).toBe(4);
      expect(result.stderr).toContain("正文 visual SLOT 必须从 SLOT_IMG_01 连续编号");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("Step 4 fails a normal long-form article with no body visual asset", () => {
    const root = fixture();
    try {
      const result = runStep4(root, draft({ substantiveSections: ["一", "二", "三", "四", "五"] }));
      expect(result.status).toBe(2);
      expect(result.stderr).toContain("normal long-form article requires at least one body visual SLOT beyond SLOT00");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("Step 4 accepts source image coverage without a generated body image", () => {
    const root = fixture();
    try {
      const result = runStep4(root, draft({
        substantiveSections: ["一", "二", "三", "四", "五"],
        bodySlots: "<!-- SLOT_IMG_01_SOURCE -->",
      }), true);
      expect(result.status, result.stderr || result.stdout).toBe(0);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

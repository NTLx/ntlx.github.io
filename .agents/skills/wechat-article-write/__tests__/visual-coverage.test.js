#!/usr/bin/env bun

import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { countWords, requiresBodyVisualCoverage, bodyVisualMinimum } from "../scripts/validation-lib.mjs";
import { stripNonSubstantiveTailSections } from "../scripts/markdown-structure-lib.mjs";

const STEP2 = resolve(import.meta.dir, "../scripts/step2-write.mjs");
const PROJECT_ROOT = resolve(import.meta.dir, "../../../..");

function fixture() {
  const root = join(tmpdir(), `visual-coverage-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  mkdirSync(root, { recursive: true });
  return root;
}

function draft({ substantiveSections, bodySlots = "", bodyImages = "", sectionBody, referenceContent = "- https://example.com/reference" }) {
  const sections = substantiveSections.map((heading, index) => {
    const content = sectionBody ? sectionBody(index) : `第 ${index + 1} 节正文。`;
    return `## ${heading}\n\n${content}`;
  }).join("\n\n");
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
${bodyImages}
${sections}

**你会怎么做？**

欢迎留言分享你的判断？

## 参考资料

${referenceContent}
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
    writeFileSync(join(postDir, "imgs/02-source.png"), pngWithDimensions(1, 1));
    images.push({
      slot: "SLOT_IMG_01",
      kind: "source",
      file: "imgs/01-source.png",
      source: "https://example.com/source.png",
      reason: "原图直接承担正文机制表达",
    });
    images.push({
      slot: "SLOT_IMG_02",
      kind: "source",
      file: "imgs/02-source.png",
      source: "https://example.com/source2.png",
      reason: "原图直接承担正文对比表达",
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

  test("normal long-form requires two body visual SLOTs, short articles require zero", () => {
    expect(bodyVisualMinimum({ wordCount: 10, substantiveSectionCount: 3 })).toBe(2);
    expect(bodyVisualMinimum({ wordCount: 1400, substantiveSectionCount: 1 })).toBe(2);
    expect(bodyVisualMinimum({ wordCount: 1399, substantiveSectionCount: 2 })).toBe(0);
  });

  test("fails a normal long-form article that has only one body visual SLOT", () => {
    const root = fixture();
    try {
      const result = runStep2(root, draft({
        substantiveSections: ["一", "二", "三", "四", "五"],
        bodySlots: "<!-- SLOT_IMG_01_TOKEN_VS_OUTCOME -->",
      }));
      expect(result.status).toBe(4);
      expect(result.stderr).toContain("requires at least 2 body visual SLOTs");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("strips trailing non-substantive sections before counting article words", () => {
    const body = [
      `## 一\n\n${"正文".repeat(275)}`,
      `## 二\n\n${"正文".repeat(275)}`,
      `## 参考资料\n\n${"参考".repeat(500)}`,
      `## 延伸阅读\n\n${"延伸".repeat(500)}`,
    ].join("\n\n");
    const substantiveBody = stripNonSubstantiveTailSections(body);
    expect(substantiveBody).not.toContain("## 参考资料");
    expect(substantiveBody).not.toContain("## 延伸阅读");
    expect(countWords(substantiveBody).total).toBeLessThan(1400);
    expect(requiresBodyVisualCoverage({ wordCount: countWords(substantiveBody).total, substantiveSectionCount: 2 })).toBe(false);
  });

  test("fails a normal long-form article that has only SLOT00", () => {
    const root = fixture();
    try {
      const result = runStep2(root, draft({ substantiveSections: ["一", "二", "三", "四", "五"] }));
      expect(result.status).toBe(4);
      expect(result.stderr).toContain("requires at least 2 body visual SLOTs");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("passes a normal long-form article with two body visual SLOTs", () => {
    const root = fixture();
    try {
      const result = runStep2(root, draft({
        substantiveSections: ["一", "二", "三", "四", "五"],
        bodySlots: "<!-- SLOT_IMG_01_TOKEN_VS_OUTCOME -->\n\n<!-- SLOT_IMG_02_RECOVERY_LOOP -->",
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

  test("does not let a long reference section turn a short article into long-form coverage", () => {
    const root = fixture();
    try {
      const result = runStep2(root, draft({
        substantiveSections: ["一", "二"],
        referenceContent: `- https://example.com/reference\n\n${"参考资料".repeat(500)}`,
      }));
      expect(result.status, result.stderr || result.stdout).toBe(0);
      const state = JSON.parse(readFileSync(join(root, "2026-09-04-visual-coverage", ".pipeline-state.json"), "utf8"));
      expect(state.word_count).toBeGreaterThan(1400);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("still requires coverage when substantive article content reaches 1400 words", () => {
    const root = fixture();
    try {
      const result = runStep2(root, draft({
        substantiveSections: ["一"],
        sectionBody: () => "正".repeat(1400),
      }));
      expect(result.status).toBe(4);
      expect(result.stderr).toContain("requires at least 2 body visual SLOTs");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("does not let an ordinary Markdown source image satisfy formal coverage", () => {
    const root = fixture();
    try {
      const result = runStep2(root, draft({
        substantiveSections: ["一", "二", "三"],
        bodyImages: "![架构截图](https://example.com/architecture.png)",
      }));
      expect(result.status).toBe(4);
      expect(result.stderr).toContain("requires at least 2 body visual SLOTs");
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
      expect(result.stderr).toContain("requires at least 2 body visual SLOTs");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("Step 4 accepts source image coverage without a generated body image", () => {
    const root = fixture();
    try {
      const result = runStep4(root, draft({
        substantiveSections: ["一", "二", "三", "四", "五"],
        bodySlots: "<!-- SLOT_IMG_01_SOURCE -->\n\n<!-- SLOT_IMG_02_SOURCE -->",
      }), true);
      expect(result.status, result.stderr || result.stdout).toBe(0);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("Step 4 ignores long trailing references for coverage length", () => {
    const root = fixture();
    try {
      const result = runStep4(root, draft({
        substantiveSections: ["一", "二"],
        referenceContent: `- https://example.com/reference\n\n${"参考资料".repeat(500)}`,
      }));
      expect(result.status, result.stderr || result.stdout).toBe(0);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

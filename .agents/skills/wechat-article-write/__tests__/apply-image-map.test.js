#!/usr/bin/env bun
/**
 * apply-image-map.mjs regression tests.
 *
 * Covers deterministic SLOT_IMG to image filename resolution.
 */

import { describe, test, expect, afterEach } from "bun:test";
import { mkdirSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const SCRIPT = resolve(import.meta.dir, "../scripts/apply-image-map.mjs");
const REPO_ROOT = resolve(import.meta.dir, "../../../..");
const PNG_BYTES = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function makeFixture() {
  const root = join(tmpdir(), `apply-image-map-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const postsRoot = join(root, "posts");
  return { root, postsRoot };
}

function writePost(postsRoot, slug) {
  const dir = join(postsRoot, slug);
  const imgsDir = join(dir, "imgs");
  mkdirSync(imgsDir, { recursive: true });
  writeFileSync(join(dir, "draft.md"), `---
title: Apply Image Map Test
date: 2026-05-18
summary: Test.
category: ai-coding
blogSlug: apply-image-map-test
coverImage: cover.png
sourceUrl: https://ntlx.github.io/articles/apply-image-map-test
---

<!-- SLOT_IMG_00_INFOGRAPHIC -->

## 正文

<!-- SLOT_IMG_01_DETAIL -->
`);
  writeFileSync(join(imgsDir, "00-cover.png"), PNG_BYTES);
  writeFileSync(join(imgsDir, "00-infographic-core-summary.png"), PNG_BYTES);
  writeFileSync(join(imgsDir, "01-detail.png"), PNG_BYTES);
  writeFileSync(join(dir, "image-map.json"), JSON.stringify({
    "00-cover.png": "https://cdn.example.com/00-cover.png",
    "00-infographic-core-summary.png": "https://cdn.example.com/00-infographic-core-summary.png",
    "01-detail.png": "https://cdn.example.com/01-detail.png",
  }, null, 2));
  return dir;
}

function runApply(slug, postsRoot) {
  return spawnSync("bun", ["run", SCRIPT, slug], {
    cwd: REPO_ROOT,
    env: { ...process.env, PIPELINE_POSTS_ROOT: postsRoot },
    encoding: "utf8",
  });
}

describe("apply-image-map slot resolution", () => {
  let cleanup = [];

  afterEach(() => {
    for (const dir of cleanup) {
      try { rmSync(dir, { recursive: true, force: true }); } catch {}
    }
    cleanup = [];
  });

  test("SLOT_IMG_00_INFOGRAPHIC resolves to infographic, not cover", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-slot-zero-resolution";
    const dir = writePost(fx.postsRoot, slug);

    const r = runApply(slug, fx.postsRoot);

    expect(r.status).toBe(0);
    const article = readFileSync(join(dir, "article.md"), "utf8");
    expect(article).toContain("https://cdn.example.com/00-infographic-core-summary.png");
    expect(article).not.toContain("https://cdn.example.com/00-cover.png");
  });
});

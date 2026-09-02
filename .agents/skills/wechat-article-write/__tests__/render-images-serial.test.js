#!/usr/bin/env bun

import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { assertCoverPixelAspect, renderImagesSerial } from "../scripts/render-images-serial.mjs";
import { finalizeCanonicalPrompt } from "../scripts/visual-plan-lib.mjs";
import { getVisualStyleProfile } from "../scripts/config-lib.mjs";

const PNG_BYTES = Buffer.alloc(24);
Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(PNG_BYTES);
PNG_BYTES.writeUInt32BE(235, 16);
PNG_BYTES.writeUInt32BE(100, 20);

function makeFixture() {
  const root = join(tmpdir(), `serial-renderer-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const postsRoot = join(root, "posts");
  const slug = "2026-09-01-serial-renderer";
  const postDir = join(postsRoot, slug);
  mkdirSync(join(postDir, "imgs", "prompts"), { recursive: true });

  writeFileSync(join(postDir, "draft.md"), `---
title: 串行渲染测试
date: 2026-09-01
summary: 测试图片执行器的串行协议。
category: ai-coding
blogSlug: serial-renderer
coverImage: cover.png
sourceUrl: https://ntlx.github.io/articles/serial-renderer
---

<!-- SLOT_IMG_00_INFOGRAPHIC -->

## 正文

<!-- SLOT_IMG_01_STATE_FLOW -->

<!-- SLOT_IMG_02_CONTROL_LOOP -->
`);

  writeFileSync(join(postDir, "image-plan.json"), JSON.stringify({
    visual_profile: "bright-vivid-warm",
    source_image_policy: "prefer-reuse",
    article_visual_design: { planner: "wechat-article-write-agent", coverage_review: [
      { section_index: 1, heading: "正文", decision: "illustrate", slot: 1, reason: "状态关系需要结构图" },
    ] },
    cover: {
      intent: "表达串行图片执行",
      producer: "baoyu-cover-image",
      baoyu_design: { skill: "baoyu-cover-image", type: "conceptual", palette: "cool", rendering: "flat-vector", aspect: "2.35:1", text: "none" },
      contributors: [],
      prompt_source: "external",
    },
    infographic: {
      intent: "压缩串行执行闭环",
      producer: "baoyu-xhs-images",
      baoyu_design: { skill: "baoyu-xhs-images", layout: "circular-flow", style: "technical-schematic", card_count: 1 },
      contributors: [],
      text_density: "low",
      has_long_copy: false,
      prompt_source: "external",
    },
    illustrations: [
      { slot: 1, producer: "baoyu-infographic", intent: "展示状态流", baoyu_design: { skill: "baoyu-infographic", type: "flowchart", style: "minimal", palette: "cool" }, contributors: [], description: "state-flow", prompt_source: "external", text_density: "low", has_long_copy: false },
      { slot: 2, producer: "baoyu-infographic", intent: "展示控制闭环", baoyu_design: { skill: "baoyu-infographic", type: "framework", style: "minimal", palette: "cool" }, contributors: [], description: "control-loop", prompt_source: "external", text_density: "low", has_long_copy: false },
    ],
    source_image_review: [],
  }, null, 2) + "\n");

  for (const name of [
    "00-cover-serial-renderer.md",
    "00-infographic-core-summary.md",
    "01-state-flow.md",
    "02-control-loop.md",
  ]) {
    const role = name.startsWith("00-cover") ? "cover" : name.startsWith("00-") ? "header-infographic" : "body-illustration";
    const textDensity = role === "cover" ? "none" : "low";
    const aspect = role === "cover" ? "2.35:1" : undefined;
    writeFileSync(join(postDir, "imgs", "prompts", name), finalizeCanonicalPrompt(`Prompt for ${name}`, {
      profile: getVisualStyleProfile(),
      role,
      textDensity,
      aspect,
    }));
  }

  return { root, postsRoot, slug, postDir };
}

function fakeRenderer({ failBasename = null } = {}) {
  const calls = [];
  let active = 0;
  let maxActive = 0;
  const runCommand = (command, args, options) => {
    active += 1;
    maxActive = Math.max(maxActive, active);
    calls.push({ command, args: [...args], options });
    const output = args[args.indexOf("--image") + 1];
    const failed = failBasename && output.endsWith(failBasename);
    if (!failed) {
      mkdirSync(resolve(output, ".."), { recursive: true });
      writeFileSync(output, PNG_BYTES);
    }
    active -= 1;
    return { status: failed ? 1 : 0, stdout: "", stderr: failed ? "mock failure" : "" };
  };
  return { calls, runCommand, get maxActive() { return maxActive; } };
}

describe("serial image renderer", () => {
  const cleanup = [];

  afterEach(() => {
    for (const root of cleanup.splice(0)) rmSync(root, { recursive: true, force: true });
  });

  test("renders cover, SLOT00, and body slots in order with one active process", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const mock = fakeRenderer();

    const result = renderImagesSerial({
      slug: fx.slug,
      repositoryRoot: fx.root,
      postsRoot: fx.postsRoot,
      backendCheck: () => ({ ok: true }),
      runCommand: mock.runCommand,
    });

    expect(result.rendered.map((asset) => asset.key)).toEqual(["cover", "SLOT_IMG_00", "SLOT_IMG_01", "SLOT_IMG_02"]);
    expect(mock.calls.map((call) => call.args[call.args.indexOf("--image") + 1])).toEqual([
      join(fx.postDir, "cover.png"),
      join(fx.postDir, "imgs", "00-infographic-core-summary.png"),
      join(fx.postDir, "imgs", "01-state-flow.png"),
      join(fx.postDir, "imgs", "02-control-loop.png"),
    ]);
    expect(mock.maxActive).toBe(1);
    expect(mock.calls[0].args).toContain("--ar");
    expect(mock.calls[0].args[mock.calls[0].args.indexOf("--ar") + 1]).toBe("2.35:1");
    for (const call of mock.calls) {
      expect(call.args).toContain("--provider");
      expect(call.args[call.args.indexOf("--provider") + 1]).toBe("codex-cli");
      expect(call.args).not.toContain("--batchfile");
      expect(call.args).not.toContain("--jobs");
    }
  });

  test("stops before the next asset when one image fails", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const mock = fakeRenderer({ failBasename: "01-state-flow.png" });

    expect(() => renderImagesSerial({
      slug: fx.slug,
      repositoryRoot: fx.root,
      postsRoot: fx.postsRoot,
      backendCheck: () => ({ ok: true }),
      runCommand: mock.runCommand,
    })).toThrow(/SLOT_IMG_01|01-state-flow/);

    expect(mock.calls.map((call) => call.args[call.args.indexOf("--image") + 1])).toEqual([
      join(fx.postDir, "cover.png"),
      join(fx.postDir, "imgs", "00-infographic-core-summary.png"),
      join(fx.postDir, "imgs", "01-state-flow.png"),
    ]);
    expect(mock.calls.some((call) => call.args.includes("02-control-loop.png"))).toBe(false);
  });

  test("preflights every active prompt before starting generation", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    unlinkSync(join(fx.postDir, "imgs", "prompts", "02-control-loop.md"));
    const mock = fakeRenderer();

    expect(() => renderImagesSerial({
      slug: fx.slug,
      repositoryRoot: fx.root,
      postsRoot: fx.postsRoot,
      backendCheck: () => ({ ok: true }),
      runCommand: mock.runCommand,
    })).toThrow(/02-control-loop\.md/);
    expect(mock.calls).toHaveLength(0);
  });

  test("checks runtime backend before the first image and supports resumable skips", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    writeFileSync(join(fx.postDir, "cover.png"), PNG_BYTES);
    writeFileSync(join(fx.postDir, "imgs", "00-infographic-core-summary.png"), PNG_BYTES);
    const mock = fakeRenderer();
    const events = [];

    const result = renderImagesSerial({
      slug: fx.slug,
      repositoryRoot: fx.root,
      postsRoot: fx.postsRoot,
      backendCheck: () => {
        events.push("runtime-check");
        return { ok: true };
      },
      runCommand: (...args) => {
        events.push("render");
        return mock.runCommand(...args);
      },
    });

    expect(events[0]).toBe("runtime-check");
    expect(result.skipped.map((asset) => asset.key)).toEqual(["cover", "SLOT_IMG_00"]);
    expect(result.rendered.map((asset) => asset.key)).toEqual(["SLOT_IMG_01", "SLOT_IMG_02"]);
  });

  test("force rerenders valid existing outputs", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    writeFileSync(join(fx.postDir, "cover.png"), PNG_BYTES);
    writeFileSync(join(fx.postDir, "imgs", "00-infographic-core-summary.png"), PNG_BYTES);
    const mock = fakeRenderer();

    const result = renderImagesSerial({
      slug: fx.slug,
      repositoryRoot: fx.root,
      postsRoot: fx.postsRoot,
      force: true,
      backendCheck: () => ({ ok: true }),
      runCommand: mock.runCommand,
    });

    expect(result.skipped).toHaveLength(0);
    expect(mock.calls).toHaveLength(4);
  });

  test("dry-run lists the fixed serial plan without runtime generation", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    let backendChecks = 0;
    let commands = 0;

    const result = renderImagesSerial({
      slug: fx.slug,
      repositoryRoot: fx.root,
      postsRoot: fx.postsRoot,
      dryRun: true,
      backendCheck: () => { backendChecks += 1; return { ok: true }; },
      runCommand: () => { commands += 1; return { status: 0 }; },
    });

    expect(result.dryRun).toBe(true);
    expect(result.assets.map((asset) => asset.key)).toEqual(["cover", "SLOT_IMG_00", "SLOT_IMG_01", "SLOT_IMG_02"]);
    expect(backendChecks).toBe(0);
    expect(commands).toBe(0);
    expect(existsSync(join(fx.postDir, "cover.png"))).toBe(false);
  });

  test("rejects a final cover whose pixel ratio is not 2.35:1", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const square = Buffer.alloc(24);
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(square);
    square.writeUInt32BE(100, 16);
    square.writeUInt32BE(100, 20);
    writeFileSync(join(fx.postDir, "cover.png"), square);
    expect(() => assertCoverPixelAspect(join(fx.postDir, "cover.png"))).toThrow("2.35:1");
  });
});

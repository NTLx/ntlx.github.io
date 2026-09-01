#!/usr/bin/env bun

import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { renderImagesSerial } from "../scripts/render-images-serial.mjs";

const PNG_BYTES = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

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
    article_visual_design: { skill: "baoyu-article-illustrator", strategy: "只为降低理解成本创建图片" },
    cover: {
      intent: "表达串行图片执行",
      baoyu_design: { skill: "baoyu-cover-image", type: "conceptual", palette: "cool", rendering: "flat-vector", aspect: "16:9" },
      contributors: [],
      prompt_source: "adapter",
    },
    infographic: {
      intent: "压缩串行执行闭环",
      baoyu_design: { skill: "baoyu-infographic", layout: "circular-flow", style: "technical-schematic", aspect: "16:9" },
      contributors: [],
      prompt_source: "adapter",
    },
    illustrations: [
      { slot: 1, intent: "展示状态流", baoyu_design: { skill: "baoyu-article-illustrator", type: "flowchart", style: "minimal", palette: "cool" }, contributors: [], description: "state-flow", prompt_source: "adapter" },
      { slot: 2, intent: "展示控制闭环", baoyu_design: { skill: "baoyu-article-illustrator", type: "framework", style: "minimal", palette: "cool" }, contributors: [], description: "control-loop", prompt_source: "adapter" },
    ],
  }, null, 2) + "\n");

  for (const name of [
    "00-cover-serial-renderer.md",
    "00-infographic-core-summary.md",
    "01-state-flow.md",
    "02-control-loop.md",
  ]) {
    writeFileSync(join(postDir, "imgs", "prompts", name), `prompt for ${name}\n`);
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
});

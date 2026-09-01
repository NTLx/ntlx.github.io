#!/usr/bin/env bun
/** Tests for the small humanizer freshness receipt command/library. */

import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { sha256File } from "../scripts/humanizer-lib.mjs";

const REPO_ROOT = resolve(import.meta.dir, "../../../..");
const SCRIPT = resolve(import.meta.dir, "../scripts/mark-humanized.mjs");
const JPEG_BYTES = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
  0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
  0x00, 0x01, 0x00, 0x00, 0xff, 0xd9,
]);

function fixture(lastCompleteStep) {
  const root = join(tmpdir(), `humanizer-receipt-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const postsRoot = join(root, "posts");
  const slug = "2026-09-01-humanizer-receipt";
  const dir = join(postsRoot, slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "draft.md"), "---\ntitle: Receipt\n---\n\n正文。\n");
  writeFileSync(join(dir, ".pipeline-state.json"), JSON.stringify({
    slug,
    started_at: new Date().toISOString(),
    last_complete_step: lastCompleteStep,
    publish: { blog: "pending", wechat: "pending" },
    failed_step: null,
    humanizer: { status: "pending" },
  }, null, 2));
  return { root, postsRoot, slug, dir };
}

function run(fx) {
  return spawnSync("bun", ["run", SCRIPT, fx.slug], {
    cwd: REPO_ROOT,
    env: { ...process.env, PIPELINE_POSTS_ROOT: fx.postsRoot },
    encoding: "utf8",
  });
}

describe("mark-humanized", () => {
  const cleanup = [];

  afterEach(() => {
    for (const root of cleanup.splice(0)) rmSync(root, { recursive: true, force: true });
  });

  test("records both current hashes without requiring a content diff", () => {
    const fx = fixture(2);
    cleanup.push(fx.root);
    const before = readFileSync(join(fx.dir, "draft.md"), "utf8");
    const result = run(fx);
    expect(result.status).toBe(0);

    const state = JSON.parse(readFileSync(join(fx.dir, ".pipeline-state.json"), "utf8"));
    expect(state.humanizer).toMatchObject({
      status: "applied",
      skill: "humanizer-zh",
      draft_sha256: sha256File(join(fx.dir, "draft.md")),
      skill_sha256: sha256File(resolve(REPO_ROOT, ".agents/skills/humanizer-zh/SKILL.md")),
    });
    expect(readFileSync(join(fx.dir, "draft.md"), "utf8")).toBe(before);
  });

  test("does not mark a receipt before Step 2 passes", () => {
    const fx = fixture(1);
    cleanup.push(fx.root);
    const result = run(fx);
    expect(result.status).toBe(2);
    expect(result.stderr).toContain("Step 2 has not passed");
  });

  test("requires deterministic image normalization before recording the receipt", () => {
    const fx = fixture(2);
    cleanup.push(fx.root);
    writeFileSync(join(fx.dir, "cover.png"), JPEG_BYTES);

    const result = run(fx);

    expect(result.status).toBe(2);
    expect(result.stderr).toContain("deterministic normalization is not complete");
    expect(JSON.parse(readFileSync(join(fx.dir, ".pipeline-state.json"), "utf8")).humanizer.status).toBe("pending");
  });
});

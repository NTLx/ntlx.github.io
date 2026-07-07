#!/usr/bin/env bun
/**
 * step5-build.mjs 回归测试
 *
 * 覆盖 dry-run 预检、复用 image-map 和缺失输入的无副作用失败。
 */

import { describe, test, expect, afterEach } from "bun:test";
import { mkdirSync, rmSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const SCRIPT = resolve(import.meta.dir, "../scripts/step5-build.mjs");
const REPO_ROOT = resolve(import.meta.dir, "../../../..");
const PNG_BYTES = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function makeFixture() {
  const root = join(tmpdir(), `step5-build-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const postsRoot = join(root, "posts");
  return { root, postsRoot };
}

function writePost(postsRoot, slug, opts = {}) {
  const dir = join(postsRoot, slug);
  const imgsDir = join(dir, "imgs");
  mkdirSync(imgsDir, { recursive: true });

  const fm = {
    title: "Step 5 测试文章",
    date: "2026-05-18",
    summary: "用于测试 Step 5 构建。",
    category: "ai-coding",
    blogSlug: "step-five-test",
    coverImage: "cover.png",
    sourceUrl: "https://ntlx.github.io/articles/step-five-test",
    ...(opts.fm ?? {}),
  };
  const frontmatter = Object.entries(fm)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
  const body = opts.body ?? `
<!-- SLOT_IMG_00_INFOGRAPHIC -->

## 正文

这里是正文。

<!-- SLOT_IMG_01_DETAIL -->
`;
  writeFileSync(join(dir, "draft.md"), `---\n${frontmatter}\n---\n\n${body}`);

  if (opts.cover !== false) writeFileSync(join(dir, "cover.png"), PNG_BYTES);
  writeFileSync(join(imgsDir, "00-infographic-core-summary.png"), PNG_BYTES);
  writeFileSync(join(imgsDir, "01-detail.png"), PNG_BYTES);

  if (opts.imageMap) {
    writeFileSync(join(dir, "image-map.json"), JSON.stringify(opts.imageMap, null, 2));
  }

  return dir;
}

function validImageMap() {
  return {
    files: {
      "00-infographic-core-summary.png": "https://cdn.example.com/00-infographic-core-summary.png",
      "01-detail.png": "https://cdn.example.com/01-detail.png",
    },
  };
}

function runStep5(slug, postsRoot, args = []) {
  return spawnSync("bun", ["run", SCRIPT, slug, ...args], {
    cwd: REPO_ROOT,
    env: { ...process.env, PIPELINE_POSTS_ROOT: postsRoot },
    encoding: "utf8",
  });
}

describe("step5-build dry-run and image-map reuse", () => {
  let cleanup = [];

  afterEach(() => {
    for (const dir of cleanup) {
      try { rmSync(dir, { recursive: true, force: true }); } catch {}
    }
    cleanup = [];
  });

  test("--dry-run validates inputs without writing outputs or state", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-中文标题";
    const dir = writePost(fx.postsRoot, slug);

    const r = runStep5(slug, fx.postsRoot, ["--dry-run"]);
    expect(r.status).toBe(0);

    const out = JSON.parse(r.stdout);
    expect(out.dry_run).toBe(true);
    expect(out.reuse_image_map).toBe(false);
    expect(out.image_count).toBe(2);
    expect(out.slot_count).toBe(2);
    expect(out.name_prefix).toBe("2026-05-18-step-five-test-img");

    expect(existsSync(join(dir, "article.md"))).toBe(false);
    expect(existsSync(join(dir, "article-wechat.html"))).toBe(false);
    expect(existsSync(join(dir, "image-map.json"))).toBe(false);
    expect(existsSync(join(dir, ".pipeline-state.json"))).toBe(false);
  });

  test("--dry-run fails without state writes when cover is missing", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-missing-cover";
    const dir = writePost(fx.postsRoot, slug, { cover: false });

    const r = runStep5(slug, fx.postsRoot, ["--dry-run"]);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("cover image missing");
    expect(existsSync(join(dir, ".pipeline-state.json"))).toBe(false);
  });

  test("--dry-run requires frontmatter.blogSlug without date-slug fallback", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-中文标题";
    writePost(fx.postsRoot, slug, { fm: { blogSlug: undefined } });

    const r = runStep5(slug, fx.postsRoot, ["--dry-run"]);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("frontmatter.blogSlug");
  });

  test("--dry-run fails when imgs exist but draft has no image references", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-no-image-refs";
    const dir = writePost(fx.postsRoot, slug, { body: "## 正文\n\n这里没有图片占位符。\n" });

    const r = runStep5(slug, fx.postsRoot, ["--dry-run"]);
    expect(r.status).toBe(4);
    expect(r.stderr).toContain("no SLOT_IMG placeholders");
    expect(existsSync(join(dir, ".pipeline-state.json"))).toBe(false);
  });

  test("--dry-run --reuse-image-map requires a complete valid map", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-incomplete-map";
    writePost(fx.postsRoot, slug, {
      imageMap: {
        files: {
          "00-infographic-core-summary.png": "https://cdn.example.com/00-infographic-core-summary.png",
        },
      },
    });

    const r = runStep5(slug, fx.postsRoot, ["--dry-run", "--reuse-image-map"]);
    expect(r.status).toBe(4);
    expect(r.stderr).toContain("01-detail.png");
  });

  test("--dry-run --reuse-image-map accepts existing complete map", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-reuse-map";
    const dir = writePost(fx.postsRoot, slug, { imageMap: validImageMap() });

    const r = runStep5(slug, fx.postsRoot, ["--dry-run", "--reuse-image-map"]);
    expect(r.status).toBe(0);

    const out = JSON.parse(r.stdout);
    expect(out.reuse_image_map).toBe(true);
    expect(out.image_count).toBe(2);
    expect(JSON.parse(readFileSync(join(dir, "image-map.json"), "utf8")).files["01-detail.png"]).toContain("https://");
    expect(existsSync(join(dir, ".pipeline-state.json"))).toBe(false);
  });

  test("--reuse-image-map preserves the first body H2 in WeChat HTML", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-preserve-first-h2";
    const dir = writePost(fx.postsRoot, slug, {
      imageMap: validImageMap(),
      body: `
<!-- SLOT_IMG_00_INFOGRAPHIC -->

## 第一个二级标题

这里是第一节正文。

<!-- SLOT_IMG_01_DETAIL -->
`,
    });

    const r = runStep5(slug, fx.postsRoot, ["--reuse-image-map"]);
    expect(r.status).toBe(0);

    const html = readFileSync(join(dir, "article-wechat.html"), "utf8");
    expect(html).toContain(">第一个二级标题</h2>");
  });
});

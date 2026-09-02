#!/usr/bin/env bun

import { afterEach, describe, expect, test } from "bun:test";
import { chmodSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { writePreparedArtifactManifest } from "../scripts/artifact-integrity-lib.mjs";

const SCRIPT = resolve(import.meta.dir, "../scripts/step5-build.mjs");
const REPO_ROOT = resolve(import.meta.dir, "../../../..");
const PNG_BYTES = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);
const JPEG_BYTES = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
  0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
  0x00, 0x01, 0x00, 0x00, 0xff, 0xd9,
]);

function makeFakeBun(root) {
  const bin = join(root, "bin");
  mkdirSync(bin, { recursive: true });
  const helper = join(root, "fake-uploader.mjs");
  writeFileSync(helper, `import { readdirSync, readFileSync, writeFileSync } from "node:fs";
const [imgsDir, output, prefix] = process.argv.slice(2);
const files = readdirSync(imgsDir).filter(file => /\\.(png|jpe?g|webp|gif)$/i.test(file)).sort();
const map = Object.fromEntries(files.map(file => [file, \`https://cdn.fake/\${prefix}-\${file}\`]));
if (process.env.FAKE_UPLOADER_INCOMPLETE === "1") delete map[files.at(-1)];
writeFileSync(output, JSON.stringify(map, null, 2) + "\\n");
`);
  const fakeBun = join(bin, "bun");
  writeFileSync(fakeBun, `#!/bin/sh
set -eu
script_seen=0
image_dir=""
output=""
prefix=""
for arg in "$@"; do
  if [ "$script_seen" = "1" ]; then
    image_dir="$arg"
    script_seen=2
  elif case "$arg" in *github-image-hosting/scripts/upload.ts) true;; *) false;; esac; then
    script_seen=1
  fi
done
if [ "$script_seen" = "2" ]; then
  previous=""
  for arg in "$@"; do
    if [ "$previous" = "--output" ]; then output="$arg"; fi
    if [ "$previous" = "--name-prefix" ]; then prefix="$arg"; fi
    previous="$arg"
  done
  printf '%s\\n' "$*" >> "$FAKE_BUN_UPLOAD_LOG"
  exec "$REAL_BUN" "$FAKE_UPLOADER" "$image_dir" "$output" "$prefix"
fi
exec "$REAL_BUN" "$@"
`);
  chmodSync(fakeBun, 0o755);
  return { bin, helper, log: join(root, "uploader.log") };
}

function makeFixture() {
  const root = join(tmpdir(), `step5-build-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const postsRoot = join(root, "posts");
  const fake = makeFakeBun(root);
  return { root, postsRoot, fake };
}

function writePost(postsRoot, slug, options = {}) {
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
    ...(options.fm ?? {}),
  };
  const frontmatter = Object.entries(fm)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
  const body = options.body ?? `
<!-- SLOT_IMG_00_INFOGRAPHIC -->

## 正文

这里是正文。

<!-- SLOT_IMG_01_DETAIL -->
`;
  writeFileSync(join(dir, "draft.md"), `---\n${frontmatter}\n---\n\n${body}`);
  if (options.cover !== false) writeFileSync(join(dir, "cover.png"), PNG_BYTES);
  writeFileSync(join(imgsDir, "00-infographic-core-summary.png"), PNG_BYTES);
  if (/SLOT_IMG_01/u.test(body)) writeFileSync(join(imgsDir, "01-detail.png"), PNG_BYTES);
  const sections = [...body.matchAll(/^##(?!#)\s+(.+?)\s*$/gmu)]
    .filter((match) => !["参考资料", "延伸阅读"].includes(match[1].trim()));
  const slots = [...body.matchAll(/<!--\s*SLOT_IMG_(\d{2})(?:_[A-Za-z0-9_-]+)?\s*-->/gu)]
    .map((match) => ({ slot: Number(match[1]), index: match.index }))
    .filter(({ slot }) => slot > 0);
  writeFileSync(join(dir, "image-plan.json"), JSON.stringify({
    visual_profile: "bright-vivid-warm",
    source_image_policy: "prefer-reuse",
    article_visual_design: {
      planner: "wechat-article-write-agent",
      coverage_review: sections.map((section, index) => {
        const next = sections[index + 1]?.index ?? body.length;
        const slot = slots.find((candidate) => candidate.index >= section.index && candidate.index < next);
        return slot
          ? { section_index: index + 1, heading: section[1].trim(), decision: "illustrate", slot: slot.slot, reason: "测试章节包含视觉节点" }
          : { section_index: index + 1, heading: section[1].trim(), decision: "text-only", reason: "测试章节文字已经足够清楚" };
      }),
    },
    cover: { producer: "baoyu-cover-image", intent: "测试封面", baoyu_design: { skill: "baoyu-cover-image", aspect: "2.35:1", text: "none" }, prompt_source: "external" },
    infographic: { producer: "baoyu-xhs-images", intent: "测试摘要", baoyu_design: { skill: "baoyu-xhs-images", card_count: 1 }, text_density: "low", has_long_copy: false, prompt_source: "external" },
    illustrations: slots.map(({ slot }) => ({ slot, producer: "baoyu-infographic", intent: `测试 SLOT ${slot}`, baoyu_design: { skill: "baoyu-infographic" }, text_density: "low", has_long_copy: false, prompt_source: "external", description: "detail" })),
    source_image_review: [],
  }, null, 2));
  if (options.cover !== false) {
    const sha = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");
    const style = { bright: true, high_saturation: true, high_contrast: true, clean_background: true, crisp: true, warm: true, positive: true };
    const assets = [
      { asset: "cover.png", role: "cover", path: join(dir, "cover.png"), text_density: "none" },
      { asset: "00-infographic-core-summary.png", role: "header", path: join(imgsDir, "00-infographic-core-summary.png"), text_density: "low" },
      ...slots.map(({ slot }) => ({ asset: `${String(slot).padStart(2, "0")}-detail.png`, role: "body", path: join(imgsDir, "01-detail.png"), text_density: "low" })),
    ].map(({ path, ...asset }) => ({ ...asset, sha256: sha(path), approved: true, semantic_match: true, legibility: true, visible_text_ok: true, has_long_copy: false, style_review: style, reviewer_note: "测试图片清晰" }));
    writeFileSync(join(dir, "image-review.json"), JSON.stringify({ version: 1, visual_profile: "bright-vivid-warm", assets }, null, 2));
  }
  writeFileSync(join(dir, ".pipeline-state.json"), JSON.stringify({
    slug,
    started_at: new Date().toISOString(),
    last_complete_step: 4,
    publish: { blog: "pending", wechat: "pending" },
    failed_step: null,
    humanizer: { status: "pending" },
  }, null, 2));
  const receipt = spawnSync("bun", ["run", resolve(import.meta.dir, "../scripts/mark-humanized.mjs"), slug], {
    cwd: REPO_ROOT,
    env: { ...process.env, PIPELINE_POSTS_ROOT: postsRoot },
    encoding: "utf8",
  });
  if (receipt.status !== 0) throw new Error(receipt.stderr);
  return dir;
}

function runStep5(slug, postsRoot, fake, args = [], extraEnv = {}) {
  return spawnSync("bun", ["run", SCRIPT, slug, ...args], {
    cwd: REPO_ROOT,
    env: {
      ...process.env,
      PIPELINE_REPO_ROOT: REPO_ROOT,
      PIPELINE_POSTS_ROOT: postsRoot,
      PATH: `${fake.bin}:${process.env.PATH}`,
      REAL_BUN: process.execPath,
      FAKE_UPLOADER: fake.helper,
      FAKE_BUN_UPLOAD_LOG: fake.log,
      ...extraEnv,
    },
    encoding: "utf8",
  });
}

function lastJsonLine(stdout) {
  return JSON.parse(stdout.trim().split("\n").at(-1));
}

function uploaderCalls(fake) {
  if (!existsSync(fake.log)) return [];
  return readFileSync(fake.log, "utf8").trim().split("\n").filter(Boolean);
}

describe("step5-build phase boundaries", () => {
  const cleanup = [];

  afterEach(() => {
    for (const root of cleanup.splice(0)) rmSync(root, { recursive: true, force: true });
  });

  test("dry-run validates local inputs without uploader, map, artifact, or state mutation", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-dry-run";
    const dir = writePost(fx.postsRoot, slug);
    const stateBefore = readFileSync(join(dir, ".pipeline-state.json"), "utf8");

    const result = runStep5(slug, fx.postsRoot, fx.fake, ["--dry-run"]);

    expect(result.status).toBe(0);
    expect(lastJsonLine(result.stdout)).toMatchObject({
      dry_run: true,
      image_count: 2,
      slot_count: 2,
      name_prefix: "2026-05-18-step-five-test-img",
      target_folder: "wechat-articles",
    });
    expect(uploaderCalls(fx.fake)).toHaveLength(0);
    expect(existsSync(join(dir, "image-map.json"))).toBe(false);
    expect(existsSync(join(dir, "article.md"))).toBe(false);
    expect(readFileSync(join(dir, ".pipeline-state.json"), "utf8")).toBe(stateBefore);
  });

  test("dry-run still fails when cover is missing", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-missing-cover";
    const dir = writePost(fx.postsRoot, slug, { cover: false });

    const result = runStep5(slug, fx.postsRoot, fx.fake, ["--dry-run"]);

    expect(result.status).toBe(2);
    expect(result.stderr).toContain("cover image missing");
    expect(uploaderCalls(fx.fake)).toHaveLength(0);
    expect(readFileSync(join(dir, ".pipeline-state.json"), "utf8")).not.toContain('"step": 5');
  });

  test("dry-run fails when imgs exist but draft has no image references", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-no-image-refs";
    const dir = writePost(fx.postsRoot, slug, { body: "## 正文\n\n这里没有图片占位符。\n" });

    const result = runStep5(slug, fx.postsRoot, fx.fake, ["--dry-run"]);

    expect(result.status).toBe(4);
    expect(result.stderr).toContain("SLOT_IMG_00 exactly once");
    expect(uploaderCalls(fx.fake)).toHaveLength(0);
    expect(readFileSync(join(dir, ".pipeline-state.json"), "utf8")).not.toContain('"step": 5');
  });

  test("prepare-only invokes image hosting exactly once with business intent only", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-prepare-only";
    const dir = writePost(fx.postsRoot, slug);

    const result = runStep5(slug, fx.postsRoot, fx.fake, ["--prepare-only"]);

    expect(result.status).toBe(0);
    expect(lastJsonLine(result.stdout)).toMatchObject({ phase: "prepared", needs_agent_layout: true });
    expect(uploaderCalls(fx.fake)).toHaveLength(1);
    const call = uploaderCalls(fx.fake)[0];
    expect(call).toContain("--folder wechat-articles");
    expect(call).toContain("--name-prefix 2026-05-18-step-five-test-img");
    expect(call).toContain(`--output ${join(dir, "image-map.json")}`);
    expect(call).not.toContain("--repo");
    expect(existsSync(join(dir, "image-map.json"))).toBe(true);
    expect(existsSync(join(dir, "article.md"))).toBe(true);
    expect(existsSync(join(dir, "article-wechat-source.md"))).toBe(true);
    const generatedMap = JSON.parse(readFileSync(join(dir, "image-map.json"), "utf8"));
    expect(generatedMap["00-infographic-core-summary.png"]).toContain("https://");
    expect(JSON.parse(readFileSync(join(dir, ".pipeline-state.json"), "utf8")).last_complete_step).toBe(4);
  });

  test("fails deterministically when the uploader map does not cover draft assets", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-incomplete-map";
    const dir = writePost(fx.postsRoot, slug);

    const result = runStep5(slug, fx.postsRoot, fx.fake, ["--prepare-only"], { FAKE_UPLOADER_INCOMPLETE: "1" });

    expect(result.status).toBe(4);
    expect(result.stderr).toContain("image-map.json missing valid CDN URL");
    expect(uploaderCalls(fx.fake)).toHaveLength(1);
    expect(existsSync(join(dir, "article.md"))).toBe(false);
  });

  test("finalize-only never invokes image hosting, including repeated finalization", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-finalize-only";
    const dir = writePost(fx.postsRoot, slug);
    writeFileSync(join(dir, "article.md"), "---\ntitle: prepared\n---\n\n![summary](https://cdn.fake/00-infographic-core-summary.png)\n\n## 正文\n\n正文\n\n![detail](https://cdn.fake/01-detail.png)\n");
    writeFileSync(join(dir, "article-wechat-source.md"), [
      "![](imgs/00-infographic-core-summary.png)",
      "",
      "## 正文",
      "",
      "正文",
      "",
      "![](imgs/01-detail.png)",
      "",
    ].join("\n"));
    writeFileSync(join(dir, "image-map.json"), JSON.stringify({
      "00-infographic-core-summary.png": "https://cdn.fake/00-infographic-core-summary.png",
      "01-detail.png": "https://cdn.fake/01-detail.png",
    }));
    writeFileSync(join(dir, "article-wechat.html"), [
      '<section style="margin:0 auto;max-width:720px;">',
      '  <p style="margin:0;line-height:1.8;color:#222;"><img src="imgs/00-infographic-core-summary.png" style="max-width:100%;height:auto;display:block;margin:0 auto;"></p>',
      '  <h3 style="font-size:20px;color:#222;margin:16px 0;"><span leaf="">正文</span></h3>',
      '  <p style="margin:0;line-height:1.8;color:#222;"><span leaf="">正文</span></p>',
      '  <p style="margin:0;line-height:1.8;color:#222;"><img src="imgs/01-detail.png" style="max-width:100%;height:auto;display:block;margin:0 auto;"></p>',
      '  <p style="margin:0;line-height:1.8;color:#222;"><span leaf="">我是 NTLx，热衷于分享 AI 观察与干货。</span></p>',
      "</section>",
      "",
    ].join("\n"));
    writePreparedArtifactManifest(dir);

    const first = runStep5(slug, fx.postsRoot, fx.fake, ["--finalize-only"]);
    const second = runStep5(slug, fx.postsRoot, fx.fake, ["--finalize-only"]);

    expect(first.status).toBe(0);
    expect(second.status).toBe(0);
    expect(lastJsonLine(second.stdout).phase).toBe("completed");
    expect(uploaderCalls(fx.fake)).toHaveLength(0);
    expect(JSON.parse(readFileSync(join(dir, ".pipeline-state.json"), "utf8")).last_complete_step).toBe(5);
  });

  test("finalize-only enforces the humanizer draft freeze without invoking image hosting", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-finalize-stale-draft";
    const dir = writePost(fx.postsRoot, slug);
    writeFileSync(join(dir, "article.md"), "---\ntitle: prepared\n---\n\n![summary](https://cdn.fake/00-infographic-core-summary.png)\n\n## 正文\n\n正文\n\n![detail](https://cdn.fake/01-detail.png)\n");
    writeFileSync(join(dir, "article-wechat-source.md"), [
      "![](imgs/00-infographic-core-summary.png)",
      "",
      "## 正文",
      "",
      "正文",
      "",
      "![](imgs/01-detail.png)",
      "",
    ].join("\n"));
    writeFileSync(join(dir, "image-map.json"), JSON.stringify({
      "00-infographic-core-summary.png": "https://cdn.fake/00-infographic-core-summary.png",
      "01-detail.png": "https://cdn.fake/01-detail.png",
    }));
    writeFileSync(join(dir, "article-wechat.html"), [
      '<section style="margin:0 auto;max-width:720px;">',
      '  <p style="margin:0;line-height:1.8;color:#222;"><img src="imgs/00-infographic-core-summary.png" style="max-width:100%;height:auto;display:block;margin:0 auto;"></p>',
      '  <h3 style="font-size:20px;color:#222;margin:16px 0;"><span leaf="">正文</span></h3>',
      '  <p style="margin:0;line-height:1.8;color:#222;"><span leaf="">正文</span></p>',
      '  <p style="margin:0;line-height:1.8;color:#222;"><img src="imgs/01-detail.png" style="max-width:100%;height:auto;display:block;margin:0 auto;"></p>',
      '  <p style="margin:0;line-height:1.8;color:#222;"><span leaf="">我是 NTLx，热衷于分享 AI 观察与干货。</span></p>',
      "</section>",
      "",
    ].join("\n"));
    writePreparedArtifactManifest(dir);
    writeFileSync(join(dir, "draft.md"), `${readFileSync(join(dir, "draft.md"), "utf8")}\n有人改了冻结后的草稿。\n`);

    const result = runStep5(slug, fx.postsRoot, fx.fake, ["--finalize-only"]);

    expect(result.status).toBe(2);
    expect(result.stderr).toContain("draft.md changed after humanizer-zh");
    expect(uploaderCalls(fx.fake)).toHaveLength(0);
    expect(JSON.parse(readFileSync(join(dir, ".pipeline-state.json"), "utf8")).last_complete_step).toBe(4);
  });

  test("prepare fails closed on a cover MIME/extension mismatch without renaming or uploading", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-cover-mismatch";
    const dir = writePost(fx.postsRoot, slug);
    writeFileSync(join(dir, "cover.png"), JPEG_BYTES);

    const result = runStep5(slug, fx.postsRoot, fx.fake, ["--prepare-only"]);

    expect(result.status).toBe(2);
    expect(result.stderr).toContain("cover.png has MIME image/jpeg");
    expect(existsSync(join(dir, "cover.png"))).toBe(true);
    expect(existsSync(join(dir, "cover.jpg"))).toBe(false);
    expect(uploaderCalls(fx.fake)).toHaveLength(0);
    expect(existsSync(join(dir, "image-map.json"))).toBe(false);
  });

  test("prepare fails closed when both root cover extensions exist", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-dual-root-cover-step5";
    const dir = writePost(fx.postsRoot, slug);
    writeFileSync(join(dir, "cover.jpg"), JPEG_BYTES);

    const result = runStep5(slug, fx.postsRoot, fx.fake, ["--prepare-only"]);

    expect(result.status).toBe(2);
    expect(result.stderr).toContain("multiple root cover images");
    expect(uploaderCalls(fx.fake)).toHaveLength(0);
    expect(existsSync(join(dir, "cover.png"))).toBe(true);
    expect(existsSync(join(dir, "cover.jpg"))).toBe(true);
    expect(existsSync(join(dir, "image-map.json"))).toBe(false);
  });
});

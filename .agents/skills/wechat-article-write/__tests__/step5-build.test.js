#!/usr/bin/env bun

import { afterEach, describe, expect, test } from "bun:test";
import { chmodSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const SCRIPT = resolve(import.meta.dir, "../scripts/step5-build.mjs");
const REPO_ROOT = resolve(import.meta.dir, "../../../..");
const PNG_BYTES = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

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
  writeFileSync(join(imgsDir, "01-detail.png"), PNG_BYTES);
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
    expect(result.stderr).toContain("no SLOT_IMG placeholders");
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
    writeFileSync(join(dir, "article.md"), "---\ntitle: prepared\n---\n\n![image](https://cdn.fake/image.png)\n");
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
    writeFileSync(join(dir, "article-wechat.html"), [
      '<section style="margin:0 auto;max-width:720px;">',
      '  <p style="margin:0;line-height:1.8;color:#222;"><img src="imgs/00-infographic-core-summary.png" style="max-width:100%;height:auto;display:block;margin:0 auto;"></p>',
      '  <h3 style="font-size:20px;color:#222;margin:16px 0;"><span leaf="">正文</span></h3>',
      '  <p style="margin:0;line-height:1.8;color:#222;"><span leaf="">正文</span></p>',
      '  <p style="margin:0;line-height:1.8;color:#222;"><img src="imgs/01-detail.png" style="max-width:100%;height:auto;display:block;margin:0 auto;"></p>',
      "</section>",
      "",
    ].join("\n"));

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
    writeFileSync(join(dir, "article.md"), "---\ntitle: prepared\n---\n\n![image](https://cdn.fake/image.png)\n");
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
    writeFileSync(join(dir, "article-wechat.html"), [
      '<section style="margin:0 auto;max-width:720px;">',
      '  <p style="margin:0;line-height:1.8;color:#222;"><img src="imgs/00-infographic-core-summary.png" style="max-width:100%;height:auto;display:block;margin:0 auto;"></p>',
      '  <h3 style="font-size:20px;color:#222;margin:16px 0;"><span leaf="">正文</span></h3>',
      '  <p style="margin:0;line-height:1.8;color:#222;"><span leaf="">正文</span></p>',
      '  <p style="margin:0;line-height:1.8;color:#222;"><img src="imgs/01-detail.png" style="max-width:100%;height:auto;display:block;margin:0 auto;"></p>',
      "</section>",
      "",
    ].join("\n"));
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
    writeFileSync(join(dir, "cover.png"), Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
      0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
      0x00, 0x01, 0x00, 0x00, 0xff, 0xd9,
    ]));

    const result = runStep5(slug, fx.postsRoot, fx.fake, ["--prepare-only"]);

    expect(result.status).toBe(2);
    expect(result.stderr).toContain("cover.png has MIME image/jpeg");
    expect(existsSync(join(dir, "cover.png"))).toBe(true);
    expect(existsSync(join(dir, "cover.jpg"))).toBe(false);
    expect(uploaderCalls(fx.fake)).toHaveLength(0);
    expect(existsSync(join(dir, "image-map.json"))).toBe(false);
  });
});

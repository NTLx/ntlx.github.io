import { describe, expect, test, afterEach } from "bun:test";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { applyImageMapToMarkdown } from "../scripts/step5-lib.mjs";

const SCRIPT = resolve(import.meta.dir, "../scripts/step5-build.mjs");
const PROJECT_ROOT = resolve(import.meta.dir, "../../../..");
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function makeFixture(map = undefined) {
  const root = join(tmpdir(), `step5-build-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const postsRoot = join(root, "posts");
  const repoRoot = join(root, "repo");
  const slug = "2026-09-03-step5-native";
  const postDir = join(postsRoot, slug);
  mkdirSync(join(postDir, "imgs"), { recursive: true });
  mkdirSync(join(repoRoot, ".agents/skills/wechat-article-write"), { recursive: true });
  mkdirSync(join(repoRoot, ".agents/skills/github-image-hosting/scripts"), { recursive: true });
  writeFileSync(join(repoRoot, ".agents/skills/wechat-article-write/EXTEND.md"), [
    "default_author: NTLx",
    "default_author_bio: 热衷于分享 AI 观察与干货",
  ].join("\n") + "\n");
  writeFileSync(join(repoRoot, ".agents/skills/github-image-hosting/scripts/upload.ts"), [
    "process.stderr.write('uploader must not be invoked\\n');",
    "process.exit(99);",
  ].join("\n"));
  writeFileSync(join(postDir, "cover.png"), PNG);
  writeFileSync(join(postDir, "imgs/00-infographic-core-summary.png"), PNG);

  const draft = `---
title: Step 5 测试
date: 2026-09-03
summary: 测试确定性构建。
category: AI
blogSlug: step5-native
coverImage: cover.png
sourceUrl: https://ntlx.github.io/articles/step5-native
---

<!-- SLOT_IMG_00_INFOGRAPHIC -->

## 机制

正文内容。
`;
  writeFileSync(join(postDir, "draft.md"), draft);
  writeFileSync(join(postDir, "image-plan.json"), JSON.stringify({
    cover: "cover.png",
    images: [{ slot: "SLOT_IMG_00", kind: "generated", file: "imgs/00-infographic-core-summary.png" }],
  }) + "\n");
  writeFileSync(join(postDir, ".pipeline-state.json"), JSON.stringify({
    slug,
    last_complete_step: 3,
    step3_draft_sha256: createHash("sha256").update(draft).digest("hex"),
    publish: { blog: "pending", wechat: "pending" },
    failed_step: null,
  }) + "\n");
  if (map !== undefined) {
    writeFileSync(join(postDir, "image-map.json"), JSON.stringify(map) + "\n");
  }
  return { root, postsRoot, repoRoot, postDir, slug };
}

function run(fixture, ...args) {
  return spawnSync("bun", ["run", SCRIPT, fixture.slug, ...args], {
    cwd: PROJECT_ROOT,
    env: { ...process.env, PIPELINE_POSTS_ROOT: fixture.postsRoot, PIPELINE_REPO_ROOT: fixture.repoRoot },
    encoding: "utf8",
  });
}

describe("step5-build", () => {
  const cleanup = [];

  afterEach(() => {
    while (cleanup.length > 0) rmSync(cleanup.pop(), { recursive: true, force: true });
  });

  test("fails closed when native image hosting has not produced image-map.json", () => {
    const fixture = makeFixture();
    cleanup.push(fixture.root);
    const result = run(fixture, "--prepare-only");

    expect(result.status).toBe(3);
    expect(result.stderr).toContain("first complete native github-image-hosting delegation");
    expect(existsSync(join(fixture.postDir, "article.md"))).toBe(false);
  });

  test("consumes a complete image map without invoking an uploader", () => {
    const fixture = makeFixture({ "00-infographic-core-summary.png": "https://cdn.example.test/00-infographic-core-summary.png" });
    cleanup.push(fixture.root);
    const result = run(fixture, "--prepare-only");

    expect(result.status, result.stderr || result.stdout).toBe(0);
    expect(existsSync(join(fixture.postDir, "article.md"))).toBe(true);
    expect(existsSync(join(fixture.postDir, "article-wechat-source.md"))).toBe(true);
    expect(readFileSync(join(fixture.postDir, "article.md"), "utf8")).toContain("https://cdn.example.test/00-infographic-core-summary.png");
  });

  test("fails closed when a local image has no CDN mapping", () => {
    const fixture = makeFixture({});
    cleanup.push(fixture.root);
    const result = run(fixture, "--prepare-only");

    expect(result.status).toBe(4);
    expect(result.stderr).toContain("missing valid CDN URL");
  });

  test("keeps SLOT00 bound to the infographic instead of a similarly named cover", () => {
    const fixture = makeFixture({
      "00-infographic-core-summary.png": "https://cdn.example.test/summary.png",
      "00-cover.png": "https://cdn.example.test/cover.png",
    });
    cleanup.push(fixture.root);
    writeFileSync(join(fixture.postDir, "imgs/00-cover.png"), PNG);
    const draft = readFileSync(join(fixture.postDir, "draft.md"), "utf8");
    const output = applyImageMapToMarkdown(
      draft,
      join(fixture.postDir, "imgs"),
      JSON.parse(readFileSync(join(fixture.postDir, "image-map.json"), "utf8")),
    );

    expect(output).toContain("https://cdn.example.test/summary.png");
    expect(output).not.toContain("https://cdn.example.test/cover.png");
  });

  test("finalize is read-only for valid HTML and fails without rewriting ordinary anchors", () => {
    const fixture = makeFixture({ "00-infographic-core-summary.png": "https://cdn.example.test/summary.png" });
    cleanup.push(fixture.root);
    const prepare = run(fixture, "--prepare-only");
    expect(prepare.status, prepare.stderr || prepare.stdout).toBe(0);
    const htmlPath = join(fixture.postDir, "article-wechat.html");
    writeFileSync(htmlPath, "<section><img src=\"imgs/00-infographic-core-summary.png\"><h2>机制</h2><p>正文内容。</p></section>\n");
    const before = createHash("sha256").update(readFileSync(htmlPath)).digest("hex");

    const finalized = run(fixture, "--finalize-only");

    expect(finalized.status, finalized.stderr || finalized.stdout).toBe(0);
    expect(createHash("sha256").update(readFileSync(htmlPath)).digest("hex")).toBe(before);

    writeFileSync(htmlPath, "<section><a href=\"https://example.com\"><h2>机制</h2></a><p>正文内容。</p></section>\n");
    const anchorBefore = readFileSync(htmlPath, "utf8");
    const rejected = run(fixture, "--finalize-only");
    expect(rejected.status).toBe(4);
    expect(rejected.stderr).toContain("ordinary <a href>");
    expect(readFileSync(htmlPath, "utf8")).toBe(anchorBefore);
  });

  test("does not contain the removed uploader bridge", () => {
    const source = readFileSync(SCRIPT, "utf8");
    expect(source).not.toContain("spawnSync");
    expect(source).not.toContain("github-image-hosting/scripts/upload");
    expect(source).not.toContain("upload.ts");
    const step5Lib = readFileSync(resolve(import.meta.dir, "../scripts/step5-lib.mjs"), "utf8");
    expect(step5Lib).not.toContain("spawnSync");
    expect(step5Lib).not.toContain("validate_gzh_html");
    expect(step5Lib).not.toContain("wrap_preview");
  });
});

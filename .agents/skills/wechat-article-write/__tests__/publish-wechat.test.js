/** Regression tests for the deterministic Step 6.2 boundary. */

import { describe, test, expect, afterEach } from "bun:test";
import { createHash } from "node:crypto";
import { mkdirSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { writePreparedArtifactManifest, writeFinalizedArtifactManifest } from "../scripts/artifact-integrity-lib.mjs";

const SCRIPT = resolve(import.meta.dir, "../scripts/publish-wechat.mjs");
const PROJECT_ROOT = resolve(import.meta.dir, "../../../..");

function makeFixture() {
  const root = join(tmpdir(), `publish-wechat-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const repoRoot = join(root, "repo");
  mkdirSync(join(repoRoot, ".agents/skills/wechat-article-write"), { recursive: true });
  writeFileSync(join(repoRoot, ".agents/skills/wechat-article-write/EXTEND.md"), "default_author: NTLx\ndefault_author_bio: 热衷于分享 AI 观察与干货\n");
  return { root, postsRoot: join(root, "posts"), repoRoot };
}

function writePost(postsRoot, slug, {
  sourceUrl = "https://ntlx.github.io/articles/wechat-utm-test",
  html = "<section><h2>正文</h2><p>正文内容。</p><p>我是 NTLx，热衷于分享 AI 观察与干货。</p></section>\n",
} = {}) {
  const dir = join(postsRoot, slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "cover.png"), "cover");
  writeFileSync(join(dir, "article-wechat.html"), html);
  const article = `---
title: 测试微信发布
summary: 用于测试微信发布摘要。
author: NTLx
sourceUrl: ${sourceUrl}
---

正文。
`;
  writeFileSync(join(dir, "article.md"), article);
  writeFileSync(join(dir, "draft.md"), "---\ntitle: draft\n---\n\n正文。\n");
  writeFileSync(join(dir, "image-plan.json"), "{}\n");
  writeFileSync(join(dir, "article-wechat-source.md"), "正文。\n");
  writeFileSync(join(dir, ".pipeline-state.json"), JSON.stringify({
    slug,
    last_complete_step: 6,
    step3_draft_sha256: createHash("sha256").update(readFileSync(join(dir, "draft.md"))).digest("hex"),
    publish: { blog: "done", wechat: "pending" },
    failed_step: null,
  }) + "\n");
  writePreparedArtifactManifest(dir);
  writeFinalizedArtifactManifest(dir);
  return dir;
}

function runPublish(args, fixture) {
  return spawnSync("bun", ["run", SCRIPT, ...args], {
    cwd: PROJECT_ROOT,
    env: { ...process.env, PIPELINE_POSTS_ROOT: fixture.postsRoot, PIPELINE_REPO_ROOT: fixture.repoRoot },
    encoding: "utf8",
  });
}

describe("publish-wechat", () => {
  const cleanup = [];

  afterEach(() => {
    while (cleanup.length > 0) rmSync(cleanup.pop(), { recursive: true, force: true });
  });

  test("prepare emits the UTM capsule without changing publish state", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-09-03-wechat-prepare";
    const dir = writePost(fx.postsRoot, slug);

    const result = runPublish([slug, "--prepare-only"], fx);

    expect(result.status, result.stderr || result.stdout).toBe(0);
    const capsule = JSON.parse(result.stdout.trim().split("\n").at(-1));
    expect(capsule.input).toBe(`posts/${slug}/article-wechat.html`);
    expect(capsule.cover).toBe(`posts/${slug}/cover.png`);
    expect(capsule.author).toBe("NTLx");
    expect(capsule.source_url).toBe("https://ntlx.github.io/articles/wechat-utm-test?utm_source=wechat&utm_medium=social&utm_campaign=article_push");
    expect(JSON.parse(readFileSync(join(dir, ".pipeline-state.json"), "utf8")).publish.wechat).toBe("pending");
  });

  test("finalize records success and optional media_id without invoking a child script", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-09-03-wechat-finalize";
    const dir = writePost(fx.postsRoot, slug);

    const result = runPublish([slug, "--finalize-only", "--media-id", "media-123"], fx);

    expect(result.status, result.stderr || result.stdout).toBe(0);
    const state = JSON.parse(readFileSync(join(dir, ".pipeline-state.json"), "utf8"));
    expect(state.publish.wechat).toBe("done");
    expect(state.sourceUrl).toBe("https://ntlx.github.io/articles/wechat-utm-test");
    expect(state.wechatSourceUrl).toBe("https://ntlx.github.io/articles/wechat-utm-test?utm_source=wechat&utm_medium=social&utm_campaign=article_push");
    expect(state.publish_result.wechat).toEqual({ draft_created: true, media_id: "media-123" });
  });

  test("keeps root cover uniqueness and author placeholders as hard gates", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-09-03-wechat-integrity";
    const dir = writePost(fx.postsRoot, slug, { html: "<p>我是 {{作者名}}，{{一句话简介}}。</p>\n" });
    writeFileSync(join(dir, "cover.jpg"), "another cover");

    const result = runPublish([slug, "--prepare-only"], fx);

    expect(result.status).toBe(2);
    expect(result.stderr).toContain("multiple root cover images");
  });

  test("rejects curly quote attributes and img tags without ASCII src", () => {
    for (const html of [
      '<p>我是 NTLx，热衷于分享 AI 观察与干货。</p><img src=“https://cdn.example.test/a.png”>',
      '<p>我是 NTLx，热衷于分享 AI 观察与干货。</p><img alt="missing">',
    ]) {
      const fx = makeFixture();
      cleanup.push(fx.root);
      const slug = `2026-09-03-wechat-html-${cleanup.length}`;
      writePost(fx.postsRoot, slug, { html });
      const result = runPublish([slug, "--prepare-only"], fx);
      expect(result.status).toBe(5);
    }
  });

  test("production script contains no WeChat child implementation bridge", () => {
    const source = readFileSync(SCRIPT, "utf8");
    for (const token of ["wechat-api.ts", "BAOYU_POST_TO_WECHAT_BIN", "resolveWechatApiScript", "ensureDepsInstalled", "spawnSync"]) {
      expect(source).not.toContain(token);
    }
  });
});

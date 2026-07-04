#!/usr/bin/env bun
/**
 * publish-wechat.mjs 回归测试
 *
 * 覆盖微信“阅读原文”source-url 的 UTM 归因参数。
 */

import { describe, test, expect, afterEach } from "bun:test";
import { mkdirSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const SCRIPT = resolve(import.meta.dir, "../scripts/publish-wechat.mjs");
const PROJECT_ROOT = resolve(import.meta.dir, "../../../..");

function makeFixture() {
  const root = join(tmpdir(), `publish-wechat-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const postsRoot = join(root, "posts");
  const repoRoot = join(root, "repo");
  const fakeWechatApi = join(repoRoot, "fake-wechat-api.ts");

  seedPublishDeps(repoRoot);
  writeFileSync(fakeWechatApi, "#!/usr/bin/env bun\nprocess.exit(0);\n");

  return { root, postsRoot, repoRoot, fakeWechatApi };
}

function seedPublishDeps(repoRoot) {
  for (const rel of [
    ".baoyu-skills/baoyu-image-gen",
    ".baoyu-skills/baoyu-markdown-to-html",
    ".baoyu-skills/baoyu-post-to-wechat",
    ".agents/skills/github-image-hosting",
    ".agents/skills/baoyu-markdown-to-html",
    ".agents/skills/baoyu-post-to-wechat",
  ]) {
    mkdirSync(join(repoRoot, rel), { recursive: true });
  }

  writeFileSync(join(repoRoot, ".baoyu-skills/.env"), "DUMMY=1\n");
  for (const rel of [
    ".baoyu-skills/baoyu-image-gen/EXTEND.md",
    ".baoyu-skills/baoyu-markdown-to-html/EXTEND.md",
    ".baoyu-skills/baoyu-post-to-wechat/EXTEND.md",
    ".agents/skills/github-image-hosting/SKILL.md",
    ".agents/skills/baoyu-markdown-to-html/SKILL.md",
    ".agents/skills/baoyu-post-to-wechat/SKILL.md",
  ]) {
    writeFileSync(join(repoRoot, rel), "---\nname: fake\n---\n");
  }
}

function writePost(postsRoot, slug, { sourceUrl = "https://ntlx.github.io/articles/wechat-utm-test" } = {}) {
  const dir = join(postsRoot, slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "cover.png"), "");
  writeFileSync(join(dir, "article-wechat.html"), "<section>微信正文</section>\n");
  writeFileSync(join(dir, "article.md"), `---
title: 测试微信发布
summary: 用于测试微信发布摘要。
sourceUrl: ${sourceUrl}
---

正文。
`);
}

function runPublish(args, fixture) {
  return spawnSync("bun", ["run", SCRIPT, ...args], {
    cwd: PROJECT_ROOT,
    env: {
      ...process.env,
      PIPELINE_POSTS_ROOT: fixture.postsRoot,
      PIPELINE_REPO_ROOT: fixture.repoRoot,
      BAOYU_POST_TO_WECHAT_BIN: fixture.fakeWechatApi,
    },
    encoding: "utf8",
  });
}

describe("publish-wechat", () => {
  const cleanup = [];

  afterEach(() => {
    while (cleanup.length > 0) {
      const dir = cleanup.pop();
      try { rmSync(dir, { recursive: true, force: true }); } catch {}
    }
  });

  test("passes a WeChat-attributed source URL in dry-run", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-07-05-wechat-utm";
    writePost(fx.postsRoot, slug);

    const r = runPublish([slug, "--dry-run"], fx);

    expect(r.status).toBe(0);
    expect(r.stdout).toContain("--source-url https://ntlx.github.io/articles/wechat-utm-test?utm_source=wechat&utm_medium=social&utm_campaign=article_push");
  });

  test("records canonical and WeChat-attributed source URLs after publish", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-07-05-wechat-utm-query";
    const canonicalUrl = "https://ntlx.github.io/articles/wechat-utm-test?ref=existing&utm_source=old#read";
    const wechatSourceUrl = "https://ntlx.github.io/articles/wechat-utm-test?ref=existing&utm_source=wechat&utm_medium=social&utm_campaign=article_push#read";
    writePost(fx.postsRoot, slug, { sourceUrl: canonicalUrl });

    const r = runPublish([slug], fx);

    expect(r.status).toBe(0);
    const state = JSON.parse(readFileSync(join(fx.postsRoot, slug, ".pipeline-state.json"), "utf8"));
    expect(state.sourceUrl).toBe(canonicalUrl);
    expect(state.wechatSourceUrl).toBe(wechatSourceUrl);

    const json = JSON.parse(r.stdout.trim().split("\n").at(-1));
    expect(json.sourceUrl).toBe(canonicalUrl);
    expect(json.wechatSourceUrl).toBe(wechatSourceUrl);
  });
});

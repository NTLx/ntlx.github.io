#!/usr/bin/env bun
/**
 * step3-polish.mjs 回归测试
 *
 * 覆盖 polish 后的 frontmatter 与语义占位符复验。
 */

import { describe, test, expect, afterEach } from "bun:test";
import { mkdirSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const SCRIPT = resolve(import.meta.dir, "../scripts/step3-polish.mjs");
const REPO_ROOT = resolve(import.meta.dir, "../../../..");
const BODY = `
<!-- SLOT_IMG_00_INFOGRAPHIC -->

## 正文

一些测试正文内容。

<!-- SLOT_IMG_01_CORE_TENSION -->

继续展开第一处关键概念。

<!-- SLOT_IMG_02_STAKEHOLDER_MAP -->

继续展开第二处关键关系。

<!-- SLOT_IMG_03_DECISION_FLOW -->

*你怎么看这个问题?*

## 参考资料

> 来源
> https://example.com/source
`;

const BODY_WITH_PLAIN_QUESTION = `
<!-- SLOT_IMG_00_INFOGRAPHIC -->

## 正文

一些测试正文内容。

<!-- SLOT_IMG_01_CORE_TENSION -->

继续展开第一处关键概念。

<!-- SLOT_IMG_02_STAKEHOLDER_MAP -->

继续展开第二处关键关系。

<!-- SLOT_IMG_03_DECISION_FLOW -->

你怎么看这个问题？

## 参考资料

> 来源
> https://example.com/source
`;

function makeFixture() {
  const root = join(tmpdir(), `step3-polish-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const postsRoot = join(root, "posts");
  return { root, postsRoot };
}

function writeDraft(postsRoot, slug, opts = {}) {
  const dir = join(postsRoot, slug);
  mkdirSync(dir, { recursive: true });
  const fm = {
    title: "Step 3 测试文章",
    date: "2026-05-18",
    summary: "用于测试 Step 3 复验。",
    category: "ai-coding",
    blogSlug: "step-three-test",
    coverImage: "cover.png",
    sourceUrl: "https://ntlx.github.io/articles/step-three-test",
    ...(opts.fm ?? {}),
  };
  const frontmatter = Object.entries(fm)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
  writeFileSync(join(dir, "draft.md"), `---\n${frontmatter}\n---\n${opts.body ?? BODY}`);
  return dir;
}

function runStep3(slug, postsRoot) {
  return spawnSync("bun", ["run", SCRIPT, slug], {
    cwd: REPO_ROOT,
    env: { ...process.env, PIPELINE_POSTS_ROOT: postsRoot },
    encoding: "utf8",
  });
}

describe("step3-polish gates", () => {
  let cleanup = [];

  afterEach(() => {
    for (const dir of cleanup) {
      try { rmSync(dir, { recursive: true, force: true }); } catch {}
    }
    cleanup = [];
  });

  test("valid draft with semantic SLOT_IMG placeholder passes", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-valid-step3";
    const dir = writeDraft(fx.postsRoot, slug);

    const r = runStep3(slug, fx.postsRoot);
    expect(r.status).toBe(0);

    const state = JSON.parse(readFileSync(join(dir, ".pipeline-state.json"), "utf8"));
    expect(state.last_complete_step).toBe(3);
    expect(state.blog_slug).toBe("step-three-test");
  });

  test("plain question near the end counts as interaction", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-plain-question-step3";
    const dir = writeDraft(fx.postsRoot, slug, { body: BODY_WITH_PLAIN_QUESTION });

    const r = runStep3(slug, fx.postsRoot);
    expect(r.status).toBe(0);

    const state = JSON.parse(readFileSync(join(dir, ".pipeline-state.json"), "utf8"));
    expect(state.last_complete_step).toBe(3);
  });

  test("missing blogSlug fails after polish", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-missing-blogslug";
    writeDraft(fx.postsRoot, slug, { fm: { blogSlug: undefined } });

    const r = runStep3(slug, fx.postsRoot);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("frontmatter.blogSlug");
  });

  test("sourceUrl must still match blogSlug after polish", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-source-mismatch";
    writeDraft(fx.postsRoot, slug, {
      fm: { sourceUrl: "https://ntlx.github.io/articles/other-slug" },
    });

    const r = runStep3(slug, fx.postsRoot);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("与 blogSlug");
  });

  test("missing SLOT_IMG placeholder fails after polish", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-missing-slot";
    writeDraft(fx.postsRoot, slug, {
      body: `\n## 正文\n\n一些正文内容。\n`,
    });

    const r = runStep3(slug, fx.postsRoot);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("SLOT_IMG");
  });
});

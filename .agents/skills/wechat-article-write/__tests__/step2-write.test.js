#!/usr/bin/env bun
/**
 * step2-write.mjs 回归测试
 *
 * 覆盖 blogSlug/sourceUrl 的硬门控，避免中文 date-slug 发布到 Step 6 才失败。
 */

import { describe, test, expect, afterAll } from "bun:test";
import { mkdirSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const SCRIPT = resolve(import.meta.dir, "../scripts/step2-write.mjs");
const TMP_ROOT = join(tmpdir(), `step2-write-test-${Date.now()}`);
const VALID_BODY = `
<!-- SLOT_IMG_00_INFOGRAPHIC -->

## 正文

一些测试正文内容。

<!-- SLOT_IMG_01_CORE_TENSION -->

继续展开第一处关键概念。

<!-- SLOT_IMG_02_STAKEHOLDER_MAP -->

继续展开第二处关键关系。

<!-- SLOT_IMG_03_DECISION_FLOW -->

*你怎么看这个问题?*

## 原文参考

> 来源
> https://example.com/source
`;

function writeDraft(slug, fmOverrides = {}) {
  const dir = join(TMP_ROOT, slug);
  mkdirSync(dir, { recursive: true });
  const fm = {
    title: "测试文章",
    date: "2026-05-17",
    summary: "用于测试 Step 2 门控。",
    category: "ai-coding",
    blogSlug: "valid-blog-slug",
    coverImage: "cover.png",
    sourceUrl: "https://ntlx.github.io/articles/valid-blog-slug",
    ...fmOverrides,
  };
  const lines = Object.entries(fm)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}: ${v}`);
  writeFileSync(join(dir, "draft.md"), `---\n${lines.join("\n")}\n---\n${VALID_BODY}`);
}

function runStep2(slug) {
  return spawnSync("bun", ["run", SCRIPT, slug], {
    cwd: resolve(import.meta.dir, "../../../.."),
    env: { ...process.env, PIPELINE_POSTS_ROOT: TMP_ROOT },
    encoding: "utf8",
  });
}

function runStep2WithArgs(slug, args = []) {
  return spawnSync("bun", ["run", SCRIPT, slug, ...args], {
    cwd: resolve(import.meta.dir, "../../../.."),
    env: { ...process.env, PIPELINE_POSTS_ROOT: TMP_ROOT },
    encoding: "utf8",
  });
}

function writeBlogMemory(slug, candidates) {
  const dir = join(TMP_ROOT, slug);
  writeFileSync(join(dir, "blog-memory.json"), JSON.stringify({
    slug,
    generated_at: "2026-07-02T00:00:00.000Z",
    query_terms: ["agent", "control"],
    candidates,
  }, null, 2));
}

describe("step2-write blogSlug/sourceUrl gates", () => {
  afterAll(() => {
    try { rmSync(TMP_ROOT, { recursive: true, force: true }); } catch {}
  });

  test("valid blogSlug and matching sourceUrl pass", () => {
    const slug = "2026-05-17-中文标题";
    writeDraft(slug);

    const r = runStep2(slug);
    expect(r.status).toBe(0);

    const state = JSON.parse(readFileSync(join(TMP_ROOT, slug, ".pipeline-state.json"), "utf8"));
    expect(state.last_complete_step).toBe(2);
    expect(state.blog_slug).toBe("valid-blog-slug");
  });

  test("missing blogSlug fails early", () => {
    const slug = "2026-05-17-missing-blog-slug";
    writeDraft(slug, { blogSlug: undefined });

    const r = runStep2(slug);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("frontmatter.blogSlug 缺失");
  });

  test("sourceUrl must match blogSlug", () => {
    const slug = "2026-05-17-source-url-mismatch";
    writeDraft(slug, { sourceUrl: "https://ntlx.github.io/articles/other-slug" });

    const r = runStep2(slug);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("与 blogSlug");
  });

  test("missing SLOT_IMG placeholder fails", () => {
    const slug = "2026-05-17-missing-slot-img";
    const dir = join(TMP_ROOT, slug);
    mkdirSync(dir, { recursive: true });
    const fm = {
      title: "测试文章",
      date: "2026-05-17",
      summary: "用于测试 Step 2 门控。",
      category: "ai-coding",
      blogSlug: "valid-blog-slug",
      coverImage: "cover.png",
      sourceUrl: "https://ntlx.github.io/articles/valid-blog-slug",
    };
    const lines = Object.entries(fm).map(([k, v]) => `${k}: ${v}`);
    writeFileSync(join(dir, "draft.md"), `---\n${lines.join("\n")}\n---\n\n## 正文\n\n一些正文内容。\n`);

    const r = runStep2(slug);
    expect(r.status).toBe(4);
    expect(r.stderr).toContain("SLOT_IMG");
  });

  test("fewer than 3 body illustration slots fails", () => {
    const slug = "2026-05-17-too-few-body-slots";
    const dir = join(TMP_ROOT, slug);
    mkdirSync(dir, { recursive: true });
    const fm = {
      title: "测试文章",
      date: "2026-05-17",
      summary: "用于测试 Step 2 门控。",
      category: "ai-coding",
      blogSlug: "valid-blog-slug",
      coverImage: "cover.png",
      sourceUrl: "https://ntlx.github.io/articles/valid-blog-slug",
    };
    const lines = Object.entries(fm).map(([k, v]) => `${k}: ${v}`);
    writeFileSync(join(dir, "draft.md"), `---\n${lines.join("\n")}\n---\n
<!-- SLOT_IMG_00_INFOGRAPHIC -->

## 正文

<!-- SLOT_IMG_01_CORE_TENSION -->

一些正文内容。

*你怎么看这个问题?*

## 原文参考

> 来源
> https://example.com/source
`);

    const r = runStep2(slug);
    expect(r.status).toBe(4);
    expect(r.stderr).toContain("3 张文内插图");
  });

  test("high-confidence blog memory candidate must be used or explicitly skipped", () => {
    const slug = "2026-05-17-blog-memory-unused";
    writeDraft(slug);
    writeBlogMemory(slug, [{
      slug: "claude-loops-control-rights",
      title: "你不是把任务交给 AI，你是在重新分配控制权",
      url: "https://ntlx.github.io/articles/claude-loops-control-rights",
      score: 12,
      high_confidence: true,
    }]);

    const r = runStep2(slug);
    expect(r.status).toBe(4);
    expect(r.stderr).toContain("站内记忆包");
  });

  test("blog memory candidate URL in draft passes the gate", () => {
    const slug = "2026-05-17-blog-memory-used";
    writeDraft(slug);
    const dir = join(TMP_ROOT, slug);
    let draft = readFileSync(join(dir, "draft.md"), "utf8");
    draft = draft.replace(
      "## 原文参考",
      "## 延伸阅读\n\n- [《你不是把任务交给 AI，你是在重新分配控制权》](https://ntlx.github.io/articles/claude-loops-control-rights)\n\n## 原文参考"
    );
    writeFileSync(join(dir, "draft.md"), draft);
    writeBlogMemory(slug, [{
      slug: "claude-loops-control-rights",
      title: "你不是把任务交给 AI，你是在重新分配控制权",
      url: "https://ntlx.github.io/articles/claude-loops-control-rights",
      score: 12,
      high_confidence: true,
    }]);

    const r = runStep2(slug);
    expect(r.status).toBe(0);
  });

  test("--allow-no-related bypasses blog memory gate and records state", () => {
    const slug = "2026-05-17-blog-memory-skipped";
    writeDraft(slug);
    writeBlogMemory(slug, [{
      slug: "claude-loops-control-rights",
      title: "你不是把任务交给 AI，你是在重新分配控制权",
      url: "https://ntlx.github.io/articles/claude-loops-control-rights",
      score: 12,
      high_confidence: true,
    }]);

    const r = runStep2WithArgs(slug, ["--allow-no-related"]);
    expect(r.status).toBe(0);

    const state = JSON.parse(readFileSync(join(TMP_ROOT, slug, ".pipeline-state.json"), "utf8"));
    expect(state.allow_no_related).toBe(true);
  });
});

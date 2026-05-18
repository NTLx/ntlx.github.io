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
## 正文

${"这是用于满足字数下限的正文内容。".repeat(260)}

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
});

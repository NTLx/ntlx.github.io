#!/usr/bin/env bun
/**
 * publish-blog.mjs 回归测试
 *
 * 覆盖 frontmatter.blogSlug 贯穿、管线字段剥离、--no-push 状态语义。
 */

import { describe, test, expect, afterEach } from "bun:test";
import { mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const SCRIPT = resolve(import.meta.dir, "../scripts/publish-blog.mjs");

function makeFixture() {
  const root = join(tmpdir(), `publish-blog-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const postsRoot = join(root, "posts");
  const repoRoot = join(root, "repo");
  mkdirSync(join(repoRoot, "src/content/docs/articles"), { recursive: true });
  return { root, postsRoot, repoRoot };
}

function writeArticle(postsRoot, slug, fmOverrides = {}) {
  const dir = join(postsRoot, slug);
  mkdirSync(dir, { recursive: true });
  const fm = {
    title: "测试发布文章",
    date: "2026-05-17",
    summary: "用于测试博客发布。",
    category: "ai-coding",
    blogSlug: "frontmatter-blog-slug",
    coverImage: "cover.png",
    sourceUrl: "https://ntlx.github.io/articles/frontmatter-blog-slug",
    ...fmOverrides,
  };
  const lines = Object.entries(fm)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}: ${v}`);
  writeFileSync(join(dir, "article.md"), `---\n${lines.join("\n")}\n---\n\n## 正文\n\n内容。`);
}

function runPublish(args, fixture) {
  return spawnSync("bun", ["run", SCRIPT, ...args], {
    cwd: resolve(import.meta.dir, "../../../.."),
    env: {
      ...process.env,
      PIPELINE_POSTS_ROOT: fixture.postsRoot,
      PIPELINE_REPO_ROOT: fixture.repoRoot,
    },
    encoding: "utf8",
  });
}

describe("publish-blog", () => {
  let cleanup = [];

  afterEach(() => {
    for (const dir of cleanup) {
      try { rmSync(dir, { recursive: true, force: true }); } catch {}
    }
    cleanup = [];
  });

  test("uses frontmatter.blogSlug for Chinese date-slug in dry-run", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const dateSlug = "2026-05-17-中文标题";
    writeArticle(fx.postsRoot, dateSlug);

    const r = runPublish([dateSlug, "--dry-run"], fx);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("frontmatter-blog-slug.md");
    expect(r.stdout).toContain("description:");
    expect(r.stdout).not.toContain("blogSlug:");
    expect(r.stdout).not.toContain("sourceUrl:");
    expect(r.stdout).not.toContain("coverImage:");
  });

  test("fails when sourceUrl does not match effective blog slug", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const dateSlug = "2026-05-17-中文标题";
    writeArticle(fx.postsRoot, dateSlug, {
      sourceUrl: "https://ntlx.github.io/articles/other-slug",
    });

    const r = runPublish([dateSlug, "--dry-run"], fx);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("sourceUrl");
    expect(r.stderr).toContain("不一致");
  });

  test("--no-push writes local file but marks blog blocked", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const dateSlug = "2026-05-17-中文标题";
    writeArticle(fx.postsRoot, dateSlug);

    const r = runPublish([dateSlug, "--no-push", "--no-build"], fx);
    expect(r.status).toBe(0);

    const target = join(fx.repoRoot, "src/content/docs/articles/frontmatter-blog-slug.md");
    expect(existsSync(target)).toBe(true);

    const state = JSON.parse(readFileSync(join(fx.postsRoot, dateSlug, ".pipeline-state.json"), "utf8"));
    expect(state.publish.blog).toBe("blocked");
    expect(state.pushed).toBe(false);
    expect(state.no_push).toBe(true);
    expect(state.local_only).toBe(true);
  });

  test("commits target article even when src/content/docs is ignored", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const dateSlug = "2026-05-17-ignored-docs";
    writeArticle(fx.postsRoot, dateSlug);

    writeFileSync(join(fx.repoRoot, ".gitignore"), "docs/\n");
    expect(spawnSync("git", ["init", "-b", "main"], { cwd: fx.repoRoot }).status).toBe(0);
    expect(spawnSync("git", ["config", "user.email", "test@example.com"], { cwd: fx.repoRoot }).status).toBe(0);
    expect(spawnSync("git", ["config", "user.name", "Test User"], { cwd: fx.repoRoot }).status).toBe(0);

    const r = runPublish([dateSlug, "--no-build"], fx);
    expect(r.status).toBe(0);
    expect(r.stderr).toContain("git push exited");

    const target = join(fx.repoRoot, "src/content/docs/articles/frontmatter-blog-slug.md");
    expect(existsSync(target)).toBe(true);

    const show = spawnSync("git", ["show", "--name-only", "--oneline", "HEAD"], {
      cwd: fx.repoRoot,
      encoding: "utf8",
    });
    expect(show.status).toBe(0);
    expect(show.stdout).toContain("frontmatter-blog-slug.md");

    const state = JSON.parse(readFileSync(join(fx.postsRoot, dateSlug, ".pipeline-state.json"), "utf8"));
    expect(state.publish.blog).toBe("blocked");
    expect(state.pushed).toBe(false);
    expect(state.push_error).toContain("git push exited");
  });
});

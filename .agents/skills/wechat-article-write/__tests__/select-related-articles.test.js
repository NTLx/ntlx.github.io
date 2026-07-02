#!/usr/bin/env bun

import { describe, test, expect, afterEach } from "bun:test";
import { mkdirSync, rmSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const SCRIPT = resolve(import.meta.dir, "../scripts/select-related-articles.mjs");
const REPO_ROOT = resolve(import.meta.dir, "../../../..");

function makeFixture() {
  const root = join(tmpdir(), `related-articles-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const postsRoot = join(root, "posts");
  const articlesRoot = join(root, "src/content/docs/articles");
  mkdirSync(postsRoot, { recursive: true });
  mkdirSync(articlesRoot, { recursive: true });
  return { root, postsRoot, articlesRoot };
}

function writeArticle(articlesRoot, slug, fm, body) {
  const frontmatter = Object.entries(fm).map(([k, v]) => `${k}: ${v}`).join("\n");
  writeFileSync(join(articlesRoot, `${slug}.md`), `---\n${frontmatter}\n---\n\n${body}`);
}

function runSelect(slug, fx, args = []) {
  return spawnSync("bun", ["run", SCRIPT, slug, ...args], {
    cwd: REPO_ROOT,
    env: {
      ...process.env,
      PIPELINE_REPO_ROOT: fx.root,
      PIPELINE_POSTS_ROOT: fx.postsRoot,
    },
    encoding: "utf8",
  });
}

describe("select-related-articles", () => {
  let cleanup = [];

  afterEach(() => {
    for (const dir of cleanup) {
      try { rmSync(dir, { recursive: true, force: true }); } catch {}
    }
    cleanup = [];
  });

  test("writes blog-memory files with relevant published articles", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-07-02-current";
    const postDir = join(fx.postsRoot, slug);
    mkdirSync(postDir, { recursive: true });
    writeFileSync(join(postDir, "materials.md"), [
      "# 材料",
      "",
      "Agent loop control and control rights are the main topic.",
      "",
      "## 背景调研",
      "",
      "- https://example.com/source",
      "",
    ].join("\n"));

    writeArticle(fx.articlesRoot, "claude-loops-control-rights", {
      title: "你不是把任务交给 AI，你是在重新分配控制权",
      description: "Agent loop control rights.",
      date: "2026-06-30",
      category: "ai-agents",
    }, "Agent loop control rights and orchestration.");

    writeArticle(fx.articlesRoot, "unrelated-audio", {
      title: "假无损频谱分析",
      description: "Audio spectrum analysis.",
      date: "2026-05-14",
      category: "engineering",
    }, "Audio spectrum and FLAC files.");

    writeFileSync(join(fx.articlesRoot, "ignored.backup-20260101.md"), "---\ntitle: Ignored\n---\n\nagent control");

    const r = runSelect(slug, fx);
    expect(r.status).toBe(0);

    const jsonPath = join(postDir, "blog-memory.json");
    const mdPath = join(postDir, "blog-memory.md");
    expect(existsSync(jsonPath)).toBe(true);
    expect(existsSync(mdPath)).toBe(true);

    const data = JSON.parse(readFileSync(jsonPath, "utf8"));
    expect(data.candidates[0].slug).toBe("claude-loops-control-rights");
    expect(data.candidates[0].url).toBe("https://ntlx.github.io/articles/claude-loops-control-rights");
    expect(data.candidates.some((c) => c.slug.includes("backup"))).toBe(false);

    const md = readFileSync(mdPath, "utf8");
    expect(md).toContain("站内记忆包");
    expect(md).toContain("claude-loops-control-rights");
  });

  test("fails when materials.md is missing", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    mkdirSync(join(fx.postsRoot, "2026-07-02-missing"), { recursive: true });

    const r = runSelect("2026-07-02-missing", fx);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("materials.md missing");
  });
});

#!/usr/bin/env bun

import { describe, test, expect, afterEach } from "bun:test";
import { mkdirSync, rmSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const SCRIPT = resolve(import.meta.dir, "../scripts/select-related-articles.mjs");
const STEP1 = resolve(import.meta.dir, "../scripts/step1-collect.mjs");
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
  const frontmatter = Object.entries(fm).map(([k, v]) => `${k}: ${Array.isArray(v) ? JSON.stringify(v) : v}`).join("\n");
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

function runStep1(slug, fx) {
  return spawnSync("bun", ["run", STEP1, slug], {
    cwd: REPO_ROOT,
    env: {
      ...process.env,
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

  test("blocks an explicit primary source match and still writes memory artifacts", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-07-02-explicit-source-match";
    const postDir = join(fx.postsRoot, slug);
    mkdirSync(postDir, { recursive: true });
    writeFileSync(join(postDir, "materials.md"), [
      "## 原始来源", "", "- url: https://example.com/source", "",
      "## 背景调研", "", "- https://example.com/context", "",
    ].join("\n"));
    writeArticle(fx.articlesRoot, "already-covered", {
      title: "已有文章", date: "2026-07-01", category: "ai-agents",
      primarySourceUrls: ["https://example.com/source"],
    }, "已有正文。");

    const r = runSelect(slug, fx);
    expect(r.status).toBe(4);
    const data = JSON.parse(readFileSync(join(postDir, "blog-memory.json"), "utf8"));
    expect(data.same_source_matches).toHaveLength(1);
    expect(data.same_source_matches[0].slug).toBe("already-covered");
    expect(readFileSync(join(postDir, "blog-memory.md"), "utf8")).toContain("不得创建新的独立文章");
    expect(existsSync(join(postDir, "draft.md"))).toBe(false);
    expect(existsSync(join(postDir, "cover.png"))).toBe(false);
    expect(existsSync(join(postDir, "imgs"))).toBe(false);
  });

  test("blocks the known GitHub source after Step 1 and before drafting", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-09-05-known-github-source";
    const postDir = join(fx.postsRoot, slug);
    mkdirSync(postDir, { recursive: true });
    writeFileSync(join(postDir, ".pipeline-state.json"), JSON.stringify({
      slug, strategy: "reader-response", last_complete_step: 0,
      publish: { blog: "pending", wechat: "pending" }, failed_step: null,
    }) + "\n");
    const source = "https://github.blog/ai-and-ml/github-copilot/how-we-make-ai-coding-more-cost-efficient-without-sacrificing-task-quality/";
    writeFileSync(join(postDir, "materials.md"), [
      "# 原始材料", "", "## 原始来源", "", `- url: ${source}`, "",
      "## 背景调研", "", "- https://example.com/context", "",
    ].join("\n"));
    writeArticle(fx.articlesRoot, "github-copilot-cost-efficient-agent-tasks", {
      title: "省下 token 之前", date: "2026-09-04", category: "ai-coding",
      primarySourceUrls: [source],
    }, "已有正文。");

    const step1 = runStep1(slug, fx);
    expect(step1.status, step1.stderr || step1.stdout).toBe(0);
    const select = runSelect(slug, fx);
    expect(select.status).toBe(4);
    expect(select.stderr).toContain("BLOCKED");
    expect(existsSync(join(postDir, "blog-memory.json"))).toBe(true);
    expect(existsSync(join(postDir, "blog-memory.md"))).toBe(true);
    expect(existsSync(join(postDir, "draft.md"))).toBe(false);
    expect(existsSync(join(postDir, "cover.png"))).toBe(false);
    expect(existsSync(join(postDir, "imgs"))).toBe(false);
    expect(existsSync(join(postDir, "article.md"))).toBe(false);
    expect(existsSync(join(postDir, "article-wechat.html"))).toBe(false);
  });

  test("uses the first reference item for legacy matching", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-07-02-legacy-source-match";
    const postDir = join(fx.postsRoot, slug);
    mkdirSync(postDir, { recursive: true });
    writeFileSync(join(postDir, "materials.md"), [
      "## 原始来源", "", "- url: https://example.com/source", "",
      "## 背景调研", "", "- https://example.com/context", "",
    ].join("\n"));
    writeArticle(fx.articlesRoot, "legacy-covered", {
      title: "旧文章", date: "2026-07-01", category: "ai-agents",
    }, "## 参考资料\n\n- [原始来源](https://example.com/source)\n- [补充资料](https://example.com/other)");

    const r = runSelect(slug, fx);
    expect(r.status).toBe(4);
    const data = JSON.parse(readFileSync(join(postDir, "blog-memory.json"), "utf8"));
    expect(data.same_source_matches[0].provenance).toBe("legacy-first-reference");
  });

  test("does not treat supporting references as primary source matches", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-07-02-supporting-source";
    const postDir = join(fx.postsRoot, slug);
    mkdirSync(postDir, { recursive: true });
    writeFileSync(join(postDir, "materials.md"), [
      "## 原始来源", "", "- url: https://example.com/supporting", "",
      "## 背景调研", "", "- https://example.com/context", "",
    ].join("\n"));
    writeArticle(fx.articlesRoot, "primary-a", {
      title: "主来源 A", date: "2026-07-01", category: "ai-agents",
      primarySourceUrls: ["https://example.com/primary"],
    }, "## 参考资料\n\n- [补充资料](https://example.com/supporting)");

    const r = runSelect(slug, fx);
    expect(r.status).toBe(0);
    const data = JSON.parse(readFileSync(join(postDir, "blog-memory.json"), "utf8"));
    expect(data.same_source_matches).toEqual([]);
  });

  test("explicit metadata overrides a conflicting legacy reference", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-07-02-explicit-over-legacy";
    const postDir = join(fx.postsRoot, slug);
    mkdirSync(postDir, { recursive: true });
    writeFileSync(join(postDir, "materials.md"), [
      "## 原始来源", "", "- url: https://example.com/legacy", "",
      "## 背景调研", "", "- https://example.com/context", "",
    ].join("\n"));
    writeArticle(fx.articlesRoot, "explicit-primary", {
      title: "显式来源", date: "2026-07-01", category: "ai-agents",
      primarySourceUrls: ["https://example.com/authoritative"],
    }, "## 参考资料\n\n- [旧引用](https://example.com/legacy)");

    const r = runSelect(slug, fx);
    expect(r.status).toBe(0);
    const data = JSON.parse(readFileSync(join(postDir, "blog-memory.json"), "utf8"));
    expect(data.same_source_matches).toEqual([]);
  });
});

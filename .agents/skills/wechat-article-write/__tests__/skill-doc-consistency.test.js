#!/usr/bin/env bun
/**
 * Static checks for wechat-article-write skill documentation.
 *
 * These are not pressure scenarios; they prevent documented invariants from
 * drifting across SKILL.md, EXTEND.md, and strategy references.
 */

import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const SKILL_DIR = resolve(import.meta.dir, "..");
const REPO_ROOT = resolve(SKILL_DIR, "../../..");

function read(rel) {
  return readFileSync(resolve(SKILL_DIR, rel), "utf8");
}

function readRepo(rel) {
  return readFileSync(resolve(REPO_ROOT, rel), "utf8");
}

function frontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  return match?.[1] ?? "";
}

describe("wechat-article-write documentation consistency", () => {
  test("SKILL.md stays a short routing entry and description only states triggers", () => {
    const skill = read("SKILL.md");
    const fm = frontmatter(skill);
    const description = fm.match(/description:\s*>\n([\s\S]*?)(?:\n\w|$)/)?.[1] ?? "";
    const lineCount = skill.trimEnd().split(/\r?\n/).length;

    expect(lineCount).toBeLessThanOrEqual(140);
    expect(description).toContain("Use when");
    expect(description).not.toMatch(/6-stage|6 步|pipeline:|collect\s*→|write\s*→|polish\s*→|publishes|produces a complete article/i);
  });

  test("strategy files do not reintroduce the old one-image-per-H2 rule", () => {
    for (const rel of [
      "references/strategies/reader-response.md",
      "references/strategies/tutorial.md",
      "references/strategies/news-digest.md",
    ]) {
      const text = read(rel);
      expect(text).not.toMatch(/每个\s*`?##\s*`?\s*章节必须有一个\s*SLOT_IMG|每个.*章节必须.*SLOT_IMG/);
      expect(text).not.toMatch(/紧跟在\s*`?##\s*`?\s*标题之后|紧跟在.*章节正文之前/);
      expect(text).toMatch(/(?:至少|不少于)\s*3\s*张\s*文内|文内[\s\S]{0,40}(?:至少|不少于)\s*3\s*张/);
      expect(text).toContain("SLOT_IMG_00");
    }
  });

  test("EXTEND.md and dependency manifest use project-level configuration paths", () => {
    const extend = read("EXTEND.md");
    const manifestPath = resolve(SKILL_DIR, "references/dependency-manifest.md");
    expect(existsSync(manifestPath)).toBe(true);
    const manifest = read("references/dependency-manifest.md");

    expect(extend).not.toContain("~/.baoyu-skills");
    expect(extend).toContain(".baoyu-skills/.env");
    expect(manifest).toContain(".baoyu-skills/.env");
    expect(manifest).toContain("gpt-image-2");
    expect(manifest).toContain("文生图模板");
    expect(manifest).toContain("renwei-writing");
  });

  test("image backend docs prefer Codex CLI and keep baoyu fallback explicit", () => {
    const policy = read("references/image-policy.md");
    const backends = read("references/image-backends.md");

    expect(policy).toContain("--provider codex-cli");
    expect(policy).toContain("preferred_image_backend");
    expect(backends).toContain("codex-cli");
    expect(backends).toContain("baoyu fallback");
    expect(backends).not.toContain("固定使用 OpenAI");
    expect(backends).not.toContain("不要把 Google");
  });

  test("image docs ban batch mode and cover stale Codex CLI lock recovery", () => {
    const policy = read("references/image-policy.md");
    const backends = read("references/image-backends.md");
    const troubleshooting = read("references/troubleshooting.md");

    expect(policy).toContain("batch.json");
    expect(policy).toContain("禁止 batch 模式");
    expect(policy).toContain("craft-handmade");
    expect(policy).not.toContain("若手工使用 `--batchfile`");
    expect(backends).toContain("codex-exec.lock");
    expect(troubleshooting).toContain("lock_busy");
    expect(troubleshooting).toContain("prompt/image basename mismatch");
    expect(troubleshooting).toContain("/home/lx/.cache/baoyu-codex-imagegen/codex-exec.lock");
  });

  test("strategies that skip interaction pass the explicit Step 2 flag", () => {
    const tutorial = read("references/strategies/tutorial.md");
    const newsDigest = read("references/strategies/news-digest.md");

    expect(tutorial).toContain("--allow-no-interaction");
    expect(newsDigest).toContain("--allow-no-interaction");
  });

  test("image template catalog documents craft-handmade as the default infographic style", () => {
    const catalog = read("references/image-template-catalog.md");

    expect(catalog).toContain("SLOT 00 信息图默认 style 为 `craft-handmade`");
    expect(catalog).toContain("direction 只影响文内插图 style");
    expect(catalog).not.toContain("默认组合来自 `article_type_defaults.infoLayout` × `style_families.{family}.infoStyle`");
    expect(catalog).not.toMatch(/style:\s*(?:morandi-journal|technical-schematic|ikea-manual|retro-pop-grid|bold-graphic|aged-academia)/);
  });

  test("image docs define SLOT 00 as a whole-article compression asset", () => {
    const skill = read("SKILL.md");
    const policy = read("references/image-policy.md");

    expect(skill).toContain("全文压缩信息图");
    expect(policy).toContain("全文速读版");
    expect(policy).toContain("不是文内局部插图");
    expect(policy).toContain("核心论点");
    expect(policy).toContain("论证路径");
    expect(policy).toContain("最终结论");
  });

  test("content invariants document targetPath sourceUrl exception", () => {
    const invariants = read("references/content-invariants.md");

    expect(invariants).toContain("targetPath");
    expect(invariants).toContain("教程");
    expect(invariants).toContain("sourceUrl");
  });

  test("golden path shows cover and core-summary infographic serial generation", () => {
    const goldenPath = read("references/golden-path.md");

    expect(goldenPath).toContain("00-cover-example-article.md");
    expect(goldenPath).toContain("cover.png");
    expect(goldenPath).toContain("00-infographic-core-summary.md");
    expect(goldenPath).toContain("00-infographic-core-summary.png");
    expect(goldenPath).toContain("不要使用 batch.json");
  });

  test("resume and split docs point to current behavior and references", () => {
    const publishBlog = read("scripts/publish-blog.mjs");
    const readerResponse = read("references/strategies/reader-response.md");

    expect(publishBlog).not.toContain("依赖 sourceUrl HTTP 200，未执行");
    expect(publishBlog).toContain("默认可跳过 sourceUrl 探活");
    expect(readerResponse).not.toContain("SKILL.md 的 Split Decision");
    expect(readerResponse).toContain("references/pipeline-overview.md");
  });

  test("dependency docs resolve third-party skills from project skill directory first", () => {
    const manifest = read("references/dependency-manifest.md");

    expect(manifest).toContain(".agents/skills/<skill>");
    expect(manifest).toContain("baoyu-format-markdown");
    expect(manifest).toContain("不要硬编码");
    expect(manifest).toContain("~/.claude/skills");
  });

  test("project agent docs explain Tavily quota fallback", () => {
    const agents = readRepo("AGENTS.md");

    expect(agents).toContain("anysearch");
    expect(agents).toContain("432");
    expect(agents).toContain("Tavily");
    expect(agents).toContain("Exa");
  });

  test("docs do not require source-url patch checks owned by baoyu-post-to-wechat", () => {
    for (const rel of [
      "SKILL.md",
      "references/publishing.md",
      "references/troubleshooting.md",
      "scripts/publish-wechat.mjs",
    ]) {
      const text = read(rel);
      expect(text).not.toMatch(/source-url patch|原文链接补丁/i);
    }
  });
});

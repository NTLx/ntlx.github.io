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
      "references/strategy-reader-response.md",
      "references/strategy-tutorial.md",
      "references/strategy-news-digest.md",
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
    expect(extend).toContain("wechat_layout_default_theme");
    expect(extend).toContain("zen-whitespace");
    expect(manifest).toContain(".baoyu-skills/.env");
    expect(manifest).toContain("gpt-image-2");
    expect(manifest).toContain("文生图模板");
    expect(manifest).toContain("renwei-writing");
    expect(manifest).toContain("gzh-design");
  });

  test("image-policy defers backend policy to image-backends owner instead of duplicating it", () => {
    const policy = read("references/image-policy.md");
    const backends = read("references/image-backends.md");

    // policy 只保留执行细节，后端顺序/失败判定引用唯一 owner
    expect(policy).toContain("references/image-backends.md");
    expect(policy).toContain("（唯一 owner）");
    expect(policy).toContain("--provider codex-cli");
    expect(policy).toContain("preferred_image_backend");
    // policy 不再全文重复后端策略硬规则
    expect(policy).not.toContain("Codex CLI 可用时，它是唯一首选文生图后端");
    // backends 仍是后端策略真身
    expect(backends).toContain("Codex CLI 可用时，它是唯一首选文生图后端");
    expect(backends).toContain("preferred_image_backend 只定义 Codex CLI 明确失败后的 baoyu fallback");
    expect(backends).toContain("不得因为当前 Agent 自带 image generation 工具就改走该工具");
    expect(backends).not.toContain("固定使用 OpenAI");
    expect(backends).not.toContain("不要把 Google");
  });

  test("image docs ban batch mode and cover stale Codex CLI lock recovery", () => {
    const policy = read("references/image-policy.md");
    const backends = read("references/image-backends.md");
    const troubleshooting = read("references/troubleshooting.md");

    expect(policy).toContain("batch.json");
    expect(policy).toContain("禁止 batch 模式");
    expect(policy).toContain("禁止 `Promise.all`");
    expect(policy).toContain("禁止 `xargs -P`");
    expect(policy).toContain("禁止后台任务 `&`");
    expect(policy).toContain("不得把多张图片分派给多个 subagent");
    expect(policy).toContain("claymation");
    expect(policy).not.toContain("若手工使用 `--batchfile`");
    expect(backends).toContain("必须逐张串行完成");
    expect(backends).toContain("禁止并发启动多个 `baoyu-image-gen` / `codex exec`");
    expect(backends).toContain("不是性能优化空间");
    expect(backends).toContain("codex-exec.lock");
    expect(troubleshooting).toContain("lock_busy");
    expect(troubleshooting).toContain("prompt/image basename mismatch");
    expect(troubleshooting).toContain("/home/lx/.cache/baoyu-codex-imagegen/codex-exec.lock");
  });

  test("strategies that skip interaction pass the explicit Step 2 flag", () => {
    const tutorial = read("references/strategy-tutorial.md");
    const newsDigest = read("references/strategy-news-digest.md");

    expect(tutorial).toContain("--allow-no-interaction");
    expect(newsDigest).toContain("--allow-no-interaction");
  });

  test("image template catalog documents claymation as the default infographic style", () => {
    const catalog = read("references/image-template-catalog.md");

    expect(catalog).toContain("SLOT 00 信息图默认 style 为 `claymation`");
    expect(catalog).toContain("direction 只影响文内插图 style");
    expect(catalog).not.toContain("默认组合来自 `article_type_defaults.infoLayout` × `style_families.{family}.infoStyle`");
    expect(catalog).not.toMatch(/style:\s*(?:craft-handmade|morandi-journal|technical-schematic|ikea-manual|retro-pop-grid|bold-graphic|aged-academia)/);
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
    const readerResponse = read("references/strategy-reader-response.md");

    expect(publishBlog).not.toContain("依赖 sourceUrl HTTP 200，未执行");
    expect(publishBlog).toContain("默认可跳过 sourceUrl 探活");
    expect(readerResponse).not.toContain("SKILL.md 的 Split Decision");
    expect(readerResponse).toContain("references/pipeline-overview.md");
  });

  test("reader-response documents the mandatory understanding enhancement stage", () => {
    const skill = read("SKILL.md");
    const overview = read("references/pipeline-overview.md");
    const readerResponse = read("references/strategy-reader-response.md");
    const understanding = read("references/material-understanding.md");

    expect(skill).toContain("references/material-understanding.md");
    expect(overview).toContain("Step 1.8");
    expect(overview).toContain("understanding-brief.md");
    expect(readerResponse).toContain("Step 1.8");
    expect(readerResponse).toContain("understanding-brief.md");
    expect(readerResponse).toContain("ljg-qa");
    expect(readerResponse).toContain("ljg-think");
    expect(readerResponse).toContain("ljg-constraint");
    expect(readerResponse).toContain("写作契约");
    expect(understanding).toContain("强制调用");
    expect(understanding).toContain("ljg-qa");
    expect(understanding).toContain("ljg-think");
    expect(understanding).toContain("ljg-constraint");
    expect(understanding).toContain("条件强制");
    expect(understanding).toContain("约束与解空间");
    expect(understanding).toContain("写作契约");
  });

  test("dependency docs resolve third-party skills from project skill directory first", () => {
    const manifest = read("references/dependency-manifest.md");

    expect(manifest).toContain(".agents/skills/<skill>");
    expect(manifest).toContain("ljg-constraint");
    expect(manifest).toContain("baoyu-format-markdown");
    expect(manifest).toContain("不要硬编码");
    expect(manifest).toContain("~/.claude/skills");
  });

  test("project agent docs explain Tavily quota fallback", () => {
    const agents = readRepo("AGENTS.md").toLowerCase();

    expect(agents).toContain("anysearch");
    expect(agents).toContain("432");
    expect(agents).toContain("tavily");
    expect(agents).toContain("exa");
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

  test("skill docs route agents through the gzh-design WeChat layout reference", () => {
    const skill = read("SKILL.md");
    const publishing = read("references/publishing.md");

    expect(skill).toContain("references/adapter-gzh-design.md");
    expect(publishing).toContain("article-wechat-source.md");
  });

  // Golden behavior G4: news-digest 不调用 ljg-writes；aihot 承担候选发现
  test("news-digest strategy forbids ljg-writes and uses aihot for discovery", () => {
    const nd = read("references/strategy-news-digest.md");

    expect(nd).toContain("禁止调用 `ljg-writes`");
    expect(nd).toContain("aihot");
    expect(nd).toContain("候选发现");
    expect(nd).toContain("核验事实");
    // last30days 只做社区讨论/反馈，不承担候选发现
    expect(nd).not.toMatch(/last30days[\s\S]{0,60}候选发现/);
  });

  // Golden behavior G6: agent 初稿不强制 renwei-writing；lint 先行，humanizer 仅按需定点修复
  test("reader-response routes Step 3 by source provenance and lints before humanizing", () => {
    const rr = read("references/strategy-reader-response.md");
    const skill = read("SKILL.md");

    expect(rr).toContain("source_provenance");
    expect(rr).toContain("material 是人类手稿");
    expect(rr).toContain("material 是 agent 初稿");
    expect(rr).toContain("不默认调用 renwei-writing");
    expect(rr).toContain("确定性 style lint");
    expect(rr).toContain("只对**命中的片段**");
    expect(rr).toContain("humanizer-zh");
    // 不再要求“必须调用 renwei-writing”的强制文案
    expect(rr).not.toContain("不得以任何理由");
    expect(rr).not.toContain("未调用 renwei-writing = 违反硬规则");
    // SKILL.md 硬规则表同步了来源路由
    expect(skill).toContain("后处理路由");
  });
});

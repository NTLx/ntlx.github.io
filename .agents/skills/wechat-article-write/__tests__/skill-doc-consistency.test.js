#!/usr/bin/env bun
/**
 * Documentation and policy contracts for wechat-article-write.
 */

import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { HARD_SKILLS } from "../scripts/workflow.mjs";

const SKILL_DIR = resolve(import.meta.dir, "..");
const REPO_ROOT = resolve(SKILL_DIR, "../../..");

function read(rel) {
  return readFileSync(resolve(SKILL_DIR, rel), "utf8");
}

function readRepo(rel) {
  return readFileSync(resolve(REPO_ROOT, rel), "utf8");
}

describe("wechat-article-write documentation consistency", () => {
  test("SKILL.md is a short routing entry and description only states triggers", () => {
    const skill = read("SKILL.md");
    const lineCount = skill.trimEnd().split(/\r?\n/).length;
    expect(lineCount).toBeLessThanOrEqual(140);
    expect(skill).toContain("Use when");
    expect(skill).not.toMatch(/ljg-(?:qa|think|writes)|renwei-writing/);
    expect(skill).toContain("orchestration-policy.md");
    expect(skill).toContain("no-skill");
  });

  test("all three strategies define objectives without fixed Skill chains", () => {
    for (const rel of [
      "references/strategy-reader-response.md",
      "references/strategy-tutorial.md",
      "references/strategy-news-digest.md",
    ]) {
      const text = read(rel);
      expect(text).toContain("Objective Function");
      expect(text).toContain("catalog");
      expect(text).toContain("可以为零");
      expect(text).toContain("SLOT 00");
      expect(text).not.toMatch(/禁止调用|固定调用|ljg-|renwei-writing/);
      expect(text).toContain("humanizer-zh");
    }
  });

  test("understanding docs specify quality, not a producer Skill", () => {
    const understanding = read("references/material-understanding.md");
    expect(understanding).toContain("当前真正的认知缺口");
    expect(understanding).toContain("no-skill");
    expect(understanding).toContain("## 约束与解空间");
    expect(understanding).toContain("## 写作契约");
    expect(understanding).toContain("至少三条");
    expect(understanding).not.toMatch(/强制调用|条件强制|ljg-|renwei-writing|humanizer-zh/);
  });

  test("orchestration policy covers observe, gap, discovery, delegation and reroute", () => {
    const policy = read("references/orchestration-policy.md");
    for (const term of ["Observe", "Define Gap", "Discover", "Select", "Delegate", "Verify", "Adapt"]) {
      expect(policy).toContain(term);
    }
    expect(policy).toContain("no-skill");
    expect(policy).toContain("skill-catalog.mjs --json");
    expect(policy).toContain("Gate 失败");
    expect(policy).toContain("default_provider");
    expect(policy).toContain("codex-cli");
    expect(policy).toContain("orchestration-trace.mjs");
    expect(policy).toContain("trace 写盘失败");
    expect(policy).not.toMatch(/自动切换.*(?:OpenAI|Google|DashScope)|付费 API fallback/i);
  });

  test("dependency manifest lists hard adapters only", () => {
    const manifest = read("references/dependency-manifest.md");
    expect(existsSync(resolve(SKILL_DIR, "references/dependency-manifest.md"))).toBe(true);
    for (const name of ["baoyu-image-gen", "github-image-hosting", "gzh-design", "baoyu-post-to-wechat"]) {
      expect(manifest).toContain(name);
    }
    for (const name of ["ljg-qa", "ljg-think", "ljg-writes", "renwei-writing"]) {
      expect(manifest).not.toContain(name);
    }
    expect(manifest).toContain("humanizer-zh");
    expect(manifest).toContain("动态发现");
    expect(manifest).toContain(".agents/skills/<skill>");
    expect(manifest).toContain(".baoyu-skills/.env");
  });

  test("image policy has one backend owner and no paid fallback route", () => {
    const policy = read("references/image-policy.md");
    const backends = read("references/image-backends.md");
    expect(policy).toContain("references/image-backends.md");
    expect(policy).toContain("baoyu-image-gen → codex-cli");
    expect(backends).toContain("default_provider: codex-cli");
    expect(backends).toContain("禁止自动或手动 fallback");
    expect(backends).toContain("Codex CLI 不可用或未登录即阻塞");
    expect(backends).not.toContain("preferred_image_backend 只定义 Codex CLI 明确失败后的 baoyu fallback");
    expect(backends).not.toMatch(/--provider\s+<[^>]+>/);
  });

  test("image docs preserve serial generation and SLOT 00 semantics", () => {
    const policy = read("references/image-policy.md");
    const backends = read("references/image-backends.md");
    const troubleshooting = read("references/troubleshooting.md");
    expect(policy).toContain("batch.json");
    expect(policy).toContain("禁止 `Promise.all`");
    expect(policy).toContain("禁止 `xargs -P`");
    expect(policy).toContain("禁止后台任务");
    expect(policy).toContain("可以为零");
    expect(policy).toContain("全文压缩");
    expect(backends).toContain("逐张串行");
    expect(backends).toContain("codex-exec.lock");
    expect(troubleshooting).toContain("lock_busy");
  });

  test("project configuration uses the current provider schema", () => {
    const imageGen = readRepo(".baoyu-skills/baoyu-image-gen/EXTEND.md");
    const illustrator = readRepo(".baoyu-skills/baoyu-article-illustrator/EXTEND.md");
    const infographic = readRepo(".baoyu-skills/baoyu-infographic/EXTEND.md");
    const cover = readRepo(".baoyu-skills/baoyu-cover-image/EXTEND.md");
    expect(imageGen).toContain("default_provider: codex-cli");
    expect(imageGen).not.toContain("preferred_image_backend");
    for (const text of [illustrator, infographic, cover]) {
      expect(text).toContain("preferred_image_backend: baoyu-image-gen");
    }
    expect(illustrator).toContain("preferred_style:");
  });

  test("content and publishing docs retain the dual-track protocol", () => {
    const skill = read("SKILL.md");
    const overview = read("references/pipeline-overview.md");
    const invariants = read("references/content-invariants.md");
    const publishing = read("references/publishing.md");
    for (const text of [skill, overview, invariants, publishing]) {
      expect(text).toContain("article-wechat-source.md");
      expect(text).toContain("sourceUrl");
    }
    expect(invariants).toContain("targetPath");
    expect(overview).toContain("博客先行");
    expect(overview).toContain("HTML finalize");
  });

  test("agent docs retain current network-source guidance", () => {
    const agents = readRepo("AGENTS.md").toLowerCase();
    expect(agents).toContain("anysearch");
    expect(agents).toContain("432");
    expect(agents).toContain("tavily");
    expect(agents).toContain("exa");
  });

  test("agent governance dependency cache matches workflow source", () => {
    const agents = readRepo(".agents/AGENTS.md");
    const line = agents.split(/\r?\n/u).find((entry) => entry.startsWith("- **核心工程依赖**"));
    expect(line).toBeString();
    const documented = [...(line ?? "").matchAll(/`([^`]+)`/gu)].map(([_, name]) => name);
    expect(documented).toEqual(HARD_SKILLS);
  });
});

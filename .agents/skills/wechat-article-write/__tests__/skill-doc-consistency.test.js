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

function read(rel) {
  return readFileSync(resolve(SKILL_DIR, rel), "utf8");
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
});

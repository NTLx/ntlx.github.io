#!/usr/bin/env bun

import { describe, expect, test } from "bun:test";
import {
  extractPrimarySourceUrlsFromMaterials,
  findSameSourceMatches,
  inferLegacyPrimarySource,
  normalizeSourceUrl,
  parsePrimarySourceUrlsFrontmatter,
} from "../scripts/source-provenance-lib.mjs";

describe("source provenance", () => {
  test("normalizes trailing slashes and fragments", () => {
    expect(normalizeSourceUrl("https://example.com/a")).toBe(normalizeSourceUrl("https://example.com/a/#section"));
  });

  test("normalizes scheme and host casing without lower-casing the path", () => {
    expect(normalizeSourceUrl("HTTPS://EXAMPLE.COM/A")).toBe(normalizeSourceUrl("http://example.com/A"));
    expect(normalizeSourceUrl("https://example.com/A")).not.toBe(normalizeSourceUrl("https://example.com/a"));
  });

  test("removes tracking parameters but keeps meaningful query differences", () => {
    expect(normalizeSourceUrl("https://example.com/a?utm_source=x")).toBe(normalizeSourceUrl("https://example.com/a"));
    expect(normalizeSourceUrl("https://example.com/a?a=1&b=2")).toBe(normalizeSourceUrl("https://example.com/a?b=2&a=1"));
    expect(normalizeSourceUrl("https://example.com/a?id=1")).not.toBe(normalizeSourceUrl("https://example.com/a?id=2"));
  });

  test("extracts and deduplicates only URL entries in 原始来源", () => {
    const materials = [
      "## 原始来源",
      "",
      "- url: https://example.com/a#part",
      "- file: paper.pdf",
      "- url: https://example.com/a/?utm_medium=mail",
      "",
      "## 背景调研",
      "",
      "- https://example.com/supporting",
    ].join("\n");
    expect(extractPrimarySourceUrlsFromMaterials(materials)).toEqual(["https://example.com/a"]);
  });

  test("parses only a valid inline JSON-compatible URL array", () => {
    expect(parsePrimarySourceUrlsFrontmatter('["https://example.com/a#x", "https://example.com/a/"]'))
      .toEqual(["https://example.com/a"]);
    expect(() => parsePrimarySourceUrlsFrontmatter("- https://example.com/a")).toThrow();
    expect(() => parsePrimarySourceUrlsFrontmatter('["file:paper.pdf"]')).toThrow();
  });

  test("infers only the first legacy reference item", () => {
    const article = [
      "## 参考资料",
      "",
      "- [Primary](https://example.com/primary)",
      "- [Supporting](https://example.com/supporting)",
    ].join("\n");
    expect(inferLegacyPrimarySource(article)).toEqual({
      url: "https://example.com/primary",
      normalizedUrl: "https://example.com/primary",
      provenance: "legacy-first-reference",
    });
  });

  test("does not infer a site link or image CDN as legacy primary source", () => {
    const article = "## 参考资料\n\n- [站内](https://ntlx.github.io/articles/old)\n- [外部](https://example.com/primary)";
    expect(inferLegacyPrimarySource(article)).toBeNull();
    expect(inferLegacyPrimarySource("## 参考资料\n\n- https://cdn.jsdelivr.net/gh/example/image.png")).toBeNull();
  });

  test("matches exact normalized identities and reports provenance", () => {
    const matches = findSameSourceMatches(
      ["https://example.com/a?utm_campaign=x"],
      [
        {
          slug: "explicit-article",
          title: "Explicit",
          primarySourceUrls: ["https://example.com/a"],
          primarySourceProvenance: "frontmatter",
        },
        {
          slug: "legacy-article",
          title: "Legacy",
          primarySourceUrls: ["https://example.com/a"],
          primarySourceProvenance: "legacy-first-reference",
        },
      ],
    );
    expect(matches.map((item) => item.slug)).toEqual(["explicit-article", "legacy-article"]);
    expect(matches[1].provenance).toBe("legacy-first-reference");
  });

  test("detects the known GitHub Blog source in both historical article fixtures", () => {
    const source = "https://github.blog/ai-and-ml/github-copilot/how-we-make-ai-coding-more-cost-efficient-without-sacrificing-task-quality/";
    const matches = findSameSourceMatches([source], [
      { slug: "github-copilot-cost-efficient-agent-tasks", title: "省下 token 之前", primarySourceUrls: [source] },
      { slug: "github-copilot-task-closure-cost", title: "AI Agent 省下 token 之后", primarySourceUrls: [source] },
    ]);
    expect(matches.map((item) => item.article_slug)).toEqual([
      "github-copilot-cost-efficient-agent-tasks",
      "github-copilot-task-closure-cost",
    ]);
  });
});

#!/usr/bin/env bun

import { describe, test, expect } from "bun:test";
import {
  normalizeLinksForWechat,
  stripWechatAnchors,
} from "../scripts/wechat-link-normalizer.mjs";

describe("wechat-link-normalizer", () => {
  test("inline markdown links become pure text with URL", () => {
    const input = "这和 [《旧文》](https://ntlx.github.io/articles/old-post) 里的判断有关。";
    const output = normalizeLinksForWechat(input);
    expect(output).toContain("《旧文》（链接：https://ntlx.github.io/articles/old-post）");
    expect(output).not.toContain("](");
  });

  test("standalone list links become title plus visible URL", () => {
    const input = [
      "## 延伸阅读",
      "",
      "- [《旧文》](https://ntlx.github.io/articles/old-post)",
      "",
    ].join("\n");
    const output = normalizeLinksForWechat(input);
    expect(output).toContain("- 《旧文》");
    expect(output).toContain("https://ntlx.github.io/articles/old-post");
    expect(output).not.toContain("[《旧文》]");
  });

  test("reference list links become title line plus plain URL line without bullet in wechat output", () => {
    const input = [
      "## 原文参考",
      "",
      "- [OpenAI 发布会直播](https://example.com/source)",
      "",
    ].join("\n");
    const output = normalizeLinksForWechat(input);
    expect(output).toContain("OpenAI 发布会直播\nhttps://example.com/source");
    expect(output).not.toContain("- OpenAI 发布会直播");
    expect(output).not.toContain("[OpenAI 发布会直播]");
  });

  test("images are not converted as links", () => {
    const input = "![图](imgs/01-detail.png)";
    const output = normalizeLinksForWechat(input);
    expect(output).toContain("![图](imgs/01-detail.png)");
  });

  test("links inside code remain unchanged as code text", () => {
    const input = "`[x](https://example.com)`";
    const output = normalizeLinksForWechat(input);
    expect(output).toContain("`[x](https://example.com)`");
  });

  test("bare URLs remain plain URLs without duplicated link labels", () => {
    const input = "来源：https://example.com/source";
    const output = normalizeLinksForWechat(input);
    expect(output).toContain("https://example.com/source");
    expect(output).not.toContain("https://example.com/source（链接：https://example.com/source）");
  });

  test("stripWechatAnchors removes autolink anchors while preserving URL text", () => {
    const html = '<p>来源：<a href="https://example.com">https://example.com</a></p>';
    const output = stripWechatAnchors(html);
    expect(output).toBe("<p>来源：https://example.com</p>");
  });

  test("stripWechatAnchors keeps linked label and URL when label differs", () => {
    const html = '<p><a href="https://example.com/post">Example Post</a></p>';
    const output = stripWechatAnchors(html);
    expect(output).toBe("<p>Example Post（链接：https://example.com/post）</p>");
  });

  test("combined markdown and html normalization leaves no href anchors", () => {
    const md = "读 [Example](https://example.com/post) 和 https://example.com/raw";
    const normalized = normalizeLinksForWechat(md);
    const htmlLike = `<p>${normalized.replace("https://example.com/raw", '<a href="https://example.com/raw">https://example.com/raw</a>')}</p>`;
    const stripped = stripWechatAnchors(htmlLike);
    expect(stripped).not.toMatch(/<a\b[^>]*href=/i);
    expect(stripped).toContain("Example（链接：https://example.com/post）");
    expect(stripped).toContain("https://example.com/raw");
  });
});

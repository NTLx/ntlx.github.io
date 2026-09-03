#!/usr/bin/env bun

import { describe, test, expect } from "bun:test";
import { normalizeLinksForWechat } from "../scripts/wechat-link-normalizer.mjs";

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

  test("reference list links stay as list items with title plus plain URL in wechat output", () => {
    const input = [
      "## 参考资料",
      "",
      "- [OpenAI 发布会直播](https://example.com/source)",
      "",
    ].join("\n");
    const output = normalizeLinksForWechat(input);
    expect(output).toContain("- OpenAI 发布会直播");
    expect(output).toContain("https://example.com/source");
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

});

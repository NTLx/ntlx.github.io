#!/usr/bin/env bun
/** Structural parity tests for the gzh-design adapter boundary. */

import { describe, expect, test } from "bun:test";
import { validateWechatStructuralParity } from "../scripts/wechat-structure-lib.mjs";

const source = `---
title: 结构测试
---

![](imgs/00-infographic-core-summary.png)

## A

![](imgs/01-a.png)

## B

![](imgs/02-b.png)
`;

function html(images, headings = ["A", "B"]) {
  const parts = ['<section style="max-width:720px;">'];
  if (images[0]) parts.push(`<p><img src="${images[0]}"></p>`);
  for (const [index, heading] of headings.entries()) {
    parts.push(`<p><span leaf="">${heading}</span></p>`);
    if (images[index + 1]) parts.push(`<p><img src="${images[index + 1]}"></p>`);
  }
  parts.push("</section>");
  return parts.join("\n");
}

describe("validateWechatStructuralParity", () => {
  test("accepts equivalent topology with arbitrary presentation wrappers", () => {
    const result = validateWechatStructuralParity(
      source,
      html([
        "imgs/00-infographic-core-summary.png",
        "imgs/01-a.png",
        "imgs/02-b.png",
      ]),
    );
    expect(result.ok).toBe(true);
  });

  test("rejects missing, duplicate, and reordered images", () => {
    const cases = [
      ["missing", ["imgs/00-infographic-core-summary.png", "imgs/01-a.png"]],
      ["duplicate", ["imgs/00-infographic-core-summary.png", "imgs/01-a.png", "imgs/01-a.png"]],
      ["reordered", ["imgs/00-infographic-core-summary.png", "imgs/02-b.png", "imgs/01-a.png"]],
    ];
    for (const [label, images] of cases) {
      const result = validateWechatStructuralParity(source, html(images));
      expect(result.ok, label).toBe(false);
      expect(result.errors.join("\n"), label).toMatch(/image|图片/u);
    }
  });

  test("rejects an image moved across sections", () => {
    const result = validateWechatStructuralParity(
      source,
      '<section><p><img src="imgs/00-infographic-core-summary.png"></p><p><span leaf="">A</span></p><p><span leaf="">B</span></p><p><img src="imgs/01-a.png"></p><p><img src="imgs/02-b.png"></p></section>',
    );
    expect(result.ok).toBe(false);
  });

  test("rejects the single lead infographic moved after the final section", () => {
    const singleImageSource = `---\ntitle: 单图\n---\n\n![](imgs/00-infographic-core-summary.png)\n\n## A\n\n正文\n\n## B\n\n正文\n\n## C\n\n正文\n`;
    const movedHtml = '<section><p><span leaf="">A</span></p><p><span leaf="">B</span></p><p><span leaf="">C</span></p><p><img src="imgs/00-infographic-core-summary.png"></p></section>';
    const result = validateWechatStructuralParity(singleImageSource, movedHtml);
    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toContain("00-infographic-core-summary expected in lead section but found after section 3");
  });

  test("rejects substantive heading reordering", () => {
    const result = validateWechatStructuralParity(
      source,
      html([
        "imgs/00-infographic-core-summary.png",
        "imgs/01-a.png",
        "imgs/02-b.png",
      ], ["B", "A"]),
    );
    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toMatch(/heading|structural position/u);
  });

  test("supports heading text rendered as p/span instead of h2", () => {
    const result = validateWechatStructuralParity(
      source,
      html([
        "imgs/00-infographic-core-summary.png",
        "imgs/01-a.png",
        "imgs/02-b.png",
      ]),
    );
    expect(result.ok).toBe(true);
    expect(result.html.headings).toEqual(["A", "B"]);
  });
});

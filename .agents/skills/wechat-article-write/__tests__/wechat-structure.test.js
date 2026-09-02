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

  test("protects fenced code content that the HTML track drops", () => {
    const codeSource = `---
title: 代码测试
---

## A

安装依赖：

\`\`\`bash
npm install demo
node build.mjs
\`\`\`

## B

收尾说明。
    `;
    const rendered = '<section><p><span leaf="">A</span></p><p>安装依赖：</p>'
      + "<pre><code>npm install demo\nnode build.mjs</code></pre>"
      + '<p><span leaf="">B</span></p><p>收尾说明。</p></section>';
    expect(validateWechatStructuralParity(codeSource, rendered).ok).toBe(true);

    const droppedLine = rendered.replace("node build.mjs", "");
    const result = validateWechatStructuralParity(codeSource, droppedLine);
    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toContain("substantive block");
  });

  test("rejects semantic loss inside generic code", () => {
    const codeSource = `---
title: 泛型代码测试
---

## A

\`\`\`cpp
std::vector<int> values;
\`\`\`
`;
    const rendered = '<section><p><span leaf="">A</span></p><pre><code>std::vector values;</code></pre></section>';
    const result = validateWechatStructuralParity(codeSource, rendered);
    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toContain("substantive block");

    const preserved = rendered.replace("std::vector values;", "std::vector&lt;int&gt; values;");
    expect(validateWechatStructuralParity(codeSource, preserved).ok).toBe(true);
  });

  test("rejects reordered lines inside one code fence", () => {
    const codeSource = `---
title: 代码顺序测试
---

## A

\`\`\`javascript
stepA();
stepB();
\`\`\`
`;
    const reordered = '<section><p><span leaf="">A</span></p><p>stepB();</p><p>stepA();</p></section>';
    const result = validateWechatStructuralParity(codeSource, reordered);
    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toContain("missing or reordered");
  });

  test("rejects whitespace loss inside code strings", () => {
    const codeSource = `---
title: 代码空格测试
---

## A

\`\`\`javascript
const x = "a b";
\`\`\`
`;
    const rendered = '<section><p><span leaf="">A</span></p><pre><code>const x = "ab";</code></pre></section>';
    const result = validateWechatStructuralParity(codeSource, rendered);
    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toContain("missing or reordered");
  });

  test("rejects indentation loss in Python code", () => {
    const codeSource = `---
title: Python 缩进测试
---

## A

\`\`\`python
if ready:
    run()
\`\`\`
`;
    const rendered = '<section><p><span leaf="">A</span></p><pre><code>if ready:\nrun()</code></pre></section>';
    const result = validateWechatStructuralParity(codeSource, rendered);
    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toContain("missing or reordered");
  });

  test("rejects code line-boundary loss", () => {
    const codeSource = `---
title: 代码行边界测试
---

## A

\`\`\`text
ab
c
\`\`\`
`;
    const rendered = '<section><p><span leaf="">A</span></p><pre><code>abc</code></pre></section>';
    const result = validateWechatStructuralParity(codeSource, rendered);
    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toContain("missing or reordered");
  });

  test("skips fences that downstream renderers turn into images", () => {
    const diagram = (lang) => `---
title: 图测试
---

## A

\`\`\`${lang}
graph TD; Alpha-->Beta;
\`\`\`
`;
    const rendered = '<section><p><span leaf="">A</span></p></section>';
    // mermaid/plantuml have no text counterpart in HTML, so they must not be required.
    expect(validateWechatStructuralParity(diagram("mermaid"), rendered).ok).toBe(true);
    // The same body under a text-bearing fence is still protected.
    expect(validateWechatStructuralParity(diagram("text"), rendered).ok).toBe(false);
  });

  test("tolerates a clause the theme hoists into a callout inside the same section", () => {
    const calloutSource = `---
title: 卡片测试
---

## A

这当然不是评估。它只是说明了一件事：检查系统也要有失败测试。对 scorer 来说是一枚锚。
`;
    // gzh-design lifts one clause into a preceding callout card and keeps the rest
    // of the paragraph, so the block is split and re-ordered within section A.
    const rendered = '<section><p><span leaf="">A</span></p>'
      + '<section style="border-left:4px solid #DC2626;"><p>检查系统也要有失败测试。</p></section>'
      + "<p>这当然不是评估。它只是说明了一件事：对 scorer 来说是一枚锚。</p></section>";
    expect(validateWechatStructuralParity(calloutSource, rendered).ok).toBe(true);

    // Dropping the hoisted clause entirely is still content loss.
    const lost = rendered.replace("<section style=\"border-left:4px solid #DC2626;\"><p>检查系统也要有失败测试。</p></section>", "");
    expect(validateWechatStructuralParity(calloutSource, lost).errors.join("\n")).toContain("substantive block");
  });

  test("rejects body text relocated into another section", () => {
    const movedSource = `---
title: 搬移测试
---

## A

第一段属于 A 章节。

## B

第二段属于 B 章节。
`;
    const swapped = '<section><p><span leaf="">A</span></p><p>第二段属于 B 章节。</p>'
      + '<p><span leaf="">B</span></p><p>第一段属于 A 章节。</p></section>';
    const result = validateWechatStructuralParity(movedSource, swapped);
    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toContain("moved outside");

    const inPlace = '<section><p><span leaf="">A</span></p><p>第一段属于 A 章节。</p>'
      + '<p><span leaf="">B</span></p><p>第二段属于 B 章节。</p></section>';
    expect(validateWechatStructuralParity(movedSource, inPlace).ok).toBe(true);
  });

  test("treats a URL relocated to bottom citations as document-scoped", () => {
    const linkSource = `---
title: 引用测试
---

## A

我读完指南（链接：https://example.com/guide）后记住了第一条。
`;
    // The WeChat track may move the URL out of the paragraph into a tail reference list.
    const cited = '<section><p><span leaf="">A</span></p><p>我读完指南后记住了第一条。</p>'
      + "<p>参考链接</p><p>https://example.com/guide</p></section>";
    expect(validateWechatStructuralParity(linkSource, cited).ok).toBe(true);

    // Losing the URL altogether is still a failure.
    const lost = cited.replace("<p>https://example.com/guide</p>", "");
    expect(validateWechatStructuralParity(linkSource, lost).errors.join("\n")).toContain("substantive block");
  });
});

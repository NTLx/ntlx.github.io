#!/usr/bin/env bun
/** Structural parity tests for the gzh-design adapter boundary. */

import { describe, expect, test } from "bun:test";
import { summarizeStructuralErrors, validateWechatStructuralParity } from "../scripts/wechat-structure-lib.mjs";

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
  test("bounds large structural diagnostics without weakening parity", () => {
    const manyMissing = Array.from({ length: 29 }, (_, index) => `substantive block ${index + 1} missing from HTML`);
    const diagnostic = summarizeStructuralErrors(manyMissing);
    expect(diagnostic.counts.missing_blocks).toBe(29);
    expect(diagnostic.samples.length).toBeLessThanOrEqual(3);
    expect(diagnostic.samples.every(sample => sample.length <= 160)).toBe(true);
    expect(diagnostic.message).toContain("missing_blocks: 29");

    const result = validateWechatStructuralParity(
      `---\ntitle: 多块\n---\n\n## A\n\n${Array.from({ length: 29 }, (_, index) => `第${index + 1}段内容。`).join("\n\n")}`,
      "<section><p><span>A</span></p></section>",
    );
    expect(result.ok).toBe(false);
    expect(result.diagnostic.counts.missing_blocks).toBe(29);
    expect(result.diagnostic.samples.length).toBeLessThanOrEqual(3);
    expect(result.errors.length).toBeLessThanOrEqual(8);
  });

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

  test("rejects theme placeholder text replacing source-visible content", () => {
    const sourceMarkdown = `---\ntitle: 正文保护\n---\n\n## A\n\n真实正文必须保留。`;
    const themedHtml = '<section><p><span leaf="">A</span></p><p>关键词占位符</p></section>';
    const result = validateWechatStructuralParity(sourceMarkdown, themedHtml);
    expect(result.ok).toBe(false);
    expect(result.diagnostic.failure_class).toBe("structural-parity/missing");
    expect(result.diagnostic.samples.join("\n")).toContain("substantive block");
  });

  test("includes a bounded fragment in missing-block diagnostics", () => {
    const sourceMarkdown = `---\ntitle: 缺失片段\n---\n
## A\n\n只有 validation 分数不低于当前缓存分数，候选图才会 commit。\n`;
    const result = validateWechatStructuralParity(
      sourceMarkdown,
      '<section><p><span leaf="">A</span></p></section>',
    );
    expect(result.ok).toBe(false);
    expect(result.diagnostic.failure_class).toBe("structural-parity/missing");
    expect(result.diagnostic.samples.join("\n")).toContain("候选图才会 commit");
    expect(result.diagnostic.samples.every((sample) => sample.length <= 160)).toBe(true);
  });

  test("preserves source-visible apostrophes exactly", () => {
    const sourceMarkdown = `---\ntitle: 撇号\n---\n\n## A\n\nLenny's newsletter\n`;
    const preserved = '<section><p><span leaf="">A</span></p><p>Lenny\'s newsletter</p></section>';
    expect(validateWechatStructuralParity(sourceMarkdown, preserved).ok).toBe(true);

    const mutated = preserved.replace("Lenny's", "Lenny’s");
    const result = validateWechatStructuralParity(sourceMarkdown, mutated);
    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toContain("substantive block");
  });

  test("classifies structural parity failures by their dominant count", () => {
    expect(summarizeStructuralErrors(["substantive block 1 missing from HTML"]).failure_class)
      .toBe("structural-parity/missing");
    expect(summarizeStructuralErrors(["body image count mismatch"]).failure_class)
      .toBe("structural-parity/image");
    expect(summarizeStructuralErrors(["substantive heading sequence mismatch"]).failure_class)
      .toBe("structural-parity/heading");
    expect(summarizeStructuralErrors([
      "substantive block 1 missing from HTML",
      "body image count mismatch",
    ]).failure_class).toBe("structural-parity/mixed");
  });

  test("does not report misleading text replacement metrics", () => {
    const diagnostic = summarizeStructuralErrors(["substantive block 1 missing from HTML"]);
    expect(diagnostic.counts).not.toHaveProperty("unexpected_text_replacement");
    expect(diagnostic.message).toContain("failure_class: structural-parity/missing");
    expect(diagnostic.message).not.toContain("unexpected_text_replacement");
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

  test("matches an underlined URL wrapped in nested parentheses", () => {
    const underscoreSource = `---
title: 下划线链接测试
---

## A

这个项目已经 90% there（原帖（链接：https://x.com/romanugarte_/status/2087344044435505175））。
`;
    // The HTML track keeps the same paragraph verbatim, so the underscore in the
    // URL must not survive normalization on only one side.
    const rendered = '<section><p><span leaf="">A</span></p>'
      + "<p>这个项目已经 90% there（原帖（链接：https://x.com/romanugarte_/status/2087344044435505175））。</p></section>";
    const result = validateWechatStructuralParity(underscoreSource, rendered);
    expect(result.errors.join("\n")).toBe("");
    expect(result.ok).toBe(true);
  });

  test("fails when the HTML track loses an underscore inside a URL", () => {
    const underscoreSource = `---
title: 下划线丢失测试
---

## A

这个项目已经 90% there（原帖（链接：https://x.com/romanugarte_/status/2087344044435505175））。
`;
    const rendered = '<section><p><span leaf="">A</span></p>'
      + "<p>这个项目已经 90% there（原帖（链接：https://x.com/romanugarte/status/2087344044435505175））。</p></section>";
    expect(validateWechatStructuralParity(underscoreSource, rendered).ok).toBe(false);
  });

  test("keeps literal underscores in identifiers and prose", () => {
    const literalSource = `---
title: 字面下划线测试
---

## A

环境变量 OPENAI_API_KEY 需要保留，代码里叫 foo_bar。
`;
    const rendered = '<section><p><span leaf="">A</span></p>'
      + "<p>环境变量 OPENAI_API_KEY 需要保留，代码里叫 foo_bar。</p></section>";
    expect(validateWechatStructuralParity(literalSource, rendered).ok).toBe(true);

    // Losing the underscore in the HTML track is content loss, not normalization.
    const dropped = rendered.replace("OPENAI_API_KEY", "OPENAIAPIKEY").replace("foo_bar", "foobar");
    expect(validateWechatStructuralParity(literalSource, dropped).ok).toBe(false);
  });

  test("still treats real Markdown emphasis as presentation", () => {
    const emphasisSource = `---
title: 强调测试
---

## A

这一段有 *斜体* 和 **粗体** 和 _下划线斜体_。
`;
    const rendered = '<section><p><span leaf="">A</span></p>'
      + "<p>这一段有 斜体 和 粗体 和 下划线斜体。</p></section>";
    expect(validateWechatStructuralParity(emphasisSource, rendered).ok).toBe(true);

    // GFM strikethrough uses `~~`; a single `~` is a visible literal character.
    const strikeSource = `---
title: 波浪号测试
---

## A

大约 ~300 人，这一段有 ~~删除线~~ 文字。
`;
    const strikeRendered = '<section><p><span leaf="">A</span></p>'
      + "<p>大约 ~300 人，这一段有 删除线 文字。</p></section>";
    expect(validateWechatStructuralParity(strikeSource, strikeRendered).ok).toBe(true);
    expect(validateWechatStructuralParity(strikeSource, strikeRendered.replace("~300", "300")).ok).toBe(false);
  });
});

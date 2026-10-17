import { describe, expect, test } from "bun:test";
import { extractSubstantiveMarkdownBlockEntries } from "../scripts/content-parity-lib.mjs";
import { validateGzhDesignFidelity } from "../scripts/gzh-fidelity-lib.mjs";

const source = `---
title: 设计保真测试
---

开头段落用于测试关键词标记完整性。

## 第一章

第一章正文用于测试石墨主题的章节编号和正文标记。

## 第二章

第二章正文用于测试尾部组件和正文标记。
`;

function mark(text) {
  return `<span style="border-bottom:2px solid #52525B;font-weight:600;color:#27272A;"><span leaf="">${text}</span></span>`;
}

function graphiteHtml() {
  return [
    "<section>",
    `<p>${mark("开头段落用于测试关键词标记完整性。")}</p>`,
    '<section><span leaf="">01</span><h3><span leaf="">第一章</span></h3></section>',
    `<p>${mark("第一章正文用于测试石墨主题的章节编号和正文标记。")}</p>`,
    '<section><span leaf="">02</span><h3><span leaf="">第二章</span></h3></section>',
    `<p>${mark("第二章正文用于测试尾部组件和正文标记。")}</p>`,
    '<span leaf="">END</span>',
    '<p><span leaf="">我是 NTLx，热衷于分享 AI 观察与干货。</span></p>',
    '<p><span leaf="">如果你觉得今天这篇有收获，欢迎点赞、在看、转发三连，我们下篇见。</span></p>',
    "</section>",
  ].join("\n");
}

describe("gzh-design fidelity guard", () => {
  test("labels extracted paragraphs and list items explicitly", () => {
    expect(extractSubstantiveMarkdownBlockEntries("正文段落内容足够长。\n\n- 列表项目内容足够长。"))
      .toMatchObject([{ kind: "paragraph" }, { kind: "list" }]);
  });

  test("derives observable requirements from the installed graphite theme", () => {
    expect(validateGzhDesignFidelity({ sourceMarkdown: source, html: graphiteHtml(), themeId: "graphite-minimal" }))
      .toMatchObject({ theme_id: "graphite-minimal", h2_count: 2 });
  });

  test("rejects missing theme skeleton and paragraph-marking features", () => {
    expect(() => validateGzhDesignFidelity({
      sourceMarkdown: source,
      html: graphiteHtml().replace('<span leaf="">END</span>', "").replaceAll("border-bottom:2px solid #52525B;font-weight:600;", ""),
      themeId: "graphite-minimal",
    })).toThrow("gzh-design fidelity Gate failed");
  });

  test("long list items and trailing references do not raise the paragraph marking minimum", () => {
    const extendedSource = `${source}\n- ${"长列表条目用于描述很多具体信息并且足够长。".repeat(3)}\n- ${"另一条长列表内容也不应该计入正文段落。".repeat(3)}\n\n## 参考资料\n\n- ${"参考资料标题包含大量文字但不是正文段落。".repeat(3)}\n- https://example.com/reference`;
    expect(validateGzhDesignFidelity({ sourceMarkdown: extendedSource, html: graphiteHtml(), themeId: "graphite-minimal" }))
      .toMatchObject({ theme_id: "graphite-minimal", underline_marks: 3 });
  });

  test("still rejects genuinely missing body paragraph marks", () => {
    const oneMarked = graphiteHtml()
      .replace(mark("第一章正文用于测试石墨主题的章节编号和正文标记。"), "第一章正文用于测试石墨主题的章节编号和正文标记。")
      .replace(mark("第二章正文用于测试尾部组件和正文标记。"), "第二章正文用于测试尾部组件和正文标记。");
    expect(() => validateGzhDesignFidelity({ sourceMarkdown: source, html: oneMarked, themeId: "graphite-minimal" }))
      .toThrow("expected at least 2 for 3 substantive paragraphs");
  });

  test("rejects an unregistered theme id from a forged native filename", () => {
    expect(() => validateGzhDesignFidelity({ sourceMarkdown: source, html: graphiteHtml(), themeId: "not-a-theme" }))
      .toThrow("not registered");
  });
});

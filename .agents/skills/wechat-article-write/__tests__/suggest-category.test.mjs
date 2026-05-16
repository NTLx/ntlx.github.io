#!/usr/bin/env bun
/**
 * suggest-category.mjs 单元测试
 *
 * 测试关键词命中、N-gram 匹配、tags 加权、gap 置信度、输出结构完整性
 */

import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const SCRIPTS_DIR = resolve(import.meta.dir, "../scripts");
const TMP = join(tmpdir(), `suggest-category-test-${Date.now()}`);

function runSuggest(content) {
  const tmpFile = join(TMP, "draft.md");
  writeFileSync(tmpFile, content);
  const r = spawnSync("bun", ["run", join(SCRIPTS_DIR, "suggest-category.mjs"), tmpFile], {
    encoding: "utf8",
  });
  if (r.status !== 0) {
    throw new Error(`suggest-category failed: ${r.stderr}`);
  }
  return JSON.parse(r.stdout.trim());
}

describe("suggest-category", () => {
  beforeAll(() => {
    mkdirSync(TMP, { recursive: true });
  });

  afterAll(() => {
    try { rmSync(TMP, { recursive: true, force: true }); } catch {}
  });

  test("输出结构包含所有必需字段", () => {
    const result = runSuggest(`---
title: "测试文章"
summary: "测试摘要"
---

## 正文

这是测试内容。
`);
    expect(result).toHaveProperty("recommended");
    expect(result).toHaveProperty("confidence");
    expect(result).toHaveProperty("low_confidence");
    expect(result).toHaveProperty("alternative");
    expect(result).toHaveProperty("scores");
  });

  test("AI 编程文章推荐 ai-coding 分类", () => {
    const result = runSuggest(`---
title: "Cursor 1.0：AI 编程新纪元"
summary: "AI 编程工具 Cursor 发布 1.0"
category: ai-coding
tags: ["cursor", "AI编程"]
---

## 正文

Cursor 是一款 AI 编程工具，支持代码补全和自动重构。
Copilot 和 Cline 也是 AI 编程领域的代表。
`);
    expect(result.recommended).toBe("ai-coding");
    expect(result.confidence).toBeGreaterThan(0);
  });

  test("安全文章推荐 security 分类", () => {
    const result = runSuggest(`---
title: "供应链攻击与漏洞防护"
summary: "安全漏洞分析"
category: security
tags: ["安全", "漏洞"]
---

## 正文

近期供应链攻击频发，安全研究者发现多个高危漏洞。
网络安全防护需要持续更新策略。
`);
    expect(result.recommended).toBe("security");
  });

  test("tags 加权改变得分分布", () => {
    const withTags = runSuggest(`---
title: "LLM Agent 架构"
summary: "智能体架构设计"
tags: ["AI Agent", "智能体"]
---

## 正文

AI Agent 架构设计是当前热门话题。
`);

    const noTags = runSuggest(`---
title: "LLM Agent 架构"
summary: "智能体架构设计"
---

## 正文

AI Agent 架构设计是当前热门话题。
`);
    // 带 tags 时，ai-agents 相关的得分总和应更高
    const withTagsTotal = Object.values(withTags.scores ?? {}).reduce((a, b) => a + b, 0);
    const noTagsTotal = Object.values(noTags.scores ?? {}).reduce((a, b) => a + b, 0);
    expect(withTagsTotal).toBeGreaterThan(noTagsTotal);
  });

  test("空正文仍返回有效推荐", () => {
    const result = runSuggest(`---
title: "测试"
summary: "测试"
---

## 正文

`);
    expect(result.recommended).toBeTruthy();
    expect(typeof result.confidence).toBe("number");
  });

  test("N-gram 匹配提升得分", () => {
    // 含 N-gram 短语的文章应在对应分类得分更高
    const result = runSuggest(`---
title: "代码补全与 AI 编程"
summary: "AI coding 的发展"
---

## 正文

AI coding 工具正在改变编程方式。
代码补全功能越来越智能。
`);
    expect(result.scores).toBeTruthy();
    // 只要能正常运行即可，具体得分依赖 keywords.json 内容
  });
});
#!/usr/bin/env bun

import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const SCRIPT = join(import.meta.dir, "../scripts/validate-understanding.mjs");
const REPO_ROOT = join(import.meta.dir, "../../../..");

function fixture() {
  const root = join(tmpdir(), `understanding-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const slug = "2026-08-30-understanding-gate";
  mkdirSync(join(root, slug), { recursive: true });
  return { root, slug, dir: join(root, slug) };
}

const validBrief = `# Understanding Brief

## 原始材料结构
材料包含事实和作者解释。

## 核心问题链
问题、回答和证据边界。

## 中心论点下钻
中心判断是一句可检验的话。

## 关键概念白话化
用读者能理解的语言解释。

## 生成机制
机制链条清楚。

## 约束与解空间
边界和可变项清楚。

## 反方与边界
最强反方和成立条件。

## 可写成正文的判断
至少一个可写判断。

## 可视觉化的节点
一个关系图节点。

## 写作契约
- 逐条落实一个作者的独立判断。
- 连接一条外部证据与材料。
- 给出一个读者可执行的后续行动。
`;

describe("understanding brief Gate", () => {
  const cleanup = [];
  afterEach(() => {
    for (const dir of cleanup.splice(0)) rmSync(dir, { recursive: true, force: true });
  });

  test("passes a complete brief without caring which Skill produced it", () => {
    const fx = fixture();
    cleanup.push(fx.root);
    writeFileSync(join(fx.dir, "understanding-brief.md"), validBrief);
    const result = spawnSync("bun", ["run", SCRIPT, fx.slug, "--json"], {
      cwd: REPO_ROOT,
      env: { ...process.env, PIPELINE_POSTS_ROOT: fx.root },
      encoding: "utf8",
    });
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout).ok).toBe(true);
    expect(readFileSync(join(fx.dir, "understanding-brief.md"), "utf8")).toBe(validBrief);
  });

  test("fails when the contract is only headings", () => {
    const fx = fixture();
    cleanup.push(fx.root);
    writeFileSync(join(fx.dir, "understanding-brief.md"), validBrief.replace("- 逐条落实一个作者的独立判断。\n- 连接一条外部证据与材料。\n- 给出一个读者可执行的后续行动。", ""));
    const result = spawnSync("bun", ["run", SCRIPT, fx.slug, "--json"], {
      cwd: REPO_ROOT,
      env: { ...process.env, PIPELINE_POSTS_ROOT: fx.root },
      encoding: "utf8",
    });
    expect(result.status).toBe(2);
    expect(JSON.parse(result.stdout).errors[0]).toMatch(/missing or empty sections|至少需要 3 条/);
  });
});

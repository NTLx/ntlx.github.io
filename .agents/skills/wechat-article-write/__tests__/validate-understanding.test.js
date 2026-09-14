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

function writeState(dir, lastCompleteStep = 0, strategy = "reader-response") {
  writeFileSync(join(dir, ".pipeline-state.json"), JSON.stringify({
    slug: "2026-08-30-understanding-gate",
    strategy,
    last_complete_step: lastCompleteStep,
    publish: { blog: "pending", wechat: "pending" },
    failed_step: null,
  }) + "\n");
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
    writeState(fx.dir);
    const result = spawnSync("bun", ["run", SCRIPT, fx.slug, "--json"], {
      cwd: REPO_ROOT,
      env: { ...process.env, PIPELINE_POSTS_ROOT: fx.root },
      encoding: "utf8",
    });
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout).ok).toBe(true);
    expect(JSON.parse(readFileSync(join(fx.dir, ".pipeline-state.json"), "utf8")).last_complete_step).toBe(1);
    expect(readFileSync(join(fx.dir, "understanding-brief.md"), "utf8")).toBe(validBrief);
  });

  test("fails when a required content area is empty", () => {
    const fx = fixture();
    cleanup.push(fx.root);
    writeFileSync(join(fx.dir, "understanding-brief.md"), validBrief.replace("最强反方和成立条件。", "").replace("边界和可变项清楚。", ""));
    writeState(fx.dir);
    const result = spawnSync("bun", ["run", SCRIPT, fx.slug, "--json"], {
      cwd: REPO_ROOT,
      env: { ...process.env, PIPELINE_POSTS_ROOT: fx.root },
      encoding: "utf8",
    });
    expect(result.status).toBe(2);
    expect(JSON.parse(result.stdout).errors[0]).toMatch(/missing or empty content areas/);
    expect(JSON.parse(readFileSync(join(fx.dir, ".pipeline-state.json"), "utf8")).failed_step.step).toBe(1);
  });

  test("understanding failure resumes Step 1 workflow", () => {
    const fx = fixture();
    cleanup.push(fx.root);
    writeFileSync(join(fx.dir, "understanding-brief.md"), "# Understanding Brief\n\n## 写作契约\n- only one commitment\n");
    writeState(fx.dir);

    const result = spawnSync("bun", ["run", SCRIPT, fx.slug, "--json"], {
      cwd: REPO_ROOT,
      env: { ...process.env, PIPELINE_POSTS_ROOT: fx.root },
      encoding: "utf8",
    });
    expect(result.status).toBe(2);
    expect(JSON.parse(readFileSync(join(fx.dir, ".pipeline-state.json"), "utf8")).failed_step.step).toBe(1);
  });
  test("tutorial accepts engineering sections without title, visual nodes or originality count", () => {
    const fx = fixture();
    cleanup.push(fx.root);
    const brief = "## 验证证据\n本地复现日志确认预期输出。\n## 工程目标\n让读者复现环境配置。\n## 适用范围\n仅适用于已验证的版本。\n## 工程步骤\n按配置、运行、检查结果的顺序说明。\n";
    writeFileSync(join(fx.dir, "understanding-brief.md"), brief);
    writeState(fx.dir, 0, "tutorial");
    const result = spawnSync("bun", ["run", SCRIPT, fx.slug, "--json"], {
      cwd: REPO_ROOT, env: { ...process.env, PIPELINE_POSTS_ROOT: fx.root }, encoding: "utf8",
    });
    expect(result.status, result.stderr || result.stdout).toBe(0);
    expect(JSON.parse(result.stdout).ok).toBe(true);
  });

  test("reader-response accepts a compact brief with one writing application", () => {
    const fx = fixture();
    cleanup.push(fx.root);
    writeFileSync(join(fx.dir, "understanding-brief.md"), "### 证据\n原文记录了失败和恢复过程。\n### 中心判断\n恢复能力决定流程可靠性。\n### 边界\n只讨论可重试操作。\n### 写作应用\n用一次失败后的恢复过程解释判断。\n");
    writeState(fx.dir);
    const result = spawnSync("bun", ["run", SCRIPT, fx.slug, "--json"], {
      cwd: REPO_ROOT, env: { ...process.env, PIPELINE_POSTS_ROOT: fx.root }, encoding: "utf8",
    });
    expect(result.status, result.stderr || result.stdout).toBe(0);
  });

});

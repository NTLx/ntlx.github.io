#!/usr/bin/env bun
/**
 * workflow.mjs 单元测试
 *
 * 验证命名阶段的机器源：策略→阶段序列、step→stage 映射、next 推导、
 * 依赖表覆盖（required 全集必须与文档声明的硬依赖一致）。
 */

import { describe, expect, test } from "bun:test";
import {
  DEFAULT_STRATEGY,
  STRATEGIES,
  REQUIRED_SKILLS,
  initStages,
  stageForStep,
  nextStageFromStep,
  stageReadRef,
  requiredSkillsFor,
  optionalSkillsFor,
  requiredSkillsForStage,
} from "../scripts/workflow.mjs";

describe("workflow stage machine", () => {
  test("all strategies declare a valid stage sequence", () => {
    for (const [name, s] of Object.entries(STRATEGIES)) {
      expect(s.stages.length).toBeGreaterThanOrEqual(3);
      expect(s.stages[0]).toBe("prepare");
      expect(s.stages[s.stages.length - 1]).toBe("publish");
      // stepToStage 的 value 必须都在 stages 里
      for (const stage of Object.values(s.stepToStage)) {
        expect(s.stages).toContain(stage);
      }
    }
  });

  test("DEFAULT_STRATEGY resolves to an existing strategy", () => {
    expect(STRATEGIES[DEFAULT_STRATEGY]).toBeDefined();
  });

  test("initStages builds all-pending view", () => {
    const v = initStages("reader-response");
    expect(v.prepare).toBe("pending");
    expect(v.publish).toBe("pending");
    expect(Object.keys(v).length).toBe(STRATEGIES["reader-response"].stages.length);
  });

  test("stageForStep maps completed step to stage", () => {
    expect(stageForStep("reader-response", 0)).toBe("prepare");
    expect(stageForStep("reader-response", 1)).toBe("research");
    expect(stageForStep("reader-response", 4)).toBe("illustrate");
    // tutorial 的 step 1/2 都归入 adapt
    expect(stageForStep("tutorial", 1)).toBe("adapt");
    expect(stageForStep("tutorial", 2)).toBe("adapt");
  });

  test("nextStageFromStep walks the sequence", () => {
    // reader-response: after research(1) → synthesize, after draft(2) → refine
    expect(nextStageFromStep("reader-response", 0)).toBe("research");
    expect(nextStageFromStep("reader-response", 1)).toBe("synthesize");
    expect(nextStageFromStep("reader-response", 2)).toBe("refine");
    expect(nextStageFromStep("reader-response", 3)).toBe("illustrate");
    expect(nextStageFromStep("reader-response", 4)).toBe("build");
    expect(nextStageFromStep("reader-response", 5)).toBe("publish");
    // tutorial: after adapt(2) → illustrate
    expect(nextStageFromStep("tutorial", 1)).toBe("illustrate");
    expect(nextStageFromStep("tutorial", 4)).toBe("build");
  });

  test("nextStageFromStep handles partial publish", () => {
    expect(nextStageFromStep("reader-response", 6, { blog: "done", wechat: "pending" })).toBe("publish");
    expect(nextStageFromStep("reader-response", 6, { blog: "blocked", wechat: "pending" })).toBe("publish");
    expect(nextStageFromStep("reader-response", 6, { blog: "done", wechat: "done" })).toBe("done");
  });

  test("unknown strategy returns unknown instead of impersonating a default", () => {
    expect(nextStageFromStep("nope", 0)).toBe("unknown");
    expect(nextStageFromStep("nope", 3)).toBe("unknown");
  });

  test("strategy sequences are strategy-specific (no cross-strategy impersonation)", () => {
    // reader-response：step → 下一阶段
    expect(nextStageFromStep("reader-response", 0)).toBe("research");
    expect(nextStageFromStep("reader-response", 1)).toBe("synthesize");
    expect(nextStageFromStep("reader-response", 2)).toBe("refine");
    expect(nextStageFromStep("reader-response", 3)).toBe("illustrate");
    expect(nextStageFromStep("reader-response", 4)).toBe("build");

    // tutorial：内容适配后直接进图片
    expect(nextStageFromStep("tutorial", 0)).toBe("adapt");
    expect(nextStageFromStep("tutorial", 1)).toBe("illustrate");
    expect(nextStageFromStep("tutorial", 2)).toBe("illustrate");
    expect(nextStageFromStep("tutorial", 4)).toBe("build");

    // news-digest：research → draft → refine
    expect(nextStageFromStep("news-digest", 0)).toBe("research");
    expect(nextStageFromStep("news-digest", 1)).toBe("draft");
    expect(nextStageFromStep("news-digest", 2)).toBe("refine");
    expect(nextStageFromStep("news-digest", 3)).toBe("illustrate");
  });

  test("required skill set is non-empty and covers hard deps", () => {
    expect(REQUIRED_SKILLS).toContain("ljg-qa");
    expect(REQUIRED_SKILLS).toContain("ljg-think");
    expect(REQUIRED_SKILLS).toContain("ljg-writes");
    expect(REQUIRED_SKILLS).toContain("gzh-design");
    expect(REQUIRED_SKILLS).toContain("baoyu-post-to-wechat");
    // aihot 是 news-digest research 的 required，应出现在全集
    expect(REQUIRED_SKILLS).toContain("aihot");
    // last30days 在所有策略中都是 optional，不应出现在 required 全集
    expect(REQUIRED_SKILLS).not.toContain("last30days");
  });

  // PR 2 路由契约：依赖必须 strategy-aware，不能用一个全局表重新制造冲突
  test("dependencies are strategy-aware (news-digest forbids ljg-writes)", () => {
    // reader-response 的 draft 需要 ljg-writes
    expect(requiredSkillsFor("reader-response", "draft")).toContain("ljg-writes");
    // news-digest 的 draft 禁止 ljg-writes（简报由自身结构化合同直接产出）
    expect(requiredSkillsFor("news-digest", "draft")).not.toContain("ljg-writes");
    expect(requiredSkillsFor("news-digest", "draft")).toHaveLength(0);
    // tutorial 的 adapt 不需要写作文本技能
    expect(requiredSkillsFor("tutorial", "adapt")).toHaveLength(0);

    // reader-response research 强制 ljg-qa / ljg-think；news-digest research 强制 aihot
    expect(requiredSkillsFor("reader-response", "research")).toContain("ljg-qa");
    expect(requiredSkillsFor("reader-response", "research")).toContain("ljg-think");
    expect(requiredSkillsFor("news-digest", "research")).toContain("aihot");
    expect(optionalSkillsFor("news-digest", "research")).toContain("last30days");

    // 共享管线阶段各策略一致
    for (const strategy of ["reader-response", "tutorial", "news-digest"]) {
      expect(requiredSkillsFor(strategy, "illustrate")).toContain("baoyu-infographic");
      expect(requiredSkillsFor(strategy, "build")).toContain("gzh-design");
      expect(requiredSkillsFor(strategy, "publish")).toContain("baoyu-post-to-wechat");
    }
  });

  test("requiredSkillsForStage aggregates across strategies per stage", () => {
    // research 阶段：reader-response 的 ljg-qa + news-digest 的 aihot 都是硬依赖
    expect(requiredSkillsForStage("research")).toContain("ljg-qa");
    expect(requiredSkillsForStage("research")).toContain("aihot");
    expect(requiredSkillsForStage("draft")).toContain("ljg-writes");
    expect(requiredSkillsForStage("refine")).toContain("baoyu-format-markdown");
  });

  test("stageReadRef returns strategy doc for content stages, pipeline overview for build stages", () => {
    expect(stageReadRef("reader-response", "draft")).toBe("references/strategy-reader-response.md");
    expect(stageReadRef("news-digest", "research")).toBe("references/strategy-news-digest.md");
    expect(stageReadRef("reader-response", "build")).toBe("references/pipeline-overview.md");
    expect(stageReadRef("reader-response", "publish")).toBe("references/pipeline-overview.md");
  });
});
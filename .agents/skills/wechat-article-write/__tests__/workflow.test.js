#!/usr/bin/env bun
/**
 * workflow.mjs 单元测试：数字 state 与命名 Stage Contract 的兼容性。
 */

import { describe, expect, test } from "bun:test";
import {
  DEFAULT_STRATEGY,
  STRATEGIES,
  STAGE_CONTRACTS,
  STAGE_ORDER,
  HARD_SKILLS,
  initStages,
  stageContractFor,
  stageForStep,
  nextStageFromStep,
  stagesForStep,
  stageReadRef,
  stageReadRefs,
  requiredSkillsFor,
  optionalSkillsFor,
  requiredSkillsForStage,
  validateWorkflow,
} from "../scripts/workflow.mjs";

describe("workflow stage contracts", () => {
  test("all strategies declare valid stage sequences", () => {
    for (const [name, strategy] of Object.entries(STRATEGIES)) {
      expect(strategy.objective).toBeString();
      expect(strategy.stages[0]).toBe("prepare");
      expect(strategy.stages.at(-1)).toBe("publish");
      for (const stage of strategy.stages) expect(stageContractFor(stage)).toBeDefined();
      for (const stage of Object.values(strategy.stepToStage)) {
        expect(strategy.stages).toContain(stage);
      }
      expect(strategy.dependencies).toBeUndefined();
      expect(strategy.optional).toBeUndefined();
      expect(name).toBeString();
    }
  });

  test("every stage has a contract and adaptive stages have a Gate", () => {
    for (const stage of STAGE_ORDER) {
      const contract = STAGE_CONTRACTS[stage];
      expect(contract).toBeDefined();
      expect(contract.goal).toBeString();
      expect(contract.inputs.length).toBeGreaterThan(0);
      expect(Array.isArray(contract.outputs)).toBe(true);
      expect(contract.acceptance.length).toBeGreaterThan(0);
      if (contract.mode.startsWith("adaptive")) {
        expect(contract.gate ?? contract.gates).toBeDefined();
      }
    }
    expect(validateWorkflow()).toEqual([]);
  });

  test("adaptive contracts do not regress into static Skill routing tables", () => {
    const forbiddenFields = [
      "dependencies",
      "requiredSkills",
      "optionalSkills",
      "preferredSkills",
      "skills",
      "skill",
      "skillRoutes",
      "routes",
      "router",
    ];

    for (const [stage, contract] of Object.entries(STAGE_CONTRACTS)) {
      if (!contract.mode.startsWith("adaptive")) continue;
      for (const field of forbiddenFields) {
        expect(Object.hasOwn(contract, field), `${stage}.${field}`).toBe(false);
      }
    }
    expect(validateWorkflow()).toEqual([]);
  });

  test("DEFAULT_STRATEGY and pending stage view remain stable", () => {
    expect(STRATEGIES[DEFAULT_STRATEGY]).toBeDefined();
    const view = initStages(DEFAULT_STRATEGY);
    expect(view.prepare).toBe("pending");
    expect(view.publish).toBe("pending");
    expect(Object.keys(view)).toHaveLength(STRATEGIES[DEFAULT_STRATEGY].stages.length);
  });

  test("numeric step mappings remain compatible", () => {
    expect(stageForStep("reader-response", 0)).toBe("prepare");
    expect(stageForStep("reader-response", 1)).toBe("research");
    expect(stageForStep("reader-response", 4)).toBe("illustrate");
    expect(stageForStep("tutorial", 1)).toBe("adapt");
    expect(stageForStep("tutorial", 2)).toBe("adapt");

    expect(nextStageFromStep("reader-response", 0)).toBe("research");
    expect(nextStageFromStep("reader-response", 1)).toBe("synthesize");
    expect(nextStageFromStep("reader-response", 2)).toBe("refine");
    expect(nextStageFromStep("reader-response", 4)).toBe("build");
    expect(nextStageFromStep("tutorial", 1)).toBe("illustrate");
    expect(nextStageFromStep("news-digest", 1)).toBe("draft");
  });

  test("Step 2 can expose synthesize and draft contracts together", () => {
    expect(stagesForStep("reader-response", 1, 2)).toEqual(["synthesize", "draft"]);
    expect(stagesForStep("news-digest", 1, 2)).toEqual(["draft"]);
  });

  test("tutorial keeps the Step 3 humanization gate inside adapt", () => {
    expect(stagesForStep("tutorial", 1, 2)).toEqual(["adapt"]);
    expect(stagesForStep("tutorial", 2, 3)).toEqual(["adapt"]);
  });

  test("partial publish and unknown strategy remain safe", () => {
    expect(nextStageFromStep("reader-response", 6, { blog: "done", wechat: "pending" })).toBe("publish");
    expect(nextStageFromStep("reader-response", 6, { blog: "done", wechat: "done" })).toBe("done");
    expect(nextStageFromStep("unknown", 0)).toBe("unknown");
  });

  test("illustrate hard dependencies include the Baoyu design layer and raster renderer", () => {
    expect(HARD_SKILLS).toEqual(expect.arrayContaining([
      "baoyu-image-gen",
      "gzh-design",
      "github-image-hosting",
      "baoyu-post-to-wechat",
    ]));
    for (const skill of ["ljg-qa", "ljg-think", "ljg-writes", "aihot", "last30days"]) {
      expect(HARD_SKILLS).not.toContain(skill);
    }
    expect(HARD_SKILLS).toEqual(expect.arrayContaining([
      "baoyu-article-illustrator",
      "baoyu-cover-image",
      "baoyu-infographic",
      "baoyu-diagram",
      "baoyu-image-gen",
    ]));
    expect(requiredSkillsFor("reader-response", "research")).toEqual([]);
    expect(requiredSkillsFor("reader-response", "draft")).toEqual([]);
    expect(requiredSkillsFor("reader-response", "refine")).toEqual(["humanizer-zh"]);
    expect(requiredSkillsFor("tutorial", "adapt")).toEqual(["humanizer-zh"]);
    expect(requiredSkillsForStage("adapt")).toEqual(["humanizer-zh"]);
    expect(requiredSkillsForStage("research")).toEqual([]);
    expect(optionalSkillsFor("reader-response", "research")).toEqual([]);
  });

  test("adaptive stages instruct progressive disclosure", () => {
    expect(stageReadRefs("reader-response", "synthesize")).toContain("references/orchestration-policy.md");
    expect(stageReadRefs("reader-response", "synthesize")).toContain("references/strategy-reader-response.md");
    expect(stageReadRef("reader-response", "draft")).toBe("references/strategy-reader-response.md");
    expect(stageReadRef("reader-response", "build")).toBe("references/pipeline-overview.md");
    expect(stageReadRef("reader-response", "publish")).toBe("references/pipeline-overview.md");
  });
});

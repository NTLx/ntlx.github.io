#!/usr/bin/env bun
/**
 * validation-lib.mjs regression tests.
 */

import { describe, test, expect } from "bun:test";
import { resolveSlotImageFile } from "../scripts/validation-lib.mjs";
import {
  normalizePromptSource,
  validateVisualPlanTopology,
} from "../scripts/visual-plan-lib.mjs";

describe("resolveSlotImageFile", () => {
  test("slot 00 resolves only to the infographic image", () => {
    const file = resolveSlotImageFile("<!-- SLOT_IMG_00_INFOGRAPHIC -->", [
      "00-cover.png",
      "00-infographic-core-summary.png",
      "01-detail.png",
    ]);

    expect(file).toBe("00-infographic-core-summary.png");
  });

  test("slot 00 rejects legacy generic infographic names", () => {
    const file = resolveSlotImageFile("<!-- SLOT_IMG_00_INFOGRAPHIC -->", [
      "00-infographic.png",
      "01-detail.png",
    ]);

    expect(file).toBe(null);
  });

  test("body slots prefer the normalized placeholder description", () => {
    const file = resolveSlotImageFile("<!-- SLOT_IMG_01_CODE_VS_CONTEXT_DIVIDE -->", [
      "01-other.png",
      "01-code_vs_context_divide.png",
    ]);

    expect(file).toBe("01-code_vs_context_divide.png");
  });
});

function visualPlan(illustrations) {
  return {
    cover: { intent: "文章中心" },
    infographic: { intent: "全文摘要" },
    illustrations,
  };
}

describe("validateVisualPlanTopology", () => {
  test("matches sparse draft slots to the same sparse plan slots", () => {
    const result = validateVisualPlanTopology(
      visualPlan([
        { slot: 1, intent: "解释第一处关系" },
        { slot: 3, intent: "解释第三处关系" },
      ]),
      "<!-- SLOT_IMG_00_INFOGRAPHIC -->\n\n<!-- SLOT_IMG_01_FIRST -->\n\n<!-- SLOT_IMG_03_THIRD -->",
    );

    expect(result.ok).toBe(true);
    expect(result.bodySlots.map(({ slot }) => slot)).toEqual([1, 3]);
  });

  test("fails when the plan is missing a draft body slot", () => {
    const result = validateVisualPlanTopology(
      visualPlan([{ slot: 1, intent: "解释第一处关系" }]),
      "<!-- SLOT_IMG_00_INFOGRAPHIC -->\n\n<!-- SLOT_IMG_01_FIRST -->\n\n<!-- SLOT_IMG_03_THIRD -->",
    );

    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toContain("missing a plan for SLOT_IMG_03");
  });

  test("fails when the plan contains a slot absent from the draft", () => {
    const result = validateVisualPlanTopology(
      visualPlan([
        { slot: 1, intent: "解释第一处关系" },
        { slot: 3, intent: "计划外关系" },
      ]),
      "<!-- SLOT_IMG_00_INFOGRAPHIC -->\n\n<!-- SLOT_IMG_01_FIRST -->",
    );

    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toContain("slot 3 has no matching body SLOT");
  });

  test("fails duplicate draft and plan slot numbers", () => {
    const duplicateDraft = validateVisualPlanTopology(
      visualPlan([{ slot: 1, intent: "解释关系" }]),
      "<!-- SLOT_IMG_00_INFOGRAPHIC -->\n\n<!-- SLOT_IMG_01_FIRST -->\n\n<!-- SLOT_IMG_01_REPEAT -->",
    );
    expect(duplicateDraft.ok).toBe(false);
    expect(duplicateDraft.errors.join("\n")).toContain("SLOT_IMG_01 appears 2 times");

    const duplicatePlan = validateVisualPlanTopology(
      visualPlan([
        { slot: 1, intent: "解释关系" },
        { slot: 1, intent: "重复关系" },
      ]),
      "<!-- SLOT_IMG_00_INFOGRAPHIC -->\n\n<!-- SLOT_IMG_01_FIRST -->",
    );
    expect(duplicatePlan.ok).toBe(false);
    expect(duplicatePlan.errors.join("\n")).toContain("duplicate slot 1");
  });

  test("defaults legacy plans to adapter and requires producer for external nodes", () => {
    expect(normalizePromptSource(undefined)).toBe("adapter");

    const result = validateVisualPlanTopology(
      {
        cover: { intent: "中心" },
        infographic: { intent: "摘要", prompt_source: "external" },
        illustrations: [],
      },
      "<!-- SLOT_IMG_00_INFOGRAPHIC -->",
    );

    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toContain("image-plan.infographic.producer is required");
  });
});

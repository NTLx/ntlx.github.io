#!/usr/bin/env bun
/**
 * validation-lib.mjs regression tests.
 */

import { describe, test, expect } from "bun:test";
import { resolveSlotImageFile } from "../scripts/validation-lib.mjs";
import {
  normalizePromptSource,
  validateBaoyuDesign,
  validateSlotHeadInvariant,
  validateVisualCoverage,
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

function completeBaoyuPlan(body = []) {
  return {
    article_visual_design: { skill: "baoyu-article-illustrator" },
    cover: {
      intent: "封面中心",
      baoyu_design: { skill: "baoyu-cover-image", type: "conceptual", palette: "cool", rendering: "flat-vector" },
      contributors: [],
      prompt_source: "adapter",
    },
    infographic: {
      intent: "全文摘要",
      baoyu_design: { skill: "baoyu-infographic", layout: "bento-grid", style: "craft-handmade" },
      contributors: [],
      prompt_source: "adapter",
    },
    illustrations: body.map((slot) => ({
      slot,
      intent: `解释 ${slot}`,
      baoyu_design: { skill: "baoyu-article-illustrator", type: "framework", style: "minimal" },
      contributors: [],
      prompt_source: "adapter",
    })),
  };
}

describe("Baoyu visual design authority", () => {
  test("accepts SLOT00-only plans and records article-level design", () => {
    const plan = completeBaoyuPlan();
    expect(validateBaoyuDesign(plan)).toEqual([]);
    expect(validateVisualPlanTopology(plan, "<!-- SLOT_IMG_00_INFOGRAPHIC -->").ok).toBe(true);
  });

  test("requires the fixed core authority for cover, infographic, and body", () => {
    const cases = [
      ["cover", "baoyu-cover-image"],
      ["infographic", "baoyu-infographic"],
      ["body", "baoyu-article-illustrator"],
    ];
    for (const [asset, expected] of cases) {
      const plan = completeBaoyuPlan(asset === "body" ? [1] : []);
      const node = asset === "body" ? plan.illustrations[0] : plan[asset];
      node.baoyu_design.skill = "random-skill";
      const errors = validateBaoyuDesign(plan).join("\n");
      expect(errors).toContain(`must be ${expected}`);
    }
  });

  test("accepts baoyu-diagram and future skills as contributors without routing", () => {
    const plan = completeBaoyuPlan([1]);
    plan.infographic.contributors = ["baoyu-diagram", "future-specialized-skill"];
    plan.illustrations[0].contributors = ["future-skill"];
    expect(validateBaoyuDesign(plan)).toEqual([]);
  });

  test("keeps diagram structure from becoming final body prompt authority", () => {
    const plan = completeBaoyuPlan([1]);
    plan.illustrations[0].prompt_source = "external";
    plan.illustrations[0].producer = "baoyu-diagram";
    const errors = validateBaoyuDesign(plan).join("\n");
    expect(errors).toContain("baoyu-diagram may contribute diagram structure");
    expect(errors).toContain("final body raster prompt authority must remain baoyu-article-illustrator");
  });
});

function coveragePlan(coverage, illustrations = [], sourceImageReview = []) {
  return {
    article_visual_design: { skill: "baoyu-article-illustrator", coverage_review: coverage },
    illustrations,
    source_image_review: sourceImageReview,
  };
}

function bodyWithSections(...sections) {
  return `<!-- SLOT_IMG_00_INFOGRAPHIC -->\n\n${sections.map(([heading, content = "正文"]) => `## ${heading}\n\n${content}`).join("\n\n")}`;
}

describe("visual coverage and source disposition", () => {
  test("allows zero body images when every substantive H2 is reviewed as text-only", () => {
    const body = bodyWithSections(["A"], ["B"], ["C"]);
    const result = validateVisualCoverage(coveragePlan([
      { section_index: 1, heading: "A", decision: "text-only", reason: "观点递进已经足够清楚" },
      { section_index: 2, heading: "B", decision: "text-only", reason: "没有额外结构信息" },
      { section_index: 3, heading: "C", decision: "text-only", reason: "图示不会降低理解成本" },
    ]), body);
    expect(result.ok).toBe(true);
  });

  test("requires exactly one decision for every substantive H2", () => {
    const body = bodyWithSections(["A"], ["B"], ["C"]);
    const result = validateVisualCoverage(coveragePlan([
      { section_index: 1, heading: "A", decision: "text-only", reason: "理由" },
      { section_index: 2, heading: "B", decision: "text-only", reason: "理由" },
    ]), body);
    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toContain("expected 3, found 2");
  });

  test("requires a reason for text-only and a real planned SLOT for illustrate", () => {
    const missingReason = validateVisualCoverage(coveragePlan([
      { section_index: 1, heading: "A", decision: "text-only", reason: "" },
    ]), bodyWithSections(["A"]));
    expect(missingReason.ok).toBe(false);
    expect(missingReason.errors.join("\n")).toContain("reason must be a non-empty string");

    const missingSlot = validateVisualCoverage(coveragePlan([
      { section_index: 1, heading: "A", decision: "illustrate", slot: 1, reason: "需要一张结构图" },
    ], []), bodyWithSections(["A"]));
    expect(missingSlot.ok).toBe(false);
    expect(missingSlot.errors.join("\n")).toContain("missing SLOT_IMG_01");
  });

  test("requires the illustrate SLOT to belong to the declared section", () => {
    const body = `<!-- SLOT_IMG_00_INFOGRAPHIC -->\n\n## A\n\n正文\n\n## B\n\n<!-- SLOT_IMG_01_RELATION -->\n`;
    const result = validateVisualCoverage(coveragePlan([
      { section_index: 1, heading: "A", decision: "illustrate", slot: 1, reason: "关系图" },
      { section_index: 2, heading: "B", decision: "text-only", reason: "文字足够" },
    ], [{ slot: 1 }]), body);
    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toContain("belongs to section_index 2");
  });

  test("requires reuse-source to reference a reviewed body source image", () => {
    const body = bodyWithSections(["A", "![](imgs/original.png)"]);
    const valid = validateVisualCoverage(coveragePlan([
      { section_index: 1, heading: "A", decision: "reuse-source", source: "original.png", reason: "原图就是本节证据" },
    ], [], [{ source: "original.png", decision: "body", reason: "承载关键关系" }]), body);
    expect(valid.ok).toBe(true);

    const missing = validateVisualCoverage(coveragePlan([
      { section_index: 1, heading: "A", decision: "reuse-source", source: "original.png", reason: "原图" },
    ]), body);
    expect(missing.ok).toBe(false);
    expect(missing.errors.join("\n")).toContain("source_image_review decision=body or both");
  });

  test("cover-only source disposition is not body reuse and discard needs a reason", () => {
    const body = bodyWithSections(["A"]);
    const coverOnly = validateVisualCoverage(coveragePlan([
      { section_index: 1, heading: "A", decision: "text-only", reason: "原图只适合作为封面" },
    ], [], [{ source: "original.png", decision: "cover-only", reason: "缩略图识别度更好" }]), body);
    expect(coverOnly.ok).toBe(true);

    const badDiscard = validateVisualCoverage(coveragePlan([
      { section_index: 1, heading: "A", decision: "text-only", reason: "无需正文图" },
    ], [], [{ source: "unused.png", decision: "discard", reason: "" }]), body);
    expect(badDiscard.ok).toBe(false);
    expect(badDiscard.errors.join("\n")).toContain("reason must be a non-empty string");
  });
});

describe("SLOT_IMG_00 head invariant", () => {
  test("requires SLOT00 exactly in the lead and as the first body visual", () => {
    expect(validateSlotHeadInvariant("<!-- SLOT_IMG_00_INFOGRAPHIC -->\n\nintro\n\n## A\n")).toEqual([]);
    expect(validateSlotHeadInvariant("## A\n\n正文\n\n<!-- SLOT_IMG_00_INFOGRAPHIC -->")).toContain(
      "SLOT_IMG_00_INFOGRAPHIC must appear before the first substantive H2 in the lead area",
    );
    expect(validateSlotHeadInvariant("![](imgs/original.png)\n\n<!-- SLOT_IMG_00_INFOGRAPHIC -->\n\n## A\n")).toContain("SLOT_IMG_00_INFOGRAPHIC must be the first body visual image");
  });
});

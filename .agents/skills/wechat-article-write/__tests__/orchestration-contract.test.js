import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const skillDir = resolve(import.meta.dir, "..");
const skill = readFileSync(resolve(skillDir, "SKILL.md"), "utf8");
const delegated = readFileSync(resolve(skillDir, "references", "delegated-execution.md"), "utf8");
const imagePolicy = readFileSync(resolve(skillDir, "references", "image-policy.md"), "utf8");
const parentExtend = readFileSync(resolve(skillDir, "EXTEND.md"), "utf8");
const checkDeps = readFileSync(resolve(skillDir, "scripts", "check-deps.mjs"), "utf8");
const architectureValidator = readFileSync(resolve(skillDir, "scripts", "validate-architecture.mjs"), "utf8");
const stateLib = readFileSync(resolve(skillDir, "scripts", "state-lib.mjs"), "utf8");

describe("orchestration contract", () => {
  test("keeps Main planning-only", () => {
    expect(skill).toContain("Main MUST NOT directly execute actual work");
    expect(skill).toContain("proceed/retry/reroute/blocked");
    expect(skill).toContain('version: "2.10.0"');
    expect(skill).toContain("state v2");
    expect(stateLib).toContain("v2");
    expect(delegated).toContain("Main MUST NOT fallback to direct execution");
  });

  test("keeps execution runtime-neutral and isolated", () => {
    expect(skill).toContain("references/delegated-execution.md");
    expect(delegated).toContain("runtime-neutral");
    expect(delegated).toContain("Execution capsule");
    expect(delegated).toContain("Bounded handoff");
    expect(delegated).toContain("fresh execution context");
    expect(delegated).not.toContain("Execution-unit matrix");
    expect(delegated).not.toContain("workflow-specific");
    expect(skill).not.toContain("PIPELINE_AUTO");
    expect(skill).not.toContain("agent-id");
  });

  test("keeps fixed direct Specialist routing in the Parent workflow", () => {
    for (const [unit, specialist] of [
      ["humanization / Step 3", "humanizer-zh"],
      ["cover", "baoyu-cover-image"],
      ["SLOT00", "baoyu-infographic"],
      ["generated body visual", "baoyu-infographic"],
      ["image hosting / Step 5A", "github-image-hosting"],
      ["WeChat layout / Step 5B", "gzh-design"],
      ["WeChat publish", "baoyu-post-to-wechat"],
    ]) {
      const route = skill.split("\n").find((line) => line.includes(`| ${unit} |`));
      expect(route).toContain(specialist);
    }
  });

  test("keeps visual policy separate from Specialist implementation", () => {
    expect(imagePolicy).toContain("prefer-reuse");
    expect(imagePolicy).toContain("Visual coverage");
    expect(imagePolicy).not.toContain(["baoyu", "image-gen"].join("-"));
    expect(imagePolicy).not.toContain("preferred_style");
    expect(imagePolicy).not.toContain("default_provider");
    expect(imagePolicy).not.toContain("固定业务映射");
  });

  test("limits Parent EXTEND to Parent-owned keys", () => {
    const keys = [...parentExtend.matchAll(/^([\w-]+):/gmu)].map((match) => match[1]);
    expect(keys).toEqual(["default_author", "default_author_bio"]);
    for (const forbidden of ["preferred_style", "preferred_image_backend", "default_provider"]) {
      expect(parentExtend).not.toContain(`${forbidden}:`);
    }
  });

  test("removes duplicate workflow/config artifacts from the Parent", () => {
    const removedOverview = ["pipeline", "overview.md"].join("-");
    const oldContractTest = ["native", "delegation.test.js"].join("-");
    expect(existsSync(resolve(skillDir, "references", removedOverview))).toBe(false);
    expect(existsSync(resolve(skillDir, "__tests__", "project-config.test.js"))).toBe(false);
    expect(existsSync(resolve(skillDir, "__tests__", oldContractTest))).toBe(false);
    expect(skill).not.toContain(removedOverview);
    expect(skill).not.toContain(["2", "9", "0"].join("."));
  });

  test("keeps dependency checks at the direct Specialist boundary", () => {
    for (const name of [
      "humanizer-zh", "baoyu-cover-image", "baoyu-infographic",
      "github-image-hosting", "gzh-design", "baoyu-post-to-wechat",
    ]) expect(checkDeps).toContain(name);
    for (const detail of [["baoyu", "image-gen"].join("-"), "baoyu-diagram", "default_provider", "preferred_image_backend"]) {
      expect(checkDeps).not.toContain(detail);
      expect(architectureValidator).not.toContain(detail);
    }
    expect(architectureValidator).not.toContain("readProjectExtend");
    expect(architectureValidator).not.toContain('from "yaml"');
  });
});

describe("governance compatibility adapters", () => {
  test("keeps canonical governance in AGENTS.md", () => {
    expect(readFileSync(resolve(skillDir, "../../..", "AGENTS.md"), "utf8"))
      .toContain("唯一共享权威源");
    expect(readFileSync(resolve(skillDir, "../../..", "CLAUDE.md"), "utf8").trim()).toBe("@AGENTS.md");
    expect(readFileSync(resolve(skillDir, "../../..", "src/content/CLAUDE.md"), "utf8").trim()).toBe("@AGENTS.md");
    expect(existsSync(resolve(skillDir, "../../..", ".agents", "AGENTS.md"))).toBe(false);
  });
});

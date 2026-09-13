import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const skillDir = resolve(import.meta.dir, "..");
const skill = readFileSync(resolve(skillDir, "SKILL.md"), "utf8");
const research = readFileSync(resolve(skillDir, "references", "research-delegation.md"), "utf8");
const imagePolicy = readFileSync(resolve(skillDir, "references", "image-policy.md"), "utf8");
const gzhAdapter = readFileSync(resolve(skillDir, "references", "adapter-gzh-design.md"), "utf8");
const troubleshooting = readFileSync(resolve(skillDir, "references", "troubleshooting.md"), "utf8");
const parentExtend = readFileSync(resolve(skillDir, "EXTEND.md"), "utf8");
const checkDeps = readFileSync(resolve(skillDir, "scripts", "check-deps.mjs"), "utf8");
const architectureValidator = readFileSync(resolve(skillDir, "scripts", "validate-architecture.mjs"), "utf8");
const stateLib = readFileSync(resolve(skillDir, "scripts", "state-lib.mjs"), "utf8");

describe("orchestration contract", () => {
  test("makes Main the default executor", () => {
    expect(skill).toContain('version: "3.0.0"');
    expect(skill).toContain("## Execution model");
    expect(skill).toContain("Main is the default executor");
    expect(skill).toContain("Main directly owns");
    expect(skill).toContain("Main directly creates `draft.md`");
    expect(skill).toContain("Main directly runs");
    expect(skill).toContain("State remains v2");
    expect(stateLib).toContain("v2");
    expect(skill).not.toContain("Main MUST NOT directly execute actual work");
    expect(skill).not.toContain("planning-only");
  });

  test("delegates only context-heavy background research by default", () => {
    expect(skill).toContain("Background research may be delegated");
    expect(research).toContain("only normal Agent boundary");
    expect(research).toContain("external\nretrieval");
    expect(research).toContain("compact evidence summary");
    expect(research).toContain("不生成 draft");
    expect(research).not.toContain("生成整篇文章");
  });

  test("keeps primary-source understanding in Main", () => {
    expect(skill).toContain("Main reads and understands the primary source directly");
    expect(skill).toContain("must not replace Main's primary-source understanding");
    expect(research).toContain("Primary sources supplied by the user");
    expect(research).toContain("directly by Main");
  });

  test("does not equate Specialist Skills with Agent contexts", () => {
    expect(skill).toContain("Skill invocation does not imply an Agent context");
    expect(skill).toContain("mandatory Skill does not mean mandatory child Agent");
    expect(skill).toContain("This is a Skill retry");
    expect(skill).toContain("not a new Agent context");
  });

  test("lets Main run deterministic Gates and scripts", () => {
    expect(skill).toContain("Main directly runs:");
    for (const script of [
      "state.mjs init", "step1-collect.mjs", "select-related-articles.mjs", "validate-understanding.mjs",
      "step2-write.mjs", "step3-polish.mjs", "step4-images.mjs", "step5-build.mjs", "publish-blog.mjs",
      "publish-wechat.mjs",
    ]) expect(skill).toContain(script);
    expect(architectureValidator).toContain("pipeline must remain advisory and non-orchestrating");
  });

  test("keeps mandatory Specialist workflows without requiring isolated Executors", () => {
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
    expect(checkDeps).toContain("humanizer-zh");
    expect(checkDeps).toContain("gzh-design");
  });

  test("repairs Step 5 locally before any frozen-source rebuild", () => {
    const localRepair = skill.indexOf("owner-local repair");
    const rebuild = skill.indexOf("a repeated failure class", localRepair);
    expect(localRepair).toBeGreaterThanOrEqual(0);
    expect(rebuild).toBeGreaterThan(localRepair);
    expect(gzhAdapter).toContain("current `article-wechat.html`");
    expect(gzhAdapter).toContain("frozen `article-wechat-source.md`");
    expect(gzhAdapter).toContain("不创建新的 Agent context");
    expect(troubleshooting).toContain("Retry locally before changing context");
  });

  test("keeps native validator errors blocking and warnings advisory", () => {
    expect(gzhAdapter).toContain("Native gzh-design ERROR count must be 0");
    expect(gzhAdapter).toContain("Native WARNING is advisory");
    expect(gzhAdapter).toContain("Do not mutate source-visible article text solely to eliminate a WARNING");
    expect(gzhAdapter).toContain("Content preservation takes precedence over cosmetic warning cleanup");
  });

  test("removes phase Executor and model-context budgeting contracts", () => {
    for (const obsolete of [
      "Model Context Budget", "5–7", "5-7 contexts", "Subthread Admission", "phase Executor",
      "Writing phase", "Visual phase", "Build phase", "Publish phase", "RETRY_REQUIRED",
      "fresh Build", "bounded handoff", "Main MUST NOT fallback to direct execution",
    ]) {
      expect(skill).not.toContain(obsolete);
      expect(research).not.toContain(obsolete);
      expect(gzhAdapter).not.toContain(obsolete);
      expect(troubleshooting).not.toContain(obsolete);
    }
    expect(skill).toContain("An additional model context\nis exceptional");
    expect(skill).not.toContain("context count");
    expect(existsSync(resolve(skillDir, "references", "delegated-execution.md"))).toBe(false);
  });

  test("keeps deterministic quality Gates unchanged", () => {
    for (const contract of [
      "Primary Source provenance", "source uniqueness", "understanding-brief.md", "step3_draft_sha256",
      "visual coverage", "image-plan.json", "structural parity", "publish freshness", "last_complete_step",
      "publish.blog", "publish.wechat",
    ]) expect(skill).toContain(contract);
    expect(readFileSync(resolve(skillDir, "scripts", "wechat-structure-lib.mjs"), "utf8"))
      .toContain("structural-parity/mixed");
  });

  test("keeps visual policy and Parent configuration boundaries", () => {
    expect(imagePolicy).toContain("prefer-reuse");
    expect(imagePolicy).toContain("Visual coverage");
    expect(imagePolicy).not.toContain(["baoyu", "image-gen"].join("-"));
    expect(imagePolicy).not.toContain("preferred_style");
    const keys = [...parentExtend.matchAll(/^([\w-]+):/gmu)].map((match) => match[1]);
    expect(keys).toEqual(["default_author", "default_author_bio"]);
    expect(architectureValidator).not.toContain("readProjectExtend");
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

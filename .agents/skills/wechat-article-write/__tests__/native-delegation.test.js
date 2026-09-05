import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const skillDir = resolve(import.meta.dir, "..");
const skill = readFileSync(resolve(skillDir, "SKILL.md"), "utf8");

describe("thin orchestrator architecture", () => {
  test("keeps Main planning-only and routes execution through isolated executors", () => {
    expect(skill).toContain("## Main Agent execution boundary");
    expect(skill).toContain("Main Agent MUST NOT directly");
    for (const phrase of ["Execution Unit", "Delegated Executor", "isolated execution context", "dispatch"]) {
      expect(skill).toContain(phrase);
    }
    for (const forbidden of [
      "抓取网页", "编写 `materials.md`", "编写 `draft.md`", "编写 HTML", "commit / push", "运行 Step scripts",
    ]) expect(skill).toContain(forbidden);
  });

  test("keeps execution mechanism runtime-neutral", () => {
    for (const phrase of [
      "runtime-native isolation mechanism",
      "Main chooses",
      "These are examples, not required implementations",
      "no suitable isolated delegated-execution mechanism",
      "Main MUST NOT fallback to direct execution",
      "Skill-via-Executor",
    ]) expect(skill).toContain(phrase);
    expect(skill).not.toContain(["native", "Subagent", "capability unavailable"].join(" "));
    expect(skill).not.toContain(["Worker", "Subagent"].join(" "));
    expect(skill).toContain('version: "2.8.0"');
    expect(skill).toContain("Primary Source Uniqueness");
    expect(skill).toContain("primarySourceUrls");

    const reference = readFileSync(resolve(skillDir, "references", "delegated-execution.md"), "utf8");
    expect(reference).toContain("Delegated Executor capability contract");
    expect(reference).toContain("Execution-unit matrix");
    expect(reference).toContain("Delegated Execution Fidelity E2E");
    expect(reference).not.toContain(["Subagent", "Execution Fidelity"].join(" "));
    expect(existsSync(resolve(skillDir, "references", ["subagent", "execution.md"].join("-")))).toBe(false);
  });

  test("keeps the fixed native delegation mapping in the active instructions", () => {
    for (const [asset, delegatedSkill] of [
      ["cover", "baoyu-cover-image"],
      ["SLOT_IMG_00", "baoyu-xhs-images"],
      ["正文生成图", "baoyu-infographic"],
      ["humanize", "humanizer-zh"],
      ["gzh-design", "gzh-design"],
      ["图片托管/CDN", "github-image-hosting"],
      ["微信草稿", "baoyu-post-to-wechat"],
    ]) {
      expect(skill).toContain(asset);
      expect(skill).toContain(delegatedSkill);
    }
    expect(skill).toContain("--quick");
    expect(skill).toContain("--aspect 2.35:1");
    expect(skill).toContain("--no-title");
    expect(skill).toContain("--yes");
    expect(skill).toContain("--batch-size 1");
    expect(skill).toContain("--no-confirm");
  });

  test("keeps child-owned validators, uploaders, and publishers out of parent production code", () => {
    const scripts = ["publish-wechat.mjs", "step5-build.mjs", "step5-lib.mjs", "config-lib.mjs", "check-deps.mjs", "pipeline.mjs"];
    for (const name of scripts) {
      const source = readFileSync(resolve(skillDir, "scripts", name), "utf8");
      for (const token of [
        "wechat-api.ts", "BAOYU_POST_TO_WECHAT_BIN", "resolveWechatApiScript", "ensureDepsInstalled",
        "github-image-hosting/scripts/upload", "gzh-design/scripts/validate_gzh_html.py", "gzh-design/scripts/wrap_preview.py",
      ]) expect(source).not.toContain(token);
    }
  });

  test("does not advertise a retired orchestration layer", () => {
    expect(skill).not.toMatch(/skill-catalog|orchestration-trace|DESIGN-ONLY|render-images-serial|image-review receipt|mark-humanized/iu);
    expect(skill).not.toContain("baoyu-article-illustrator");
    expect(existsSync(resolve(skillDir, "scripts", "workflow.mjs"))).toBe(false);
    expect(existsSync(resolve(skillDir, "scripts", "render-images-serial.mjs"))).toBe(false);
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

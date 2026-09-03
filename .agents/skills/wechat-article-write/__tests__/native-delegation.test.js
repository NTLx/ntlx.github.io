import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const skillDir = resolve(import.meta.dir, "..");
const skill = readFileSync(resolve(skillDir, "SKILL.md"), "utf8");

describe("thin orchestrator architecture", () => {
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

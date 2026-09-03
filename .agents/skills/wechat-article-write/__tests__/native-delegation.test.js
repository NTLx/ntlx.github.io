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
      ["generated body visual", "baoyu-infographic"],
      ["humanize", "humanizer-zh"],
      ["gzh-design", "gzh-design"],
    ]) {
      expect(skill).toContain(asset);
      expect(skill).toContain(delegatedSkill);
    }
  });

  test("does not advertise a retired orchestration layer", () => {
    expect(skill).not.toMatch(/skill-catalog|orchestration-trace|DESIGN-ONLY|render-images-serial|image-review receipt|mark-humanized/iu);
    expect(existsSync(resolve(skillDir, "scripts", "workflow.mjs"))).toBe(false);
    expect(existsSync(resolve(skillDir, "scripts", "render-images-serial.mjs"))).toBe(false);
  });
});

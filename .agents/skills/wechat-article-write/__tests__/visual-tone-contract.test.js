import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const skillDir = resolve(import.meta.dir, "..");
const baoyuRoot = resolve(skillDir, "../../..", ".baoyu-skills");
const extend = (name) => readFileSync(resolve(baoyuRoot, name, "EXTEND.md"), "utf8");

const coverConfig = extend("baoyu-cover-image");
const infographicConfig = extend("baoyu-infographic");
const illustratorConfig = extend("baoyu-article-illustrator");
const imageGenConfig = extend("baoyu-image-gen");
const skill = readFileSync(resolve(skillDir, "SKILL.md"), "utf8");
const imagePolicy = readFileSync(resolve(skillDir, "references", "image-policy.md"), "utf8");

const TONE_ZH = "明亮、鲜艳、高饱和、高对比；背景干净，边缘清晰，情绪温暖积极。";
const TONE_EN = "Bright, vivid, high-saturation and high-contrast visual language";

describe("project-wide generated-image tone", () => {
  test("declares the canonical tone once in the image policy", () => {
    expect(imagePolicy).toContain(TONE_ZH);
    expect(imagePolicy).toContain(TONE_EN);
    expect(imagePolicy).toContain("art-direction overlay");
  });

  test("keeps the tone an overlay instead of restyling source evidence", () => {
    expect(imagePolicy).toContain("never regenerated or restyled");
    expect(imagePolicy).toContain("structural visual judgement");
  });

  test("hands the tone to every visual owner from the Step 4 contract", () => {
    expect(skill).toContain(TONE_ZH);
    expect(skill).toContain(TONE_EN);
    expect(skill).toContain("It is an art-direction overlay");
  });

  test("reviews tone coherence and returns deviations to the owning Skill", () => {
    expect(imagePolicy).toContain("project-wide tone coherence");
    expect(imagePolicy).toContain("交回同一 owner");
    expect(skill).toContain("tone deviations");
  });

  test("keeps the raster backend free of style, palette, and tone configuration", () => {
    for (const key of ["preferred_style", "preferred_palette", "style", "palette", "tone"]) {
      expect(imageGenConfig).not.toMatch(new RegExp(`^${key}`, "mu"));
    }
  });
});

describe("project visual preferences", () => {
  test("pins the cover to the bright-vivid-warm, textless, bold 2.35:1 policy", () => {
    expect(coverConfig).toMatch(/^preferred_palette: bright-vivid-warm$/mu);
    expect(coverConfig).toMatch(/^preferred_mood: bold$/mu);
    expect(coverConfig).toMatch(/^preferred_text: none$/mu);
    expect(coverConfig).toMatch(/^default_aspect: "2\.35:1"$/mu);
    expect(coverConfig).toMatch(/^  - name: bright-vivid-warm$/mu);
  });

  test("leaves the cover type and rendering to article semantics", () => {
    expect(coverConfig).toMatch(/^preferred_type: null$/mu);
    expect(coverConfig).toMatch(/^preferred_rendering: null$/mu);
  });

  test("pins the lead infographic to claymation and landscape", () => {
    expect(infographicConfig).toMatch(/^preferred_style: claymation$/mu);
    expect(infographicConfig).toMatch(/^preferred_aspect: landscape$/mu);
    expect(infographicConfig).toMatch(/^language: zh$/mu);
  });

  test("leaves the infographic layout to its own content analysis", () => {
    expect(infographicConfig).toMatch(/^preferred_layout: null$/mu);
    expect(skill).not.toMatch(/--layout/u);
  });

  test("does not shadow the claymation owner with a composite custom style", () => {
    expect(infographicConfig).not.toContain("bright-vivid-warm");
    expect(illustratorConfig).not.toContain("bright-vivid-warm");
  });

  test("pins the illustrator to notion with the macaron palette", () => {
    expect(illustratorConfig).toMatch(/^preferred_style:\n\s+name: notion$/mu);
    expect(illustratorConfig).toMatch(/^preferred_palette: macaron$/mu);
    expect(illustratorConfig).toMatch(/^default_output_dir: imgs-subdir$/mu);
  });

  test("keeps every raster owner on the shared backend", () => {
    for (const config of [coverConfig, infographicConfig, illustratorConfig]) {
      expect(config).toMatch(/^preferred_image_backend: baoyu-image-gen$/mu);
    }
  });
});

describe("generation batch size", () => {
  const extendFiles = readdirSync(baoyuRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(resolve(baoyuRoot, entry.name, "EXTEND.md")))
    .map((entry) => [entry.name, readFileSync(resolve(baoyuRoot, entry.name, "EXTEND.md"), "utf8")]);

  test("serializes every generation_batch_size the project actually sets", () => {
    const found = extendFiles.flatMap(([name, text]) =>
      [...text.matchAll(/^generation_batch_size:\s*(\S+)$/gmu)].map((match) => [name, match[1]]));
    expect(found.length).toBeGreaterThan(0);
    for (const [name, value] of found) expect(`${name}: ${value}`).toBe(`${name}: 1`);
  });

  test("keeps the illustrator serial", () => {
    expect(illustratorConfig).toMatch(/^generation_batch_size: 1$/mu);
  });

  test("does not pollute Skills whose EXTEND schema lacks the field", () => {
    expect(coverConfig).not.toContain("generation_batch_size");
    expect(infographicConfig).not.toContain("generation_batch_size");
  });
});

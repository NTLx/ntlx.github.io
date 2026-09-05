import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "yaml";

const repoRoot = resolve(import.meta.dir, "../../../../");

function readExtend(name) {
  const path = resolve(repoRoot, ".baoyu-skills", name, "EXTEND.md");
  expect(existsSync(path)).toBe(true);
  const raw = readFileSync(path, "utf8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\s*$/u);
  expect(match).not.toBeNull();
  return parse(match[1]);
}

describe("project-level image Skill preferences", () => {
  test("uses native schemas and pins the Codex image chain", () => {
    const cover = readExtend("baoyu-cover-image");
    const infographic = readExtend("baoyu-infographic");
    const imageGen = readExtend("baoyu-image-gen");

    expect(cover.version).toBe(3);
    expect(cover.default_aspect).toBe("2.35:1");
    expect(cover.preferred_text).toBe("none");
    expect(cover.quick_mode).toBe(true);
    expect(cover.language).toBe("zh");
    expect(cover.preferred_image_backend).toBe("baoyu-image-gen");
    expect(cover.custom_palettes.some(({ name }) => name === "bright-vivid-warm")).toBe(true);

    expect(infographic.version).toBe(1);
    expect(infographic.language).toBe("zh");
    expect(infographic.preferred_image_backend).toBe("baoyu-image-gen");
    expect(infographic.preferred_layout).toBeNull();
    expect(Object.hasOwn(infographic, "preferred_style")).toBe(true);
    expect(typeof infographic.preferred_style).toBe("string");
    expect(Array.isArray(infographic.custom_styles)).toBe(true);

    expect(imageGen.version).toBe(1);
    expect(imageGen.default_provider).toBe("codex-cli");
    expect(imageGen.default_model?.["codex-cli"]).toBeUndefined();
  });

  test("keeps visual preferences with the visual Skills", () => {
    const parent = readFileSync(resolve(repoRoot, ".agents/skills/wechat-article-write/EXTEND.md"), "utf8");
    expect(parent).not.toMatch(/^visual_/mu);
    expect(parent).not.toMatch(/^default_publish_method:/mu);
    expect(parent).not.toMatch(/^wechat_layout_generate_preview:/mu);
    expect(parent).toContain("source_image_policy: prefer-reuse");
  });

  test("keeps WeChat publishing preferences with the publishing Skill", () => {
    const path = resolve(repoRoot, ".baoyu-skills/baoyu-post-to-wechat/EXTEND.md");
    expect(existsSync(path)).toBe(true);
    const child = readFileSync(path, "utf8");
    expect(child).toMatch(/^default_publish_method:\s*api\s*$/mu);
    expect(child).toMatch(/^default_author:\s*NTLx\s*$/mu);
  });
});

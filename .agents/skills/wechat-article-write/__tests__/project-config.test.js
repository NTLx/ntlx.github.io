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
    const xhs = readExtend("baoyu-xhs-images");
    const infographic = readExtend("baoyu-infographic");
    const imageGen = readExtend("baoyu-image-gen");

    expect(cover.version).toBe(3);
    expect(cover.default_aspect).toBe("2.35:1");
    expect(cover.preferred_text).toBe("none");
    expect(cover.quick_mode).toBe(true);
    expect(cover.language).toBe("zh");
    expect(cover.preferred_image_backend).toBe("baoyu-image-gen");
    expect(cover.custom_palettes.some(({ name }) => name === "bright-vivid-warm")).toBe(true);

    expect(xhs.version).toBe(1);
    expect(xhs.watermark.enabled).toBe(false);
    expect(xhs.language).toBe("zh");
    expect(xhs.preferred_image_backend).toBe("baoyu-image-gen");
    expect(xhs.generation_batch_size).toBe(1);
    expect(xhs.preferred_style.name).toBe("bright-vivid-warm");
    expect(xhs.custom_styles.some(({ name }) => name === "bright-vivid-warm")).toBe(true);

    expect(infographic.version).toBe(1);
    expect(infographic.language).toBe("zh");
    expect(infographic.preferred_image_backend).toBe("baoyu-image-gen");
    expect(infographic.preferred_layout).toBeNull();
    expect(infographic.preferred_style).toBe("bright-vivid-warm");
    expect(infographic.custom_styles.some(({ name }) => name === "bright-vivid-warm")).toBe(true);

    expect(imageGen.version).toBe(1);
    expect(imageGen.default_provider).toBe("codex-cli");
  });
});

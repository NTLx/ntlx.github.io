import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const skillDir = resolve(import.meta.dir, "..");
const repoRoot = resolve(skillDir, "../../..");
const manifestPath = resolve(skillDir, "evals/golden-set.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

describe("editorial regression corpus", () => {
  test("keeps a bounded stable corpus", () => {
    expect(manifest.schema_version).toBe(1);
    expect(manifest.cases.length).toBeGreaterThanOrEqual(10);
    expect(manifest.cases.length).toBeLessThanOrEqual(20);
    expect(new Set(manifest.cases.map((item) => item.id)).size).toBe(manifest.cases.length);
    expect(new Set(manifest.cases.map((item) => item.path)).size).toBe(manifest.cases.length);
  });

  test("points only to tracked reader-facing production artifacts", () => {
    for (const item of manifest.cases) {
      expect(item.path.startsWith("src/content/docs/")).toBe(true);
      expect(item.path.endsWith(".md")).toBe(true);
      expect(existsSync(resolve(repoRoot, item.path))).toBe(true);
      expect(typeof item.archetype).toBe("string");
      expect(item.archetype.length).toBeGreaterThan(0);
      expect(Array.isArray(item.focus)).toBe(true);
      expect(item.focus.length).toBeGreaterThanOrEqual(3);
    }
  });

  test("covers multiple known editorial failure surfaces", () => {
    const focus = new Set(manifest.cases.flatMap((item) => item.focus));
    for (const expected of [
      "factual-fidelity",
      "original-judgement",
      "natural-language",
      "visual-explanation",
      "wechat-layout",
      "long-context",
      "temporal-regression",
    ]) {
      expect(focus.has(expected)).toBe(true);
    }
  });

  test("keeps editorial quality distinct from deterministic gates", () => {
    const policy = readFileSync(resolve(skillDir, "references/editorial-evaluation.md"), "utf8");
    expect(policy).toContain("do not prove that an article is good");
    expect(policy).toContain("Do not collapse them into one composite score");
    expect(policy).toContain("does not require a new persistent artifact or another blocking Gate");
  });
});

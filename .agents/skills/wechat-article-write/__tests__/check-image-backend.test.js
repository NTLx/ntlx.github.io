#!/usr/bin/env bun

import { describe, expect, test } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { runImageBackendChecks } from "../scripts/check-image-backend.mjs";

function createValidFixture(root) {
  mkdirSync(join(root, ".baoyu-skills", "baoyu-image-gen"), { recursive: true });
  writeFileSync(join(root, ".baoyu-skills", "baoyu-image-gen", "EXTEND.md"), "---\nversion: 1\ndefault_provider: codex-cli\n---\n");
  for (const skill of ["baoyu-cover-image", "baoyu-article-illustrator", "baoyu-infographic"]) {
    mkdirSync(join(root, ".agents", "skills", skill), { recursive: true });
    mkdirSync(join(root, ".baoyu-skills", skill), { recursive: true });
    writeFileSync(join(root, ".agents", "skills", skill, "SKILL.md"), `---\nname: ${skill}\n---\n`);
    writeFileSync(join(root, ".baoyu-skills", skill, "EXTEND.md"), "---\nversion: 1\npreferred_image_backend: baoyu-image-gen\n---\n");
  }
}

describe("image backend policy preflight", () => {
  test("accepts the project Codex routing contract", () => {
    const root = join(tmpdir(), `image-backend-valid-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    try {
      createValidFixture(root);
      const result = runImageBackendChecks({ root, checkCli: false, checkEnv: false });
      expect(result.ok).toBe(true);
      expect(result.details.default_provider).toBe("codex-cli");
      expect(result.details.high_level["baoyu-article-illustrator"].preferred_image_backend).toBe("baoyu-image-gen");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test("rejects a non-Codex default without inspecting provider credentials", () => {
    const root = join(tmpdir(), `image-backend-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    try {
      mkdirSync(join(root, ".baoyu-skills", "baoyu-image-gen"), { recursive: true });
      writeFileSync(join(root, ".baoyu-skills", "baoyu-image-gen", "EXTEND.md"), "---\nversion: 1\ndefault_provider: openai\n---\n");
      const result = runImageBackendChecks({ root, checkCli: false, checkEnv: false });
      expect(result.ok).toBe(false);
      expect(result.errors.join("\n")).toContain("default_provider must be codex-cli");
      expect(JSON.stringify(result)).not.toMatch(/api[_ -]?key|secret|token/i);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

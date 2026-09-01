#!/usr/bin/env bun

import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { buildSkillCatalog, parseSkillFrontmatter } from "../scripts/skill-catalog.mjs";

function fixtureRoot() {
  return join(tmpdir(), `skill-catalog-${Date.now()}-${Math.random().toString(36).slice(2)}`);
}

describe("runtime Skill catalog", () => {
  const cleanup = [];

  afterEach(() => {
    for (const dir of cleanup.splice(0)) rmSync(dir, { recursive: true, force: true });
  });

  test("discovers a newly installed Skill without a workflow route", () => {
    const root = fixtureRoot();
    cleanup.push(root);
    mkdirSync(join(root, "future-capability"), { recursive: true });
    mkdirSync(join(root, "wechat-article-write"), { recursive: true });
    writeFileSync(join(root, "future-capability", "SKILL.md"), `---
name: future-capability
description: >-
  A future capability discovered from its own description.
version: 9.2.0
user_invocable: true
---
`);
    writeFileSync(join(root, "wechat-article-write", "SKILL.md"), "---\nname: wechat-article-write\n---\n");

    const catalog = buildSkillCatalog(root);
    expect(catalog).toEqual([{
      name: "future-capability",
      description: "A future capability discovered from its own description.",
      version: "9.2.0",
      user_invocable: true,
    }]);
  });

  test("reads metadata fields and supports folded frontmatter descriptions", () => {
    const fm = parseSkillFrontmatter(`---
name: sample
description: >-
  first line
  second line
metadata:
  version: "1.2.3"
  user_invocable: false
---
`);
    expect(fm.description).toBe("first line second line");
    expect(fm.metadata.version).toBe("1.2.3");
    expect(fm.metadata.user_invocable).toBe(false);
  });

  test("exposes baoyu-diagram as a discovered specialized capability", () => {
    const catalog = buildSkillCatalog(resolve(import.meta.dir, "..", ".."));
    const diagram = catalog.find((skill) => skill.name === "baoyu-diagram");
    expect(diagram).toBeDefined();
    expect(diagram.description).toContain("diagram");
  });
});

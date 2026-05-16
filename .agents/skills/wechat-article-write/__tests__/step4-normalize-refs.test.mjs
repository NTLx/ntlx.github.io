#!/usr/bin/env bun
/**
 * step4-normalize-refs.mjs 单元测试
 *
 * 测试 ![](imgs/...) → SLOT_IMG 还原 + 幂等性 + --dry-run
 */

import { describe, test, expect, beforeAll, afterAll, afterEach } from "bun:test";
import { mkdirSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const SCRIPTS_DIR = resolve(import.meta.dir, "../scripts");
const TMP = join(tmpdir(), `normalize-refs-test-${Date.now()}`);

function runNormalize(postDir, extraArgs = []) {
  return spawnSync("bun", ["run", join(SCRIPTS_DIR, "step4-normalize-refs.mjs"), postDir, ...extraArgs], {
    encoding: "utf8",
  });
}

describe("step4-normalize-refs", () => {
  beforeAll(() => {
    mkdirSync(TMP, { recursive: true });
  });

  afterEach(() => {
    try { rmSync(join(TMP, "*"), { recursive: true, force: true }); } catch {}
  });

  afterAll(() => {
    try { rmSync(TMP, { recursive: true, force: true }); } catch {}
  });

  test("将 ![](imgs/01-desc.png) 还原为 SLOT_IMG 占位符", () => {
    const draft = `---
title: "Test"
---

## 正文

![](imgs/01-architecture.png)

一些文字

![](imgs/02-flow.jpg)
`;
    writeFileSync(join(TMP, "draft.md"), draft);

    const r = runNormalize(TMP);
    expect(r.status).toBe(0);

    const result = readFileSync(join(TMP, "draft.md"), "utf8");
    expect(result).toContain("SLOT_IMG_01");
    expect(result).toContain("SLOT_IMG_02");
    // 原始 ![](imgs/...) 引用应被替换
    expect(result).not.toContain("![](imgs/01-architecture.png)");
    expect(result).not.toContain("![](imgs/02-flow.jpg)");
  });

  test("已是 SLOT_IMG 形式时不改动（幂等）", () => {
    const draft = `---
title: "Test"
---

## 正文

<!-- SLOT_IMG_01_architecture -->

一些文字
`;
    writeFileSync(join(TMP, "draft.md"), draft);

    const r = runNormalize(TMP);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("already in SLOT_IMG form");

    const result = readFileSync(join(TMP, "draft.md"), "utf8");
    expect(result).toContain("<!-- SLOT_IMG_01_architecture -->");
  });

  test("--dry-run 不实际修改文件", () => {
    const draft = `---
title: "Test"
---

![](imgs/01-desc.png)
`;
    writeFileSync(join(TMP, "draft.md"), draft);

    const r = runNormalize(TMP, ["--dry-run"]);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("[dry-run]");

    // 文件未被修改——imgs 引用仍然存在
    const result = readFileSync(join(TMP, "draft.md"), "utf8");
    expect(result).toContain("imgs/01-desc.png");
  });

  test("带 alt 文本的 ![alt](imgs/...) 还原时 alt 文本优先作为描述", () => {
    const draft = `---
title: "Test"
---

![架构图](imgs/01-architecture.png)
`;
    writeFileSync(join(TMP, "draft.md"), draft);

    const r = runNormalize(TMP);
    expect(r.status).toBe(0);

    const result = readFileSync(join(TMP, "draft.md"), "utf8");
    // alt 文本 "架构图" 优先于 slug "architecture"
    expect(result).toContain("SLOT_IMG_01_架构图");
  });

  test("缺失 draft.md 返回 exit 2", () => {
    const emptyDir = join(TMP, "empty");
    mkdirSync(emptyDir, { recursive: true });
    const r = runNormalize(emptyDir);
    expect(r.status).toBe(2);
  });

  test("无参数返回 exit 1", () => {
    const r = spawnSync("bun", ["run", join(SCRIPTS_DIR, "step4-normalize-refs.mjs")], {
      encoding: "utf8",
    });
    expect(r.status).toBe(1);
  });
});
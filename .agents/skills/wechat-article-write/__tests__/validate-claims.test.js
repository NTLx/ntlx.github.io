#!/usr/bin/env bun

import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const SCRIPT = join(import.meta.dir, "../scripts/validate-claims.mjs");
const REPO_ROOT = join(import.meta.dir, "../../../..");
const SLUG = "2026-09-14-claim-coverage";

function fixture() {
  const root = join(tmpdir(), `claims-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const dir = join(root, SLUG);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, ".pipeline-state.json"), JSON.stringify({
    slug: SLUG,
    strategy: "reader-response",
    last_complete_step: 3,
    publish: { blog: "pending", wechat: "pending" },
    failed_step: null,
  }) + "\n");
  return { root, dir };
}

function run(root, extra = []) {
  return spawnSync("bun", ["run", SCRIPT, SLUG, "--json", ...extra], {
    cwd: REPO_ROOT,
    env: { ...process.env, PIPELINE_POSTS_ROOT: root },
    encoding: "utf8",
  });
}

function write(dir, name, text) {
  writeFileSync(join(dir, name), text);
}

const ledger = (rows) => `# Understanding Brief\n\n## 允许援引的事实\n${rows}\n`;

describe("claim coverage Gate", () => {
  const cleanup = [];
  afterEach(() => {
    for (const dir of cleanup.splice(0)) rmSync(dir, { recursive: true, force: true });
  });

  test("passes when every claim is covered and writes nothing", () => {
    const fx = fixture();
    cleanup.push(fx.root);
    write(fx.dir, "draft.md", "---\ntitle: 恢复\n---\n\n一次失败后的协调耗时数天。\n");
    write(fx.dir, "understanding-brief.md", ledger('- 协调耗时数天 ← "took days"（原文）'));
    const stateBefore = readFileSync(join(fx.dir, ".pipeline-state.json"), "utf8");
    const filesBefore = readdirSync(fx.dir).sort();

    const result = run(fx.root);
    expect(result.status, result.stderr || result.stdout).toBe(0);
    const payload = JSON.parse(result.stdout);
    expect(payload.ok).toBe(true);
    expect(payload.ledger_rows).toBe(1);

    // A Step-3-adjacent Gate must stay read-only: no artifact, no state movement.
    expect(readFileSync(join(fx.dir, ".pipeline-state.json"), "utf8")).toBe(stateBefore);
    expect(readdirSync(fx.dir).sort()).toEqual(filesBefore);
  });

  test("flags the five real defects this Gate exists to catch", () => {
    const fx = fixture();
    cleanup.push(fx.root);
    write(fx.dir, "draft.md", [
      "---",
      "title: 技术债",
      "summary: OpenAI 主动欠的两笔债都还清了",
      "---",
      "",
      "他们花了几周想避免那次故障。这种规模的迁移从「一个团队半年」压缩到了「两个人一个季度」。",
      "Habitat 最早是 2024 年年中的一个 Python 库。MRU 和 LIFO 是同一件事的两种叫法。",
      "",
    ].join("\n"));
    write(fx.dir, "understanding-brief.md", ledger('- 一个无关登记 ← "unrelated"（原文）'));

    const result = run(fx.root, ["--all"]);
    expect(result.status).toBe(2);
    const payload = JSON.parse(result.stdout);
    const flagged = payload.uncovered.join("\n");
    expect(flagged).toContain("都还清了");            // frontmatter summary
    expect(flagged).toContain("几周");                // duration
    expect(flagged).toContain("从「一个团队半年」压缩到"); // fabricated counterfactual
    expect(flagged).toContain("2024 年");             // unadjudicated timeline
    expect(flagged).toContain("是同一件事");           // cross-source identity
    expect(payload.by_class.duration).toBeGreaterThan(0);
  });

  test("scans percentages and decimals as quantities", () => {
    const fx = fixture();
    cleanup.push(fx.root);
    write(fx.dir, "draft.md", "---\ntitle: t\n---\n\n新服务处理 95% 的生产请求，内存效率是 12.5% 的水平，单进程占用约 1.5 GB。\n");
    write(fx.dir, "understanding-brief.md", ledger('- 一个无关登记 ← "unrelated"（原文）'));
    const result = run(fx.root, ["--all"]);
    expect(result.status).toBe(2);
    const payload = JSON.parse(result.stdout);
    const flagged = payload.uncovered.join("\n");
    expect(flagged).toContain("95%");
    expect(flagged).toContain("12.5%");
    expect(flagged).toContain("1.5 GB");
    expect(payload.by_class.quantity).toBeGreaterThan(0);
  });

  test("treats a ledger row without a source/derived/rhetoric marker as structural failure", () => {
    const fx = fixture();
    cleanup.push(fx.root);
    write(fx.dir, "draft.md", "---\ntitle: t\n---\n\n恢复耗时数天。\n");
    write(fx.dir, "understanding-brief.md", ledger("- 协调耗时数天"));
    const result = run(fx.root);
    expect(result.status).toBe(2);
    expect(JSON.parse(result.stdout).errors[0]).toMatch(/missing source span/);
  });

  test("fails when the brief has no ledger section at all", () => {
    const fx = fixture();
    cleanup.push(fx.root);
    write(fx.dir, "draft.md", "---\ntitle: t\n---\n\n恢复耗时数天。\n");
    write(fx.dir, "understanding-brief.md", "# Understanding Brief\n\n## 证据\n只记了证据。\n");
    const result = run(fx.root);
    expect(result.status).toBe(2);
    expect(JSON.parse(result.stdout).errors[0]).toMatch(/no 允许援引的事实 ledger/);
  });

  test("accepts a rhetoric row for a claim-shaped phrase that carries no fact", () => {
    const fx = fixture();
    cleanup.push(fx.root);
    write(fx.dir, "draft.md", "---\ntitle: t\n---\n\n识别速度决定了它是几小时的排查还是几周的悬案。\n");
    write(fx.dir, "understanding-brief.md", ledger("- 几周的悬案 ← rhetoric: 不承载事实"));
    const result = run(fx.root);
    expect(result.status, result.stderr || result.stdout).toBe(0);
  });

  test("a rhetoric row must not blanket-cover the same token elsewhere in the body", () => {
    const fx = fixture();
    cleanup.push(fx.root);
    write(fx.dir, "draft.md", "---\ntitle: t\n---\n\n他们花了几周想避免那次故障。识别速度决定了它是几小时的排查还是几周的悬案。\n");
    write(fx.dir, "understanding-brief.md", ledger("- 几周的悬案 ← rhetoric: 不承载事实"));
    const result = run(fx.root, ["--all"]);
    expect(result.status).toBe(2);
    expect(JSON.parse(result.stdout).uncovered.join("\n")).toContain("几周");
  });

  test("does not scan link URLs or fenced code blocks", () => {
    const fx = fixture();
    cleanup.push(fx.root);
    const draft = [
      "---",
      "title: t",
      "---",
      "",
      "Meta 在[那次复盘](https://engineering.fb.com/2014/11/14/link-imbalance/)里命名了这个机制。",
      "",
      "```text",
      "1234 年",
      "```",
      "",
    ].join("\n");
    write(fx.dir, "draft.md", draft);
    write(fx.dir, "understanding-brief.md", ledger('- 一个无关登记 ← "unrelated"（原文）'));
    const result = run(fx.root);
    expect(result.status, result.stderr || result.stdout).toBe(0);
  });

  test("reports usage when no slug is given", () => {
    const result = spawnSync("bun", ["run", SCRIPT], { cwd: REPO_ROOT, encoding: "utf8" });
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/usage: validate-claims/);
  });
});
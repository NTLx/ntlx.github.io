#!/usr/bin/env bun

import { afterEach, describe, expect, test } from "bun:test";
import { appendFileSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import {
  TRACE_FILENAME,
  appendOrchestrationTrace,
  buildTraceRecord,
  VALID_RESULTS,
} from "../scripts/orchestration-trace.mjs";

const SCRIPT = resolve(import.meta.dir, "../scripts/orchestration-trace.mjs");
const REPO_ROOT = resolve(import.meta.dir, "../../../..");

function fixtureRoot(prefix = "orchestration-trace-test") {
  return join(tmpdir(), `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`);
}

describe("orchestration trace", () => {
  const cleanup = [];

  afterEach(() => {
    for (const dir of cleanup.splice(0)) rmSync(dir, { recursive: true, force: true });
  });

  test("writes a bounded JSONL decision record under the ignored post runtime directory", () => {
    const root = fixtureRoot();
    cleanup.push(root);
    const slug = "2026-08-31-trace-record";
    const tracePath = join(root, slug, TRACE_FILENAME);
    const ignoreProbe = spawnSync("git", ["check-ignore", "-q", join("posts", slug, TRACE_FILENAME)], {
      cwd: REPO_ROOT,
      encoding: "utf8",
    });
    expect(ignoreProbe.status).toBe(0);

    const result = appendOrchestrationTrace(slug, {
      stage: "synthesize",
      gap: "事实已有，但缺少系统性因果结构",
      candidates: ["skill-a", "skill-b"],
      selected: ["skill-a"],
      reason: "其说明与当前结构分析任务最匹配",
      gate: "validate-understanding",
      result: "pass",
    }, { root });

    expect(result.ok).toBe(true);
    expect(existsSync(tracePath)).toBe(true);
    const record = JSON.parse(readFileSync(tracePath, "utf8").trim());
    expect(record.stage).toBe("synthesize");
    expect(record.candidates).toEqual(["skill-a", "skill-b"]);
    expect(record.selected).toEqual(["skill-a"]);
    expect(record.result).toBe("pass");
    expect(record.prompt).toBeUndefined();
    expect(record.output).toBeUndefined();
  });

  test("records an explicit no-skill route", () => {
    const root = fixtureRoot("orchestration-trace-no-skill");
    cleanup.push(root);
    const result = appendOrchestrationTrace("2026-08-31-no-skill", {
      stage: "refine",
      gap: "当前产物已满足合同，没有明确能力缺口",
      candidates: [],
      selected: "no-skill",
      reason: "已有产物通过 Gate，无需额外能力",
      gate: "step3-polish",
      result: "pass",
    }, { root });

    expect(result.ok).toBe(true);
    const record = JSON.parse(readFileSync(join(root, "2026-08-31-no-skill", TRACE_FILENAME), "utf8"));
    expect(record.selected).toEqual(["no-skill"]);
  });

  test("accepts only the four route-attempt results", () => {
    expect([...VALID_RESULTS]).toEqual(["pass", "fail", "blocked", "rerouted"]);
    for (const result of VALID_RESULTS) {
      expect(buildTraceRecord("trace-slug", { result }).result).toBe(result);
    }
    expect(() => buildTraceRecord("trace-slug", { result: "success" })).toThrow("result must be one of");
  });

  test("redacts sensitive values and bounds free-form fields", () => {
    const record = buildTraceRecord("trace-slug", {
      stage: "draft",
      gap: "api_key=do-not-write-this " + "x".repeat(500),
      candidates: ["skill-a", "skill-a", "skill-b"],
      selected: "skill-a,skill-b",
      reason: "short reason",
      gate: "step2-write",
      result: "pass",
    });

    expect(record.gap).not.toContain("do-not-write-this");
    expect(record.gap.length).toBeLessThanOrEqual(360);
    expect(record.candidates).toEqual(["skill-a", "skill-b"]);
    expect(record.selected).toEqual(["skill-a", "skill-b"]);
  });

  test("returns a non-blocking result when the trace directory cannot be written", () => {
    const root = fixtureRoot("orchestration-trace-file");
    cleanup.push(root);
    const blockedRoot = join(root, "not-a-directory");
    mkdirSync(root, { recursive: true });
    appendFileSync(blockedRoot, "occupied\n");

    const result = appendOrchestrationTrace("2026-08-31-trace-failure", {
      stage: "refine",
      gap: "语言机械",
      gate: "step3-polish",
      result: "blocked",
    }, { root: blockedRoot });

    expect(result.ok).toBe(false);
  });

  test("CLI keeps a trace write failure non-blocking", () => {
    const root = fixtureRoot("orchestration-trace-cli-failure");
    cleanup.push(root);
    mkdirSync(root, { recursive: true });
    const blockedRoot = join(root, "not-a-directory");
    appendFileSync(blockedRoot, "occupied\n");

    const result = spawnSync("bun", [
      "run", SCRIPT, "2026-08-31-trace-cli-failure",
      "--stage", "draft",
      "--gap", "需要补足结构",
      "--selected", "no-skill",
      "--gate", "step2-write",
      "--result", "blocked",
    ], {
      cwd: REPO_ROOT,
      env: { ...process.env, PIPELINE_POSTS_ROOT: blockedRoot },
      encoding: "utf8",
    });

    expect(result.status).toBe(0);
    expect(result.stderr).toContain("workflow continues");
  });

  test("CLI records the minimum audit fields", () => {
    const root = fixtureRoot();
    cleanup.push(root);
    const slug = "2026-08-31-trace-cli";
    const result = spawnSync("bun", [
      "run", SCRIPT, slug,
      "--stage", "illustrate",
      "--gap", "需要表达正文的因果关系",
      "--candidates", "skill-a,skill-b",
      "--selected", "skill-a",
      "--reason", "结构契合",
      "--gate", "step4-images",
      "--result", "pass",
    ], {
      cwd: REPO_ROOT,
      env: { ...process.env, PIPELINE_POSTS_ROOT: root },
      encoding: "utf8",
    });

    expect(result.status).toBe(0);
    expect(readFileSync(join(root, slug, TRACE_FILENAME), "utf8")).toContain('"stage":"illustrate"');
  });
});

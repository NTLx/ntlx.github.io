import { afterEach, expect, test } from "bun:test";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const script = resolve(import.meta.dir, "../scripts/state.mjs");
const roots = [];
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }); });
function fixture(state) {
  const root = mkdtempSync(join(tmpdir(), "state-recovery-"));
  roots.push(root);
  const slug = "2026-09-13-state-recovery";
  const dir = join(root, slug);
  mkdirSync(dir);
  const path = join(dir, ".pipeline-state.json");
  writeFileSync(path, state);
  return { root, slug, path };
}
function run(f, command, ...args) {
  return spawnSync("bun", [script, command, f.slug, ...args], {
    env: { ...process.env, PIPELINE_POSTS_ROOT: f.root }, encoding: "utf8",
  });
}

test("corrupt state blocks inspection and mutation without replacing the checkpoint", () => {
  for (const raw of ["{broken", "null", "[]", "{}", '{"last_complete_step":7}',
    '{"last_complete_step":5,"publish":{"blog":"unknown","wechat":"done"}}',
    '{"last_complete_step":5,"failed_step":{"step":99}}']) {
    const f = fixture(raw);
    for (const command of ["next", "init", "dump"]) {
      const result = run(f, command);
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain("STATE_INVALID");
      expect(readFileSync(f.path, "utf8")).toBe(raw);
    }
  }
});

test("adding strategy to an existing checkpoint survives a fresh process", () => {
  const f = fixture(JSON.stringify({ last_complete_step: 2, publish: { blog: "pending", wechat: "pending" } }));
  expect(run(f, "init", "tutorial").status).toBe(0);
  expect(run(f, "strategy", "get").stdout.trim()).toBe("tutorial");
  expect(run(f, "next").stdout.trim()).toBe("3");
});

test("independent publication recovery preserves the already completed channel", () => {
  for (const [blog, wechat, failed, command] of [
    ["done", "failed", 6.2, "wechat"], ["failed", "done", 6.1, "blog"],
  ]) {
    const f = fixture(JSON.stringify({ last_complete_step: 6, publish: { blog, wechat }, failed_step: { step: failed } }));
    expect(run(f, "next").stdout.trim()).toBe(String(failed));
    expect(run(f, command, "done").status).toBe(0);
    expect(run(f, "next").stdout.trim()).toBe("done");
    expect(JSON.parse(readFileSync(f.path, "utf8")).publish).toEqual({ blog: "done", wechat: "done" });
  }
});

test("legacy checkpoint remains readable without rewriting during next", () => {
  const raw = JSON.stringify({ last_complete_step: 4 });
  const f = fixture(raw);
  expect(run(f, "next").stdout.trim()).toBe("5");
  expect(readFileSync(f.path, "utf8")).toBe(raw);
});

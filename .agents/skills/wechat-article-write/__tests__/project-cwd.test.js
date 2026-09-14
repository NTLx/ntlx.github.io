import { afterAll, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { PROJECT_ROOT, assertProjectCwd } from "../scripts/path-resolver.mjs";

const step4 = resolve(import.meta.dir, "../scripts/step4-images.mjs");
// A working directory outside the project. It must never be a checkout path such as `posts/`,
// which is gitignored and therefore absent from a clean CI checkout.
const FOREIGN = mkdtempSync(join(tmpdir(), "foreign-cwd-"));

afterAll(() => rmSync(FOREIGN, { recursive: true, force: true }));

function inheritedEnv() {
  const env = { ...process.env };
  delete env.PIPELINE_REPO_ROOT;
  delete env.PIPELINE_POSTS_ROOT;
  return env;
}

function inDir(dir, run) {
  const original = process.cwd();
  try {
    process.chdir(dir);
    return run();
  } finally {
    process.chdir(original);
  }
}

function withEnv(name, value, run) {
  const original = process.env[name];
  process.env[name] = value;
  try {
    return run();
  } finally {
    if (original === undefined) delete process.env[name];
    else process.env[name] = original;
  }
}

function withTempDir(run) {
  const dir = mkdtempSync(join(tmpdir(), "cwd-fixture-"));
  try {
    return run(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const runStep4 = (cwd, env) =>
  spawnSync("bun", [step4, "2026-01-01-any-slug", "--initialize-only"], { cwd, env, encoding: "utf8" });

describe("project cwd contract", () => {
  test("anchors the project root to the module location, not the process cwd", () => {
    expect(PROJECT_ROOT).toBe(resolve(import.meta.dir, "../../../.."));
    expect(PROJECT_ROOT).not.toBe(resolve("."));
  });

  test("accepts the project root and rejects every other working directory", () => {
    inDir(PROJECT_ROOT, () => expect(() => assertProjectCwd()).not.toThrow());
    inDir(FOREIGN, () => expect(() => assertProjectCwd()).toThrow(/project root/u));
  });

  test("follows an explicit PIPELINE_REPO_ROOT as the project definition", () => {
    withEnv("PIPELINE_REPO_ROOT", FOREIGN, () =>
      inDir(FOREIGN, () => expect(() => assertProjectCwd()).not.toThrow()));
  });

  test("treats a redirected posts root as data redirection, not a project redefinition", () => {
    withTempDir((posts) => withEnv("PIPELINE_POSTS_ROOT", posts, () =>
      inDir(FOREIGN, () => expect(() => assertProjectCwd()).toThrow(/project root/u))));
  });

  test("Step 4 refuses to run outside the project root", () => {
    withTempDir((posts) => {
      const run = runStep4(FOREIGN, { ...inheritedEnv(), PIPELINE_POSTS_ROOT: posts });
      expect(run.status).toBe(1);
      expect(run.stderr).toContain("must run from the project root");
    });
  });

  test("Step 4 clears the cwd preflight when run from the project root", () => {
    withTempDir((posts) => {
      const run = runStep4(PROJECT_ROOT, { ...inheritedEnv(), PIPELINE_POSTS_ROOT: posts });
      expect(run.stderr).not.toContain("must run from the project root");
      expect(run.stderr).toContain("draft.md missing");
    });
  });
});

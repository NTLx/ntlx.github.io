import { describe, test, expect } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { PROJECT_ROOT, assertProjectCwd } from "../scripts/path-resolver.mjs";

const step4 = resolve(import.meta.dir, "../scripts/step4-images.mjs");
const NESTED = resolve(PROJECT_ROOT, "posts");

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

function withTempPosts(run) {
  const posts = mkdtempSync(join(tmpdir(), "project-cwd-"));
  try {
    return run({ ...inheritedEnv(), PIPELINE_POSTS_ROOT: posts });
  } finally {
    rmSync(posts, { recursive: true, force: true });
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
    inDir(NESTED, () => expect(() => assertProjectCwd()).toThrow(/project root/u));
  });

  test("follows an explicit PIPELINE_REPO_ROOT as the project definition", () => {
    process.env.PIPELINE_REPO_ROOT = NESTED;
    try {
      inDir(NESTED, () => expect(() => assertProjectCwd()).not.toThrow());
    } finally {
      delete process.env.PIPELINE_REPO_ROOT;
    }
  });

  test("treats a redirected posts root as data redirection, not a project redefinition", () => {
    process.env.PIPELINE_POSTS_ROOT = NESTED;
    try {
      inDir(NESTED, () => expect(() => assertProjectCwd()).toThrow(/project root/u));
    } finally {
      delete process.env.PIPELINE_POSTS_ROOT;
    }
  });

  test("Step 4 refuses to run outside the project root", () => {
    withTempPosts((env) => {
      const run = runStep4(NESTED, env);
      expect(run.status).toBe(1);
      expect(run.stderr).toContain("must run from the project root");
    });
  });

  test("Step 4 clears the cwd preflight when run from the project root", () => {
    withTempPosts((env) => {
      const run = runStep4(PROJECT_ROOT, env);
      expect(run.stderr).not.toContain("must run from the project root");
      expect(run.stderr).toContain("draft.md missing");
    });
  });
});

import { afterEach, expect, test } from "bun:test";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const SCRIPT = resolve(import.meta.dir, "../scripts/reconcile-blog-deploy.mjs");
const roots = [];

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function fixture({ status = "completed", conclusion = "success", headSha = "abc123", sourceUrl = null } = {}) {
  const root = mkdtempSync(join(tmpdir(), "reconcile-blog-deploy-"));
  roots.push(root);
  const postsRoot = join(root, "posts");
  const repoRoot = join(root, "repo");
  const binDir = join(root, "bin");
  const slug = "2026-10-17-reconcile-test";
  const postDir = join(postsRoot, slug);
  mkdirSync(postDir, { recursive: true });
  mkdirSync(repoRoot, { recursive: true });
  mkdirSync(binDir, { recursive: true });

  const state = {
    slug,
    started_at: "2026-10-17T00:00:00.000Z",
    last_complete_step: 6,
    publish: { blog: "pending", wechat: "pending" },
    failed_step: null,
    commit: "abc123",
    pushed: true,
    source_url: sourceUrl ?? "https://example.invalid/articles/reconcile-test",
    publish_result: {
      blog: {
        verify_passed: true,
        build_passed: true,
        commit_created: true,
        remote_pushed: true,
        site_deployed: null,
      },
    },
  };
  writeFileSync(join(postDir, ".pipeline-state.json"), JSON.stringify(state, null, 2) + "\n");

  const gh = join(binDir, "gh");
  writeFileSync(gh, `#!/usr/bin/env node\nconsole.log(JSON.stringify([{databaseId:123,status:${JSON.stringify(status)},conclusion:${JSON.stringify(conclusion)},headSha:${JSON.stringify(headSha)},url:"https://github.com/example/repo/actions/runs/123"}]))\n`);
  chmodSync(gh, 0o755);

  const preload = join(root, "fetch-preload.mjs");
  writeFileSync(preload, "globalThis.fetch = async (url) => ({ ok: true, status: 200, url: String(url) });\n");

  return { root, postsRoot, repoRoot, binDir, preload, slug, statePath: join(postDir, ".pipeline-state.json") };
}

function run(fx, ...args) {
  return spawnSync("bun", ["--preload", fx.preload, SCRIPT, fx.slug, ...args], {
    cwd: fx.repoRoot,
    env: {
      ...process.env,
      PIPELINE_POSTS_ROOT: fx.postsRoot,
      PIPELINE_REPO_ROOT: fx.repoRoot,
      PATH: `${fx.binDir}:${process.env.PATH}`,
    },
    encoding: "utf8",
  });
}

test("marks blog done only after successful workflow and reachable canonical URL", () => {
  const fx = fixture({ sourceUrl: "https://example.test/articles/reconcile-test" });

  const result = run(fx);
  expect(result.status).toBe(0);
  const state = JSON.parse(readFileSync(fx.statePath, "utf8"));
  expect(state.publish.blog).toBe("done");
  expect(state.publish_result.blog.site_deployed).toBe(true);
  expect(state.publish_result.blog.deployed_commit).toBe("abc123");
  expect(state.publish_result.blog.workflow_run_id).toBe(123);
  expect(state.publish_result.blog.site_http_status).toBe(200);
});

test("completed failed workflow blocks blog without claiming deployment", () => {
  const fx = fixture({ conclusion: "failure" });

  const result = run(fx);
  expect(result.status).toBe(3);
  const state = JSON.parse(readFileSync(fx.statePath, "utf8"));
  expect(state.publish.blog).toBe("blocked");
  expect(state.publish_result.blog.site_deployed).toBe(false);
  expect(state.publish_result.blog.workflow_conclusion).toBe("failure");
});

test("one-shot pending workflow remains pending and resumable", () => {
  const fx = fixture({ status: "in_progress", conclusion: "" });

  const result = run(fx);
  expect(result.status).toBe(2);
  const state = JSON.parse(readFileSync(fx.statePath, "utf8"));
  expect(state.publish.blog).toBe("pending");
  expect(state.publish_result.blog.site_deployed).toBe(null);
});

#!/usr/bin/env bun

import { afterEach, describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { chmodSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const SCRIPT = resolve(import.meta.dir, "../scripts/upload.ts");

function blobSha(bytes) {
  return createHash("sha1")
    .update(`blob ${bytes.length}\0`)
    .update(bytes)
    .digest("hex");
}

function makeFakeGh(root) {
  const bin = join(root, "bin");
  mkdirSync(bin, { recursive: true });
  const fakeGh = join(bin, "gh");
  writeFileSync(fakeGh, `#!/usr/bin/env bun
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const statePath = process.env.FAKE_GH_STATE;
const logPath = process.env.FAKE_GH_LOG;
const args = process.argv.slice(2);
const endpoint = args[1] ?? "";
const methodIndex = args.indexOf("--method");
const method = methodIndex >= 0 ? args[methodIndex + 1] : args.includes("--input") ? "POST" : "GET";
const inputIndex = args.indexOf("--input");
const payload = inputIndex >= 0 ? JSON.parse(readFileSync(args[inputIndex + 1], "utf8")) : null;
const state = JSON.parse(readFileSync(statePath, "utf8"));
const log = JSON.parse(readFileSync(logPath, "utf8"));
log.push({ endpoint, method, payload });
writeFileSync(logPath, JSON.stringify(log));

function save() { writeFileSync(statePath, JSON.stringify(state)); }
function output(value) { process.stdout.write(JSON.stringify(value) + "\\n"); }
function failure(message, code = 1) { process.stderr.write(message); process.exit(code); }
function replacePath(entries, entry) {
  return [...entries.filter(item => item.path !== entry.path), entry];
}

if (endpoint.includes("/git/refs/heads/") && method === "GET") {
  if (state.invalidHead) output({ ref: "broken" });
  else output({ ref: "refs/heads/main", object: { sha: state.head } });
  process.exit(0);
}

if (endpoint.includes("/git/trees/") && method === "GET") {
  if (state.treeFailure) failure("tree query failed");
  if (state.invalidTree) process.stdout.write("not-json\\n");
  else output({ truncated: Boolean(state.truncated), tree: state.tree });
  process.exit(0);
}

if (endpoint.endsWith("/git/blobs")) {
  state.blobCreates += 1;
  const bytes = Buffer.from(payload.content, "base64");
  const sha = createHash("sha1").update(\`blob \${bytes.length}\\0\`).update(bytes).digest("hex");
  save();
  output({ sha });
  process.exit(0);
}

if (endpoint.endsWith("/git/trees")) {
  state.treeCreates += 1;
  const treeSha = \`tree-\${state.treeCreates}\`;
  let nextTree = [...state.tree];
  for (const entry of payload.tree) nextTree = replacePath(nextTree, entry);
  state.treeObjects[treeSha] = nextTree;
  save();
  output({ sha: treeSha });
  process.exit(0);
}

if (endpoint.endsWith("/git/commits")) {
  state.commitCreates += 1;
  const commitSha = \`commit-\${state.commitCreates}\`;
  state.commitObjects[commitSha] = { tree: payload.tree, parent: payload.parents[0] };
  save();
  output({ sha: commitSha });
  process.exit(0);
}

if (endpoint.includes("/git/refs/heads/") && method === "PATCH") {
  if (state.ambiguousSuccessRemaining > 0) {
    const commit = state.commitObjects[payload.sha];
    if (!commit) failure("commit not found");
    state.tree = state.treeObjects[commit.tree] ?? state.tree;
    state.head = payload.sha;
    if (state.lastAppliedCommit !== payload.sha) {
      state.lastAppliedCommit = payload.sha;
      state.refUpdates += 1;
    }
    state.ambiguousSuccessRemaining -= 1;
    save();
    failure("ETIMEDOUT ref update response timed out", 1);
  }
  if (state.ambiguousConflictAfterSuccess) {
    failure("422 reference update failed after the ref was already updated", 1);
  }
  if (state.conflictOnce) {
    state.conflictOnce = false;
    if (state.concurrentEntry) state.tree = replacePath(state.tree, state.concurrentEntry);
    state.head = "concurrent-head";
    save();
    failure("422 reference update failed: branch has changed", 1);
  }
  const commit = state.commitObjects[payload.sha];
  if (!commit) failure("commit not found");
  state.tree = state.treeObjects[commit.tree] ?? state.tree;
  state.head = payload.sha;
  state.refUpdates += 1;
  save();
  output({ ref: "refs/heads/main", object: { sha: payload.sha } });
  process.exit(0);
}

failure(\`unexpected fake gh request: \${method} \${endpoint}\`);
`);
  chmodSync(fakeGh, 0o755);
  return bin;
}

function makeFixture(remoteEntries = [], options = {}) {
  const root = join(tmpdir(), `image-host-idempotency-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const imgs = join(root, "imgs");
  mkdirSync(imgs, { recursive: true });
  const statePath = join(root, "fake-state.json");
  const logPath = join(root, "fake-log.json");
  const state = {
    head: "head-0",
    tree: remoteEntries.map(({ path, bytes, sha }) => ({
      path,
      mode: "100644",
      type: "blob",
      sha: sha ?? blobSha(bytes),
    })),
    treeObjects: {},
    commitObjects: {},
    blobCreates: 0,
    treeCreates: 0,
    commitCreates: 0,
    refUpdates: 0,
    ...options,
  };
  writeFileSync(statePath, JSON.stringify(state));
  writeFileSync(logPath, "[]");
  writeFileSync(join(root, ".github-image-hosting.env"), [
    "GITHUB_IMAGE_REPO_OWNER=test-owner",
    "GITHUB_IMAGE_REPO_NAME=test-images",
    "GITHUB_IMAGE_REPO_BRANCH=main",
    "GITHUB_IMAGE_DEFAULT_FOLDER=blog",
    "",
  ].join("\n"));
  const bin = makeFakeGh(root);
  return { root, imgs, statePath, logPath, bin };
}

function addImage(fixture, filename, bytes) {
  writeFileSync(join(fixture.imgs, filename), bytes);
}

function runUpload(fixture, args = []) {
  return spawnSync("bun", ["run", SCRIPT, fixture.imgs, ...args], {
    cwd: fixture.root,
    env: {
      ...process.env,
      HOME: fixture.root,
      PATH: `${fixture.bin}:${process.env.PATH}`,
      FAKE_GH_STATE: fixture.statePath,
      FAKE_GH_LOG: fixture.logPath,
    },
    encoding: "utf8",
  });
}

function stateOf(fixture) {
  return JSON.parse(readFileSync(fixture.statePath, "utf8"));
}

function logOf(fixture) {
  return JSON.parse(readFileSync(fixture.logPath, "utf8"));
}

function countCalls(fixture, needle, method = null) {
  return logOf(fixture).filter(call => call.endpoint.includes(needle) && (!method || call.method === method)).length;
}

function runSingle(fixture, bytes, args = []) {
  addImage(fixture, "input.png", bytes);
  return spawnSync("bun", ["run", SCRIPT, join(fixture.imgs, "input.png"), ...args], {
    cwd: fixture.root,
    env: {
      ...process.env,
      HOME: fixture.root,
      PATH: `${fixture.bin}:${process.env.PATH}`,
      FAKE_GH_STATE: fixture.statePath,
      FAKE_GH_LOG: fixture.logPath,
    },
    encoding: "utf8",
  });
}

describe("github-image-hosting content-aware idempotency", () => {
  const cleanup = [];

  afterEach(() => {
    for (const root of cleanup.splice(0)) rmSync(root, { recursive: true, force: true });
  });

  test("reuses same path when the blob SHA is identical", () => {
    const bytes = Buffer.from("same-content");
    const fixture = makeFixture([{ path: "wechat-articles/foo.png", bytes }]);
    cleanup.push(fixture.root);
    const result = runSingle(fixture, bytes, ["--name", "foo", "--folder", "wechat-articles"]);

    expect(result.status).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.action).toBe("reused");
    expect(output.filename).toBe("foo.png");
    expect(countCalls(fixture, "/git/blobs")).toBe(0);
    expect(countCalls(fixture, "/git/trees")).toBe(1); // GET only
    expect(countCalls(fixture, "/git/trees", "POST")).toBe(0);
    expect(stateOf(fixture).commitCreates).toBe(0);
  });

  test("finds identical content in a suffix instead of allocating another suffix", () => {
    const bytes = Buffer.from("wanted");
    const fixture = makeFixture([
      { path: "wechat-articles/foo.png", bytes: Buffer.from("old") },
      { path: "wechat-articles/foo-1.png", bytes },
    ]);
    cleanup.push(fixture.root);
    const result = runSingle(fixture, bytes, ["--name", "foo", "--folder", "wechat-articles"]);

    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout).filename).toBe("foo-1.png");
    expect(countCalls(fixture, "/git/blobs")).toBe(0);
    expect(stateOf(fixture).commitCreates).toBe(0);
  });

  test("allocates the smallest free suffix only after the whole family differs", () => {
    const fixture = makeFixture([
      { path: "wechat-articles/foo.png", bytes: Buffer.from("a") },
      { path: "wechat-articles/foo-1.png", bytes: Buffer.from("b") },
    ]);
    cleanup.push(fixture.root);
    const result = runSingle(fixture, Buffer.from("c"), ["--name", "foo", "--folder", "wechat-articles"]);

    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout).filename).toBe("foo-2.png");
    expect(stateOf(fixture).tree.some(entry => entry.path === "wechat-articles/foo-2.png")).toBe(true);
    expect(stateOf(fixture).commitCreates).toBe(1);
    expect(stateOf(fixture).refUpdates).toBe(1);
  });

  test("reuses a later identical suffix across a gap", () => {
    const bytes = Buffer.from("later");
    const fixture = makeFixture([
      { path: "wechat-articles/foo.png", bytes: Buffer.from("old") },
      { path: "wechat-articles/foo-2.png", bytes },
    ]);
    cleanup.push(fixture.root);
    const result = runSingle(fixture, bytes, ["--name", "foo", "--folder", "wechat-articles"]);

    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout).filename).toBe("foo-2.png");
    expect(stateOf(fixture).commitCreates).toBe(0);
  });

  test("fails closed on remote index failure and preserves an existing output map", () => {
    const fixture = makeFixture([], { treeFailure: true });
    cleanup.push(fixture.root);
    addImage(fixture, "foo.png", Buffer.from("new"));
    const output = join(fixture.root, "image-map.json");
    writeFileSync(output, '{"old":"keep"}\n');
    const result = spawnSync("bun", ["run", SCRIPT, fixture.imgs, "--folder", "wechat-articles", "--output", output], {
      cwd: fixture.root,
      env: {
        ...process.env,
        HOME: fixture.root,
        PATH: `${fixture.bin}:${process.env.PATH}`,
        FAKE_GH_STATE: fixture.statePath,
        FAKE_GH_LOG: fixture.logPath,
      },
      encoding: "utf8",
    });

    expect(result.status).not.toBe(0);
    expect(readFileSync(output, "utf8")).toBe('{"old":"keep"}\n');
    expect(stateOf(fixture).blobCreates).toBe(0);
    expect(stateOf(fixture).treeCreates).toBe(0);
    expect(stateOf(fixture).commitCreates).toBe(0);
    expect(stateOf(fixture).refUpdates).toBe(0);
  });

  test("fails closed for truncated trees", () => {
    const fixture = makeFixture([], { truncated: true });
    cleanup.push(fixture.root);
    const result = runSingle(fixture, Buffer.from("new"), ["--name", "foo", "--folder", "wechat-articles"]);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("truncated");
    expect(stateOf(fixture).blobCreates).toBe(0);
    expect(stateOf(fixture).commitCreates).toBe(0);
  });

  test("commits a mixed directory batch once", () => {
    const reused = Buffer.from("reused");
    const fixture = makeFixture([{ path: "wechat-articles/prefix-a.png", bytes: reused }]);
    cleanup.push(fixture.root);
    addImage(fixture, "a.png", reused);
    addImage(fixture, "b.png", Buffer.from("new-b"));
    addImage(fixture, "c.png", Buffer.from("new-c"));
    const output = join(fixture.root, "image-map.json");
    const result = runUpload(fixture, ["--folder", "wechat-articles", "--name-prefix", "prefix", "--output", output]);

    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject({ success: true, uploaded: 2, reused: 1, total: 3 });
    expect(JSON.parse(readFileSync(output, "utf8"))["a.png"]).toContain("prefix-a.png");
    expect(JSON.parse(readFileSync(output, "utf8"))["b.png"]).toContain("prefix-b.png");
    expect(countCalls(fixture, "/git/blobs", "POST")).toBe(2);
    expect(countCalls(fixture, "/git/trees", "POST")).toBe(1);
    expect(countCalls(fixture, "/git/commits", "POST")).toBe(1);
    expect(countCalls(fixture, "/git/refs/heads", "PATCH")).toBe(1);
  });

  test("an exact directory rerun is all-reused and creates no second commit", () => {
    const fixture = makeFixture();
    cleanup.push(fixture.root);
    addImage(fixture, "a.png", Buffer.from("a"));
    addImage(fixture, "b.png", Buffer.from("b"));
    const output = join(fixture.root, "image-map.json");
    const args = ["--folder", "wechat-articles", "--name-prefix", "prefix", "--output", output];
    const first = runUpload(fixture, args);
    expect(first.status).toBe(0);
    const firstMap = readFileSync(output, "utf8");
    const firstState = stateOf(fixture);
    const second = runUpload(fixture, args);

    expect(second.status).toBe(0);
    expect(JSON.parse(second.stdout)).toMatchObject({ success: true, uploaded: 0, reused: 2, total: 2 });
    expect(readFileSync(output, "utf8")).toBe(firstMap);
    expect(stateOf(fixture).commitCreates).toBe(firstState.commitCreates);
    expect(stateOf(fixture).refUpdates).toBe(firstState.refUpdates);
    expect(countCalls(fixture, "/git/trees", "POST")).toBe(1);
    expect(countCalls(fixture, "/git/refs/heads", "PATCH")).toBe(1);
  });

  test("replans after a ref conflict and avoids a concurrent different path", () => {
    const fixture = makeFixture([], {
      conflictOnce: true,
      concurrentEntry: {
        path: "wechat-articles/foo.png",
        mode: "100644",
        type: "blob",
        sha: blobSha(Buffer.from("other")),
      },
    });
    cleanup.push(fixture.root);
    const result = runSingle(fixture, Buffer.from("mine"), ["--name", "foo", "--folder", "wechat-articles"]);

    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout).filename).toBe("foo-1.png");
    const treePosts = logOf(fixture).filter(call => call.endpoint.endsWith("/git/trees") && call.method === "POST");
    expect(treePosts).toHaveLength(2);
    expect(treePosts[1].payload.tree.map(entry => entry.path)).toEqual(["wechat-articles/foo-1.png"]);
    expect(stateOf(fixture).refUpdates).toBe(1);
  });

  test("replans to reuse when a concurrent writer wins with the same content", () => {
    const bytes = Buffer.from("same-concurrent");
    const fixture = makeFixture([], {
      conflictOnce: true,
      concurrentEntry: {
        path: "wechat-articles/foo.png",
        mode: "100644",
        type: "blob",
        sha: blobSha(bytes),
      },
    });
    cleanup.push(fixture.root);
    const result = runSingle(fixture, bytes, ["--name", "foo", "--folder", "wechat-articles"]);

    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject({ action: "reused", filename: "foo.png" });
    expect(countCalls(fixture, "/git/trees", "POST")).toBe(1);
    expect(countCalls(fixture, "/git/commits", "POST")).toBe(1);
    expect(stateOf(fixture).refUpdates).toBe(0);
  });

  test("turns an ambiguous successful ref update into reuse without a duplicate commit", () => {
    const bytes = Buffer.from("ambiguous-success");
    const fixture = makeFixture([], { ambiguousSuccessRemaining: 1, ambiguousConflictAfterSuccess: true });
    cleanup.push(fixture.root);
    const result = runSingle(fixture, bytes, ["--name", "foo", "--folder", "wechat-articles"]);

    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject({ action: "reused", filename: "foo.png" });
    expect(stateOf(fixture).commitCreates).toBe(1);
    expect(stateOf(fixture).refUpdates).toBe(1);
    expect(countCalls(fixture, "/git/commits", "POST")).toBe(1);
    expect(countCalls(fixture, "/git/trees", "POST")).toBe(1);
  });
});

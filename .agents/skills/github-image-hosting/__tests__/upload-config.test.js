#!/usr/bin/env bun
/**
 * github-image-hosting upload.ts 安全行为测试
 *
 * 验证配置阻断（assertRepoConfigured）：
 *   - 无 project/user env 且无 --repo → 阻断（exit 1，明确报未配置）
 *   - 显式 --repo（或 env 配置）→ 放行（不再因未配置退出）
 *
 * 不触碰真实 GitHub / gh 命令：不断言上传成功，只验证“未配置时才阻断”。
 * CI 无 gh / 无令牌环境下也能稳定跑。
 */

import { describe, test, expect, afterEach } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const SCRIPT = resolve(import.meta.dir, "../scripts/upload.ts");
const MISSING_CONFIG_MSG = "未配置图片托管仓库";

function makeIsolated(cwdWithConfig = null) {
  const root = join(tmpdir(), `imagehost-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  mkdirSync(root, { recursive: true });
  // 占位图（内容随意，dry-run/阻断前不需要真实图片）
  writeFileSync(join(root, "t.png"), "placeholder");
  // 若需要“有配置”，在隔离目录里写一个 .github-image-hosting.env
  if (cwdWithConfig) {
    writeFileSync(join(root, ".github-image-hosting.env"), cwdWithConfig);
  }
  return root;
}

function runUpload(root, extraArgs = []) {
  return spawnSync("bun", ["run", SCRIPT, join(root, "t.png"), "--dry-run", ...extraArgs], {
    cwd: root, // 隔离 cwd：脚本从 cwd 向上找 .git / .github-image-hosting.env
    env: { ...process.env, HOME: root }, // 隔离用户级 env
    encoding: "utf8",
  });
}

describe("github-image-hosting upload config safety", () => {
  const cleanups = [];
  afterEach(() => {
    for (const d of cleanups) { try { rmSync(d, { recursive: true, force: true }); } catch {} }
    cleanups.length = 0;
  });

  test("blocks upload when no repo config is provided", () => {
    const root = makeIsolated();
    cleanups.push(root);
    const r = runUpload(root);

    expect(r.status).toBe(1);
    expect(r.stderr).toContain(MISSING_CONFIG_MSG);
    expect(r.stderr).not.toContain("git push exited");
  });

  test("allows upload when --repo is explicitly provided", () => {
    const root = makeIsolated();
    cleanups.push(root);
    const r = runUpload(root, ["--repo", "owner/docs@main:figures"]);

    // 明确指定目标仓库 → 不再因“未配置”阻断（后续可能因无 gh 网络失败，但不属于本测试范围）
    expect(r.stderr).not.toContain(MISSING_CONFIG_MSG);
  });

  test("allows upload when project-level env config exists", () => {
    const root = makeIsolated(
      "GITHUB_IMAGE_REPO_OWNER=someone\nGITHUB_IMAGE_REPO_NAME=assets\nGITHUB_IMAGE_REPO_BRANCH=main\nGITHUB_IMAGE_DEFAULT_FOLDER=blog\n"
    );
    cleanups.push(root);
    const r = runUpload(root);

    expect(r.stderr).not.toContain(MISSING_CONFIG_MSG);
  });
});
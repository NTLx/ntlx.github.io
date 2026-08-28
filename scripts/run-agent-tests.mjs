#!/usr/bin/env bun
// run-agent-tests.mjs — 运行所有自建 Skill 的测试套件
//
// 遍历 .agents/skills 下含 __tests__ 目录的技能，逐个在目录内跑 `bun test`。
// 只在目录内执行是因为 bun 的 glob 会忽略 .agents 这类 dot 目录，
// 必须 cd 进测试目录才能发现测试文件。
//
// 只包含存在 __tests__ 的技能；无测试目录的技能自动跳过。
// 任一技能测试套件失败 → 该进程退出非零。

import { readdirSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dir, "..");
const skillsRoot = resolve(repoRoot, ".agents/skills");

const skills = readdirSync(skillsRoot)
  .filter((name) => existsSync(resolve(skillsRoot, name, "__tests__")))
  .sort();

if (skills.length === 0) {
  process.stdout.write("run-agent-tests: 没有找到含 __tests__ 的自建 Skill\n");
  process.exit(0);
}

let failCount = 0;
for (const name of skills) {
  const testsDir = resolve(skillsRoot, name, "__tests__");
  process.stdout.write(`\n== ${name} ==\n`);
  const r = spawnSync("bun", ["test"], { cwd: testsDir, stdio: "inherit", encoding: "utf8" });
  if (r.status !== 0) failCount++;
}

process.stdout.write(`\nrun-agent-tests: ${skills.length - failCount}/${skills.length} 个技能测试套件通过\n`);
process.exit(failCount === 0 ? 0 : 1);
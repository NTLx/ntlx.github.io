#!/usr/bin/env bun
/**
 * pipeline.mjs — 状态驱动的最小编排器
 *
 * 默认只读取状态并打印当前 Stage Contract。Step 1-4 的认知、写作和
 * 视觉执行由 Agent 自主完成；--auto 只自动执行确定性构建/发布步骤。
 *
 * 用法:
 *   bun run pipeline.mjs <date-slug> [--auto]
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  nextStageFromStep,
  stageContractFor,
  stageReadRefs,
  stagesForStep,
} from "./workflow.mjs";

const repoRoot = resolve(import.meta.dirname, "../../../..");
const scriptsDir = resolve(import.meta.dirname);

function run(args, label) {
  process.stdout.write(`\n[run] ${label}\n`);
  const result = spawnSync("bun", ["run", ...args], {
    stdio: "inherit",
    encoding: "utf8",
    cwd: repoRoot,
  });
  if (result.status !== 0) {
    process.stderr.write(`\n[fail] ${label} 失败（exit ${result.status}）\n`);
    process.exit(result.status ?? 1);
  }
  process.stdout.write(`[ok] ${label} 完成\n`);
  return result;
}

function getNextStep(slug) {
  const result = spawnSync("bun", ["run", resolve(scriptsDir, "state.mjs"), "next", slug], {
    encoding: "utf8",
    cwd: repoRoot,
  });
  return (result.stdout ?? "").trim();
}

function getStep5Paths(slug) {
  const postDir = resolve(repoRoot, "posts", slug);
  return {
    wechatSource: resolve(postDir, "article-wechat-source.md"),
    wechatHtml: resolve(postDir, "article-wechat.html"),
  };
}

function getStateData(slug) {
  const result = spawnSync("bun", ["run", resolve(scriptsDir, "state.mjs"), "dump", slug], {
    encoding: "utf8",
    cwd: repoRoot,
  });
  try {
    return JSON.parse(result.stdout ?? "{}");
  } catch {
    return {};
  }
}

function getNextStage(slug, nextStep) {
  const state = getStateData(slug);
  const strategy = state.strategy;
  const last = state.last_complete_step ?? 0;
  const publish = state.publish ?? { blog: "pending", wechat: "pending" };
  if (!strategy) return { stage: "unknown", strategy: null, refs: [], stages: [] };

  const stage = nextStageFromStep(strategy, last, publish);
  return {
    stage,
    strategy,
    refs: stageReadRefs(strategy, stage),
    stages: stagesForStep(strategy, last, nextStep, publish),
  };
}

function gateSpecs(contract) {
  if (!contract) return [];
  return contract.gates ?? (contract.gate ? [contract.gate] : []);
}

function gateCommand(gate, slug) {
  const args = [slug, ...(gate.args ?? [])].join(" ");
  return `bun run ${resolve(scriptsDir, gate.script)} ${args}`;
}

function printStageContract(slug, strategy, stage) {
  const contract = stageContractFor(stage);
  if (!contract) return;

  process.stdout.write(`\n  Stage Contract: ${stage} (${contract.mode})\n`);
  process.stdout.write(`  Goal: ${contract.goal}\n`);
  process.stdout.write(`  Inputs: ${contract.inputs.join("、")}\n`);
  process.stdout.write(`  Required artifacts: ${contract.outputs.length ? contract.outputs.join("、") : "（由状态/上下文承载）"}\n`);
  process.stdout.write("  Acceptance criteria:\n");
  for (const item of contract.acceptance) process.stdout.write(`    - ${item}\n`);

  const refs = stageReadRefs(strategy, stage);
  if (refs.length > 0) process.stdout.write(`  Read: ${refs.join("; ")}\n`);

  if (contract.mode.startsWith("adaptive")) {
    process.stdout.write(`  Discover capabilities: bun run ${resolve(scriptsDir, "skill-catalog.mjs")} --json\n`);
    if (stage !== "illustrate") {
      process.stdout.write("  Select route: Agent 原生完成、单个专业 Skill，或少量互补 Skill；no-skill 是合法路线。\n");
    }
    process.stdout.write("  Verify: Skill 输出不是成功定义，必须以本 Stage Contract 和 Gate 为准。\n");
    process.stdout.write("  Adapt on failure: 诊断缺口后修正输入、重试、换 Skill 或改由 Agent 补足，再重新运行 Gate。\n");
    process.stdout.write("  Trace: 每次路线尝试完成 Gate 后 best-effort 追加 orchestration trace；no-skill 时 selected=no-skill；trace 失败不阻塞流程。\n");
    process.stdout.write("  Trace command template:\n");
    process.stdout.write(`    bun run ${resolve(scriptsDir, "orchestration-trace.mjs")} ${slug} --stage <stage> --gap \"<当前缺口>\" --candidates \"<候选>\" --selected \"<skill-or-no-skill>\" --reason \"<简短理由>\" --gate <gate> --result <pass|fail|blocked|rerouted>\n`);
  }
  if (stage === "illustrate") {
    process.stdout.write("\n  Visual design requirements:\n");
    process.stdout.write("    1. 先运行 Baoyu article-level visual design；即使正文图片为 0 张，也要记录 baoyu-article-illustrator 的判断。\n");
    process.stdout.write("    2. 使用 baoyu-cover-image 设计 cover。\n");
    process.stdout.write("    3. 使用 baoyu-infographic 设计 SLOT_IMG_00。\n");
    process.stdout.write("    4. 从 catalog 检查专项 Baoyu 能力；涉及结构、流程、状态、时序或架构关系时，可由 Agent 选择 baoyu-diagram 作为 contributor。\n");
    process.stdout.write("    5. Optional contributors 只能增强设计；最终 raster prompt authority 必须留在对应 Baoyu 核心设计层。\n");
    process.stdout.write("    6. 先物化全部 canonical prompts，再开始渲染。\n");
    process.stdout.write(`    7. 只运行串行 renderer: bun run ${resolve(scriptsDir, "render-images-serial.mjs")} ${slug}\n`);
    process.stdout.write("    8. Raster backend: baoyu-image-gen → codex-cli only。\n");
    process.stdout.write("    9. 不使用 batch 或并行生图；Image N 完成后才能启动 Image N+1。\n");
    process.stdout.write(`  Backend preflight: bun run ${resolve(scriptsDir, "check-image-backend.mjs")} --runtime\n`);
    process.stdout.write("  Raster policy: 由串行 renderer 显式执行 baoyu-image-gen → codex-cli；不可用时 fail closed。\n");
  }

  const gates = gateSpecs(contract);
  if (gates.length > 0) {
    process.stdout.write("  Gate command(s):\n");
    for (const gate of gates) process.stdout.write(`    ${gateCommand(gate, slug)}\n`);
  }
}

function printAgentGuide(step, slug, info) {
  if (!["1", "2", "3", "4"].includes(step)) return;
  if (info.stages.length === 0) {
    process.stdout.write("  Agent: 先设置 strategy，再按当前 Stage Contract 执行。\n");
    return;
  }
  process.stdout.write("\n  Agent action: 完成上面列出的输入、产物和验收标准；需要能力时先查看 catalog，再读取候选 Skill 的完整 SKILL.md。\n");
  process.stdout.write(`  Gate 通过后重新运行 pipeline.mjs ${slug} 继续；Gate 失败时沿 Adapt 路径重规划，不要盲目重复。\n`);
}

function getPublishState(slug) {
  const result = spawnSync("bun", ["run", resolve(scriptsDir, "state.mjs"), "dump", slug], {
    encoding: "utf8",
    cwd: repoRoot,
  });
  try {
    return JSON.parse(result.stdout ?? "{}").publish ?? { blog: "pending", wechat: "pending" };
  } catch {
    return { blog: "pending", wechat: "pending" };
  }
}

function printNext(slug) {
  const step = getNextStep(slug);
  if (step === "done") {
    process.stdout.write("\n流水线全部完成。\n");
    return;
  }

  const info = getNextStage(slug, step);
  if (info.stage === "unknown") {
    process.stdout.write(`\n下一步: Step ${step}（阶段: unknown，未记录写作策略）\n`);
    process.stdout.write(`  提示: 运行 "bun run ${resolve(scriptsDir, "state.mjs")} strategy set ${slug} <reader-response|tutorial|news-digest>" 后，名称阶段可正常推导。\n`);
  } else {
    process.stdout.write(`\n下一步: Step ${step}（阶段: ${info.stage}）\n`);
    for (const stage of info.stages.length > 0 ? info.stages : [info.stage]) {
      printStageContract(slug, info.strategy, stage);
    }
  }

  if (["1", "2", "3", "4"].includes(step)) {
    printAgentGuide(step, slug, info);
  } else if (step === "5") {
    const paths = getStep5Paths(slug);
    if (existsSync(paths.wechatSource) && !existsSync(paths.wechatHtml)) {
      process.stdout.write(`\nStep 5 已完成预处理；请由 Agent 调用 gzh-design 基于 ${resolve(repoRoot, "posts", slug, "article-wechat-source.md")} 生成 article-wechat.html。\n`);
      process.stdout.write(`  生成后运行: bun run ${resolve(scriptsDir, "step5-build.mjs")} ${slug} --finalize-only\n`);
    } else {
      process.stdout.write(`\n  运行: bun run ${resolve(scriptsDir, "pipeline.mjs")} ${slug} --auto\n`);
    }
  } else if (step === "6") {
    const publish = getPublishState(slug);
    process.stdout.write(`\n  博客发布: ${publish.blog}; 微信发布: ${publish.wechat}\n`);
    process.stdout.write(`  运行: bun run ${resolve(scriptsDir, "pipeline.mjs")} ${slug} --auto\n`);
  }
}

const args = process.argv.slice(2);
const auto = args.includes("--auto");
const slug = args.find((arg) => !arg.startsWith("--"));

if (!slug) {
  process.stderr.write("usage: pipeline.mjs <date-slug> [--auto]\n");
  process.exit(1);
}

let step = getNextStep(slug);
process.stdout.write(`当前进度: ${step === "done" ? "全部完成" : `Step ${step}`}\n`);

if (step === "done") {
  process.stdout.write("流水线已完成，无需执行。\n");
  process.exit(0);
}

if (!auto && !process.env.PIPELINE_AUTO) {
  printNext(slug);
  process.stdout.write("\n未传 --auto：仅报告状态，不执行 Step 5/6 的文件写入、发布或网络操作。\n");
  process.exit(0);
}

// Steps 1-4 remain Agent-controlled adaptive work.
if (["1", "2", "3", "4"].includes(step)) {
  printNext(slug);
  process.stdout.write("\n完成当前 Stage Contract 并通过 Gate 后，重新运行 pipeline.mjs 继续。\n");
  process.exit(0);
}

// Step 5: deterministic build (only with --auto).
if (step === "5") {
  run([resolve(scriptsDir, "step5-build.mjs"), slug], "Step 5: 产物构建");
  step = getNextStep(slug);
  if (step === "5") {
    const paths = getStep5Paths(slug);
    if (existsSync(paths.wechatSource) && !existsSync(paths.wechatHtml)) {
      process.stdout.write("\nStep 5 已完成预处理；请由 Agent 调用 gzh-design 生成 article-wechat.html，再继续 finalize。\n");
      printNext(slug);
      process.exit(0);
    }
  }
}

// Step 6: deterministic dual-track publication with independent sub-state.
if (step === "6" || step === "done") {
  const publish = getPublishState(slug);

  if (publish.blog === "pending" || publish.blog === "failed") {
    run([resolve(scriptsDir, "publish-blog.mjs"), slug], "Step 6.1: 博客发布");
  } else {
    process.stdout.write(`\n博客发布: ${publish.blog}（跳过）\n`);
  }

  if (publish.wechat === "pending" || publish.wechat === "failed") {
    const blogPublish = getPublishState(slug);
    if (blogPublish.blog === "blocked") {
      process.stdout.write("\nWARNING: 博客 push 失败，commit 已保存。检查网络后手动 git push。\n");
      process.stdout.write("微信发布可继续（sourceUrl 将稍后就绪）。\n");
    }
    if (auto || process.env.PIPELINE_AUTO) {
      run([resolve(scriptsDir, "publish-wechat.mjs"), slug, "--skip-deploy-check"], "Step 6.2: 微信发布");
    }
  } else {
    process.stdout.write(`\n微信发布: ${publish.wechat}（跳过）\n`);
  }
}

printNext(slug);

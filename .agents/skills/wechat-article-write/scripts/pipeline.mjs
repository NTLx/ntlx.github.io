#!/usr/bin/env bun
/**
 * pipeline.mjs — 最小编排器
 *
 * 默认只读取状态并打印下一步指引；传 --auto 时自动串行执行确定性步骤（Step 5 构建 + Step 6 发布）。
 * 非确定性步骤（1-4）始终由 Agent 手动执行。
 *
 * 用法:
 *   bun run pipeline.mjs <date-slug> [--auto]
 *
 * 行为:
 *   - 读取 state 获取 nextStep
 *   - nextStep 1-4: 打印相应指引后退出（Agent 需手动完成）
 *   - nextStep 5:   默认只提示；--auto 时运行 step5-build.mjs
 *   - nextStep 6:   默认只提示；--auto 时依次运行 publish-blog.mjs → publish-wechat.mjs（检查子状态）
 *   - nextStep done: 打印完成信息
 *   - 任何脚本失败: 写 state，报告错误，退出
 *
 * --auto: 自动执行所有可执行步骤直到完成或失败
 */

import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "../../../..");
const scriptsDir = resolve(import.meta.dirname);

function run(args, label) {
  process.stdout.write(`\n[run] ${label}\n`);
  const r = spawnSync("bun", ["run", ...args], { stdio: "inherit", encoding: "utf8", cwd: repoRoot });
  if (r.status !== 0) {
    process.stderr.write(`\n[fail] ${label} 失败（exit ${r.status}）\n`);
    process.exit(r.status ?? 1);
  }
  process.stdout.write(`[ok] ${label} 完成\n`);
  return r;
}

function getNextStep(slug) {
  const r = spawnSync("bun", ["run", resolve(scriptsDir, "state.mjs"), "next", slug], {
    encoding: "utf8", cwd: repoRoot
  });
  return (r.stdout ?? "").trim();
}

function printNext(slug) {
  const step = getNextStep(slug);
  if (step === "done") {
    process.stdout.write("\n流水线全部完成。\n");
  } else {
    process.stdout.write(`\n下一步: Step ${step}\n`);
    if (["1", "2", "3", "4"].includes(step)) {
      printAgentGuide(step, slug);
    } else if (step === "5") {
      process.stdout.write(`  运行: bun run .agents/skills/wechat-article-write/scripts/pipeline.mjs ${slug} --auto\n`);
    } else if (step === "6") {
      const pub = getPublishState(slug);
      process.stdout.write(`  博客发布: ${pub.blog}; 微信发布: ${pub.wechat}\n`);
      process.stdout.write(`  运行: bun run .agents/skills/wechat-article-write/scripts/pipeline.mjs ${slug} --auto\n`);
    }
  }
}

function printAgentGuide(step, slug) {
  const guides = {
    "1": `  Agent: 使用可用的联网工具收集原文和背景资料（materials.md 必须含 ## 背景调研 + 来源 URL）→ 写入 posts/${slug}/materials.md\n  然后运行: bun run step1-collect.mjs ${slug}`,
    "2": `  Agent: 调用 ljg-writes 写作 + suggest-category.mjs 分类\n  保存为 posts/${slug}/draft.md 后运行: bun run step2-write.mjs ${slug}`,
    "3": `  Agent: 调用 renwei-writing + baoyu-format-markdown 处理 draft.md\n  完成后运行: bun run step3-polish.mjs ${slug}`,
    "4": `  Agent: 并行调用 baoyu-cover-image + baoyu-article-illustrator + baoyu-infographic\n  生成 cover.png + imgs/*.png 后运行: bun run step4-images.mjs ${slug}`,
  };
  process.stdout.write(guides[step] ?? "");
}

function getPublishState(slug) {
  const r = spawnSync("bun", ["run", resolve(scriptsDir, "state.mjs"), "dump", slug], {
    encoding: "utf8", cwd: repoRoot
  });
  try {
    return JSON.parse(r.stdout ?? "{}").publish ?? { blog: "pending", wechat: "pending" };
  } catch {
    return { blog: "pending", wechat: "pending" };
  }
}

// Main
const args = process.argv.slice(2);
const auto = args.includes("--auto");
const slug = args.find(a => !a.startsWith("--"));

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

// Steps 1-4: 需要 Agent 手动执行
if (["1", "2", "3", "4"].includes(step)) {
  printAgentGuide(step, slug);
  process.stdout.write("\n完成上述步骤后，重新运行 pipeline.mjs 继续。\n");
  process.exit(0);
}

// Step 5: 自动构建（仅 --auto）
if (step === "5") {
  run([resolve(scriptsDir, "step5-build.mjs"), slug], "Step 5: 产物构建");
  step = getNextStep(slug);
}

// Step 6: 双轨发布（仅 --auto，检查子状态避免重复执行）
if (step === "6" || step === "done") {
  const pub = getPublishState(slug);

  if (pub.blog === "pending" || pub.blog === "failed") {
    run([resolve(scriptsDir, "publish-blog.mjs"), slug], "Step 6.1: 博客发布");
  } else {
    process.stdout.write(`\n博客发布: ${pub.blog}（跳过）\n`);
  }

  // 博客发布后可能有 blocked 状态（push 失败但 commit 成功），此时可以继续微信发布
  if (pub.wechat === "pending" || pub.wechat === "failed") {
    const blogPub = getPublishState(slug); // re-read after blog publish
    if (blogPub.blog === "blocked") {
      process.stdout.write("\nWARNING: 博客 push 失败，commit 已保存。检查网络后手动 git push。\n");
      process.stdout.write("微信发布可继续（sourceUrl 将稍后就绪）。\n");
    }
    if (auto || process.env.PIPELINE_AUTO) {
      run([resolve(scriptsDir, "publish-wechat.mjs"), slug, "--skip-deploy-check"], "Step 6.2: 微信发布");
    }
  } else {
    process.stdout.write(`\n微信发布: ${pub.wechat}（跳过）\n`);
  }
}

printNext(slug);

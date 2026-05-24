#!/usr/bin/env bun
/**
 * Step 4 图片生成：batch 编排 + 失败重试
 *
 * 前提：Agent 已创建 imgs/prompts/ 目录和各 SLOT 的 prompt 文件，
 * 以及 imgs/batch.json（baoyu-imagine batch 格式）。
 *
 * 行为：
 *   1. 读取 batch.json，跳过已有图片的任务
 *   2. 强制使用 DashScope 运行 baoyu-imagine --batchfile
 *   3. 检查哪些图片未生成，只用 DashScope 逐个重试
 *   4. 报告结果
 *
 * 用法:
 *   bun run step4-generate.mjs <date-slug> [--jobs N]
 *
 * 退出码:
 *   0 全部成功；1 参数错误；2 前置条件缺失；3 batch 完全失败；4 部分失败
 */

import { existsSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { postsRoot, repoRoot } from "./path-resolver.mjs";
import { getImagineConfig } from "./config-lib.mjs";

const IMAGINE_MAIN = resolve(repoRoot(), ".agents/skills/baoyu-imagine/scripts/main.ts");
const args = process.argv.slice(2);
let slug = null;
let jobs = 4;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--jobs" && args[i + 1]) { jobs = parseInt(args[++i], 10); }
  else if (!slug) { slug = args[i]; }
}

if (!slug) {
  process.stderr.write("usage: step4-generate.mjs <date-slug> [--jobs N]\n");
  process.exit(1);
}

if (!existsSync(IMAGINE_MAIN)) {
  process.stderr.write(`step4-generate: baoyu-imagine 脚本不存在: ${IMAGINE_MAIN}\n`);
  process.exit(2);
}

const base = resolve(postsRoot(), slug);
const imgsDir = resolve(base, "imgs");
const batchFile = resolve(imgsDir, "batch.json");

if (!existsSync(batchFile)) {
  process.stderr.write(`step4-generate: ${batchFile} 不存在\n`);
  process.stderr.write("  Agent 需要先创建 prompt 文件和 batch.json。\n");
  process.exit(2);
}

// 读取 batch.json 并检查哪些图片已存在（支持带 jobs 包装的格式和顶层数组）
let raw;
try { raw = JSON.parse(readFileSync(batchFile, "utf8")); }
catch (e) { process.stderr.write(`step4-generate: batch.json 解析失败: ${e.message}\n`); process.exit(2); }

const allTasks = Array.isArray(raw) ? raw : (raw.tasks ?? []);
const REQUIRED_PROVIDER = "dashscope";
const pendingTasks = allTasks
  .filter(t => !existsSync(resolve(imgsDir, t.image)))
  .map(t => ({ ...t, provider: REQUIRED_PROVIDER }));
const skippedCount = allTasks.length - pendingTasks.length;

if (pendingTasks.length === 0) {
  process.stdout.write(JSON.stringify({
    total: allTasks.length, skipped: skippedCount, succeeded: 0,
    failed: 0, message: "all images already exist",
  }) + "\n");
  process.exit(0);
}

if (skippedCount > 0) {
  process.stdout.write(`step4-generate: skipping ${skippedCount} existing images\n`);
}

// 构建仅含待生成任务的 batch
const batchDir = dirname(batchFile);
const pendingBatch = { jobs, tasks: pendingTasks };
const tempBatch = resolve(batchDir, "_batch_pending.json");
writeFileSync(tempBatch, JSON.stringify(pendingBatch, null, 2));

process.stdout.write(`step4-generate: generating ${pendingTasks.length} images (${jobs} workers)...\n`);

spawnSync("bun", [
  "run", IMAGINE_MAIN,
  "--batchfile", tempBatch,
  "--jobs", String(jobs),
], { stdio: "inherit", encoding: "utf8", timeout: 300_000 });

// 清理临时 batch 文件
try { unlinkSync(tempBatch); } catch {}

// 检查结果：哪些图片生成了、哪些没有
const succeeded = [];
const failed = [];

for (const task of pendingTasks) {
  const imgPath = resolve(imgsDir, task.image);
  if (existsSync(imgPath)) {
    succeeded.push(task.id);
  } else {
    failed.push(task);
  }
}

// 逐个重试失败项
if (failed.length > 0) {
  process.stdout.write(`step4-generate: ${failed.length} failed, retrying individually...\n`);

  const cfg = getImagineConfig();
  if (cfg.preferredBackend !== REQUIRED_PROVIDER) {
    process.stderr.write(`step4-generate: preferred_image_backend is ${cfg.preferredBackend}, but this pipeline requires ${REQUIRED_PROVIDER}\n`);
    process.exit(2);
  }

  for (const task of failed) {
    const imgPath = resolve(imgsDir, task.image);
    const promptFile = resolve(batchDir, task.promptFiles[0]);
    const ar = task.ar ?? "16:9";
    let recovered = false;

    // 只用 DashScope 重试，避免降级后生成质量不一致的配图。
    for (let attempt = 1; attempt <= 2; attempt++) {
      process.stdout.write(`  retry: ${task.id} (${REQUIRED_PROVIDER}, attempt ${attempt})\n`);
      spawnSync("bun", [
        "run", IMAGINE_MAIN,
        "--promptfiles", promptFile,
        "--image", imgPath,
        "--provider", REQUIRED_PROVIDER,
        "--ar", ar,
      ], { stdio: "inherit", encoding: "utf8", timeout: 120_000 });

      if (existsSync(imgPath)) { recovered = true; break; }
    }

    if (recovered) {
      succeeded.push(task.id);
    } else {
      process.stderr.write(`  FAILED: ${task.id} (DashScope retries exhausted)\n`);
    }
  }
}

// 最终结果
const stillFailed = pendingTasks.filter(t => !existsSync(resolve(imgsDir, t.image)));

process.stdout.write(JSON.stringify({
  total: allTasks.length,
  skipped: skippedCount,
  succeeded: succeeded.length,
  failed: stillFailed.map(t => t.id),
}) + "\n");

if (stillFailed.length > 0) {
  process.exit(4);
}
process.exit(0);

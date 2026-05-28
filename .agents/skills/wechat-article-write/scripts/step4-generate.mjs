#!/usr/bin/env bun
/**
 * Step 4 图片生成：串行逐张生成 + 失败重试
 *
 * 前提：Agent 已创建 imgs/prompts/ 目录和各 SLOT 的 prompt 文件，
 * 以及 imgs/batch.json（baoyu-imagine batch 格式）。
 *
 * 设计原则：
 *   串行执行，每张图独立超时 300s（5 分钟）。
 *   不使用 batch 并行模式——并行导致超时假阳性（API 还在生成但脚本已超时 kill），
 *   进而触发不必要的重试，浪费文生图 API 额度。
 *   串行虽然慢，但每张图都能得到充足的等待时间，消除假阳性重试。
 *
 * 行为：
 *   1. 读取 batch.json，跳过已有图片的任务
 *   2. 逐张调用 baoyu-imagine --promptfiles（串行，每张 300s 超时）
 *   3. 失败的图片自动重试一次（300s 超时）
 *   4. 报告结果
 *
 * 用法:
 *   bun run step4-generate.mjs <date-slug>
 *
 * 退出码:
 *   0 全部成功；1 参数错误；2 前置条件缺失；4 部分失败
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { postsRoot, repoRoot } from "./path-resolver.mjs";
import { getImagineConfig } from "./config-lib.mjs";

const IMAGINE_MAIN = resolve(repoRoot(), ".agents/skills/baoyu-imagine/scripts/main.ts");
const PER_IMAGE_TIMEOUT_MS = 300_000; // 5 minutes per image

const args = process.argv.slice(2);
let slug = null;

for (let i = 0; i < args.length; i++) {
  if (!slug) { slug = args[i]; }
}

if (!slug) {
  process.stderr.write("usage: step4-generate.mjs <date-slug>\n");
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

// 读取 batch.json（支持带 jobs 包装的格式和顶层数组）
let raw;
try { raw = JSON.parse(readFileSync(batchFile, "utf8")); }
catch (e) { process.stderr.write(`step4-generate: batch.json 解析失败: ${e.message}\n`); process.exit(2); }

const allTasks = Array.isArray(raw) ? raw : (raw.tasks ?? []);
const REQUIRED_PROVIDER = "openai";
const batchDir = resolve(batchFile, "..");

// 过滤出待生成的任务
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

process.stdout.write(`step4-generate: generating ${pendingTasks.length} images (serial, ${PER_IMAGE_TIMEOUT_MS / 1000}s per image)...\n`);

// 串行逐张生成
const succeeded = [];
const failed = [];

for (let i = 0; i < pendingTasks.length; i++) {
  const task = pendingTasks[i];
  const imgPath = resolve(imgsDir, task.image);
  const promptFile = resolve(batchDir, task.promptFiles[0]);
  const ar = task.ar ?? "16:9";

  process.stdout.write(`  [${i + 1}/${pendingTasks.length}] ${task.id}...\n`);

  const result = spawnSync("bun", [
    "run", IMAGINE_MAIN,
    "--promptfiles", promptFile,
    "--image", imgPath,
    "--provider", REQUIRED_PROVIDER,
    "--ar", ar,
  ], { stdio: "inherit", encoding: "utf8", timeout: PER_IMAGE_TIMEOUT_MS });

  if (existsSync(imgPath)) {
    succeeded.push(task.id);
    process.stdout.write(`  ✓ ${task.id} done\n`);
  } else {
    failed.push(task);
    const reason = result.error?.code === "ETIMEDOUT" ? "timeout" : "error";
    process.stderr.write(`  ✗ ${task.id} failed (${reason})\n`);
  }
}

// 逐个重试失败项（一次重试机会，同样 300s 超时）
if (failed.length > 0) {
  process.stdout.write(`\nstep4-generate: ${failed.length} failed, retrying (300s timeout)...\n`);

  const cfg = getImagineConfig();
  if (cfg.preferredBackend !== REQUIRED_PROVIDER) {
    process.stderr.write(`step4-generate: preferred_image_backend is ${cfg.preferredBackend}, but this pipeline requires ${REQUIRED_PROVIDER}\n`);
    process.exit(2);
  }

  const retryFailed = [];
  for (const task of failed) {
    const imgPath = resolve(imgsDir, task.image);
    const promptFile = resolve(batchDir, task.promptFiles[0]);
    const ar = task.ar ?? "16:9";

    process.stdout.write(`  retry: ${task.id} (${REQUIRED_PROVIDER})...\n`);
    spawnSync("bun", [
      "run", IMAGINE_MAIN,
      "--promptfiles", promptFile,
      "--image", imgPath,
      "--provider", REQUIRED_PROVIDER,
      "--ar", ar,
    ], { stdio: "inherit", encoding: "utf8", timeout: PER_IMAGE_TIMEOUT_MS });

    if (existsSync(imgPath)) {
      succeeded.push(task.id);
      process.stdout.write(`  ✓ ${task.id} recovered\n`);
    } else {
      retryFailed.push(task.id);
      process.stderr.write(`  ✗ ${task.id} FAILED (retry exhausted)\n`);
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

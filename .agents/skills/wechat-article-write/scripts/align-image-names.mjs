#!/usr/bin/env bun
/**
 * Step 4 修复工具：把 imgs/ 下命名不符合 SLOT 约定的图片重命名为 NN-<desc>.<ext>。
 *
 * 用途：生图产物若落盘成 provider 默认随机名（nanoid），step4 会报
 * "Missing images for slots"。此时用多模态识别得到映射后，用本脚本归位，
 * 避免重新生图（省钱）。命名约定见 references/image-policy.md。
 *
 * 约定：imgs/ 下 SLOT 图必须以 NN- 开头（NN = slot 编号 00-99），且与
 * imgs/prompts/NN-<desc>.md 去掉 .md 一致。
 *
 * 用法:
 *   bun run align-image-names.mjs <date-slug> <map.json> [--force] [--discard-unmapped]
 *
 * map.json 支持三种格式（适配多模态 subagent 的直接输出）:
 *   1. { "mapping": [{ "file": "rand.png", "target_name": "01-desc.png" }] }
 *   2. [{ "from": "rand.png", "to": "01-desc.png" }]
 *   3. { "rand.png": "01-desc.png" }
 *
 * 退出码: 0 成功; 1 参数错误; 2 输入缺失; 3 目标已存在且未 --force
 */

import { existsSync, readFileSync, readdirSync, renameSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { postsRoot } from "./path-resolver.mjs";

const args = process.argv.slice(2);
const force = args.includes("--force");
const discardUnmapped = args.includes("--discard-unmapped");
const positional = args.filter((a) => !a.startsWith("--"));

if (positional.length < 2) {
  process.stderr.write("usage: align-image-names.mjs <date-slug> <map.json> [--force] [--discard-unmapped]\n");
  process.exit(1);
}

const [slug, mapPath] = positional;
const base = resolve(postsRoot(), slug);
const imgsDir = resolve(base, "imgs");

if (!existsSync(imgsDir)) {
  process.stderr.write(`align-image-names: imgs/ not found: ${imgsDir}\n`);
  process.exit(2);
}
if (!existsSync(mapPath)) {
  process.stderr.write(`align-image-names: map file not found: ${mapPath}\n`);
  process.exit(2);
}

let raw;
try {
  raw = JSON.parse(readFileSync(mapPath, "utf8"));
} catch (e) {
  process.stderr.write(`align-image-names: invalid map JSON: ${e.message}\n`);
  process.exit(2);
}

// 归一化为 [{from, to}]，兼容 subagent 的 {file, target_name} 字段
const pickFrom = (e) => e.from ?? e.file;
const pickTo = (e) => (typeof e.to === "string" ? e.to : e.to?.target_name ?? e.to?.target) ?? e.target_name ?? e.target;
let entries;
if (Array.isArray(raw)) {
  entries = raw.map((e) => ({ from: pickFrom(e), to: pickTo(e) }));
} else if (Array.isArray(raw.mapping)) {
  entries = raw.mapping.map((e) => ({ from: pickFrom(e), to: pickTo(e) }));
} else if (raw && typeof raw === "object") {
  entries = Object.entries(raw).map(([from, to]) => ({ from, to: pickTo({ to }) }));
} else {
  process.stderr.write("align-image-names: map must be object, array, or {mapping:[...]}\n");
  process.exit(2);
}

for (const e of entries) {
  if (!e.from || !e.to) {
    process.stderr.write(`align-image-names: entry missing from/to: ${JSON.stringify(e)}\n`);
    process.exit(2);
  }
}

const IMG_RE = /\.(png|jpe?g|webp|gif)$/i;
const renamed = [];
const skipped = [];

for (const e of entries) {
  const fromPath = resolve(imgsDir, e.from);
  const toPath = resolve(imgsDir, e.to);
  if (!existsSync(fromPath)) {
    skipped.push({ from: e.from, to: e.to, reason: "source not found in imgs/" });
    continue;
  }
  if (existsSync(toPath) && !force) {
    skipped.push({ from: e.from, to: e.to, reason: "target exists (use --force to overwrite)" });
    continue;
  }
  if (!/^\d{2}-/.test(e.to)) {
    process.stderr.write(`align-image-names: WARN target "${e.to}" does not start with NN- (SLOT convention)\n`);
  }
  renameSync(fromPath, toPath);
  renamed.push({ from: e.from, to: e.to });
}

let discarded = [];
if (discardUnmapped) {
  const mappedFrom = new Set(entries.map((e) => e.from));
  const discardDir = resolve(imgsDir, "_discard");
  for (const f of readdirSync(imgsDir)) {
    if (!IMG_RE.test(f)) continue;
    if (mappedFrom.has(f)) continue;
    if (/^\d{2}-/.test(f)) continue; // 已符合约定，保留
    mkdirSync(discardDir, { recursive: true });
    renameSync(resolve(imgsDir, f), resolve(discardDir, f));
    discarded.push(f);
  }
}

process.stdout.write(
  JSON.stringify(
    {
      slug,
      renamed,
      skipped,
      discarded,
      next: renamed.length > 0 ? "run step4-images.mjs to verify" : null,
    },
    null,
    2
  ) + "\n"
);

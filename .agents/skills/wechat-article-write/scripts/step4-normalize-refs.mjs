#!/usr/bin/env bun
/**
 * step4-normalize-refs.mjs — 将 ![](imgs/...) 引用还原为 SLOT_IMG 占位符
 *
 * 问题：插图 agent（baoyu-article-illustrator）有时会直接用 ![](imgs/01-xxx.png)
 *       替换占位符，而非保持 <!-- SLOT_IMG_NN_DESC --> 形式。
 *       这导致 apply-image-map.mjs 无法通过 NN 匹配 CDN URL。
 *
 * 行为：
 *   1. 扫描 draft.md 中的 ![alt](imgs/NN-xxx.ext) 引用
 *   2. 将它们还原为 <!-- SLOT_IMG_NN_DESC --> 占位符
 *   3. 根据 imgs/ 文件名重建 image-map.json key 列表（确保文件名与扩展名一致）
 *   4. 幂等：如果已经是 SLOT_IMG 形式，不会改动
 *
 * 用法:
 *   bun run step4-normalize-refs.mjs <postDir> [--dry-run]
 *
 * 退出码: 0 成功；1 参数错误；2 文件缺失
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const args = process.argv.slice(2);
let dirArg = null, dryRun = false;
for (const a of args) {
  if (a === "--dry-run") dryRun = true;
  else if (!dirArg) dirArg = a;
}
if (!dirArg) {
  process.stderr.write("usage: step4-normalize-refs.mjs <postDir> [--dry-run]\n");
  process.exit(1);
}

const postDir = resolve(dirArg);
const draftPath = resolve(postDir, "draft.md");

if (!existsSync(draftPath)) {
  process.stderr.write(`step4-normalize-refs: draft.md missing: ${draftPath}\n`);
  process.exit(2);
}

let content = readFileSync(draftPath, "utf8");

let changed = 0;

// 将 ![alt](imgs/NN-xxx.ext) 或 ![alt](./imgs/NN-xxx.ext) 还原为 <!-- SLOT_IMG_NN_xxx -->
content = content.replace(/!\[([^\]]*)\]\((?:\.\/)?imgs\/(\d{2})-([^.]+)\.(?:png|jpe?g|webp|gif)\)/g, (_full, alt, nn, slug) => {
  const desc = alt || slug;
  const placeholder = `<!-- SLOT_IMG_${nn}_${desc} -->`;
  changed++;
  return placeholder;
});

if (changed > 0) {
  if (dryRun) {
    process.stdout.write(`step4-normalize-refs: [dry-run] would restore ${changed} reference(s) to SLOT_IMG form\n`);
  } else {
    writeFileSync(draftPath, content);
    process.stdout.write(`step4-normalize-refs: restored ${changed} reference(s) to SLOT_IMG form\n`);
  }
} else {
  process.stdout.write("step4-normalize-refs: all references already in SLOT_IMG form\n");
}

process.exit(0);
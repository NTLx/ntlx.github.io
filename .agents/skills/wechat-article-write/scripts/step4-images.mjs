#!/usr/bin/env bun
/**
 * Step 4: 图片生成完成验证
 *
 * 1. 统一格式检测修正（MIME/扩展名不匹配）
 * 2. 更新 draft.md frontmatter 中的 coverImage 扩展名
 * 3. 插图引用一致性验证（imgs/ 文件数 vs draft.md 引用数）
 * 4. 信息图插入验证
 *
 * 用法:
 *   bun run step4-images.mjs <date-slug>
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { markStepDone } from "./state-lib.mjs";
import { postsRoot, repoRoot } from "./path-resolver.mjs";

const slug = process.argv[2];
if (!slug) { process.stderr.write("usage: step4-images.mjs <date-slug>\n"); process.exit(1); }

const base = resolve(postsRoot(), slug);
const imgsDir = resolve(base, "imgs");
const draftPath = resolve(base, "draft.md");

// 1. Format normalization
if (existsSync(imgsDir)) {
  const normalizeScript = resolve(repoRoot(), ".agents/skills/wechat-article-write/scripts/normalize-image-formats.mjs");
  if (existsSync(normalizeScript)) {
    const r = spawnSync("bun", ["run", normalizeScript, base], { stdio: "inherit", encoding: "utf8" });
    if (r.status !== 0) {
      process.stderr.write("step4: WARNING normalize-image-formats exited non-zero, continuing\n");
    }
  }
}

// 2. Update coverImage extension in draft frontmatter
const coverPng = resolve(base, "cover.png");
const coverJpg = resolve(base, "cover.jpg");
let coverExt = "png";
if (!existsSync(coverPng) && existsSync(coverJpg)) coverExt = "jpg";
else if (existsSync(coverJpg)) {
  // Both exist — prefer jpg (Gemini actually returns JPEG)
  coverExt = "jpg";
}

const setFmScript = resolve(repoRoot(), ".agents/skills/wechat-article-write/scripts/set-frontmatter.mjs");
spawnSync("bun", ["run", setFmScript, draftPath, "set", "coverImage", `cover.${coverExt}`], { stdio: "pipe" });

// 3. Image reference validation
if (existsSync(imgsDir) && existsSync(draftPath)) {
  const imgs = readdirSync(imgsDir).filter(f => /\.(png|jpe?g|webp|gif)$/i.test(f));
  const draft = readFileSync(draftPath, "utf8");

  // Check slot placeholders vs actual images (excluding 00- infographic)
  const nonInfoImgs = imgs.filter(f => !f.startsWith("00-"));
  const slotRefs = [...draft.matchAll(/<!--\s*SLOT_IMG_(\d{2})[^>]*-->/g)].map(m => m[1]);
  const mdRefs = [...draft.matchAll(/!\[[^\]]*\]\(imgs\/(\d{2})-/g)].map(m => m[1]);

  if (nonInfoImgs.length > 0 && slotRefs.length === 0 && mdRefs.length === 0) {
    process.stderr.write(`step4: WARNING ${nonInfoImgs.length} images in imgs/ but no references in draft.md\n`);
  }
}

// 4. Infographic validation
const infoFiles = existsSync(imgsDir) ? readdirSync(imgsDir).filter(f => f.startsWith("00-infographic")) : [];
if (infoFiles.length > 0 && existsSync(draftPath)) {
  const draft = readFileSync(draftPath, "utf8");
  const hasInfoRef = /infographic|SLOT_IMG_00/i.test(draft);
  if (!hasInfoRef) {
    process.stderr.write("step4: WARNING infographic file exists but not referenced in draft.md\n");
  }
}

markStepDone(slug, 4, {
  imgs_dir: existsSync(imgsDir) ? imgsDir : null,
  cover_ext: coverExt,
  info_files: infoFiles.length,
});
process.stdout.write(JSON.stringify({ slug, step: 4, cover_ext: coverExt, info_files: infoFiles.length }) + "\n");
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

import { existsSync, readFileSync, readdirSync, renameSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { markStepDone, markStepFailed } from "./state-lib.mjs";
import { postsRoot, repoRoot } from "./path-resolver.mjs";
import { MIN_BODY_ILLUSTRATIONS, SLOT_EXTRACT_RE } from "./validation-lib.mjs";
import { extractBody } from "./frontmatter-lib.mjs";

const slug = process.argv[2];
if (!slug) { process.stderr.write("usage: step4-images.mjs <date-slug>\n"); process.exit(1); }

const base = resolve(postsRoot(), slug);
const imgsDir = resolve(base, "imgs");
const draftPath = resolve(base, "draft.md");

// 0. Pre-validation: draft.md must exist
if (!existsSync(draftPath)) {
  markStepFailed(slug, 4, "draft.md missing");
  process.exit(2);
}

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

// 2. Accept and repair the common wrong output location: imgs/cover.{png,jpg}.
//    Cover is a WeChat/blog metadata asset and must live at post root; imgs/ is
//    reserved for SLOT_IMG content images uploaded/replaced in Step 5.
for (const ext of ["png", "jpg"]) {
  const rootCover = resolve(base, `cover.${ext}`);
  const nestedCover = resolve(imgsDir, `cover.${ext}`);
  if (!existsSync(rootCover) && existsSync(nestedCover)) {
    renameSync(nestedCover, rootCover);
    process.stderr.write(`step4: moved imgs/cover.${ext} → cover.${ext}\n`);
  }
}

// 3. Update coverImage extension in draft frontmatter
const coverPng = resolve(base, "cover.png");
const coverJpg = resolve(base, "cover.jpg");
let coverExt = "png";
if (!existsSync(coverPng) && existsSync(coverJpg)) coverExt = "jpg";
else if (existsSync(coverJpg)) {
  // Both exist — prefer jpg (Gemini actually returns JPEG)
  coverExt = "jpg";
}

// Fail if no cover image exists at all
if (!existsSync(coverPng) && !existsSync(coverJpg)) {
  markStepFailed(slug, 4, "cover image missing (cover.png/cover.jpg)");
  process.exit(2);
}

const setFmScript = resolve(repoRoot(), ".agents/skills/wechat-article-write/scripts/set-frontmatter.mjs");
spawnSync("bun", ["run", setFmScript, draftPath, "set", "coverImage", `cover.${coverExt}`], { stdio: "pipe" });

// 3. Read draft.md (already validated to exist)
const draft = readFileSync(draftPath, "utf8");
const body = extractBody(draft);

// 4. SLOT-only enforcement: no local imgs/ Markdown references allowed
const localImgRefs = [...draft.matchAll(/!\[[^\]]*\]\([^)]*imgs\//g)];
if (localImgRefs.length > 0) {
  markStepFailed(slug, 4, "draft.md contains local imgs/ image references — use SLOT_IMG_NN placeholders only");
  process.exit(2);
}

// 5. SLOT_IMG validation: every referenced slot must have a matching image file
const slotRefs = [...body.matchAll(SLOT_EXTRACT_RE)].map(m => m[1]);
if (slotRefs.length > 0) {
  const imgs = existsSync(imgsDir)
    ? readdirSync(imgsDir).filter(f => /\.(png|jpe?g|webp|gif)$/i.test(f))
    : [];
  const missingSlots = [];
  for (const slotNum of slotRefs) {
    const hasMatch = imgs.some(f => f.startsWith(`${slotNum}-`));
    if (!hasMatch) {
      missingSlots.push(slotNum);
    }
  }
  if (missingSlots.length > 0) {
    const detail = missingSlots.map(n => `SLOT_IMG_${n}`).join(", ");
    // 区分"真缺图" vs "命名断裂"：imgs/ 有非 NN- 前缀图 = 产物命名未归位，应归位而非重生
    const unprefixed = imgs.filter(f => !/^\d{2}-/.test(f));
    const hint = unprefixed.length > 0
      ? `imgs/ 下有 ${unprefixed.length} 张图片未遵循 NN-<desc> 命名约定（如 ${unprefixed.slice(0, 3).join(", ")}），图片可能已生成但命名断裂。用多模态识别后运行 align-image-names.mjs 归位，不要重新生图。`
      : `imgs/ 下无对应图片，需生成这些 SLOT 的图（生图时显式指定输出名为 NN-<desc>.png）。`;
    const msg = `Missing images for slots: ${detail}. ${hint}`;
    process.stderr.write(`step4: FAIL - ${msg}\n`);
    markStepFailed(slug, 4, msg);
    process.exit(2);
  }
  // Keep existing warning for images with no slot references
  const nonInfoImgs = imgs.filter(f => !f.startsWith("00-"));
  const referencedSlots = new Set(slotRefs);
  const unreferencedImgs = nonInfoImgs.filter(f => {
    const slotNum = f.split("-")[0];
    return !referencedSlots.has(slotNum);
  });
  if (unreferencedImgs.length > 0) {
    process.stderr.write(`step4: WARNING ${unreferencedImgs.length} images in imgs/ not referenced by any SLOT_IMG placeholder\n`);
  }
} else if (existsSync(imgsDir)) {
  // No SLOT references at all — check if images exist without references
  const imgs = readdirSync(imgsDir).filter(f => /\.(png|jpe?g|webp|gif)$/i.test(f));
  const nonInfoImgs = imgs.filter(f => !f.startsWith("00-"));
  const mdRefs = [...draft.matchAll(/!\[[^\]]*\]\(imgs\/(\d{2})-/g)].map(m => m[1]);
  if (nonInfoImgs.length > 0 && mdRefs.length === 0) {
    process.stderr.write(`step4: WARNING ${nonInfoImgs.length} images in imgs/ but no references in draft.md\n`);
  }
}

// 5b. Body illustration count validation: cover and SLOT_IMG_00 do not count.
const bodyIllustrationCount = new Set(slotRefs.map(n => parseInt(n, 10)).filter(n => n > 0)).size;
if (bodyIllustrationCount < MIN_BODY_ILLUSTRATIONS) {
  const msg = `正文至少需要 ${MIN_BODY_ILLUSTRATIONS} 张文内插图（不含封面图和 SLOT_IMG_00 头部信息图），当前 ${bodyIllustrationCount} 张。请在适合的位置规划 SLOT_IMG_01+ 占位符并生成对应图片。`;
  process.stderr.write(`step4: FAIL - ${msg}\n`);
  markStepFailed(slug, 4, msg);
  process.exit(4);
}

// 6. Infographic validation
const infoFiles = existsSync(imgsDir) ? readdirSync(imgsDir).filter(f => f.startsWith("00-infographic")) : [];
if (infoFiles.length > 0) {
  const hasInfoRef = /infographic|SLOT_IMG_00/i.test(body);
  if (!hasInfoRef) {
    process.stderr.write("step4: WARNING infographic file exists but not referenced in draft.md\n");
  }
}

// 7. SLOT_IMG_00_INFOGRAPHIC position constraint (non-blocking warning)
const slot00Match = body.match(/SLOT_IMG_00_INFOGRAPHIC/i);
if (slot00Match) {
  const slotPos = body.indexOf(slot00Match[0]);
  if (slotPos > 200) {
    process.stderr.write("step4: WARNING SLOT_IMG_00_INFOGRAPHIC is not near the top of the article body (>200 chars after frontmatter)\n");
  }
}

markStepDone(slug, 4, {
  imgs_dir: existsSync(imgsDir) ? imgsDir : null,
  cover_ext: coverExt,
  info_files: infoFiles.length,
});
process.stdout.write(JSON.stringify({ slug, step: 4, cover_ext: coverExt, info_files: infoFiles.length }) + "\n");

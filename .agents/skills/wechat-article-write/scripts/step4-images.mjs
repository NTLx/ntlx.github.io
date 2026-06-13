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
import { SLOT_EXTRACT_RE, SLOT_RESOLVE_RE, SLOT_DETECT_RE, hasSlotPlaceholders } from "./validation-lib.mjs";
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
    markStepFailed(slug, 4, `Missing images for slots: ${detail}. Retry these specific images only.`);
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

// 5b. Per-section SLOT_IMG validation: every H2 content section must have at least one SLOT_IMG
const h2Sections = [];
const h2Regex = /^## (.+)$/gm;
let h2Match;
while ((h2Match = h2Regex.exec(body)) !== null) {
  h2Sections.push({ title: h2Match[1].trim(), index: h2Match.index });
}
// Known non-content sections that don't need illustrations
const skipSections = new Set(["原文参考", "信息来源汇总", "参考资料", "references"]);
const sectionsWithoutSlots = [];
for (let i = 0; i < h2Sections.length; i++) {
  const section = h2Sections[i];
  if (skipSections.has(section.title)) continue;
  const start = section.index;
  const end = i + 1 < h2Sections.length ? h2Sections[i + 1].index : body.length;
  const sectionBody = body.slice(start, end);
  if (!hasSlotPlaceholders(sectionBody)) {
    sectionsWithoutSlots.push(section.title);
  }
}
if (sectionsWithoutSlots.length > 0) {
  const detail = sectionsWithoutSlots.map(t => `"${t}"`).join(", ");
  markStepFailed(slug, 4, `H2 sections missing SLOT_IMG placeholders: ${detail}. Each content section must have at least one illustration.`);
  process.exit(2);
}

// 5c. SLOT_IMG position validation: SLOT must be the first non-empty line after H2 heading
const misplacedSlotSections = [];
const bodyLines = body.split(/\r?\n/);
for (let i = 0; i < h2Sections.length; i++) {
  const section = h2Sections[i];
  if (skipSections.has(section.title)) continue;

  // Find which line index this heading is on
  const headingLineIdx = bodyLines.findIndex((line, idx) => {
    return /^## /.test(line) && line.replace(/^## /, "").trim() === section.title;
  });
  if (headingLineIdx === -1) continue;

  // First non-empty line after heading must be a SLOT_IMG placeholder
  let firstContentLine = null;
  for (let j = headingLineIdx + 1; j < bodyLines.length; j++) {
    const trimmed = bodyLines[j].trim();
    if (trimmed === "") continue;
    firstContentLine = trimmed;
    break;
  }

  if (firstContentLine && !SLOT_DETECT_RE.test(firstContentLine)) {
    misplacedSlotSections.push(section.title);
  }
}
if (misplacedSlotSections.length > 0) {
  const detail = misplacedSlotSections.map(t => `"${t}"`).join(", ");
  markStepFailed(slug, 4, `SLOT_IMG not positioned immediately after H2 heading in sections: ${detail}. Rule: ## heading → <!-- SLOT_IMG_XX --> → paragraph text. Move the SLOT_IMG placeholder to the first line after each heading.`);
  process.exit(2);
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

#!/usr/bin/env bun
/**
 * Step 4.5: 信息图生成完成后的状态写入
 *
 * 用法:
 *   bun run step45-infographic-done.mjs <date-slug> [--position top|before-conclusion|skip]
 *
 * 行为:
 *   1. 先调用 normalize-image-formats 修正信息图格式
 *   2. 检查信息图文件是否存在
 *   3. 检查 draft.md 是否有引用
 *   4. 如果文件存在但无引用，根据 position 设置自动插入引用：
 *      - top: 在第一个 ## 标题之后插入
 *      - before-conclusion: 在最后一个 ## 标题（或 ## 总结/## 结论）之前插入
 *      - skip: 不插入，保持 failed 状态
 *   5. 写状态: step 4.5 done / failed
 *
 * 退出码: 0 成功；1 参数错误；2 校验失败
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { writeStep, writeRunning } from "./state-lib.mjs";
import { postsRoot } from "./path-resolver.mjs";

const SCRIPT_DIR = resolve(new URL(import.meta.url).pathname, "..");

const args = process.argv.slice(2);
let slug = null, position = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--position" && args[i + 1]) { position = args[++i]; }
  else if (!slug) { slug = args[i]; }
}
if (!slug) { process.stderr.write("usage: step45-infographic-done.mjs <date-slug> [--position top|before-conclusion|skip]\n"); process.exit(1); }

writeRunning(slug, "4.5");

const base = resolve(postsRoot(), slug);
const imgsDir = resolve(base, "imgs");
const draftPath = resolve(base, "draft.md");

// 格式归一化
const norm = spawnSync("bun", ["run", resolve(SCRIPT_DIR, "normalize-image-formats.mjs"), base], { stdio: "inherit", encoding: "utf8" });
if (norm.status !== 0) {
  process.stderr.write("step45: normalize-image-formats failed (non-blocking, continuing)\n");
}

// 检查信息图文件
const infoFiles = existsSync(imgsDir)
  ? readdirSync(imgsDir).filter((f) => f.startsWith("00-infographic"))
  : [];

// 检查 draft.md 中的引用（SLOT_IMG 和 ![]() 两种形式）
let hasRef = false;
if (existsSync(draftPath)) {
  const draft = readFileSync(draftPath, "utf8");
  hasRef = /(?:<!--\s*SLOT_IMG_00|!\[.*\]\(imgs\/00-infographic)/.test(draft);
}

// 读取 frontmatter 中的 infographicPosition（优先使用 frontmatter，CLI 参数作为覆盖）
if (existsSync(draftPath) && !position) {
  const fm = readFileSync(draftPath, "utf8");
  const m = fm.match(/infographicPosition:\s*(top|before-conclusion|skip)/);
  if (m) position = m[1];
}
// 默认 before-conclusion
if (!position) position = "before-conclusion";

// 自动插入逻辑：文件存在但无引用，且 position 不是 skip
if (infoFiles.length > 0 && !hasRef && position !== "skip") {
  const infoFileName = infoFiles[0];
  const refLine = `![信息图](imgs/${infoFileName})`;

  if (existsSync(draftPath)) {
    let draft = readFileSync(draftPath, "utf8");

    if (position === "top") {
      const firstH2 = draft.indexOf("\n## ");
      if (firstH2 !== -1) {
        const lineEnd = draft.indexOf("\n", firstH2 + 1);
        draft = draft.slice(0, lineEnd + 1) + "\n" + refLine + "\n" + draft.slice(lineEnd + 1);
      } else {
        const fmEnd = draft.indexOf("\n---\n", 4);
        if (fmEnd !== -1) {
          draft = draft.slice(0, fmEnd + 5) + "\n" + refLine + "\n" + draft.slice(fmEnd + 5);
        }
      }
    } else if (position === "before-conclusion") {
      const conclusionPattern = /\n## (总结|结论|Conclusion|Summary)/g;
      let lastConclusion = -1;
      let m;
      while ((m = conclusionPattern.exec(draft)) !== null) {
        lastConclusion = m.index;
      }
      if (lastConclusion !== -1) {
        draft = draft.slice(0, lastConclusion) + "\n" + refLine + "\n" + draft.slice(lastConclusion);
      } else {
        const allH2 = [...draft.matchAll(/\n## /g)];
        if (allH2.length > 0) {
          const lastH2Idx = allH2[allH2.length - 1].index;
          draft = draft.slice(0, lastH2Idx) + "\n" + refLine + "\n" + draft.slice(lastH2Idx);
        } else {
          draft += "\n\n" + refLine + "\n";
        }
      }
    }

    writeFileSync(draftPath, draft);
    hasRef = true;
    process.stdout.write(`step45: auto-inserted infographic reference (${position})\n`);
  }
}

const status = (infoFiles.length > 0 && hasRef) ? "done" : "failed";
const ext = infoFiles[0]?.split(".").pop() ?? "png";

writeStep(slug, "4.5", status, { infographic: infoFiles[0] ?? `00-infographic-core-summary.${ext}`, has_file: infoFiles.length > 0, has_ref: hasRef, position });
process.stdout.write(JSON.stringify({ slug, step: "4.5", status, file: infoFiles[0], has_ref: hasRef, position }) + "\n");
if (status === "failed") process.exit(2);
process.exit(0);
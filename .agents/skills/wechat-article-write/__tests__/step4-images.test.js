#!/usr/bin/env bun
/**
 * step4-images.mjs 回归测试
 *
 * 覆盖正文插图数量门控和灵活位置规划。
 */

import { describe, test, expect, afterEach } from "bun:test";
import { mkdirSync, rmSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const SCRIPT = resolve(import.meta.dir, "../scripts/step4-images.mjs");
const PRE_NORMALIZE_SCRIPT = resolve(import.meta.dir, "../scripts/pre-humanizer-normalize.mjs");
const MARK_HUMANIZED_SCRIPT = resolve(import.meta.dir, "../scripts/mark-humanized.mjs");
const REPO_ROOT = resolve(import.meta.dir, "../../../..");
const PNG_BYTES = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG_BYTES = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
  0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
  0x00, 0x01, 0x00, 0x00, 0xff, 0xd9,
]);

function makeFixture() {
  const root = join(tmpdir(), `step4-images-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const postsRoot = join(root, "posts");
  return { root, postsRoot };
}

function writePost(postsRoot, slug, body, imageNames, options = {}) {
  const dir = join(postsRoot, slug);
  const imgsDir = join(dir, "imgs");
  mkdirSync(imgsDir, { recursive: true });

  const fm = {
    title: "Step 4 测试文章",
    date: "2026-05-18",
    summary: "用于测试 Step 4 图片门控。",
    category: "ai-coding",
    blogSlug: "step-four-test",
    coverImage: "cover.png",
    sourceUrl: "https://ntlx.github.io/articles/step-four-test",
  };
  const frontmatter = Object.entries(fm).map(([k, v]) => `${k}: ${v}`).join("\n");
  writeFileSync(join(dir, "draft.md"), `---\n${frontmatter}\n---\n\n${body}`);
  writeFileSync(join(dir, "cover.png"), PNG_BYTES);
  for (const name of imageNames) {
    writeFileSync(join(imgsDir, name), PNG_BYTES);
  }
  const slots = [...body.matchAll(/<!--\s*SLOT_IMG_(\d{2})(?:_[A-Za-z0-9_-]+)?\s*-->/g)]
    .map((match) => ({ slot: Number(match[1]), index: match.index, desc: match[0].match(/SLOT_IMG_\d{2}(?:_([A-Za-z0-9_-]+))?/)[1] ?? null }))
    .filter((slot) => slot.slot > 0);
  const illustrations = slots.map((slot) => {
    const image = imageNames.find((name) => name.startsWith(`${String(slot.slot).padStart(2, "0")}-`));
    const description = image?.replace(/^\d{2}-/, "").replace(/\.(?:png|jpe?g|webp|gif)$/i, "") ?? slot.desc ?? "visual-node";
    return {
      slot: slot.slot,
      intent: `解释 SLOT ${slot.slot}`,
      baoyu_design: { skill: "baoyu-article-illustrator", type: "framework", style: "minimal" },
      contributors: [],
      description,
      prompt_source: "adapter",
    };
  });
  const sectionMatches = [...body.matchAll(/^##(?!#)\s+(.+?)\s*$/gm)]
    .filter((match) => !["参考资料", "延伸阅读"].includes(match[1].trim()));
  const coverageReview = sectionMatches.map((match, index) => {
    const next = sectionMatches[index + 1]?.index ?? body.length;
    const slot = slots.find((candidate) => candidate.index >= match.index && candidate.index < next);
    return slot
      ? { section_index: index + 1, heading: match[1].trim(), decision: "illustrate", slot: slot.slot, reason: "测试章节包含视觉节点" }
      : { section_index: index + 1, heading: match[1].trim(), decision: "text-only", reason: "测试章节无需额外视觉" };
  });
  writeFileSync(join(dir, "image-plan.json"), JSON.stringify({
    article_visual_design: { skill: "baoyu-article-illustrator", strategy: "只在视觉能降低理解成本的位置创建图片", coverage_review: coverageReview },
    cover: { intent: "表达文章中心", baoyu_design: { skill: "baoyu-cover-image", type: "conceptual", style: "editorial" }, contributors: [], prompt_source: "adapter" },
    infographic: { intent: "压缩全文", baoyu_design: { skill: "baoyu-infographic", layout: "bento-grid", style: "claymation" }, contributors: [], prompt_source: "adapter" },
    illustrations,
    source_image_review: [],
  }, null, 2));
  const promptsDir = join(imgsDir, "prompts");
  mkdirSync(promptsDir, { recursive: true });
  writeFileSync(join(promptsDir, "00-cover-step-four-test.md"), "cover prompt\n");
  writeFileSync(join(promptsDir, "00-infographic-core-summary.md"), "infographic prompt\n");
  for (const entry of illustrations) {
    writeFileSync(join(promptsDir, `${String(entry.slot).padStart(2, "0")}-${entry.description}.md`), "body prompt\n");
  }
  writeFileSync(join(dir, ".pipeline-state.json"), JSON.stringify({
    slug,
    started_at: new Date().toISOString(),
    last_complete_step: 3,
    publish: { blog: "pending", wechat: "pending" },
    failed_step: null,
    humanizer: { status: "pending" },
  }, null, 2));
  if (!options.skipReceipt) {
    const receipt = spawnSync("bun", ["run", resolve(import.meta.dir, "../scripts/mark-humanized.mjs"), slug], {
      cwd: REPO_ROOT,
      env: { ...process.env, PIPELINE_POSTS_ROOT: postsRoot },
      encoding: "utf8",
    });
    if (receipt.status !== 0) throw new Error(receipt.stderr);
  }
  return dir;
}

function runStep4(slug, postsRoot) {
  return spawnSync("bun", ["run", SCRIPT, slug], {
    cwd: REPO_ROOT,
    env: { ...process.env, PIPELINE_POSTS_ROOT: postsRoot },
    encoding: "utf8",
  });
}

describe("step4-images visual-plan consistency", () => {
  let cleanup = [];

  afterEach(() => {
    for (const dir of cleanup) {
      try { rmSync(dir, { recursive: true, force: true }); } catch {}
    }
    cleanup = [];
  });

  test("allows body illustrations placed where the content needs them", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-flexible-image-placement";
    const dir = writePost(fx.postsRoot, slug, `
<!-- SLOT_IMG_00_INFOGRAPHIC -->

## 第一节

先解释问题，再放图。

<!-- SLOT_IMG_01_CORE_TENSION -->

这一节继续展开。

## 第二节

这一节不需要插图。

## 第三节

先给读者一点上下文。

<!-- SLOT_IMG_02_STAKEHOLDER_MAP -->

继续解释关系。

## 第四节

<!-- SLOT_IMG_03_DECISION_FLOW -->

最后用流程图收束。

## 参考资料

> 来源
> https://example.com/source
`, [
      "00-infographic-core-summary.png",
      "01-core-tension.png",
      "02-stakeholder-map.png",
      "03-decision-flow.png",
    ]);
    const before = readFileSync(join(dir, "draft.md"), "utf8");

    const r = runStep4(slug, fx.postsRoot);
    expect(r.status).toBe(0);
    expect(readFileSync(join(dir, "draft.md"), "utf8")).toBe(before);

    const state = JSON.parse(readFileSync(join(dir, ".pipeline-state.json"), "utf8"));
    expect(state.last_complete_step).toBe(4);
  });

  test("allows 0, 1, 2, and 4 planned body illustrations", () => {
    const bodies = [
      [],
      ["01-one"],
      ["01-one", "02-two"],
      ["01-one", "03-three", "07-seven", "09-nine"],
    ];
    for (const [index, descriptions] of bodies.entries()) {
      const fx = makeFixture();
      cleanup.push(fx.root);
      const slug = `2026-05-18-body-count-${index}`;
      const slots = descriptions.map((description) => `<!-- SLOT_IMG_${description.split("-")[0]}_${description.slice(3).toUpperCase()} -->`).join("\n\n");
      const body = `
<!-- SLOT_IMG_00_INFOGRAPHIC -->

## 正文

${slots}

一些正文内容。

## 参考资料

> 来源
> https://example.com/source
`;
      const dir = writePost(fx.postsRoot, slug, body, ["00-infographic-core-summary.png", ...descriptions.map((description) => `${description}.png`)]);
      const r = runStep4(slug, fx.postsRoot);
      expect(r.status, `body illustration count ${descriptions.length}`).toBe(0);
      expect(existsSync(join(dir, ".pipeline-state.json"))).toBe(true);
    }
  });

  test("pre-humanizer normalization moves nested cover to post root", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-nested-zero-cover";
    const dir = writePost(fx.postsRoot, slug, `
<!-- SLOT_IMG_00_INFOGRAPHIC -->

## 正文

<!-- SLOT_IMG_01_CORE_TENSION -->

一些正文内容。

<!-- SLOT_IMG_02_STAKEHOLDER_MAP -->

继续解释关系。

<!-- SLOT_IMG_03_DECISION_FLOW -->

## 参考资料

> 来源
> https://example.com/source
`, [
      "00-cover.png",
      "00-infographic-core-summary.png",
      "01-core-tension.png",
      "02-stakeholder-map.png",
      "03-decision-flow.png",
    ], { skipReceipt: true });
    rmSync(join(dir, "cover.png"), { force: true });

    const pre = spawnSync("bun", ["run", PRE_NORMALIZE_SCRIPT, slug], {
      cwd: REPO_ROOT,
      env: { ...process.env, PIPELINE_POSTS_ROOT: fx.postsRoot },
      encoding: "utf8",
    });
    expect(pre.status, pre.stderr || pre.stdout).toBe(0);
    const receipt = spawnSync("bun", ["run", MARK_HUMANIZED_SCRIPT, slug], {
      cwd: REPO_ROOT,
      env: { ...process.env, PIPELINE_POSTS_ROOT: fx.postsRoot },
      encoding: "utf8",
    });
    expect(receipt.status, receipt.stderr || receipt.stdout).toBe(0);

    const r = runStep4(slug, fx.postsRoot);

    expect(r.status).toBe(0);
    expect(pre.stdout).toContain("moved imgs/00-cover.png");
    expect(existsSync(join(dir, "cover.png"))).toBe(true);
    expect(existsSync(join(dir, "imgs", "00-cover.png"))).toBe(false);
  });

  test("does not modify draft.md after the humanizer receipt", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-step4-draft-freeze";
    const dir = writePost(fx.postsRoot, slug, `
<!-- SLOT_IMG_00_INFOGRAPHIC -->

## 正文

正文内容。

## 参考资料

> 来源
> https://example.com/source
`, ["00-infographic-core-summary.png"]);
    const before = readFileSync(join(dir, "draft.md"), "utf8");

    const r = runStep4(slug, fx.postsRoot);

    expect(r.status).toBe(0);
    expect(readFileSync(join(dir, "draft.md"), "utf8")).toBe(before);
  });

  test("fails instead of repairing an image format after the humanizer receipt", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-step4-format-freeze";
    const dir = writePost(fx.postsRoot, slug, `
<!-- SLOT_IMG_00_INFOGRAPHIC -->

## 正文

正文内容。

## 参考资料

> 来源
> https://example.com/source
`, ["00-infographic-core-summary.png"]);
    writeFileSync(join(dir, "cover.png"), JPEG_BYTES);

    const r = runStep4(slug, fx.postsRoot);

    expect(r.status).toBe(2);
    expect(r.stderr).toContain("deterministic normalization is not complete");
    expect(existsSync(join(dir, "cover.png"))).toBe(true);
    expect(existsSync(join(dir, "cover.jpg"))).toBe(false);
  });

  test("fails when batch.json exists because Step 4 must be serial", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-batch-json-present";
    const dir = writePost(fx.postsRoot, slug, `
<!-- SLOT_IMG_00_INFOGRAPHIC -->

## 正文

<!-- SLOT_IMG_01_CORE_TENSION -->
<!-- SLOT_IMG_02_STAKEHOLDER_MAP -->
<!-- SLOT_IMG_03_DECISION_FLOW -->

## 参考资料

> 来源
> https://example.com/source
`, [
      "00-infographic-core-summary.png",
      "01-core-tension.png",
      "02-stakeholder-map.png",
      "03-decision-flow.png",
    ]);
    writeFileSync(join(dir, "imgs", "batch.json"), JSON.stringify({ jobs: 3, tasks: [] }));

    const r = runStep4(slug, fx.postsRoot);

    expect(r.status).toBe(2);
    expect(r.stderr).toContain("batch.json");
    expect(r.stderr).toContain("串行");
  });

  test("warns about stale prompt without gating the current plan", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-prompt-image-mismatch";
    const dir = writePost(fx.postsRoot, slug, `
<!-- SLOT_IMG_00_INFOGRAPHIC -->

## 正文

<!-- SLOT_IMG_01_CORE_TENSION -->
<!-- SLOT_IMG_02_STAKEHOLDER_MAP -->
<!-- SLOT_IMG_03_DECISION_FLOW -->

## 参考资料

> 来源
> https://example.com/source
`, [
      "00-infographic-core-summary.png",
      "01-core-tension.png",
      "02-stakeholder-map.png",
      "03-decision-flow.png",
    ]);
    const promptsDir = join(dir, "imgs", "prompts");
    mkdirSync(promptsDir, { recursive: true });
    writeFileSync(join(promptsDir, "01-other.md"), "extra prompt\n");
    writeFileSync(join(dir, "imgs", "01-other.png"), PNG_BYTES);

    const r = runStep4(slug, fx.postsRoot);

    expect(r.status).toBe(0);
    expect(r.stderr).toContain("stale/unplanned prompts");
    expect(r.stderr).toContain("01-other");
    expect(r.stderr).toContain("stale/unplanned images");
  });

  test("fails when an active prompt or image is missing", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-active-asset-missing";
    const dir = writePost(fx.postsRoot, slug, `
<!-- SLOT_IMG_00_INFOGRAPHIC -->

## 正文

<!-- SLOT_IMG_01_CORE_TENSION -->

## 参考资料

> 来源
> https://example.com/source
`, ["00-infographic-core-summary.png", "01-core-tension.png"]);
    rmSync(join(dir, "imgs", "01-core-tension.png"));

    const r = runStep4(slug, fx.postsRoot);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("SLOT_IMG_01");
    expect(r.stderr).toContain("Missing images");
  });

  test("fails closed when Step 3's humanizer receipt is stale", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-stale-humanizer-step4";
    const dir = writePost(fx.postsRoot, slug, `
<!-- SLOT_IMG_00_INFOGRAPHIC -->

## 正文

正文内容。

## 参考资料

> 来源
> https://example.com/source
`, ["00-infographic-core-summary.png"]);
    writeFileSync(join(dir, "draft.md"), readFileSync(join(dir, "draft.md"), "utf8") + "\n改动");

    const r = runStep4(slug, fx.postsRoot);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("draft.md changed after humanizer-zh");
  });
});

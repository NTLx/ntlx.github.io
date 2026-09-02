#!/usr/bin/env bun
/**
 * step3-polish.mjs 回归测试
 *
 * 覆盖 polish 后的 frontmatter 与语义占位符复验。
 */

import { describe, test, expect, afterEach } from "bun:test";
import { mkdirSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const SCRIPT = resolve(import.meta.dir, "../scripts/step3-polish.mjs");
const REPO_ROOT = resolve(import.meta.dir, "../../../..");
const BODY = `
<!-- SLOT_IMG_00_INFOGRAPHIC -->

## 正文

一些测试正文内容。

<!-- SLOT_IMG_01_CORE_TENSION -->

继续展开第一处关键概念。

<!-- SLOT_IMG_02_STAKEHOLDER_MAP -->

继续展开第二处关键关系。

<!-- SLOT_IMG_03_DECISION_FLOW -->

*你怎么看这个问题?*

## 参考资料

> 来源
> https://example.com/source
`;

const BODY_WITH_PLAIN_QUESTION = `
<!-- SLOT_IMG_00_INFOGRAPHIC -->

## 正文

一些测试正文内容。

<!-- SLOT_IMG_01_CORE_TENSION -->

继续展开第一处关键概念。

<!-- SLOT_IMG_02_STAKEHOLDER_MAP -->

继续展开第二处关键关系。

<!-- SLOT_IMG_03_DECISION_FLOW -->

你怎么看这个问题？

## 参考资料

> 来源
> https://example.com/source
`;

function makeFixture() {
  const root = join(tmpdir(), `step3-polish-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const postsRoot = join(root, "posts");
  return { root, postsRoot };
}

function writeDraft(postsRoot, slug, opts = {}) {
  const dir = join(postsRoot, slug);
  mkdirSync(dir, { recursive: true });
  const fm = {
    title: "Step 3 测试文章",
    date: "2026-05-18",
    summary: "用于测试 Step 3 复验。",
    category: "ai-coding",
    blogSlug: "step-three-test",
    coverImage: "cover.png",
    sourceUrl: "https://ntlx.github.io/articles/step-three-test",
    ...(opts.fm ?? {}),
  };
  const frontmatter = Object.entries(fm)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
  writeFileSync(join(dir, "draft.md"), `---\n${frontmatter}\n---\n${opts.body ?? BODY}`);
  writeImagePlan(dir, opts.body ?? BODY);
  writeFileSync(join(dir, ".pipeline-state.json"), JSON.stringify({
    slug,
    started_at: new Date().toISOString(),
    last_complete_step: 2,
    publish: { blog: "pending", wechat: "pending" },
    failed_step: null,
    humanizer: { status: "pending" },
  }, null, 2));
  const receipt = spawnSync("bun", ["run", resolve(import.meta.dir, "../scripts/mark-humanized.mjs"), slug], {
    cwd: REPO_ROOT,
    env: { ...process.env, PIPELINE_POSTS_ROOT: postsRoot },
    encoding: "utf8",
  });
  if (receipt.status !== 0) throw new Error(receipt.stderr);
  return dir;
}

function writeImagePlan(dir, body) {
  const headings = [...body.matchAll(/^##(?!#)\s+(.+?)\s*$/gm)]
    .filter((match) => !["参考资料", "延伸阅读"].includes(match[1].trim()));
  const slots = [...body.matchAll(/<!--\s*SLOT_IMG_(\d{2})/g)]
    .map((match) => ({ slot: Number(match[1]), index: match.index }))
    .filter(({ slot }) => slot > 0);
  const coverageReview = headings.map((match, index) => {
    const start = match.index;
    const next = headings[index + 1]?.index ?? body.length;
    const slot = slots.find((candidate) => candidate.index >= start && candidate.index < next);
    return slot
      ? { section_index: index + 1, heading: match[1].trim(), decision: "illustrate", slot: slot.slot, reason: "测试章节包含视觉节点" }
      : { section_index: index + 1, heading: match[1].trim(), decision: "text-only", reason: "测试章节无需额外视觉" };
  });
  writeFileSync(join(dir, "image-plan.json"), JSON.stringify({
    visual_profile: "bright-vivid-warm",
    source_image_policy: "prefer-reuse",
    article_visual_design: { planner: "wechat-article-write-agent", coverage_review: coverageReview },
    cover: { producer: "baoyu-cover-image", intent: "封面", baoyu_design: { skill: "baoyu-cover-image", aspect: "2.35:1", text: "none" }, prompt_source: "external" },
    infographic: { producer: "baoyu-xhs-images", intent: "摘要", baoyu_design: { skill: "baoyu-xhs-images", card_count: 1 }, text_density: "low", has_long_copy: false, prompt_source: "external" },
    illustrations: slots.map(({ slot }) => ({ slot, producer: "baoyu-infographic", intent: `SLOT ${slot}`, baoyu_design: { skill: "baoyu-infographic" }, text_density: "low", has_long_copy: false, prompt_source: "external" })),
    source_image_review: [],
  }, null, 2));
}

function runStep3(slug, postsRoot) {
  return spawnSync("bun", ["run", SCRIPT, slug], {
    cwd: REPO_ROOT,
    env: { ...process.env, PIPELINE_POSTS_ROOT: postsRoot },
    encoding: "utf8",
  });
}

describe("step3-polish gates", () => {
  let cleanup = [];

  afterEach(() => {
    for (const dir of cleanup) {
      try { rmSync(dir, { recursive: true, force: true }); } catch {}
    }
    cleanup = [];
  });

  test("valid draft with semantic SLOT_IMG placeholder passes", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-valid-step3";
    const dir = writeDraft(fx.postsRoot, slug);
    const draftBefore = readFileSync(join(dir, "draft.md"), "utf8");

    const r = runStep3(slug, fx.postsRoot);
    expect(r.status).toBe(0);

    const state = JSON.parse(readFileSync(join(dir, ".pipeline-state.json"), "utf8"));
    expect(state.last_complete_step).toBe(3);
    expect(state.blog_slug).toBe("step-three-test");
    expect(state.humanizer.status).toBe("applied");
    expect(state.humanizer.skill).toBe("humanizer-zh");
    expect(state.humanizer.draft_sha256).toMatch(/^[a-f0-9]{64}$/u);
    expect(state.humanizer.skill_sha256).toMatch(/^[a-f0-9]{64}$/u);
    expect(readFileSync(join(dir, "draft.md"), "utf8")).toBe(draftBefore);
  });

  test("plain question near the end counts as interaction", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-plain-question-step3";
    const dir = writeDraft(fx.postsRoot, slug, { body: BODY_WITH_PLAIN_QUESTION });

    const r = runStep3(slug, fx.postsRoot);
    expect(r.status).toBe(0);

    const state = JSON.parse(readFileSync(join(dir, ".pipeline-state.json"), "utf8"));
    expect(state.last_complete_step).toBe(3);
  });

  test("missing blogSlug fails after polish", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-missing-blogslug";
    writeDraft(fx.postsRoot, slug, { fm: { blogSlug: undefined } });

    const r = runStep3(slug, fx.postsRoot);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("frontmatter.blogSlug");
  });

  test("sourceUrl must still match blogSlug after polish", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-source-mismatch";
    writeDraft(fx.postsRoot, slug, {
      fm: { sourceUrl: "https://ntlx.github.io/articles/other-slug" },
    });

    const r = runStep3(slug, fx.postsRoot);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("与 blogSlug");
  });

  test("missing SLOT_IMG placeholder fails after polish", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-missing-slot";
    writeDraft(fx.postsRoot, slug, {
      body: `\n## 正文\n\n一些正文内容。\n`,
    });

    const r = runStep3(slug, fx.postsRoot);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("SLOT_IMG");
  });

  test("fails closed without a humanizer receipt", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-no-humanizer-receipt";
    const dir = writeDraft(fx.postsRoot, slug);
    const state = JSON.parse(readFileSync(join(dir, ".pipeline-state.json"), "utf8"));
    state.humanizer = { status: "pending" };
    writeFileSync(join(dir, ".pipeline-state.json"), JSON.stringify(state, null, 2));

    const r = runStep3(slug, fx.postsRoot);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("mandatory humanizer-zh");
  });

  test("rejects the legacy humanizer skip state", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-legacy-humanizer-skip";
    const dir = writeDraft(fx.postsRoot, slug);
    const state = JSON.parse(readFileSync(join(dir, ".pipeline-state.json"), "utf8"));
    state.humanizer = "skip";
    writeFileSync(join(dir, ".pipeline-state.json"), JSON.stringify(state, null, 2));

    const r = runStep3(slug, fx.postsRoot);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("legacy humanizer skip is no longer supported");
  });

  test("fails when the draft changes after humanization", () => {
    const fx = makeFixture();
    cleanup.push(fx.root);
    const slug = "2026-05-18-stale-humanizer-draft";
    const dir = writeDraft(fx.postsRoot, slug);
    writeFileSync(join(dir, "draft.md"), readFileSync(join(dir, "draft.md"), "utf8") + "\n新增字符");

    const r = runStep3(slug, fx.postsRoot);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("draft.md changed after humanizer-zh");
  });
});

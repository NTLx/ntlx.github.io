#!/usr/bin/env bun
/**
 * step2-write.mjs 回归测试
 *
 * 覆盖 blogSlug/sourceUrl 的硬门控，避免中文 date-slug 发布到 Step 6 才失败。
 */

import { describe, test, expect, afterAll } from "bun:test";
import { mkdirSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const SCRIPT = resolve(import.meta.dir, "../scripts/step2-write.mjs");
const TMP_ROOT = join(tmpdir(), `step2-write-test-${Date.now()}`);
const VALID_BODY = `
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

function writeDraft(slug, fmOverrides = {}, body = VALID_BODY) {
  const dir = join(TMP_ROOT, slug);
  mkdirSync(dir, { recursive: true });
  const fm = {
    title: "测试文章",
    date: "2026-05-17",
    summary: "用于测试 Step 2 门控。",
    category: "ai-coding",
    blogSlug: "valid-blog-slug",
    coverImage: "cover.png",
    sourceUrl: "https://ntlx.github.io/articles/valid-blog-slug",
    ...fmOverrides,
  };
  const lines = Object.entries(fm)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}: ${v}`);
  writeFileSync(join(dir, "draft.md"), `---\n${lines.join("\n")}\n---\n${body}`);
  writeImagePlan(dir, body);
}

function writeImagePlan(dir, body) {
  const headings = [...body.matchAll(/^##(?!#)\s+(.+?)\s*$/gm)]
    .map((match) => match[1].trim())
    .filter((heading) => !["参考资料", "延伸阅读"].includes(heading));
  const slots = [...body.matchAll(/<!--\s*SLOT_IMG_(\d{2})(?:_([A-Za-z0-9_-]+))?\s*-->/g)]
    .map((match) => ({ slot: Number(match[1]), index: match.index }))
    .filter(({ slot }) => slot > 0);
  const coverageReview = headings.map((heading, index) => {
    const start = [...body.matchAll(/^##(?!#)\s+(.+?)\s*$/gm)]
      .filter((match) => !["参考资料", "延伸阅读"].includes(match[1].trim()))[index]?.index ?? 0;
    const next = [...body.matchAll(/^##(?!#)\s+(.+?)\s*$/gm)]
      .filter((match) => !["参考资料", "延伸阅读"].includes(match[1].trim()))[index + 1]?.index ?? body.length;
    const slot = slots.find((candidate) => candidate.index >= start && candidate.index < next);
    return slot
      ? { section_index: index + 1, heading, decision: "illustrate", slot: slot.slot, reason: "测试章节包含需要说明的视觉节点" }
      : { section_index: index + 1, heading, decision: "text-only", reason: "测试章节文字已经足够清楚" };
  });
  writeFileSync(join(dir, "image-plan.json"), JSON.stringify({
    visual_profile: "bright-vivid-warm",
    source_image_policy: "prefer-reuse",
    article_visual_design: { planner: "wechat-article-write-agent", coverage_review: coverageReview },
    cover: { producer: "baoyu-cover-image", intent: "测试封面", baoyu_design: { skill: "baoyu-cover-image", aspect: "2.35:1", text: "none" }, prompt_source: "external" },
    infographic: { producer: "baoyu-xhs-images", intent: "测试摘要", baoyu_design: { skill: "baoyu-xhs-images", card_count: 1 }, text_density: "low", has_long_copy: false, prompt_source: "external" },
    illustrations: slots.map(({ slot }) => ({ slot, producer: "baoyu-infographic", intent: `测试 SLOT ${slot}`, baoyu_design: { skill: "baoyu-infographic" }, text_density: "low", has_long_copy: false, prompt_source: "external" })),
    source_image_review: [],
  }, null, 2));
}

function bodyWithBodySlots(slots) {
  const placeholders = slots.map((slot) => `<!-- SLOT_IMG_${String(slot).padStart(2, "0")}_VISUAL_NODE -->`).join("\n\n");
  return `
<!-- SLOT_IMG_00_INFOGRAPHIC -->

## 正文

${placeholders}

一些正文内容。

*你怎么看这个问题?*

## 参考资料

> 来源
> https://example.com/source
`;
}

function runStep2(slug) {
  return spawnSync("bun", ["run", SCRIPT, slug], {
    cwd: resolve(import.meta.dir, "../../../.."),
    env: { ...process.env, PIPELINE_POSTS_ROOT: TMP_ROOT },
    encoding: "utf8",
  });
}

function runStep2WithArgs(slug, args = []) {
  return spawnSync("bun", ["run", SCRIPT, slug, ...args], {
    cwd: resolve(import.meta.dir, "../../../.."),
    env: { ...process.env, PIPELINE_POSTS_ROOT: TMP_ROOT },
    encoding: "utf8",
  });
}

function writeBlogMemory(slug, candidates) {
  const dir = join(TMP_ROOT, slug);
  writeFileSync(join(dir, "blog-memory.json"), JSON.stringify({
    slug,
    generated_at: "2026-07-02T00:00:00.000Z",
    query_terms: ["agent", "control"],
    candidates,
  }, null, 2));
}

describe("step2-write blogSlug/sourceUrl gates", () => {
  afterAll(() => {
    try { rmSync(TMP_ROOT, { recursive: true, force: true }); } catch {}
  });

  test("valid blogSlug and matching sourceUrl pass", () => {
    const slug = "2026-05-17-中文标题";
    writeDraft(slug);

    const r = runStep2(slug);
    expect(r.status).toBe(0);

    const state = JSON.parse(readFileSync(join(TMP_ROOT, slug, ".pipeline-state.json"), "utf8"));
    expect(state.last_complete_step).toBe(2);
    expect(state.blog_slug).toBe("valid-blog-slug");
  });

  test("missing blogSlug fails early", () => {
    const slug = "2026-05-17-missing-blog-slug";
    writeDraft(slug, { blogSlug: undefined });

    const r = runStep2(slug);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("frontmatter.blogSlug 缺失");
  });

  test("sourceUrl must match blogSlug", () => {
    const slug = "2026-05-17-source-url-mismatch";
    writeDraft(slug, { sourceUrl: "https://ntlx.github.io/articles/other-slug" });

    const r = runStep2(slug);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("与 blogSlug");
  });

  test("missing SLOT_IMG placeholder fails", () => {
    const slug = "2026-05-17-missing-slot-img";
    const dir = join(TMP_ROOT, slug);
    mkdirSync(dir, { recursive: true });
    const fm = {
      title: "测试文章",
      date: "2026-05-17",
      summary: "用于测试 Step 2 门控。",
      category: "ai-coding",
      blogSlug: "valid-blog-slug",
      coverImage: "cover.png",
      sourceUrl: "https://ntlx.github.io/articles/valid-blog-slug",
    };
    const lines = Object.entries(fm).map(([k, v]) => `${k}: ${v}`);
    writeFileSync(join(dir, "draft.md"), `---\n${lines.join("\n")}\n---\n\n## 正文\n\n一些正文内容。\n`);

    const r = runStep2(slug);
    expect(r.status).toBe(4);
    expect(r.stderr).toContain("SLOT_IMG");
  });

  test("allows 0, 1, 2, and 4 body illustration slots", () => {
    for (const [index, slots] of [[], [1], [1, 2], [1, 3, 7, 9]].entries()) {
      const slug = `2026-05-17-body-slots-${index}`;
      writeDraft(slug, {}, bodyWithBodySlots(slots));
      const r = runStep2(slug);
      expect(r.status, `body slot count ${slots.length}`).toBe(0);
    }
  });

  test("fails when a draft SLOT number is duplicated", () => {
    const slug = "2026-05-17-duplicate-body-slot";
    writeDraft(slug, {}, bodyWithBodySlots([1, 1]));

    const r = runStep2(slug);
    expect(r.status).toBe(4);
    expect(r.stderr).toContain("SLOT_IMG_01");
    expect(r.stderr).toContain("必须唯一");
  });

  test("high-confidence blog memory candidate must be used or explicitly skipped", () => {
    const slug = "2026-05-17-blog-memory-unused";
    writeDraft(slug);
    writeBlogMemory(slug, [{
      slug: "claude-loops-control-rights",
      title: "你不是把任务交给 AI，你是在重新分配控制权",
      url: "https://ntlx.github.io/articles/claude-loops-control-rights",
      score: 12,
      high_confidence: true,
    }]);

    const r = runStep2(slug);
    expect(r.status).toBe(4);
    expect(r.stderr).toContain("站内记忆包");
  });

  test("blog memory candidate URL in draft passes the gate", () => {
    const slug = "2026-05-17-blog-memory-used";
    writeDraft(slug);
    const dir = join(TMP_ROOT, slug);
    let draft = readFileSync(join(dir, "draft.md"), "utf8");
    draft = draft.replace(
      "## 参考资料",
      "## 延伸阅读\n\n- [《你不是把任务交给 AI，你是在重新分配控制权》](https://ntlx.github.io/articles/claude-loops-control-rights)\n\n## 参考资料"
    );
    writeFileSync(join(dir, "draft.md"), draft);
    writeBlogMemory(slug, [{
      slug: "claude-loops-control-rights",
      title: "你不是把任务交给 AI，你是在重新分配控制权",
      url: "https://ntlx.github.io/articles/claude-loops-control-rights",
      score: 12,
      high_confidence: true,
    }]);

    const r = runStep2(slug);
    expect(r.status).toBe(0);
  });

  test("--allow-no-related bypasses blog memory gate and records state", () => {
    const slug = "2026-05-17-blog-memory-skipped";
    writeDraft(slug);
    writeBlogMemory(slug, [{
      slug: "claude-loops-control-rights",
      title: "你不是把任务交给 AI，你是在重新分配控制权",
      url: "https://ntlx.github.io/articles/claude-loops-control-rights",
      score: 12,
      high_confidence: true,
    }]);

    const r = runStep2WithArgs(slug, ["--allow-no-related"]);
    expect(r.status).toBe(0);

    const state = JSON.parse(readFileSync(join(TMP_ROOT, slug, ".pipeline-state.json"), "utf8"));
    expect(state.allow_no_related).toBe(true);
  });

  test("rejects the removed --no-humanizer flag instead of ignoring it", () => {
    const slug = "2026-05-17-no-humanizer-flag";
    writeDraft(slug);
    const r = runStep2WithArgs(slug, ["--no-humanizer"]);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("unknown flag --no-humanizer");
  });

  test("records a pending humanizer state after Step 2 passes", () => {
    const slug = "2026-05-17-humanizer-pending";
    writeDraft(slug);
    const r = runStep2(slug);
    expect(r.status).toBe(0);
    const state = JSON.parse(readFileSync(join(TMP_ROOT, slug, ".pipeline-state.json"), "utf8"));
    expect(state.humanizer).toEqual({ status: "pending" });
  });
});

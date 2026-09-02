#!/usr/bin/env bun

import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  getVisualStyleProfile,
  getWechatAuthorProfile,
} from "../scripts/config-lib.mjs";
import { validateImageReview } from "../scripts/image-review-lib.mjs";
import {
  assertFinalizedArtifactFreshness,
  assertFinalizeInputsFresh,
  assertPreparedArtifactFreshness,
  writeFinalizedArtifactManifest,
  writePreparedArtifactManifest,
} from "../scripts/artifact-integrity-lib.mjs";
import { validateMarkdownParity } from "../scripts/content-parity-lib.mjs";
import {
  assertCanonicalSignature,
  assertNoAuthorPlaceholders,
  replaceKnownAuthorPlaceholders,
} from "../scripts/author-profile-lib.mjs";
import {
  finalizeCanonicalPrompt,
  validateCanonicalPrompt,
  validateBaoyuDesign,
} from "../scripts/visual-plan-lib.mjs";

function plan(body = []) {
  return {
    visual_profile: "bright-vivid-warm",
    source_image_policy: "prefer-reuse",
    article_visual_design: {
      planner: "wechat-article-write-agent",
      coverage_review: [],
    },
    cover: {
      producer: "baoyu-cover-image",
      intent: "表达文章中心张力",
      baoyu_design: { skill: "baoyu-cover-image", aspect: "2.35:1", text: "none" },
      prompt_source: "external",
    },
    infographic: {
      producer: "baoyu-xhs-images",
      intent: "压缩全文判断",
      baoyu_design: { skill: "baoyu-xhs-images", card_count: 1 },
      text_density: "low",
      has_long_copy: false,
      prompt_source: "external",
    },
    illustrations: body.map((slot) => ({
      slot,
      producer: "baoyu-infographic",
      intent: `解释 ${slot}`,
      baoyu_design: { skill: "baoyu-infographic" },
      text_density: "low",
      has_long_copy: false,
      prompt_source: "external",
    })),
    source_image_review: [],
  };
}

describe("project-owned visual and author contracts", () => {
  test("reads the configured visual profile and author profile from this skill", () => {
    expect(getVisualStyleProfile()).toEqual({
      id: "bright-vivid-warm",
      brightness: "bright",
      saturation: "high",
      contrast: "high",
      background: "clean",
      clarity: "crisp",
      mood: "warm-positive",
    });
    expect(getWechatAuthorProfile()).toEqual({
      name: "NTLx",
      bio: "热衷于分享 AI 观察与干货",
      signature: "我是 NTLx，热衷于分享 AI 观察与干货。",
    });
  });

  test("accepts the fixed producer routes and rejects retired or crossed routes", () => {
    expect(validateBaoyuDesign(plan([1]))).toEqual([]);

    const wrongHeader = plan();
    wrongHeader.infographic.producer = "baoyu-infographic";
    expect(validateBaoyuDesign(wrongHeader).join("\n")).toContain("producer must be baoyu-xhs-images");

    const wrongBody = plan([1]);
    wrongBody.illustrations[0].producer = "baoyu-xhs-images";
    expect(validateBaoyuDesign(wrongBody).join("\n")).toContain("producer must be baoyu-infographic");

    const retiredPlanner = plan();
    retiredPlanner.article_visual_design.planner = "baoyu-article-illustrator";
    expect(validateBaoyuDesign(retiredPlanner).join("\n")).toContain("planner must be wechat-article-write-agent");
  });

  test("finalizes a canonical prompt with an idempotent project visual contract", () => {
    const first = finalizeCanonicalPrompt("Design a clear visual metaphor.", {
      profile: getVisualStyleProfile(),
      role: "cover",
      aspect: "2.35:1",
      textDensity: "none",
    });
    const second = finalizeCanonicalPrompt(first, {
      profile: getVisualStyleProfile(),
      role: "cover",
      aspect: "2.35:1",
      textDensity: "none",
    });

    expect(first).toContain("Project visual profile: bright-vivid-warm");
    expect(first).toContain("Aspect ratio: 2.35:1");
    expect(first.match(/WECHAT_ARTICLE_VISUAL_CONTRACT_START/g)).toHaveLength(1);
    expect(second).toBe(first);

    const customProfile = { id: "custom", override_reason: "用户明确要求黑暗赛博朋克风格" };
    const customPrompt = finalizeCanonicalPrompt("Follow the user's explicit direction.", {
      profile: customProfile,
      role: "body-illustration",
      textDensity: "low",
    });
    expect(validateCanonicalPrompt(customPrompt, { profile: customProfile, role: "body-illustration", textDensity: "low" })).toEqual([]);
  });

  test("requires a fresh approved receipt for every active generated asset", () => {
    const root = join(tmpdir(), `image-review-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(join(root, "imgs"), { recursive: true });
    const cover = Buffer.alloc(24);
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(cover);
    cover.writeUInt32BE(235, 16);
    cover.writeUInt32BE(100, 20);
    const info = Buffer.from(cover);
    writeFileSync(join(root, "cover.png"), cover);
    writeFileSync(join(root, "imgs", "00-infographic-core-summary.png"), info);
    const body = "<!-- SLOT_IMG_00_INFOGRAPHIC -->";
    const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
    const style = { bright: true, high_saturation: true, high_contrast: true, clean_background: true, crisp: true, warm: true, positive: true };
    const receipt = {
      version: 1,
      visual_profile: "bright-vivid-warm",
      assets: [
        { asset: "cover.png", role: "cover", sha256: sha(cover), approved: true, semantic_match: true, legibility: true, visible_text_ok: true, text_density: "none", has_long_copy: false, style_review: style, reviewer_note: "清晰" },
        { asset: "00-infographic-core-summary.png", role: "header", sha256: sha(info), approved: true, semantic_match: true, legibility: true, visible_text_ok: true, text_density: "low", has_long_copy: false, style_review: style, reviewer_note: "清晰" },
      ],
    };
    expect(validateImageReview({ postDir: root, imagePlan: plan(), draftBody: body, receipt })).toEqual([]);
    expect(validateImageReview({ postDir: root, imagePlan: plan(), draftBody: body, receipt: null }).join("\n")).toContain("image-review.json is missing");
    writeFileSync(join(root, "cover.png"), Buffer.concat([cover, Buffer.from([1])]));
    expect(validateImageReview({ postDir: root, imagePlan: plan(), draftBody: body, receipt }).join("\n")).toContain("SHA256 mismatch");
    rmSync(root, { recursive: true, force: true });
  });

  test("replaces known author templates and fails on unknown author templates", () => {
    const rendered = replaceKnownAuthorPlaceholders("我是 {{作者名}}，{{简介}}。\n{{一句话简介，如：一句话}}。\n");
    expect(rendered).toContain("我是 NTLx，热衷于分享 AI 观察与干货。");
    expect(assertNoAuthorPlaceholders(rendered)).toEqual([]);
    expect(assertCanonicalSignature("前文\n我是 NTLx，热衷于分享 AI 观察与干货。\n后文")).toEqual([]);
    expect(assertNoAuthorPlaceholders("我是 {{author}}，{{xxxx简介}}。")).toHaveLength(2);
    expect(assertCanonicalSignature("没有签名").join("\n")).toContain("exactly once");
  });

  test("compares dual-track Markdown topology after normalizing CDN and local image paths", () => {
    const article = `---\ntitle: 测试\n---\n\n![](https://cdn.example/00-infographic-core-summary.png)\n\n## A\n\n保留的正文。\n\n- 列表项一\n\n![](https://cdn.example/01-detail.png)\n\n## B\n\n第二段。\n`;
    const source = `---\ntitle: 测试\n---\n\n![](imgs/00-infographic-core-summary.png)\n\n## A\n\n保留的正文。\n\n- 列表项一\n\n![](imgs/01-detail.png)\n\n## B\n\n第二段。\n`;
    const map = {
      "00-infographic-core-summary.png": "https://cdn.example/00-infographic-core-summary.png",
      "01-detail.png": "https://cdn.example/01-detail.png",
    };
    expect(validateMarkdownParity(article, source, map).ok).toBe(true);
    expect(validateMarkdownParity(article.replace("保留的正文。", ""), source, map).errors.join("\n")).toContain("substantive block");
    expect(validateMarkdownParity(article.replace("## B", "![](https://cdn.example/01-detail.png)\n\n## B"), source, map).errors.join("\n")).toContain("body image count");
  });

  test("binds Step 5 finalize and publish inputs to a fresh artifact manifest", () => {
    const root = join(tmpdir(), `artifact-integrity-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(root, { recursive: true });
    for (const name of ["draft.md", "image-plan.json", "image-review.json", "article.md", "article-wechat-source.md"]) writeFileSync(join(root, name), name);
    writePreparedArtifactManifest(root);
    expect(assertPreparedArtifactFreshness(root)).toBe(true);
    writeFileSync(join(root, "article.md"), "changed");
    expect(() => assertPreparedArtifactFreshness(root)).toThrow(/article\.md/);
    writeFileSync(join(root, "article.md"), "article.md");
    writeFileSync(join(root, "article-wechat.html"), "html");
    writeFinalizedArtifactManifest(root);
    expect(assertFinalizedArtifactFreshness(root)).toBe(true);
    writeFileSync(join(root, "article-wechat.html"), "changed html");
    expect(() => assertFinalizedArtifactFreshness(root)).toThrow(/article-wechat\.html/);
    expect(assertFinalizeInputsFresh(root)).toBe(true);
    writeFinalizedArtifactManifest(root);
    expect(assertFinalizedArtifactFreshness(root)).toBe(true);
    rmSync(root, { recursive: true, force: true });
  });
});

# Cursor Reward Hacking Reader-Response Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Write, build, and dual-publish a Chinese reader-response article about Cursor's reward-hacking benchmark post.

**Architecture:** Use the repository's `wechat-article-write` `reader-response` pipeline end-to-end. Collect primary sources into `materials.md`, draft a first-person article with required SLOT placeholders and frontmatter, then run the existing step gates, acquire images through reuse plus generated assets, and finish with blog publication followed by WeChat draft publication.

**Tech Stack:** Markdown, Astro Starlight content pipeline, Bun scripts under `.agents/skills/wechat-article-write/scripts`, repository publishing automation, project image-generation skills.

## Global Constraints

- Strategy must remain `reader-response`.
- The article must be written for 泛技术读者 first, while still carrying enough detail for AI practitioners and product readers.
- The article must criticize benchmark-score inflation without collapsing into a rant.
- `summary` is the WeChat digest source and must be a single punchy sentence within 120 Chinese characters.
- `sourceUrl` must point to the final blog URL under `https://ntlx.github.io/articles/{blogSlug}`.
- `renwei-writing` is mandatory in Step 3.
- `SLOT_IMG_00_INFOGRAPHIC` is mandatory and body slots `SLOT_IMG_01+` must be at least three.
- Blog release must happen before WeChat draft release.
- Only files directly required by this article should be changed.

---

### Task 1: Create the post workspace and source packet

**Files:**
- Create: `posts/2026-06-28-当分数开始替能力说话/materials.md`
- Create: `posts/2026-06-28-当分数开始替能力说话/original-assets/`
- Modify: none
- Test: `bun run .agents/skills/wechat-article-write/scripts/step1-collect.mjs 2026-06-28-当分数开始替能力说话`

**Interfaces:**
- Consumes: approved design in `docs/superpowers/specs/2026-06-28-cursor-reward-hacking-reader-response-design.md`
- Produces: `materials.md` with source sections, `## 背景调研`, and URLs that Step 1 can validate

- [ ] **Step 1: Create the article directory**

Run:

```bash
mkdir -p "posts/2026-06-28-当分数开始替能力说话/original-assets"
```

Expected: the target directory exists.

- [ ] **Step 2: Collect and save primary source text and image URLs**

Run the chosen fetch commands against:

```text
https://cursor.com/blog/reward-hacking-coding-benchmarks
https://cursor.com/blog/cursorbench
https://swe-bench.com/
```

Expected: enough raw text, metadata, and image references to summarize the source faithfully and reuse at least one information-carrying chart if available.

- [ ] **Step 3: Write `materials.md` with original source, background research, and image notes**

Include:

```markdown
# 材料

## 原文

> 来源
> https://cursor.com/blog/reward-hacking-coding-benchmarks

原文主张、关键数字、关键图表……

---

## 背景调研

- 来源 URL 1：补充说明……
- 来源 URL 2：补充说明……
```

Expected: the file is non-empty, uses `---` between source packets where needed, and includes explicit notes on which original images are worth reusing.

- [ ] **Step 4: Run Step 1 gate**

Run:

```bash
bun run .agents/skills/wechat-article-write/scripts/step1-collect.mjs 2026-06-28-当分数开始替能力说话
```

Expected: exit code `0` and Step 1 state written.

### Task 2: Draft the article and visual plan

**Files:**
- Create: `posts/2026-06-28-当分数开始替能力说话/draft.md`
- Create: `posts/2026-06-28-当分数开始替能力说话/image-plan.json`
- Modify: none
- Test: `bun run .agents/skills/wechat-article-write/scripts/step2-write.mjs 2026-06-28-当分数开始替能力说话`

**Interfaces:**
- Consumes: `posts/2026-06-28-当分数开始替能力说话/materials.md`
- Produces: valid `draft.md` frontmatter and SLOT structure plus minimal `image-plan.json`

- [ ] **Step 1: Write the article draft with complete frontmatter and slot planning**

The draft must include:

```markdown
---
title: 当分数开始替能力说话
date: 2026-06-28
summary: 先别急着庆祝模型更聪明了，很多时候真正上涨的只是它刷分和我们自我说服的能力。
category: ai-coding
blogSlug: when-scores-speak-for-capability
coverImage: cover.png
sourceUrl: https://ntlx.github.io/articles/when-scores-speak-for-capability
---

<!-- SLOT_IMG_00_INFOGRAPHIC -->
```

Expected: 3-6 `##` sections, at least three body SLOTs, a first-person critical voice, a closing interaction prompt, and `## 原文参考`.

- [ ] **Step 2: Create the image plan**

Write:

```json
{
  "article_type": "deep-analysis"
}
```

Expected: `image-plan.json` exists and is valid JSON.

- [ ] **Step 3: Run Step 2 gate**

Run:

```bash
bun run .agents/skills/wechat-article-write/scripts/step2-write.mjs 2026-06-28-当分数开始替能力说话
```

Expected: exit code `0` and validated frontmatter, source URL, body structure, and reference section.

### Task 3: Humanize, format, and validate the text

**Files:**
- Modify: `posts/2026-06-28-当分数开始替能力说话/draft.md`
- Test: `bun run .agents/skills/wechat-article-write/scripts/step3-polish.mjs 2026-06-28-当分数开始替能力说话`

**Interfaces:**
- Consumes: valid `draft.md`
- Produces: humanized and formatted `draft.md` that still preserves all SLOT placeholders and frontmatter invariants

- [ ] **Step 1: Run `renwei-writing` on the draft body**

Expected: the voice becomes less generic without losing first-person judgment.

- [ ] **Step 2: Run `baoyu-format-markdown` on the draft**

Expected: formatting is normalized while keeping all SLOT comments intact.

- [ ] **Step 3: Run Step 3 gate**

Run:

```bash
bun run .agents/skills/wechat-article-write/scripts/step3-polish.mjs 2026-06-28-当分数开始替能力说话
```

Expected: exit code `0` and validation of frontmatter, source URL, and image placeholders.

### Task 4: Acquire images and satisfy Step 4

**Files:**
- Create: `posts/2026-06-28-当分数开始替能力说话/cover.png`
- Create: `posts/2026-06-28-当分数开始替能力说话/imgs/`
- Create: `posts/2026-06-28-当分数开始替能力说话/imgs/prompts/`
- Modify: generated prompt files under `posts/2026-06-28-当分数开始替能力说话/imgs/prompts/`
- Test: `bun run .agents/skills/wechat-article-write/scripts/step4-images.mjs 2026-06-28-当分数开始替能力说话`

**Interfaces:**
- Consumes: `draft.md`, `image-plan.json`, reusable original asset candidates
- Produces: `cover.png` plus all `NN-<desc>.png` SLOT assets and prompt files

- [ ] **Step 1: Generate prompts**

Run:

```bash
bun run .agents/skills/wechat-article-write/scripts/generate-image-prompts.mjs 2026-06-28-当分数开始替能力说话
```

Expected: prompt files for cover, `SLOT 00`, and each body image exist.

- [ ] **Step 2: Reuse original image assets where they genuinely help**

Expected: any reused chart is saved with the correct `NN-<desc>` filename and matched to the correct slot.

- [ ] **Step 3: Generate remaining required images serially**

Run the provider chain per image:

```bash
bun run .agents/skills/baoyu-image-gen/scripts/main.ts --provider codex-cli --promptfiles posts/2026-06-28-当分数开始替能力说话/imgs/prompts/00-infographic-core-summary.md --image posts/2026-06-28-当分数开始替能力说话/imgs/00-infographic-core-summary.png --ar 16:9
```

Expected: each required image is created with the exact expected filename. If `codex-cli` fails, rerun that same image once with the configured fallback provider.

- [ ] **Step 4: Run Step 4 gate**

Run:

```bash
bun run .agents/skills/wechat-article-write/scripts/step4-images.mjs 2026-06-28-当分数开始替能力说话
```

Expected: exit code `0` and all slot/image mappings accepted.

### Task 5: Build artifacts and complete dual-track publication

**Files:**
- Create: `posts/2026-06-28-当分数开始替能力说话/article.md`
- Create: `posts/2026-06-28-当分数开始替能力说话/article-wechat.html`
- Modify: final published article under `src/content/docs/articles/`
- Test: `bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs 2026-06-28-当分数开始替能力说话`
- Test: `bun run .agents/skills/wechat-article-write/scripts/publish-blog.mjs 2026-06-28-当分数开始替能力说话`
- Test: `bun run .agents/skills/wechat-article-write/scripts/publish-wechat.mjs 2026-06-28-当分数开始替能力说话`

**Interfaces:**
- Consumes: validated text and image assets
- Produces: blog-ready Markdown, WeChat HTML, published blog content, and a WeChat draft with title, digest, cover, and source URL

- [ ] **Step 1: Build the artifacts**

Run:

```bash
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs 2026-06-28-当分数开始替能力说话
```

Expected: artifact generation completes and image uploading/CDN mapping succeeds.

- [ ] **Step 2: Publish the blog**

Run:

```bash
bun run .agents/skills/wechat-article-write/scripts/publish-blog.mjs 2026-06-28-当分数开始替能力说话
```

Expected: the article is written into `src/content/docs/articles/`, Astro sync/build succeeds, and the repository push completes.

- [ ] **Step 3: Publish the WeChat draft**

Run:

```bash
bun run .agents/skills/wechat-article-write/scripts/publish-wechat.mjs 2026-06-28-当分数开始替能力说话
```

Expected: the draft is created with `title`, `summary`, `cover`, and `sourceUrl`.

- [ ] **Step 4: Verify final outputs**

Run:

```bash
bun run .agents/skills/wechat-article-write/scripts/state.mjs next 2026-06-28-当分数开始替能力说话
```

Expected: no remaining step is pending, or only a terminal completion state is reported.

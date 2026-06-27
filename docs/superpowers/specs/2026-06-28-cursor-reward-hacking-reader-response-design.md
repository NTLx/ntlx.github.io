# Cursor Reward Hacking Reader-Response Design

## Goal

Create and publish a Chinese reader-response article based on Cursor's June 25, 2026 post "Reward hacking is swamping model intelligence gains", then complete the repository's dual-track release flow: blog first, WeChat draft second.

## Context

- Source article: `https://cursor.com/blog/reward-hacking-coding-benchmarks`
- Requested outcome: a personal-response article, not a translation or neutral summary
- Strategy: `wechat-article-write` `reader-response`
- Primary audience: 泛技术读者
- Secondary audiences to accommodate: AI 从业者, 产品/创始人
- User-approved writing direction: 行业自嗨批判，但不能写成纯吐槽；要先让读者跟上，再逐步变得不舒服

## Core Thesis

This article treats Cursor's post as evidence of a broader industry pattern, not as an isolated benchmark footnote. The center of gravity is:

> AI coding discourse too often mistakes optimizable scores for trustworthy capability, then repackages those scores as proof of real progress.

The article should therefore do three things at once:

1. Explain why the reward-hacking discussion matters beyond evaluation design.
2. Show why stricter harnesses expose capability inflation rather than merely revealing one more bug in a benchmark.
3. Turn the critique away from only "model cheating" and toward the surrounding incentive system: vendors, media, users, and investors all rewarding the wrong signal.

## Audience and Voice

- Lead with a readable, intuitive opening for non-specialists.
- Delay jargon until the reader already understands why the issue matters.
- Preserve first-person judgment and self-questioning rather than flattening into an explainer.
- Keep the tone critical but measured; the article should feel like an honest tightening of judgment, not a rant.

## Article Structure

### 1. Why this article felt grating

Open from personal reaction, not definitions. The irritation is not that models exploit loopholes; it is that the industry keeps acting surprised whenever benchmark incentives shape behavior.

### 2. The model is gaming the benchmark, and the industry is gaming itself

Explain reward hacking in plain language and show the two major routes discussed in the source materials:

- retrieving already-landed fixes from the internet
- using repository state or history to reach answers the model should not legitimately have

The point is not that the model is immoral. The point is that score pressure makes this behavior predictable.

### 3. Tighten the harness and the story changes

This is the evidence section. Explain strict harnesses, repository-state loopholes, submission gating, and why performance drops under stricter conditions matter more than flashy top-line scores.

### 4. The real risk is misrecognition

Shift from evaluation mechanics to industry narrative. The article should argue that the deeper problem is not cheating itself but the collective willingness to misread gamed indicators as durable capability.

### 5. What I will trust now

Close with a personal standards reset: what kinds of evaluation, product claims, and demonstrations deserve more trust after reading this. End with an interaction prompt that opens discussion rather than pretending to settle the issue.

## Source Plan

Step 1 materials must include:

- the Cursor source article
- Cursor's earlier `cursorbench` article for evaluation context
- SWE-bench official documentation or benchmark overview
- directly relevant public discussion or repository material on repo-state loopholes / stricter harnesses
- any primary-source data or screenshots needed to support cited score changes

The article must cite sources clearly in `## 原文参考`, and `materials.md` must include `## 背景调研` with URLs.

## Image Plan

- Reuse original source images only when they carry actual explanatory value.
- Priority candidate for reuse: the strict-harness comparison chart from the Cursor article.
- Do not reuse decorative hero art just for visual variety.
- Generate the remaining required assets to satisfy pipeline invariants:
  - `SLOT 00` opening infographic
  - at least three `SLOT_IMG_01+` body visuals
- The custom visuals should cover:
  - reward-hacking pathways
  - score-to-story feedback loop
  - article-level summary or trust-reset framing

## Pipeline Constraints

- Keep blog and WeChat artifacts fully separated.
- `summary` must be a single punchy sentence within 120 Chinese characters.
- `sourceUrl` must point to the final blog URL, not the Cursor source.
- `reader-response` requires `renwei-writing` in Step 3.
- Step failures must be repaired and rerun at the same gate; do not skip ahead.

## Delivery Definition

Work is only complete when all of the following exist and pass their gate:

- `posts/<date-slug>/materials.md`
- `posts/<date-slug>/draft.md`
- `posts/<date-slug>/image-plan.json`
- `posts/<date-slug>/imgs/*` and `cover.png`
- `posts/<date-slug>/article.md`
- `posts/<date-slug>/article-wechat.html`
- blog publication via `publish-blog.mjs`
- WeChat draft publication via `publish-wechat.mjs`

---
name: wechat-article-write
description: >
  Use when creating or resuming a blog and WeChat article, preparing its
  visuals and platform editions, or publishing the finished article.
license: MIT
metadata:
  author: NTLx
  version: "4.8.0"
---

# 微信公众号文章写作

Quality means reliable facts, a defensible original judgement, natural writing, and visuals that
help readers understand. Passing scripts is necessary but does not establish editorial quality.
Main reviews these qualities before freezing the draft; scripts verify deterministic invariants.

## Execution model

Main is the default executor and owns the article workflow from start to finish.
Main directly performs the semantic work, runs deterministic commands, reviews artifacts,
repairs owned outputs, and coordinates publishing.

Main directly owns:

- primary-source reading and understanding;
- materials synthesis and blog memory;
- understanding, thesis, drafting, and review;
- visual integration and final-raster review;
- `humanizer-zh` and all required specialist Skill invocations;
- deterministic scripts, Gates, build preparation, validation, repair, and publishing.

Background research may be delegated to one temporary research child when external retrieval,
cross-source checking, or large web/PDF/media material would materially expand Main's context.
Research delegation is optional. It supplies compact evidence; Main makes the final editorial
judgement. Read [references/research-delegation.md](references/research-delegation.md) when
external research is needed.

Skill invocation does not imply an Agent context. Specialist ownership is a capability boundary,
not an execution-isolation requirement:

```text
Main → Specialist Skill → review result → continue workflow
```

Do not introduce a new Agent boundary merely to isolate responsibility. Use artifacts, Skills,
deterministic scripts, and Gates as responsibility boundaries first. An additional model context
is exceptional and is justified only by external retrieval or unusually large context volume.

## Start / resume

Main reads the existing state, determines the ASCII `date-slug`, strategy (`reader-response`,
`tutorial`, or `news-digest`), and next step. For a new task or resume, Main may directly run:

```bash
bun run .agents/skills/wechat-article-write/scripts/state.mjs init <date-slug>
bun run .agents/skills/wechat-article-write/scripts/state.mjs next <date-slug>
```

Run commands from the verified repository root; pass absolute paths across specialist/script
boundaries. On resume, read existing artifacts for the indicated step and its failed input, not
the entire workflow again. A corrupt state is blocking: preserve artifacts and restore a valid
checkpoint rather than initialize over it.

State remains v2. `.pipeline-state.json` is business state only: do not add agent, thread,
context, token, handoff, or execution telemetry. `last_complete_step` remains the durable
checkpoint; `publish.blog` and `publish.wechat` remain independently resumable.

## Workflow

### Step 1 — Primary source and background research

Main reads and understands the primary source directly: its claims, evidence, facts, interpretations,
opinions, boundaries, and obvious problems. A research child may retrieve only supporting background
evidence and must not replace Main's primary-source understanding.

Main merges the evidence into `materials.md`, preserving Primary Source provenance and uniqueness.
For `reader-response` and `news-digest`, `## 原始来源` records the direct writing object and
`## 背景调研` records supporting evidence. `tutorial` records provenance when a clear external
primary source exists. Research follows evidence needs: reader-response normally supplements the
primary material (missing background is advisory); news-digest requires traceable external verification;
tutorial may use sufficient local/user evidence without online research. For factual gaps, version
claims, external technical assertions, or time-sensitive facts, retrieve authoritative evidence.
Then Main directly runs:

```bash
bun run .agents/skills/wechat-article-write/scripts/step1-collect.mjs <date-slug>
```

The collector checks strategy-appropriate evidence, source uniqueness, and provenance. A repeated primary
source blocks a new article; supporting references do not count as primary-source matches.

### Step 1.5 — Blog memory

Main directly runs:

```bash
bun run .agents/skills/wechat-article-write/scripts/select-related-articles.mjs <date-slug>
```

Main reads `blog-memory.md` and handles duplicate primary sources, related historical articles,
internal-link opportunities, and recent rhetorical skeletons. Recent-site similarity is advisory;
primary-source duplication remains blocking.

### Step 1.8 — Understanding

Before writing, read [references/material-understanding.md](references/material-understanding.md)
and [references/originality-policy.md](references/originality-policy.md).
Main creates or updates `understanding-brief.md` using the primary-source model, background evidence,
blog memory, user intent, and the selected strategy. The brief covers evidence, a central judgement or engineering objective, boundaries, the source-derived fact ledger, and how those
findings guide the article. Match its depth and headings to the strategy. Main reviews actual
understanding and reader value; the Gate checks nonempty content domains without imposing visual
nodes, an originality count, or a fixed seven-section template.

Understanding stays Main's own work: Main reads and understands the primary source directly, and a
research child must not replace Main's primary-source understanding. When a specific cognitive gap
needs a structured method, the only on-demand understanding candidates are `ljg-structure` (supports
`read-only` and writes no file), `ljg-paper`, and `ljg-constraint`. Candidates are optional;
`no-skill` stays legal, every candidate output still passes Main's second judgement, and the closed
list governs new invocations rather than candidate credits already recorded in existing briefs. Do
not grow this into an open capability catalog: adding or removing a candidate means updating
[references/material-understanding.md](references/material-understanding.md) and the architecture
check together.

The brief must also carry `## 允许援引的事实`, the source-derived fact ledger defined in
[references/material-understanding.md](references/material-understanding.md). It is the only
allowlist for dimensioned facts, state commitments, counterfactual baselines, and cross-source
identity claims.

Main directly runs:

```bash
bun run .agents/skills/wechat-article-write/scripts/validate-understanding.mjs <date-slug>
```

On failure Main repairs the brief and reruns the Gate. Only missing external evidence justifies
asking the research child for a targeted supplement.

### Step 2 — Draft

Read the selected strategy and [references/content-invariants.md](references/content-invariants.md).
Main writes a complete, readable article without Markdown image nodes or pipeline-specific visual planning markup in
`draft.md`, using `materials.md`, `understanding-brief.md`, `blog-memory.md`,
the selected strategy reference, and the content invariants. Preserve frontmatter, summary,
`blogSlug`, `sourceUrl`, H2 topology, visible URLs, quotations, related articles,
strategy constraints, and originality requirements.

Main directly runs:

```bash
bun run .agents/skills/wechat-article-write/scripts/step2-write.mjs <date-slug>
```

The ending is an editorial decision: no question mark or interaction formula is required.
Gate failure means Main inspects the diagnostic, repairs the draft, and reruns the same Gate.

### Step 3 — Humanization

`humanizer-zh` remains mandatory, but mandatory Skill does not mean mandatory child Agent. Main
passes the current `draft.md` to `humanizer-zh`, reviews the result, and checks semantic drift,
facts, numbers, URLs, names, quotations, code, key judgements, and H2 order. Main may invoke the same Skill
again for a targeted correction.

Drift review compares the humanized draft with the pre-humanization draft, so it cannot detect a
claim that was already unsupported when the draft was written. Before freezing the text, reconcile
every falsifiable claim in `draft.md` — including the frontmatter `summary`, which becomes the
published `description` — against the source-derived fact ledger in `understanding-brief.md`.
Main directly runs:

```bash
bun run .agents/skills/wechat-article-write/scripts/validate-claims.mjs <date-slug>
```

Only claims registered with an exact source span, an explicit `derived` derivation, or an explicit
`rhetoric` marker may carry a dimensioned fact, a state commitment, a counterfactual baseline, or a
cross-source identity claim. An uncovered claim is repaired by rewriting it, or by registering its
source span in the ledger. The check proves coverage, not truth, and Main still owns the
reconciliation. After a ledger edit rerun `validate-claims.mjs` only — do not rerun the Step 1.8
validator, which would move `last_complete_step` back to 1.

Main then directly runs:

```bash
bun run .agents/skills/wechat-article-write/scripts/step3-polish.mjs <date-slug>
```

After Step 3, `draft.md` is the immutable textual source. Visual processing uses a separate
`visual-draft.md` and must not modify the frozen draft. The `step3_draft_sha256` contract remains unchanged. Resuming at Step 3 uses the frozen
`draft.md` and does not regenerate the draft unless the diagnostic explicitly identifies the draft
as the owner.

### Step 4 — Visuals

Read [references/image-policy.md](references/image-policy.md). Initialize an exact copy of frozen
`draft.md` as `visual-draft.md`:

```bash
bun run .agents/skills/wechat-article-write/scripts/step4-images.mjs <date-slug> --initialize-only
```

Initialization checks the frozen source and returns INITIALIZED for a new copy. An existing exact
copy returns ALREADY_INITIALIZED; existing visual work returns RESUME_EXISTING. Both resume
results leave the artifact and business state unchanged. Initialization never marks Step 4 done.
On resume, check existing visual work for freshness before proceeding.
The visual draft is the only article input Specialists may modify;
only local Markdown image insertions are allowed. Main supplies article semantics and reviews
results; the owning Skills decide professional visual form, prompts, and body placement.

For every generated raster in this Step, apply the project-wide visual tone defined in
`references/image-policy.md`:

```text
明亮、鲜艳、高饱和、高对比；背景干净，边缘清晰，情绪温暖积极。

Bright, vivid, high-saturation and high-contrast visual language;
clean uncluttered backgrounds; crisp, well-defined edges and shapes;
warm and positive emotional tone.
```

Pass this requirement explicitly to every owning visual Skill. It is an art-direction overlay and
must not replace that Skill's configured style, palette, layout, type, or semantic judgement, and it
never applies to reused source figures or screenshots.

Raster generation in this Step is globally serial.

Main MUST execute raster-producing Specialist workflows sequentially and MUST NOT dispatch parallel
generation calls. Finish the current owner's generation and any immediate owner-local regeneration
before invoking the next raster-producing owner.

Normal sequence: 1. `baoyu-cover-image`, 2. `baoyu-infographic`, 3. `baoyu-article-illustrator`.
Do not run any two of these generation workflows concurrently.

The illustrator additionally uses `generation_batch_size: 1`, so its own body-image raster dispatch
is serial.

Step 4 and every raster-producing Specialist invocation MUST run with the project root as the
working directory. The raster backend resolves the project `.baoyu-skills` configuration from its
working directory; from anywhere else it silently falls back to environment-level configuration and
loses the pinned backend and worker cap. `step4-images.mjs` enforces this in preflight.

1. Invoke `baoyu-cover-image` with the final article, quick mode, aspect `2.35:1`, text `none`,
   language `zh`, and backend `baoyu-image-gen`. Honor the project EXTEND preferences, including the
   `bright-vivid-warm` palette and bold mood, and apply the project-wide generated-image tone. The
   cover Skill still chooses its own type and rendering. Normalize the chosen raster to exactly one
   `cover.png` or `cover.jpg` in the post root. Complete cover generation and inspect the selected
   final raster before dispatching the lead infographic workflow; if regeneration is required, finish
   that owner-local retry before moving to the next raster owner.
2. Invoke `baoyu-infographic` for the lead infographic only, using `draft.md` and necessary
   semantic context from `understanding-brief.md`. Invoke this workflow only after the cover
   generation lane is complete. Honor the project EXTEND defaults — claymation
   style, landscape aspect, language `zh`, backend `baoyu-image-gen` — and use `--no-confirm` so it
   generates directly. Apply the project-wide tone as an overlay on claymation rather than replacing
   it. The Skill owns content analysis, information layout, semantic structure, style, and prompt:
   do not preselect a layout. Finish any infographic regeneration before invoking the body
   illustrator. Integrate its selected raster as `imgs/00-infographic-core-summary.png`
   (or another supported raster extension), after the opening prose and before the first
   substantive H2, as the first body image.
3. Invoke `baoyu-article-illustrator` on `visual-draft.md` for body illustration analysis and
   generation, even for a short article. Honor the project EXTEND defaults — notion style, macaron
   palette, language `zh`, `imgs/` output, backend `baoyu-image-gen`, one image generated at a time —
   and apply the project-wide tone as an art-direction overlay that preserves notion as the base
   visual language and macaron as its palette. Explicitly instruct it: analyze information gain and
   place useful body visuals yourself; preserve the existing lead infographic; do not generate
   another header summary or mechanically illustrate each H2; avoid duplicating source evidence;
   insert images without rewriting article text; directly generate without further user
   confirmation. Recommend balanced density for normal long-form and minimal density for clearly
   short articles. The Skill owns its outline, prompts, generation, and Markdown insertion; Main
   does not prescribe positions or an image count. Generating one image at a time changes only the
   raster dispatch batch, not the Skill's own analyze-then-outline-then-generate workflow. Any
   article length may receive zero body illustrations when the illustrator analysis and Main review
   support it.
4. Inspect every exact final raster. When size, format, platform rejection, explicit optimization,
   or publishing performance requires compression, invoke `baoyu-compress-image` and inspect
   the resulting raster again. Prefer same-format compression; update `visual-draft.md` if the
   extension changes. Otherwise skip compression.

All three visual Skills use the project `preferred_image_backend: baoyu-image-gen` preference.
Main must not bypass them with direct runtime image generation or call the backend to imitate
cover, infographic, or body illustration design. Provider, model, transport, and generation
retries belong to `baoyu-image-gen`; compression implementation belongs to `baoyu-compress-image`.
Keep only final article rasters at the top of `imgs/`; auxiliary outline/prompts and comparison
candidates remain Specialist-private and outside the hosting collection. Main reviews and returns
failed visuals to the same owning Skill for targeted regeneration, including text errors and
project-wide tone deviations.

Main directly runs:

```bash
bun run .agents/skills/wechat-article-write/scripts/step4-images.mjs <date-slug>
```

The Gate verifies the Step 3 draft hash, image-only visual-draft parity, one usable cover with
correct MIME and aspect, one lead infographic in the required position, and contained local
raster references. Body illustration count remains an editorial decision after actual illustrator
analysis. No invocation receipt is required.

### Step 5 — Build

Main directly calls `github-image-hosting` after checking:

```bash
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs <date-slug> --hosting-status
```

`FROZEN` means the existing `image-map.json` still matches `visual-draft.md` and `imgs/`;
hosting must not be repeated. Cover identity belongs to publication freshness, independently of
hosting. After a cover change, inspect it and rerun Step 4, then prepare with the existing map
and finalize before publishing.
When hosting is needed, Main reviews the resulting map and then runs:

```bash
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs <date-slug> --prepare-only
```

The build consumes `visual-draft.md` and `image-map.json`, producing `article.md` with CDN
images and `article-wechat-source.md` with local images. `draft.md` still supplies textual freshness. Main directly invokes `gzh-design` with
the WeChat source and local `imgs/`; the Skill produces `article-wechat.html`, native validation,
and preview. The input/output and content-preservation contract is in
[references/adapter-gzh-design.md](references/adapter-gzh-design.md). Main then directly runs:

```bash
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs <date-slug> --finalize-only
```

The parent structural parity and integrity Gate remains read-only and blocking on errors. Use
owner-local repair with the current HTML and frozen source. The adapter owns the retry sequence
and stopping condition: a repeated failure class is `BLOCKED`. This is a Skill retry,
not a new Agent context. Route upstream defects to their artifact owner.

### Step 6 — Publish

Read [references/publishing.md](references/publishing.md) for publish inputs and recovery.
Execute only the channels authorized by the user; existing authorization persists on resume.
Check independent publish states first and skip completed channels. For a new dual-track publish,
Main directly runs blog publish first:

```bash
bun run .agents/skills/wechat-article-write/scripts/publish-blog.mjs <date-slug>
```

The blog track consumes `article.md` and preserves freshness, provenance, Git safety, tracked
pipeline cleanliness, and publish state. Blog push is not a Pages deployment.

For WeChat, Main directly runs:

```bash
bun run .agents/skills/wechat-article-write/scripts/publish-wechat.mjs <date-slug> --prepare-only
```

Main then invokes `baoyu-post-to-wechat` with `article-wechat.html`. The Skill owns cover upload,
body image handling, draft creation, and its API/browser selection. After success Main directly runs:

```bash
bun run .agents/skills/wechat-article-write/scripts/publish-wechat.mjs <date-slug> --finalize-only [--media-id <id>]
```

Blog and WeChat publish state remain independent and resumable.

## Retry and failure rules

Retry locally before changing context:

- Understanding and draft: Main repairs the artifact and reruns its Gate.
- Humanization: Main invokes `humanizer-zh` again with the relevant frozen input.
- Visuals: Main asks the same specialist Skill for targeted regeneration.
- Step 5: follow the owner-local repair contract in `references/adapter-gzh-design.md`.
- Publish: Main retries only the failed blog or WeChat operation.
- Research: Main asks the research child only for missing or conflicting evidence.

Do not bypass a Gate, edit an owned specialist artifact to hide a failure, or introduce a new
context merely because a Step changed, a Gate failed, a file was materialized, a deterministic
script ran, a visual was generated, or a retry is needed. Runtime context recovery is an exceptional
runtime concern, not a normal workflow contract.

## Fixed Specialist ownership

These Skills own their capability boundaries. Main invokes the three visual owners, which call
the raster backend; compression is invoked only when needed. Main reviews their final results:

| Capability | Owner |
|---|---|
| Humanization | `humanizer-zh` |
| Cover | `baoyu-cover-image` |
| Header infographic | `baoyu-infographic` |
| Body illustration analysis + generation | `baoyu-article-illustrator` |
| Raster generation backend | `baoyu-image-gen` |
| Image compression | `baoyu-compress-image` |
| Blog/CDN hosting | `github-image-hosting` |
| WeChat HTML layout | `gzh-design` |
| WeChat draft publishing | `baoyu-post-to-wechat` |

Specialist Skills own their professional workflows and configuration. Main must not replace a
mandatory Skill with a generic imitation, but Skill invocation still leaves Main as the workflow owner.

## References

Read only the references needed for the current work:

| Work | Reference |
|---|---|
| background research delegation | `research-delegation.md` |
| understanding and originality | `material-understanding.md`, `originality-policy.md` |
| draft/build invariants | `content-invariants.md`, `publishing.md` |
| visual integration and review | `image-policy.md` |
| WeChat layout and repair | `adapter-gzh-design.md` |
| Gate recovery | `troubleshooting.md` |
| strategy | the selected `strategy-*.md` |

The deterministic scripts preserve state v2, provenance, source uniqueness, understanding and
content Gates, Step 3 hash, visual integration, Step 4, Step 5 parity/integrity, and publish freshness.

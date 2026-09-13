---
name: wechat-article-write
description: >
  Orchestrates this repository's WeChat + blog article workflow. Use when
  creating or resuming an article, producing its required visuals, building
  the dual blog/WeChat artifacts, or publishing the blog and WeChat draft.
license: MIT
metadata:
  author: NTLx
  version: "3.0.0"
---

# 微信公众号文章写作

## Execution model

Main is the default executor and owns the article workflow from start to finish.
Main directly performs the semantic work, runs deterministic commands, reviews artifacts,
repairs owned outputs, and coordinates publishing.

Main directly owns:

- primary-source reading and understanding;
- materials synthesis and blog memory;
- understanding, thesis, drafting, and review;
- visual planning and final-raster review;
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
primary source exists. Then Main directly runs:

```bash
bun run .agents/skills/wechat-article-write/scripts/step1-collect.mjs <date-slug>
```

The collector Gate, source uniqueness, and provenance rules remain unchanged. A repeated primary
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

Main creates or updates `understanding-brief.md` using the primary-source model, background evidence,
blog memory, user intent, and the selected strategy. The brief must preserve the existing contract:
core question, central judgement, mechanism, constraints, counterarguments, boundaries, writable
judgements, visualizable nodes, at least three originality increments, and the writing contract.

Main directly runs:

```bash
bun run .agents/skills/wechat-article-write/scripts/validate-understanding.mjs <date-slug>
```

On failure Main repairs the brief and reruns the Gate. Only missing external evidence justifies
asking the research child for a targeted supplement.

### Step 2 — Draft

Main directly creates `draft.md` from `materials.md`, `understanding-brief.md`, `blog-memory.md`,
the selected strategy reference, and the content invariants. Preserve frontmatter, summary,
`blogSlug`, `sourceUrl`, H2 topology, visible URLs, quotations, related articles, SLOT topology,
strategy constraints, and originality requirements.

Main directly runs:

```bash
bun run .agents/skills/wechat-article-write/scripts/step2-write.mjs <date-slug>
```

Gate failure means Main inspects the diagnostic, repairs the draft, and reruns the same Gate.

### Step 3 — Humanization

`humanizer-zh` remains mandatory, but mandatory Skill does not mean mandatory child Agent. Main
passes the current `draft.md` to `humanizer-zh`, reviews the result, and checks semantic drift,
facts, numbers, URLs, terminology, H2 order, and SLOT topology. Main may invoke the same Skill
again for a targeted correction. Main then directly runs:

```bash
bun run .agents/skills/wechat-article-write/scripts/step3-polish.mjs <date-slug>
```

The Step 3 `step3_draft_sha256` contract remains unchanged. Resuming at Step 3 uses the frozen
`draft.md` and does not regenerate the draft unless the diagnostic explicitly identifies the draft
as the owner.

### Step 4 — Visuals

Main plans the cover, `SLOT_IMG_00`, body visual nodes, source-image reuse, generated assets, and
their semantic purposes from the understanding brief and final draft. Main directly invokes the
required specialist Skills, inspects each exact final raster, and performs targeted regeneration
when needed:

- `baoyu-cover-image` for the cover, with the equivalent `--quick --aspect 2.35:1 --no-title` parameters;
- `baoyu-infographic` for `SLOT_IMG_00` and generated body visuals, with the equivalent `--no-confirm` parameter;
- `baoyu-diagram` only when a clearly named semantic gap needs it;
- source images are reused when they are the right evidence and are recorded as `kind: source`.

Main maintains `image-plan.json` and directly runs:

```bash
bun run .agents/skills/wechat-article-write/scripts/step4-images.mjs <date-slug>
```

The visual coverage, cover ratio, SLOT00 uniqueness, basename, source/generated facts, and local
file Gates remain unchanged. See [references/image-policy.md](references/image-policy.md).

### Step 5 — Build

Main directly calls `github-image-hosting` after checking:

```bash
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs <date-slug> --hosting-status
```

`FROZEN` means the existing `image-map.json` is still valid and hosting must not be repeated.
When hosting is needed, Main reviews the resulting map and then runs:

```bash
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs <date-slug> --prepare-only
```

This produces `article.md` and `article-wechat-source.md`. Main directly invokes `gzh-design` with
the WeChat source and local `imgs/`; the Skill produces `article-wechat.html`, native validation,
and preview. The input/output and content-preservation contract is in
[references/adapter-gzh-design.md](references/adapter-gzh-design.md). Main then directly runs:

```bash
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs <date-slug> --finalize-only
```

The parent structural parity and integrity Gate remains read-only and blocking on errors. On the
first child-owned structural failure, Main gives the current HTML, frozen source, and bounded
diagnostic back to the same `gzh-design` Skill for surgical owner-local repair, then reruns native
validation, preview, and finalize. If the same local failure persists, Main may call `gzh-design`
once more from the frozen source; a repeated failure class is `BLOCKED`. This is a Skill retry,
not a new Agent context. Upstream failures are routed back to the owner of the source, draft,
image plan, image map, or freshness input; gzh-design must not fabricate or patch upstream artifacts.

### Step 6 — Publish

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
- Step 5: Main uses `gzh-design` owner-local repair before any frozen-source rebuild; the same
  failure class twice is `BLOCKED`.
- Publish: Main retries only the failed blog or WeChat operation.
- Research: Main asks the research child only for missing or conflicting evidence.

Do not bypass a Gate, edit an owned specialist artifact to hide a failure, or introduce a new
context merely because a Step changed, a Gate failed, a file was materialized, a deterministic
script ran, a visual was generated, or a retry is needed. Runtime context recovery is an exceptional
runtime concern, not a normal workflow contract.

## Fixed Specialist ownership

These Skills remain mandatory at their capability boundary; Main invokes and reviews them directly:

| Capability | Main invokes |
|---|---|
| humanization / Step 3 | `humanizer-zh` |
| cover | `baoyu-cover-image` |
| SLOT00 | `baoyu-infographic` |
| generated body visual | `baoyu-infographic` |
| image hosting / Step 5A | `github-image-hosting` |
| WeChat layout / Step 5B | `gzh-design` |
| WeChat publish | `baoyu-post-to-wechat` |

Specialist Skills own their professional workflows and configuration. Main must not replace a
mandatory Skill with a generic imitation, but Skill invocation still leaves Main as the workflow owner.

## References

Read only the references needed for the current work:

| Work | Reference |
|---|---|
| background research delegation | `research-delegation.md` |
| understanding and originality | `material-understanding.md`, `originality-policy.md` |
| draft/build invariants | `content-invariants.md`, `publishing.md` |
| visual planning and review | `image-policy.md` |
| WeChat layout and repair | `adapter-gzh-design.md` |
| Gate recovery | `troubleshooting.md` |
| strategy | the selected `strategy-*.md` |

The deterministic scripts preserve state v2, provenance, source uniqueness, understanding and
content Gates, Step 3 hash, visual coverage, Step 4, Step 5 parity/integrity, and publish freshness.

# Background research delegation

Research delegation is the only normal Agent boundary in this workflow. Use it only when external
retrieval, cross-source verification, or large web/PDF/media material would materially expand Main's
context. Do not delegate merely because the workflow reached a new Step, a specialist Skill is needed,
a Gate failed, or an artifact already exists.

Primary sources supplied by the user or selected as the article's writing object are read and understood
directly by Main. A research child supplements that understanding; it does not summarize the primary
source in place of Main and does not make the article's final judgement.

## Research capsule

Keep the request small and runtime-neutral:

```text
Goal:
补充本文写作所需背景事实，不负责最终文章判断。

Primary topic:
<主题>

Research questions:
- <问题 1>
- <问题 2>
- <问题 3>

Requirements:
- 优先官方/一手来源
- 保留 URL
- 区分事实、推断、社区观点
- 不写文章
- 不决定最终 thesis
- 不生成 draft

Output:
compact evidence summary
```

The child may access web pages, PDFs, GitHub, news, X, blogs, and other external sources. It must
not produce `materials.md`, `understanding-brief.md`, `draft.md`, a visual plan, HTML, or publish
artifacts.

## Evidence output

Return a compact evidence summary, not copied pages or a long report:

```text
FACTS
- <fact> — <URL>

CONTEXT
- <background point> — <URL>

CONFLICTS / UNCERTAINTY
- <issue>

USEFUL SIGNALS
- <optional community / secondary observation>

SOURCES
- <URL>
```

Evidence must preserve URLs and distinguish verified facts, inference, and community signals. Do not
return credentials, tool logs, full page text, or a proposed article. Main merges the result with its
own primary-source model, writes or updates `materials.md`, and runs the Step 1 Gate.

If the Gate later shows that a specific external fact is missing or conflicting, Main may ask the
same research child for a targeted supplement. Research remains transient runtime information and
does not add fields to `.pipeline-state.json` or create receipts, registries, or token telemetry.

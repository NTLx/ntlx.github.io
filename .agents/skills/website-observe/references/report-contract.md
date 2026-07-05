# Website Observation Report Contract

The report is a Markdown file designed for repeated in-place updates. Default path: `<git-root>/website-observe.md`.

## Update Rules

1. Read existing and user-specified historical reports before collecting new data.
2. Parse these sections when present:
   - `Observation Metadata`
   - `Data Source Status`
   - `Executive Summary`
   - `Key Metrics`
   - `Change Since Previous Report`
   - `Tracking Gaps`
3. Compare only metrics with the same source and date window.
4. If a previous metric is not re-collected, move it to "Previous Claims Not Revalidated" instead of silently repeating it as current truth.
5. Replace the generated body in place. Do not append a second complete report.
6. Preserve content inside this block exactly:

```markdown
<!-- website-observe:manual-notes:start -->
<!-- website-observe:manual-notes:end -->
```

If the block is missing, create it near the end.

## Evidence Labels

Use one or more labels on each factual claim:

| Label | Meaning |
|---|---|
| `[GA4]` | Google Analytics or GA4 BigQuery export |
| `[GSC]` | Google Search Console |
| `[GitHub]` | GitHub API, `gh`, or repository metadata |
| `[Search]` | Public web/platform search |
| `[Site]` | Homepage, sitemap, RSS, robots, page metadata |
| `[Env]` | Local runtime environment, available commands, env vars, and authenticated tools |
| `[User]` | User-provided context |
| `[Prior]` | Previous report, not revalidated in current run |
| `[Inference]` | Reasoned conclusion from labeled evidence |

Every recommendation and conclusion must point to its evidence labels.

## Required Report Structure

```markdown
# Website Observation Report: <site name or origin>

## Observation Metadata

| Field | Value |
|---|---|
| Site | <canonical URL> |
| Report path | <absolute or repo-relative path> |
| Generated at | <ISO timestamp with timezone> |
| Observation window | <date range(s)> |
| Report language | <language code and name> |
| Update mode | New report / Refreshed existing report |
| Historical reports used | <paths or "None"> |

## Data Source Status

| Source | Status | Window | Notes |
|---|---|---|---|
| Site crawl | Available / Partial / Unavailable | <range or snapshot> | <short note> |
| GA4 | Available / Missing credentials / Permission denied / Not configured | <range> | <short note> |
| Search Console | Available / Missing credentials / Permission denied / Not configured | <range> | <short note> |
| GitHub | Available / Not applicable / Permission denied | <range> | <short note> |
| Public mentions | Available / Partial / Unavailable | <snapshot> | <short note> |

## Executive Summary

- <1-5 bullets, each with evidence labels>

## Key Metrics

| Metric | Current | Previous comparable | Change | Source |
|---|---:|---:|---:|---|
| <metric> | <value> | <value or n/a> | <delta or n/a> | <label> |

## How The Site Is Accessed

Cover channels, referrers, geography, devices, entry pages, and search visibility. Do not call search mentions visits.

## What People Pay Attention To

Cover top pages, high-engagement pages, repository attention, RSS/follow signals, search demand, and repeat visibility.

## How The Site Is Used

Cover scroll, engagement time, outbound clicks, internal navigation, site search, code/link copying, downloads, and other events. If missing, say exactly which tracking gap blocks the answer.

## External Mentions And Backlinks

| Source | URL | Target | Context | Relevance | First seen |
|---|---|---|---|---|---|

## Change Since Previous Report

Only include comparable changes. If no comparable history exists, write that explicitly.

## Tracking Gaps

| Gap | Impact | Suggested fix | Priority |
|---|---|---|---|

## Recommendations

| Recommendation | Why | Evidence | Effort |
|---|---|---|---|

## Previous Claims Not Revalidated

List prior observations that were not re-collected in this run.

## Raw Evidence Index

List important commands, APIs, URLs, downloaded files, and search queries used. Do not include secrets.

<!-- website-observe:manual-notes:start -->
<!-- website-observe:manual-notes:end -->
```

## Quality Bar

- No placeholder text.
- No unlabeled claims.
- No secret values.
- No duplicated full reports after an update.
- Numeric trends state source, window, previous value, current value, and delta.
- Missing data is explicit and actionable.

## Language Rules

Resolve report language in this order:

1. Explicit user request, such as "English", "中文", or `--language ja-JP`.
2. Existing report metadata field `Report language`.
3. Chinese (`zh-CN`).

Write headings, explanations, recommendations, and gap descriptions in the resolved language. Keep these stable across languages:

- Evidence labels such as `[GA4]`, `[GSC]`, `[GitHub]`, `[Search]`, `[Site]`, `[Env]`, `[User]`, `[Prior]`, `[Inference]`.
- URLs, commands, API field names, environment variable names, metric IDs, and raw source titles.
- Original page/article titles unless the user asks for translation.

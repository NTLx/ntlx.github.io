---
name: website-observe
description: Use when generating, refreshing, or automating a Markdown observation report for a website, including traffic, audience, referrals, search visibility, backlinks, RSS/follower signals, GitHub repository attention, GA4/GSC/GitHub API data, project-root or home-directory .env configuration loading, Google Cloud project and service account setup for GA4/GSC access, public web mentions, tracking gaps, report language selection, or cron-friendly incremental updates from an existing report.
version: 0.5.0
author: NTLx
license: MIT
---

# Website Observe

## Overview

Create or update a Markdown observation report for any website. Separate first-party telemetry, platform analytics, public traces, and inference so the report stays useful when some credentials are missing.

## Required Inputs

| Input | Default | Notes |
|---|---|---|
| Website URL | Required | Normalize to canonical origin before collecting data. |
| Report path | `<git-root>/website-observe.md` | Use `git rev-parse --show-toplevel`; if not in git, use current directory. |
| Historical report | Existing report path, if present | Also accept any user-specified old report(s). |
| Observation window | Last 28 days plus latest available snapshots | Respect user-specified windows first. |
| Report language | Chinese (`zh-CN`) | Explicit user choice wins; otherwise preserve an existing report's language; otherwise write Chinese. |

Never require credentials to produce a report. Missing private data becomes a documented blind spot, not a blocker.

## Load References

Read these files before collecting or writing:

| Need | File |
|---|---|
| Set up Google Cloud project, service account, JSON key, and GA4/GSC permissions | `references/google-cloud-setup.md` |
| Choose sources, credentials, and collection queries | `references/data-sources.md` |
| Create/update the report and compare history | `references/report-contract.md` |

## Workflow

1. Resolve the report target.
   - Normalize the website URL.
   - Resolve the git root.
   - Use the default report path unless the user supplies one.
   - Read existing and user-specified historical reports before collecting new data.
   - Resolve the report language.

2. Discover the public site shape.
   - Fetch homepage, canonical URL, robots.txt, sitemap.xml, RSS/Atom feeds, and key navigation pages.
   - Identify article/page URLs, titles, dates, content categories, and visible follow links when available.
   - Record fetch failures with status codes instead of guessing.

3. Collect available observation data.
   - Before checking private credentials, load configuration from `<git-root>/.env`; if absent, load `$HOME/.env`; if both are absent, record the missing `.env` file with `[Env]`.
   - Use first-party sources first: GA4, Search Console, BigQuery export, hosting logs, or known analytics exports.
   - For Google Cloud APIs, prefer in-memory service account credentials from `GCP_SA_CREDENTIALS`; do not create JSON key files from environment values.
   - Use platform sources next: GitHub repository stats/traffic, package registries, social/profile links, feed services.
   - Use public search for backlinks, mentions, citations, copied URLs, and community discussion.
   - Treat public search as incomplete evidence, not traffic truth.

4. Normalize and label evidence.
   - Attach one of these labels to every claim: `[GA4]`, `[GSC]`, `[GitHub]`, `[Search]`, `[Site]`, `[Env]`, `[Prior]`, `[User]`, `[Inference]`.
   - Keep raw numbers tied to their collection time and date range.
   - Only compare periods when their definitions match.

5. Update the report idempotently.
   - If the report is missing, create it from the template in `references/report-contract.md`.
   - If the report exists, replace the generated report body instead of appending a second report.
   - Preserve user-maintained notes inside the manual notes block defined in the report contract.
   - Add a "Change Since Previous Report" section only when comparable prior data exists.

6. Verify before finishing.
   - The report has no TODO placeholders.
   - Every conclusion names its evidence source.
   - Missing credentials and blind spots are explicit.
   - The report path and observation timestamp are visible near the top.
   - The report language is visible in metadata.
   - Cron reruns would update the same file without duplicating sections.

## Cron Prompt Shape

Use a stable prompt so scheduled runs stay deterministic:

```text
Use $website-observe for <site-url>. Update <report-path or website-observe.md>.
Language: Chinese. Use any existing report as history. Do not ask for missing
credentials during the cron run; record unavailable sources and continue.
```

## Common Mistakes

- Do not call search results "traffic"; they are citation or discovery signals.
- Do not treat GitHub repository traffic as website page traffic.
- Do not report RSS subscribers as precise counts unless a feed service or server log provides counts.
- Do not translate evidence labels, URLs, metric names, API field names, or original page titles unless the user explicitly asks.
- Do not print `.env` contents or include `.env` values in reports.
- Do not print tokens, service account JSON, or access tokens in the report.
- Do not write `GCP_SA_CREDENTIALS` to disk or convert it into a temporary `GOOGLE_APPLICATION_CREDENTIALS` file.
- Do not grant broad Google Cloud project roles such as Owner or Editor just to read GA4 or Search Console data.
- Do not claim a trend from different windows, such as 28-day GA4 data compared with 14-day GitHub traffic.

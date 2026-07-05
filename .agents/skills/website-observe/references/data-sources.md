# Website Observation Data Sources

Use the highest-confidence available sources first. If a source is unavailable, record why and continue with lower-confidence sources.

## Source Priority

| Tier | Source | Answers | Confidence |
|---|---|---|---|
| 1 | GA4, server logs, analytics exports | Visits, pages, referrers, engagement, events | High |
| 1 | Google Search Console | Search queries, impressions, clicks, average position | High |
| 1 | GA4 BigQuery export | Event-level journeys and custom behavior analysis | High |
| 2 | GitHub API | Repository attention, stars, forks, watchers, repo traffic | Medium |
| 2 | Feed service or feed logs | RSS follows or feed requests | Medium |
| 3 | Public search and platform search | Mentions, backlinks, citations, community discussion | Medium to low |
| 3 | Sitemap, RSS, homepage, page metadata | Site inventory and visible follow paths | Medium |

## Credential Discovery

Load dotenv configuration before checking private sources:

1. Resolve the git root with `git rev-parse --show-toplevel`.
2. If `<git-root>/.env` exists, load it and use it as the credential/config source.
3. If the project `.env` is absent and `$HOME/.env` exists, load `$HOME/.env`.
4. If neither file exists, record `Missing .env file` with `[Env]` and continue with public sources.

The project-root `.env` has priority over `$HOME/.env`. Do not merge both files unless the user explicitly asks. Do not print file contents, parsed values, tokens, or service account JSON. Treat `.env` as a private local runtime file that must remain ignored by git.

Check environment and local tooling without exposing secrets:

| Source | Useful inputs |
|---|---|
| GA4 | `GA4_PROPERTY_ID`, `GCP_SA_CREDENTIALS`, existing `GOOGLE_APPLICATION_CREDENTIALS`, Google ADC |
| Search Console | `GSC_SITE_URL`, `GCP_SA_CREDENTIALS`, existing Google ADC with Search Console read access |
| GitHub | `GH_TOKEN`, `GITHUB_TOKEN`, `gh auth status`, user-provided repository URL |
| BigQuery | `GCP_PROJECT_ID`, dataset name, `GCP_SA_CREDENTIALS`, existing Google ADC |

Never echo token values or service account JSON. If a command fails with auth or permission errors, summarize the missing permission.

## Google Cloud Credential Handling

Prefer service account JSON stored in `GCP_SA_CREDENTIALS` as a one-line environment variable. Parse it in memory and pass the resulting credentials object directly to GA4, Search Console, or BigQuery clients. For cron or other non-interactive runs, ensure the variable is exported into the process environment before invoking the agent; do not rely on interactive-only shell startup behavior.

Use this order for Google Cloud authentication:

1. `GCP_SA_CREDENTIALS`: parse the JSON string with `json.loads` and `service_account.Credentials.from_service_account_info`.
2. Existing `GOOGLE_APPLICATION_CREDENTIALS`: use only if it already points to a real file; do not create a file from `GCP_SA_CREDENTIALS`.
3. Google ADC, such as a preconfigured `gcloud auth application-default` login.

Do not write service account JSON to disk, print it, include it in reports, or pass it through shell commands. If `GCP_SA_CREDENTIALS` is missing or malformed, record the source as unavailable or misconfigured with `[Env]` and continue with lower-confidence sources.

Python pattern:

```python
import json
import os

from google.oauth2 import service_account

creds_json = os.environ.get("GCP_SA_CREDENTIALS")
credentials = None

if creds_json:
    creds_dict = json.loads(creds_json)
    credentials = service_account.Credentials.from_service_account_info(creds_dict)
```

When a Google client supports explicit credentials, pass `credentials=credentials` instead of relying on ambient file discovery.

## Public Site Discovery

Collect these first for any website:

1. Homepage and canonical URL.
2. `robots.txt`.
3. `sitemap.xml` and sitemap indexes.
4. RSS/Atom/JSON feeds.
5. Obvious archive, blog, docs, article, about, subscribe, and repository links.
6. Page titles, descriptions, publish dates, canonical URLs, and categories when visible.

For static sites, absence of server logs is expected. Do not infer exact visitors from public files.

## GA4 Reports

Use GA4 Data API when `GA4_PROPERTY_ID` and credentials are available. Prefer checking metadata compatibility before unusual dimension/metric combinations.

Minimum useful reports:

| Report | Dimensions | Metrics |
|---|---|---|
| `daily_traffic` | `date` | `activeUsers`, `sessions`, `screenPageViews`, `engagedSessions` |
| `top_pages` | `pagePath`, `pageTitle` | `screenPageViews`, `activeUsers`, `averageEngagementTime` |
| `landing_pages` | `landingPagePlusQueryString` | `sessions`, `engagedSessions`, `engagementRate` |
| `sources` | `sessionSource`, `sessionMedium`, `sessionDefaultChannelGroup` | `sessions`, `activeUsers` |
| `referrers` | `pageReferrer` | `sessions`, `activeUsers` |
| `geo_device` | `country`, `deviceCategory`, `browser` | `activeUsers`, `sessions` |
| `events` | `eventName`, `pagePath` | `eventCount`, `activeUsers` |

Useful event names to look for: `scroll`, `click`, `outbound_click`, `rss_click`, `blog_search`, `copy_code`, `copy_link`, `file_download`, `internal_article_click`.

## Search Console

Use Search Console when the site property is verified and readable. Collect:

| Report | Dimensions | Metrics |
|---|---|---|
| `queries` | `query` | `clicks`, `impressions`, `ctr`, `position` |
| `pages` | `page` | `clicks`, `impressions`, `ctr`, `position` |
| `query_page` | `query`, `page` | `clicks`, `impressions`, `ctr`, `position` |
| `country_device` | `country`, `device` | `clicks`, `impressions`, `ctr`, `position` |

Look for high-impression low-CTR queries, pages with search visibility but low visits, and pages with clicks but weak engagement.

## GitHub Signals

Use GitHub only when the site is connected to a repository or the user supplies one. For GitHub Pages, repository data is attention toward the project, not website traffic.

Useful calls through `gh api` or REST:

```bash
gh api repos/<owner>/<repo>
gh api repos/<owner>/<repo>/traffic/views
gh api repos/<owner>/<repo>/traffic/clones
gh api repos/<owner>/<repo>/traffic/popular/referrers
gh api repos/<owner>/<repo>/traffic/popular/paths
gh api repos/<owner>/<repo>/stargazers -H "Accept: application/vnd.github.star+json"
```

GitHub repository traffic is a short rolling window. If unavailable or forbidden, record that the token lacks required repository traffic access.

## Public Mention Search

Use multiple searches because coverage is incomplete:

```text
"<site-origin>" -site:<site-domain>
"<site title>"
"<distinct slogan or author name>"
site:github.com "<site-origin>" -site:github.com/<owner>/<repo>
site:reddit.com "<site-origin>"
site:news.ycombinator.com "<site-origin>"
site:x.com "<site-origin>"
```

For important articles, search exact titles and distinctive slugs. Keep only meaningful mentions with surrounding context. Filter out mirror spam, SEO directories, scraper copies, and the site itself.

## Tracking Gap Checklist

Flag gaps that block stronger answers:

- No GA4 or no readable property ID.
- No Search Console access.
- No UTM tags on social, newsletter, GitHub profile, or messaging links.
- No RSS click or feed service count.
- No site search event.
- No copy-code or copy-link event.
- No outbound click event.
- No article scroll depth beyond generic GA4 enhanced measurement.
- GitHub traffic not archived daily despite rolling-window limits.

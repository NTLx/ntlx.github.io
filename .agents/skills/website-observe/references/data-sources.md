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
| GitHub | `GH_TOKEN`, `GITHUB_TOKEN`, authenticated `gh auth status`, user-provided repository URL |
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

## Observation Depth

Use the requested depth, or infer the smallest depth that answers the user:

| Depth | Use When | Data To Collect |
|---|---|---|
| `quick` | Credentials are missing, the user wants a fast smoke test, or a cron run must be cheap. | Site fetches, credential status, GA4 aggregate if available, GSC availability, GitHub metadata, top public mentions. |
| `standard` | Default for human-readable reports. | Full public site discovery, GA4 baseline and expanded report groups, GSC query/page coverage, GitHub metadata and traffic, public mentions, explicit gaps. |
| `deep` | User asks for maximum detail, diagnosis, historical trends, or custom behavior analysis. | GA4 metadata inventory, compatibility checks, realtime, pivot/cohort/funnel where useful, BigQuery event paths when configured, GitHub statistics/workflow runs, richer backlink research, archived rolling-window comparisons. |

Do not treat `deep` as "query every possible field." Choose dimensions that answer the report questions and record unused high-value dimensions as future opportunities.

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

Use GA4 Data API when `GA4_PROPERTY_ID` and credentials are available.

Before expanded reporting:

1. Run metadata discovery for `properties/<property-id>/metadata`.
2. Record dimension count, metric count, and custom dimensions/metrics without printing property secrets.
3. Check whether high-value fields exist, especially `dateHour`, `landingPagePlusQueryString`, `sessionSourceMedium`, `firstUserSourceMedium`, `pageReferrer`, `linkUrl`, `outbound`, `engagementRate`, `bounceRate`, `screenPageViewsPerSession`, `keyEvents`, and custom definitions.
4. Use compatibility checks or small test queries for unusual combinations before running large reports.
5. Use pagination for high-cardinality reports and record `rowCount` when available.

Standard GA4 report groups:

| Report | Dimensions | Metrics | Answers |
|---|---|---|---|
| `traffic_trend` | `date`; add `dateHour` in deep mode | `activeUsers`, `totalUsers`, `newUsers`, `sessions`, `screenPageViews`, `engagedSessions`, `engagementRate`, `bounceRate`, `userEngagementDuration` | Is traffic rising, falling, or concentrated in spikes? |
| `acquisition_channels` | `sessionDefaultChannelGroup`, `sessionSourceMedium`; add campaign dimensions when available | `sessions`, `activeUsers`, `newUsers`, `engagedSessions`, `engagementRate`, `keyEvents` | Which channels bring visits and engaged visits? |
| `user_acquisition` | `firstUserDefaultChannelGroup`, `firstUserSourceMedium` | `newUsers`, `activeUsers`, `engagedSessions` | Where do first-time users come from? |
| `landing_pages` | `landingPagePlusQueryString`; optionally pair with `sessionSourceMedium` | `sessions`, `activeUsers`, `engagedSessions`, `engagementRate`, `bounceRate`, `keyEvents` | Which entry pages attract and retain visitors? |
| `content_pages` | `pagePath`, `pageTitle`; add content group or article taxonomy when configured | `screenPageViews`, `activeUsers`, `userEngagementDuration`, `screenPageViewsPerSession`, `eventCount`, `keyEvents` | What content receives attention and sustained reading? |
| `referrers` | `pageReferrer`; optionally pair with `pagePath` | `sessions`, `activeUsers`, `engagedSessions` | Which external pages actually send users? |
| `events_by_page` | `eventName`, `pagePath` | `eventCount`, `activeUsers`, `keyEvents` | Which user actions happen on which pages? |
| `outbound_links` | `eventName`, `linkUrl`, `outbound`, `pagePath` | `eventCount`, `activeUsers` | Which external links or CTA clicks work? |
| `audience_geo` | `country`, `region`, `city`, `language` | `activeUsers`, `sessions`, `engagedSessions` | Where are users located and which regions engage? |
| `audience_tech` | `deviceCategory`, `browser`, `operatingSystem` | `activeUsers`, `sessions`, `engagementRate`, `screenPageViews` | Which devices and browsers need design attention? |
| `realtime_snapshot` | Compatible realtime dimensions such as country, device, source, page | Realtime active-user metrics | What is happening right now? Use as a snapshot, not a trend. |

Deep-mode GA4 options:

- Run pivot reports when a matrix view matters, such as channel by landing page or device by content category.
- Run cohort or retention reports when the site has repeat users and enough volume.
- Run funnel reports only for defined paths such as landing page -> article read -> outbound click -> subscribe.
- Query GA4 BigQuery export for event-level paths, scroll depth, code-copy journeys, and session reconstruction when `GCP_PROJECT_ID` and dataset access are configured.

Useful event names to look for: `scroll`, `click`, `outbound_click`, `rss_click`, `blog_search`, `copy_code`, `copy_link`, `file_download`, `internal_article_click`, `share_click`, `theme_toggle`, `feedback_submit`, and any custom key events exposed by metadata.

## Search Console

Use Search Console when the site property is verified and readable. Collect:

| Report | Dimensions | Metrics |
|---|---|---|
| `queries` | `query` | `clicks`, `impressions`, `ctr`, `position` |
| `pages` | `page` | `clicks`, `impressions`, `ctr`, `position` |
| `query_page` | `query`, `page` | `clicks`, `impressions`, `ctr`, `position` |
| `date_trend` | `date` | `clicks`, `impressions`, `ctr`, `position` |
| `country_device` | `country`, `device` | `clicks`, `impressions`, `ctr`, `position` |
| `search_appearance` | `searchAppearance` | `clicks`, `impressions`, `ctr`, `position` |

Look for high-impression low-CTR queries, pages with search visibility but low GA4 visits, pages with clicks but weak engagement, country/device mismatches, and pages that need indexing or title/description work.

## GitHub Signals

Use GitHub only when the site is connected to a repository or the user supplies one. For GitHub Pages, repository data is attention toward the project, not website page traffic.

Authentication order:

1. Use `GH_TOKEN` or `GITHUB_TOKEN` when present.
2. If token env vars are absent, run `gh auth status`. When authenticated, use `gh api` directly.
3. If both are unavailable, collect public repository metadata through unauthenticated REST and record traffic/statistics as unavailable.

Never print `gh auth token` output. Prefer `gh api` over manually extracting a token.

Standard GitHub calls:

```bash
gh api repos/<owner>/<repo>
gh api repos/<owner>/<repo>/traffic/views
gh api repos/<owner>/<repo>/traffic/clones
gh api repos/<owner>/<repo>/traffic/popular/referrers
gh api repos/<owner>/<repo>/traffic/popular/paths
gh api repos/<owner>/<repo>/stargazers -H "Accept: application/vnd.github.star+json" --paginate
```

Extended GitHub calls:

```bash
gh api repos/<owner>/<repo>/stats/commit_activity
gh api repos/<owner>/<repo>/stats/code_frequency
gh api repos/<owner>/<repo>/stats/participation
gh api repos/<owner>/<repo>/stats/contributors
gh api repos/<owner>/<repo>/actions/runs --paginate
gh api repos/<owner>/<repo>/deployments --paginate
gh api repos/<owner>/<repo>/issues --paginate -f state=all
```

Useful repository fields: `stargazers_count`, `forks_count`, `subscribers_count`, `watchers_count`, `open_issues_count`, `network_count`, `pushed_at`, `default_branch`, `visibility`, and latest release or deployment status when present.

Important GitHub caveats:

- GitHub traffic endpoints expose a short rolling window, typically 14 days. Archive the values in each report or a user-approved history file if trends matter.
- Repository statistics endpoints can return `202 Accepted` while GitHub computes cached statistics. Retry later and record the incomplete status instead of treating it as zero.
- `watchers_count` in repository metadata is not the same as true subscribers in modern GitHub semantics. Prefer `subscribers_count` when discussing watchers/subscribers.
- Treat clones, repo views, issues, stars, forks, and workflow runs as repository attention or maintenance signals, not website traffic.

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

## Official API References

- GA4 Data API schema: <https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema>
- GA4 Data API basic reporting: <https://developers.google.com/analytics/devguides/reporting/data/v1/basics>
- GA4 Data API REST methods: <https://developers.google.com/analytics/devguides/reporting/data/v1/rest>
- GA4 Data API advanced use cases: <https://developers.google.com/analytics/devguides/reporting/data/v1/advanced>
- Search Console Search Analytics: <https://developers.google.com/webmaster-tools/v1/searchanalytics/query>
- GitHub repository traffic API: <https://docs.github.com/en/rest/metrics/traffic>
- GitHub repository statistics API: <https://docs.github.com/en/rest/metrics/statistics>
- GitHub stargazers API: <https://docs.github.com/en/rest/activity/starring>
- GitHub Actions workflow runs API: <https://docs.github.com/en/rest/actions/workflow-runs>
- GitHub CLI `gh api`: <https://cli.github.com/manual/gh_api>

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

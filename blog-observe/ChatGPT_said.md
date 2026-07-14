## 结论

这个任务不要只交给“会联网的 Agent”去搜索网页。更可靠的方案是：

**联网 Agent 负责调度与解释；真实数据来自 GA4、Search Console、GitHub API、公开搜索、RSS/站内埋点。**

你的博客是 GitHub Pages + Astro Starlight 站点，已有 RSS 入口、全文搜索、SEO/sitemap、GitHub 仓库与公众号同步管线，这些都可以纳入分析。公开侧能看到站点首页有 GitHub 与 RSS 入口，仓库 README 也说明支持全文搜索、RSS、SEO/sitemap、GitHub Actions 自动部署，以及公众号文章管线。([NTLx's Blog][1])

---

## 一、要回答的三个问题

### 1. “怎样被访问”

核心看：

| 问题                | 数据源                                      |
| ----------------- | ---------------------------------------- |
| 哪些文章被看最多          | GA4 Data API / GA4 BigQuery              |
| 访问来自哪里            | GA4 source / medium / referrer / channel |
| Google 搜索带来了哪些关键词 | Search Console                           |
| 哪些地区、设备、浏览器在访问    | GA4                                      |
| 哪些页面是入口页          | GA4 landing page                         |
| 哪些外部网站提到了你的博客     | 搜索引擎 + GitHub referrer + GSC             |

GA4 Data API 可以用 `runReport` / `batchRunReports` 程序化获取页面浏览、活跃用户、国家、来源等报表数据，也适合自动化日报/周报。([Google for Developers][2])

### 2. “怎样被关注”

这里要拆清楚：

| 关注方式                       | 当前是否容易观测 | 说明                                      |
| -------------------------- | -------: | --------------------------------------- |
| GitHub star / watch / fork |       容易 | GitHub API 或页面可查                        |
| GitHub profile follow      |       容易 | GitHub 用户 API / 页面可查                    |
| 点击 RSS 入口                  |      可观测 | 需要 GA4 事件或增强测量                          |
| 实际 RSS 订阅人数                | 默认不可精确观测 | GitHub Pages 静态托管没有你自己的 feed server log |
| 被搜索引擎收录/展示                 |      可观测 | Search Console                          |
| 公众号读者反向访问博客                |      可观测 | 用 UTM 参数追踪                              |

GitHub 的仓库 Traffic 只能看仓库侧的 views、clones、referring sites、popular content，并且主要是最近 14 天窗口；这不能直接等同于博客页面访问，但可以衡量“有人从开发者视角关注这个博客仓库”。([GitHub Docs][3])

### 3. “怎样被使用”

重点不是 pageview，而是行为：

| 使用行为                     | 建议事件名                                      |
| ------------------------ | ------------------------------------------ |
| 读到 25% / 50% / 75% / 90% | `article_scroll_depth`                     |
| 点击 RSS                   | `rss_click`                                |
| 点击 GitHub                | `github_click`                             |
| 点击原文/外链                  | GA4 enhanced `click` 或自定义 `outbound_click` |
| 使用站内搜索                   | `blog_search`                              |
| 复制链接                     | `copy_link`                                |
| 复制代码块                    | `copy_code`                                |
| 切换深色/浅色主题                | `theme_change`                             |
| 从文章跳到相关文章                | `internal_article_click`                   |

GA4 增强测量可以自动采集 scroll、outbound click、site search、file download 等部分事件，但像 Starlight 搜索框、复制代码、RSS 订阅点击这类博客特定行为，最好补自定义事件。([Google 帮助][4])

---

## 二、推荐整体架构

```text
联网 AI Agent
   │
   ├── 公开侧探测
   │   ├── 搜索 ntlx.github.io / 文章标题 / slug
   │   ├── 查社交平台、论坛、聚合站、GitHub 引用
   │   └── 抓取 sitemap / rss / robots / 页面结构
   │
   ├── 一方数据 API
   │   ├── GA4 Data API：访问、来源、页面、事件
   │   ├── Search Console API：关键词、曝光、点击、排名
   │   ├── GitHub API：star、watch、fork、repo traffic
   │   └── BigQuery：原始事件级分析，如已启用 GA4 BigQuery Export
   │
   ├── 数据仓库
   │   ├── CSV / SQLite / DuckDB 起步
   │   └── BigQuery 长期化
   │
   └── 输出
       ├── Markdown 分析报告
       ├── CSV 明细
       ├── 可视化 Dashboard
       └── 追踪改造建议
```

不建议让 Agent 只做“网页搜索总结”。网页搜索只能回答“哪些地方公开提到了你”，不能回答真实访问路径、停留、跳出、回访、RSS 点击等问题。

---

## 三、Google Cloud / GA4 接入方案

### 最小可行权限

建议创建一个专门给 Agent 使用的只读身份：

1. Google Cloud 项目中启用 **Google Analytics Data API**。
2. 使用 `gcloud` 创建 ADC 或服务账号。
3. 在 GA4 property 中给该身份只读访问权限。
4. Agent 本地运行，不把 Google 账号密码交给远程 Agent。

Google 官方 quickstart 明确支持用 user account 或 service account 调用 Analytics Data API，并给出了用 `gcloud auth application-default login` 获取 ADC 的方式。([Google for Developers][5])

可执行命令示例：

```bash
gcloud auth application-default login \
  --scopes="https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/analytics.readonly"

export PROPERTY_ID="你的GA4_PROPERTY_ID"
export PROJECT_ID="你的GCP_PROJECT_ID"
```

如果 Agent 通过 Python / Node client library 访问，ADC 会被 Google API client 自动识别；`gcloud auth application-default print-access-token` 也可以生成 access token 供 REST 请求使用。([Google Cloud Documentation][6])

---

## 四、Agent 应执行的数据采集任务

### A. GA4 报表采集

让 Agent 每次生成这些表：

| 表名                     | 维度                                                       | 指标                                                      |
| ---------------------- | -------------------------------------------------------- | ------------------------------------------------------- |
| `ga4_daily_traffic`    | date                                                     | activeUsers, sessions, screenPageViews, engagedSessions |
| `ga4_page_performance` | pagePath, pageTitle                                      | views, users, avgEngagementTime                         |
| `ga4_landing_pages`    | landingPagePlusQueryString                               | sessions, engagedSessions, engagementRate               |
| `ga4_sources`          | sessionSource, sessionMedium, sessionDefaultChannelGroup | sessions, users                                         |
| `ga4_referrers`        | pageReferrer                                             | sessions, users                                         |
| `ga4_geo_device`       | country, city, deviceCategory, browser                   | users, sessions                                         |
| `ga4_events`           | eventName, pagePath                                      | eventCount, users                                       |
| `ga4_outbound_clicks`  | linkUrl, pagePath                                        | eventCount                                              |

GA4 Data API 的 schema 文档列出了可用的 dimensions 和 metrics，Agent 应先调用 metadata/check compatibility，避免维度和指标组合不兼容。([Google for Developers][7])

### B. Search Console 采集

让 Agent 采集：

| 表名                   | 维度              | 指标                                 |
| -------------------- | --------------- | ---------------------------------- |
| `gsc_queries`        | query           | clicks, impressions, ctr, position |
| `gsc_pages`          | page            | clicks, impressions, ctr, position |
| `gsc_query_page`     | query, page     | clicks, impressions, ctr, position |
| `gsc_country_device` | country, device | clicks, impressions, ctr, position |

Search Console 能回答“哪些查询带来曝光、点击、排名”，这和 GA4 的访问后行为互补。([谷歌][8])

### C. GitHub 侧采集

你的博客仓库公开可见，目前页面显示 1 star、1 watching、0 forks，并且 README 说明站点托管在 GitHub Pages 上。([GitHub][9])

让 Agent 拉取：

```bash
gh api repos/NTLx/ntlx.github.io
gh api repos/NTLx/ntlx.github.io/traffic/views
gh api repos/NTLx/ntlx.github.io/traffic/clones
gh api repos/NTLx/ntlx.github.io/traffic/popular/referrers
gh api repos/NTLx/ntlx.github.io/traffic/popular/paths
gh api users/NTLx
gh api users/NTLx/followers
```

GitHub 官方 Traffic API 支持 views、clones、popular paths、popular referrers，但数据窗口有限，适合每天定时归档。([GitHub Docs][10])

### D. 公开网络引用采集

Agent 要用搜索引擎和平台搜索做外部引用扫描：

```text
"ntlx.github.io" -site:ntlx.github.io
"NTLx's Blog"
"不写废话，只写算过账的结论"
site:reddit.com "ntlx.github.io"
site:v2ex.com "ntlx.github.io"
site:github.com "ntlx.github.io" -site:github.com/NTLx
site:x.com "ntlx.github.io"
site:news.ycombinator.com "ntlx.github.io"
```

输出字段：

```text
source_platform
source_url
matched_text
target_url
mentioned_article
first_seen_date
estimated_relevance
note
```

这部分只能作为“线索”，不能当成完整流量数据，因为搜索引擎覆盖不完整，也不能看到私聊、微信群、RSS 阅读器内部传播。

---

## 五、如果启用 GA4 BigQuery Export

如果你想让 Agent 做更深的“使用路径分析”，建议启用 GA4 → BigQuery Export。

GA4 BigQuery Export 会生成 `events_YYYYMMDD` 日表；如果开启 streaming export，还会生成当天的 `events_intraday_YYYYMMDD`，但官方建议稳定分析优先查完整日表。([Google 帮助][11])

BigQuery 层可以回答 GA4 UI 不方便回答的问题：

| 问题               | BigQuery 可做法                     |
| ---------------- | -------------------------------- |
| 用户从哪篇文章进入，之后去了哪篇 | session 内 page_view 序列           |
| 哪些文章被读完但没有外链点击   | scroll + click 事件组合              |
| 哪些来源带来高质量阅读      | source/medium + engagement_time  |
| 哪些文章吸引回访         | user_pseudo_id + article path    |
| RSS 来的用户行为是否更深   | UTM / referrer / landing page 分组 |
| 公众号导流质量          | UTM source=wechat 分组             |

GA4 BigQuery Export schema 是事件级数据结构，Google 也提供了基础查询示例。([Google 帮助][12])

---

## 六、建议补充的站点埋点

你的博客目前最值得补的是“关注”和“使用”事件。

### 1. RSS 点击事件

```js
gtag('event', 'rss_click', {
  link_url: 'https://ntlx.github.io/rss.xml',
  location: window.location.pathname
});
```

### 2. 站内搜索事件

Starlight 的搜索如果不产生 URL query，GA4 enhanced site search 可能抓不到，所以应主动记录：

```js
gtag('event', 'blog_search', {
  search_term: keyword,
  page_path: window.location.pathname
});
```

### 3. 复制代码块

```js
gtag('event', 'copy_code', {
  page_path: window.location.pathname,
  language: codeLanguage
});
```

### 4. 复制文章链接

```js
gtag('event', 'copy_link', {
  page_path: window.location.pathname
});
```

### 5. 公众号 / X / GitHub 分享链接统一加 UTM

示例：

```text
https://ntlx.github.io/articles/xxx/?utm_source=wechat&utm_medium=social&utm_campaign=article_push
https://ntlx.github.io/articles/xxx/?utm_source=x&utm_medium=social&utm_campaign=manual_share
https://ntlx.github.io/articles/xxx/?utm_source=github&utm_medium=profile&utm_campaign=bio_link
```

这一步非常关键。否则你后面只能看到 “direct / none”，无法判断是不是公众号、X、微信群、GitHub Profile 带来的访问。

---

## 七、交给 Agent 的任务书

可以直接把下面这段交给联网 Agent。

```text
你是我的博客增长与可观测性分析 Agent。目标是分析 https://ntlx.github.io/ 被怎样访问、怎样关注、怎样使用，并输出可复核的数据和结论。

站点背景：
- 博客地址：https://ntlx.github.io/
- GitHub 仓库：https://github.com/NTLx/ntlx.github.io
- 技术栈：GitHub Pages + Astro Starlight
- 已配置 Google Analytics
- 有 RSS：https://ntlx.github.io/rss.xml
- 需要尽量使用一方数据，不要只做搜索引擎总结。

你需要完成以下任务：

1. 公开侧扫描
   - 抓取首页、archive、rss、sitemap、robots。
   - 识别所有文章 URL、标题、发布时间、分类。
   - 用搜索引擎查找 ntlx.github.io、文章标题、站点 slogan、重要 slug 的外部引用。
   - 输出 public_mentions.csv。

2. GA4 数据分析
   - 使用 Google Analytics Data API。
   - 采集最近 7 天、28 天、90 天、全部可用周期的数据。
   - 至少输出：
     - daily traffic
     - top pages
     - landing pages
     - traffic source / medium
     - referrer
     - country / device / browser
     - events
     - outbound clicks
   - 输出 CSV 和 Markdown 解释。

3. Search Console 分析
   - 采集 query、page、query+page、country、device 维度。
   - 找出：
     - 高曝光低点击关键词
     - 高点击关键词
     - 有排名但还没形成访问的文章
     - 被 Google 发现但 GA4 访问较低的页面
   - 输出 gsc_analysis.md。

4. GitHub 侧分析
   - 使用 GitHub API 或 gh CLI。
   - 采集 repo stars、watchers、forks、traffic views、clones、popular paths、popular referrers。
   - 注意 GitHub Traffic 只代表仓库访问，不代表博客网页访问。
   - 输出 github_attention.md。

5. 使用行为分析
   - 根据 GA4 现有事件判断：
     - 哪些文章只是被打开
     - 哪些文章有较长阅读
     - 哪些文章产生外链点击
     - 哪些文章带来后续站内跳转
   - 如果现有埋点不足，列出 tracking_gap.md。

6. 结论报告
   - 输出 report.md。
   - 必须分成：
     - 访问来源
     - 热门内容
     - 搜索表现
     - 关注方式
     - 使用方式
     - 不可观测盲区
     - 建议补充埋点
     - 下周/下月可重复执行的自动化流程
   - 每个结论必须标注数据来源。
   - 不要把搜索结果当作真实访问数据。
```

---

## 八、最终交付物格式

建议让 Agent 交付一个目录：

```text
blog-observability/
├── report.md
├── tracking-gap.md
├── public-mentions.csv
├── ga4/
│   ├── daily_traffic.csv
│   ├── top_pages.csv
│   ├── landing_pages.csv
│   ├── sources.csv
│   ├── referrers.csv
│   ├── events.csv
│   └── outbound_clicks.csv
├── gsc/
│   ├── queries.csv
│   ├── pages.csv
│   ├── query_page.csv
│   └── gsc_analysis.md
├── github/
│   ├── repo.json
│   ├── traffic_views.json
│   ├── traffic_clones.json
│   ├── popular_referrers.json
│   └── github_attention.md
└── dashboard/
    └── dashboard.html
```

---

## 九、优先级建议

### 第一阶段：一天内完成

1. GA4 Data API 拉取最近 90 天数据。
2. Search Console 拉取查询词和页面表现。
3. GitHub Traffic API 每日归档。
4. 公开搜索外部引用。
5. 输出首版 `report.md`。

### 第二阶段：一周内补齐

1. 加 RSS 点击事件。
2. 加站内搜索事件。
3. 加复制代码/复制链接事件。
4. 所有公众号、X、GitHub 分享链接统一加 UTM。
5. 开启 GA4 BigQuery Export。

### 第三阶段：长期自动化

1. 每天采集 GA4 / GSC / GitHub。
2. 每周生成 Markdown 周报。
3. 每月分析内容主题：哪些类别有效，哪些只是自嗨。
4. 对新文章自动生成 UTM 分享链接。
5. 建立“文章表现评分”：

```text
score =
  0.30 * normalized_views
+ 0.25 * normalized_engagement_time
+ 0.20 * normalized_search_clicks
+ 0.15 * normalized_outbound_clicks
+ 0.10 * normalized_return_visits
```

---

## 十、核心判断

你真正要建的不是“博客访问统计”，而是一个轻量的 **个人内容可观测系统**：

```text
曝光：Search Console / 外部引用
访问：GA4
关注：RSS 点击 / GitHub star-watch-follow / 公众号导流
使用：阅读深度 / 搜索 / 外链点击 / 复制代码 / 站内跳转
解释：AI Agent
长期数据：BigQuery 或 DuckDB
```

现阶段最值得做的是：**先让 Agent 拉 GA4 + GSC + GitHub + 公开引用，给出首版报告；然后补 RSS、搜索、复制代码、UTM 这几个埋点。**

[1]: https://ntlx.github.io/ "欢迎来到 NTLx's Blog | NTLx's Blog"
[2]: https://developers.google.com/analytics/devguides/reporting/data/v1 "Google Analytics Data API Overview  |  Google for Developers"
[3]: https://docs.github.com/en/repositories/viewing-activity-and-data-for-your-repository/viewing-traffic-to-a-repository "Viewing traffic to a repository - GitHub Docs"
[4]: https://support.google.com/analytics/answer/9216061?hl=en&utm_source=chatgpt.com "Enhanced measurement events - Analytics Help"
[5]: https://developers.google.com/analytics/devguides/reporting/data/v1/quickstart "Google Analytics API quickstart  |  Google for Developers"
[6]: https://docs.cloud.google.com/docs/authentication/provide-credentials-adc?utm_source=chatgpt.com "Set up Application Default Credentials | Authentication"
[7]: https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema?utm_source=chatgpt.com "API Dimensions & Metrics | Google Analytics"
[8]: https://search.google.com/search-console/about?utm_source=chatgpt.com "Google Search Console"
[9]: https://github.com/NTLx/ntlx.github.io "GitHub - NTLx/ntlx.github.io: My Blog · GitHub"
[10]: https://docs.github.com/en/rest/metrics/traffic?utm_source=ld246.com "REST API endpoints for repository traffic - GitHub Docs"
[11]: https://support.google.com/analytics/answer/9358801?hl=en&utm_source=chatgpt.com "BigQuery Export - Analytics Help"
[12]: https://support.google.com/analytics/answer/7029846?hl=en&utm_source=chatgpt.com "BigQuery Export schema - Analytics Help"

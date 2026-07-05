# Website Observation Report Contract

The report is a Markdown file designed for repeated in-place updates. Default path: `<git-root>/website-observe.md`.

## Update Rules

1. Read existing and user-specified historical reports before collecting new data.
2. Parse these sections when present, including legacy English headings from older reports:
   - `观察元数据` / `Observation Metadata`
   - `数据源状态` / `Data Source Status`
   - `执行摘要` / `Executive Summary`
   - `关键指标` / `Key Metrics`
   - `流量与获取` / `用户如何访问站点` / `How Users Reach The Site`
   - `搜索可见性` / `Search Visibility`
   - `内容表现` / `用户关注什么` / `Content Performance`
   - `参与与行为` / `用户如何使用站点` / `Engagement And Behavior`
   - `受众与技术环境` / `Audience And Technology`
   - `GitHub 仓库注意力` / `GitHub Repository Attention`
   - `外部提及与反向链接` / `External Mentions And Backlinks`
   - `与上一份报告相比` / `Change Since Previous Report`
   - `洞察与机会` / `Insights And Opportunities`
   - `追踪缺口` / `Tracking Gaps`
3. Compare only metrics with the same source and date window.
4. If a previous metric is not re-collected, move it to `未重新验证的历史结论` instead of silently repeating it as current truth.
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

Default output language is Chinese (`zh-CN`). Unless the user explicitly requests another language or an existing report declares another language, use the Chinese section headings and table labels below.

```markdown
# 网站观察报告：<site name or origin>

## 观察元数据

| 字段 | 值 |
|---|---|
| 站点 | <canonical URL> |
| 报告路径 | <absolute or repo-relative path> |
| 生成时间 | <ISO timestamp with timezone> |
| 观察窗口 | <date range(s)> |
| 观察深度 | quick / standard / deep |
| 报告语言 | <language code and name> |
| 更新模式 | 新报告 / 刷新已有报告 |
| 使用的历史报告 | <paths or "无"> |

## 数据源状态

| 来源 | 状态 | 窗口 | 备注 |
|---|---|---|---|
| 站点抓取 | 可用 / 部分可用 / 不可用 | <range or snapshot> | <short note> |
| GA4 | 可用 / 缺少凭据 / 权限不足 / 未配置 | <range> | <short note> |
| Search Console | 可用 / 缺少凭据 / 权限不足 / 未配置 | <range> | <short note> |
| GitHub | 可用 / 不适用 / 权限不足 | <range> | <short note> |
| 公开提及 | 可用 / 部分可用 / 不可用 | <snapshot> | <short note> |

## 执行摘要

- <1-5 bullets, each with evidence labels>

## 关键指标

| 指标 | 当前值 | 上期可比值 | 变化 | 来源 |
|---|---:|---:|---:|---|
| <metric> | <value> | <value or n/a> | <delta or n/a> | <label> |

## 流量与获取

说明渠道结构、source/medium、新用户来源、campaign/UTM 可见性、referrer 和入口页。可用时提供 top channels 与 top landing pages 的紧凑表格。不要把公开搜索提及称为访问量。

## 搜索可见性

说明 Search Console 查询词、页面、展现、点击、CTR、平均排名、国家/设备/search appearance 拆分、可索引性信号、sitemap 状态和 SEO 机会。如果 GSC 没有返回行，说明该属性是否可读，以及缺少数据如何阻碍判断。

## 内容表现

覆盖 top pages、高参与页面、内容主题簇、过期或低表现页面、RSS/follow 信号和内容机会。区分页面浏览、参与度和 key events。

## 参与与行为

覆盖 scroll、参与时长、outbound clicks、内部导航、站内搜索、代码/链接复制、下载、key events、漏斗和其他事件。如果缺失，明确说明哪个追踪缺口阻碍回答。

## 受众与技术环境

覆盖地理位置、语言、设备类别、浏览器、操作系统、移动/桌面差异和明显 UX 风险。只使用隐私安全的聚合数据。

## GitHub 仓库注意力

覆盖仓库元数据、traffic views、clones、popular referrers、popular paths、带时间戳的 stars、watchers/subscribers、forks、issues、pull requests、workflow/deploy 信号和仓库活跃度。明确说明这些是仓库信号，不是网站流量。

## 外部提及与反向链接

| 来源 | URL | 指向目标 | 上下文 | 相关性 | 首次发现 |
|---|---|---|---|---|---|

## 与上一份报告相比

只包含同口径可比变化。如果没有可比历史，明确写出原因。

## 洞察与机会

| 机会 | 影响 | 证据 | 置信度 | 建议动作 |
|---|---|---|---|---|

综合跨数据源洞察，例如 GA4 表现强但 GSC 可见性弱的页面、搜索表现强但参与度低的页面、GitHub 兴趣没有转化为站点访问的迹象，或 Direct 流量可能隐藏私域分享。

## 追踪缺口

| 缺口 | 影响 | 建议修复 | 优先级 |
|---|---|---|---|

## 建议

| 建议 | 原因 | 证据 | 影响 | 工作量 | 优先级 |
|---|---|---|---|---|---|

## 未重新验证的历史结论

列出本次未重新采集、不能继续当作当前事实的历史观察。

## 原始证据索引

列出本次使用的重要命令、API、URL、下载文件和搜索查询。不要包含任何密钥。

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
- Section guidance sentences from the template are replaced with actual observations, not copied verbatim into the report.

## Language Rules

Resolve report language in this order:

1. Explicit user request, such as "English", "中文", or `--language ja-JP`.
2. Existing report metadata field `Report language`.
3. Chinese (`zh-CN`).

Write headings, explanations, recommendations, and gap descriptions in the resolved language. Keep these stable across languages:

- Evidence labels such as `[GA4]`, `[GSC]`, `[GitHub]`, `[Search]`, `[Site]`, `[Env]`, `[User]`, `[Prior]`, `[Inference]`.
- URLs, commands, API field names, environment variable names, metric IDs, and raw source titles.
- Original page/article titles unless the user asks for translation.

For default `zh-CN` reports, use Chinese section headings, Chinese table labels, and Chinese prose. Treat English headings such as `Executive Summary` or `Raw Evidence Index` as legacy aliases for parsing old reports, not as the default output template.

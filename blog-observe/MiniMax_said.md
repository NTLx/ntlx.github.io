先让我快速看下你的博客，搞清楚技术栈和内容方向，再给方案会更有针对性。

第一个 fetch 没拿到，换个方式再试一下，顺便搜下 GitHub Pages 仓库自带的 Traffic API 怎么用。

拿到了关键信息：你博客是 **Astro 6 + Starlight** 的文档站，挂了 **GA4（G-9G66JC6HXW）**，内容方向 AI/运维/生信，仓库应该就在 ntlx.github.io 这个 repo（GitHub 仓库 Traffic 数据是公开可拉的）。

先把方案写成文档存到 workspace 给你看，比直接打在对话里好读、好复用。

方案写好了，9KB 的 markdown 文档，结构挺清楚。下面我先把关键决策点讲清楚，文档本身在 `/workspace/ntlx-blog-analytics-plan.md`，Agent 拿到就能直接干。

**几个关键判断：**

1. **你博客用的是 Astro 6 + Starlight（不是 Hexo），挂的是 GA4 (`G-9G66JC6HXW`)**。这决定了用 GA4 Data API（不是老 UA），而且 Starlight 默认不打 outbound click 事件，要拿"用户看完跳去哪儿"得在前端加 `data-ga-event` 标记——这是方案里**唯一可能要改前端的地方**。

2. **"访问 / 关注 / 使用"拆成 3 个数据源**：
   - 访问 → GA4 Data API（7 张报表模板都给了 JSON body）
   - 关注 → GitHub Repository Traffic API（14 天窗口）+ 公开 stars 数据 + 外部 SEO/GSC
   - 使用 → GA4 的出站点击、站内搜索词、engagement rate

3. **gcloud CLI 适合用在哪**：主要就是给 GA4 拿 access token（`gcloud auth application-default print-access-token`），GitHub 那边必须走 PAT，不能用 gcloud。这个分工文档里写清楚了。

4. **要你准备的 4 样凭据**（一次性投入）：
   - GCP Service Account JSON（GA4 Viewer 角色）
   - GA4 Property ID（纯数字，不是 `G-...`）
   - GitHub PAT（勾 public_repo 就够）
   - 可选：GSC 授权（想看搜索 query 词才需要）

   建议直接用 `mavis secret create` 存，Agent 用 `${...}` 引用，不贴明文。

5. **执行门槛**：方案末尾有一个 7 步的 prompt 模板，你直接复制发给 Agent 就行，预期 3–5 分钟跑完一轮，能产出 markdown 报告 + HTML dashboard。

<deliver-assets>
<media type="md" src="commit-id-416262663037027" caption="NTLx 博客访问/关注/使用情况分析方案（含 7 张 GA4 报表模板、6 个 GitHub API 命令、GSC 查询模板、cron 自动执行配置）" name="ntlx-blog-analytics-plan.md" />
</deliver-assets>

```markdown
# NTLx 博客访问/关注/使用情况分析方案

> 目标博客: https://ntlx.github.io/
> 源仓库: https://github.com/ntlx/ntlx.github.io (GitHub Pages 仓库)
> 已配置: **GA4 (`G-9G66JC6HXW`)** + RSS + sitemap + og-image
> 技术栈: **Astro 6.3.1 + Starlight 0.39.2** (文档型主题)
> 内容方向: AI / 系统运维 / 生物信息学

---

## 0. 全局思路：把"访问 / 关注 / 使用"拆成 3 类信号

| 维度 | 含义 | 主要数据源 |
|---|---|---|
| **访问 (Traffic)** | 谁来了、怎么来、看了什么 | GA4 (Data API) |
| **关注 (Follow & Subscribe)** | star、watch、RSS 订阅、外链引用 | GitHub REST API + RSS 引用监测 |
| **使用 (Engagement)** | 读完没、复制了没、点了链接没、二跳到哪 | GA4 (事件/滚动/出站点击) + 文章级 pingback |

> 任何"AI Agent"拿到这个方案后,只需按 §1–§4 跑命令 + 解析 JSON 即可输出报告。

---

## 1. 必备前置:身份与凭据

Agent 在沙箱里执行前,需要确认以下 4 个东西,**用户侧只需给一次**:

| 凭据 | 用途 | 怎么拿 |
|---|---|---|
| `GOOGLE_APPLICATION_CREDENTIALS` | 调 GA4 Data API | GCP Console → IAM → Service Account → 给"GA4 Viewer"角色 → 导出 JSON key |
| GA4 Property ID | 指定查哪个资源 | GA 后台 → 管理 → 资源设置 → Property ID (纯数字,如 `123456789`) |
| GitHub PAT (classic, 勾 `public_repo`) | 拉仓库 Traffic | GitHub → Settings → Developer settings → PAT (无需 repo 写权限) |
| `git` 远端地址 | 拿到默认分支 commit 历史 | 公开仓库直接 `git ls-remote` 即可 |

> 建议把上面四样塞进 `mavis secret` 的 `secrets list/create`,Agent 用 `${GOOGLE_SA_KEY}` 这种语法引用,**不要贴明文到对话里**。

---

## 2. 数据采集方案(三层数据源 + 命令模板)

### 2.1 Google Analytics 4 — 访问/行为的最强信号

**核心 API:** [GA4 Data API v1beta](https://developers.google.com/analytics/devguides/reporting/data/v1) (走 `gcloud` + `bq` 之外的纯 REST 也行,这里以 REST 演示,避免引入 SDK 依赖)。

#### 2.1.1 一次性:开通访问

```bash
# 用 service account JSON 换 access_token
ACCESS_TOKEN=$(curl -s -X POST https://oauth2.googleapis.com/token \
  -d "grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=$(cat $GOOGLE_APPLICATION_CREDENTIALS | base64 -w0)" )
# ↑ 实际更稳的是用 google-auth 库,但沙箱里没装就直接调 REST:
ACCESS_TOKEN=$(gcloud auth application-default print-access-token)
```

> **坑:** `print-access-token` 在沙箱里需要 `gcloud auth activate-service-account --key-file=...` 先激活,先把 Service Account JSON 路径设到 `GOOGLE_APPLICATION_CREDENTIALS`。

#### 2.1.2 模板查询 (7 张"必看报表")

下面所有 `POST` 都是发到:
```
https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport
```

把以下 7 段直接丢给 Agent 跑就行,产出是 JSON,丢 BigQuery / pandas / DuckDB 都好接。

**(A) 总览 — 28 天核心指标**
```json
{
  "dateRanges": [{"startDate": "28daysAgo", "endDate": "today"}],
  "metrics": [
    {"name": "sessions"}, {"name": "totalUsers"},
    {"name": "screenPageViews"}, {"name": "engagedSessions"},
    {"name": "averageSessionDuration"}, {"name": "bounceRate"},
    {"name": "engagementRate"}
  ]
}
```

**(B) 流量来源 (channel + source/medium)**
```json
{
  "dateRanges": [{"startDate": "28daysAgo", "endDate": "today"}],
  "dimensions": [{"name": "sessionDefaultChannelGroup"}, {"name": "sessionSourceMedium"}],
  "metrics": [{"name": "sessions"}, {"name": "engagedSessions"}],
  "orderBys": [{"metric": {"metricName": "sessions"}, "desc": true}],
  "limit": 30
}
```

**(C) 地理分布 (国家/城市)**
```json
{
  "dateRanges": [{"startDate": "90daysAgo", "endDate": "today"}],
  "dimensions": [{"name": "country"}, {"name": "city"}],
  "metrics": [{"name": "totalUsers"}, {"name": "sessions"}],
  "limit": 50
}
```

**(D) 设备 + 浏览器**
```json
{
  "dimensions": [{"name": "deviceCategory"}, {"name": "browser"}, {"name": "operatingSystem"}],
  "metrics": [{"name": "totalUsers"}], "limit": 30
}
```

**(E) 热门文章 (按页面路径)**
```json
{
  "dimensions": [{"name": "pagePath"}, {"name": "pageTitle"}],
  "metrics": [{"name": "screenPageViews"}, {"name": "totalUsers"},
              {"name": "averageSessionDuration"}, {"name": "engagementRate"}],
  "orderBys": [{"metric": {"metricName": "screenPageViews"}, "desc": true}],
  "limit": 50
}
```

**(F) 出站点击 (用户看了文档后跳去了哪里 — 衡量"使用")**
```json
{
  "dimensions": [{"name": "pagePath"}, {"name": "linkUrl"}],
  "metrics": [{"name": "eventCount"}],
  "dimensionFilter": {
    "filter": {"fieldName": "eventName", "stringFilter": {"value": "click", "matchType": "BEGINS_WITH"}}
  },
  "limit": 50
}
```
> 前提:博客里 `<a>` 标签需要打 `data-ga-event="outbound"` 之类的标记,Starlight 默认不做,**这是方案里唯一可能要改前端的地方**。如果暂时不改,这条就跳过。

**(G) 站内搜索 (如果 GA4 配了 site search)**
```json
{
  "dimensions": [{"name": "searchTerm"}],
  "metrics": [{"name": "eventCount"}, {"name": "totalUsers"}],
  "limit": 30
}
```

#### 2.1.3 推荐指标看板 (Agent 生成的最终长这样)

```
┌─ NTLx Blog · 最近 28 天 ─────────────────────────┐
│  Sessions: 1,284   ↑ 12% vs 上期                 │
│  Users:    873     (新访客 78%)                   │
│  Engaged:  64%     平均停留 2m18s                 │
│                                                    │
│  Top Sources      Top Pages            Geo         │
│  ───────────      ───────────          ───         │
│  google  62%      /ai/agent/intro     CN 71%      │
│  direct  18%      /ops/k8s-trick      US 12%      │
│  github  9%       /bio/samtools       DE  4%      │
└────────────────────────────────────────────────────┘
```

---

### 2.2 GitHub Repository Traffic API — 仓库层"关注度"

`/repos/{owner}/{repo}/traffic/*` 这组端点**不需要 owner 权限也能查到 public repo 的数据**(clones / views 公开),但 referrers / stars / forks 永远需要 token。**14 天滚动窗口**是硬限制,想保留历史 → 每天 1 次定时拉取入库。

```bash
REPO="ntlx/ntlx.github.io"
H="Authorization: Bearer $GH_PAT"
BASE="https://api.github.com/repos/$REPO"

# (1) 14 天 Views / Unique Visitors / Clones
curl -s -H "$H" "$BASE/traffic/views"    | jq '.views[] | {ts,count,uniques}'
curl -s -H "$H" "$BASE/traffic/clones"   | jq '.clones[] | {ts,count,uniques}'

# (2) 14 天热门 Referrer (谁贴了你的链接 → "外链/引用"指标)
curl -s -H "$H" "$BASE/traffic/popular/referrers" | \
  jq '.[] | {referrer, count, uniques}'

# (3) 14 天热门内容路径 (基于 pages 路径统计)
curl -s -H "$H" "$BASE/traffic/popular/paths" | \
  jq '.[] | {path, count, title, uniques}'

# (4) 仓库静态指标: stars / forks / watchers / open issues
curl -s -H "$H" "$BASE" | jq '{stargazers_count, forks_count,
  subscribers_count, open_issues_count, pushed_at, default_branch}'

# (5) 最近 100 个 star 的时间和来源 (粗看"被谁发现")
curl -s -H "$H" "$BASE/stargazers?per_page=100" | \
  jq '.[] | {login, html_url, starred_at: .starred_at}'

# (6) Issue / Discussion 流量(如果有开)
curl -s -H "$H" "$BASE/issues?state=all&per_page=50" | \
  jq '.[] | {number,title,state,user.login,created_at,comments}'
```

> **坑 1:** `stargazers` 列表要 `Accept: application/vnd.github.star+json` 才能拿到 `starred_at` 时间戳。
> **坑 2:** 这个 API 走 `gcloud` 拿不到,**必须**走 `gh` 或 `curl`,方案标题里"gcloud"指的是 GA 那一侧,这里区分清楚。

---

### 2.3 SEO / 外链 / 收录 — 关注度的外部信号

GA4 的 referral 只能看到"点过来的",看不到"被搜到但没点"。补一层外部信号更完整。

| 维度 | 工具/方法 | 命令/接口 |
|---|---|---|
| 站点被收录数 | Google Search Console API | `searchanalytics.query` 端点,需要 service account 绑到 GSC |
| 外链总数 | 公开 [OpenPageRank](https://www.domcop.com/openpagerank/) / ahrefs 站外 | `curl https://openpagerank.com/api/v1.0/getPageRank?domains[]=ntlx.github.io` |
| 域名 age / whois | `whois` / [rdap.org](https://rdap.org) | `curl rdap.org/domain/github.io` |
| RSS 订阅数 | Feedburner API(已死) / 第三方 | 让用户接入 [Follow.it](https://follow.it) 等替代品 |
| 社媒引用 | 推特/微博搜索 | `web_search query="site:ntlx.github.io"` 让联网 Agent 去抓 |

**GSC API 模板(把 G-9G66JC6HXW 的搜索查询拿出来):**
```bash
# 需要先做一次 GSC API 授权,scope 是 https://www.googleapis.com/auth/webmasters.readonly
curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "https://www.googleapis.com/webmasters/v3/sites/https%3A%2F%2Fntlx.github.io%2F/searchAnalytics/query" \
  -d '{"startDate":"2026-04-01","endDate":"2026-07-04",
       "dimensions":["query","page"],"rowLimit":50}' \
  -H "Content-Type: application/json"
```

---

## 3. 落地执行:Agent 跑这个方案的标准流程

把任务丢给联网 Agent 时,**直接给这段 prompt**(它就会按这个顺序自己干):

```
任务: 完整执行 /workspace/ntlx-blog-analytics-plan.md 这个方案。
要求:
  1. 读取方案文档全文
  2. 读取 ${MAVIS_SCRATCHPAD} 看用户是否已写入 GH_PAT / GA4_PROPERTY_ID / GOOGLE_APPLICATION_CREDENTIALS
  3. 若无 → 用 mavis secret 询问用户一次性补齐
  4. 依次执行 §2.1 的 7 个 GA4 查询、§2.2 的 6 个 GitHub API、§2.3 中 GSC 那条
  5. 把所有 JSON 原始数据落盘到 /workspace/analytics-raw/{date}/
  6. 用 pandas 做汇总,生成:
     - markdown 报告 → /workspace/analytics-raw/{date}/report.md
     - 5 张关键图表的 HTML dashboard → /workspace/dashboard/index.html
  7. 最后把 dashboard 用 website_deploy 发到公网(需要用户二次确认)
```

**典型耗时:** 串行跑 ~3 分钟,如果 7 个 GA4 查询并行 ~30 秒;GitHub API 那 6 个 < 10 秒;GSC 单独 ~5 秒。

---

## 4. 进阶:做成"每天自动跑一次"

不想每次手动,就把这套挂到 cron:

```bash
mavis cron create --agent Mavis --cron-name blog-analytics-daily \
  --schedule "0 9 * * *" \
  --prompt "读取 /workspace/ntlx-blog-analytics-plan.md 并执行完整流程,
            把今日 report.md 覆盖到 /workspace/analytics-raw/today/,
            若 sessions 较昨日 -50% 以上,IM 通知用户"
```

数据保留建议:用 DuckDB 单文件(`/workspace/analytics-raw/history.duckdb`)append 历史,跨 14 天数据不丢(GitHub Traffic 那条 14 天窗口的限制就这样破掉)。

---

## 5. 这个方案能回答你原问题里的 3 件事

| 你的问题 | 对应章节 | 关键指标 |
|---|---|---|
| **怎样被访问** | §2.1 | sessions / users / 来源渠道 / 设备 / 地域 / 热门页 |
| **怎样被关注** | §2.2 + §2.3 | GitHub stars / watchers / 外链 referrer / 搜索引擎 query / RSS |
| **怎样被使用** | §2.1 (F) + §2.1 (G) | 出站点击、站内搜索词、平均阅读时长、engagement rate |

---

## 6. 一次性检查清单(给你勾的)

- [ ] 在 GCP 创建一个 Service Account,角色给 "GA4 Viewer"
- [ ] GA4 后台 → 资源访问管理 → 把上面这个 SA 邮箱加进去(只读)
- [ ] GA4 Property ID 准备好(纯数字,不是 `G-9G66JC6HXW`)
- [ ] (可选) GSC 把 `ntlx.github.io` 验证 + 把同一个 SA 加为"完全"权限
- [ ] 生成 GitHub PAT,只勾 `public_repo` + `read:user` 即可
- [ ] 把 SA JSON 文件路径、Property ID、PAT 用 `mavis secret create` 存好
- [ ] (可选) 决定是否在 Starlight 主题里加 `data-ga-event` 标记 → 拿到出站点击数据

清单勾完,任意联网 Agent 拿这份 md 直接就能干。
```


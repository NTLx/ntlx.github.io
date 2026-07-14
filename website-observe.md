# 网站观察报告：NTLx's Blog

## 观察元数据

| 字段 | 值 |
|---|---|
| 站点 | https://ntlx.github.io/ |
| 报告路径 | /home/lx/ntlx.github.io/website-observe.md |
| 生成时间 | 2026-07-07T19:07:56+08:00 |
| 观察窗口 | GA4：2026-06-09 至 2026-07-06；Search Console：2026-06-08 至 2026-07-05；GitHub traffic：滚动 14 天；站点与公开搜索：2026-07-07 快照 |
| 观察深度 | standard |
| 报告语言 | zh-CN（中文） |
| 更新模式 | 刷新已有报告 |
| 使用的历史报告 | website-observe.md（2026-07-05 版本，刷新前读取） |

## 数据源状态

| 来源 | 状态 | 窗口 | 备注 |
|---|---|---|---|
| 站点抓取 | 可用 | 2026-07-07 快照 | 首页、robots.txt、RSS、`sitemap-index.xml`、`sitemap-0.xml` 均返回 200；`sitemap.xml` 和 `atom.xml` 返回 404。robots.txt 正确声明 `https://ntlx.github.io/sitemap-index.xml`。[Site] |
| GA4 | 可用 | 2026-06-09 至 2026-07-06 | 项目根目录 `.env` 可读；`GCP_SA_CREDENTIALS`、`GA4_PROPERTY_ID`、`GSC_SITE_URL` 存在；Google 服务账号通过内存 JWT 成功调用 GA4 Data API。[Env][GA4] |
| Search Console | 可用但几乎无数据 | 2026-06-08 至 2026-07-05 | 目标站点在 `sites.list` 中可见；queries、pages、query+page、country/device、searchAppearance 均返回 0 行，date_trend 仅返回 2026-07-04 和 2026-07-05 的 0 展现行。[GSC] |
| GitHub | 可用 | 2026-07-07 快照与滚动 14 天 traffic | `GH_TOKEN`/`GITHUB_TOKEN` 环境变量未设置，但本机 `gh auth status` 已登录，`gh api` 可读取 repo metadata、traffic、Actions、deployments、issues 和 stargazers。[GitHub][Env] |
| 公开提及 | 部分可用 | 2026-07-07 快照 | 搜索主要发现 GitHub profile、仓库页面和 issue 页面；未发现高质量 Reddit、Hacker News、媒体或第三方博客引用。[Search][Inference] |

## 执行摘要

- 最近 28 天 GA4 记录到 1,267 个活跃用户、1,343 次会话、1,373 次页面浏览、141 次参与会话，engagement rate 为 10.50%，bounce rate 为 89.50%。相对 2026-07-05 报告，访问规模基本持平，但总参与时长从 10,135 秒增至 12,587 秒。[GA4][Prior][Inference]
- 访问获取仍高度依赖 Direct：Direct 贡献 993 次会话，占 73.9%，engagement rate 只有 3.73%。Bing 相关来源合计 317 次会话，engagement rate 约 29.0%，仍是质量更高的搜索来源。[GA4][Inference]
- 内容注意力继续集中在 AI 工具配置页：`/ai-tools/claude-code-config/` 与 `/ai-tools/playwright-mcp-setup/` 合计 439 次浏览，占页面浏览总量约 32.0%。[GA4][Inference]
- Search Console 已可读但仍没有有效查询、页面、国家设备或 search appearance 行；搜索诊断仍主要依赖 GA4 的 Bing 来源和公开搜索样本。[GSC][GA4][Search][Inference]
- sitemap 结论需要修正：`/sitemap.xml` 确实返回 404，但站点的有效 sitemap 入口是 robots.txt 声明的 `/sitemap-index.xml`，且线上返回 200；因此问题不是“无 sitemap”，而是常见别名 `/sitemap.xml` 不可用。[Site][Prior][Inference]
- GitHub 14 天 repo views 为 42 次、unique 2；clones 为 567 次、unique 188。仓库克隆活动继续远高于仓库页面访问，但这仍是仓库注意力，不是网站访问量。[GitHub][Inference]

## 关键指标

| 指标 | 当前值 | 上期可比值 | 变化 | 来源 |
|---|---:|---:|---:|---|
| 活跃用户 | 1,267 | 1,264 | +3 | [GA4][Prior] |
| 总用户 | 1,277 | 1,273 | +4 | [GA4][Prior] |
| 新用户 | 1,259 | 1,255 | +4 | [GA4][Prior] |
| 会话 | 1,343 | 1,339 | +4 | [GA4][Prior] |
| 页面浏览 | 1,373 | 1,372 | +1 | [GA4][Prior] |
| 参与会话 | 141 | 141 | 0 | [GA4][Prior] |
| engagement rate | 10.50% | 10.53% | -0.03 pct | [GA4][Prior] |
| bounce rate | 89.50% | 89.47% | +0.03 pct | [GA4][Prior] |
| 总参与时长 | 12,587 秒 | 10,135 秒 | +2,452 秒 | [GA4][Prior] |
| key events | 0 | 0 | 0 | [GA4][Prior] |
| Direct 会话 | 993 | 971 | +22 | [GA4][Prior] |
| Bing 相关会话 | 317 | 331 | -14 | [GA4][Prior][Inference] |
| Search Console 查询行数 | 0 | 0 | 0 | [GSC][Prior] |
| GitHub repo views | 42 | 33 | +9 | [GitHub][Prior] |
| GitHub repo clones | 567 | 520 | +47 | [GitHub][Prior] |
| sitemap index 状态 | 200 | 未记录 | 新增校正 | [Site][Prior] |
| `/sitemap.xml` 状态 | 404 | 404 | 0 | [Site][Prior] |

## 流量与获取

最近 28 天内，第一周（2026-06-09 至 2026-06-15）会话为 376，最后一周（2026-06-30 至 2026-07-06）会话为 349，下降约 7.2%；页面浏览从 375 降到 362，下降约 3.5%。最高会话日仍是 2026-06-11，达到 83 次会话。[GA4][Inference]

| 渠道 | source / medium | 会话 | 活跃用户 | 新用户 | 参与会话 | engagement rate | 来源 |
|---|---|---:|---:|---:|---:|---:|---|
| Direct | `(direct) / (none)` | 993 | 989 | 989 | 37 | 3.73% | [GA4] |
| Organic Search | `cn.bing.com / referral` | 265 | 223 | 223 | 78 | 29.43% | [GA4] |
| Organic Search | `bing / organic` | 52 | 40 | 40 | 14 | 26.92% | [GA4] |
| Referral | `mp.weixin.qq.com / referral` | 20 | 2 | 2 | 7 | 35.00% | [GA4] |
| Unassigned | `(not set)` | 9 | 8 | 0 | 0 | 0.00% | [GA4] |
| Referral | `github.com / referral` | 2 | 1 | 1 | 2 | 100.00% | [GA4] |
| Referral | `weixin110.qq.com / referral` | 2 | 2 | 1 | 0 | 0.00% | [GA4] |
| Referral | `wiki.oebiotech.com / referral` | 2 | 2 | 2 | 2 | 100.00% | [GA4] |
| Organic Search | `tw.search.yahoo.com / referral` | 1 | 1 | 1 | 1 | 100.00% | [GA4] |

Direct 占比继续上升，说明私域分享、书签、未带 UTM 的微信/GitHub/聊天软件来源仍被混在一起。Bing 相关来源会话比上一份报告少 14 次，但参与率从约 27.5% 升到约 29.0%，搜索访问质量仍明显高于 Direct。[GA4][Prior][Inference]

| 入口页 | 会话 | 活跃用户 | 参与会话 | engagement rate | bounce rate | 来源 |
|---|---:|---:|---:|---:|---:|---|
| `/ai-tools/claude-code-config/` | 240 | 233 | 29 | 12.08% | 87.92% | [GA4] |
| `/ai-tools/playwright-mcp-setup/` | 189 | 190 | 9 | 4.76% | 95.24% | [GA4] |
| `/` | 55 | 51 | 3 | 5.45% | 94.55% | [GA4] |
| `/ai-tools/antigravity-proxy-best-practices/` | 49 | 48 | 12 | 24.49% | 75.51% | [GA4] |
| `/network-proxy/privoxy/` | 49 | 42 | 26 | 53.06% | 46.94% | [GA4] |
| `(not set)` | 47 | 30 | 0 | 0.00% | 100.00% | [GA4] |
| `/ai-tools/install-cli-tools/` | 46 | 46 | 12 | 26.09% | 73.91% | [GA4] |
| `/articles/langchain-interrupt-2026-agent-platform/` | 41 | 41 | 9 | 21.95% | 78.05% | [GA4] |
| `/ai-tools/oh-my-opencode/` | 26 | 26 | 3 | 11.54% | 88.46% | [GA4] |
| `/articles/lsp-language-server-setup-guide/` | 23 | 23 | 3 | 13.04% | 86.96% | [GA4] |

`/network-proxy/privoxy/` 仍是高质量入口页，49 次入口会话中有 26 次参与会话。`/ai-tools/playwright-mcp-setup/` 仍是高流量低参与入口，189 次会话只有 9 次参与会话，说明首屏匹配、内容结构或 GA4 参与阈值仍值得检查。[GA4][Inference]

## 搜索可见性

Search Console 当前可读，但几乎没有可分析数据：queries、pages、query+page、country+device、searchAppearance 全部 0 行；date_trend 仅返回 2026-07-04 和 2026-07-05 两天的 0 点击、0 展现行。当前不能判断 Google 查询词、页面 CTR、平均排名或搜索外观表现。[GSC][Inference]

搜索侧的可行动信号仍来自 GA4：`cn.bing.com / referral` 与 `bing / organic` 合计 317 次会话、92 个参与会话，质量显著高于 Direct。等 GSC 积累数据后，应优先把 Bing 表现较好的页面与 GSC 查询词、页面展现、CTR 对齐。[GA4][GSC][Inference]

站点 sitemap 状态比上一份报告描述得更清楚：`https://ntlx.github.io/sitemap.xml` 返回 404，但 `https://ntlx.github.io/sitemap-index.xml` 和 `https://ntlx.github.io/sitemap-0.xml` 返回 200，且 robots.txt 明确声明 sitemap index。Search Console 应提交 `sitemap-index.xml`；是否额外提供 `/sitemap.xml` 只是兼容性和习惯入口问题，不是索引诊断的硬阻塞。[Site][Inference]

## 内容表现

内容表现保持稳定：AI 编码工具、代理/网络配置和 Agent 平台类文章仍构成主要流量。前两篇 AI 工具页面合计 439 次浏览，占 28 天页面浏览总量约 32.0%。[GA4][Inference]

| 页面 | 标题 | 浏览量 | 活跃用户 | 总参与时长 | 事件数 | 来源 |
|---|---|---:|---:|---:|---:|---|
| `/ai-tools/claude-code-config/` | Claude Code 自定义配置 \| NTLx's Blog | 247 | 236 | 2,940 秒 | 906 | [GA4] |
| `/ai-tools/playwright-mcp-setup/` | Playwright MCP 配置指南 \| NTLx's Blog | 192 | 192 | 1,311 秒 | 748 | [GA4] |
| `/network-proxy/privoxy/` | Privoxy 代理服务器配置指南 \| NTLx's Blog | 60 | 43 | 1,087 秒 | 235 | [GA4] |
| `/` | 欢迎来到 NTLx's Blog \| NTLx's Blog | 57 | 52 | 1,428 秒 | 216 | [GA4] |
| `/ai-tools/antigravity-proxy-best-practices/` | Antigravity Tools 最佳实践 \| NTLx's Blog | 51 | 49 | 472 秒 | 188 | [GA4] |
| `/ai-tools/install-cli-tools/` | AI Coding CLI 工具一键安装 \| NTLx's Blog | 50 | 51 | 2,047 秒 | 193 | [GA4] |
| `/articles/langchain-interrupt-2026-agent-platform/` | LangChain 不再做框架了 \| NTLx's Blog | 41 | 41 | 520 秒 | 164 | [GA4] |
| `/ai-tools/oh-my-opencode/` | Oh My OpenCode 插件 \| NTLx's Blog | 28 | 28 | 174 秒 | 107 | [GA4] |
| `/articles/lsp-language-server-setup-guide/` | 给你的 AI 编程工具装上「眼睛」：LSP 语言服务器完全安装指南 \| NTLx's Blog | 24 | 23 | 48 秒 | 89 | [GA4] |
| `/network-proxy/proxychains/` | Proxychains 配置 \| NTLx's Blog | 19 | 16 | 55 秒 | 52 | [GA4] |

按“每活跃用户参与时长”粗看，`/ai-tools/install-cli-tools/` 约 40.1 秒、`/network-proxy/privoxy/` 约 25.3 秒，仍是比纯流量排行更值得挖的深阅读节点。RSS 入口 `/rss.xml` 返回 200，但没有 feed 服务或服务器日志，本次仍不能估计 RSS 订阅者或 feed 请求量。[GA4][Site][Inference]

## 参与与行为

全站行为仍主要来自 GA4 增强衡量默认事件。最近 28 天有 1,373 次 `page_view`、1,338 次 `session_start`、1,259 次 `first_visit`、568 次 `scroll`、365 次 `user_engagement`、11 次 `click`、1 次 `form_start`；所有 key events 仍为 0。[GA4]

| 事件 | 次数 | 活跃用户 | key events | 来源 |
|---|---:|---:|---:|---|
| `page_view` | 1,373 | 1,260 | 0 | [GA4] |
| `session_start` | 1,338 | 1,260 | 0 | [GA4] |
| `first_visit` | 1,259 | 1,259 | 0 | [GA4] |
| `scroll` | 568 | 526 | 0 | [GA4] |
| `user_engagement` | 365 | 276 | 0 | [GA4] |
| `click` | 11 | 8 | 0 | [GA4] |
| `form_start` | 1 | 1 | 0 | [GA4] |

当前只能看到基础滚动和少量出站点击。缺少 `copy_code`、`copy_link`、`blog_search`、`rss_click`、`internal_article_click` 等站点特定事件，因此仍无法判断技术读者是否复制命令、是否搜索站内内容、是否订阅 RSS、是否通过内链继续阅读。[GA4][Inference]

| 页面 | 链接 | 事件 | 点击 | 活跃用户 | 来源 |
|---|---|---|---:|---:|---|
| `/network-proxy/privoxy/` | `https://www.privoxy.org/sf-download-mirror/Win32/` | `click` | 8 | 5 | [GA4] |
| `/about/` | `https://github.com/NTLx` | `click` | 1 | 1 | [GA4] |
| `/articles/langchain-interrupt-2026-agent-platform/` | `https://www.langchain.com/blog/interrupt-2026-overview` | `click` | 1 | 1 | [GA4] |
| `/network-proxy/privoxy/` | `https://www.privoxy.org/user-manual/config.html` | `click` | 1 | 1 | [GA4] |

出站点击仍集中在 Privoxy 文章，说明这篇文章有明确工具型使用意图。新增 `/about/` 到 GitHub 的 1 次点击很小，但它提供了衡量站点到 GitHub 转化的起点。[GA4][Inference]

## 受众与技术环境

地域数据仍显示 Singapore desktop/Chrome/Windows 数量很高，China 多城市有稳定访问。考虑到 Direct 占比高、技术读者可能使用代理或公司网络，地域结果不应直接等同于真实读者所在地。[GA4][Inference]

| 地域 / 语言 | 活跃用户 | 会话 | 参与会话 | 来源 |
|---|---:|---:|---:|---|
| Singapore / Singapore / English | 524 | 522 | 19 | [GA4] |
| China / 未设置 / Chinese | 169 | 179 | 15 | [GA4] |
| China / Shanghai / Chinese | 54 | 58 | 10 | [GA4] |
| China / Beijing / Chinese | 48 | 55 | 12 | [GA4] |
| China / Chengdu / Chinese | 29 | 30 | 2 | [GA4] |
| China / Guangzhou / Chinese | 27 | 30 | 12 | [GA4] |
| China / Shenzhen / Chinese | 24 | 26 | 6 | [GA4] |
| China / Zhangjiajie / Chinese | 19 | 21 | 3 | [GA4] |
| China / Hangzhou / Chinese | 19 | 19 | 6 | [GA4] |
| Japan / Tokyo 未设置 / Chinese | 13 | 16 | 10 | [GA4] |

| 设备 / 浏览器 / 系统 | 活跃用户 | 会话 | engagement rate | 页面浏览 | 来源 |
|---|---:|---:|---:|---:|---|
| desktop / Chrome / Windows | 1,097 | 1,104 | 5.34% | 1,114 | [GA4] |
| desktop / Edge / Windows | 91 | 122 | 45.90% | 144 | [GA4] |
| desktop / Chrome / Macintosh | 36 | 62 | 17.74% | 54 | [GA4] |
| desktop / Chrome / Linux | 13 | 15 | 26.67% | 16 | [GA4] |
| mobile / Chrome / Android | 8 | 8 | 25.00% | 8 | [GA4] |
| mobile / Safari / iOS | 7 | 7 | 28.57% | 2 | [GA4] |

桌面端仍是绝对主力，移动端样本很小。优化优先级仍应放在桌面阅读、代码块复制、站内搜索、内链导航和高流量入口页的意图匹配上。[GA4][Inference]

## GitHub 仓库注意力

`NTLx/ntlx.github.io` 是公开仓库，当前公开元数据为 1 star、0 fork、1 subscriber、0 open issues、默认分支 `main`，GitHub 侧最近 push 时间为 2026-07-07T06:04:44Z。`watchers_count` 与 stars 都为 1，本报告用 `subscribers_count` 表示真实订阅/关注。[GitHub]

| 指标 | 当前值 | 窗口 | 说明 | 来源 |
|---|---:|---|---|---|
| repo views | 42 | 滚动 14 天 | unique 2；主要路径是 commits 与 overview。 | [GitHub] |
| repo clones | 567 | 滚动 14 天 | unique 188；明显高于 repo views。 | [GitHub] |
| popular referrer | 41 | 滚动 14 天 | `github.com`，unique 2。 | [GitHub] |
| popular path `/NTLx/ntlx.github.io/commits` | 31 | 滚动 14 天 | unique 1。 | [GitHub] |
| popular path `/NTLx/ntlx.github.io` | 10 | 滚动 14 天 | unique 2。 | [GitHub] |
| popular path `/NTLx/ntlx.github.io/issues` | 1 | 滚动 14 天 | unique 1。 | [GitHub] |
| stars | 1 | 快照 | star 来自 `Xtest2000`，时间为 2026-01-14T07:02:16Z。 | [GitHub] |
| Actions workflow runs | 337 | 历史累计 | 最近 5 次 Deploy to GitHub Pages 均为 success。 | [GitHub] |
| latest deployments | 5 | 最新 5 条 | environment 均为 `github-pages`。 | [GitHub] |
| issues | 2 | 历史累计 | 2 个 issue 均已关闭。 | [GitHub] |

clone 活动继续远高于 repo views，可能来自自动化、部署、本地环境或 AI 工具重复拉取；它代表仓库使用/维护信号，不代表网站读者访问。GitHub referral 到网站仍只有 2 次会话，说明 README/profile 到站点的转化路径仍弱，或缺少 UTM 导致可见性不足。[GitHub][GA4][Inference]

GitHub Actions 最近 5 次部署均成功，最新一次 workflow run 是 `Deploy to GitHub Pages`，由 `post: Agent 越能写代码，架构越不能乱 (agentic-development-needs-architecture)` 触发，2026-07-07T06:04:46Z 创建，2026-07-07T06:05:44Z 完成。[GitHub]

## 外部提及与反向链接

| 来源 | URL | 指向目标 | 上下文 | 相关性 | 首次发现 |
|---|---|---|---|---|---|
| GitHub profile | https://github.com/ntlx | https://ntlx.github.io/ | 用户资料页公开展示站点 URL、个人介绍和相关仓库。[Search] | 高 | 2026-07-05 |
| GitHub repository | https://github.com/NTLx/ntlx.github.io | https://ntlx.github.io/ | 仓库 README 展示博客在线访问地址、内容方向、本地运行和技能系统说明。[Search][GitHub] | 高 | 2026-07-05 |
| GitHub issue index | https://github.com/NTLx/ntlx.github.io/issues | https://ntlx.github.io/ | issue 页面被公开索引，属于项目上下文，不是外部推荐。[Search][GitHub] | 中 | 2026-07-05 |
| GitHub issue #1 | https://github.com/NTLx/ntlx.github.io/issues/1 | https://ntlx.github.io/ | issue 页面被搜索发现，内容是项目 README 改进讨论。[Search][GitHub] | 中 | 2026-07-05 |

本次公开搜索仍没有发现 Reddit、Hacker News、媒体报道或高质量第三方博客引用。搜索结果中有 Claude Code 官方文档、Playwright 官方文档、Intellex、ntlx.org、知乎、云厂商文档等误匹配，已从有效提及中排除。[Search][Inference]

## 与上一份报告相比

本次与 2026-07-05 报告相比，GA4 仍是同口径 28 天滚动窗口，但日期窗口向后移动两天，因此变化应视为滚动窗口快照变化，而不是严格自然周期环比。[GA4][Prior][Inference]

| 观察 | 变化 | 解读 | 来源 |
|---|---|---|---|
| 总量基本持平 | 活跃用户 +3、会话 +4、页面浏览 +1 | 网站整体访问规模没有实质变化。 | [GA4][Prior][Inference] |
| 参与时长上升 | 总参与时长 +2,452 秒 | 参与时长改善，但参与会话数没有增加，可能来自少数页面或少数用户更长阅读。 | [GA4][Prior][Inference] |
| Direct 更重 | Direct 会话 +22，Bing 相关会话 -14 | 归因不可见问题更突出，仍需要 UTM。 | [GA4][Prior][Inference] |
| GitHub 仓库活动上升 | repo views +9，clones +47 | 仓库侧活动增加，但 GitHub 到站点 referral 仍只有 2 次会话。 | [GitHub][GA4][Prior][Inference] |
| sitemap 结论修正 | 新增确认 `sitemap-index.xml` 200 | 上一份报告把 `/sitemap.xml` 404 解读为 sitemap 缺失不够准确。 | [Site][Prior][Inference] |

## 洞察与机会

| 机会 | 影响 | 证据 | 置信度 | 建议动作 |
|---|---|---|---|---|
| 把 Search Console 的 sitemap 提交目标改成 `sitemap-index.xml` | 高 | robots.txt 声明 `sitemap-index.xml`，该 URL 线上 200；GSC 仍无有效查询和页面行。[Site][GSC] | 高 | 在 Search Console 提交 `https://ntlx.github.io/sitemap-index.xml`，后续按周重跑报告。 |
| 为常见 `/sitemap.xml` 入口提供兼容别名 | 中 | `/sitemap.xml` 线上 404，但有效入口是 `/sitemap-index.xml`。[Site] | 中 | 可新增静态 `sitemap.xml` alias 或接受当前 robots 指向；优先级低于 GSC 提交正确入口。 |
| 给外部分发入口加 UTM | 高 | Direct 占 73.9%，且 engagement rate 只有 3.73%。[GA4][Inference] | 高 | GitHub profile、README、微信公众号原文链接、社交分享链接统一加 UTM。 |
| 改善高流量低参与入口页 | 高 | Playwright MCP 入口 189 次会话但 engagement rate 4.76%；Claude Code 入口 240 次会话但 engagement rate 12.08%。[GA4] | 中 | 检查首屏、目录、示例密度、搜索意图匹配和下一步内链。 |
| 放大 Privoxy 与安装类高意图页面 | 中 | Privoxy 入口 engagement rate 53.06%；install-cli 页面总参与时长 2,047 秒、每活跃用户约 40 秒。[GA4][Inference] | 高 | 在代理/AI 工具文档之间增加专题导航和相关工具推荐。 |
| 建立站点特定行为事件 | 高 | key events 为 0，缺少 copy_code、rss_click、blog_search、internal_article_click 等事件。[GA4] | 高 | 添加最小事件集，把代码复制、RSS 点击、站内搜索、内链点击设为可分析行为。 |

## 追踪缺口

| 缺口 | 影响 | 建议修复 | 优先级 |
|---|---|---|---|
| Search Console 无有效查询与页面数据 | 无法判断 Google 查询词、页面展现、CTR、平均排名和搜索外观。[GSC] | 提交 `sitemap-index.xml`，等待数据积累；按周重跑报告。 | 高 |
| Direct 占比过高且参与率低 | 私域、书签、聊天软件、GitHub 和微信来源被混在一起，无法判断真实分发效果。[GA4][Inference] | 为 GitHub profile、README、微信公众号原文链接、社交分享增加 UTM。 | 高 |
| key events 为 0 | 无法量化订阅、复制、站内搜索、深阅读和高价值点击。[GA4] | 定义 `rss_click`、`copy_code`、`copy_link`、`blog_search`、`internal_article_click` 为关键事件或可分析事件。 | 高 |
| 无自定义 GA4 dimensions/metrics | 无法按文章分类、作者、内容类型、发布日期、是否技术指南等维度分析内容表现。[GA4] | 增加内容 metadata 维度，例如 category、article_type、published_month、content_series。 | 中 |
| `/sitemap.xml` 常见入口 404 | 可能误导人工检查或第三方默认探测，但 robots 已给出有效 sitemap index。[Site][Inference] | 可新增兼容 alias；或在运维文档中明确使用 `sitemap-index.xml`。 | 中 |
| GitHub traffic 是滚动 14 天 | 不定期重跑会丢失仓库 views/clones 历史趋势。[GitHub] | 将每次 report 的 GitHub traffic 摘要保留到报告历史或用户指定历史文件。 | 中 |
| RSS 无订阅/请求量 | 无法评估订阅型读者规模。[Site] | 使用 feed 服务、边缘日志或托管访问日志记录 feed 请求。 | 低 |
| 缺少服务器日志或 GA4 BigQuery export | 无法做事件级路径、bot 过滤、会话重建和长期留存分析。[Env][GA4] | deep 模式下配置 BigQuery export 或托管日志。 | 低 |

## 建议

| 建议 | 原因 | 证据 | 影响 | 工作量 | 优先级 |
|---|---|---|---|---|---|
| 在 GSC 提交 `https://ntlx.github.io/sitemap-index.xml` | 有效 sitemap 入口已存在且线上 200，GSC 仍无有效行。 | [Site][GSC] | 高 | 小 | P0 |
| 给外部分发入口加 UTM | Direct 占 73.9%，且参与率只有 3.73%，当前分发归因不可用。 | [GA4][Inference] | 高 | 小 | P0 |
| 为技术博客添加最小事件集 | key events 为 0，缺少 copy/search/rss/internal click 数据。 | [GA4] | 高 | 中 | P0 |
| 优化 Playwright MCP 与 Claude Code 两个高流量入口页 | 两页贡献约 32.0% 浏览，但入口参与率偏低。 | [GA4][Inference] | 高 | 中 | P1 |
| 围绕 Privoxy/代理工具页和安装类页面做内链专题 | Privoxy 页面参与率强，install-cli 页面参与时长高。 | [GA4][Inference] | 中 | 小 | P1 |
| 把 GitHub README/profile 链接改为带 UTM 的站点入口 | GitHub clones 很高，但 referral 到站点只有 2 次会话。 | [GitHub][GA4] | 中 | 小 | P1 |
| 视需要新增 `/sitemap.xml` 兼容入口 | 当前 robots 指向正确，但常用探测 URL 仍 404。 | [Site] | 中 | 小 | P2 |
| 建立报告历史基线 | 当前只有两次滚动快照，长期趋势仍弱。 | [Prior][GitHub] | 中 | 小 | P2 |

## 未重新验证的历史结论

无。上一份报告中的核心 GA4、GSC、GitHub、站点抓取和公开搜索结论均在本次刷新中重新采集或明确修正；上一份关于 sitemap 缺失的结论已改为“有效 sitemap index 存在，但 `/sitemap.xml` alias 404”。[Prior][Site][GA4][GSC][GitHub][Search]

## 原始证据索引

- 环境检查：读取项目根目录 `.env` 的键名，确认 `GCP_SA_CREDENTIALS`、`GA4_PROPERTY_ID`、`GSC_SITE_URL` 存在；未打印、写盘或复制任何 `.env` 值或服务账号 JSON。[Env]
- Google API 调用：用 Node.js 标准库在内存中构造服务账号 JWT，调用 GA4 Data API 与 Search Console API；未创建 `GOOGLE_APPLICATION_CREDENTIALS` 临时文件。[Env][GA4][GSC]
- 站点抓取：`curl -L -s -o /dev/null -w ...` 检查 `https://ntlx.github.io/`、`/robots.txt`、`/rss.xml`、`/sitemap.xml`、`/sitemap-index.xml`、`/sitemap-0.xml`、`/atom.xml`；robots.txt 内容声明 `Sitemap: https://ntlx.github.io/sitemap-index.xml`。[Site]
- 本地构建产物核对：`dist/` 中存在 `sitemap-index.xml`、`sitemap-0.xml`、`robots.txt`、`rss.xml`；`public/robots.txt` 与线上 robots 一致。[Site][Env]
- GA4 metadata：GA4 property metadata endpoint 返回 375 个 dimensions、89 个 metrics；custom dimensions/metrics 为空。[GA4]
- GA4 reports：采集 `aggregate`、`traffic_trend`、`acquisition_channels`、`landing_pages`、`content_pages`、`events`、`outbound_links`、`audience_geo`、`audience_tech`。[GA4]
- Search Console：`sites.list` 可见目标站点；`queries`、`pages`、`query_page`、`country_device`、`search_appearance` 返回 0 行；`date_trend` 返回 2 行且点击/展现均为 0。[GSC]
- GitHub：`gh auth status -h github.com` 成功；使用 `gh api repos/NTLx/ntlx.github.io`、`traffic/views`、`traffic/clones`、`traffic/popular/referrers`、`traffic/popular/paths`、`stargazers`、`actions/runs`、`deployments`、`issues`；未打印或提取 GitHub token。[GitHub][Env]
- 公开搜索查询包括 `"https://ntlx.github.io" -site:ntlx.github.io`、`"NTLx's Blog"`、`"Claude Code 自定义配置" "NTLx"`、`"Playwright MCP 配置指南" "NTLx"`、`site:github.com "https://ntlx.github.io" -site:github.com/NTLx/ntlx.github.io`、`site:reddit.com "https://ntlx.github.io" OR "NTLx's Blog"`、`site:news.ycombinator.com "https://ntlx.github.io" OR "NTLx's Blog"`、`"ntlx.github.io/ai-tools/claude-code-config" -site:ntlx.github.io`。[Search]

<!-- website-observe:manual-notes:start -->
<!-- website-observe:manual-notes:end -->

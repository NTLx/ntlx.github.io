---
name: news-digest
description: AI 行业资讯简报，汇总指定时间窗口的事件、证据和影响
applies_when: 用户要求汇总 AI 资讯、行业动态、新闻简报或热点复盘
---

# news-digest 策略

## Objective Function

发现事件，核实事实，判断重要性，再压缩成读者可以快速决策的信息。简报
不是链接堆，也不要求套用某个固定的分析或写作工具。

## Step 1：研究

先确定时间窗口、读者需要做的决定和纳入标准。候选发现可以使用当前
当前可用的资料能力或直接检索；进入正文的事实必须回到官方或其它
一手来源核验。社区反馈、争议和用户体验只有在真实可追溯时才作为补充，
并记录覆盖范围和未知项。

将每条候选事件的发生时间、主体、事实来源、影响对象、可信度和作者判断
写入 `materials.md`，并通过：

每个正式纳入事件的直接原始来源都必须进入单独的 `## 原始来源`，例如：

```text
## 原始来源

- url: https://official.example.com/event-a
- url: https://official.example.com/event-b
```

`## 背景调研` 只记录 supporting evidence。Step 1.5 先执行 Primary Source Uniqueness；
如果某个 source 已被覆盖，从材料中剔除该事件并重新整理后再跑 Step 1 / 1.5；全部核心来源
均已覆盖时 STOP，不再次摘要或创建新文章。

```bash
bun run .agents/skills/wechat-article-write/scripts/step1-collect.mjs <date-slug>
bun run .agents/skills/wechat-article-write/scripts/select-related-articles.mjs <date-slug>
```

## Step 2：压缩写作

由 Agent 根据简报目标决定原生写作或委托合适的写作能力。每条事件应有
简洁事实、来源和“为什么重要/影响谁”的作者判断；全文还要有综合判断、
风险或后续观察点。不要复制任何资料工具的输出格式。

正文仍遵守通用内容协议：金句式 `summary`、H2、SLOT00 全文总览，以及表达共同
趋势、对比、时间线、影响路径或其它独立信息增益的正文 visual SLOT。正常长文至少
两个；未达到 normal long-form 阈值的短文可以为 0 个；不要用每条消息一张图替代语义判断。
另有互动问题和
`## 参考资料`。如果某条消息无法核实，就删掉或明确标成未证实，不用语气
把猜测伪装成事实。

保存 `draft.md` 并运行 Step 2 Gate；Step 2 不创建最终 `image-plan.json`：

```bash
bun run .agents/skills/wechat-article-write/scripts/step2-write.mjs <date-slug>
```

Step 4 图片完成后，才创建 `image-plan.json`，只记录最终资产的 slot、kind、file，以及
source 图片必要的 URL 和 reason；source 与 generated 都算正文视觉覆盖，再运行 Step 4 Gate：

```bash
bun run .agents/skills/wechat-article-write/scripts/step4-images.mjs <date-slug>
```

## Step 3：按问题 refine

只处理实际发现的事实表达、结构、可读性或格式问题；所有文章都必须先应用
`humanizer-zh`，已经清楚的条目可以零改动，不要为了统一风格而全文重写或
编造作者经历。修改后运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/step3-polish.mjs <date-slug>
```

## 后续阶段

Step 4 先从新闻的共同趋势或影响关系中定义视觉意图，再动态选择视觉
能力；raster 只能经 `baoyu-image-gen → codex-cli`。Step 5/6 使用通用的
双轨构建、HTML finalize 和发布顺序。首次采用新的数据源或能力时，遵守
其 setup 要求；不可用时如实记录覆盖差异。

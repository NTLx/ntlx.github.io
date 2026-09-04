---
name: reader-response
description: 深度读后感，以原始材料为起点形成作者自己的判断和延展思考
applies_when: 用户提供一篇或多篇原始材料，要求写读后感、深度分析或观点文章
---

# reader-response 策略

## Objective Function

从材料出发形成真正属于作者的判断、认知增量和延伸思考。文章不是材料
摘要，也不是把外部分析报告拼接起来；读者应能看见材料如何改变、支持
或限制作者的判断。

本策略只定义编辑目标。研究、理解、写作和润色方法由 Agent 根据当前缺口决定，
允许原生完成、单个能力或少量互补能力。

## Step 1：研究材料

读取 URL、文件或用户粘贴的原文，辨认输入范围和来源。必要的背景、人物、
概念、事件、争议和近期信号要通过可验证来源补齐；所有进入正文的事实
保留 URL，无法核实的内容明确标记。输入是视频、论文或其它特殊格式时，
由 Agent 依据当前任务可用能力选择合适的提取/阅读能力，不能假设某个工具永远
可用。

将原始材料、背景核验、观点区分和可复用图片信息写入：

```text
posts/{date-slug}/materials.md
```

至少包含 `## 背景调研` 和可追溯 URL，然后运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/step1-collect.mjs <date-slug>
bun run .agents/skills/wechat-article-write/scripts/select-related-articles.mjs <date-slug>
```

若需要近期社区反馈，记录实际覆盖范围、来源和不确定性；不要把调研工具
的报告格式直接变成文章结构。

## Step 1.8：理解与契约

读取 `materials.md`、`blog-memory.md`、用户意图和
先定义缺口，再选择能补齐缺口的方法。
生成 `understanding-brief.md`，并运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/validate-understanding.mjs <date-slug>
```

brief 要给出核心问题、中心判断、机制、边界、反方、可视觉化节点，以及
至少三条能在正文中逐条检查的原创增量承诺。它是写作契约，不是分析工具
输出的存档区。

## Step 2：写作

从 brief 的契约出发，而不是从任何 Skill 的默认模板出发。Agent 可以自己
写，也可以委托适合的写作能力；委托后仍由 Agent 完成仓库适配和事实判断。
正文应：

- 只围绕一个中心判断展开，保留作者第一人称观察和疑问；
- 吸收背景核验与站内记忆，而非堆砌原文摘要；
- 逐条落实原创增量承诺，并明确重要边界；
- 规划 3-6 个 H2 和有语义的 SLOT：SLOT00 是全文速读信息图；SLOT_IMG_01+
  是正文 visual SLOT，由可视觉化节点决定，正常长文至少两个，典型 3-6 H2
  reader-response 在 2-4 个之间按语义判断自由选择。未达到 normal long-form 阈值的
  短文可以为 0 个；normal long-form 必须至少两个。
  正文图优先表达局部机制、对比、框架、状态变化或原创增量，避免重复 SLOT00；
- 写出金句式 `summary`（不超过 120 字）、互动问题和 `## 参考资料`。

保存 `draft.md` 并运行 Step 2 Gate：

```bash
bun run .agents/skills/wechat-article-write/scripts/step2-write.mjs <date-slug>
```

Step 4 完成 source reuse 或生成后，才创建最终 `image-plan.json`，再进入后续图片校验。

若没有合适的站内文章，使用 `--allow-no-related` 并记录理由；不要为了
满足数量强行联动。

## Step 3：按实际问题 refine

检查正文是否出现事实跳跃、论证缺口、机械表达或格式问题；所有文章都必须先
读取并应用 `humanizer-zh`，再决定是否采用其它语言/格式能力。humanizer 可以
零改动，但不得抹掉已有第一人称判断、编造作者经历或把全文套成“去 AI”模板。
完成后运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/step3-polish.mjs <date-slug>
```

## 后续工程阶段

Step 4-6 遵循 `pipeline-overview.md`：先定义视觉意图，图片统一经项目
配置的 `baoyu-image-gen → codex-cli`，然后构建双轨产物并按博客、微信顺序
发布。任何 Gate 失败都回到编排闭环改道，不跳过验证。

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

必须在材料中单独识别直接定义本文写作对象的 primary source，并写入：

```text
## 原始来源

- url: https://primary.example.com/article
```

`## 背景调研` 只放 supporting evidence。进入 Step 1.5 后，必须先通过 Primary Source
Uniqueness；同一 normalized primary source 已有已发布文章时 STOP，不进入 Understanding，
不因换标题、opening、thesis 或 visual 而创建第二篇文章。

通常应在 `## 背景调研` 补充可追溯证据；缺少背景证据时 Gate 给出 warning，
Main 判断已有材料是否足够，事实缺口仍须补齐。然后运行：

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

brief 要说明证据、中心判断、边界和写作应用；需要时展开机制与反方。
具体质量要求见 material-understanding.md 和 originality-policy.md，不强制视觉节点或增量条数。

## Step 2：写作

从 brief 的契约出发，而不是从任何 Skill 的默认模板出发。Agent 可以自己
写，也可以委托适合的写作能力；委托后仍由 Agent 完成仓库适配和事实判断。
正文应：

- 只围绕一个中心判断展开，保留作者第一人称观察和疑问；
- 吸收背景核验与站内记忆，而非堆砌原文摘要；
- 逐条落实原创增量承诺，并明确重要边界；
- 规划 3-6 个 H2，围绕中心判断组织完整论证；
- 写出金句式 `summary`（不超过 120 字）和 `## 参考资料`；结尾按论证需要选择，互动问题可选。

保存 `draft.md` 并运行 Step 2 Gate：

```bash
bun run .agents/skills/wechat-article-write/scripts/step2-write.mjs <date-slug>
```

Step 4 由视觉 Specialist 分析并将图片集成到 `visual-draft.md`，再运行图片校验；
具体职责见 [image-policy.md](image-policy.md)。

站内相关文章是否适合联动属于 editorial judgement：高相关候选未被引用时 Step 2 只给 warning，
由 Main 在 Understanding 阶段判断是否纳入；不要为了满足数量强行联动。

## Step 3：按实际问题 refine

检查正文是否出现事实跳跃、论证缺口、机械表达或格式问题；所有文章都必须先
读取并应用 `humanizer-zh`，再决定是否采用其它语言/格式能力。humanizer 可以
零改动，但不得抹掉已有第一人称判断、编造作者经历或把全文套成“去 AI”模板。
完成后运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/step3-polish.mjs <date-slug>
```

## 后续工程阶段

Step 4-6 遵循主 `SKILL.md` 与 `image-policy.md`：由专业视觉 Skills 分析并集成图片，
再构建双轨产物并按博客、微信顺序发布。任何 Gate 失败都回到编排闭环改道，
不跳过验证。

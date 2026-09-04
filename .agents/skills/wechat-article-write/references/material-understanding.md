# 材料理解合同

本文件定义需要深度理解时的认知质量，不规定由哪个 Skill 产生理解。
目标是把 `materials.md`、`blog-memory.md` 和用户意图压缩成一份能直接
指导写作、视觉规划和边界声明的 `understanding-brief.md`。

## 什么时候需要

`reader-response` 默认需要完整的理解 brief。`tutorial` 通常已有结构，
只有原文概念过密、边界不清或适配目标改变时才建立 brief。`news-digest`
通常以事实核验和简报契约直接进入写作；需要深度复盘时再按本合同裁剪。
这只是编辑判断，不是固定 Skill 触发器。

## 输入

- `posts/{date-slug}/materials.md`；
- `posts/{date-slug}/blog-memory.md` 或 `blog-memory.json`（若已生成）；
- 用户要求、目标读者和限制；
- 当前 strategy、已有 artifacts、上一 Gate 结果；
- 当前任务实际可用的研究或理解能力；优先使用最匹配且能补齐缺口的能力。

先回答“当前真正的认知缺口是什么”。Agent 可以原生完成，也可以从
选择一个最匹配的能力，或组合少量互补能力。只有能改善某个
具体缺口的调用才保留。没有缺口时 `no-skill` 是合法结果。任何候选输出都必须经过二次判断，不因报告很长
或命令成功就写入 brief。

## 质量标准

合格的 brief 应让一个不了解过程的写作者知道：

- 材料说了什么，哪些是直接证据，哪些是推断或作者观点；
- 文章真正要回答的核心问题是什么；
- 中心判断是什么，它依赖哪些前提；
- 关键概念、生成机制或因果链如何用读者能理解的语言解释；
- 哪些约束是事实、规则、解释或自设边界，哪些仍不确定；
- 最强反方是什么，中心判断在哪些边界内成立；
- 哪些判断值得进入正文，哪些只应留在材料；
- 哪些节点适合用 SLOT 表达，以及图要解释什么；每个节点都写明视觉表达目的、最适合的视觉形式、是否可能直接复用 source image、是否与 SLOT00 重复；
- 写作契约如何把以上判断转成章节、证据和行动。

## 输出格式

保存为 `posts/{date-slug}/understanding-brief.md`：

```markdown
# Understanding Brief

## 原始材料结构

## 核心问题链

## 中心论点下钻

## 关键概念白话化

## 生成机制

## 约束与解空间

## 反方与边界

## 可写成正文的判断

## 可视觉化的节点

## 写作契约
```

标题可以按材料需要补充小节，但上述核心小节要保留，便于确定性 Gate
检查。没有适用内容的小节也要明确写“未发现”及原因，不能用空标题伪装
完成。

## 写作契约

`## 写作契约` 是后续写作的输入合同，至少包含：

- 这篇文章只打哪一个核心判断；
- 必须回答的 2-4 个问题；
- 必须承认的证据边界、反方或未知项；
- 要自然织入的背景和来源；
- 可联动的站内旧文，或不联动的理由；
- 需要转成 SLOT 的信息节点和每个节点的表达目的；
- 正文视觉计划：body visual target、候选节点、必须视觉化的节点、可选节点、明确不做的节点及原因；
- 至少三条可检查的原创增量承诺，例如第一人称经验、独立判断、跨来源
  连接或预测行动。后续 draft 必须逐条落地。

### 正文视觉计划

写作契约必须明确正文 visual SLOT 的最低覆盖和语义选择，不把 SLOT00 或 cover
算入正文视觉。典型 reader-response 可以写成：

```markdown
### 正文视觉计划

目标：3 个 body visual SLOT，不含 SLOT00。

必须：
1. Token usage vs business outcome
2. Agent workflow contract

优先：
3. Recovery loop

不做：
- Basis / Clay / Exa 三案例链，因为已由 SLOT00 表达，避免重复。
```

这仍然是 Markdown brief，不需要额外 schema；如果最终 draft 没采用某个“必须视觉化”
节点，Agent 在过程说明中解释原因，不创建 receipt 文件。

Understanding brief 只声明视觉节点、目标和取舍，不记录最终 file path、kind、source URL
或 basename；这些事实由 Step 4 产生并写入 `image-plan.json`。

契约应是短句和可检查的承诺，不要把工具名称当作承诺，也不要把外部
分析报告全文复制进来。

## Gate 与改道

完成后运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/validate-understanding.mjs <date-slug>
```

Gate 失败时先看具体缺哪一项：修材料、补证据、缩小中心判断、改变输出
结构，或重新选择能力。不要无条件重复上一条调用，也不要因某个可选
Skill 缺失不阻断整个工作流；只有当前 brief 满足合同，才进入写作。

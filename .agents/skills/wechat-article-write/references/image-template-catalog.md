# 图片模板注册表

本文件定义文章内容类型与图片模板组合的映射规则。Agent 在 Step 2 写作时参考此文件，
为每张 SLOT_IMG 选择最匹配的模板组合，产出 `image-plan.json`。

## 内容类型 → 模板推荐

### technical-deep-dive（技术深度分析）

适用场景：系统架构、技术原理、工程实践、性能分析等深度技术文章。

| 图片位置 | source_skill | 推荐模板 | 推荐风格 | 说明 |
|---------|-------------|---------|---------|------|
| 信息图 | baoyu-infographic | layout: structural-breakdown | style: technical-schematic | 结构分解图适合展示系统分层 |
| 文内插图（架构） | baoyu-article-illustrator | type: framework | style: blueprint | 框架图展示组件关系 |
| 文内插图（流程） | baoyu-article-illustrator | type: flowchart | style: blueprint | 流程图展示数据/控制流 |
| 文内插图（对比） | baoyu-article-illustrator | type: comparison | style: blueprint | 方案对比 |
| 封面 | baoyu-cover-image | type: conceptual | palette: cool, rendering: flat-vector | 抽象概念视觉 |

### opinion-essay（观点文章）

适用场景：个人见解、评论、思辨、"为什么我认为 X"类型文章。

| 图片位置 | source_skill | 推荐模板 | 推荐风格 | 说明 |
|---------|-------------|---------|---------|------|
| 信息图 | baoyu-infographic | layout: hub-spoke | style: craft-handmade | 中心辐射适合"核心观点+支撑论据" |
| 文内插图 | baoyu-article-illustrator | type: scene / infographic | style: editorial / notion | 叙事场景或数据可视化 |
| 封面 | baoyu-cover-image | type: metaphor | palette: warm, rendering: hand-drawn | 隐喻式视觉 |

### tutorial（教程/操作指南）

适用场景：步骤教程、配置指南、How-to 文章。

| 图片位置 | source_skill | 推荐模板 | 推荐风格 | 说明 |
|---------|-------------|---------|---------|------|
| 信息图 | baoyu-infographic | layout: linear-progression | style: ikea-manual | 线性步骤流程 |
| 文内插图 | baoyu-article-illustrator | type: flowchart | style: minimal | 简洁步骤图 |
| 封面 | baoyu-cover-image | type: hero | palette: vivid, rendering: digital | 吸引眼球的主视觉 |

### news-digest（资讯简报）

适用场景：AI 日报、行业动态、新闻汇总。

| 图片位置 | source_skill | 推荐模板 | 推荐风格 | 说明 |
|---------|-------------|---------|---------|------|
| 信息图 | baoyu-infographic | layout: bento-grid | style: retro-pop-grid | 多话题模块化概览 |
| 文内插图 | baoyu-article-illustrator | type: infographic | style: notion | 数据密集型可视化 |
| 封面 | baoyu-cover-image | type: typography | palette: mono, rendering: screen-print | 文字主导的现代感 |

### deep-analysis（深度分析/读后感）

适用场景：读后感、论文解读、书评、深度剖析。

| 图片位置 | source_skill | 推荐模板 | 推荐风格 | 说明 |
|---------|-------------|---------|---------|------|
| 信息图 | baoyu-infographic | layout: dense-modules | style: morandi-journal | 高密度知识模块 |
| 文内插图 | baoyu-article-illustrator | type: framework / comparison | style: warm / editorial | 框架图或对比图 |
| 封面 | baoyu-cover-image | type: scene | palette: elegant, rendering: painterly | 优雅叙事感 |

### listicle（清单/盘点）

适用场景：TOP N 排行、工具推荐、资源合集。

| 图片位置 | source_skill | 推荐模板 | 推荐风格 | 说明 |
|---------|-------------|---------|---------|------|
| 信息图 | baoyu-infographic | layout: comparison-matrix | style: bold-graphic | 矩阵式对比 |
| 文内插图 | baoyu-article-illustrator | type: infographic | style: vector-illustration | 信息密集可视化 |
| 封面 | baoyu-cover-image | type: hero | palette: vivid, rendering: flat-vector | 鲜明主视觉 |

## Slot 上下文 → 插图类型映射

当 Agent 为某个 SLOT_IMG 选择插图类型时，根据占位符附近文字的语义信号判断：

| 上下文信号关键词 | 推荐 illustration type | 推荐 infographic layout |
|----------------|----------------------|------------------------|
| 对比、比较、vs、两种方案、优劣、trade-off | comparison | binary-comparison |
| 流程、步骤、循环、转化、pipeline、workflow | flowchart | linear-progression |
| 架构、结构、层次、组件、模块、系统 | framework | structural-breakdown |
| 数据、指标、统计、占比、趋势 | infographic | dashboard |
| 时间线、演进、历史、发展、阶段 | timeline | linear-progression |
| 关系、利益相关方、生态、网络 | framework | hub-spoke |
| 概念、原理、机制、因果 | framework | hub-spoke |
| 多主题概览、全景、总览 | — | bento-grid |

## 风格一致性规则

1. **同一篇文章的信息图和文内插图应使用同一 style family**：
   - `technical-schematic` ↔ `blueprint`（技术类）
   - `craft-handmade` ↔ `editorial`（叙事类）
   - `ikea-manual` ↔ `minimal`（教程类）
   - `corporate-memphis` ↔ `notion`（商业/数据类）

2. **封面可以独立于正文图片风格**：封面是"视觉锤"，风格可以更自由

3. **推荐组合中已内置风格一致性**，Agent 通常只需按表选择即可

## 封面自动选择规则

当 `image-plan.json` 中封面配置为 `auto` 时，按以下规则自动推断：

| 文章 category | 推荐 type | 推荐 palette | 推荐 rendering |
|--------------|-----------|-------------|---------------|
| ai-coding / engineering | conceptual | cool | flat-vector |
| ai-agents / ai-industry | metaphor | warm | hand-drawn |
| ai-models | conceptual | elegant | digital |
| security | minimal | dark | flat-vector |
| （其他） | scene | cool | flat-vector |

## 使用方式

Agent 在 Step 2 写完 draft.md 后：

1. 确定文章的内容类型（从上方"内容类型 → 模板推荐"中选择最匹配的）
2. 为每个 SLOT_IMG 根据上下文信号选择插图类型
3. 按风格一致性规则确认所有图片的 style family 一致
4. 将选择结果写入 `posts/{date-slug}/image-plan.json`

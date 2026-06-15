# 图片模板注册表

本文件定义文章内容类型与图片模板组合的映射规则。Agent 在 Step 2.6 只需选择 `article_type`，脚本自动解析完整模板配置。

## 风格家族（Style Family）

同一风格家族的信息图和文内插图视觉语言一致。Agent 选 article_type 后，脚本自动使用对应的 style family。

| 家族 ID | 信息图 style hint | 文内插图 style | 视觉特征 | 适用场景 |
|---------|-------------|---------------|---------|---------|
| `journal` | `morandi-journal` | `warm` | 莫兰迪色调、手绘笔记质感、温暖知性 | 深度分析、读后感、观点文章 |
| `tech` | `technical-schematic` | `blueprint` | 蓝图/技术制图风、精密线条、工程感 | 技术深度、架构分析、性能 |
| `editorial` | `craft-handmade` | `editorial` | 手工拼贴感、杂志编辑风、叙事性强 | 叙事、人物、行业观察 |
| `bold` | `bold-graphic` | `notion` | 大色块、高对比、信息密度高 | 清单、数据密集、对比分析 |
| `minimal` | `ikea-manual` | `minimal` | 极简线条、说明书风、清晰步骤 | 教程、操作指南 |
| `retro` | `retro-pop-grid` | `retro` | 波普色彩、复古网点、视觉冲击 | 资讯、趋势、文化评论 |
| `elegant` | `aged-academia` | `elegant` | 学术古典、羊皮纸质感、沉稳优雅 | 论文解读、书评、历史 |

**用户偏好**：项目默认偏好 `journal` 风格家族（信息图倾向、莫兰迪色调）。Agent 不指定 direction 时使用 journal。

## 文章类型 → 模板配置

每个 article_type 对应完整的模板配置。Agent 只需在 image-plan.json 中写 article_type，脚本自动解析。

### `deep-analysis`（深度分析/读后感）

```yaml
style_family: journal
infographic:
  layout: dense-modules
  style: morandi-journal
illustration:
  style: warm
cover:
  type: scene
  palette: elegant
  rendering: painterly
```

适用：读后感、论文解读、书评、深度剖析

### `opinion-essay`（观点文章）

```yaml
style_family: journal
infographic:
  layout: hub-spoke
  style: morandi-journal
illustration:
  style: warm
cover:
  type: metaphor
  palette: warm
  rendering: hand-drawn
```

适用：个人见解、评论、思辨

### `technical-deep-dive`（技术深度分析）

```yaml
style_family: tech
infographic:
  layout: structural-breakdown
  style: technical-schematic
illustration:
  style: blueprint
cover:
  type: conceptual
  palette: cool
  rendering: flat-vector
```

适用：系统架构、技术原理、工程实践、性能分析

### `tutorial`（教程/操作指南）

```yaml
style_family: minimal
infographic:
  layout: linear-progression
  style: ikea-manual
illustration:
  style: minimal
cover:
  type: conceptual
  palette: vivid
  rendering: digital
```

适用：步骤教程、配置指南、How-to

### `news-digest`（资讯简报）

```yaml
style_family: retro
infographic:
  layout: bento-grid
  style: retro-pop-grid
illustration:
  style: retro
cover:
  type: conceptual
  palette: mono
  rendering: screen-print
```

适用：AI 日报、行业动态、新闻汇总

### `listicle`（清单/盘点）

```yaml
style_family: bold
infographic:
  layout: comparison-matrix
  style: bold-graphic
illustration:
  style: notion
cover:
  type: conceptual
  palette: vivid
  rendering: flat-vector
```

适用：TOP N 排行、工具推荐、资源合集

### `data-story`（数据叙事）

```yaml
style_family: bold
infographic:
  layout: dashboard
  style: bold-graphic
illustration:
  style: notion
cover:
  type: conceptual
  palette: cool
  rendering: digital
```

适用：数据驱动的分析、统计报告、趋势解读

## Slot 上下文 → 插图类型自动推断

脚本根据 SLOT_IMG 占位符附近文字自动推断 type，Agent 无需逐张指定：

| 上下文信号关键词 | 推断 type | 推荐 infographic layout |
|----------------|-----------|------------------------|
| 对比、比较、vs、两种方案、优劣、trade-off | `comparison` | `binary-comparison` |
| 流程、步骤、循环、转化、pipeline、workflow | `flowchart` | `linear-progression` |
| 架构、结构、层次、组件、模块、系统 | `framework` | `structural-breakdown` |
| 数据、指标、统计、占比、趋势 | `framework` | `dashboard` |
| 时间线、演进、历史、发展、阶段 | `flowchart` | `linear-progression` |
| 关系、利益相关方、生态、网络 | `framework` | `hub-spoke` |
| 概念、原理、机制、因果 | `framework` | `hub-spoke` |
| 多主题概览、全景、总览 | `framework` | `bento-grid` |

## 可用模板清单

Agent 想用 `direction` 覆盖默认值时，参考此清单。

### 信息图 layout hints（映射到 gpt-image-2 compact templates）

bento-grid, binary-comparison, bridge, circular-flow, comic-strip, comparison-matrix, dashboard, dense-modules, funnel, hierarchical-layers, hub-spoke, iceberg, isometric-map, jigsaw, linear-progression, periodic-table, story-mountain, structural-breakdown, tree-branching, venn-diagram, winding-roadmap

### 信息图 style hints（映射到 gpt-image-2 compact templates）

aged-academia, bold-graphic, chalkboard, claymation, corporate-memphis, craft-handmade, cyberpunk-neon, hand-drawn-edu, ikea-manual, kawaii, knolling, lego-brick, morandi-journal, origami, pixel-art, pop-laboratory, retro-pop-grid, retro-popup-pop, storybook-watercolor, subway-map, technical-schematic, ui-wireframe

SLOT 00 头部信息图不再展开 `baoyu-infographic` 的完整 layout/style 文档。`generate-image-prompts.mjs` 会把上述 layout/style hint 映射成 `gpt-image-2/references/infographics/*.md` 的短模板引用，并输出更短、更稳定的文生图 prompt。当前默认映射：journal/morandi → `hand-drawn-infographic.md`；教程流程 → `step-by-step-infographic.md`；对比 → `comparison-infographic.md`；dashboard → `kpi-dashboard-infographic.md`；其它总览 → `bento-grid-infographic.md`。

### baoyu-article-illustrator styles（23 种）

blueprint, chalkboard, editorial, elegant, fantasy-animation, flat-doodle, flat, ink-notes, intuition-machine, minimal, nature, notion, pixel-art, playful, retro, scientific, screen-print, sketch, sketch-notes, vector-illustration, vintage, warm, watercolor

### baoyu-cover-image palettes（11 种）

cool, dark, duotone, earth, elegant, macaron, mono, pastel, retro, vivid, warm

### baoyu-cover-image renderings（7 种）

chalk, digital, flat-vector, hand-drawn, painterly, pixel, screen-print

## 使用方式

Agent 在 Step 2 写完 draft.md 后：

1. 从上方"文章类型"中选择最匹配的 `article_type`
2. 统计 draft.md 中的 SLOT_IMG_01+ 占位符数量
3. （可选）如果要覆盖默认风格，写 `direction` 字段
4. 写入 `posts/{date-slug}/image-plan.json`

脚本自动处理：风格家族解析 → 信息图 gpt-image-2 compact template 映射 → 插图类型推断 → 封面参数填充 → prompt 生成。

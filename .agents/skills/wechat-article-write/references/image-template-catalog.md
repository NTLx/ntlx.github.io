# 图片模板注册表

本文件解释文章内容类型与图片模板组合的映射规则。机器可读权威来源是 `references/image-template-map.json`；脚本只读取该 JSON。Agent 在 Step 2.6 只需选择 `article_type`，脚本自动解析完整模板配置。

## 机器来源与优先级

- 映射来源：`references/image-template-map.json`
- schema：`references/image-plan.schema.json`
- 信息图 template 选择：image-plan.json 直接给出 `infographic.layout` 和 `infographic.style`，对应 `baoyu-infographic/references/layouts/*.md` 与 `references/styles/*.md` 的文件名（去掉 `.md`）。
- SLOT 00 信息图的模板来源是 `baoyu-infographic`（属于 baoyu 系列）。本技能**只读取模板文本用于拼装文生图 prompt**，不调用其完整出图工作流。

## 风格家族（Style Family）

风格家族只控制文内插图的默认视觉语言。SLOT 00 信息图默认 style 为 `craft-handmade`；只有 `image-plan.json` 显式写入 `infographic.style` 时才覆盖。direction 只影响文内插图 style，不影响 SLOT 00 信息图。

| 家族 ID | 信息图 style hint | 文内插图 style | 视觉特征 | 适用场景 |
|---------|-------------|---------------|---------|---------|
| `journal` | `craft-handmade` | `warm` | 手写卡片、拼贴纸张、温暖知性 | 深度分析、读后感、观点文章 |
| `tech` | `craft-handmade` | `editorial` | 手工信息图 + 技术编辑图解 | 技术深度、架构分析、性能 |
| `editorial` | `craft-handmade` | `editorial` | 手工拼贴感、杂志编辑风、叙事性强 | 叙事、人物、行业观察 |
| `bold` | `craft-handmade` | `notion` | 手工信息图 + 清单化插图 | 清单、数据密集、对比分析 |
| `minimal` | `craft-handmade` | `minimal` | 手工信息图 + 极简步骤插图 | 教程、操作指南 |
| `retro` | `craft-handmade` | `retro` | 手工信息图 + 复古插图 | 资讯、趋势、文化评论 |
| `elegant` | `craft-handmade` | `elegant` | 手工信息图 + 学术古典插图 | 论文解读、书评、历史 |

**用户偏好**：项目默认偏好 `journal` 风格家族；SLOT 00 信息图默认使用 `craft-handmade`，突出“手工整理出来的核心结构”。

## 文章类型 → 模板配置

每个 article_type 对应完整的模板配置。Agent 只需在 image-plan.json 中写 article_type，脚本自动解析。

### `deep-analysis`（深度分析/读后感）

```yaml
style_family: journal
infographic:
  layout: dense-modules
  style: craft-handmade
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
  style: craft-handmade
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
  style: craft-handmade
illustration:
  style: editorial
cover:
  type: conceptual
  palette: cool
  rendering: flat-vector
```

适用：系统架构、技术原理、工程实践、性能分析

注意：这里的默认文内图风格是“技术编辑图解”，不是工程蓝图页。只有用户明确要求技术制图感时，才显式覆盖成 `blueprint` 或类似风格。

### `tutorial`（教程/操作指南）

```yaml
style_family: minimal
infographic:
  layout: linear-progression
  style: craft-handmade
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
  style: craft-handmade
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
  style: craft-handmade
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
  style: craft-handmade
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

## 图纸语法禁区

默认情况下，文内 `SLOT_IMG_01+` 都是文章插图，不是图纸页。除非用户明确要求，以下元素都视为错误：

- 日期、版本号、revision、图号、标题栏
- 尺寸线、刻度尺、坐标标记、角标定位符
- 工程边框、装订框、规范书底栏、假元数据盒

这些元素会把“解释型插图”错误地推向“工程图纸语法”，尤其容易污染组织关系、职责迁移、观点框架、判断流程等图。

## 什么时候才允许 `blueprint`

只有同时满足以下条件时，Agent 才应显式选择 `blueprint`：

1. 用户明确要求“技术制图感 / 蓝图感 / engineering schematic”
2. 图的主语是工程对象，而不是组织或观点
3. 这张图真的受益于技术制图语言，比如模块边界、接口方向、系统路径、调用链、kernel pipeline

如果缺任何一条，默认不要用 `blueprint`。

## 可用模板清单

Agent 想显式覆盖默认值时，参考此清单。常规文章不要覆盖 SLOT 00 信息图 style；保持 `craft-handmade`。

### 信息图 layouts（baoyu-infographic 全部 21 个，引用时去掉 `.md`）

bento-grid, binary-comparison, bridge, circular-flow, comic-strip, comparison-matrix, dashboard, dense-modules, funnel, hierarchical-layers, hub-spoke, iceberg, isometric-map, jigsaw, linear-progression, periodic-table, story-mountain, structural-breakdown, tree-branching, venn-diagram, winding-roadmap

### 信息图 styles（baoyu-infographic 全部 22 个，引用时去掉 `.md`）

aged-academia, bold-graphic, chalkboard, claymation, corporate-memphis, craft-handmade, cyberpunk-neon, hand-drawn-edu, ikea-manual, kawaii, knolling, lego-brick, morandi-journal, origami, pixel-art, pop-laboratory, retro-pop-grid, retro-popup-pop, storybook-watercolor, subway-map, technical-schematic, ui-wireframe

SLOT 00 头部信息图的 prompt 由 `generate-image-prompts.mjs` 拼接：直接把上面选中的 `layout` 对应 `baoyu-infographic/references/layouts/{layout}.md` 与 `style` 对应 `references/styles/{style}.md` 的全文拼入 prompt 末尾的 `## Layout specification` / `## Style specification` 段，让模型同时拿到结构约束和视觉语言，不再做"先归并到 5 个 hybrid 模板"的间接层。默认组合来自 `article_type_defaults.infoLayout` × `craft-handmade`。

### baoyu-article-illustrator styles（23 种）

blueprint, chalkboard, editorial, elegant, fantasy-animation, flat-doodle, flat, ink-notes, intuition-machine, minimal, nature, notion, pixel-art, playful, retro, scientific, screen-print, sketch, sketch-notes, vector-illustration, vintage, warm, watercolor

其中 `blueprint` 属于显式请求风格，不再视为默认安全风格。

### baoyu-cover-image palettes（11 种）

cool, dark, duotone, earth, elegant, macaron, mono, pastel, retro, vivid, warm

### baoyu-cover-image renderings（7 种）

chalk, digital, flat-vector, hand-drawn, painterly, pixel, screen-print

## 使用方式

Agent 在 Step 2 写完 draft.md 后：

1. 从上方"文章类型"中选择最匹配的 `article_type`
2. 统计 draft.md 中的 SLOT_IMG_01+ 占位符数量
3. （可选）如果要覆盖文内插图风格，写 `direction` 字段；如果确需覆盖 SLOT 00 信息图，显式写 `infographic.layout` / `infographic.style`
4. 写入 `posts/{date-slug}/image-plan.json`

脚本自动处理：article_type 解析信息图 layout 与封面参数 → SLOT 00 使用 craft-handmade → direction 解析文内插图 style → 插图类型推断 → prompt 生成。

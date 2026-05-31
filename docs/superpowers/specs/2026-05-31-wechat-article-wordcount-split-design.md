---
title: wechat-article-write 字数门控移除与多文章拆分机制
date: 2026-05-31
status: approved
---

# wechat-article-write 字数门控移除与多文章拆分机制

## 背景

当前 wechat-article-write 管线在 step2-write.mjs / step3-polish.mjs 中设置了 2000 字硬性下限（弹性区间 1800），与 ljg-writes 技能自带的 1000-1500 字约束冲突。策略文件（reader-response/news-digest/tutorial）还用 "字数下限 2000/1500" 覆盖 ljg-writes 默认值，形成三层矛盾体系。

用户要求：
1. 完全清除 wechat-article-write 中所有字数门槛约束，让 ljg-writes 技能的自律约束成为唯一的字数控制机制
2. 新增多文章拆分机制：在完成调研后，Agent 有意识地根据材料丰富度和价值密度自主判断是否应写成多篇，并为每篇完成全部管线流程

## 设计决策

### 方案选择：Split Gate（拆分闸门）

选择在 Step 1 完成后、Step 2 开始前插入正式的拆分评估点。理由：
- 决策时机最精确（材料已收集完毕，信息量和价值密度最清晰）
- 改动最少，完全复用现有管线脚本
- 拆分决策是 Agent 行为指引而非脚本逻辑问题

### 拆分后目录结构：独立 date-slug

每篇文章各自创建独立的 `posts/{date-slug}/` 目录，完全复用现有管线逻辑。每篇独立状态管理、独立 blog-slug、独立封面和插图。

### 拆分确认：必须向用户提出方案并获得确认

Agent 判断需要拆分后，向用户提出拆分方案（每篇主题、大纲、材料覆盖范围），用户确认后才执行。

## 设计段落 1：字数门控移除

**原则**：ljg-writes 已内置 1000-1500 字自律约束，wechat-article-write 管线不应再叠加字数门槛。管线脚本的职责是工程校验（frontmatter 完整性、文件存在性等），而非内容质量把关。

| 文件 | 移除内容 | 保留内容 |
|------|---------|---------|
| `step2-write.mjs` | `minWords` 变量、`--min-words` 参数、exit code 3（字数不足）逻辑 | `word_count` 写入状态（纯记录） |
| `step3-polish.mjs` | 1800/2000 字弹性门控、`word_count_warning` 逻辑 | `word_count` 写入状态（纯记录） |
| `step1-collect.mjs` | "200字不足支撑2500字文章"的警告措辞 | 低质量检测保留，但改为通用措辞（不提具体字数目标） |
| `validation-lib.mjs` | 无需改动 | `countWords()` 函数保留（供状态记录使用） |
| `reader-response.md` | 所有字数硬约束描述 | 写作风格指导（不含字数要求） |
| `news-digest.md` | 字数下限 1500、`--min-words 1500` 参数 | 其他门控逻辑 |
| `tutorial.md` | 字数下限 1800 的提及 | 其他门控逻辑 |
| `SKILL.md` 主文件 | 核心原则中的字数相关描述 | 其他原则不动 |

## 设计段落 2：Split Decision 机制

### 评估标准

Agent 审视 materials.md，问：用一篇 ljg-writes 文章（1000-1500 字）能把最有价值的信息都传达给读者吗？

判断依据：
- **信息丰富度**：材料是否包含 3 个以上相互独立的、各有深度的主题/论点？
- **价值密度**：每个主题是否都值得独立展开（而非一句话带过）？
- **主题独立性**：拆分后每篇文章是否能独立成立、有自洽的论证链？

### 决策流程

1. 单篇足够 → 继续正常 Step 2
2. 多篇更优 → 向用户提出拆分方案（每篇主题、核心论点、材料覆盖范围、预计发布顺序）
3. 用户确认后 → 为每篇文章创建独立 `posts/{date-slug}/` 目录
4. 每篇文章从 Step 2 开始独立走完整管线（含双轨发布）

### 拆分执行

- 共享调研材料（materials.md）复制到每个目录，各篇只引用相关部分
- 每篇文章独立选择策略（不必与原文相同）
- 每篇文章独立生成 blog-slug、封面、插图
- 拆分文章建议按逻辑关系排列发布顺序，但不强制

### 状态管理

- 每篇文章拥有完全独立的状态文件（`state.json`），与单篇文章管线无差异
- Agent 在拆分决策后编排多篇文章的执行顺序
- 无需新增脚本或修改 state.mjs

## 涉及的文件修改清单

### SKILL.md 主文件
- 移除核心原则中的字数相关描述
- 新增 "Split Decision: 多文章拆分评估" 章节（位于 Step 1 和 Step 2 之间）

### 策略文件
- `references/strategies/reader-response.md`：移除所有字数硬约束，增加 Split Decision 引用
- `references/strategies/news-digest.md`：移除字数下限和 --min-words 参数
- `references/strategies/tutorial.md`：移除字数下限提及

### 管线脚本
- `scripts/step2-write.mjs`：移除 minWords 门控（保留 word_count 状态记录）
- `scripts/step3-polish.mjs`：移除字数弹性门控（保留 word_count 状态记录）
- `scripts/step1-collect.mjs`：修改警告措辞（不提具体字数目标）
- `scripts/validation-lib.mjs`：无改动

### 测试文件
- 移除字数相关的测试断言，保留 frontmatter 等其他断言
---
name: reader-response
description: 深度读后感，以原文为起点展开个人判断和延展思考
applies_when: 用户提供了一篇或多篇原始材料（URL/文件），要求写读后感、深度分析或观点文章
---

# reader-response 策略

## Step 1: 资料收集
行为: full

- 检测输入类型（URL / 文件路径 / 粘贴文本）
- URL 内容获取和联网搜索由 Agent 自行选择合适的工具完成
- 无论输入是否已含原文，都必须额外联网查询背景资料，并在 `materials.md` 中写入 `## 背景调研` 章节：
  - 相关人物、组织或公司的背景
  - 文中提及的重要概念、事件、技术、文化或理念背景
  - 可找到的相关评论、讨论、争议或二手分析
  - 每条背景资料标注来源 URL；无法找到的项要写明"未找到可靠来源"
- 原文插图处理：记录原文中值得保留的插图 URL/本地路径、图注、所在上下文，以及是否建议保留。只保留对理解正文有信息价值的图，不为装饰保留
- 所有资料合并写入 `posts/{date-slug}/materials.md`，每份资料间用 `---` 分隔，标注来源

**脚本验证**：
```bash
bun run .agents/skills/wechat-article-write/scripts/step1-collect.mjs <date-slug> \
  [--sources <成功数> --failed <失败数>]
```
脚本验证 materials.md 存在且非空、含 `## 背景调研` 且该章节至少有一个 URL；低质量检测（字数 < 200 打印警告，非阻塞），写状态。

## Step 2: 文章创作
行为: full

1. 通过 **Skill 工具调用 ljg-writes**，传入：
   - 资料内容：`posts/{date-slug}/materials.md`
   - 数据点列表（从材料中提取，≥ 5 个）
   - 必须包含文末互动 + 原文参考区块
   - 必须采用读后感式原创表达：写出"我为什么觉得这篇材料重要/可疑/反直觉/值得延展"，显式加入自己的判断、连接和疑问；禁止写成单纯翻译、摘要或搬运
   - 必须吸收 Step 1 的 `## 背景调研`：把相关背景自然织入正文，避免背景资料只留在材料文件里
   - **必须规划插图占位符**：在写作时按 SLOT_IMG 编号规则插入语义占位符。**SLOT 00 信息图占位符必须插入**（位置在 frontmatter 之后、正文第一个段落之前），不得跳过。**SLOT_IMG_01 和 SLOT_IMG_02 必须插入**——每篇 1000-1500 字的文章至少需要 2 张文内插图来可视化核心论点。优先覆盖逻辑关系、流程/架构、概念对比、时间线等高信息密度内容
   - **必须做文内插图决策**：保留原文中有信息价值的插图；根据正文内容主动新增插图。新增图覆盖逻辑关系、流程、架构、概念对比、时间线、利益相关方关系等高信息密度内容，不为装饰而加图
   - **必须生成金句式 summary**：在 frontmatter summary 字段写一句 ≤ 120 字的金句式摘要，概括文章核心洞察或最反直觉的结论。不要写平淡内容简介（如"本文介绍了…"），而要写让人想点进来的那句话。summary 是微信草稿箱 digest 字段的唯一来源，publish-wechat.mjs 缺 summary 直接 fail
2. 保存 ljg-writes 输出为 `posts/{date-slug}/draft.md`
3. 运行 `suggest-category.mjs` 获取推荐分类和 blog-slug
4. 信任度低时，Agent 结合标题、summary、materials、正文主题和分类关键词自行裁决分类与 blog-slug，并在过程或最终说明中记录理由；只有 Agent 仍无法判断且当前运行时具备用户确认工具时才询问用户
5. 用 `set-frontmatter.mjs` 写入 category、blogSlug，并确保 sourceUrl 与 blogSlug 一致。sourceUrl 是微信草稿"原文链接"的唯一来源，必须使用固定博客 URL 规则 `https://ntlx.github.io/articles/{blogSlug}`，不要留空或替换为原始素材链接
6. **视觉规划**：写完 draft.md 后，选择文章的内容类型，产出 `posts/{date-slug}/image-plan.json`。读取 `references/image-template-catalog.md` 的"文章类型 → 模板配置"章节选择最匹配的 article_type。脚本会根据 article_type 自动解析风格家族、信息图模板、插图风格和封面参数。

   **image-plan.json 格式**（极简）：
   ```json
   {
     "article_type": "deep-analysis"
   }
   ```

   可选字段：
   - `direction`：覆盖默认风格家族（可选值见 catalog "风格家族"表）。例如 `"direction": "tech"` 让一篇 opinion-essay 使用技术蓝图风格
   - 不指定 direction 时使用 article_type 的默认风格家族（项目偏好 journal / 莫兰迪色调）

   **约束**：
   - `image-plan.json` 缺失时脚本 fallback 到 `deep-analysis` 默认配置（向后兼容）
   - 脚本自动处理：风格家族解析 → 信息图 layout/style → 文内插图 style → 封面 type/palette/rendering → 每张图的 type 从上下文推断

**draft.md 模板**（强制使用语义占位符）：
```markdown
---
title: {标题}
date: {YYYY-MM-DD}
summary: {金句式摘要 ≤ 120 字，概括核心洞察或最反直觉结论，而非内容简介}
category: {6 枚举之一}
blogSlug: {ascii-kebab-case}
coverImage: cover.png
sourceUrl: https://ntlx.github.io/articles/{blogSlug}
---

<!-- SLOT_IMG_00_INFOGRAPHIC -->

{正文，## 二级标题分章节，3-6 个章节}

*{文末互动问题}*

## 原文参考

> {来源信息}
> {原文URL，纯文本形式}
```

**SLOT_IMG 编号规则**：

占位符编号与 imgs/ 文件名前缀一一对应，写作时按规则规划位置：

| 编号 | 含义 | 位置约定 | 文件名示例 |
|------|------|---------|-----------|
| `00` | 信息图（默认生成） | 正文开头 frontmatter 之后 | `00-infographic-core-summary.png` |
| `01` | 第一个核心概念/架构图 | 第一个 H2 章节后 | `01-app-architecture.png` |
| `02` | 第二个关键流程/对比图 | 第二个 H2 章节后 | `02-sensors-overview.png` |
| `03-05` | 补充插图 | 对应章节后 | `03-workflow-steps.png` |

命名格式：`{编号}-{2-3词英文描述}.png`。编号与 `<!-- SLOT_IMG_{编号}_{英文描述} -->` 中的编号必须一致。

**脚本验证**：
```bash
bun run .agents/skills/wechat-article-write/scripts/step2-write.mjs <date-slug>
```
脚本校验：frontmatter 完整（title/date/summary/category/blogSlug/coverImage/sourceUrl）、blogSlug 为 ASCII kebab-case、sourceUrl 与 blogSlug 一致、文末互动存在、无 H1、正文含 `## 原文参考`。materials.md 中的 URL 未在正文引用的打印 warning。任一硬门控不通过 exit 非零。字数由 ljg-writes 自律控制，脚本仅记录不设门控。

## Step 3: 文本后处理
行为: full

1. 通过 **Skill 工具调用 humanizer-zh** 处理 `posts/{date-slug}/draft.md` 正文
2. 通过 **Skill 工具调用 baoyu-format-markdown** 格式化 `posts/{date-slug}/draft.md`

处理范围为正文内容（frontmatter 之后，原文参考之前）。语义占位符 `<!-- SLOT_IMG_ -->` 是 HTML 注释，humanizer-zh 和格式化都不会修改它们。

后处理目标不是"润色得更正式"，而是去掉 AI 生成痕迹：删除空泛排比、机械转折、宣传腔和翻译腔，保留清晰的个人判断、具体细节和自然的中文节奏。不要把第一人称观察和读后感式判断磨平。

**脚本验证**：
```bash
bun run .agents/skills/wechat-article-write/scripts/step3-polish.mjs <date-slug>
```
脚本验证 draft.md 存在、非空，并复验关键质量门控（frontmatter 完整、blogSlug/sourceUrl 一致、无 H1、SLOT_IMG 占位符存在、原文参考存在）。任一不通过 fail。字数由 ljg-writes 自律控制，脚本仅记录不设门控。

若材料丰富度超出单篇承载能力，参考 SKILL.md 的 Split Decision 章节进行多文章拆分。

## 特殊约束
- 必须采用读后感式原创表达，禁止写成翻译和摘要
- 必须包含文末互动问题和原文参考区块
- frontmatter summary 必须是金句式（≤120 字），publish-wechat.mjs 缺 summary 直接 fail
- sourceUrl 必须使用固定规则 `https://ntlx.github.io/articles/{blogSlug}`

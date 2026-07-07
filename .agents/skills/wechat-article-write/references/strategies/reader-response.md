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
- 当原文涉及近期热点、人物/公司/产品/开源项目/模型发布、工具对比、推荐或社区反馈时，调用 `last30days` 作为补充调研，并在 `materials.md` 增加 `## last30days 近期讨论` 小节：
  - 压缩记录调研主题、时间窗口、覆盖来源、关键发现、社区原话、分歧/争议、可用于正文的判断、原始结果文件和参考 URL
  - `last30days` 结果只作为材料证据，不作为文章结构模板；Step 2 写作时吸收其中的真实反馈和争议信号
  - 若 `last30days` 首次运行需要用户授权或登录源不可用，先向用户说明覆盖差异；不要把普通 WebSearch 结果伪装成完整 `last30days` 调研
- 原文插图处理：记录原文中值得保留的插图 URL/本地路径、图注、所在上下文，以及是否建议保留。只保留对理解正文有信息价值的图，不为装饰保留
- 所有资料合并写入 `posts/{date-slug}/materials.md`，每份资料间用 `---` 分隔，标注来源

**脚本验证**：
```bash
bun run .agents/skills/wechat-article-write/scripts/step1-collect.mjs <date-slug> \
  [--sources <成功数> --failed <失败数>]
```
脚本验证 materials.md 存在且非空、含 `## 背景调研` 且该章节至少有一个 URL；低质量检测（字数 < 200 打印警告，非阻塞），写状态。

## Step 1.5: 站内记忆检索
行为: script

```bash
bun run .agents/skills/wechat-article-write/scripts/select-related-articles.mjs <date-slug>
```

写作前必须读取 `posts/{date-slug}/blog-memory.md`。正文自然联动 1-2 篇旧文；文末 `## 延伸阅读` 放 2-4 篇站内旧文。旧文链接在 draft 中使用 Markdown inline link，Step 5 会为博客和微信生成不同链接形态。

## Step 1.8: 理解增强
行为: full

按 `references/material-understanding.md` 执行，生成：

```text
posts/{date-slug}/understanding-brief.md
```

强制调用：

- `ljg-qa`：抽出核心问题链，包含结论、形式化关系、论证步和边界。
- `ljg-think`：对中心论点纵向下钻，产出文章真正要打的一句话。

条件强制调用：

- 主材料是长文、英文或复杂文本：调用 `ljg-read`。
- 文章是领域、趋势、产业或工具链分析：调用 `ljg-rank`。
- 技术或术语密度高：调用 `ljg-plain`。
- 有 1-2 个必须解释的核心概念：调用 `ljg-learn`。
- 输入是论文、arXiv 或研究 PDF：调用 `ljg-paper`；讲论文脉络时调用 `ljg-paper-river`。
- 输入是书或书摘：调用 `ljg-book`。
- 观点争议大或需要压力测试：调用 `ljg-roundtable`。
- 项目、公司或商业模式分析：调用 `ljg-invest`。
- 文章围绕英文词或命名：调用 `ljg-word`。

`understanding-brief.md` 必须包含 `## 写作契约`，写清这篇文章只打一件什么事、必须回答的问题、必须承认的边界、要自然织入的背景资料、可联动旧文和可视觉化节点。Step 2 调用 `ljg-writes` 时，写作契约优先级高于一般材料摘要。

## Step 2: 文章创作
行为: full

1. 通过 **Skill 工具调用 ljg-writes**，传入：
   - **⚠️ 结构与图片预规划（先规划再落笔）**：调用 ljg-writes 之前，先确定文章章节结构（3-6 个 `## ` 章节），再根据内容判断至少 3 个最值得视觉化的位置。每个插图位置明确：(a) 它解释的核心信息，(b) 放在正文的哪个论证节点附近，(c) 视觉内容描述（2-3 个英文关键词，具体到概念/数据/关系，禁止泛化描述如 "illustration" 或 "diagram"）。预规划结果直接体现在 draft.md 的章节标题、正文段落和 SLOT_IMG 占位符描述中
   - 资料内容：`posts/{date-slug}/materials.md`
   - 理解增强：`posts/{date-slug}/understanding-brief.md`，尤其是 `## 写作契约`
   - 数据点列表（从材料中提取，≥ 5 个）
   - 必须包含文末互动 + 参考资料区块
   - 必须采用读后感式原创表达：写出"我为什么觉得这篇材料重要/可疑/反直觉/值得延展"，显式加入自己的判断、连接和疑问；禁止写成单纯翻译、摘要或搬运
   - 必须吸收 Step 1 的 `## 背景调研`：把相关背景自然织入正文，避免背景资料只留在材料文件里
   - 若材料包含 `## last30days 近期讨论`，必须把其中的真实社区反馈、分歧和争议转化为正文论据或判断边界；不要照搬 `last30days` 的标题、footer、邀请语或报告模板
   - 必须吸收 Step 1.5 的 `blog-memory.md`：正文自然联动 1-2 篇旧文，文末 `## 延伸阅读` 放 2-4 篇站内旧文；如确实不适合联动，运行 Step 2 时使用 `--allow-no-related` 并交代理由
   - 必须服从 Step 1.8 的 `understanding-brief.md`：围绕写作契约展开，不把 `ljg-qa` / `ljg-think` / 条件技能输出原样堆进正文
   - **必须规划插图占位符**：在写作时按 SLOT_IMG 编号规则插入语义占位符。**SLOT 00 信息图占位符必须插入**（位置在 frontmatter 之后、正文第一个段落之前），不得跳过。**SLOT_IMG_01+ 文内插图总数必须不少于 3 张**（不含封面图和 SLOT 00 头部信息图），但不要求每个 `## ` 章节都有图。Agent 应根据正文内容把占位符放在最需要视觉解释的位置，可以在 H2 标题后、关键段落后或小结前，关键是靠近其解释的概念/数据/关系。step2/3/4 会校验文内插图总数，step4-images.mjs 会校验占位符与图片文件一一对应。**占位符描述必须是附近正文核心内容的视觉化关键词**（如 `<!-- SLOT_IMG_01_TRUST_DECLINE_CURVE -->` 而非 `<!-- SLOT_IMG_01_CHART -->`），generate-image-prompts.mjs 依赖此描述 + 附近上下文构建图片 prompt
   - **必须做文内插图决策**：保留原文中有信息价值的插图；根据正文内容主动新增插图。新增图覆盖逻辑关系、流程、架构、概念对比、时间线、利益相关方关系等高信息密度内容，不为装饰而加图
   - **必须生成金句式 summary**：在 frontmatter summary 字段写一句 ≤ 120 字的金句式摘要，概括文章核心洞察或最反直觉的结论。不要写平淡内容简介（如"本文介绍了…"），而要写让人想点进来的那句话。summary 是微信草稿箱 digest 字段的唯一来源，publish-wechat.mjs 缺 summary 直接 fail
2. 保存 ljg-writes 输出为 `posts/{date-slug}/draft.md`
3. 运行 `suggest-category.mjs` 获取推荐分类和 blog-slug
4. 信任度低时，Agent 结合标题、summary、materials、正文主题和分类关键词自行裁决分类与 blog-slug，并在过程或最终说明中记录理由；只有 Agent 仍无法判断且当前运行时具备用户确认工具时才询问用户
5. 用 `set-frontmatter.mjs` 写入 category、blogSlug，并确保 sourceUrl 与 blogSlug 一致。sourceUrl 是微信草稿"原文链接"的 canonical 来源，必须使用固定博客 URL 规则 `https://ntlx.github.io/articles/{blogSlug}`，不要留空、手写 UTM 或替换为原始素材链接；Step 6.2 会在传给微信前统一追加 WeChat UTM
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

## {章节一标题}

<!-- SLOT_IMG_01_{该处论证的视觉关键词} -->

{章节一正文段落…}

## {章节二标题}

<!-- SLOT_IMG_02_{该处论证的视觉关键词} -->

{章节二正文段落…}

## {章节三标题}

{章节三正文段落…}

<!-- SLOT_IMG_03_{该处论证的视觉关键词} -->

…（3-6 个章节，至少 3 个根据内容选择的位置放置文内插图）

*{文末互动问题}*

## 参考资料

- [{来源标题}](https://example.com/source)
```

**关键**：文内插图不是每章打卡，而是为需要视觉解释的论证节点服务。写作时至少规划 3 个 SLOT_IMG_01+ 占位符，放在相关正文附近；可紧跟 H2，也可放在关键段落后或小结前。占位符描述必须具体——例如 `<!-- SLOT_IMG_01_TRUST_DECLINE_CURVE -->` 而非 `<!-- SLOT_IMG_01_CHART -->`。generate-image-prompts.mjs 依赖描述词 + 附近上下文构建图片 prompt，描述越具体，生成图与正文内容的匹配度越高。

**SLOT_IMG 编号规则**：

占位符编号与 imgs/ 文件名前缀一一对应，写作时按规则规划位置：

| 编号 | 含义 | 位置约定 | 文件名示例 |
|------|------|---------|-----------|
| `00` | 信息图（默认生成） | 正文开头 frontmatter 之后 | `00-infographic-core-summary.png` |
| `01` | 第一个核心概念/架构图 | 靠近相关论证节点 | `01-app-architecture.png` |
| `02` | 第二个关键流程/对比图 | 靠近相关论证节点 | `02-sensors-overview.png` |
| `03+` | 补充插图（总数至少 3 张） | 靠近相关论证节点 | `03-workflow-steps.png` |

命名格式：`{编号}-{2-3词英文描述}.png`。编号与 `<!-- SLOT_IMG_{编号}_{英文描述} -->` 中的编号必须一致。**描述词必须反映附近正文的核心内容**（概念名/数据趋势/关系类型），禁止使用 `chart`、`diagram`、`illustration` 等泛化词。

**脚本验证**：
```bash
bun run .agents/skills/wechat-article-write/scripts/step2-write.mjs <date-slug>
```
脚本校验：frontmatter 完整（title/date/summary/category/blogSlug/coverImage/sourceUrl）、blogSlug 为 ASCII kebab-case、sourceUrl 与 blogSlug 一致、文末互动存在、无 H1、正文含 `## 参考资料`。materials.md 中的 URL 未在正文引用的打印 warning。任一硬门控不通过 exit 非零。字数由 ljg-writes 自律控制，脚本仅记录不设门控。

## Step 3: 文本后处理
行为: full

1. **⚠️ 强制执行 — 禁止跳过**：通过 **Skill 工具调用 renwei-writing** 处理 `posts/{date-slug}/draft.md` 正文（两层：先按操作规则做减法打磨，再跑事后检查清单逐条扫 AI 痕迹）。这是消除 AI 写作痕迹的唯一防线，不得以任何理由（"质量已足够""时间不够""内容无需调整"）跳过。未调用 renwei-writing = 违反硬规则
2. 通过 **Skill 工具调用 baoyu-format-markdown** 格式化 `posts/{date-slug}/draft.md`

处理范围为正文内容（frontmatter 之后，参考资料之前）。语义占位符 `<!-- SLOT_IMG_ -->` 是 HTML 注释，renwei-writing 和格式化都不会修改它们。

后处理目标不是"润色得更正式"，而是保住作者存在感的同时去掉 AI 痕迹：只做减法，毛边先假设是手迹而非瑕疵；改完跑事后检查清单（破折号、排比三连、意义拔高、宣传腔、万能展望结尾等）逐条验收。不要把第一人称观察和读后感式判断磨平。

**脚本验证**：
```bash
bun run .agents/skills/wechat-article-write/scripts/step3-polish.mjs <date-slug>
```
脚本验证 draft.md 存在、非空，并复验关键质量门控（frontmatter 完整、blogSlug/sourceUrl 一致、无 H1、SLOT_IMG_00 信息图和至少 3 张文内插图占位符存在、参考资料存在）。任一不通过 fail。字数由 ljg-writes 自律控制，脚本仅记录不设门控。

若材料丰富度超出单篇承载能力，参考 `references/pipeline-overview.md` 的多文章拆分说明。

## 特殊约束
- 必须采用读后感式原创表达，禁止写成翻译和摘要
- 必须执行 Step 1.8 理解增强并读取 `understanding-brief.md`
- 必须包含文末互动问题和参考资料区块
- 参考资料区块标准写法为 `- [标题](URL)`；博客轨保留 Markdown 列表链接，微信轨自动展开成标题 + 纯文本 URL
- frontmatter summary 必须是金句式（≤120 字），publish-wechat.mjs 缺 summary 直接 fail
- sourceUrl 必须使用固定规则 `https://ntlx.github.io/articles/{blogSlug}`

---
name: wechat-article-write
description: >
  End-to-end WeChat Official Account article writing and dual publishing (blog + WeChat).
  Takes raw materials (text, URLs, direction) and produces a complete article with cover,
  infographic, illustrations, and publishes to both blog (Astro Starlight) and WeChat
  Official Account drafts. Use when user says "写公众号文章", "公众号推文", "wechat article",
  "wechat-article-write", "公众号", "微信文章", or wants to create, illustrate, format,
  and publish a WeChat Official Account article with mandatory background research,
  reader-response style original writing, and information-dense article illustrations.
  6-stage pipeline: collect → write → polish → images → build → publish. Publishes
  blog first, then WeChat draft.
---

# 微信公众号文章写作

6 步流水线：资料收集 → 文章创作 → 文本后处理 → 图片生成 → 产物构建 → 双轨发布。

**双轨分离**：博客轨消费 Markdown + CDN URL（Astro Starlight 直接构建），微信轨消费本地 HTML + 本地图片（wechat-api.ts 直接读文件上传）。两轨零共享中间产物。

## 核心原则

- **确定性步骤自动化**：Step 5/6 由脚本执行；Step 1-4 由 Agent 完成智能判断后运行脚本门控
- **失败可恢复**：某步失败报告错误并写状态；`state.mjs next <date-slug>` 返回续跑位置
- **脚本化**：所有校验和文件操作封装在 `scripts/` 下。Agent 负责调用脚本 + 解读退出码；禁止内联超过 5 行的 bash/python
- **图片后端固定为 DashScope**：文内插图、信息图和封面必须使用 DashScope（`.baoyu-skills/baoyu-imagine/EXTEND.md` 中 `preferred_image_backend: dashscope`）。为保证中文文字和整体质量，Step 4 失败时只重试 DashScope，**不要自动降级到 Google、Seedream、minimax、openai 或其他后端**
- **图片格式复验**：Step 4 统一检测并修正 MIME/扩展名不匹配，避免历史产物或外部工具输出格式错误
- **封面不使用文字**：封面是视觉锤，文字交给推送卡片
- **分类全自动**：suggest-category.mjs 推荐，低置信度（top-2 分差 < 15%）时询问用户
- **信息图默认生成**：除非用户明确表示不需要，否则每次写作都应生成信息图。SLOT 00 不是可选的——它是文章视觉摘要的默认组件
- **金句摘要硬性必填**：frontmatter `summary` 是微信草稿箱 digest 字段的唯一来源，必须是一句"金句"式摘要（≤120 字），概括文章核心洞察或最反直觉的结论，而非平淡的内容简介。Step 2 写作时必须生成，publish-wechat.mjs 缺 summary 直接 fail
- **原文链接必填**：微信公众号草稿必须把博客文章公网地址作为"原文链接"（`content_source_url`）。博客 URL 规则固定为 `https://ntlx.github.io/articles/{blogSlug}`，Step 2 预先写入 `sourceUrl`，Step 6.2 必须把该值传给微信 API；无需等待 GitHub Pages 探活成功再拼接地址
- **先调研再写作**：Step 1 必须联网查询背景资料，覆盖相关人物、组织/公司、重要概念/事件、技术/文化/理念，以及能找到的评论或讨论。`materials.md` 必须含 `## 背景调研` 章节和可追溯 URL
- **读后感式原创表达**：Step 2 必须写成"我读完材料后的理解、判断和延展"，不是翻译、摘要或搬运。可以引用原文观点，但要交代自己的取舍、疑问和连接，不要使用 AI 腔的泛泛转述
- **插图服务理解**：尽量保留原文有价值插图；新增文内插图只为提高信息密度、帮助理解正文。遇到逻辑关系、流程、对比、架构、概念网络时，优先用 baoyu 系列文生图技能生成图，不要用代码块/ASCII 文本伪装成图
- **图片 prompt 必须从技能模板构建**：baoyu 系列技能（infographic / article-illustrator / cover-image）的 prompt 模板不是"建议"，它们包含针对特定模型的文本渲染指令（文字大小、对比度、防渲染污染、留白策略）和精确色值。跳过模板手写 prompt，即使后端和模型完全正确，文字也会模糊或变形。Step 4 详细规定了每个技能的 prompt 构建流程和必须读取的模板文件

## 配置文件

baoyu 系列技能的配置在项目级 `.baoyu-skills/{skill-name}/EXTEND.md`（git 跟踪），密钥在项目级 `.baoyu-skills/.env`（已被 `.gitignore` 忽略，不进 git）。

**Agent 行为规范**：
- 项目级 EXTEND.md 已存在，直接使用已有偏好，**不要触发首次设置流程**
- 调用 baoyu 系列技能时，确保从项目级 `.baoyu-skills/.env` 读取环境变量（密钥文件已在此目录，无需去用户主目录查找）
- `config-lib.mjs` 在脚本启动时自动读取项目级配置，CLI 参数可覆盖

Skill 脚本查找优先级：项目级 `.agents/skills/` > 用户级 `~/.claude/skills/` > 全局插件。

## 第三方技能本地补丁记录

`baoyu-post-to-wechat` 是通过 `npx skills` 管理的第三方技能，升级后可能覆盖本地改动。当前项目依赖以下本地补丁：

- 基准版本：`baoyu-post-to-wechat` SKILL frontmatter `version: 1.117.5`
- 补丁文件：`.agents/skills/baoyu-post-to-wechat/scripts/wechat-api.ts`
- 补丁内容：支持 CLI 参数 `--source-url`，并在调用微信公众号草稿 API 时写入 `content_source_url`
- 调用方：`scripts/publish-wechat.mjs` 从 `article.md` frontmatter 读取 `sourceUrl`，传给 `wechat-api.ts --source-url`

升级第三方技能后必须复查：

```bash
rg -n "source-url|content_source_url|sourceUrl" \
  .agents/skills/baoyu-post-to-wechat/scripts/wechat-api.ts \
  .agents/skills/wechat-article-write/scripts/publish-wechat.mjs
```

如果微信草稿缺少"原文链接"，或 `publish-wechat.mjs --dry-run` 输出中没有 `--source-url https://ntlx.github.io/articles/{blogSlug}`，优先怀疑 `baoyu-post-to-wechat` 升级覆盖了本地补丁。不要先排查公众号后台或微信 API；先恢复 `--source-url`/`content_source_url` 支持。

## 流水线概览

> 发布顺序：先博客后微信。博客 commit/push 触发 GitHub Pages 部署在前，微信草稿在后。sourceUrl 在 Step 2 写作时按 `https://ntlx.github.io/articles/{blogSlug}` 预先填入，并在 Step 6.2 作为微信公众号"原文链接"传入；读者可能在 push 后 1-3 分钟内遇到 404（Pages 部署通常很快）。

| Step | 动作 | 使用技能 | 产出 | 脚本 |
|------|------|---------|------|------|
| 1 | 资料收集 | （Agent 自选工具） | materials.md | step1-collect.mjs |
| 2 | 文章创作 | ljg-writes, suggest-category.mjs | draft.md（含 category + blogSlug） | step2-write.mjs |
| 3 | 文本后处理 | humanizer-zh, baoyu-format-markdown | draft.md（优化后） | step3-polish.mjs |
| 4 | 图片生成 | baoyu-cover-image, baoyu-article-illustrator, baoyu-infographic | cover.png + imgs/*.png | step4-generate.mjs, step4-images.mjs |
| 5 | 产物构建 | github-image-hosting, baoyu-markdown-to-html | article.md + article-wechat.html | step5-build.mjs |
| 6 | 双轨发布 | publish-blog.mjs, publish-wechat.mjs | 博客文章 + 微信草稿 | publish-blog.mjs, publish-wechat.mjs |

## date-slug 与 blog-slug

**date-slug**（`posts/` 下本地目录名，允许中文）：
1. 取标题前 30 字符 → 移除非 `[a-zA-Z0-9一-龥-]` 字符 → 连续空白转 hyphen → 截首尾 hyphen → 前加 `YYYY-MM-DD-`

**blog-slug**（博客 URL，必须纯 ASCII kebab-case）：
1. 由 `suggest-category.mjs` 根据文章主题自动生成（2-4 个英文关键词）
2. 必须符合 `^[a-z][a-z0-9-]*[a-z0-9]$`
3. 低置信度时与分类一起向用户确认

---

## Step 1: 资料收集

**Agent 动作**：
- 检测输入类型（URL / 文件路径 / 粘贴文本）
- URL 内容获取和联网搜索由 Agent 自行选择合适的工具完成
- 无论输入是否已含原文，都必须额外联网查询背景资料，并在 `materials.md` 中写入 `## 背景调研` 章节：
  - 相关人物、组织或公司的背景
  - 文中提及的重要概念、事件、技术、文化或理念背景
  - 可找到的相关评论、讨论、争议或二手分析
  - 每条背景资料标注来源 URL；无法找到的项要写明"未找到可靠来源"
- 原文插图处理：记录原文中值得保留的插图 URL/本地路径、图注、所在上下文，以及是否建议保留。只保留对理解正文有信息价值的图，不为装饰保留
- 所有资料合并写入 `posts/{date-slug}/materials.md`，每份资料间用 `---` 分隔，标注来源

**脚本**：
```bash
bun run .agents/skills/wechat-article-write/scripts/step1-collect.mjs <date-slug> \
  [--sources <成功数> --failed <失败数>]
```
脚本验证 materials.md 存在且非空、含 `## 背景调研` 且该章节至少有一个 URL；低质量检测（字数 < 200 打印警告，非阻塞），写状态。

---

## Step 2: 文章创作

**Agent 动作**：
1. 通过 **Skill 工具调用 ljg-writes**，传入：
   - 资料内容：`posts/{date-slug}/materials.md`
   - 扩展模式：目标 2000-3500 字（材料丰富则 3500-5000），字数下限 2000 硬门控
   - **必须明确强调字数下限 2000 字**：ljg-writes 自身默认 1000-1500 字，与本管线要求冲突。在 prompt 中使用"字数下限 2000 字，不可低于此数"覆盖 ljg-writes 的默认约束
   - 数据点列表（从材料中提取，≥ 5 个）
   - 必须包含文末互动 + 原文参考区块
   - 必须采用读后感式原创表达：写出"我为什么觉得这篇材料重要/可疑/反直觉/值得延展"，显式加入自己的判断、连接和疑问；禁止写成单纯翻译、摘要或搬运
   - 必须吸收 Step 1 的 `## 背景调研`：把相关背景自然织入正文，避免背景资料只留在材料文件里
   - **同时规划插图占位符位置**：按 SLOT_IMG 编号规则（见下方）在写作时插入语义占位符。**SLOT 00 信息图占位符必须插入**（位置在 frontmatter 之后、正文第一个段落之前），不得跳过
   - **必须做文内插图决策**：尽量保留原文中有信息价值的插图；根据正文内容判断是否新增插图。新增图优先覆盖逻辑关系、流程、架构、概念对比、时间线、利益相关方关系等高信息密度内容，不为装饰而加图
   - **必须生成金句式 summary**：在 frontmatter summary 字段写一句 ≤ 120 字的金句式摘要，概括文章核心洞察或最反直觉的结论。不要写平淡内容简介（如"本文介绍了…"），而要写让人想点进来的那句话。summary 是微信草稿箱 digest 字段的唯一来源，publish-wechat.mjs 缺 summary 直接 fail
2. 保存 ljg-writes 输出为 `posts/{date-slug}/draft.md`
3. 运行 `suggest-category.mjs` 获取推荐分类和 blog-slug
4. 信任度低时用当前运行时的用户确认工具确认分类和 blog-slug；否则自动采纳
5. 用 `set-frontmatter.mjs` 写入 category、blogSlug，并确保 sourceUrl 与 blogSlug 一致。sourceUrl 是微信草稿"原文链接"的唯一来源，必须使用固定博客 URL 规则 `https://ntlx.github.io/articles/{blogSlug}`，不要留空或替换为原始素材链接

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

**脚本**：
```bash
bun run .agents/skills/wechat-article-write/scripts/step2-write.mjs <date-slug> [--allow-no-references]
```
脚本校验：字数 ≥ 2000（不足时提示需补充，并说明 ljg-writes 默认 1000-1500 字需明确指定下限）、frontmatter 完整（title/date/summary/category/blogSlug/coverImage/sourceUrl）、blogSlug 为 ASCII kebab-case、sourceUrl 与 blogSlug 一致、文末互动存在、无 H1、正文含 `## 原文参考`（默认强制，`--allow-no-references` 跳过）。materials.md 中的 URL 未在正文引用的打印 warning。任一硬门控不通过 exit 非零。

---

## Step 3: 文本后处理

**Agent 动作**：
1. 通过 **Skill 工具调用 humanizer-zh** 处理 `posts/{date-slug}/draft.md` 正文
2. 通过 **Skill 工具调用 baoyu-format-markdown** 格式化 `posts/{date-slug}/draft.md`

处理范围为正文内容（frontmatter 之后，原文参考之前）。语义占位符 `<!-- SLOT_IMG_ -->` 是 HTML 注释，humanizer-zh 和格式化都不会修改它们。

后处理目标不是"润色得更正式"，而是去掉 AI 生成痕迹：删除空泛排比、机械转折、宣传腔和翻译腔，保留清晰的个人判断、具体细节和自然的中文节奏。不要把第一人称观察和读后感式判断磨平。

**脚本**：
```bash
bun run .agents/skills/wechat-article-write/scripts/step3-polish.mjs <date-slug>
```
脚本验证 draft.md 存在、非空，并**复验关键质量门控**（frontmatter 完整、blogSlug/sourceUrl 一致、无 H1、SLOT_IMG 占位符存在、字数 ≥ 2000、原文参考存在）。任一不通过 fail。

**字数弹性门控**：humanizer-zh 精简是预期行为。字数 ≥ 1800 但 < 2000 时，脚本打印 WARNING 并通过（输出含 `word_count_warning: true`），Agent 应补充 1-2 段落使字数达到 2000+；字数 < 1800 时 fail（说明文章本身内容不足，需回到 Step 2 补充）。

---

## Step 4: 图片生成

**角色分工**：Agent 负责调用 baoyu 子技能 *走完其完整 prompt 构建流程*，生成符合规范的 prompt 文件；`step4-generate.mjs` 只负责执行批量生成和失败重试。**Agent 不得绕过技能模板手写 prompt**——那会导致文字渲染模糊、排版失控、色值缺失。

### 为什么必须用技能模板

baoyu 系列技能的 prompt 模板（`base-prompt.md`、`prompt-construction.md`、`prompt-template.md`）包含针对特定文生图模型的渲染指令：

| 模板元素 | 所在文件 | 缺失后果 |
|----------|---------|---------|
| `ALL text hand-lettered — no computer fonts` | infographic styles | 文字变形、不可读 |
| `Text should be large and prominent` | article-illustrator prompt-construction | 文字过小、与背景混淆 |
| `Color values are rendering guidance only — do NOT display hex codes as visible text` | article-illustrator prompt-construction | 画面上出现色值标签污染 |
| `Clean composition with generous white space` | article-illustrator prompt-construction | 信息密度过高、阅读困难 |
| 精确 hex 色值（如 `#F5F0E6`, `#E07A5F`） | 各 style 文件 | 颜色偏差、对比度不足 |
| 布局结构定义（ZONES / LEFT-RIGHT / CELLS） | layout 文件 + prompt-construction | 元素位置混乱 |

这些指令是经过模型调优的——不是装饰性描述，是防止文生图模型产生渲染缺陷的**关键约束**。即使后端和模型完全正确（DashScope + qwen-image-2.0-pro），缺失这些指令也会导致文字不清晰。

### 整体流程

```
确认 DashScope 后端
  → 调用 baoyu 子技能（走完整 prompt 构建流程）为每张图生成规范 prompt 文件
  → 编写 batch.json
  → step4-generate.mjs 执行批量生成
  → step4-images.mjs 门控校验
```

### Agent 动作：按图片类型走对应的 prompt 构建流程

#### 信息图（SLOT_IMG_00）：使用 baoyu-infographic 技能模板

1. 读取 `baoyu-infographic` 的以下模板文件（绝对路径）：
   - `.claude/skills/baoyu-infographic/references/base-prompt.md` — prompt 骨架（含 `## Text Requirements`、`## Core Principles`）
   - `.claude/skills/baoyu-infographic/references/layouts/bento-grid.md` — 布局定义
   - `.claude/skills/baoyu-infographic/references/styles/craft-handmade.md` — 风格定义（含色值、typography 规则）

2. 按 `base-prompt.md` 模板填充：
   - `{{LAYOUT}}` → bento-grid
   - `{{STYLE}}` → craft-handmade
   - `{{LAYOUT_GUIDELINES}}` → 从 `layouts/bento-grid.md` 复制完整的 Structure + Visual Elements + Text Placement 段落
   - `{{STYLE_GUIDELINES}}` → 从 `styles/craft-handmade.md` 复制完整的 Color Palette + Visual Elements + Typography + Style Enforcement 段落
   - `{{CONTENT}}` → 从 draft.md 提取核心数据点组织为 Bento Grid Card 描述
   - `{{TEXT_LABELS}}` → 短标签列表（关键词/数字，不是完整句子）

3. 保存到 `imgs/prompts/00-infographic-core-summary.md`

#### 文内插图（SLOT_IMG_01-05）：使用 baoyu-article-illustrator 技能模板

1. 读取 `.claude/skills/baoyu-article-illustrator/references/prompt-construction.md`（绝对路径）

2. 为每张图选择匹配的 **type 模板**：
   - 对比类内容 → `Comparison` 模板
   - 流程/架构类 → `Framework` 或 `Flowchart` 模板
   - 数据/曲线类 → `Infographic` 模板（article-illustrator 版本）

3. 每个 prompt 文件必须包含以下段落（从 `prompt-construction.md` 复制，不修改）：
   - `## Default Composition Requirements` 段落的渲染指令：
     ```
     Clean composition with generous white space. Simple or no background. Main elements centered or positioned by content needs.
     ```
   - `## Text in Illustrations` 段落的文字指令：
     ```
     Text should be large and prominent with handwritten-style fonts. Keep minimal, focus on keywords.
     ```
   - `## Color Specification Rules` 段落的防污染指令：
     ```
     Color values (#hex) and color names are rendering guidance only — do NOT display color names, hex codes, or palette labels as visible text in the image.
     ```
   - 有人物时加上 `## Character Rendering` 指令

4. 色彩使用 `vector-illustration` 风格的精确 hex 色值（从 `references/styles/vector-illustration.md` 读取），不可自编色值

5. 保存到 `imgs/prompts/{编号}-{描述}.md`，严格使用 YAML frontmatter + 内容格式（见 `prompt-construction.md` 的 Prompt File Format）

#### 封面（cover.png）：使用 baoyu-cover-image 技能模板

1. 封面不使用文字（`--text none`）
2. 读取 `.claude/skills/baoyu-cover-image/references/workflow/prompt-template.md`（绝对路径）
3. 按模板创建 `imgs/prompts/00-cover-{slug}.md`
4. 风格参数：type=conceptual, palette=cool, rendering=flat-vector, mood=bold

#### 编写 batch.json

所有 prompt 文件创建完毕后，编写 `imgs/batch.json`（baoyu-imagine batch 格式）：
```json
{
  "jobs": 2,
  "tasks": [
    {
      "id": "唯一标识",
      "image": "相对 imgs/ 的路径（cover 用 ../cover.png）",
      "promptFiles": ["prompts/相对 imgs/ 的路径"],
      "ar": "16:9",
      "provider": "dashscope"
    }
  ]
}
```

#### Prompt 质量检查清单（运行 step4-generate.mjs 前必须逐项确认）

- [ ] 每个 prompt 文件包含 `## Text Requirements` 或等价的文字渲染指令（large, prominent, readable）
- [ ] 每个 prompt 文件包含防渲染污染指令（不显示 hex 色值/色名）
- [ ] 每个 prompt 文件包含干净构图指令（clean composition, white space）
- [ ] 每个 prompt 文件使用精确 hex 色值，而非模糊颜色名
- [ ] 信息图 prompt 包含完整的 `## Layout Guidelines` 和 `## Style Guidelines` 段落
- [ ] 文内插图 prompt 的 YAML frontmatter 包含 `illustration_id`, `type`, `style` 字段
- [ ] batch.json 中每个 task 的 `provider` 为 `"dashscope"`
- [ ] batch.json 中 `jobs` ≤ 3（DashScope 限流，jobs 过高会触发 429）

#### 执行生成

```bash
bun run .agents/skills/wechat-article-write/scripts/step4-generate.mjs <date-slug> [--jobs N]
```

脚本读取 `imgs/batch.json` → 跳过已有图片 → 强制把待生成任务 provider 设为 DashScope → 调用 baoyu-imagine batch → 失败项逐个用 DashScope 重试。退出码：0 全部成功，4 部分失败。失败只重试 DashScope，不做后端降级。

**注意**：DashScope QPS 有限，`--jobs` 建议 2，最多 3。遇到 429 限流时，`step4-generate.mjs` 会自动进行单任务重试；如果仍然失败，等待 2-3 分钟后重跑脚本（已成功的图片会被跳过）。

#### 门控脚本

```bash
bun run .agents/skills/wechat-article-write/scripts/step4-images.mjs <date-slug>
```

脚本执行：缺 draft.md/cover 直接 fail → 统一格式检测修正（MIME/扩展名不匹配）→ 更新 coverImage 扩展名 → **SLOT-only 强制校验**（draft 中不得含 `![](imgs/...)` 本地引用）→ SLOT_IMG 与 imgs/ 文件一一对应校验 → 信息图位置约束（`SLOT_IMG_00_INFOGRAPHIC` 须在正文前 200 字符内）。全部通过写状态。

| 技能 | 产出 | 必须读取的模板文件 |
|------|------|------------------|
| baoyu-infographic | `imgs/00-infographic-core-summary.png` | `base-prompt.md` + `layouts/bento-grid.md` + `styles/craft-handmade.md` |
| baoyu-article-illustrator | `imgs/01-*.png, 02-*.png, ...` | `prompt-construction.md` + `styles/vector-illustration.md` |
| baoyu-cover-image | `cover.png` | `workflow/prompt-template.md` |

---

## Step 5: 产物构建

**脚本**（一键完成，无需 agent 干预）：
```bash
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs <date-slug> \
  [--theme default] [--color blue] [--dry-run] [--reuse-image-map]
```
脚本执行：
1. 预检 `draft.md`、`cover.png|cover.jpg`、`imgs/*`、blogSlug、SLOT 与图片映射完整性
2. 上传 `imgs/*` 到 GitHub 图床 → image-map.json（图片命名前缀使用 `YYYY-MM-DD-{blogSlug}-img`）
3. 将 draft.md 占位符替换为 CDN URL → article.md
4. 将 draft.md 占位符替换为本地路径（内存中） → 调用 baoyu-markdown-to-html → article-wechat.html
5. 验证: article.md 无占位符残留、无本地路径；article-wechat.html 非空、含 inline CSS、无 SLOT 残留、无空 img src
6. img 标签规范化：给 `<img src=` 注入 `data-img` 前缀属性（`<img data-img src=`），确保第三方发布脚本的 `\ssrc` regex 能匹配到 src 前的空白
7. 写状态

辅助模式：
- `--dry-run`：只做预检和依赖检查，不上传、不写 `image-map.json`、不生成 `article.md/article-wechat.html`、不写状态
- `--reuse-image-map`：复用已有 `image-map.json`，跳过图床上传。**使用场景**：`image-map.json` 已存在且 Step 4 以来没有新增/修改图片（如 HTML 转换失败后重跑、只修复正文后重建产物）。会校验 map 中每张被引用图片都有有效 URL；缺失或格式错误直接 fail，避免生成半成品

若 `imgs/` 中已有图片，但 draft.md 没有任何 `SLOT_IMG` 或本地图片引用，Step 5 直接 fail；这通常意味着占位符在前序步骤被误删。

---

## Step 6: 双轨发布

**发布顺序**：先博客后微信。

### 6.1 博客发布

```bash
bun run .agents/skills/wechat-article-write/scripts/publish-blog.mjs \
  --post-dir posts/{date-slug}
```

脚本职责：读取 frontmatter.blogSlug（CLI `--blog-slug` 可覆盖）→ 校验 sourceUrl 与 blogSlug 一致 → frontmatter 转换（summary→description, +$schema, 删除管线字段）→ 分支检查（非 main 拒绝）→ 目标文件防覆盖检查 → astro sync + build → git add + commit + push。`--no-push` 或 push 失败会标记博客状态为 blocked。

额外选项：`--blog-slug`（覆盖 frontmatter.blogSlug）、`--overwrite`（允许覆盖已有文章）、`--allow-non-main`（允许在非 main 分支发布）、`--auto-rebase`（push 失败时自动尝试 `git pull --rebase origin main` 再 push，最多 1 次重试）、`--no-push`（只写本地文件，状态为 blocked）、`--dry-run`。

### 6.2 微信发布（API only）

```bash
bun run .agents/skills/wechat-article-write/scripts/publish-wechat.mjs \
  --post-dir posts/{date-slug}
```

脚本职责：pre-flight（cover + article-wechat.html + sourceUrl + **summary**）→ 从 article.md 读取 title/summary/sourceUrl → **summary 缺失直接 fail**（微信草稿箱 digest 必填，空摘要等于推文卡片没文字）→ 将 sourceUrl 作为微信"原文链接"（`content_source_url`）传给 `wechat-api.ts` → 自动安装 baoyu-post-to-wechat 依赖（node_modules 缺失时 `bun install`）→ 调用 `wechat-api.ts` 通过微信官方 API 发布草稿 → 写状态。

只走 API 方式，不使用 CDP/browser。API 方式速度快、确定性强，需要 `.baoyu-skills/.env` 中配置好 `WECHAT_APP_ID` 和 `WECHAT_APP_SECRET`，且本机 IP 在微信公众号后台 IP 白名单中。

### 最小编排器

```bash
# 只查看当前状态和下一步，不执行文件写入、发布或网络操作
bun run .agents/skills/wechat-article-write/scripts/pipeline.mjs <date-slug>

# 自动执行当前可执行的确定性步骤（Step 5/6）
bun run .agents/skills/wechat-article-write/scripts/pipeline.mjs <date-slug> --auto
```

Step 1-4 始终需要 Agent 完成智能判断和产物生成后，再由对应脚本做门控。`pipeline.mjs` 不会替 Agent 收集资料、写作、润色或生成图片。

---

## 失败处理

任何步骤失败时：
1. 报告哪一步失败、错误原因
2. 图片生成失败时只允许用 DashScope 重试；不要为了通过流程降级到其他后端。DashScope 仍失败时报告失败项，等待用户决定是否调整 prompt、降低并发或稍后重试
3. 图床上传失败：修复后重跑 Step 5；若 `image-map.json` 已完整，用 `--reuse-image-map` 跳过上传
4. 依赖缺失：`publish-wechat.mjs` 和 `step5-build.mjs` 会自动 `bun install`；若自动安装失败则手动安装
5. `state.mjs next <date-slug>` 返回下一个待执行步骤，全部完成返回 `done`
6. Step 6 博客/微信子状态独立查询：`state.mjs blog/wechat <slug> get`

## 已知约束

- **正文禁止 H1**：Starlight 自动渲染 title 为 H1，正文 `# ` 会双标题
- **图片必须 CDN URL**：博客文章中 `imgs/...` 本地路径会导致 Astro 构建失败
- **GitHub 上传禁止中文 name**：`--name` 使用纯 ASCII slug
- **macOS sed** 不支持 `;` 分隔多替换，用 `-e` 逐个指定
- **CWD 敏感**：Edit 工具用绝对路径，脚本调用前确保在项目根目录
- **DashScope QPS 限流**：`qwen-image-2.0-pro` 并发上限低，`--jobs` 建议 2（最多 3）。batch 阶段触发 429 后，`step4-generate.mjs` 会自动逐个重试；若单任务重试仍失败，等待 2-3 分钟后重跑脚本（已成功的图会被跳过，不必删图重来）
- **封面不嵌入文字**：封面是视觉锤，文字交给推送卡片和正文标题。封面 prompt 中不要包含标题文本

## 图片后端策略

| 后端 | 优势 | 劣势 | 适用 |
|------|------|------|------|
| DashScope | 中文文本渲染最佳，信息图和文章配图质量最稳定 | 审核较严，可能限流或失败 | 唯一允许后端：封面、信息图、文内插图 |

禁止降级链。DashScope 失败时，调整 prompt、降低并发或稍后重试；不要换用 Google/Seedream 等后端生成最终图。

## 工具索引

### 核心脚本
| 脚本 | 用途 |
|------|------|
| `scripts/step1-collect.mjs` | Step 1: 资料验证 + 状态 |
| `scripts/step2-write.mjs` | Step 2: 质量门控 + 状态 |
| `scripts/step3-polish.mjs` | Step 3: 后处理验证 + 状态 |
| `scripts/step4-generate.mjs` | Step 4: batch 生成编排 + 失败重试 |
| `scripts/step4-images.mjs` | Step 4: 格式修正 + 引用验证 + 状态 |
| `scripts/step5-build.mjs` | Step 5: CDN + 占位符替换 + HTML 转换 + 状态 |
| `scripts/publish-blog.mjs` | Step 6.1: 博客发布编排 |
| `scripts/publish-wechat.mjs` | Step 6.2: 微信草稿编排 |
| `scripts/state.mjs` | 状态 CLI（init/get/next/done/fail/blog/wechat/dump；blog/wechat 支持 get 查询子状态；所有子命令均支持 `--slug <date-slug>` 标志或位置参数） |
| `scripts/config-lib.mjs` | 配置解析（从 baoyu EXTEND.md 读取 theme/color/author 等） |
| `scripts/state-lib.mjs` | 状态读写库（含 Step 6 博客/微信子状态） |
| `scripts/path-resolver.mjs` | 路径解析（内部模块） |
| `scripts/suggest-category.mjs` | 分类 + blog-slug 推荐 |
| `scripts/set-frontmatter.mjs` | Frontmatter 读写 |
| `scripts/normalize-image-formats.mjs` | MIME 检测 + 扩展名修正 |
| `scripts/apply-image-map.mjs` | 占位符 → CDN URL / 本地路径 |
| `scripts/pipeline.mjs` | 最小编排器：默认报告状态，`--auto` 执行确定性步骤（Step 5 + Step 6） |

### 参考文档
| 文件 | 内容 |
|------|------|
| `references/category-keywords.json` | 6 分类关键词/反关键词（suggest-category.mjs 数据源） |
| `references/image-backends.md` | 各图片后端构图特性与 prompt 策略 |

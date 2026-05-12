---
name: wechat-article-write
description: >
  End-to-end WeChat Official Account article writing skill. Takes raw materials
  (text, URLs, direction) and produces a complete article: title, summary, body,
  cover image, illustrations, CDN-hosted images, WeChat-compatible HTML, and
  drafts to the Official Account. Use when user says "写公众号文章", "公众号推文",
  "wechat article", "wechat-article-write", "公众号", "微信文章", or wants to
  create, illustrate, format, and publish a WeChat Official Account article.
  Automatically orchestrates baoyu-*, ljg-*, github-image-hosting, humanizer-zh,
  and web-access skills in a 13-step pipeline (Steps 0-11, with Step 4.5 for infographic generation).
user_invocable: true
---

# 微信公众号文章写作

全自动流水线：用户给资料（文本/URL/方向）→ 自动完成 11 步（含信息图生成）→ 最终审核 → 发布公众号草稿。

## 核心原则

- **全自动执行**：中间步骤不停顿，全部完成后展示结果
- **失败不阻塞**：某步失败报告错误并询问是否继续
- **封面不上传图床**：封面直接用于公众号素材库
- **内联插图走 CDN**：文章中的插图上传 GitHub 图床获取 CDN URL
- **date-slug 必须安全**：从文章标题生成的 slug 必须是合法目录名
- **图片后端优先级**：Gemini > Seedream > DashScope。Gemini 稳定可用但 16:9 下构图居中；Seedream 中文友好且审核较宽松；DashScope 中文文本渲染最佳但内容审核最严（安全类术语易触发 DataInspectionFailed）。当某个后端失败时，按此顺序自动降级
- **Gemini 格式陷阱**：Gemini 后端（gemini-3.1-flash-image-preview）返回 JPEG 内容但保存为 `.png` 扩展名，**每次都发生**。所有图片生成步骤完成后，必须统一执行格式检测修正（`file` 命令检测 → 重命名扩展名 → 更新 draft.md 引用）。不要依赖下游脚本兜底——源头修正成本最低
- **封面文字约束**：封面图优先不使用文字（纯视觉表达）。若确需文字辅助，封面文字必须与文章标题完全不同——标题已出现在推送卡片中，封面再重复一遍浪费视觉空间。读者在推送卡片中看到标题，点进来再看到封面重复同样文字，双重曝光毫无增量信息
- **baoyu 配置路径分层**：baoyu 系列技能的配置文件按类型分层存放。**EXTEND.md（偏好配置）推荐项目级** `.baoyu-skills/{skill-name}/EXTEND.md`，纳入 git 跟踪，确保偏好可追溯、跨设备同步。**.env（密钥）必须用户级** `~/.baoyu-skills/.env`，不进 git，防止泄露。技能加载时项目级 EXTEND.md 优先于用户级（三级优先级：项目级 > XDG > 用户级）
- **联网操作唯一入口 web-access**：流水线中**所有需要联网的操作**（URL 内容获取、联网搜索、背景资料查询、作者/公司背景调研等）**只能通过 web-access 技能完成**。禁止使用任何 MCP 搜索工具、WebFetch、WebParser 或其他网络工具。web-access 通过 CDP 浏览器直连用户 Chrome，天然携带登录态，能处理动态渲染和反爬拦截。搜索时**始终访问 google.com/ncr** 作为搜索引擎。

## 配置文件路径约定

### 配置路径分层约定

baoyu 系列技能的配置按类型分层存放，EXTEND.md 和 .env 有不同的安全需求：

| 配置类型 | 推荐路径 | 原因 |
|---------|---------|------|
| EXTEND.md（偏好） | **项目级** `.baoyu-skills/{skill-name}/EXTEND.md` | 纳入 git，可追溯、可同步 |
| .env（密钥） | **用户级** `~/.baoyu-skills/.env` | 不进 git，防止泄露 |

**路径优先级**（技能加载时）：项目级 > XDG > 用户级。项目级 EXTEND.md 存在时优先使用。

**Agent 执行约束**：
- 读取 EXTEND.md 时：优先检查项目级 `.baoyu-skills/{skill-name}/EXTEND.md`，不存在则回退到用户级
- 读取 .env 时：始终从 `~/.baoyu-skills/.env` 读取，不检查项目级
- 创建 EXTEND.md 时：默认创建到项目级 `.baoyu-skills/{skill-name}/`

### EXTEND.md（技能运行时配置）

baoyu 系列技能的 EXTEND.md 推荐放在项目级 `.baoyu-skills` 文件夹，纳入 git 跟踪：

```
.baoyu-skills/{skill-name}/EXTEND.md    # 项目级（推荐，git 跟踪）
~/.baoyu-skills/{skill-name}/EXTEND.md  # 用户级（回退）
```

例如：
- `.baoyu-skills/baoyu-cover-image/EXTEND.md`
- `.baoyu-skills/baoyu-article-illustrator/EXTEND.md`
- `.baoyu-skills/baoyu-post-to-wechat/EXTEND.md`

技能加载时项目级优先。如项目级不存在，回退到用户级。

### .env（环境变量）

baoyu 系列技能使用的 `.env` 文件位于：

```
~/.baoyu-skills/.env
```

### Skill 脚本路径查找规则

技能分为两种调用方式，执行前必须确认调用方式：

| 调用方式 | 适用技能 | 执行方式 |
|---------|---------|---------|
| **Skill 工具调用** | baoyu-cover-image、ljg-writes、humanizer-zh、baoyu-article-illustrator、baoyu-infographic | 通过 Skill 工具加载 SKILL.md，agent 按其流程执行 |
| **脚本执行** | baoyu-url-to-markdown、github-image-hosting、baoyu-imagine、baoyu-format-markdown、baoyu-markdown-to-html、baoyu-post-to-wechat | 查找 `{skillDir}/scripts/` 目录下的脚本文件 |

**脚本型技能的路径查找**（仅脚本执行型技能适用）：

1. **项目级安装**：`.agents/skills/{skill-name}/scripts/`
2. **用户级安装**：`~/.claude/skills/{skill-name}/scripts/`
3. **全局插件**：`~/.claude/plugins/cache/claude-plugins-official/{plugin-name}/skills/{skill-name}/scripts/`

执行脚本时，按优先级依次检查目录是否存在，使用最先找到的路径。如果三级路径均不存在，报告错误并中断该步骤。

**脚本执行方式**：找到路径后，按 Step 0.3 的规则决定用 `bun run` 还是直接执行。

**示例**：查找 `baoyu-markdown-to-html` 的脚本路径（脚本执行型）：
```
检查 .agents/skills/baoyu-markdown-to-html/scripts/ → 不存在
检查 ~/.claude/skills/baoyu-markdown-to-html/scripts/ → 不存在
检查全局插件路径 → 不存在，报告错误
```

**示例**：调用 `baoyu-cover-image`（Skill 工具调用型）：
```
通过 Skill 工具调用 baoyu-cover-image → 加载 SKILL.md → 按 Step 0-5 流程执行 → 最终委托图片后端生成
```

## 前置依赖检查 ⛔ BLOCKING

**硬门控**：Step 0 必须在所有后续步骤之前完成。如果 Step 0 未执行或检查未通过，后续步骤一律不得启动。

执行流水线前执行 **Step 0**（依赖预检与安装），该步骤会自动：
1. 检查各技能是否已安装（通过 Skill 工具或脚本路径验证）
2. 检查各技能的 `scripts/node_modules` 是否存在
3. 对缺失的依赖自动执行 `bun install`
4. 检测脚本类型（TypeScript vs Bash），确保正确的执行方式

如果关键技能缺失，列出缺失项并询问用户是否继续（部分步骤可能无法执行）。

具体检查项和执行规则见 **Step 0**。

## 流水线概览

| Step | 动作 | 使用技能 | 产出 | 门控 |
|------|------|---------|------|------|
| 0 | 依赖预检 | 自动检查 + bun install | 就绪环境 | ⛔ |
| 1 | 资料收集 | web-access CDP → baoyu-url-to-markdown → 手动 | materials.md | |
| 2 | 文章创作 | ljg-writes（Skill 工具调用，不允许手动替代） | draft.md | |
| 2.4.1 | 质量门控 | 自动检查字数/互动/引用/数据点 | draft.md（验证通过） | ⛔ |
| **3+4.5** | **封面图 + 信息图（并行）** | Agent 并行：baoyu-cover-image ∥ baoyu-infographic | cover.png + imgs/00-infographic*.png | ⛔ |
| **4** | **插图生成（可与 3+4.5 并行）** | Agent：baoyu-article-illustrator | imgs/01-04*.png | |
| 5 | 图片上传图床 | github-image-hosting（含格式检测修正） | image-map.json | |
| 5.6 | CDN 传播等待 | sleep 30 | — | |
| 6 | Markdown 整合 | 自动替换 CDN 地址 | article.md | |
| 7 | 去 AI 痕迹 | humanizer-zh（**必须执行，不可跳过**） | article.md（优化后） | ⛔ |
| 8 | Markdown 格式化 | baoyu-format-markdown | article.md（排版后） | |
| 9 | HTML 转换 | baoyu-markdown-to-html | article.html | |
| 10 | 发布到草稿 | baoyu-post-to-wechat | 公众号草稿 | |

### 并行执行策略

Step 3（封面图）、Step 4（插图）、Step 4.5（信息图）三者之间没有依赖关系，**必须通过 Agent 工具并行执行**以节省时间。具体做法：

```
在同一个消息中发起三个 Agent 调用：
1. Agent A：调用 baoyu-cover-image 生成封面 → posts/{date-slug}/cover.png
2. Agent B：调用 baoyu-infographic 生成信息图 → posts/{date-slug}/imgs/00-infographic-core-summary.png
3. Agent C：调用 baoyu-article-illustrator 生成插图 → posts/{date-slug}/imgs/01-*.png, 02-*.png, ...
```

三个 Agent 均设置 `run_in_background: true`，等待全部完成后再进入 Step 5。不要串行执行这三个步骤——串行会多浪费 5-10 分钟。

**为什么必须并行**：图片生成是流水线中最耗时的步骤（每张 1-3 分钟），串行执行封面+信息图+4张插图需要 10-20 分钟，并行只需 3-5 分钟（取决于最慢的那张）。

## User Input Tools

当需要向用户提问时，按优先级使用：

1. **内置用户输入工具**（如 `AskUserQuestion`）
2. **Fallback**：无内置工具时用编号纯文本让用户回复
3. **批量提问**：支持多问题的提问工具一次提完，不支持则逐个

## date-slug 生成规则

从文章标题生成安全的目录名：

1. 取标题前 30 个字符（中英文均可）
2. 移除所有非 `[a-zA-Z0-9一-龥-]` 字符（保留中文、英文、数字、hyphen）
3. 连续空白字符转为单个 hyphen
4. 截断首尾的 hyphen
5. 如果结果为空或仅 hyphen，使用 `YYYY-MM-DD-article` 作为 fallback

**示例**：
- 标题：「深入理解 React Hooks 的设计哲学」
- slug：`2026-04-30-深入理解ReactHooks的设计哲学`

## Step 0: 依赖预检与安装 ⛔ BLOCKING

**硬门控**：Step 0 是流水线的第一个步骤，必须完成后才能进入 Step 1。不得跳过、不得延后。

在执行任何流水线步骤前，确保所有技能的 npm 依赖已安装。

### 0.1 检查依赖

对以下技能的 `scripts/` 目录依次检查：

| 技能 | 检查路径 | 检查条件 |
|-----|---------|---------|
| baoyu-url-to-markdown | `{skillDir}/scripts/node_modules` 存在 | 且 `scripts/lib/cli.ts` 存在 |
| github-image-hosting | `{skillDir}/scripts/node_modules` 存在 | 且 `scripts/upload.ts` 存在 |
| baoyu-format-markdown | `{skillDir}/scripts/node_modules` 存在 | 且 `scripts/main.ts` 存在 |
| baoyu-markdown-to-html | `{skillDir}/scripts/node_modules` 存在 | 且 `scripts/main.ts` 存在 |
| baoyu-post-to-wechat | `{skillDir}/scripts/node_modules` 存在 | 且 `scripts/wechat-api.ts` 存在 |
| baoyu-infographic | 通过 Skill 工具验证（与 baoyu-cover-image 同类） | Skill 工具调用可加载即可 |

`{skillDir}` 按"技能脚本路径查找规则"解析（项目级 > 用户级 > 全局插件）。

### 0.2 自动安装

对任何 `node_modules` 不存在的技能，执行：

```bash
bun install --cwd {skillDir}/scripts
```

静默执行，不询问用户。仅在安装失败时报告错误并询问是否继续流水线。

### 0.3 脚本类型检测

对每个技能的入口脚本，检测执行方式：

| 脚本类型 | 检测方式 | 执行命令 |
|---------|---------|---------|
| TypeScript (.ts) | 文件扩展名为 `.ts` | `bun run {script}` |
| Bash (.sh) | 文件扩展名为 `.sh` | `bash {script}` 或直接 `./{script}` |
| Bash (无扩展名) | 无扩展名且首行含 `#!/bin/bash` 或 `#!/usr/bin/env bash` | 直接执行 `{script}`（不要用 `bun run`） |

**关键**：baoyu-url-to-markdown 的 `baoyu-fetch` 是无扩展名的 bash 脚本，必须直接执行，不能用 `bun run`。

### 0.4 完成报告

```
依赖预检完成！
- 已安装依赖：[列出本次安装的技能]
- 已就绪：[列出已存在依赖的技能]
- 失败：[如有]
```

## Step 1: 资料收集（三级降级）

输入：用户提供的 URL、文本文件或直接粘贴的文本。

### 1.1 检测输入类型

| 输入类型 | 检测方式 | 处理 |
|---------|---------|------|
| URL 链接 | 以 `http://` 或 `https://` 开头 | 进入 1.2 |
| 文件路径 | 文件存在且可读 | 读取文件内容 |
| 粘贴文本 | 非 URL 非文件 | 直接使用 |
| 需搜索的信息 | 无明确 URL，需要联网查找 | 进入 1.3 |

### 1.2 URL 内容获取（三级降级）

对每个 URL **严格按顺序**尝试，不得跳级或混用其他工具：

**第一级：web-access CDP**

使用 web-access 技能的 CDP 浏览器方案。CDP 直连用户日常 Chrome，天然携带登录态，能处理大多数需要登录的站点、动态渲染页面和反爬拦截。

- 执行前置检查：`node "{web-access-skill-dir}/scripts/check-deps.mjs"`，确认 CDP 可用
- 在后台 tab 打开目标 URL，用 `/eval` 提取页面内容，整理为 Markdown
- 成功 → 进入下一步
- 失败（Chrome 未开启调试端口、CDP 代理启动失败） → 进入第二级
- 如果页面需要登录且当前未登录 → **暂停，告知用户**：「页面需要登录，请在 Chrome 中登录 {网站名}，完成后告诉我继续。」登录完成后直接刷新页面继续，无需重启任何组件

**为什么 CDP 优先**：用户日常 Chrome 天然携带登录态，遇到需要登录的页面可以暂停让用户手动登录后继续。这比无登录态的抓取工具多了一层容错能力。即使登录失败，也不会死循环——停下来让用户帮忙即可。

**第二级：baoyu-url-to-markdown**
- 使用 baoyu-url-to-markdown 技能抓取网页
- **注意**：baoyu-fetch 是 bash 脚本（无扩展名），必须直接执行 `{skillDir}/scripts/baoyu-fetch`，不能用 `bun run`
- 成功 → 得到 Markdown 内容，进入下一步
- 失败（抓取超时、页面结构不支持、返回空内容） → 进入第三级
- **不要重试同一工具**

**第三级：用户手动提供**
- 报告失败的 URL，询问用户是否能手动提供内容
- 用户提供了 → 使用
- 用户无法提供 → 跳过该 URL，记录日志，继续处理其他资料

### 1.3 联网搜索

当需要搜索信息（无明确 URL，需要先发现来源）时：

**唯一方式：web-access CDP 搜索 google.com/ncr**：
- 通过 web-access 技能在浏览器中打开 **google.com/ncr**（Google 无重定向版，强制返回全球搜索结果）
- CDP 方式继承用户 Chrome 的 Google 登录态，搜索结果更完整，且不会被搜索引擎反爬拦截
- 搜索结果页面中的链接可直接在浏览器中打开获取全文

**为什么必须用 google.com/ncr**：`/ncr` 强制 Google 不根据国家 IP 重定向到本地版本（如 google.com.hk、google.co.jp），确保搜索结果的全球覆盖和一致性。

### 1.4 资料合并

所有成功获取的资料合并为一个 Markdown 文件，保存到工作目录：

```bash
mkdir -p posts/{date-slug}/
```

合并规则：
- 每份资料之间用 `---` 分隔
- 在分隔线上方标注来源（URL 或文件名）
- 保存为 `posts/{date-slug}/materials.md`

### 1.5 完成报告

```
资料收集完成！
- 成功获取 X/N 份资料
- 来源：[列出 URL 或文件名]
- 失败：[列出失败的 URL，如有]
- 保存位置：posts/{date-slug}/materials.md
```

## Step 2: 文章创作

**必须通过 Skill 工具调用 ljg-writes 技能完成写作。** 不允许 agent 手动写作替代——ljg-writes 的完整流程（观点→切→磨）是流水线质量控制的起点，跳过它意味着 Step 7 的去 AI 痕迹判断逻辑失效。

### 2.1 准备工作

- 读取 `posts/{date-slug}/materials.md`
- 理解用户指定的文章主题/方向（如有）
- 确定写作风格偏好（如有，否则使用默认）

### 2.2 调用 ljg-writes

通过 Skill 工具调用 ljg-writes，传入以下信息：
- 资料内容：`posts/{date-slug}/materials.md`
- 写作方向/主题：用户指定的方向（如有）
- 风格偏好：用户指定的偏好（如有，否则使用 ljg-writes 默认）

ljg-writes Skill 会自行完成完整的写作流程（观点→切→磨），无需在本技能中重复描述方法论。

### 2.2.1 扩展模式判断

ljg-writes 内部硬约束为 1000-1500 字且「一篇只说一个点」。当材料丰富时，这个约束会导致文章篇幅不足、缺乏章节结构。wechat-article-write 作为调度层负责判断是否需要扩展，并通过传参覆盖 ljg-writes 的默认约束。

**启用扩展模式的条件**（满足任一即可）：
- 原始材料超过 3000 字
- 材料涵盖 3 个以上独立论点/主题
- 用户明确要求长文或章节结构

**扩展模式传参**：在调用 ljg-writes 的 Skill 参数中追加以下指令（**必须包含数据点列表**，不能只给笼统描述）：
```
扩展模式：材料丰富，目标 2500-3500 字。允许分章节深入展开多个论点。每个论点用「切」方法独立深挖，但共享同一个核心观点。覆盖 ljg-writes 的 1000-1500 字约束和「一篇只说一个点」限制——不是多个点浅层罗列，而是多个论点围绕同一核心各自切到底。

必须覆盖的关键数据点（从调研材料中提取，至少覆盖 5 个）：
- [数据点 1：具体数字/案例]
- [数据点 2：具体数字/案例]
- [数据点 3：具体数字/案例]
- ...

文章必须包含「文末互动」和「原文参考」区块——这是公众号发布的硬性格式要求，ljg-writes 的「磨」步骤完成后请确保这两个区块存在。
```

**为什么必须列出数据点**：ljg-writes 的写作流程会自然收敛到最核心的 1-2 个论点，但如果调研材料中有 5+ 个有价值的数据点，只覆盖 1-2 个意味着调研工作白费了。显式列出数据点迫使 ljg-writes 在扩展模式下覆盖更多内容。

**非扩展模式**：不追加额外参数，ljg-writes 按默认约束执行。

### 2.3 内容规范

**字数**：
- 默认模式：1000-1500 字（由 ljg-writes 控制）
- 扩展模式：2000-3000 字（由 2.2.1 传参覆盖 ljg-writes 约束）
- 无论哪种模式，字数不是目标而是底线——少于下限说明没挖够，超过上限检查是否有水分

**章节结构**：
- 扩展模式下，文章必须拆分为章节（## 二级标题）
- 每个章节聚焦一个论点，有自己的「切」和展开
- 章节之间有递进关系（并列/递进/转折），不是简单罗列
- 章节数量：3-6 个（材料越丰富，章节越多）
- 默认模式下，可以不分章节，但如果内容自然需要分段就分——不强制也不禁止
- 章节标题风格：简短有力，用短句或词组，不用完整陈述句

**摘要**：
- 一句话，不超过 60 字
- 从文章最有冲击力的句子（金句）中提炼
- 直接给结论，有态度有张力
- 禁止「本文介绍了……」「这篇文章探讨了……」式陈述

**文末互动**（必须，位置在正文末尾、参考资料之前）：
- 文章正文结束后紧接设置
- 低门槛：不需要太多思考就能参与
- 有共鸣：与文章主题相关，读者有话说
- 开放式：没有标准答案
- 具体：不是「你怎么看」，而是有明确指向的问题
- 示例：「你用过类似的方法吗？踩过什么坑？」
- **位置**：位于正文末尾，但在「原文参考」「参考资料」等区块之前

**原文引用**（读后感类文章必须）：
- 文章为读后感、评论、转述性质时，在文末互动之后插入原文引用区块
- 格式：
  ```markdown
  ## 原文参考

  > {作者}. **{原标题}**. {来源/平台}.
  > {原文URL}
  ```
- 如果原始资料中有多个来源，逐个列出，一行一条
- 如果是翻译/转述类，同时标注原文和翻译来源
- 引用区块不纳入字数统计

### 2.4 磨（写后自检）

ljg-writes Skill 内置磨步骤，调用 Skill 时自动执行。无需 agent 手动重复。

### 2.4.1 质量门控 ⛔ 必须通过

ljg-writes 的「磨」步骤完成后、保存 draft.md 之前，**必须执行以下质量检查**。任何一项不通过，不得进入 Step 2.5——回去修改直到通过。

**检查项**：

| 检查项 | 标准 | 不通过时的处理 |
|--------|------|---------------|
| 字数 | ≥ 2500 字（扩展模式）或 ≥ 1000 字（默认模式） | 回到 ljg-writes 补充内容，或手动扩展关键段落 |
| 文末互动 | 正文末尾必须有 `*...*` 格式的互动问题 | 手动补写互动问题 |
| 原文参考 | 必须有 `## 原文参考` 区块，包含来源 URL | 手动补写原文参考 |
| 信息图引用 | 确认 draft.md 在 frontmatter 之后、第一个 `##` 标题之前预留了信息图位置（可标记 TODO） | Step 4.5.5 会验证实际插入是否生效 |
| 数据点覆盖 | 扩展模式下，调研材料中的关键数据点至少覆盖 5 个 | 回到 ljg-writes 补充遗漏的数据点 |

**为什么需要这个门控**：ljg-writes 的「磨」步骤专注于语言质量（去 AI 痕迹、口语化），但不检查公众号特有的格式要求（互动、引用、字数、信息图）。调度层必须补这个检查，否则 Step 10 发布时会发现格式缺失，被迫返工。**注意**：信息图引用检查在 Step 2.4.1 仅做标记（此时信息图尚未生成），实际验证在 Step 4.5.5 执行。如果 Step 4.5.5 验证失败，流水线不得进入 Step 5。

**执行方式**：读取 ljg-writes 输出的 draft.md，逐项检查。不通过的项直接修改（如补写互动问题），不需要重新调用 ljg-writes。

### 2.5 保存文章

保存前，对照以下模板逐项检查 draft.md 内容。任何「必须」项缺失，立即补写——不要等到 Step 10 发布时才发现。

**保存模板**：
```markdown
---
title: {标题}
date: {YYYY-MM-DD}
summary: {摘要，一句话不超过60字}
coverImage: cover.png
sourceUrl: https://ntlx.github.io/articles/{slug}
---

{正文}

{文末互动问题}

## 原文参考

> {来源信息}
```

**合规性检查清单**：

| 检查项 | 必须 | 说明 |
|--------|------|------|
| frontmatter `title` | ✅ | 不能为空 |
| frontmatter `date` | ✅ | 格式 YYYY-MM-DD |
| frontmatter `summary` | ✅ | 一句话，≤ 60 字 |
| frontmatter `coverImage` | ✅ | 固定为 `cover.png` |
| frontmatter `sourceUrl` | ✅ | 博客文章 URL，用于公众号"阅读原文"链接。格式：`https://ntlx.github.io/articles/{slug}` |
| 正文无 H1 标题 | ✅ | Starlight 自动渲染 title 为 H1，正文再写 H1 会重复 |
| 文末互动问题 | ✅ | 正文末尾、原文参考之前，`*斜体*` 格式 |
| `## 原文参考` 区块 | ✅（读后感类） | 包含作者、标题、来源 URL |
| 信息图引用 | — | Step 4.5 生成并插入，Step 4.5.5 验证。此处确认正文开头位置未被其他内容占用即可 |

保存为 `posts/{date-slug}/draft.md`

### 2.6 完成报告

```
文章创作完成！
标题：{标题}
摘要：{摘要}
字数：约 N 字
保存位置：posts/{date-slug}/draft.md
```

## Step 3: 封面图生成（与 Step 4、4.5 并行）

**并行执行**：本步骤与 Step 4（插图）和 Step 4.5（信息图）没有依赖关系，必须通过 Agent 工具并行执行。三个 Agent 在同一消息中发起，均设置 `run_in_background: true`。

使用 Skill 工具调用 baoyu-cover-image 技能生成文章封面（**Skill 工具调用型**，不要查找 scripts 目录）。

### 3.1 前置配置确认

确认 .baoyu-skills/baoyu-cover-image/EXTEND.md 已配置。如未配置，引导用户完成首次 setup，再继续流水线。

### 3.2 确定封面参数

**标题**：从 Step 2 的 draft.md frontmatter 中读取 `title`。

#### 封面文字规则

封面图使用 `baoyu-cover-image` 生成，该技能支持 `--text` 维度控制文字显示级别：

| `--text` 值 | 行为 | 推荐度 |
|------------|------|--------|
| `none` | 纯视觉，无任何文字 | **首选** |
| `title-only` | 仅标题 | 不推荐（与推送卡片标题重复） |
| `title-subtitle` | 标题+副标题 | 仅在副标题提供增量信息时可用 |
| `text-rich` | 多文字标签 | 不推荐（封面不是信息图） |

**规则**：
1. **默认 `--text none`**：让封面成为纯视觉锤——通过图形、色彩、构图传达文章气质，文字交给推送卡片
2. **如需文字，使用替代表述**：封面文字 ≠ 文章标题。例如标题是「Agentic Workflow 烧掉的钱去哪了？」，封面可以是一个关键词如「自优化」或「-62%」，但不能重复原标题
3. **你在推送卡片中看到什么，封面上就别再写一遍**——这是判断是否需要文字的最简单测试

**类型自动选择**：
- 文章标题有具体概念/对象 → `conceptual`
- 文章标题偏抽象/哲思 → `metaphor`
- 文章标题有场景感 → `scene`
- 文章标题极简 → `minimal`

**风格自动选择**：
- 技术类文章 → `digital` + `cool` 调色
- 生活/情感类 → `hand-drawn` + `warm` 调色
- 商业/财经类 → `flat-vector` + `elegant` 调色
- 不确定 → 让 baoyu-cover-image 自动选择

### 3.3 调用 baoyu-cover-image

- 通过 Skill 工具调用 baoyu-cover-image 技能
- 传入文章标题作为封面标题
- 传入上述 `--type`、`--rendering` 和 `--palette` 参数（或让技能自动选择）
- 宽高比：使用 EXTEND.md 中的 `default_aspect` 设置（当前为 2.35:1）
- 输出目录：`posts/{date-slug}/`
- **确认策略**：流水线内传 `--quick` 以跳过用户确认（单独调用 baoyu-cover-image 时仍走确认流程）
- **文字策略**：默认传 `--text none`（纯视觉封面）。仅当封面确有增量信息需要文字传达时才使用 `--text title-only`，此时封面 prompt 中必须明确要求标题文字与文章标题不同

### 3.3.1 Prompt 文件命名规范

封面 prompt 文件必须遵循命名规范：`prompts/01-cover-{slug}.md`，其中 `{slug}` 是 2-4 词的 kebab-case 主题关键词。不要使用 `prompts/cover.md` 这种通用命名。

示例：`prompts/01-cover-chaos-to-order.md`

### 3.4 封面图说明

**封面图不上传图床**，直接用于 Step 10 的公众号素材库上传。

### 3.4.1 封面格式检测与修正

封面图几乎必定存在格式不匹配（Gemini 后端返回 JPEG 内容但保存为 `.png` 扩展名）。虽然 Step 10 发布脚本能兜底，但源头修正更干净。

**检测与修正**（Step 3+4+4.5 全部完成后统一执行，而非分散在各步骤）：

```bash
file posts/{date-slug}/cover.png
```

输出 `JPEG image data` → 重命名：
```bash
mv posts/{date-slug}/cover.png posts/{date-slug}/cover.jpg
```

同时更新 draft.md frontmatter 中的 `coverImage: cover.png` 为 `coverImage: cover.jpg`，并更新 Step 10 发布命令中的 `--cover` 参数路径。

### 3.5 完成报告

```
封面图生成完成！
保存位置：posts/{date-slug}/cover.png
```

## Step 4: 插图生成（与 Step 3、4.5 并行）

**并行执行**：本步骤与 Step 3（封面图）和 Step 4.5（信息图）没有依赖关系，必须通过 Agent 工具并行执行。

使用 baoyu-article-illustrator 技能，分析文章结构并在需要视觉辅助的位置生成插图。

### 4.1 前置配置确认

确认 .baoyu-skills/baoyu-article-illustrator/EXTEND.md 已配置。如未配置，引导用户完成首次 setup，再继续流水线。

**注意**：`preferred_image_backend` 字段由流水线统一控制，不需要在 EXTEND.md 中固定。流水线按核心原则中的优先级（Gemini > Seedream > DashScope）自动选择后端。

### 4.2 调用 baoyu-article-illustrator

- 输入：`posts/{date-slug}/draft.md`
- 输出目录：`posts/{date-slug}/imgs/`
- 密度：balanced（3-5 张）或根据文章长度自动调整
- **确认策略**：流水线内附带"直接生成"短语以跳过用户确认（单独调用 baoyu-article-illustrator 时仍走确认流程）
- **图片后端**：按核心原则中的优先级 Gemini > Seedream > DashScope 执行。如果某个后端生成失败（审核拒绝、超时等），自动降级到下一个后端重试

**后端降级规则**：
- DashScope 审核失败（DataInspectionFailed）→ 切换到 Seedream 重试同一 prompt
- Seedream 失败 → 切换到 Gemini 重试
- Gemini 失败 → 报告错误，询问是否跳过该插图继续
- 降级时不需要用户确认，自动执行

**构图注意事项**：参考 `references/image-backends.md` 了解各后端的构图特性。
- 如果用户反馈插图有空白边、构图不对，**改变构图概念**（而非反复重试 prompt）
- 特别是 Gemini 后端，16:9 下天然居中构图，应选择水平分割/左右对比类概念
- 重试策略：优化 prompt → 改变概念 → 切换后端

### 4.3 Prompt 文件要求

baoyu-article-illustrator 要求每张插图在生成前保存 prompt 文件到 `prompts/` 目录。技能会自动处理。

**Prompt 文件 frontmatter 字段**：

| 字段 | 说明 | 示例 |
|------|------|------|
| `type` | 插图类型 | `scene`, `infographic` |
| `style` | 风格 | `editorial`, `notion` |
| `palette` | 配色 | `cool`, `warm` |
| `aspect` | 宽高比 | `16:9` |
| `caption_hint` | 图片说明的语义摘要，用于检测概念变更 | `AI大脑左右对比：表面完美 vs 内部混乱` |

**`caption_hint` 的作用**：当插图因构图问题需要重新生成时，对比前后 prompt 文件的 `caption_hint` 可以检测出概念是否发生变化。如果概念变了（如从"冰山隐喻"改为"左右对比"），应同步检查并更新文章中的图片说明文字，避免图文不符。

**使用方式**：重传图片时，如果新 prompt 的 `caption_hint` 与旧值不同，提示用户：「插图概念已从 "{old_hint}" 改为 "{new_hint}"，请检查对应的图片说明文案是否需要同步更新。」

### 4.4 临时文件清理

baoyu-imagine 批量生成时会在项目根目录创建 `batch.json`。插图生成完成后，删除该文件：

```bash
rm -f batch.json
```

同样检查文章目录下是否有残留的 `batch.json`，一并清理：

```bash
rm -f posts/{date-slug}/batch.json posts/{date-slug}/prompts/batch.json
```

### 4.5 完成报告

```
插图生成完成！
数量：N 张
保存位置：posts/{date-slug}/imgs/
大纲：posts/{date-slug}/outline.md
提示词：posts/{date-slug}/prompts/
```

## Step 4.5: 信息图生成 ⛔ 必须执行（与 Step 3、4 并行）

**并行执行**：本步骤与 Step 3（封面图）和 Step 4（插图）没有依赖关系，必须通过 Agent 工具并行执行。

**硬门控**：信息图是文章的视觉总览，排在所有插图之前。每次文章流水线都必须执行此步骤，不得跳过、不得延后。信息图缺失会导致文章首图空白，影响推送卡片预览和读者第一印象。

使用 baoyu-infographic 技能，在文章顶部生成一张浓缩全文核心内容的 aged-academia 风格信息图。信息图编号始终为 `00`，排在所有插图之前。

### 4.5.1 前置配置确认

确认 baoyu-infographic 技能可通过 Skill 工具调用加载。baoyu-infographic 是 Skill 工具调用型技能，不要查找 scripts 目录。

确认 .baoyu-skills/baoyu-imagine/EXTEND.md 已配置（信息图委托 baoyu-imagine 后端生成）。

### 4.5.2 确定信息图参数

**固定参数**（每次文章流水线不变）：
- 布局：`bento-grid`
- 风格：`aged-academia`
- 宽高比：`16:9`
- 语言：`zh`
- 输出路径：`posts/{date-slug}/imgs/00-infographic-core-summary.png`

**图片后端**：按核心原则中的优先级 Gemini > Seedream > DashScope。信息图包含大量中文文本，DashScope 的 `qwen-image-2.0-pro` 中文渲染最佳但审核严格——如果 DashScope 审核失败（DataInspectionFailed），自动切换到 Seedream，再失败切换到 Gemini。

### 4.5.3 调用 baoyu-infographic

通过 Skill 工具调用 baoyu-infographic，传入以下参数：

```
--style aged-academia
--layout bento-grid
--aspect 16:9
--lang zh
--no-confirm
```

**内容来源**：
- 输入 `posts/{date-slug}/materials.md` 作为原始资料
- 参考 `posts/{date-slug}/draft.md` 的章节结构提炼核心论点
- 信息图应覆盖文章的所有核心观点（不是单点展开，是全局总览）

### 4.5.4 插入到文章

信息图生成后，**立即**在 `posts/{date-slug}/draft.md` 中自动插入引用——不要延迟到后续步骤：

- **位置**：文章正文开头（frontmatter 结束后的第一段之前），或第一个二级标题之前
- **格式**：`![](imgs/00-infographic-core-summary.png)`
- 插入后不需要额外说明文字——信息图本身就是视觉总览

**注意**：插入完成后必须执行 **4.5.5 插入验证**，确认引用已正确写入文件。不得跳过验证直接进入下一步。

### 4.5.5 插入验证 ⛔ BLOCKING

**问题**：Step 4.5.4 的插入动作和 Step 2.4.1 的质量门控之间没有闭环。图片生成成功不等于引用被写入——agent 可能完成了生成但跳过了插入步骤，导致文章首图空白。

**验证方式**（Step 4.5.4 之后立即执行，不得跳过）：

```bash
# 检查文件存在
test -f posts/{date-slug}/imgs/00-infographic-core-summary.* || echo "MISSING"

# 检查 draft.md 中是否存在引用
grep -q '![](imgs/00-infographic' posts/{date-slug}/draft.md && echo "OK" || echo "MISSING_REF"
```

**判定规则**：
- 两项均为 OK → 通过，进入 Step 5
- 文件存在但引用缺失 → **手动在 draft.md frontmatter 之后、第一个 `##` 标题之前插入** `![](imgs/00-infographic-core-summary.{ext})`，然后重新验证
- 文件缺失 → 信息图生成步骤失败，不得继续

**为什么必须在 4.5 内验证**：等到 Step 6（CDN 整合）或 Step 7（去 AI 痕迹）才发现缺少信息图，返工成本更高。在 Step 4.5 内部闭环验证，确保「生成 → 插入 → 验证」三步在同一上下文中完成。

### 4.5.6 信息图与其他插图的关系

信息图编号为 `00`，插图从 `01` 开始。两者在同一 `imgs/` 目录下，统一走 Step 5 图床上传和 Step 6 CDN 替换。

### 4.5.7 完成报告

```
信息图生成完成！
保存位置：posts/{date-slug}/imgs/00-infographic-core-summary.png
风格：aged-academia | 布局：bento-grid | 宽高比：16:9
已插入到文章正文顶部
插入验证：✓ 文件存在，✓ draft.md 引用已写入
```

## Step 5: 图片上传图床

将文章中的插图（非封面）上传到 GitHub 图床，获取 jsDelivr CDN URL。

### 5.1 查找上传脚本路径

按优先级查找 `github-image-hosting` 的脚本目录：

1. `.agents/skills/github-image-hosting/scripts/upload.ts`
2. `~/.claude/skills/github-image-hosting/scripts/upload.ts`
3. `~/.claude/plugins/cache/claude-plugins-official/*/skills/github-image-hosting/scripts/upload.ts`

使用最先找到的路径作为 `{uploadScript}`。

### 5.2 扫描插图

- 扫描 `posts/{date-slug}/imgs/` 目录
- 获取所有图片文件列表（`.png`、`.jpg`、`.jpeg`、`.webp`）

### 5.2.1 格式检测与修正 ⛔ 必须执行

某些图片后端（如 Gemini）返回 JPEG 内容但保存为 `.png` 扩展名。上传前**必须实际执行**格式检测并修正，不要只记录日志——格式不匹配会导致 CDN URL 后缀与实际内容不一致，影响后续步骤。

**检测步骤**（对每张图片逐一执行）：

1. **运行 `file` 命令检测实际格式**：
   ```bash
   file posts/{date-slug}/imgs/{filename}
   ```
   输出示例：`01-scene-virtual-entry.png: JPEG image data, 3200x1800, ...` → 格式不匹配

2. **如果检测到格式不匹配**（扩展名 `.png` 但实际为 JPEG），执行方案 A：
   ```bash
   mv posts/{date-slug}/imgs/01-scene-xxx.png posts/{date-slug}/imgs/01-scene-xxx.jpg
   ```

3. **联动更新 draft.md 中的引用路径**：
   在 `posts/{date-slug}/draft.md` 中，将所有 `imgs/01-scene-xxx.png` 替换为 `imgs/01-scene-xxx.jpg`。

4. **联动更新 image-map.json 的键名**（Step 5.4 创建映射时使用修正后的文件名）。

**为什么必须执行**：Gemini 后端是目前默认图片后端，几乎每次运行都会产生格式不匹配。如果不修正，CDN URL 后缀（`.png`）与实际内容（JPEG）不一致，虽然发布脚本能自动压缩修正，但会造成不必要的混淆和额外处理时间。修正扩展名是成本最低的解决方案。

**检测报告**：将检测结果纳入 Step 5.5 完成报告：
```
格式检测：N 张图片检测完成
  - X 张格式不匹配，扩展名已修正（如 01-scene-virtual-entry.png → .jpg）
  - Y 张格式正常
```

### 5.3 逐张上传

对每张插图执行：

```bash
bun run {uploadScript} <image-path> \
  --folder wechat-articles \
  --name 2026-05-04-talkie-1930-img-{NN}
```

**⚠️ `--name` 参数必须使用纯 ASCII 字符**：GitHub API 无法处理中文文件名（会导致 `unexpected end of JSON input` 错误）。使用 ASCII-only 的 slug 格式，例如 `2026-05-04-{topic-keywords}-img-{NN}`，其中 `{topic-keywords}` 是文章主题的英文或拼音关键词。

`{NN}` 为零填充序号，如 `01`、`02`。

返回结果：
```json
{
  "success": true,
  "cdnUrl": "https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/{slug}.png"
}
```

### 5.4 记录映射

创建 `posts/{date-slug}/image-map.json`：

```json
{
  "01-infographic-xxx.png": "https://cdn.jsdelivr.net/gh/.../01-xxx.png",
  "02-scene-yyy.png": "https://cdn.jsdelivr.net/gh/.../02-yyy.png"
}
```

### 5.4.1 重传检测与同步

如果 `image-map.json` 已存在（说明是重传或重新生成插图）：

1. **读取旧映射**：读取现有的 `image-map.json`
2. **对比变化**：逐张对比新旧 CDN URL 是否不同
3. **自动更新引用**：对每个 URL 变化，在以下文件中替换旧 URL → 新 URL：
   - `posts/{date-slug}/article.md`
   - `posts/{date-slug}/draft.md`
4. **提示检查文案**：满足以下任一条件时，提示用户检查图片说明：
   - 插图文件名发生变化（如从 `iceberg` 改为 `split-layout`）
   - prompt 文件中 `caption_hint` 值发生变化（概念变了）
   提示语：「插图 {filename} 概念已变更（{old_hint} → {new_hint}），请确认对应的图片说明文案是否需要同步更新。」

### 5.5 完成报告

```
图片上传完成！
上传：N 张
映射文件：posts/{date-slug}/image-map.json
[如有重传] CDN URL 已同步更新到 article.md 和 draft.md
[如有文件名或 caption_hint 变化] 提示：请检查图片说明文案
```

### 5.6 CDN 传播等待

图片上传到 GitHub 图床后，jsDelivr CDN 需要 2-3 分钟才能稳定访问。Step 9（HTML 转换）和 Step 10（发布到公众号）都需要从 CDN 下载图片，如果 CDN 未传播完成，会反复超时并走本地路径降级——虽然能工作，但增加了不必要的复杂度和处理时间。

**主动等待 30 秒**：Step 5 完成后，等待 30 秒再进入 Step 6。这比在 Step 9/10 内部反复重试更高效——等一次比重试三次省时间。

```bash
echo "等待 CDN 传播（30 秒）..." && sleep 30
```

**为什么是 30 秒而非更长**：30 秒是 CDN 传播的最低保障时间，加上 Step 6-8 的执行时间（约 1-2 分钟），到 Step 9 时 CDN 大概率已就绪。如果仍超时，Step 9.4.1 的本地路径降级是兜底方案。

## Step 6: Markdown 整合

将文章中的插图引用替换为 CDN 地址。

### 6.1 替换规则

- 读取 `posts/{date-slug}/draft.md`
- 读取 `posts/{date-slug}/image-map.json`
- 将每个本地路径（`imgs/xxx.png` 或 `./imgs/xxx.png`）替换为对应的 CDN URL
- 保存为 `posts/{date-slug}/article.md`

**必须先 Read article.md 再 Edit**：从 draft.md 复制或生成 article.md 后，必须先用 Read 工具读取文件内容，然后才能用 Edit 工具的 `replace_all` 替换本地路径为 CDN URL。不先 Read 直接 Edit 会报错。

**自动化执行**：对 image-map.json 中的每个映射项，用 Edit 工具的 `replace_all` 依次替换本地路径为 CDN URL。使用绝对路径（`/Users/.../posts/.../article.md`）避免 CWD 不一致问题。

### 6.2 Frontmatter 确认

确认 `article.md` 包含完整的 frontmatter：
```yaml
---
title: {标题}
date: {YYYY-MM-DD}
summary: {摘要}
coverImage: cover.png
---
```

### 6.3 完成报告

```
Markdown 整合完成！
文章：posts/{date-slug}/article.md（含CDN图片链接）
封面：posts/{date-slug}/cover.png（不上传图床）
```

## Step 7: 去 AI 痕迹 ⛔ 必须执行

使用 humanizer-zh 技能对文章正文进行 AI 痕迹检测与去除。

**硬门控**：Step 7 是流水线的必要步骤，每次执行都必须完整运行 humanizer-zh，不允许跳过、不允许自行豁免。

**为什么必须执行而非条件跳过**：ljg-writes 和 humanizer-zh 是两套独立的检测体系。ljg-writes 的「磨」步骤侧重语言质量（口语化、去拐杖词），而 humanizer-zh 是结构性检测流程（18+ 种 AI 痕迹模式，量化评分），两者视角不同、覆盖范围不同。即使 ljg-writes 已经做过一轮过滤，humanizer-zh 仍可能发现 ljg-writes 遗漏的模式（如破折号过度使用、否定式排比、谄媚语气等）。从另一个角度再次修缮文章，是这个步骤存在的意义。

**⚠️ 禁止跳过**：agent 不可因任何理由跳过 Step 7，包括但不限于："文章已经够人味了"、"ljg-writes 已经过滤过了"、"用户没要求"。每次流水线都必须执行。

### 7.1 确定处理范围

**处理**：正文内容（frontmatter 之后、文末互动之前）

**不处理**：
- frontmatter（标题、摘要、日期）
- 文末互动问题
- 原文参考区块
- 代码块内容

**边界判断**：
- 正文起始：frontmatter 结束标记 `---` 之后的第一行
- 正文结束：从文件末尾往前找，第一个（即最后一个）`## ` 标题之前的内容。如果文件中有 `## 原文参考` 或 `## 参考资料` 等区块，以其为分界。若无法精确定位，则保守处理——仅对 frontmatter 之后到文末互动问题之间的内容进行去痕处理。

### 7.2 调用 humanizer-zh

调用方式：使用 humanizer-zh 技能，将正文内容提供给该技能。

处理目标：
- 夸大的象征意义（「标志着」「见证了」）
- 宣传性语言（「充满活力的」「丰富的」）
- 以 -ing 结尾的肤浅分析
- 模糊归因（「专家认为」「行业报告显示」）
- 破折号过度使用
- 三段式法则
- AI 词汇（「此外」「至关重要」「不断演变的格局」）
- 否定式排比（「不仅……而且……」）
- 谄媚语气
- 填充短语

### 7.3 保存

将去痕迹后的正文写回 `posts/{date-slug}/article.md`（覆盖原文件，保留 frontmatter 和文末互动）。

### 7.4 完成报告

```
去 AI 痕迹完成！
文章：posts/{date-slug}/article.md
```

## Step 8: Markdown 格式化

使用 baoyu-format-markdown 技能对文章进行结构化排版。

### 8.1 调用 baoyu-format-markdown

- 输入：`posts/{date-slug}/article.md`
- 处理：
  - 优化标题层级（##、### hierarchy）
  - 关键结论和术语加粗
  - 并列项提取为列表
  - 技术术语加行内代码标记
  - CJK/English 间距修正
- 输出：`posts/{date-slug}/article.md`（覆盖原文件）

### 8.2 注意事项

- 不添加、删除或改写内容
- 只调整格式和修复明显错字
- 保留作者语气和风格

### 8.3 完成报告

```
Markdown 格式化完成！
文章：posts/{date-slug}/article.md
```

## Step 9: HTML 转换

使用 baoyu-markdown-to-html 技能将 Markdown 转换为微信公众号兼容的 HTML。

**注意**：Step 9 生成的 `article.html` 仅供本地预览和存档。Step 10 的 `wechat-api.ts` 会独立重新渲染 HTML 用于公众号发布——这是因为发布脚本需要将图片下载后上传到微信素材库并替换 placeholder，流程与本地 HTML 不同。两者使用相同的 theme/color 配置以保证视觉一致性。

### 9.1 查找脚本路径

按优先级查找 `baoyu-markdown-to-html` 的脚本目录，使用最先找到的路径作为 `{htmlScriptDir}`。

### 9.2 确定主题与颜色

按优先级：

1. **用户本次指定**：对话中用户明确指定 `--theme X` 或 `--color Y`
2. **EXTEND.md 配置**：读取 .baoyu-skills/baoyu-markdown-to-html/EXTEND.md
   - `default_theme:` 行作为主题名
   - `default_color:` 行作为颜色名
3. **默认值**：主题 `default`，颜色不指定

### 9.3 增量更新检测

在调用脚本重新生成 HTML 之前，检测变更范围，决定是增量更新还是全量重生成。

**检测逻辑**：

对比 `posts/{date-slug}/article.md` 与上一版本（`draft.md` 或 `article.md` 的备份）：

| 变更类型 | 判断标准 | 处理方式 |
|---------|---------|---------|
| **微小变更** | 仅图片 URL 替换、图片说明文字修改，正文内容无变化 | 走 9.3.1 增量更新 |
| **内容变更** | 正文改写、新增/删除段落、标题调整、格式变化 | 走 9.4 全量重生成 |

**经验法则**：如果变更只涉及图片链接和对应的 caption 文字，不需要重新走完整的 HTML 生成流程。

### 9.3.1 增量更新模式

当检测到微小变更时，直接编辑现有的 `article.html` 文件：

1. **备份当前 HTML**：
   ```bash
   cp posts/{date-slug}/article.html posts/{date-slug}/article.html.bak-$(date +%Y%m%d%H%M%S)
   ```

2. **使用 Edit 工具替换变更内容**：
   - 对每个变更的图片 URL，在 HTML 中找到旧 URL 替换为新 URL
   - 对每个变更的图片说明文字，在 HTML 中找到旧 caption 替换为新 caption

3. **验证**：确认 HTML 文件结构完整，图片链接正确

4. **跳过** Step 9.4 的脚本调用

**优势**：避免因 CDN 缓存未传播导致的 HTML 重生成超时，且速度更快。

### 9.4 调用脚本

当检测到内容变更时，执行完整的 HTML 重新生成：

```bash
bun run {htmlScriptDir}/scripts/main.ts posts/{date-slug}/article.md \
  --theme {theme} \
  --title "{title}"
```

输出：`posts/{date-slug}/article.html`

### 9.4.1 CDN 下载失败处理

Step 5.6 已主动等待 30 秒，加上 Step 6-8 的执行时间（约 1-2 分钟），到 Step 9 时 CDN 大概率已就绪。如果仍超时，走本地路径降级。

**策略**：
1. 直接尝试 CDN 直连（Step 5.6 已等待，无需再预防性等待）
2. 超时 → 等待 30s，重试 1 次
3. 仍超时 → **直接走本地路径降级**（不再重试第 3 次）

**本地路径降级**（重试失败后自动执行）：

CDN 传播延迟是 jsDelivr 的固有特性，当重试耗尽后，使用本地文件替代 CDN 完成转换：

1. **备份 CDN 版本**：
   ```bash
   cp posts/{date-slug}/article.md posts/{date-slug}/article-cdn.md
   ```

2. **替换为本地路径**：将 article.md 中所有 CDN URL 替换为本地文件路径（如 `imgs/00-infographic-core-summary.jpg`），使用 image-map.json 的键作为映射依据。**注意**：键名中的扩展名是 Step 5 格式修正后的（通常是 `.jpg`），不要用 `.png`。

3. **用本地路径版本执行 HTML 转换**：
   ```bash
   bun run {htmlScriptDir}/scripts/main.ts posts/{date-slug}/article.md \
     --theme {theme} \
     --title "{title}"
   ```

4. **恢复 CDN 版本**：
   ```bash
   cp posts/{date-slug}/article-cdn.md posts/{date-slug}/article.md
   ```

5. **HTML 中替换回 CDN URL**：在生成的 `article.html` 中，将本地图片路径替换回对应的 CDN URL。
   - **macOS 注意**：BSD sed 不支持 `;` 分隔多个表达式。每个替换用独立的 `sed -i ''` 命令：
     ```bash
     sed -i '' 's|imgs/00-xxx.jpg|CDN_URL_00|g' article.html
     sed -i '' 's|imgs/01-xxx.jpg|CDN_URL_01|g' article.html
     # ...依次执行每个替换
     ```

6. **清理备份**：
   ```bash
   rm posts/{date-slug}/article-cdn.md
   ```

### 9.5 验证输出

- 确认 HTML 文件存在且非空
- 确认包含完整的 inline CSS
- 确认图片引用为 CDN URL（已替换）

### 9.6 完成报告

```
HTML 转换完成！
输出：posts/{date-slug}/article.html
主题：{theme}
[如增量更新] 模式：增量更新（仅替换图片 URL/caption）
```

## Step 10: 发布到公众号草稿

使用 baoyu-post-to-wechat 技能将文章发布到微信公众号草稿箱。

### 10.1 查找脚本路径

按优先级查找 `baoyu-post-to-wechat` 的脚本目录，使用最先找到的路径作为 `{wechatScriptDir}`。

### 10.2 准备发布参数

从 `posts/{date-slug}/article.md` frontmatter 读取：
- `title` → 文章标题
- `summary` → 文章摘要
- `coverImage` → 封面图路径（`posts/{date-slug}/cover.png`）
- `sourceUrl` → 博客文章 URL，作为公众号"阅读原文"链接（wechat-api.ts 自动读取 frontmatter，无需额外传参）

**颜色字段**：
- **颜色来源统一为 baoyu-markdown-to-html 的 EXTEND.md**，确保 HTML 转换和发布使用同一颜色
- 读取 .baoyu-skills/baoyu-markdown-to-html/EXTEND.md 中的 `default_color`
- 调用发布脚本时传入 `--color {default_color}`
- 如用户本次明确指定了 `--color X`，则以用户指定为准
- ⚠️ **不要从 baoyu-post-to-wechat 的 EXTEND.md 读取颜色**——该技能有自己的 `default_color` 配置（如 `blue`），但这会导致发布时的颜色覆盖 HTML 转换时选择的颜色（如 `vermilion`），造成视觉不一致。颜色是视觉风格的一部分，应由 HTML 转换技能的配置统一控制。

**作者字段**：
- 读取 .baoyu-skills/baoyu-post-to-wechat/EXTEND.md 中的 `default_author`
- 调用发布脚本时传入 `--author {default_author}`
- 如用户本次明确指定了 `--author X`，则以用户指定为准

### 10.3 选择发布方法

按优先级：
1. EXTEND.md 中 `default_publish_method`
2. `api`（推荐，更快）
3. `browser`（备选，需要 Chrome 登录）

### 10.4 调用发布脚本

**API 方式**（推荐，支持 `--cover`）：
```bash
bun run {wechatScriptDir}/scripts/wechat-api.ts posts/{date-slug}/article.md \
  --theme {theme} \
  --color {color} \
  --author {default_author} \
  --cover posts/{date-slug}/cover.png
```

**原文链接**：wechat-api.ts 自动从 frontmatter 的 `sourceUrl` 字段读取，无需额外传参。如需覆盖，可加 `--source-url <url>`。

**浏览器方式**：
```bash
bun run {wechatScriptDir}/scripts/wechat-article.ts \
  --markdown posts/{date-slug}/article.md \
  --theme {theme}
```

### 10.4.1 CDN 下载失败处理

发布脚本从 jsDelivr CDN 下载文章插图时，可能因 CDN 缓存未传播而超时（新上传的图片尤其常见）。

**预防性等待**：如果 Step 5 刚刚上传了图片（即本次流水线首次上传），在调用发布脚本前主动等待 15 秒，让 CDN 缓存有时间传播。

**自动重试策略**：
- 如果发布失败且错误包含 "Download timeout" 或 "timeout"，等待后重试
- 最多重试 3 次，每次等待时间递增：20s → 30s → 45s
- 每次重试前向用户报告：「CDN 图片下载超时（第 N/3 次重试），等待 X 秒后重试…可能是 CDN 缓存尚未传播」

**本地路径降级**（3 次重试均失败后自动执行）：

与 Step 9.4.1 策略一致——CDN 传播延迟是系统性问题，重试无法解决，需要用本地文件绕过：

1. **备份 CDN 版本**：
   ```bash
   cp posts/{date-slug}/article.md posts/{date-slug}/article-cdn.md
   ```

2. **替换为本地路径**：将 article.md 中所有 CDN URL 替换为本地文件路径（如 `imgs/00-infographic-core-summary.png`），使用 image-map.json 的键作为映射依据

3. **用本地路径版本执行发布**：
   ```bash
   bun run {wechatScriptDir}/scripts/wechat-api.ts posts/{date-slug}/article.md \
     --theme {theme} \
     --color {color} \
     --author {default_author} \
     --cover posts/{date-slug}/cover.png
   ```

4. **恢复 CDN 版本**（无论发布成功与否）：
   ```bash
   cp posts/{date-slug}/article-cdn.md posts/{date-slug}/article.md
   rm posts/{date-slug}/article-cdn.md
   ```

5. **恢复后验证**：确认 `article.md` 中的图片链接已恢复为 CDN URL

### 10.5 确认封面

封面图 `cover.png` 直接上传公众号素材库，不经过图床。

## 博客发布约束

发布到博客前必须了解以下约束，违反会导致构建失败。

### 文件名必须为小写 ASCII kebab-case

Starlight 的内容集合（content collection）对文件名有严格限制：

- **不支持中文文件名**：包含非 ASCII 字符的文件名不会被内容集合收录，构建时报 `The slug specified in the Starlight sidebar config does not exist`
- **slug 自动转小写**：`AI-eval-costs-bottleneck.md` 的 slug 是 `articles/ai-eval-costs-bottleneck`（全小写），sidebar 配置中写大写会导致构建失败
- **标题可以是中文**：文件名是 URL 的一部分（必须 ASCII），标题只是显示用的标签（可以任意语言）

正确做法：
```
文件名：ai-era-company-moat.md
frontmatter title：产品可以抄，但公司的形状抄不走
sidebar slug：articles/ai-era-company-moat
```

### 图片必须使用 CDN URL，禁止本地路径

文章中的图片引用必须是完整的 CDN URL，不能是相对路径（如 `imgs/xxx.jpg`）。

**原因**：本地路径会导致构建失败——Astro 尝试解析图片时找不到文件（`posts/` 被 `.gitignore` 排除，不会进入构建流程）。即使图片文件存在于 `posts/` 目录中也不行。

正确的图片 URL 格式：`https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/xxx.jpg`

Step 6（CDN 整合）负责将本地路径替换为 CDN URL。如果发现文章中仍有本地路径，说明 Step 6 未完成。

### Frontmatter 字段映射

微信管线和 Starlight 使用不同的字段名：

| 微信管线字段 | Starlight 字段 | 说明 |
|---|---|---|
| `summary` | `description` | 必须转换，Starlight 不识别 `summary` |
| `title` | `title` | 一致，无需转换 |
| `date` | 自定义字段 | Starlight schema 不要求，但保留用于排序 |
| `coverImage` | — | 移除，博客不需要（首图已是信息图） |
| `sourceUrl` | — | 移除，博客不需要（仅用于公众号"阅读原文"链接） |
| — | `$schema: starlight` | 必须添加，告知 Starlight 使用其 schema |

Step 11.1 自动处理这些转换。

### 构建验证检查清单

Step 11.3 验证时按顺序执行：

1. `npx astro sync` — 同步内容集合（新增/删除/重命名文件后必须执行）
2. `npm run build` — 验证构建成功
3. 如果构建失败且原因不明确，清除缓存重试：`rm -rf .astro/ && npm run build`

常见构建失败原因：
- sidebar slug 与实际文件名不匹配（大小写、中文）
- 文章引用了不存在的本地图片
- frontmatter 格式错误（缺少 `title`）

## Step 11: 发布到博客

将最终文章同步到博客项目的 `src/content/docs/articles/` 目录，使其自动出现在 GitHub Pages 博客上。

**为什么不需要单独上传封面图**：文章的第一张图通常是信息图（infographic），浓缩了全文核心信息。这张图已经通过 Step 5 上传到 GitHub 图床，在文章中以 CDN URL 引用。RSS 阅读器和社交分享平台会自动抓取首图作为预览，因此封面图不需要额外处理。

### 11.1 复制文章到博客目录

从 `posts/{date-slug}/article.md` 复制到 `src/content/docs/articles/{slug}.md`：

```bash
# 提取 slug（去掉日期前缀）
slug=$(echo "{date-slug}" | sed 's/^[0-9]*-[0-9]*-[0-9]*-//')

# 复制并转换 frontmatter
python3 -c "
import re
with open('posts/{date-slug}/article.md', 'r') as f:
    content = f.read()
# summary → description
content = re.sub(r'^summary:', 'description:', content, flags=re.MULTILINE)
# 添加 \$schema
if '\$schema:' not in content:
    content = content.replace('---\n', '---\n\$schema: starlight\n', 1)
# 移除 coverImage 字段（博客不需要，首图已是信息图）
content = re.sub(r'^coverImage:.*\n', '', content, flags=re.MULTILINE)
# 移除 sourceUrl 字段（博客不需要，仅用于公众号"阅读原文"链接）
content = re.sub(r'^sourceUrl:.*\n', '', content, flags=re.MULTILINE)
with open('src/content/docs/articles/${slug}.md', 'w') as f:
    f.write(content)
"
```

### 11.2 更新侧边栏

在 `astro.config.mjs` 的 `sidebar` 数组中，找到 `label: '文章'` 的分类，在 `items` 数组中添加新条目：

```js
{ label: '{文章标题}', slug: 'articles/{slug}' },
```

- `{文章标题}`：从 article.md frontmatter 的 `title` 字段获取
- `{slug}`：从 11.1 步骤中得到的 clean slug

**排序**：新文章添加到 items 数组的开头（最新的在最前面）。

### 11.3 验证

确认文件已正确复制且 frontmatter 格式正确：

```bash
head -7 src/content/docs/articles/{slug}.md
```

预期输出应包含 `$schema: starlight`、`title`、`description`、`date` 字段。

然后执行构建验证（按顺序）：

```bash
npx astro sync && npm run build
```

如果构建失败，检查：
- sidebar slug 与文件名是否匹配（大小写、中文）
- 文章中是否有本地图片路径
- frontmatter 是否缺少 `title`

## 最终完成报告

全部步骤完成后，展示完整报告：

```
═══════════════════════════════════════════════
  微信公众号文章生成完成！
═══════════════════════════════════════════════

标题：{title}
摘要：{summary}
字数：约 N 字

产出物：
  ✓ 文章 Markdown：posts/{date-slug}/article.md
  ✓ 微信公众号 HTML：posts/{date-slug}/article.html
  ✓ 封面图：posts/{date-slug}/cover.png
  ✓ 信息图：posts/{date-slug}/imgs/00-infographic-core-summary.png
  ✓ 插图：N 张（posts/{date-slug}/imgs/）
  ✓ CDN 映射：posts/{date-slug}/image-map.json

发布：
  ✓ 已保存到公众号草稿箱
  ✓ media_id：{media_id}（API方式）
  ✓ 已同步到博客：src/content/docs/articles/{slug}.md

下一步：
  → 在微信公众号后台预览并编辑：https://mp.weixin.qq.com
  → 推送到 main 分支即可部署到 GitHub Pages 博客
```

## 失败处理策略

任何步骤失败时：

1. **报告错误**：清晰说明哪一步失败、错误原因
2. **自动重试**：以下场景自动重试（不需要用户确认）：
   - Step 9 CDN 下载超时：等待 20-45 秒，最多 3 次，之后走本地路径降级（见 Step 9.4.1）
   - Step 10 CDN 下载超时：等待 20-45 秒，最多 3 次，之后走本地路径降级（见 Step 10.4.1）
   - Step 5 图片上传失败：重试 1 次
   - Step 4/4.5 图片后端失败：按 Gemini > Seedream > DashScope 自动降级
3. **询问继续**：重试耗尽后，询问用户「是否跳过此步继续执行后续步骤？」
4. **用户选择继续**：标记该步为 SKIPPED，继续下一步（**例外：Step 7 不可跳过**）
5. **用户选择停止**：保存当前所有中间结果，报告进度

**Step 7 特殊处理**：Step 7（去 AI 痕迹）是硬门控步骤，即使前面的步骤失败或被跳过，Step 7 仍必须对已有内容执行。如果 Step 6 产出的 article.md 内容完整，Step 7 就必须运行。

## 已知问题与解决方案

基于实际流水线运行经验总结。遇到以下情况时直接参照处理。

### GitHub 上传：中文文件名导致 JSON 解析失败

**现象**：Step 5 上传图片时返回 `unexpected end of JSON input`。

**原因**：GitHub API 无法处理 `--name` 参数中的中文字符（date-slug 包含中文时）。

**解决**：`--name` 使用纯 ASCII slug，格式为 `YYYY-MM-DD-{topic-keywords}-img-{NN}`。例如 `2026-05-04-talkie-1930-img-01`。

### CDN 传播延迟

**现象**：Step 9 HTML 转换或 Step 10 发布时报 "Download timeout" / "ETIMEDOUT"。

**原因**：新上传的图片传播到 jsDelivr CDN 需要 2-3 分钟才能稳定访问。

**解决**：
- **Step 9**：采用缩减版策略——15s 预防性等待 → 1 次重试（30s）→ 本地路径降级（详见 Step 9.4.1）。几乎必定走本地路径，不要在重试上浪费时间。
- **Step 10**：保留完整三级应对策略——预防性等待 + 重试 + 本地路径降级（详见 Step 10.4.1）。Step 10 在 Step 9 之后执行，多出约 1 分钟传播时间，CDN 大概率已就绪。

### 图片格式与扩展名不匹配

**现象**：图片文件保存为 `.png` 但实际内容为 JPEG。

**原因**：部分图片后端（如 Google Gemini 3.1 Flash Image Preview）默认返回 JPEG 格式。

**影响范围**：
- **插图**（`imgs/` 目录）：Step 5.2.1 强制检测并修正——重命名扩展名、更新 draft.md 引用、使用正确文件名创建 image-map.json。
- **封面**（`cover.png`）：Step 3.4.1 检测并修正——重命名为 `.jpg`、更新 frontmatter `coverImage` 字段、更新 Step 10 发布命令的 `--cover` 参数。虽然 wechat-api.ts 能兜底压缩修正，但源头修正避免了文件名与内容不一致的混淆。

**统一执行**：封面和插图的格式检测应在 Step 3+4+4.5 全部完成后统一执行，而非分散在各步骤。

**兜底**：如果 Step 5.2.1 的检测遗漏了某张插图，baoyu-post-to-wechat 发布脚本仍会检测格式不匹配并自动压缩修正（JPEG 质量 82），不会阻塞流水线。

### 联网操作强制使用 web-access

**规则**：流水线中所有需要联网的操作（包括但不限于 URL 内容获取、联网搜索、背景资料查询、作者/公司/概念背景调研等）**只能通过 web-access 技能完成**。

**适用场景**：
- Step 1 资料收集：URL 内容获取（第一级）、联网搜索
- Step 2 文章创作前的背景调研（如有需要）
- 任何其他需要访问互联网的操作

**搜索引擎**：所有搜索操作**始终访问 google.com/ncr**，不得跳过或替换。

**禁止**：使用任何 MCP 搜索工具、WebFetch、WebParser、WebSearch 或其他网络工具替代 web-access。

### Gemini 后端强制居中构图

**现象**：Gemini 生成的 16:9 插图元素全部居中，两侧留暗边。

**原因**：Gemini 3.1 Flash Image Preview 的构图行为天然居中。

**解决**：修改 prompt 中的构图概念——使用水平分割、左右对比、时间轴等天然适配居中布局的概念。反复重试 prompt 无效，必须改变视觉概念本身。详见 `.agents/skills/wechat-article-write/references/image-backends.md`。

### DashScope 内容审核过严

**现象**：Step 4 插图或 Step 4.5 信息图使用 DashScope 后端时，prompt 中包含安全类术语（如"零日漏洞""安全审计"）触发 DataInspectionFailed 错误，即使改用温和措辞（"代码安全审计"→"代码质量检查"）仍可能失败。

**原因**：DashScope 的内容审核策略比 Gemini 和 Seedream 更严格，对网络安全、安全漏洞等话题敏感度高。

**解决**：按图片后端优先级 Gemini > Seedream > DashScope 自动降级。DashScope 审核失败后自动切换到 Seedream 或 Gemini，不需要用户确认。信息图因包含大量中文文本时才考虑 DashScope，但审核失败同样自动降级。

### macOS sed 多表达式限制

**现象**：`sed -i '' 's|a|b|g; s|c|d|g'` 在 macOS 上报错 `newline can not be used as a string delimiter`。

**原因**：macOS 使用 BSD sed，不支持 `;` 分隔多个替换命令。

**解决**：每个替换用独立的 `sed -i ''` 命令，或用 `-e` 逐个指定：
```bash
sed -i '' -e 's|a|b|g' -e 's|c|d|g' article.html
```

### CWD 敏感性

**现象**：在 bash 中 `cd` 到子目录后，Edit 工具找不到文件（报 "File does not exist"）。

**原因**：Edit 工具和某些脚本对 CWD 敏感，不跟随 shell 的 `cd`。

**解决**：
- Edit 工具始终使用绝对路径（`/Users/lx/Projects/ntlx.github.io/posts/.../file.md`）
- 运行脚本前先 `cd` 回项目根目录，或用绝对路径传参
- 避免在脚本调用链中间 `cd` 到子目录

### 图片后端选择策略

**优先级**：Gemini > Seedream > DashScope

**各后端特性**：

| 后端 | 优势 | 劣势 | 适用场景 |
|------|------|------|---------|
| Gemini | 稳定可用，速度快 | 16:9 居中构图，返回 JPEG 保存为 PNG | 默认首选，尤其适合场景类插图 |
| Seedream | 中文友好，审核较宽松 | 需要字节系 ARK API key | 中等审核风险的 prompt，Gemini 失败后的降级选择 |
| DashScope | 中文文本渲染最佳（qwen-image-2.0-pro） | 审核最严，安全类术语易触发拦截 | 信息图（大量中文文本），且 prompt 无安全敏感词时 |

**降级规则**：任何后端失败后，自动切换到下一个优先级重试同一 prompt，最多遍历全部三个后端。全部失败才报告错误。
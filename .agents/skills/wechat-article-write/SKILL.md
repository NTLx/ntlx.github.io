---
name: wechat-article-write
version: "1.5.0"
author: NTLx
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
- **策略驱动**：Steps 1-3 的行为由策略文件决定（Step 0 选择），Steps 4-6 不受策略影响
- **图片后端从 EXTEND.md 读取**：Step 4 开始前，Agent 必须读取 `.baoyu-skills/baoyu-image-gen/EXTEND.md` 的 `preferred_image_backend` 值，作为文生图 provider。Step 4 失败时只用该 provider 重试，**不要自动降级到其他后端**
- **封面不使用文字**：封面是视觉锤，文字交给推送卡片
- **分类全自动**：suggest-category.mjs 提供推荐；低置信度（top-2 分差 < 15%）时，Agent 先结合标题、summary、materials 和正文自行裁决，并在过程或最终说明中记录理由。仅当 Agent 仍无法判断且当前运行时具备用户确认工具时才询问用户；不得因为确认工具不可用而阻塞端到端发布
- **信息图默认生成**：SLOT 00 不是可选的——它是文章视觉摘要的默认组件
- **金句摘要硬性必填**：frontmatter `summary` 是微信草稿箱 digest 字段的唯一来源，必须是一句"金句"式摘要（≤120 字）。publish-wechat.mjs 缺 summary 直接 fail
- **字数控制委托给 ljg-writes**：ljg-writes 技能内置 1000-1500 字自律约束，本管线不再叠加字数门槛。管线脚本仅记录 word_count 供状态查询，不作为通过/失败条件
- **原文链接必填**：微信公众号草稿必须把博客文章公网地址作为"原文链接"（`content_source_url`）。sourceUrl 在 Step 2 预先写入，Step 6.2 必须传给微信 API
- **图片 prompt 必须从技能模板构建**：baoyu 系列技能的 prompt 模板包含针对特定模型的渲染指令。跳过模板手写 prompt 会导致文字模糊或变形
- **正文图片文字默认中文**：信息图和文内插图中的可见文字（标题、标签、短句、图例）应尽量使用中文。只有模型名、产品名、论文名、API/代码标识、英文缩写、引用原文术语等不适合翻译的专有内容才保留原文
- **微信公众号样式必须从项目级配置读取**：Step 5 默认必须使用 `.baoyu-skills/baoyu-markdown-to-html/EXTEND.md` 的 `default_theme` / `default_color`。不要凭经验传 `--theme default --color blue` 等硬编码参数；这会覆盖项目级主题样式。

## 配置文件

baoyu 系列技能的配置在项目级 `.baoyu-skills/{skill-name}/EXTEND.md`（git 跟踪），密钥在项目级 `.baoyu-skills/.env`（已被 `.gitignore` 忽略，不进 git）。

**Agent 行为规范**：
- 项目级 EXTEND.md 已存在，直接使用已有偏好，**不要触发首次设置流程**
- 调用 baoyu 系列技能时，确保从项目级 `.baoyu-skills/.env` 读取环境变量
- Step 4 图片后端、Step 5 微信 HTML 主题、Step 6 微信作者/评论等配置都优先读取项目级 `.baoyu-skills/{skill}/EXTEND.md`
- `config-lib.mjs` 在脚本启动时自动读取项目级配置。CLI 只用于用户明确要求的临时覆盖；不要把旧示例或个人偏好写成 CLI 参数。

### 配置读取硬规则

| 阶段 | 配置来源 | Agent 行为 |
|---|---|---|
| Step 4 图片生成 | `.baoyu-skills/baoyu-image-gen/EXTEND.md` 的 `preferred_image_backend` | 先读取再生成；失败只用该 provider 重试 |
| Step 5 微信 HTML 样式 | `.baoyu-skills/baoyu-markdown-to-html/EXTEND.md` 的 `default_theme` / `default_color` | 默认不传 `--theme` / `--color`，让脚本读取项目配置 |
| Step 6 微信草稿 | `.baoyu-skills/baoyu-post-to-wechat/EXTEND.md` 的作者、评论、发布方式配置 | 默认不传样式参数；只传发布输入和必要 sourceUrl |

**当前项目样式约定**（以 EXTEND.md 为权威；此处只说明意图）：微信 HTML 应走 `baoyu-markdown-to-html` 的项目级主题（如 `grace` / `vermilion`），而不是 `baoyu-post-to-wechat` 的 `default` / `blue`。二者服务不同阶段，不能混用。

Skill 脚本查找优先级：项目级 `.agents/skills/` > 用户级 `~/.claude/skills/` > 全局插件。

## Python 运行环境规范

本项目采用 **uv 管理的项目级虚拟环境** 解决 Python 工具依赖。Agent 调用任何 Python 脚本（包括 skill 验证脚本、维护脚本、一次性检查脚本）时，默认必须使用项目根目录下的 `.venv/bin/python`，或在项目根目录使用 `uv run python ...`；不要使用系统 Python，也不要为了补依赖执行全局或用户级 `pip install`。

示例：

```bash
.venv/bin/python /home/lx/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  /home/lx/ntlx.github.io/.agents/skills/wechat-article-write
```

若 `.venv` 不存在，先在项目根目录运行 `uv sync` 恢复环境，再执行 Python 脚本。Bun/Node 脚本仍按本技能各阶段说明使用 `bun run`。

## 第三方技能本地补丁记录

`baoyu-post-to-wechat` 是通过 `npx skills` 管理的第三方技能，升级后可能覆盖本地改动。当前项目依赖下列补丁：

- 基准版本：`baoyu-post-to-wechat` SKILL frontmatter `version: 1.118.0`
- 补丁文件：`.agents/skills/baoyu-post-to-wechat/scripts/wechat-api.ts`
- 补丁内容：支持 CLI 参数 `--source-url`，并在调用微信公众号草稿 API 时写入 `content_source_url`
- 调用方：`scripts/publish-wechat.mjs` 从 `article.md` frontmatter 读取 `sourceUrl`，传给 `wechat-api.ts --source-url`

升级第三方技能后必须复查：

```bash
rg -n "source-url|content_source_url|sourceUrl" \
  .agents/skills/baoyu-post-to-wechat/scripts/wechat-api.ts \
  .agents/skills/wechat-article-write/scripts/publish-wechat.mjs
```

## 流水线概览

> 发布顺序：先博客后微信。博客 commit/push 触发 GitHub Pages 部署在前，微信草稿在后。sourceUrl 在 Step 2 写作时预先填入，并在 Step 6.2 作为微信公众号"原文链接"传入。

| Step | 动作 | 执行者 | 说明 |
|------|------|--------|------|
| 0 | 文章类型判定 | Agent | 选择策略文件 |
| 1-3 | 内容创作 | Agent | 按策略文件执行 |
| Split | 多文章拆分评估 | Agent | Step 1 后判断是否拆分为多篇（见 Split Decision 章节） |
| 4 | 图片生成 | Agent 主会话串行 + 脚本门控 | 逐张 Bash 执行 |
| 5 | 产物构建 | 脚本 | 不变 |
| 6 | 双轨发布 | 脚本 | 不变 |

## date-slug 与 blog-slug

**date-slug**（`posts/` 下本地目录名，允许中文）：
1. 取标题前 30 字符 → 移除非 `[a-zA-Z0-9一-龥-]` 字符 → 连续空白转 hyphen → 截首尾 hyphen → 前加 `YYYY-MM-DD-`

**blog-slug**（博客 URL，必须纯 ASCII kebab-case）：
1. 由 `suggest-category.mjs` 根据文章主题自动生成（2-4 个英文关键词）
2. 必须符合 `^[a-z][a-z0-9-]*[a-z0-9]$`
3. 低置信度时由 Agent 结合文章语义自行裁决；只有 Agent 仍无法判断且运行时支持确认时才向用户确认

**示例**：
```
date-slug: 2026-05-29-社会科学中的编程智能体
blog-slug:  coding-agents-social-sciences
```

---

## Step 0: 文章类型判定与策略选择

**在进入任何 Step 前执行。**

1. 分析当前写作任务的用户意图和材料性质
2. 列出 `references/strategies/` 目录下的可用策略（文件名即策略名）
3. 按以下决策树选择策略：

```
用户提供了原始材料（URL/文件）且期望"读后感"？
  → reader-response

用户提供了已完成的文章内容（博客草稿/已有文档）且期望"转公众号/配图发布"？
  → tutorial

用户要求"AI 资讯简报"或"新闻汇总"？
  → news-digest（⚠️ experimental，需用户确认）

无法确定？
  → 默认 reader-response，并向用户确认
```

4. 读取选定的策略文件（`references/strategies/{strategy}.md`），按其中定义的 Steps 1-3 执行
5. 策略文件中的每个 Step 声明为以下三种行为之一：
   - `full`：执行完整流程
   - `skip`：跳过此步骤
   - `custom`：执行策略中定义的自定义行为

**关键约束**：
- 策略文件只影响 Steps 1-3（内容创作），Steps 4-6（工程管线）不受影响
- Agent 必须在进入 Step 1 之前完成策略选择
- 如果不确定策略选择，**必须**向用户确认，不得自行假设

## Split Decision: 多文章拆分评估

**在 Step 1 完成后、Step 2 开始前执行。** 当材料丰富度和价值密度超出单篇 ljg-writes 文章（1000-1500 字）的承载能力时，Agent 应有意识地判断是否拆分为多篇文章。

### 为什么需要拆分判断

ljg-writes 的自律约束保证每篇文章有锋利的观点和紧凑的篇幅。但如果调研材料包含多个相互独立、各有深度的主题，硬塞进一篇反而会稀释每个论点的穿透力。拆分不是"写更多字"，而是"让每篇文章更有力"。

### 评估标准

审视 materials.md，回答：用一篇 ljg-writes 文章能把最有价值的信息都传达给读者吗？

- **信息丰富度**：材料是否包含 3 个以上相互独立的、各有深度的主题/论点？
- **价值密度**：每个主题是否都值得独立展开（而非一句话带过）？
- **主题独立性**：拆分后每篇文章是否能独立成立、有自洽的论证链？

### 决策流程

1. **单篇足够** → 继续正常 Step 2
2. **多篇更优** → 向用户提出拆分方案，包括：
   - 每篇文章的主题和核心论点
   - 每篇文章覆盖的材料范围
   - 建议的发布顺序
3. **用户确认后** → 为每篇文章创建独立的 `posts/{date-slug}/` 目录
4. 每篇文章从 Step 2 开始独立走完整管线（含双轨发布）

### 拆分执行

- 将 materials.md 复制到每个目录，各篇只引用相关部分
- 每篇文章独立选择策略（不必与原文相同）
- 每篇文章独立生成 blog-slug、封面、插图
- 建议按逻辑关系排列发布顺序，但不强制
- 每篇文章拥有完全独立的状态文件，与单篇文章管线无差异

---

## Steps 1-3: 按策略文件执行

读取 Step 0 选定的策略文件，按其定义的 Steps 1-3 执行。策略文件位于 `references/strategies/` 目录：

| 策略 | 文件 | 适用场景 |
|------|------|---------|
| reader-response | `references/strategies/reader-response.md` | 读后感/深度分析 |
| tutorial | `references/strategies/tutorial.md` | 教程/配置指南 |
| news-digest | `references/strategies/news-digest.md` | 资讯简报（⚠️ experimental） |

---

## Step 4: 图片生成

**角色分工**：Agent 负责调用 baoyu 子技能 *走完其完整 prompt 构建流程*，生成符合规范的 prompt 文件；然后在主会话中用 Bash 串行调用 baoyu-image-gen 逐张生成图片。**Agent 不得绕过技能模板手写 prompt**。

### 为什么必须用技能模板

baoyu 系列技能的 prompt 模板包含针对特定文生图模型的渲染指令：

| 模板元素 | 所在文件 | 缺失后果 |
|----------|---------|---------|
| `ALL text hand-lettered — no computer fonts` | infographic styles | 文字变形、不可读 |
| `Text should be large and prominent` | article-illustrator prompt-construction | 文字过小、与背景混淆 |
| `Color values are rendering guidance only — do NOT display hex codes as visible text` | article-illustrator prompt-construction | 画面上出现色值标签污染 |
| `Clean composition with generous white space` | article-illustrator prompt-construction | 信息密度过高、阅读困难 |
| 精确 hex 色值（如 `#F5F0E6`, `#E07A5F`） | 各 style 文件 | 颜色偏差、对比度不足 |

### 整体流程

```
读取 EXTEND.md 确认 provider
  → 运行 generate-image-prompts.mjs 读取 baoyu 模板并生成规范 prompt 文件
  → Agent 审核 prompt；必要时按模板微调，不得绕过模板重写
  → 主会话 Bash 串行生成图片（逐张执行，失败的每张最多重试 1 次）
  → step4-images.mjs 门控校验
```

### Prompt 生成脚本

默认先运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/generate-image-prompts.mjs <date-slug>
```

脚本会按 Skill 查找优先级解析 baoyu 模板目录（项目级 `.agents/skills/` 优先），生成封面、SLOT 00 信息图和 SLOT 01+ 文内插图 prompt。若 prompt 文件已存在，脚本默认跳过；需要重新生成时显式传 `--overwrite`。

Agent 必须审核脚本输出是否满足下方质量检查清单。若脚本生成的文章语义不够精准，只允许在生成出的 prompt 文件上按 baoyu 模板补充内容，不要绕过模板手写一份全新的 prompt。

### 手工 fallback：按图片类型走对应的 prompt 构建流程

#### 信息图（SLOT_IMG_00）：使用 baoyu-infographic 技能模板

1. 按 Skill 查找优先级解析 `baoyu-infographic` 目录，读取以下模板文件（项目级 `.agents/skills/` 优先）：
   - `references/base-prompt.md`
   - `references/layouts/bento-grid.md`
   - `references/styles/craft-handmade.md`

2. 按 `base-prompt.md` 模板填充：`{{LAYOUT}}` → bento-grid、`{{STYLE}}` → craft-handmade、`{{LAYOUT_GUIDELINES}}` → 从布局文件复制完整段落、`{{STYLE_GUIDELINES}}` → 从风格文件复制完整段落、`{{LANGUAGE}}` → Chinese、`{{CONTENT}}` → 从 draft.md 提取核心数据点、`{{TEXT_LABELS}}` → 中文短标签列表。可见文字优先中文；仅保留模型名、产品名、API、代码标识、英文缩写等不适合翻译的专有名词

3. 保存到 `imgs/prompts/00-infographic-core-summary.md`

#### 文内插图（SLOT_IMG_01-05）：使用 baoyu-article-illustrator 技能模板

1. 按 Skill 查找优先级解析 `baoyu-article-illustrator` 目录，读取 `references/prompt-construction.md`
2. 为每张图选择匹配的 type 模板（对比 → Comparison、流程/架构 → Framework/Flowchart、数据 → Infographic）
3. 每个 prompt 文件必须包含：`## Default Composition Requirements`、`## Text in Illustrations`、`## Color Specification Rules` 段落
4. 色彩使用 `vector-illustration` 风格的精确 hex 色值（从 `references/styles/vector-illustration.md` 读取）
5. `## Text in Illustrations` 段落必须明确：可见文字使用中文标签和中文短句；专有名词、模型名、产品名、API/代码标识、英文缩写、引用原文术语可保留原文；不要为追求英文视觉风格而把普通概念写成英文
6. 保存到 `imgs/prompts/{编号}-{描述}.md`

#### 封面（cover.png）：使用 baoyu-cover-image 技能模板

1. 封面不使用文字（`--text none`）
2. 按 Skill 查找优先级解析 `baoyu-cover-image` 目录，读取 `references/workflow/prompt-template.md`
3. 按模板创建 `imgs/prompts/00-cover-{slug}.md`
4. 生图输出必须保存到 post 根目录 `cover.png`（即 `posts/{date-slug}/cover.png`），不要保存到 `imgs/cover.png`。`imgs/` 只放 `SLOT_IMG_*` 对应的正文图片
5. 风格参数：type=conceptual, palette=cool, rendering=flat-vector, mood=bold

#### Prompt 质量检查清单（生成图片前必须逐项确认）

- [ ] 每个 prompt 文件包含文字渲染指令（large, prominent, readable）
- [ ] 信息图和文内插图的可见文字默认中文；仅专有名词、模型名、产品名、API/代码标识、英文缩写、引用原文术语保留原文
- [ ] 每个 prompt 文件包含防渲染污染指令（不显示 hex 色值/色名）
- [ ] 每个 prompt 文件包含干净构图指令（clean composition, white space）
- [ ] 每个 prompt 文件使用精确 hex 色值
- [ ] 信息图 prompt 包含完整的 Layout/Style Guidelines 段落

#### 执行生成：主会话 Bash 串行

在主会话中直接用 Bash 逐张串行执行生图命令。不使用 subagent（避免模型路由 503 和超时问题）。

**步骤**：

1. 读取 provider：
   ```bash
   PROVIDER=$(grep 'preferred_image_backend' /home/lx/ntlx.github.io/.baoyu-skills/baoyu-image-gen/EXTEND.md | head -1 | awk '{print $2}')
   ```

2. 加载环境变量：
   ```bash
   set -a && source /home/lx/ntlx.github.io/.baoyu-skills/.env && set +a
   ```

3. 遍历 `imgs/prompts/` 下所有 prompt 文件，逐张生成：
   ```bash
   bun /home/lx/ntlx.github.io/.agents/skills/baoyu-image-gen/scripts/main.ts \
     --promptfiles {prompt文件的绝对路径} \
     --image {输出图片的绝对路径} \
     --provider $PROVIDER \
     --ar {ar值，默认16:9}
   ```
   其中封面输出路径必须是 `posts/{date-slug}/cover.png`，正文图片输出路径必须是 `posts/{date-slug}/imgs/{编号}-{描述}.png`。

4. 每张图生成后检查文件是否已创建且大小 > 0。失败的图片最多重试 1 次，仍然失败则标记并继续下一张。

**约束**：
- 逐张串行执行，不并行。图片 API 有速率限制，串行保证稳定
- 每张图最多重试 1 次，不要反复重试同一张图浪费额度
- 封面和正文图片的输出路径不同，注意区分

#### 门控脚本

```bash
bun run .agents/skills/wechat-article-write/scripts/step4-images.mjs <date-slug>
```

脚本执行：缺 draft.md/cover 直接 fail → 统一格式检测修正 → SLOT-only 强制校验 → SLOT_IMG 与 imgs/ 一一对应 → 信息图位置约束。全部通过写状态。

---

## Step 5: 产物构建

**脚本**（一键完成，无需 agent 干预）：
```bash
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs <date-slug> \
  [--dry-run] [--reuse-image-map]
```
脚本执行：读取项目级 `baoyu-markdown-to-html/EXTEND.md` 主题配置 → 预检 → 从 `.github-image-hosting.env` 读取图床仓库配置 → 上传图片到 GitHub 图床（自带超时重试，最多 3 次） → 占位符替换为 CDN URL → article.md → 占位符替换为本地路径 → baoyu-markdown-to-html → article-wechat.html → 验证 → img 标签规范化 → 写状态。

辅助模式：`--dry-run`（只预检不上传）、`--reuse-image-map`（复用已有 image-map.json，跳过上传）。

### CDN 上传超时处理

图床上传（`github-image-hosting` 的 `upload.ts`）需要拉取远端仓库文件树做冲突检测，在网络不稳定时可能触发 `spawnSync gh ETIMEDOUT`。这是瞬态网络问题，不是配置错误。

**处理策略**（已内置于脚本，无需 agent 干预）：
1. **upload.ts 内部**：网络超时自动重试 2 次（指数退避），文件树拉取超时 60s
2. **step5-build.mjs 层面**：如果整个上传进程失败，最多重试 3 次，间隔 30s
3. **部分成功后续跑**：如果 `image-map.json` 已经写入（检查文件是否存在且包含所有图片的 CDN URL），使用 `--reuse-image-map` 跳过上传直接进入后续步骤
4. **不要修改 upload 脚本**：`github-image-hosting` 是自建技能（`author: NTLx`），可以直接修改，但改动应通用而非 wechat 专属

临时覆盖主题/颜色只有在用户明确要求时才允许：

```bash
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs <date-slug> \
  --theme <theme> --color <color> --allow-style-override
```

未带 `--allow-style-override` 时，脚本会拒绝与项目级 EXTEND.md 不一致的 `--theme` / `--color`，防止 Agent 无意覆盖微信公众号主题样式。

---

## Step 6: 双轨发布

**发布顺序**：先博客后微信。

### 6.1 博客发布

```bash
bun run .agents/skills/wechat-article-write/scripts/publish-blog.mjs \
  --post-dir posts/{date-slug} [--target-path <path>] [--overwrite]
```

脚本读取 `article.md` frontmatter → 确定目标路径 → frontmatter 转换 → 写入目标文件 → astro sync + build → git add + commit + push。

**目标路径优先级**：CLI `--target-path` > frontmatter `targetPath` > 默认 `articles/{blogSlug}`。覆盖已有文件前自动备份。

### 6.2 微信发布（API only）

```bash
bun run .agents/skills/wechat-article-write/scripts/publish-wechat.mjs \
  --post-dir posts/{date-slug}
```

脚本执行：pre-flight（cover + article-wechat.html + sourceUrl + summary）→ summary 缺失直接 fail → 将 sourceUrl 作为微信"原文链接"传给 wechat-api.ts → 调用微信官方 API 发布草稿 → 写状态。

### 最小编排器

```bash
bun run .agents/skills/wechat-article-write/scripts/pipeline.mjs <date-slug>        # 查看状态
bun run .agents/skills/wechat-article-write/scripts/pipeline.mjs <date-slug> --auto  # 自动执行确定性步骤
```

---

## 失败处理

任何步骤失败时：
1. 报告哪一步失败、错误原因
2. 图片生成失败只允许用 EXTEND.md 配置的 provider 重试；不要降级到其他后端。每张图最多重试 1 次
3. 图床上传 ETIMEDOUT：upload.ts 和 step5-build.mjs 已内置多层重试（见 Step 5 "CDN 上传超时处理"）。若仍失败，检查 `gh auth status` 和网络连接。若 `image-map.json` 已完整写入，用 `--reuse-image-map` 跳过上传
4. 依赖缺失：脚本会自动 `bun install`；若自动安装失败则手动安装
5. `state.mjs next <date-slug>` 返回下一个待执行步骤，全部完成返回 `done`
6. Step 6 博客/微信子状态独立查询：`state.mjs blog/wechat <slug> get`

## 门控脚本常见错误速查

门控脚本的错误信息描述了"缺什么"，但格式类校验的正则和条件判断藏在源码中。以下列出常见错误及其修复方式，避免每次都去读脚本源码。

### step2-write.mjs

| 错误信息 | 期望格式 | 修复方式 |
|---------|---------|---------|
| `缺少文末互动问题` | 正则 `/(^\|\n)\s*\*[^*\n]{4,}[？?]\*\s*$/m` | 在正文末尾添加一行：`*你的提问内容？*`（单行、星号包裹的斜体、以中文问号结尾、至少 4 个字符） |
| `summary 超过 120 字` | ≤120 字的金句式摘要 | 这是 WARNING 不阻塞，但微信 digest 会截断。精简到核心洞察的一句话 |
| `summary 看起来像内容简介` | 不以"本文介绍了…"开头 | 改为概括核心洞察或最反直觉结论的金句 |
| `blogSlug 不符合 ASCII kebab-case` | `^[a-z][a-z0-9-]*[a-z0-9]$` | 纯小写 ASCII + 数字 + 连字符，首尾必须是字母或数字。示例：`coding-agents-social-sciences` |
| `sourceUrl 不合法` | `https://ntlx.github.io/articles/{blogSlug}` | 必须是博客文章的完整公网 URL，且与 blogSlug 一致 |

### step3-polish.mjs

step3 复用 step2 的大部分校验逻辑（frontmatter 完整性、H1 检测、SLOT_IMG 占位符、互动问题、原文参考），错误信息格式相同。如果 step3 报了和 step2 一样的错，说明 humanizer/format-markdown 后处理过程中丢失了某些内容。

### 通用排查原则

如果门控脚本报了一个你不熟悉的错误，先读脚本源码中的校验函数（通常在文件前 50 行的 `validate` / `check` 函数中），找到对应的正则或条件判断，再对照正文修复。错误信息中的"当前值"和"阈值"可以直接用于定位问题。

## 已知约束

- **正文禁止 H1**：Starlight 自动渲染 title 为 H1，正文 `# ` 会双标题
- **图片必须 CDN URL**：博客文章中 `imgs/...` 本地路径会导致 Astro 构建失败
- **GitHub 上传禁止中文 name**：`--name` 使用纯 ASCII slug
- **CWD 敏感**：Edit 工具用绝对路径，脚本调用前确保在项目根目录
- **图片生成串行执行**：主会话 Bash 逐张串行生成图片，不使用 subagent。provider 从 EXTEND.md 的 `preferred_image_backend` 读取。每张图最多重试 1 次
- **封面不嵌入文字**：封面是视觉锤，文字交给推送卡片和正文标题

## 工具索引

### 核心脚本

大多数脚本的第一个位置参数是 `<date-slug>`（`posts/` 下的目录名）。以下表格标注例外情况。

| 脚本 | 用途 | 参数签名 |
|------|------|---------|
| `scripts/step1-collect.mjs` | Step 1: 资料验证 + 状态 | `<date-slug> [--sources N] [--failed N]` |
| `scripts/step2-write.mjs` | Step 2: 质量门控 + 状态 | `<date-slug> [--allow-no-references] [--allow-no-interaction]` |
| `scripts/step3-polish.mjs` | Step 3: 后处理验证 + 状态 | `<date-slug>` |
| `scripts/generate-image-prompts.mjs` | Step 4 helper: 生成图片 prompt | `<date-slug> [--overwrite]` |
| `scripts/step4-images.mjs` | Step 4: 格式修正 + 引用验证 + 状态 | `<date-slug>` |
| `scripts/step5-build.mjs` | Step 5: CDN + HTML 转换 + 状态 | `<date-slug> [--dry-run] [--reuse-image-map] [--theme T --color C --allow-style-override]` |
| `scripts/publish-blog.mjs` | Step 6.1: 博客发布编排 | `<date-slug> [--target-path P] [--overwrite] [--no-push] [--no-build] [--dry-run]` 或 `--post-dir <path>` 替代 date-slug |
| `scripts/publish-wechat.mjs` | Step 6.2: 微信草稿编排 | `<date-slug> [--type news\|newspic] [--author N]` 或 `--post-dir <path>` 替代 date-slug |
| `scripts/state.mjs` | 状态 CLI | `<command> <date-slug> [args...]`；command: init/get/next/done/fail/blog/wechat/dump |
| `scripts/pipeline.mjs` | 最小编排器 | `<date-slug> [--auto]` |

### ⚠️ 参数风格例外的脚本

以下 3 个脚本**不**以 `<date-slug>` 作为第一个参数，调用时注意区分：

| 脚本 | 用途 | 参数签名 | 第一个参数语义 |
|------|------|---------|-------------|
| `scripts/suggest-category.mjs` | 分类 + blog-slug 推荐 | `<draft.md 绝对路径> [--json]` | **文件路径**（draft.md 的绝对路径，不是 date-slug） |
| `scripts/set-frontmatter.mjs` | Frontmatter 读写 | `<file> set\|remove\|get <key> [value]` | **文件路径** + subcommand 风格（如 `set category ai-coding`，不是 `category=ai-coding`） |
| `scripts/normalize-image-formats.mjs` | MIME 检测 + 扩展名修正 | `<postDir 绝对路径> [--dry-run]` | **目录绝对路径**（不是 date-slug） |

### 辅助库（不直接调用，被其他脚本 import）

| 脚本 | 职责 |
|------|------|
| `scripts/config-lib.mjs` | 配置解析（EXTEND.md / .env） |
| `scripts/state-lib.mjs` | 状态读写 |
| `scripts/path-resolver.mjs` | 路径解析（date-slug → 绝对路径） |
| `scripts/validation-lib.mjs` | 共享验证常量（VALID_CATEGORIES / ASCII_SLUG_RE）与字数统计 |
| `scripts/frontmatter-lib.mjs` | 共享 frontmatter 解析（parseFrontmatter / readFmValue / extractBody） |
| `scripts/apply-image-map.mjs` | 占位符替换；两种模式：`<date-slug>` 或 `--html-rewrite <html-path> <image-map.json>` |

### 参考文档
| 文件 | 内容 |
|------|------|
| `references/strategies/*.md` | 文章类型策略文件（Steps 1-3 定义） |
| `references/category-keywords.json` | 6 分类关键词/反关键词 |
| `references/image-backends.md` | 各图片后端构图特性与 prompt 策略 |
| `references/image-template-catalog.md` | 内容类型→图片模板组合映射规则 |

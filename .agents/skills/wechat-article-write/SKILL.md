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
- **策略驱动**：Steps 1-3 的行为由策略文件决定（Step 0 选择），Steps 4-6 不受策略影响
- **图片后端固定为 OpenAI**：文内插图、信息图和封面必须使用 OpenAI。Step 4 失败时只重试 OpenAI，**不要自动降级到其他后端**
- **封面不使用文字**：封面是视觉锤，文字交给推送卡片
- **分类全自动**：suggest-category.mjs 推荐，低置信度（top-2 分差 < 15%）时询问用户
- **信息图默认生成**：SLOT 00 不是可选的——它是文章视觉摘要的默认组件
- **金句摘要硬性必填**：frontmatter `summary` 是微信草稿箱 digest 字段的唯一来源，必须是一句"金句"式摘要（≤120 字）。publish-wechat.mjs 缺 summary 直接 fail
- **原文链接必填**：微信公众号草稿必须把博客文章公网地址作为"原文链接"（`content_source_url`）。sourceUrl 在 Step 2 预先写入，Step 6.2 必须传给微信 API
- **图片 prompt 必须从技能模板构建**：baoyu 系列技能的 prompt 模板包含针对特定模型的渲染指令。跳过模板手写 prompt 会导致文字模糊或变形

## 配置文件

baoyu 系列技能的配置在项目级 `.baoyu-skills/{skill-name}/EXTEND.md`（git 跟踪），密钥在项目级 `.baoyu-skills/.env`（已被 `.gitignore` 忽略，不进 git）。

**Agent 行为规范**：
- 项目级 EXTEND.md 已存在，直接使用已有偏好，**不要触发首次设置流程**
- 调用 baoyu 系列技能时，确保从项目级 `.baoyu-skills/.env` 读取环境变量
- `config-lib.mjs` 在脚本启动时自动读取项目级配置，CLI 参数可覆盖

Skill 脚本查找优先级：项目级 `.agents/skills/` > 用户级 `~/.claude/skills/` > 全局插件。

## 第三方技能本地补丁记录

`baoyu-post-to-wechat` 是通过 `npx skills` 管理的第三方技能，升级后可能覆盖本地改动。当前项目依赖下列补丁：

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

## 流水线概览

> 发布顺序：先博客后微信。博客 commit/push 触发 GitHub Pages 部署在前，微信草稿在后。sourceUrl 在 Step 2 写作时预先填入，并在 Step 6.2 作为微信公众号"原文链接"传入。

| Step | 动作 | 执行者 | 说明 |
|------|------|--------|------|
| 0 | 文章类型判定 | Agent | 选择策略文件 |
| 1-3 | 内容创作 | Agent | 按策略文件执行 |
| 4 | 图片生成 | Agent 派发 subagent + 脚本门控 | 最多 2 个 subagent 并行 |
| 5 | 产物构建 | 脚本 | 不变 |
| 6 | 双轨发布 | 脚本 | 不变 |

## date-slug 与 blog-slug

**date-slug**（`posts/` 下本地目录名，允许中文）：
1. 取标题前 30 字符 → 移除非 `[a-zA-Z0-9一-龥-]` 字符 → 连续空白转 hyphen → 截首尾 hyphen → 前加 `YYYY-MM-DD-`

**blog-slug**（博客 URL，必须纯 ASCII kebab-case）：
1. 由 `suggest-category.mjs` 根据文章主题自动生成（2-4 个英文关键词）
2. 必须符合 `^[a-z][a-z0-9-]*[a-z0-9]$`
3. 低置信度时与分类一起向用户确认

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
  → news-digest

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

## Steps 1-3: 按策略文件执行

读取 Step 0 选定的策略文件，按其定义的 Steps 1-3 执行。策略文件位于 `references/strategies/` 目录：

| 策略 | 文件 | 适用场景 |
|------|------|---------|
| reader-response | `references/strategies/reader-response.md` | 读后感/深度分析 |
| tutorial | `references/strategies/tutorial.md` | 教程/配置指南 |
| news-digest | `references/strategies/news-digest.md` | 资讯简报 |

---

## Step 4: 图片生成

**角色分工**：Agent 负责调用 baoyu 子技能 *走完其完整 prompt 构建流程*，生成符合规范的 prompt 文件；然后通过 Agent 工具派发 subagent（最多 2 个并行）来调用 baoyu-imagine 逐张生成图片。**Agent 不得绕过技能模板手写 prompt**。

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
确认 OpenAI 后端
  → 调用 baoyu 子技能（走完整 prompt 构建流程）为每张图生成规范 prompt 文件
  → 主 Agent 直接派发 subagent 生成图片（每次最多 2 个并行，完成后立即派发下一批）
  → 失败的图片由主 Agent 重新派发 subagent 重试（最多 1 次）
  → step4-images.mjs 门控校验
```

**⛔ 禁止事项**：
- **不要创建 `batch.json`** —— 这个文件已从流程中完全移除
- **不要使用 `--batchfile` 参数** —— baoyu-imagine 的批量模式不适用于本流程
- **不要调用 `step4-generate.mjs`** —— 这个脚本已被删除

原因：subagent 模式下，每张图由独立的 subagent 生成，具有更好的失败隔离和额度控制。使用 batch.json 会导致脚本级别的超时和重试，浪费 API 额度。

### Agent 动作：按图片类型走对应的 prompt 构建流程

#### 信息图（SLOT_IMG_00）：使用 baoyu-infographic 技能模板

1. 读取 `baoyu-infographic` 的以下模板文件（绝对路径）：
   - `.claude/skills/baoyu-infographic/references/base-prompt.md`
   - `.claude/skills/baoyu-infographic/references/layouts/bento-grid.md`
   - `.claude/skills/baoyu-infographic/references/styles/craft-handmade.md`

2. 按 `base-prompt.md` 模板填充：`{{LAYOUT}}` → bento-grid、`{{STYLE}}` → craft-handmade、`{{LAYOUT_GUIDELINES}}` → 从布局文件复制完整段落、`{{STYLE_GUIDELINES}}` → 从风格文件复制完整段落、`{{CONTENT}}` → 从 draft.md 提取核心数据点、`{{TEXT_LABELS}}` → 短标签列表

3. 保存到 `imgs/prompts/00-infographic-core-summary.md`

#### 文内插图（SLOT_IMG_01-05）：使用 baoyu-article-illustrator 技能模板

1. 读取 `.claude/skills/baoyu-article-illustrator/references/prompt-construction.md`
2. 为每张图选择匹配的 type 模板（对比 → Comparison、流程/架构 → Framework/Flowchart、数据 → Infographic）
3. 每个 prompt 文件必须包含：`## Default Composition Requirements`、`## Text in Illustrations`、`## Color Specification Rules` 段落
4. 色彩使用 `vector-illustration` 风格的精确 hex 色值（从 `references/styles/vector-illustration.md` 读取）
5. 保存到 `imgs/prompts/{编号}-{描述}.md`

#### 封面（cover.png）：使用 baoyu-cover-image 技能模板

1. 封面不使用文字（`--text none`）
2. 读取 `.claude/skills/baoyu-cover-image/references/workflow/prompt-template.md`
3. 按模板创建 `imgs/prompts/00-cover-{slug}.md`
4. 风格参数：type=conceptual, palette=cool, rendering=flat-vector, mood=bold

#### Prompt 质量检查清单（派发 subagent 前必须逐项确认）

- [ ] 每个 prompt 文件包含文字渲染指令（large, prominent, readable）
- [ ] 每个 prompt 文件包含防渲染污染指令（不显示 hex 色值/色名）
- [ ] 每个 prompt 文件包含干净构图指令（clean composition, white space）
- [ ] 每个 prompt 文件使用精确 hex 色值
- [ ] 信息图 prompt 包含完整的 Layout/Style Guidelines 段落

#### 执行生成：Agent 派发 subagent

**调度规则**：从 `imgs/prompts/` 目录下的 prompt 文件列表构建任务清单，每次派发最多 **2 个 subagent**（使用 Agent 工具），完成后立即派发下一批。失败的图片重新派发 1 次（同样限 2 并行）。

**每个 subagent 的 prompt 模板**：

```
生成一张图片。请严格按以下步骤执行：

1. 加载环境变量：`set -a && source /home/lx/ntlx.github.io/.baoyu-skills/.env && set +a`
2. 运行生图命令：
   bun /home/lx/ntlx.github.io/.agents/skills/baoyu-imagine/scripts/main.ts \
     --promptfiles {prompt文件的绝对路径} \
     --image {输出图片的绝对路径} \
     --provider openai \
     --ar {ar值，默认16:9}
3. 确认图片文件已生成（检查文件大小 > 0）
4. 报告结果：成功返回图片路径，失败返回错误信息

注意：不要修改 prompt 文件内容，直接读取使用。超时设为 5 分钟。
```

**调度伪代码**：

```
pending = imgs/prompts/ 下所有 prompt 文件构建的任务列表
while pending 非空:
    取 pending 前 2 个（或剩余全部）
    并行派发 Agent subagent（每个生成 1 张图）
    等待 subagent 完成
    检查失败项 → 失败的重新入队（标记已重试，仅重试 1 次）
    已完成 → 从 pending 移除
```

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
  [--theme default] [--color blue] [--dry-run] [--reuse-image-map]
```
脚本执行：预检 → 上传图片到 GitHub 图床 → 占位符替换为 CDN URL → article.md → 占位符替换为本地路径 → baoyu-markdown-to-html → article-wechat.html → 验证 → img 标签规范化 → 写状态。

辅助模式：`--dry-run`（只预检不上传）、`--reuse-image-map`（复用已有 image-map.json，跳过上传）。

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
2. 图片生成失败只允许用 OpenAI 重试；不要降级到其他后端
3. 图床上传失败：修复后重跑 Step 5；若 `image-map.json` 已完整，用 `--reuse-image-map`
4. 依赖缺失：脚本会自动 `bun install`；若自动安装失败则手动安装
5. `state.mjs next <date-slug>` 返回下一个待执行步骤，全部完成返回 `done`
6. Step 6 博客/微信子状态独立查询：`state.mjs blog/wechat <slug> get`

## 已知约束

- **正文禁止 H1**：Starlight 自动渲染 title 为 H1，正文 `# ` 会双标题
- **图片必须 CDN URL**：博客文章中 `imgs/...` 本地路径会导致 Astro 构建失败
- **GitHub 上传禁止中文 name**：`--name` 使用纯 ASCII slug
- **CWD 敏感**：Edit 工具用绝对路径，脚本调用前确保在项目根目录
- **图片生成 subagent 派发**：主 Agent 派发 subagent 生成图片，每批最多 2 个并行。每个 subagent 独立调用 baoyu-imagine，失败隔离，避免单脚本超时导致额度浪费
- **封面不嵌入文字**：封面是视觉锤，文字交给推送卡片和正文标题

## 工具索引

### 核心脚本
| 脚本 | 用途 |
|------|------|
| `scripts/step1-collect.mjs` | Step 1: 资料验证 + 状态 |
| `scripts/step2-write.mjs` | Step 2: 质量门控 + 状态 |
| `scripts/step3-polish.mjs` | Step 3: 后处理验证 + 状态 |
| `scripts/step4-images.mjs` | Step 4: 格式修正 + 引用验证 + 状态 |
| `scripts/step5-build.mjs` | Step 5: CDN + 占位符替换 + HTML 转换 + 状态 |
| `scripts/publish-blog.mjs` | Step 6.1: 博客发布编排 |
| `scripts/publish-wechat.mjs` | Step 6.2: 微信草稿编排 |
| `scripts/state.mjs` | 状态 CLI（init/get/next/done/fail/blog/wechat/dump） |
| `scripts/config-lib.mjs` | 配置解析 |
| `scripts/state-lib.mjs` | 状态读写库 |
| `scripts/path-resolver.mjs` | 路径解析 |
| `scripts/suggest-category.mjs` | 分类 + blog-slug 推荐 |
| `scripts/set-frontmatter.mjs` | Frontmatter 读写 |
| `scripts/normalize-image-formats.mjs` | MIME 检测 + 扩展名修正 |
| `scripts/apply-image-map.mjs` | 占位符 → CDN URL / 本地路径 |
| `scripts/pipeline.mjs` | 最小编排器 |

### 参考文档
| 文件 | 内容 |
|------|------|
| `references/strategies/*.md` | 文章类型策略文件（Steps 1-3 定义） |
| `references/category-keywords.json` | 6 分类关键词/反关键词 |
| `references/image-backends.md` | 各图片后端构图特性与 prompt 策略 |

---
name: wechat-article-write
description: >
  End-to-end WeChat Official Account article writing and dual publishing (blog + WeChat).
  Takes raw materials (text, URLs, direction) and produces a complete article with cover,
  infographic, illustrations, and publishes to both blog (Astro Starlight) and WeChat
  Official Account drafts. Use when user says "写公众号文章", "公众号推文", "wechat article",
  "wechat-article-write", "公众号", "微信文章", or wants to create, illustrate, format,
  and publish a WeChat Official Account article. 6-stage pipeline: collect → write → polish →
  images → build → publish. Publishes blog first, then WeChat draft.
user_invocable: true
---

# 微信公众号文章写作

6 步流水线：资料收集 → 文章创作 → 文本后处理 → 图片生成 → 产物构建 → 双轨发布。

**双轨分离**：博客轨消费 Markdown + CDN URL（Astro Starlight 直接构建），微信轨消费本地 HTML + 本地图片（wechat-api.ts 直接读文件上传）。两轨零共享中间产物。

## 核心原则

- **全自动执行**：中间步骤不停顿，全部完成后展示结果。仅在分类低置信度时询问用户
- **失败不阻塞**：某步失败报告错误，询问是否继续
- **脚本化**：所有校验和文件操作封装在 `scripts/` 下。Agent 负责调用脚本 + 解读退出码；禁止内联超过 5 行的 bash/python
- **联网唯一入口 web-access**：所有联网操作（搜索、抓取、资料获取）只通过 web-access Skill 完成。搜索用 `google.com/ncr`
- **图片后端优先级**：Gemini > Seedream > DashScope。失败自动降级
- **Gemini 格式陷阱**：Gemini 返回 JPEG 但保存为 .png。Step 4 统一修正
- **封面不使用文字**：封面是视觉锤，文字交给推送卡片
- **分类全自动**：suggest-category.mjs 推荐，低置信度（top-2 分差 < 15%）时询问用户
- **信息图非强制**：agent 判断是否需要，不需要可跳过

## 配置文件路径

| 配置类型 | 路径 | 说明 |
|---------|------|------|
| EXTEND.md（偏好） | `.baoyu-skills/{skill-name}/EXTEND.md` | 项目级，git 跟踪 |
| .env（密钥） | `~/.baoyu-skills/.env` | 用户级，不进 git |

**配置读取机制**：`config-lib.mjs` 在脚本启动时自动读取 `.baoyu-skills/*/EXTEND.md` 的 frontmatter，解析为配置字典。脚本默认值由 config-lib 从 EXTEND.md 读取，CLI 参数仍可覆盖。不再在各脚本中硬编码 theme/color/author 等默认值。

**EXTEND.md 示例**：
- `baoyu-markdown-to-html` → `default_theme: grace`, `default_color: vermilion`
- `baoyu-post-to-wechat` → `default_author: NTLx`, `default_publish_method: api`
- `baoyu-cover-image` → `preferred_image_backend: baoyu-imagine`, `default_aspect: 2.35:1`

Skill 脚本查找优先级：项目级 `.agents/skills/` > 用户级 `~/.claude/skills/` > 全局插件。

## 流水线概览

> 发布顺序：先博客后微信。博客 commit/push 触发 GitHub Pages 部署在前，微信草稿在后。sourceUrl 在 Step 2 写作时预先填入，读者可能在 push 后 1-3 分钟内遇到 404（Pages 部署通常很快）。

| Step | 动作 | 使用技能 | 产出 | 脚本 |
|------|------|---------|------|------|
| 1 | 资料收集 | web-access | materials.md | step1-collect.mjs |
| 2 | 文章创作 | ljg-writes, suggest-category.mjs | draft.md（含 category + blogSlug） | step2-write.mjs |
| 3 | 文本后处理 | humanizer-zh, baoyu-format-markdown | draft.md（优化后） | step3-polish.mjs |
| 4 | 图片生成 | baoyu-cover-image, baoyu-article-illustrator, baoyu-infographic（并行） | cover.png + imgs/*.png | step4-images.mjs |
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
- URL 内容通过 **Skill 工具调用 web-access** 获取
- 联网搜索通过 web-access 访问 `google.com/ncr`
- 所有资料合并写入 `posts/{date-slug}/materials.md`，每份资料间用 `---` 分隔，标注来源

**脚本**：
```bash
bun run .agents/skills/wechat-article-write/scripts/step1-collect.mjs <date-slug> \
  [--sources <成功数> --failed <失败数>]
```
脚本验证 materials.md 存在且非空，低质量检测（字数 < 200 打印警告，非阻塞），写状态。

---

## Step 2: 文章创作

**Agent 动作**：
1. 通过 **Skill 工具调用 ljg-writes**，传入：
   - 资料内容：`posts/{date-slug}/materials.md`
   - 扩展模式：目标 2500-3500 字（材料丰富则 3500-5000），字数下限 2500 硬门控
   - 数据点列表（从材料中提取，≥ 5 个）
   - 必须包含文末互动 + 原文参考区块
2. 保存 ljg-writes 输出为 `posts/{date-slug}/draft.md`
3. 运行 `suggest-category.mjs` 获取推荐分类和 blog-slug
4. 信任度低时用 `AskUserQuestion` 确认分类和 blog-slug；否则自动采纳
5. 用 `set-frontmatter.mjs` 写入 category 和 blogSlug

**draft.md 模板**（强制使用语义占位符）：
```markdown
---
title: {标题}
date: {YYYY-MM-DD}
summary: {一句话 ≤ 60 字}
category: {6 枚举之一}
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

**脚本**：
```bash
bun run .agents/skills/wechat-article-write/scripts/step2-write.mjs <date-slug> [--allow-no-references]
```
脚本校验：字数 ≥ 2500、frontmatter 完整（title/date/summary/category/coverImage/sourceUrl）、文末互动存在、无 H1、正文含 `## 原文参考`（默认强制，`--allow-no-references` 跳过）。materials.md 中的 URL 未在正文引用的打印 warning。任一不通过 exit 非零。

---

## Step 3: 文本后处理

**Agent 动作**：
1. 通过 **Skill 工具调用 humanizer-zh** 处理 `posts/{date-slug}/draft.md` 正文
2. 通过 **Skill 工具调用 baoyu-format-markdown** 格式化 `posts/{date-slug}/draft.md`

处理范围为正文内容（frontmatter 之后，原文参考之前）。语义占位符 `<!-- SLOT_IMG_ -->` 是 HTML 注释，humanizer-zh 和格式化都不会修改它们。

**脚本**：
```bash
bun run .agents/skills/wechat-article-write/scripts/step3-polish.mjs <date-slug>
```
脚本验证 draft.md 存在、非空，并**复验关键质量门控**（frontmatter 完整、无 H1、SLOT_IMG 占位符存在、字数 ≥ 2500、原文参考存在）。任一不通过 fail。

---

## Step 4: 图片生成

**Agent 动作**（并行执行）：
在同一消息中发起三个 Agent 调用，均设置 `run_in_background: true`：

| Agent | Skill | 产出 | 参数要点 |
|-------|-------|------|---------|
| A | baoyu-cover-image | `posts/{date-slug}/cover.png` | 默认 `--text none`，类型/风格按标题自动选择 |
| B | baoyu-infographic | `posts/{date-slug}/imgs/00-infographic-core-summary.png` | aged-academia + bento-grid + 16:9（agent 判断可跳过） |
| C | baoyu-article-illustrator | `posts/{date-slug}/imgs/01-*.png, 02-*.png, ...` | density=balanced，3-5 张 |

确认所有 Agent 完成后执行脚本。

**脚本**：
```bash
bun run .agents/skills/wechat-article-write/scripts/step4-images.mjs <date-slug>
```
脚本执行：缺 draft.md/cover 直接 fail → 统一格式检测修正（MIME/扩展名不匹配）→ 更新 coverImage 扩展名 → **SLOT-only 强制校验**（draft 中不得含 `![](imgs/...)` 本地引用）→ SLOT_IMG 与 imgs/ 文件一一对应校验 → 信息图位置约束（`SLOT_IMG_00_INFOGRAPHIC` 须在正文前 200 字符内）。全部通过写状态。

---

## Step 5: 产物构建

**脚本**（一键完成，无需 agent 干预）：
```bash
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs <date-slug>
```
脚本执行：
1. 上传 `imgs/*` 到 GitHub 图床 → image-map.json
2. 将 draft.md 占位符替换为 CDN URL → article.md
3. 将 draft.md 占位符替换为本地路径（内存中） → 调用 baoyu-markdown-to-html → article-wechat.html
4. 验证: article.md 无占位符残留、无本地路径；article-wechat.html 非空、含 inline CSS、无 SLOT 残留、无空 img src
5. 写状态

---

## Step 6: 双轨发布

**发布顺序**：先博客后微信。

### 6.1 博客发布

```bash
bun run .agents/skills/wechat-article-write/scripts/publish-blog.mjs \
  --post-dir posts/{date-slug} \
  --blog-slug {ascii-slug}
```

脚本职责：frontmatter 转换（summary→description, +$schema, -coverImage/-sourceUrl）→ 目标文件防覆盖检查 → astro sync + build → 分支检查（非 main 拒绝）→ git add + commit + push。push 失败写 RESUME.md + 标记 blocked。

额外选项：`--overwrite`（允许覆盖已有文章）、`--allow-non-main`（允许在非 main 分支发布）、`--dry-run`。

### 6.2 微信发布

```bash
bun run .agents/skills/wechat-article-write/scripts/publish-wechat.mjs \
  --post-dir posts/{date-slug}
```

脚本职责：pre-flight（cover + article-wechat.html + sourceUrl）→ 从 article.md 读取 title/summary → 调用 baoyu-post-to-wechat 发布草稿 → 写状态。

theme/color/author 默认值从 `.baoyu-skills/baoyu-markdown-to-html/EXTEND.md` 和 `.baoyu-skills/baoyu-post-to-wechat/EXTEND.md` 自动读取，无需手动传入。CLI 参数仍可覆盖。

---

## 失败处理

任何步骤失败时：
1. 报告哪一步失败、错误原因
2. 图片后端降级（Gemini > Seedream > DashScope）自动执行，不需确认
3. 图床上传失败：重试 1 次 → 仍失败则询问是否跳过
4. 其他失败：询问是否继续。用户选择「停止」则保存中间产物和状态，报告进度
5. `state.mjs next <date-slug>` 返回下一个待执行步骤，全部完成时返回 `done`
6. Step 6 发布分为博客和微信两个子状态：`state.mjs blog` 和 `state.mjs wechat` 独立管理，一方失败不阻塞另一方

## 已知约束

- **正文禁止 H1**：Starlight 自动渲染 title 为 H1，正文 `# ` 会双标题
- **图片必须 CDN URL**：博客文章中 `imgs/...` 本地路径会导致 Astro 构建失败
- **GitHub 上传禁止中文 name**：`--name` 使用纯 ASCII slug
- **macOS sed** 不支持 `;` 分隔多替换，用 `-e` 逐个指定
- **CWD 敏感**：Edit 工具用绝对路径，脚本调用前确保在项目根目录

## 图片后端策略

| 后端 | 优势 | 劣势 | 适用 |
|------|------|------|------|
| Gemini | 稳定快速 | 16:9 居中构图，返回 JPEG 存为 PNG | 默认首选 |
| Seedream | 中文友好，审核较宽松 | 需要 ARK API key | 降级备选 |
| DashScope | 中文文本渲染最佳 | 审核最严 | 信息图（无安全敏感词时） |

降级链：Gemini → Seedream → DashScope → 全部失败报告错误。

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
| `scripts/state.mjs` | 状态 CLI（next/set/get） |
| `scripts/config-lib.mjs` | 配置解析（从 baoyu EXTEND.md 读取 theme/color/author 等） |
| `scripts/state-lib.mjs` | 状态读写库（含 Step 6 博客/微信子状态） |
| `scripts/path-resolver.mjs` | 路径解析（内部模块） |
| `scripts/suggest-category.mjs` | 分类 + blog-slug 推荐 |
| `scripts/set-frontmatter.mjs` | Frontmatter 读写 |
| `scripts/normalize-image-formats.mjs` | MIME 检测 + 扩展名修正 |
| `scripts/apply-image-map.mjs` | 占位符 → CDN URL / 本地路径 |

### 参考文档
| 文件 | 内容 |
|------|------|
| `references/category-keywords.json` | 6 分类关键词/反关键词（suggest-category.mjs 数据源） |
| `references/image-backends.md` | 各图片后端构图特性与 prompt 策略 |
| `references/known-issues.md` | 历史已知问题与解决方案 |
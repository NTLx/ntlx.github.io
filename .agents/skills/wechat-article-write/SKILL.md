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

- **确定性步骤自动化**：Step 5/6 由脚本执行；Step 1-4 由 Agent 完成智能判断后运行脚本门控
- **失败可恢复**：某步失败报告错误并写状态；`state.mjs next <date-slug>` 返回续跑位置
- **脚本化**：所有校验和文件操作封装在 `scripts/` 下。Agent 负责调用脚本 + 解读退出码；禁止内联超过 5 行的 bash/python
- **联网唯一入口 web-access**：所有联网操作（搜索、抓取、资料获取）只通过 web-access Skill 完成。搜索用 `google.com/ncr`
- **图片后端优先级**：按 `.baoyu-skills/baoyu-imagine/EXTEND.md` 中 `preferred_image_backend` 配置，失败自动降级（降级链见「图片后端策略」）。**禁止使用未配置的后端**（如 minimax、openai 等）
- **Gemini 格式陷阱**：Gemini 返回 JPEG 但保存为 .png。Step 4 统一修正
- **封面不使用文字**：封面是视觉锤，文字交给推送卡片
- **分类全自动**：suggest-category.mjs 推荐，低置信度（top-2 分差 < 15%）时询问用户
- **信息图默认生成**：除非用户明确表示不需要，否则每次写作都应生成信息图。SLOT 00 不是可选的——它是文章视觉摘要的默认组件
- **金句摘要硬性必填**：frontmatter `summary` 是微信草稿箱 digest 字段的唯一来源，必须是一句"金句"式摘要（≤120 字），概括文章核心洞察或最反直觉的结论，而非平淡的内容简介。Step 2 写作时必须生成，publish-wechat.mjs 缺 summary 直接 fail

## 配置文件

baoyu 系列技能的配置在项目级 `.baoyu-skills/{skill-name}/EXTEND.md`（git 跟踪），密钥在 `~/.baoyu-skills/.env`（不进 git）。

**Agent 行为规范**：
- 项目级 EXTEND.md 已存在，直接使用已有偏好，**不要触发首次设置流程**
- **不要去 `~/.baoyu-skills/` 找 EXTEND.md**——那里只有 `.env` 密钥文件
- `config-lib.mjs` 在脚本启动时自动读取项目级配置，CLI 参数可覆盖

Skill 脚本查找优先级：项目级 `.agents/skills/` > 用户级 `~/.claude/skills/` > 全局插件。

## 流水线概览

> 发布顺序：先博客后微信。博客 commit/push 触发 GitHub Pages 部署在前，微信草稿在后。sourceUrl 在 Step 2 写作时预先填入，读者可能在 push 后 1-3 分钟内遇到 404（Pages 部署通常很快）。

| Step | 动作 | 使用技能 | 产出 | 脚本 |
|------|------|---------|------|------|
| 1 | 资料收集 | web-access | materials.md | step1-collect.mjs |
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
   - 扩展模式：目标 2000-3500 字（材料丰富则 3500-5000），字数下限 2000 硬门控
   - **必须明确强调字数下限 2000 字**：ljg-writes 自身默认 1000-1500 字，与本管线要求冲突。在 prompt 中使用"字数下限 2000 字，不可低于此数"覆盖 ljg-writes 的默认约束
   - 数据点列表（从材料中提取，≥ 5 个）
   - 必须包含文末互动 + 原文参考区块
   - **同时规划插图占位符位置**：按 SLOT_IMG 编号规则（见下方）在写作时插入语义占位符。**SLOT 00 信息图占位符必须插入**（位置在 frontmatter 之后、正文第一个段落之前），不得跳过
   - **必须生成金句式 summary**：在 frontmatter summary 字段写一句 ≤ 120 字的金句式摘要，概括文章核心洞察或最反直觉的结论。不要写平淡内容简介（如"本文介绍了…"），而要写让人想点进来的那句话。summary 是微信草稿箱 digest 字段的唯一来源，publish-wechat.mjs 缺 summary 直接 fail
2. 保存 ljg-writes 输出为 `posts/{date-slug}/draft.md`
3. 运行 `suggest-category.mjs` 获取推荐分类和 blog-slug
4. 信任度低时用当前运行时的用户确认工具确认分类和 blog-slug；否则自动采纳
5. 用 `set-frontmatter.mjs` 写入 category、blogSlug，并确保 sourceUrl 与 blogSlug 一致

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

**脚本**：
```bash
bun run .agents/skills/wechat-article-write/scripts/step3-polish.mjs <date-slug>
```
脚本验证 draft.md 存在、非空，并**复验关键质量门控**（frontmatter 完整、blogSlug/sourceUrl 一致、无 H1、SLOT_IMG 占位符存在、字数 ≥ 2000、原文参考存在）。任一不通过 fail。

**字数弹性门控**：humanizer-zh 精简是预期行为。字数 ≥ 1800 但 < 2000 时，脚本打印 WARNING 并通过（输出含 `word_count_warning: true`），Agent 应补充 1-2 段落使字数达到 2000+；字数 < 1800 时 fail（说明文章本身内容不足，需回到 Step 2 补充）。

---

## Step 4: 图片生成

信息图和封面必须通过对应的 baoyu 技能生成（`baoyu-infographic` / `baoyu-cover-image` / `baoyu-article-illustrator`），不要手写 prompt 直调 `baoyu-imagine`。子技能会自动读取项目级 EXTEND.md 确定风格、布局和后端。

**Agent 动作**：

1. 读取 `.baoyu-skills/baoyu-imagine/EXTEND.md` 获取 `preferred_image_backend` 和降级链
2. 调用子技能生成图片（封面 → `cover.png`，信息图 → `imgs/00-*.png`，插图 → `imgs/01-*.png` 等）
3. 为每张图创建 prompt 文件到 `imgs/prompts/`，并编写 `imgs/batch.json`
4. 运行 `step4-generate.mjs` 执行批量生成（自动处理失败重试和后端降级）

| 技能 | 产出 | 参数要点 |
|------|------|---------|
| baoyu-cover-image | `posts/{date-slug}/cover.png` | 默认 `--text none`，封面不使用文字 |
| baoyu-infographic | `posts/{date-slug}/imgs/00-infographic-core-summary.png` | bento-grid + craft-handmade + 16:9 |
| baoyu-article-illustrator | `posts/{date-slug}/imgs/01-*.png, 02-*.png, ...` | density=balanced，vector-illustration 风格 |

**批量生成脚本**：
```bash
bun run .agents/skills/wechat-article-write/scripts/step4-generate.mjs <date-slug> [--jobs N]
```
脚本读取 `imgs/batch.json` → 跳过已有图片 → 调用 baoyu-imagine batch → 失败项逐个重试（原 prompt → 降级 provider）。退出码：0 全部成功，4 部分失败。

**门控脚本**（图片生成完毕后运行）：
```bash
bun run .agents/skills/wechat-article-write/scripts/step4-images.mjs <date-slug>
```
脚本执行：缺 draft.md/cover 直接 fail → 统一格式检测修正（MIME/扩展名不匹配）→ 更新 coverImage 扩展名 → **SLOT-only 强制校验**（draft 中不得含 `![](imgs/...)` 本地引用）→ SLOT_IMG 与 imgs/ 文件一一对应校验 → 信息图位置约束（`SLOT_IMG_00_INFOGRAPHIC` 须在正文前 200 字符内）。全部通过写状态。

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

脚本职责：pre-flight（cover + article-wechat.html + sourceUrl + **summary**）→ 从 article.md 读取 title/summary → **summary 缺失直接 fail**（微信草稿箱 digest 必填，空摘要等于推文卡片没文字）→ 自动安装 baoyu-post-to-wechat 依赖（node_modules 缺失时 `bun install`）→ 调用 `wechat-api.ts` 通过微信官方 API 发布草稿 → 写状态。

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
2. 图片后端降级由 `step4-generate.mjs` 自动执行（降级链见下方「图片后端策略」），不需确认
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

## 图片后端策略

| 后端 | 优势 | 劣势 | 适用 |
|------|------|------|------|
| DashScope | 中文文本渲染最佳，信息图效果好 | 审核最严 | 默认首选，信息图、插图 |
| Google (Gemini) | 稳定快速 | 16:9 居中构图，返回 JPEG 存为 PNG；免费层配额有限 | 降级备选 |
| Seedream | 中文友好，审核较宽松 | 需要 ARK API key | 最后备选 |

降级链：DashScope → Google → Seedream → 全部失败报告错误。

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

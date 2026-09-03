---
name: wechat-article-write
description: >
  Orchestrates this repository's WeChat + blog article workflow. Use when
  creating or resuming an article, producing its required visuals, building
  the dual blog/WeChat artifacts, or publishing the blog and WeChat draft.
license: MIT
metadata:
  author: NTLx
  version: "2.2.0"
---

# 微信公众号文章写作

这是仓库级薄编排 Skill：负责顺序、项目边界和 Gate；专业子任务由对应 Skill
完整执行。统一原则是 Native Delegation：传递任务所需上下文，让被委托 Skill
拥有自己的分析、选择、prompt、生成和报告流程。

## Start or resume

1. 读取 `posts/<date-slug>/.pipeline-state.json`。没有 state 时，确定日期、ASCII
   `date-slug`、strategy（`reader-response`、`tutorial` 或 `news-digest`），创建
   `posts/<date-slug>/` 并运行：

   ```bash
   bun run .agents/skills/wechat-article-write/scripts/state.mjs init <date-slug>
   ```

2. 已有 state 从 `state.mjs next <date-slug>` 指定的 Step 继续。状态仍使用 v2；
   `publish.blog` 与 `publish.wechat` 可以独立恢复。

完成条件：state 有效，strategy 已记录，新任务的 `date-slug` 与 post 目录已确定，
当前待执行 Step 唯一明确。

## Workflow

### Step 1 — Research

把原始材料、用户目标、必要的背景和时效信息整理为
`posts/<date-slug>/materials.md`。按实际缺口自然使用当前可发现的研究能力；
只有能补齐事实、来源或理解的能力才调用。区分事实、推断和作者判断，进入文章的
外部事实保留可追溯 URL。完成后运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/step1-collect.mjs <date-slug>
```

完成条件：`materials.md` 非空，所有准备进入正文的重要外部事实可追溯，事实/推断/作者判断可区分，且 Step 1 Gate 通过。

### Step 1.5 — Blog memory

运行现有站内文章检索：

```bash
bun run .agents/skills/wechat-article-write/scripts/select-related-articles.mjs <date-slug>
```

写作时消费生成的 `blog-memory.md`；没有合适关联内容时在该记忆文件中明确记录。

完成条件：当前文章已有可消费的站内记忆，或文件明确记录没有合适关联内容。

### Step 1.8 — Understand

仅当 strategy 或任务需要深度理解时生成 `understanding-brief.md`。Agent 可以
原生分析，或委托一个匹配的专业 Skill；把材料结构、核心问题、中心判断、机制、
边界、反方、可写判断、可视觉化节点和至少三条可检查的原创增量压缩进 brief。
需要理解规范时读取 `references/material-understanding.md`，然后运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/validate-understanding.mjs <date-slug>
```

完成条件：brief 足以直接支持写作，核心小节均有内容或明确写“未发现”及原因，原创增量承诺可逐条检查，且 understanding Gate 通过。

### Step 2 — Draft

生成 `draft.md`。Agent 或匹配的写作 Skill 负责正文；父 Skill 负责仓库适配：
frontmatter、`summary`、`blogSlug`、`sourceUrl`、H2、引用与 URL、SLOT、站内关联和
strategy 约束。需要正文规则时读取 `references/content-invariants.md` 与对应的
`references/strategy-*.md`。

`SLOT_IMG_00` 必须恰好一次，位于第一个 substantive H2 前，并是正文第一张视觉。
正文 generated SLOT 只在确有视觉信息增益时创建，编号为 `01..N`，数量允许为 0..N。
此时只校验 draft topology；最终资产事实在 Step 4 写入 `image-plan.json`。

```bash
bun run .agents/skills/wechat-article-write/scripts/step2-write.mjs <date-slug>
```

完成条件：`draft.md` 完整，frontmatter、H2、链接、互动、引用、SLOT topology 与站内记忆约束通过 Step 2 Gate。

### Step 3 — Native Humanization

`humanizer-zh` 对正常文章 mandatory。读取并完整执行
`.agents/skills/humanizer-zh/SKILL.md`，给它以下 capsule：

```text
目标：去除 draft.md 中的 AI 写作痕迹，使文本自然，同时保持作者已有声音。
保持：事实、数字、术语、URL、直接引语、代码、frontmatter、H2 顺序和 SLOT topology 的语义不变。
输入：当前 draft.md。
输出：更新后的 draft.md。
```

完成后审阅 diff：检查 semantic drift、数字、URL、技术结论、H2、SLOT 和第一人称事实，
再运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/step3-polish.mjs <date-slug>
```

该 Gate 将当前 `draft.md` SHA256 写入 state v2 的 `step3_draft_sha256`。Step 4/5
只比较当前 draft 与此 hash；变化时回到 Step 3，重新委托 humanizer-zh 并重审。

完成条件：humanizer-zh 已处理当前 draft，semantic drift 已审阅，Step 3 Gate 通过，state 记录当前 draft hash。

### Step 4 — Illustrate

需要图片时读取 `references/image-policy.md`；需要修改长期图片默认偏好时，读取并编辑对应 `.baoyu-skills/<skill>/EXTEND.md`。按顺序一次处理一张：

1. 需要 cover 时原生委托 `baoyu-cover-image`：传入最终 draft，以及等价于 `--quick --aspect 2.35:1 --no-title` 的子 Skill 参数；项目 backend override 为 `baoyu-image-gen --provider codex-cli`，输出 post 根目录唯一 cover。
2. 原生委托 `baoyu-xhs-images` 生成唯一的 `SLOT_IMG_00`：传入全文，以及等价于 `--yes --batch-size 1` 的子 Skill 参数；让它按项目配置自行选择 style/layout/palette/preset、生成 prompt 和 raster，输出 `imgs/00-infographic-core-summary.png`。
3. 每个 generated `SLOT_IMG_01+` 单独原生委托 `baoyu-infographic`：传入对应正文语境、关系、必要背景、输出路径和 backend override，以及等价于 `--no-confirm` 的参数；由它自行选择 layout/style。完成并实际查看一张后再处理下一张。
4. 只有确有 architecture、flow、sequence、state、data flow 或 topology 需求时，才按需委托 `baoyu-diagram` 辅助形成结构；最终正文 raster 仍交给 `baoyu-infographic`。
5. `prefer-reuse` 时先审阅来源材料中的可用原图；把最终事实写入最小 `image-plan.json`，不记录 prompt、producer、contributors 或视觉 receipt。

专业 Skill 完整拥有 analyze → style/layout/preset → prompt → raster → report 流程。父 Skill 不重建 prompt、不集中渲染，也不建立调用证明。

完成后运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/step4-images.mjs <date-slug>
```

完成条件：根目录恰好一个 cover 且像素比例满足 `2.35:1 ±0.03`；SLOT00 恰好一个且 basename 正确；每个正文 SLOT 有且只有一个最终图片文件（或正文 SLOT 数量为 0）；`image-plan.json`、draft SLOT 和本地文件一致；每张图片已实际查看并通过语义、文字和构图审阅；Step 4 Gate 通过。

### Step 5 — Build

先读取 `references/publishing.md` 与需要时的 `references/adapter-gzh-design.md`。

#### Step 5A — 图片托管

由 Agent 原生读取并委托 `github-image-hosting`。传递最少的业务上下文：

```text
images: posts/<date-slug>/imgs/
folder: wechat-articles
prefix: <date-slug>-<blogSlug>-img
output: posts/<date-slug>/image-map.json
```

实际调用参数必须遵循 `github-image-hosting/SKILL.md` 的当前契约。该 Skill 自己负责
项目配置、GitHub repo、branch、远端状态、SHA、幂等、冲突、重试、CDN URL 和
`image-map.json`；父 Skill 不调用其 uploader，也不解析上传诊断输出。

#### Step 5B — 确定性文章构建

确认 Step 5A 已生成 `image-map.json` 后，运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs <date-slug> --prepare-only
```

脚本只读取并校验 `image-map.json`，将本地图片引用替换为 CDN URL 生成 `article.md`，
并生成 `article-wechat-source.md`。缺少 map 时 fail closed，并提示先完成
`github-image-hosting` 原生委托。随后由 Agent 原生委托 `gzh-design`，输入微信 source
和本地图片，输出 `article-wechat.html`；让 gzh-design 完整执行主题选择、组件装配、
validator 和预览流程。最后运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs <date-slug> --finalize-only
```

完成条件：`article.md`、`article-wechat-source.md`、`article-wechat.html` 均存在；substantive H2 顺序、paragraph/list/code semantics、图片 basename/order/section placement 和 lead visual 一致；gzh-design 已完成其 validator/preview，父层 structural/integrity Gate 通过。

### Step 6 — Publish

读取 `references/publishing.md`。先完成博客轨，再构建微信发布 capsule，由 Agent 原生委托
`baoyu-post-to-wechat`，成功后才 finalize 微信 state：

```bash
bun run .agents/skills/wechat-article-write/scripts/publish-blog.mjs <date-slug>
bun run .agents/skills/wechat-article-write/scripts/publish-wechat.mjs <date-slug> --prepare-only
# Agent native delegates baoyu-post-to-wechat
bun run .agents/skills/wechat-article-write/scripts/publish-wechat.mjs <date-slug> --finalize-only [--media-id <id>]
```

Agent 只传递最终 HTML、cover、title、summary、canonical author 和带 UTM 的 source URL；child
Skill 自己读取其 `SKILL.md` 与 project `EXTEND.md`，选择并执行发布方法。创建草稿不等于群发。
博客提交、push、站点 deploy 状态保持可区分。

完成条件：博客发布状态已记录且先于微信草稿完成；微信草稿状态已记录；失败任一侧都能通过 state v2 独立恢复。

## Native delegation

父 Skill 传递目标、输入、strategy、项目偏好、输出路径、backend override、子 Skill 原生的
非交互参数和验收边界。被委托 Skill 直接读取自己的 `SKILL.md`，完整执行自己的流程并写出
最终产物；父 Skill 只审阅结果并运行本仓库 Gate。研究和理解能力按实际缺口自然发现，父 Skill
不维护 catalog。

| 任务 | 原生 Skill | 父 Skill 传递的最小控制 |
|---|---|---|
| 文本人性化 | `humanizer-zh` | draft capsule；保持语义、frontmatter、H2 和 SLOT topology |
| 微信封面 | `baoyu-cover-image` | `--quick`、`--aspect 2.35:1`、`--no-title`、Codex backend override |
| 头部摘要卡 SLOT00 | `baoyu-xhs-images` | `--yes`、`--batch-size 1`、全文、目标路径、Codex backend override |
| 正文生成图 | `baoyu-infographic` | `--no-confirm`、当前正文语境、目标路径、Codex backend override |
| 微信 HTML | `gzh-design` | 微信 source、本地图片、目标路径、最终结构边界 |
| 图片托管/CDN | `github-image-hosting` | 图片目录、业务 folder、命名前缀、`image-map.json` 路径 |
| 微信草稿 | `baoyu-post-to-wechat` | 最终 HTML、cover、作者、source URL |

## Recovery

先运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/state.mjs next <date-slug>
bun run .agents/skills/wechat-article-write/scripts/pipeline.mjs <date-slug>
```

Gate 失败时读取实际错误，修正当前输入或回到对应委托；重新运行同一 Gate。用户指出 AI 味、生硬或不像作者时回到 Step 3；图片视觉问题回到同一图片 Skill regenerate。不要修改已通过的下游 artifact 来绕过上游 Gate。

## References

需要了解完整 Step 输入、输出和恢复关系时，读取 `references/pipeline-overview.md`。

需要写作 frontmatter、SLOT、链接、MDX 和双轨内容不变量时，读取 `references/content-invariants.md`。

需要选择 `reader-response`、`tutorial` 或 `news-digest` 编辑目标时，读取对应的 `references/strategy-*.md`。

需要生成 `understanding-brief.md` 时，读取 `references/material-understanding.md`。

需要决定复用原图、SLOT 命名和视觉验收时，读取 `references/image-policy.md`。

需要构建或 finalize 微信 HTML 时，读取 `references/adapter-gzh-design.md`。

需要发布博客或微信草稿时，读取 `references/publishing.md`。

需要落实原创增量和近期文章形式差异时，读取 `references/originality-policy.md`。

遇到 Gate、路径、图片或发布错误时，读取 `references/troubleshooting.md`。

---
name: wechat-article-write
description: >
  Use when creating, adapting, illustrating, building, or publishing WeChat
  Official Account articles from this repository, especially when the task
  involves raw materials, article drafts, blog/WeChat dual artifacts,
  "写公众号文章", "公众号推文", "wechat article", or the wechat-article-write pipeline.
license: MIT
metadata:
  author: NTLx
  version: "1.62.0"
---

# 微信公众号文章写作
本技能是博客 + 微信双轨管线的监督层。它固定文件协议、状态、Gate 和
发布顺序；内容理解、写作方法和专项视觉 contributor 按当前任务动态选择。

## 先读路由
| 任务 | 必读文件 |
|---|---|
| 完整写作/续跑 | `references/pipeline-overview.md` |
| Adaptive Stage 编排 | `references/orchestration-policy.md` |
| 三种编辑目标 | `references/strategy-{reader-response,tutorial,news-digest}.md` |
| 理解 brief 合同 | `references/material-understanding.md` |
| 正文和 frontmatter/SLOT 不变量 | `references/content-invariants.md` |
| 图片意图、命名和审核 | `references/image-policy.md` |
| 图片 provider 成本边界 | `references/image-backends.md` |
| 微信排版与发布 | `references/adapter-gzh-design.md`、`references/publishing.md` |
| 依赖和本地配置 | `references/dependency-manifest.md` |

## 不可变的工程协议

- state 使用现有 v2 数字 Step；续跑前先读 `state.mjs next`，不要从头重做。
- 博客轨消费 `article.md` 和 CDN 图片；微信轨消费
  `article-wechat.html` 和本地图片。两条产物不能混用。
- frontmatter、`summary`、`blogSlug`、`sourceUrl`、SLOT 占位符、图片命名、
  MDX 安全和链接双轨规则由确定性脚本校验。
- Step 5 的 prepare 先校验本地资产，再由 `github-image-hosting` 一次性发布
  `imgs/*` 并产出 `image-map.json`；随后生成 `article.md` 和
  `article-wechat-source.md`。最后由 `gzh-design` 排版并运行 finalize；不得用
  post 内自写渲染脚本替代它。
- 发布顺序固定为博客先行、微信草稿后行；两条状态可以独立恢复。
- 第三方 Skill 源码只读。运行时动态 catalog 发现普通能力；但
  `humanizer-zh` 是所有文章的 Mandatory Humanization Layer，不是开放式
  writing Router，必须在 Step 2 Gate 后、Step 3 Gate 前实际调用并登记 receipt；
  receipt 前先运行 `pre-humanizer-normalize.mjs`，receipt 后 `draft.md` 冻结到
  Step 5 finalize。
- `humanizer-zh` 只能去除 AI 写作痕迹、保留作者已有声音和技术准确性；不得凭空
  编造作者经历、态度或情绪，不得改事实、引用、URL、代码、H2 顺序或 SLOT topology。

## Adaptive Stage 规则

1. 读取当前 Stage Contract、输入、已有 artifacts 和上一 Gate 结果，先定义
   当前真正缺口。
2. 运行 metadata-only catalog：
   `bun run .agents/skills/wechat-article-write/scripts/skill-catalog.mjs --json`。
3. 不要根据 Skill 名称猜用途；先读 catalog description，只有入选少量候选
   后才读取完整 `SKILL.md` 及直接引用的配置。
4. 选择最小充分路线：普通 adaptive 方法可由 Agent 原生、单 Skill 或少量互补
   Skill 完成；no-skill 是合法路线。Mandatory protocol layers
   `humanizer-zh`、Mandatory Baoyu Visual Design 和 `gzh-design` 不能跳过。
5. Delegate 后把结果适配成 contract 要求的 artifact，运行对应 Gate；每次
   路线尝试完成 Gate 后都 best-effort 追加 orchestration trace。
6. Gate 失败时诊断后修输入、有限重试、换路线或由 Agent 补足；不得无脑
   重复，也不得绕过 Gate。trace 失败不影响 artifact、state 或 Gate。具体
规则见 `orchestration-policy.md`。
`illustrate` 是例外：coverage_review 由当前 wechat-article-write Agent 根据
draft、understanding-brief 和 source_image_review 自主完成。封面使用
`baoyu-cover-image`；`SLOT_IMG_00` 使用 `baoyu-xhs-images`；正文 SLOT 使用
`baoyu-infographic`。涉及架构、流程、时序、数据流或状态关系时，Agent 可从
catalog 选择 `baoyu-diagram`，但它只贡献结构语法，不生成 SVG/PNG，也不成为
最终 prompt authority。

## 图片视觉与成本硬约束

Baoyu Design Skills 负责视觉判断与 canonical prompt；可选 contributor 只补充
结构或设计意见。所有设计调用统一使用 DESIGN-ONLY MODE：不得调用 native
imagegen、GenerateImage、image_generate、API image provider、`baoyu-image-gen`
或输出最终 SVG/PNG。唯一 raster 链路是 `baoyu-image-gen` → `codex-cli`，唯一
执行器是集中式串行脚本。先运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/check-image-backend.mjs --runtime
```

Codex CLI 不可用、未登录或生成失败时，图片阶段必须 fail closed。允许在
同一路径内诊断、修改 prompt 和有限重试；禁止切换其它 provider，也不能
使用运行时原生 image generation 绕过配置。

不得由 Agent 并行调用生图、使用 batchfile、`--jobs` 或 `Promise.all`；必须先
物化全部 active canonical prompt，再执行：

```bash
bun run .agents/skills/wechat-article-write/scripts/render-images-serial.mjs <date-slug>
```

## 最小流程

Step 0 选策略；Step 1 收集材料；Step 1.5 生成站内记忆；Step 1.8/2
按策略完成理解或适配/写作；Step 3 先完成 pre-humanizer-normalize，再执行 mandatory humanizer-zh，随后针对实际问题
refine；用户指出“生硬、AI 味重、不像作者”等语言问题时，回到 draft.md 重新执行
Step 3。Step 4 由 Agent 为每个 substantive H2 完成 `coverage_review`（正文 SLOT
仍可为 0..N），再分别调用 cover、SLOT_IMG_00 和正文的固定 Baoyu producer。
SLOT_IMG_00 必须恰好一次、位于首个 substantive H2 前
并作为正文第一张视觉；Step 5 构建并校验双轨产物，gzh-design 可自由排版但必须
通过 structural parity；Step 6
按顺序发布。

## Step 5 阶段边界

Step 5 只把文章资产集合、业务目录和稳定命名前缀交给
`github-image-hosting`：

```bash
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs <date-slug> --prepare-only
```
prepare 会调用图床一次，使用 `--folder wechat-articles`、文章命名前缀和
`--output posts/<date-slug>/image-map.json`；图床 Skill 自己解析仓库/分支配置、
索引远端 blob、处理冲突、重试并生成真实 CDN URL。Step 5 不解析图床配置、不
拼 CDN URL、不维护上传重试或复用状态。`image-map.json` 仍是
“本地文件名 → CDN URL”的 flat map，旧的 `{ "files": ... }` 只作读取兼容。
`--dry-run` 只做 draft、cover、imgs、SLOT/local reference、image-review receipt、humanizer receipt
的本地校验，并报告图片数量、SLOT 数量、命名前缀和目标目录；不访问图床、不写
map、文章产物或 state。
Agent 调用 `gzh-design` 生成 `article-wechat.html` 后，运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs <date-slug> --finalize-only
```
finalize-only 先在本地检查 manifest、`draft.md`、image-plan 和 image-review 一致，再消费 `article.md`、
`article-wechat-source.md`、`article-wechat.html`，运行 gzh validator 与 structural
parity；它绝不调用 `github-image-hosting`，也不需要 GitHub 配置、CLI 或网络。协议可
安全重复，重复 finalize 始终是零图床调用；root cover 必须恰好一个，MIME/扩展名须在 receipt 前由 `pre-humanizer-normalize.mjs` 处理，Step 5 只校验不自动改名。

```bash
bun run .agents/skills/wechat-article-write/scripts/check-deps.mjs --stage all
bun run .agents/skills/wechat-article-write/scripts/state.mjs next <date-slug>
bun run .agents/skills/wechat-article-write/scripts/pipeline.mjs <date-slug>
```
完成或修复任何阶段后，重新运行该阶段 Gate，再继续 `pipeline.mjs`。

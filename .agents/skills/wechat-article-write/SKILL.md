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
  version: "1.54.0"
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
- Step 5 先产出 `article-wechat-source.md`，再由 `gzh-design` 排版，最后
  运行 finalize；不得用 post 内自写渲染脚本替代它。
- 发布顺序固定为博客先行、微信草稿后行；两条状态可以独立恢复。
- 第三方 Skill 源码只读。运行时动态 catalog 发现普通能力，不把认知/写作
  Skill 登记成固定流程依赖。

## Adaptive Stage 规则

1. 读取当前 Stage Contract、输入、已有 artifacts 和上一 Gate 结果，先定义
   当前真正缺口。
2. 运行 metadata-only catalog：
   `bun run .agents/skills/wechat-article-write/scripts/skill-catalog.mjs --json`。
3. 不要根据 Skill 名称猜用途；先读 catalog description，只有入选少量候选
   后才读取完整 `SKILL.md` 及直接引用的配置。
4. 选择最小充分路线：Agent 原生、单 Skill 或少量互补 Skill；no-skill 是
   合法路线。一个 Skill 已经能完成任务时，不再叠加其它 Skill，调用次数
   不是质量指标。
5. Delegate 后把结果适配成 contract 要求的 artifact，运行对应 Gate；每次
   路线尝试完成 Gate 后都 best-effort 追加 orchestration trace。
6. Gate 失败时诊断后修输入、有限重试、换路线或由 Agent 补足；不得无脑
   重复，也不得绕过 Gate。trace 失败不影响 artifact、state 或 Gate。具体
规则见 `orchestration-policy.md`。

`illustrate` 是例外：它必须先经过 Baoyu Core Design Skills，`no-skill` 只表示
没有额外 contributor。文章级规划使用 `baoyu-article-illustrator`；封面使用
`baoyu-cover-image`；`SLOT_IMG_00` 使用 `baoyu-infographic`。涉及架构、流程、
时序、数据流或状态关系时，Agent 可从 catalog 选择 `baoyu-diagram`，但它只
贡献结构语法，不生成 SVG/PNG，也不成为最终 prompt authority。

## 图片视觉与成本硬约束

Baoyu Core Design Skills 负责视觉判断与 canonical prompt；可选 contributor 只
补充结构或设计意见。高层设计委托统一使用 DESIGN-ONLY MODE：不得调用 native
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
按策略完成理解或适配/写作；Step 3 针对实际问题 refine；Step 4 先定
先运行 Baoyu article-level visual design，再分别完成 cover、SLOT_IMG_00 和正文
的 Baoyu 设计合同，最后生成 prompt 与图片；正文 SLOT 可以为零张，但
SLOT_IMG_00 必须存在且与 image-plan 一致；Step 5 构建并校验双轨产物；Step 6
按顺序发布。

```bash
bun run .agents/skills/wechat-article-write/scripts/check-deps.mjs --stage all
bun run .agents/skills/wechat-article-write/scripts/state.mjs next <date-slug>
bun run .agents/skills/wechat-article-write/scripts/pipeline.mjs <date-slug>
```

完成或修复任何阶段后，重新运行该阶段 Gate，再继续 `pipeline.mjs`。

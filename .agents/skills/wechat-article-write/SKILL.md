---
name: wechat-article-write
description: >
  Orchestrates this repository's WeChat + blog article workflow. Use when
  creating or resuming an article, producing its required visuals, building
  the dual blog/WeChat artifacts, or publishing the blog and WeChat draft.
license: MIT
metadata:
  author: NTLx
  version: "2.15.0"
---

# 微信公众号文章写作

这是仓库级薄编排 Skill：Main Agent 负责理解、战略判断、路由、dispatch 和 Gate 决策；Delegated
Executor 负责实际执行；Specialist Skill 负责专业能力；Script 负责确定性判断。所有实际产物、工具
调用、专业 Skill 和 deterministic command 都必须在与 Main 隔离的 execution context 中完成。

## Main execution boundary

Main owns understanding、strategy、routing、dispatch，以及 `proceed/retry/reroute/blocked` 决策。
Main MAY 读取 `.pipeline-state.json`、`understanding-brief.md` 和少量目标 artifact 片段，形成
中心判断并读取 bounded handoff。

Main MUST NOT directly execute actual work，包括：

- research、网页或媒体获取；
- `materials.md`、`draft.md` 或 HTML 的生产与专业修改；
- 图片生成、审阅或专业视觉处理；
- upload、publish、commit/push、build 和 Step scripts；
- child Skill 内部脚本或 Specialist Skill 调用。

Main 不把完整网页、研究笔记、HTML、image prompt、API 或上传日志带回自己的上下文。

## Delegated execution principle

Each actual execution unit must leave Main's principal context. Main dynamically chooses any
runtime-native isolated execution mechanism that satisfies the capability contract. 如果没有合适的隔离
机制，当前 unit 必须 `BLOCKED`；Main MUST NOT fallback to direct execution。声明 `REQUIRED SKILL` 的
unit 必须真实执行该 Skill 的 workflow，Main 按 handoff 的 `SKILL:` 行核验。

完整 isolation、capsule、handoff、retry、ownership 和 E2E protocol 见
`references/delegated-execution.md`。

## Start / Resume

Main 确定日期、ASCII `date-slug`、strategy（`reader-response`、`tutorial` 或 `news-digest`），读取
state summary，决定新建或恢复。隔离 `bootstrap/resume` Executor 运行 `state.mjs init <date-slug>`
或 `state.mjs next <date-slug>`。

state 始终为 v2；`publish.blog` 与 `publish.wechat` 可独立恢复。成功条件是 state 存在或可读取，
并返回唯一下一 unit。

## Workflow

每个 unit 使用 `ROLE / GOAL / INPUTS / REQUIRED SKILL / PROJECT CONTRACT / OUTPUT / GATE /
FORBIDDEN / FAILURE / RETURN` capsule，并只返回短 handoff。低风险、紧密的 deterministic units
可以在同一个 isolated Executor 中连续完成，但不得跨越 ownership、Gate 或 recovery boundary。

| Step | Main decides | Execution Unit / Skill | Output | Gate |
|---|---|---|---|---|
| 0 | strategy、新建或恢复 | `bootstrap/resume` | state v2 | state readable、唯一 next unit |
| 1 | research scope、研究缺口 | `research` / dynamic | `materials.md` | Step 1 |
| 1.5 | continue、update、remove source 或 block | `blog-memory` | memory artifacts | source uniqueness |
| 1.8 | central judgement、编辑方向 | `understanding` / dynamic | `understanding-brief.md` | understanding validator |
| 2 | thesis、strategy、planning capsule | `draft` / dynamic | `draft.md` | Step 2 |
| 3 | accept、retry 或 reroute | `humanization` → `humanizer-zh` | updated `draft.md` | Step 3 + hash |
| 4 | semantic visual nodes、serial order | visual units / fixed ownership | cover、body images、`image-plan.json` | Step 4 |
| 5 | build progression | hosting、prepare、`gzh-design`、finalize | three tracks | Step 5 parity/structure |
| 6 | publish progression | blog publish、WeChat publish | publish states | blog first、state |

### Step-specific rules

**Step 1**：`reader-response` 与 `news-digest` 必须在 `materials.md` 的 `## 原始来源` 记录直接构成
本文写作对象的 `url`、`file` 或 `pasted` 材料；`## 背景调研` 只记录 supporting evidence。Tutorial
仅在确有明确外部原始来源时记录 provenance。Step 1 还必须输出 `primary_source_urls` 摘要。

**Step 1.5**：先做 Primary Source Uniqueness，再做 lexical site memory。same normalized primary
source 已用于已发布文章时必须 `BLOCKED`，并正常写出 memory diagnostics；没有 bypass flag。Main
只能停止、更新已有文章，或从多来源任务移除已覆盖 source。

**Step 1.8**：brief 必须包含核心问题、判断候选、生成机制、约束、反方、边界、可写判断、可视觉化
节点和至少三条可检查原创增量；通过 `validate-understanding.mjs`。

**Step 2**：`materials` = blog-memory checked source set = `draft` `primarySourceUrls`。同源阻断
不能被 `--allow-no-related` 绕过；`SLOT_IMG_00` 恰好一次，且位于第一个 substantive H2 前。Step 2
只产生 draft 和 visual topology，不产生最终 `image-plan.json`。

**Step 3**：事实、数字、术语、URL、引语、代码、frontmatter、H2 顺序和 SLOT topology 不得改变；
semantic drift 必须用 frozen input 重派，并通过 `step3-polish.mjs`，记录 `step3_draft_sha256`。

**Step 4**：cover 使用 `baoyu-cover-image` 的等价 `--quick --aspect 2.35:1 --no-title` 参数；SLOT00
和 generated body visual 使用 `baoyu-infographic` 的等价 `--no-confirm` 参数，每次只处理一个 SLOT。
source body visual 优先复用合适原图。Visual Coverage、source/generated 选择、SLOT topology 和
本地文件 Gate 以 `references/image-policy.md` 为准；cover 必须唯一，SLOT00 basename 固定，每个
body SLOT 恰有一个最终文件；`baoyu-diagram` 仅是按需的 semantic helper。

**Step 5**：严格按 `hosting → build-prepare → gzh-design → build-finalize`。dispatch hosting 前先跑
`step5-build.mjs <slug> --hosting-status`，返回 `FROZEN` 时不得重新委托 `github-image-hosting`。缺少
image map 时 fail closed；依次产出 `image-map.json`、`article.md` / `article-wechat-source.md` 和
`article-wechat.html`，finalize 只读检查 parity 与 structural/integrity；失败回到 `gzh-design`，
Main 不读取并手改 child HTML。

**Step 6**：严格先 blog，再 WeChat。`blog-publish` 消费 `article.md`；WeChat prepare、child publish
和 finalize 消费 `article-wechat.html`。push 不等于 Pages deploy，创建草稿不等于群发；两条轨道按
state v2 独立恢复。

## Fixed Specialist ownership

以下 routing 是 workflow 的固定 ownership，不得由 Main、generic tool 或其它 Skill 替代；不可用、
依赖缺失或失败时停留在当前 unit 并 fail closed。

| Capability | Delegated Executor → Specialist |
|---|---|
| humanization / Step 3 | `humanization` → `humanizer-zh` |
| cover | `cover` → `baoyu-cover-image` |
| SLOT00 | `SLOT00` → `baoyu-infographic` |
| generated body visual | `generated body visual` → `baoyu-infographic` |
| image hosting / Step 5A | `hosting` → `github-image-hosting` |
| WeChat layout / Step 5B | `wechat-layout` → `gzh-design` |
| WeChat publish | `wechat-publish` → `baoyu-post-to-wechat` |

Research、Understanding、Draft、source visual 和 `baoyu-diagram` 按实际缺口动态选择最多 1–2 个匹配
Skill；不建立 catalog。Specialist-specific preferences are owned by the Specialist Skill and its own
configuration。

## References

- isolation、capsule、handoff、retry、artifact immutability 和 E2E → `references/delegated-execution.md`
- frontmatter、SLOT、链接、MDX 和双轨不变量 → `references/content-invariants.md`
- source reuse、provenance review、Visual Coverage 和 machine Gate → `references/image-policy.md`
- strategy → `references/strategy-reader-response.md`、`references/strategy-tutorial.md`、`references/strategy-news-digest.md`
- understanding brief → `references/material-understanding.md`
- primary source identity → `scripts/source-provenance-lib.mjs`
- WeChat HTML → `references/adapter-gzh-design.md`
- build / publish → `references/publishing.md`
- 原创增量 → `references/originality-policy.md`
- Gate、路径、图片和发布故障 → `references/troubleshooting.md`

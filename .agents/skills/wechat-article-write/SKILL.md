---
name: wechat-article-write
description: >
  Orchestrates this repository's WeChat + blog article workflow. Use when
  creating or resuming an article, producing its required visuals, building
  the dual blog/WeChat artifacts, or publishing the blog and WeChat draft.
license: MIT
metadata:
  author: NTLx
  version: "2.21.0"
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
Main 也不默认把自己的完整 conversation history、commentary、其它 Executor handoff 或完整用户
原始 prompt 复制给 Executor；context inheritance is opt-in, not default。
Main MUST NOT load child Skill for debugging，Main MUST NOT read full failed HTML；这两类信息由对应
phase Executor 和 deterministic Gate 收敛为 bounded handoff。

## Delegated execution principle

Each actual execution unit must leave Main's principal context. Main dynamically chooses any
runtime-native isolated execution mechanism that satisfies the capability contract. 如果没有合适的隔离
机制，当前 unit 必须 `BLOCKED`；Main MUST NOT fallback to direct execution。声明 mandatory Specialist 的
unit/phase 必须真实执行对应 Skill 的 workflow，Main 按 handoff 的 `SKILL` section 核验。

完整 isolation、capsule、handoff、retry、ownership 和 E2E protocol 见
`references/delegated-execution.md`。

## Model Context Budget

`Logical Unit ≠ Phase ≠ Model-backed Context`。Logical Unit 是责任边界，Phase 是可以共享上下文的
连续 units，Model-backed Context 是必须证明值得创建的昂贵资源。

正常 reader-response happy path <= 5 个 model-backed contexts：

1. Research + Understanding
2. Draft + Humanizer
3. Visual
4. Build
5. Publish

这是 execution contract，不是 runtime agent 数量硬编码。native Skill action、non-model isolated
execution 或 command runner 能完成的工作优先不创建新的模型上下文。

### Subthread admission

创建新的 model-backed Executor 前，Main 必须完成 admission decision。至少满足一个条件才允许：

- context-heavy：大型论文、网页、研究材料或媒体带回 Main 会明显污染上下文；
- semantic production：写作、重写、结构理解或复杂编辑判断；
- visual / design judgement：图片生成、视觉审核、HTML layout 或设计判断；
- mandatory Specialist genuinely requires a separate model context；
- fresh semantic retry：前一个 Executor 的 Gate failure 且 recovery contract 要求 fresh context + frozen input。

如果条件都不满足，`DO NOT SPAWN`。Gate、脚本、状态、hash、文件检查、grep、诊断、等待、工具
发现、prepare/finalize 和 deterministic validator 不得单独创建 model-backed context。
Gate does not justify a new model context。

同一 phase + failure class 默认最多 1 次 fresh retry；第二次同类失败后 `BLOCKED`，不继续扩大上下文
数量。完成 handoff 后释放已完成或放弃的 context；不为“以后也许还会用”保留 Executor。

runtime 若提供 Token usage 可在最终 summary 报告；不可用时不估算，也不新增 budget/registry 状态。
可选的 transient summary 只报告 model-backed context count、fresh retry count、optional Skill count
和 generated visual count；不写入 state 或新建 execution registry。

### Progressive disclosure

Main 启动时只读取本文件、state summary 和当前 strategy。需要中央判断时再读取
`understanding-brief.md`；其它 reference 由对应 phase Executor 按需加载。Main 不预加载所有
reference，也不把 reference 全文放入每个 capsule。

## Start / Resume

Main 确定日期、ASCII `date-slug`、strategy（`reader-response`、`tutorial` 或 `news-digest`），读取
state summary，决定新建或恢复。Main 不为 state 初始化或读取单独创建 bootstrap/resume Executor；
选定的第一个或恢复中的 phase Executor 以 `state.mjs init <date-slug>` 或
`state.mjs next <date-slug>` 作为第一个 deterministic action。

state 始终为 v2；`publish.blog` 与 `publish.wechat` 可独立恢复。Step 0 是 Main 的 planning
checkpoint，不是 standalone execution context；成功条件是 phase Executor 让 state 存在或可读取，
并返回唯一下一 unit。

## Workflow

逻辑 unit 是责任边界，不是固定 Agent 数量。默认按 phase 创建一个 isolated Executor，在同一
phase 内按顺序连续完成紧密 unit；producer 在返回 Main 前运行紧随其后的 deterministic Gate。
Gate 仍然保留，Gate 不等于新 Agent。只有 ownership、context domain 或 recovery boundary 真的
不同，才创建新的 Executor；失败重试仍使用 fresh context。每个 unit 使用精简 capsule，并只
返回短 handoff。

| Step | Main decides | Execution Unit / Skill | Output | Gate |
|---|---|---|---|---|
| 0 | strategy、新建或恢复 | planning checkpoint；由第一个 phase Executor 承担 state preflight | state v2 | state readable、唯一 next unit |
| 1–1.8 | research scope、source uniqueness、central judgement | **Research + Understanding phase Executor**：`research` / `blog-memory` / `understanding`；同一 context 连续完成 | `materials.md`、memory artifacts、`understanding-brief.md` | Step 1、source uniqueness、understanding validator |
| 2–3 | thesis、draft、humanization | **Writing phase Executor**：`draft` → mandatory `humanizer-zh`；同一 context 连续完成 | `draft.md` | Step 2、Step 3 + hash |
| 4 | semantic visual nodes、serial order | **Visual phase Executor**：fixed ownership，serial review ≠ serial spawn | cover、body images、`image-plan.json` | Step 4 |
| 5 | build progression | 一个 Build phase Executor：hosting、prepare、`gzh-design`、finalize | three tracks | Step 5 parity/structure |
| 6 | publish progression | 一个 Publish phase Executor：blog、WeChat prepare/publish/finalize | publish states | blog first、state |

### Step-specific rules

**Step 1**：`reader-response` 与 `news-digest` 必须在 `materials.md` 的 `## 原始来源` 记录直接构成
本文写作对象的 `url`、`file` 或 `pasted` 材料；`## 背景调研` 只记录 supporting evidence。Tutorial
仅在确有明确外部原始来源时记录 provenance。Step 1 还必须输出 `primary_source_urls` 摘要。

**Step 1.5**：先做 Primary Source Uniqueness，再做 lexical site memory。same normalized primary
source 已用于已发布文章时必须 `BLOCKED`，并正常写出 memory diagnostics；没有 bypass flag。Main
只能停止、更新已有文章，或从多来源任务移除已覆盖 source。高相关站内旧文未被 draft 引用时只
输出 advisory warning，由 Main 在 Understanding 阶段决定是否联动，不触发 retry。

**Step 1.8**：brief 必须包含核心问题、判断候选、生成机制、约束、反方、边界、可写判断、可视觉化
节点和至少三条可检查原创增量；通过 `validate-understanding.mjs`。

Research 与 Understanding 必须共享同一 Research phase Executor context。`ljg-structure` 默认不调用；只有 Main
能用一句话命名结构缺口（例如“论文同时包含三层反馈回路，当前 brief 无法形成清晰因果结构”）时
才允许调用。

**Step 2**：`materials` = blog-memory checked source set = `draft` `primarySourceUrls`。同源阻断
不能被 editorial advisory 绕过；`SLOT_IMG_00` 恰好一次，且位于第一个 substantive H2 前。Step 2
只产生 draft 和 visual topology，不产生最终 `image-plan.json`。

**Step 2–3**：Writing phase 先生成 draft，通过 Step 2，再真实执行 mandatory `humanizer-zh`，通过
Step 3 和 hash。事实、数字、术语、URL、引语、代码、frontmatter、H2 顺序和 SLOT topology 不得改变；
semantic drift 必须用 frozen input 重派，并通过 `step3-polish.mjs`，记录 `step3_draft_sha256`。

**Step 4**：cover 使用 `baoyu-cover-image` 的等价 `--quick --aspect 2.35:1 --no-title` 参数；SLOT00
和 generated body visual 使用 `baoyu-infographic` 的等价 `--no-confirm` 参数，每次只处理一个 SLOT。
source body visual 优先复用合适原图。Visual Coverage、source/generated 选择、SLOT topology 和
本地文件 Gate 以 `references/image-policy.md` 为准；cover 必须唯一，SLOT00 basename 固定，每个
body SLOT 恰有一个最终文件；`baoyu-diagram` 仅是按需的 semantic helper。

**Step 5**：一个 Build phase Executor 严格按 `hosting → prepare → gzh-design → finalize`。dispatch
hosting 前先跑 `step5-build.mjs <slug> --hosting-status`，返回 `FROZEN` 时不得重新委托
`github-image-hosting`。缺少 image map 时 fail closed；依次产出 `image-map.json`、`article.md` /
`article-wechat-source.md` 和 `article-wechat.html`，gzh-design 自己运行 validator/preview，随后
由同一 Executor 运行 finalize。finalize 只读检查 parity 与 structural/integrity；失败时返回
`RETRY_REQUIRED`，Main 用 frozen source 创建 fresh Build phase Executor，从 `gzh-design` 重新开始一次；
若 retry 后仍为同一 failure class 则 `BLOCKED`，禁止第三次自动 theme retry；
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

Research、Understanding、Draft、source visual 和 `baoyu-diagram` 默认不调用 optional Skill；只有
Main 能用一句话命名当前缺口时，才按实际缺口选择匹配 Skill。每个 phase 默认 0 个 optional Skill，
不建立 catalog。Specialist-specific
preferences are owned by the Specialist Skill and its own configuration。

## References

按需加载，不预读全部 reference：

| Phase | 主要 reference |
|---|---|
| Main / routing | `delegated-execution.md`、当前 strategy |
| Understanding | `material-understanding.md`、`originality-policy.md` |
| Draft / Build | `content-invariants.md`、`publishing.md` |
| Visual | `image-policy.md` |
| WeChat layout | `adapter-gzh-design.md` |
| Recovery | `troubleshooting.md` |

`scripts/source-provenance-lib.mjs` 只在需要核对 primary source identity 时加载。

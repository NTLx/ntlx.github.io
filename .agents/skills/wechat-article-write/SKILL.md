---
name: wechat-article-write
description: >
  Orchestrates this repository's WeChat + blog article workflow. Use when
  creating or resuming an article, producing its required visuals, building
  the dual blog/WeChat artifacts, or publishing the blog and WeChat draft.
license: MIT
metadata:
  author: NTLx
  version: "2.8.1"
---

# 微信公众号文章写作

这是仓库级薄编排 Skill。Main Agent 决定做什么；Delegated Executor 实际执行；Specialist Skill
负责专业能力；Script 负责确定性判断。Main Agent owns understanding and strategic judgement。
所有实际产物、工具调用、专业 Skill 和 deterministic command 都必须在与 Main 隔离的 isolated execution context 中完成。

## Main Agent execution boundary

Main Agent MUST NOT directly：

- 抓取网页；
- 使用 `curl` 获取文章；
- 下载 source media；
- 编写 `materials.md`；
- 编写 `draft.md`；
- 修改 draft 文风；
- 生成或审阅图片；
- 编写 HTML；
- 修改 HTML；
- 上传图片；
- 发布微信；
- commit / push；
- 运行 Astro build；
- 运行 Step scripts；
- 运行 child Skill 内部脚本；
- 调用专业 Skill 完成执行工作。

Main Agent MAY read `.pipeline-state.json`、`understanding-brief.md` 和少量目标 artifact 片段，
形成中心判断，决定 strategy、Execution Unit、proceed/retry/reroute/blocked，并读取 bounded
handoff。Main 不把完整网页、研究笔记、HTML、image prompt、API 或上传日志带回自己的上下文。

## Delegated execution

每个 Execution Unit 是逻辑责任边界，不是 Agent 数量。Main 按任务上下文大小、专业性、工具需求、
fresh-context 需求、可并行性、合并安全性和恢复成本，逐 unit dispatch 并选择 runtime-native isolation mechanism。
Main chooses the best available mechanism for each unit；可合并低风险 deterministic
units，但不得破坏 ownership、Gate 或 context isolation。

可用机制可以是 subagent、task、child thread、forked context、isolated session、delegated worker、
独立 Agent process 或其它等价机制；These are examples, not required implementations。完整 capability
contract、capsule、handoff、ownership 和恢复规则见 `references/delegated-execution.md`。

没有合适的隔离机制时必须 fail closed：

```text
no suitable isolated delegated-execution mechanism
        ↓
current execution unit BLOCKED
        ↓
Main MUST NOT fallback to direct execution
```

没有某一种具体机制不构成失败；Main 仍不得因为运行时差异接管实际工作。

## Start or resume

**Main decision**：理解最终目标，确定日期、ASCII `date-slug` 和 strategy（`reader-response`、
`tutorial` 或 `news-digest`），读取已有 state summary，决定新建或恢复。

**Execution Unit**：`bootstrap/resume`。输入是用户目标、可选 strategy 和 `date-slug`；新任务输出
`posts/<date-slug>/.pipeline-state.json`，恢复任务输出 state summary。

**Deterministic action**：隔离 Executor 运行 `state.mjs init <date-slug>` 或 `state.mjs next
<date-slug>`。state 始终为 v2，`publish.blog` 与 `publish.wechat` 可独立恢复。成功条件是 state
存在或可读取，且返回唯一下一 unit。

## Workflow

每个 unit 都使用 `ROLE / GOAL / INPUTS / REQUIRED SKILL / PROJECT CONTRACT / OUTPUT / GATE /
FORBIDDEN / FAILURE / RETURN` capsule，并只返回短 handoff。Execution Unit 可由同一个隔离
Executor 连续完成多个紧密、低风险动作，但 Main 永远不直接运行 mechanic。

### Step 1 — Research

**Main decision**：传递用户 URL、原始材料、目标读者、strategy 和研究缺口；只消费 handoff，不读完整
网页或亲自补背景事实。

**Research Executor owns primary-source identification.** 对 `reader-response` 与 `news-digest`，必须
在 `materials.md` 的 `## 原始来源` 中记录直接构成本篇写作对象的 `url`、`file` 或 `pasted` 材料；
`## 背景调研` 只记录 supporting evidence。Tutorial 只有在确有明确外部原始来源时记录 provenance。

**Execution Unit**：`research`；动态选择最匹配的 1–2 个 research Skill，或 `none`。

**Input / Output**：用户材料 → `posts/<date-slug>/materials.md`，必要时写 `source-media/*`。

**Success**：区分 fact、inference、author judgement；外部事实有可追溯 URL；隔离 Executor 运行
`step1-collect.mjs <date-slug>` 并通过 Step 1 Gate。Step 1 输出 `primary_source_urls` 摘要，
但不把 supporting references 当作 primary source。

### Step 1.5 — Blog memory

**Main decision**：委托站内相关性筛选，不亲自搜索站内文章。先执行 Primary Source Uniqueness，
再做 lexical site memory。

**Execution Unit**：`blog-memory`；无需固定 Skill。

**Input / Output**：`materials.md` 和站内文章 → `blog-memory.md`（可有 `blog-memory.json`）。

**Success**：Primary Source Uniqueness PASS + related memory ready；记录真正相关的已发布文章，或
明确记录没有合适关联内容；通过 `select-related-articles.mjs <date-slug>`。发现同一 normalized
primary source 已用于已发布文章时，Step 1.5 `BLOCKED`，正常写出 `blog-memory.json` 与
`blog-memory.md`（其中 `same_source_matches` 保存具体诊断）后返回 non-zero；Main 只能决定不再写、更新旧文或移除多来源任务中已覆盖的 source。
没有普通 bypass flag。

### Step 1.8 — Understanding

**Main decision**：读取 brief 后形成中心判断、整体编辑方向和待回答问题；brief 不足时附诊断重派
fresh Executor，不搬运完整材料。

**Execution Unit**：`understanding`；动态选择最匹配的 1–2 个理解 Skill，或 `none`。

**Input / Output**：`materials.md`、`blog-memory.md`、用户要求、strategy 和
`references/material-understanding.md` → `understanding-brief.md`。

**Success**：brief 包含核心问题、判断候选、生成机制、约束、反方、边界、可写判断、可视觉化节点和
至少三条可检查原创增量；通过 `validate-understanding.mjs <date-slug>`。

### Step 2 — Draft

**Main decision**：从 brief 形成短 planning capsule（central thesis、strategy、问题、边界、body
visual target、用户要求），委托写作，不亲自写句子。

**Execution Unit**：`draft`；动态选择最匹配的 1–2 个写作 Skill，或 `none`。

**Input / Output**：brief、materials、blog memory、strategy reference、content invariants 和
planning capsule → `draft.md`。

**Success**：frontmatter、summary、blogSlug、sourceUrl、`primarySourceUrls`（适用时）、H2、引用、
互动、站内联动和 strategy 约束通过 `step2-write.mjs <date-slug>`；`materials.md`、`blog-memory.json`
与 draft 的 normalized primary-source provenance 一致，且 source uniqueness 已通过；`SLOT_IMG_00` 恰好一次、在
第一个 substantive H2 前，正文视觉 topology 正确；Step 2 不生成最终 `image-plan.json`。Step 2
读取 `blog-memory.json` 作为 resume backstop，不能由 `--allow-no-related` 绕过同源阻断。

### Step 3 — Humanization

**Main decision**：只消费 handoff 和 Gate diagnostic；semantic drift 时用 frozen input 重派，不做
第二遍人工润色。

**Execution Unit**：`humanization`。

**Required Skill**：必须由隔离 Executor 读取并完整执行 `humanizer-zh/SKILL.md`。

**Input / Output**：当前 `draft.md`、semantic constraints、上一 Gate diagnostic → 更新后的 `draft.md`。

**Success**：事实、数字、术语、URL、引语、代码、frontmatter、H2 顺序和 SLOT topology 不变；审阅
semantic drift；通过 `step3-polish.mjs <date-slug>`，state 记录 `step3_draft_sha256`。

### Step 4 — Visual execution units

**Main decision**：根据 brief 和 draft 确定 semantic visual nodes，按 serial 顺序委托；只有独立性
明确时才并行。Main 不制作视觉、不审图替代 Executor、不集中渲染。

| Execution Unit | Required Skill | 必须保持的实现约束 | Output / Gate |
|---|---|---|---|
| `cover` | `baoyu-cover-image` | 等价于 `--quick --aspect 2.35:1 --no-title`；backend 服从项目配置 | 根目录唯一 cover |
| `SLOT00` | `baoyu-xhs-images` | 等价于 `--yes --batch-size 1`；输出固定 basename | `imgs/00-infographic-core-summary.png` |
| `source body visual` | none 或动态辅助 Skill | 实际查看、核对语义、caption、编号、完整性和时效性 | source reuse 或 generated required |
| `generated body visual` | `baoyu-infographic` | 等价于 `--no-confirm`；每次只处理一个 SLOT；architecture/flow 等需要时才辅助 `baoyu-diagram` | 一个正文 raster |
| `visual finalization` | none | 只记录最终 slot/kind/file 与必要 source URL/reason，不记录 prompt 或 receipt | `image-plan.json`；`step4-images.mjs` |

**Success**：cover 比例为 `2.35:1 ±0.03` 且唯一；SLOT00 basename 正确且唯一；每个正文 visual
SLOT 恰有一个最终文件；正常长文至少两个 body visual SLOT；`image-plan.json`、draft topology 和
本地文件一致；Step 4 Gate 通过。业务 Visual Coverage、SLOT topology 和 source/generated 规则
保持不变。

### Step 5 — Build

Main 按以下顺序委托，只消费短 summary；HTML 结构失败时回到 `wechat-layout`，Main 不读取并手改
HTML。

| Execution Unit | Required Skill / action | Input → Output | Success |
|---|---|---|---|
| `hosting` | `github-image-hosting` | `imgs/` → `image-map.json` | child Skill 完成 config、SHA、幂等、冲突和 CDN 检查 |
| `build-prepare` | `step5-build.mjs --prepare-only` | draft、图片、map → `article.md`、`article-wechat-source.md` | 缺 map 时 fail closed |
| `wechat-layout` | `gzh-design` | source + local imgs → `article-wechat.html` | child validator/preview 通过；保留 H2、段落/list/code/image topology；无 CDN body src、无 `<a href>` |
| `build-finalize` | `step5-build.mjs --finalize-only` | 三轨 artifact → structural/integrity result | 只读检查，不修改 HTML；Step 5 parity 通过 |

### Step 6 — Publish

**Main decision**：严格先博客、后微信；push 不等于 Pages deploy，创建草稿不等于群发。所有命令和
网络操作都由隔离 Executor 完成。

| Execution Unit | Required Skill / action | Output / Success |
|---|---|---|
| `blog-publish` | `publish-blog.mjs` | 以 `article.md` 完成 build、commit、push 和 blog state |
| `wechat-publish-prepare` | `publish-wechat.mjs --prepare-only` | 以 `article-wechat.html` 生成最小 capsule，不访问网络 |
| `wechat-publish` | `baoyu-post-to-wechat` | 上传 body/cover、创建草稿、获取 media_id；child Skill 与项目配置完整执行 |
| `wechat-publish-finalize` | `publish-wechat.mjs --finalize-only --media-id <id>` | 记录 WeChat state；两条轨道可按 state v2 独立恢复 |

## Delegation fidelity

### Native delegation

Main 只传目标、输入、strategy、项目偏好、输出路径、原生非交互参数和验收边界。Executor 读取
required child `SKILL.md`，完整执行分析、选择、生成、validator 或发布，再返回 bounded handoff。
Main 读取 child Skill 或模仿流程不算 delegation。

### Mandatory child delegation

以下 fixed ownership 不得由 Main、generic tool 或其它 Skill 替代；不可用、依赖缺失或失败时必须
fail closed，停留在当前 Execution Unit：

| Capability | Delegated Executor → Skill |
|---|---|
| humanize / Step 3 | `humanization` → `humanizer-zh` |
| cover | `cover` → `baoyu-cover-image` |
| SLOT00 | `SLOT00` → `baoyu-xhs-images` |
| 正文生成图 / generated body visual | `generated body visual` → `baoyu-infographic` |
| 图片托管/CDN / Step 5A hosting | `hosting` → `github-image-hosting` |
| Step 5B HTML | `wechat-layout` → `gzh-design` |
| 微信草稿 / Step 6 WeChat draft | `wechat-publish` → `baoyu-post-to-wechat` |

### Optional delegation

Research、Understanding、Draft、source visual 和 `baoyu-diagram` 按实际缺口动态选择最多 1–2 个
匹配 Skill；不建立 research、ljg 或 writing catalog。

## Child-owned artifact immutability

child-owned artifact 被 Main 或其它 Executor 做专业内容修改后，必须从 frozen input 重新交给原
owner；不得 patch、绕过 Gate 或由相邻阶段接管。state、parity 和其它 deterministic artifact 由
对应 unit 的 Executor 运行仓库脚本生成。

### Ownership matrix

| Artifact | Owner |
|---|---|
| humanized `draft.md` | `humanization` → `humanizer-zh` |
| cover | `cover` → `baoyu-cover-image` |
| SLOT00 | `SLOT00` → `baoyu-xhs-images` |
| generated body image | `generated body visual` → `baoyu-infographic` |
| `image-map.json` | `hosting` → `github-image-hosting` |
| `article-wechat.html` | `wechat-layout` → `gzh-design` |
| WeChat draft | `wechat-publish` → `baoyu-post-to-wechat` |
| state / parity / deterministic artifacts | corresponding deterministic unit |

## Recovery

Gate failure → Main 识别 artifact owner → 选择合适的 isolated execution mechanism → fresh Delegated
Executor → frozen input + diagnostic → 重执行 required Skill 或 mechanic → Gate again。GZH 失败保持
旧 HTML 不变；图片失败回到对应 visual unit；发布失败只恢复对应 blog 或 WeChat 子状态。Main 不得
接管产物生产。

## Delegated Execution Fidelity E2E

版本升级后由隔离 `verification` unit 运行真实 E2E，覆盖适用的 Research、Understanding、Draft、
Humanization、Cover、SLOT00、generated body visual、Hosting、WeChat layout、Blog publish 和
WeChat publish。Main 只读取 checklist，不亲自执行 web、curl、shell、Skill、Git、build 或 publish。
完整复盘清单和机制报告规则见 `references/delegated-execution.md`。

## References

- 完整 execution isolation、capsule、handoff、matrix、Skill-via-Executor、recovery 和 E2E → `references/delegated-execution.md`
- Step 输入、输出和 state 关系 → `references/pipeline-overview.md`
- frontmatter、SLOT、链接、MDX 和双轨不变量 → `references/content-invariants.md`
- strategy → `references/strategy-reader-response.md`、`references/strategy-tutorial.md`、`references/strategy-news-digest.md`
- understanding brief → `references/material-understanding.md`
- source reuse、SLOT 命名和视觉验收 → `references/image-policy.md`
- primary source provenance 与 exact identity → `scripts/source-provenance-lib.mjs`
- WeChat HTML → `references/adapter-gzh-design.md`
- 发布 → `references/publishing.md`
- 原创增量 → `references/originality-policy.md`
- Gate、路径、图片和发布故障 → `references/troubleshooting.md`

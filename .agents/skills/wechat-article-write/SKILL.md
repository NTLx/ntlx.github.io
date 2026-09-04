---
name: wechat-article-write
description: >
  Orchestrates this repository's WeChat + blog article workflow. Use when
  creating or resuming an article, producing its required visuals, building
  the dual blog/WeChat artifacts, or publishing the blog and WeChat draft.
license: MIT
metadata:
  author: NTLx
  version: "2.6.0"
---

# 微信公众号文章写作

这是仓库级薄编排 Skill。Main Agent 只理解目标、规划、派发、决策和恢复；Main Agent owns understanding and strategic judgement。实际产物生产、
工具调用、专业 Skill 执行和 deterministic check 全部由短生命周期的 Worker Subagent 完成。
统一原则仍是 Native Delegation、Fail Closed、Child-owned Artifact 和 Deterministic Gates。

## Main Agent execution boundary

Main Agent MUST NOT directly:

- 抓取网页；
- 使用 `curl` 获取文章；
- 下载 source media；
- 编写 `materials.md`；
- 编写 `draft.md`；
- 修改 draft 文风；
- 生成图片；
- 审图并操作图片文件；
- 编写 HTML；
- 修改 HTML；
- 上传图片；
- 发布微信；
- commit / push；
- 运行 Astro build；
- 运行 Step scripts；
- 运行 child Skill 内部脚本；
- 调用专业 Skill 完成执行工作。

Main Agent MAY:

- read `.pipeline-state.json`；
- read `understanding-brief.md`；
- 必要时读取少量目标 artifact 片段；
- 做 semantic decision；
- spawn Worker；
- 给 Worker feedback；
- 阅读短 handoff，并决定 proceed、retry、reroute 或 blocked。

Main Agent should prefer reading summaries and contracts over raw execution artifacts。Worker
failure never expands Main Agent execution authority；失败时只能分类、重派同类 Worker、改道到
另一个 Worker，或报告 blocked。

native Subagent capability unavailable
        ↓
workflow BLOCKED
        ↓
Main MUST NOT fallback to direct execution

Worker 的生命周期、capsule、handoff、execution-unit matrix、Skill-via-Worker 定义和恢复规则
见 `references/subagent-execution.md`。

## Start or resume

Main responsibility:

- 理解用户最终目标；
- 在新任务中确定日期、ASCII `date-slug` 和 strategy（`reader-response`、`tutorial` 或
  `news-digest`）；
- 只读已有 `.pipeline-state.json`，判断新任务或 resume；
- 决定下一 execution unit，并向 Worker 传最小 capsule。

已有 state 时 Main 可以直接消费 state summary；没有 state 时必须 dispatch Bootstrap Worker，
由其初始化 state。state 始终使用 v2，`publish.blog` 与 `publish.wechat` 可以独立恢复。

Execution owner: Bootstrap Worker（新任务）或 Resume/State Worker（恢复任务需要 state summary
时）。

Worker contract:

```text
ROLE
你是 state/bootstrap execution worker。

GOAL
为 <date-slug> 创建或读取当前 pipeline state，并返回唯一的下一 execution unit。

INPUTS
date-slug；可选 strategy；仓库根目录。

REQUIRED SKILL
none

PROJECT CONTRACT
state 必须是 v2；不得创建 trace、receipt 或能力目录。

OUTPUT
posts/<date-slug>/.pipeline-state.json（仅新任务）；state summary。

GATE
新任务执行：
bun run .agents/skills/wechat-article-write/scripts/state.mjs init <date-slug>
恢复任务执行：
bun run .agents/skills/wechat-article-write/scripts/state.mjs next <date-slug>

FORBIDDEN
不得执行任何文章、图片、HTML、上传或发布工作。

FAILURE
失败即停止并报告；不替代其它 Worker。

RETURN
只返回状态、state 路径、Gate 结果、下一 execution unit 和最多 3 条说明。
```

## Workflow

每个阶段都由 Main dispatch 一个边界明确的 Worker。Main 只消费 handoff 和 Gate 结果；Worker
不得顺便完成相邻阶段。

### Step 1 — Research

Main responsibility:

- 将用户 URL、原始材料、目标读者、strategy 和研究缺口封装给 Research Worker；
- 不读取完整网页，不亲自补背景事实；
- 只根据 handoff 和 Gate 决定 proceed、retry 或 blocked。

Execution owner: Research Worker（ephemeral、single-purpose、fresh-context）。

Worker contract:

```text
ROLE
你是本阶段的 research execution worker。

GOAL
把原始材料和必要的背景核验整理成可写作的 materials.md。

INPUTS
用户 URL / 文件材料；用户目标；strategy；posts/<date-slug>/。

REQUIRED SKILL
根据实际缺口动态发现最匹配的 1–2 个研究 Skill；没有缺口时使用 none。

PROJECT CONTRACT
区分 fact、inference、author judgement；进入正文的外部事实必须保留可追溯 URL。
可按需使用 web、curl 或文件工具；不维护中央 research Skill catalog，不扩大到理解或写作。

OUTPUT
posts/<date-slug>/materials.md；必要时 posts/<date-slug>/source-media/*。

GATE
写完后执行：
bun run .agents/skills/wechat-article-write/scripts/step1-collect.mjs <date-slug>

FORBIDDEN
不得写 draft、understanding brief、图片、HTML、上传文件或发布内容。

FAILURE
失败即停止并报告具体缺口，不用 Main 或其它阶段替代研究。

RETURN
STATUS、UNIT、ARTIFACTS、GATE、最多 3 条 KEY NOTES、NEXT；不返回完整网页或研究全文。
```

完成条件：`materials.md` 非空；进入正文的重要外部事实可追溯；事实、推断和作者判断可
区分；Step 1 Gate 通过。

### Step 1.5 — Blog memory

Main responsibility: dispatch Blog Memory Worker，并只读取其 handoff；不亲自搜索站内文章。

Execution owner: Blog Memory Worker。

Worker contract:

```text
ROLE
你是本阶段的轻量站内记忆 worker。

GOAL
为当前文章选择真正相关的已发布站内文章，或明确记录没有合适关联内容。

INPUTS
posts/<date-slug>/materials.md；date-slug；仓库站内文章。

REQUIRED SKILL
none

PROJECT CONTRACT
只处理站内记忆，不改 materials 或 draft，不扩大为研究和写作。

OUTPUT
posts/<date-slug>/blog-memory.md（以及脚本允许的 blog-memory.json）。

GATE
执行：
bun run .agents/skills/wechat-article-write/scripts/select-related-articles.mjs <date-slug>

FORBIDDEN
不得编写正文、理解 brief、图片、HTML 或发布内容。

FAILURE
失败即停止并报告；不得伪造相关旧文。

RETURN
只返回状态、artifact 路径、Gate 结果、相关性结论和下一 owner。
```

完成条件：存在可消费的站内记忆，或文件明确记录没有合适关联内容。

### Step 1.8 — Understanding

Main responsibility:

- 读取 `understanding-brief.md`，形成中心判断、整体编辑方向和需要回答的问题；
- 若 brief 不足，给 Understanding Worker 具体 feedback，再 dispatch fresh Worker；
- 不重新深读并搬运完整原始材料到主上下文，不亲自编辑 brief。

Execution owner: Understanding Worker。

Worker contract:

```text
ROLE
你是本阶段的 understanding execution worker。

GOAL
把材料和站内记忆压缩成可直接支持写作与视觉规划的 understanding-brief.md。

INPUTS
posts/<date-slug>/materials.md；blog-memory.md；用户要求；strategy；
references/material-understanding.md。

REQUIRED SKILL
根据实际理解缺口动态选择最匹配的理解 Skill；没有缺口时使用 none。

PROJECT CONTRACT
保留核心问题、中心判断候选、生成机制、约束、反方、边界、可写判断、可视觉化节点和
至少三条可检查的原创增量；不写 draft，不决定最终图片文件事实。

OUTPUT
posts/<date-slug>/understanding-brief.md。

GATE
执行：
bun run .agents/skills/wechat-article-write/scripts/validate-understanding.mjs <date-slug>

FORBIDDEN
不得写正文、生成图片、修改 image-plan 或构建 HTML。

FAILURE
失败即停止并报告缺失的小节、证据或边界；不扩大任务范围。

RETURN
只返回状态、artifact 路径、Gate 结果、最多 3 条关键判断和下一 owner。
```

完成条件：brief 的核心小节均有内容或明确写“未发现”及原因，原创增量可逐条检查，且
understanding Gate 通过。Main 的 strategic understanding 以 brief 和用户目标为依据，不把
材料全文带入后续 Worker。

### Step 2 — Draft

Main responsibility:

- 读取 brief，形成很短的 planning capsule：central thesis、strategy、必须回答的问题、
  重要边界、body visual target 和特殊用户要求；
- dispatch Draft Worker；
- 只根据 handoff 和 Step 2 Gate 决定下一步，不亲自写一句正文。

Execution owner: Draft Worker。

Worker contract:

```text
ROLE
你是本阶段的 draft execution worker。

GOAL
根据 Main planning capsule 写出完整、可进入 Step 3 的 draft.md。

INPUTS
understanding-brief.md；materials.md；blog-memory.md；对应 references/strategy-*.md；
references/content-invariants.md；Main planning capsule；用户特殊要求。

REQUIRED SKILL
根据实际写作缺口动态选择最匹配的 1–2 个写作 Skill；没有缺口时使用 none。

PROJECT CONTRACT
自行完成 frontmatter、summary、blogSlug、sourceUrl、H2、引用与 URL、SLOT、站内联动和
strategy 约束。SLOT_IMG_00 恰好一次，位于第一个 substantive H2 前，并是正文第一张视觉；
SLOT_IMG_01+ 只按高价值语义节点规划。Step 2 只产出 draft.md 和 SLOT topology，不创建最终
image-plan.json。

OUTPUT
posts/<date-slug>/draft.md。

GATE
执行：
bun run .agents/skills/wechat-article-write/scripts/step2-write.mjs <date-slug>

FORBIDDEN
不得做人性化改写、生成图片、写 image-plan、编写 HTML、上传或发布。

FAILURE
失败即停止并报告；不得让 Main 手工补正文或绕过 Step 2 Gate。

RETURN
只返回状态、artifact 路径、Gate 结果、SLOT 数量和最多 3 条说明。
```

完成条件：`draft.md`、frontmatter、H2、链接、互动、引用、SLOT topology 和站内记忆约束
通过 Step 2 Gate；最终图片事实留到 Step 4。

### Step 3 — Humanization

Main responsibility: dispatch Humanization Worker；只读取其 handoff 和 Gate 诊断，不进行第二遍
人工润色。若有 semantic drift，向 fresh Humanization Worker 传递冻结输入和诊断。

Execution owner: Humanization Worker → mandatory `humanizer-zh`。

Worker contract:

```text
ROLE
你是本阶段的 humanization execution worker。

GOAL
去除 draft.md 中的 AI 写作痕迹，使文本自然，同时保持作者已有声音。

INPUTS
当前 posts/<date-slug>/draft.md；semantic constraints；上一 Gate diagnostics（如有）。

REQUIRED SKILL
必须读取并完整执行 humanizer-zh/SKILL.md。

PROJECT CONTRACT
保持事实、数字、术语、URL、直接引语、代码、frontmatter、H2 顺序和 SLOT topology；
自行审阅 diff，检查 first-person claims 和 semantic drift。

OUTPUT
更新后的 posts/<date-slug>/draft.md。

GATE
完成 child Skill 后执行：
bun run .agents/skills/wechat-article-write/scripts/step3-polish.mjs <date-slug>

FORBIDDEN
不得由 Main 或其它 Worker 替代 humanizer-zh；不得改图片、HTML 或发布状态。

FAILURE
semantic drift 或 Gate 失败时停止并返回 RETRY_REQUIRED；从冻结输入重新执行 child Skill。

RETURN
STATUS、UNIT、artifact 路径、Gate 结果、最多 3 条说明、NEXT；不返回完整 diff。
```

完成条件：`humanizer-zh` 已处理当前 draft，Worker 已审阅 semantic drift，Step 3 Gate 通过，
state 记录当前 draft hash。后续 draft 改变时必须重新 dispatch Humanization Worker。

### Step 4 — Visual execution units

Main responsibility:

- 根据 brief 和 draft 决定哪些 semantic visual nodes 值得存在；
- 按 serial 顺序 dispatch 独立 Worker；
- 每次只消费短 handoff，不制作视觉、不审图替代 Worker、不集中渲染；
- 根据 Source Visual Worker 的判断选择 source reuse 或 generated worker。

Execution policy: sequential workers；只有独立性明确时才并行。Cover、SLOT00、每个 body SLOT
和 Finalizer 都是独立、fresh-context 的 execution unit。

#### Cover Worker

Worker contract:

```text
ROLE
你是 cover execution worker。

GOAL
为当前最终 draft 生成唯一微信封面。

INPUTS
最终 draft；posts/<date-slug>/；项目图片配置。

REQUIRED SKILL
必须原生执行 baoyu-cover-image。

PROJECT CONTRACT
使用等价于 --quick --aspect 2.35:1 --no-title 的参数；backend override 为
baoyu-image-gen --provider codex-cli；输出 post 根目录唯一 cover。

OUTPUT
posts/<date-slug>/cover.png 或 cover.jpg。

GATE
child Skill 完成后实际查看图片，并返回 cover 存在、MIME、比例和语义审阅结果；最终由
Visual Finalizer Worker 运行 Step 4 Gate。

FORBIDDEN
不得调用通用 image_gen、直接调用 baoyu-image-gen 替代 baoyu-cover-image，不得改 draft、
SLOT、image-plan、HTML 或上传图片。

FAILURE
失败或审图不通过时停止并报告 RETRY_REQUIRED；由 Main 重新 dispatch Cover Worker。

RETURN
只返回 cover 路径、PASS/FAIL 和最多 3 条说明。
```

#### Lead Summary Visual Worker（SLOT00）

Worker contract:

```text
ROLE
你是 lead summary visual execution worker。

GOAL
生成唯一的 SLOT_IMG_00 头部摘要视觉。

INPUTS
最终全文；posts/<date-slug>/；目标路径 imgs/00-infographic-core-summary.png。

REQUIRED SKILL
必须原生执行 baoyu-xhs-images。

PROJECT CONTRACT
使用等价于 --yes --batch-size 1 的参数；让 child 按项目配置选择 style/layout/palette/preset，
backend 走 baoyu-image-gen → codex-cli；只输出目标 basename。

OUTPUT
posts/<date-slug>/imgs/00-infographic-core-summary.png。

GATE
child Skill 完成后实际查看图片；最终由 Visual Finalizer Worker 检查 SLOT00 basename 和文件。

FORBIDDEN
不得调用通用 image_gen、直接调用 baoyu-image-gen 替代 baoyu-xhs-images，不得改正文、其它
SLOT、image-plan、HTML 或上传图片。

FAILURE
失败或审图不通过时停止并报告 RETRY_REQUIRED；由 Main 重新 dispatch 本 Worker。

RETURN
只返回 SLOT00 路径、PASS/FAIL 和最多 3 条说明。
```

#### Source Visual Worker（每个可能复用的 body SLOT）

Worker contract:

```text
ROLE
你是 source visual execution worker，负责一个指定 body SLOT。

GOAL
判断 source-media 中的原图能否直接承担该 semantic visual node，并在需要时完成必要的
查看、裁切或本地化文件操作。

INPUTS
指定 SLOT；正文语境；materials.md；source-media/*；目标表达和时效性要求。

REQUIRED SKILL
none；只有实际缺口需要时才动态发现辅助视觉/分析 Skill。

PROJECT CONTRACT
核对语义、caption、figure/table number、裁切需求、完整性、时效性和本地化；返回
source acceptable 或 generated required。不得先入为主地复用不匹配的 source。

OUTPUT
source asset（如可接受）及其最终事实，或 generated required 判断。

GATE
实际查看候选 source；由 Visual Finalizer Worker 根据最终文件运行 Step 4 Gate。

FORBIDDEN
不得写 draft、修改 SLOT topology、生成 cover/SLOT00、上传、编写 HTML 或发布。

FAILURE
无法核验 source 时返回 BLOCKED 或 generated required，不伪造通过。

RETURN
指定 SLOT、source/generated 判断、文件（如有）、PASS/BLOCKED 和最多 3 条说明。
```

#### Body Visual Worker（每个 generated body SLOT）

Worker contract:

```text
ROLE
你是一个指定 body SLOT 的 visual execution worker。

GOAL
只为指定 SLOT 生成能解释其 semantic visual node 的正文 raster。

INPUTS
指定 SLOT；正文语境、关系和必要背景；目标输出路径；最终 draft；项目图片配置。

REQUIRED SKILL
必须原生执行 baoyu-infographic；确有 architecture、flow、sequence、state、data flow 或
topology 需求时才按需使用 baoyu-diagram 辅助。

PROJECT CONTRACT
使用等价于 --no-confirm 的参数；backend override 为 baoyu-image-gen → codex-cli；由 child
自行选择 layout/style 并完成 analyze → prompt → raster → report。一次只处理一个 SLOT。

OUTPUT
posts/<date-slug>/imgs/<slot-specific-basename>。

GATE
完成 child Skill 后实际查看图片，检查文字、语义和构图；最终由 Visual Finalizer Worker
运行 Step 4 Gate。

FORBIDDEN
不得调用通用 image_gen、直接调用 baoyu-image-gen 替代 baoyu-infographic，不得改 draft、
SLOT topology、其它图片、image-plan、HTML 或上传。

FAILURE
失败或视觉不通过时停止并报告 RETRY_REQUIRED；由 Main 对同一 SLOT 重新 dispatch fresh Worker。

RETURN
只返回指定 SLOT、文件路径、PASS/FAIL 和最多 3 条说明。
```

#### Visual Finalizer Worker

Worker contract:

```text
ROLE
你是视觉终态与 Gate execution worker。

GOAL
根据实际最终文件写最小 image-plan.json，并完成 Step 4 Gate。

INPUTS
最终 draft；cover；SLOT00；每个 body SLOT 的 source/generated handoff 和文件；
references/image-policy.md。

REQUIRED SKILL
none

PROJECT CONTRACT
image-plan.json 只记录最终 slot、kind、file，以及 source 必要的 URL/reason；不记录 prompt、
producer、contributors 或视觉 receipt。检查 SLOT 连续性、每槽恰好一个文件、cover 唯一性、
MIME、扩展名、cover ratio 和正常长文的 body visual coverage。

OUTPUT
posts/<date-slug>/image-plan.json；Step 4 summary。

GATE
执行：
bun run .agents/skills/wechat-article-write/scripts/step4-images.mjs <date-slug>

FORBIDDEN
不得生成或修改任何图片来绕过 Gate，不得修改 draft 或 HTML。

FAILURE
按失败 artifact owner 返回诊断；Main 重新 dispatch 对应 Worker，不能由 Finalizer 接管生产。

RETURN
body visual count、source/generated breakdown、image-plan 路径、Gate PASS/FAIL 和最多 3 条说明。
```

完成条件：根目录恰好一个 cover 且像素比例满足 `2.35:1 ±0.03`；SLOT00 恰好一个且 basename
正确；每个正文 visual SLOT 有且只有一个最终图片文件；正常长文至少两个 body visual SLOT；
`image-plan.json`、draft SLOT 和本地文件一致；图片已经由对应 Worker 实际查看并审阅；Step 4
Gate 通过。

### Step 5 — Build

Main responsibility: 按 Hosting → Prepare → GZH → Finalize 的顺序 dispatch Worker；只消费短
summary。任何 HTML 结构失败都回到 gzh-design Worker；Main 绝对不读取并手改 HTML。

#### Step 5A — Hosting Worker

Execution owner: Hosting Worker → mandatory `github-image-hosting`。

Worker contract:

```text
ROLE
你是图片托管 execution worker。

GOAL
将最终 imgs/ 幂等上传并生成 image-map.json。

INPUTS
images: posts/<date-slug>/imgs/；folder: wechat-articles；prefix: <date-slug>-<blogSlug>-
img；output: posts/<date-slug>/image-map.json。

REQUIRED SKILL
必须读取并完整执行 github-image-hosting/SKILL.md；可按该 Skill 合同调用其内部 uploader。

PROJECT CONTRACT
child 自己负责 config、remote SHA、repo/branch、幂等、冲突、重试和 CDN URL；只写约定 map。

OUTPUT
posts/<date-slug>/image-map.json。

GATE
child Skill 自行完成上传检查；返回 map 存在和最小状态摘要。

FORBIDDEN
不得由 Main 或 Worker 外层调用 child uploader，不得改 draft、HTML、图片内容或发布状态。

FAILURE
保持在 Step 5A，返回 BLOCKED/RETRY_REQUIRED；由 Main 重新 dispatch Hosting Worker。

RETURN
只返回 map 路径、PASS/FAIL、上传结果摘要和最多 3 条说明；不返回 token 或完整远程日志。
```

#### Step 5B — Build Prepare Worker

Worker contract:

```text
ROLE
你是确定性 build-prepare execution worker。

GOAL
消费 image-map.json，生成博客和微信布局的冻结输入。

INPUTS
posts/<date-slug>/draft.md；image-map.json；本地图片；references/publishing.md。

REQUIRED SKILL
none

PROJECT CONTRACT
只消费并校验 image-map.json；缺 map 时 fail closed，不上传、不调用专业 Skill。

OUTPUT
posts/<date-slug>/article.md；posts/<date-slug>/article-wechat-source.md。

GATE
执行：
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs <date-slug> --prepare-only

FORBIDDEN
不得编写 HTML、修改 draft、上传或发布。

FAILURE
失败即停止并报告；不得绕过 image-map.json。

RETURN
只返回两个 artifact 路径、Gate 结果和最多 3 条说明。
```

#### WeChat Layout Worker（GZH Worker）

Execution owner: WeChat Layout Worker → mandatory `gzh-design`。

Worker contract:

```text
ROLE
你是微信 HTML layout execution worker。

GOAL
从冻结的 article-wechat-source.md 和本地 imgs/ 生成可发布的 article-wechat.html。

INPUTS
article-wechat-source.md；local imgs/；目标 output article-wechat.html；
references/publishing.md；references/adapter-gzh-design.md。

REQUIRED SKILL
必须读取并完整执行 gzh-design/SKILL.md。

PROJECT CONTRACT
preserve H2 order；preserve paragraph/list/code semantics；preserve image basename/order/section；
图片使用 imgs/<basename>；no CDN body src；no <a href>；SLOT00 为 lead visual。child 自己选择
theme、装配组件、运行 validator 和生成 preview。

OUTPUT
posts/<date-slug>/article-wechat.html。

GATE
以 child validator/preview 为第一层 Gate；完成后将 HTML 留给 Build Finalize Worker 做父层
structural/integrity Gate。

FORBIDDEN
不得改 draft、image-plan、image-map、source、图片内容或发布状态；不得把 HTML 任务交回 Main。

FAILURE
返回 BLOCKED/RETRY_REQUIRED；从冻结 article-wechat-source.md 重新生成，不 patch 旧 HTML。

RETURN
只返回 HTML 路径、child validator/preview 结果和最多 3 条说明。
```

#### Step 5 Finalize Worker

Worker contract:

```text
ROLE
你是确定性 build-finalize execution worker。

GOAL
对 child 生成的 article-wechat.html 执行 repository structural/integrity Gate。

INPUTS
article.md；article-wechat-source.md；article-wechat.html；最终本地图片。

REQUIRED SKILL
none

PROJECT CONTRACT
只读校验，不修改 child-owned HTML；检查 substantive H2 顺序、paragraph/list/code semantics、
图片 basename/order/section placement、lead visual 和 artifact freshness。

OUTPUT
Step 5 finalized summary。

GATE
执行：
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs <date-slug> --finalize-only

FORBIDDEN
不得 apply_patch、sed、perl 或其它方式手工编辑 article-wechat.html。

FAILURE
返回实际 diagnostics；Main 随后 dispatch fresh WeChat Layout Worker，再 dispatch fresh Finalize Worker。

RETURN
Gate PASS/FAIL、短 diagnostics 和下一 owner；不返回完整 HTML 或日志。
```

完成条件：`article.md`、`article-wechat-source.md`、`article-wechat.html` 均存在，结构与图片
拓扑一致，gzh-design validator/preview 已完成，父层 structural/integrity Gate 通过。

### Step 6 — Publish

Main responsibility: 先完成博客轨，再准备微信 capsule，再 dispatch 微信发布 Worker；只消费状态
和短 handoff。博客 push 不等于 Pages deploy；微信创建草稿不等于群发。

#### Step 6A — Blog Publish Worker

Worker contract:

```text
ROLE
你是博客发布 execution worker。

GOAL
完成 blog publish、Astro build、commit、push，并记录博客轨 state。

INPUTS
最终 article.md；date-slug；blogSlug；references/publishing.md；仓库 Git 状态和发布约束。

REQUIRED SKILL
none；执行仓库已有 publish-blog.mjs 合同。

PROJECT CONTRACT
博客发布、commit/push、构建和 state 记录均由本 Worker 负责；保留博客 push 与站点 deploy 的区别。

OUTPUT
博客发布 state；commit SHA；必要时 RESUME.md。

GATE
执行：
bun run .agents/skills/wechat-article-write/scripts/publish-blog.mjs <date-slug>

FORBIDDEN
不得由 Main commit/push，不得发布微信，不得改 HTML 或调用微信发布 Skill。

FAILURE
保留脚本已有失败状态；返回 BLOCKED/RETRY_REQUIRED 和短 diagnostics，不扩大到微信轨。

RETURN
只返回博客状态、commit SHA、Gate 结果和最多 3 条说明。
```

#### Step 6B — WeChat Publish Prepare Worker

Worker contract:

```text
ROLE
你是微信发布 preflight execution worker。

GOAL
为 baoyu-post-to-wechat 构建最小、安全的发布 capsule。

INPUTS
article-wechat.html；cover；博客状态；date-slug；references/publishing.md。

REQUIRED SKILL
none

PROJECT CONTRACT
只做 repository-specific preflight；博客必须已完成或明确 blocked；不访问网络，不创建草稿。

OUTPUT
publish capsule：最终 HTML、cover、title、summary、canonical author 和带 UTM 的 source URL。

GATE
执行：
bun run .agents/skills/wechat-article-write/scripts/publish-wechat.mjs <date-slug> --prepare-only

FORBIDDEN
不得上传图片、获取 media_id、创建微信草稿或 finalize state。

FAILURE
失败即停止并报告；不绕过博客状态或 HTML integrity Gate。

RETURN
只返回 capsule 事实、Gate 结果和最多 3 条说明；不返回 token。
```

#### Step 6C — WeChat Publishing Worker

Execution owner: WeChat Publishing Worker → mandatory `baoyu-post-to-wechat`。

Worker contract:

```text
ROLE
你是微信草稿 publishing execution worker。

GOAL
使用 prepare capsule 创建微信草稿，并在 child 成功后 finalize pipeline state。

INPUTS
publish capsule；最终 article-wechat.html；cover；项目 .baoyu-skills/ 配置。

REQUIRED SKILL
必须读取并完整执行 baoyu-post-to-wechat/SKILL.md 及项目 EXTEND.md。

PROJECT CONTRACT
child 自己选择 API/browser/remote-api，上传正文图片和 cover，创建草稿并获取 media_id；Main
不接触 token 和上传轨迹。创建草稿不等于群发。

OUTPUT
draft created；media_id；微信 state done。

GATE
child 成功后由本 Worker 执行：
bun run .agents/skills/wechat-article-write/scripts/publish-wechat.mjs <date-slug> --finalize-only --media-id <id>

FORBIDDEN
不得由 Main 或 Worker 外层调用 child 内部 API script，不得创建等价草稿，不得改 HTML 或图片。

FAILURE
保持 Step 6.2，返回 BLOCKED/RETRY_REQUIRED；由 Main 重新 dispatch fresh WeChat Publishing Worker。

RETURN
只返回 draft 状态、media_id（如可报告）、state 结果和最多 3 条说明。
```

完成条件：博客状态已记录且先于微信草稿完成；微信草稿状态已记录；任一侧失败都能通过
state v2 独立恢复。

## E2E acceptance: Subagent Execution Fidelity

版本升级后的真实 E2E 必须验证 Subagent Execution Fidelity，而不只是 Visual Coverage。优先选择
`reader-response`、normal long-form、source-poor 且至少需要一个 generated body visual 的文章，
覆盖 Research、Understanding、Draft、humanizer、cover、SLOT00、infographic、hosting、gzh、
blog 和 WeChat。由 Verification Worker 执行和收集结果；Main 只读取 checklist，不补做任何执行。

E2E 完成后必须回答的自我复盘清单见 `references/subagent-execution.md`。理想终态是所有 Main direct
execution = NO，所有 applicable Worker execution = YES。

### Final Verification Worker

Main responsibility: dispatch 最终 Verification Worker，读取短总结后向用户汇报；Main 不亲自执行
验证命令、build、Git 或 HTTP 检查。

Worker contract:

```text
ROLE
你是最终验证 execution worker。

GOAL
验证 pipeline、仓库架构、生产构建和发布状态的终态。

INPUTS
最终 artifacts；pipeline state；必要的 commit、部署和 HTTP 目标。

REQUIRED SKILL
none

PROJECT CONTRACT
验证 underlying result，不以命令退出成功代替 artifact/state 检查；不修改任何产物。

OUTPUT
最终 verification summary。

GATE
执行：
git status --short
npm run test:agent
npm run check:agent
npm run build
npm run verify
必要时补充 commit verification、HTTP check、pipeline state check。

FORBIDDEN
不得修补失败产物、重新发布或绕过 Gate；发现失败只报告具体诊断。

FAILURE
返回 BLOCKED 和失败命令/事实；由 Main 决定重新派发哪个 owner。

RETURN
只返回每项 PASS/FAIL、关键诊断、pipeline state 和最多 3 条说明。
```

## Worker handoff rule

Worker 不能把完整研究报告、全文、HTML、图片 prompt 或长日志重新塞回 Main context；所有 Worker
统一只返回短 handoff。具体格式、capsule 模板和 execution-unit matrix 见
`references/subagent-execution.md`。

## Delegation fidelity

Native delegation means the Worker Skill owns and executes its documented workflow。Worker 必须
直接读取 child `SKILL.md`，完整执行其 contract 并写出最终产物；Main 读取 child `SKILL.md` 或
模仿其流程不算 delegation。

### Native delegation

Main 传递目标、输入、strategy、项目偏好、输出路径、backend override、子 Skill 原生非交互参数
和验收边界；Worker 读取 required child Skill 的 `SKILL.md`，完整执行分析、选择、生成、validator 或发布，
然后只返回短 handoff。

### Skill-via-Worker definition

```text
Main Agent
    ↓ minimal capsule
Worker Subagent
    ↓ reads and executes
Specialist Skill
    ↓ may call documented internals
artifact + concise handoff
```

Worker 在完整执行某个 Skill 时，可以按照该 Skill 的 `SKILL.md` 调用它自己的内部 scripts。
禁止的是 Main Agent 直接调用 child internal script，或 Worker 外层绕过 child Skill 复刻其实现。

### Mandatory child delegation

只要当前 workflow 使用对应能力，以下阶段必须通过对应 child Skill；不可用、无法调用、依赖缺失
或执行失败时必须 fail closed，不能 fallback 到 Main：

| 阶段 | Execution owner → Child Skill | Main 替代 |
|---|---|---|
| Step 3 | Humanization Worker → `humanizer-zh` | 否 |
| humanize | Humanization Worker → `humanizer-zh` | 否 |
| cover | Cover Worker → `baoyu-cover-image` | 否 |
| SLOT00 | Lead Summary Visual Worker → `baoyu-xhs-images` | 否 |
| 正文生成图 | Body Visual Worker → `baoyu-infographic` | 否 |
| generated body visual | Body Visual Worker → `baoyu-infographic` | 否 |
| Step 5A hosting | Hosting Worker → `github-image-hosting` | 否 |
| 图片托管/CDN | Hosting Worker → `github-image-hosting` | 否 |
| Step 5B HTML | WeChat Layout Worker → `gzh-design` | 否 |
| Step 6 WeChat draft | WeChat Publishing Worker → `baoyu-post-to-wechat` | 否 |

统一模型：

```text
mandatory child unavailable or failed
        ↓
report blocker
        ↓
remain at current Step
        ↓
dispatch fresh Worker or BLOCK
```

### Optional delegation

`research`、understanding、`baoyu-diagram` 和其它辅助分析能力由对应 Worker 按语义需要动态
选择；不维护 all available research、understanding 或 writing Skill catalog。它们不可用时，
Worker 可以在 capsule 范围内做语义判断，但不得侵犯 mandatory child 的专业 ownership。

### Child-owned artifact immutability

child 完成输出后，如果 Main 或其它 Worker 对 child-owned artifact 做了专业内容修改，该 artifact
不再视为 child-complete，必须重新 dispatch 原 child Worker 后才能进入下一个 Gate。这是 runtime
contract，不是新的 state 字段或调用证明。

### Ownership matrix

| Artifact | Owner Worker → Skill |
|---|---|
| humanized `draft.md` | Humanization Worker → `humanizer-zh` |
| cover | Cover Worker → `baoyu-cover-image` |
| SLOT00 | Lead Summary Visual Worker → `baoyu-xhs-images` |
| generated body image | Body Visual Worker → `baoyu-infographic` |
| `image-map.json` | Hosting Worker → `github-image-hosting` |
| `article-wechat.html` | WeChat Layout Worker → `gzh-design` |
| WeChat draft | WeChat Publishing Worker → `baoyu-post-to-wechat` |
| state / parity / deterministic artifacts | corresponding deterministic Worker |

## Recovery

Main 读取 state summary 和 Worker diagnostics，识别失败 artifact 的 owner，然后使用 frozen input
和诊断 dispatch fresh Worker。任何 Gate failure 都遵循：

```text
Worker output
   ↓
Gate failure
   ↓
Main identifies execution owner
   ↓
spawn fresh Worker
   ↓
pass frozen input + diagnostic
   ↓
Worker re-executes Skill or deterministic check
   ↓
Gate again
```

典型恢复：

- GZH Worker → Finalize Worker FAIL → Main 将 diagnostics 传给 fresh GZH Worker → fresh Finalize Worker；
- Humanization、cover、SLOT00、generated body image、image-map 或微信草稿失败 → 回到对应 owner
  Worker；
- 不修改已通过的下游 artifact 来绕过上游 Gate；
- Worker 不得因收到“生成 cover”“执行 gzh-design”等单一任务而顺便完成相邻阶段。

## References

完整 Worker lifecycle、capsule template、handoff format、execution-unit matrix、恢复和
Skill-via-Worker 契约见 `references/subagent-execution.md`。

需要了解完整 Step 输入、输出和状态关系时，读取 `references/pipeline-overview.md`。
需要写作 frontmatter、SLOT、链接、MDX 和双轨内容不变量时，读取 `references/content-invariants.md`。
需要选择 `reader-response`、`tutorial` 或 `news-digest` 编辑目标时，读取对应的
`references/strategy-*.md`。
需要生成 `understanding-brief.md` 时，读取 `references/material-understanding.md`。
需要决定复用原图、SLOT 命名和视觉验收时，读取 `references/image-policy.md`。
需要构建或 finalize 微信 HTML 时，读取 `references/adapter-gzh-design.md`。
需要发布博客或微信草稿时，读取 `references/publishing.md`。
需要落实原创增量和近期文章形式差异时，读取 `references/originality-policy.md`。
遇到 Gate、路径、图片或发布错误时，读取 `references/troubleshooting.md`。

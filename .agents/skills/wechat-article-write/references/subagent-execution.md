# Subagent execution

本 reference 定义 `wechat-article-write` 的 Worker runtime contract。它只规定职责边界、输入
输出和 handoff，不创建新的 state schema、receipt、trace、registry 或能力目录。

## Main execution boundary

Main Agent 是 Orchestrator，不是产物生产者。Main 只负责：

- 理解用户最终目标、选择 strategy、读取 state 和理解 brief；
- 确定中心判断、整体编辑方向、semantic visual nodes 和当前 execution unit；
- 创建 Worker、传递最小 capsule、读取短 handoff；
- 根据 Gate / Worker 结果决定 proceed、retry、reroute 或 blocked；
- 在需要时给 fresh Worker 反馈，并向用户汇报最终结果。

Main Agent 不直接抓取网页、下载媒体、写 materials/draft/HTML、生成或操作图片、上传、发布、
commit/push、运行 Astro build、运行 Step scripts、运行 child Skill 内部脚本或调用专业 Skill
完成执行工作。Main 可以读少量 artifact 片段做 semantic decision，但应优先读 summary 和
contract。Worker failure never expands Main execution authority。

## Worker lifecycle

默认每个 Worker 都是：

- ephemeral；
- single-purpose；
- fresh-context；
- 完成一个 execution unit 后退出。

不得创建从 Step 1 持续到 Step 6 的 article-worker 或其它长期 Worker。只有真正独立的任务才可
并行；当前 cover、SLOT00、body visual 和下游构建保持 serial review，以避免文件冲突和视觉
风格漂移。

## Worker capsule

Main 每次 dispatch 只传递完成当前 unit 所需的最小信息，不传完整生命周期历史。统一使用以下
文本结构，不建立 JSON schema：

```text
ROLE
你是本阶段的 execution worker。

GOAL
本次唯一需要完成的目标。

INPUTS
只列文件路径和必要用户要求。

REQUIRED SKILL
必须执行的 Skill；没有则写 none。

PROJECT CONTRACT
本阶段必须保持的仓库边界。

OUTPUT
需要写入的 artifact。

GATE
完成后必须运行的 deterministic check；child validator 也在此说明。

FORBIDDEN
明确不能做的替代行为。

FAILURE
失败时停止并报告，不扩大任务范围。

RETURN
只返回状态、artifact 路径、Gate 结果和最多 3 条关键说明。
```

Capsule 应传递 frozen input 和上一 Gate 的实际 diagnostic；不要传入无关网页全文、完整历史
日志、其它阶段的 prompt 或 token。

## Worker handoff

handoff 是会话内的短交接，不是 persistent receipt。统一格式：

```text
STATUS: DONE | BLOCKED | RETRY_REQUIRED
UNIT: <execution unit>

ARTIFACTS:
- path

GATE:
- PASS / FAIL
- concise diagnostic

KEY NOTES:
- 最多 3 条

NEXT:
- expected next owner
```

Worker 不返回完整研究报告、全文、HTML、图片 prompt、API token、上传轨迹或长日志。失败必须
给出足以让 Main 重派 Worker 的短诊断；不应为了“证明调用过”写额外文件。

## Execution-unit matrix

| Unit | Worker | Required Skill | Artifact / Gate |
|---|---|---|---|
| Bootstrap / resume | Bootstrap or Resume/State Worker | none | state v2 summary |
| Research | Research Worker | dynamic research Skill or none | `materials.md` / `step1-collect.mjs` |
| Blog memory | Blog Memory Worker | none | `blog-memory.md` / `select-related-articles.mjs` |
| Understanding | Understanding Worker | dynamic understanding Skill or none | `understanding-brief.md` / `validate-understanding.mjs` |
| Draft | Draft Worker | dynamic writing Skill or none | `draft.md` / `step2-write.mjs` |
| Humanization | Humanization Worker | `humanizer-zh` | updated `draft.md` / `step3-polish.mjs` |
| Cover | Cover Worker | `baoyu-cover-image` | root cover / visual review + Step 4 Gate |
| SLOT00 | Lead Summary Visual Worker | `baoyu-xhs-images` | `imgs/00-infographic-core-summary.png` |
| Source body visual | Source Visual Worker | none or dynamic helper | source asset or generated-required decision |
| Generated body visual | Body Visual Worker | `baoyu-infographic` | one body SLOT raster / visual review |
| Visual finalization | Visual Finalizer Worker | none | `image-plan.json` / `step4-images.mjs` |
| Hosting | Hosting Worker | `github-image-hosting` | `image-map.json` |
| Build prepare | Build Prepare Worker | none | `article.md`, `article-wechat-source.md` |
| WeChat layout | WeChat Layout Worker | `gzh-design` | `article-wechat.html` / child + parent Gate |
| Build finalize | Build Finalize Worker | none | Step 5 structural/integrity Gate |
| Blog publish | Blog Publish Worker | none | commit/push/state |
| WeChat prepare | WeChat Publish Prepare Worker | none | publish capsule |
| WeChat publish | WeChat Publishing Worker | `baoyu-post-to-wechat` | draft/media_id/state |
| Verification | Verification Worker | none | test/check/build/publish summary |

## Skill-via-Worker

Skill-via-Worker 的成立条件是：Worker 直接读取 child `SKILL.md`，完整执行 child 的分析、
选择、生成、validator 或发布流程，并写入其约定 artifact。Worker 可以根据 child Skill 自身
文档调用 child 的内部 scripts；Main 不得调用这些 scripts，也不得读取 Skill 后自行模仿执行。

固定业务 mapping 只保留业务合同，不维护中央 Skill catalog：

| 能力 | Worker → Skill |
|---|---|
| 文本人性化 | Humanization Worker → `humanizer-zh` |
| 微信封面 | Cover Worker → `baoyu-cover-image` |
| 头部摘要卡 | Lead Summary Visual Worker → `baoyu-xhs-images` |
| 正文生成图 | Body Visual Worker → `baoyu-infographic` |
| 图片托管/CDN | Hosting Worker → `github-image-hosting` |
| 微信 HTML | WeChat Layout Worker → `gzh-design` |
| 微信草稿 | WeChat Publishing Worker → `baoyu-post-to-wechat` |

Research、Understanding、Draft 和辅助分析能力按实际缺口动态发现最匹配的 1–2 个 Skill；不
维护 all available research、ljg 或 writing Skill 清单。

## Artifact ownership

Worker 只能写自己负责的 artifact。一个 Worker 收到“生成 cover”时不能写正文、改 SLOT、上传
图片或修改 HTML；收到“执行 gzh-design”时不能改 draft、image-plan 或创建微信草稿。

child-owned artifact 一旦被 Main 或其它 Worker 做专业内容修改，就必须从 frozen input 重新
dispatch 原 owner Worker；不能用 patch、通用工具或另一个阶段绕过 Gate。state、parity 和其它
deterministic artifact 由对应 deterministic Worker 运行仓库脚本生成，不能被专业 Worker 随意改写。

## Failure recovery

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

恢复规则：

- mandatory Skill 不可用、依赖缺失或失败时 fail closed，停留在当前 Step；
- 同一 owner 的 fresh Worker 优先从冻结输入重试；只有语义变化时才 reroute；
- GZH structural/integrity 失败时保持旧 HTML 不变，重新 dispatch GZH Worker，再 dispatch新的
  Build Finalize Worker；
- 图片失败回到对应 Cover、SLOT00、Source 或 Body Visual Worker；
- 发布失败只恢复对应 blog 或 WeChat 子状态；
- Main 永远不能因 Worker 失败而接管产物生产。

## Deterministic boundary

脚本是 mechanic，不是 orchestration observability。Worker 负责运行本 unit 合同中要求的
deterministic command；Main 只消费结果，不新增调用 proof、worker trace、agent id 或其它
编排观察产物。现有 state v2、Step Gate、hash、SLOT topology、图片计划、parity、publish state
和 build 机制保持不变。

## E2E acceptance: Subagent Execution Fidelity

每次行为版本升级后，至少运行一次真实 E2E。推荐输入是 `reader-response`、normal long-form、
source-poor，且至少包含一个 generated body visual；应覆盖 Research Worker、Understanding
Worker、Draft Worker、Humanization Worker → `humanizer-zh`、Cover Worker → `baoyu-cover-image`、
Lead Summary Visual Worker → `baoyu-xhs-images`、Body Visual Worker → `baoyu-infographic`、
Hosting Worker → `github-image-hosting`、WeChat Layout Worker → `gzh-design`、Blog Publish Worker
和 WeChat Publishing Worker → `baoyu-post-to-wechat`。

执行 Agent 完成后必须回答：

```text
Main Agent 是否直接调用过 web/curl？
YES / NO

Main Agent 是否直接写过 materials/draft/HTML？
YES / NO

Main Agent 是否直接执行过 pipeline scripts？
YES / NO

Main Agent 是否直接调用过专业 Skill？
YES / NO

Research 是否由独立 Worker 完成？
YES / NO

Draft 是否由独立 Worker 完成？
YES / NO

humanizer 是否由 Worker → humanizer-zh 完成？
YES / NO

cover 是否由 Worker → baoyu-cover-image 完成？
YES / NO

SLOT00 是否由 Worker → baoyu-xhs-images 完成？
YES / NO

generated body visual 是否由 Worker → baoyu-infographic 完成？
YES / NO / NOT NEEDED

hosting 是否由 Worker → github-image-hosting 完成？
YES / NO

HTML 是否由 Worker → gzh-design 完成？
YES / NO

失败 artifact 是否由 Main 手工 patch？
YES / NO

微信是否由 Worker → baoyu-post-to-wechat 完成？
YES / NO
```

该清单是 E2E 自我复盘，不是 state 字段、receipt、trace 或 execution proof；不新增持久化
observability artifact。

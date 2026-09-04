# Delegated execution

本 reference 定义 `wechat-article-write` 的 runtime-neutral execution contract。它规定能力、边界、
输入输出和 handoff，不规定某个产品 API，也不创建 state schema、receipt、trace、registry 或
执行证明。

## Main execution boundary

Main Agent 是 Orchestrator，不是产物生产者。Main 负责：

- 理解用户目标，选择 strategy，读取 state summary 和 understanding brief；
- 形成中心判断、编辑方向、semantic visual nodes 和当前 Execution Unit；
- 选择并调用满足 contract 的隔离执行机制，传递最小 capsule，读取 bounded handoff；
- 根据 Gate 和 handoff 决定 proceed、retry、reroute 或 blocked，并向用户汇报结果。

Main 仍负责理解：Understanding Executor 先把原始材料压缩为 `understanding-brief.md`，Main 再据此
形成中心判断和文章方向。Main 不需要把完整材料搬入自己的上下文。

Main 不直接执行实际工作：抓取网页、下载媒体、写 `materials.md` / `draft.md` / HTML、修改文风、
生成或审阅图片、上传、发布、commit/push、build、pipeline scripts、child Skill 内部脚本和专业
Skill 调用，都必须进入隔离 execution context。Executor failure never expands Main execution authority。

## Execution Unit and Delegated Executor

Execution Unit 是一个逻辑责任边界，例如 research、understanding、draft、humanization、cover、
SLOT00、body visual、hosting、wechat layout、publishing 或 verification。它不是 Agent 数量，也不
要求“一 unit = 一个上下文”。

Delegated Executor 是完成一个或多个边界清晰 Execution Unit 的实际隔离执行上下文。

### Delegated Executor capability contract

一个机制只有
同时满足以下条件才算有效：

1. 执行上下文与 Main 有实际隔离；
2. 能独立读取任务所需文件；
3. 能独立调用所需工具和 Skill；
4. 工具轨迹和长上下文不需要完整返回 Main；
5. 能输出 bounded handoff；
6. 失败后能重新创建 fresh execution context；
7. 能限制在当前 unit，并不要求 Main 继续亲自执行专业工作。

可用机制的非规范性示例包括：subagent、child agent、task、child thread、forked context、
isolated session、delegated worker、separate agent process 或其它等价 runtime-native mechanism。
These are examples, not required implementations.

以下不算隔离：Main 在同一上下文中自称“Research executor”后继续搜索和写材料，或 Main 读取 child
Skill 后自行模仿其专业流程。

## Mechanism selection

每个 unit 开始前，Main 根据以下事实自行选择 runtime-native isolation mechanism：任务上下文大小、
专业性、是否需要 Skill 和工具、是否需要 fresh context、是否可安全合并、是否可并行，以及失败恢复
成本。Main 不固定整次 run 的机制。

高上下文任务通常 SHOULD 使用独立 fresh execution context：research、understanding、draft、
humanization、复杂视觉设计、WeChat layout 和复杂故障恢复。轻量 deterministic units（例如 state
preflight、build prepare/finalize、publish prepare、simple verification）可以在同一 isolated
Executor 中连续完成。合并不得破坏 artifact ownership、Skill ownership、fresh recovery、context
isolation、Gate boundary 或 scope discipline。

没有合适的 isolated delegated-execution mechanism 时：

```text
no suitable isolated delegated-execution mechanism
        ↓
current execution unit BLOCKED
        ↓
Main MUST NOT fallback to direct execution
```

没有某一种具体 subagent 工具本身不构成失败；只要其它机制满足本 contract，Main 即可继续。

## Execution capsule

Main 只传递当前 unit 所需的最小 capsule，并在重试时附上 frozen input 与上一 Gate 的实际诊断。
不传完整网页、完整历史日志、其它阶段 prompt、token 或无关 artifact。文本结构如下：

```text
ROLE
你是当前 execution unit 的 delegated executor。

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

## Bounded handoff

handoff 是会话内的短交接，不是 persistent receipt：

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
- recommended next unit
```

Executor 不返回完整研究报告、全文、HTML、image prompt、API token、上传轨迹或长日志。机制名称、
thread id、agent id、spawn id、producer 和调用 receipt 不属于持久化业务状态。

## Execution-unit matrix

| Unit | Required Skill | Artifact / Gate |
|---|---|---|
| Bootstrap / resume | none | state v2 summary |
| Research | dynamic research Skill or none | `materials.md` / `step1-collect.mjs` |
| Blog memory | none | `blog-memory.md` / `select-related-articles.mjs` |
| Understanding | dynamic understanding Skill or none | `understanding-brief.md` / `validate-understanding.mjs` |
| Draft | dynamic writing Skill or none | `draft.md` / `step2-write.mjs` |
| Humanization | `humanizer-zh` | updated `draft.md` / `step3-polish.mjs` |
| Cover | `baoyu-cover-image` | root cover / Step 4 Gate |
| SLOT00 | `baoyu-xhs-images` | `imgs/00-infographic-core-summary.png` |
| Source body visual | none or dynamic helper | source asset or generated-required decision |
| Generated body visual | `baoyu-infographic` | one body SLOT raster / Step 4 Gate |
| Visual finalization | none | `image-plan.json` / `step4-images.mjs` |
| Hosting | `github-image-hosting` | `image-map.json` |
| Build prepare | none | `article.md`, `article-wechat-source.md` |
| WeChat layout | `gzh-design` | `article-wechat.html` / child + parent Gate |
| Build finalize | none | Step 5 structural/integrity Gate |
| Blog publish | none | blog state / `publish-blog.mjs` |
| WeChat prepare | none | publish capsule / `publish-wechat.mjs` |
| WeChat publish | `baoyu-post-to-wechat` | draft/media_id/state |
| Verification | none | test/check/build/publish summary |

## Skill-via-Executor

Skill-via-Executor 成立的条件是：Executor 读取 required child Skill 的 `SKILL.md`，完整执行其
分析、选择、生成、validator 或发布流程，并写入约定 artifact。Executor 可以按 child Skill 文档
调用它自己的内部 scripts；Main 不得调用这些 scripts，也不得读取 Skill 后自行复刻实现。

固定业务 ownership：

| Capability | Executor → Skill |
|---|---|
| 文本人性化 | Humanization → `humanizer-zh` |
| 微信封面 | Cover → `baoyu-cover-image` |
| 头部摘要卡 | SLOT00 → `baoyu-xhs-images` |
| 正文生成图 | Generated body visual → `baoyu-infographic` |
| 图片托管/CDN | Hosting → `github-image-hosting` |
| 微信 HTML | WeChat layout → `gzh-design` |
| 微信草稿 | WeChat publish → `baoyu-post-to-wechat` |

Research、Understanding、Draft 和辅助分析能力按实际缺口动态选择最匹配的 1–2 个 Skill；不建立
research、ljg 或 writing catalog。

mandatory child Skill 不可用、依赖缺失或执行失败时必须 fail closed，停留在当前 unit；不得由
Main、generic tool 或其它 Skill 替代 fixed ownership。

## Artifact ownership

每个 Executor 只能写自己负责的 artifact。child-owned artifact 一旦被 Main 或其它 Executor 做
了专业内容修改，必须从 frozen input 重新交给原 owner；不能用 patch、通用工具或另一个阶段绕过
Gate。state、parity 和其它 deterministic artifact 由对应 unit 的 Executor 运行仓库脚本生成。

| Artifact | Owner |
|---|---|
| humanized `draft.md` | Humanization → `humanizer-zh` |
| cover | Cover → `baoyu-cover-image` |
| SLOT00 | SLOT00 → `baoyu-xhs-images` |
| generated body image | Generated body visual → `baoyu-infographic` |
| `image-map.json` | Hosting → `github-image-hosting` |
| `article-wechat.html` | WeChat layout → `gzh-design` |
| WeChat draft | WeChat publish → `baoyu-post-to-wechat` |
| state / parity / deterministic artifacts | corresponding deterministic unit |

## Failure recovery

```text
Executor output
   ↓
Gate failure
   ↓
Main identifies artifact owner
   ↓
Main selects a suitable isolated execution mechanism
   ↓
fresh Delegated Executor
   ↓
frozen input + diagnostic
   ↓
re-execute required Skill or mechanic
   ↓
Gate again
```

同一 owner 优先从冻结输入重试；只有语义变化时才 reroute。GZH structural/integrity 失败时保持旧
HTML 不变，重新生成后再由新的 deterministic finalize unit 校验。图片失败回到对应 visual owner；
发布失败只恢复对应 blog 或 WeChat 子状态。Main 永远不能因失败接管产物生产。

## Deterministic boundary

Script owns deterministic mechanics。Executor 运行当前 unit 合同要求的 deterministic command，Main 只消费结果。
保持 state v2、Step Gate、hash、SLOT topology、image plan、parity、publish state 和 build 机制；
不新增 execution trace、agent id、execution proof 或其它编排观察产物。

## Delegated Execution Fidelity E2E

行为版本升级后运行一次真实 E2E，覆盖适用的 Research、Understanding、Draft、Humanization、Cover、
SLOT00、generated body visual、Hosting、WeChat layout、Blog publish 和 WeChat publish。E2E 关注
实际是否隔离，不要求某个具体机制。机制可在会话复盘中临时报告，但不得写入 state、JSON 或 artifact。

完成后回答：

```text
Main 是否直接执行过实际工作？ YES / NO
Main 是否直接调用过专业 Skill？ YES / NO
实际执行是否被委托到隔离 execution context？ YES / NO
Research 是否隔离执行？ YES / NO；mechanism:
Draft 是否隔离执行？ YES / NO；mechanism:
Humanization 是否由隔离 Executor → humanizer-zh？ YES / NO
Cover 是否由隔离 Executor → baoyu-cover-image？ YES / NO
SLOT00 是否由隔离 Executor → baoyu-xhs-images？ YES / NO
Generated body visual 是否由隔离 Executor → baoyu-infographic？ YES / NO / NOT NEEDED
Hosting 是否由隔离 Executor → github-image-hosting？ YES / NO
WeChat layout 是否由隔离 Executor → gzh-design？ YES / NO
WeChat publish 是否由隔离 Executor → baoyu-post-to-wechat？ YES / NO
是否因某种特定 runtime 不支持某一种机制而错误退回 Main 执行？ YES / NO
是否创建了 runtime-specific workflow config？ YES / NO
```

理想终态是 Main direct execution = NO，所有 applicable delegated execution = YES，且没有
runtime-specific workflow config。

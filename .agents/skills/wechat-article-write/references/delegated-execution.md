# Delegated execution

本 reference 定义 `wechat-article-write` 的 runtime-neutral execution protocol：隔离边界、能力契约、
capsule、handoff、retry 和 E2E。它不定义 workflow routing，不创建 state schema、receipt、trace、
registry 或执行证明。

## Main execution boundary

Main 是 Orchestrator，不是产物生产者。Main 负责理解目标、选择 strategy、读取 state summary 和
brief、形成中心判断、选择当前 unit、dispatch 最小 capsule，并依据 Gate / handoff 决定
`proceed`、`retry`、`reroute` 或 `blocked`。

Main 不直接执行实际工作；所有工具、专业 Skill、deterministic command、artifact production、
upload、publish、build 和 repository mutation 都必须进入 isolated execution context。Executor
failure never expands Main execution authority。
Main只消费 bounded handoff。Main 不读取 child Skill，Main 不读取失败 HTML；child 内部规则与原始产物由
对应 owner Executor 处理，Gate 只返回 bounded diagnostic。

## What counts as isolated execution

Execution Unit 是一个逻辑责任边界。Delegated Executor 是完成该边界的实际隔离上下文，不等于固定
的 Agent 数量，也不要求每个 unit 单独创建上下文。

有效隔离必须同时满足：

1. 执行上下文与 Main 有实际隔离；
2. Executor 能独立读取任务所需文件并调用所需工具、Skill；
3. 长上下文和工具轨迹不需要完整返回 Main；
4. Executor 能输出 bounded handoff；
5. 失败后能创建 fresh execution context；
6. Executor 能限制在当前 unit，不要求 Main 接管专业工作。

### Fresh minimal context by default

Executor 默认只接收当前 phase/unit 的 capsule、必要 artifact 路径，以及该 unit 所需的
Specialist Skill/reference。不得默认继承 Main 的完整 conversation history、此前 commentary、其它
Executor handoff、已完成 phase 的过程记录或完整用户原始 prompt；context inheritance is opt-in, not default。
只有当前 unit 依赖尚未物化到 artifact、且无法用短 capsule 表达的对话信息时，才允许
继承明确限定的一部分 context，并在 capsule 中说明原因。

Main 在同一上下文中自称 Executor 后继续实际操作，或读取 child Skill 后自行模仿其专业流程，均不
算隔离。Main 只读取路由所需的最小 capability metadata（名称与可用性）；child Skill 的加载和执行
由 Delegated Executor 承担。固定 ownership 由 workflow 声明，Executor 必须遵守；不得用 generic
tool 或其它 Skill 替代 mandatory owner。

## Mechanism selection

Main 为每个 phase 默认选择一个满足本 contract 的 runtime-native isolation mechanism，依据上下文大小、
专业性、工具与 Skill 需求、fresh-context 需求、可并行性、合并安全性和恢复成本。紧密的低风险
deterministic units 可以在同一 Executor 中合并；合并不得破坏 ownership、Gate、context isolation
或 recovery。逻辑 unit 与 physical Executor context 不等价；Gate 不单独创建 Executor。

同一 phase 内，producer 应在 handoff 前运行紧随其后的 deterministic Gate。只有 phase 完成或需要
fresh retry 时才返回/释放 Executor；不要为了单个脚本或一个 Gate 创建新的 LLM context。

没有某一种具体机制不构成失败；只要另一种机制满足本 contract，Main 即可继续。

## Subthread Admission Gate

创建任何新的 model-backed Executor 前，Main 必须先做 admission decision。至少满足一个条件才允许
创建新 context：

- **Context-heavy**：大型论文、网页、研究材料或媒体会明显污染 Main context；
- **Semantic production**：写作、重写、结构理解或复杂编辑判断；
- **Visual / design judgement**：图片生成、视觉审核、HTML layout 或其它设计判断；
- **Mandatory Specialist needs model context**：指定 Specialist 无法由 native action 或非模型
  worker 完成；
- **Fresh semantic retry**：前一 Executor 的 Gate 真实失败，且 recovery contract 明确要求 fresh
  context + frozen input。

如果以上条件全部不满足，`DO NOT SPAWN`。下列原因永远不足以创建新的 LLM context：

```text
state init / next
Gate command
hash comparison
file existence check
grep / rg
small JSON parsing
tool discovery
poll / wait
deterministic validator
prepare / finalize
```

Gate 不单独创建 Executor；deterministic unit 也不单独创建 Executor。Model-backed context budget 的
happy path 目标是 `<= 5`，对应 Research + Understanding、Draft + Humanizer、Visual、Build、Publish
五个 phase。native Skill action、non-model isolated execution 和 command runner 优先复用，不把 Main
变成实际产物生产者。

## Tool Discovery Budget

**Full tool catalog enumeration is forbidden.** Main 不得 dump 全部工具、schema 或 capability catalog
来寻找 delegation capability。确需发现时，只做一次 **Targeted Tool Discovery**：按精确 capability
关键词搜索（如 delegation、agent spawn、wait），只返回名称与简短描述，并限制为完成当前决策所需
的最少结果。确定 delegation、wait、lifecycle mechanism 后，同一会话直接复用，不按 phase 重复搜索。

## Wait and lifecycle budget

优先使用 completion notification；没有 notification 时使用一次最长合理的 blocking wait。禁止
`wait 30s → check file → wait 30s` 这类 poll loop；没有新 evidence 时不得反复 polling。

创建、wait、status、close 必须属于同一 Runtime Mechanism（same Runtime Mechanism）。不得用一种机制创建 Executor，再用另一
个 agent manager 查询生命周期。phase 进入 `DONE`、`BLOCKED` 或 `RETRY_REQUIRED` 并完成 handoff 后，
在 runtime 支持时立即 release context；正常继续同一 phase 时不关闭后重开。

## Fail closed

没有合适的 isolated delegated-execution mechanism 时：

```text
no suitable isolated delegated-execution mechanism
        ↓
current execution unit BLOCKED
        ↓
Main MUST NOT fallback to direct execution
```

mandatory Specialist 不可发现、依赖缺失或执行失败时同样停留在当前 unit；Main 不得用通用能力绕过
ownership 或 Gate。

## Execution capsule

Main 只传当前 unit 所需的最小输入；retry 额外携带 frozen input 和上一 Gate 的实际 diagnostic。
不传完整网页、完整历史日志、其它阶段 prompt、token 或无关 artifact。

默认 capsule 只保留以下字段；公共约束由本 reference 提供，不要每次重复发送：

```text
UNIT
当前逻辑 unit 或 phase。

INPUTS
文件路径和必要用户要求。

SKILL
必须执行的 Specialist Skill；phase 可以列出多个，每个占一行；没有则写 none。声明时 Executor
必须真实执行每个 Skill 的 workflow：运行时提供独立加载入口（如 Skill 工具）就通过它加载，并继续
执行到 OUTPUT；加载完成不等于交付。

TASK
本次唯一目标。

OUTPUT
需要写入的 artifact。

GATE
deterministic check，以及 child validator（如有）。
```

只有当前 phase 有特殊边界时，再增加 `CONSTRAINTS`。Executor 不越界；失败即返回；只返回短
handoff；不得替代 mandatory Skill。这些是默认 contract，不必在每个 capsule 重复。

## Bounded handoff

handoff 是会话内的短交接，不是 persistent receipt：

```text
STATUS: DONE | BLOCKED | RETRY_REQUIRED
UNIT: <execution unit or phase>

SKILL:
- <每个实际执行的 mandatory Specialist，各占一行；没有则写 none>

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

约束：KEY NOTES <= 3，diagnostic samples <= 3，每个 sample <= 160 chars。handoff 必须是
summary，不得返回完整 HTML、完整 tool schema、完整 JSON、全文 grep line 或完整 logs。

Executor 不返回完整研究报告、全文、HTML、image prompt、API token、上传轨迹或长日志。机制名称、
thread id、agent id、spawn id、producer 和调用 receipt 不属于持久化业务状态。

Phase handoff 的 `SKILL` section 必须列出本 phase 实际执行的全部 mandatory Specialist，每个一行；
Main 核验整个 section，不把单数的 `SKILL:` 行理解为只能执行一个 Specialist。

Completed or abandoned execution contexts should be released before opening additional independent
contexts when the runtime supports lifecycle management。不要保留已完成 phase 的 Executor 以备“可能
会再用”；同一 phase 正常继续时也不要关闭后重开。普通等待不需要高频 commentary 或 polling，只有
phase 完成、Gate failure with diagnostic、或需要用户决策时才向 Main 报进度。

wechat-article-write 不选择 model ID，也不写入 runtime-specific model 配置；模型由 runtime 自行
选择，除非被调用的 Specialist Skill 自己明确要求。

## Mandatory Specialist invocation

声明 mandatory Specialist 的 unit/phase，Executor 必须真实执行每个对应 Skill 的 workflow，不得跳过它自行设计流程。
运行时提供独立加载入口（如 Skill 工具）时必须通过它加载；仅把 Skill 当普通文档
读取、跳过其步骤自行发挥，视为未遵循。handoff 的 `SKILL` section 是自证；Main 必须核验每个声明的
Specialist 都已执行，运行时可读取执行记录时以记录为准。缺失或不一致 → `RETRY_REQUIRED`：fresh
context + frozen input + 明确「必须真实执行这些 Skill workflows」的 retry capsule；同一 unit 重复
失败 → `BLOCKED`，不使用 fallback。

## Fresh-context retry and artifact ownership

Gate failure → Main identifies the declared artifact owner → selects a suitable isolated mechanism →
creates a fresh Delegated Executor → passes frozen input + Gate diagnostic → reruns the required Skill or
mechanic → runs the Gate again。语义变化才允许 reroute；同一 owner 优先从冻结输入重试。

An artifact produced by a Specialist owner cannot be professionally modified by Main or a different
Executor. Retry goes back to the declared owner with frozen input and Gate diagnostic. GZH 或其它 child
artifact 的失败输出保持 disposable；Main 不 patch、绕过 Gate 或接管其生产。

发布失败只恢复对应 publish 子状态；其它已完成轨道不被覆盖。state、parity 和其它 deterministic
artifact 由对应 unit 的 Executor 运行仓库脚本生成。

For the same phase + failure class, allow at most one fresh retry。Retry capsule 只携带 frozen source path、
每个 phase 默认最多 1 次 fresh retry。
failure class、counts、最多 3 个 samples、required Specialist、target output 和 Gate command；不
复制完整 workflow、完整 Skill、project rules、HTML 或上一 handoff。第一次真实 Gate failure 返回
`RETRY_REQUIRED`；fresh retry 后若仍是同一 failure class，返回 `BLOCKED`，不得进行第三次自动 retry。
第二次同类失败 → BLOCKED。
Transient network/API/rate-limit failure 由 Specialist 自身 policy 处理，不自动产生 parent-level
LLM context。

gzh-design 的主题不是搜索空间：一次 fresh、content-preserving retry 后仍失败即停止，禁止 theme
roulette。presentation 可以变化，但 source-visible article content 必须保持不变。

## Deterministic boundary

Script owns deterministic mechanics；Executor 运行当前 unit 合同要求的 command，Main 只消费结果。
保持 state v2、Step Gates、hash、SLOT topology、image plan、parity、publish state 和 build 机制，
不新增 execution trace、agent id、execution proof 或其它编排观察产物。

## Delegated Execution Fidelity E2E

版本升级后，由隔离 verification unit 对当前 workflow 中适用的每个 execution unit 做真实复盘；
具体适用范围由 `SKILL.md` 的 workflow 决定。对每个 applicable unit，检查：

- actual work 是否离开 Main principal context；
- workflow 声明的 Specialist ownership 是否被遵守；
- Main direct execution 是否为 `NO`；
- retry 需要时是否使用 fresh context；
- 是否创建 runtime-specific workflow config；
- 是否持久化 receipt、agent ID、spawn ID 或 trace。

verification 只返回短 checklist 和 Gate 结果，不把完整执行轨迹写入 state、JSON 或 artifact。理想
终态是 Main direct actual work = `NO`、所有 applicable delegated execution = `YES`、无
runtime-specific workflow config、无持久化 execution proof。

该 E2E 仅用于 workflow version upgrade、用户明确要求 audit 或 architecture development task；普通
文章生产不额外创建 verification context。

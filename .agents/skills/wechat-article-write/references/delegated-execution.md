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

Main 在同一上下文中自称 Executor 后继续实际操作，或读取 child Skill 后自行模仿其专业流程，均不
算隔离。固定 ownership 由 workflow 声明，Executor 必须遵守；不得用 generic tool 或其它 Skill
替代 mandatory owner。

## Mechanism selection

Main 为每个 unit 动态选择满足本 contract 的 runtime-native isolation mechanism，依据上下文大小、
专业性、工具与 Skill 需求、fresh-context 需求、可并行性、合并安全性和恢复成本。紧密的低风险
deterministic units 可以合并；合并不得破坏 ownership、Gate、context isolation 或 recovery。

没有某一种具体机制不构成失败；只要另一种机制满足本 contract，Main 即可继续。

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

```text
ROLE
你是当前 execution unit 的 delegated executor。

GOAL
本次唯一目标。

INPUTS
文件路径和必要用户要求。

REQUIRED SKILL
必须执行的 Specialist Skill；没有则写 none。

PROJECT CONTRACT
本阶段必须保持的仓库边界。

OUTPUT
需要写入的 artifact。

GATE
deterministic check，以及 child validator（如有）。

FORBIDDEN
不能做的替代行为。

FAILURE
失败时停止并报告，不扩大范围。

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

## Fresh-context retry and artifact ownership

Gate failure → Main identifies the declared artifact owner → selects a suitable isolated mechanism →
creates a fresh Delegated Executor → passes frozen input + Gate diagnostic → reruns the required Skill or
mechanic → runs the Gate again。语义变化才允许 reroute；同一 owner 优先从冻结输入重试。

An artifact produced by a Specialist owner cannot be professionally modified by Main or a different
Executor. Retry goes back to the declared owner with frozen input and Gate diagnostic. GZH 或其它 child
artifact 的失败输出保持 disposable；Main 不 patch、绕过 Gate 或接管其生产。

发布失败只恢复对应 publish 子状态；其它已完成轨道不被覆盖。state、parity 和其它 deterministic
artifact 由对应 unit 的 Executor 运行仓库脚本生成。

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

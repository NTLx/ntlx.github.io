# Adaptive Stage 编排策略

本文件是 `research`、`synthesize`、`adapt`、`draft`、`refine` 和
`illustrate` 的共同编排协议。`workflow.mjs` 定义阶段合同；本文件定义
Agent 如何在合同允许的范围内选择方法。它不是 Skill 注册表，也不预设
某个内容、写作或视觉 Skill 必须出现。

## Observe

进入一个 adaptive stage 时，先读取：

- 用户目标、当前 strategy 和当前 state；
- stage contract 的输入、产物和 acceptance criteria；
- 已有 artifacts 及上一 Gate 的完整结果；
- 当前 Skill catalog 的 `name`、`description`、版本和可调用性提示。

先检查已有产物是否已经足够。不要因为阶段允许调用 Skill，就丢弃已经
通过 Gate 的内容重新生产。

## Define Gap

把问题写成当前缺口，而不是可用工具的清单。例如缺口可能是：事实不足、
概念边界不清、中心判断太弱、反方没有验证、结构无法解释、语言出现
机械模式，或视觉节点没有说清楚要表达的关系。

如果没有可识别的缺口，`no-skill` 是完整且优先考虑的路线。

## Discover

运行动态目录：

```bash
bun run .agents/skills/wechat-article-write/scripts/skill-catalog.mjs --json
```

目录只提供轻量的 frontmatter 元数据。先根据 description 筛少量候选，
再读取候选 Skill 的完整 `SKILL.md` 及其直接引用的配置/参考文件。不要
把全部 Skill 正文塞进上下文，也不要把候选清单复制成新的静态路由表。

新安装且包含 `SKILL.md` 的 Skill 会自动进入目录；因此 Router 不需要
为它增加分支。

## Select

每个阶段只在以下路线中选择最小充分方案：

1. Agent 原生完成；
2. 一个语义最匹配的专业 Skill；
3. 少量互补 Skill 组合，每个 Skill 都必须有独立的质量增益。

选择时考虑 semantic fit、specificity、预期质量增益、输出兼容性、成本、
副作用、所需 setup 和下游可用性。优先选择能完整解决子任务的高层能力，
不要把一个完整任务拆成多个低层调用来制造调用次数。

## Delegate

通用 Delegate 合同：

```text
目标：解决当前明确 gap。
输入：只提供完成该 gap 所需的文件或摘录。
上下文：说明文章目标、strategy 和当前 Stage Contract。
只做：当前委托范围内的专业任务。
不要：修改 state；发布文章；破坏 frontmatter；修改 SLOT；修改仓库协议；
修改第三方 Skill；擅自切换 raster provider。
输出：返回可以被当前 stage artifact 消费的最小结果。
验收：由主 Agent 按当前 Stage Contract 和 Gate 判断。
```

Skill 的返回值只是候选材料。主 Agent 必须判断它是否真正解决了缺口，
再把有用部分压缩进阶段产物；不得原样堆叠报告或把 Skill 名称写成文章
论据。

视觉委托在上述合同后追加：

```text
只提供视觉方案、layout、信息架构或 rendering prompt；不要执行最终 raster rendering。
```

## Verify

先验证 stage contract，再验证 Skill 输出。每个阶段都必须运行对应 Gate：

- `research`：`step1-collect.mjs`；
- `synthesize`：`validate-understanding.mjs`；
- `adapt` / `draft`：`step2-write.mjs`；
- `refine`：`step3-polish.mjs`；
- `illustrate`：`step4-images.mjs`，并先通过图片后端预检；
- `build` / `publish`：使用 `workflow.mjs` 指定的确定性 Gate。

文件存在、Skill 返回成功或 Agent 主观满意，都不能替代 Gate。

## Adapt

Gate 失败后，先读取错误和当前产物，诊断失败原因，再选择一条不同于
盲目重复的路径：

- 修正输入或补充缺失证据；
- 在问题确实适合时同 Skill 重试，并说明改变了什么；
- 换用更匹配的候选 Skill；
- 由 Agent 原生补足；
- 增加一个有明确互补价值的 Skill。

修复后重新运行同一 Gate。失败状态要保留在 state，不能跳过 Gate 进入
下一阶段。相同错误连续出现时应停止重试并报告阻塞原因。

## Trace（默认 best-effort）

每一次 Adaptive Stage 的路线尝试都按
`Define Gap → Discover → Select → Execute → Gate` 完成后追加一条最小
trace。它是默认开启的 best-effort observability，不是额外 Gate：

```bash
bun run .agents/skills/wechat-article-write/scripts/orchestration-trace.mjs <date-slug> \
  --stage <stage> --gap "<当前缺口>" --candidates "skill-a,skill-b" \
  --selected "skill-a" --reason "<简短可外显理由>" \
  --gate <gate> --result <pass|fail|blocked|rerouted>
```

没有调用 Skill 时必须显式写 `--selected no-skill`，不要留空。每次路线尝试
最多追加一条 JSONL；`result` 只能是 `pass`、`fail`、`blocked` 或 `rerouted`。
它只写入现有 `posts/<date-slug>/orchestration-trace.jsonl` 运行时目录，记录
阶段、缺口、候选、选择、简短理由和 Gate 结果。字段有长度和数量上限，接口
不接受 prompt、完整 Skill 输出、凭据、隐私正文或隐藏推理。trace 写盘失败
只产生 warning，workflow 继续，不改变 artifact、state 或 Gate 的成功条件。

## 视觉专用规则

视觉阶段先回答“读者需要看懂什么”，再判断这个位置是否真的有视觉信息
增益；没有增益就不创建正文 SLOT。需要视觉能力时运行 catalog，从 description
筛选少量候选，再阅读入选 Skill 的完整说明。Agent 可以自己设计，也可以
选择任意当前或未来视觉 Skill；workflow 不维护视觉 producer 路由。

选中的 producer 只能负责概念设计、信息架构、layout、视觉隐喻或 rendering
prompt。无论 producer 是谁，都必须把最终 prompt 保存到本管线的确定性路径，
供后续 Gate 消费；producer 不修改仓库文件协议，也不直接完成最终 raster。

本文章管线的 raster 成本边界不可改变：高层视觉能力必须收束到
`baoyu-image-gen`，而 `.baoyu-skills/baoyu-image-gen/EXTEND.md` 的
`default_provider` 必须是 `codex-cli`。日常命令不传冲突的 `--provider`；
依赖配置和 Codex 登录态由 `check-image-backend.mjs` 预检。进入真实生图前必须运行
`bun run .agents/skills/wechat-article-write/scripts/check-image-backend.mjs --runtime`。
Codex CLI 不可用、登录失效或生成失败时，当前图片阶段 BLOCKED；只允许在同一
Codex 路径内诊断、修 prompt 或有限重试，禁止切换任何其它 raster provider。

视觉操作协议：先判定是否需要图；需要时动态发现并选择 Agent 原生或一个/少量
互补视觉能力；将选择和 intent 写入 `image-plan.json`；`prompt_source=adapter`
时由当前兼容 adapter 生成 prompt，`prompt_source=external` 时先委托 producer
生成 rendering prompt 并保存到预期路径；最后统一经
`baoyu-image-gen → codex-cli` 逐张生成 raster，再按 SLOT/计划/prompt/image
Gate 验证。external 的 `producer` 是运行期事实，不得据此增加 workflow 分支。

## 阶段完成记录

Agent 不需要维护新的 Router 或 Skill 注册表。每次路线尝试完成 Gate 后使用
上面的 trace 命令即可；该记录是辅助信息，最终真相仍是 stage artifact、state
和确定性 Gate。

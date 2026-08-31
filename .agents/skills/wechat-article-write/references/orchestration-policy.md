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

委托必须包含以下信息：

```text
目标：当前阶段要解决的缺口
输入：文件路径或必要摘录
上下文：用户目标、strategy、已通过的产物和相关 Gate
全局约束：内容不变量、来源可追溯性、作者声音和成本边界
输出：可被当前 stage contract 消费的内容或文件
不得破坏：frontmatter、SLOT、链接、state、图片命名等协议
验收：当前 stage contract 的 acceptance criteria
```

Skill 的返回值只是候选材料。主 Agent 必须判断它是否真正解决了缺口，
再把有用部分压缩进阶段产物；不得原样堆叠报告或把 Skill 名称写成文章
论据。

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

## 视觉专用规则

视觉阶段先回答“读者需要看懂什么”，再决定使用何种视觉能力。意图可以
是全文压缩、关系、流程、架构、概念对比、时间线、因果链、解释型插图，
或复用原文已有图表。任何动态发现的视觉 Skill 都必须先阅读其完整说明，
确认其 raster backend 能被项目级配置固定为 `baoyu-image-gen`；不能被
官方配置固定时，它只能承担分析、构图或 prompt 设计，不能直接承担
raster rendering。

本文章管线的 raster 成本边界不可改变：高层视觉能力必须收束到
`baoyu-image-gen`，而 `.baoyu-skills/baoyu-image-gen/EXTEND.md` 的
`default_provider` 必须是 `codex-cli`。日常命令不传冲突的 `--provider`；
依赖配置和 Codex 登录态由 `check-image-backend.mjs` 预检。Codex CLI
不可用、登录失效或生成失败时，当前图片阶段 BLOCKED；只允许在同一
Codex 路径内诊断、修 prompt 或有限重试，禁止切换任何其它 raster provider。

## 阶段完成记录

Agent 不需要为每次选择维护新的 Router 文件。若任务需要交接或审计，
可在对应 post 的过程说明中记录：发现的 gap、选择的路线、输入产物、
Gate 结果和失败后的改道理由。该记录是辅助信息，最终真相仍是 stage
artifact、state 和确定性 Gate。

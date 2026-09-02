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

如果没有可识别的缺口，普通 adaptive 方法的 `no-skill` 是完整且优先考虑的路线。

这是 Mandatory protocol layers 的明确例外：`humanizer-zh`、Mandatory Baoyu
Visual Design 和 `gzh-design` 不能跳过。`humanizer-zh` 是所有文章的
Mandatory Humanization Layer，不是文章写作 Router；它必须在 Step 2 Gate 后、
Step 3 Gate 前实际执行。其它 refine 方法仍可由 Agent 按实际缺口选择。

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

### Mandatory Humanization Layer

进入 refine（tutorial 的最终 adapt 润色也适用）时，主 Agent 必须先读取并应用
`pre-humanizer-normalize.mjs` 完成确定性图片/cover 预处理，再读取并应用
`.agents/skills/humanizer-zh/SKILL.md`，然后审阅 diff，最后运行
`mark-humanized.mjs` 写入当前 draft 的 freshness receipt，再运行 Step 3 Gate。
允许零改动，但不允许不调用。receipt 产生后直到 Step 5 finalize，`draft.md` 不得
再由流水线脚本改写；humanizer 之后不得凭空增加作者经历、态度或情绪。

用户反馈“生硬、AI 味重、宣传腔、总结腔、排比过多、太抽象或不像作者”时，
视为 Step 3 reopened：只回到 `draft.md` 修改，重新完成 pre-humanizer-normalize、
humanizer-zh、mark-humanized 和 Step 3 Gate。不得直接修改 article.md、微信 source
或 HTML 来绕过草稿与 receipt。

委托合同追加以下边界：

```text
目标：识别并修复 draft.md 中的 AI 写作痕迹，使文章更自然，同时保留作者原有判断和技术准确性。
可以：删除填充短语、打破公式化结构、减少机械排比和 AI 高频抽象词、调整句长和节奏、去掉宣传式/夸张式语言、修复模糊归因、去掉伪金句，并保留或强化已有作者声音。
不得：发明事实、作者经历、作者感受；修改技术结论、数字、版本、模型名、引用来源、URL、代码、直接引语、SLOT 编号、H2 顺序、frontmatter 或 image-plan；删除/移动 SLOT、参考资料或延伸阅读；修改第三方 Skill 或发布文章。
```

humanizer 完成后主 Agent 必须检查事实、来源、数字、术语、第一人称、SLOT
位置和 H2 顺序；这是输出验收，不是另一个 Skill。

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
增益；没有增益就不创建正文 SLOT。`coverage_review` 由当前
`wechat-article-write` Agent 完成，并在 `image-plan.json` 记录
`article_visual_design.planner=wechat-article-write-agent`。

illustrate 的四层合同如下：

1. **Baoyu Design Skills**：`baoyu-cover-image` 负责 cover；`baoyu-xhs-images`
   负责 `SLOT_IMG_00`；`baoyu-infographic` 负责正文 SLOT。每个最终 raster
   asset 都必须有匹配的 `baoyu_design.skill` 和 `producer`。
2. **Baoyu Specialized Design Skills**：当前至少有 `baoyu-diagram`。只有当
   结构、架构、流程、时序、数据流、层级或状态转换确实需要专项语法时，Agent
   才从 catalog 选择它。它提供 nodes、edges、方向、分组和拓扑，不是全局 style
   authority。
3. **Optional Contributors**：其它当前或未来 Baoyu Skill、第三方 Skill 或
   Agent-native reasoning 只能补充设计。`contributors` 是运行期事实，未知值
   也不需要 workflow 分支；它不是 Skill Router。
4. **Raster Renderer**：唯一出口是 `baoyu-image-gen`，唯一 provider 是
   `codex-cli`（配置字段 `default_provider`），唯一执行模式是集中式
   single-image serial renderer。

进入 illustrate 后按以下顺序：

```text
OBSERVE ARTICLE → DEFINE VISUAL NEEDS
→ wechat-article-write-agent（coverage_review）
→ baoyu-cover-image（cover）
→ baoyu-xhs-images（SLOT_IMG_00）
→ baoyu-infographic（按需的 SLOT_IMG_01+）
→ 检查 catalog，按需选择 baoyu-diagram / 其它 contributor
→ 写 image-plan → 物化全部 canonical prompts
→ prompt preflight → runtime Codex preflight
→ render-images-serial.mjs → Step 4 Gate → trace
```

委托任何 Baoyu 设计能力时追加 DESIGN-ONLY MODE：

```text
你正在作为 wechat-article-write 的 Baoyu 专项视觉设计能力参与。
只返回视觉设计、layout、信息架构、结构拓扑或 canonical-prompt contribution。
Do not render final images.
Do not invoke native imagegen, GenerateImage, image_generate, API image providers,
or baoyu-image-gen.
Do not use SVG/Canvas/HTML as the final article image.
不要修改文章 SLOT、state、发布协议或发布文章。
```

`baoyu-diagram` 的 delegate contract 只允许它判断 diagram type、nodes/components、
edges/relationships、flow direction、grouping、hierarchy、sequence、state
transition、label placement 和 layout constraints；它不得生成 SVG/PNG、执行
SVG→PNG、调用任何图片 backend 或成为最终 raster prompt authority。其结构结果
被核心 Baoyu 设计层吸收进现有 `intent`、`design_notes`、`baoyu_design` 和
canonical prompt，不新增 diagram artifact 或第二套图片产物链。

正常模式不根据 `article_type`、`direction`、关键词或 Skill 名称决定 layout/style。
Agent 自主组合 Type、Layout、Style、Palette、Rendering、Mood、Font；
`generate-image-prompts.mjs` 只验证 external producer 已生成的 Prompt，并追加
项目视觉合同。`baoyu-diagram` 或其它 contributor 不能接管最终 prompt。
所有 prompt 在第一张图前完成 preflight；真实生图前运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/check-image-backend.mjs --runtime
bun run .agents/skills/wechat-article-write/scripts/render-images-serial.mjs <date-slug>
```

renderer 固定顺序为 cover、`SLOT_IMG_00`、正文 SLOT 数字升序；每次只调用一张
single-image `baoyu-image-gen --provider codex-cli`，等待并验证输出后才启动下一张。
已存在且通过完整性检查的当前 asset 默认 skip；任一 asset 失败立即停止。不得
使用 batchfile、`--jobs`、parallel tool calls、后台任务、worker pool 或
`Promise.all`。Codex CLI 不可用、未登录或生成失败时当前图片阶段 BLOCKED，禁止
fallback。

## 阶段完成记录

Agent 不需要维护新的 Router 或 Skill 注册表。每次路线尝试完成 Gate 后使用
上面的 trace 命令即可；该记录是辅助信息，最终真相仍是 stage artifact、state
和确定性 Gate。

# 图片策略

## 四层角色分工

- **Baoyu Core Design Skills**：`baoyu-article-illustrator` 负责全文视觉规划和
  正文 authority；`baoyu-cover-image` 负责 cover；`baoyu-infographic` 负责
  `SLOT_IMG_00`。每个最终 asset 必须在 `baoyu_design.skill` 声明对应 authority；
- **Baoyu Specialized Design Skills**：当前至少有 `baoyu-diagram`，按需提供
  architecture、flowchart、sequence、state machine、data flow 等结构语法；
- **Optional Contributors**：其它 Baoyu/第三方 Skill 或 Agent-native reasoning，
  只补充结构、信息架构或视觉意见；`contributors` 是运行期事实，不是 Router；
- **Raster Renderer**：唯一 `baoyu-image-gen`，唯一 provider `codex-cli`，唯一
  execution mode 为 single-image serial。

Agent 负责定义读者要看懂的关系、选择当前能力、审核 prompt 和最终图片；本技能
脚本负责 SLOT、文件命名、图片格式和 state Gate。任何高层设计能力都运行在
DESIGN-ONLY MODE，只返回设计或 canonical-prompt contribution。

本技能不重新实现任何信息图布局、插图风格、漫画排版或 provider 代码。

## 先判断表达对象

看到一个 SLOT 时先写清楚“读者需要看懂什么”，可能是：

- 全文压缩、核心判断和论证路径；
- 复杂关系、流程、架构、因果链或时间线；
- 概念对比、责任边界、利益相关方或决策分叉；
- 原文已有且值得保留的静态图；
- 其它能显著降低理解成本的解释型视觉。

然后运行动态 catalog，从 description 中筛选能力，读取候选的完整
`SKILL.md` 和直接引用的 reference。`baoyu-article-illustrator`、
`baoyu-cover-image`、`baoyu-infographic` 是图片阶段的必经设计层；只有结构
关系确实需要专项语法时才读取 `baoyu-diagram` 及对应 type reference。一个
能力已经足够时不要叠加无价值调用；简单节点仍可由 Agent 直接设计，但不能
跳过 Core Design Layer。

## Producer-neutral prompt 协议

视觉 producer 只负责概念设计、信息架构、layout、视觉隐喻或 rendering
prompt。它不决定仓库文件协议，也不直接执行最终 raster。Agent 将选择和
意图写入 `image-plan.json`；`generate-image-prompts.mjs` 不发现、不选择、
不调用 producer，只按 `prompt_source` 处理确定性 prompt 文件。

当前兼容 adapter 可以按需读取以下 Baoyu 官方模板；这些不是 workflow 的
全局路由表。核心设计 Skill 是 hard dependency，具体 template reference
按 Agent 的 plan 动态解析：

| 资产 | 模板来源 | 约束 |
|---|---|---|
| `cover.png` | `baoyu-cover-image` | 写到 post 根目录；按 plan 决定文字和构图 |
| SLOT 00 | `baoyu-infographic` 的 layout/style | 必须压缩全文，不只解释局部 |
| SLOT 01+ | `baoyu-article-illustrator` | 根据附近论证节点构造解释图 |

`prompt_source` 缺失时按 `adapter` 兼容旧计划；新计划应显式填写
`adapter` 或 `external`。`external` 必须同时填写 `producer`，且 producer
必须仍是该资产的 Core Baoyu authority；`baoyu-diagram` 或其它 contributor
不能接管最终 raster prompt authority。无论 producer 是谁，最终 raster 都走
`baoyu-image-gen → codex-cli`。

## Prompt 与计划

```bash
bun run .agents/skills/wechat-article-write/scripts/generate-image-prompts.mjs <date-slug>
```

`image-plan.json` 是 Agent 做完视觉判断后的权威计划。正常模式必须明确写出
封面和 SLOT 00 的 intent，以及每个正文 SLOT 的 intent；`adapter` 节点继续
要求当前 Baoyu reference 中存在 Agent 选择的 layout/style/type 等值，`external`
节点还必须使用对应 Core authority 作为 `producer`。字段和兼容值见
`references/image-template-catalog.md`。旧文章若只有 article-type/direction
默认信息，必须显式传 `--allow-default-image-plan` 才能兼容运行。

视觉计划只表达意图和协议值，不得绕过图片后端 policy。文内 prompt 要包含
附近正文上下文、中文可见文字规则和文章解释图 guardrail；除非用户明确要求，
不加入日期、版本号、图号、标题栏、尺寸线、坐标标记或工程边框。

SLOT 00 的 prompt 必须综合全文的核心信息、论证路径、关键关系和结论。
正文 SLOT 只在能降低理解成本时创建；数量由正文和 image-plan 决定，可以为零。
正常流程尊重 adapter plan 中明确写出的 layout/style/type；旧的
`claymation` 等默认值只在显式兼容模式下使用。

## Agent 视觉操作协议

1. 先判断当前位置是否真的需要图；没有明确视觉信息增益就不要创建正文 SLOT。
2. 需要视觉能力时运行：
   `bun run .agents/skills/wechat-article-write/scripts/skill-catalog.mjs --json`，
   依据 description 筛选少量候选，再读取候选完整 `SKILL.md`。
3. Agent 决定自己设计，或选择一个/少量互补 producer；一个能力足够时不要叠加。
4. 将每个资产的 intent、`prompt_source` 和（external 时）`producer` 写入
   `image-plan.json`。
5. external producer 只返回视觉方案、layout 或 rendering prompt，并将最终
   prompt 保存到下列确定性路径；不要执行最终 raster：

   - cover：`imgs/prompts/00-cover-<blogSlug>.md`
   - article summary：`imgs/prompts/00-infographic-core-summary.md`
   - body：`imgs/prompts/NN-<desc>.md`

6. `generate-image-prompts.mjs` 对 adapter prompt 按需生成，对 external prompt
   只检查存在且非空、保留原文；然后统一由 `baoyu-image-gen → codex-cli`
   逐张生成 raster，最后运行 Step 4 Gate。

## 图片成本边界

后端顺序、配置层级、失败语义和命令规则统一见
`references/image-backends.md`。执行前必须通过：

```bash
bun run .agents/skills/wechat-article-write/scripts/check-image-backend.mjs --runtime
```

所有 raster 必须走 `baoyu-image-gen → codex-cli`。Codex CLI 不可用、未登录
或生成失败时停止当前图片任务并报告 BLOCKED。不得使用原生 imagegen 或
其它收费/外部 provider fallback。

完成全部 canonical prompt 后，只能调用集中式串行 renderer：

```bash
bun run .agents/skills/wechat-article-write/scripts/render-images-serial.mjs \
  <date-slug>
```

renderer 对每个 asset 使用 single-image invocation，显式传入
`--provider codex-cli`，等待并验证完成后才启动下一张；它还会在第一张前
完成全部 prompt preflight 和 runtime backend check。禁止手工调用多个
`baoyu-image-gen`、batch 模式、`batch.json`、`--batchfile`、`--jobs`、
禁止 `xargs -P`；禁止后台任务、并发 tool call、多个 image-generation subagent；禁止 `Promise.all`
组织生图调用。

## 命名与视觉 Gate

- SLOT 00：`imgs/00-infographic-core-summary.<ext>`；
- SLOT 01+：`imgs/NN-<desc>.<ext>`，且与 prompt basename 字符级一致；
- 封面：post 根目录 `cover.png` 或脚本支持的等价扩展名；
- draft SLOT、image-plan entry、prompt 和 image 必须一一对应；正文可以没有
  SLOT 01+，但 SLOT 00 必须存在；
- 不依赖 provider 随机文件名；已有原图先核对信息价值再复用；
- 生图后逐张查看，核对可见中文、数字、模型名和正文关系；文字错漏时
  改 prompt 或去掉非必要文字后沿同一 Codex 路径重试。

最后运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/step4-images.mjs <date-slug>
```

文件存在不等于通过；只有图片与 SLOT、prompt、正文意图和质量要求都相
匹配，才可进入 Step 5。

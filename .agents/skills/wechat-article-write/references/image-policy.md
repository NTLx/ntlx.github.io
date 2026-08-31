# 图片策略

## 角色分工

- Agent：判断视觉意图、选择合适的当前能力、审核 prompt 和最终图片；
- visual producer（Agent 或动态选择的视觉 Skill）：按自己的方法分析、布局或生成 rendering prompt；
- 本技能脚本：维护 SLOT、文件命名、图片格式和 state Gate；
- `baoyu-image-gen`：执行 raster rendering，provider 由项目配置固定。

本技能不重新实现任何信息图布局、插图风格、漫画排版或 provider 代码。

## 先判断表达对象

看到一个 SLOT 时先写清楚“读者需要看懂什么”，可能是：

- 全文压缩、核心判断和论证路径；
- 复杂关系、流程、架构、因果链或时间线；
- 概念对比、责任边界、利益相关方或决策分叉；
- 原文已有且值得保留的静态图；
- 其它能显著降低理解成本的解释型视觉。

然后运行动态 catalog，从 description 中筛选能力，读取候选的完整
`SKILL.md` 和直接配置。一个能力已经足够时不要叠加无价值调用；简单
节点可以由 Agent 直接设计。

## Producer-neutral prompt 协议

视觉 producer 只负责概念设计、信息架构、layout、视觉隐喻或 rendering
prompt。它不决定仓库文件协议，也不直接执行最终 raster。Agent 将选择和
意图写入 `image-plan.json`；`generate-image-prompts.mjs` 不发现、不选择、
不调用 producer，只按 `prompt_source` 处理确定性 prompt 文件。

当前兼容 adapter 可以按需读取以下 Baoyu 官方模板；这些不是 workflow 的
全局硬依赖，也不是视觉 Skill 路由：

| 资产 | 模板来源 | 约束 |
|---|---|---|
| `cover.png` | `baoyu-cover-image` | 写到 post 根目录；默认不放文字 |
| SLOT 00 | `baoyu-infographic` 的 layout/style | 必须压缩全文，不只解释局部 |
| SLOT 01+ | `baoyu-article-illustrator` | 根据附近论证节点构造解释图 |

`prompt_source` 缺失时按 `adapter` 兼容旧计划；新计划应显式填写
`adapter` 或 `external`。`external` 必须同时填写 `producer`，其值只是运行
期事实，不得据此增加 workflow 分支。无论 producer 是谁，最终 raster 都走
`baoyu-image-gen → codex-cli`。

## Prompt 与计划

```bash
bun run .agents/skills/wechat-article-write/scripts/generate-image-prompts.mjs <date-slug>
```

`image-plan.json` 是 Agent 做完视觉判断后的权威计划。正常模式必须明确写出
封面和 SLOT 00 的 intent，以及每个正文 SLOT 的 intent；`adapter` 节点继续
要求当前模板的 layout/style/type/style 合法值，`external` 节点只要求
`intent`、`prompt_source`、`producer`。字段和兼容值见
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

所有 raster 必须走 `baoyu-image-gen → codex-cli`。常规命令让
`default_provider` 生效，不传其它 `--provider`；Codex CLI 不可用、未登录
或生成失败时停止当前图片任务并报告 BLOCKED。不得使用原生 imagegen 或
其它收费/外部 provider fallback。

逐张串行运行示例：

```bash
bun run .agents/skills/baoyu-image-gen/scripts/main.ts \
  --promptfiles posts/<date-slug>/imgs/prompts/00-cover-<desc>.md \
  --image posts/<date-slug>/cover.png \
  --ar 16:9

bun run .agents/skills/baoyu-image-gen/scripts/main.ts \
  --promptfiles posts/<date-slug>/imgs/prompts/01-<desc>.md \
  --image posts/<date-slug>/imgs/01-<desc>.png \
  --ar 16:9
```

禁止 batch 模式、`batch.json`、`--batchfile`、`xargs -P`；禁止后台任务（包括 `&`）、
并发启动多个生图进程或分派多个 subagent。禁止 `Promise.all` 组织生图调用，
禁止 `xargs -P` 启动生图进程。
若测试必须显式传 provider，
只允许 `--provider codex-cli`。

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

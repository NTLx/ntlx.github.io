# 图片模板注册表

本文件说明视觉计划的协议字段和合法模板值。机器可读权威来源是
`references/image-template-map.json`；它的顶层 `infographic_layouts` 和
`infographic_styles` 是 allowed-values registry，不是文章类型到模板的路由表。

## 计划优先级

Step 2 的 Agent 或被选中的视觉能力先回答“读者在这个节点需要看懂什么”，
再把判断写入 `image-plan.json`。正常模式要求每个视觉节点的关键决策已经
存在；`generate-image-prompts.mjs` 只做协议物化，不替 Agent 二次决定布局、
风格或插图类型。

正常模式至少需要：

- `cover.intent` 和 `infographic.intent`；
- 每个资产显式填写 `prompt_source`（旧计划缺失时按 `adapter` 兼容）；
- `prompt_source: adapter` 时，cover 继续填写 `type` 以及 `style` 或完整的
  `palette` + `rendering`，infographic 填写合法 `layout` 和 `style`，每个
  正文 entry 填写 `intent`、合法 `type` 和 `style`；
- `prompt_source: external` 时，每个资产填写 `producer`，不校验上述
  Baoyu-specific 类型/风格枚举；
- draft 中每个 `SLOT_IMG_01+` 恰好对应一条 `illustrations` entry；没有正文
  视觉节点时使用 `illustrations: []`。

计划可以使用以下结构（字段值由 Agent 根据文章选择）：

```json
{
  "article_type": "technical-deep-dive",
  "cover": {
    "intent": "表达整篇文章的中心张力",
    "type": "conceptual",
    "style": "technical editorial",
    "palette": "cool",
    "rendering": "flat-vector",
    "prompt_source": "adapter"
  },
  "infographic": {
    "intent": "压缩全文判断、论证路径和结论",
    "layout": "structural-breakdown",
    "style": "technical-schematic",
    "prompt_source": "adapter"
  },
  "illustrations": [
    {
      "slot": 1,
      "intent": "比较两个方案在责任边界上的差异",
      "type": "comparison",
      "style": "editorial",
      "description": "responsibility-comparison",
      "prompt_source": "adapter"
    }
  ]
}
```

`article_type` 可以保留为内容语境，`direction` 可以保留为旧计划字段；二者
在正常模式都不替代上述视觉决策。缺少关键字段时正常模式失败；只有显式传
`--allow-default-image-plan` 才允许旧的 article-type/direction 默认值和
插图关键词推断继续工作。

外部 producer 示例：

```json
{
  "slot": 1,
  "intent": "解释 Agent escalation 状态变化",
  "prompt_source": "external",
  "producer": "future-visual-skill",
  "description": "agent-escalation-state"
}
```

## 模板来源

- adapter 模式的信息图 layout/style：`baoyu-infographic/references/layouts/*.md` 和
  `references/styles/*.md`；脚本把 Agent 指定的两个文件原样拼入 SLOT 00
  prompt。
- adapter 模式的文内插图 style：`baoyu-article-illustrator/references/styles/*.md`；脚本
  校验名称后读取对应模板。
- adapter 模式的封面：`baoyu-cover-image` 的协议字段由 Agent 明确写入 plan，
  脚本保留当前封面 prompt 适配格式。external 模式不读取这些模板。

## 信息图 layouts

合法值来自 `image-template-map.json`：

```text
bento-grid, binary-comparison, bridge, circular-flow, comic-strip,
comparison-matrix, dashboard, dense-modules, funnel, hierarchical-layers,
hub-spoke, iceberg, isometric-map, jigsaw, linear-progression, periodic-table,
story-mountain, structural-breakdown, tree-branching, venn-diagram,
winding-roadmap
```

## 信息图 styles

合法值来自 `image-template-map.json`：

```text
aged-academia, bold-graphic, chalkboard, claymation, corporate-memphis,
craft-handmade, cyberpunk-neon, hand-drawn-edu, ikea-manual, kawaii, knolling,
lego-brick, morandi-journal, origami, pixel-art, pop-laboratory, retro-pop-grid,
retro-popup-pop, storybook-watercolor, subway-map, technical-schematic,
ui-wireframe
```

## 文内插图 type/style

当前协议支持的 `type` 是 `comparison`、`flowchart` 和 `framework`。它们是
prompt 的确定性表达模板，不是 Skill 路由；Agent 可以先用自然语言意图描述
更丰富的关系，再选择最接近的协议类型。

`style` 必须对应当前已安装的 `baoyu-article-illustrator/references/styles`
文件，例如 `editorial`、`minimal`、`scientific`、`warm`、`retro` 或
`vector-illustration`。新安装的模板可被读取和校验，不需要修改本技能的
Skill catalog 或路由表。

## 图纸语法禁区

默认情况下，文内 SLOT 是解释型文章插图，不是图纸页。除非用户明确要求，
以下元素都视为错误：

- 日期、版本号、revision、图号、标题栏、假元数据盒；
- 尺寸线、刻度尺、坐标标记、角标定位符；
- 工程边框、装订框、规范书底栏。

只有用户明确要求技术制图感、图的主语是工程对象、且模块边界/接口方向/调用
链确实受益于技术制图语言时，才显式选择 `blueprint`。

## Legacy defaults

`image-template-map.json.legacy_defaults` 暂存旧的 `style_families` 和
`article_type_defaults`，用于旧文章的显式兼容运行。它不是正常流程的决策
来源，也不应被扩展成新的中央 Skill Router。正常 prompt 中的 layout、style、
type 和 intent 必须来自当前 Agent-authored plan。

## 适配器边界

`generate-image-prompts.mjs` 可以：

- 读取 draft、image-plan 和 SLOT；
- 校验 layout/style/type 及 plan 与 draft 的一一对应关系；
- 校验 basename、读取第三方模板并生成 prompt 文件；
- 保持 post 路径、文件名、图片后端和串行生图协议。

它不可以：

- 根据关键词猜测正常模式的 comparison / flowchart / framework；
- 根据 `article_type` 或 `direction` 正常模式自动选择 layout/style；
- 静默覆盖 plan 已经给出的 intent、layout、style 或 type；
- 选择或绑定某个视觉 Skill，或绕过 `baoyu-image-gen → codex-cli`。

完成 prompt 物化后仍须逐张审阅，并运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/step4-images.mjs <date-slug>
```

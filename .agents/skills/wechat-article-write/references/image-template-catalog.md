# 图片模板注册表

本文件说明 `image-plan.json` 的协议边界。正常流程不复制或冻结 Baoyu 的
完整模板库；Agent 先读取动态 catalog，再按当前选择渐进式读取对应 Skill
和 reference。`image-template-map.json` 仅保留旧文章显式兼容模式所需的
`legacy_defaults`，不是正常流程的 template source of truth。

## 计划优先级

Step 2 的 Agent 或被选中的视觉能力先回答“读者在这个节点需要看懂什么”，
再把判断写入 `image-plan.json`。正常模式要求每个视觉节点的关键决策已经
存在；`generate-image-prompts.mjs` 只做协议物化，不替 Agent 二次决定布局、
风格或插图类型。

正常模式至少需要：

- `article_visual_design.skill` 必须是 `baoyu-article-illustrator`，即使正文
  `illustrations` 为空；
- `cover.intent` 和 `infographic.intent`；cover、infographic、body 的
  `baoyu_design.skill` 分别必须是 `baoyu-cover-image`、`baoyu-infographic`、
  `baoyu-article-illustrator`；
- 每个资产显式填写 `prompt_source`（旧计划缺失时按 `adapter` 兼容）；
- `adapter` 资产填写 Agent 选定的非空 `type`、`layout`、`style`、`palette`、
  `rendering` 等字段；运行时只在对应 Baoyu reference 文件存在时通过；
- `external` 资产填写 Core authority 作为 `producer`，并提供已物化的非空
  canonical prompt；
- draft 中每个 `SLOT_IMG_01+` 恰好对应一条 `illustrations` entry；正文视觉
  节点可以是零个，SLOT 00 仍必须存在。

`article_type` 和 `direction` 可以保留为任意非空内容语境，但正常模式不把它们
当作枚举、路由输入或模板决策来源。只有显式传
`--allow-default-image-plan` 才允许旧的 article-type/direction 默认值和插图
关键词推断继续工作。

计划可以使用以下结构（字段值由 Agent 根据文章选择）：

```json
{
  "article_type": "future-architecture-analysis",
  "direction": "future-style-language",
  "visual_language": {
    "intent": "保持清晰结构和统一冷色系，但不同图片允许受控变化",
    "consistency": "controlled-variation"
  },
  "article_visual_design": {
    "skill": "baoyu-article-illustrator",
    "strategy": "只在视觉能明显降低理解成本的位置创建正文 SLOT"
  },
  "cover": {
    "intent": "表达整篇文章的中心张力",
    "baoyu_design": {
      "skill": "baoyu-cover-image",
      "type": "conceptual",
      "palette": "cool",
      "rendering": "flat-vector",
      "text": "title-only",
      "mood": "balanced",
      "font": "clean"
    },
    "prompt_source": "adapter"
  },
  "infographic": {
    "intent": "压缩全文判断、论证路径和结论",
    "baoyu_design": {
      "skill": "baoyu-infographic",
      "layout": "structural-breakdown",
      "style": "technical-schematic",
      "aspect": "16:9"
    },
    "contributors": ["baoyu-diagram"],
    "prompt_source": "adapter"
  },
  "illustrations": [
    {
      "slot": 1,
      "intent": "展示 Agent running → needs-human-decision → resumed 的状态转换",
      "baoyu_design": {
        "skill": "baoyu-article-illustrator",
        "type": "flowchart",
        "style": "editorial",
        "palette": "cool"
      },
      "contributors": ["baoyu-diagram"],
      "design_notes": "采用 diagram 的 state-machine 结构语法，但沿用文章的 editorial visual language。",
      "description": "agent-escalation-state",
      "prompt_source": "adapter"
    }
  ]
}
```

外部 producer 示例（仍需是该资产的 Core authority）：

```json
{
  "slot": 1,
  "intent": "解释 Agent escalation 状态变化",
  "prompt_source": "external",
  "producer": "baoyu-article-illustrator",
  "description": "agent-escalation-state"
}
```

## 模板 reference 的动态校验

- infographic adapter：按 Agent 选择检查
  `baoyu-infographic/references/layouts/<layout>.md` 和
  `references/styles/<style>.md`；
- body illustrator adapter：按 Agent 选择检查
  `baoyu-article-illustrator/references/styles/<style>.md`；
- cover adapter：使用 `baoyu-cover-image` 的 design fields，不冻结上游的
  template enum；
- diagram：Agent 读取 `baoyu-diagram/SKILL.md` 后，仅按需要读取对应 type
  reference，结构结果写进现有 `design_notes`、`intent` 和 canonical prompt。

文件存在即允许新模板；不存在即失败并输出预期路径。没有稳定 reference
目录的维度只要求 plan 值非空，不为上游 Markdown table 编写脆弱解析器。
因此更新第三方 Baoyu Skill 后，新增加的稳定 template 无需修改本技能的
JSON Schema enum 或 Router。

`type`、`layout`、`style`、`palette`、`rendering`、`mood`、`font` 等是由
Agent 从当前 Baoyu Skill 语义中选择的非空 design fields，不是本技能复制的
完整上游枚举。允许受控变化：cover、SLOT 00 和正文可以有不同组合，但应共享
文章要求的视觉气质、色彩家族、信息密度和读者感知。

## 设计能力边界

`baoyu-article-illustrator`、`baoyu-cover-image`、`baoyu-infographic` 和
`baoyu-diagram` 都以 DESIGN-ONLY MODE 参与：

```text
Do not render final images.
Do not invoke native imagegen.
Do not invoke GenerateImage.
Do not invoke image_generate.
Do not invoke API image providers.
Do not invoke baoyu-image-gen.
Do not use SVG/Canvas/HTML as final article image.
Return only the visual design / layout / structure / canonical-prompt contribution requested by the parent workflow.
```

`baoyu-diagram` 只贡献 diagram type、nodes、edges、方向、分组、层级、sequence
或 state transition 等结构语法；它不产生 SVG/PNG artifact，不执行 SVG→PNG，
也不能成为最终 article raster prompt authority。其它 Baoyu/第三方 Skill 和
Agent-native reasoning 同样只能作为 `contributors` 增强设计。

最终 raster 的唯一出口是 `baoyu-image-gen → codex-cli`，唯一执行模式是
single-image serial。

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

允许的 `external.producer` authority 是：cover 使用
`baoyu-cover-image`，SLOT 00 使用 `baoyu-infographic`，body 使用
`baoyu-article-illustrator`。未知 contributor 是运行期事实，不因中央脚本
暂时不认识而失败。

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

完成 prompt 物化后先运行串行 renderer，再逐张审阅并运行 Step 4 Gate：

```bash
bun run .agents/skills/wechat-article-write/scripts/render-images-serial.mjs <date-slug>
bun run .agents/skills/wechat-article-write/scripts/step4-images.mjs <date-slug>
```

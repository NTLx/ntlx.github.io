# 图片策略

## 角色分工

- Agent：规划图片位置、运行 prompt 生成脚本、审核 prompt、串行生图。
- 脚本：生成 prompt、校验占位符、校验图片文件和状态。

## 模板来源

| 图片 | 模板来源 | 说明 |
|---|---|---|
| 封面 `cover.png` | `baoyu-cover-image` | 不使用文字，输出在 post 根目录 |
| SLOT 00 信息图 | `baoyu-infographic/references/{layouts,styles}/*.md` | 直接拼装 layout + style 两份模板到 prompt，本技能不调用其完整出图工作流 |
| SLOT 01+ 文内图 | `baoyu-article-illustrator` | 根据占位符附近正文构建 prompt |

## 源文没有可复用的静态图（交互式图表：Quarto / Plotly / Observable / 数据面板）

很多数据博文（尤其 Quarto 渲染的）正文**没有任何 `<img>`**——所有 Figure 都是 JS 动态图（Plotly 等），curl / 抓取拿不到静态图，Jina / Reader 也只能拿到脚本壳。这时"复用原文图片"要换思路：

1. **找真图，不找图标签**：交互组件往往从一个数据 base 拉样本图。读页面里那个组件的 JS / 内联 config（如 `data-config` 里的 `base`、`models`、`animals` 字段，或同目录 `*.js`），拼出样本图 URL 模板。实例：`{base}/{model_slug}/{animal}-{vehicle}__s{sample}.png`，配一个 `scores.json` 存每张图的裁判分。直接 curl 下载代表性样本作为复用图——它们是实验的"呈堂证供"，比任何重画都忠实。
2. **图表"结论"无法静态复用 → 用信息图按原文数值重画**：Plotly 的排名 / 回归图下载不了，但结论数字在正文 / `scores.json` 里。把这些数字原样喂给 SLOT 00 信息图（或专门文内图）重画，**严禁编造数值**；重画完逐个核对数字与源一致（逐字核对见"图片查字门控"）。
3. **复用样本仍走命名契约**：下载的真图落到 `imgs/NN-<desc>.png` 时，文件名必须与 `generate-image-prompts` 为该 SLOT 生成的 prompt basename 字符级一致（下划线），否则 step4 报 basename mismatch。该 SLOT 跳过生图，直接落地复用文件。

判断顺序：先 `grep '<img'` 看有没有静态图；没有就去看交互组件的数据端点；再没有，才全走生成。

## Prompt 生成

```bash
bun run .agents/skills/wechat-article-write/scripts/generate-image-prompts.mjs <date-slug>
```

默认行为：

- 读取 `draft.md` 和 `image-plan.json`。
- SLOT 00 输出紧凑模板引用 prompt，包含 `Template source`，不展开完整模板。
- 文内图 prompt 必须包含附近正文上下文、中文可见文字规则、构图和色彩规则。
- 文内图 prompt 默认附带“文章插图而非工程图纸”的硬约束：禁止日期、版本号、图号、revision、标题栏、尺寸线、刻度、坐标标记、工程边框等图纸元数据。
- 缺少被引用的 `baoyu-infographic` 模板文件时直接失败（layout/style 不在白名单）。

## image-plan.json

极简格式：

```json
{
  "article_type": "deep-analysis"
}
```

可选字段：

- `direction`：覆盖默认风格家族，如 `tech`、`journal`。
- `infographic.layout` / `infographic.style`：仅在需要覆盖默认信息图模板时使用，值必须取自 baoyu-infographic 的 layouts / styles 命名（见 `references/image-template-catalog.md`）。
- `illustrations[]`：按 slot 覆盖文内图 type/style/description。

约束补充：

- 默认把 `SLOT_IMG_01+` 视为“文章解释图”，不是 CAD 图、蓝图页、规范书附图。
- `blueprint` / `technical-schematic` 一类技术制图感风格，只有用户**明确要求**“技术制图感”时才允许显式写入 `direction` 或 `illustrations[].style`。
- 即便显式使用技术制图感，仍默认禁止日期、版本号、图号、revision、标题栏、尺寸线、刻度、工程边框；除非用户明确要求这些元素本身就是要表达的内容。

## 文内图语义分流

Agent 在审核 prompt 前，先判断这张图是在解释什么：

| 语义类型 | 默认风格方向 | 说明 |
|---|---|---|
| 文章解释图 | `editorial` / `journal` / `minimal` / `notion` | 观点对比、职责迁移、组织关系、判断框架、责任边界、概念解释 |
| 工程对象图 | 可在显式要求下用 `blueprint` | 系统架构、模块边界、数据流、执行路径、API 边界、kernel pipeline |

经验规则：

- 只要图的主语是“人、团队、组织、职责、判断、证据、风险、完成条件”，默认按文章解释图处理。
- 只有当图的主语是“系统、模块、组件、接口、管线、调用路径、内核流程”时，才考虑技术制图感。
- 如果你脑中已经出现“日期、图号、版本号、标题栏”这些元素，说明你把文章插图错当成图纸了，应立即改 prompt。

允许值和映射以 `references/image-template-map.json` 为准；schema 见 `references/image-plan.schema.json`。

## 生图执行

**后端顺序与失败判定策略见 `references/image-backends.md`（唯一 owner），本文件不重复。** 执行侧约束：先 `--provider codex-cli`，Codex CLI 明确失败后 `--provider <preferred_image_backend>`；命令形态见下。

1. Codex CLI 可用时走 `baoyu-image-gen --provider codex-cli`；即使当前运行时有原生 `imagegen` / `image_gen` 工具也走同一路径（禁止绕过，判定见 image-backends.md）。
2. 从 `.baoyu-skills/baoyu-image-gen/EXTEND.md` 读取 `<preferred_image_backend>` 作为 baoyu fallback provider（何时可用见 image-backends.md）。
3. 加载 `.baoyu-skills/.env`，供 baoyu fallback provider 和后续发布步骤使用。Codex CLI 路径使用 `codex login` 的账号态，不读取 `OPENAI_API_KEY`。
4. 主会话 Bash 逐张串行运行 `baoyu-image-gen`，不要并行，不使用 subagent 生图。每张图先跑 Codex CLI；Codex CLI 失败后，对同一输出文件再用 fallback provider 生成一次。
5. fallback 仍失败则标记并继续；不要在同一张图上无限重试。内容审核失败时先改 prompt，再重新进入 Codex CLI → fallback 流程。

命令形态：

```bash
# cover: prompt 文件名由 generate-image-prompts.mjs 输出决定，产物固定在 post 根目录
bun run .agents/skills/baoyu-image-gen/scripts/main.ts \
  --provider codex-cli \
  --promptfiles posts/<date-slug>/imgs/prompts/00-cover-<desc>.md \
  --image posts/<date-slug>/cover.png \
  --ar 16:9

# SLOT 图：输出名必须与 prompt 文件同名，只把 .md 换成 .png
bun run .agents/skills/baoyu-image-gen/scripts/main.ts \
  --provider codex-cli \
  --promptfiles posts/<date-slug>/imgs/prompts/01-<desc>.md \
  --image posts/<date-slug>/imgs/01-<desc>.png \
  --ar 16:9

# 仅当 Codex CLI 失败时，使用 preferred_image_backend 作为 baoyu fallback
bun run .agents/skills/baoyu-image-gen/scripts/main.ts \
  --provider <preferred_image_backend> \
  --promptfiles posts/<date-slug>/imgs/prompts/01-<desc>.md \
  --image posts/<date-slug>/imgs/01-<desc>.png \
  --ar 16:9
```

本管线禁止 batch 模式和任何并发生图形态：不要创建 `batch.json`，不要调用 `--batchfile`，不要设置 `jobs`，禁止 `Promise.all`，禁止 `xargs -P`，禁止后台任务 `&`，不得把多张图片分派给多个 subagent。Step 4 必须由主 Agent 在同一会话里逐张串行生图，并显式传 `--image` 到目标文件。若 `step4-images.mjs` 发现 post 根目录或 `imgs/` 下存在 `batch.json`，会直接失败。

最终验证：

```bash
bun run .agents/skills/wechat-article-write/scripts/step4-images.mjs <date-slug>
```

## 图片查字门控

生图完成后、运行 `step4-images.mjs` 前，Agent 必须逐张多模态读图，对图中可见文字（中文、数字、版本号）逐字核对。错字/漏字/乱码进入修复环：改 prompt 重生，或把信息降级到图注、改无文字构图。只有无可见文字或可见文字全部正确才算核对通过；这是 Step 4 的完成判据，防的是平台"AIGC 图片存在明显不合理"判定。复用自源文的真图不在核对范围。

## 生图命名契约（防断裂）

imgs/ 下每张 SLOT 图的文件名**必须**以 `NN-` 开头（NN = slot 编号，2 位），且与 `imgs/prompts/NN-<desc>.md` 去掉 `.md` 一致。后续所有脚本会按 SLOT 语义和 prompt basename 精确解析图片；只靠 `NN-` 前缀的模糊匹配不再被接受。

| SLOT | prompt 文件 | 图片文件 |
|---|---|---|
| 00 信息图 | `00-infographic-core-summary.md` | `00-infographic-core-summary.png` |
| 01 | `01-mosaic_effect_fragments.md` | `01-mosaic_effect_fragments.png` |

生图时**必须显式指定输出文件名**为 `imgs/NN-<desc>.png`，不要依赖 provider 默认名。封面输出到 post 根目录 `cover.png`；`imgs/00-cover.*` 不属于正文图集，`step4-images.mjs` 会归位或移入 `imgs/_discard/`，防止它抢占 `SLOT_IMG_00`。

## 信息图内容契约

SLOT 00 是文章开头的全文速读版，不是文内局部插图。目标读者即使只看这一张图，也应能抓住整篇文章的核心论点、论证路径、关键对比/因果/决策分叉，以及最终结论或行动提示。

生成 `00-infographic-core-summary.md` 时，prompt 必须要求模型综合全文，而不是只可视化 SLOT 附近段落。文内 `SLOT_IMG_01+` 才负责解释局部论点、流程或对比。

## 信息图风格

SLOT 00 是文章开头的核心信息图，默认使用 baoyu-infographic 的 `claymation` 风格和低密度 summary 布局。`direction: tech` 可以影响文内插图风格，但不改变头部信息图的默认 `claymation` 风格。只有用户明确要求另一种信息图风格时，才在 `image-plan.json` 里写 `infographic.style` 覆盖。

头部信息图（SLOT 00）的色彩与视觉风格统一限定为：**阳光、明亮、鲜艳、高饱和度，且背景与主体内容具备极高对比度和清晰可读性**（Scene/background: bright, sunny, clean neutral canvas; Color/Atmosphere: sunny, bright, vibrant, high saturation, clear distinction between background and content for maximum readability）。`generate-image-prompts.mjs` 必须固定注入此色彩及高可读性约束。

## 命名断裂修复（不重生图）

若 step4 报 `Missing images for slots` 且 imgs/ 下存在非 `NN-` 前缀的随机名图，说明生图产物命名断裂。**不要重新生图**，按多模态识别 → 归位的流程修复：

```bash
# 1. 派多模态 subagent 读图，输出 map.json（格式见 align-image-names.mjs 头注释）:
#    { "mapping": [{ "file": "随机名.png", "target_name": "01-desc.png", "confidence": "..." }] }
# 2. 归位（--discard-unmapped 把废弃图移到 imgs/_discard/）:
bun run .agents/skills/wechat-article-write/scripts/align-image-names.mjs <date-slug> map.json --discard-unmapped
# 3. 验证:
bun run .agents/skills/wechat-article-write/scripts/step4-images.mjs <date-slug>
```

`align-image-names.mjs` 直接消费多模态 subagent 的 `{mapping:[{file,target_name}]}` 输出，确定性重命名，可重复运行。

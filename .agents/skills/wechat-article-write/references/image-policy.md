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

## Prompt 生成

```bash
bun run .agents/skills/wechat-article-write/scripts/generate-image-prompts.mjs <date-slug>
```

默认行为：

- 读取 `draft.md` 和 `image-plan.json`。
- SLOT 00 输出紧凑模板引用 prompt，包含 `Template source`，不展开完整模板。
- 文内图 prompt 必须包含附近正文上下文、中文可见文字规则、构图和色彩规则。
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

允许值和映射以 `references/image-template-map.json` 为准；schema 见 `references/image-plan.schema.json`。

## 生图执行

1. 默认先通过 `baoyu-image-gen --provider codex-cli` 调用本机 `codex` CLI 生图；这是通用 Agent 路径，不依赖当前运行时是否有原生 imagegen 工具。
2. 从 `.baoyu-skills/baoyu-image-gen/EXTEND.md` 读取 `preferred_image_backend` 作为 baoyu fallback provider。该值应保持为 `openai` / `dashscope` / `google` 等非 `codex-cli` 后端。
3. 加载 `.baoyu-skills/.env`，供 baoyu fallback provider 和后续发布步骤使用。Codex CLI 路径使用 `codex login` 的账号态，不读取 `OPENAI_API_KEY`。
4. 主会话 Bash 逐张串行运行 `baoyu-image-gen`，不要并行，不使用 subagent。每张图先跑 Codex CLI；Codex CLI 失败后，对同一输出文件再用 fallback provider 生成一次。
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

最终验证：

```bash
bun run .agents/skills/wechat-article-write/scripts/step4-images.mjs <date-slug>
```

## 生图命名契约（防断裂）

imgs/ 下每张 SLOT 图的文件名**必须**以 `NN-` 开头（NN = slot 编号，2 位），且与 `imgs/prompts/NN-<desc>.md` 去掉 `.md` 一致。后续所有脚本（step4 校验、step5 上传映射、apply-image-map 占位符替换）都靠 `NN-` 前缀匹配 SLOT——**provider 默认随机名（nanoid）会导致全线断裂**。

| SLOT | prompt 文件 | 图片文件 |
|---|---|---|
| 00 信息图 | `00-infographic-core-summary.md` | `00-infographic-core-summary.png` |
| 01 | `01-mosaic_effect_fragments.md` | `01-mosaic_effect_fragments.png` |

生图时**必须显式指定输出文件名**为 `imgs/NN-<desc>.png`，不要依赖 provider 默认名或批量模式默认名。封面用 `baoyu-cover-image` 输出到 post 根目录 `cover.png`。

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

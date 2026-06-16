# 图片策略

## 角色分工

- Agent：规划图片位置、运行 prompt 生成脚本、审核 prompt、串行生图。
- 脚本：生成 prompt、校验占位符、校验图片文件和状态。

## 模板来源

| 图片 | 模板来源 | 说明 |
|---|---|---|
| 封面 `cover.png` | `baoyu-cover-image` | 不使用文字，输出在 post 根目录 |
| SLOT 00 信息图 | `gpt-image-2/references/infographics/*.md` | 只借用文生图模板风格，不使用 gpt-image-2 的模式检测或出图脚本 |
| SLOT 01+ 文内图 | `baoyu-article-illustrator` | 根据占位符附近正文构建 prompt |

## Prompt 生成

```bash
bun run .agents/skills/wechat-article-write/scripts/generate-image-prompts.mjs <date-slug>
```

默认行为：

- 读取 `draft.md` 和 `image-plan.json`。
- SLOT 00 输出紧凑模板引用 prompt，包含 `Template source`，不展开完整模板。
- 文内图 prompt 必须包含附近正文上下文、中文可见文字规则、构图和色彩规则。
- 缺少被引用的 `gpt-image-2` 模板时直接失败；只有历史迁移可显式传 `--allow-compact-fallback`。

## image-plan.json

极简格式：

```json
{
  "article_type": "deep-analysis"
}
```

可选字段：

- `direction`：覆盖默认风格家族，如 `tech`、`journal`。
- `infographic.layout` / `infographic.style` / `infographic.gpt_variant`：仅在需要覆盖默认信息图映射时使用。
- `illustrations[]`：按 slot 覆盖文内图 type/style/description。

允许值和映射以 `references/image-template-map.json` 为准；schema 见 `references/image-plan.schema.json`。

## 生图执行

1. 从 `.baoyu-skills/baoyu-image-gen/EXTEND.md` 读取 `preferred_image_backend`。
2. 加载 `.baoyu-skills/.env`。
3. 主会话 Bash 逐张串行运行 `baoyu-image-gen`，不要并行，不使用 subagent。
4. 每张失败最多重试 1 次，仍失败则标记并继续。
5. 最后运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/step4-images.mjs <date-slug>
```

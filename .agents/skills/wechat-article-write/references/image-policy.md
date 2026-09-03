# 图片策略

## Native delegation

固定业务映射：

| 资产 | Skill | 输出 |
|---|---|---|
| cover | `baoyu-cover-image` | post 根目录唯一 `cover.png` 或 `cover.jpg`，比例 `2.35:1` |
| `SLOT_IMG_00` | `baoyu-xhs-images` | 唯一 `imgs/00-infographic-core-summary.png` |
| generated `SLOT_IMG_01+` | `baoyu-infographic` | 对应 `imgs/NN-<desc>.png` |
| architecture / flow / sequence / state / data flow / topology | 按需 `baoyu-diagram` | 结构辅助；最终 raster 仍由正文图片 Skill 产出 |

各视觉 Skill 的项目级长期偏好由其自己的配置提供：

```text
baoyu-cover-image  → .baoyu-skills/baoyu-cover-image/EXTEND.md
baoyu-xhs-images   → .baoyu-skills/baoyu-xhs-images/EXTEND.md
baoyu-infographic  → .baoyu-skills/baoyu-infographic/EXTEND.md
baoyu-image-gen    → .baoyu-skills/baoyu-image-gen/EXTEND.md
```

Agent 每次委托都把当前 draft 语境、输出路径、子 Skill 原生的非交互参数和
`baoyu-image-gen --provider codex-cli` backend override 传入。cover 使用等价于
`--quick --aspect 2.35:1 --no-title` 的参数，SLOT00 使用 `--yes --batch-size 1`，正文图使用
`--no-confirm`。专业 Skill 自己完成分析、style/layout/preset、prompt、raster 和报告；父 Skill
不重建 prompt、不集中渲染。

## Project preference

`wechat-article-write/EXTEND.md` 只提供 `prefer-reuse` 原图策略；bright、vivid、high
saturation、high contrast、clean、crisp、warm-positive 等视觉偏好由上述各视觉 Skill
自己的 `EXTEND.md` 提供。具体 style、layout、palette、preset 只由被委托 Skill 决定。

## Source reuse

在生成正文图前检查材料中的可用原图。`prefer-reuse` 且原图直接承载讨论结果时优先复用，
把最终 `kind: source`、本地 file、source URL 和 reason 写入 `image-plan.json`。只记录最终资产事实。

## Serial review

cover、SLOT00、正文 generated images 按 workflow 顺序一次一张；一张生成后由 Agent 实际查看
semantic match、visual hierarchy、Chinese text correctness、legibility、text density 和 XHS character，
通过后才处理下一张。失败时回到同一个专业 Skill regenerate。Codex CLI 不可用或失败时图片任务阻塞，不切换 provider。

## Machine Gate

`step4-images.mjs` 只检查：root cover uniqueness、MIME/扩展名、cover ratio、SLOT00 basename、
body SLOT ↔ `image-plan.json` ↔ local file topology、图片文件存在。它不读取或要求视觉布尔 receipt，
也不要求 prompt 文件作为父 Skill 的控制层产物。

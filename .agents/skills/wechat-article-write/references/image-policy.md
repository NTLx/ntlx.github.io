# 图片策略

## Native delegation

固定业务映射：

| 资产 | Skill | 输出 |
|---|---|---|
| cover | `baoyu-cover-image` | post 根目录唯一 `cover.png` 或 `cover.jpg`，比例 `2.35:1` |
| `SLOT_IMG_00` | `baoyu-xhs-images` | 唯一 `imgs/00-infographic-core-summary.png` |
| 正文 visual `SLOT_IMG_01+`（`kind: generated`） | `baoyu-infographic` | 对应 `imgs/NN-<desc>.png` |
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

source reuse 决定的是某个视觉节点用什么图，不是决定这个视觉节点要不要存在。

高价值 source image 不直接绕过 SLOT 插入正文。如果原图承担一个正式正文视觉节点：

1. 为该节点规划有语义的 `SLOT_IMG_01+`；
2. 下载或落盘到 `imgs/`；
3. 在 Step 4 的 `image-plan.json` 中将该 SLOT 记为 `kind: source`；
4. 保留 source URL 与 reason。

这使 source reuse 与生成图片共享同一正文语义位置；普通 Markdown 图片不自动满足覆盖。

## Visual coverage

cover 不计入正文视觉，`SLOT_IMG_00` 也不计入正文视觉。

正常长文（substantive H2 至少 3 个，或正文达到约 1400 字的正常长文级别）必须至少
有两个 `SLOT_IMG_01+`。典型 3-6 H2 的 reader-response 在 2-4 个 body visuals 之间按
语义判断自由选择。未达到 normal long-form 阈值的短文可以为 0 个；normal long-form
不能因没有合适的 source image 或判断视觉信息增益不足而豁免，仍应寻找有价值的视觉化
节点，必要时使用 `kind: generated` 委托生成信息图。

优先视觉化：

- 对比、流程、机制、层级、状态变化；
- 决策框架、指标体系、因果关系、复杂 checklist；
- 文章的关键原创增量。

避免装饰图、重复 SLOT00，或按每个 H2 机械配图。没有合适 source image 只能改变
视觉来源：该节点仍需要视觉化时，使用 `kind: generated` 并委托 `baoyu-infographic`，
不能因此删除 body visual SLOT。

## Serial review

cover、SLOT00、每个 body visual 按 workflow 顺序一次处理；通过后才处理下一张。

- `kind: source`：实际查看是否对应当前论点、是否清晰完整、是否需要裁切，以及是否含过期或误导信息、是否值得复用；不创建 receipt。
- `kind: generated`：实际查看 semantic match、visual hierarchy、Chinese text correctness、legibility、text density 和 XHS character。

- `kind: source` 审核失败时，换用另一张合适的 source image；如果没有合适原图，将该 SLOT 改为 `kind: generated`，再委托 `baoyu-infographic`。
- `kind: generated` 审核失败时，回到 `baoyu-infographic` 重新生成。Codex CLI 不可用或失败时图片任务阻塞，不切换 provider。

## Machine Gate

`step4-images.mjs` 只检查：root cover uniqueness、MIME/扩展名、cover ratio、SLOT00 basename、
normal long-form minimum body visual coverage、body SLOT ↔ `image-plan.json` ↔ local file topology、
图片文件存在。它不检查视觉美学评分，也不读取或要求 prompt、producer、receipt 等控制层产物。

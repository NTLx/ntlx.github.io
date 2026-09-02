# 图片策略

后端细节与 Codex CLI 成本边界见 [`references/image-backends.md`](image-backends.md)。

## 固定职责

`wechat-article-write` Agent 根据 `draft.md`、`understanding-brief.md`、
`coverage_review` 和 `source_image_review` 自主判断视觉信息增益，并维护
`image-plan.json`。它不把全文规划伪装成第三方 Skill 调用。

正常 producer 路由固定为：

| 资产 | producer | 生产要求 |
|---|---|---|
| 微信封面 | `baoyu-cover-image` | 根目录唯一 cover，实际像素比例 `2.35:1`，默认无文字 |
| `SLOT_IMG_00` | `baoyu-xhs-images` | 恰好一张，位于首个 substantive H2 前，完成全文压缩并表达核心判断 |
| `SLOT_IMG_01+` | `baoyu-infographic` | 只在有明确信息增益时创建，正文数量允许 `0..N` |
| raster | `baoyu-image-gen` → `codex-cli` | 唯一 renderer，严格单图串行 |

`baoyu-diagram` 可以按需贡献 architecture、flowchart、sequence、state machine、
data flow 或 relationship topology 结构，但不生成最终图片、不拥有最终 Prompt。
具体 style、layout、type 和 visual metaphor 是文章级设计决定，不由本技能写死。

## 视觉合同

默认 `visual_profile` 是 `bright-vivid-warm`，由 `EXTEND.md` 提供明亮、高饱和、
高对比、干净背景、清晰、温暖积极的单一事实源。每个 producer 生成初稿 Prompt
后，`generate-image-prompts.mjs` 只追加项目不可变合同；重复 finalize 必须幂等，
不得重做 producer 的 layout、style 或信息层级。用户明确要求其它方向时，必须在
`image-plan.json` 写 `visual_profile: "custom"` 与非空 `visual_override_reason`。

封面 Prompt 必须含 `Aspect ratio: 2.35:1`，不能含 production-path 的 `16:9`；
renderer 实际传 `--ar 2.35:1`，Step 4 还读取最终文件像素尺寸验证容差。

默认文字密度合同：cover=`none`、SLOT00=`low`、正文 generated image=`low` 或
真正需要时的 `medium`。所有 generated asset 必须 `has_long_copy=false`；不生成
日期、版本号、图号、尺寸线、工程边框、标题栏或无意义英文装饰文字。

## 原图复用

`source_image_policy` 默认 `prefer-reuse`，也可为 `neutral` 或 `no-reuse`。Agent
发现原文图片后逐张写入 `source_image_review`，包括 `source`、`reusable`、
`decision` 和 `reason`。决定使用 `cover-only` 或 `discard` 处理 `reusable: true`
的原图时，必须写稳定的 `exception_code`（如 `redundant`、`duplicate`、
`low-quality`、`legal-risk`）。`prefer-reuse` 且存在可复用原图时，至少一张必须
以 `body` 或 `both` 决定并实际出现在正文；正文 coverage 也必须声明 `reuse-source`。

## Prompt 与审核边界

producer 必须先以 DESIGN-ONLY MODE 输出最终设计 Prompt 到确定性路径：

```text
imgs/prompts/00-cover-<blogSlug>.md
imgs/prompts/00-infographic-core-summary.md
imgs/prompts/NN-<desc>.md
```

`generate-image-prompts.mjs` 只接受 `prompt_source: external`，验证固定 producer
后 finalize 项目合同；它不读取旧 adapter 模板、不模仿第三方 Skill、不自动猜布局。
缺少 Prompt 直接失败。随后只能运行 `render-images-serial.mjs`，不得 batch、
`--jobs`、并发调用或其它 raster provider。明确禁止 `Promise.all`、禁止 `xargs -P`、
禁止后台任务；SLOT00 的全文压缩信息图和其它图片都必须逐张串行。

`batch.json`、`--batchfile`、`--jobs`、`Promise.all`、`xargs -P` 和后台任务都
不属于本管线；图片数量由 Agent 的信息增益判断决定，正文可以为零。

生成成功不等于视觉合格。Agent/multimodal review 必须逐张写
`image-review.json`；receipt 记录当前 SHA256、语义匹配、可读性、可见文字、文字
密度和视觉布尔项。Step 4 只做 receipt completeness/freshness Gate，不使用 OCR、
自动美学评分器或程序化修图。发现错字、乱码、文字过多或不可读时，修正同一
producer 的 Prompt 后沿 `baoyu-image-gen → codex-cli` 重新生成并重新审核。

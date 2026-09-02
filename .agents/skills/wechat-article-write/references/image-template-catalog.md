# 图片设计接口

本文件只说明 `image-plan.json` 的稳定职责边界，不复制第三方 Skill 的模板库。
具体 style、layout、type 和 visual metaphor 由文章级 Agent 根据内容选择。

## 固定计划

```json
{
  "visual_profile": "bright-vivid-warm",
  "source_image_policy": "prefer-reuse",
  "article_visual_design": {
    "planner": "wechat-article-write-agent",
    "coverage_review": []
  },
  "cover": {
    "producer": "baoyu-cover-image",
    "prompt_source": "external",
    "baoyu_design": { "skill": "baoyu-cover-image", "aspect": "2.35:1", "text": "none" }
  },
  "infographic": {
    "producer": "baoyu-xhs-images",
    "prompt_source": "external",
    "text_density": "low",
    "has_long_copy": false,
    "baoyu_design": { "skill": "baoyu-xhs-images", "card_count": 1 }
  },
  "illustrations": []
}
```

正文 `illustrations` 可以为空；每个正文 entry 都必须使用
`producer=baoyu-infographic`、`baoyu_design.skill=baoyu-infographic`，并把
`text_density` 设为 `low` 或确有必要时的 `medium`。不存在“每个 H2 一张”或
最低图片数量规则。

## Producer 与 Prompt

封面、SLOT00、正文新增图分别由 `baoyu-cover-image`、`baoyu-xhs-images`、
`baoyu-infographic` 先产出 external canonical Prompt。Prompt 保存为：

```text
imgs/prompts/00-cover-<blogSlug>.md
imgs/prompts/00-infographic-core-summary.md
imgs/prompts/NN-<desc>.md
```

`generate-image-prompts.mjs` 不选择 Skill、不读取旧 adapter 模板、不重做 layout
或信息层级，只追加项目视觉合同并检查 Prompt 完整性。所有最终 raster 继续走
`baoyu-image-gen → codex-cli` 的串行 renderer。

`baoyu-diagram` 只能作为 architecture、flowchart、sequence、state machine、
data flow 或 relationship topology contributor，不是图片 producer 或 Prompt
authority。任何第三方 Skill 都运行在 DESIGN-ONLY MODE，禁止输出最终 SVG/PNG。

## 原图与审核

Agent 发现原图后逐张记录 `source_image_review`：`source`、`reusable`、
`decision`、`reason`。`prefer-reuse` 且存在 reusable 原图时，至少一个决定必须
为 `body` 或 `both`，并在正文实际引用；若 reusable 原图被 `discard` 或
`cover-only`，必须写 `exception_code`。

每个 active generated asset 都要有 `image-review.json` receipt。receipt 绑定
当前 SHA256，记录 semantic match、legibility、visible text、text density、
`has_long_copy` 和视觉审阅结果；图片重新生成后 SHA 改变，旧 receipt 自动失效。

# Golden Path：最小正确例子

## 1. 准备目录

```bash
mkdir -p posts/2026-06-16-example-article
```

## 2. 写 materials.md

```markdown
# 材料

## 原文

> 来源
> https://example.com/source

原文要点……

## 背景调研

- 背景资料：https://example.com/background
```

```bash
bun run .agents/skills/wechat-article-write/scripts/step1-collect.mjs 2026-06-16-example-article
```

## 3. 写 draft.md

```markdown
---
title: 示例文章
date: 2026-06-16
summary: 真正的变化不是工具变强，而是判断权开始重新分配。
category: ai-coding
blogSlug: example-article
coverImage: cover.png
sourceUrl: https://ntlx.github.io/articles/example-article
---

<!-- SLOT_IMG_00_INFOGRAPHIC -->

## 第一个判断

<!-- SLOT_IMG_01_DECISION_FLOW -->

正文……

## 第二个判断

正文……

<!-- SLOT_IMG_02_ACTOR_RELATIONSHIP -->

## 第三个判断

<!-- SLOT_IMG_03_REVIEW_LOOP -->

正文……

*你会把哪类判断交给 Agent？*

## 原文参考

> 来源
> https://example.com/source
```

`image-plan.json`：

```json
{
  "article_type": "deep-analysis"
}
```

```bash
bun run .agents/skills/wechat-article-write/scripts/step2-write.mjs 2026-06-16-example-article
```

## 4. 后处理与图片

按策略调用 `renwei-writing` / `baoyu-format-markdown` 后：

```bash
bun run .agents/skills/wechat-article-write/scripts/step3-polish.mjs 2026-06-16-example-article
bun run .agents/skills/wechat-article-write/scripts/generate-image-prompts.mjs 2026-06-16-example-article
```

串行生成图片后：

```bash
bun run .agents/skills/wechat-article-write/scripts/step4-images.mjs 2026-06-16-example-article
```

## 5. 构建和发布

```bash
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs 2026-06-16-example-article --dry-run
bun run .agents/skills/wechat-article-write/scripts/pipeline.mjs 2026-06-16-example-article --auto
```

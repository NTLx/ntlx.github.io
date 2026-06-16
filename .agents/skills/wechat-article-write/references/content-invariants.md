# 内容不变量

## Frontmatter

`draft.md` / `article.md` 必须包含：

```yaml
title: 标题
date: YYYY-MM-DD
summary: 金句式摘要，≤120 字
category: ai-coding | ai-agents | ai-industry | ai-models | security | engineering
blogSlug: ascii-kebab-case
coverImage: cover.png
sourceUrl: https://ntlx.github.io/articles/{blogSlug}
```

约束：

- 正文禁止 H1；Starlight 自动将 title 渲染为 H1。
- `summary` 不是内容简介，不以“本文介绍了”开头；它是微信 digest 唯一来源。
- `blogSlug` 必须符合 `^[a-z][a-z0-9-]*[a-z0-9]$`。
- `sourceUrl` 是微信“原文链接”的唯一来源，不能为空。

## SLOT 图片占位符

- `<!-- SLOT_IMG_00_INFOGRAPHIC -->` 必须存在，放在 frontmatter 后、正文第一个段落前。
- 文内 `SLOT_IMG_01+` 不少于 3 张，不含封面图和 SLOT 00。
- 文内图按内容节点放置，可在 H2 后、关键段落后或小结前；不要按章节打卡。
- 占位符描述必须具体反映附近正文核心内容，禁止 `chart`、`diagram`、`illustration` 这类泛化描述。

示例：

```markdown
<!-- SLOT_IMG_01_TRUST_DECLINE_CURVE -->
```

## 文本后处理

- `reader-response` / `news-digest` 默认必须调用 `renwei-writing`。
- `tutorial` 可跳过 humanizer，并通过 `--no-humanizer` 写入状态。
- 后处理不应磨平第一人称判断、疑问和读后感式表达。

## 质量门控

每个 Step 结束都运行对应脚本。脚本失败时按错误修复，再重跑同一 Step；不要跨过失败门继续发布。

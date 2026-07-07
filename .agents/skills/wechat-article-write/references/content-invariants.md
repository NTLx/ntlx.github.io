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
- 博客轨和微信轨都必须保留正文 H2，尤其不能在 Step 5 HTML 转换时把正文第一个 H2 当作 title 删除。
- `summary` 不是内容简介，不以“本文介绍了”开头；它是微信 digest 唯一来源。
- `blogSlug` 必须符合 `^[a-z][a-z0-9-]*[a-z0-9]$`。
- `sourceUrl` 是微信“原文链接”的 canonical 来源，不能为空；不要在 frontmatter 中手写 UTM。
- Step 6.2 发布微信时会基于 `sourceUrl` 生成带 `utm_source=wechat&utm_medium=social&utm_campaign=article_push` 的 `wechatSourceUrl`，实际传给微信“阅读原文”。
- 默认文章的 `sourceUrl` 必须是 `https://ntlx.github.io/articles/{blogSlug}`。
- 教程/已有文档适配可写入 `targetPath: path/under/src-content-docs`，此时 `sourceUrl` 指向该文档真实公网 URL，不要求匹配 `articles/{blogSlug}`；`blogSlug` 仍必须是 ASCII kebab-case，用于本地管线标识和图片命名。

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

## 站内记忆与链接双轨

- Step 1 后必须运行 `select-related-articles.mjs <date-slug>`，生成 `blog-memory.md` 和 `blog-memory.json`。
- Step 2 写作时读取 `blog-memory.md`，优先做到两类联动：
  - 正文自然提及 1-2 篇旧文，用旧判断承接当前论证；
  - 文末 `## 延伸阅读` 放 2-4 篇站内旧文。
- draft 中所有正文链接使用 inline Markdown 形式：`[文本](URL)`。
- `## 参考资料` 中的标准引用写法也使用 inline Markdown 列表：`- [标题](URL)`。
- 禁止 reference-style 链接定义：`[id]: https://example.com`。
- 博客轨保留 Markdown 链接。
- 微信轨由 Step 5 自动转换为纯文本 URL；其中 `## 参考资料` 会保持无序列表形态，每项展开成“标题一行 + URL 一行”，`article-wechat.html` 不得含普通 `<a href>`。
- 图片 Markdown 和 `SLOT_IMG` 占位符不是正文链接，不参与纯文本链接转换。

## 质量门控

每个 Step 结束都运行对应脚本。脚本失败时按错误修复，再重跑同一 Step；不要跨过失败门继续发布。

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

- `<!-- SLOT_IMG_00_INFOGRAPHIC -->` 必须恰好存在一次，位于第一个 substantive
  H2 之前的 lead 区域，并且是正文第一张视觉图片；它是真正的头部信息图。
- 文内 `SLOT_IMG_01+` 只在能显著降低理解成本的节点创建，数量可以为零，
  由正文和 `image-plan.json` 共同决定。
- 文内图按内容节点放置，可在 H2 后、关键段落后或小结前；不要按章节打卡。
- `draft SLOT ↔ image-plan entry ↔ prompt ↔ image` 必须一一对应；每个 draft
  SLOT 编号唯一，SLOT 00 恰好出现一次。
- 占位符描述必须具体反映附近正文核心内容，禁止 `chart`、`diagram`、`illustration` 这类泛化描述。

## 视觉覆盖审阅

`image-plan.json` 的 `article_visual_design.coverage_review` 必须对每个 substantive
H2 恰好记录一条决定：`illustrate`、`reuse-source` 或 `text-only`。这是全文视觉
价值审阅合同，不是最低配图数量；正文图片仍然允许 0..N。`text-only` 必须有
理由，`illustrate` 必须对应真实且位于该章节的 SLOT，`reuse-source` 必须对应
该章节实际引用的原图。

`source_image_review` 必须为每个已声明的原始素材记录 `cover-only`、`body`、
`both` 或 `discard` 及理由。`cover-only` 不算正文视觉复用；`body`/`both` 必须
在正文实际引用，`discard` 必须有理由。

## Mandatory Humanization Layer

Step 2 Gate 通过后，所有文章都必须实际读取并应用
`.agents/skills/humanizer-zh/SKILL.md`，再运行 `mark-humanized.mjs` 写入
receipt，之后才可通过 Step 3。允许零改动，但 receipt 必须绑定当前
`draft.md` 和 humanizer Skill SHA256。humanizer 不得改变事实、引用、URL、代码、
数字、技术结论、H2/SLOT topology，也不得凭空编造作者经历、态度或情绪。

示例：

```markdown
<!-- SLOT_IMG_01_TRUST_DECLINE_CURVE -->
```

## 正文 MDX 安全（博客轨构建）

博客轨 `article.md` 由 Starlight 当作 MDX 编译，比 CommonMark 严格：正文里一个裸 `<` 或 `>` 会被当作 JSX/标签起点，导致 `astro build` 失败。publish-blog 会在 push 前本地构建并以 exit 3 中止（旧站不受影响，但这次发布作废，重试还得加 `--overwrite`）。

- 正文禁止裸 `<` / `>`。常见雷区是不等式与区间：`p<0.05`、`<100`、`a>b`。
- 替代写法（按可读性任选）：全角 `＜` `＞`（中文排版本就自然，如 `p＜0.05`）；或改写成文字（"未达到 5% 显著性"）。
- 代码块 / 行内代码内的 `<` `>` 不受影响，无需改。
- 在**写作时**就遵守，别等构建报错再修——构建报错时 publish-blog 已写 src 但未 push，平白多一轮。

## 文本后处理

- 后处理不得磨平第一人称判断、疑问、读后感式表达和作者自身立场。
- 后处理目标是减少明显的机械化 / AI 写作痕迹，而不是把文本统一润色成更正式的风格。
- 具体后处理工具、调用顺序、`source_provenance` 路由以及各 strategy 的例外，由对应 `strategy-*.md` 负责；本文件不规定必须调用某个特定 Skill。

## 站内记忆与链接双轨

- Step 1 后必须运行 `select-related-articles.mjs <date-slug>`，生成 `blog-memory.md` 和 `blog-memory.json`。
- Step 2 写作时读取 `blog-memory.md`，优先做到两类联动：
  - 正文自然提及 1-2 篇旧文，用旧判断承接当前论证；
  - 文末 `## 延伸阅读` 放 2-4 篇站内旧文。
- draft 中所有正文链接使用 inline Markdown 形式：`[文本](URL)`。
- `## 参考资料` 中的标准引用写法也使用 inline Markdown 列表：`- [标题](URL)`。
- 禁止 reference-style 链接定义：`[id]: https://example.com`。
- 博客轨保留 Markdown 链接。
- 微信轨由 Step 5 `wechat-link-normalizer.mjs` 自动转换为纯文本：正文行内链接变为”文本（链接：URL）”，`## 参考资料` 和 `## 延伸阅读` 中的独立列表链接展开为”标题 + 换行 + URL”。转换后的 `article-wechat-source.md` 不得含 Markdown 链接语法 `[text](url)`。调用 `gzh-design` 时须显式告知：参考资料和延伸阅读区域必须渲染为纯文本标题 + 纯文本 URL，禁止 `<a href>`。`article-wechat.html` 不得含普通 `<a href>`；Step 5 finalize 阶段会执行 `stripWechatAnchors` 防护剥离残留锚点。
- `article-wechat.html` 通过 gzh-design validator 后，还必须与
  `article-wechat-source.md` 保持 substantive H2 顺序、正文图片数量、图片 basename
  顺序和图片 section affiliation；SLOT00 必须仍属于 lead 区域。CSS、主题 wrapper
  和其它视觉表现不属于 parity 比较范围。
- 图片 Markdown 和 `SLOT_IMG` 占位符不是正文链接，不参与纯文本链接转换。

## 质量门控

每个 Step 结束都运行对应脚本。脚本失败时按错误修复，再重跑同一 Step；不要跨过失败门继续发布。

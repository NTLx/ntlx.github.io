# 构建与发布

## Step 5 构建

```bash
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs <date-slug>
```

行为：

- 读取项目级 `.baoyu-skills/baoyu-markdown-to-html/EXTEND.md` 主题配置。
- 上传图片到 GitHub 图床，生成 CDN URL。
- 生成博客轨 `article.md`。
- 生成微信轨 `article-wechat.html`，并注入图片质量提示 banner。
- 微信轨必须保留正文中的 H2，包括正文第一个 H2；转换器调用需要显式保留正文 heading。

链接处理：

- `article.md` 保留 draft 中的 Markdown 链接，用于博客点击。
- `article-wechat.html` 生成前会将非图片 Markdown 链接转换为纯文本 URL。
- `## 参考资料` 中的 `- [标题](URL)` 在微信轨会保留无序列表形态，每项展开成“标题一行 + 纯文本 URL 一行”；博客轨仍保留标准 Markdown 列表链接。
- HTML 转换后会移除普通 `<a href>`，防止微信公众号正文出现不可控外链。
- `sourceUrl` 仍由 Step 6.2 写入微信"阅读原文"，与正文里的引用链接是两回事。写入微信前会基于 canonical `sourceUrl` 生成 `wechatSourceUrl`，统一追加 `utm_source=wechat&utm_medium=social&utm_campaign=article_push`。

辅助参数：

- `--dry-run`：只预检，不上传。
- `--reuse-image-map`：复用已有 `image-map.json`。
- `--theme` / `--color` 只有用户明确要求时才可配合 `--allow-style-override` 使用。

## Step 6.1 博客发布

```bash
bun run .agents/skills/wechat-article-write/scripts/publish-blog.mjs <date-slug>
```

行为：写入 `src/content/docs/articles/` 或 frontmatter `targetPath` 指定位置，运行 Astro sync/build，提交并 push。

## Step 6.2 微信草稿

```bash
bun run .agents/skills/wechat-article-write/scripts/publish-wechat.mjs <date-slug>
```

发布前必须通过：

- `cover.png` 或 `cover.jpg` 存在；
- `article-wechat.html` 存在；
- frontmatter `title`、`summary`、`sourceUrl` 存在。

`publish-wechat.mjs` 会从 canonical `sourceUrl` 生成带 UTM 的 `wechatSourceUrl`，再转发给 `baoyu-post-to-wechat --source-url`；底层技能原生负责写入微信草稿的“阅读原文”链接。

## 编排器

```bash
bun run .agents/skills/wechat-article-write/scripts/pipeline.mjs <date-slug>
bun run .agents/skills/wechat-article-write/scripts/pipeline.mjs <date-slug> --auto
```

未传 `--auto` 只报告状态；`--auto` 只执行确定性的 Step 5/6。

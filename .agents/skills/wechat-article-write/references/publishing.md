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

`publish-wechat.mjs` 会把 `sourceUrl` 转发给 `baoyu-post-to-wechat --source-url`；底层技能原生负责写入微信草稿的“阅读原文”链接。

## 编排器

```bash
bun run .agents/skills/wechat-article-write/scripts/pipeline.mjs <date-slug>
bun run .agents/skills/wechat-article-write/scripts/pipeline.mjs <date-slug> --auto
```

未传 `--auto` 只报告状态；`--auto` 只执行确定性的 Step 5/6。

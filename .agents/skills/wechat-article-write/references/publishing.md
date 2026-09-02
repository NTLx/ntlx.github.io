# 构建与发布

## Step 5 构建

```bash
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs <date-slug>
```

行为：

- 在 prepare 阶段把 `imgs/*`、`--folder wechat-articles` 和稳定命名前缀交给
  `github-image-hosting` 一次，由它生成幂等的 CDN `image-map.json`。
- 生成博客轨 `article.md`。
- 生成微信轨中间稿 `article-wechat-source.md`（本地图片路径 + 纯文本 URL 版）。
- 若 `article-wechat.html` 已存在，运行 `gzh-design` 自带校验并 finalize Step 5；若不存在，则输出 `phase: prepared`，等待 Agent 调用 `gzh-design`。
- prepare 同时写入 `.step5-artifacts.json`（draft、image-plan、image-review、两份 Markdown 的 SHA）；finalize 后再绑定 HTML SHA。之后任何关键文件变化都会阻断发布。

链接处理：

- `article.md` 保留 draft 中的 Markdown 链接，用于博客点击。
- `article-wechat-source.md` 生成前会将非图片 Markdown 链接转换为纯文本 URL。
- `## 参考资料` 中的 `- [标题](URL)` 在微信轨会保留无序列表形态，每项展开成“标题一行 + 纯文本 URL 一行”；博客轨仍保留标准 Markdown 列表链接。
- `sourceUrl` 仍由 Step 6.2 写入微信"阅读原文"，与正文里的引用链接是两回事。写入微信前会基于 canonical `sourceUrl` 生成 `wechatSourceUrl`，统一追加 `utm_source=wechat&utm_medium=social&utm_campaign=article_push`。

辅助参数：

- `--dry-run`：只做本地预检，不访问图床，不写 map、文章产物或 state。
- `--prepare-only`：只完成 `article.md` + `article-wechat-source.md`。
- `--finalize-only`：先校验 prepared manifest、`draft.md` 的 humanizer receipt/freshness，再对现有
  `article.md`、`article-wechat-source.md` 和 `article-wechat.html` 运行 `gzh-design`
  validator / structural parity / preview wrapper 并落 Step 5 状态；不调用图床。

Agent 排版阶段：

1. `step5-build.mjs` 输出 `phase: prepared`
2. Agent 读取 `posts/<date-slug>/article-wechat-source.md`
3. 调用 `gzh-design` 生成 `posts/<date-slug>/article-wechat.html`
4. 运行 `step5-build.mjs <date-slug> --finalize-only`

## Step 6.1 博客发布

```bash
bun run .agents/skills/wechat-article-write/scripts/publish-blog.mjs <date-slug>
```

行为：先验证 finalized Step 5 manifest，再写入 `src/content/docs/articles/` 或 frontmatter `targetPath` 指定位置，运行 Astro sync/build，提交并 push。`push` 只证明 remote pushed；GitHub Pages 的 `site_deployed` 在本脚本中保持 unknown。

## Step 6.2 微信草稿

```bash
bun run .agents/skills/wechat-article-write/scripts/publish-wechat.mjs <date-slug>
```

发布前必须通过 finalized artifact freshness，以及：

- root `cover.png` / `cover.jpg` 恰好存在一个，且扩展名与实际 MIME 一致；
- `article-wechat.html` 存在；
- frontmatter `title`、`summary`、`sourceUrl` 存在。

`publish-wechat.mjs` 会从 canonical `sourceUrl` 生成带 UTM 的 `wechatSourceUrl`，核对 canonical author/signature，再转发给 `baoyu-post-to-wechat --source-url`；成功结果是 WeChat draft created，不表示自动群发或粉丝已收到。

## 编排器

```bash
bun run .agents/skills/wechat-article-write/scripts/pipeline.mjs <date-slug>
bun run .agents/skills/wechat-article-write/scripts/pipeline.mjs <date-slug> --auto
```

未传 `--auto` 只报告状态。`--auto` 运行脚本自动化部分；若 Step 5 已完成预处理但尚未生成 `article-wechat.html`，编排器会提示 Agent 调用 `gzh-design` 后再 finalize。

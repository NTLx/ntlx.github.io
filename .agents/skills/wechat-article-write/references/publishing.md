# 构建与发布

## Build

先运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs <date-slug> --prepare-only
```

脚本通过 `github-image-hosting` 的原生上传入口把 `imgs/`、业务 folder `wechat-articles`、稳定
命名前缀和 `image-map.json` 输出路径交给它；不复制其 repo 配置、远端索引、冲突处理、重试或
CDN 构造。图床 Skill 不支持项目级 `EXTEND.md`，配置以其 `.github-image-hosting.env` 契约为准。
然后委托 `gzh-design` 生成 `article-wechat.html`，再运行 `--finalize-only`。

最终保留：`article.md`（CDN 图片、博客链接）、`article-wechat-source.md`（本地图片、
纯文本 URL）、`article-wechat.html`（gzh-design HTML）。Step 5 记录 deterministic artifact
hash；draft 改变时必须回到 Step 3。

## Publish

博客先运行 `publish-blog.mjs`，它负责 Astro build、commit/push 与状态记录；push 不代表 GitHub Pages 已 deploy。
博客状态完成或明确 blocked 后，才运行 `publish-wechat.mjs`。微信只消费
`article-wechat.html`，由 canonical `sourceUrl` 生成现有 UTM；创建草稿不等于群发。

```bash
bun run .agents/skills/wechat-article-write/scripts/publish-blog.mjs <date-slug>
bun run .agents/skills/wechat-article-write/scripts/publish-wechat.mjs <date-slug>
```

失败时查看 `state.mjs next`，只恢复失败的博客或微信子状态。

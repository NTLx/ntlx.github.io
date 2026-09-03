# 构建与发布

## Build

Step 5 先由 Agent 原生委托 `github-image-hosting`，将 `imgs/`、业务 folder
`wechat-articles`、稳定命名前缀和 `image-map.json` 输出路径传入其当前 SKILL.md 契约，
由该 Skill 生成 `image-map.json`。它负责 repo 配置、远端状态、冲突、重试和 CDN URL。

先运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs <date-slug> --prepare-only
```

此脚本不执行上传、不访问 GitHub API、不定位第三方 uploader，只消费 `image-map.json`，
完成本地图片引用替换并生成 `article.md`、`article-wechat-source.md`。缺少 map 时必须先
完成 `github-image-hosting` 原生委托。然后由 Agent 原生委托 `gzh-design` 生成
`article-wechat.html`；child 自己完成主题选择、validator 和 preview，再运行 `--finalize-only`。
finalize 只做 repository-specific structural/integrity Gate，不修改 child HTML。

最终保留：`article.md`（CDN 图片、博客链接）、`article-wechat-source.md`（本地图片、
纯文本 URL）、`article-wechat.html`（gzh-design HTML）。Step 5 记录 deterministic artifact
hash；draft 改变时必须回到 Step 3。

## Publish

博客先运行 `publish-blog.mjs`，它负责 Astro build、commit/push 与状态记录；push 不代表 GitHub Pages 已 deploy。
博客状态完成或明确 blocked 后，才构建微信 capsule。`publish-wechat.mjs` 只消费
`article-wechat.html` 并生成 canonical `sourceUrl` 的 UTM；实际草稿由 Agent 原生委托
`baoyu-post-to-wechat` 创建，创建草稿不等于群发。

```bash
bun run .agents/skills/wechat-article-write/scripts/publish-blog.mjs <date-slug>
bun run .agents/skills/wechat-article-write/scripts/publish-wechat.mjs <date-slug> --prepare-only
# Agent native delegates baoyu-post-to-wechat with the capsule above.
bun run .agents/skills/wechat-article-write/scripts/publish-wechat.mjs <date-slug> --finalize-only [--media-id <id>]
```

失败时查看 `state.mjs next`，只恢复失败的博客或微信子状态。

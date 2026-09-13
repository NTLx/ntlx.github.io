# 构建与发布

## Build

调用 `github-image-hosting` 前先运行确定性 preflight：

```bash
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs <date-slug> --hosting-status
```

`FROZEN`（已有 manifest，且 draft / image-plan / imgs 未变）时不得调用 hosting；只有 `NEEDED`
（无 manifest，或上游视觉输入已变）才重新调用。Step 5B 的 child-owned 局部 failure 先由 Main
将当前 HTML、frozen source 和 diagnostic 交给同一 `gzh-design` Skill 做 owner-local repair；仍失败
时只从 frozen source 再调用一次 `gzh-design` 与 finalize，不重跑 hosting 或 prepare。

Main 直接调用 `github-image-hosting`，将 `imgs/`、业务 folder `wechat-articles`、稳定命名前缀和
`image-map.json` 输出路径传入其当前 SKILL.md 契约，由该 Skill 生成 manifest。它负责 repo 配置、远端
状态、冲突、重试和 CDN URL。

然后 Main 直接运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs <date-slug> --prepare-only
```

此脚本不执行上传、不访问 GitHub API、不定位第三方 uploader，只消费 `image-map.json`，完成本地图片
引用替换并生成 `article.md`、`article-wechat-source.md`。随后 Main 调用 `gzh-design` 生成
`article-wechat.html`；Skill 自己完成主题选择、validator 和 preview，再运行 `--finalize-only`。
finalize 只做 repository-specific structural/integrity Gate，不修改 HTML。

最终保留：`article.md`（CDN 图片、博客链接）、`article-wechat-source.md`（本地图片、纯文本 URL）、
`article-wechat.html`（gzh-design HTML）。Step 5 记录 deterministic artifact hash；draft 改变时必须
回到 Step 3。

Step 5 finalize 后 `image-map.json` 与双轨产物即冻结：manifest 仍新鲜时 `--prepare-only` fail closed。
微信轨恢复只能重新调用 `gzh-design` 并运行 `--finalize-only`，不得重跑 hosting 或 prepare；只有回退到
Step 3/4 让 manifest 变旧，才允许重建。

## Publish

Main 按 blog-first 顺序执行 blog publish、WeChat prepare、`baoyu-post-to-wechat` 和 finalize。博客先
运行 `publish-blog.mjs`，它负责 Astro build、commit/push 与状态记录；push 不代表 GitHub Pages 已 deploy。
博客状态完成或明确 blocked 后，才构建微信 capsule。`publish-wechat.mjs` 只消费 `article-wechat.html`
并生成 canonical `sourceUrl` 的 UTM；实际草稿由 Main 调用 `baoyu-post-to-wechat` 创建。该 Skill 读取
自己的 `SKILL.md` 与项目 `EXTEND.md`，选择 API/browser/remote-api，获取 token，上传图片和 cover，并
创建草稿。Main 不调用其内部 API script；Skill 失败时重试该 Skill，创建草稿不等于群发。

```bash
bun run .agents/skills/wechat-article-write/scripts/publish-blog.mjs <date-slug>
bun run .agents/skills/wechat-article-write/scripts/publish-wechat.mjs <date-slug> --prepare-only
# Main invokes baoyu-post-to-wechat with the prepared HTML.
bun run .agents/skills/wechat-article-write/scripts/publish-wechat.mjs <date-slug> --finalize-only [--media-id <id>]
```

失败时读取 `state.mjs next`，只恢复失败的博客或微信子状态。

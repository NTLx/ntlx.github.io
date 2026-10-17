# 构建与发布

## Build

调用 `github-image-hosting` 前先运行确定性 preflight：

```bash
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs <date-slug> --hosting-status
```

`FROZEN`（已有 manifest，且 visual-draft / imgs 未变）时不得调用 hosting；只有 `NEEDED`
（无 manifest，或上游视觉输入已变）才重新调用。Step 5B 的 Skill-owned 局部 failure 先由 Main
将当前 HTML、frozen source 和 diagnostic 交给同一 `gzh-design` Skill；重试与停止条件统一见
[adapter-gzh-design.md](adapter-gzh-design.md#owner-local-repair)，不重跑 hosting 或 prepare。

Main 直接调用 `github-image-hosting`，将 `visual-draft.md` 实际引用的最终 `imgs/` raster 集合、业务 folder `wechat-articles`、稳定命名前缀和
`image-map.json` 输出路径传入其当前 SKILL.md 契约，由该 Skill 生成 manifest。它负责 repo 配置、远端
状态、冲突、重试和 CDN URL。

然后 Main 直接运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs <date-slug> --prepare-only
```

此脚本不执行上传、不访问 GitHub API、不定位第三方 uploader，只消费 `image-map.json`，完成本地图片
引用替换并生成 `article.md`、`article-wechat-source.md`。构建输入为 `visual-draft.md`，不改写冻结的 `draft.md`。随后 Main 调用 `gzh-design` 生成
`article-wechat.html`；Skill 自己完成主题选择、validator 和 preview，再运行 `--finalize-only`。
finalize 只做 repository-specific structural/integrity Gate，不修改 HTML。

最终保留：`article.md`（CDN 图片、博客链接）、`article-wechat-source.md`（本地图片、纯文本 URL）、
`article-wechat.html`（gzh-design HTML）。Step 5 记录 deterministic artifact hash；draft 改变时必须
回到 Step 3。文本 identity 为 `draft_sha256`，hosting identity 为
`visual_draft_sha256` 与 `imgs_sha256`；发布 freshness 另纳入 root cover 的文件身份和内容 hash；继续记录 `image_map_sha256`、`article_sha256`、
`wechat_source_sha256` 和 `wechat_html_sha256`。Specialist auxiliary 文件与 candidates 不进入 hosting 集合。

Step 5 finalize 后 `image-map.json` 与双轨产物即冻结：manifest 仍新鲜时 `--prepare-only` fail closed。
微信轨恢复只能重新调用 `gzh-design` 并运行 `--finalize-only`，不得重跑 hosting 或 prepare；只有回退到
Step 3/4 让 manifest 变旧，才允许重建。

## Publish

Main 按 blog-first 顺序执行 blog publish、Pages reconciliation、WeChat prepare、`baoyu-post-to-wechat`
和 finalize。博客先运行 `publish-blog.mjs`：写入公开文章后，它直接复用仓库唯一的 `npm run verify`
契约，再 commit/push 与记录状态；不要在 Parent Skill 内复制 `check:tags` 等仓库 policy。push 成功只证明
remote commit 已存在，不代表 GitHub Pages 已 deploy，也不得把 blog 标成 `done`。随后 Main 运行
`reconcile-blog-deploy.mjs --wait`，把该 commit 与 `deploy.yml` workflow 绑定，并在 workflow success 后
探活 canonical `sourceUrl`；两项都成立才写 `site_deployed: true` 和 `publish.blog = done`。CI 明确失败、
等待超时或部署证据不可得时保留可恢复状态，不得以 push 代替上线证据。

博客状态完成或明确 blocked 后，才构建微信 capsule。`publish-wechat.mjs --prepare-only` 只消费
`article-wechat.html` 并生成 canonical `sourceUrl` 的 UTM，同时输出 `input`、`title`、`summary`、
`author`、`cover`、`source_url`。Main 调用 `baoyu-post-to-wechat` 时必须把这整个 capsule 作为冻结输入
显式交给 Skill，不能只传 HTML 路径并依赖它从 HTML 重新推断标题等元数据。该 Skill 仍读取自己的
`SKILL.md` 与项目 `EXTEND.md`，选择 API/browser/remote-api，获取 token，上传图片和 cover，并创建草稿。
Main 不调用其内部 API script；Skill 失败时重试该 Skill，创建草稿不等于群发。

```bash
bun run .agents/skills/wechat-article-write/scripts/publish-blog.mjs <date-slug>
bun run .agents/skills/wechat-article-write/scripts/reconcile-blog-deploy.mjs <date-slug> --wait
bun run .agents/skills/wechat-article-write/scripts/publish-wechat.mjs <date-slug> --prepare-only
# Main invokes baoyu-post-to-wechat with input + title + summary + author + cover + source_url.
bun run .agents/skills/wechat-article-write/scripts/publish-wechat.mjs <date-slug> --finalize-only [--media-id <id>]
```

失败时读取 `state.mjs next`，只恢复失败的博客部署确认或微信子状态。博客 commit 已 push 时不得重新
发布文章来“碰碰运气”；直接重跑 reconciliation。`publish_result.blog.site_deployed` 为 `true` 才代表
线上已确认，`null` 表示证据不足，`false` 表示已观察到明确失败。

Step 5 artifact manifest is v4; pipeline business state remains v2. Older manifests cannot
authorize finalize or publish. A v3 manifest may still establish FROZEN hosting when its visual
inputs match; the existing image map and track outputs must still match their recorded hashes.
Rebuild the publication manifest after Step 4 without re-uploading
unchanged body images. Completed channel state remains independent.

封面替换会使发布 freshness 失效。只要 `visual-draft.md` 和 `imgs/` 未变，hosting 保持
FROZEN。Main 重新打开最终封面并通过 Step 4，再运行 prepare（复用原 image-map）、HTML 校验与 finalize。
若扩展名变化需要修改 frontmatter.coverImage，按文本变更回到 Step 3，再生成一致的视觉稿；
hosting preflight 仍按实际 visual-draft / imgs identity 判断。
即使封面仍存在、格式正确，也不能直接用旧 manifest 发布。

# 构建与发布

## Build

dispatch `github-image-hosting` 前先运行确定性 preflight：

```bash
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs <date-slug> --hosting-status
```

`FROZEN`（已有 manifest，且 draft / image-plan / imgs 未变）时不得 dispatch hosting；只有 `NEEDED`
（无 manifest，或上游视觉输入已变）才重新委托。Step 5B 的 child-owned 局部 failure 先在当前
Build Executor 做 owner-local repair；repair 失败后的 fresh retry 只重做 `gzh-design` 与 finalize，
不重跑 hosting 或 prepare。

Step 5 先由 Agent 原生委托 `github-image-hosting`，将 `imgs/`、业务 folder
`wechat-articles`、稳定命名前缀和 `image-map.json` 输出路径传入其当前 SKILL.md 契约，
由该 Skill 生成 `image-map.json`。它负责 repo 配置、远端状态、冲突、重试和 CDN URL。

Build phase 默认由一个 isolated Executor 按顺序完成以下 units；deterministic Gate 不单独创建
Executor，失败时才带 diagnostic 回到对应 owner：

先运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs <date-slug> --prepare-only
```

此脚本不执行上传、不访问 GitHub API、不定位第三方 uploader，只消费 `image-map.json`，
完成本地图片引用替换并生成 `article.md`、`article-wechat-source.md`。缺少 map 时必须先
完成 `github-image-hosting` 原生委托。然后由 Agent 原生委托 `gzh-design` 生成
`article-wechat.html`；child 自己完成主题选择、validator 和 preview，再运行 `--finalize-only`。
finalize 只做 repository-specific structural/integrity Gate，不修改 child HTML。Step 5A 失败
时返回 `RETRY_REQUIRED`，由 Main 创建 fresh Build phase Executor 并重新委托
`github-image-hosting`；Step 5B 失败时把 Gate diagnostics 传回 fresh `gzh-design` Executor，
但 child-owned 的局部 structural/integrity failure 必须先在当前 Build Executor 由同一 gzh-design
owner 对现有 HTML 做 owner-local repair，再重跑 validator、preview 和 finalize；只有 repair 仍失败
才创建 fresh Executor。从 frozen source 重新生成，不在父层 patch HTML。

Step 5B 的 retry budget 是每个 `phase + failure class` 最多一次 fresh retry。第一次 child-owned structural
failure 先做一次 owner-local repair，不计入 fresh retry；repair 仍失败后才 fresh 重做
`gzh-design → finalize`，不重跑 hosting 或 prepare；fresh retry 后同一 failure class 再次失败即
`BLOCKED`，禁止第三次自动 theme retry，也不进入 theme roulette。Transient 网络/API/rate
limit 由 Specialist 自己处理，不升级为 parent-level LLM context。

最终保留：`article.md`（CDN 图片、博客链接）、`article-wechat-source.md`（本地图片、
纯文本 URL）、`article-wechat.html`（gzh-design HTML）。Step 5 记录 deterministic artifact
hash；draft 改变时必须回到 Step 3。

Step 5 finalize 后 `image-map.json` 与双轨产物即冻结：manifest 仍新鲜时 `--prepare-only` fail
closed。微信轨恢复只能重新委托 `gzh-design` 并运行 `--finalize-only`，不得重跑
`github-image-hosting` 或 prepare；只有回退到 Step 3/4 让 manifest 变旧，才允许重建。

## Publish

Publish phase 默认由一个 isolated Executor 按 blog-first 顺序完成 blog publish、WeChat prepare、
`baoyu-post-to-wechat` 和 finalize。博客先运行 `publish-blog.mjs`，它负责 Astro build、commit/push 与状态记录；push 不代表 GitHub Pages 已 deploy。
博客状态完成或明确 blocked 后，才构建微信 capsule。`publish-wechat.mjs` 只消费
`article-wechat.html` 并生成 canonical `sourceUrl` 的 UTM；实际草稿由 Agent 原生委托
`baoyu-post-to-wechat` 创建。`baoyu-post-to-wechat` owns the publishing implementation：它
读取自己的 `SKILL.md` 与项目 `EXTEND.md`，选择 API/browser/remote-api，获取 token，上传
图片和 cover，并创建草稿。Parent 不得调用其内部 API script；child 失败时重新委托该 child，
创建草稿不等于群发。

```bash
bun run .agents/skills/wechat-article-write/scripts/publish-blog.mjs <date-slug>
bun run .agents/skills/wechat-article-write/scripts/publish-wechat.mjs <date-slug> --prepare-only
# Agent native delegates baoyu-post-to-wechat with the capsule above.
bun run .agents/skills/wechat-article-write/scripts/publish-wechat.mjs <date-slug> --finalize-only [--media-id <id>]
```

失败时查看 `state.mjs next`，只恢复失败的博客或微信子状态。

Publish phase 不创建 blog prepare、WeChat prepare 或 finalize Agent；这些 deterministic action 在同一
Publish phase Executor 内完成。Main 只消费 bounded handoff，不读取 child Skill 或完整失败 HTML。

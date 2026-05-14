# CDN 失败降级策略

> 本文件是流水线 Step 8（HTML 转换）和 Step 10（微信发布）唯一权威的"CDN → 本地"降级说明。
> SKILL.md 中所有相关章节只 cross-ref 到这里，不再重复策略文本。

## 为什么需要降级

jsDelivr CDN 缓存传播是异步的，新上传的图片可能 30 秒～几分钟才能在边缘节点可用。期间会出现：

- HTTP 503（cache miss + origin throttle）
- TCP `ETIMEDOUT` / `ECONNRESET`
- baoyu-markdown-to-html 内部 fetch 卡住直到超时

直接重试 CDN 不会解决问题（边缘节点未传播完成前重试多少次都是 503），必须切换到 **本地路径** 让 baoyu-markdown-to-html 走本地图片，再在 HTML 出来之后把本地路径回写为 CDN URL。

## 双产物：article.md vs article-local.md

`apply-image-map.mjs` 同时产出两份 markdown：

| 文件 | 图片引用 | 用途 |
|---|---|---|
| `article.md` | `https://cdn.jsdelivr.net/...` | 默认；Step 9 博客发布；Step 10 微信发布优先尝试 |
| `article-local.md` | `imgs/NN-xxx.png` | 仅在 CDN 超时时作为 Step 8 / Step 10 的降级输入 |

`article.md` 是事实源，`article-local.md` 是镜像。**两者只能同时由 `apply-image-map.mjs` 生成**，禁止人工编辑后者。

## 降级编排：run-with-cdn-fallback.sh

所有需要"读 article.md"的命令统一通过此脚本调用：

```bash
bun run scripts/run-with-cdn-fallback.sh <date-slug> <stage> -- <cmd...>
```

- 命令参数中的 `{ARTICLE_MD}` 占位符会被替换为 `article.md`（首次尝试）或 `article-local.md`（降级重试）
- `<stage>` 取值 `html` 或 `wechat`，区别在于 `html` 阶段重试成功后会自动用 `apply-image-map.mjs --html-rewrite` 把生成的 `article.html` 内本地路径回写为 CDN URL
- 触发降级的错误模式：`timeout` / `ETIMEDOUT` / `503` / `ECONNRESET` / `connection reset`
- 重试一次仍失败时透传原始退出码

## 调用示例

### Step 8: HTML 转换（必经降级）

```bash
bun run scripts/run-with-cdn-fallback.sh "$DATE_SLUG" html -- \
  bun run .agents/skills/baoyu-markdown-to-html/scripts/convert.mjs \
    --input "{ARTICLE_MD}" --output "posts/$DATE_SLUG/article.html" \
    --theme baoyu --color blue
```

### Step 10: 微信发布

`publish-wechat.mjs` 已内嵌降级逻辑，agent 不需要包一层 `run-with-cdn-fallback.sh`。

## 何时不需要降级

- Step 9（博客发布）只把 `article.md` 复制进 `src/content/docs/articles/`，不会触达 CDN，因此不走降级
- 浏览端访问博客时是用户浏览器去 fetch CDN，超时由浏览器侧处理，与本管线无关

## 故障扩散保护

降级一次仍失败时，脚本透传退出码并 **不会** 把状态写为 done。Agent 应：

1. 记录错误到 `.pipeline-state.json`：`bun run scripts/state.mjs set <slug> 8 failed '{"error":"cdn-fallback exhausted"}'`
2. 等 5–10 分钟后用 `bun run scripts/run-with-cdn-fallback.sh ...` 整体重跑该 Step（不要做"只重试 CDN"这种细粒度尝试，会让 state 不可恢复）

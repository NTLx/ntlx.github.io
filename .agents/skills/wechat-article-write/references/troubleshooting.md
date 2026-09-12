# 排错

先读实际错误，回到对应 owner，修正当前输入，再重跑同一 Gate。路径从仓库根目录解析；跨阶段失败时
回到产生该输入的 Step。

| 症状 | 处理 |
|---|---|
| Step 1 缺背景 URL | research owner → 补可追溯来源 → Step 1 Gate |
| Step 2 SLOT/H2/frontmatter 失败 | draft/content-invariants owner → Step 2 Gate |
| Step 3 hash 不新鲜 | `humanizer-zh` owner → frozen draft → Step 3 Gate |
| Step 4 缺图、比例或 source 不一致 | 对应 visual owner → `image-plan.json` / 本地文件 → Step 4 Gate |
| mandatory child unavailable | declared Specialist owner → 当前 unit `BLOCKED`，不使用 fallback |
| Step 5 prepared | Build phase Executor: `gzh-design` owner → HTML validator/preview → build-finalize Gate |
| gzh 或 Step 5 structural/integrity 失败 | `RETRY_REQUIRED` → fresh Build phase Executor → frozen source → `gzh-design` → 同一 Gate |
| 图床网络失败 | `RETRY_REQUIRED` → fresh Build phase Executor → `github-image-hosting` owner → Step 5A Gate |
| primary source already published | blog-memory owner → update/remove source 或停止 → Step 1.5 Gate |
| child artifact 被 Parent 修改 | 原 Specialist owner → frozen input → 原 Gate |
| 发布失败 | 对应 blog/WeChat owner → `state.mjs next` → 对应 publish Gate |

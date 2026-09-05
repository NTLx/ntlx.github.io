# 排错

先读实际错误，修正当前输入，再重跑同一 Gate。路径从仓库根目录解析；跨阶段失败时回到产生该输入的 Step。

| 症状 | 处理 |
|---|---|
| Step 1 缺背景 URL | 在 `materials.md` 的 `## 背景调研` 添加可追溯来源，重跑 Step 1 |
| Step 2 SLOT/H2/frontmatter 失败 | 按 `content-invariants.md` 修 `draft.md`，重跑 Step 2 |
| Step 3 hash 不新鲜 | 回到 `draft.md`，重新执行 `humanizer-zh`、审阅 diff、重跑 Step 3 |
| Step 4 缺图或比例错误 | 回到对应专业图片 Skill；生成后实际查看，再重跑 Step 4 |
| Step 4 source image 不一致 | 检查 `image-plan.json` 的最终 file、kind、source、reason 和本地文件 |
| mandatory child unavailable | 当前专业阶段 `BLOCKED`，不使用 fallback；报告阻塞并保持在当前 Step |
| cover child 失败 | 重新委托 `baoyu-cover-image`；不要使用 `image_gen` 或直接调用 `baoyu-image-gen` |
| SLOT00 child 失败 | 重新委托 `baoyu-xhs-images`；不要用父 Agent 生成替代图片 |
| 正文 generated visual 失败 | 重新委托 `baoyu-infographic`；不要由 Parent 手工生成或修补 |
| Step 5 prepared | 这是正常中间状态：调用 `gzh-design` 生成 HTML，再 finalize |
| gzh validator/preview 失败 | 按 gzh-design 自己的输出修正输入并重新委托；父 finalize 不修补 child HTML |
| Step 5 structural/integrity 失败 | 保持 child HTML 不变，将 Gate diagnostics 传回 `gzh-design`，从冻结 source 重新生成；禁止 patch HTML |
| 图床网络失败 | 重新委托 `github-image-hosting` 并按其规则恢复；不要调用 `upload.ts` 或复制外层重试 |
| 微信发布失败 | 重新委托 `baoyu-post-to-wechat`；不要直接调用 `wechat-api.ts` 或由 Parent 自己创建草稿 |
| primary source already has published article | 打开 `blog-memory.md` 阅读已有文章；不要创建新 slug。需要新信息就更新已有文章；多源任务删除已覆盖 source 后重新运行 Step 1.5；全部来源已覆盖则停止 |
| child artifact 被 Parent 修改 | child completion 失效；恢复干净输入并重新委托原 child，再运行同一 Gate |
| 发布失败 | `state.mjs next` 只恢复失败子状态；博客 push、Pages deploy、微信 prepare、child draft 分开判断 |

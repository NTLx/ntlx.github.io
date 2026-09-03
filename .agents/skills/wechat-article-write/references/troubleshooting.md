# 排错

先读实际错误，修正当前输入，再重跑同一 Gate。路径从仓库根目录解析；跨阶段失败时回到产生该输入的 Step。

| 症状 | 处理 |
|---|---|
| Step 1 缺背景 URL | 在 `materials.md` 的 `## 背景调研` 添加可追溯来源，重跑 Step 1 |
| Step 2 SLOT/H2/frontmatter 失败 | 按 `content-invariants.md` 修 `draft.md`，重跑 Step 2 |
| Step 3 hash 不新鲜 | 回到 `draft.md`，重新执行 `humanizer-zh`、审阅 diff、重跑 Step 3 |
| Step 4 缺图或比例错误 | 回到对应专业图片 Skill；生成后实际查看，再重跑 Step 4 |
| Step 4 source image 不一致 | 检查 `image-plan.json` 的最终 file、kind、source、reason 和本地文件 |
| Step 5 prepared | 这是正常中间状态：调用 `gzh-design` 生成 HTML，再 finalize |
| gzh validator/preview 失败 | 按 gzh-design 自己的输出修正输入并重新委托；父 finalize 不修补 child HTML |
| Step 5 structural/integrity 失败 | 保持 child HTML 不变，依据 Gate 错误回到 gzh-design 或 source normalization 后重新生成 |
| 图床网络失败 | 读取 `github-image-hosting` 的错误并按其规则恢复；不要复制外层重试 |
| 发布失败 | `state.mjs next` 只恢复失败子状态；博客 push、Pages deploy、微信 prepare、child draft 分开判断 |

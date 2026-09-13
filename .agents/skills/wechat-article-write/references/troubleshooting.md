# 排错

先读实际错误，回到对应 owner，修正当前输入，再重跑同一 Gate。路径从仓库根目录解析；跨阶段失败时
回到产生该输入的 Step。Main 只消费 bounded diagnostic，不读取 child Skill、不打开完整失败 HTML。

所有 diagnostic 都必须收敛为 summary：counts + 最多 3 个 samples，每个 sample 不超过 160 chars。
Step 5 structural parity 的完整错误集只在 validator 内存中计算，不持久化 debug JSON、trace 或完整 log。

同一 `phase + failure class` 最多一次 fresh retry。gzh-design 第一次 structural failure 只回到
`gzh-design → finalize`；fresh retry 后同类 failure 再次出现即 `BLOCKED`，禁止第三次自动重试和
theme roulette。Retry capsule 只带 frozen source path、failure class、counts、samples、required
Specialist、target output 和 Gate command。

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

建议的 Step 5 structural diagnostic：

```text
WECHAT_STRUCTURAL_PARITY_FAIL
failure_class: structural-parity/<missing|moved|heading|image|mixed>
missing_blocks: <count>
moved_blocks: <count>
heading_mismatch: <count>
image_mismatch: <count>
samples:
- <sample 1>
- <sample 2>
- <sample 3>
```

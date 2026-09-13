# 排错

先读实际错误，回到产生当前输入的 owner，修正 artifact 或补充证据，再重跑同一 Gate。路径从仓库根目录
解析；跨步骤失败时回到产生该输入的 Step。Main 读取 bounded diagnostic，也可按 Step 5 repair contract
读取当前 HTML 以完成 content-preserving 修复。

所有 diagnostic 都必须收敛为 summary：counts + 最多 3 个 samples，每个 sample 不超过 160 chars。
Step 5 structural parity 的完整错误集只在 validator 内存中计算，不持久化 debug JSON、trace 或完整 log。

统一恢复原则是 `Retry locally before changing context`。普通失败由 Main 修复并重跑；Step 5 的首次
gzh-design 局部 structural/integrity failure 必须先使用当前 HTML、frozen source 和 diagnostic 做
owner-local repair。若局部修复仍失败，可从 frozen source 再调用一次同一 Skill；同一 failure class 再次
出现即 `BLOCKED`，不得第三次自动重试或 theme roulette。只要 diagnostic 指向上游 artifact，必须回到真正
owner，不能让 gzh-design 或其它 Skill 代修。

| 症状 | 处理 |
|---|---|
| Step 1 缺背景 URL | Main 判断是否需要 research child → 补可追溯来源 → Step 1 Gate |
| Step 2 SLOT/H2/frontmatter 失败 | Main 修复 draft/content invariants → Step 2 Gate |
| Step 3 hash 不新鲜 | Main 调用 `humanizer-zh` → frozen draft → Step 3 Gate |
| Step 4 缺图、比例或 source 不一致 | Main 调用对应 visual Skill → `image-plan.json` / 本地文件 → Step 4 Gate |
| mandatory Skill unavailable | 当前 unit `BLOCKED`，不使用 fallback |
| Step 5 prepared | Main → `gzh-design` → HTML validator/preview → build-finalize Gate |
| gzh 或 Step 5 child-owned structural/integrity 失败 | Main → same `gzh-design` Skill → owner-local repair → native validator/preview → finalize |
| owner-local repair 仍失败 | frozen source → `gzh-design` 再调用一次 → 同一 Gate；同类 failure → `BLOCKED` |
| 图床网络失败 | Main 重试 `github-image-hosting` → Step 5A Gate |
| primary source already published | Main 更新/移除 source 或停止 → Step 1.5 Gate |
| specialist artifact 需要修改 | 回到原 Skill owner，以 frozen input 重做 → 原 Gate |
| 发布失败 | Main 读取 `state.mjs next` → 只恢复失败的 blog/WeChat 子状态 |

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

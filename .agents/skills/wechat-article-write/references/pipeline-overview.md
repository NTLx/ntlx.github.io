# 流水线概览

数字 state 是恢复指针；步骤权威在主 `SKILL.md`。每个 Step 的产物、Gate 和 execution boundary 如下：

| Step | 输入 | 输出 | Execution Unit / Gate |
|---|---|---|---|
| 0 | 用户目标、已有 state | strategy、post 目录、state v2 | `bootstrap/resume` / `state.mjs` |
| 1 | 原始材料、研究结果 | `materials.md` | `research` / `step1-collect.mjs` |
| 1.5 | materials primary sources、已发布文章 | Primary Source Uniqueness → `blog-memory.md/json` | `blog-memory` / `select-related-articles.mjs`；同源即 BLOCKED |
| 1.8 | materials、blog memory | `understanding-brief.md`（按需） | `understanding` / `validate-understanding.mjs` |
| 2 | 上述材料、写作目标 | `draft.md` + visual SLOT topology | `draft` / `step2-write.mjs` |
| 3 | Step 2 draft | 更新后的 `draft.md`、`step3_draft_sha256` | `humanization` → `humanizer-zh` / `step3-polish.mjs` |
| 4 | hash-fresh draft、source images | `cover.*`、`imgs/*`、最终 `image-plan.json` | visual execution units / `step4-images.mjs` |
| 5 | draft、图片 | `image-map.json`、三轨 artifact | `hosting`、`build-prepare`、`wechat-layout`、`build-finalize` / `step5-build.mjs` |
| 6 | finalized artifacts | blog、WeChat draft 状态 | `blog-publish`、`wechat-publish` / `publish-blog.mjs`、`publish-wechat.mjs` + `baoyu-post-to-wechat` |

Step 2 只产出 `draft.md` 及其 visual SLOT topology；Step 4 完成 source/generated resolution
后，才产出 `cover.*`、`imgs/*` 和最终 `image-plan.json`。

Step 1.5 的内部顺序固定为：

```text
Materials → Primary Source Uniqueness → Site Memory → Understanding
```

## State v2

现有 `.pipeline-state.json` 继续使用 `last_complete_step`、`failed_step` 和双轨
`publish`。允许额外字段；Step 3 写入 `step3_draft_sha256`，Step 5 及发布只把它当
draft freshness 事实。没有新的 schema generation，也没有调用 receipt。

## Strategy

`reader-response` 强调作者判断和认知增量；`tutorial` 强调准确、可执行的内容适配；
`news-digest` 强调核实事件、重要性和快速决策。策略文件只定义编辑目标和例外，不注册工具路线。

## 恢复

Main 只做理解、规划、dispatch 和 Gate 决策；每个 execution unit 由 Main 选择的 Delegated
Executor 在隔离 context 中完成。Step 1–4 完成认知或原生委托后运行 Gate。Step 5 先 prepare，
得到微信 source 后由 `wechat-layout` 执行 `gzh-design`，child 完成 validator/preview 后再由
`build-finalize` 校验。Step 6 先博客，再由 `wechat-publish` 执行 `baoyu-post-to-wechat`，最后
finalize；任一失败只从 state 指定的子状态恢复。

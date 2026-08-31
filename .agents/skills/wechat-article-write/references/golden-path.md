# Golden Path：最小正确例子

```text
Observe → Gap → Discover → Select → Delegate → Artifact → Gate → Trace
                                      ↘ no-skill
                         Pass / Replan
```

## 1. 准备目录

```bash
mkdir -p posts/2026-06-16-example-article
```

## 2. 写 materials.md

```markdown
# 材料

## 原文

- [OpenAI 发布会直播](https://example.com/source)

原文要点……

## 背景调研

- 背景资料：https://example.com/background
```

```bash
bun run .agents/skills/wechat-article-write/scripts/step1-collect.mjs 2026-06-16-example-article
bun run .agents/skills/wechat-article-write/scripts/select-related-articles.mjs 2026-06-16-example-article
```

## 3. 写 draft.md

```markdown
---
title: 示例文章
date: 2026-06-16
summary: 真正的变化不是工具变强，而是判断权开始重新分配。
category: ai-coding
blogSlug: example-article
coverImage: cover.png
sourceUrl: https://ntlx.github.io/articles/example-article
---

<!-- SLOT_IMG_00_INFOGRAPHIC -->

## 第一个判断

正文……

## 第二个判断

正文……

## 第三个判断

正文……

*你会把哪类判断交给 Agent？*

这和我之前在 [《旧文标题》](https://ntlx.github.io/articles/old-post) 里写过的判断有关。

## 延伸阅读

- [《旧文标题》](https://ntlx.github.io/articles/old-post)

## 参考资料

- [OpenAI 发布会直播](https://example.com/source)
```

`image-plan.json`：

```json
{
  "article_type": "deep-analysis",
  "cover": {
    "intent": "表达文章中心张力",
    "type": "conceptual",
    "style": "editorial",
    "palette": "warm",
    "rendering": "flat-vector",
    "prompt_source": "adapter"
  },
  "infographic": {
    "intent": "压缩全文判断、论证路径和结论",
    "layout": "hub-spoke",
    "style": "morandi-journal",
    "prompt_source": "adapter"
  },
  "illustrations": []
}
```

这个最小例子只保留文章级摘要图；正文没有明确视觉增益时，
`illustrations: []` 是合法计划。需要局部解释时，再为对应正文 SLOT 增加
entry；也可以把该 entry 标成 `prompt_source: "external"` 并填写任意当前
catalog producer，不需要修改 workflow。

```bash
bun run .agents/skills/wechat-article-write/scripts/step2-write.mjs 2026-06-16-example-article
```

## 4. 后处理与图片

按当前 refine 阶段的实际问题完成必要修改后：

```bash
bun run .agents/skills/wechat-article-write/scripts/step3-polish.mjs 2026-06-16-example-article
bun run .agents/skills/wechat-article-write/scripts/generate-image-prompts.mjs 2026-06-16-example-article
```

先运行图片后端 runtime 预检：

```bash
bun run .agents/skills/wechat-article-write/scripts/check-image-backend.mjs --runtime
```

图片层的 producer 只负责设计和 rendering prompt；日常命令不传 `--provider`，让
`.baoyu-skills/baoyu-image-gen/EXTEND.md` 中的 `default_provider: codex-cli`
生效；不要使用 batch.json。Codex CLI 失败时停止当前图片任务，不能切换
其它 provider：

```bash
bun run .agents/skills/baoyu-image-gen/scripts/main.ts \
  --promptfiles posts/2026-06-16-example-article/imgs/prompts/00-cover-example-article.md \
  --image posts/2026-06-16-example-article/cover.png \
  --ar 16:9

bun run .agents/skills/baoyu-image-gen/scripts/main.ts \
  --promptfiles posts/2026-06-16-example-article/imgs/prompts/00-infographic-core-summary.md \
  --image posts/2026-06-16-example-article/imgs/00-infographic-core-summary.png \
  --ar 16:9

bun run .agents/skills/baoyu-image-gen/scripts/main.ts \
  --promptfiles posts/2026-06-16-example-article/imgs/prompts/01-decision_flow.md \
  --image posts/2026-06-16-example-article/imgs/01-decision_flow.png \
  --ar 16:9
```

按 image-plan 逐张串行生成已计划的图片后：

```bash
bun run .agents/skills/wechat-article-write/scripts/step4-images.mjs 2026-06-16-example-article
```

生图时务必让封面输出到 post 根目录 `cover.png`，让已计划的 SLOT 图输出到
`imgs/NN-<desc>.png`（与 `imgs/prompts/NN-<desc>.md` 同名），不要用 provider
默认随机名——否则 Step 4 无法匹配占位符。若已生成但落盘成随机名，用
`align-image-names.mjs` 归位（见 `references/image-policy.md`），不要重新生图。

## 5. 构建和发布

```bash
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs 2026-06-16-example-article --dry-run
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs 2026-06-16-example-article --prepare-only
```

此时会得到：

- `posts/2026-06-16-example-article/article.md`
- `posts/2026-06-16-example-article/article-wechat-source.md`

然后由 Agent 调用 `gzh-design`：

- 读取 `article-wechat-source.md`
- 默认优先 `留白禅意风`
- 若更偏清单 / 工具 / 轻量方法论，可改用 `摸鱼绿`
- 生成 `posts/2026-06-16-example-article/article-wechat.html`

排版完成后 finalize：

```bash
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs 2026-06-16-example-article --finalize-only
bun run .agents/skills/wechat-article-write/scripts/publish-blog.mjs 2026-06-16-example-article
bun run .agents/skills/wechat-article-write/scripts/publish-wechat.mjs 2026-06-16-example-article
```

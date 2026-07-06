---
name: wechat-article-write
version: "1.30.0"
author: NTLx
description: >
  Use when creating, adapting, illustrating, building, or publishing WeChat
  Official Account articles from this repository, especially when the task
  involves raw materials, article drafts, blog/WeChat dual artifacts,
  "写公众号文章", "公众号推文", "wechat article", or the wechat-article-write pipeline.
---

# 微信公众号文章写作

本技能维护微信公众号 + 博客双轨发布管线。入口只做路由和硬规则；细节按需读取 `references/`。

## 先读路由

| 任务 | 必读文件 |
|---|---|
| 完整写作/续跑 | `references/pipeline-overview.md` |
| Steps 1-3 策略选择 | `references/strategies/{reader-response,tutorial,news-digest}.md` |
| 正文、frontmatter、SLOT 不变量 | `references/content-invariants.md` |
| 图片 prompt / 模板 / 生成 | `references/image-policy.md` |
| 图片后端顺序 / Codex CLI fallback | `references/image-backends.md` |
| 构建、博客发布、微信草稿 | `references/publishing.md` |
| 依赖、环境 | `references/dependency-manifest.md` |
| 排错 | `references/troubleshooting.md` |
| 最小正确例子 | `references/golden-path.md` |

## 核心不变量

| 领域 | 不变量 |
|---|---|
| 双轨分离 | 博客轨消费 `article.md` + CDN URL；微信轨消费 `article-wechat.html` + 本地图片 |
| 状态续跑 | 任一步失败先读 `scripts/state.mjs next <date-slug>`，不要从头重做 |
| sourceUrl | Step 2 预写 canonical 博客公网 URL；Step 6.2 传给微信“阅读原文”前统一追加 `utm_source=wechat&utm_medium=social&utm_campaign=article_push` |
| summary | frontmatter `summary` 是微信 digest 唯一来源，必须是 ≤120 字金句式摘要 |
| 站内记忆 | Step 1 后运行 `select-related-articles.mjs` 生成 `blog-memory.md/json`；Step 2 必须读取并自然联动相关旧文，或用 `--allow-no-related` 显式跳过 |
| last30days 调研 | Step 1 可按策略触发 `last30days`，获取近 30 天社区讨论、用户反馈和舆情脉搏；结果写入 `materials.md`，供 Step 2 作为论据吸收，禁止照搬 `last30days` 用户输出格式 |
| 链接双轨 | `draft.md` 使用 Markdown inline links；`## 参考资料` 标准写法是 `- [标题](URL)`；博客轨保留可点击 Markdown 链接；微信轨在 Step 5 将非图片链接转换为纯文本 URL，且会把参考资料列表展开为“标题 + 纯文本 URL”，`article-wechat.html` 不得含普通 `<a href>` |
| renwei-writing | 除 `tutorial` 策略显式 `humanizer: skip` 外，Step 3 必须调用 `renwei-writing` |
| 图片 | SLOT 00 是全文压缩信息图，必须解析到 `00-infographic-core-summary.*`；文内 `SLOT_IMG_01+` 不少于 3 张，按内容节点放置 |
| 文内图风格 | 文内插图默认是“文章解释图”，不是工程图纸；除非用户明确要求技术制图感，否则禁止使用会诱发日期/版本号/图号/尺寸线/图纸边框的图纸语法 |
| 图片后端 | Step 4 默认通过 `baoyu-image-gen --provider codex-cli` 调用 Codex CLI 生图；单张图超时建议设为 30 分钟；只有返回明确失败信号才算失败，Codex 明确失败后才回退到项目配置的 baoyu provider |
| 图片命名 | imgs/ 下 SLOT 图必须 `NN-<desc>.<ext>`，与 `imgs/prompts/NN-<desc>.md` 一致；禁止 `batch.json` |
| 图片模板 | 信息图走 `baoyu-infographic` 的 layouts × `craft-handmade` 默认风格；封面和文内图继续走 baoyu 模板 |
| 配置 | 项目级 `.baoyu-skills/{skill}/EXTEND.md` 和 `.baoyu-skills/.env` 是权威配置 |
| 样式 | Step 5 默认不传 `--theme` / `--color`；让脚本读取项目级主题配置 |
| 第三方技能 | `baoyu-*` / `ljg-*` 由 `npx skills` 管理，未经用户同意不得改源码 |

## 标准流程

1. Step 0：选择策略文件；不确定时向用户确认。
2. Step 1-3：按策略完成资料、写作、后处理，并运行对应门控脚本。
3. Step 4：运行 `generate-image-prompts.mjs`，审核 prompt 后用 Codex CLI 优先、baoyu fallback 串行生图，再运行 `step4-images.mjs`。
4. Step 5：运行 `step5-build.mjs` 构建博客/微信双轨产物。
5. Step 6：先 `publish-blog.mjs`，再 `publish-wechat.mjs`。

完整说明见 `references/pipeline-overview.md`。

## 最小命令索引

```bash
bun run .agents/skills/wechat-article-write/scripts/check-deps.mjs --stage all
bun run .agents/skills/wechat-article-write/scripts/state.mjs next <date-slug>
bun run .agents/skills/wechat-article-write/scripts/step1-collect.mjs <date-slug>
bun run .agents/skills/wechat-article-write/scripts/select-related-articles.mjs <date-slug>
bun run .agents/skills/wechat-article-write/scripts/step2-write.mjs <date-slug>
bun run .agents/skills/wechat-article-write/scripts/step3-polish.mjs <date-slug>
bun run .agents/skills/wechat-article-write/scripts/generate-image-prompts.mjs <date-slug>
bun run .agents/skills/wechat-article-write/scripts/step4-images.mjs <date-slug>
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs <date-slug>
bun run .agents/skills/wechat-article-write/scripts/publish-blog.mjs <date-slug>
bun run .agents/skills/wechat-article-write/scripts/publish-wechat.mjs <date-slug>
bun run .agents/skills/wechat-article-write/scripts/pipeline.mjs <date-slug> --auto
```

## 快速失败规则

- 依赖缺失先跑 `check-deps.mjs`，不要静默降级。
- Codex CLI 生图默认按长超时处理（建议每张图 `BAOYU_CODEX_IMAGEGEN_TIMEOUT_MS=1800000`）；只有返回明确失败信号才切到项目配置的 baoyu fallback；fallback 每张最多 1 次。
- 微信原文链接由 `baoyu-post-to-wechat` 原生处理，本技能不检查底层实现能力。
- 任何会改变发布内容的修复，都必须重新运行对应 step 门控。

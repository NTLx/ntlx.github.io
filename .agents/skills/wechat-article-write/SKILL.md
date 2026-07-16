---
name: wechat-article-write
version: "1.38.0"
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
| 材料理解增强 | `references/material-understanding.md` |
| 正文、frontmatter、SLOT 不变量 | `references/content-invariants.md` |
| 图片 prompt / 模板 / 生成 | `references/image-policy.md` |
| 图片后端顺序 / Codex CLI fallback | `references/image-backends.md` |
| 微信排版（gzh-design） | `references/wechat-gzh-layout.md` |
| 构建、博客发布、微信草稿 | `references/publishing.md` |
| 依赖、环境 | `references/dependency-manifest.md` |
| 排错 | `references/troubleshooting.md` |
| 最小正确例子 | `references/golden-path.md` |

## 核心不变量

| 领域 | 不变量 |
|---|---|
| 双轨分离 | 博客轨消费 `article.md` + CDN URL；微信轨消费 `article-wechat.html` + 本地图片 |
| 正文标题 | 正文禁止 H1；博客轨和微信轨都必须保留正文 H2，Step 5 不得把正文第一个 H2 当作 title 删除 |
| 状态续跑 | 任一步失败先读 `scripts/state.mjs next <date-slug>`，不要从头重做 |
| sourceUrl | Step 2 预写 canonical 博客公网 URL；Step 6.2 传给微信“阅读原文”前统一追加 `utm_source=wechat&utm_medium=social&utm_campaign=article_push` |
| summary | frontmatter `summary` 是微信 digest 唯一来源，必须是 ≤120 字金句式摘要 |
| 站内记忆 | Step 1 后运行 `select-related-articles.mjs` 生成 `blog-memory.md/json`；Step 2 必须读取并自然联动相关旧文，或用 `--allow-no-related` 显式跳过 |
| 理解增强 | `reader-response` 在 Step 2 前必须生成 `understanding-brief.md`，并把其中的写作契约喂给 `ljg-writes` |
| last30days 调研 | Step 1 可按策略触发 `last30days`，获取近 30 天社区讨论、用户反馈和舆情脉搏；结果写入 `materials.md`，供 Step 2 作为论据吸收，禁止照搬 `last30days` 用户输出格式 |
| 链接双轨 | `draft.md` 使用 Markdown inline links；`## 参考资料` 标准写法是 `- [标题](URL)`；博客轨保留可点击 Markdown 链接；微信轨在 Step 5 将非图片链接转换为纯文本 URL，并保留参考资料无序列表形态（每项为“标题 + 纯文本 URL”），`article-wechat.html` 不得含普通 `<a href>` |
| 微信排版中间产物 | Step 5 先生成 `article-wechat-source.md`，再由 Agent 调用 `gzh-design` 产出 `article-wechat.html`，最后用 `gzh-design` 自带校验脚本 finalize |
| 禁止 per-post 渲染脚本 | 不得在 `posts/<date-slug>/` 下创建任何用于生成 `article-wechat.html` 的自研脚本（如 `render-wechat.mjs`、临时 `.py`/`.sh`）。微信 HTML 只能由 `gzh-design` 技能按主题组件库装配产出。发现别的 post 下有此类脚本时，不得复制或改写它当作当前文章的排版产物——那是上一篇文章的本地脏产物，会带来硬编码金句漏改、模板复制链等故障；正确做法是重新调用 `gzh-design` |
| renwei-writing | 除 `tutorial` 策略显式 `humanizer: skip` 外，Step 3 必须调用 `renwei-writing` |
| 图片 | SLOT 00 是全文压缩信息图，必须解析到 `00-infographic-core-summary.*`；文内 `SLOT_IMG_01+` 不少于 3 张，按内容节点放置 |
| 文内图风格 | 文内插图默认是“文章解释图”，不是工程图纸；除非用户明确要求技术制图感，否则禁止使用会诱发日期/版本号/图号/尺寸线/图纸边框的图纸语法 |
| 图片后端 | Step 4 必须先通过 `baoyu-image-gen --provider codex-cli` 调用 Codex CLI；Codex CLI 可用时是唯一首选，不能被原生 `imagegen` / `image_gen` 工具或 `preferred_image_backend` 绕过；只有 Codex CLI 明确失败后才回退到项目配置的 baoyu provider |
| 图片串行 | Step 4 生图必须由主会话逐张串行执行；禁止 batch、`Promise.all`、`xargs -P`、后台任务 `&`、多 subagent 分派或任何并发启动多个 `baoyu-image-gen` / `codex exec` 的方式 |
| 图片命名 | imgs/ 下 SLOT 图必须 `NN-<desc>.<ext>`，与 `imgs/prompts/NN-<desc>.md` 一致；禁止 `batch.json` |
| 图片模板 | 信息图走 `baoyu-infographic` 的 layouts × `craft-handmade` 默认风格；封面和文内图继续走 baoyu 模板 |
| 配置 | 项目级 `.baoyu-skills/{skill}/EXTEND.md` 和 `.baoyu-skills/.env` 是权威配置 |
| 微信风格偏好 | 默认偏好 `留白禅意风`（`zen-whitespace`），主备选 `摸鱼绿`（`moyu-green`）；具体调用规则见 `references/wechat-gzh-layout.md` |
| 作者签名 | 调用 `gzh-design` 时，签名区 `{{作者名}}` 固定写 `NTLx`，`{{简介}}` 固定写 `热衷于分享 AI 观察与干货`；不要留占位符，不要让 Agent 自行猜测 |
| 第三方技能 | `baoyu-*` / `ljg-*` 由 `npx skills` 管理，未经用户同意不得改源码 |

## 标准流程

1. Step 0：选择策略文件；不确定时向用户确认。
2. Step 1-3：按策略完成资料、理解增强、写作、后处理，并运行对应门控脚本。
3. Step 4：运行 `generate-image-prompts.mjs`，审核 prompt 后用 Codex CLI 唯一首选、baoyu fallback 逐张串行生图，再运行 `step4-images.mjs`。
4. Step 5：先运行 `step5-build.mjs` 生成 `article.md` + `article-wechat-source.md`，再调用 `gzh-design` 产出 `article-wechat.html`，最后重新运行 `step5-build.mjs --finalize-only` 完成校验和落状态。
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
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs <date-slug> --prepare-only
bun run .agents/skills/wechat-article-write/scripts/step5-build.mjs <date-slug> --finalize-only
bun run .agents/skills/wechat-article-write/scripts/publish-blog.mjs <date-slug>
bun run .agents/skills/wechat-article-write/scripts/publish-wechat.mjs <date-slug>
bun run .agents/skills/wechat-article-write/scripts/pipeline.mjs <date-slug> --auto
```

## 快速失败规则

- 依赖缺失先跑 `check-deps.mjs`，不要静默降级。
- 微信排版默认是 Agent 自动，不是裸脚本自动；Step 5 预处理后若缺少 `article-wechat.html`，必须调用 `gzh-design`，不能跳过到 Step 6。
- Codex CLI 生图默认按长超时处理（建议每张图 `BAOYU_CODEX_IMAGEGEN_TIMEOUT_MS=1800000`）；Codex CLI 可用时不得切到其他文生图后端；只有返回明确失败信号才切到项目配置的 baoyu fallback；fallback 每张最多 1 次。
- 微信原文链接由 `baoyu-post-to-wechat` 原生处理，本技能不检查底层实现能力。
- 任何会改变发布内容的修复，都必须重新运行对应 step 门控。
- **禁止全局替换 HTML 文件中的引号**。`article-wechat.html` 中 HTML 属性必须使用 ASCII 双引号 `"`（U+0022）；正文文本可用中文弯引号 `""`（U+201C/U+201D）。如果 `validate_gzh_html.py` 报正文半角引号 WARNING，只改 `<span leaf="">` 内部的文本，不动标签属性。全局 `fix_quotes()` 会把 `src="..."` 的 ASCII 引号替换成花弯引号，导致 `wechat-api.ts` 的 regex 匹配不到 `<img>` 标签，图片全部上传失败、样式丢失。`publish-wechat.mjs` 已加 HTML 属性引号预检，遇到花弯引号会直接 exit 5 阻断发布。

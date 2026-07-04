# wechat-article-write 流水线概览

## 6 步流程

| Step | 动作 | 执行者 | 说明 |
|---|---|---|---|
| 0 | 文章类型判定 | Agent | 选择 `references/strategies/` 下的策略 |
| 1 | 资料收集 | Agent + 门控 | 写 `materials.md`，运行 `step1-collect.mjs` |
| 1.5 | 站内记忆检索 | 脚本 | 读取 `materials.md` 和已发布博客，生成 `blog-memory.md/json` |
| 2 | 文章创作 | Agent + 门控 | 写 `draft.md` / `image-plan.json`，运行 `step2-write.mjs` |
| 3 | 文本后处理 | Agent + 门控 | 调用 humanizer / formatter，运行 `step3-polish.mjs` |
| 4 | 图片生成 | Agent + 门控 | 生成 prompt、串行生图，运行 `step4-images.mjs` |
| 5 | 产物构建 | 脚本 | 上传 CDN、生成 `article.md` 和 `article-wechat.html` |
| 6 | 双轨发布 | 脚本 | 博客先发，微信草稿后发 |

## Step 1.5 站内记忆检索

Step 1 通过后运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/select-related-articles.mjs <date-slug>
```

脚本扫描 `src/content/docs/articles/*.md`，忽略 `.backup-*` 文件，基于 `materials.md` 生成当前文章可联动的旧文候选。Step 2 写作时必须读取 `blog-memory.md`，正文自然联动 1-2 篇旧文，文末放 2-4 篇站内延伸阅读；如果候选不适合当前文章，运行 Step 2 时使用 `--allow-no-related` 并在最终说明中交代理由。

## Step 0 策略选择

| 场景 | 策略 |
|---|---|
| 用户给 URL/材料，要求读后感、深度分析、观点文 | `reader-response` |
| 用户给已有博文/文档，要求转公众号或配图发布 | `tutorial` |
| 用户要求 AI 资讯/行业动态简报 | `news-digest`，experimental，首次使用先确认 |

策略只影响 Steps 1-3；Steps 4-6 始终按本技能工程管线执行。

## date-slug 与 blog-slug

- `date-slug`：`posts/` 下本地目录名，可含中文，形如 `YYYY-MM-DD-标题片段`。
- `blog-slug`：博客 URL 段，必须是纯 ASCII kebab-case。
- `sourceUrl`：canonical 博客公网 URL，默认 `https://ntlx.github.io/articles/{blogSlug}`；`tutorial` 可指向已有博文实际 URL。不要在 frontmatter 手写 UTM；Step 6.2 会为微信“阅读原文”生成带 WeChat UTM 的 `wechatSourceUrl`。

## 多文章拆分

Step 1 后判断材料是否超出单篇 ljg-writes 文章承载：

- 包含 3 个以上相互独立且各有深度的主题；
- 每个主题都值得独立展开；
- 拆分后每篇文章能独立成立。

若需要拆分，先向用户提出每篇主题、覆盖材料和建议发布顺序；用户确认后为每篇单独创建 `posts/{date-slug}/` 并从 Step 2 开始独立走完整管线。

## 断点续跑

```bash
bun run .agents/skills/wechat-article-write/scripts/state.mjs next <date-slug>
bun run .agents/skills/wechat-article-write/scripts/pipeline.mjs <date-slug>
```

`next` 返回下一个待执行 step；不要在状态未知时从头重做。

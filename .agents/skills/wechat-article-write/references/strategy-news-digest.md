---
name: news-digest
description: AI 行业资讯简报，汇总当日/当周热点
applies_when: 用户要求汇总 AI 资讯、行业动态、新闻简报
---

# news-digest 策略

> 注意：此策略为示例性质，尚未经过实战验证。首次使用后根据实际体验迭代。

## Step 1: 资料收集
行为: full

- 联网搜索当日/当周 AI 行业热点
- 候选发现优先用 `aihot`（AI 热点流，覆盖“发生了什么”）；对简报主线或 3-5 个核心热点调用 `last30days`，补充近 30 天社区讨论、真实用户反馈和争议信号（“大家最近怎么讨论”）；不要为每条边角资讯逐条跑，避免资料噪声和运行时间失控
- `aihot` 只做候选发现；进入正文的判断一律用官方/一手来源核验事实（“核验事实”）
- 抓取相关文章和新闻
- 写入 `posts/{date-slug}/materials.md`，必须包含 `## 背景调研` 章节
- 若使用 `last30days`，在 `materials.md` 增加 `## last30days 近期讨论` 小节，记录调研主题、时间窗口、覆盖来源、关键发现、社区原话、分歧/争议、可用于正文的判断、原始结果文件和参考 URL
- 每条资讯标注来源 URL

**脚本验证**：
```bash
bun run .agents/skills/wechat-article-write/scripts/step1-collect.mjs <date-slug>
```

## Step 1.5: 站内记忆检索
行为: script

```bash
bun run .agents/skills/wechat-article-write/scripts/select-related-articles.mjs <date-slug>
```

简报类文章可以只在文末放站内延伸阅读；如果当天资讯与既有文章有明显主线关系，也可以在正文小结里轻轻联动。旧文链接在 draft 中使用 Markdown inline link，Step 5 会为博客和微信生成不同链接形态。

## Step 2: 文章创作
行为: full

**禁止调用 `ljg-writes`**。简报不是“一个观点向下切 1000–1500 字”，`ljg-writes` 的单观点纵深模型与简报体裁冲突。由本策略定义结构化写作合同，主 Agent 直接按合同写 `draft.md`：

- 每条资讯 100-200 字概要
- 每条概要必须附一行作者判断（为何重要/影响谁/与既有判断的连接），文末要有综合判断段；增量契约见 `references/originality-policy.md`
- 若材料包含 `## last30days 近期讨论`，只把它用作"社区反应 / 争议信号 / 用户真实反馈"补充，不把简报写成 `last30days` 报告
- 读取 `posts/{date-slug}/blog-memory.md`，在文末 `## 延伸阅读` 放 2-4 篇站内旧文；如无合适旧文，运行 Step 2 时使用 `--allow-no-related`
- `SLOT_IMG_00` 信息图必须放在正文开头，作为当日/当周要点总览
- 文内 `SLOT_IMG_01+` 不少于 3 张，不含封面和 SLOT 00 信息图；按资讯之间的共同趋势、关键对比、时间线、公司/模型关系或影响路径放置，不按章节打卡
- 每个占位符描述词必须反映附近正文核心内容，禁止泛化词（如 `chart`、`diagram`、`illustration`）。step2/3/4 会校验数量、格式和图片文件对应关系

**脚本验证**：
```bash
bun run .agents/skills/wechat-article-write/scripts/step2-write.mjs <date-slug> \
  --allow-no-references --allow-no-interaction
```

6. **视觉规划**：产出 `posts/{date-slug}/image-plan.json`：
   ```json
   {"article_type": "news-digest"}
   ```
   脚本自动解析：bento-grid 信息图 + claymation 风格 + retro 插图。

## Step 3: 文本后处理
行为: full

简报初稿由 Agent 生成（`source_provenance = agent`），因此**不默认调用 `renwei-writing`**（它面向人工手稿，只做减法；对 AI 初稿不是最适输入）。按以下链路处理：

1. 先跑确定性 style lint：调用 `baoyu-format-markdown` 的确定性脚本 `scripts/main.ts` 校正 CJK 间距 / emphasis / 标点（只做 typography，不重写句子）：
   ```bash
   bun run .agents/skills/baoyu-format-markdown/scripts/main.ts posts/<date-slug>/draft.md --no-quotes
   ```
2. 检查是否有明显 AI 写作模式（宣传腔、三段式排比、万能展望结尾、过度连接词等）；只对命中的片段用 `humanizer-zh` 定点修复，不做全文重写
3. 不要为了“去 AI 味”调用 renwei-writing 后再次调用 formatter 整段重写；减少一次 LLM 改写通常比多一个“去 AI 味 Skill”更能保住声音

**脚本验证**：
```bash
bun run .agents/skills/wechat-article-write/scripts/step3-polish.mjs <date-slug>
```

## 特殊约束
- 每条资讯标注来源 URL
- 使用 `last30days` 时，"信息来源汇总"必须包含其 raw file 或关键来源 URL，保证正文判断可追溯
- 文末不需要互动问题，替换为"信息来源汇总"
- summary 侧重"今日要点速览"
- frontmatter summary 仍然是金句式（≤120 字），publish-wechat.mjs 缺 summary 直接 fail

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
- 抓取相关文章和新闻
- 写入 `posts/{date-slug}/materials.md`，必须包含 `## 背景调研` 章节
- 每条资讯标注来源 URL

**脚本验证**：
```bash
bun run .agents/skills/wechat-article-write/scripts/step1-collect.mjs <date-slug>
```

## Step 2: 文章创作
行为: full

- 通过 Skill 工具调用 ljg-writes，但指定"简报模式"：每条资讯 100-200 字概要
- 不需要深度分析和个人判断，重在信息密度和覆盖面
- 每个 `## ` 章节必须至少一个 SLOT_IMG 占位符（step4-images.mjs 会校验）

**脚本验证**：
```bash
bun run .agents/skills/wechat-article-write/scripts/step2-write.mjs <date-slug> \
  --allow-no-references
```

6. **视觉规划**：产出 `posts/{date-slug}/image-plan.json`：
   ```json
   {"article_type": "news-digest"}
   ```
   脚本自动解析：bento-grid 信息图 + retro-pop-grid 风格 + retro 插图。

## Step 3: 文本后处理
行为: full

- 通过 Skill 工具调用 renwei-writing 处理正文（两层：操作规则 + 事后检查清单）
- 通过 Skill 工具调用 baoyu-format-markdown 格式化

**脚本验证**：
```bash
bun run .agents/skills/wechat-article-write/scripts/step3-polish.mjs <date-slug>
```

## 特殊约束
- 每条资讯标注来源 URL
- 文末不需要互动问题，替换为"信息来源汇总"
- summary 侧重"今日要点速览"
- frontmatter summary 仍然是金句式（≤120 字），publish-wechat.mjs 缺 summary 直接 fail

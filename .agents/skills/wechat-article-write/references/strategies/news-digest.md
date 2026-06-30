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
   脚本自动解析：bento-grid 信息图 + craft-handmade 风格 + retro 插图。

## Step 3: 文本后处理
行为: full

- **⚠️ 强制执行 — 禁止跳过**：通过 Skill 工具调用 renwei-writing 处理正文（两层：操作规则 + 事后检查清单）。这是消除 AI 写作痕迹的唯一防线，不得以任何理由跳过
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

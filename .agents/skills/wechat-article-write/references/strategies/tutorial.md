---
name: tutorial
description: 教程/配置指南/知识库文章转微信公众号，内容已存在，只需配图和发布
applies_when: 用户已有完成的博文或文档内容，要求转为微信公众号文章或为已有内容配图发布
---

# tutorial 策略

## Step 1: 内容适配
行为: custom

本策略的 Steps 1-3 合并为一步"内容适配"：

1. 读取已有的博文/文档源文件
2. 适配为微信格式：
   - 写入 pipeline frontmatter（title, date, summary, category, blogSlug, coverImage, sourceUrl）
   - 移除 Starlight 专用语法（`:::tip`、`:::caution`、`:::note` 等），转换为 `> ` blockquote 或纯文本
   - 移除 `$schema: starlight` 等 Starlight 专用 frontmatter 字段
   - 正文中的 `![alt](url)` 图片引用转换为 SLOT_IMG 占位符（如果图片需要重新生成）
   - 正文中不得有 H1（Starlight 自动渲染 title 为 H1）
3. 插入 SLOT_IMG 占位符：
   - `<!-- SLOT_IMG_00_INFOGRAPHIC -->` 在 frontmatter 之后、正文第一个段落之前
   - 文内 `SLOT_IMG_01+` 不少于 3 张，不含封面和 SLOT 00 信息图；根据教程内容放在最需要视觉解释的位置，可位于关键步骤后、概念解释后、流程小结前或章节标题后，但不要为凑数机械塞图
   - 每个占位符描述词必须反映附近正文核心内容，禁止泛化词（如 `chart`、`diagram`、`illustration`）。step2/3/4 会校验数量、格式和图片文件对应关系
4. 确定 sourceUrl：指向已有博文的公网地址（如 `https://ntlx.github.io/ai-tools/claude-code-config/`）
5. 生成金句式 summary（≤120 字）
6. 运行 `suggest-category.mjs` 获取分类
7. 手动设置 blogSlug 和 sourceUrl（不遵循 `articles/{blogSlug}` 规则——sourceUrl 直接指向博文实际地址）
8. 在 frontmatter 中写入 `targetPath` 字段（如 `targetPath: ai-tools/claude-code-config`），告诉 publish-blog.mjs 写入自定义路径
9. 保存为 `posts/{date-slug}/draft.md`
10. **视觉规划**：产出 `posts/{date-slug}/image-plan.json`，教程类文章默认：
    ```json
    {"article_type": "tutorial"}
    ```
    脚本自动解析：linear-progression 信息图 + craft-handmade 风格 + minimal 插图 + vivid 封面。如需覆盖文内插图风格家族，加 `"direction": "tech"` 等（见 `references/image-template-catalog.md` 风格家族表）。
11. 运行 step2-write.mjs 进行基础门控验证：
    ```bash
    bun run .agents/skills/wechat-article-write/scripts/step2-write.mjs <date-slug> \
      --no-humanizer --allow-no-references --allow-no-interaction --allow-no-related
    ```
    - `--no-humanizer`：跳过 renwei-writing 相关检查（教程不需要去 AI 痕迹），并在状态文件中写入 `humanizer: skip` 标记
    - `--allow-no-references`：教程不要求"原文参考"区块
    - `--allow-no-interaction`：教程不要求文末互动问题
    - `--allow-no-related`：教程优先清晰度，允许不做站内旧文联动

## Step 1.5: 站内记忆检索（推荐）
行为: script

```bash
bun run .agents/skills/wechat-article-write/scripts/select-related-articles.mjs <date-slug>
```

教程策略可运行 Step 1.5 作为推荐动作。若旧文联动会干扰教程清晰度，Step 2 使用 `--allow-no-related`。

## Step 2: 跳过
行为: skip

内容已在 Step 1 中完成，无需独立写作步骤。

## Step 3: 门控验证（精简）
行为: custom

教程策略的 Step 3 不执行 renwei-writing 和 baoyu-format-markdown，但仍然运行 step3-polish.mjs 进行门控验证：

1. 跳过 renwei-writing 处理（保留技术文档风格）
2. 跳过 baoyu-format-markdown（内容在 Step 1 已完成适配）
3. 运行 step3-polish.mjs 进行门控验证：
   ```bash
   bun run .agents/skills/wechat-article-write/scripts/step3-polish.mjs <date-slug>
   ```
   该脚本会检测状态文件中的 `humanizer: skip` 标记，跳过 humanizer 专项检查但执行基础门控（frontmatter/SLOT_IMG/无 H1）。

## 特殊约束
- sourceUrl 不遵循 `articles/{blogSlug}` 模式，直接使用博文实际 URL
- blogSlug 仅用于管线内部标识（文件名前缀、图片命名），不与博客 URL 绑定
- frontmatter 必须包含 `targetPath` 字段，指定文章在 `src/content/docs/` 下的实际路径（不含 `.md` 扩展名）
- 不需要文末互动问题（教程不是读后感）
- 不需要原文参考区块
- 不需要 renwei-writing 处理（保留技术文档风格）

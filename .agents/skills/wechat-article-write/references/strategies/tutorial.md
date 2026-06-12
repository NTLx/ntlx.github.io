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
   - 在其他合适的章节边界插入 `<!-- SLOT_IMG_0X_XXX -->`
4. 确定 sourceUrl：指向已有博文的公网地址（如 `https://ntlx.github.io/ai-tools/claude-code-config/`）
5. 生成金句式 summary（≤120 字）
6. 运行 `suggest-category.mjs` 获取分类
7. 手动设置 blogSlug 和 sourceUrl（不遵循 `articles/{blogSlug}` 规则——sourceUrl 直接指向博文实际地址）
8. 在 frontmatter 中写入 `targetPath` 字段（如 `targetPath: ai-tools/claude-code-config`），告诉 publish-blog.mjs 写入自定义路径
9. 保存为 `posts/{date-slug}/draft.md`
10. **视觉规划**：分析文章内容结构，为每张 SLOT_IMG 选择最匹配的图片模板组合。读取 `references/image-template-catalog.md` 获取推荐规则，产出 `posts/{date-slug}/image-plan.json`。

    教程类文章的推荐默认值：
    - `article_type`: `tutorial`
    - `infographic`: `linear-progression` + `ikea-manual`（步骤流程图）
    - 文内插图：`flowchart` + `minimal`（简洁步骤图）
    - 封面：`hero` + `vivid` + `digital`

    详见 catalog 中"tutorial"类型的推荐组合。Agent 应根据文章实际内容调整，不必拘泥于默认值。image-plan.json 格式和约束同 reader-response 策略。
11. 运行 step2-write.mjs 进行基础门控验证：
    ```bash
    bun run .agents/skills/wechat-article-write/scripts/step2-write.mjs <date-slug> \
      --no-humanizer --allow-no-references
    ```
    - `--no-humanizer`：跳过 humanizer-zh 相关检查（教程不需要去 AI 痕迹），并在状态文件中写入 `humanizer: skip` 标记
    - `--allow-no-references`：教程不要求"原文参考"区块

## Step 2: 跳过
行为: skip

内容已在 Step 1 中完成，无需独立写作步骤。

## Step 3: 门控验证（精简）
行为: custom

教程策略的 Step 3 不执行 humanizer-zh 和 baoyu-format-markdown，但仍然运行 step3-polish.mjs 进行门控验证：

1. 跳过 humanizer-zh 处理（保留技术文档风格）
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
- 不需要 humanizer-zh 处理（保留技术文档风格）

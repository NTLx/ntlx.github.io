---
name: tutorial
description: 教程、配置指南或知识库内容的公众号适配
applies_when: 用户已有博文或文档，要求转为微信公众号文章、配图或发布
---

# tutorial 策略

## Objective Function

准确保留原知识，同时提高解释性、可读性和可执行性。适配不是重新发明
技术内容，也不是为了公众号形式牺牲步骤、前提和边界。

本策略只定义编辑目标。内容清理、解释补充和结构调整根据原文实际缺口选择方法；
视觉设计遵循主 Skill 的固定专业职责。

## adapt 阶段

读取已有博文或文档，确认其 canonical URL、目标路径、版本语境和读者。只
做有证据的适配：

- 保留技术事实、命令、参数、前置条件和警告；
- 移除或改写 Starlight 专用语法（例如 `:::tip`、`:::caution`）为微信
  可读的引用/提示；
- 移除不属于文章协议的 frontmatter 字段；
- 用 H2 组织正文，正文不放 H1；
- 将已有高价值原图及其来源保留在材料中，供 Step 4 illustrator 分析复用；
- 写入金句式 `summary`，选择分类、`blogSlug`、`targetPath` 和 canonical
  `sourceUrl`。

教程若有明确外部原始写作材料，应在 `materials.md` 写入 `## 原始来源`，最终 draft 保留
`primarySourceUrls`；只有本站文档、本地文件或用户粘贴内容时，不要为了满足字段而编造外部 URL。

Agent 可读取 `blog-memory.md` 并选择是否联动旧文；是否联动由 Main 在 Understanding 阶段作
editorial judgement，不适合时不触发 retry。教程默认允许没有互动和参考资料，但如果
原文有来源信息，应保留它们。

Step 2 产物：

```text
posts/{date-slug}/draft.md
```

`draft.md` 是完整文字版。Step 4 从冻结副本 `visual-draft.md` 开始，按通用图片策略
调用专业视觉 Skills；正文插图分析概念、流程、配置关系或常见误区，不按章节凑数。
已有高价值 source evidence 可复用，设计形式与位置由对应 Skill 决定。

完成后运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/step2-write.mjs <date-slug> \
  --allow-no-references --allow-no-interaction
```

这些 flag 表示本策略的内容例外，不代表跳过 frontmatter、链接和
其它工程校验。

## refine 阶段

教程默认保留技术文档语气。先读取并应用 `humanizer-zh`，清理 AI 写作痕迹但
不编造作者经历或改动技术事实；humanizer 可以零改动。只有发现具体的错误、
歧义、重复或格式问题时才做其它修改。完成后运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/step3-polish.mjs <date-slug>
```

## 后续阶段

Step 4 由专业视觉 Skills 分析文章、选择视觉形式并集成 source 或 generated visual。Step 5/6 继续遵循
主 `SKILL.md` 的双轨构建、finalize 和发布顺序。

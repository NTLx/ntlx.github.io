---
name: tutorial
description: 教程、配置指南或知识库内容的公众号适配
applies_when: 用户已有博文或文档，要求转为微信公众号文章、配图或发布
---

# tutorial 策略

## Objective Function

准确保留原知识，同时提高解释性、可读性和可执行性。适配不是重新发明
技术内容，也不是为了公众号形式牺牲步骤、前提和边界。

本策略只定义编辑目标。内容清理、解释补充、结构调整和视觉设计根据原文
实际缺口选择方法；简单适配可以完全由 Agent 完成。

## adapt 阶段

读取已有博文或文档，确认其 canonical URL、目标路径、版本语境和读者。只
做有证据的适配：

- 保留技术事实、命令、参数、前置条件和警告；
- 移除或改写 Starlight 专用语法（例如 `:::tip`、`:::caution`）为微信
  可读的引用/提示；
- 移除不属于文章协议的 frontmatter 字段；
- 用 H2 组织正文，正文不放 H1；
- 将需要重画的原图改成有语义的 SLOT 占位符，保留确有信息价值的原图；
- 写入金句式 `summary`，选择分类、`blogSlug`、`targetPath` 和 canonical
  `sourceUrl`。

Agent 可读取 `blog-memory.md` 并选择是否联动旧文；如果不适合，使用
`--allow-no-related` 说明理由。教程默认允许没有互动和参考资料，但如果
原文有来源信息，应保留它们。

产物：

```text
posts/{date-slug}/draft.md
posts/{date-slug}/image-plan.json
```

`draft.md` 必须包含 SLOT 00；SLOT 01+ 只在能降低理解成本时创建，数量由
正文和 image-plan 决定，可以为零。这些图服务于概念、流程、配置关系或常见
误区，不是按章节凑数。`image-plan.json` 还要由 Agent 明确写出每个视觉节点
的 intent、prompt_source，以及 adapter 模式下的 layout/style 或 type/style；
不能只写 article_type（旧文章仅在显式兼容 flag 下允许默认值）。

完成后运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/step2-write.mjs <date-slug> \
  --allow-no-references --allow-no-interaction --allow-no-related
```

这些 flag 表示本策略的内容例外，不代表跳过 frontmatter、SLOT、链接和
其它工程校验。

## refine 阶段

教程默认保留技术文档语气。只有发现具体的错误、歧义、重复或格式问题时
才修改；可以不调用任何语言 Skill。完成后运行：

```bash
bun run .agents/skills/wechat-article-write/scripts/step3-polish.mjs <date-slug>
```

## 后续阶段

Step 4 先判断视觉意图，再选择当前 catalog 中能解释该意图的能力；所有
raster 生成统一收束到 `baoyu-image-gen → codex-cli`。Step 5/6 继续遵循
通用双轨构建、finalize 和发布顺序。

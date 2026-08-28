---
title: 内容与发布规则（AGENTS）
sidebar:
  hidden: true
---

# 内容与发布规则（`src/content/`）

本文件是**内容编写与发布规则的唯一权威**。AI agent（Qoder / Claude Code / skills runner 等）在产出或修改 `src/content/` 下内容时遵循本文。其他文件不得复制规则全文，只引用本文。

## frontmatter

- 所有 `src/content/docs/` 页面必须含 `title`；博客文章按 [`src/content.config.ts`](src/content.config.ts) schema 补充 `date` / `updated` / `category` / `tags`
- `date`：发布日（新建文章必填）；`updated`：实质修改已发布文章时必填（ISO `YYYY-MM-DD`）。`updated` 是 RSS `atom:updated`、BlogPosting JSON-LD `dateModified`、Starlight「最后更新」的唯一信号源；缺省时三处一律回退到 `date`。Agent 代为修改已发布文章时，若用户未指定 `updated`，用当天日期
- 实质修改 = 增删段落、改结论、补数据/截图、重写段落；纯排版 / typo / 链接修正不加 `updated`

## 正文与 Starlight

- **正文禁止 H1**：Starlight 自动把 frontmatter `title` 渲染为 `<h1>`，正文以 `# ` 开头会造成页面双标题
- **MDX JSX 中文引号**：`<LinkCard title="…" />` 内含中文引号 / `<` / `>` 会触发 MDX 解析错误，改用模板字符串 `` title={`…`} ``
- **Sidebar autogenerate v0.39+**：`autogenerate` 必须嵌套在 `items: [{ autogenerate: { ... } }]` 内，不能作为 group 顶层属性
- `src/content/docs/guides/` 下的 `.md` 是知识库页面（带 frontmatter）；本文件（`sidebar.hidden: true`）不进入可见页面

## category 与 URL 稳定性

- 博客文章放 `src/content/docs/articles/`；frontmatter `category` 必须是 6 枚举之一（`ai-coding` / `ai-agents` / `ai-industry` / `ai-models` / `security` / `engineering`），分类索引页自动生成
- **URL 稳定性**：不重命名、不移动 `articles/` 下已有文章。已有 60+ 篇文章 URL 被外部引用，移动 = 全网 404
- **文件名 kebab-case**：`articles/` 下文件名必须为小写 ASCII kebab-case；`AI-Foo.md` 与 `ai-foo.md` 视为同名冲突；标题字段可任意语言

## 技术博文编写规范（concise 版）

详见 [`src/content/docs/guides/authoring-guide.md`](src/content/docs/guides/authoring-guide.md)。核心：

1. **信息层次**：是什么 → 为什么 → 怎么做 → 出问题怎么办；渐进式信息披露
2. **跨平台示例的适用条件**：当所述软件/能力实际支持多个主流平台，且平台差异会影响用户执行时，提供对应命令。**不要为不支持的平台编造等价方案**；Unix-only 场景（如 tmux、proxychains）明确说明边界即可，不强制 Windows 替代。Windows 命令用 PowerShell + 容错参数；为常见 Shell（Bash/Zsh/Fish）提供对应配置方法
3. **Starlight Asides**：`:::tip` 上下文、`:::caution` 不可逆操作、`:::note` 补充
4. **代码块**：标注语言标识（bash, powershell, json, toml 等）；复杂命令加注释；提供「临时/永久」两种配置方式；修正用户粘贴代码里的中文引号
5. **外部链接**：引用官方文档用 Markdown 链接并说明内容

## 环境变量配置文档模式

1. **优先级**：明确环境变量 > 配置文件
2. **临时配置**：`export`（Unix）/ `$env:`（PowerShell）单行命令
3. **永久配置**：Unix 编辑 `.bashrc`/`.zshrc`；Windows 系统环境变量 / PowerShell Profile / `SetEnvironmentVariable`
4. **多种选择**：为不同熟练度用户提供多种配置方案

## 故障排除章节

1. 问题导向：直接列出具体症状
2. 提供选择：如「完全重置」vs「精确操作」
3. 危险操作前用 `:::caution`
4. 引用权威官方文档

## Git 提交

用 Conventional Commits：`docs: 简短描述（≤50 字符）` + 列表式变更点。示例见 [`src/content/docs/guides/authoring-guide.md`](src/content/docs/guides/authoring-guide.md)。
---
title: 技术博文编写规范
description: 联网工具、跨平台命令、Asides 组件、代码块与 Git 提交等编写约定
sidebar:
  label: 📖 技术博文编写规范
  order: 1
---

> 本规范从原 `AGENTS.md` 的"文档编写最佳实践"整段迁移而来，作为知识库内文章 / 技术博文的统一编写指南。AI agent（Qoder、Claude Code、skills runner 等）在产出技术内容时遵循本文。

## 联网搜索与浏览器使用

所有联网操作（搜索、抓取、登录站点、动态渲染页面读取）统一通过 [`web-access`](https://github.com/anthropics/skills) 技能完成；搜索引擎始终访问 `google.com/ncr`。详细约定见 `.agents/skills/web-access/SKILL.md`。

禁止使用任何 MCP 搜索工具、`WebFetch`、`WebParser`、`WebSearch` 或其他网络工具替代 `web-access`。

## 技术博文编写规范

1. **信息层次设计**：
   - 采用"是什么 → 为什么 → 怎么做 → 出问题怎么办"的结构
   - 使用渐进式信息披露，避免一次性抛出过多信息

2. **跨平台兼容性**：
   - 技术教程必须同时提供 Linux/macOS/Windows 三个平台的命令示例
   - Windows 命令使用 PowerShell，并添加容错参数（如 `-ErrorAction SilentlyContinue`）
   - 为不同 Shell（Bash/Zsh/Fish）提供对应的配置方法
   - 对于 Unix-only 工具（如 tmux、proxychains），提供 WSL 安装指南作为 Windows 替代方案

3. **Starlight Asides 组件使用**：
   - `:::tip` - 用于提供额外的上下文或解释设计理念
   - `:::caution` - 用于警告用户可能的数据丢失或不可逆操作
   - `:::note` - 用于补充说明
   - 示例：

     ```markdown
     :::caution[重要提示]
     删除这些文件将清除你的登录会话。建议先备份。
     :::
     ```

4. **代码块规范**：
   - 为代码块添加语言标识符（bash, powershell, json, toml 等）
   - 为复杂命令添加注释说明
   - 提供"临时生效"和"永久生效"两种配置方式
   - **检查中文引号**：用户粘贴的代码（尤其是 JSON）可能使用中文引号 `""`，需修正为英文引号 `""`

5. **外部链接引用**：
   - 引用官方文档时使用 Markdown 链接格式，并说明链接内容
   - 例如：`根据 [Claude Code 官方文档](https://code.claude.com/docs/zh-CN/settings)`

## 环境变量配置文档模式

当编写环境变量配置指南时，应包含：

1. **优先级说明**：明确环境变量 > 配置文件的优先级
2. **临时配置**：使用 `export`（Unix）或 `$env:`（PowerShell）的单行命令
3. **永久配置**：
   - Unix: 编辑 `.bashrc`/`.zshrc` 或使用 `echo >> ~/.zshrc`
   - Windows: 系统环境变量（GUI）、PowerShell Profile、或 `SetEnvironmentVariable`
4. **多种选择**：为不同技能水平的用户提供多种配置方案

## 故障排除章节编写

1. **问题导向**：直接列出用户可能遇到的具体症状
2. **提供选择**：如"完全重置"vs"精确操作"，满足不同需求
3. **风险提示**：在执行危险操作前使用 `:::caution` 明确告知后果
4. **引用权威**：引用官方文档增加可信度

## 开发服务器使用

- 使用 `npm run dev` 启动开发服务器（运行在 http://localhost:4321）
- 可以使用 `run_in_background: true` 参数在后台运行
- 使用 `web-access` 技能预览修改效果，而非直接访问文件系统
- 大型文件（如 `privoxy.md`）可能超出 token 限制，使用 `limit` 参数分块读取

## Git 提交规范

使用 Conventional Commits 格式：

```
docs: 简短描述（不超过 50 字符）

- 详细说明修改内容（如果需要）
- 使用列表格式说明多个变更点
```

示例：

```
docs: 优化 Claude Code 配置文件删除说明

- 添加基于官方文档的配置文件详细列表
- 增加删除操作的警告提示
- 提供完全重置和精确删除两种方案
- 改进跨平台命令的容错性
```

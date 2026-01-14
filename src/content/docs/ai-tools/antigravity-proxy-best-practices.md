---
title: Antigravity Tools 最佳实践
description: 解锁 Vibe Coding 的无限潜力：Antigravity Tools 深度指南。不仅是账号管理，更是通用的本地 AI 模型路由器。
---

如果说 2024 年是 AI 编程工具的元年，那么 2025 年无疑是 **Vibe Coding（氛围编程）** 的爆发年。Google 推出的 Antigravity IDE 凭借 Gemini 3 Pro 和 Claude Opus 4.5 等强力模型，成为了这一领域的佼佼者。

然而，对于习惯使用 Claude Code (CLI) 或 Codex (CLI) 等 Coding Agent 的极客来说，最大的痛点莫过于：**如此强大的免费模型资源，被死死困在了封闭的 IDE 内部。**

今天我们要介绍的 **Antigravity Tools** (原名 Antigravity-Manager)，就是打破这堵墙、打通 Vibe Coding “最后一公里”的神器。

## 项目定位：不仅仅是账号管理

Antigravity Tools 的本质是一个**“本地模型路由器”**（Model Router）。

它不仅仅用来管理你的 Google 账号，更核心的作用是将 Antigravity 的 Web Session 实时转译为标准化的 API 接口。这意味着，你只需要维护一套 Google 账号体系，就能驱动 Claude Code、Codex、Cursor 等所有支持 OpenAI/Anthropic 协议的开发工具。

## 核心功能深度解析

### 1. 智能仪表盘与账号管家
*   **全局监控**：一眼洞察所有账号的健康状况，实时显示 Gemini Pro、Flash 以及 Claude 模型的平均剩余配额。
*   **智能优选**：系统算法会根据配额冗余度，实时推荐并切换到“最佳账号”。
*   **无感鉴权**：支持 OAuth 2.0 一键授权，自动处理 Token 刷新。内置 403 封禁检测，自动跳过权限异常的账号。

### 2. 全协议转换引擎 (Multi-Sink)
这是该工具最硬核的部分，它能将上游请求实时转换为下游工具所需的格式：
*   **OpenAI 格式**: 提供 `/v1/chat/completions`，兼容 99% 的 AI 应用。
*   **Anthropic 格式**: 提供 `/v1/messages`，完美支持 **Claude Code CLI** 的全功能（包括思维链和系统提示词）。
*   **Gemini 格式**: 支持 Google 官方 SDK 调用。

### 3. 模型路由中心
Antigravity Tools 提供了一个“移花接木”的高级功能——**专家级重定向**。
*   **自定义路由**：你可以设置规则，当客户端请求 `gpt-4` 或 `claude-3-5-sonnet` 时，后台自动将其转发给免费的 `gemini-3-pro-high`，并将结果伪装成原模型返回。这让那些模型名称写死的工具也能瞬间“白嫖”高性能模型。

## 安装指南

请务必前往 GitHub 官方仓库的 Releases 页面下载安装包，以确保安全和获得最新功能。

*   **GitHub Releases**: [https://github.com/lbjlaq/Antigravity-Manager/releases](https://github.com/lbjlaq/Antigravity-Manager/releases)

支持平台：
*   **macOS**: 下载 `.dmg` 文件安装。
*   **Windows**: 下载 `.msi` 或 `.exe` 安装包。
*   **Linux**: 下载 `.AppImage` 或 `.deb` 包。

安装后：
1.  启动应用，进入“账号”页面。
2.  点击“添加账号” -> “OAuth”，自动拉起浏览器完成 Google 授权。
3.  进入“API 反代”页面，开启服务（默认端口 `8045`）。

## 实战配置指南

相比于临时设置环境变量，我们更推荐通过修改配置文件的方式来永久生效，这样更加稳定且易于管理。

### 1. Claude Code CLI 配置

Claude Code 的配置文件通常位于 `~/.claude/settings.json`。

1.  打开配置文件：
    ```bash
    # macOS / Linux
    code ~/.claude/settings.json
    ```
    *(如果文件不存在，请先运行一次 `claude` 命令初始化)*

2.  修改或添加 `env` 字段，配置反代地址和 Key：
    ```json
    {
      "env": {
        "ANTHROPIC_BASE_URL": "http://127.0.0.1:8045",
        "ANTHROPIC_API_KEY": "sk-antigravity"
      },
      // ... 其他原有配置保持不变
    }
    ```

3.  保存文件。现在，每次运行 `claude` 命令，它都会自动通过 Antigravity Tools 调用免费模型。

### 2. Codex CLI 配置

Codex CLI 的配置文件通常位于 `~/.codex/config.toml`。

1.  打开配置文件：
    ```bash
    # macOS / Linux
    mkdir -p ~/.codex
    code ~/.codex/config.toml
    ```

2.  添加自定义提供商配置：
    ```toml
    [model_providers.custom_api]
    name = "Antigravity Proxy"
    base_url = "http://127.0.0.1:8045/v1"
    api_key = "sk-antigravity"
    model = "claude-opus-4-5" # 指定默认使用的模型
    ```

3.  在使用 Codex 时，指定该 Provider：
    ```bash
    codex --provider custom_api "帮我写一个 Python 爬虫"
    ```

## 场景化模型推荐配置

基于 2025 年末最新的社区测评（LMArena, SWE-bench, Reddit），我们为你整理了针对不同开发场景的最佳模型组合。通过 Antigravity Tools 的路由功能，你可以将这些模型“组装”到你的工作流中，实现“三冠王”级别的开发体验。

### 🚀 后端与系统架构 (The "Backend Architect")
*   **推荐模型**: `claude-opus-4-5` (Thinking Mode enabled)
*   **适用场景**:
    *   **核心逻辑实现**：复杂业务逻辑、并发控制、支付网关。
    *   **深度重构**：从单体到微服务的拆分规划、遗留代码优化。
    *   **安全审查**：漏洞挖掘、边缘情况（Edge Cases）检测。
*   **配置理由**: Claude Opus 4.5 是目前的 **"Triple Crown"（专家、Web开发、数学三冠王）**。在 SWE-bench 上，其 ~72.5% 的得分显著优于 Gemini 2.5 Pro (~63.8%)。其 Thinking 模式能进行深度推理，有效减少幻觉，不仅能写出代码，更能解释“为什么这么写”，适合处理“决不能出错”的任务。
*   **路由建议**: 将 `gpt-4`、`gpt-5` 或 `claude-3-5-sonnet` 映射到 `claude-opus-4-5-thinking`。

### 🎨 前端交互与 Vibe Coding (The "Frontend Artist")
*   **推荐模型**: `gemini-3-pro-high`
*   **适用场景**:
    *   **UI/UX 还原**：根据设计稿或截图生成 React/Vue 组件。
    *   **交互实现**：复杂的动画效果、响应式布局调整。
    *   **快速迭代**：Tailwind CSS 样式微调。
*   **配置理由**: Gemini 3 Pro 被社区誉为 **"Frontend King"**。它拥有极快的生成速度（比 Opus 快 15-20%）和卓越的多模态理解能力，能精准捕捉 UI 细节（如微小的 padding 或阴影差异）。在处理包含大量 CSS/HTML 的长上下文时，表现依然稳健，非常适合“所见即所得”的 Vibe Coding。
*   **路由建议**: 将前端工具的请求映射到 `gemini-3-pro-high`。

### 📊 数据科学与全库分析 (The "Deep Analyst")
*   **推荐模型**: `gemini-2-5-pro`
*   **适用场景**:
    *   **全库理解**：一次性读取整个项目的代码库进行依赖分析。
    *   **日志分析**：在数 GB 的服务器日志中定位错误根因。
    *   **学术研究**：分析数百篇 PDF 论文并生成综述。
*   **配置理由**: 尽管是上一代模型，Gemini 2.5 Pro 依然是 **"Context King"**。在处理 **1M+ tokens** 的超长上下文时，它保持着极高的召回率和准确性。当你需要 AI “记住”整本书或整个仓库的内容时，它是最可靠的选择。

### ⚡️ 日常脚本与工具 (The "Daily Driver")
*   **推荐模型**: `gemini-3-flash`
*   **适用场景**:
    *   **运维脚本**：Shell/Python 自动化脚本编写。
    *   **格式化**：JSON/YAML 转换、Git Commit Message 生成。
    *   **简单测试**：补充单元测试用例。
*   **配置理由**: **速度极快（毫秒级）**且配额几乎无限。对于不需要深度推理的琐碎任务，Flash 模型是性价比之王，能够瞬间完成任务而不打断开发心流。

### 📝 创意写作与技术文档 (The "Tech Writer")
*   **推荐模型**: `claude-4-5-sonnet` 或 `claude-opus-4-5`
*   **适用场景**:
    *   撰写 README.md、技术博客、RFC 文档。
    *   润色邮件、编写释放说明（Release Notes）。
*   **配置理由**: Claude 系列的行文风格更 **自然、专业且具“人味”**。相比 Gemini 的“机器味”或 ChatGPT 的“过度修饰”，Claude 更能捕捉作者的语气和意图，生成的文档逻辑连贯，无需大量人工润色。

## 总结

Antigravity Tools 不是简单的破解工具，它是对 IDE 封闭能力的一种**工程化释放**。通过灵活运用上述模型组合，你可以构建出一套：
*   用 **Claude** 思考（后端/架构/写作）
*   用 **Gemini 3** 创造（前端/交互）
*   用 **Gemini 2.5** 记忆（长文档/全库）
*   用 **Flash** 执行（脚本/工具）

的终极 AI 开发工作流。

> **声明**: 本项目基于 CC BY-NC-SA 4.0 许可，严禁用于商业用途。请合理使用免费资源，共同维护开源生态。

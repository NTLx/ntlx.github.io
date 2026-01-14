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

## 推荐 API 组合配置

Antigravity Tools 的强大之处在于其灵活性。根据不同的开发场景，我们推荐以下“反代组合”，助你榨干免费模型的每一滴性能。

### 🚀 后端架构与复杂逻辑 (The "Backend Architect")
*   **适用场景**: 系统架构设计、复杂业务逻辑、API 设计、Bug 修复。
*   **推荐模型**: `claude-opus-4-5` 或 `claude-opus-4-5-thinking`
*   **配置策略**:
    *   Claude 系列模型在逻辑推理、代码安全性和复杂系统理解方面表现卓越。
    *   建议在 Antigravity Tools 中将默认的 `gpt-4` 路由映射到 `claude-opus-4-5`。
*   **优势**: 极强的逻辑一致性和错误排查能力，适合后端“硬核”开发。

### 🎨 前端交互与 Vibe Coding (The "Frontend Artist")
*   **适用场景**: React/Vue 组件生成、Tailwind 样式调整、UI/UX 实现。
*   **推荐模型**: `gemini-3-pro-high`
*   **配置策略**:
    *   Gemini 3 Pro 在处理长上下文（如包含大量 CSS/HTML 的文件）和理解视觉/交互描述方面具有独特优势。
    *   其生成速度通常快于 Opus，非常适合前端“所见即所得”的快速迭代。
*   **优势**: 响应迅速，对现代前端框架支持极佳，适合 Vibe Coding 风格。

### ⚡️ 极致性价比与脚本工具 (The "Daily Driver")
*   **适用场景**: 编写 Shell 脚本、简单重构、写文档、单元测试。
*   **推荐模型**: `gemini-3-flash`
*   **配置策略**:
    *   将日常的辅助工具（如 Commit Message 生成器）指向 `gemini-3-flash`。
*   **优势**: 速度极快，配额几乎无限，适合处理大量琐碎任务。

## 总结

Antigravity Tools 不是简单的破解工具，它是对 IDE 封闭能力的一种**工程化释放**。通过修改配置文件和灵活运用模型路由，你可以构建出一套完全免费且性能强悍的本地 AI 开发基础设施。

> **声明**: 本项目基于 CC BY-NC-SA 4.0 许可，严禁用于商业用途。请合理使用免费资源，共同维护开源生态。

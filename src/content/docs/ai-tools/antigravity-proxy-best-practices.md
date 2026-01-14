---
title: Antigravity Tools 最佳实践
description: Antigravity Tools (Antigravity-Manager) 是一款专业的 AI 账号管理与协议反代系统，支持 Gemini、Claude 等多账号调度。本文介绍其核心功能、安装配置及最佳实践。
---

**Antigravity Tools** (项目原名 Antigravity-Manager) 是一款专为开发者设计的本地 AI 中转站。它不仅是一个账号管理器，更是一个高性能的 API 调度网关，能够将 Google Gemini、Anthropic Claude 等 Web 端 Session 转化为标准化的 API 接口。

## 核心功能

1.  **多账号管理与智能调度**:
    *   **Smart Dashboard**: 实时监控所有账号（Gemini Pro/Flash, Claude）的剩余配额。
    *   **智能推荐**: 根据配额冗余度自动推荐最佳账号。
    *   **OAuth 授权**: 支持一键 OAuth 登录，简化 Session 获取流程。

2.  **API 协议反代 (API Proxy)**:
    *   **OpenAI 格式**: 提供 `/v1/chat/completions`，兼容绝大多数现有 AI 客户端。
    *   **Anthropic 格式**: 提供 `/v1/messages`，完美支持 **Claude Code CLI**（含思维链、系统提示词）。
    *   **状态自愈**: 遇到 429/401 错误时，后端毫秒级自动重试并轮换账号，确保服务不中断。

3.  **模型路由 (Model Router)**:
    *   支持将 `gpt-4` 等请求自动映射到 `gemini-3-pro-high` 等高性能模型。
    *   支持基于正则的自定义路由规则。

## 安装指南

### macOS & Linux (推荐 Homebrew)

```bash
# 1. 订阅 Tap
brew tap lbjlaq/antigravity-manager https://github.com/lbjlaq/Antigravity-Manager

# 2. 安装应用
brew install --cask antigravity-tools

# macOS 若提示权限问题，可添加 --no-quarantine
# brew install --cask --no-quarantine antigravity-tools
```

### Windows & 其他

请前往 [GitHub Releases](https://github.com/lbjlaq/Antigravity-Manager/releases) 下载对应的 `.msi` 或 `.AppImage` 文件。

## 配置与使用

### 1. 添加账号

1.  打开“账号 (Accounts)”页面，点击“添加账号”。
2.  选择“OAuth”方式，点击生成的链接在浏览器中登录 Google 账号。
3.  授权完成后，应用会自动获取 Token 并保存。

### 2. 开启 API 反代

1.  进入“API 反代”页面。
2.  点击开启服务（默认端口 8045）。
3.  复制你的 `sk-antigravity` (API Key)。

## 接入 Claude Code CLI

Antigravity Tools 对 Claude Code 提供了极佳的支持。

在终端中配置环境变量：

```bash
export ANTHROPIC_API_KEY="sk-antigravity"
export ANTHROPIC_BASE_URL="http://127.0.0.1:8045"
# 启动 Claude Code
claude
```

这样，Claude Code 就会通过你的 Antigravity Tools 本地网关进行调用，自动利用你添加的多个 Gemini/Claude 账号池。

## 接入 Python (OpenAI SDK)

```python
import openai

client = openai.OpenAI(
    api_key="sk-antigravity",
    base_url="http://127.0.0.1:8045/v1"
)

response = client.chat.completions.create(
    model="gemini-3-flash",
    messages=[{"role": "user", "content": "你好，请自我介绍"}]
)

print(response.choices[0].message.content)
```

## 常见问题与技巧

*   **403 封禁检测**: 系统会自动标注并跳过权限异常的账号。
*   **无头模式部署**: 支持在无界面的 Linux 服务器上通过 Xvfb 运行，适合搭建团队共享的 API 网关。
*   **Thinking 模型支持**: 最新版本完善了对 Gemini 3 Pro 和 Claude Thinking 模型的支持，修复了思考内容丢失的问题。

---

> **注意**: 本项目基于 CC BY-NC-SA 4.0 许可，严禁用于商业用途。数据存储于本地，安全性高。

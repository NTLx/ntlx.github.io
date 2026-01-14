---
title: Antigravity Tools 最佳实践
description: Antigravity Tools (Antigravity-Manager) 是一款专业的 AI 账号管理与协议反代系统，能够将 Google Antigravity 的免费资源转化为标准 OpenAI/Anthropic 接口。本文介绍其工作原理、安装配置、最佳实践及相关生态工具。
---

**Antigravity Tools** (项目原名 Antigravity-Manager) 不仅仅是一个账号管理器，它更像是一个本地运行的**“模型路由器”**。它能够将 Antigravity IDE 中的 Web Session 实时转译为标准的 API 接口，让你能够用免费的 Google 资源驱动 Claude Code、CodeBuddy 甚至任何支持 OpenAI 格式的第三方工具。

## 核心价值与工作原理

### 为什么需要它？

很多开发者面临着 API 接口混乱、额度管理困难的问题。Antigravity Tools 解决了三个痛点：
1.  **协议统一**：将 Google Gemini、Anthropic 等不同协议统一封装为标准的 `/v1/chat/completions` (OpenAI 格式) 或 `/v1/messages` (Anthropic 格式)。
2.  **负载均衡与熔断**：它像“多功能插线板”一样管理你的多个账号。当某个账号触发 429 (Too Many Requests) 或额度耗尽时，系统会毫秒级自动切换到备用账号，前端业务感知不到任何中断。
3.  **本地安全**：所有 Key 和请求都在本地（或自有 VPS）处理，不经过不可控的第三方中转。

### 它是如何工作的？

*   **登录穿墙**：通过 OAuth 直接获取 Token，绕过 Antigravity 客户端繁琐的验证和地区限制。
*   **协议转换引擎**：实时将标准 Prompt 转换为目标平台（如 Google）能识别的 JSON 结构。
*   **智能调度**：根据账号权重（Weight）和剩余配额，自动选择最佳账号进行请求转发。

## 安装与快速开始

### 1. 安装

**macOS & Linux (推荐 Homebrew)**:
```bash
brew tap lbjlaq/antigravity-manager https://github.com/lbjlaq/Antigravity-Manager
brew install --cask antigravity-tools
# macOS 权限问题修复: brew install --cask --no-quarantine antigravity-tools
```

**Windows**: 前往 [GitHub Releases](https://github.com/lbjlaq/Antigravity-Manager/releases) 下载 `.msi` 安装包。

### 2. 添加账号与启动

1.  打开软件，进入“账号 (Accounts)”页面，点击“添加账号” -> “OAuth”，在浏览器中完成 Google 授权。
2.  进入“API 反代”页面，开启服务（默认端口 `8045`）。
3.  复制界面上显示的 `sk-antigravity` (API Key)。

## 最佳实践场景

### 场景一：让 Claude Code "满血复活"

Claude Code 是极其强大的终端编程 Agent，但官方 API 昂贵。配合 Antigravity Tools，你可以用免费的 Google 算力驱动它。

**配置步骤**：
在终端设置环境变量（Windows PowerShell 用户请使用 `$env:NAME = "VALUE"` 格式）：

```bash
export ANTHROPIC_API_KEY="sk-antigravity"
export ANTHROPIC_BASE_URL="http://127.0.0.1:8045"
# 启动 Claude Code
claude
```

**进阶技巧：专家级重定向**
Claude Code 默认可能请求 `claude-3-5-sonnet` 等模型。你可以在 Antigravity Tools 的“模型映射”中设置规则，例如将 `claude-3-5-sonnet` 映射到 `gemini-3-pro-high`。这一招“狸猫换太子”能让所有工具瞬间兼容免费的高级模型。

### 场景二：配合 CC-Switch 管理多源模型

如果你有多个模型来源（例如 Antigravity 的免费池 + 只有少量额度的官方 Key），推荐使用 [CC-Switch](https://github.com/farion1231/cc-switch)。

CC-Switch 作为一个更上层的“API 管家”，可以接收 Antigravity Tools 提供的接口，并允许你快速在不同配置间切换。这让 Antigravity Tools 专注于底层的“模型路由与管控”（处理重试、配额），而 CC-Switch 负责上层的配置管理。

### 场景三：在 CodeBuddy 中自定义模型

CodeBuddy 是另一款优秀的 AI 编程 IDE。你可以通过修改配置文件接入 Antigravity：

编辑 `~/.codebuddy/models.json`：
```json
{
  "models": [
    {
      "id": "gemini-pro-free",
      "name": "Gemini Pro (AG)",
      "apiKey": "sk-antigravity",
      "url": "http://127.0.0.1:8045/v1/chat/completions",
      "supportsToolCall": true
    }
  ]
}
```

## 部署建议

*   **内网共享**：建议在局域网服务器（或常开的 PC/Mac）上部署，并固定内网 IP。这样你家里的手机、平板、笔记本都可以共享这一套 AI 后台。
*   **Linux Headless**：支持通过 Xvfb 在无界面的 Linux 服务器上运行，适合团队共享使用。

## 总结

Antigravity Tools 工程化地释放了封闭 IDE 的能力，打通了 Coding Agent 的“最后一公里”。无论你是想低成本运行 Claude Code，还是需要一个稳定的本地模型网关，它都是不可或缺的神器。

> **注意**: 本项目基于 CC BY-NC-SA 4.0 许可，严禁用于商业用途。请合理使用免费资源。

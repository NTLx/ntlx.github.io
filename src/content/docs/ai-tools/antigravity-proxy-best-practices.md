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

Claude Code CLI 支持两种配置方式:**环境变量**和**配置文件**。这两种方式可以单独使用，也可以组合使用，但它们的优先级有所不同。

### 配置优先级说明

**重要**: Claude Code 读取配置的优先级为:**环境变量 > settings.json 配置文件**

这意味着:
- 如果同时设置了环境变量和配置文件，Claude Code 会**优先使用环境变量**中的配置。
- 环境变量配置是强制性的，可以用来覆盖配置文件中的设置。
- 如果你在首次启动 Claude Code 时无法跳过登录 Anthropic 账号的步骤，需要:
  1. 删除已生成的 Claude Code 配置文件(`~/.claude` 目录)
  2. 先配置环境变量
  3. 再配合 settings.json 配置文件
  4. 强制 Claude Code 进入自定义 API 调用模式

### 方式一:环境变量配置(优先级最高)

环境变量配置适合需要快速切换或临时测试的场景。由于其优先级高于配置文件，也常用于强制覆盖默认设置。

#### Linux / macOS 配置

**临时生效(仅当前终端会话)**:
```bash
export ANTHROPIC_API_KEY="sk-antigravity"
export ANTHROPIC_BASE_URL="http://127.0.0.1:8045"
claude
```

**永久生效**:

根据你使用的 Shell，选择对应的配置文件:

```bash
# 对于 Bash 用户(编辑 ~/.bashrc 或 ~/.bash_profile)
echo 'export ANTHROPIC_API_KEY="sk-antigravity"' >> ~/.bashrc
echo 'export ANTHROPIC_BASE_URL="http://127.0.0.1:8045"' >> ~/.bashrc
source ~/.bashrc

# 对于 Zsh 用户(编辑 ~/.zshrc)
echo 'export ANTHROPIC_API_KEY="sk-antigravity"' >> ~/.zshrc
echo 'export ANTHROPIC_BASE_URL="http://127.0.0.1:8045"' >> ~/.zshrc
source ~/.zshrc

# 对于 Fish 用户
set -Ux ANTHROPIC_API_KEY "sk-antigravity"
set -Ux ANTHROPIC_BASE_URL "http://127.0.0.1:8045"
```

#### Windows 配置

**临时生效(仅当前 PowerShell 会话)**:
```powershell
$env:ANTHROPIC_API_KEY="sk-antigravity"
$env:ANTHROPIC_BASE_URL="http://127.0.0.1:8045"
claude
```

**永久生效(通过系统环境变量)**:

1. **图形界面方式**:
   - 右键点击"此电脑"或"我的电脑" → "属性"
   - 点击"高级系统设置"
   - 点击"环境变量"按钮
   - 在"用户变量"区域点击"新建"
   - 添加两个变量:
     - 变量名: `ANTHROPIC_API_KEY`, 变量值: `sk-antigravity`
     - 变量名: `ANTHROPIC_BASE_URL`, 变量值: `http://127.0.0.1:8045`
   - 点击"确定"保存

2. **PowerShell 命令方式**(需要管理员权限):
   ```powershell
   [System.Environment]::SetEnvironmentVariable('ANTHROPIC_API_KEY', 'sk-antigravity', 'User')
   [System.Environment]::SetEnvironmentVariable('ANTHROPIC_BASE_URL', 'http://127.0.0.1:8045', 'User')
   ```

3. **PowerShell Profile 方式**(推荐):
   ```powershell
   # 编辑 PowerShell 配置文件
   notepad $PROFILE

   # 在打开的文件中添加以下内容:
   $env:ANTHROPIC_API_KEY="sk-antigravity"
   $env:ANTHROPIC_BASE_URL="http://127.0.0.1:8045"

   # 保存后重新加载配置
   . $PROFILE
   ```

### 方式二:配置文件设置(推荐日常使用)

配置文件方式更适合长期稳定使用，配置集中管理，易于维护。

#### 1. Claude Code CLI 配置

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

### 故障排除：无法跳过登录环节？

如果你在首次运行 Claude Code 时遇到以下情况：
- 程序强制要求登录 Anthropic 账号
- 配置文件或环境变量似乎不生效
- 无法进入自定义 API 调用模式

这通常是因为 Claude Code 已经生成了默认配置文件，导致自定义配置被忽略。按照以下步骤可以强制进入自定义 API 模式：

#### 解决步骤

**步骤 1: 删除现有配置文件**

根据 [Claude Code 官方文档](https://code.claude.com/docs/zh-CN/settings)，Claude Code 的配置文件主要包括：

- `~/.claude/settings.json` - 用户全局设置
- `~/.claude.json` - OAuth 会话、偏好设置、MCP 配置等
- `~/.claude/` 目录下的其他配置文件

:::caution[重要提示]
删除这些文件将清除你的登录会话、个人偏好设置和 MCP 服务器配置。如果你已经配置了 MCP 服务器或其他个性化设置，建议先备份这些文件。
:::

**完全重置（推荐新手）**：

```bash
# macOS / Linux - 完全删除 Claude Code 配置目录
rm -rf ~/.claude ~/.claude.json

# Windows (PowerShell) - 完全删除
Remove-Item -Recurse -Force "$env:USERPROFILE\.claude"
Remove-Item -Force "$env:USERPROFILE\.claude.json" -ErrorAction SilentlyContinue
```

**仅删除设置文件（保留其他配置）**：

如果你想保留 MCP 服务器配置和其他设置，只删除 `settings.json`：

```bash
# macOS / Linux
rm -f ~/.claude/settings.json

# Windows (PowerShell)
Remove-Item -Force "$env:USERPROFILE\.claude\settings.json" -ErrorAction SilentlyContinue
```

**步骤 2: 先配置环境变量**

在删除配置文件后，**必须先设置环境变量**，然后再运行 Claude Code。这样可以确保 Claude Code 在初始化时就使用自定义 API。

```bash
# macOS / Linux (Bash/Zsh)
export ANTHROPIC_API_KEY="sk-antigravity"
export ANTHROPIC_BASE_URL="http://127.0.0.1:8045"

# Windows (PowerShell)
$env:ANTHROPIC_API_KEY="sk-antigravity"
$env:ANTHROPIC_BASE_URL="http://127.0.0.1:8045"
```

**步骤 3: 运行 Claude Code 并跳过登录**

现在运行 Claude Code，它应该会直接使用自定义 API，而不会要求登录 Anthropic 账号：

```bash
claude
```

**步骤 4: （可选）创建配置文件**

如果希望将配置永久保存，可以手动创建 `~/.claude/settings.json` 文件：

```bash
# macOS / Linux
mkdir -p ~/.claude
cat > ~/.claude/settings.json << 'EOF'
{
  "env": {
    "ANTHROPIC_BASE_URL": "http://127.0.0.1:8045",
    "ANTHROPIC_API_KEY": "sk-antigravity"
  }
}
EOF

# Windows (PowerShell)
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude"
@"
{
  "env": {
    "ANTHROPIC_BASE_URL": "http://127.0.0.1:8045",
    "ANTHROPIC_API_KEY": "sk-antigravity"
  }
}
"@ | Out-File -FilePath "$env:USERPROFILE\.claude\settings.json" -Encoding utf8
```

此外，Antigravity Tools 还提供了**自动同步配置功能**，可以一键将正确的配置写入到 Claude Code 的配置文件中。具体操作方法请参考 GitHub 仓库中的说明。

:::tip[为什么环境变量优先级更高？]
这是 Claude Code 的设计特性。环境变量优先级高于配置文件，允许用户在不修改配置文件的情况下临时覆盖设置。这对于在多个环境间切换、或在 CI/CD 流程中动态配置非常有用。

当你需要**强制**使用自定义 API 时，利用这个优先级特性可以确保配置生效，即使存在其他冲突的配置文件。
:::

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

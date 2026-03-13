---
title: AI Coding CLI 工具一键安装
description: 常用 AI 辅助编程命令行工具的一键安装脚本，支持 Linux、macOS 和 Windows。
---

本文档提供了常用 AI 辅助编程 CLI 工具的安装指南。

:::tip[趋势说明]
当前 AI 编程 CLI 工具（如 Claude Code 和 OpenCode）正从传统的 npm 全局安装向**原生二进制文件（Native Binary）**转变。原生安装方式具有 10-50 倍的启动速度提升，且不依赖本地 Node.js 环境，是目前最推荐的安装方式。
:::

## 🛠️ 包含工具列表

脚本和指南涵盖以下主流 AI 编程工具：

| 工具名称 | 安装建议 | 说明 |
| :--- | :--- | :--- |
| **[Claude Code](https://docs.anthropic.com/en/docs/claude-code)** | **推荐原生安装** | Anthropic 官方推出的 AI 编程代理工具，直接在终端中运行，支持代码库理解和日常任务自动化。 |
| **[OpenCode](https://opencode.ai)** | **推荐原生安装** | 开源的终端 AI 编程代理，提供极速响应和强大的代码操作能力。 |
| **[Oh My OpenCode](https://ohmyopencode.com)** | npm 安装 | OpenCode 的增强插件包，提供多代理编排、并行处理和增强功能。 |
| **[iFlow CLI](https://github.com/iflow-ai/iflow-cli)** | npm 安装 | 终端 AI 助手，专注于代码分析、任务自动化和自然语言交互，支持 ACP 协议。 |
| **[Qwen Code](https://github.com/QwenLM/qwen-code)** | npm 安装 | 基于 Qwen3-Coder 模型优化的开源终端 AI 代理。 |
| **[Gemini CLI](https://github.com/google-gemini/gemini-cli)** | npm 安装 | Google 官方开源 AI 代理，将 Gemini 模型能力带入终端。 |
| **[Codex](https://github.com/openai/codex)** | npm 安装 | OpenAI 推出的命令行编码代理，支持读取、编辑、运行代码及修复 Bug。 |
| **[Happy Coder](https://happy.engineering)** | npm 安装 | Claude Code 和 Codex 的开源移动端/Web端客户端。 |
| **[Qoder CLI](https://qoder.com)** (可选) | npm 安装 | Qoder AI 平台的命令行接口。 |
| **[CodeBuddy](https://codebuddy.tencent.com)** (可选) | npm 安装 | 腾讯云推出的 AI 编程助手，基于混元大模型。 |

## 🤖 Claude Code 官方安装

Claude Code 官方推荐使用以下原生安装命令（Native Install），该方式支持自动后台更新：

### Linux / macOS / WSL

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

### Windows PowerShell

```powershell
irm https://claude.ai/install.ps1 | iex
```

### Windows CMD

```cmd
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

## ⚙️ Claude Code 自定义配置

安装 Claude Code 后，如果需要使用自定义 API 端点（如公司内部部署或第三方代理），可以通过环境变量和配置文件进行配置。

### 配置文件位置

配置文件位于用户家目录：

| 平台 | 配置文件路径 |
| :--- | :--- |
| **Linux / macOS / WSL** | `~/.claude/settings.json` |
| **Windows** | `C:\Users\%USERNAME%\.claude\settings.json` |

### 跳过 Anthropic 账号登录

使用自定义 API 时，需要修改 `~/.claude.json` 文件（**注意：不是 `settings.json`**），添加以下配置以跳过 Anthropic 官方账号登录流程：

```json
{
  "hasCompletedOnboarding": true
}
```

:::caution[重要提示]
`~/.claude.json` 和 `~/.claude/settings.json` 是两个不同的文件。`hasCompletedOnboarding` 配置必须放在 `~/.claude.json` 中才能生效。
:::

### 环境变量配置

可以通过环境变量配置自定义 API 和模型参数。以下环境变量均可写入系统环境变量或 `~/.claude/settings.json` 配置文件。

#### 基础配置

| 环境变量 | 说明 |
| :--- | :--- |
| `ANTHROPIC_BASE_URL` | 自定义 API 基础 URL（如 `https://your-api.example.com`）**注意：无需添加 `/v1` 等版本后缀** |
| `ANTHROPIC_API_KEY` | 自定义 API 密钥（部分代理服务使用 `ANTHROPIC_AUTH_TOKEN`） |
| `ANTHROPIC_MODEL` | 默认模型名称 |

#### 进阶模型配置（可选）

如果需要为不同任务类型使用不同模型，可以配置以下环境变量：

| 环境变量 | 适用场景 |
| :--- | :--- |
| `ANTHROPIC_DEFAULT_OPUS_MODEL` | 复杂推理、架构设计、代码审查等高难度任务 |
| `ANTHROPIC_DEFAULT_SONNET_MODEL` | 代码编写、功能实现、调试修复等日常任务 |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL` | 语法检查、文件搜索、格式化等简单任务 |
| `ANTHROPIC_REASONING_MODEL` | 专门用于复杂推理任务的模型（如数学推导、逻辑分析） |

#### 性能与行为调优

| 环境变量 | 说明 | 建议值 |
| :--- | :--- | :--- |
| `BASH_DEFAULT_TIMEOUT_MS` | Bash 命令默认超时时间（毫秒） | `30000` (30秒) |
| `MCP_TIMEOUT` | MCP 工具调用超时时间（毫秒） | `60000` (60秒) |
| `CLAUDE_BASH_NO_LOGIN` | 跳过 Bash 登录 Shell 初始化，加快启动速度 | `1` |

#### 隐私与遥测控制

| 环境变量 | 说明 |
| :--- | :--- |
| `DISABLE_TELEMETRY` | 禁用遥测数据收集 |
| `DISABLE_ERROR_REPORTING` | 禁用错误报告上传 |

#### 实验性功能

| 环境变量 | 说明 |
| :--- | :--- |
| `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` | 启用实验性的多代理协作功能 |

### 配置优先级

Claude Code 配置的优先级从高到低为：

1. **工作目录配置文件** (`.claude/settings.json` 或 `CLAUDE.md`) - 最高优先级
2. **系统环境变量**
3. **用户目录配置文件** (`~/.claude/settings.json`)

:::tip[多项目配置]
利用优先级机制，可以在不同项目中使用不同的 API 配置或模型，而无需修改全局设置。
:::

### 配置示例

#### Linux / macOS (Bash/Zsh)

**临时生效（当前会话）**：
```bash
export ANTHROPIC_BASE_URL="https://your-api.example.com"
export ANTHROPIC_API_KEY="your-api-key-here"
export ANTHROPIC_MODEL="claude-sonnet-4-20250514"
```

**永久生效**（添加到 `~/.zshrc` 或 `~/.bashrc`）：
```bash
echo 'export ANTHROPIC_BASE_URL="https://your-api.example.com"' >> ~/.zshrc
echo 'export ANTHROPIC_API_KEY="your-api-key-here"' >> ~/.zshrc
echo 'export ANTHROPIC_MODEL="claude-sonnet-4-20250514"' >> ~/.zshrc
source ~/.zshrc
```

#### Linux / macOS (Fish)

**临时生效**：
```bash
set -x ANTHROPIC_BASE_URL "https://your-api.example.com"
set -x ANTHROPIC_API_KEY "your-api-key-here"
set -x ANTHROPIC_MODEL "claude-sonnet-4-20250514"
```

**永久生效**（添加到 `~/.config/fish/config.fish`）：
```bash
echo 'set -x ANTHROPIC_BASE_URL "https://your-api.example.com"' >> ~/.config/fish/config.fish
echo 'set -x ANTHROPIC_API_KEY "your-api-key-here"' >> ~/.config/fish/config.fish
echo 'set -x ANTHROPIC_MODEL "claude-sonnet-4-20250514"' >> ~/.config/fish/config.fish
```

#### Windows (PowerShell)

**临时生效（当前会话）**：
```powershell
$env:ANTHROPIC_BASE_URL = "https://your-api.example.com"
$env:ANTHROPIC_API_KEY = "your-api-key-here"
$env:ANTHROPIC_MODEL = "claude-sonnet-4-20250514"
```

**永久生效（通过 PowerShell Profile）**：
```powershell
# 编辑 PowerShell Profile
notepad $PROFILE

# 添加以下内容到文件
$env:ANTHROPIC_BASE_URL = "https://your-api.example.com"
$env:ANTHROPIC_API_KEY = "your-api-key-here"
$env:ANTHROPIC_MODEL = "claude-sonnet-4-20250514"
```

**永久生效（通过系统环境变量）**：
```powershell
# 以管理员身份运行
[Environment]::SetEnvironmentVariable("ANTHROPIC_BASE_URL", "https://your-api.example.com", "User")
[Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY", "your-api-key-here", "User")
[Environment]::SetEnvironmentVariable("ANTHROPIC_MODEL", "claude-sonnet-4-20250514", "User")
```

#### Windows (CMD)

**临时生效（当前会话）**：
```cmd
set ANTHROPIC_BASE_URL=https://your-api.example.com
set ANTHROPIC_API_KEY=your-api-key-here
set ANTHROPIC_MODEL=claude-sonnet-4-20250514
```

**永久生效（通过 GUI）**：
1. 按 `Win + R`，输入 `sysdm.cpl`
2. 点击 **高级** → **环境变量**
3. 在 **用户变量** 区域点击 **新建**，添加上述变量

#### 使用配置文件

在 `~/.claude/settings.json`（Linux/macOS）或 `C:\Users\%USERNAME%\.claude\settings.json`（Windows）中添加：

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "",
    "ANTHROPIC_BASE_URL": "https://your-api.example.com",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "claude-haiku-4-20250514",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "claude-opus-4-20250514",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "claude-sonnet-4-20250514",
    "ANTHROPIC_MODEL": "claude-sonnet-4-20250514",
    "ANTHROPIC_REASONING_MODEL": "claude-sonnet-4-20250514",
    "BASH_DEFAULT_TIMEOUT_MS": "30000",
    "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "75",
    "CLAUDE_BASH_NO_LOGIN": "1",
    "CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS": "1",
    "CLAUDE_CODE_DISABLE_FEEDBACK_SURVEY": "1",
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1",
    "DISABLE_ERROR_REPORTING": "1",
    "DISABLE_TELEMETRY": "1",
    "MCP_TIMEOUT": "60000"
  },
  "permissions": {
    "defaultMode": "plan"
  },
  "enabledPlugins": {
    "claude-code-setup@claude-plugins-official": true,
    "claude-md-management@claude-plugins-official": true,
    "code-review@claude-plugins-official": true,
    "commit-commands@claude-plugins-official": true,
    "context7@claude-plugins-official": true,
    "document-skills@anthropic-agent-skills": true,
    "feature-dev@claude-plugins-official": true,
    "playwright@claude-plugins-official": true,
    "pr-review-toolkit@claude-plugins-official": true,
    "qodo-skills@claude-plugins-official": true,
    "ralph-loop@claude-plugins-official": true,
    "skill-creator@claude-plugins-official": true,
    "superpowers@claude-plugins-official": true,
    "typescript-lsp@claude-plugins-official": true
  },
  "language": "中文",
  "alwaysThinkingEnabled": false,
  "skipDangerousModePermissionPrompt": true,
  "terminalProgressBarEnabled": true
}
```

#### 配置项说明

**基础设置**

| 配置项 | 说明 |
| :--- | :--- |
| `language` | 设置界面语言，设为 `中文` 可获得全中文交互体验。 |
| `terminalProgressBarEnabled` | 是否在终端显示任务进度条，建议开启。 |
| `alwaysThinkingEnabled` | 是否默认启用思考模式（扩展推理），`false` 表示按需手动开启。 |
| `skipDangerousModePermissionPrompt` | 跳过危险操作模式的权限提示，设为 `true` 可减少交互中断。 |

**权限配置**

| 配置项 | 说明 |
| :--- | :--- |
| `permissions.defaultMode` | 默认权限模式。`plan` 表示先规划后执行，适合谨慎操作；`acceptEdits` 表示自动接受编辑操作。 |

**环境变量（env）**

| 配置项 | 说明 |
| :--- | :--- |
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | 上下文自动压缩阈值（百分比）。设为 `75` 表示当上下文占用达到 75% 时触发压缩，优化长会话性能。 |
| `CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS` | 是否禁用实验性 Beta 功能，设为 `1` 可提升稳定性。 |
| `CLAUDE_CODE_DISABLE_FEEDBACK_SURVEY` | 是否禁用反馈调查弹窗，设为 `1` 可减少干扰。 |
| `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` | 是否启用实验性的多代理协作功能，设为 `1` 开启。 |

**插件配置（enabledPlugins）**

`enabledPlugins` 对象用于管理 Claude Code 插件的启用状态。每个插件的格式为 `插件名@来源`，值为 `true` 表示启用。

:::tip[常用插件推荐]
以下是一些实用的官方插件：

| 插件名称 | 功能说明 |
| :--- | :--- |
| `superpowers` | 增强工作流，提供计划编写、代码审查、TDD 等技能 |
| `commit-commands` | Git 提交、推送、创建 PR 的快捷命令 |
| `code-review` | 代码审查工具 |
| `pr-review-toolkit` | PR 审查工具集 |
| `playwright` | 浏览器自动化测试 |
| `context7` | 快速查询第三方库文档 |
| `document-skills` | 文档处理技能（PDF、Word、PPT 等） |
| `skill-creator` | 创建和管理自定义技能 |
| `typescript-lsp` | TypeScript 语言服务器支持 |
:::

:::note[配置文件格式]
配置文件使用 JSON 格式，注意逗号、引号和大括号的正确性。环境变量的值需要用字符串格式（如 `"75"` 而非 `75`）。
:::

## 🚀 OpenCode 官方安装

OpenCode 同样推荐使用原生安装方式，以获得最佳性能：

### Linux / macOS / WSL

```bash
curl -fsSL https://opencode.ai/install | bash
```

### Windows (推荐使用包管理器)

- **Chocolatey**: `choco install opencode`
- **Scoop**: `scoop install opencode`
- **Homebrew (macOS/Linux)**: `brew install anomalyco/tap/opencode`

## 🖥️ OpenCode 桌面版（推荐）

:::tip[为什么推荐桌面版]
OpenCode 桌面版提供了比 CLI 更丰富的用户体验，特别适合以下场景：

| 特性 | 桌面版优势 |
| :--- | :--- |
| **图形界面** | 原生 GUI 界面，直观易用，无需记忆命令 |
| **文件操作** | 系统级文件对话框，快速选择项目目录 |
| **MCP-UI 渲染** | 支持交互式仪表板、表单、进度条等可视化组件 |
| **系统通知** | 原生桌面通知，任务完成及时提醒 |
| **自动更新** | 内置更新检查机制，始终保持最新版本 |
| **双模式切换** | Plan 模式（只读分析）和 Build 模式（代码修改）一键切换 |
| **CLI 集成** | 桌面版内置 CLI 引擎，可同步安装命令行工具 |

桌面版底层仍运行 OpenCode CLI 作为核心引擎，因此功能完全一致，只是提供了更友好的交互方式。
:::

### 下载地址

访问 [OpenCode 官方下载页面](https://opencode.ai/download) 获取最新版本：

| 平台 | 下载方式 |
| :--- | :--- |
| **macOS (Apple Silicon)** | 下载 DMG 安装包 |
| **macOS (Intel)** | 下载 DMG 安装包 |
| **Windows (x64)** | 下载 EXE 安装程序 |
| **Linux (Debian/Ubuntu)** | 下载 .deb 包 |
| **Linux (RHEL/Fedora)** | 下载 .rpm 包 |

### 安装方法

#### macOS

**方式一：Homebrew Cask（推荐）**
```bash
brew install --cask opencode-desktop
```

**方式二：手动安装**
1. 从官网下载对应架构的 DMG 文件
2. 双击打开 DMG 文件
3. 将 OpenCode 图标拖拽到 Applications 文件夹

#### Windows

1. 从官网下载 `opencode-desktop-windows-x64.exe`
2. 双击运行安装程序
3. 按提示完成安装

#### Linux

**Debian/Ubuntu：**
```bash
# 下载 .deb 包后
sudo dpkg -i opencode-desktop_*.deb
sudo apt-get install -f  # 解决依赖问题
```

**RHEL/Fedora：**
```bash
# 下载 .rpm 包后
sudo rpm -i opencode-desktop_*.rpm
```

### 首次配置

安装完成后，首次启动需要进行 API 提供商配置：

#### 方式一：使用 `/connect` 命令（推荐）

1. 启动 OpenCode 桌面应用
2. 在聊天输入框中输入 `/connect`
3. 从列表中选择 AI 提供商（如 Anthropic、OpenAI、Google 等）
4. 输入您的 API 密钥
5. 使用 `/models` 命令选择要使用的模型

:::note[支持的提供商]
OpenCode 支持 75+ LLM 提供商，包括：
- **商业 API**：Anthropic (Claude)、OpenAI (GPT)、Google (Gemini)、DeepSeek、Qwen 等
- **本地模型**：通过 Ollama 运行本地模型
- **现有订阅**：GitHub Copilot、ChatGPT Plus/Pro 订阅可直接使用
:::

#### 方式二：环境变量配置

在系统环境变量中设置 API 密钥：

```bash
# Linux/macOS (添加到 ~/.zshrc 或 ~/.bashrc)
export ANTHROPIC_API_KEY="your-anthropic-key"
export OPENAI_API_KEY="your-openai-key"

# Windows PowerShell
$env:ANTHROPIC_API_KEY = "your-anthropic-key"
```

#### 方式三：配置文件

编辑配置文件 `~/.config/opencode/opencode.json`：

```json
{
  "$schema": "https://opencode.ai/schema.json",
  "model": "claude-sonnet-4-20250514",
  "provider": {
    "anthropic": {
      "options": {
        "apiKey": "{env:ANTHROPIC_API_KEY}"
      }
    }
  }
}
```

### Plan 模式与 Build 模式

OpenCode 提供两种工作模式，可通过 `Tab` 键切换：

| 模式 | 说明 | 适用场景 |
| :--- | :--- | :--- |
| **Plan 模式** | 只读模式，仅分析代码，不做修改 | 理解代码库、制定实施计划、代码审查 |
| **Build 模式** | 完整权限，可修改文件和执行命令 | 功能开发、Bug 修复、重构代码 |

:::tip[最佳实践]
建议先用 Plan 模式分析问题和制定方案，确认无误后切换到 Build 模式执行。这种方式可以避免意外修改，特别适合新手用户。
:::

### 从桌面版安装 CLI

桌面版支持将 CLI 安装到系统，安装后可在终端直接使用 `opencode` 命令：

1. 打开 OpenCode 桌面应用
2. 进入设置或使用命令面板
3. 选择 "Install CLI" 选项

## 🔌 Oh My OpenCode 插件（强烈推荐）

:::tip[为什么推荐安装]
**Oh My OpenCode（OmO）** 是一个多代理编排插件，为 OpenCode 带来 Claude Code 级别的体验。无论你使用 CLI 还是桌面版，都强烈推荐安装此插件。

| 对比项 | 原生 OpenCode | 安装 Oh My OpenCode 后 |
| :--- | :--- | :--- |
| **代理数量** | 2 个（Build、Plan） | 10+ 个专业代理协同工作 |
| **任务处理** | 单一代理处理所有任务 | 按任务类型自动路由到最佳代理 |
| **模型选择** | 手动切换模型 | 自动为每个代理匹配最佳模型 |
| **并行执行** | 串行处理 | 5+ 个后台代理并行工作 |
| **工具支持** | 基础工具 | 内置 LSP、AST-Grep、Tmux、MCP |
| **持久性** | 可能中途放弃 | Todo Enforcer 确保任务完成 |
| **代码质量** | 可能产生 AI 风格代码 | Comment Checker 确保代码自然 |

**简单来说**：原生 OpenCode 像是一个能干的助手，安装 OmO 后则是一个完整的 AI 开发团队。
:::

### 安装方法

#### 前提条件

确保已安装 Node.js 18+ 和包管理器（npm/bun/yarn/pnpm）。

#### 安装命令

```bash
# 推荐：使用 bunx（最快）
bunx oh-my-opencode install

# 或使用 npm
npm install -g oh-my-opencode

# 或使用其他包管理器
bun install -g oh-my-opencode
yarn global add oh-my-opencode
pnpm add -g oh-my-opencode
```

#### 验证安装

```bash
# 检查代理是否加载
opencode agent list

# 应显示类似以下输出：
# sisyphus (primary)
# oracle (primary)
# librarian (primary)
# explore (subagent)
# prometheus (primary)
# ...
```

### 内置代理简介

Oh My OpenCode 提供 10+ 个专业化代理，每个代理针对特定任务优化：

| 代理 | 推荐模型 | 职责 | 适用场景 |
| :--- | :--- | :--- | :--- |
| **Sisyphus** | Claude Opus 4 / Kimi K2.5 | 主编排器，规划任务、委派子任务、驱动完成 | 复杂开发任务、日常编码 |
| **Hephaestus** | GPT-5 Codex | 自主深度工作者，端到端执行无需手把手指导 | 大型功能开发、架构重构 |
| **Prometheus** | Claude Opus 4 / Kimi K2.5 | 战略规划师，采访式需求分析后生成计划 | 复杂多日项目、新功能规划 |
| **Oracle** | GPT-5 | 架构决策、复杂调试、代码审查 | 架构设计、调试失败后求助 |
| **Librarian** | Grok Code Fast | 文档查询、OSS 实现示例搜索 | 查询第三方库文档、找开源实现 |
| **Explore** | Gemini Flash | 代码库模式搜索、结构理解 | 理解新代码库、找代码模式 |
| **Metis** | - | 计划前顾问，分析隐藏意图和失败点 | 复杂任务的范围澄清 |
| **Momus** | - | 计划审查员，检查计划的完整性和清晰度 | 验证生成计划的质量 |
| **Multimodal Looker** | Gemini Flash | 图像、PDF、图表分析 | 截图分析、文档解读 |

### 快速上手

#### 使用 ultrawork 命令

安装后，最简单的使用方式是输入 `ultrawork`（或简写 `ulw`）：

```
ultrawork 实现用户登录功能，包括表单验证和错误处理
```

这会自动：
1. 启动 Sisyphus 作为主编排器
2. 并行委派任务到专业代理
3. 持续工作直到任务完成

#### 使用特定代理

通过 `@` 符号调用特定代理：

```
@oracle 为什么这个异步函数会导致竞态条件？
@librarian 查找 React useEffect 的最佳实践文档
@explore 找到项目中所有使用 Redux 的地方
```

#### 规划模式

对于复杂项目，先用 Prometheus 生成计划：

```
/start-work
```

这会进入采访模式，Prometheus 会询问需求细节，然后生成详细的实施计划。

### 配置文件位置

Oh My OpenCode 配置文件位于：

| 配置类型 | 路径 |
| :--- | :--- |
| **全局配置** | `~/.config/opencode/oh-my-opencode.json` |
| **项目配置** | `.opencode/oh-my-opencode.json` |

### 卸载方法

如需卸载：

```bash
# 移除插件配置
jq '.plugin = [.plugin[] | select(. != "oh-my-opencode")]' \
    ~/.config/opencode/opencode.json > /tmp/oc.json && \
    mv /tmp/oc.json ~/.config/opencode/opencode.json

# 删除配置文件（可选）
rm -f ~/.config/opencode/oh-my-opencode.json
```

## 📋 前提条件

虽然 Claude Code 和 OpenCode 的主程序已支持原生安装且无需 Node.js，但其**插件（如 oh-my-opencode）以及其他基于 npm 的工具**仍依赖 Node.js 环境。

请确保已安装：

- **Node.js**: v18.0.0 或更高版本
- **npm**: 通常随 Node.js 一起安装

:::tip[检查版本]
在终端运行 `node -v` 和 `npm -v` 来确认是否已安装。
:::

## 🐧 Linux / macOS 安装脚本

使用 Bash 脚本一键安装。

1. 创建文件 `install_ai_tools.sh` 并粘贴以下内容：

```bash
#!/bin/bash

# ==========================================
# 配置与颜色定义
# ==========================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# 用于存储最终结果的数组
SUCCESS_LIST=()
FAIL_LIST=()
SKIP_LIST=()

# ==========================================
# 辅助函数
# ==========================================

# 打印带样式的标题
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BOLD}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# 打印信息
log_info() {
    echo -e "${CYAN}➜${NC} $1"
}

# 打印成功
log_success() {
    echo -e "${GREEN}✔ $1${NC}"
}

# 打印警告
log_warn() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# 打印错误
log_error() {
    echo -e "${RED}✖ $1${NC}"
}

# 获取全局包版本的函数 (优化：增加 --depth=0 提升速度)
get_version() {
    local package=$1
    local version=$(npm list -g --depth=0 "$package" 2>/dev/null | grep "$package@" | sed 's/.*@//' | head -n 1)
    if [ -n "$version" ]; then
        echo "$version"
    else
        echo "未安装"
    fi
}

# 安装并显示状态的函数
install_package() {
    local package=$1
    local display_name=$2

    echo -e "\n${BOLD}正在处理: ${CYAN}$display_name${NC} ($package)"

    local before_version=$(get_version "$package")

    # 提示开始安装，不换行
    echo -ne "  状态: ${YELLOW}正在安装/更新...${NC}\r"

    # 执行安装，将标准输出和错误重定向到临时文件以便出错时查看
    local log_file=$(mktemp)
    if npm i -g "$package" > "$log_file" 2>&1; then
        # 安装成功
        local after_version=$(get_version "$package")

        # 清除当前行
        echo -ne "\033[2K\r"

        if [ "$before_version" = "未安装" ]; then
            log_success "安装完成 (版本: $after_version)"
            SUCCESS_LIST+=("$display_name (新安装: $after_version)")
        elif [ "$before_version" = "$after_version" ]; then
            log_success "已是最新 (版本: $after_version)"
            SUCCESS_LIST+=("$display_name (保持不变)")
        else
            log_success "更新成功 ($before_version ➜ $after_version)"
            SUCCESS_LIST+=("$display_name (更新: $after_version)")
        fi
    else
        # 安装失败
        echo -ne "\033[2K\r"
        log_error "安装失败！"
        echo -e "${RED}错误日志如下:${NC}"
        cat "$log_file"
        FAIL_LIST+=("$display_name")
    fi
    rm -f "$log_file"
}

# ==========================================
# 主程序
# ==========================================

# 检查 npm 是否安装
if ! command -v npm &> /dev/null; then
    log_error "未检测到 Node.js/npm 环境，请先安装 Node.js。"
    exit 1
fi

print_header "开始安装 AICoding 相关工具..."

# 工具列表
# 注意：opencode-ai 已移除，推荐使用原生安装，见上方"OpenCode 官方安装"章节
install_package "oh-my-opencode" "oh-my-opencode"
install_package "@iflow-ai/iflow-cli" "iflow-cli"
install_package "@qwen-code/qwen-code" "qwen-code"
install_package "@google/gemini-cli" "gemini-cli"
# 已移除 claude-code
install_package "@openai/codex" "codex"
install_package "happy-coder" "happy-coder"

# 可选包 (保持注释状态)
# install_package "@qoder-ai/qodercli" "qodercli"
# install_package "@tencent-ai/codebuddy-code" "codebuddy-code"

# ==========================================
# 打印汇总报告
# ==========================================
print_header "安装任务汇总"

# 打印成功列表
if [ ${#SUCCESS_LIST[@]} -gt 0 ]; then
    echo -e "${GREEN}成功项:${NC}"
    for item in "${SUCCESS_LIST[@]}"; do
        echo "  • $item"
    done
fi

# 打印失败列表
if [ ${#FAIL_LIST[@]} -gt 0 ]; then
    echo -e "\n${RED}失败项 (请检查网络或权限):${NC}"
    for item in "${FAIL_LIST[@]}"; do
        echo "  • $item"
    done
    exit 1
else
    echo -e "\n${BOLD}${GREEN}所有工具已就绪！Happy Coding! 🚀${NC}"
fi
```

2. 赋予执行权限并运行：

```bash
chmod +x install_ai_tools.sh
./install_ai_tools.sh
```

:::note[权限提示]
如果遇到权限错误（Permission denied），可能需要使用 `sudo ./install_ai_tools.sh` 运行，具体取决于您的 npm 全局安装目录权限设置。
:::

## 🪟 Windows 安装脚本

使用 PowerShell 脚本一键安装。

1. 创建文件 `install_ai_tools.ps1` 并粘贴以下内容：

```powershell
# AICoding Tools Installer Script (Enhanced PowerShell Version)
# Usage: Right-click and select "Run with PowerShell" (Run as Administrator recommended)

# 1. Setup UI and Encoding
$Host.UI.RawUI.WindowTitle = "AICoding Tools Installer"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# 2. Check for Administrator Privileges
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "WARNING: You are not running as Administrator." -ForegroundColor Yellow
    Write-Host "Global installations (npm -g) often require Admin rights."
    Write-Host "If installation fails, please restart this script as Administrator."
    Write-Host "----------------------------------------"
    Start-Sleep -Seconds 2
}

# 3. Check Prerequisites (Node & NPM)
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: 'npm' is not found in your PATH." -ForegroundColor Red
    Write-Host "Please install Node.js first: https://nodejs.org/" -ForegroundColor Red
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    Exit
}

# Define the package list
$packages = @(
    # opencode-ai 已移除，推荐使用原生安装，见上方"OpenCode 官方安装"章节
    @{ Name = "oh-my-opencode";            Display = "oh-my-opencode" },
    @{ Name = "@iflow-ai/iflow-cli";       Display = "iflow-cli" },
    @{ Name = "@qwen-code/qwen-code";      Display = "qwen-code" },
    @{ Name = "@google/gemini-cli";        Display = "gemini-cli" },
    # Removed claude-code
    @{ Name = "@openai/codex";             Display = "codex" },
    @{ Name = "happy-coder";               Display = "happy-coder" }
    # Add more packages here
)

# Initialize report list
$report = @()

# Function to safely get version
function Get-NpmPackageVersion {
    param([string]$PackageName)
    try {
        # --depth=0 is faster; 2>$null suppresses stderr
        $output = npm list -g $PackageName --depth=0 2>$null | Out-String
        $escapedName = [regex]::Escape($PackageName)
        if ($output -match "$escapedName@([a-zA-Z0-9\.\-\+]+)") {
            return $matches[1]
        }
    } catch {
        return "Error"
    }
    return "Not installed"
}

Write-Host "Starting installation process..." -ForegroundColor Cyan
$startTime = Get-Date

# 4. Main Loop with Progress Bar
for ($i = 0; $i -lt $packages.Count; $i++) {
    $pkg = $packages[$i]
    $percent = [int](($i / $packages.Count) * 100)
    
    # Update Windows Progress Bar
    Write-Progress -Activity "Installing AICoding Tools" -Status "Processing $($pkg.Display)..." -PercentComplete $percent -CurrentOperation "$($i+1)/$($packages.Count)"

    $status = "Unknown"
    $currentVer = Get-NpmPackageVersion -PackageName $pkg.Name
    
    # Try to install
    try {
        # Using Start-Process to verify exit code cleanly, or just Invoke-Expression
        # We redirect output to null to keep console clean, but you can remove "| Out-Null" to debug
        npm install -g $pkg.Name | Out-Null
        
        if ($LASTEXITCODE -ne 0) { throw "NPM Exit Code $LASTEXITCODE" }
        
        $newVer = Get-NpmPackageVersion -PackageName $pkg.Name
        
        # Determine status
        if ($currentVer -eq "Not installed") {
            $status = "New Install"
        } elseif ($currentVer -ne $newVer) {
            $status = "Updated"
        } else {
            $status = "Up to date"
        }
    } catch {
        $status = "Failed"
        $newVer = "Error"
        Write-Host "  Error installing $($pkg.Display)" -ForegroundColor Red
    }

    # Add to report object
    $report += [PSCustomObject]@{
        Package       = $pkg.Display
        Status        = $status
        "Old Version" = $currentVer
        "New Version" = $newVer
    }
}

# Complete Progress Bar
Write-Progress -Activity "Installing AICoding Tools" -Completed

# 5. Display Summary Table
Clear-Host
Write-Host "AICoding Tools Installation Report" -ForegroundColor Cyan
Write-Host "----------------------------------"

# Configure table colors based on status
$report | Format-Table -AutoSize | Out-String | ForEach-Object {
    if ($_ -match "Failed") { Write-Host $_ -ForegroundColor Red }
    elseif ($_ -match "New Install") { Write-Host $_ -ForegroundColor Green }
    elseif ($_ -match "Updated") { Write-Host $_ -ForegroundColor Yellow }
    else { Write-Host $_ -ForegroundColor Gray }
}

$duration = (Get-Date) - $startTime
Write-Host "Total time: $($duration.TotalSeconds.ToString("N1")) seconds" -ForegroundColor DarkGray
Write-Host "Done. Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
```

2. 运行方法：
   - 右键点击 `install_ai_tools.ps1` 文件
   - 选择 **"Run with PowerShell"** (建议选择 "以管理员身份运行" 以避免权限问题)

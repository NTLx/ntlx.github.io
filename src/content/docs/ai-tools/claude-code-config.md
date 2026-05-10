---
$schema: starlight
title: Claude Code 自定义配置
description: Claude Code 环境变量、配置文件和插件的详细配置指南
---

安装 Claude Code 后，如果需要使用自定义 API 端点（如公司内部部署或第三方代理），可以通过环境变量和配置文件进行配置。

:::tip[快速安装]
如需安装 Claude Code，请参阅 [AI Coding CLI 工具一键安装](/ai-tools/install-cli-tools)。
:::

## 配置文件位置

配置文件位于用户家目录：

| 平台 | 配置文件路径 |
| :--- | :--- |
| **Linux / macOS / WSL** | `~/.claude/settings.json` |
| **Windows** | `C:\Users\%USERNAME%\.claude\settings.json` |

## 跳过 Anthropic 账号登录

使用自定义 API 时，需要修改 `~/.claude.json` 文件（**注意：不是 `settings.json`**），添加以下配置以跳过 Anthropic 官方账号登录流程：

```json
{
  "hasCompletedOnboarding": true
}
```

:::caution[重要提示]
`~/.claude.json` 和 `~/.claude/settings.json` 是两个不同的文件。`hasCompletedOnboarding` 配置必须放在 `~/.claude.json` 中才能生效。
:::

## 环境变量配置

可以通过环境变量配置自定义 API 和模型参数。以下环境变量均可写入系统环境变量或 `~/.claude/settings.json` 配置文件。

### 基础配置

| 环境变量 | 说明 |
| :--- | :--- |
| `ANTHROPIC_BASE_URL` | 自定义 API 基础 URL（如 `https://your-api.example.com`）**注意：无需添加 `/v1` 等版本后缀** |
| `ANTHROPIC_API_KEY` | 自定义 API 密钥（部分代理服务使用 `ANTHROPIC_AUTH_TOKEN`） |
| `ANTHROPIC_MODEL` | 默认模型名称 |

### 进阶模型配置（可选）

如果需要为不同任务类型使用不同模型，可以配置以下环境变量：

| 环境变量 | 适用场景 |
| :--- | :--- |
| `ANTHROPIC_DEFAULT_OPUS_MODEL` | 复杂推理、架构设计、代码审查等高难度任务 |
| `ANTHROPIC_DEFAULT_SONNET_MODEL` | 代码编写、功能实现、调试修复等日常任务 |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL` | 语法检查、文件搜索、格式化等简单任务 |
| `ANTHROPIC_REASONING_MODEL` | 专门用于复杂推理任务的模型（如数学推导、逻辑分析） |

### 性能与行为调优

| 环境变量 | 说明 | 建议值 |
| :--- | :--- | :--- |
| `BASH_DEFAULT_TIMEOUT_MS` | Bash 命令默认超时时间（毫秒） | `30000` (30秒) |
| `MCP_TIMEOUT` | MCP 工具调用超时时间（毫秒） | `60000` (60秒) |
| `CLAUDE_BASH_NO_LOGIN` | 跳过 Bash 登录 Shell 初始化，加快启动速度 | `1` |

### 隐私与遥测控制

| 环境变量 | 说明 |
| :--- | :--- |
| `DISABLE_TELEMETRY` | 禁用遥测数据收集 |
| `DISABLE_ERROR_REPORTING` | 禁用错误报告上传 |

### 实验性功能

| 环境变量 | 说明 |
| :--- | :--- |
| `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` | 启用实验性的多代理协作功能 |

## 配置优先级

Claude Code 配置的优先级从高到低为：

1. **工作目录配置文件** (`.claude/settings.json` 或 `CLAUDE.md`) - 最高优先级
2. **系统环境变量**
3. **用户目录配置文件** (`~/.claude/settings.json`)

:::tip[多项目配置]
利用优先级机制，可以在不同项目中使用不同的 API 配置或模型，而无需修改全局设置。
:::

## 配置示例

### Linux / macOS (Bash/Zsh)

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

### Linux / macOS (Fish)

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

### Windows (PowerShell)

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

### Windows (CMD)

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

### 使用配置文件

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

## 配置项说明

### 基础设置

| 配置项 | 说明 |
| :--- | :--- |
| `language` | 设置界面语言，设为 `中文` 可获得全中文交互体验。 |
| `terminalProgressBarEnabled` | 是否在终端显示任务进度条，建议开启。 |
| `alwaysThinkingEnabled` | 是否默认启用思考模式（扩展推理），`false` 表示按需手动开启。 |
| `skipDangerousModePermissionPrompt` | 跳过危险操作模式的权限提示，设为 `true` 可减少交互中断。 |

### 权限配置

| 配置项 | 说明 |
| :--- | :--- |
| `permissions.defaultMode` | 默认权限模式。`plan` 表示先规划后执行，适合谨慎操作；`acceptEdits` 表示自动接受编辑操作。 |

### 环境变量（env）

| 配置项 | 说明 |
| :--- | :--- |
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | 上下文自动压缩阈值（百分比）。设为 `75` 表示当上下文占用达到 75% 时触发压缩，优化长会话性能。 |
| `CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS` | 是否禁用实验性 Beta 功能，设为 `1` 可提升稳定性。 |
| `CLAUDE_CODE_DISABLE_FEEDBACK_SURVEY` | 是否禁用反馈调查弹窗，设为 `1` 可减少干扰。 |
| `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` | 是否启用实验性的多代理协作功能，设为 `1` 开启。 |

### 插件配置（enabledPlugins）

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

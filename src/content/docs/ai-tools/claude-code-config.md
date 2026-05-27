---
$schema: starlight
title: Claude Code 自定义配置
description: Claude Code 环境变量、配置文件和插件的详细配置指南
---

安装 Claude Code 后，如果需要使用自定义 API 端点（如公司内部部署或第三方代理），可以通过环境变量和配置文件进行配置。

![Claude Code 配置全览](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-27-claude-code-config-guide-img-00-infographic-core-summary.png)

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
| `CLAUDE_CODE_ATTRIBUTION_HEADER` | 设为 `0` 可移除系统提示中的归属区块（客户端版本和 prompt 指纹）。**使用自定义 API 代理/网关时必须设为 `0`**，否则每次请求的 system prompt 都不同，导致 KV cache 无法命中，推理速度可能下降 90%。直连 Anthropic API 的用户不受影响，不需要设置 |
| `ENABLE_TOOL_SEARCH` | 控制 MCP 工具按需发现（tool search）功能。设为 `true` 始终开启，`false` 关闭（每次加载全部工具定义），`auto:N` 表示当工具定义超过上下文窗口的 N% 时自动触发。**注意**：当 `ANTHROPIC_BASE_URL` 指向非官方 API 时，此功能默认关闭（因为多数代理不转发 `tool_reference` 块）。使用自定义端点的用户需显式设为 `true` 以启用 |

### 进阶模型配置（可选）

如果需要为不同任务类型使用不同模型，可以配置以下环境变量：

| 环境变量 | 适用场景 |
| :--- | :--- |
| `ANTHROPIC_DEFAULT_OPUS_MODEL` | 复杂推理、架构设计、代码审查等高难度任务 |
| `ANTHROPIC_DEFAULT_SONNET_MODEL` | 代码编写、功能实现、调试修复等日常任务 |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL` | 语法检查、文件搜索、格式化等简单任务 |
| `ANTHROPIC_REASONING_MODEL` | 专门用于复杂推理任务的模型（如数学推导、逻辑分析） |

### 性能与行为调优

| 环境变量 | 说明 | 默认值 | 建议值 |
| :--- | :--- | :--- | :--- |
| `BASH_DEFAULT_TIMEOUT_MS` | Bash 命令默认超时时间（毫秒） | `120000` (2 分钟) | `30000` (30 秒) — 对代理/网关用户，过长的默认超时可能导致长时间等待后返回代理层错误而非模型响应，缩短超时可更快暴露问题 |
| `MCP_TIMEOUT` | MCP 服务器启动超时时间（毫秒） | `30000` (30 秒) | `60000` (60 秒) — 部分 MCP 服务器（尤其是远程或容器化部署）冷启动超过 30 秒，放宽可避免启动失败 |
| `CLAUDE_BASH_NO_LOGIN` | 跳过 Bash 登录 Shell 初始化（`.bashrc` / `.zshrc`），减少每个命令的启动延迟 | 未设置（默认运行登录 Shell） | `1` — 除非命令依赖登录 Shell 中的环境变量，否则开启可明显加快命令执行速度 |
| `API_TIMEOUT_MS` | API 请求超时时间（毫秒），控制每次 HTTP 请求的最大等待时间 | `600000` (10 分钟) | `3000000` (50 分钟) — 使用自定义代理/网关时，模型推理可能耗时较长（尤其大上下文或高 effort 级别），延长超时可避免请求被提前截断 |
| `CLAUDE_CODE_EFFORT_LEVEL` | 模型推理深度。值：`low` / `medium` / `high` / `xhigh` / `max` / `auto`。注意：此变量优先级高于 `/effort` 命令和 `effortLevel` 设置项。`max` 不会通过 `settings.json` 持久化，必须设为环境变量 | 模型默认（通常 `high`） | `max` — 对复杂任务要求最高质量的推理输出，但会增加 token 消耗和响应时间 |
| `DISABLE_AUTOUPDATER` | 禁止 Claude Code 后台自动更新检查。设为 `1` 后 `claude update` 和 `claude install` 仍可手动执行。如需完全禁用所有更新路径（含手动），改用 `DISABLE_UPDATES` | 未设置（自动更新开启） | `1` — 通过系统包管理器分发 Claude Code 时，应锁定版本避免自动升级破坏环境 |

### 隐私与遥测控制

Claude Code 默认会向 Anthropic 上报运行指标，用于改进产品。根据 [官方文档](https://code.claude.com/docs/en/data-usage) 和源代码分析，上报的数据包括：用户 ID、会话 ID、应用版本、平台类型、组织 UUID、账户 UUID、启用的功能开关、API 调用负载大小，以及通过正则匹配检测到的用户挫败信号（frustration detection）。**代码内容和文件路径不会上报**。数据在传输和存储时均加密。禁用遥测不会影响任何功能。

| 环境变量 | 说明 |
| :--- | :--- |
| `DISABLE_TELEMETRY` | 禁用遥测数据收集。会同时禁用会话质量调查弹窗（除非通过 `CLAUDE_CODE_ENABLE_FEEDBACK_SURVEY_FOR_OTEL` 重新开启）。对于使用自定义 API 端点、对网络出口敏感或注重隐私的环境，建议开启 |
| `DISABLE_ERROR_REPORTING` | 禁用自动错误报告上传（类似 Sentry 的崩溃报告）。不影响正常功能，但 Anthropic 将无法收到你的错误堆栈信息来修复 bug |
| `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` | **一键关闭所有非必要网络流量**。等效于同时设置 `DISABLE_AUTOUPDATER`、`DISABLE_FEEDBACK_COMMAND`、`DISABLE_ERROR_REPORTING` 和 `DISABLE_TELEMETRY`。适合对网络出口有严格控制的环境，一个变量替代四个 |

### 实验性功能

| 环境变量 | 说明 |
| :--- | :--- |
| `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` | 启用实验性的多代理协作功能 |

## 配置优先级

![配置优先级](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-27-claude-code-config-guide-img-01-config-priority.png)

Claude Code 配置的优先级从高到低为：

1. **工作目录配置文件** (`.claude/settings.json` 或 `CLAUDE.md`) - 最高优先级
2. **系统环境变量**
3. **用户目录配置文件** (`~/.claude/settings.json`)

:::tip[多项目配置]
利用优先级机制，可以在不同项目中使用不同的 API 配置或模型，而无需修改全局设置。
:::

## 模型上下文窗口后缀

Claude Code 的模型 ID 支持在末尾添加 `[<size>]` 后缀来指定上下文窗口大小。例如 `claude-opus-4-7[1m]` 表示请求 Opus 4.7 的 **100 万 token 上下文窗口**（标准窗口为 20 万 token）。

### 为什么要用 1M 上下文

对于自定义 API 用户，选择一个支持大上下文窗口的模型并使用 `[1m]` 后缀可以显著改变工作体验：

| 指标 | 200K 标准窗口 | 1M 大窗口 |
| :--- | :--- | :--- |
| 上下文上限 | ~20 万 token | ~100 万 token |
| 自动压缩频率 | 高（会话约 50-80 轮触发压缩） | 低（Anthropic 实测减少约 15% 压缩事件） |
| 大型代码库分析 | 可能被截断 | 可完整加载 |
| GPU 资源占用 | 标准 | 更高（每会话独占更多显存） |

更大的上下文窗口意味着 Claude 可以同时"记住"更多对话历史、更完整的代码库和更长的工具输出，减少因上下文压缩导致的信息丢失。

### 常见模型后缀示例

| 模型 | 说明 |
| :--- | :--- |
| `qwen3.7-max[1M]` | 通义千问 3.7 Max，100 万 token 上下文 |
| `deepseek-v4-pro[1m]` | DeepSeek V4 Pro，100 万 token 上下文 |
| `mimo-v2.5-pro[1m]` | MiMo V2.5 Pro，100 万 token 上下文 |
| `claude-opus-4-7[1m]` | Claude Opus 4.7，100 万 token 上下文 |

### 注意事项

- **成本**：当上下文超过 20 万 token 后，大窗口模型的推理计算量显著增加，token 消耗和响应时间也会上升
- **模型选择**：并非所有模型都支持 1M 上下文，需要确认你的 API 提供商是否支持指定窗口大小
- **不要滥用**：大窗口应该用于确实需要它的场景（大型代码库分析、长时间会话），简单问题加载全仓库是浪费
- **紧凑仍然是好习惯**：更大的窗口不意味着可以忽略上下文管理——保持会话整洁、及时外部化关键产出仍然是良好的工程实践

![代理用户必设三项](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-27-claude-code-config-guide-img-02-proxy-essentials.png)

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
    "API_TIMEOUT_MS": "3000000",
    "BASH_DEFAULT_TIMEOUT_MS": "30000",
    "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "75",
    "CLAUDE_BASH_NO_LOGIN": "1",
    "CLAUDE_CODE_ATTRIBUTION_HEADER": "0",
    "CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS": "1",
    "CLAUDE_CODE_DISABLE_FEEDBACK_SURVEY": "1",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1",
    "CLAUDE_CODE_EFFORT_LEVEL": "max",
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1",
    "DISABLE_AUTOUPDATER": "1",
    "DISABLE_ERROR_REPORTING": "1",
    "DISABLE_TELEMETRY": "1",
    "ENABLE_TOOL_SEARCH": "true",
    "MCP_TIMEOUT": "60000"
  },
  "attribution": {
    "commit": "",
    "pr": ""
  },
  "permissions": {
    "defaultMode": "plan"
  },
  "skipDangerousModePermissionPrompt": true,
  "enabledPlugins": {
    "claude-code-setup@claude-plugins-official": true,
    "claude-md-management@claude-plugins-official": true,
    "code-review@claude-plugins-official": true,
    "code-simplifier@claude-plugins-official": true,
    "commit-commands@claude-plugins-official": true,
    "explanatory-output-style@claude-plugins-official": true,
    "feature-dev@claude-plugins-official": true,
    "playground@claude-plugins-official": true,
    "pr-review-toolkit@claude-plugins-official": true,
    "pyright-lsp@claude-plugins-official": true,
    "ralph-loop@claude-plugins-official": true,
    "rust-analyzer-lsp@claude-plugins-official": true,
    "security-guidance@claude-plugins-official": true,
    "skill-creator@claude-plugins-official": true,
    "superpowers@claude-plugins-official": true,
    "typescript-lsp@claude-plugins-official": true
  },
  "language": "中文",
  "alwaysThinkingEnabled": false,
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
| `skipDangerousModePermissionPrompt` | 跳过 `--dangerously-skip-permissions` 模式的安全确认提示，设为 `true` 可减少交互中断。**注意**：仅在你理解此模式风险的前提下开启。 |

### Git 归属控制（attribution）

Claude Code 默认在每次 Git 提交和 PR 描述中附加归属信息。提交中会添加 `Co-Authored-By: Claude <noreply@anthropic.com>` 的 [Git trailer](https://git-scm.com/docs/git-interpret-trailers)，PR 描述中会附加 `🤖 Generated with Claude Code` 标记。

| 配置项 | 说明 |
| :--- | :--- |
| `attribution.commit` | Git 提交归属文本（含 trailers）。设为空字符串 `""` 可完全移除提交中的 AI 归属标记 |
| `attribution.pr` | PR 描述归属文本。设为空字符串 `""` 可移除 PR 中的 AI 生成标记 |

`attribution` 优先级高于已废弃的 `includeCoAuthoredBy` 配置。设为空字符串可保持 Git 历史干净，避免每次提交都带有 AI 署名。

> **历史说明**：Claude Code 的默认提交署名（`Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>` 等）在 2025-2026 年间经过多次调整——早期使用 `Claude Code <noreply@anthropic.com>`，后期因品牌策略改为具体模型名。如果你在旧项目中看到不同的署名格式，这是正常的历史遗留。

### 环境变量（env）

| 配置项 | 说明 |
| :--- | :--- |
| `CLAUDE_CODE_ATTRIBUTION_HEADER` | 设为 `0` 可移除系统提示开头嵌入的归属区块（含客户端版本号和 prompt 指纹）。**使用自定义 API 代理或 LLM 网关时必须设为 `0`**：该区块每次请求都不同，会导致中间代理的 KV cache 无法命中，推理速度可能下降高达 90%。直连 Anthropic 官方 API 的用户缓存不受影响，无需设置此变量。 |
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | 上下文自动压缩阈值（百分比）。设为 `75` 表示当上下文占用达到 75% 时触发压缩，优化长会话性能。 |
| `CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS` | 设为 `1` 可从 API 请求中剥离 Anthropic 专有的 `anthropic-beta` 请求头及实验性工具 schema 字段（如 `defer_loading` 和 `eager_input_streaming`），同时保留标准字段（`name`、`input_schema`、`cache_control`）。**使用自定义 API 代理/网关时必须设为 `1`**：多数代理不认识这些 Anthropic 专有头，会直接拒绝请求并报错 `Unexpected value(s) for the anthropic-beta header` 或 `Extra inputs are not permitted`。直连 Anthropic 官方 API 的用户应关闭此设置以使用最新实验功能 |
| `CLAUDE_CODE_DISABLE_FEEDBACK_SURVEY` | 是否禁用"Claude 表现如何？"的会话质量调查弹窗，设为 `1` 可减少频繁询问干扰。 |
| `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` | 是否启用实验性的多代理协作功能，设为 `1` 开启。 |
| `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` | 一键禁用所有非必要网络流量（等效同时设置 `DISABLE_AUTOUPDATER` + `DISABLE_FEEDBACK_COMMAND` + `DISABLE_ERROR_REPORTING` + `DISABLE_TELEMETRY`）。适合网络出口受控的环境 |
| `CLAUDE_CODE_EFFORT_LEVEL` | 模型推理深度控制。设为 `max` 可获得最高质量的推理输出，但 token 消耗和响应时间相应增加。支持的值：`low` / `medium` / `high` / `xhigh` / `max` / `auto`。**注意**：`effortLevel` 设置项无法持久化 `max` 级别（已知 bug），必须通过此环境变量设定 |
| `API_TIMEOUT_MS` | API 请求超时（毫秒）。默认 600000 (10 分钟)。使用代理/网关时模型推理可能耗时较长，设为此值可避免请求被提前截断 |
| `DISABLE_AUTOUPDATER` | 禁止后台自动更新检查，设为 `1` 开启。`claude update` 手动更新仍可用。如需完全禁止所有更新路径，改用 `DISABLE_UPDATES` |
| `ENABLE_TOOL_SEARCH` | 控制 MCP 工具按需发现。设为 `true` 始终开启，`false` 关闭，`auto:N` 按上下文占用百分比触发。**注意**：使用自定义 API 端点时此功能默认关闭，需显式设为 `true` 启用 |
| `DISABLE_TELEMETRY` | 禁用遥测数据收集（详见上方"隐私与遥测控制"），设为 `1` 开启。 |
| `DISABLE_ERROR_REPORTING` | 禁用自动错误报告上传，设为 `1` 开启。 |

### 插件配置（enabledPlugins）

`enabledPlugins` 对象用于管理 Claude Code 插件的启用状态。每个插件的格式为 `插件名@来源`，值为 `true` 表示启用。

:::tip[常用插件推荐]
以下是一些实用的官方插件：

| 插件名称 | 功能说明 |
| :--- | :--- |
| `superpowers` | 增强工作流，提供计划编写、代码审查、TDD、调试等结构化技能 |
| `commit-commands` | Git 提交、推送、创建 PR 的快捷命令 |
| `code-review` | 代码审查工具 |
| `code-simplifier` | 代码简化器——分析最近修改的代码，在**保持功能不变**的前提下优化清晰度、一致性和可维护性 |
| `pr-review-toolkit` | PR 审查工具集，包含代码审查、代码简化、PR 测试分析等多个子代理 |
| `feature-dev` | 引导式功能开发流程：代码理解 → 架构设计 → 实现蓝图 |
| `explanatory-output-style` | 将 Claude 的输出风格切换为"讲解模式"——不只说"做什么"，还解释"为什么这么做"，适合学习和文档化场景 |
| `security-guidance` | 被动安全审计——在编码过程中自动检测安全漏洞（如认证绕过、注入风险等），不增加额外交互 |
| `playground` | 创建交互式 HTML 沙盒——生成带可视化控件的单文件页面，可实时调节参数并导出 prompt |
| `pyright-lsp` | Python 语言服务器——让 Claude Code 获得真实类型检查能力，不再猜测类型 |
| `rust-analyzer-lsp` | Rust 语言服务器——提供 Rust 代码的类型检查和语言智能 |
| `typescript-lsp` | TypeScript 语言服务器——让 Claude Code 获得真实类型感知，显著提升 TS/JS 代码质量 |
| `skill-creator` | 创建和管理自定义技能 |
| `ralph-loop` | 循环执行器——支持在设定间隔重复运行命令或 prompt |
| `claude-code-setup` | 项目初始化和 Claude Code 自动化配置推荐 |
| `claude-md-management` | CLAUDE.md 文件维护和优化 |
:::

:::note[配置文件格式]
配置文件使用 JSON 格式，注意逗号、引号和大括号的正确性。环境变量的值需要用字符串格式（如 `"75"` 而非 `75`）。
:::

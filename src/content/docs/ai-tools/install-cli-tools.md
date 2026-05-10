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

:::tip[自定义配置]
如需配置自定义 API 端点、环境变量或插件，请参阅 [Claude Code 自定义配置](/ai-tools/claude-code-config)。
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

:::tip[Oh My OpenCode 插件]
安装 OpenCode 后，强烈推荐安装 [Oh My OpenCode 插件](/ai-tools/oh-my-opencode)，它能为 OpenCode 带来 10+ 个专业代理协同工作，大幅提升开发效率。
:::

## 🔤 LSP 语言服务器安装（可选）

AI Coding 工具通过 LSP（Language Server Protocol）获得更强的代码理解能力，如类型检查、跳转定义、自动补全等。安装后 Claude Code 和 OpenCode 会自动发现并使用，无需额外配置。

### 速查表

| 语言/格式 | LSP 名称 | 安装方式 | 更新方式 |
| :--- | :--- | :--- | :--- |
| **Python** | basedpyright | uv | `uv tool upgrade basedpyright` |
| **TypeScript** | typescript-language-server | npm | `npm outdated -g` 后重装 |
| **Rust** | rust-analyzer | rustup | `rustup update` |
| **Bash/Shell** | bash-language-server | bun/npm | `bun update -g` |
| **Perl** | Perl::LanguageServer | cpanm | `cpanm Perl::LanguageServer` |
| **SQL** | sql-language-server | bun/npm | `bun update -g` |
| **Dockerfile** | dockerfile-language-server-nodejs | bun/npm | `bun update -g` |
| **YAML** | yaml-language-server | bun/npm | `bun update -g` |
| **JSON/JSONC** | vscode-json-languageservice | bun/npm | `bun update -g` |
| **HTML** | vscode-html-languageservice | bun/npm | `bun update -g` |
| **CSS/SCSS/Less** | vscode-css-languageservice | bun/npm | `bun update -g` |
| **ESLint** | vscode-eslint-language-service | bun/npm | `bun update -g` |
| **TOML** | taplo-cli | bun/npm | `bun update -g` |
| **Markdown** | @volar/language-server | bun/npm | `bun update -g` |

### 逐语言安装

#### Python — basedpyright

```bash
uv tool install basedpyright
```

#### TypeScript — typescript-language-server

```bash
npm i -g typescript-language-server typescript
```

#### Rust — rust-analyzer

```bash
rustup component add rust-analyzer  # 语言服务器
rustup component add rust-src       # 标准库源码（必须）
rustup component add clippy rustfmt # 代码检查和格式化（推荐）
```

#### Bash/Shell — bash-language-server

```bash
bun add -g bash-language-server
```

支持 bash、zsh、fish 等多种 Shell，提供智能补全、语法检查和代码导航。

#### Perl — Perl::LanguageServer

```bash
brew install cpanminus   # 先安装 cpanm（如果没有）
cpanm Perl::LanguageServer
```

:::caution[注意]
Perl LSP **不能用 Bun/npm 安装**，必须使用 Perl 官方包管理器 cpanm。首次安装可能需要几分钟编译依赖。
:::

#### SQL — sql-language-server

```bash
bun add -g sql-language-server
```

支持 MySQL、PostgreSQL、SQLite、SQL Server 等主流数据库，可连接实际数据库进行 schema 分析。

#### Dockerfile — dockerfile-language-server-nodejs

```bash
bun add -g dockerfile-language-server-nodejs
```

Docker 官方维护，同时支持 Dockerfile 和 docker-compose.yml。

#### YAML — yaml-language-server

```bash
bun add -g yaml-language-server
```

Red Hat 官方维护，内置 Kubernetes、Docker Compose、GitHub Actions 等数百种 Schema。

#### JSON/JSONC — vscode-json-languageservice

```bash
bun add -g vscode-json-languageservice
```

VS Code 官方 JSON 语言服务器，支持带注释的 JSON（JSONC）。

#### HTML / CSS / ESLint

```bash
bun add -g vscode-html-languageservice vscode-css-languageservice vscode-eslint-language-service
```

VS Code 官方语言服务器套件，覆盖 HTML、CSS、SCSS、Less 和 ESLint 集成。

#### TOML — taplo-cli

```bash
bun add -g taplo-cli
```

Rust 编写，性能极佳，完美支持 Cargo.toml、pyproject.toml 等常用格式。

#### Markdown — @volar/language-server

```bash
bun add -g @volar/language-server
```

Volar 团队维护，支持表格格式化、代码块语法高亮和链接检查。

:::tip[为什么推荐安装]
安装 LSP 后，Claude Code 和 OpenCode 在分析代码时能获取更精确的类型信息和符号定义，减少猜测，提升代码生成质量。
:::

### 一键安装脚本

将以下脚本保存为 `install_lsp.sh`，一键安装所有 LSP：

```bash
#!/bin/bash
echo "开始安装所有推荐的 LSP..."

# 用 Bun 安装的 LSP
bun add -g \
  bash-language-server \
  sql-language-server \
  dockerfile-language-server-nodejs \
  yaml-language-server \
  vscode-json-languageservice \
  vscode-html-languageservice \
  vscode-css-languageservice \
  vscode-eslint-language-service \
  taplo-cli \
  @volar/language-server

# Perl LSP（必须用 cpanm）
if ! command -v cpanm &> /dev/null; then
  brew install cpanminus
fi
cpanm Perl::LanguageServer

echo "所有 LSP 安装完成！请重启 Claude Code/OpenCode 以生效。"
```

### 更新所有 LSP

```bash
# Bun 管理的 LSP（批量更新）
bun update -g

# Perl
cpanm Perl::LanguageServer

# Python
uv tool upgrade basedpyright

# TypeScript — 查看过时包后重新安装
npm outdated -g
npm i -g typescript-language-server typescript

# Rust
rustup update
```

:::note[注意事项]
- 安装或更新后，建议**重启 Claude Code/OpenCode** 以确保生效
- Python、Rust、Perl 有各自的官方包管理器，**不要用 Bun/npm 安装**
- 如使用 npm 而非 Bun，将上述 `bun add -g` 替换为 `npm i -g`，`bun update -g` 替换为 `npm update -g`
:::

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

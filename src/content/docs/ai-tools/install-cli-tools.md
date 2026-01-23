---
title: AI Coding CLI 工具一键安装
description: 常用 AI 辅助编程命令行工具的一键安装脚本，支持 Linux、macOS 和 Windows。
---

本文档提供了常用 AI 辅助编程 CLI 工具的批量安装脚本，帮助开发者快速搭建智能编程环境。

## 🛠️ 包含工具列表

脚本将自动安装/更新以下基于 Node.js 的 CLI 工具：

| 工具名称 | 包名 | 说明 |
| :--- | :--- | :--- |
| **[Claude Code](https://docs.anthropic.com/en/docs/claude-code)** | `@anthropic-ai/claude-code` | Anthropic 官方推出的 AI 编程代理工具，直接在终端中运行，支持代码库理解和日常任务自动化。 |
| **[OpenCode](https://opencode.ai)** | `opencode-ai` | OpenCode 的官方 Node.js 安装程序，一个开源的终端 AI 编程代理。 |
| **[Oh My OpenCode](https://ohmy.opencode.ai)** | `oh-my-opencode` | OpenCode 的增强插件包，提供多代理编排（如 Sisyphus 代理）、并行处理和增强功能。 |
| **[iFlow CLI](https://github.com/iflow-ai/iflow-cli)** | `@iflow-ai/iflow-cli` | 终端 AI 助手，专注于代码分析、任务自动化和自然语言交互，支持 ACP 协议。 |
| **[Qwen Code](https://github.com/QwenLM/qwen-code)** | `@qwen-code/qwen-code` | 基于 Qwen3-Coder 模型优化的开源终端 AI 代理，支持大规模代码库理解和编辑。 |
| **[Gemini CLI](https://github.com/google-gemini/gemini-cli)** | `@google/gemini-cli` | Google 官方开源 AI 代理，将 Gemini 模型能力带入终端，提供免费层级（60次/分钟）。 |
| **[Codex](https://github.com/openai/codex)** | `@openai/codex` | OpenAI 推出的命令行编码代理，支持读取、编辑、运行代码及修复 Bug。 |
| **[Happy Coder](https://happy.engineering)** | `happy-coder` | Claude Code 和 Codex 的开源移动端/Web端客户端，支持端到端加密远程控制。 |
| **[Qoder CLI](https://qoder.com)** (可选) | `@qoder-ai/qodercli` | Qoder AI 平台的命令行接口，支持多模型和 IDE 集成。 |
| **[CodeBuddy](https://codebuddy.tencent.com)** (可选) | `@tencent-ai/codebuddy-code` | 腾讯云推出的 AI 编程助手，基于混元大模型，提供代码补全和诊断。 |

## 📋 前提条件

所有工具均依赖 Node.js 环境。请确保已安装：

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
install_package "opencode-ai" "opencode-ai"
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
    @{ Name = "opencode-ai";               Display = "opencode-ai" },
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

`AICoding.sh`:

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
install_package "@anthropic-ai/claude-code" "claude-code"
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

`AICoding.ps1`:

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
    @{ Name = "@anthropic-ai/claude-code"; Display = "claude-code" },
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
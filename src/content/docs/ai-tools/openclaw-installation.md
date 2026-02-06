---
title: OpenClaw Installation
description: OpenClaw AI 智能体平台的部署与环境配置完整指南
---

:::tip[说明]
OpenClaw 是一个强大的 AI 智能体平台。本指南将引导你在 Linux 环境下完成从系统准备到功能配置的全过程。
:::

## 1. 预备工作

在开始安装之前，请确保你的系统环境满足基本要求。

### 1.1 系统工具准备

推荐安装以下基础工具以确保最佳体验：

- **tmux**: 终端复用工具，保持会话后台运行
- **ncdu**: 磁盘空间占用分析
- **btop**: 系统资源监控
- **jq**: 命令行 JSON 处理工具

```bash
# Ubuntu/Debian
sudo apt update && sudo apt install -y tmux ncdu btop jq

# CentOS/RHEL
sudo yum install -y tmux ncdu btop jq
```

### 1.2 用户权限管理

:::caution[安全警告]
**不要使用 root 用户运行 OpenClaw。**
直接使用 root 运行可能会导致文件权限混乱，且存在安全风险。
:::

如果你当前是 root 用户，请创建一个专用的普通用户：

```bash
# 1. 创建用户 (将 your_username 替换为你想要的用户名)
useradd -m -s /bin/bash -u 1000 your_username

# 2. 赋予 sudo 权限
usermod -aG sudo your_username

# 3. 设置密码
passwd your_username

# 4. 切换到新用户
su - your_username
```

## 2. 核心安装

### 2.1 安装 Homebrew

OpenClaw 依赖 Homebrew 来管理部分软件包。

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

根据屏幕提示将 brew 添加到环境变量（通常需要运行安装结束后显示的几行命令）。

### 2.2 安装依赖工具（可选）

GitHub CLI (`gh`) 和 Ripgrep (`rg`) 是某些插件（如钉钉连接器）可能需要的依赖工具。

:::note
**安装时机说明**
- 这两个工具**不是**安装 OpenClaw 的前置条件。
- 你可以选择现在安装，也可以等日后安装插件时遇到依赖缺失提示再安装。
:::

```bash
brew install gh rg
```

### 2.3 安装 OpenClaw

**方式一：官方一键安装（推荐）**

运行官方一键安装脚本：

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

:::note
脚本会自动尝试从源码安装 Node.js。如果你习惯使用 `nvm`，也可以预先使用 `nvm` 安装好 Node.js 环境。
:::

**方式二：使用 nvm 安装 Node.js（可选）**

如果你更习惯使用 `nvm` 管理 Node.js 版本，可以在运行官方安装脚本前先安装 `nvm`：

```bash
# 1. 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash

# 2. 重新加载 shell 配置（或重新打开终端）
source ~/.bashrc  # 或 source ~/.zshrc

# 3. 安装 Node.js 22
nvm install 22
```

## 3. 环境配置

### 3.1 配置环境变量

如果安装后发现 `openclaw` 或 `node` 命令无法使用，可能是因为环境变量未生效。

**临时生效（当前终端）：**

```bash
export PATH="/home/lx/.npm-global/bin:/home/linuxbrew/.linuxbrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
```

**永久生效：**

将上述 export 命令添加到你的 shell 配置文件中（如 `~/.bashrc` 或 `~/.zshrc`）：

```bash
echo 'export PATH="/home/lx/.npm-global/bin:/home/linuxbrew/.linuxbrew/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### 3.2 验证安装

检查版本以确认安装成功：

```bash
node -v
npm -v
```

## 4. 功能扩展

### 4.1 集成钉钉通知 (推荐)

`DingTalk OpenClaw Connector` 是博主目前最推荐的 IM 集成方式。通过该插件，你可以将 OpenClaw 的能力无缝接入钉钉，实现高效的移动端交互。

- 请访问 [DingTalk OpenClaw Connector 官方项目主页](https://github.com/DingTalk-Real-AI/dingtalk-moltbot-connector) 获取详细的安装步骤与配置说明。

### 4.2 安装常用技能

为了让 OpenClaw 具备完整的编程与自动化能力，请在与 OpenClaw 的对话中直接发送以下指令，让 AI 为你安装这些官方技能：

> "请帮我安装以下技能：tmux, context7, n8n, n8n-workflow-automation, tavily-search, clawddocs, coding-agent, self-improving-agent, humanizer, auto-updater, marketing-mode, opencode-acp-control"

或者你可以根据需要逐个安装。这些技能将大大增强智能体的能力。

## 5. 故障排除

### 常见问题

**Q: 找不到 `node` 命令？**
A: 请检查 `3.1` 节中的环境变量配置。确保 Node.js 的 bin 目录在你的 `$PATH` 中。

**Q: 安装脚本下载失败？**
A: 请检查网络连接，或尝试配置终端代理。

```bash
export http_proxy=http://127.0.0.1:7890
export https_proxy=http://127.0.0.1:7890
```

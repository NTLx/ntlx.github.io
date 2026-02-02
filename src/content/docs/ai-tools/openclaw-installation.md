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

### 2.2 安装依赖工具

使用 Homebrew 安装 GitHub CLI (`gh`) 和 Ripgrep (`rg`)：

```bash
brew install gh rg
```

### 2.3 安装 OpenClaw

运行官方一键安装脚本：

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

:::note
脚本会自动尝试从源码安装 Node.js。如果你习惯使用 `nvm`，也可以预先使用 `nvm` 安装好 Node.js 环境。
:::

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

### 4.1 集成飞书通知

OpenClaw 支持飞书 (Feishu) 消息推送。

- 请访问 [第三方项目主页](https://github.com/m1heng/clawdbot-feishu) 查看详细的 Channel 安装与配置说明。

### 4.2 安装常用技能

为了让 OpenClaw 具备完整的编程与自动化能力，建议安装以下官方技能集：

```bash
# 核心开发与自动化技能
openclaw install \
  tmux \
  context7 \
  n8n \
  n8n-workflow-automation \
  tavily-search \
  clawddocs \
  coding-agent \
  self-improving-agent \
  humanizer \
  auto-updater \
  marketing-mode \
  opencode-acp-control
```

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

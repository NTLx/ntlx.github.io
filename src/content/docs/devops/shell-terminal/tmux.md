---
title: Tmux 终端复用器使用指南
description: Tmux 安装、配置、快捷键和实用技巧，提升终端工作效率
---

![Tmux Demo](https://cloud.githubusercontent.com/assets/553208/19740585/85596a5a-9bbf-11e6-8aa1-7c8d9829c008.gif)

Tmux 是一个强大的终端复用器，允许在一个终端窗口中创建多个会话、窗口和面板，特别适合远程服务器管理和长时间运行的任务。

本文推荐使用 [Oh My Tmux!](https://github.com/gpakosz/.tmux) 配置，提供强大且用户友好的 Tmux 体验。

## Tmux 核心概念

- **Session（会话）**：一组窗口的集合，可以保存和恢复
- **Window（窗口）**：一个全屏视图，包含多个面板
- **Pane（面板）**：窗口中的一个分割区域

## 安装 Tmux

### Linux / macOS

安装 Oh My Tmux 配置：

```bash
cd
git clone https://github.com/gpakosz/.tmux.git
ln -s -f .tmux/.tmux.conf
cp .tmux/.tmux.conf.local .
```

### Windows (WSL)

Tmux 运行在 Linux 上，Windows 需要使用 WSL（Windows Subsystem for Linux）。

1. **安装 WSL**（如果未安装）：
   
   以管理员身份打开 PowerShell 并运行：
   
   ```powershell
   wsl --install
   ```
   
   这将默认安装 Ubuntu。如果提示，请重启计算机。

2. **在 WSL 中安装 Tmux**：
   
   打开 WSL 终端并运行：
   
   ```bash
   sudo apt update
   sudo apt install tmux
   ```

3. **安装 Oh My Tmux**（可选但推荐）：
   
   ```bash
   cd
   git clone https://github.com/gpakosz/.tmux.git
   ln -s -f .tmux/.tmux.conf
   cp .tmux/.tmux.conf.local .
   ```

:::tip[剪贴板集成]
在 WSL 中使用 Tmux 时，可能需要额外配置才能与 Windows 剪贴板集成。可以使用 `clip.exe` 命令或安装 `wsl-clipboard` 等工具。
:::

### Linux / macOS

To install this configuration:

```bash
cd
git clone https://github.com/gpakosz/.tmux.git
ln -s -f .tmux/.tmux.conf
cp .tmux/.tmux.conf.local .
```

### Windows (WSL)

Tmux runs natively on Linux, so on Windows you need to use **WSL (Windows Subsystem for Linux)**.

1.  **Install WSL** (if not already installed):

    Open PowerShell as Administrator and run:

    ```powershell
    wsl --install
    ```

    This installs Ubuntu by default. Restart your computer if prompted.

2.  **Install Tmux inside WSL**:

    Open the WSL terminal and run:

    ```bash
    sudo apt update
    sudo apt install tmux
    ```

3.  **Install Oh My Tmux** (optional but recommended):

    ```bash
    cd
    git clone https://github.com/gpakosz/.tmux.git
    ln -s -f .tmux/.tmux.conf
    cp .tmux/.tmux.conf.local .
    ```

:::tip[剪贴板集成]
在 WSL 中使用 Tmux 时，可能需要额外配置才能与 Windows 剪贴板集成。可以使用 `clip.exe` 命令或安装 `wsl-clipboard` 等工具。
:::

## 配置 Tmux

配置文件分为两个文件：
- `~/.tmux.conf`：主配置文件（请勿直接编辑）
- `~/.tmux.conf.local`：本地自定义配置（在此文件中编辑）

### 推荐自定义配置

在 `~/.tmux.conf.local` 中添加以下配置以提高可用性：

```bash
# 增加历史记录大小
set -g history-limit 50000

# 将前缀键更改为反引号 (`)
unbind C-b
set -g prefix `
bind ` send-prefix

# 将状态栏移到顶部
set -g status-position top

# 启用鼠标模式（可选）
set -g mouse on

# 启用 vi 模式进行复制
set -g mode-keys vi

# 设置默认终端颜色
set -g default-terminal "screen-256color"
```

## 快捷键参考

以下是一些常用快捷键（假设使用默认前缀 `C-b` 或自定义前缀）：

### 窗口管理

| 快捷键 | 功能 |
| :--- | :--- |
| `Prefix + c` | 创建新窗口 |
| `Prefix + n` | 下一个窗口 |
| `Prefix + p` | 上一个窗口 |
| `Prefix + 0-9` | 切换到指定窗口 |
| `Prefix + ,` | 重命名当前窗口 |

### 面板管理

| 快捷键 | 功能 |
| :--- | :--- |
| `Prefix + %` | 垂直分割窗口 |
| `Prefix + "` | 水平分割窗口 |
| `Prefix + →/←/↑/↓` | 在面板间导航 |
| `Prefix + z` | 切换面板全屏 |
| `Prefix + x` | 关闭当前面板 |
| `Prefix + Space` | 循环切换面板布局 |

### 会话管理

| 快捷键 | 功能 |
| :--- | :--- |
| `Prefix + d` | 分离当前会话 |
| `Prefix + s` | 显示会话列表 |
| `Prefix + $` | 重命名当前会话 |
| `Prefix + (` / `)` | 切换上一个/下一个会话 |

### 其他常用快捷键

| 快捷键 | 功能 |
| :--- | :--- |
| `Prefix + r` | 重新加载配置文件 |
| `Prefix + ?` | 显示快捷键帮助 |
| `Prefix + [` | 进入复制模式 |
| `Prefix + ]` | 粘贴剪贴板内容 |
| `Prefix + :` | 进入命令模式 |

## 实用技巧

### 1. 保存和恢复会话

使用插件 `tmux-resurrect` 可以保存和恢复会话：

```bash
# 安装插件（在 .tmux.conf.local 中添加）
set -g @plugin 'tmux-plugins/tmux-resurrect'
set -g @plugin 'tmux-plugins/tmux-continuum'

# 保存会话：Prefix + Ctrl+s
# 恢复会话：Prefix + Ctrl+r
```

### 2. 系统剪贴板集成

配置系统剪贴板集成：

```bash
# Linux (需要 xclip)
bind -T copy-mode-vi y send-keys -X copy-pipe-and-cancel 'xclip -in -selection clipboard'

# macOS (需要 reattach-to-user-namespace)
set -g @plugin 'tmux-plugins/tmux-yank'
```

### 3. 面板同步

在多个面板中同步输入：

```bash
# 启用/禁用面板同步
Prefix + :set synchronize-panes
```

### 4. 远程服务器管理

Tmux 特别适合远程服务器管理：

```bash
# 在服务器上启动 Tmux
tmux new -s mysession

# 分离会话（保持运行）
Prefix + d

# 重新连接会话
tmux attach -t mysession
```

## 常见问题

### 1. 鼠标滚动不工作

确保鼠标模式已启用：
```bash
set -g mouse on
```

### 2. 颜色显示不正确

设置正确的终端类型：
```bash
set -g default-terminal "screen-256color"
```

### 3. 复制粘贴不工作

确保安装了必要的插件并配置了剪贴板集成。

## 参考资料

- [Oh My Tmux! 官方仓库](https://github.com/gpakosz/.tmux)
- [Tmux 官方手册](https://man.openbsd.org/tmux)
- [Tmux 实用指南](https://pragprog.com/titles/bhtmux2/tmux-2/)

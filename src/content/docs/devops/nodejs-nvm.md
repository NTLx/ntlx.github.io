---
title: 使用 nvm 安装 Node.js
description: Windows 11 使用 nvm-windows 安装和管理 Node.js 环境
---

# Windows 11 使用 nvm 安装最新稳定版 Node.js 详细指南

本教程将指导你在 Windows 11 系统下，安装 `nvm-windows` (Node Version Manager)，并使用它来配置最新的长期支持版 (LTS) Node.js 开发环境。

## 1. 为什么使用 nvm？

使用 nvm 的主要优势是允许你在同一台电脑上安装和切换多个版本的 Node.js，这对于同时维护旧项目（可能需要旧版 Node）和开发新项目（使用最新版 Node）非常有用。

## 2. 准备工作：清理旧环境

> **重要提示**：在安装 `nvm` 之前，必须彻底卸载电脑上现有的 Node.js 版本，否则会产生冲突。

1. 打开 **设置** -> **应用** -> **安装的应用**，搜索 "Node.js" 并卸载。
2. 检查并删除以下文件夹（如果存在）：
   - `C:\Program Files\nodejs`
   - `C:\Program Files (x86)\nodejs`
   - `C:\Users\<你的用户名>\AppData\Roaming\npm`
   - `C:\Users\<你的用户名>\AppData\Roaming\npm-cache`

## 3. 下载并安装 nvm-windows

Windows 系统的 nvm 与 macOS/Linux 不同，使用的是 `nvm-windows`。

1. 访问 GitHub 发布页：[nvm-windows Releases](https://github.com/coreybutler/nvm-windows/releases)
2. 下载最新版本的 **`nvm-setup.exe`**。
3. 双击运行安装包：
   - **Select NVM installation path**: 建议保持默认或设为 `C:\nvm`。
   - **Select Node.js symlink**: 建议保持默认 `C:\Program Files\nodejs`（nvm 会自动管理这个快捷方式）。
4. 安装完成后，打开一个新的 PowerShell 或命令提示符（CMD）窗口进行验证。

```powershell
# 验证 nvm 是否安装成功
nvm version

# 如果显示版本号（例如 1.1.12），则说明安装成功
```

## 4. 配置国内镜像源 (推荐)

在国内网络环境下，下载 Node.js 安装包可能会很慢。建议将 nvm 的下载源设置为国内镜像。

请在 **管理员模式** 下打开 PowerShell 或 CMD，运行以下命令：

```powershell
# 设置 node 镜像源
nvm node_mirror https://npmmirror.com/mirrors/node/

# 设置 npm 镜像源
nvm npm_mirror https://npmmirror.com/mirrors/npm/
```

## 5. 安装最新稳定版 (LTS) Node.js

Node.js 分为 **LTS (长期支持版)** 和 **Current (最新尝鲜版)**。开发环境通常推荐使用 **LTS** 版本以保证稳定性。

### 5.1 查看可用的版本

```powershell
nvm list available
```

输出列表中 `LTS` 列下的版本即为稳定版。

### 5.2 安装最新的 LTS 版本

你可以直接指定版本号安装，也可以使用 `lts` 别名（注意：部分旧版 nvm-windows 可能不支持 `lts` 别名，建议直接输入版本号，例如 `22.11.0`）。

```powershell
# 方法 A：直接安装最新的 LTS 版本
nvm install lts

# 方法 B：指定具体的 LTS 版本号 (推荐，更精准)
# 例如，如果 list available 显示最新 LTS 是 22.11.0
nvm install 22.11.0
```

## 6. 激活并验证环境

安装完成后，必须手动"使用"该版本，Node 环境才会生效。

### 6.1 激活版本

```powershell
# 查看已安装的版本
nvm list

# 切换/使用指定版本 (请替换为你刚才安装的版本号)
nvm use 22.11.0
```

> 如果系统提示拒绝访问 (Access Denied)，请务必以**管理员身份**运行 PowerShell。

### 6.2 验证环境

```powershell
# 检查 Node 版本
node -v

# 检查 npm 版本
npm -v
```

## 7. 配置 npm 全局设置

为了加速后续依赖包的下载，建议将 npm 的默认仓库也指向国内镜像。

```powershell
# 1. 设置 npm 淘宝/阿里云镜像
npm config set registry https://registry.npmmirror.com/

# 2. 验证镜像是否配置成功
npm config get registry
# 输出应为: https://registry.npmmirror.com/
```

## 8. 测试开发环境 (可选)

我们可以安装一个常用的包管理器 `yarn` 来测试环境是否完全正常。

```powershell
# 全局安装 yarn
npm install -g yarn

# 验证 yarn 安装
yarn --version
```

## 9. 常用 nvm 命令速查表

| 命令 | 说明 |
| :--- | :--- |
| `nvm list available` | 查看网络上可安装的 Node 版本 |
| `nvm list` | 查看本地已安装的 Node 版本 |
| `nvm install <version>` | 安装指定版本 (如 `nvm install 20.10.0`) |
| `nvm uninstall <version>` | 卸载指定版本 |
| `nvm use <version>` | 切换到指定版本 |
| `nvm on` | 开启 Node.js 版本管理 |
| `nvm off` | 关闭 Node.js 版本管理 |
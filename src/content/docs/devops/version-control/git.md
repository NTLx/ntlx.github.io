---
title: Git 配置与使用技巧
description: Git 全局配置、SSH 密钥设置、代理配置、提交历史修改等实用技巧，适用于 Linux、macOS 和 Windows 平台
---

本文介绍 Git 的常用配置和实用技巧，包括 SSH 密钥生成、用户身份设置、代理配置以及提交历史修改等内容。

## SSH 密钥配置

### 生成 SSH 密钥

SSH 密钥用于安全地连接到 Git 仓库（如 GitHub、GitLab）。以下是生成 RSA 4096 位密钥的步骤：

#### Linux / macOS

```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

#### Windows (PowerShell)

```powershell
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

密钥默认保存在 `C:\Users\<YourUsername>\.ssh\id_rsa`（Windows）或 `~/.ssh/id_rsa`（Linux/macOS）。

:::tip[Windows SSH 密钥位置]
在 Windows 上，SSH 密钥默认存储在 `C:\Users\<用户名>\.ssh\` 目录。可以使用以下命令查看公钥：

```powershell
Get-Content $env:USERPROFILE\.ssh\id_rsa.pub
```
:::

### 配置 Git 用户身份

设置全局用户名和邮箱，用于提交记录：

```bash
git config --global user.name "Your Name"
git config --global user.email "your_email@example.com"
```

Generate a new SSH key (RSA 4096-bit):

#### Linux / macOS

```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

#### Windows (PowerShell)

```powershell
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

The key will be saved to `C:\Users\<YourUsername>\.ssh\id_rsa` by default.

:::tip[Windows SSH Key 位置]
在 Windows 上，SSH 密钥默认存储在 `C:\Users\<用户名>\.ssh\` 目录。可以使用 `Get-Content $env:USERPROFILE\.ssh\id_rsa.pub` 查看公钥。
:::

### User Identity

Set your global username and email:

#### Linux / macOS / Windows (Git Bash / PowerShell)

```bash
git config --global user.name "Your Name"
git config --global user.email "your_email@example.com"
```

## Git 代理配置

当需要通过代理访问 Git 仓库时，可以配置 Git 使用 HTTP 代理：

### 设置代理

#### Linux / macOS

```bash
git config --global http.proxy http://127.0.0.1:8888
git config --global https.proxy http://127.0.0.1:8888
```

#### Windows (PowerShell)

```powershell
git config --global http.proxy http://127.0.0.1:8888
git config --global https.proxy http://127.0.0.1:8888
```

### 取消代理设置

```bash
git config --global --unset http.proxy
git config --global --unset https.proxy
```

## Windows 特定配置

Windows 用户推荐以下配置：

```powershell
# 自动处理行结束符（推荐）
git config --global core.autocrlf true

# 使用 Windows 凭据管理器进行身份验证
git config --global credential.helper manager

# 设置默认分支名称为 'main'
git config --global init.defaultBranch main
```

## 修改提交历史

:::caution[警告]
重写历史是破坏性操作。执行前请确保有备份。`git filter-branch` 已被弃用，建议使用 [git-filter-repo](https://github.com/newren/git-filter-repo) 以获得更好的性能和安全性。
:::

### 修改所有提交的作者信息

```bash
git filter-branch --env-filter 'export GIT_AUTHOR_EMAIL=new_email@example.com' --
```

### 修改特定作者信息

将 `Old@Email`、`Changed Name` 和 `Changed@Email` 替换为实际值：

```bash
git filter-branch -f --env-filter '
OLD_EMAIL="Old@Email"
CORRECT_NAME="Changed Name"
CORRECT_EMAIL="Changed@Email"

if [ "$GIT_COMMITTER_EMAIL" = "$OLD_EMAIL" ]
then
    export GIT_COMMITTER_NAME="$CORRECT_NAME"
    export GIT_COMMITTER_EMAIL="$CORRECT_EMAIL"
fi
if [ "$GIT_AUTHOR_EMAIL" = "$OLD_EMAIL" ]
then
    export GIT_AUTHOR_NAME="$CORRECT_NAME"
    export GIT_AUTHOR_EMAIL="$CORRECT_EMAIL"
fi
' --tag-name-filter cat -- --branches --tags
```

## 日志查询技巧

### 按作者过滤日志

```bash
git log --author="Author Name"
```

### 其他常用日志命令

```bash
# 显示简洁日志
git log --oneline

# 显示图形化分支历史
git log --graph --oneline --all

# 显示最近 10 条提交
git log -10

# 显示指定文件的修改历史
git log --follow filename
```

## 实用技巧

### GitHub 文件历史可视化

将 GitHub 文件 URL 中的 `.com` 替换为 `.githistory.xyz` 可以查看文件的可视化历史：

```
# 原始 URL
https://github.com/user/repo/blob/main/file.js

# 可视化历史 URL
https://githistory.xyz/user/repo/blob/main/file.js
```

### 其他建议

- **提交规范**：使用[约定式提交](https://www.conventionalcommits.org/)规范提交信息
- **分支策略**：采用 Git Flow 或 GitHub Flow 等分支管理策略
- **代码审查**：使用 Pull Request 进行代码审查和协作

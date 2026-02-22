---
title: Git 配置与技巧
description: Git 配置、代理设置、提交历史修���等实用技巧
---

## 1. Configuration

### SSH Key Generation

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

### Proxy Settings

Configure Git to use a proxy (e.g., HTTP proxy at 127.0.0.1:8888):

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

To unset:

```bash
git config --global --unset http.proxy
git config --global --unset https.proxy
```

### Windows-Specific Configuration

Additional settings recommended for Windows users:

```powershell
# Configure line ending handling (recommended)
git config --global core.autocrlf true

# Use Windows credential manager for authentication
git config --global credential.helper manager

# Set default branch name to 'main'
git config --global init.defaultBranch main
```

## 2. Modify Commit History

:::warning
Rewriting history is destructive. Ensure you have a backup before proceeding. `git filter-branch` is deprecated; consider using [git-filter-repo](https://github.com/newren/git-filter-repo) for better performance and safety.
:::

### Change Author Info (All Commits)

```bash
git filter-branch --env-filter 'export GIT_AUTHOR_EMAIL=new_email@example.com' --
```

### Change Specific Author Info

Replace `Old@Email`, `Changed Name`, and `Changed@Email` with actual values.

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

## 3. Logs

### Filter by Author

```bash
git log --author="Author Name"
```

## 4. Tips

- **Git History Visualization:** Replace `.com` with `.githistory.xyz` in any GitHub file URL to see a visual history of that file.

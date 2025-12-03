---
title: Git 配置与技巧
description: Git 配置、代理设置、提交历史修改等实用技巧
---

## 1. 配置

### SSH 密钥生成

生成新的 SSH 密钥 (RSA 4096 位):

```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

### 用户身份

设置全局用户名和邮箱:

```bash
git config --global user.name "Your Name"
git config --global user.email "your_email@example.com"
```

### 代理设置

配置 Git 使用代理(例如 HTTP 代理 127.0.0.1:8888):

```bash
git config --global http.proxy http://127.0.0.1:8888
git config --global https.proxy http://127.0.0.1:8888
```

取消代理设置:

```bash
git config --global --unset http.proxy
git config --global --unset https.proxy
```

## 2. 修改提交历史

:::warning[警告]
重写历史是破坏性操作。请务必在操作前备份。`git filter-branch` 已被弃用,建议使用 [git-filter-repo](https://github.com/newren/git-filter-repo) 以获得更好的性能和安全性。
:::

### 更改作者信息(所有提交)

```bash
git filter-branch --env-filter 'export GIT_AUTHOR_EMAIL=new_email@example.com' --
```

### 更改特定作者信息

替换 `Old@Email`、`Changed Name` 和 `Changed@Email` 为实际值。

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

## 3. 日志查看

### 按作者过滤

```bash
git log --author="Author Name"
```

## 4. 实用技巧

- **Git 历史可视化:** 将任何 GitHub 文件 URL 中的 `.com` 替换为 `.githistory.xyz` 可查看该文件的可视化历史。

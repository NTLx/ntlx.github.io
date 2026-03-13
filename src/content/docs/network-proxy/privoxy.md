---
title: Privoxy 代理服务器配置指南
description: Privoxy 安装、配置和 SOCKS5 代理转发规则设置
---

![Privoxy Icon](https://upload.wikimedia.org/wikipedia/commons/a/a8/Privoxy_Icon.png?1573631956833)

Privoxy 是一个非缓存的 Web 代理服务器，常用于配合 SOCKS5 代理（如 Shadowsocks）进行网络流量转发。本文介绍 Privoxy 的安装、基本配置和代理规则设置。

## Privoxy 简介

Privoxy 主要功能：
- **HTTP 代理**：作为 HTTP/HTTPS 代理服务器
- **流量转发**：将请求转发到 SOCKS5 代理
- **规则过滤**：支持基于域名的转发规则
- **隐私保护**：去除广告和跟踪器

## 安装 Privoxy

### Ubuntu / Debian

```bash
sudo apt update
sudo apt install privoxy
```

### CentOS / RHEL

```bash
sudo yum install privoxy
```

### macOS

```bash
# 使用 Homebrew
brew install privoxy
```

安装后配置文件位置：
- Linux: `/etc/privoxy/config`
- macOS: `/usr/local/etc/privoxy/config`
- Windows: `C:\Program Files (x86)\Privoxy\config.txt`

### Windows

1. 从 [Privoxy 官网](https://www.privoxy.org/sf-download-mirror/Win32/) 下载安装程序
2. 运行安装程序并按提示操作
3. 配置文件通常位于 `C:\Program Files (x86)\Privoxy\config.txt`

## 基本配置

### Ubuntu / Debian

```bash
sudo apt update
sudo apt install privoxy
```

### CentOS / RHEL

```bash
sudo yum install privoxy
```

### macOS

```bash
# Using Homebrew
brew install privoxy
```

After installation, the config file is located at `/usr/local/etc/privoxy/config`.

### Windows

1.  Download the installer from the [Privoxy website](https://www.privoxy.org/sf-download-mirror/Win32/).
2.  Run the installer and follow the prompts.
3.  The config file is typically located at `C:\Program Files (x86)\Privoxy\config.txt`.

## 配置代理转发规则

### 基本语法

在 Privoxy 配置文件中添加转发规则：

```bash
forward-socks5 .example.com 127.0.0.1:1080 .
```

语法说明：
- `forward-socks5`：使用 SOCKS5 协议转发
- `.example.com`：要转发的域名（以点开头表示所有子域名）
- `127.0.0.1:1080`：SOCKS5 代理服务器地址
- `.`：转发规则的结束标记

### 配置文件位置

- **Linux**: `/etc/privoxy/config` 或 `/etc/privoxy/user.action`
- **macOS**: `/usr/local/etc/privoxy/config`
- **Windows**: `C:\Program Files (x86)\Privoxy\config.txt`

### 示例配置

以下是一个完整的配置示例，展示了常见的转发规则：

```bash
# 基础配置
listen-address  127.0.0.1:8118
forward-socks5 / 127.0.0.1:1080 .

# 特定域名转发规则
forward-socks5 .wikipedia.org 127.0.0.1:1080 .
forward-socks5 .github.com 127.0.0.1:1080 .
forward-socks5 .google.com 127.0.0.1:1080 .
forward-socks5 .youtube.com 127.0.0.1:1080 .
forward-socks5 .twitter.com 127.0.0.1:1080 .
forward-socks5 .reddit.com 127.0.0.1:1080 .
```

:::tip[域名列表管理]
由于域名列表可能非常长（原文章包含约 500 个域名），建议：
1. 将域名列表保存在单独的文件中
2. 使用 `include` 指令导入
3. 定期更新和维护
:::

## 服务管理

### 启动/停止/重启服务

#### Linux (systemd)

```bash
# 启动服务
sudo systemctl start privoxy

# 停止服务
sudo systemctl stop privoxy

# 重启服务
sudo systemctl restart privoxy

# 设置开机自启
sudo systemctl enable privoxy

# 查看状态
sudo systemctl status privoxy
```

#### macOS (Homebrew)

```bash
# 启动服务
brew services start privoxy

# 停止服务
brew services stop privoxy

# 重启服务
brew services restart privoxy
```

#### Windows

```powershell
# 使用服务管理器
net start privoxy
net stop privoxy
```

## 测试配置

### 验证代理是否工作

```bash
# 测试 HTTP 代理
curl --proxy http://127.0.0.1:8118 https://httpbin.org/ip

# 测试 HTTPS 代理
curl --proxy http://127.0.0.1:8118 https://httpbin.org/headers
```

### 查看 Privoxy 日志

```bash
# Linux/macOS
tail -f /var/log/privoxy/logfile

# Windows
# 查看安装目录下的 log 文件
```

## 常见问题

### 1. Privoxy 无法启动

**问题**：服务启动失败或端口被占用。

**解决方案**：
```bash
# 检查端口占用
sudo lsof -i :8118

# 修改默认端口（在配置文件中）
listen-address  127.0.0.1:8119
```

### 2. 代理规则不生效

**问题**：配置了转发规则但没有生效。

**解决方案**：
- 检查配置文件语法是否正确
- 确保 SOCKS5 代理服务正在运行
- 重启 Privoxy 服务：`sudo systemctl restart privoxy`

### 3. 无法连接到特定网站

**问题**：某些网站仍然无法访问。

**解决方案**：
- 检查域名是否正确添加到转发规则
- 尝试使用完整的域名而不是通配符
- 查看 Privoxy 日志获取详细错误信息

### 4. 浏览器无法使用代理

**问题**：浏览器配置了代理但无法工作。

**解决方案**：
- 确保浏览器代理设置指向 `127.0.0.1:8118`
- 检查防火墙是否阻止了代理端口
- 尝试使用不同的浏览器测试

## 高级配置

### 使用多个代理

```bash
# 为不同域名使用不同代理
forward-socks5 .github.com 127.0.0.1:1080 .
forward-socks5 .google.com 127.0.0.1:1081 .
```

### 排除特定域名

```bash
# 不代理特定域名
forward-socks5 .local 127.0.0.1:1080 .
```

## 参考资料

- [Privoxy 官方文档](https://www.privoxy.org/user-manual/)
- [Privoxy 配置指南](https://www.privoxy.org/user-manual/config.html)
- [SOCKS 代理协议](https://www.rfc-editor.org/rfc/rfc1928)

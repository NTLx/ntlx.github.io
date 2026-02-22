---
title: Proxychains 配置
description: Proxychains 代理工具使用
---

ProxyChains is a tool that forces any TCP connection made by a given application to follow through a proxy like TOR or any other SOCKS4, SOCKS5 or HTTP(S) proxy.

## 1. Installation

### Ubuntu / Debian

```bash
sudo apt update
sudo apt install proxychains4
```

### CentOS / RHEL

```bash
sudo yum install proxychains-ng
```

### Manjaro / Arch Linux

```bash
sudo pacman -S proxychains-ng
# or using yay
yay -S proxychains-ng
```

### macOS

```bash
# Using Homebrew
brew install proxychains-ng
```

After installation, the config file is located at `/usr/local/etc/proxychains.conf`.

### Windows

Proxychains is a Unix-only tool. On Windows, consider these alternatives:

1.  **Proxifier** (Commercial): A GUI application that forces any application to use a proxy.
2.  **ProxyCap** (Commercial): Similar to Proxifier with more granular control.
3.  **WSL (Windows Subsystem for Linux)**: Install Proxychains inside WSL for command-line tools.

:::tip[WSL 推荐]
如果你需要在 Windows 上使用类似 proxychains 的功能，推荐使用 WSL。安装 WSL 后，可以按照上述 Linux 方法安装 proxychains。
:::

## 2. Configuration

Edit the configuration file at `/etc/proxychains.conf` (or `/etc/proxychains4.conf`).

1.  **Open the file:**
    ```bash
    sudo vim /etc/proxychains.conf
    ```

2.  **Modify settings:**
    - Scroll to the bottom to the `[ProxyList]` section.
    - Add your proxy server (e.g., SOCKS5 at 127.0.0.1:1080).

    ```ini
    [ProxyList]
    # add proxy here ...
    # meanwile
    # defaults set to "tor"
    # socks4 	127.0.0.1 9050

    # Example:
    socks5  127.0.0.1 1080
    ```

    :::tip
    If you encounter DNS resolution issues, you might need to comment out `proxy_dns` in the configuration file, although keeping it enabled is recommended for privacy.
    :::

## 3. Usage

Prepend `proxychains` (or `proxychains4`) to any command you want to run through the proxy.

```bash
# Example: Download a file using curl
proxychains curl https://www.google.com

# Example: Run a shell
proxychains bash
```

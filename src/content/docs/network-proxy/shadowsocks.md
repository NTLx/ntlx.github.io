---
$schema: starlight
title: Shadowsocks 配置指南
description: Shadowsocks 服务端部署与客户端配置
---

![Shadowsocks Logo](https://avatars1.githubusercontent.com/u/3006190?s=200&v=4)

**Shadowsocks** 是一种基于 SOCKS5 协议的安全分体代理。它由服务端和客户端组成：服务端部署在远程服务器上，客户端运行在本地设备上。连接后，客户端创建本地 SOCKS5 代理，将网络流量加密转发到服务端，由服务端解密后发送到目标地址。

## 1. 服务端部署

服务端通常部署在 Linux 服务器上。

### 安装 Shadowsocks (Python)

#### CentOS

1. **安装 Python 和 Pip：**

    ```bash
    yum install python3 python3-pip
    ```

2. **安装 Shadowsocks：**

    ```bash
    pip3 install shadowsocks-py
    ```

3. **配置防火墙：**

    开放端口 8388（或你选择的端口）的 TCP 和 UDP：

    ```bash
    firewall-cmd --zone=public --add-port=8388/tcp --permanent
    firewall-cmd --zone=public --add-port=8388/udp --permanent
    firewall-cmd --reload
    ```

4. **创建配置文件：**

    创建 `/etc/shadowsocks.json`：

    ```json
    {
        "server": "0.0.0.0",
        "server_port": 8388,
        "local_address": "127.0.0.1",
        "local_port": 1080,
        "password": "your_password",
        "timeout": 300,
        "method": "aes-256-cfb",
        "fast_open": false
    }
    ```

    :::note
    `server` 应设为 `0.0.0.0` 以监听所有接口。`method` 可选 `aes-256-cfb`、`chacha20-ietf-poly1305` 等，取决于支持情况。`rc4-md5` 被认为较弱。
    :::

5. **启动服务：**

    手动启动：

    ```bash
    ssserver -c /etc/shadowsocks.json -d start
    ```

    开机自启：将命令添加到 `/etc/rc.local`。

### 安装 ShadowsocksR (SSR)

使用自动安装脚本快速部署：

```bash
wget -N --no-check-certificate https://raw.githubusercontent.com/ToyoDAdoubi/doubi/master/ssr.sh && chmod +x ssr.sh && bash ssr.sh
```

**推荐安装参数：**
- **加密方式：** `none`
- **协议：** `auth_chain_a`
- **混淆：** `plain`
- **兼容模式：** `n`（否）

### 启用 Google BBR

Google BBR 是一种 TCP 拥塞控制算法，可显著提升网络吞吐量。需要 Linux 内核 4.9 或更高版本。

#### CentOS 7

1. **检查当前内核：**

    ```bash
    uname -r
    ```

2. **安装 ELRepo 和主线内核：**

    ```bash
    rpm --import https://www.elrepo.org/RPM-GPG-KEY-elrepo.org
    rpm -Uvh http://www.elrepo.org/elrepo-release-7.0-3.el7.elrepo.noarch.rpm
    yum --enablerepo=elrepo-kernel install kernel-ml -y
    ```

3. **更新 GRUB：**

    列出可用内核：
    ```bash
    rpm -qa | grep kernel
    ```

    设置新内核（通常是索引 0）为默认：
    ```bash
    egrep ^menuentry /etc/grub2.cfg | cut -f 2 -d \'
    grub2-set-default 0
    ```

4. **重启：**

    ```bash
    reboot
    ```

5. **启用 BBR：**

    重启后执行：

    ```bash
    echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf
    echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf
    sysctl -p
    ```

6. **验证：**

    ```bash
    sysctl -n net.ipv4.tcp_congestion_control
    # 输出应为: bbr
    lsmod | grep bbr
    # 输出应显示 tcp_bbr
    ```

#### Debian 9+ / Ubuntu 18.04+

较新的 Debian 和 Ubuntu 版本通常自带内核 4.9+。

1. **启用 BBR：**

    ```bash
    echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf
    echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf
    sysctl -p
    ```

2. **验证：**

    ```bash
    lsmod | grep bbr
    ```

## 2. 客户端配置

### 客户端软件

Shadowsocks 支持多平台。以下是一些常用客户端：

:::note[重要]
确保操作系统为最新版本，以避免兼容性问题。
:::

#### Windows

- [Shadowsocks for Windows](https://github.com/shadowsocks/shadowsocks-windows)
- [ShadowsocksR (SSR)](https://github.com/shadowsocksr-backup/shadowsocksr-csharp/releases)

#### macOS

- [ShadowsocksX-NG](https://github.com/shadowsocks/ShadowsocksX-NG)
- [ShadowsocksX-NG-R](https://github.com/qinyuhang/ShadowsocksX-NG-R)

#### Android

- [Shadowsocks for Android](https://github.com/shadowsocks/shadowsocks-android)
- [ShadowsocksR (New)](https://github.com/shadowsocksrr/shadowsocksr-android)

#### iOS

- **Shadowrocket**（付费，非中国区 App Store 可下载）
- **Potatso Lite**
- **Quantumult**

#### 其他平台

完整客户端列表请访问[官网](https://shadowsocks.org/en/download/clients.html)。

### 服务来源

使用 Shadowsocks 需要服务端。你可以：
1. **自建：** 租用 VPS 并安装 Shadowsocks 服务端软件。
2. **订阅：** 购买 Shadowsocks 服务商的服务。

:::note
付费服务通常提供更好的稳定性和多节点选择，自建则提供完全的控制和隐私。
:::

### 扫码配置（推荐）

本节演示使用二维码配置客户端，这是最常用的方式。

#### 第一步：获取服务配置

登录服务商网站或自己的服务器管理面板，找到"订阅"或"服务器列表"部分，选择 **查看配置** 或 **扫描二维码**。

![服务器列表示例](http://lx-public-pic.oss-cn-shanghai.aliyuncs.com/Shadowsocks/%E5%B1%8F%E5%B9%95%E5%BF%AB%E7%85%A7%202019-03-11%2011.12.37.png)

在屏幕上显示二维码。

#### 第二步：配置客户端

1. **安装并运行：** 安装对应平台的 Shadowsocks 客户端并启动。系统托盘或菜单栏会出现纸飞机图标。

    ![系统托盘图标](http://lx-public-pic.oss-cn-shanghai.aliyuncs.com/Shadowsocks/%E5%B1%8F%E5%B9%95%E5%BF%AB%E7%85%A7%202019-03-11%2011.14.04.png)

2. **扫描二维码：**
    - 点击 Shadowsocks 图标。
    - 进入 **Servers** 或 **Scan QR Code** 菜单。
    - 选择 **Scan QR Code from Screen**。

    ![扫描菜单](http://lx-public-pic.oss-cn-shanghai.aliyuncs.com/Shadowsocks/%E5%B1%8F%E5%B9%95%E5%BF%AB%E7%85%A7%202019-03-11%2011.15.33.png)

    客户端会自动识别二维码并添加服务器配置。

3. **选择模式：**
    - **PAC 模式（自动）：** 仅匹配 PAC 列表（被屏蔽网站）的流量走代理。推荐日常使用。
    - **全局模式：** 所有流量走代理。

4. **更新 PAC：**
    - 建议定期更新 PAC 文件以确保新被屏蔽的网站被包含。在菜单中找到 **Update PAC from GFWList**。

    ![更新 PAC](http://lx-public-pic.oss-cn-shanghai.aliyuncs.com/Shadowsocks/%E5%B1%8F%E5%B9%95%E5%BF%AB%E7%85%A7%202019-03-11%2011.16.04.png)

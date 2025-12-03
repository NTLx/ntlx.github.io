---
title: Shadowsocks 客户端配置
description: Shadowsocks 客户端使用指南
---

![Shadowsocks Logo](https://avatars1.githubusercontent.com/u/3006190?s=200&v=4)

## 1. Introduction

**Shadowsocks** refers to a secure split-proxy based on the SOCKS5 protocol. It also refers to the various open-source implementations of this protocol (Python, C, C++, C#, Go, etc.) available under licenses like Apache, GPL, and MIT.

Shadowsocks consists of a server and a client. The server component is deployed on a remote server, while the client runs on the user's local device. Once connected, the client creates a local SOCKS5 proxy. Network traffic is then encrypted and forwarded to the server, which decrypts it and sends it to the target destination, effectively bypassing network restrictions.

## 2. Client Software

Shadowsocks is supported on a wide range of platforms. Below are some popular clients.

:::note[重要]
Ensure your operating system is up to date to avoid compatibility issues.
:::

### Windows

- [Shadowsocks for Windows](https://github.com/shadowsocks/shadowsocks-windows)
- [ShadowsocksR (SSR)](https://github.com/shadowsocksr-backup/shadowsocksr-csharp/releases)

### macOS

- [ShadowsocksX-NG](https://github.com/shadowsocks/ShadowsocksX-NG)
- [ShadowsocksX-NG-R](https://github.com/qinyuhang/ShadowsocksX-NG-R)

### Android

- [Shadowsocks for Android](https://github.com/shadowsocks/shadowsocks-android)
- [ShadowsocksR (New)](https://github.com/shadowsocksrr/shadowsocksr-android)

### iOS

- **Shadowrocket** (Paid, available in non-China App Stores)
- **Potatso Lite**
- **Quantumult**

### Other Platforms

For a complete list of clients, visit the [official website](https://shadowsocks.org/en/download/clients.html).

## 3. Service Providers

To use Shadowsocks, you need a server. You can either:
1.  **Self-host**: Rent a VPS (Virtual Private Server) and install the Shadowsocks server software.
2.  **Subscribe**: Purchase a service from a Shadowsocks provider.

:::note
Paid services often provide better stability and multiple server nodes, while self-hosting offers complete control and privacy.
:::

## 4. Configuration Guide

This guide demonstrates how to configure the client using a QR code, which is the most common method.

### Step 1: Obtain Server Configuration

Log in to your service provider's website or your own server management panel. Look for a "Subscribe" or "Server List" section.

You should find an option to **View Configuration** or **Scan QR Code**.

![Server List Example](http://lx-public-pic.oss-cn-shanghai.aliyuncs.com/Shadowsocks/%E5%B1%8F%E5%B9%95%E5%BF%AB%E7%85%A7%202019-03-11%2011.12.37.png)

Display the QR code on your screen.

### Step 2: Configure the Client

1.  **Install and Run**: Install the Shadowsocks client for your platform and launch it. You should see a paper airplane icon in your system tray or menu bar.

    ![System Tray Icon](http://lx-public-pic.oss-cn-shanghai.aliyuncs.com/Shadowsocks/%E5%B1%8F%E5%B9%95%E5%BF%AB%E7%85%A7%202019-03-11%2011.14.04.png)

2.  **Scan QR Code**:
    - Click on the Shadowsocks icon.
    - Navigate to the **Servers** or **Scan QR Code** menu.
    - Select **Scan QR Code from Screen**.

    ![Scan Menu](http://lx-public-pic.oss-cn-shanghai.aliyuncs.com/Shadowsocks/%E5%B1%8F%E5%B9%95%E5%BF%AB%E7%85%A7%202019-03-11%2011.15.33.png)

    The client will automatically detect the QR code and add the server configuration.

3.  **Select Mode**:
    - **PAC Mode (Auto)**: Only traffic matching the PAC list (blocked sites) goes through the proxy. Recommended for general use.
    - **Global Mode**: All traffic goes through the proxy.

4.  **Update PAC**:
    - It is recommended to update the PAC file regularly to ensure new blocked sites are included. Look for **Update PAC from GFWList** in the menu.

    ![Update PAC](http://lx-public-pic.oss-cn-shanghai.aliyuncs.com/Shadowsocks/%E5%B1%8F%E5%B9%95%E5%BF%AB%E7%85%A7%202019-03-11%2011.16.04.png)

---

[Back to Top](#shadowsocks-client-guide)

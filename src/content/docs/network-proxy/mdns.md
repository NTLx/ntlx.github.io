---
title: mDNS 配置
description: mDNS 本地网络发现配置
---

This guide explains how to install and configure mDNS (Multicast DNS) using Avahi on various Linux distributions. This allows you to access devices using `.local` hostnames (e.g., `myserver.local`).

## 1. Alpine Linux

```bash
sudo apk add avahi dbus
sudo rc-update add avahi-daemon
sudo service avahi-daemon start
```

## 2. CentOS / RHEL

1.  **Install Packages:**

    ```bash
    sudo yum install avahi avahi-tools nss-mdns
    ```

2.  **Enable Service:**

    ```bash
    sudo systemctl start avahi-daemon
    sudo systemctl enable avahi-daemon
    ```

3.  **Configure Name Resolution:**

    Edit `/etc/nsswitch.conf` and find the `hosts:` line. Change it from:
    ```text
    hosts: files dns
    ```
    to:
    ```text
    hosts: files mdns_minimal [NOTFOUND=return] dns
    ```

4.  **Configure Firewall:**

    Allow mDNS traffic through the firewall:

    ```bash
    sudo firewall-cmd --permanent --add-service=mdns
    sudo firewall-cmd --reload
    ```

## 3. Ubuntu / Debian

Ubuntu usually comes with Avahi installed. If not:

```bash
sudo apt update
sudo apt install avahi-daemon
```

## 4. Arch Linux / Manjaro

1.  **Install Package:**

    ```bash
    sudo pacman -S avahi
    ```

2.  **Enable Service:**

    ```bash
    sudo systemctl enable --now avahi-daemon.service
    ```

    :::caution[重要提示]
    **Conflict with systemd-resolved:** `systemd-resolved` has a built-in mDNS responder. Ensure you disable it or configure it correctly to avoid conflicts with Avahi.

    To disable `systemd-resolved` mDNS:
    
    Edit `/etc/systemd/resolved.conf` and set `MulticastDNS=no`.
    
    Then restart the service: `sudo systemctl restart systemd-resolved`.
    :::

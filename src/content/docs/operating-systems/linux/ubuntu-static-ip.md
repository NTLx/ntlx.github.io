---
title: Ubuntu 22.04 静态 IP 配置
description: 为 Ubuntu 22.04 配置静态 IP 地址
---

This guide explains how to configure a static IP address on Ubuntu 22.04 using Netplan.

## 1. Check Current Network Status

Before making changes, identify your network interface name and current configuration.

```bash
# Check IP address and subnet mask
ip addr

# Check default gateway
ip route

# Check DNS servers
resolvectl status
```

:::note
Note down your network interface name (e.g., `ens160`, `eth0`).
:::

## 2. Configure Netplan

Netplan configuration files are located in `/etc/netplan/`. The default file is usually named `00-installer-config.yaml` or similar.

1.  **Backup the existing configuration:**

    ```bash
    sudo cp /etc/netplan/00-installer-config.yaml /etc/netplan/00-installer-config.yaml.bak
    ```

2.  **Edit the configuration file:**

    ```bash
    sudo vim /etc/netplan/00-installer-config.yaml
    ```

    **Default Configuration (DHCP):**

    ```yaml
    # This is the network config written by 'subiquity'
    network:
      ethernets:
        ens160:
          dhcp4: true
      version: 2
    ```

    **Static IP Configuration:**

    Modify the file to look like this (replace `ens160`, IP addresses, and gateway with your own values):

    ```yaml
    # This is the network config written by 'subiquity'
    network:
      ethernets:
        ens160:
          dhcp4: false
          addresses:
            - 192.168.1.2/24
          routes:
            - to: default
              via: 192.168.1.1
          nameservers:
            addresses: [1.1.1.1, 8.8.8.8]
      version: 2
    ```

    > [!IMPORTANT]
    > YAML is indentation-sensitive. Ensure you use spaces (not tabs) and align the keys correctly.

## 3. Apply Configuration

Apply the changes using Netplan.

```bash
sudo netplan apply
```

If there are no errors, verify the new IP address:

```bash
ip addr show ens160
```

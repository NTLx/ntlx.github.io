---
title: Ubuntu 配置指南
description: Ubuntu Server 安装、网络配置和故障排除
---

本文整合了 Ubuntu Server 的安装指南、静态 IP 配置以及常见故障排除方法。

## 1. Server 安装指南

### 准备工作

下载 **Ubuntu 22.04.4 Server** ISO 镜像：
[下载链接](https://mirrors.aliyun.com/ubuntu-releases/jammy/ubuntu-22.04.4-live-server-amd64.iso)

使用 **Rufus**（Windows）制作启动 U 盘：
- **下载 Rufus 4.4 (Portable)：**[下载链接](https://github.com/pbatard/rufus/releases/download/v4.4/rufus-4.4p.exe)
- **使用说明：**[Rufus 官网](https://rufus.ie/en/)

### 硬件准备

1. 将启动 U 盘插入目标服务器。
2. 连接显示器、键盘和电源线。
3. 连接网线（推荐）。

### 安装步骤

1. **开机：** 启动服务器并从 U 盘引导。
2. **选择语言：** 选择 **English**。

    ![语言选择](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520105855.png)

3. **安装器更新：** 如有提示，选择 **Continue without updating**。

    ![安装器更新](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520110013.png)

4. **键盘布局：** 保持默认，选择 **Done**。

    ![键盘布局](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520110420.png)

5. **网络连接：** 保持默认网络设置（DHCP），选择 **Done**。

    ![网络连接](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520110628.png)

6. **代理配置：** 如不需要代理，留空并选择 **Done**。

    ![代理配置](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520110655.png)

7. **Ubuntu 镜像源：** 保持默认镜像地址，选择 **Done**。

    ![镜像源](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520111422.png)

8. **存储配置：**
    - 在 **Guided storage configuration** 中，取消勾选 **Set up this disk as an LVM group**。
    - 选择 **Done**。

    ![存储配置](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520112032.png)

9. **文件系统设置：**
    - 查看存储配置摘要。
    - 选择分区（如 `partition 2`）并按 **Enter**。
    - 选择 **Edit**。
    - 将 **Format** 改为 **xfs**。
    - 选择 **Save**。
    - 选择 **Done** 并确认 **Continue**。

    ![分区编辑](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520112603.png)

10. **用户配置：** 输入服务器用户信息。

    **推荐设置：**
    - **Your name：** `manager`
    - **Your server's name：** `ubuntu`
    - **Pick a username：** `manager`
    - **Choose a password：**（设置强密码）

    ![用户配置](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520113204.png)

11. **SSH 设置：** 勾选 **Install OpenSSH server** 启用远程访问。选择 **Done**。

    ![SSH 设置](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520113338.png)

12. **Featured Server Snaps：** 不选择任何软件包。选择 **Done**。

    ![Server Snaps](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520113402.png)

13. **安装进度：** 等待安装完成。

    ![安装进度](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520113540.png)

14. **完成：** 安装完成后选择 **Reboot Now**。提示时拔出 U 盘。

    ![重启](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520122209.png)

## 2. 静态 IP 配置

使用 Netplan 为 Ubuntu 22.04 配置静态 IP 地址。

### 查看当前网络状态

修改前，先确认网络接口名称和当前配置。

```bash
# 查看 IP 地址和子网掩码
ip addr

# 查看默认网关
ip route

# 查看 DNS 服务器
resolvectl status
```

:::note
记下你的网络接口名称（如 `ens160`、`eth0`）。
:::

### 配置 Netplan

Netplan 配置文件位于 `/etc/netplan/`，默认文件通常命名为 `00-installer-config.yaml` 或类似名称。

1. **备份现有配置：**

    ```bash
    sudo cp /etc/netplan/00-installer-config.yaml /etc/netplan/00-installer-config.yaml.bak
    ```

2. **编辑配置文件：**

    ```bash
    sudo vim /etc/netplan/00-installer-config.yaml
    ```

    **默认配置（DHCP）：**

    ```yaml
    # This is the network config written by 'subiquity'
    network:
      ethernets:
        ens160:
          dhcp4: true
      version: 2
    ```

    **静态 IP 配置：**

    修改文件如下（将 `ens160`、IP 地址和网关替换为你的实际值）：

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

    :::caution[YAML 语法敏感]
    YAML 对缩进非常敏感。请确保使用空格（而非 Tab），并且正确对齐各层级键值。
    :::

### 应用配置

```bash
sudo netplan apply
```

如无错误，验证新 IP 地址：

```bash
ip addr show ens160
```

## 3. 修复 fstab 错误导致的无法启动

**适用场景：** Ubuntu 服务器因为 `/etc/fstab` 中配置了无法挂载的硬盘（如硬盘已拔出、损坏或路径变更），导致系统无法正常开机，通常卡在启动画面或进入 "Emergency Mode"。

**前提条件：** 你需要能够访问服务器的终端。
- **物理服务器：** 连接显示器和键盘。
- **云服务器/VPS：** 需要在云服务商的管理后台使用 **VNC Console（控制台/救援模式）**，因为此时 SSH 通常无法连接。

### 第一步：进入系统 Shell

在 Emergency Mode 下，系统会提示你输入 root 密码进入维护 shell。如果未提示，可尝试按 `Ctrl+D` 重启后选择 recovery mode。

### 第二步：编辑 fstab

```bash
# 备份当前 fstab
cp /etc/fstab /etc/fstab.bak

# 编辑 fstab
vim /etc/fstab
```

注释掉（在行首加 `#`）或删除导致问题的挂载条目。通常是可以识别的外部硬盘或 NAS 挂载行。

### 第三步：测试并重启

```bash
# 测试 fstab 是否有语法错误
mount -a

# 如无报错，重启系统
reboot
```

:::tip[预防措施]
在 `/etc/fstab` 中为非关键挂载项添加 `nofail` 选项，可以避免因单个硬盘故障导致整个系统无法启动：

```
/dev/sdb1 /data ext4 defaults,nofail 0 2
```
:::

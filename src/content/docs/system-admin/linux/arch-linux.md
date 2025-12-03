---
title: Arch Linux 安装配置指南
description: 详细的 Arch Linux UEFI + GPT 系统安装和配置教程
---

![Arch Linux](https://img.linux.net.cn/data/attachment/album/201712/25/102349b7keeap433ae5e3j.jpg)

:::note
本指南假设你使用 **UEFI** 系统和 **GPT** 分区表。
:::

## 1. 安装前准备

### 设置时区

确保系统时间正确。

```bash
timedatectl set-timezone Asia/Shanghai
```

### 磁盘分区

使用 `fdisk` 创建 GPT 分区表,包含 EFI 系统分区 (ESP) 和根分区。

#### 创建引导分区 (ESP)

```bash
fdisk /dev/sda
# 在 fdisk 提示符中:
# g     - 创建新的 GPT 分区表
# n     - 添加新分区
# 1     - 分区号 (默认 1)
# 2048  - 起始扇区 (默认)
# +512M - 结束扇区 (大小 512M)
# t     - 更改分区类型
# 1     - 选择分区 1 (如有提示)
# 1     - 设置类型为 'EFI System' (GPT 中代码为 1)
# w     - 写入更改
```

格式化 ESP 分区:

```bash
mkfs.fat -F32 /dev/sda1
```

#### 创建根分区

```bash
fdisk /dev/sda
# 在 fdisk 提示符中:
# n     - 添加新分区
#       - 分区号 (默认 2)
#       - 起始扇区 (默认)
#       - 结束扇区 (默认,使用剩余空间)
# w     - 写入更改
```

格式化根分区:

```bash
mkfs.ext4 /dev/sda2
```

### 挂载分区

将根分区挂载到 `/mnt`,引导分区挂载到 `/mnt/boot`。

```bash
mount /dev/sda2 /mnt
mkdir -p /mnt/boot
mount /dev/sda1 /mnt/boot
```

### 配置镜像源

编辑 `/etc/pacman.d/mirrorlist`,使用快速镜像源(如阿里云)。在文件顶部添加:

```bash
Server = http://mirrors.aliyun.com/archlinux/$repo/os/$arch
```

## 2. 系统安装

### 安装基础系统

安装基础系统、开发工具、内核和网络管理器。

```bash
pacstrap /mnt base base-devel linux dhcpcd
```

### 生成 Fstab

生成 `fstab` 文件以定义如何挂载磁盘分区。

```bash
genfstab -L /mnt >> /mnt/etc/fstab
```

验证内容:

```bash
cat /mnt/etc/fstab
```

## 3. 系统配置

### 切换到新系统

```bash
arch-chroot /mnt
```

### 设置时区

```bash
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
hwclock --systohc
```

### 安装必要软件包

```bash
pacman -S vim dialog wpa_supplicant ntfs-3g networkmanager
```

### 本地化

编辑 `/etc/locale.gen`,取消注释以下行:

```text
en_US.UTF-8 UTF-8
zh_CN.UTF-8 UTF-8
zh_HK.UTF-8 UTF-8
zh_TW.UTF-8 UTF-8
```

生成 locale:

```bash
locale-gen
```

创建 `/etc/locale.conf`:

```bash
echo "LANG=en_US.UTF-8" > /etc/locale.conf
```

### 网络配置

设置主机名(将 `ArchLx` 替换为你的主机名):

```bash
echo "ArchLx" > /etc/hostname
```

编辑 `/etc/hosts`:

```text
127.0.0.1   localhost
::1         localhost
127.0.1.1   ArchLx.localdomain  ArchLx
```

### 设置 Root 密码

```bash
passwd
```

### 微码更新 (仅 Intel CPU)

```bash
pacman -S intel-ucode
```

## 4. 引导加载器安装

使用 **GRUB** 作为引导加载器。

```bash
pacman -S os-prober ntfs-3g grub efibootmgr
grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=grub
grub-mkconfig -o /boot/grub/grub.cfg
```

:::tip
如遇到 `warning failed to connect to lvmetad` 错误,编辑 `/etc/lvm/lvm.conf` 设置 `use_lvmetad = 0`,然后重新生成 grub 配置。
:::

:::note
如果看到 `grub-probe: error: cannot find a GRUB drive for /dev/sdb1` 且 `sdb1` 是你的 USB 安装介质,可以安全忽略此错误。
:::

## 5. 完成

退出 chroot 环境并重启。

```bash
exit
reboot
```

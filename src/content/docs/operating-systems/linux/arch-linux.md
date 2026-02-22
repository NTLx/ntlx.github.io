---
title: Arch Linux 安装配置指南
description: 详细的 Arch Linux UEFI + GPT 系统安装和配置教程
---

![](https://img.linux.net.cn/data/attachment/album/201712/25/102349b7keeap433ae5e3j.jpg)

:::note
This guide assumes you are using a **UEFI** system and **GPT** partition table.
:::

## 1. Pre-installation

### Set Timezone

Ensure your system time is correct before installation.

```bash
timedatectl set-timezone Asia/Shanghai
```

### Disk Partitioning

We will use `fdisk` to create a GPT partition table with an EFI System Partition (ESP) and a Root partition.

#### Create Boot Partition (ESP)

```bash
fdisk /dev/sda
# In fdisk prompt:
# g     - Create a new empty GPT partition table
# n     - Add a new partition
# 1     - Partition number (default 1)
# 2048  - First sector (default)
# +512M - Last sector (size 512M)
# t     - Change partition type
# 1     - Select partition 1 (if asked)
# 1     - Set type to 'EFI System' (code 1 in fdisk for GPT)
# w     - Write changes
```

Format the ESP partition:

:::caution[数据丢失风险]
执行 `mkfs.fat` 命令将**格式化分区**，该分区上的所有数据将被永久删除。请务必：
1. 确认目标分区正确（本例为 `/dev/sda1`）
2. 如果是重新安装系统，请提前备份重要数据
:::

```bash
mkfs.fat -F32 /dev/sda1
```

#### Create Root Partition

```bash
fdisk /dev/sda
# In fdisk prompt:
# n     - Add a new partition
#       - Partition number (default 2)
#       - First sector (default)
#       - Last sector (default, use remaining space)
# w     - Write changes
```

Format the Root partition:

:::caution[数据丢失风险]
执行 `mkfs.ext4` 命令将**格式化分区**，该分区上的所有数据将被永久删除。请务必：
1. 确认目标分区正确（本例为 `/dev/sda2`）
2. 如果是重新安装系统，请提前备份重要数据
:::

```bash
mkfs.ext4 /dev/sda2
```

### Mount Partitions

Mount the root partition to `/mnt` and the boot partition to `/mnt/boot`.

```bash
mount /dev/sda2 /mnt
mkdir -p /mnt/boot
mount /dev/sda1 /mnt/boot
```

### Configure Mirror List

Edit `/etc/pacman.d/mirrorlist` to use a fast mirror (e.g., Aliyun). Add the following line to the top of the file:

```bash
Server = http://mirrors.aliyun.com/archlinux/$repo/os/$arch
```

## 2. Installation

### Install Base System

Install the base system, development tools, kernel, and network manager.

```bash
pacstrap /mnt base base-devel linux dhcpcd
```

### Generate Fstab

Generate the `fstab` file to define how disk partitions should be mounted.

```bash
genfstab -L /mnt >> /mnt/etc/fstab
```

Verify the content:

```bash
cat /mnt/etc/fstab
```

## 3. System Configuration

### Chroot into New System

Change root into the new system.

```bash
arch-chroot /mnt
```

### Set Timezone

```bash
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
hwclock --systohc
```

### Install Essential Packages

Install common tools like `vim`, `networkmanager`, etc.

```bash
pacman -S vim dialog wpa_supplicant ntfs-3g networkmanager
```

### Localization

Edit `/etc/locale.gen` and uncomment the following lines:

```text
en_US.UTF-8 UTF-8
zh_CN.UTF-8 UTF-8
zh_HK.UTF-8 UTF-8
zh_TW.UTF-8 UTF-8
```

Generate locales:

```bash
locale-gen
```

Create `/etc/locale.conf` and set the LANG variable:

```bash
echo "LANG=en_US.UTF-8" > /etc/locale.conf
```

### Network Configuration

Set the hostname (replace `ArchLx` with your desired hostname):

```bash
echo "ArchLx" > /etc/hostname
```

Edit `/etc/hosts`:

```text
127.0.0.1   localhost
::1         localhost
127.0.1.1   ArchLx.localdomain  ArchLx
```

### Set Root Password

```bash
passwd
```

### Microcode (Intel CPU only)

If you are using an Intel CPU, install the microcode updates.

```bash
pacman -S intel-ucode
```

## 4. Bootloader Installation

We will use **GRUB** as the bootloader.

```bash
pacman -S os-prober ntfs-3g grub efibootmgr
grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=grub
grub-mkconfig -o /boot/grub/grub.cfg
```

:::tip
If you encounter the error `warning failed to connect to lvmetad，falling back to device scanning`, edit `/etc/lvm/lvm.conf` and set `use_lvmetad = 0`, then regenerate the grub config.
:::

:::note
If you see `grub-probe: error: cannot find a GRUB drive for /dev/sdb1`, and `sdb1` is your USB installation media, you can safely ignore this error.
:::

## 5. Finish

Exit the chroot environment and reboot.

```bash
exit
reboot
```

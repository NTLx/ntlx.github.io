![](https://img.linux.net.cn/data/attachment/album/201712/25/102349b7keeap433ae5e3j.jpg)

# Configuration Guide for Arch Linux

> for UEFI boot and GPT partation

## set timezone

```bash
timedatectl set-timezone Asia/Shanghai
```

## disk partation

### set boot partation

```bash
fdisk /dev/sda
g # set a new gpt partation table
1
2048
+512M # add a 512M partation
t
1 # set 512M partation to EFT System
w
mkfs.fat -F32 /dev/sda1
```

### set / partation

```bash
fdisk /dev/sda
n
# then use default value (just hit enter)
w
mkfs.ext4 /dev/sda2
```

## mount

```bash
mount /dev/sda2 /mnt
mkdir /mnt/boot
mount /dev/sda1 /mnt/boot
```

## set mirror

Edit `/etc/pacman.d/mirrorlist` and add blow at the top

```bash
Server = http://mirrors.aliyun.com/archlinux/$repo/os/$arch
```

## basic packages installation

```bash
pacstrap /mnt base base-devel linux dhcpcd
```

## set Fstab

```bash
genfstab -L /mnt >> /mnt/etc/fstab
```

test result:

```bash
cat /mnt/etc/fstab
```

## Chroot

```bash
arch-chroot /mnt
```

## set timezone for new system

```bash
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
hwclock --systohc
```

## must have packages installation

```bash
pacman -S vim dialog wpa_supplicant ntfs-3g networkmanager
```

## Localization

```bash
vim /etc/locale.gen
```

unset annotation for blow:

```
en_US.UTF-8 UTF-8
zh_CN.UTF-8 UTF-8
zh_HK.UTF-8 UTF-8
zh_TW.UTF-8 UTF-8
```

```bash
locale-gen
vim /etc/locale.conf
```

add blow to the top:

```
LANG=en_US.UTF-8
```

## set server name

```bash
vim /etc/hostname
vim /etc/hosts
```

add host name in `/etc/hostname` file, add blow to `/etc/hosts` file:

```
127.0.0.1	localhost
::1		localhost
127.0.1.1	ArchLx.localdomain	ArchLx
```

## set root password

```bash
passwd
```

## Intel-ucode Installation

> skip this if not Intel CPU

```bash
pacman -S intel-ucode
```

## Bootloader Installation

> if installed Grub before, must delete it first

```bash
pacman -S os-prober ntfs-3g
pacman -S grub efibootmgr
grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=grub
grub-mkconfig -o /boot/grub/grub.cfg
exit
reboot
```

> if report error `warning failed to connect to lvmetad，falling back to device scanning.`, edit `/etc/lvm/lvm.conf`, set `use_lvmetad = 1` to `0`, the reset grub

> if report error like `grub-probe: error: cannot find a GRUB drive for /dev/sdb1, check your device.map`, and this `sdb1` was your USB drive, you can ignore this error

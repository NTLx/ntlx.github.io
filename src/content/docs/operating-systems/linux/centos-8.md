---
title: CentOS 8 配置指南
description: CentOS 8 系统配置和优化
---

![CentOS](https://docs.centos.org/en-US/8-docs/managing-userspace-components/_images/title_logo.svg)

:::note
This guide assumes a **Minimal Installation** of CentOS 8.
:::

## 1. System Dependencies

Install essential development tools and libraries.

```bash
sudo yum install autoconf automake c-ares c-ares-devel chrony clang clang-devel clang-libs clang-tools-extra cmake cmake-data cmake-filesystem cmake-rpm-macros CUnit curl expat expat-devel gcc gcc-c++ gmp gmp-c++ gmp-devel gnutls gnutls-c++ gnutls-devel gnutls-utils graphviz icu libconfig libgcc libgcrypt libgcrypt-devel libicu libicu-devel libpkgconf libssh2 libstdc++ libstdc++-devel libuv libxml2 libxml2-devel make make-devel ncurses-c++-libs nettle nettle-devel nodejs nodejs-devel openssh-clients openssh-server openssl openssl-devel openssl-libs pcre pcre2 pcre2-devel pcre-cpp pcre-devel perl-CPAN pkgconf pkgconf-pkg-config policycoreutils postfix sqlite-devel sqlite-libs zlib zlib-devel wget tar git
```

## 2. Language Settings

Add the following to `~/.bashrc` or `~/.zshrc` to set the system language to English (UTF-8).

```bash
export LANGUAGE=en_US.utf8
export LC_ALL=en_US.utf8
export LANG=en_US.utf8
```

## 3. Software Installation

### Tmux & Zsh

```bash
sudo yum install tmux zsh
```

### Python 3

```bash
sudo yum install python36 python36-devel
```

### Shadowsocks

**Installation**
```bash
sudo pip3 install shadowsocks-py
sudo ln -s /usr/local/bin/sslocal /usr/bin/
```

**Usage**
```bash
sudo sslocal -c HK03.json -d start
```

### Privoxy

**Installation**
Download source from [SourceForge](https://sourceforge.net/projects/ijbswa/files/Sources/).

```bash
tar zxf privoxy-3.0.28-stable-src.tar.gz
cd privoxy-3.0.28-stable/
sudo autoheader
sudo autoconf
sudo ./configure
sudo make
sudo useradd privoxy -r -s /usr/sbin/nologin
sudo make install
```

### Aria2 v1.35.0

**Installation**
```bash
wget https://github.com/aria2/aria2/releases/download/release-1.35.0/aria2-1.35.0.tar.gz
tar zxf aria2-1.35.0.tar.gz
cd aria2-1.35.0
./configure --prefix=$HOME/software/aria2-1.35.0
make && make install
```

**WebUI**
```bash
git clone git@github.com:ziahamza/webui-aria2.git
# or wget https://github.com/ziahamza/webui-aria2/archive/master.zip
```

**Usage**
1. Start Aria2 RPC server:
    ```bash
    ~/software/aria2-1.35.0/bin/aria2c --enable-rpc --rpc-listen-all
    ```
2. Start WebUI:
    ```bash
    node node-server.js
    ```

### Ruby

**Installation**
```bash
sudo yum install ruby ruby-devel ruby-libs
```

**Configure Mirror (Aliyun)**
```bash
gem sources --remove https://rubygems.org/
gem sources -a https://mirrors.aliyun.com/rubygems/
gem update
gem update --system
```

**Configure `~/.gemrc`**
```yaml
---
:backtrace: false
:bulk_threshold: 1000
:sources:
- https://mirrors.aliyun.com/rubygems/
:update_sources: true
:verbose: true
gem: "--user-install --bindir /home/lx/bin"
:concurrent_downloads: 8
install: --no-document
update: --no-document
```

## 4. Services

### Samba 4

**Installation**
```bash
sudo dnf install samba samba-client samba-common
sudo systemctl start smb
sudo systemctl enable smb
sudo firewall-cmd --permanent --add-service=samba
sudo firewall-cmd --reload
```

**Configuration**
```bash
cp /etc/samba/smb.conf /etc/samba/smb.conf.orig
sudo touch /etc/samba/smbpasswd
sudo vim /etc/samba/smb.conf
```

**Minimal Config Example**
```ini
[global]
    workgroup = WORKGROUP
    security = user
    netbios name = HaseeServer
    hosts allow = 192.168.0.
    passdb backend = smbpasswd
    encrypt passwords = true
    smb passwd file = /etc/samba/smbpasswd
    log file = /var/log/samba/log.%m
    max open files = 1000

[SSD]
    comment = Hasee SSD Download folder
    path = /home/lx/Download
    valid users = lx
    writable = no
    browseable = yes
    available = yes

[SATA]
    comment = Hasee SATA Download folder
    path = /home/lx/public/Download
    valid users = lx
    writeable = no
    browseable = yes
    available = yes
```

**User Management**
```bash
# groupadd smbgrp
# usermod lx -aG smbgrp
sudo smbpasswd -a lx
sudo systemctl restart smb
sudo systemctl restart nmb
```

:::tip
For SELinux configuration with Samba, refer to [this guide](https://linuxconfig.org/install-samba-on-redhat-8#h7-setup-selinux-for-samba).
:::

## 5. Useful Tips

### Disk Management

```bash
sudo yum install gdisk
```

Format and mount:
```bash
sudo gdisk /dev/sda
sudo mkfs.xfs -f -d agcount=8 /dev/sda1
sudo mount /dev/sda1 /store
```

### Time Synchronization

```bash
sudo systemctl enable chronyd                  # Enable on boot
sudo systemctl start chronyd                   # Start service
sudo timedatectl set-local-rtc 1               # Use local time (1) or UTC (0)
sudo timedatectl set-timezone Asia/Shanghai    # Set timezone
sudo timedatectl set-ntp yes                   # Enable NTP sync
```

### SELinux Management

**Check Status**
```bash
getenforce
```

**Disable Temporarily**
```bash
sudo setenforce 0
```

**Disable Permanently**
Edit `/etc/selinux/config` and set `SELINUX=disabled`.

```ini
# This file controls the state of SELinux on the system.
SELINUX=disabled
SELINUXTYPE=targeted
```

### Firewall Management

**Systemctl Commands**
```bash
sudo systemctl start firewalld.service         # Start firewall
sudo systemctl stop firewalld.service          # Stop firewall
sudo systemctl enable firewalld.service        # Enable on boot
sudo systemctl disable firewalld.service       # Disable on boot
sudo systemctl status firewalld.service        # Check status
```

**Firewall-cmd Commands**
```bash
sudo firewall-cmd --state                      # Check state
sudo firewall-cmd --reload                     # Reload rules
sudo firewall-cmd --list-ports                 # List open ports
sudo firewall-cmd --list-services              # List allowed services

# Zone Management
sudo firewall-cmd --list-all-zones             # List all zones
sudo firewall-cmd --set-default-zone=public    # Set default zone

# Port Management
sudo firewall-cmd --permanent --add-port=80/tcp        # Open port 80
sudo firewall-cmd --permanent --remove-port=8080/tcp   # Close port 8080
sudo firewall-cmd --reload                             # Apply changes
```

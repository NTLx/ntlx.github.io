![CentOS](https://docs.centos.org/en-US/8-docs/managing-userspace-components/_images/title_logo.svg)

# Configuration Guide for CentOS 8

> for Minimal Installation

# system dependency

```bash
sudo yum install autoconf automake c-ares c-ares-devel chrony clang clang-devel clang-libs clang-tools-extra cmake cmake-data cmake-filesystem cmake-rpm-macros CUnit curl expat expat-devel gcc gcc-c++ gmp gmp-c++ gmp-devel gnutls gnutls-c++ gnutls-devel gnutls-utils graphviz icu libconfig libgcc libgcrypt libgcrypt-devel libicu libicu-devel libpkgconf libssh2 libstdc++ libstdc++-devel libuv libxml2 libxml2-devel make make-devel ncurses-c++-libs nettle nettle-devel nodejs nodejs-devel openssh-clients openssh-server openssl openssl-devel openssl-libs pcre pcre2 pcre2-devel pcre-cpp pcre-devel perl-CPAN pkgconf pkgconf-pkg-config policycoreutils postfix sqlite-devel sqlite-libs zlib zlib-devel wget tar git
```

# set language

add blow to `~/.bashrc` or `~/.zshrc`

```bash
export LANGUAGE=en_US.utf8
export LC_ALL=en_US.utf8
export LANG=en_US.utf8
```

# install tmux zsh

```bash
sudo yum install tmux zsh
```

# install python3

```bash
sudo yum install python36 python36-devel
```

# install shadowsocks

```bash
sudo pip3 install shadowsocks-py
sudo ln -s /usr/local/bin/sslocal /usr/bin/
```

## using shadowsocks

```bash
sudo sslocal -c HK03.json -d start
```

# install privoxy

[Download](https://sourceforge.net/projects/ijbswa/files/Sources/)

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

# install aria2 v1.35.0

```bash
wget https://github.com/aria2/aria2/releases/download/release-1.35.0/aria2-1.35.0.tar.gz
tar zxf aria2-1.35.0.tar.gz
cd aria2-1.35.0
./configure --prefix=$HOME/software/aria2-1.35.0
make
make install
```

## install aria2 webui

```bash
git clone git@github.com:ziahamza/webui-aria2.git
# or wget https://github.com/ziahamza/webui-aria2/archive/master.zip
```

## run aria2

```bash
~/software/aria2-1.35.0/bin/aria2c --enable-rpc --rpc-listen-all
```

## run webui

```bash
node node-server.js
```

# install ruby

```bash
sudo yum install ruby ruby-devel ruby-libs
gem sources --remove https://rubygems.org/
gem sources -a https://mirrors.aliyun.com/rubygems/
gem update
gem update --system
```

edit `~/.gemrc` like blow:

```
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

# Install Samba4

```bash
sudo dnf install samba samba-client samba-common
sudo systemctl start smb
sudo systemctl enable smb
sudo systemctl status smb
sudo firewall-cmd --permanent --add-service=samba
sudo firewall-cmd --reload
cp /etc/samba/smb.conf /etc/samba/smb.conf.orig
sudo touch /etc/samba/smbpasswd
sudo vim /etc/samba/smb.conf
testparm
# groupadd smbgrp
# usermod lx -aG smbgrp
sudo smbpasswd -a lx
sudo systemctl restart smb
sudo systemctl restart nmb
```

> SELinux must be configured correctly for Samba using (usually just trun it off, not recommended), could visit [here](https://linuxconfig.org/install-samba-on-redhat-8#h7-setup-selinux-for-samba) for more instructions.

## minimal config

```conf
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

# Usefull Tips

## about disk

```bash
sudo yum install gdisk
```

```bash
sudo gdisk /dev/sda
sudo mkfs.xfs -f -d agcount=8 /dev/sda1
sudo mount /dev/sda1 /store
```

## sync time

```bash
sudo systemctl enable chronyd                  # set startup on boot
sudo systemctl is-enabled chronyd              # check startup on boot
sudo systemctl start chronyd                   # enable chrony
sudo timedatectl list-timezones                # list all timezones
sudo timedatectl set-local-rtc 1               # 0 means UTC
sudo timedatectl set-timezone Asia/Shanghai    # set timezone to Shanghai
sudo timedatectl set-ntp yes                   # enable time sync
```

## about SELinux

```bash
getenforce                      # check run status, Enforcing means on
sudo setenforce 0               # disable SELinux temproraily
sudo vim /etc/selinux/config    # disable SELinux forever
```

Edit `SELINUX=enforcing` to `SELINUX=disabled` :

```conf
# This file controls the state of SELinux on the system.
# SELINUX= can take one of these three values:
#     enforcing - SELinux security policy is enforced.
#     permissive - SELinux prints warnings instead of enforcing.
#     disabled - No SELinux policy is loaded.
SELINUX=enforcing
# SELINUXTYPE= can take one of these three values:
#     targeted - Targeted processes are protected,
#     minimum - Modification of targeted policy. Only selected processes are protected.
#     mls - Multi Level Security protection.
SELINUXTYPE=targeted
```

## about firewall

### systemctl

```bash
sudo systemctl unmask firewalld                # 执行命令，即可实现取消服务的锁定
sudo systemctl mask firewalld                  # 下次需要锁定该服务时执行
sudo systemctl start firewalld.service         # 启动防火墙
sudo systemctl stop firewalld.service          # 停止防火墙
sudo systemctl reloadt firewalld.service       # 重载配置
sudo systemctl restart firewalld.service       # 重启服务
sudo systemctl status firewalld.service        # 显示服务的状态
sudo systemctl enable firewalld.service        # 在开机时启用服务
sudo systemctl disable firewalld.service       # 在开机时禁用服务
sudo systemctl is-enabled firewalld.service    # 查看服务是否开机启动
sudo systemctl list-unit-files|grep enabled    # 查看已启动的服务列表
sudo systemctl --failed                        # 查看启动失败的服务列表
```

### firewall-cmd

```bash
sudo firewall-cmd --state            # 查看防火墙状态
sudo firewall-cmd --reload           # 更新防火墙规则
sudo firewall-cmd --state            # 查看防火墙状态
sudo firewall-cmd --reload           # 重载防火墙规则
sudo firewall-cmd --list-ports       # 查看所有打开的端口
sudo firewall-cmd --list-services    # 查看所有允许的服务
sudo firewall-cmd --get-services     # 获取所有支持的服务

# 区域相关
sudo firewall-cmd --list-all-zones                      # 查看所有区域信息
sudo firewall-cmd --get-active-zones                    # 查看活动区域信息
sudo firewall-cmd --set-default-zone=public             # 设置 public 为默认区域
sudo firewall-cmd --get-default-zone                    # 查看默认区域信息
sudo firewall-cmd --zone=public --add-interface=eth0    # 将接口 eth0 加入区域 public

# 接口相关
sudo firewall-cmd --zone=public --remove-interface=eth0     # 从区域 public 中删除接口 eth0
sudo firewall-cmd --zone=default --change-interface=eth0    # 修改接口 eth0 所属区域为 default
sudo firewall-cmd --get-zone-of-interface=eth0              # 查看接口 eth0 所属区域

# 端口控制
sudo firewall-cmd --add-port=80/tcp --permanent                            # 永久添加 80 端口例外(全局)
sudo firewall-cmd --remove-port=80/tcp --permanent                         # 永久删除 80 端口例外(全局)
sudo firewall-cmd --add-port=65001-65010/tcp --permanent                   # 永久增加 65001-65010 例外(全局)
sudo firewall-cmd  --zone=public --add-port=80/tcp --permanent             # 永久添加 80 端口例外(区域public)
sudo firewall-cmd  --zone=public --remove-port=80/tcp --permanent          # 永久删除 80 端口例外(区域public)
sudo firewall-cmd  --zone=public --add-port=65001-65010/tcp --permanent    # 永久增加 65001-65010 例外(区域 public)
sudo firewall-cmd --query-port=8080/tcp                                    # 查询端口是否开放
sudo firewall-cmd --permanent --add-port=80/tcp                            # 开放 80 端口
sudo firewall-cmd --permanent --remove-port=8080/tcp                       # 移除端口
sudo firewall-cmd --reload                                                 # 重启防火墙(修改配置后要重启防火墙)
```

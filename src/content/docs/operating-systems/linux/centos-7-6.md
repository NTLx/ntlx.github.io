---
title: CentOS 7.6 配置指南
description: CentOS 7.6 系统配置和优化
---

![CentOS](https://docs.centos.org/en-US/8-docs/managing-userspace-components/_images/title_logo.svg)

:::note[重要]
Please follow the order of instructions in this guide for the best experience.
:::

## 1. System Initialization

### Basic Configuration & Packages

```bash
# If using a laptop, prevent sleep on lid close
sudo vim /etc/systemd/logind.conf
# Add/Uncomment: HandleLidSwitch=ignore
sudo systemctl restart systemd-logind

# Install EPEL and RPMForge repositories
wget http://repository.it4i.cz/mirrors/repoforge/redhat/el7/en/x86_64/rpmforge/RPMS/rpmforge-release-0.5.3-1.el7.rf.x86_64.rpm
rpm -ivh rpmforge-release-0.5.3-1.el7.rf.x86_64.rpm
sudo yum install epel-release
sudo yum upgrade

# Install essential development tools and libraries
sudo yum install net-tools gcc gcc-c++ clang make autoconf automake gettext gperf kernel-headers glibc-headers libcxx libcxx-devel libcutl libcutl-devel glibc-common vim wget htop ncdu axel openssl-devel ncurses-devel
```

## 2. Upgrade GCC (to v9.2.0)

CentOS 7 comes with an old GCC version. Follow these steps to compile and install GCC 9.2.0.

### Install Dependencies

**GMP v6.1.0**
```bash
axel ftp://gcc.gnu.org/pub/gcc/infrastructure/gmp-6.1.0.tar.bz2
tar -jxvf gmp-6.1.0.tar.bz2
cd gmp-6.1.0
./configure && make && make install
```

**MPFR v3.1.4**
```bash
axel ftp://gcc.gnu.org/pub/gcc/infrastructure/mpfr-3.1.4.tar.bz2
tar -jxvf mpfr-3.1.4.tar.bz2
cd mpfr-3.1.4
./configure && make && make install
```

**MPC v1.0.3**
```bash
axel ftp://gcc.gnu.org/pub/gcc/infrastructure/mpc-1.0.3.tar.gz
tar xf mpc-1.0.3.tar.bz2
cd mpc-1.0.3
./configure && make && make install
```

**ISL v0.18**
```bash
axel ftp://gcc.gnu.org/pub/gcc/infrastructure/isl-0.18.tar.bz2
tar xf isl-0.18.tar.bz2
cd isl-0.18/
./configure && make && make install
```

### Install GCC

```bash
axel ftp://ftp.gnu.org/gnu/gcc/gcc-9.2.0/gcc-9.2.0.tar.gz
tar xf gcc-9.2.0.tar.gz
cd gcc-9.2.0
./configure
make && make install
```

## 3. Python Environment

### Install Pip

```bash
sudo yum install python2-pip
sudo yum clean all
sudo pip install --upgrade pip
```

### Configure Pip Mirror (Aliyun)

```bash
mkdir -p ~/.config/pip
vim ~/.config/pip/pip.conf
```

Add the following content:

```ini
[global]
trusted-host = mirrors.aliyun.com
index-url = https://mirrors.aliyun.com/pypi/simple
```

## 4. Network & Proxy

### Shadowsocks

**Installation**
```bash
sudo pip install shadowsocks
```

**Client Usage**
```bash
# sudo sslocal -c US04.json
sudo sslocal -c US04.conf -d start
```

### Privoxy (HTTP Proxy)

**Installation**
```bash
sudo yum install privoxy
sudo vim /etc/privoxy/config
```

**Configuration**
Edit `/etc/privoxy/config`:
```conf
listen-address 127.0.0.1:8118
listen-address [::1]:8118 # for ipv6
forward-socks5 / 127.0.0.1:1080 . # global proxy via socks5
```

**Start Service**
```bash
sudo service privoxy start
sudo service privoxy status
```

**Environment Variables**

Temporary:
```bash
export https_proxy="http://127.0.0.1:8118"
export http_proxy="http://127.0.0.1:8118"
export ftp_proxy="http://127.0.0.1:8118"
```

Permanent (User):
Add to `~/.bashrc`:
```bash
proxy="http://127.0.0.1:8118"
export https_proxy=$proxy
export http_proxy=$proxy
export ftp_proxy=$proxy
export no_proxy="localhost, 127.0.0.1, ::1, ip.cn, chinaz.com"
```

### PAC Proxy (gfwlist)

```bash
sudo pip install gfwlist2privoxy
cd /tmp
wget https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt
gfwlist2privoxy -i gfwlist.txt -f gfwlist.action -p 127.0.0.1:1080 -t socks5
sudo cp gfwlist.action /etc/privoxy/
```

Add to `/etc/privoxy/config`:
```conf
actionsfile gfwlist.action
```

Restart Privoxy:
```bash
sudo service privoxy restart
```

## 5. Development Tools

### Tmux v2.9a

**Dependencies (ncurses & libevent)**

```bash
# ncurses v6.1
wget ftp://ftp.invisible-island.net/ncurses/ncurses.tar.gz
tar zxf ncurses.tar.gz
cd ncurses-6.1
./configure && make && sudo make install

# libevent v2.1.11
wget https://github.com/libevent/libevent/releases/download/release-2.1.11-stable/libevent-2.1.11-stable.tar.gz
tar zxf libevent-2.1.11-stable.tar.gz
cd libevent-2.1.11-stable
./configure && make && sudo make install

# Symlink fix if needed
ln -s /usr/local/lib/libevent-2.0.so.5 /usr/lib64/libevent-2.0.so.5
```

**Install Tmux**

```bash
wget https://github.com/tmux/tmux/releases/download/2.9a/tmux-2.9a.tar.gz
tar zxf tmux-2.9a.tar.gz
cd tmux-2.9a
./configure && make && sudo make install
```

### Zsh & Oh My Zsh

**Install Zsh v5.7.1**
```bash
# Download source from https://sourceforge.net/projects/zsh/files/zsh/5.7.1/zsh-5.7.1.tar.xz/download
cd zsh-5.7.1
./configure && make && sudo make install
```

**Install Oh My Zsh**
```bash
sh -c "$(wget https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh -O -)"
```

**Plugins & Theme**
```bash
git clone https://github.com/romkatv/powerlevel10k.git $ZSH_CUSTOM/themes/powerlevel10k
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
```

### Git

**Install from Source**
```bash
yum install curl-devel expat-devel gettext-devel openssl-devel zlib-devel
wget https://mirrors.edge.kernel.org/pub/software/scm/git/git-2.22.1.tar.gz
tar zxf git-2.22.1.tar.gz
cd git-2.22.1
./configure && make && sudo make install
```

**Configuration**
```bash
git config --global user.name "NTLx"
git config --global user.email "lx3325360@gmail.com"
# Proxy
git config --global http.proxy http://127.0.0.1:8118
git config --global https.proxy http://127.0.0.1:8118
```

### Rust & Cargo

**Install**
```bash
curl -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

**Mirrors (USTC)**
Edit `~/.bashrc`:
```bash
export RUSTUP_DIST_SERVER=https://mirrors.ustc.edu.cn/rust-static
export RUSTUP_UPDATE_ROOT=https://mirrors.ustc.edu.cn/rust-static/rustup
```

Edit `~/.cargo/config`:
```toml
[source.crates-io]
registry = "https://github.com/rust-lang/crates.io-index"
replace-with = 'ustc'
[source.ustc]
registry = "git://mirrors.ustc.edu.cn/crates.io-index"
```

### Ruby & RVM

**Install RVM**
```bash
sudo gpg2 --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3 7D2BAF1CF37B13E2069D6956105BD0E739499BDB
\curl -sSL https://get.rvm.io | bash -s stable
source ~/.bashrc
source ~/.bash_profile
```

**Install Ruby**
```bash
echo "ruby_url=https://cache.ruby-china.com/pub/ruby" > ~/.rvm/user/db
rvm install 2.6.3 --disable-binary
rvm use 2.6.3 --default
```

**Gem Mirror**
```bash
gem sources --add https://gems.ruby-china.com/ --remove https://rubygems.org/
```

### NodeJS

```bash
axel https://nodejs.org/dist/v12.11.0/node-v12.11.0.tar.gz
tar xf node-v12.11.0.tar.gz
cd node-v12.11.0
./configure && make && make install
```

### Java JDK v1.8

Download `jdk-8u221-linux-x64.tar.gz` from Oracle.

```bash
tar -zxf jdk-8u221-linux-x64.tar.gz
# Add to ~/.bashrc
export JAVA_HOME=/home/lx/jdk1.8.0_221
export CLASSPATH=.:${JAVA_HOME}/jre/lib/rt.jar:${JAVA_HOME}/lib/dt.jar:${JAVA_HOME}/lib/tools.jar
export PATH=$PATH:${JAVA_HOME}/bin
```

## 6. Services

### Samba (SMB)

**Install & Configure**
```bash
sudo yum install samba samba-libs samba-client samba-common samba-common-libs samba-common-tools
sudo touch /etc/samba/smbpasswd
sudo vim /etc/samba/smb.conf
```

**Minimal Config (`/etc/samba/smb.conf`)**
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
```

**User & Service**
```bash
sudo smbpasswd -a lx
sudo service smb start
```

### GitLab

**Install Dependencies**
```bash
sudo yum install curl policycoreutils openssh-server openssh-clients postfix
sudo systemctl enable postfix
sudo systemctl start postfix
```

**Install GitLab CE**
```bash
# Add Tsinghua Mirror
sudo vim /etc/yum.repos.d/gitlab-ce.repo
# [gitlab-ce]
# name=Gitlab CE Repository
# baseurl=https://mirrors.tuna.tsinghua.edu.cn/gitlab-ce/yum/el$releasever/
# gpgcheck=0
# enabled=1

sudo yum makecache
sudo yum install gitlab-ce
```

**Configure (`/etc/gitlab/gitlab.rb`)**
```ruby
external_url 'http://ntlx.tpddns.cn:45678'
gitlab_rails['smtp_enable'] = true
gitlab_rails['smtp_address'] = "smtp.exmail.qq.com"
# ... other smtp settings
```

**Start**
```bash
sudo gitlab-ctl reconfigure
sudo gitlab-ctl status
```

## 7. Bioinformatics Software

### HTSlib, Samtools, Bcftools

```bash
sudo yum install bzip2 bzip2-libs bzip2-devel xz xz-compat-libs xz-devel xz-libs xz-java
cd ~/htslib-1.9
./configure --prefix=/home/lx/software/htslib-1.9
# Add to PATH
export PATH="/home/lx/software/htslib-1.9/bin:$PATH"
export PATH="/home/lx/software/samtools-1.9/bin:$PATH"
export PATH="/home/lx/software/bcftools-1.9/bin:$PATH"
```

## 8. Troubleshooting

- **Find package provider**: `yum provides ifconfig`
- **Remove stubborn packages**:
    - Check package name: `rpm -qa | grep [package]`
    - Remove: `rpm -e [package]`

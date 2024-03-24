![CentOS](https://docs.centos.org/en-US/8-docs/managing-userspace-components/_images/title_logo.svg)

# Configuration Guide for CentOS 7.6

> Must follow the order !

# Must have

## System Init

```bash
# If using laptop
sudo vim /etc/systemd/logind.conf
# add content blow to /etc/systemd/logind.conf
# HandleLidSwitch=ignore
sudo systemctl restart systemd-logind

wget http://repository.it4i.cz/mirrors/repoforge/redhat/el7/en/x86_64/rpmforge/RPMS/rpmforge-release-0.5.3-1.el7.rf.x86_64.rpm
rpm -ivh rpmforge-release-0.5.3-1.el7.rf.x86_64.rpm
sudo yum install epel-release
sudo yum upgrade
sudo yum install net-tools gcc gcc-c++ clang make autoconf automake gettext gperf kernel-headers glibc-headers libcxx libcxx-devel libcutl libcutl-devel glibc-common vim wget htop ncdu axel openssl-devel ncurses-devel
```

## upgrade gcc

### install GMP v6.1.0

```bash
axel ftp://gcc.gnu.org/pub/gcc/infrastructure/gmp-6.1.0.tar.bz2
tar -jxvf gmp-6.1.0.tar.bz2
cd gmp-6.1.0
./configure
make && make install
```

### install MPFR v3.1.4

```bash
axel ftp://gcc.gnu.org/pub/gcc/infrastructure/mpfr-3.1.4.tar.bz2
tar -jxvf mpfr-3.1.4.tar.bz2
cd mpfr-3.1.4
./configure
make && make install
```

### install MPC v1.0.3

```bash
axel ftp://gcc.gnu.org/pub/gcc/infrastructure/mpc-1.0.3.tar.gz
tar xf mpc-1.0.3.tar.bz2
cd mpc-1.0.3
./configure
make && make install
```

### install isl v0.18

```bash
axel ftp://gcc.gnu.org/pub/gcc/infrastructure/isl-0.18.tar.bz2
tar xf isl-0.18.tar.bz2
cd isl-0.18/
./configure
make
make install
```

### install gcc v9.2.0

```bash
axel ftp://ftp.gnu.org/gnu/gcc/gcc-9.2.0/gcc-9.2.0.tar.gz
tar xf gcc-9.2.0.tar.gz
cd gcc-9.2.0
./configure
make && make install
```

## mirror for pip

```bash
mkdir -p ~/.config/pip
vim ~/.config/pip/pip.conf
```

Add this to your `pip.conf`:

```bash
[global]
trusted-host =  mirrors.aliyun.com
index-url = https://mirrors.aliyun.com/pypi/simple
```

## pip

```bash
sudo yum install python2-pip
sudo yum clean all
sudo pip install --upgrade pip
```

## shadowsocks

```bash
sudo pip install shadowsocks
```

### user client

```bash
# sudo sslocal -c US04.json
sudo sslocal -c US04.conf -d start
```

### server

## proxy

```bash
sudo yum install privoxy
sudo vim /etc/privoxy/config
```

Edit config:

```bash
listen-address 127.0.0.1:8118
listen-address [::1]:8118 # for ipv6
forward-socks5 / 127.0.0.1:1080 . # for global proxy
# blow is the custom proxy, set directly in privoxy config file
# forward-socks5 .google.com 127.0.0.1:1080 .
```

> [gfwlist rules for custom proxy](/Settings/PrivoxyConf) 2019-08-13

Activate:

```bash
sudo service privoxy start
sudo service privoxy status
```

### temp proxy

```bash
export https_proxy="http://127.0.0.1:8118" && export http_proxy="http://127.0.0.1:8118" && export ftp_proxy="http://127.0.0.1:8118"
```

### Global proxy

For all user:

```bash
sudo vim /etc/profile
```

For current user:

```bash
vim ~/.bashrc
```

Add this:

```bash
proxy="http://127.0.0.1:8118"
export https_proxy=$proxy
export http_proxy=$proxy
export ftp_proxy=$proxy
export no_proxy="localhost, 127.0.0.1, ::1, ip.cn, chinaz.com"
```

### PAC proxy

```bash
sudo pip install gfwlist2privoxy
cd /tmp
wget https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt
gfwlist2privoxy -i gfwlist.txt -f gfwlist.action -p 127.0.0.1:1080 -t socks5
sudo cp gfwlist.action /etc/privoxy/
```

> Manually add specific URL to PAC: `echo '.google.com' >> /etc/privoxy/gfwlist.action`

To active PAC mode, add below to `/etc/privoxy/config`:

```bash
actionsfile gfwlist.action
```

then:

```bash
sudo service privoxy restart
```

## ncurses v6.1

```bash
wget ftp://ftp.invisible-island.net/ncurses/ncurses.tar.gz
tar zxf ncurses.tar.gz
cd ncurses-6.1
./configure
make
sudo make install
```

## libevent v2.1.11

```bash
wget https://github.com/libevent/libevent/releases/download/release-2.1.11-stable/libevent-2.1.11-stable.tar.gz
tar zxf libevent-2.1.11-stable.tar.gz
cd
./configure
make
sudo make install
```

May need to do:

```bash
# x64
ln -s /usr/local/lib/libevent-2.0.so.5 /usr/lib64/libevent-2.0.so.5
# x32
ln -s /usr/local/lib/libevent-2.0.so.5 /usr/lib/libevent-2.0.so.5
```

## tmux v2.9a

> Require `ncurses` and `libevent`

```bash
wget https://github.com/tmux/tmux/releases/download/2.9a/tmux-2.9a.tar.gz
tar zxf tmux-2.9a.tar.gz
cd tmux-2.9a
./configure && make
sudo make install
```

Or install by clone git repo

```bash
git clone https://github.com/tmux/tmux.git
cd  tmux/
sh autogen.sh
./configure
make && make install
```

Or install tmux using conda, but highly recommend manually install the newest ncurses and libevent.

May need to do:

```bash
CFLAGS="-I/usr/local/include" LDFLAGS="-L//usr/local/lib" ./configure
```

### TMUX Config

[Tmux Config file](/Settings/Tmux)

## zsh v5.7.1

```bash
# Download from https://sourceforge.net/projects/zsh/files/zsh/5.7.1/zsh-5.7.1.tar.xz/download
cd zsh-5.7.1
./configure
make
sudo make install
```

Or install zsh using conda.

# Custom

## vim config

See [Vim config](/Settings/VimConf)

## miniconda

```bash
wget https://mirrors.tuna.tsinghua.edu.cn/anaconda/miniconda/Miniconda3-latest-Linux-x86_64.sh
sh Miniconda3-latest-Linux-x86_64.sh
source ~/.bashrc
conda config --set show_channel_urls yes
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/free/
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/main/
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud/conda-forge/
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud/bioconda/
conda update conda
```

## git

> Install git using conda (v2.22.0), or form source (v2.22.1) like blow.

```bash
yum install curl-devel expat-devel gettext-devel openssl-devel zlib-devel
wget https://mirrors.edge.kernel.org/pub/software/scm/git/git-2.22.1.tar.gz
tar zxf git-2.22.1.tar.gz
cd git-2.22.1
./configure
make
sudo make install
```

### global git configure

```bash
ssh-keygen -t rsa -b 4096 -C "lx3325360@gmail.com"
git config --global user.name "NTLx"
git config --global user.email "lx3325360@gmail.com"
```

### proxy for git

```bash
git config --global http.proxy http://127.0.0.1:8118
git config --global https.proxy http://127.0.0.1:8118
```

### gpg key v2.0.22

> included in CentOS 7 by default

#### Generating a new GPG key

```bash
gpg2 --gen-key
```

#### Checking for existing GPG keys

```bash
gpg2 --list-secret-keys --keyid-format LONG
```

#### export exist GPG key

```bash
gpg2 --armor --export KEY_ID
```

#### Telling Git about your signing key

```bash
git config --global user.signingkey KEY_ID
```

## zsh

> for `Oh My Zsh`

```bash
conda install zsh
cd ~
sh -c "$(wget https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh -O -)"
git clone https://github.com/romkatv/powerlevel10k.git $ZSH_CUSTOM/themes/powerlevel10k
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
```

### Edit `~/.zshrc`

```bash
export TERM="xterm-256color"

ZSH_THEME="powerlevel10k/powerlevel10k"
POWERLEVEL9K_MODE="nerdfont-complete"
#POWERLEVEL9K_DISABLE_RPROMPT=true
POWERLEVEL9K_PROMPT_ON_NEWLINE=true
POWERLEVEL9K_LEFT_PROMPT_ELEMENTS=(os_icon user dir_writable dir vcs)
POWERLEVEL9K_RIGHT_PROMPT_ELEMENTS=(status command_execution_time root_indicator background_jobs time disk_usage ram load)
POWERLEVEL9K_MULTILINE_LAST_PROMPT_PREFIX="%(?:%{$fg_bold[green]%}➜ :%{$fg_bold[red]%}➜ )"
POWERLEVEL9K_MULTILINE_FIRST_PROMPT_PREFIX=""
POWERLEVEL9K_USER_ICON="\uF415" # <U+F415>
POWERLEVEL9K_ROOT_ICON="\uF09C"
POWERLEVEL9K_SUDO_ICON=$'\uF09C' # <U+F09C>
POWERLEVEL9K_TIME_FORMAT="%D{%H:%M}"
POWERLEVEL9K_VCS_GIT_ICON='\uF408'
POWERLEVEL9K_VCS_GIT_GITHUB_ICON='\uF408'

# End Powerlevel9k configuration

#ZSH_DISABLE_COMPFIX=true
#ENABLE_CORRECTION="true"
#COMPLETION_WAITING_DOTS="true"

plugins=(git zsh-syntax-highlighting)
```

## install graphviz

```bash
sudo yum install graphviz graphviz-ruby graphviz-python graphviz-php graphviz-perl graphviz-java graphviz-gd graphviz-doc graphviz-devel
```

## SMB

> login with default guest user [nobody] , no password request.

### set firewall

```bash
sudo firewall-cmd --zone=public --add-port=139/tcp --permanent
# sudo firewall-cmd --zone=public --add-port=139/udp --permanent
# sudo firewall-cmd --zone=public --add-port=445/tcp --permanent
sudo firewall-cmd --zone=public --add-port=445/udp --permanent
sudo firewall-cmd --add-service samba --permanent
sudo service firewalld restart
sudo firewall-cmd --list-all|grep samba
```

### close SELinux

```bash
sudo vim /etc/sysconfig/selinux
# SELINUX=disabled
sudo setenforce 0
sudo getenforce
```

### install samba

```bash
sudo yum install samba samba-libs samba-client samba-common samba-common-libs samba-common-tools
```

### prepare config file

```bash
sudo touch /etc/samba/smbpasswd
sudo vim /etc/samba/smb.conf
```

### minimal config

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

### set user

```bash
sudo useradd -g share -s /sbin/nologin upload
sudo smbpasswd -a lx
# then set password
```

### start smb service

```bash
sudo service smb start
# sudo service smb restart
# sudo service nmb restart
```

## aria2

```bash
sudo yum install aria2
conda install nodejs
git clone git@github.com:ziahamza/webui-aria2.git

cd webui-aria2
aria2c --enable-rpc --rpc-listen-all
node node-server.js
```

## ImageMagick v7.0.9-2

```bash
sudo yum install libjpeg-turbo libjpeg-turbo-utils libjpeg-turbo-devel libjpeg-turbo-static libpng libpng-static libpng-devel libtiff libtiff-devel libtiff-static libtiff-tools giflib freetype freetype-devel zlib zlib-devel zlib-static
wget http://www.imagemagick.org/download/ImageMagick-7.0.9-2.zip
unzip ImageMagick-7.0.9-2.zip
cd ImageMagick-7.0.9-2
sudo ./configure
sudo make
sudo make install
```

## NodeJS

```bash
axel https://nodejs.org/dist/v12.11.0/node-v12.11.0.tar.gz
tar xf node-v12.11.0.tar.gz
cd node-v12.11.0
./configure
make && make install
```

## Rust & Cargo

### mirror for rust

```bash
vim ~/.bashrc
```

```bash
export RUSTUP_DIST_SERVER=https://mirrors.ustc.edu.cn/rust-static
export RUSTUP_UPDATE_ROOT=https://mirrors.ustc.edu.cn/rust-static/rustup
```

```bash
source ~/.bashrc
```

### install rust

```bash
curl -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### mirror for cargo

```bash
vim .cargo/config
```

```bash
[source.crates-io]
registry = "https://github.com/rust-lang/crates.io-index"
replace-with = 'ustc'
[source.ustc]
registry = "git://mirrors.ustc.edu.cn/crates.io-index"
```

### lsd exa ripgrep

```bash
cargo install lsd exa ripgrep
```

## rvm & ruby

```bash
sudo gpg2 --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3 7D2BAF1CF37B13E2069D6956105BD0E739499BDB
\curl -sSL https://get.rvm.io | bash -s stable
source ~/.bashrc
source ~/.bash_profile
```

or:

```bash
sudo gpg2 --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3 7D2BAF1CF37B13E2069D6956105BD0E739499BDB
wget https://github.com/rvm/rvm/archive/1.29.9.tar.gz
tar zxf 1.29.9.tar.gz
cd rvm-1.29.9
./install
source ~/.bashrc
source ~/.bash_profile
```

If using zsh, you need add this to `~/.zshrc` after above:

```bash
# Add RVM to PATH for scripting. Make sure this is the last PATH variable change.
export PATH="$PATH:$HOME/.rvm/bin"
[[ -s "$HOME/.rvm/scripts/rvm" ]] && source "$HOME/.rvm/scripts/rvm" # Load RVM into a shell session *as a function*
```

### mirror for rvm to install ruby

```bash
echo "ruby_url=https://cache.ruby-china.com/pub/ruby" > ~/.rvm/user/db
```

### install ruby

```bash
rvm list known
rvm install 2.6.3 --disable-binary
rvm use 2.6.3 --default
rvm list
rvm gemset list
```

### mirror for ruby gem

```bash
gem sources --add https://gems.ruby-china.com/ --remove https://rubygems.org/
gem sources -l
# ensure there's only gems.ruby-china.com
gem update --system
```

### config `~/.gemrc`

```bash
---
:backtrace: false
:bulk_threshold: 1000
:sources:
- https://gems.ruby-china.com/
:update_sources: true
:verbose: true
:concurrent_downloads: 8
install: --no-document
update: --no-document
```

## gollum

```bash
sudo yum install icu libicu libicu-devel
gem install gollum
```

## perl

Install by conda:

```bash
conda install perl perl-app-cpanminus
```

or use source:

```bash
wget https://www.cpan.org/src/5.0/perl-5.30.0.tar.gz
tar -xzf perl-5.30.0.tar.gz
cd perl-5.30.0
./Configure -des -Dprefix=$HOME/software/perl-5.30.0
make
make test
make install
```

### set mirror

Edit mirror for already used once cpan with file `~/.cpan/CPAN/MyConfig.pm`

```bash
'urllist' => [q[http://mirrors.aliyun.com/CPAN/]],
```

### install packages

use cpan:

```bash
cpan -i Term::ReadLine::Perl
cpan -i Log::Log4perl
cpan -i Module::Build
cpan -i JSON
cpan -i Getopt::Long
cpan -i Parallel::ForkManager
cpan -i Statistics::Descriptive
cpan -i YAML::Any
cpan -i Date::Manip
cpan -i Math::BigFloat
cpan -i Math::Complex
#cpan -i utf8::all
cpan -i List::Util
cpan -i Spreadsheet::ParseXLSX
cpan -i Excel::Writer::XLSX
cpan -i PAR::Packer
```

or cpanm:

```bash
cpanm -n Term::ReadLine::Perl
cpanm -n Log::Log4perl
cpanm -n Module::Build
cpanm -n JSON
cpanm -n Getopt::Long
cpanm -n Parallel::ForkManager
cpanm -n Statistics::Descriptive
cpanm -n YAML::Any
cpanm -n Date::Manip
cpanm -n Math::BigFloat
cpanm -n Math::Complex
#cpanm -n utf8::all
cpanm -n List::Util
cpanm -n Spreadsheet::ParseXLSX
cpanm -n Excel::Writer::XLSX
cpanm -n PAR::Packer
```

### pack perl script to excutable file

INSTALLING PAR::PACKER (IN WINDOWS OR LINUX)

1. Download and install [Strawberry Perl](http://strawberryperl.com/)
2. Install cpanm to more easily install CPAN modules. In a command prompt, run:

```bash
cpan -i App::cpanminus
cpanm -n PAR::Packer

# To create the executable, run:
pp -o example.exe example.pl
```

# Install Java JDK v1.8

Download from [Official Web Site](https://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)

```bash
tar -zxf jdk-8u221-linux-x64.tar.gz
vim ~/.bashrc
#java environment
export JAVA_HOME=/home/lx/jdk1.8.0_221
export CLASSPATH=.:${JAVA_HOME}/jre/lib/rt.jar:${JAVA_HOME}/lib/dt.jar:${JAVA_HOME}/lib/tools.jar
export PATH=$PATH:${JAVA_HOME}/bin
```

# firewall

```bash
sudo firewall-cmd --zone=public --add-port=22/tcp --permanent
sudo firewall-cmd --zone=public --add-port=22/udp --permanent
sudo service firewalld restart
```

# Install GitLab

```bash
# 配置服务器时间同步
sudo yum install ntpdate
sudo ntpdate ntp.aliyun.com

# 永久关闭 selinux
vim /etc/sysconfig/selinux
# SELINUX=disabled
# 临时关闭 selinux
setenforce 0

# 安装依赖程序
sudo yum install curl policycoreutils openssh-server openssh-clients

# 安装 postfix 邮件服务 GitLab 发送邮件使用
sudo yum install postfix
sudo vim /etc/postfix/main.cf
# 发现配置为：
# inet_interfaces = localhost
# 改成：
# inet_interfaces = all
sudo systemctl enable postfix
sudo systemctl start postfix
sudo systemctl status postfix

# 选用国内清华大学提供的 gitlab-ce 仓库安装 GitLab
sudo mkdir -p /etc/yum.repos.d
sudo vim /etc/yum.repos.d/gitlab-ce.repo
# [gitlab-ce]
# name=Gitlab CE Repository
# baseurl=https://mirrors.tuna.tsinghua.edu.cn/gitlab-ce/yum/el$releasever/
# gpgcheck=0
# enabled=1
sudo yum makecache
sudo yum install gitlab-ce

# 配置 GitLab
# 主要是更改服务器地址和邮件发送功能，在后期用户注册和账户密码找回使用
## GitLab 配置文件
## 安装完成后 GitLab 的配置文件位于 /etc/gitlab 目录下名为 gitlab.rb
## 修改之前先进行备份
sudo cp /etc/gitlab/gitlab.rb /etc/gitlab/gitlab.rb.bak
sudo vim /etc/gitlab/gitlab.rb
# gitlab 访问地址，可以是域名、IP地址或着IP地址加端口
external_url 'http://ntlx.tpddns.cn:45678'
# GitLab 邮件服务设置
## 配置下面，需要配置smtp_tls
## 注意gitlab_rails['smtp_tls'] 这个是设定为true
gitlab_rails['smtp_enable'] = true
gitlab_rails['smtp_address'] = "smtp.exmail.qq.com"
gitlab_rails['smtp_port'] = 465
gitlab_rails['smtp_user_name'] = "xiang.li@oebiotech.com"
gitlab_rails['smtp_password'] = "passwd"
gitlab_rails['smtp_domain'] = "smtp.exmail.qq.com"
gitlab_rails['smtp_authentication'] = "login"
gitlab_rails['smtp_enable_starttls_auto'] = true
gitlab_rails['smtp_tls'] = true
## 配置邮箱来源， 与展示的名称
gitlab_rails['gitlab_email_enabled'] = true
gitlab_rails['gitlab_email_from'] = 'xiang.li@oebiotech.com'
gitlab_rails['gitlab_email_display_name'] = 'Gitlab'

# 启动 GitLab 服务
# 如果配置文件发生更改需要重新执行此命令
sudo gitlab-ctl reconfigure

# 查看 GitLab 状态
sudo gitlab-ctl status

# firewall
sudo firewall-cmd --zone=public --add-port=45678/tcp --permanent
sudo firewall-cmd --zone=public --add-port=45678/udp --permanent
sudo service firewalld restart
```

# Bioinfomatics Software Installation

## htslib samtools bcftools

```bash
sudo yum install bzip2 bzip2-libs bzip2-devel
sudo yum install xz xz-compat-libs xz-devel xz-libs xz-java
cd ~/htslib-1.9
./configure --prefix=/home/lx/software/htslib-1.9
export PATH="/home/lx/software/htslib-1.9/bin:$PATH"
export PATH="/home/lx/software/samtools-1.9/bin:$PATH"
export PATH="/home/lx/software/bcftools-1.9/bin:$PATH"
```

# Tips

```bash
yum provides ifconfig
```

# Bugs

## Installed package can not erase by yum

check rpm related package: `rpm -qa | grep [package]`

check whether installed or not: `rpm -q [package]`

remove package: `rpm -e [package]`

![](https://manjaro.org/img/logo.svg)

Manjaro is a user-friendly Linux distribution based on the independently developed Arch operating system.

![setting](https://wiki.manjaro.org/images/e/e5/Control.png)![software](https://wiki.manjaro.org/images/a/a2/Octopi.png)

# Settings after Installation

## set language

add blow to `~/.bashrc` or `~/.zshrc`

```bash
export LANGUAGE=en_US.utf8
export LC_ALL=en_US.utf8
export LANG=en_US.utf8
```

## change source mirror

> choose https://mirrors.sjtug.sjtu.edu.cn

```bash
sudo pacman -Syy
sudo pacman-mirrors -i -c China -m rank
sudo pacman -Syyu
```

then edit `/etc/pacman.conf`, add:

```bash
[archlinuxcn]
SigLevel = Optional TrustedOnly
Server = https://mirrors.sjtug.sjtu.edu.cn/archlinux-cn/$arch
```

then:

```bash
sudo pacman -Syy && sudo pacman -S archlinuxcn-keyring
sudo pacman -Su
```

## using proxy for pacman

### through curl

```bash
sudo vim /etc/pacman.conf
XferCommand = /usr/bin/curl -x http://127.0.0.1:8888 -C - -f %u --output %o
```

### through wget

```bash
XferCommand = /usr/bin/wget -e http_proxy=http://127.0.0.1:8888 --passive-ftp -c -O %o %u
```

or

```bash
sudo vim /etc/wgetrc
https_proxy = http://127.0.0.1:8888
http_proxy = http://127.0.0.1:8888
ftp_proxy = http://127.0.0.1:8888

sudo vim /etc/pacman.conf
XferCommand = /usr/bin/wget --passive-ftp -c -O %o %u
```

## dependency installation

```bash
sudo pacman -S clang make cmake gdb c-ares cunit graphviz gnutls gmp expat curl autoconf automake icu libconfig libgcrypt pkgconf libssh2 libuv libxml2 libxml++ make ncurses nettle nodejs nodejs-material-design-icons openssh openssl pcre pcre2 postfix sqlite zlib wget tar git vim htop ncdu axel privoxy
```

## tmux

```bash
sudo pacman -S tmux
```

> Tmux [config file](http://lx.ntlx.xyz:10080/share/90CqiN7A)

## zsh

```bash
sudo pacman -S zsh zsh-lovers
sh -c "$(wget https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh -O -)"
git clone https://github.com/romkatv/powerlevel10k.git $ZSH_CUSTOM/themes/powerlevel10k
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
```

setting `~/.zshrc` like below:

```bash
export TERM="xterm-256color"

ZSH_THEME="powerlevel10k/powerlevel10k"
#POWERLEVEL9K_MODE="nerdfont-complete"
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
```

### Using system zsh configure

If you choose zsh during installation, you will be use pacman managed zsh, then you should install zsh related packages like below:

```bash
sudo pacman -S acpi awesome-terminal-fonts git mercurial powerline-fonts systemd manjaro-zsh-config zsh-autosuggestions zsh-completions zsh-history-substring-search zsh-lovers zsh-syntax-highlighting zsh-theme-powerlevel9k
```

then, setting like below:

```bash
echo 'source /usr/share/zsh-theme-powerlevel9k/powerlevel9k.zsh-theme' >> ~/.zshrc
```

## install FiraCode

> Nerd Fonts

```bash
wget https://github.com/ryanoasis/nerd-fonts/releases/download/v2.1.0/FiraCode.zip
unzip FiraCode.zip
rm Fura*.otf
rm Fura*Windows*.ttf
sudo mkdir -p /usr/share/fonts/TTF
sudo mv Fura*.ttf /usr/share/fonts/TTF/
fc-cache -fv
```

## samba

```bash
sudo pacman -S samba gvfs-smb thunar-shares-plugin manjaro-settings-samba
sudo cp /etc/samba/smb.conf /etc/samba/smb.conf.orig
sudo touch /etc/samba/smbpasswd
sudo vim /etc/samba/smb.conf
testparm
sudo smbpasswd -a lx
sudo systemctl enable smb nmb
sudo systemctl start smb nmb
sudo reboot
```

### samba configure file

```bash
[global]
    workgroup = WORKGROUP
    security = user
    netbios name = Manjaro
    hosts allow = 192.168.120.
    passdb backend = smbpasswd
    encrypt passwords = true
    smb passwd file = /etc/samba/smbpasswd
    log file = /var/log/samba/log.%m
    max open files = 1000

[public]
    comment = Manjaro public
    path = /public
    valid users = lx
    writable = yes
    browseable = yes
    available = yes
```

## aria2 v1.35.0

```bash
wget https://github.com/aria2/aria2/releases/download/release-1.35.0/aria2-1.35.0.tar.gz
tar zxf aria2-1.35.0.tar.gz
cd aria2-1.35.0
./configure --prefix=/public/software/aria2-1.35.0
make
make install
```

### webui for aria2

```bash
git clone git@github.com:ziahamza/webui-aria2.git
cd webui-aria2
/public/software/aria2-1.35.0/bin/aria2c --enable-rpc --rpc-listen-all
node node-server.js
```

## Rust

### mirror for rust

> add blow to `~/.bashrc` or `~/.zshrc`

```bash
export RUSTUP_DIST_SERVER=https://mirrors.ustc.edu.cn/rust-static
export RUSTUP_UPDATE_ROOT=https://mirrors.ustc.edu.cn/rust-static/rustup
```

### install rust

```bash
curl -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### mirror for cargo

> set blow in `~/.cargo/config`

```bash
[source.crates-io]
registry = "https://github.com/rust-lang/crates.io-index"
replace-with = 'ustc'
[source.ustc]
registry = "git://mirrors.ustc.edu.cn/crates.io-index"
```

### install lsd & exa

```bash
cargo install lsd exa
```

## packages for perl

```bash
cpan -i Term::ReadLine::Perl
cpan -i Log::Log4perl
cpan -i Module::Build
cpan -i JSON
cpan -i Getopt::Long
cpan -i Parallel::ForkManager
cpan -i YAML::Any
cpan -i Date::Manip
cpan -i Math::BigFloat
cpan -i Math::Complex
cpan -i List::Util
cpan -i PAR::Packer
```

## Google Pinyin input method (optional)

```bash
pacman -S fcitx-im fcitx-configtool fcitx-googlepinyin
vim ~/.xprofile
# add below
export LC_ALL=zh_CN.UTF-8
export GTK_IM_MODULE=fcitx
export QT_IM_MODULE=fcitx
export XMODIFIERS=“@im=fcitx”
```

## Sogou Pinyin input method (optional)

```bash
sudo pacman -S fcitx-im fcitx-configtool fcitx-sogoupinyin
vim ~/.xprofile
# add below
export GTK_IM_MODULE=fcitx
export QT_IM_MODULE=fcitx
export XMODIFIERS="@im=fcitx"
```

# Tips

## pacman

```bash
pacman -S package_name        # 安装软件
pacman -S extra/package_name  # 安装不同仓库中的版本
pacman -Syu                   # 升级整个系统，y是更新数据库，yy是强制更新，u是升级软件
pacman -Ss string             # 在包数据库中查询软件
pacman -Si package_name       # 显示软件的详细信息
pacman -Sc                    # 清除软件缓存，即/var/cache/pacman/pkg目录下的文件
pacman -Scc                   # 清理所有的缓存文件
pacman -R package_name        # 删除单个软件
pacman -Rs package_name       # 删除指定软件及其没有被其他已安装软件使用的依赖关系
pacman -Qs string             # 查询已安装的软件包
pacman -Qi package_name       # 查询本地安装包的详细信息
pacman -Ql package_name       # 获取已安装软件所包含的文件的列表
pacman -U package.tar.zx      # 从本地文件安装
pactree package_name          # 显示软件的依赖树
```

## usefull software

```bash
sudo pacman -S google-chrome
sudo pacman -S visual-studio-code-bin                     # VS Code
sudo pacman -S netease-cloud-music                        # 网易云音乐
sudo pacman -S wps-office ttf-wps-fonts                   # WPS Office
sudo pacman -S texlive-most texlive-langchinese texstudio # TeXLive
```

## Software based on Electron

```bash
sudo pacman -S electron-ssr                               # Shadowsocksr client using electron.
sudo pacman -S electron-netease-cloud-music               # UNOFFICIAL client for music.163.com . Powered by Electron, Vue, and Muse-UI.
sudo pacman -S electronic-wechat                          # A better WeChat client
sudo pacman -S teams-for-linux                            # Unofficial Microsoft Teams client for Linux using Electron.
sudo pacman -S google-chinese-handwriting-ime-git         # Chinese handwriting IME powered by Google Translate. MacOS style touchpad writing is supported. Written in Electron for Linux.
```

# Direct Reference

[manjaro.org](https://manjaro.org/)
[wiki.manjaro.org](https://wiki.manjaro.org/index.php?title=About_Manjaro)
[安装Manjaro之后的配置](http://panqiincs.me/2019/06/05/after-installing-manjaro/)
[Manjaro 配置Samba 共享文件夹给Windows 访问](https://blog.csdn.net/aaa111/article/details/82774860)
[Arch Linux WiKi: Fonts](https://wiki.archlinux.org/index.php?title=Fonts&oldid=588239)
[nerdfonts.com](https://www.nerdfonts.com/)
[Manjaro安装googlepinyin](https://blog.csdn.net/ppggxn/article/details/82263332)
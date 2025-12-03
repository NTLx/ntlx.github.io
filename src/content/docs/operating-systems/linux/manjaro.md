---
title: Manjaro 配置指南
description: Manjaro Linux 系统配置
---

![Manjaro Logo](https://manjaro.org/img/logo.svg)

Manjaro is a user-friendly Linux distribution based on the independently developed Arch operating system.

![Control Panel](https://wiki.manjaro.org/images/e/e5/Control.png) ![Octopi](https://wiki.manjaro.org/images/a/a2/Octopi.png)

## 1. Post-Installation Configuration

### Set Language

Add the following to your `~/.bashrc` or `~/.zshrc` file to set the system language to English (US).

```bash
export LANGUAGE=en_US.utf8
export LC_ALL=en_US.utf8
export LANG=en_US.utf8
```

### Change Source Mirror

To improve download speeds, switch to a faster mirror (e.g., SJTU in China).

1.  **Update mirror list:**

    ```bash
    sudo pacman -Syy
    sudo pacman-mirrors -i -c China -m rank
    sudo pacman -Syyu
    ```

2.  **Add Arch Linux CN repository:**

    Edit `/etc/pacman.conf` and add the following lines:

    ```ini
    [archlinuxcn]
    SigLevel = Optional TrustedOnly
    Server = https://mirrors.sjtug.sjtu.edu.cn/archlinux-cn/$arch
    ```

3.  **Update and install keyring:**

    ```bash
    sudo pacman -Syy && sudo pacman -S archlinuxcn-keyring
    sudo pacman -Su
    ```

### Configure Proxy for Pacman

If you are behind a proxy, configure `pacman` to use it.

#### Option 1: Using curl

Edit `/etc/pacman.conf`:

```ini
XferCommand = /usr/bin/curl -x http://127.0.0.1:8888 -C - -f %u --output %o
```

#### Option 2: Using wget

Edit `/etc/pacman.conf`:

```ini
XferCommand = /usr/bin/wget -e http_proxy=http://127.0.0.1:8888 --passive-ftp -c -O %o %u
```

**Alternatively**, configure `wget` globally:

1.  Edit `/etc/wgetrc`:

    ```ini
    https_proxy = http://127.0.0.1:8888
    http_proxy = http://127.0.0.1:8888
    ftp_proxy = http://127.0.0.1:8888
    ```

2.  Then update `/etc/pacman.conf`:

    ```ini
    XferCommand = /usr/bin/wget --passive-ftp -c -O %o %u
    ```

## 2. Software Installation

### Install Common Dependencies

Install a set of commonly used development libraries and tools.

```bash
sudo pacman -S clang make cmake gdb c-ares cunit graphviz gnutls gmp expat curl autoconf automake icu libconfig libgcrypt pkgconf libssh2 libuv libxml2 libxml++ make ncurses nettle nodejs nodejs-material-design-icons openssh openssl pcre pcre2 postfix sqlite zlib wget tar git vim htop ncdu axel privoxy
```

### Install Tmux

```bash
sudo pacman -S tmux
```

:::tip
You can find a sample Tmux configuration file [here](http://lx.ntlx.xyz:10080/share/90CqiN7A).
:::

### Install and Configure Zsh

1.  **Install Zsh and Oh My Zsh:**

    ```bash
    sudo pacman -S zsh zsh-lovers
    sh -c "$(wget https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh -O -)"
    ```

2.  **Install Plugins and Themes:**

    ```bash
    git clone https://github.com/romkatv/powerlevel10k.git $ZSH_CUSTOM/themes/powerlevel10k
    git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
    ```

3.  **Configure `~/.zshrc`:**

    Add the following configuration to your `~/.zshrc`:

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

#### Using System Zsh Configuration

If you chose Zsh during Manjaro installation, you can install the official Manjaro Zsh packages:

```bash
sudo pacman -S acpi awesome-terminal-fonts git mercurial powerline-fonts systemd manjaro-zsh-config zsh-autosuggestions zsh-completions zsh-history-substring-search zsh-lovers zsh-syntax-highlighting zsh-theme-powerlevel9k
```

Then, enable the Powerlevel9k theme:

```bash
echo 'source /usr/share/zsh-theme-powerlevel9k/powerlevel9k.zsh-theme' >> ~/.zshrc
```

### Install Fonts (FiraCode)

Install Nerd Fonts for better terminal icons.

```bash
wget https://github.com/ryanoasis/nerd-fonts/releases/download/v2.1.0/FiraCode.zip
unzip FiraCode.zip
rm Fura*.otf
rm Fura*Windows*.ttf
sudo mkdir -p /usr/share/fonts/TTF
sudo mv Fura*.ttf /usr/share/fonts/TTF/
fc-cache -fv
```

### Install Samba

Set up file sharing with Samba.

1.  **Install packages:**

    ```bash
    sudo pacman -S samba gvfs-smb thunar-shares-plugin manjaro-settings-samba
    ```

2.  **Configure Samba:**

    ```bash
    sudo cp /etc/samba/smb.conf /etc/samba/smb.conf.orig
    sudo touch /etc/samba/smbpasswd
    sudo vim /etc/samba/smb.conf
    ```

    **Example `smb.conf`:**

    ```ini
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

3.  **Finalize setup:**

    ```bash
    testparm
    sudo smbpasswd -a lx
    sudo systemctl enable smb nmb
    sudo systemctl start smb nmb
    sudo reboot
    ```

### Install Aria2

Install Aria2 (example with version 1.35.0).

```bash
wget https://github.com/aria2/aria2/releases/download/release-1.35.0/aria2-1.35.0.tar.gz
tar zxf aria2-1.35.0.tar.gz
cd aria2-1.35.0
./configure --prefix=/public/software/aria2-1.35.0
make
make install
```

#### WebUI for Aria2

```bash
git clone git@github.com:ziahamza/webui-aria2.git
cd webui-aria2
/public/software/aria2-1.35.0/bin/aria2c --enable-rpc --rpc-listen-all
node node-server.js
```

## 3. Development Environment

### Rust

1.  **Configure Mirrors:**

    Add to `~/.bashrc` or `~/.zshrc`:

    ```bash
    export RUSTUP_DIST_SERVER=https://mirrors.ustc.edu.cn/rust-static
    export RUSTUP_UPDATE_ROOT=https://mirrors.ustc.edu.cn/rust-static/rustup
    ```

2.  **Install Rust:**

    ```bash
    curl -sSf https://sh.rustup.rs | sh
    source $HOME/.cargo/env
    ```

3.  **Configure Cargo Mirror:**

    Add to `~/.cargo/config`:

    ```toml
    [source.crates-io]
    registry = "https://github.com/rust-lang/crates.io-index"
    replace-with = 'ustc'
    [source.ustc]
    registry = "git://mirrors.ustc.edu.cn/crates.io-index"
    ```

4.  **Install Tools (lsd & exa):**

    ```bash
    cargo install lsd exa
    ```

### Perl Packages

Install common Perl modules using `cpan`.

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

## 4. Input Methods (Optional)

### Google Pinyin

```bash
sudo pacman -S fcitx-im fcitx-configtool fcitx-googlepinyin
vim ~/.xprofile
```

Add the following to `~/.xprofile`:

```bash
export LC_ALL=zh_CN.UTF-8
export GTK_IM_MODULE=fcitx
export QT_IM_MODULE=fcitx
export XMODIFIERS="@im=fcitx"
```

### Sogou Pinyin

```bash
sudo pacman -S fcitx-im fcitx-configtool fcitx-sogoupinyin
vim ~/.xprofile
```

Add the following to `~/.xprofile`:

```bash
export GTK_IM_MODULE=fcitx
export QT_IM_MODULE=fcitx
export XMODIFIERS="@im=fcitx"
```

## 5. Tips & Tricks

### Pacman Commands

| Command | Description |
| :--- | :--- |
| `pacman -S package_name` | Install a package |
| `pacman -S extra/package_name` | Install a version from a specific repository |
| `pacman -Syu` | Update package database and upgrade system |
| `pacman -Ss string` | Search for a package in the database |
| `pacman -Si package_name` | Show detailed information about a package |
| `pacman -Sc` | Clear package cache (files in `/var/cache/pacman/pkg`) |
| `pacman -Scc` | Clear all cache files |
| `pacman -R package_name` | Remove a single package |
| `pacman -Rs package_name` | Remove a package and its unused dependencies |
| `pacman -Qs string` | Search for installed packages |
| `pacman -Qi package_name` | Show detailed information about an installed package |
| `pacman -Ql package_name` | List files owned by an installed package |
| `pacman -U package.tar.zx` | Install from a local file |
| `pactree package_name` | Show dependency tree of a package |

### Useful Software

```bash
# Google Chrome
sudo pacman -S google-chrome

# VS Code
sudo pacman -S visual-studio-code-bin

# NetEase Cloud Music
sudo pacman -S netease-cloud-music

# WPS Office
sudo pacman -S wps-office ttf-wps-fonts

# TeXLive
sudo pacman -S texlive-most texlive-langchinese texstudio
```

### Electron-based Software

```bash
# ShadowsocksR client
sudo pacman -S electron-ssr

# Unofficial NetEase Cloud Music client
sudo pacman -S electron-netease-cloud-music

# WeChat client
sudo pacman -S electronic-wechat

# Microsoft Teams client
sudo pacman -S teams-for-linux

# Chinese handwriting IME
sudo pacman -S google-chinese-handwriting-ime-git
```

## 6. References

- [Manjaro Homepage](https://manjaro.org/)
- [Manjaro Wiki](https://wiki.manjaro.org/index.php?title=About_Manjaro)
- [Post-Installation Configuration (Chinese)](http://panqiincs.me/2019/06/05/after-installing-manjaro/)
- [Samba Configuration (Chinese)](https://blog.csdn.net/aaa111/article/details/82774860)
- [Arch Linux Wiki: Fonts](https://wiki.archlinux.org/index.php?title=Fonts&oldid=588239)
- [Nerd Fonts](https://www.nerdfonts.com/)
- [Google Pinyin Installation (Chinese)](https://blog.csdn.net/ppggxn/article/details/82263332)

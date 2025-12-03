---
title: Raspberry Pi 4 配置
description: 树莓派 4 系统配置和应用
---

![Raspberry Pi](https://lx-public-pic.oss-cn-shanghai.aliyuncs.com/PicGo/20191205103453.gif)

This guide covers configuration for Raspbian (Debian-based), Manjaro ARM, and Windows IoT on Raspberry Pi 4.

## 1. Raspbian (Raspberry Pi OS)

### Initialization Script

This script configures apt mirrors (Tsinghua University), installs essential tools, and sets up aliases.

```bash
#!/bin/bash

# Backup sources
sudo cp /etc/apt/sources.list /etc/apt/sources.list.bak
sudo cp /etc/apt/sources.list.d/raspi.list /etc/apt/sources.list.d/raspi.list.bak

# Update sources to Tsinghua Mirrors
cat << EOF | sudo tee /etc/apt/sources.list
deb http://mirrors.tuna.tsinghua.edu.cn/raspbian/raspbian/ buster main contrib non-free rpi
deb-src http://mirrors.tuna.tsinghua.edu.cn/raspbian/raspbian/ buster main contrib non-free rpi
EOF

cat << EOF | sudo tee /etc/apt/sources.list.d/raspi.list
deb http://mirrors.tuna.tsinghua.edu.cn/raspberrypi/ buster main ui
deb-src http://mirrors.tuna.tsinghua.edu.cn/raspberrypi/ buster main ui
EOF

# Configure Pip Mirror
mkdir -p ~/.pip/
cat << EOF > ~/.pip/pip.conf
[global]
index-url = https://pypi.tuna.tsinghua.edu.cn/simple/
EOF

# Update System
sudo apt update && sudo apt upgrade -y

# Install Tools
sudo apt install -y git vim htop ncdu tmux bash-completion tcl expect \
    p7zip-full libio-compress-perl unrar-free unzip ncompress libperlio-gzip-perl bzip2

# Configure Git
git config --global user.name "Your Name"
git config --global user.email "your_email@example.com"

# Generate SSH Key (Optional)
# ssh-keygen -t rsa -b 4096 -C "your_email@example.com" -f ~/.ssh/id_rsa -N ""

echo "Initialization complete."
```

### Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh --mirror Aliyun

# Configure Docker Mirrors
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://docker.mirrors.ustc.edu.cn"]
}
EOF

# Enable and Start Docker
sudo systemctl enable docker
sudo systemctl start docker

# Add User to Docker Group
sudo usermod -aG docker $USER
newgrp docker
```

### Install Docker Compose

```bash
sudo apt install -y libssl-dev libffi-dev python3-pip
sudo pip3 install docker-compose
```

### System Configuration

-   **Enable SSH:** `sudo raspi-config` > `Interface Options` > `SSH`.
-   **Connect WiFi:** `sudo raspi-config` > `System Options` > `Wireless LAN`.

### CPU Temperature Check

```bash
watch -n 1 "cat /sys/class/thermal/thermal_zone0/temp | awk '{print \$1/1000}'"
```

## 2. Manjaro ARM

### Installation

1.  **Download:** Get the image from [Manjaro ARM](https://manjaro.org/download/).
2.  **Flash:** Use [Etcher](https://www.balena.io/etcher/) or `dd`.

    ```bash
    sudo dd if=path/to/image.img of=/dev/sdX bs=4M status=progress; sync
    ```

### Configuration

**Update Mirrors:**

```bash
sudo pacman-mirrors -c United_States -m rank
sudo pacman -Syyu
```

**Install Essential Packages:**

```bash
sudo pacman -S base-devel git vim yay
```

## 3. Windows IoT (ARM64)

1.  **Download:** Use [UUP dump](https://uupdump.net/) to download a Windows 10/11 ARM64 ISO.
2.  **Deploy:** Use [WOA Deployer](https://github.com/WOA-Project/WOA-Deployer-Rpi) to flash the ISO to the SD card.

## 4. Software

### Aria2 & AriaNg (Docker)

```bash
docker run -d --name aria2 \
  -p 6800:6800 -p 80:80 \
  -v ~/Download:/data \
  -v ~/aria2_conf:/config \
  p3terx/aria2-pro
```

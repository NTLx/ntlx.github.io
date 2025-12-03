---
title: UNRAID 配置指南
description: UNRAID NAS 系统配置和使用
---

![UNRAID Logo](https://craftassets.unraid.net/uploads/logos/unraid-stacked-dark.svg)

**[Unleash Your Hardware](https://unraid.net/)**

Unraid is an operating system for personal and small business use that brings enterprise-class features, letting you configure your computer systems to maximize performance and capacity using any combination of applications, VMs, storage devices, and hardware.

## 1. Installation

1.  **Prepare USB Drive:** Download the UNRAID files and extract them to a FAT32 formatted USB drive.
2.  **Make Bootable:** Run `make_bootable.bat` (on Windows) with administrator privileges.
3.  **Boot:** Plug the USB drive into the target machine and power it on. Ensure the BIOS is set to boot from USB (Legacy Boot).
4.  **Registration:** Visit the IP address shown on the target machine. Record the UUID and choose the **Trial** key.
5.  **Activation (Unofficial):** If using a specific tool (e.g., `keymaker.exe`), run it with the UUID to generate a key file. Place the key file in the `config` directory on the USB drive and delete `BTRS.key` or `Trial.key`.
6.  **Enjoy:** Plug the USB drive back into the target machine and boot up.

## 2. Settings

### Time (NTP)

Recommended NTP servers for Asia/China:

```text
time.asia.apple.com
ntp1.aliyun.com
s1b.time.edu.cn
s1c.time.edu.cn
```

### Storage

Every mounted disk inside the UNRAID array is linked to `/mnt/usr/`.
- It is **recommended** to operate inside `/mnt/usr/` when manipulating files manually.
- Docker paths should also link to `/mnt/usr/` or specific disks (e.g., `/mnt/disk1/`).

:::tip
You can modify the disk management strategy in **Settings** > **Global Share Settings**.
:::

### Plugins

**Unassigned Devices:**
```text
http://github.com/dlandon/unassigned.devices/raw/master/unassigned.devices.plg
```

## 3. Docker Containers

It is recommended to use the UNRAID Docker GUI, but command line (CLI) is also supported.

:::note
In the Docker GUI, you can set the Web UI URL format: `http://[IP]:[PORT:8080]`
:::

### OpenVPN

```bash
cd /mnt/disk1/appdata
git clone https://github.com/kylemanna/docker-openvpn.git
cd docker-openvpn/
docker build -t myownvpn .
cd ..
mkdir vpn-data

# Initialize
docker run -v /mnt/disk1/appdata/vpn-data:/etc/openvpn --rm -it myownvpn ovpn_initpki

# Start Service
docker run -v /mnt/disk1/appdata/vpn-data:/etc/openvpn -d -p 3333:1194/udp --cap-add=NET_ADMIN myownvpn

# Generate Client Config
docker run -v /mnt/disk1/appdata/vpn-data:/etc/openvpn --rm -it myownvpn easyrsa build-client-full lx nopass
docker run -v /mnt/disk1/appdata/vpn-data:/etc/openvpn --rm myownvpn ovpn_getclient lx > lx.ovpn
```

### FileBrowser

![FileBrowser](https://lx-public-pic.oss-cn-shanghai.aliyuncs.com/PicGO/20200131141856.png)

```bash
docker run -d --name='FileBrowser' --net='bridge' \
  -e TZ="Asia/Shanghai" -e HOST_OS="Unraid" -e 'WEB_PORT'='10080' \
  -p '10080:10080/tcp' \
  -v '/mnt/disk1/appdata/FileBrowser':'/config':'rw' \
  -v '/mnt':'/myfiles':'rw' \
  '80x86/filebrowser'
```

### Aria2 & AriaNg

```bash
docker run -d --name='aria2' --net='bridge' \
  -e TZ="Asia/Shanghai" -e HOST_OS="Unraid" \
  -p '6800:6800/tcp' -p '6800:6800/udp' -p '8888:80/tcp' -p '8888:80/udp' \
  -v '/mnt/disk1/Download':'/data':'rw' \
  -v '/mnt/disk1/appdata/Aria2_NG_conf':'/config':'rw' \
  'wjg1101766085/aira2-ng:0.0.1'
```

### Aria2 with WebUI

![Aria2WebUI](https://lx-public-pic.oss-cn-shanghai.aliyuncs.com/PicGO/20200131141835.png)

```bash
docker run -d --name='Aria2WebUI' --net='bridge' \
  -e TZ="Asia/Shanghai" -e HOST_OS="Unraid" \
  -p '6800:6800/tcp' -p '6880:6880/tcp' -p '6800:6800/udp' -p '6880:6880/udp' \
  -v '/mnt/disk1/appdata/Aria2WebUI':'/conf':'rw' \
  -v '/mnt/disk1/Download':'/data':'rw' \
  'xujinkai/aria2-with-webui'
```

### RRShare

![RRShare](https://odcn.top/wp-content/uploads/2018/11/%E9%BB%91%E5%88%BA%E7%8C%AC%E6%A8%AA150.png)

```bash
docker run -d --name='rrshare' --net='bridge' \
  -e TZ="Asia/Shanghai" -e HOST_OS="Unraid" -e 'PUID'='100' -e 'PGID'='99' \
  -p '3001:3001/tcp' \
  -v '/mnt/disk1/Download':'/opt/work/store':'rw' \
  'oldiy/rrshare64'
```

### AirSonic

![AirSonic](https://lx-public-pic.oss-cn-shanghai.aliyuncs.com/PicGO/20200131112627.png)

```bash
docker run -d --name='AirSonic' --net='bridge' \
  -e TZ="Asia/Shanghai" -e HOST_OS="Unraid" \
  -p '4040:4040/tcp' -p '4040:4040/udp' \
  -v '/mnt/disk1/appdata/AirSonic':'/config':'rw' \
  -v '/mnt/disk1/Music':'/music':'rw' \
  -v '/mnt/disk1/Music/playlists':'/playlists':'rw' \
  -v '/mnt/disk1/Music/podcasts':'/podcasts':'rw' \
  'linuxserver/airsonic'
```

### Logitech Media Server (LMS)

![LMS](https://scontent-lax3-1.xx.fbcdn.net/v/t1.0-9/60185006_2413632292213338_2693730404887691264_n.jpg?_nc_cat=109&_nc_sid=85a577&_nc_ohc=JstlpInGrZ0AX98RT0k&_nc_ht=scontent-lax3-1.xx&oh=5106927a381aef1ca199002dc0d50817&oe=5EDC613C)

```bash
docker run -d --name='lms' --net='bridge' \
  -e TZ="Asia/Shanghai" -e HOST_OS="Unraid" \
  -p '5082:5082/tcp' \
  -v '/mnt/disk1/appdata/lms':'/var/lms':'rw' \
  -v '/mnt/disk1/Music':'/music':'ro' \
  'epoupon/lms'
```

### Calibre & Calibre-Web

![Calibre](https://lx-public-pic.oss-cn-shanghai.aliyuncs.com/PicGO/20200131141905.png)

```bash
# Calibre
docker run -d --name='Calibre' --net='bridge' \
  -e TZ="Asia/Shanghai" -e HOST_OS="Unraid" \
  -p '8080:8080/tcp' -p '8081:8081/tcp' \
  -v '/mnt/disk1/Book/Calibre_Books':'/config':'rw' \
  'linuxserver/calibre'

# Copy metadata
cp /mnt/disk1/Book/Calibre_Books/Calibre\ Library/metadata.db /mnt/disk1/Book/

# Calibre-Web
docker run -d --name='CalibreWeb' --net='bridge' \
  -e TZ="Asia/Shanghai" -e HOST_OS="Unraid" \
  -p '10082:8082/tcp' -p '10083:8083/tcp' \
  -v '/mnt/disk1/appdata/CalibreWeb':'/config':'rw' \
  -v '/mnt/disk1/Book/Calibre_Books/CalibreLibrary':'/books':'rw' \
  'linuxserver/calibre-web'
```

### LeaNote

![LeaNote](https://cn.bing.com/th?id=OIP.duxFKYas_oKAHVjoZZcStAAAAA&pid=Api&rs=1)

```bash
docker run -d --name='leanote' --net='bridge' \
  -e TZ="Asia/Shanghai" -e HOST_OS="Unraid" \
  -e 'SITEURL'='http://ntlx.tpddns.cn:9000' -e 'LANG'='zh-cn' -e 'DAYS'='3' \
  -p '20000:9000/tcp' \
  -v '/mnt/disk1/appdata/leanotedata':'/data':'rw' \
  'hjh142857/leanote'
```

:::note[重要]
**Default Admin:** `admin` / `abc123`
:::
> **Demo Account:** `demo@leanote.com` / `demo@leanote.com`

### WizNote

![WizNote](https://www.xiazaiba.com/uploadfiles/ico/2015/0512/2015051209502232051.png)

```bash
docker run -d --name='WizNote' --net='bridge' \
  -e TZ="Asia/Shanghai" -e HOST_OS="Unraid" \
  -p '9000:80/tcp' -p '9000:80/udp' -p '9269:9269/udp' \
  -v '/mnt/disk1/appdata/wiz':'/wiz/storage':'rw' \
  'wiznote/wizserver'
```

> **Default Admin:** `admin@wiz.cn` / `123456`

### Wiki.js & PostgreSQL

**PostgreSQL:**
```bash
docker run -d --name='postgresql' --net='bridge' \
  -e TZ="Asia/Shanghai" -e HOST_OS="Unraid" -e 'POSTGRES_PASSWORD'='password' \
  -p '5432:5432/tcp' \
  -v '/mnt/disk1/appdata/wikijs/postgresql':'/var/lib/postgresql/data':'rw' \
  'postgres'
```

**Wiki.js:**
```bash
docker run -d --name='wikijs' --net='bridge' \
  -e TZ="Asia/Shanghai" -e HOST_OS="Unraid" \
  -e 'DB_TYPE'='postgres' -e 'DB_HOST'='192.168.0.100' -e 'DB_PORT'='5432' \
  -e 'DB_USER'='postgres' -e 'DB_PASS'='password' -e 'DB_NAME'='postgres' \
  -p '3000:3000/tcp' \
  'requarks/wiki:beta'
```

### NextCloud

![NextCloud](http://icons.iconarchive.com/icons/papirus-team/papirus-apps/512/nextcloud-icon.png)

```bash
docker run -d --name='NextCloud' --net='bridge' \
  -e TZ="Asia/Shanghai" -e HOST_OS="Unraid" \
  -e 'POSTGRES_DB'='nextcloud' -e 'POSTGRES_USER'='postgres' -e 'POSTGRES_PASSWORD'='password' -e 'POSTGRES_HOST'='192.168.0.100' \
  -e 'NEXTCLOUD_TRUSTED_DOMAINS'='lx.ntlx.xyz:82' \
  -p '82:80/tcp' -p '82:80/udp' \
  -v '/mnt/disk1/appdata/NextCloud':'/var/www/html/':'rw' \
  'nextcloud'
```

### OnlyOffice

![OnlyOffice](https://avatars1.githubusercontent.com/u/1426033?s=200&v=4)

```bash
docker run -d --name='OnlyOffice' --net='bridge' \
  -e TZ="Asia/Shanghai" -e HOST_OS="Unraid" \
  -p '83:80/tcp' -p '83:80/udp' \
  -v '/mnt/disk1/appdata/OnlyOffice/logs':'/var/log/onlyoffice':'rw' \
  -v '/mnt/disk1/appdata/OnlyOffice/data':'/var/www/onlyoffice/Data':'rw' \
  'onlyoffice/documentserver'
```

### Netdata

![Netdata](https://sourceforge.net/mirror/netdata/icon?1565234908)

```bash
docker run -d --name='netdata' --net='bridge' \
  -e TZ="Asia/Shanghai" -e HOST_OS="Unraid" \
  --security-opt 'apparmor'='unconfined' --cap-add SYS_PTRACE \
  -p '19999:19999/tcp' \
  -v '/etc/passwd':'/host/etc/passwd':'ro' \
  -v '/etc/group':'/host/etc/group':'ro' \
  -v '/proc':'/host/proc':'ro' \
  -v '/sys':'/host/sys':'ro' \
  -v '/var/run/docker.sock':'/var/run/docker.sock':'ro' \
  'netdata/netdata'
```

### Watchtower

![Watchtower](https://www.brandcrowd.com/gallery/brands/pictures/picture15638972102837.jpg)

```bash
docker run -d --name='Watchtower' --net='bridge' \
  -e TZ="Asia/Shanghai" -e HOST_OS="Unraid" \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower AirSonic CalibreWeb FileBrowser wikijs WizNote
```

## 4. Virtual Machines

### Synology DSM (XPEnology)

To mount an NFS folder to DSM:

```bash
/bin/mount -t nfs -o hard 192.168.0.100:/mnt/disk2/Photo /volume1/photo
```

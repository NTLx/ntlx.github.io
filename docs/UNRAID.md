![logo](https://craftassets.unraid.net/uploads/logos/unraid-stacked-dark.svg)

**[Unleash Your Hardware](https://unraid.net/)**

Unraid is an operating system for personal and small business use that brings enterprise-class features letting you configure your computer systems to maximize performance and capacity using any combination of applications, VMs, storage devices, and hardware.

# UNRAID Installation

1. Download files from [softoroom](https://softoroom.net/topic89043.html) web site and extract by password: `softoroom`, [here](http://lx.ntlx.xyz:10080/share/ikO_a7mu) is a mirror
2. Get a USB drive, format to FAT32, then copy all content in UNRAID image to USB drive
3. Run `make_bootable.bat` (on windows) with admin privilege
4. Plug in the USB drive to target machine, then power on (set `legacy boot` in BIOS if cannot boot from the USB drive)
5. Visit the ip shows in target machine, recored the UUID, and choose `Trail`, then power off the UNRAID
6. Plug in the USB drive to a windows PC (for example), run `keymaker.exe UUID`, you will get a `UUID.key` file in the same dir of `keymaker.exe`, put the `UUID.key` file to `config` dir in USB drive, and delete `trail.key`
7. Plug in the USB drive to traget machine and power on, enjoy it

# UNRAID Settings

## Time

> NTP server settings.

```
time.asia.apple.com
ntp1.aliyun.com
s1b.time.edu.cn
s1c.time.edu.cn
```

## Storage

Every mounted disk inside UNRAID disk array will link to `/mnt/usr/` dir, so if you need to manipulate file(s) or dir(s) manually, operate inside `/mnt/usr/` dir was recommanded, it's also recommanded to docker path link settings.

> You can modify this disk management strategy in `SETTINGS` menu's `Global Share Settings`.

## Plugin

```
http://github.com/dlandon/unassigned.devices/raw/master/unassigned.devices.plg
```

# UNRAID Docker

The Docker GUI in UNRAID was recommanded, but the Command Line was also convenient.

> You can set `Web UI` like this format in UNRAID docker GUI: `http://[IP]:[PORT:8080]`

## Open VPN

```bash
cd /mnt/disk1/appdata
git clone https://github.com/kylemanna/docker-openvpn.git
cd docker-openvpn/
docker build -t myownvpn .
cd ..
mkdir vpn-data
#docker run -v /mnt/disk1/appdata/vpn-data:/etc/openvpn --rm myownvpn ovpn_genconfig -u udp://IP_ADDRESS:3333
docker run -v /mnt/disk1/appdata/vpn-data:/etc/openvpn --rm -it myownvpn ovpn_initpki
docker run -v /mnt/disk1/appdata/vpn-data:/etc/openvpn -d -p 3333:1194/udp --cap-add=NET_ADMIN myownvpn
docker run -v /mnt/disk1/appdata/vpn-data:/etc/openvpn --rm -it myownvpn easyrsa build-client-full lx nopass
docker run -v /mnt/disk1/appdata/vpn-data:/etc/openvpn --rm myownvpn ovpn_getclient lx > lx.ovpn
```

## FileBrowser

![icon](https://lx-public-pic.oss-cn-shanghai.aliyuncs.com/PicGO/20200131141856.png)

```bash
docker run -d --name='FileBrowser' --net='bridge' -e TZ="Asia/Shanghai" -e HOST_OS="Unraid" -e 'WEB_PORT'='10080' -p '10080:10080/tcp' -v '/mnt/disk1/appdata/FileBrowser':'/config':'rw' -v '/mnt':'/myfiles':'rw' '80x86/filebrowser'
```

## Aria2 & NG

```bash
docker run -d --name='aria2' --net='bridge' -e TZ="Asia/Shanghai" -e HOST_OS="Unraid" -p '6800:6800/tcp' -p '6800:6800/udp' -p '8888:80/tcp' -p '8888:80/udp' -v '/mnt/disk1/Download':'/data':'rw' -v '/mnt/disk1/appdata/Aria2_NG_conf':'/config':'rw' 'wjg1101766085/aira2-ng:0.0.1'
```

## Aria2 & WebUI

![icon](https://lx-public-pic.oss-cn-shanghai.aliyuncs.com/PicGO/20200131141835.png)

```bash
docker run -d --name='Aria2WebUI' --net='bridge' -e TZ="Asia/Shanghai" -e HOST_OS="Unraid" -p '6800:6800/tcp' -p '6880:6880/tcp' -p '6800:6800/udp' -p '6880:6880/udp' -v '/mnt/disk1/appdata/Aria2WebUI':'/conf':'rw' -v '/mnt/disk1/Download':'/data':'rw' 'xujinkai/aria2-with-webui'
```

### Build Aria2WebUI

```bash
docker run -it alpine
apk update
apk add aria2 git nodejs
git clone https://github.com/ziahamza/webui-aria2.git
exit
docker commit -m="Aria2WebUI Basic Image" -a='NTLx' 68b9f57b0d29 aria2webui:0.1
docker run -d --name "Aria2WebUI" -p 6800:6800 -p 8888:8888 -v /home/pi/Download:/home aria2webui:0.1

#aria2c --enable-rpc --rpc-listen-all
#cd webui-aria2
#node node-server.js
```

## rrshare

![icon](https://odcn.top/wp-content/uploads/2018/11/%E9%BB%91%E5%88%BA%E7%8C%AC%E6%A8%AA150.png)

```bash
docker run -d --name='rrshare' --net='bridge' -e TZ="Asia/Shanghai" -e HOST_OS="Unraid" -e 'PUID'='100' -e 'PGID'='99' -p '3001:3001/tcp' -v '/mnt/disk1/Download':'/opt/work/store':'rw' 'oldiy/rrshare64'
```

## AirSonic

![icon](https://lx-public-pic.oss-cn-shanghai.aliyuncs.com/PicGO/20200131112627.png)

```bash
docker run -d --name='AirSonic' --net='bridge' -e TZ="Asia/Shanghai" -e HOST_OS="Unraid" -p '4040:4040/tcp' -p '4040:4040/udp' -v '/mnt/disk1/appdata/AirSonic':'/config':'rw' -v '/mnt/disk1/Music':'/music':'rw' -v '/mnt/disk1/Music/playlists':'/playlists':'rw' -v '/mnt/disk1/Music/podcasts':'/podcasts':'rw' 'linuxserver/airsonic'
```

> There are many [Apps](https://airsonic.github.io/docs/apps/) could connect to AirSonic Music Library as an easy to use music player.

## lms

![icon](https://scontent-lax3-1.xx.fbcdn.net/v/t1.0-9/60185006_2413632292213338_2693730404887691264_n.jpg?_nc_cat=109&_nc_sid=85a577&_nc_ohc=JstlpInGrZ0AX98RT0k&_nc_ht=scontent-lax3-1.xx&oh=5106927a381aef1ca199002dc0d50817&oe=5EDC613C)

```bash
docker run -d --name='lms' --net='bridge' -e TZ="Asia/Shanghai" -e HOST_OS="Unraid" -p '5082:5082/tcp' -v '/mnt/disk1/appdata/lms':'/var/lms':'rw' -v '/mnt/disk1/Music':'/music':'ro' 'epoupon/lms'
```

## Calibre WEB

![icon](https://lx-public-pic.oss-cn-shanghai.aliyuncs.com/PicGO/20200131141905.png)

```bash
docker run -d --name='Calibre' --net='bridge' -e TZ="Asia/Shanghai" -e HOST_OS="Unraid" -p '8080:8080/tcp' -p '8081:8081/tcp' -v '/mnt/disk1/Book/Calibre_Books':'/config':'rw' 'linuxserver/calibre'
cp /mnt/disk1/Book/Calibre_Books/Calibre\ Library/metadata.db /mnt/disk1/Book/
docker run -d --name='CalibreWeb' --net='bridge' -e TZ="Asia/Shanghai" -e HOST_OS="Unraid" -p '10082:8082/tcp' -p '10083:8083/tcp' -v '/mnt/disk1/appdata/CalibreWeb':'/config':'rw' -v '/mnt/disk1/Book/Calibre_Books/CalibreLibrary':'/books':'rw' 'linuxserver/calibre-web'
```

If you get error "`DB location is not valid, please enter correct path`", you could just put an [empty database](http://ntlx.tpddns.cn:10080/share/5biuC9Ch) to where `/books` links to.

## LeaNote

![icon](https://cn.bing.com/th?id=OIP.duxFKYas_oKAHVjoZZcStAAAAA&pid=Api&rs=1)

First, run CMD:

```bash
docker run -d --name='LeaNote' --net='bridge' -e TZ="Asia/Shanghai" -e HOST_OS="Unraid" -p '9000:9000/tcp' -p '9000:9000/udp' -v '/mnt/disk1/appdata/leanote/mongo':'/usr/local/bin/leanote/db_data':'rw' 'idealclover/leanote'
```

Then, copy `conf` and `public` for docker path link:

```bash
docker cp LeaNote:/usr/local/bin/leanote/conf /mnt/disk1/appdata/leanote/conf
docker cp LeaNote:/usr/local/bin/leanote/public /mnt/disk1/appdata/leanote/public
```

At last, stop this container and re-run with CMD:

```bash
docker run -d --name='LeaNote' --net='bridge' -e TZ="Asia/Shanghai" -e HOST_OS="Unraid" -p '9000:9000/tcp' -p '9000:9000/udp' -v '/mnt/disk1/appdata/leanote/conf':'/usr/local/bin/leanote/conf':'rw' -v '/mnt/disk1/appdata/leanote/public':'/usr/local/bin/leanote/public':'rw' -v '/mnt/disk1/appdata/leanote/mongo':'/usr/local/bin/leanote/db_data':'rw' 'idealclover/leanote'
```

> Default Administrator Account: admin
>
> Password: abc123

## LeaNote (New)

![icon](https://cn.bing.com/th?id=OIP.duxFKYas_oKAHVjoZZcStAAAAA&pid=Api&rs=1)

```bash
# docker run -d --name leanote --restart=always -m 512M --cpus=1 -e SITEURL="[访问网址/IP+端口]" -e LANG="zh-cn" -e DAYS="3" -p 8080:9000 -v [宿主机储存路径]/leanotedata:/data hjh142857/leanote
docker run -d --name='leanote' --net='bridge' -e TZ="Asia/Shanghai" -e HOST_OS="Unraid" -e 'SITEURL'='http://ntlx.tpddns.cn:9000' -e 'LANG'='zh-cn' -e 'DAYS'='3' -p '20000:9000/tcp' -v '/mnt/disk1/appdata/leanotedata':'/data':'rw' 'hjh142857/leanote'
```

**Do not change default administrator account's username !**

> Default administrator account: admin / abc123
>
> Default demo account: demo@leanote.com / demo@leanote.com
>
> Default backup files will be under `/mnt/disk1/appdata/leanotedata/backup` dir
>
> Copy backup files (`tar.gz` files named `mongodb` and `leanote`) to `/mnt/disk1/appdata/leanotedata/restore` dir to restore data

## WizNote

![icon](https://www.xiazaiba.com/uploadfiles/ico/2015/0512/2015051209502232051.png)

```bash
docker run -d --name='WizNote' --net='bridge' -e TZ="Asia/Shanghai" -e HOST_OS="Unraid" -p '9000:80/tcp' -p '9000:80/udp' -p '9269:9269/udp' -v '/mnt/disk1/appdata/wiz':'/wiz/storage':'rw' 'wiznote/wizserver'
```

> Default Administrator account: admin@wiz.cn
>
> Password: 123456
>
> If you need `web clip` function, you need pay for it.

## WiKi.js

### PostgreSQL

![icon](http://img.52z.com/upload/info/20180919/201809191722011146.jpg)

```bash
docker run -d --name='postgresql' --net='bridge' -e TZ="Asia/Shanghai" -e HOST_OS="Unraid" -e 'POSTGRES_PASSWORD'='password' -p '5432:5432/tcp' -v '/mnt/disk1/appdata/wikijs/postgresql':'/var/lib/postgresql/data':'rw' 'postgres'
```

### wikijs

![icon](https://wiki.js.org/img/logo.fc80554c.svg)

```bash
docker run -d --name='wikijs' --net='bridge' -e TZ="Asia/Shanghai" -e HOST_OS="Unraid" -e 'DB_TYPE'='postgres' -e 'DB_HOST'='192.168.0.100' -e 'DB_PORT'='5432' -e 'DB_USER'='postgres' -e 'DB_PASS'='password' -e 'DB_NAME'='postgres' -p '3000:3000/tcp' 'requarks/wiki:beta'
```
### ElasticSearch

![icon](https://d1q6f0aelx0por.cloudfront.net/product-logos/library-elasticsearch-logo.png)

```bash
docker run -d --name='ElasticSearch' --net='bridge' -e TZ="Asia/Shanghai" -e HOST_OS="Unraid" -e 'discovery.type'='single-node' -p '9300:9300/tcp' -p '9200:9200/tcp' -p '9200:9200/udp' -p '9300:9300/udp' 'elasticsearch:7.7.1'
docker exec -it ElasticSearch bash
./bin/elasticsearch-plugin install https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v7.7.1/elasticsearch-analysis-ik-7.7.1.zip
docker restart ElasticSearch
```

> Chinese word cut plugin: [es-ik](https://github.com/medcl/elasticsearch-analysis-ik)

## NextCloud

![icon](http://icons.iconarchive.com/icons/papirus-team/papirus-apps/512/nextcloud-icon.png)

> Using PostgreSQL deployed along with wikijs

```bash
docker run -d --name='NextCloud' --net='bridge' -e TZ="Asia/Shanghai" -e HOST_OS="Unraid" -e 'POSTGRES_DB'='nextcloud' -e 'POSTGRES_USER'='postgres' -e 'POSTGRES_PASSWORD'='password' -e 'POSTGRES_HOST'='192.168.0.100'  -e 'NEXTCLOUD_TRUSTED_DOMAINS'='lx.ntlx.xyz:82' -e 'NEXTCLOUD_TRUSTED_DOMAINS'='192.168.0.100:82' -p '82:80/tcp' -p '82:80/udp' -v '/mnt/disk1/appdata/NextCloud':'/var/www/html/':'rw' 'nextcloud'
```

## OnlyOffice

![icon](https://avatars1.githubusercontent.com/u/1426033?s=200&v=4)

> Could connect to NextCloud and provide online document editing

```bash
docker run -d --name='OnlyOffice' --net='bridge' -e TZ="Asia/Shanghai" -e HOST_OS="Unraid" -p '83:80/tcp' -p '83:80/udp' -v '/mnt/disk1/appdata/OnlyOffice/logs':'/var/log/onlyoffice':'rw' -v '/mnt/disk1/appdata/OnlyOffice/data':'/var/www/onlyoffice/Data':'rw' 'onlyoffice/documentserver'
```

## Wallabag

```bash
docker run --name wallabag -d --link postgresql:postgresql -e TZ="Asia/Shanghai" -e HOST_OS="Unraid" -e "POSTGRES_PASSWORD=password" -e "POSTGRES_USER=postgres" -e "SYMFONY__ENV__DATABASE_DRIVER=pdo_pgsql" -e 'SYMFONY__ENV__DATABASE_DRIVER_CLASS=Wallabag\CoreBundle\Doctrine\DBAL\Driver\CustomPostgreSQLDriver' -e "SYMFONY__ENV__DATABASE_HOST=postgresql" -e "SYMFONY__ENV__DATABASE_PORT=5432" -e "SYMFONY__ENV__DATABASE_NAME=wallabag" -e "SYMFONY__ENV__DATABASE_USER=NTLx" -e "SYMFONY__ENV__DATABASE_PASSWORD=password" -p 20000:80 wallabag/wallabag
```

## MatterWiKi

![icon](http://matterwiki.com/assets/logo.png)

```bash
git clone http://github.com/matterwiki/matterwiki
cd matterwiki
docker build -t matterwiki .
docker run -d --name='MatterWiKi' --net='bridge' -e TZ="Asia/Shanghai" -e HOST_OS="Unraid" -p '5000:5000/tcp' -v '/mnt/disk1/appdata/MatterWiKi/db':'/server/db':'rw' 'matterwiki'
```

> Visit `http://ip:5000/#/setup` to set up administrator account.

## Open Project

![icon](https://secure.gravatar.com/avatar/acd15bc2006a09325df72b6a6223c5ec.jpg?s=80&r=g&d=mm)

```bash
docker run -d --name='OpenProject' --net='bridge' -e TZ="Asia/Shanghai" -e HOST_OS="Unraid" -e 'SECRET_KEY_BASE'='secret' -p '10008:80/tcp' -v '/mnt/disk1/appdata/openproject/pgdata':'/var/openproject/pgdata':'rw' -v '/mnt/disk1/appdata/openproject/assets':'/var/openproject/assets':'rw' 'openproject/community:latest'
```

## ERPNext

![icon](https://raw.githubusercontent.com/frappe/erpnext/develop/erpnext/public/images/erpnext-logo.png)

```bash
# docker run -d --name='ERPNext' --net='bridge' -e TZ="Asia/Shanghai" -e HOST_OS="Unraid" -p '16000:80/tcp' -v '/mnt/disk1/appdata/ERPNext/frappe/site1.local':'/home/frappe/frappe-bench/sites/site1.local':'rw' -v '/mnt/disk1/appdata/ERPNext/logs':'/home/frappe/frappe-bench/logs':'rw' -v '/mnt/disk1/appdata/ERPNext/mysql':'/var/lib/mysql':'rw' 'lukptr/erpnext7'
docker run -d --name='ERPNext' --net='bridge' -e TZ="Asia/Shanghai" -e HOST_OS="Unraid" -p '16000:80/tcp' 'lukptr/erpnext7'
```

> Default Admin User Account: Administrator
>
> Password: 12345678

Usefull CMD:

```bash
# Copy files from Docker Container to outside
docker cp ERPNext:/home/frappe/frappe-bench/sites/site1.local /mnt/disk1/appdata/ERPNext/frappe/
docker cp ERPNext:/home/frappe/frappe-bench/logs /mnt/disk1/appdata/ERPNext/
docker cp ERPNext:/var/lib/mysql /mnt/disk1/appdata/ERPNext/
# Enter Docker Container
docker exec -it ERPNext bash
# Run CMD inside Docker Container
bench update
bench migrate
bench backup
```

Data backup:

```bash
docker exec -it ERPNext bash ## run this CMD inside docker container
bench backup # backup ## run this CMD inside docker container
docker cp ERPNext:/home/frappe/frappe-bench/sites/site1.local/private/backups /mnt/disk1/appdata/ERPNext/ # copy backup files ## run this CMD inside docker container
```

Data restore:

```bash
docker cp /mnt/disk1/appdata/ERPNext/backups/database.sql.gz ERPNext:/home/frappe/
docker exec -it ERPNext bash
bench --force restore /home/frappe/database.sql.gz
```

## netdata

![icon](https://sourceforge.net/mirror/netdata/icon?1565234908)

```bash
docker run -d --name='netdata' --net='bridge' -e TZ="Asia/Shanghai" -e HOST_OS="Unraid" --security-opt 'apparmor'='unconfined' --cap-add SYS_PTRACE -p '19999:19999/tcp' -v '/etc/passwd':'/host/etc/passwd':'ro' -v '/etc/group':'/host/etc/group':'ro' -v '/proc':'/host/proc':'ro' -v '/sys':'/host/sys':'ro' -v '/var/run/docker.sock':'/var/run/docker.sock':'ro' 'netdata/netdata'
```

## Watchtower

![icon](https://www.brandcrowd.com/gallery/brands/pictures/picture15638972102837.jpg)

> Docker container auto update.

```bash
docker run -d --name='Watchtower' --net='bridge' -e TZ="Asia/Shanghai" -e HOST_OS="Unraid" -v /var/run/docker.sock:/var/run/docker.sock containrrr/watchtower AirSonic CalibreWeb FileBrowser wikijs WizNote
```

# UNRAID Virtual Machine

## Black Synology DSM

Mount NFS folder to DSM:

```bash
/bin/mount -t nfs -o hard 192.168.0.100:/mnt/disk2/Photo /volume1/photo
```
# Linux

## Alpine

```bash
sudo apk add avahi dbus
sudo rc-update add avahi-daemon
sudo service avahi-daemon start
```

## CentOS

```bash
sudo yum install avahi
sudo yum install avahi-tools
sudo systemctl start avahi-daemon
sudo systemctl enable avahi-daemon
sudo yum install -y nss-mdns
```

then modify `/etc/nsswitch.conf` with root privilege, replace `hosts: files dns` to `hosts: files mdns_minimal [NOTFOUND=return] dns`.

At last, firewall setting must be modified:

```bash
# sudo firewall-cmd --get-services
# sudo firewall-cmd --add-service=mdns
sudo firewall-cmd --permanent --add-service=mdns
sudo firewall-cmd --reload
```

## Ubuntu

```bash
sudo apt install avahi-daemon
```

## Manjaro or Arch Linux

[Install](https://wiki.archlinux.org/index.php/Install) the [avahi](https://www.archlinux.org/packages/?name=avahi) package.

You can manage the Avahi daemon with `avahi-daemon.service` [using systemd](https://wiki.archlinux.org/index.php/Systemd#Using_units).

> **Note:** [systemd-resolved](https://wiki.archlinux.org/index.php/Systemd-resolved) has a built-in multicast DNS service, make sure to disable systemd-resolved's mDNS resolver and responder or [disable](https://wiki.archlinux.org/index.php/Disable) `systemd-resolved.service` entirely before using Avahi. For details, refer to [resolved.conf(5)](https://jlk.fjfi.cvut.cz/arch/manpages/man/resolved.conf.5).

```bash
systemctl start avahi-daemon.service
systemctl enable avahi-daemon.service
```
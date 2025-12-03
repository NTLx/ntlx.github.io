# ProxyChains Configuration Guide

ProxyChains is a tool that forces any TCP connection made by a given application to follow through a proxy like TOR or any other SOCKS4, SOCKS5 or HTTP(S) proxy.

## 1. Installation

### Ubuntu / Debian

```bash
sudo apt update
sudo apt install proxychains4
```

### CentOS / RHEL

```bash
sudo yum install proxychains-ng
```

### Manjaro / Arch Linux

```bash
sudo pacman -S proxychains-ng
# or using yay
yay -S proxychains-ng
```

## 2. Configuration

Edit the configuration file at `/etc/proxychains.conf` (or `/etc/proxychains4.conf`).

1.  **Open the file:**
    ```bash
    sudo vim /etc/proxychains.conf
    ```

2.  **Modify settings:**
    - Scroll to the bottom to the `[ProxyList]` section.
    - Add your proxy server (e.g., SOCKS5 at 127.0.0.1:1080).

    ```ini
    [ProxyList]
    # add proxy here ...
    # meanwile
    # defaults set to "tor"
    # socks4 	127.0.0.1 9050

    # Example:
    socks5  127.0.0.1 1080
    ```

    > [!TIP]
    > If you encounter DNS resolution issues, you might need to comment out `proxy_dns` in the configuration file, although keeping it enabled is recommended for privacy.

## 3. Usage

Prepend `proxychains` (or `proxychains4`) to any command you want to run through the proxy.

```bash
# Example: Download a file using curl
proxychains curl https://www.google.com

# Example: Run a shell
proxychains bash
```

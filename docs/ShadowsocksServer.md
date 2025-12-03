# Shadowsocks Server Installation

## 1. Install Shadowsocks (Python)

### CentOS

1.  **Install Python and Pip:**

    ```bash
    yum install python3 python3-pip
    ```

2.  **Install Shadowsocks:**

    ```bash
    pip3 install shadowsocks-py
    ```

3.  **Configure Firewall:**

    Open port 8388 (or your chosen port) for both TCP and UDP.

    ```bash
    firewall-cmd --zone=public --add-port=8388/tcp --permanent
    firewall-cmd --zone=public --add-port=8388/udp --permanent
    firewall-cmd --reload
    ```

4.  **Create Configuration File:**

    Create `/etc/shadowsocks.json` with the following content:

    ```json
    {
        "server": "0.0.0.0",
        "server_port": 8388,
        "local_address": "127.0.0.1",
        "local_port": 1080,
        "password": "your_password",
        "timeout": 300,
        "method": "aes-256-cfb",
        "fast_open": false
    }
    ```

    > [!NOTE]
    > `server` should be `0.0.0.0` to listen on all interfaces. `method` can be `aes-256-cfb`, `chacha20-ietf-poly1305`, etc., depending on support. `rc4-md5` is considered weak.

5.  **Start Server:**

    To start the server manually:

    ```bash
    ssserver -c /etc/shadowsocks.json -d start
    ```

    To auto-start on boot, add the command to `/etc/rc.local`.

## 2. Install ShadowsocksR (SSR)

Use the auto-install script for a quick setup.

```bash
wget -N --no-check-certificate https://raw.githubusercontent.com/ToyoDAdoubi/doubi/master/ssr.sh && chmod +x ssr.sh && bash ssr.sh
```

**Recommended Settings during installation:**
- **Encryption:** `none`
- **Protocol:** `auth_chain_a`
- **Obfuscation:** `plain`
- **Compatible Mode:** `n` (No)

## 3. Enable Google BBR

Google BBR (Bottleneck Bandwidth and RTT) is a TCP congestion control algorithm that can significantly improve network throughput. It requires Linux kernel 4.9 or later.

### CentOS 7

1.  **Check Current Kernel:**

    ```bash
    uname -r
    ```

2.  **Install ELRepo and Mainline Kernel:**

    ```bash
    rpm --import https://www.elrepo.org/RPM-GPG-KEY-elrepo.org
    rpm -Uvh http://www.elrepo.org/elrepo-release-7.0-3.el7.elrepo.noarch.rpm
    yum --enablerepo=elrepo-kernel install kernel-ml -y
    ```

3.  **Update GRUB:**

    List available kernels:
    ```bash
    rpm -qa | grep kernel
    ```

    Set the new kernel (usually index 0) as default:
    ```bash
    egrep ^menuentry /etc/grub2.cfg | cut -f 2 -d \'
    grub2-set-default 0
    ```

4.  **Reboot:**

    ```bash
    reboot
    ```

5.  **Enable BBR:**

    After rebooting, run:

    ```bash
    echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf
    echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf
    sysctl -p
    ```

6.  **Verify:**

    ```bash
    sysctl -n net.ipv4.tcp_congestion_control
    # Output should be: bbr
    lsmod | grep bbr
    # Output should show tcp_bbr
    ```

### Debian 9+ / Ubuntu 18.04+

Newer Debian and Ubuntu versions usually come with kernel 4.9+.

1.  **Enable BBR:**

    ```bash
    echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf
    echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf
    sysctl -p
    ```

2.  **Verify:**

    ```bash
    lsmod | grep bbr
    ```

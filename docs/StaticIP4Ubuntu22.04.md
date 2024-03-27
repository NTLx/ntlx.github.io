# Ubuntu 22.04 静态IP

## 查看当前网络信息

```bash
# 查看IP及子网掩码
ip addr
# 查看网关
ip route
# 查看DNS
cat /etc/resolv.conf
```

## 设定静态IP

配置文件在`/etc/netplan/`，默认是`00-installer-config.yaml`，默认内容为：

```yaml
# This is the network config written by 'subiquity'
network:
  ethernets:
    ens160:
      dhcp4: true
  version: 2
```

删除`ens160`下的`dhcp4`属性，改为`addresses`和`gateway4`：

```yaml
# This is the network config written by 'subiquity'
network:
  ethernets:
    ens160:
      addresses:
        - 192.168.1.2/24
      routes:
        - to: default
          via: 192.168.1.1
      nameservers:
        addresses: [1.1.1.1, 8.8.8.8]
  version: 2
```
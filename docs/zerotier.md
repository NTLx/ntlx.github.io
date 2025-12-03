# ZeroTier Configuration Guide

ZeroTier allows you to create secure virtual LANs over the internet, which is useful for remote access, gaming, and connecting distributed devices.

## 1. Installation

### Windows / macOS

Download the installer from the [official website](https://www.zerotier.com/download) and follow the prompts.

### Linux

Run the installation script:

```bash
curl -s https://install.zerotier.com | sudo bash
```

## 2. Joining a Network

You need a **Network ID** (16-digit alphanumeric code) provided by the network administrator.

### Windows

1.  Right-click the ZeroTier icon in the taskbar.
2.  Select **Join New Network...**.
3.  Enter the Network ID and click **Join**.

### Linux

```bash
sudo zerotier-cli join <NETWORK_ID>
```

> [!NOTE]
> After joining, the network administrator must authorize your device in the ZeroTier control panel.

## 3. Network Optimization (Windows)

If you encounter issues discovering games or services on the ZeroTier network, you may need to adjust the interface metric to prioritize the ZeroTier adapter.

1.  Open **Settings** > **Network & Internet** > **Advanced network settings**.
2.  Find the **ZeroTier One** adapter and click **Edit** (or "More adapter options").
3.  Select **Internet Protocol Version 4 (TCP/IPv4)** and click **Properties**.
4.  Click **Advanced**.
5.  Uncheck **Automatic metric** and set **Interface metric** to `1`.
6.  Click **OK** to save changes.

# VMware ESXi & Workstation Guide

![VMware Logo](https://junior1104.files.wordpress.com/2010/08/vmware-logo.jpg?w=595)

This guide covers the installation and configuration of VMware ESXi (v6.7u3) and VMware Workstation.

## 1. VMware ESXi

### Installation

1.  **Download:** Get the ESXi installer ISO (e.g., `VMware-VMvisor-Installer-6.7.0.update03-14320388.x86_64.iso`).
2.  **Create Bootable Media:** Flash the ISO to a USB drive using a tool like Rufus.
3.  **Install:** Boot the server from the USB drive and follow the on-screen instructions.
    > [!TIP]
    > Use `Tab` or arrow keys to navigate the installer menus.
4.  **Management:** After installation, access the web interface via the IP address displayed on the screen.

### Configuration

#### License Key (Trial)
> Limits: Up to 8 vCPUs per virtual machine.
```text
HY0XH-D508H-081U8-JA2GH-CCUM2
```

#### Storage (RDM)
If you need to pass through physical disks (Raw Device Mapping), refer to online guides for [RDM configuration](https://blog.whsir.com/post-4462.html).

### macOS Virtualization

To run macOS on non-Apple hardware, you need to patch ESXi.

1.  **Download Unlocker:** [esxi-unlocker](https://github.com/DrDonk/esxi-unlocker)
2.  **Install:** Upload the script to ESXi and run `./esxi-install.sh`.
3.  **Reboot:** Restart the ESXi host.

**macOS Guest Settings:**

*   **Enable HiDPI:**
    ```bash
    sudo defaults write /Library/Preferences/com.apple.windowserver DisplayResolutionEnabled -bool YES
    sudo defaults delete /Library/Preferences/com.apple.windowserver DisplayResolutionDisabled
    ```
    Reboot the VM.

*   **Set Resolution:**
    ```bash
    /Library/Application\ Support/VMware\ Tools/vmware-resolutionSet 3416 1920
    ```

### Backup (CBT)

Enable **Changed Block Tracking (CBT)** to allow incremental backups.

1.  **Power Off:** The VM must be powered off.
2.  **Edit Settings:** Right-click VM > **Edit Settings** > **VM Options** > **Advanced** > **Edit Configuration**.
3.  **Add Parameters:**
    - `ctkEnabled` = `true`
    - `scsi0:0.ctkEnabled` = `true` (Repeat for each disk, e.g., `scsi0:1.ctkEnabled`)
4.  **Verify:** Power on the VM and check its directory for `*-ctk.vmdk` files.

> [!NOTE]
> For more details, see [VMware KB 1031873](https://kb.vmware.com/s/article/1031873).

## 2. VMware Workstation

### License Keys (Trial)

**Version 15:**
```text
ZC10K-8EF57-084QZ-VXYXE-ZF2XF
UF71K-2TW5J-M88QZ-8WMNT-WKUY4
AZ7MK-44Y1J-H819Z-WMYNC-N7ATF
CU702-DRD1M-H89GP-JFW5E-YL8X6
YY5EA-00XDJ-480RP-35QQV-XY8F6
VA510-23F57-M85PY-7FN7C-MCRG0
```

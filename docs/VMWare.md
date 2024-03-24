![](https://junior1104.files.wordpress.com/2010/08/vmware-logo.jpg?w=595)

> For v6.7u3 currently

# Get ESXi

[Read this](https://blog.whsir.com/post-3377.html).

# Install ESXi

> Using `VMware-VMvisor-Installer-6.7.0.update03-14320388.x86_64.iso`

Flash iso file to USB drive, then install to server.

> when setting root password, use `tab` or `direction key` to switch input lines.

After the installation, use web interface to manage.

# Set ESXi

## Key

> Just a free key for test, limits: up to 8 vCPUs per virtual machine.

```
HY0XH-D508H-081U8-JA2GH-CCUM2
```

## Add storage

Do this if you have more disks.

### RDM

Choose [online method](https://www.jianshu.com/p/9606c9cdfc56) or [offline method](https://blog.whsir.com/post-4462.html).

## Install virtual systems

### Mac OS

> Need to "crack" first.

Download [esxi-unlocker](https://github.com/DrDonk/esxi-unlocker), extract, then run the script `./esxi-install.sh`.

Reboot ESXi after above.

> For VMware Fusion or WorkStation, download [unlocker](https://github.com/DrDonk/unlocker)

#### Setting in virtual Mac

##### Activate HiDPI

```bash
sudo defaults write /Library/Preferences/com.apple.windowserver DisplayResolutionEnabled -bool YES
sudo defaults delete /Library/Preferences/com.apple.windowserver DisplayResolutionDisabled
```

then reboot.

##### Change screen resolution

```bash
/Library/Application\ Support/VMware\ Tools/vmware-resolutionSet 3416 1920
```

# About Backup

## Virtual Machine

Enable VMware Changed Block Tracking (CBT) to only back up blocks that have changed since last backup time and greatly reduce the transferred data size and time for backup.

This part of content will guide you through the process of enabling CBT manually in VMware vSphere. Please follow the instructions of VMware and perform the following steps.

> Here is the [setting example](https://www.synology.com/en-global/knowledgebase/DSM/tutorial/Backup/How_to_enable_CBT_manually_for_a_virtual_machine) for backing up a virtual machine in ESXi to a Synology NAS

1. **Power off** the virtual machine. You will not be able to successfully complete the setting without powering off the virtual machine.
2. Right-click the virtual machine and click Edit Settings.
3. Click VM Options tab.
4. Click Advanced and then click Edit Configuration next to Configuration Parameters. It will open the Configuration Parameters dialog.
5. Click Add parameters, add the ctkEnabled parameter, and set its value to true.
6. Click Add parameters, add scsi0:0.ctkEnabled, and set its value to true.

> - Whenever a hard drive is added to the virtual machine, a SCSI device will be assigned to the hard drive. scsi0:0 in scsi0:0.ctkEnabled represents the SCSI device, while the others display similar to scsi0:1, or scsi 1:1.
> - You can enable or disable CBT individually on each hard drive.

Then, power on the virtual machine, in the home directory of the virtual machine, verify that each drive having CBT enabled has also a vmname-ctk.vmdk file.

The instruction above is referring to this website: [VMware KB 1031873](https://kb.vmware.com/s/article/1031873). It might be subject to change in different versions of VMware vSphere. You may find more up-to-date details regarding enabling CBT in VMware VMs on [VMware KB 1031873](https://kb.vmware.com/s/article/1031873).

After CBT is enabled, the first backup will still be full backup, and the subsequent backups will be incremental backup.

# About Client

## VMWare WorkStation

> Version 15

Use any key below for test:

```bash
ZC10K-8EF57-084QZ-VXYXE-ZF2XF
UF71K-2TW5J-M88QZ-8WMNT-WKUY4
AZ7MK-44Y1J-H819Z-WMYNC-N7ATF
CU702-DRD1M-H89GP-JFW5E-YL8X6
YY5EA-00XDJ-480RP-35QQV-XY8F6
VA510-23F57-M85PY-7FN7C-MCRG0
```
# Installation Guide of Ubuntu Server

## Download OS image

Ubuntu 22.04.4 Server [Download Link](https://mirrors.aliyun.com/ubuntu-releases/jammy/ubuntu-22.04.4-live-server-amd64.iso).

## Create bootable USB drive

Rufus 4.4 (Portable) [Download Link](https://github.com/pbatard/rufus/releases/download/v4.4/rufus-4.4p.exe).

You can find usage instructions on [Rufus Official Web Site](https://rufus.ie/en/).

## Install System

> Follow these steps

### Devices Dependency

- Plug in the bootable USB drive which created by Rufus & OS image to target server
- Plug in a screen to target server
- Plug in a keyboard
- Connect Power
- Connect network (optional)

### Installation

1. Power on.
2. Select language (English).

![](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520105855.png#alt=)
3. If you see screen as below, choose `Continue without updating`.

![](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520110013.png#alt=)
4. Keep the default layout, then choos `Done`.

![](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520110420.png#alt=)
5. If you have no specific network requirment, just keep the default network settings, choose `Done`.

![](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520110628.png#alt=)
6. Then you'll be in `Configure proxy` step. Usually, we keep the default settings and just choose `Done`, but if you want update system through the internet during the installation or you want add some software during the installation, you may need set proxy correct to get some `foreign resources`.

![](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520110655.png#alt=)
7. Compared to proxy, set a suitable mirror is far more usefull for system installation (if you need update or add software during the installation from the internet). For convenience, we keep the default setting and choose `Done`.

![](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520111422.png#alt=)
8. In `Guided storage configuration`, move cursor down and uncheck `Set up this disk as an LVM group`, after this operation, the screen will look like below, then just choose `Done`.

![](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520112032.png#alt=)
9. We need a little modify in `Storage configuration`. You'll see the pic below in this step.

![](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520112326.png#alt=)

   1. Move cursor up to `partition 2` (here is only show settings for one disk for example), then hit `Enter`, the screen will be look like below:

![](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520112433.png#alt=)
   2. Choose `Edit` and then change `Format` to `xfs`, the screen will be look like below:

![](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520112603.png#alt=)
   3. `Save` settings and choose `Done`, then choose `Continue` when you see below:

![](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520112727.png#alt=)
10. Set suitable info for your system, the screen will be look like below:

![](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520112824.png#alt=)
> Recommand set profile like this:

> - Your name: manager
> - Your server's name: ubuntu
> - Pick a username: manager
> - Choose a password: YOURPASSWORD
> - Confirm your password: YOURPASSWORD

And the screen will be look like this:

![](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520113204.png#alt=)

11. In `SSH Setup`, you need check `Install OpenSSH server` in order to connect your server through the internet after the system installaion, the screen will be look like below:

![](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520113338.png#alt=)
12. Don't choose any package in `Featured Server Snaps`, just choose `Done` directly.

![](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520113402.png#alt=)
13. Then you'll see the installation progress screen:

![](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520113540.png#alt=)
14. When you see screen like below, you can `Reboot` system and that's all of the basic installation steps (remove USB device may be required, there will be notes on the screen).

![](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520122209.png#alt=)
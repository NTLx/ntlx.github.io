# Ubuntu Server 22.04 Installation Guide

## 1. Preparation

### Download OS Image

Download the **Ubuntu 22.04.4 Server** ISO image:
[Download Link](https://mirrors.aliyun.com/ubuntu-releases/jammy/ubuntu-22.04.4-live-server-amd64.iso)

### Create Bootable USB Drive

Use **Rufus** (Windows) to create a bootable USB drive:
- **Download Rufus 4.4 (Portable):** [Download Link](https://github.com/pbatard/rufus/releases/download/v4.4/rufus-4.4p.exe)
- **Instructions:** [Rufus Official Website](https://rufus.ie/en/)

### Hardware Setup

1.  Insert the bootable USB drive into the target server.
2.  Connect a monitor, keyboard, and power cable.
3.  Connect a network cable (optional but recommended).

## 2. Installation Steps

1.  **Power On:** Turn on the server and boot from the USB drive.
2.  **Select Language:** Choose **English**.

    ![Language Selection](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520105855.png)

3.  **Installer Update:** If prompted, choose **Continue without updating**.

    ![Installer Update](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520110013.png)

4.  **Keyboard Layout:** Keep the default layout and select **Done**.

    ![Keyboard Layout](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520110420.png)

5.  **Network Connections:** Keep the default network settings (DHCP) and select **Done**.

    ![Network Connections](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520110628.png)

6.  **Configure Proxy:** If you don't need a proxy, leave it blank and select **Done**.

    ![Configure Proxy](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520110655.png)

7.  **Configure Ubuntu Archive Mirror:** Keep the default mirror address and select **Done**.

    ![Archive Mirror](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520111422.png)

8.  **Storage Configuration:**
    - In **Guided storage configuration**, uncheck **Set up this disk as an LVM group**.
    - Select **Done**.

    ![Storage Configuration](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520112032.png)

9.  **File System Setup:**
    - You will see a summary of the storage configuration.
    - Select the partition (e.g., `partition 2`) and press **Enter**.
    - Select **Edit**.
    - Change **Format** to **xfs**.
    - Select **Save**.
    - Select **Done** and confirm by choosing **Continue**.

    ![Partition Edit](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520112603.png)

10. **Profile Setup:** Enter your server profile information.

    **Recommended Settings:**
    - **Your name:** `manager`
    - **Your server's name:** `ubuntu`
    - **Pick a username:** `manager`
    - **Choose a password:** (Set a strong password)

    ![Profile Setup](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520113204.png)

11. **SSH Setup:** Check **Install OpenSSH server** to enable remote access. Select **Done**.

    ![SSH Setup](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520113338.png)

12. **Featured Server Snaps:** Do not select any packages. Select **Done**.

    ![Server Snaps](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520113402.png)

13. **Installation Progress:** Wait for the installation to complete.

    ![Installation Progress](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520113540.png)

14. **Finish:** When the installation is complete, select **Reboot Now**. Remove the USB drive when prompted.

    ![Reboot](https://cdn.jsdelivr.net/gh/NTLx/Pic/PicGo/20210520122209.png)

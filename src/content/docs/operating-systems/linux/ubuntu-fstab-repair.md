---
title: 修复因 fstab 错误导致的 Ubuntu 18.04 无法启动
description: 教程：修复因 fstab 错误导致的 Ubuntu 18.04 无法启动
sidebar:
  order: 7
---

# 教程：修复因 fstab 错误导致的 Ubuntu 18.04 无法启动

**适用场景：**
Ubuntu 18.04 LTS 服务器因为 `/etc/fstab` 中配置了无法挂载的硬盘（如硬盘已拔出、损坏或路径变更），导致系统无法正常开机，通常卡在启动画面或进入 "Emergency Mode"。

**前提条件：**
你需要能够访问服务器的终端。
* **物理服务器：** 连接显示器和键盘。
* **云服务器/VPS：** 需要在云服务商的管理后台使用 **VNC Console (控制台/救援模式)**，因为此时 SSH 通常无法连接。

---

### 第一步：进入系统 Shell

当服务器启动失败时，通常会出现以下两种情况之一，请根据实际情况操作：

**情况 A：屏幕显示 "Give root password for maintenance"**
1.  屏幕上会提示：`Press Enter for maintenance (or press Control-D to continue)`。
2.  输入 **Root 密码** 并按回车（输入时屏幕不会显示字符）。
3.  如果密码正确，你将看到类似 `root@hostname:~#` 的命令提示符。

**情况 B：卡在 Grub 引导菜单（如果无法进入情况 A）**
1.  在启动时长按 `Shift` 键进入 Grub 菜单。
2.  选择 `Advanced options for Ubuntu`。
3.  选择带有 `(recovery mode)` 字样的选项。
4.  在弹出的菜单中选择 `root` (Drop to root shell prompt)。
5.  按回车进入命令行。

---

### 第二步：重新挂载根目录为"可读写"

在紧急模式或恢复模式下，为了防止数据损坏，系统默认是以 **"只读" (Read-only)** 模式挂载根目录的。你必须将其重新挂载为 **"读写" (Read-Write)** 模式才能修改配置文件。

在命令行输入以下命令并回车：

```bash
mount -o remount,rw /
````

*如果没有报错，说明执行成功，现在你有权限修改文件了。*

-----

### 第三步：编辑 fstab 文件

我们需要找到并注释掉那个导致问题的挂载项。

1.  **备份原文件（养成好习惯）：**

    ```bash
    cp /etc/fstab /etc/fstab.bak
    ```

2.  **使用 nano 编辑器打开文件：**

    ```bash
    nano /etc/fstab
    ```

    *(如果不习惯 nano，也可以使用 vi 或 vim)*

3.  **查找并注释错误行：**

      * 使用键盘上下箭头移动光标。
      * 找到那行配置了外置硬盘的代码（通常包含 `/dev/sdb` 或一长串 UUID）。
      * 在该行代码的最前面加上一个井号 `#`。这表示将该行"注释掉"，系统启动时会忽略它。

    **修改前示例：**

    ```text
    UUID=1234-5678-xxxx   /mnt/data   ext4   defaults   0   0
    ```

    **修改后示例：**

    ```text
    # UUID=1234-5678-xxxx   /mnt/data   ext4   defaults   0   0
    ```

4.  **保存并退出：**

      * 按 `Ctrl + O` （保存文件）。
      * 按 `Enter` （确认文件名）。
      * 按 `Ctrl + X` （退出编辑器）。

-----

### 第四步：重启服务器

配置修改完成后，重启系统以验证是否修复成功。

输入以下命令：

```bash
reboot
```

*或者如果 reboot 命令在某些恢复模式下无效，可以使用：*

```bash
exit
```

*(如果是从 Grub 恢复模式进入的，输入 exit 后并在菜单中选择 "resume" 正常启动)*

-----

### 💡 专家建议：防止未来再次发生

如果你希望以后即使硬盘没插上，服务器也能正常启动，可以在 `fstab` 中添加 `nofail` 参数。

**示例配置：**

```text
UUID=xxxx-xxxx   /mnt/data   ext4   defaults,nofail   0   0
```

  * **nofail**：告诉系统，如果这个设备不存在，不要报错，继续启动系统，也不要进入紧急模式。
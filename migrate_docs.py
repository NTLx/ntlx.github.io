#!/usr/bin/env python3
"""
Astro Starlight 文档迁移脚本
自动将 Docsify 文档迁移到 Starlight 格式
"""

import os
import re
from pathlib import Path
from typing import Dict, Tuple

# 文档映射:原文件名 -> (新路径, 标题, 描述)
DOC_MAPPING: Dict[str, Tuple[str, str, str]] = {
    # Operating Systems - Linux
    "ArchLinux.md": ("operating-systems/linux/arch-linux.md", "Arch Linux 安装配置指南", "详细的 Arch Linux UEFI + GPT 系统安装和配置教程"),
    "CentOS76.md": ("operating-systems/linux/centos-7.6.md", "CentOS 7.6 配置指南", "CentOS 7.6 系统配置和优化"),
    "CentOS8.md": ("operating-systems/linux/centos-8.md", "CentOS 8 配置指南", "CentOS 8 系统配置和优化"),
    "Manjaro.md": ("operating-systems/linux/manjaro.md", "Manjaro 配置指南", "Manjaro Linux 系统配置"),
    "UbuntuServerInstallation.md": ("operating-systems/linux/ubuntu-server.md", "Ubuntu Server 安装指南", "Ubuntu Server 系统安装和配置"),
    "StaticIP4Ubuntu22.04.md": ("operating-systems/linux/ubuntu-static-ip.md", "Ubuntu 22.04 静态 IP 配置", "为 Ubuntu 22.04 配置静态 IP 地址"),
    
    # Operating Systems - NAS & Virtualization
    "UNRAID.md": ("operating-systems/nas-virtualization/unraid.md", "UNRAID 配置指南", "UNRAID NAS 系统配置和使用"),
    "VMWare.md": ("operating-systems/nas-virtualization/vmware.md", "VMWare 配置指南", "VMWare 虚拟化平台配置"),
    "BlackDSM.md": ("operating-systems/nas-virtualization/black-dsm.md", "黑群晖 DSM", "黑群晖 DSM 安装配置"),
    
    # Operating Systems - Embedded & Others
    "rpi4.md": ("operating-systems/embedded/raspberry-pi-4.md", "Raspberry Pi 4 配置", "树莓派 4 系统配置和应用"),
    "MacOS.md": ("operating-systems/embedded/macos.md", "MacOS 配置", "MacOS 系统配置和工具"),
    
    # HPC & Cluster
    "InstallSlurmOpenMPI.md": ("hpc-cluster/install-slurm-openmpi.md", "安装 Slurm 和 OpenMPI", "HPC 集群安装 Slurm 和 OpenMPI 指南"),
    "UsageSlurmOpenMPI.md": ("hpc-cluster/usage-slurm-openmpi.md", "使用 Slurm 和 OpenMPI", "Slurm 和 OpenMPI 使用教程"),
    
    # Network & Proxy
    "ShadowsocksServer.md": ("network-proxy/shadowsocks-server.md", "Shadowsocks 服务端配置", "Shadowsocks 服务端安装和配置"),
    "ShadowsocksClient.md": ("network-proxy/shadowsocks-client.md", "Shadowsocks 客户端配置", "Shadowsocks 客户端使用指南"),
    "PrivoxyConf.md": ("network-proxy/privoxy.md", "Privoxy 配置", "Privoxy 代理服务器配置"),
    "proxychains.md": ("network-proxy/proxychains.md", "Proxychains 配置", "Proxychains 代理工具使用"),
    "zerotier.md": ("network-proxy/zerotier.md", "ZeroTier 配置", "ZeroTier 虚拟局域网配置"),
    "mDNS.md": ("network-proxy/mdns.md", "mDNS 配置", "mDNS 本地网络发现配置"),
    
    # DevOps - Shell & Terminal
    "Bash.md": ("devops/shell-terminal/bash.md", "Bash 使用指南", "Bash Shell 脚本和配置"),
    "Zsh.md": ("devops/shell-terminal/zsh.md", "ZSH 配置指南", "ZSH Shell 配置和插件"),
    "Tmux.md": ("devops/shell-terminal/tmux.md", "Tmux 使用指南", "Tmux 终端复用器使用"),
    "CLI.md": ("devops/shell-terminal/cli.md", "CLI 工具集", "常用命令行工具"),
    
    # DevOps - Editors
    "VIM.Default.Conf.md": ("devops/editors/vim-default-conf.md", "VIM 默认配置集合", "各主流 Linux 发行版的 VIM 默认配置文件参考"),
    "VIM.Beautify.md": ("devops/editors/vim-beautify.md", "VIM 美化配置", "VIM 编辑器美化和优化配置"),
    "VIM.plugins.md": ("devops/editors/vim-plugins.md", "VIM 插件推荐", "VIM 常用插件和管理"),
    "EditorConfig.md": ("devops/editors/editorconfig.md", "EditorConfig 配置", "EditorConfig 跨编辑器配置"),
    
    # DevOps - Version Control
    "git.md": ("devops/version-control/git.md", "Git 配置与技巧", "Git 配置、代理设置、提交历史修改等实用技巧"),
    
    # DevOps - Services
    "n8n.docker.md": ("devops/services/n8n-docker.md", "n8n Docker 部署", "使用 Docker 部署 n8n 自动化工作流"),
    "KMS.md": ("devops/services/kms-activation.md", "KMS 激活服务", "KMS 批量激活服务配置"),
    "API.Service.md": ("devops/services/llms-api.md", "LLMs API 服务", "大语言模型 API 服务配置"),
    
    # Bioinformatics
    "benchmark.md": ("bioinformatics/snakemake-benchmark.md", "Snakemake 性能分析", "Snakemake 流程管理和性能分析"),
}


def convert_github_alerts(content: str) -> str:
    """转换 GitHub Alert 语法为 Starlight Asides"""
    # > [!NOTE] -> :::note
    # > [!TIP] -> :::tip
    # > [!IMPORTANT] -> :::note[重要]
    # > [!WARNING] -> :::warning
    # > [!CAUTION] -> :::caution
    
    patterns = [
        (r'> \[!NOTE\]\n> (.+)', r':::note\n\1\n:::'),
        (r'> \[!TIP\]\n> (.+)', r':::tip\n\1\n:::'),
        (r'> \[!IMPORTANT\]\n> (.+)', r':::note[重要]\n\1\n:::'),
        (r'> \[!WARNING\]\n> (.+)', r':::warning\n\1\n:::'),
        (r'> \[!CAUTION\]\n> (.+)', r':::caution\n\1\n:::'),
    ]
    
    for pattern, replacement in patterns:
        content = re.sub(pattern, replacement, content, flags=re.MULTILINE)
    
    return content


def add_frontmatter(content: str, title: str, description: str) -> str:
    """添加 frontmatter"""
    # 如果已有 frontmatter,先移除
    if content.startswith('---'):
        parts = content.split('---', 2)
        if len(parts) >= 3:
            content = parts[2].strip()
    
    frontmatter = f"""---
title: {title}
description: {description}
---

"""
    return frontmatter + content


def migrate_document(source_path: Path, target_path: Path, title: str, description: str):
    """迁移单个文档"""
    # 读取原文档
    with open(source_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 移除顶部标题(如果存在,因为 frontmatter 已有 title)
    content = re.sub(r'^# .+\n\n', '', content, count=1)
    
    # 转换 GitHub Alerts
    content = convert_github_alerts(content)
    
    # 添加 frontmatter
    content = add_frontmatter(content, title, description)
    
    # 创建目标目录
    target_path.parent.mkdir(parents=True, exist_ok=True)
    
    # 写入新文档
    with open(target_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✓ 迁移: {source_path.name} -> {target_path.relative_to(target_path.parents[3])}")


def main():
    """主函数"""
    base_dir = Path(__file__).parent
    source_dir = base_dir / "docs"
    target_dir = base_dir / "src" / "content" / "docs"
    
    print("开始批量迁移文档...")
    print(f"源目录: {source_dir}")
    print(f"目标目录: {target_dir}")
    print("-" * 60)
    
    migrated = 0
    skipped = 0
    
    for source_file, (target_rel_path, title, description) in DOC_MAPPING.items():
        source_path = source_dir / source_file
        target_path = target_dir / target_rel_path
        
        if not source_path.exists():
            print(f"✗ 跳过: {source_file} (源文件不存在)")
            skipped += 1
            continue
        
        try:
            migrate_document(source_path, target_path, title, description)
            migrated += 1
        except Exception as e:
            print(f"✗ 错误: {source_file} - {str(e)}")
            skipped += 1
    
    print("-" * 60)
    print(f"迁移完成! 成功: {migrated}, 跳过: {skipped}")
    print(f"\n下一步: 运行 'npm run build' 验证迁移结果")


if __name__ == "__main__":
    main()

---
$schema: starlight
title: 不在公网开端口、不写死配置：我在 Linux VPS 上部署 Paseo 手机控制 Claude Code 的极客实践
description: 把 CLI Agent 搬上云端并用手机随身接管，真正考验极客功力的不是“连通”，而是架构克制：零入站端口暴露、配置单一事实来源与故障自愈闭环。
date: 2026-08-21
category: ai-coding
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-21-paseo-linux-vps-agent-setup-img-00-infographic-core-summary.png)

设想这样一个场景：深夜在咖啡馆，你正用手机审查一段刚由 AI 提交的代码，或者突然想让服务器上的 Claude Code 跑一个耗时 20 分钟的重构任务。你不需要掏出笔记本，也不想在一块 6 英寸的玻璃屏幕上痛苦地打开 SSH 终端去敲键盘。你只想在手机原生 App 里看到 Agent 的实时流式输出，顺手点一下“批准执行”，或者追加一段 Prompt。

把命令行里的 AI 编程智能体搬上云端，并在手机上随身接管，正在成为当下最前沿的极客工作流。我们在之前的文章[《Claude Code 正在离开聊天框》](https://ntlx.github.io/articles/claude-code-headless-automation)中曾探讨过 Agent 从对话界面向无头自动化的迁移，而今天要聊的开源项目 [Paseo](https://github.com/getpaseo/paseo)，则提供了一个跨平台的统筹中枢。

然而，很多开发者在 VPS 上部署这类工具时，往往会陷入两个极端：要么图省事，把服务直接 `0.0.0.0` 裸奔暴露到公网，甚至套上一堆复杂的 Docker、Nginx、Tailscale 或反代配置；要么直接把环境变量、自定义 API Key 和模型名硬编码进 systemd 服务文件，造成极其脆弱的配置漂移。

今天，我把在一台 Linux 云服务器上安装、配置 Paseo 0.4.0 并托管 Claude Code (2.1.238) 与 Codex CLI (0.149.0) 的全过程做一次深度复盘。这不仅是一份能让你 100% 成功复现的极客部署指南，更是一次关于**最小暴露面、单一事实来源与系统级自愈**的工程设计实践。

## 架构选型与安全铁律：为什么我们不开放任何公网端口

在进入具体的命令行之前，先看清整个系统的架构边界。一个优雅的服务器端 Agent 托管方案，必须满足三个安全原则：

1. **绝对的零入站暴露**：Paseo 本地守护进程（daemon）必须仅监听回环地址 `127.0.0.1:6767`。服务器防火墙不需要为 Paseo 开放任何 TCP 入站端口，也不需要额外搭建 Tailscale VPN 或 Nginx 反代。
2. **端到端加密出站 Relay**：手机客户端与服务器的通信，完全依赖 Paseo daemon 主动向官方 Relay 发起的出站加密 WebSocket 连接。流量全程端到端加密（E2EE），公网攻击面被物理降噪到极致。
3. **坚持非 root 最小权限**：daemon 必须使用日常开发使用的普通用户身份运行，直接复用该用户现有的 SSH 密钥代理、Git 提交身份、Skills 和 MCP 工具链。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-21-paseo-linux-vps-agent-setup-img-01-zero_exposure_relay_topology.png)

整个数据流转极其清晰：

```text
服务器本地运行 Claude Code / Codex (普通用户身份)
        ↓ (本地 IPC / PTY)
Paseo Daemon (只监听 127.0.0.1:6767)
        ↓ (主动出站 WSS 连接)
Paseo 官方 E2EE Relay
        ↓ (加密流式同步)
手机 Paseo 客户端 (实时查看、审批权限、追加 Prompt)
```

有了这套架构基线，哪怕你的 VPS 拥有公网 IP，也完全不需要担心管理接口被扫描探测。

## 破除配置漂移：用 20 行 Wrapper 实现配置单一事实来源

在 Linux 运维中，最令人头疼的往往是 **systemd 守护进程与用户交互式 Shell 之间的环境阻抗**。

在常规的交互式终端里，Claude Code 会通过用户目录下的 `~/.claude/settings.json` 读取自定义 API 端点、认证 Token 以及默认模型配置。然而，一旦通过 systemd 以后台服务方式启动 Paseo daemon，daemon 并不会自动加载 `.bashrc` 或 `.zshrc` 中的所有导出变量。

很多人的第一反应是在 `paseo.service` 里写满 `Environment="ANTHROPIC_BASE_URL=..."` 或 `Environment="CLAUDE_MODEL=..."`。**这是一种极其危险的反模式**：
- 它在系统层面制造了两套配置源（用户配置与 systemd 配置）；
- 每次在终端里微调了默认模型或更新了 API Key，都必须翻出 root 权限去修改 systemd 并重载服务；
- 敏感的 Key 和 Token 会以明文形式散落在系统服务文件中。

为了保持**单一事实来源（Single Source of Truth）**，我设计了一个轻量级的包装脚本 `~/.local/bin/paseo-claude`：

```bash
mkdir -p ~/.local/bin
cat << 'WRAPPER_EOF' > ~/.local/bin/paseo-claude
#!/bin/bash
set -euo pipefail

  # 1. 定位并读取用户当前的 Claude 配置文件
SETTINGS_FILE="${HOME}/.claude/settings.json"

  # 2. 如果存在自定义 env 配置，动态注入到当前进程环境中
if [[ -f "$SETTINGS_FILE" ]]; then
  eval "$(node -e '
    try {
      const s = require(process.env.SETTINGS_FILE);
      if (s.env) {
        for (const [k, v] of Object.entries(s.env)) {
          console.log(`export ${k}="${v}";`);
        }
      }
    } catch(e) {}
  ')"
fi

  # 3. 寻找真实的 Claude 可执行文件路径
REAL_CLAUDE="${HOME}/.local/bin/claude"
if [[ ! -x "$REAL_CLAUDE" ]]; then
  REAL_CLAUDE="$(command -v claude || true)"
fi

  # 4. 透传参数与信号，保持 stdin/stdout/stderr 纯粹直通
exec "$REAL_CLAUDE" "$@"
WRAPPER_EOF

chmod 700 ~/.local/bin/paseo-claude
```

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-21-paseo-linux-vps-agent-setup-img-02-dynamic_wrapper_single_source.png)

随后，在 `~/.paseo/config.json` 中配置 Provider command override：

```json
{
  "$schema": "https://paseo.sh/schemas/paseo.config.v1.json",
  "version": 1,
  "daemon": {
    "listen": "127.0.0.1:6767",
    "relay": {
      "enabled": true
    }
  },
  "agents": {
    "providers": {
      "claude": {
        "command": [
          "/home/YOUR_USER/.local/bin/paseo-claude"
        ]
      }
    }
  }
}
```

> **极客提示**：记得将配置目录与文件的权限收紧为最小权限：`chmod 700 ~/.paseo && chmod 600 ~/.paseo/config.json`。通过这个包装层，以后在日常开发中修改 `~/.claude/settings.json`，新启动的 Agent 就会自动无缝继承最新配置，彻底告别配置漂移。

## 生产级 systemd 编排与实操部署清单

现在，我们把整个系统组装起来。以下是在干净的 Linux 环境中完整复现的实操清单。

### 第一步：全局安装 Paseo CLI

确保你的系统已具备 Node.js（推荐 20+）及 npm：

```bash
  # 全局安装 Paseo CLI
npm install -g @getpaseo/cli

  # 检查版本与路径
paseo --version
```

### 第二步：编写 systemd 系统服务文件

创建 `/etc/systemd/system/paseo.service`。注意，这里有三个关键工程细节：
1. **显式使用 `--foreground`**：让 daemon 在前台运行，便于 systemd 准确监控主进程生命周期与异常退出；
2. **显式注入完整 `PATH`**：由于 Node.js、npm 工具链及 Claude CLI 通常位于用户目录下（如 Linuxbrew 或 `~/.local/bin`），必须把真实路径完整写入 `PATH`；
3. **克制沙箱限制**：不要画蛇添足地加上 `ProtectHome=true` 或 `ProtectSystem=strict`，否则会直接切断 Agent 对 Git 仓库和编译环境的正常读写。

```ini
[Unit]
Description=Paseo AI Agent Daemon
Documentation=https://github.com/getpaseo/paseo
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
User=YOUR_USERNAME
Group=YOUR_PRIMARY_GROUP
WorkingDirectory=/home/YOUR_USERNAME

Environment="HOME=/home/YOUR_USERNAME"
Environment="PASEO_HOME=/home/YOUR_USERNAME/.paseo"
Environment="SHELL=/bin/bash"
Environment="PATH=/home/YOUR_USERNAME/.local/bin:/home/YOUR_USERNAME/.nvm/versions/node/current/bin:/usr/local/bin:/usr/bin:/bin"

ExecStart=/usr/local/bin/paseo daemon start --foreground

Restart=on-failure
RestartSec=5
TimeoutStopSec=30

[Install]
WantedBy=multi-user.target
```

### 第三步：启动服务与 Provider 诊断

加载并激活服务：

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now paseo.service

  # 检查服务运行状态
systemctl status paseo.service --no-pager
```

验证网络监听是否严格限制在回环地址：

```bash
ss -lntp '( sport = :6767 )'
  # 必须只显示 127.0.0.1:6767，绝不能出现 0.0.0.0:6767
```

运行 Paseo 提供的 Provider 深度诊断，验证 Claude Code 与 Codex 是否达到 `Ready` 状态：

```bash
paseo provider diagnostic claude
paseo provider diagnostic codex
```

当诊断输出显示 `Status: Ready` 且 command 路径成功命中我们的动态 wrapper 时，服务端的底座就已经稳如磐石。

## 手机配对、移动交互与灾备自愈实测

### 手机端扫码配对

在服务器终端执行一次性配对命令：

```bash
paseo daemon pair --relay
```

终端会渲染出一个清晰的字符二维码（以及一段加密配对链接）。打开手机上的 Paseo App，扫描屏幕上的二维码，即可在 2 秒内完成端到端密钥交换。

此时，手机 App 中会立刻列出你的服务器 Host。整个过程无需在路由器或云厂商控制台开放任何入站规则。

### 移动端深度交互体验

连接建立后，你在手机端可以体验到极客味十足的完整能力：
- **实时流式与 Timeline 回溯**：在手机上启动一个只读审查任务，Agent 的思考过程、命令执行与文件 diff 会实时推送到手机屏幕上。
- **远程权限拦截与审批**：当 Codex 或 Claude 尝试执行某些敏感系统命令或文件修改时，手机端会弹出权限确认卡片。你可以直接在屏幕上点击 Approve 或 Reject。
- **内置 Terminal 直通**：除了结构化的 Agent Chat，Paseo 手机端还提供了基于 WebSocket 的原生 Terminal 通道，随时可以敲命令查看服务器状态。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-21-paseo-linux-vps-agent-setup-img-03-resilience_auto_recovery.png)

### 灾难自愈验证：真金不怕精准 Kill

合格的极客决不会相信写在配置文件里的 `Restart=on-failure`，除非亲自杀死它一次。

为了验证整个系统在异常崩溃后的自愈能力，我在服务器上精准获取了 Paseo daemon 的主进程 PID，并直接发送了 `kill -9` 强杀信号。

测试结果令人惊喜：
1. **systemd 毫秒级拉起**：systemd 在 5 秒内精准捕获到了进程非正常退出，并立即拉起了全新的 daemon 实例；
2. **Relay 免扫码无感重连**：由于配对状态与设备身份持久化在 `~/.paseo/` 目录下，新 daemon 启动后主动重新连接官方 Relay，手机端在数秒内自动恢复连接，**完全不需要重新扫码配对**！

## 既有 CLI 会话接管与认知边界澄清

除了从手机端发起新任务，很多时候我们希望：“我在电脑终端里已经跑了一半的 CLI 会话，出门时能不能用手机接管？”

Paseo 提供了 `import` 指令。我们在实操中踩过一个小坑：Paseo 0.4.0 对导入标签有严格的格式校验，标签必须使用 `key=value` 格式：

```bash
  # 导入一个已有的 Claude Code 会话 ID
paseo import <YOUR_SESSION_ID> --provider claude --label purpose=mobile-takeover

  # 导入一个已有的 Codex Thread ID
paseo import <YOUR_THREAD_ID> --provider codex --label purpose=mobile-takeover
```

成功导入后，你在手机端即可看到该会话的历史上下文，并继续追加 Prompt 驱动 Agent 往下执行。

> **澄清一个关键的认知边界**：**Paseo 的会话导入不是 tmux 终端会话抢占**。它接管的是底层 Provider（Claude Code / Codex）的持久化上下文状态机，然后通过 API/CLI 管道继续推演。正如同我们在[《当计划变成代码——Claude Code Dynamic Workflows 读后感》](https://ntlx.github.io/articles/claude-code-dynamic-workflows)中所体会的，现代 Agentic Workflow 的核心资产是状态与上下文，而非那个生硬的 TTY 终端字符流。如果你追求最流畅的“电脑开工、手机接力”体验，最推荐的方式就是直接在 Paseo 中创建并管理 Agent 会话。

## 极客工程哲学：克制才能持久

回顾这次完整的云端 Agent 部署，我们没有为了连通性引入庞大的容器全家桶，没有为了图快而把公网端口大开，更没有为了省事把敏感配置写死在服务文件里。

1 个官方 npm CLI，1 个 20 行的配置动态包装脚本，1 个标准 systemd 服务单元，配合 Paseo 出站端到端加密 Relay，构成了这套既坚固又轻巧的现代 AI 编程随身工作台。

它让我们无论身处何地，都能保持对云端算力与智能体进度的绝对掌控——这正是属于当下的极客浪漫。

---

*你在将本地 CLI Agent 搬迁到云端或实现移动端接管时，遇到过哪些环境继承、权限隔离或网络安全上的“暗坑”？欢迎在评论区分享你的实战经验。*

## 参考资料

- [Paseo 官方开源仓库 (getpaseo/paseo)](https://github.com/getpaseo/paseo)
- [Paseo 官方文档与架构指南 (paseo.sh)](https://paseo.sh)
- [Claude Code 官方架构与使用手册 (Anthropic)](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview)
- [OpenAI Codex CLI 运行规范 (OpenAI)](https://github.com/openai/codex)
- [systemd.service 官方手册 (freedesktop.org)](https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html)

## 延伸阅读

- [《Claude Code 正在离开聊天框》](https://ntlx.github.io/articles/claude-code-headless-automation)
- [《当计划变成代码——Claude Code Dynamic Workflows 读后感》](https://ntlx.github.io/articles/claude-code-dynamic-workflows)
- [《Anthropic 这篇 skills 文章，真正写的是组织接口》](https://ntlx.github.io/articles/claude-code-skills-organizational-interface)
- [《同一天，OpenAI、Runway、Google 都选了 MCP——一个协议的临界点》](https://ntlx.github.io/articles/mcp-tipping-point)

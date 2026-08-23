---
$schema: starlight
title: 给 Agent 根权限让你心里发毛？一位极客用二手主机与 Coolify 搭建的准自托管软件工厂
description: 真正的全自动开发瓶颈不是模型能力，而是如何用一台二手主机与 DNS-01 隐身网络构筑物理防爆箱，换取彻底放手的自由。
date: 2026-08-23
category: ai-coding
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-23-self-hosted-sandboxed-agentic-software-factory-img-00-infographic-core-summary.png)

## 健身房里的痛点：当极客想放飞 AI，却卡在“根权限恐惧”

在健身房锻炼时想记一下杠铃重量，打开应用商店却发现那些简陋的 CRUD 记账工具动辄要收每月 12 英镑的订阅费。对于任何一个懂点技术的开发者来说，第一反应大概都是：我用 Claude 几分钟就能手搓一个出来。

但当你想把这种“随手做工具”的体验推向全自动化——也就是给 Agent 一个需求，让它自主调研技术栈、写代码、建仓库、跑通 CI、配置数据库并部署上线时，一道悬崖立刻摆在面前：你敢在自己的主力工作本上直接开着 Auto 模式给 LLM 赋予 Root 和 Bash 权限吗？

很多时候，阻碍我们放手让 AI 代理接管研发全流程的，从来不是模型的生成质量，而是安全感缺失。大模型的随机试错与幻觉不可预测，一旦一个失控的脚本在本地跑了越界命令或者误删了环境，代价不可承受。英国极客开发者 Jake Saunders 最近的一篇实战博文，给出了一套极其务实且优雅的解法：只花 20 英镑的单月模型订阅费，配上一台 eBay 淘来的二手主机与开源自托管 PaaS，搭建起一套近乎全自托管、物理沙盒化的“单兵软件工厂”。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-23-self-hosted-sandboxed-agentic-software-factory-img-01-physical_isolation_servers.png)

## 物理沙盒的算盘：为什么“防爆箱”必须是一台牺牲型主机

在系统架构中，最彻底的隔离永远不是在软件层打补丁，而是物理断连。

很多开发者为了体验 Agent 自动化，尝试过各种复杂的容器隔离方案。但 Jake 的做法直截了当：用一台独立的物理机作为“牺牲型沙盒（Sacrificial Box）”。在他的 Homelab 里有两台机器：
1. 底部是运行了五年的 2014 款双核 i3 老主机，稳定跑着个人博客、监控体系与 45 个 Docker 容器，路由器直接做了 443 端口转发——这是核心资产，坚决不让 AI 碰。
2. 顶部则是他在 eBay 上买来的 2021 款第十代 i7（配备 32GB 内存）二手小主机。系统干干净净，专供 AI 折腾。

这种设计的精妙之处在于将系统的**爆炸半径（Blast Radius）**彻底物理化。Agent 哪怕在执行任务时发疯执行了 `rm -rf /`，最坏的后果也不过是花两个小时给这台二手主机重装镜像，绝对不会危及个人主力工作电脑或家庭核心数据。此前我们在[《Agent 能跑 demo 不算本事，能跑一年才是》](https://ntlx.github.io/articles/agent-development-lifecycle)中讨论过 Agent 的长期运行韧性，而在单兵开发场景下，这种物理级容灾边界正是让人能够安心放手的第一道防线。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-23-self-hosted-sandboxed-agentic-software-factory-img-02-networking_topology_ghost_ssl.png)

## 隐身网络与 DNS-01：如何在不暴露公网 IP 的前提下获得合法 HTTPS

有了独立的物理机器，接下来的核心难题是网络访问与安全通信。

如果在路由器上为沙盒机开放公网端口，无异于将它直接暴露在全网扫描器的火力之下。但如果不开放公网入站（No Ingress），我们又该如何实现随时随地用手机访问新生成的应用，并且让浏览器拿到合法、不受警告的 HTTPS 证书？

Jake 的网络拓扑设计极其漂亮，由三套组件协同完成：
- **Tailscale 虚拟内网**：外出时通过 Tailscale 组网直接连回家中网络，将老服务器作为出口节点。
- **Pi-hole 本地自定义 DNS**：通过 dnsmasq 规则将 `*.internal.jakeshomelab.me` 的泛域名解析直接指向新服务器的局域网内网 IP（`192.168.1.201`）。
- **Porkbun DNS-01 ACME 挑战**：这是最关键的一环。传统的 Let's Encrypt 证书申请（HTTP-01）必须让外部服务器访问本地 80 端口，而 DNS-01 验证只需要在域名服务商处动态添加一条 `_acme-challenge` TXT 记录即可证明域名所有权。

这套组合拳的结果是：Coolify 反向代理在启动新应用时，通过 API 自动完成 DNS 挑战并获取 Let's Encrypt 签发的正规证书，随后删除临时记录。整个服务完全隐藏在私有内网中，没有任何公网 A 记录指向真实 IP，却能在手机和笔记本上以原生 HTTPS 畅通无阻地访问。这种“隐身却合法”的网络架构，与此前我们在[《不在公网开端口、不写死配置：我在 Linux VPS 上部署 Paseo 手机控制 Claude Code 的极客实践》](https://ntlx.github.io/articles/paseo-linux-vps-agent-setup)中探索的远程无暴露通信逻辑不谋而合。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-23-self-hosted-sandboxed-agentic-software-factory-img-03-hermes_agent_terminal_pipeline.png)

## 从一句话到上线：自托管 PaaS 与 Agent 的全闭环实战

解决了机器与网络，剩下的就是软件流水线中枢。整个平台的核心工具全部由自托管 PaaS 平台 **Coolify** 进行统筹，摆脱了对昂贵商业云服务的依赖：
- **Forgejo（含独立 Runner）**：替代 GitHub 提供轻量 Git 托管与本地 CI 执行，避免了向外部泄露高权限 Token，也免受外部 API 速率与 CI 分钟数限制。
- **Hermes Agent**：作为智能体大脑，支持 Web 界面与 Telegram 机器人，工作目录通过 Samba 与宿主机共享，无需手工复制代码。
- **自建技能扩展**：当缺少 Coolify 的操作插件时，Hermes 能够自主读取 Coolify 官方文档与 MCP 规范，现场编写出一套适配自身的工具技能。

在实际测试中，Jake 只在 Telegram 里发了一条提示词：要求开发一个包含特定食物快速选择功能的卡路里追踪应用，指定 SvelteKit + Drizzle + Postgres + Tailwind 技术栈，并用 Docker Compose 部署到指定的内网域名。

随后，Agent 独自跑完了整个研发周期：初始化仓库、编写全栈代码与测试、在 Forgejo CI 中反复修复直到流水线全绿、容器化封装并调用 Coolify API 完成部署。当用户在真机体验中发现表单提交存在 CSRF 错误时，仅需追加一条反馈提示，Agent 即可在几分钟内定位根因、补充回归测试并热更新上线。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-23-self-hosted-sandboxed-agentic-software-factory-img-04-coolify_paas_dashboard.png)

## 狂欢背后的冷静期：自验证盲区与下一步防线

看完整套流水线的运转，这种从一行自然语言直接通向部署成品的体验确实让人感到惊艳。但作为严肃的开发者，我们必须看清它目前的真实边界与隐性代价。

**第一个隐患是“自测试自验证（Self-Validating Blind Spot）”**。在 Hacker News 的技术讨论中，多位资深工程师尖锐地指出了这一矛盾：大模型写代码和写测试都很迅速，但当出卷人和答题人是同一个 Agent 时，测试用例往往会复刻模型最初的错误理解。CI 全绿只能证明“代码符合它自己制定的逻辑”，却不能保证“逻辑符合真实世界的边界条件”。端到端的真机验证依然需要人类作为最终的把关人。

**第二个隐患是内网横向渗透风险**。虽然物理机与公网切断了入站连接，但在当前局域网内部，拥有 Bash 执行权限的 Agent 理论上仍能扫描同网段下的其他智能家居与设备。因此，未来的标准防护必须进一步推进：
1. **严格的 VLAN 划分**：在交换机或路由器层面将沙盒主机划入独立隔离网段，彻底阻断其访问家庭局域网其他主机的可能性。
2. **最小权限凭证与自动化恢复**：将注入环境的所有 API Key 范围收缩至单仓库/单服务，并配合 Coolify 的自动备份机制，实现整机环境的“一键无痛重置”。

从“让 AI 在 IDE 里补全几行代码”，到“在自建沙盒中由 AI 自主驱动从需求到交付的完整工厂”，开发者的角色正在从一线的泥瓦匠转向工厂的总设计师。花几百块钱折腾一台二手设备，换来的是不再受制于云厂商账单与安全焦虑的全新可能。

*{如果是你，你会愿意在家里组装一台专属的“AI 软件工厂”来替代日常订阅的各类工具型 SaaS 吗？你在沙盒隔离上最担心的风险又是什么？}*

## 延伸阅读

- [Agent 能跑 demo 不算本事，能跑一年才是](https://ntlx.github.io/articles/agent-development-lifecycle)
- [不在公网开端口、不写死配置：我在 Linux VPS 上部署 Paseo 手机控制 Claude Code 的极客实践](https://ntlx.github.io/articles/paseo-linux-vps-agent-setup)
- [当推倒重构成为了生存常态：从 Anthropic 创业指南看 Agentic 研发的范式跃迁](https://ntlx.github.io/articles/claude-code-startup-guide-ai-native-sdlc)

## 参考资料

- [Building an (almost) fully self-hosted, sandboxed, agentic software factory — Jake Saunders](https://blog.jakesaunders.dev/building-an-almost-fully-self-hosted-sandboxed-agentic-software-factory/)
- [Coolify — An open-source & self-hostable Heroku / Netlify / Vercel alternative](https://coolify.io/)
- [Forgejo — Beyond coding. We forge.](https://forgejo.org/)
- [Let's Encrypt DNS-01 Challenge Documentation](https://letsencrypt.org/docs/challenge-types/#dns-01-challenge)
- [Hacker News Discussion on Sandboxed Agentic Software Factory](https://news.ycombinator.com/item?id=49390463)

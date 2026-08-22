---
$schema: starlight
title: 没有 API 的旧系统怎么跑通自动化？Claude 生产级 Agent 四件套的技术重构
description: 生产级 Agent 的分水岭不在于模型跑分多高，而在于能否穿透没有 API 的老旧系统，以确定性精度和沙箱工程跑完真实业务流。
date: 2026-08-22
category: ai-agents
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-22-claude-production-agents-skills-files-api-img-00-infographic-core-summary.png)

## 走出象牙塔：真实世界的自动化为什么长期卡在“无 API 泥潭”

过去一年多，AI Agent 领域最尴尬的断层，莫过于 Demo 里的无所不能与企业生产环境里的一筹莫展。

在理想的极客设想中，未来的企业软件应当拥有完善的 RESTful 或 GraphQL 接口，Agent 只需要挂载标准化工具（Tool Use / MCP）就能顺畅调用。但任何深入过医疗、金融、物流或保险一线工程的开发者都知道，这纯粹是一种真空中的假设。在现实世界里，支撑企业核心业务运转的，往往是十几年前开发的内网门户、完全没有开放接口的第三方 Web 系统、甚至跑在 Windows Server 上的老旧桌面客户端。

面对这种“无 API 泥潭”，行业此前基本在两条路上碰壁：
1. **传统 RPA（机器人流程自动化）**：依赖严格的 DOM 路径或录制脚本，网页结构稍微改版或动态渲染延迟几秒，整个流程就彻底崩溃，维护成本极高；
2. **早期的纯视觉 Computer Use**：虽然依靠多模态大模型“看屏幕截图”模拟人手点击，但在高分辨率缩放、页面微小滚动或动态弹窗面前，经常发生坐标漂移。更致命的是，过去“点一步、截一张图、调一次大模型”的单步往返机制，不仅网络延迟巨大，Token 账单也让人难以承受。

Anthropic 此次将 **Computer Use**、**Skills API**、**Files API** 全量推向 GA（General Availability），并推出专门针对网页交互的 **Browser Use** 工具，正是冲着这条横亘在概念验证与工业落地之间的鸿沟而来。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-22-claude-production-agents-skills-files-api-img-01-browser_use_accessibility_tree.png)

## Browser Use 与无障碍树：从“看图猜坐标”到“确定性语义抓取”

在这次发布的几个模块中，最值得所有 Agent 开发者重视的技术升级，是 **Browser Use** 对网页交互方式的底层重构。

在此之前，让 Agent 操作浏览器的做法通常走向两个极端：要么把杂乱无章、动辄几万行代码的完整 DOM 树直接塞进 Context（导致 Token 爆炸且模型极易迷失），要么纯靠视觉截图去猜按钮的 X/Y 像素坐标。

Browser Use 找到了一条极具巧思的中间路径：**深度融合屏幕截图与无障碍树（Accessibility Tree）**。

无障碍树原本是浏览器和操作系统为盲人读屏软件设计的语义抽象层。它天生过滤掉了花哨的 CSS 动画、装饰性嵌套 div 和隐藏脚本，只精准暴露出页面中真正具备交互属性的元素节点（输入框、下拉菜单、单选框、提交按钮），并为每个元素赋予确定性的语义引用 ID（Ref ID）。

当 Claude 执行网页任务时，它既能通过截图把握页面的宏观视觉布局与弹窗状态，又能直接根据无障碍树的 Ref ID 发出精准指令（例如 `click(ref_14)` 或 `type(ref_8, "2026-08-22")`）。

这种“视结构融合”带来了三个立竿见影的工业级改进：
- **操作确定性**：不再受屏幕 DPI 缩放、视口平移或 CSS 样式微调的干扰，点击命中率提升至确定性级别；
- **Token 消耗锐减**：语义树的体积仅为原始 HTML 的几十分之一，单次操作无需解析海量 DOM 源码；
- **单轮多动作批处理（Multi-action turns）**：模型在单次决策中可以直接下发一系列连续动作组合（如“聚焦输入框 -> 填入保单号 -> 勾选免责协议 -> 点击查询”），并在本地宿主环境批量执行后再回传最新状态。单次任务的模型调用轮次直接缩减了 50% 以上。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-22-claude-production-agents-skills-files-api-img-02-skills_api_sandbox_architecture.png)

## Skills API 与 Files API：把 Prompt 彻底赶下主桌的工程化解法

如果说 Browser Use 解决了 Agent 的“手眼协同”，那么 Skills API 和 Files API 解决的则是 Agent 的“知识负重”与“材料吞吐”。

正如我们此前在《[Anthropic 这篇 context engineering 文章，真正把 prompt 赶下了主桌](https://ntlx.github.io/articles/anthropic-context-engineering-prompt-retreat)》中所探讨的，过去构建复杂 Agent 的最大误区，就是试图通过不断加长 System Prompt 来塞入所有业务规程。这种做法不仅让模型容易产生指令混淆，更让代码维护变成了玄学。

这次 GA 的 **Skills API**，在官方层面确认了技能目录的工程规范：
1. **文件目录即能力单元**：一个 Skill 就是一个自包含的文件夹，里面有清晰的执行规程（`SKILL.md`）、确定性的辅助脚本（Python/Bash）以及参考模板；
2. **按需挂载与零运维沙箱**：开发者将编写好的技能上传并进行版本控制，任务发起时只需在请求中按需指定 Skill ID，Claude 会直接在其托管的安全代码执行沙箱中挂载并运行脚本，开发者无需自行维护脆弱的执行环境；
3. **与组织资产对齐**：我们在《[Anthropic 这篇 skills 文章，真正写的是组织接口](https://ntlx.github.io/articles/claude-code-skills-organizational-interface)》中提到过，Skill 的本质是业务专家的经验固化。企业沉淀的是清晰的版本化代码与规范，而不是散落在各个提示词模板里的片段。

而与之配套的 **Files API** 则彻底切断了超大 Payload 的传输顽疾。在涉及信贷审批、保单审核或财务分析的长文档场景中，开发者只需将几十兆的 PDF 或 Excel 上传一次，后续所有 Agent 轮次均通过 `file_id` 进行轻量引用。单组织 1TB 的持久存储、5 倍速率上限提升以及自动过期（TTL）机制，让重文档 Agent 终于具备了跑通生产流水线的基础设施支持。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-08-22-claude-production-agents-skills-files-api-img-03-enterprise_workflow_closed_loop.png)

## 100% 完成率背后：企业级 Agent 的竞争重心正在发生大位移

在 Anthropic 披露的客户实践中，医疗健康自动化公司 Asteroid 的数据极具说服力：在面对完全没有 API 的传统医疗和保险内网系统时，引入新的 Computer Use 工具后，其最长的索赔工作流耗时从 32 分钟急剧缩短至 13 分钟，单任务成本下降约 30%，**而在完全没有修改任何现有 Prompt 的前提下，任务完成率直接达到了 100%**。

无独有偶，Box 将金融机构复杂的信贷审批方法论封装为 Skill 后，Box Agent 能够直接拉取云端存储的财务报表与协议原件，自动生成附带严密数据溯源的信贷备忘录，供人工分析师最终签署。

这两个案例揭示了一个正在发生的残酷事实：**AI Agent 领域的竞争重心，已经从“大模型智商跑分”全面转移到“真实工程闭环的鲁棒性”**。

在实验室里，模型能写出惊艳的诗歌或解出奥数题；但在真实的商业组织中，客户买单的永远是：
- 能不能在不改造老旧系统的前提下，把数据稳稳当当地填进 Web 表单？
- 能不能符合 HIPAA / BAA 这类严苛的行业数据合规要求？
- 能不能把几百页合同准确提炼成符合企业模板的标准文件？

《[Agent 能跑 demo 不算本事，能跑一年才是](https://ntlx.github.io/articles/agent-development-lifecycle)》里强调的生命周期法则正在被验证：当模型厂商开始下场把无障碍树、沙箱运行时、持久文件层和合规资质全部打磨成即插即用的标准云服务时，应用层开发者的职责也随之发生位移——我们不再需要把精力消耗在写坐标重试循环或修补脆弱的 Prompt 补丁上，而是应当把精力聚焦在提炼领域知识、沉淀高质量 Skill 资产以及定义业务边界上。

真正成熟的技术，总是从炫目的魔法退化为可靠的管道。这场发生在接口之外的静悄悄革命，才刚刚开始。

*你在实际业务中遇到过哪些因缺乏 API 而难以自动化的场景？对于 Browser Use 和 Skills API 的组合，你最看好在哪个垂直领域的落地？欢迎在评论区分享你的实战观察。*

## 参考资料

- [Build production agents with computer use, the Skills API, and the Files API — Anthropic Blog](https://claude.com/blog/computer-use-skills-api-files-api)
- [Claude Platform Developer Documentation — Anthropic](https://platform.claude.com/docs)
- [Skills API & Agent Skills Reference — Anthropic Docs](https://docs.anthropic.com/)
- [Computer Use and Browser Automation Tooling Guide — Anthropic Console](https://platform.claude.com/)
- [Anthropic 這篇 skills 文章，真正寫的是組織接口 — NTLx 知識庫](https://ntlx.github.io/articles/claude-code-skills-organizational-interface)
- [Anthropic 這篇 context engineering 文章，真正把 prompt 趕下了主桌 — NTLx 知識庫](https://ntlx.github.io/articles/anthropic-context-engineering-prompt-retreat)
- [Agent 能跑 demo 不算本事，能跑一年才是 — NTLx 知識庫](https://ntlx.github.io/articles/agent-development-lifecycle)

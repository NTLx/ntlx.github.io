---
$schema: starlight
title: 别再折腾花哨的 AI 技巧了：为什么 GitHub AI 负责人说 Harness 才是全部？
description: 各种花哨的 MCP 与提示词秘籍大多只是花招。GitHub AI 专家 Burke Holland 提出极简工作流：沙箱中开启 YOLO 授权，用低成本原型锁定需求，善用 Harness 的 Plan 模式。
date: 2026-07-29
category: ai-coding
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-29-github-copilot-the-harness-is-all-you-need-img-00-infographic-core-summary.png)

打开社交媒体，几乎每天都能看到有人在推销他的“AI 秘籍”：新的 MCP 协议、新的自定义 Skill、长达几百行的神奇 Prompt，甚至声称“只要用了这个配置就能彻底搞定 AI 编程”。

但如果你真的每天都在高强度使用 AI 写代码，你很快就会产生一种强烈的倦怠感。

GitHub 负责 AI 开发的专家 Burke Holland 在最新的一篇博客里直言不讳：这些所谓的黑科技和技巧，绝大多数只是娱乐大众的“花招（Gimmicks）”。试图通过安装无数个插件或诱导 Agent 玩花样来提升效率，往往适得其反。真正带来数倍生产力跃升的，是你对 Agent 底层脚手架（Harness）的理解与掌控。

正如我们在 `[Not the Model, You're the Harness](https://ntlx.github.io/articles/not-the-model-youre-the-harness)` 中探讨过的论断：当模型本身越来越像同质化的水和电，围绕模型搭建的 Harness（脚手架与运行时）才是一切竞争力的承重墙。

如何抛弃花里胡哨的骚操作，仅凭裸 Harness 就能打出极高的工程吞吐？Burke Holland 给出了一套反直觉的极简实操工作流。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-29-github-copilot-the-harness-is-all-you-need-img-01-prototype_mocks.png)

## 别急着写代码：先用低成本原型做认知对齐

面对一个新的复杂需求——比如写一个支持年月日切换和范围选择的 Datepicker 组件，或者新增一个下载分析数据的 API 端点——绝大多数人的习惯是直接输入一句简短提示词，然后看着 Agent 在那里埋头写几十个文件。

然而，单次 Prompt 无论写得多么优雅，都不可能包揽人类大脑中隐性的喜好与边界。结果往往是 Agent 写了半天，你看了看说“不对，不是我要的感觉”，然后反复打补丁重构，白白消耗大量 Token 和宝贵的时间。

Burke 提出的第一条原则是：**在写任何一行生产代码前，先让 Agent 产出低成本原型（Prototyping）。**

人类的大脑对复杂代码和长文本的加工速度极慢，但对几何形状、视觉 Mock 和交互界面的识别速度极快。对于前端或组件开发，你可以直接要求 Agent：

> “给我生成 20 种不同布局的 Datepicker 组件 Mock，全部写进一个 HTML 文件里，方便我并排对比。”

Agent 会在几秒钟内吐出一个纯静态 HTML 页面。当你并排看到 20 种形态时，你会立刻发现自己之前没考虑到的细枝末节——比如“原来先选年份再下钻到月份和日期的体验这么好”。对于后端或 API 开发，同样可以让 Agent 输出 Mermaid 流程图或结构拓扑。

在我们在 `[Copilot 真正在省的不是 token](https://ntlx.github.io/articles/copilot-context-model-routing)` 中讨论的上下文管理逻辑里，前置原型本质上是以极低的空间开销提前锁定了需求边界。原型是便宜的，代码是昂贵的。先看明白原型，再动手实现，能直接抹平 90% 的后续重构成本。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-29-github-copilot-the-harness-is-all-you-need-img-02-mermaid_api_diagram.png)

## 撕掉假把式：在沙箱环境里开启 YOLO 无人驾驶

限制 Agent 生产力的第二个巨大枷锁，是人类对“掌控感”的执念。

默认情况下，很多 Agent 工具在每执行一条 Shell 命令、修改一个文件前，都要弹窗要求人类点击 Approve（批准）。

这种设计的初衷是安全，但实际工程体验极其糟糕。如果 Agent 做任何微小动作都需要你批准，人就彻底沦为了“打卡机器人”。更糟的是，频繁的审批会引发严重的“审核疲劳”——当你在一下午点了 100 次批准后，你早已不再仔细阅读命令内容，审批防线形同虚设。

Burke 建议的策略简单粗暴：**开启 YOLO 模式（`/allow-all`）**。

允许 Agent 自行决定执行什么命令、创建什么文件，让 Agent 在 Hot path 上拥有完全的自主权。

但放权的前提是安全性。你绝对不能在宿主机的真实工作区里开启全局授权。正确的做法是将开发环境整体扔进隔离沙箱中——例如 GitHub Codespaces、Docker 开发容器或虚拟机。代码和敏感数据在沙箱里被安全隔离，Agent 就算误删文件也能一秒恢复。

放权给 Agent，但把 Agent 关在沙箱里。只有解除人工顿挫， Agent 才能真正跑出指数级的吞吐量。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-29-github-copilot-the-harness-is-all-you-need-img-03-plan_mode_questions.png)

## 在同一个 Session 里用对话驱动结构化规划

当你通过视觉原型确定了方向，并在沙箱中开辟了授权之后，第三步切忌直接全速开跑。

在同一个 Agent Session 中，直接切换到规划模式（`/plan`）。

这本质上是在进行人机交互的认知填平。在这个阶段，优秀的 Harness 会主动向你抛出大量边缘条件反问：

- 起始日期和结束日期能否相同？
- 用户只选了一半日期时，状态是否有效？
- 是否允许用户一键清除已选内容？

单次 Prompt 无法做到的事，通过 `/plan` 的多轮问答可以瞬间搞定。

在这个过程中，有一个至关重要的工程细节：**保持模型与推理级别的一致性**。

无论你使用的是 GPT 5.6 还是 Claude Sonnet，一旦在当前需求开发中选定了模型与推理深度，就不要在 Session 中途频繁切换。因为现代 Agent Harness（如 Copilot、Cursor）普遍依赖 Prompt Caching（提示词缓存）。保持会话连贯能够享受极高折扣的响应速度与成本优惠。正如我们在 `[Loop Engineering：Agent 真正的战场不是 prompt，而是回路](https://ntlx.github.io/articles/loop-engineering-agent-loops)` 中阐述的，维持平稳的上下文回路，远比不断更换底座模型更为重要。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-29-github-copilot-the-harness-is-all-you-need-img-04-yolo_autopilot_mode.png)

## 大师都在做减法：脚手架演进的终局

回顾 Burke Holland 的这套工作流，你会发现它没有任何炫技成分：

1. **挑选顺手的 Harness**：无需在不同终端工具间频繁跳脚；
2. **开启 YOLO 模式**：沙箱中放权，告别确认疲劳；
3. **低成本原型**：先用 HTML / Mermaid 锁定直觉；
4. **方法论规划**：用 `/plan` 问清边缘边界；
5. **分步执行与审查**：人类把控最终交付。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-29-github-copilot-the-harness-is-all-you-need-img-05-datepicker_final_result.png)

AI 编程发展到今天，行业正在经历一次深刻的洗牌。最开始大家拼的是“谁的 Prompt 写得长”，后来拼的是“谁集邮的 MCP 插件多”，而现在最顶级的一批工程专家反而在做减法。

因为模型越来越像基础设施，花哨的自制技能和繁复的提示词往往只是在上下文里堆积噪声。真正能让你事半功倍的，是你是否足够理解手中的 Harness，以及是否建立了清晰、无顿挫的人机协作回路。

去掉那些花里胡哨的假把式。脚手架本身，就已经足够你了。

*你的开发工作流里叠加了多少插件？你是否尝试过仅靠 Harness 原生能力完成端到端开发？欢迎在评论区分享你的看法。*

## 参考资料

- [The harness is all you need (mostly)](https://github.blog/ai-and-ml/github-copilot/the-harness-is-all-you-need-mostly/)
- [Harness Engineering: leveraging Codex in an agent-first world](https://openai.com/index/harness-engineering/)
- [Continually improving our agent harness](https://cursor.com/blog/continually-improving-agent-harness)

## 延伸阅读

- [Not the Model, You're the Harness](https://ntlx.github.io/articles/not-the-model-youre-the-harness)
- [Copilot 真正在省的不是 token](https://ntlx.github.io/articles/copilot-context-model-routing)
- [Loop Engineering：Agent 真正的战场不是 prompt，而是回路](https://ntlx.github.io/articles/loop-engineering-agent-loops)

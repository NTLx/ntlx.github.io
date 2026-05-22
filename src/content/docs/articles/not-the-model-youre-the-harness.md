---
$schema: starlight
title: "Not the Model, You're the Harness"
description: 同一个模型换了 harness 差了 18 个百分点——选对 harness 比选对模型重要得多。
date: 2026-05-22
category: ai-agents
---

*Not the model, you're the harness.* 这句话太狠了。

我每次用 Claude Code 的时候，脑子里想的都是"今天模型强不强"——Opus 4.7 比 Sonnet 4.6 聪明多少、context window 够不够大、tool calling 准不准。但 Vivek Trivedy 这篇文章劈头盖脸甩过来一句：*If you're not the model, you're the harness.*

你根本不是模型，你是 harness。你写的那堆 prompt 工程、hook 配置、subagent 调度、compaction 策略——全是 harness。模型就坐在那儿，吐 token，不负责别的。

这认知冲击有点大。就像你一直以为自己是在造车，结果发现自己造的是车座和方向盘，发动机是别人家的。

## Agent = Model + Harness

这个公式简单到让人不安。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-22-not-the-model-youre-the-harness-img-01-agent-architecture.png)

Model 部分你控制不了——它是 Anthropic、OpenAI、Google 训练出来的黑箱。你能控制的只有 Harness：那层包裹模型的代码、配置、执行逻辑。文件系统、bash 工具、沙箱、context 管理、hook……全是 harness。

但这恰恰是关键。因为 harness 是你唯一能动手的地方。

Trivedy 抛出一个数据，我看了三遍：同一个 Claude Opus 4.6 模型，在 Claude Code 产品里跑 Terminal Bench 2.0 拿到 58%；换了个 harness（LangChain 自己的 Meta-Harness）跑到了 76.4%。模型完全没变，只是 harness 换了，差了 18 个百分点。

18 个百分点。差不多一个代差的距离。

这意味着选模型的重要性被严重高估了。我们花了太多时间比较 GPT-5 和 Claude Opus 哪个更强，但真正拉开差距的，是你怎么把模型"挂"起来用。

## Harness 的六大块骨头

Trivedy 把 harness 解剖成六个核心组件。每一个都对应一个模型做不到的事。

*想要持久存储？* → 文件系统 + Git。模型没有记忆，context 窗口一关就清零。文件系统让它能读写、能 offload、能跨会话协作。AGENTS.md 就是 harness 级别的发明——60,000+ 开源项目已经采用了这个标准，人类读 README，agent 读 AGENTS。

*想要自主解决问题？* → Bash + 代码执行。与其给模型预设一堆工具，不如给它一个 shell。模型可以按需写脚本、跑命令、装包——自己造工具，而不是等人类提前造好。

*想要安全执行？* → 沙箱环境。给模型一个干净、隔离、预装了运行时和工具的环境，让它干活，干完就销毁。Claude Code 和 Codex 都这么做。

*想要记住东西？* → 记忆文件 + Web Search + MCP。模型的知识停在训练截止日。harness 通过 context injection 把新信息塞进去，通过 Web Search 让它查实时数据。

*想要不掉链子？* → Context 管理。Chroma 研究团队的 Context Rot 研究评估了 18 个 LLM，发现一个残酷的事实：第 10000 个 token 的处理可靠性远低于第 100 个。模型不均匀地处理 context——前面看得清，后面变模糊。harness 用 compaction、tool call offloading、skills 的渐进式披露来对抗这种腐化。

*想要长时自主执行？* → Ralph Loop + 规划 + 自我验证。Ralph Loop 的本质是一个 hook：当模型想退出的时候，拦截它，清空 context，重新注入 prompt，让它接着干。配合 git 追踪和测试反馈，模型可以跨多个 context 窗口持续工作。

六个组件，六个"模型做不到，所以 harness 替它做"的设计。每个组件都不是模型的一部分，但缺了哪个，agent 都跑不起来。

回头想想我用 Claude Code 的日常——几乎每一次有效交互，都是这六个组件在暗地里运转。让 Claude 读代码库？那是文件系统在干活。让它跑测试修 bug？那是 bash 和沙箱在干活。让它记住"这个项目用 prettier 不用 eslint"？那是 AGENTS.md 在干活。让它写长一点别中途停下来？那是 Ralph Loop 的 hook 在拦它。我以前以为 Claude Code 的"聪明"来自模型，现在回头看，至少一半功劳在 harness 那头。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-22-not-the-model-youre-the-harness-img-02-harness-mapping.png)

## 行业拐点：从选模型到设计 harness

LangChain 在 2025 年 10 月拿了 B 轮 1.25 亿美元，估值 12.5 亿美元。Harrison Chase 说得很清楚：他们从"LLM 框架库"公司转型成了"agent engineering 平台"。LangChain + LangGraph 月下载量 9000 万次，35% 的财富 500 强企业已经是他们的用户。

但有意思的不是融资本身，是这个转型背后的判断。

三年前，大家选 LLM 框架——LangChain、LlamaIndex、Haystack——是因为需要一套 API 来调用模型。今天，大家选 harness——Claude Code、Codex、Cursor、Deep Agents——是因为需要一套环境让模型干活。

从"怎么调 API"到"怎么让它跑起来"，这不是产品层面的变化，是范式的变化。

Microsoft 今年 3 月在 Agent Framework 里正式引入了"harness"概念，定义为"模型推理连接到真实执行的那一层"。Reddit 上有人在讨论把 harness 视为"可部署的最小 agent 单元"。MindStudio 写了一篇文章区分 framework 和 harness——framework 给你原材料，harness 给你已装配好的结构。

一个概念从 LangChain 一篇博客文章，走到 Microsoft 的官方定义，再到社区把它当成独立品类——这个速度在技术史上不算快。但"agent"这个领域满打满算也就两年历史，已经够快了。

## Harness 和模型：谁在进化谁

有意思的是，模型和 harness 之间不是单向关系。

Claude Code 和 Codex 这些产品在"harness in the loop"的后训练中被优化——模型在特定 harness 环境中训练，学会更好地使用文件系统、bash、subagent。然后有用的 harness 原语又被反过来吸收到下一代模型的训练中。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-22-not-the-model-youre-the-harness-img-03-training-loop.png)

这像一个正反馈循环。但这也有副作用：模型会过拟合到特定 harness 上。Trivedy 举了 OpenAI Codex 的 apply_patch 工具为例——改变工具逻辑会导致模型表现变差，因为模型已经习惯了旧的工具调用方式。

这就引出一个反直觉的结论：最好的 harness 不一定是模型原生适配的那个。

LangChain 的 Deep Agents 在 Terminal Bench 2.0 上从 Top 30（66.5%）通过纯 harness 优化进入 Top 5。他们没有换模型，只是改了 harness。

这就像说：最好的鞋子不一定是你脚天然适配的那双，而是你穿上之后走得最快的那双。

再想一层：如果 harness 比模型更重要，那"哪个模型更好"这个问题本身就问错了方向。应该问的是"哪个模型 + 哪个 harness 的组合在哪个场景下最好"。这是一个组合优化问题，不是单体比较。Anthropic 的模型在 Claude Code 里表现好，不代表它在 LangChain 的 harness 里也最好。OpenAI 的模型在 Codex 里表现好，不代表它换了 harness 还能保持优势。模型的"能力"和 harness 的"设计"是绑在一起的，拆开比没有意义。

## Harness 会越来越薄吗

Trivedy 在文末提出了一个有趣的问题：随着模型越来越强，harness 会变薄还是变厚？

一部分 harness 功能肯定会被模型吸收。规划、自我验证、长时一致性——这些今天需要 harness 来"打补丁"的能力，明天模型可能原生就具备。Prompt engineering 不会消失，但会越来越薄。

但 harness 不会消失。理由和 prompt engineering 不会消失一样：再强的模型也需要被"挂"在某个环境里才能干活。好的环境、合适的工具、持久的状态、验证循环——这些让模型更有效，不管它本身有多聪明。

LangChain 在探索的方向是三个：数百个 agent 在共享代码库上并行协作、agent 分析自己的 trace 来发现和修复 harness 级故障、按需动态组装工具和 context 的 harness。

最后一个方向尤其有意思。今天的 harness 是预配置的——你启动 Claude Code，它就带着文件系统、bash、skills 全副武装上线。未来的 harness 可能是 JIT 组装的——根据任务类型，动态决定加载什么工具、注入什么 context。

就像 JIT 编译器比 AOT 编译器更灵活一样，JIT harness 可能比预配置 harness 更高效。

JIT harness 听起来性感，但预配置 harness 的优势在于可预测性——你知道启动时有什么。JIT 组装的代价是延迟和不确定性：判断任务类型本身就需要 context，判断错了加载的工具就不对。这可能是 harness 工程的下一个硬问题。

*如果 harness 工程是 AI agent 时代最重要的技能，你觉得今天开发者最需要补的是哪块——context 管理、工具设计、还是验证循环？*

## 原文参考

> Vivek Trivedy, "The Anatomy of an Agent Harness", LangChain Blog, March 10, 2026
> https://www.langchain.com/blog/the-anatomy-of-an-agent-harness

---
$schema: starlight
title: 闭源卖失败成本，开放卖组织能力
description: 闭源模型赚的是失败太贵的钱，开放模型赚的是组织终于能把 AI 用进日常流程的钱。
date: 2026-06-02
category: ai-industry
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-02-open-closed-model-economics-img-00-infographic-core-summary.png)

Nathan Lambert 这篇文章，我读完以后最不舒服的一点，是它把一个很多人喜欢吵成价值观的问题，重新拖回了利润表。

开放模型好，还是闭源模型好？这个问法很容易把人带偏。它像在问 Linux 好，还是 macOS 好。你当然可以站队，可以谈自由、控制、审美、生态。但真到了一个公司要交付项目、一个程序员凌晨两点要把 bug 修掉的时候，答案往往很粗暴：哪个能少毁掉我一小时，就用哪个。

这也是 Lambert 的核心判断。开放模型和闭源模型不是在同一条曲线上抢第一。它们会沿着两条不同的指数增长：闭源模型吃最顶端的高失败成本任务，开放模型吃更广、更慢、更深的组织扩散。

## 最贵的不是 token，是失败

coding agent 把这个问题暴露得很清楚。

以前模型差一点，顶多是补全没那么顺手。现在模型差一点，可能是 agent 在第 17 步改错文件、误解测试、把一个本来清楚的上下文搅乱。你付出的不是几分钱 token，而是重新读代码、恢复状态、判断它到底哪里错了。

这就是闭源前沿模型的定价权。它们不只是“更聪明”。它们卖的是更少的中断、更少的返工、更少的人工兜底。一个每天靠 agent 写代码的人，当然会抱怨价格，但真要在最难的任务上从最强模型降到“差不多”的模型，他会犹豫。

OpenAI 把 Codex 做成管理多个 agent 的工作台，Anthropic 把 Claude Code 往并行会话和长任务上推，都不是偶然。agent 一旦进入真实工作流，模型能力的边际差距会被放大。单轮聊天里 90 分和 95 分差不多；连续执行二十步时，差 5 分可能就是成败。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-02-open-closed-model-economics-img-01-model-routing.png)

## 开放模型真正要赢的不是榜单

我觉得原文最有意思的地方，是它没有把开放模型写成失败者。恰恰相反，Lambert 的判断是：开放模型经济的总价值会更大，只是利润不会集中在一两家公司手里。

这很符合企业采用技术的真实节奏。

企业不是每天都在问“最强模型是哪一个”。更多时候，它们问的是：这个任务能不能稳定跑？数据能不能留在我们能接受的边界里？成本能不能预测？出了问题谁负责？模型能不能微调到我们自己的流程？

一旦某个开放模型达到了够用阈值，它就会被固定下来。不是因为它永远最好，而是因为切换成本高。提示词、评测、权限、日志、监控、合规、内部培训，全都围着它长出来了。模型只是根目录，旁边还有一整棵工程树。

所以开放模型不该总盯着 Claude 和 GPT 的排行榜尾灯。它真正的战场，是把“够用”变成“可部署、可审计、可预算、可替换”。Fireworks、Together、OpenRouter 这类基础设施公司的价值就在这里。它们让开放模型从下载一个权重，变成组织可以采购和运行的一套栈。

## 两种生意，两种耐心

闭源实验室像高端咨询。你把最难、最不确定、失败成本最高的问题交给它。贵，但省心。它也因此更像 Apple 加 Microsoft：一边卖集成体验，一边卖横跨组织的订阅。

开放模型更像企业内部工具链。开始慢，配置麻烦，没人会因为它第一天优雅而爱上它。但一旦跑进日常流程，它会安静地吞掉大量任务：客服分类、文档处理、报表解释、内部知识检索、低风险代码改动、稳定格式生成。

这里的差别不是“智能高低”，而是钱从哪里来。

闭源赚高毛利，因为用户买的是最顶端的不确定性处理。开放赚规模和基础设施，因为用户买的是可控成本和主权。一个任务越模糊、越难评估、越怕错，越该用前沿闭源模型；一个任务越稳定、越可测、越重复，越适合开放模型。

这也是我对原文唯一想补的一刀：企业迁移到开放模型，不只取决于模型够不够好，还取决于组织有没有能力承接它。很多公司想要开放模型，其实想要的是便宜的闭源体验。这个愿望通常落空。开放模型给你的不是魔法，是控制权；控制权的另一面，是你得自己管。

## 别站队，学会路由

如果把这篇文章落到个人和团队，我得到的建议很简单：不要把开放和闭源当成信仰题，要当成调度题。

最贵的模型留给高失败成本任务：架构判断、复杂调试、陌生代码库迁移、长链路 agent 工作、需要人脑连续兜底的地方。便宜或开放的模型留给稳定任务：摘要、分类、格式转换、批量草稿、低风险内部工具。

这听起来不浪漫，但很接近未来几年 AI 使用的真实形态。不是一个模型统治所有任务，而是任务在不同模型之间流动。真正值钱的能力，可能不是知道哪个模型今天第一，而是知道什么时候不该用第一。

Lambert 说开放和闭源在不同指数曲线上。我同意。但我会换一种更土的说法：闭源模型赚的是“错不起”的钱，开放模型赚的是“用得起”的钱。

两边都会长大。只是长出来的，不是同一种森林。

*你现在的 AI 工作流里，哪些任务其实应该交给最强闭源模型，哪些已经可以路由给便宜或开放模型？*

## 原文参考

> Nathan Lambert, Open and closed models are on different exponentials
> <https://www.interconnects.ai/p/open-and-closed-models-are-on-different>

> Interconnects About
> <https://www.interconnects.ai/about/>

> Nathan Lambert, My path into AI
> <https://www.interconnects.ai/p/my-path-into-ai?action=share>

> OpenAI, Introducing the Codex app
> <https://openai.com/index/introducing-the-codex-app/>

> OpenAI Help Center, Using Codex with your ChatGPT plan
> <https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan>

> Anthropic, Introducing Claude Opus 4.5
> <https://www.anthropic.com/news/claude-opus-4-5>

> Artificial Analysis, Recent open weights model launches
> <https://artificialanalysis.ai/articles/recent-open-weights-model-launches>

> Artificial Analysis, AI Insights & Trends
> <https://artificialanalysis.ai/trends/>

> Fireworks AI Docs, Managed Fine-Tuning Overview
> <https://docs.fireworks.ai/fine-tuning/managed-finetuning-intro>

> Together AI Docs, Deployment Options
> <https://docs.together.ai/docs/deployment-options>

> OpenRouter, Models
> <https://openrouter.ai/openr>

> Prime Intellect Docs, Models
> <https://docs.primeintellect.ai/api-reference/inference-models>

> ITPro, Open source AI models are cheaper than closed source competitors
> <https://www.itpro.com/software/open-source/open-source-ai-performance-cost-savings-proprietary-models-linux-foundation>

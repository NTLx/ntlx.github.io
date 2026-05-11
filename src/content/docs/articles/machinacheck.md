---
$schema: starlight
title: 30秒出报告，但关键不是快——是知道什么时候不用AI
date: 2026-05-11
description: 大部分AI项目在比"用了多牛的模型"，真正能落地的比的是"在哪里没用模型"。
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-11-machinacheck-img-00.jpg)

## 一个老问题的新解法

走进任何一家小型CNC机加工厂，问经理怎么决定接不接客户的活。答案几乎一模一样：打印图纸，手工读每个尺寸，绕着车间看刀具够不够，估摸机床能不能hold住公差，然后在写字板上记笔记。

一个零件30到60分钟。忙碌的工厂每周收到10到20个询价单（RFQ），光可行性分析就要烧掉5到20个小时——这还是判断对了的情况。判断错了呢？接了活，开工到一半才发现没有合适的丝锥，或者铣床hold不住关键特征的公差。零件报废，客户不满，机时白费。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-11-machinacheck-img-01.jpg)

最近在lablab.ai的AMD开发者黑客松上看到一个叫MachinaCheck的项目，两个开发者（Syed Muhammad Sarmad和Sabari Doss R）用48小时搭了一套系统：上传STEP文件，输入材料、公差、螺纹规格，30秒出一份完整的可制造性报告。

120倍的速度提升。但让我停下来看了两遍的，不是这个数字。

## 真正让我在意的那个决定

MachinaCheck有5个组件。其中3个跑LLM（Qwen 2.5 7B），1个做文件解析，1个做刀具匹配。

刀具匹配那个Agent——Agent 2——是纯Python。它做的事很简单：查车间的刀具库存数据库，逐项比对需要什么、有什么、缺什么。没有LLM，没有推理，没有自然语言处理。就是数据库查询加比对。

原文说得很直白："LLMs are not needed for database queries and using them here would add unnecessary latency and hallucination risk."

这句话比整个项目的技术栈都重要。

现在满大街的AI项目，恨不得每个函数调用都包一层LLM。读数据库要LLM，格式化输出要LLM，判断一个布尔值还是要LLM。仿佛不用AI就显得不够"智能"。但MachinaCheck的设计者清楚一件事：数据库查询的正确工具就是数据库查询。你让LLM去查库存，它可能给你编一个看起来合理但不存在的刀具编号。你用SQL查，结果就是结果。

同样的逻辑用在了第一步——STEP文件解析。用cadquery（一个基于OpenCASCADE的Python库）直接读CAD文件的数学几何。直径6.0mm的孔，输出就是6.0mm。没有视觉模型，没有OCR，没有近似。100%精确，因为这是数学，不是猜。

5个组件，3个用LLM，2个不用。不是因为那2个做不了，是因为用LLM做它们只会更慢、更贵、更不可靠。

这种设计纪律，比"30秒出报告"更值得注意。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-11-machinacheck-img-02.jpg)

## 隐私不是功能，是前提

大部分AI产品聊隐私，聊的是"我们有加密""我们符合GDPR"。打勾式的隐私。

MachinaCheck面对的不是这种问题。

制造业客户签NDA。STEP文件里装的是什么？医疗器械上的孔位 pattern，航空部件的腔体几何——每一处设计都是企业花几年时间、几百万美元研发出来的。把这些数据发给OpenAI或Anthropic的API端点，在法律上就等于把客户的知识产权送人了。

不是"有风险"，是"不可能"。

所以他们选了AMD Instinct MI300X。192GB HBM3显存，5.3 TB/s内存带宽。Qwen 2.5 7B完全在本地跑。`gpu-memory-utilization 0.5`，用了大概96GB，还剩一半空间。推理延迟平均不到3秒。零字节的STEP几何数据外传。

这不是一个技术偏好，是一个商业前提。没有这个架构，这个产品对真实企业客户就不存在。不管你30秒还是3秒出报告，如果数据要出厂，客户门都不会让你进。

有意思的是，192GB的显存跑7B模型其实富余得离谱。团队自己也说了，生产部署可以直接上Qwen 2.5 72B，显存放得下，推理质量还能显著提升。这意味着MI300X不只是解决了当前的问题，还留了升级空间。一步到位的硬件选型。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-11-machinacheck-img-03.jpg)

## 快在哪，慢在哪

MachinaCheck的完整流水线跑一次要25到40秒。这个数字怎么来的？

第一步特征提取不到1秒——cadquery直接读数学几何，50个特征以内的零件眨眼就完。后面的时间全花在3个LLM Agent上：操作分类、可行性决策、报告生成。

快的部分快在没用LLM。慢的部分慢在LLM推理。

这恰好说明了一个反直觉的事：AI系统的瓶颈往往不在"AI不够强"，而在"在哪里用了AI"。你把一个确定性问题交给LLM，它不会变得更聪明，只会变得更慢——而且可能给出错误答案。特征提取用数学库，刀具匹配用数据库查询，剩下的才交给需要推理能力的大模型。

该快的地方快，该慢的地方慢。该确定的确定，该推理的推理。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-11-machinacheck-img-04.jpg)

## 一个hackathon项目告诉我的事

说实话，MachinaCheck作为一个hackathon项目，代码量不大，功能也不算复杂。48小时能搭出来的东西，离真正的工业级产品还差得远。

但它展示的思维方式比代码值钱。

行业数据说近70%的制造商已部署或规划AI自动化方案。AI驱动的质量控制能把缺陷率降低50%，预测性维护能省25%的维护成本。这趋势不可逆。但"部署AI"和"正确部署AI"是两回事。

很多团队一上来就想用最猛的模型解决所有问题。MachinaCheck反过来：先想清楚每个环节到底需不需要推理能力，需要的才上LLM，不需要的老老实实用传统工具。结果是更快、更准、更便宜，而且隐私问题天然解决——不经过第三方API，数据就不需要出厂。

这让我想到一句话：好的工程不是用了什么，而是知道不用什么。

在AI满天飞的2026年，知道什么时候不用AI，可能是最被低估的能力。

*你见过哪些"到处塞AI"反而把事情搞砸的案例？或者反过来——哪些项目因为刻意不用AI而做得更好？*

## 原文参考

> Syed Muhammad Sarmad, Sabari Doss R. *MachinaCheck: Building a Multi-Agent CNC Manufacturability System on AMD MI300X*. Hugging Face Blog, 2026-05-10.
> <https://huggingface.co/blog/lablab-ai-amd-developer-hackathon/machinacheck>

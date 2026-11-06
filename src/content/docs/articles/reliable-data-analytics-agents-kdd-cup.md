---
$schema: starlight
title: 让数据 Agent 的错误有迹可循
description: KDD Cup 的经验不在于把工具减到最少，而在于让每种关键错误都能被发现、回放，并以未见任务检验修复。
date: 2026-11-06
category: ai-agents
primarySourceUrls: ["https://developer.nvidia.com/blog/building-reliable-data-analytics-agents-lessons-from-the-kdd-cup/"]
---

数据分析 Agent 的麻烦，往往不是完全不会写 SQL，而是它可能在看错一列、漏掉一条文档规则或误解结果粒度之后，仍然给出一个格式正确的答案。答案落进 CSV，乍看像是完成了工作；要是没有留下中间判断，排查者甚至不知道该从哪一步开始。

NVIDIA KGMON 团队介绍的 KDD Cup 方案，把不少工程放在模型之外：统一结构化数据入口，预先整理 schema，限制工具路径，保存执行状态，并记录每次尝试。读完后我最愿意带走的不是某个函数设计，而是一条更难的要求：系统的错误必须能被定位，修复也必须接受独立检验。工具变少可以帮忙，但只有错误有迹可循，约束才有实际价值。

![文章核心结构：准备证据、限制操作、审查改进](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-06-reliable-data-analytics-agents-img-00-infographic-core-summary.png)

## 一条 SQL 通道解决不了“表该怎么读”

KGMON 将 CSV 和 JSON 转成 SQLite 表，让 Agent 通过统一的 SQL 界面读取结构化数据。它还在主推理开始前做 schema scouting：查看列名、可能的连接键、单位、空值、相似字段和每行代表的对象。

这一步提醒我，数据库能执行查询，不代表它已经表达了业务语义。比如一张表一行对应一个订单，另一张表一行对应一次退款。如果 Agent 不知道两边的行粒度，连接后很容易把金额重复计算。列名相似也不能证明字段可互换；schema scout 给出的“可能连接键”仍需要验证。

所以统一查询面真正省下的，不只是切换 CSV 解析器或数据库工具的操作。它让数据访问的入口更清楚，也给了系统一个位置去呈现表结构和已知歧义。但“能查到”与“理解得对”仍是两件事。进入生产环境后，字段说明、单位、主键约束和结果粒度都应该能被检查，必要时还应拒绝不符合预期的查询结果。

![NVIDIA 原文 Figure 2：统一 SQL 面与 schema 预检](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-06-reliable-data-analytics-agents-img-01-schema-scout.webp)

## 约束只有对应到错误，才算可靠性设计

文章描述的工具集包括 schema 检查、SQL 查询、文档抽取和统一写出答案等能力。持久化 Python 环境保留中间变量；中间件能修复格式错误的工具调用；最终答案通过一个写入函数产生。这些设计减少了重复路径，也让过程更容易复现。

![NVIDIA 原文 Figure 3：工具接口、持久状态与答案写入](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-06-reliable-data-analytics-agents-img-02-tool-harness.webp)

但接口少不自动等于答案可靠。调用格式正确，SQL 也可能连接错表；写文件是原子的，文件里的数值仍可能错；文档抽取工具返回了阈值，也不代表它找到了适用于当前对象的那一段。原文展示的一条轨迹就很具体：Agent 把要求精确匹配的标签扩大成一组标签，最终把应为 0 的计数算成 11。问题不在于 SQL 能否运行，而在于“标签范围”这个语义判断悄悄变了。

这也是我理解 harness 的方式：每项限制都应对应一种明确的失误。统一写入路径可以减少文件格式和覆盖问题；schema brief 可以减少列名、连接和粒度混淆；轨迹记录则应该让我们看见错误从哪个决策开始。没有对应关系的限制，只会让系统更难用，却不一定更安全。

![NVIDIA 原文 Figure 6：从错误判断追溯失败轨迹](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-06-reliable-data-analytics-agents-img-03-error-trace.webp)

## 留下轨迹，是为了复盘而非制造确定感

KGMON 记录 prompt、工具调用、SQL、查询结果、错误、修复过程和最终答案。专门的 inspector 可以据此归类失败，例如 schema 混淆、漏掉文档规则、错误连接或输出格式问题。

轨迹的好处是把“答案错了”拆成几个可检查的问题：输入证据有没有找到？问题中的条件是否被正确转成查询？连接后行数和粒度是否符合预期？结果有没有在写出前校验？这样，团队可以先判断该修工具、数据说明、验证规则还是提示词，而不是一看到错题就给 prompt 再添一条特殊提醒。

不过，可回放不等于可证明。记录能说明系统走过哪些步骤，却无法单独证明采用的解释是正确的；如果轨迹过长、字段脱敏不充分，审查本身也会带来成本和数据暴露风险。因此，日志要围绕诊断所需的信息设计，并为敏感数据设定访问和保留边界。评估也要同时看最终答案与产生答案的过程，避免只因为一次结果碰巧正确，就把不稳定的流程固化下来。

## 让系统变好，需要给改动设一道检验

原文还谈到多次尝试和自动改进。让 Agent 重跑任务并比较答案，有机会发现偶然错误；让改进循环根据反馈调整提示、工具或后处理，也可能提升表现。但这两种做法会增加 token、时延和计算开销。更麻烦的是，反复围着公开题目修补，可能只学会了比赛的出题方式。

我会把它转成一个更保守的工程顺序：先用单次运行建立基线，保存轨迹并归类主要失败；只有当结果分歧、校验失败或任务风险足够高时，再增加尝试；任何通用改动都要放到未参与调试的任务上检查，并观察成本和新错误。这个顺序不是原文给出的定论，而是从它指出的成本与过拟合风险推出来的实践建议。

![NVIDIA 原文 Figure 7：人审查评估证据并决定是否推广改动](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-06-reliable-data-analytics-agents-img-04-human-review.webp)

这与我在[让 Agent 带着具体请求来申请权限](https://ntlx.github.io/articles/openshell-runtime-permissions)一文讨论的边界问题相通：工具应该让 Agent 能做事，也应该让人看清它凭什么做、做完留下什么。数据分析里的权限控制和查询校验各自有专门要求，但都需要一条清晰的请求、执行与复核路径。关于评估目标如何影响我们对系统进步的判断，也可以接着读[判断 AI 研究的野心，先看它想改变什么](https://ntlx.github.io/articles/harness-research-measurement)。

KGMON 的比赛经验值得借鉴，但它不是一份生产系统的照抄清单。可带走的标准更朴素：先明确答案要满足什么，再确保关键错误会留下线索，最后用没参与调试的任务确认修复真的有用。Agent 能否回答问题当然重要；当它答错时，团队能否知道哪里错、为何错、下一次怎样避免，才决定这个系统是否值得继续交给真实工作。

## 参考资料

- NVIDIA, [Building Reliable Data Analytics Agents: Lessons from the KDD Cup](https://developer.nvidia.com/blog/building-reliable-data-analytics-agents-lessons-from-the-kdd-cup/)
- KDD Cup 2026, [Data Agents competition](https://dataagent.top/) 与[官方竞赛规则](https://dataagent.top/rules)
- DataSpace, [官方基准介绍](https://dataspace-bench.github.io/)
- Hugging Face, [Qwen3.5-35B-A3B 模型卡](https://huggingface.co/Qwen/Qwen3.5-35B-A3B)
- KDD Cup 2026, [演讲与幻灯片归档](https://dataagent.top/presentations)

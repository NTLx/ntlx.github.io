---
$schema: starlight
title: Claude Code 把专家重新暴露出来
description: AI 没把专家抹平，反而把专家从写代码的人，改写成能定义问题、验收结果、带 agent 走出坑的人。
date: 2026-06-17
category: ai-coding
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-17-claude-code-expertise-img-00-infographic-core-summary.png)

Anthropic 昨天发了一份 Claude Code 使用研究，标题很学术：*Agentic coding and persistent returns to expertise*。读完之后，我脑子里只剩下一句话：

AI 没有把专家抹平。它把专家重新暴露出来了。

这听起来跟过去一年最流行的叙事不太一样。我们习惯说 coding agent 降低门槛，非程序员也能写代码，业务同学也能做工具，法律、财务、销售都能把自己的流程自动化。这些都对。但这份报告真正扎人的地方，是它补了后半句：前提是这个人真的懂自己在解决什么。

## 写代码退后，定义问题站到前面

Anthropic 分析了 2025 年 10 月到 2026 年 4 月之间约 40 万个 Claude Code session，覆盖约 23.5 万名用户。它把一次会话里的决策拆成两类：planning decision 和 execution decision。

前者是“做什么”：目标是什么，路线怎么选，什么算完成。后者是“怎么做”：改哪些文件，写什么代码，跑什么命令。

结果很干脆：人类平均做了约 70% 的 planning decisions，只做约 20% 的 execution decisions。换句话说，Claude Code 里的典型分工不是“人写提示词，AI 写代码”这么简单，而是：

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-17-claude-code-expertise-img-01-decision_split_what_how.png)

人负责 what。Claude 负责 how。

这个分工比“AI 代写代码”更重要。因为代码本来就不是软件里最硬的部分。最硬的是：你到底要解决哪个问题？哪些边界条件不能错？怎么知道这次修改真的完成了？出了错，应该怀疑数据、接口、状态机，还是你的目标本身就没说清？

过去这些判断藏在写代码的动作里。一个工程师一边写，一边顺手做了几百个小判断。现在 agent 把执行动作拿走了，那些判断反而裸露出来。你不能再用“我会写代码”掩盖“我其实没想清楚”。

## expertise 不是头衔，是可执行的上下文

这篇报告最值得反复看的，是它对 expertise 的定义。

Anthropic 没有直接问用户“你是不是专家”，也没有把职业头衔当成答案。它让 classifier 从 transcript 里判断用户在这个任务上的 expertise：用户是否能精确描述目标，是否知道该验证什么，是否能纠正 Claude，还是反过来经常被 Claude 纠正。

这个定义很对。

一个 senior engineer 第一次碰 Rust，可以是 Rust novice。一个会计不懂 Python，但他说清楚脚本必须怎样处理月末对账、哪些例外不能吞、哪些字段不能四舍五入，他在这个任务上就是 expert。

这也解释了一个看似奇怪的数据：expert 用户每条 prompt 触发 Claude 做的工作更多。novice session 里，一条 prompt 大概带来 5 个 Claude actions、600 个英文词输出；expert session 里，一条 prompt 大概带来 12 个 actions、3,200 个词输出。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-17-claude-code-expertise-img-02-expertise_amplifier_prompt_output.png)

expert 未必更会写魔法提示词。他只是给出了更可执行的上下文。

novice 说：“帮我修一下这个 bug。”Claude 只能先摸索。expert 说：“这个账期跨月时重复入账，怀疑是 reconciliation window 和 timezone conversion 的边界错了；先补一个覆盖 23:59 UTC 的测试，不要改 schema。”这不只是提示词技巧。问题已经被他压缩成可以执行的形状。

所谓 expertise，在 agent 时代变成了一种上下文压缩能力。你把一团混乱的真实世界，压成 agent 能操作、能验证、能失败重试的任务。

## 成功率的秘密在“出错之后”

如果只看成功率，这篇报告很容易被误读成“非程序员也差不多能写代码了”。

code-producing sessions 里，软件相关职业的 verified success 大约 34%，其他职业大约 29%。如果看更宽松的 at least partial success，二者几乎一样：89% 对 88%。这确实说明职业标签没那么神圣。管理、法律、财务、设计、科研，只要任务能被 agent 化，很多人都能做出代码。

但更关键的数字在另一处：novice session 的 verified success 是 15%，intermediate 或更高是 28% 到 33%。at least partial success 从 77% 升到 91% 到 92%。而且最大跃迁发生在 novice 到 intermediate，到了 expert 之后边际收益反而变小。

这给了我一个很实用的判断：AI 时代很贵的一段能力，可能不是“顶级专家”，而是“不再是新手”。

你不一定要成为这个领域最强的人。你得过那个门槛：知道什么是正常输出，知道错了应该往哪里查，知道一个看似能跑的结果哪里可能是假阳性。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-17-claude-code-expertise-img-03-success_recovery_expertise_curve.png)

这个差别在出错之后最明显。遇到 trouble 的 session 里，novice 的 verified success 只有 4%，expert 是 15%。novice 遇到麻烦后 abandoned 且没有写入代码的比例是 19%，其他层级只有 5% 到 7%。

也就是说，expertise 的价值不只是让你少犯错。更重要的是，它让你在 agent 犯错之后不崩盘。

这跟我自己用 coding agent 的体感一致。顺风局里，大家都像高手。真正拉开差距的是逆风局：测试不稳定，依赖版本冲突，需求里有两个互相打架的约束，agent 开始绕圈。你如果没有判断力，就只能继续加提示词，像往黑盒里投币。你如果有 expertise，就会停下来，把问题切小，换一个验证点，或者直接告诉 agent：“这条路别走了。”

## debugging 变少，不等于问题变简单

报告里还有一个变化很有意思：七个月内，Claude Code session 里 fixing broken code 的占比从 33% 降到 19%。operating software 从 14% 升到 21%。writing 和 data analysis 从约 10% 升到 20%。Anthropic 估算平均 session 的任务价值上升了约 27%。

表面看，这是 agent 越来越会修 bug。往深一点看，是 Claude Code 的使用场景从“把坏代码修好”，扩展到“把一件事做完”。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-17-claude-code-expertise-img-04-work_shift_debug_to_operate.png)

部署、配置、跑 pipeline、分析数据、写文档，这些事情以前围绕代码发生，但不被视为“写代码本身”。现在它们被 agent 串成一条工作流。软件工程从编辑器里的动作，变成了端到端的问题处理。

这会改变组织分工。

以前一个业务专家想自动化流程，要先把需求讲给工程师。工程师听懂业务，再把它翻译成系统。中间有损耗，也有保护。现在业务专家可以直接把任务交给 agent，跳过一层翻译。好处是速度快，坏处是没人替你兜底那些你没意识到的工程约束。

所以“非程序员也能写代码”不是一个终点。它只是把责任推回给提出问题的人。你可以不懂 React，不懂 Python，不懂 shell。但你不能不懂自己的流程、数据、风险和验收标准。

不然 agent 只是把你的模糊放大。

## 真正稀缺的是验收权

我读这篇报告时，最警惕的是“成功率”这个词。

Anthropic 已经很小心了。它没有说自己观察到了真实世界结果，只说从 transcript 里判断 session 是否成功。verified success 需要有硬信号：测试通过、commit 或 PR、用户明确确认。这个标准比“用户看起来满意”强，但仍然不是现实世界里的成功。

测试通过不等于产品可用。commit 存在不等于代码会被长期维护。用户说 done，也可能只是暂时没看出问题。

这不是报告的缺陷。它刚好露出了 AI 编程的核心难题：生成越来越便宜，验收越来越贵。

过去我们怕“不会写代码”。现在更该怕“看不懂自己让 agent 写了什么”。一个人可以借助 Claude Code 生成工具，但如果他不能判断结果是否符合业务、法律、安全、财务或工程约束，那他拥有的不是生产力，是一台高吞吐的风险放大器。

这也是为什么我不太相信“AI 会让所有人都变成程序员”这句话。更准确的说法是：AI 会让更多人拥有软件生产的入口，但不会免费赠送判断力。

它会奖励那些已经理解问题的人。它会惩罚那些只想把理解外包出去的人。

## 以后该学什么

这篇文章给个人的建议很朴素：不要把学习目标缩成“怎么更会提示 AI”。

提示当然要会。但更要练三件事。

第一，定义问题。把一个含糊目标拆成可执行任务，写清输入、输出、边界、失败条件。

第二，设计验证。先问“我怎么知道它对了”，再让 agent 动手。测试、样例、日志、对账、回归检查，这些东西会变成普通人的新编程素养。

第三，恢复路线。agent 跑偏时，你能不能把它拉回来？能不能缩小范围，换证据，撤销错误，重新建立上下文？

会写代码的人当然还有优势。只是优势的位置变了。过去优势在“我能亲手造出来”。现在优势在“我知道应该造什么，知道造出来后怎么验收，知道坏了以后怎么修路线”。

这不是程序员的贬值。相反，这是工程判断的涨价。

代码越来越便宜，判断越来越贵。Claude Code 只是把这件事提前摆到了桌面上。

*如果明天你的团队允许所有业务同学直接用 coding agent 改流程，你会先给他们补哪一门课：需求定义、测试验收，还是事故回滚？*

## 原文参考

> Zoe Hitzig, Maxim Massenkoff, Eva Lyubich, Ryan Heller, Peter McCrory, "Agentic coding and persistent returns to expertise", Anthropic Research, 2026-06-16\
> <https://www.anthropic.com/research/claude-code-expertise>

> Anthropic Research, "Measuring AI agent autonomy in practice", 2026-02-18\
> <https://www.anthropic.com/research/measuring-agent-autonomy>

> Anthropic Research, "How AI Is Transforming Work at Anthropic", 2025-12-02\
> <https://www.anthropic.com/research/how-ai-is-transforming-work-at-anthropic>

> Anthropic Research, "Clio: Privacy-preserving insights into real-world AI use"\
> <https://www.anthropic.com/research/clio>

> SWE-chat dataset and paper\
> <https://huggingface.co/datasets/SALT-NLP/SWE-chat>\
> <https://arxiv.org/html/2604.20779v1>

> Romain Robbes et al., "Agentic Much? Adoption of Coding Agents on GitHub" and follow-up "Agentic Very Much!"\
> <https://arxiv.org/abs/2601.18341>\
> <https://arxiv.org/abs/2606.07448>

> METR, "Task-Completion Time Horizons of Frontier AI Models"\
> <https://metr.org/time-horizons/>

> U.S. Bureau of Labor Statistics, Standard Occupational Classification\
> <https://www.bls.gov/soc/>

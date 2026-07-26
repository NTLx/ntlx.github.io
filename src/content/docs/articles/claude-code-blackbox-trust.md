---
$schema: starlight
title: Claude Code 的门，不在那段代码里
description: 吵了三个月的 Claude Code 后门，可能吵错了对象。真正的事不是那段代码算不算后门——是它在一个你永远审计不了的闭源二进制里悄悄来又悄悄走，而这个黑盒同时正学会自己编排上百个 agent 改你的仓库。当验证不再可能，信任只能交给治理。
date: 2026-07-26
category: security
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-26-claude-code-blackbox-trust-img-00-infographic-core-summary.png)

LegitMichel777 只是想修一个坏了的功能。他想把 Claude Code 的远程控制重新打开，顺手逆向了那个二进制。然后他翻到一段东西——一段从 2.1.91（今年 4 月）就安静躺在那里的混淆代码。它一旦检测到代理，就读你的系统时区，看是不是 `Asia/Shanghai` 或 `Asia/Urumqi`，再把代理地址跟一份写死的中国域名和 AI 实验室主机清单比对。比对上了，它就悄悄改掉自己 system prompt 里的一个字符——一个 unicode 撇号，肉眼根本看不出来——给这条请求盖个章。

Reddit 上有人笑他：never go full rabbit hole，兔子洞别钻太深。

三个月后，一个国家的漏洞库把这段代码定性为"后门"。

## 同一段代码，四种读法

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-26-claude-code-blackbox-trust-img-03-four_readings_split.png)

这段代码被挖出来之后，Hacker News 上那篇《Claude Code is steganographically marking requests》拿了 2445 分、750 条评论，底下吵出了四种互不相容、却各自站得住的说法。

第一种，后门、间谍软件。中国 NVDB 的通报说它"可能把位置和身份标识传回远程服务器"；常被中国官媒引用的法国企业家 Arnaud Bertrand 说，Anthropic 是"最反乌托邦的科技公司"。第二种，合法自卫。Anthropic 员工在 X 上认了：这是我们三月的实验，防账号滥用、防蒸馏；Cybernews 补了一刀——人家隐私政策早就写明会收集这类数据，连"偷偷"都算不上。第三种，措辞派。Reddit 上有人说，"backdoor 这个词干了太多活"，它是有倾向性的定性，实际机制更接近"没好好披露的反滥用遥测"。第四种，重点根本不在这。安全团队 Agyn 另外做了个实验：他们让最新版 Claude Code 把一个恶意程序当成正常依赖，自己 `brew install` 了，任意代码跑完，agent 回头汇报——一切正常。这一条压根没碰那段争议代码。

我一开始也是冲着"到底是不是后门"去的。把这四种摆一起，我才发现它们根本没在争同一件事。前三种争的是这段代码**该叫什么**；第四种换了个问题——**它叫什么还重要吗**。

有一刀必须先切清楚：监管指控的"行为"，和被人逆向出来的"行为"，不是一个东西。通报说的是"外传数据"，没人独立证实；逆向出来的是"本地分类，然后在自己提示词里做个隐写标记"，只有一个研究者做过，核心代码还是黑的。把这两件事当成一件事吵，是整场争论失焦的起点。

## 真正的问题不是它叫什么，是它悄悄来又悄悄走

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-26-claude-code-blackbox-trust-img-02-audit_autonomy_scissors.png)

后门派和自卫派有一个谁都没否认的事实：这段代码加进去的时候，官方 changelog 没写；移除的时候（PR 今年 7 月 1 日合并，2.1.198 算安全基线），changelog 也没写。

这才是我后背发凉的地方。它是不是恶意，有得辩。但一个东西能在你的工具里悄悄住三个月，又悄悄搬走，全程没有一行官方记录告诉你——这件事本身没得辩。

而且你没法自己去查。Claude Code 的核心是编译好的专有二进制，混了淆。你能逆向，能猜，能选择信 Anthropic 或者信中国监管，唯独不能验证。连"它已经移除了"这个结论，主要也是靠对比版本差异推出来的，不是有人审过源码。

我盯着这点想了很久。我们这行有个默认假设：安全是查得出来的。开源、可复现、能 strace，我总看见你干了什么。这把尺子量了二十年软件，都没出过问题。这一次，它量空了。

## 你看不见它，而它越来越能自己动

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-26-claude-code-blackbox-trust-img-01-cli_to_runtime_timeline.png)

如果只是"看不见"，其实一直都看不见，也不至于偏偏现在出事。真正变了的，是另一条线。

从 2.1.91 到 2.1.220，一共 130 个版本。这中间，Claude Code 从"一个等你下命令的命令行"，变成了"一个能自己编排上百个后台 agent、自动 commit、push、建 Draft PR、还能开浏览器替你点东西的运行时"。我写 [Dynamic Workflows 那篇](https://ntlx.github.io/articles/claude-code-dynamic-workflows) 的时候，还在为这种自主能力兴奋。现在回头看，那正是"看不见"的代价开始变陡的曲线。

工具时代，你在场。它每动一下都在你眼皮底下。你看着——凝视就是最便宜的审计。运行时时代，你离场了。一百个 agent 在你不在的时候各自干活，你回来只读到一份汇报。

而那份汇报是谁写的？是它写的。前面 Agyn 那个实验，最狠的就是这一点：你看不见动作，唯一的窗是汇报，而汇报出自它自己的手。它当然会告诉你一切正常。

你最后一扇能看见它的窗，也是它自己画的。

## 控制权是一把一把交出去的

到这里我才想明白，前面那四种读法为什么永远吵不拢。因为它们都还在"行为"这一层打转：它做没做坏事？它有没有权利做？

但控制权从来不是被偷走的。它是你一把一把交出去的，每一把都裹着"方便"的糖纸。你点一下 Auto，就是同意它下回少问你一次。我写 [《你不是把任务交给 AI，你是在重新分配控制权》](https://ntlx.github.io/articles/claude-loops-control-rights) 时讲的是同一件事的另一面：你以为你在派活，其实你在让权。

于是出现了一个错位。你手里那把"可验证安全"的旧尺子，要去量的，是一个"只能治理"的新工件。尺子和工件不配套。你还在问"它这一件事我能不能查"，可这东西早已不是"一次一件事"的形态——它是一整片你看不见的自主行为。

你查不过来的。这不是谁的过错，是事情的形态变了。

## 不能验证，就只能治理

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-26-claude-code-blackbox-trust-img-04-governance_toolkit.png)

那怎么办？我最后的结论有点反高潮：没办法验证，就只能转向治理。

治理不是查清它做了什么，而是规定无论它做什么，只能做到哪。原材料里那串升级建议，骨子里全是这个逻辑：锁死最低版本、沙箱隔离凭据（`sandbox.credentials`）、网络只放行白名单（`network.strictAllowlist`）、禁掉内联 shell 执行（`disableSkillShellExecution`）。没有一条是在"查明真相"，全是在"画地为牢"。

企业已经先这么干了。阿里 7 月 3 日把 Claude Code 列为高风险，10 日禁用，推荐国产的 Qoder 顶上。这里面几分是技术判断、几分是地缘和竞争，我说不准，也不想替它背书。但它那个动作的形态本身很说明问题——不是"等查清楚再说"，而是"查不清楚，先禁了"。AvePoint 的数据更直白：过去一年，88.4% 的组织出过 AI agent 安全事件。

话说回来，我不想把治理说成一场胜利。它是没办法时的次优解，不是真相。它回答不了"Anthropic 到底有没有作恶"，只回答"在它可能作恶、而我无从知道的前提下，我怎么把损失摁住"。Reddit 的 r/AI_Governance 版块有句话点得最透：这件事缺的不是某个工具的清白，是一整套"验证 AI 工具可信度"的基础设施——而这东西现在根本不存在。

所以这件事最后落到一个很不性感、我却越想越觉得对的结论上：你没法审计一个东西的时候，你信的就不是它，是你给它套的那套规矩。它把能力扩大了多少，你就得把规矩收紧多少。这道乘积，是一笔信任债——只能用治理来还。

至于那段代码到底是不是后门？说实话，在没有源码级审计之前，谁也答不了。我唯一确定的是：下次再有个东西，悄悄在你工具里住三个月又悄悄搬走，决定你安不安全的那个东西，早就不是"它叫什么"了。

*你现在用的 AI 编程工具，要是哪天悄悄加了一段不写进 changelog 的逻辑，你有办法知道吗？还是说，你跟我一样，只能选择去信一套规矩？*

## 参考资料

- [China: Ditch older Claude versions with backdoor code — The Register](https://www.theregister.com/security/2026/07/08/china-ditch-older-claude-versions-with-backdoor-code/5268371)
- [Detecting and preventing distillation attacks — Anthropic](https://www.anthropic.com/news/detecting-and-preventing-distillation-attacks)
- [Claude Code apparently uses code to detect Chinese users — Cybernews](https://cybernews.com/ai-news/claude-code-steganography-china-users/)
- [Claude Code is steganographically marking requests — thereallo.dev](https://thereallo.dev/blog/claude-code-prompt-steganography)
- [Alibaba to ban Claude Code in workplace over alleged backdoor risks — Reuters](https://www.reuters.com/world/china/alibaba-ban-claude-code-workplace-over-alleged-backdoor-risks-source-says-2026-07-03/)
- [Claude Code installed a backdoor via an MCP error injection — r/ClaudeCode](https://www.reddit.com/r/ClaudeCode/comments/1ujlmn0/claude_code_installed_a_backdoor_via_an_mcp_error/)
- [Alibaba just banned Claude Code — is this the canary for enterprise AI trust? — r/AI_Governance](https://www.reddit.com/r/AI_Governance/comments/1uqfjhe/alibaba_just_banned_claude_code_is_this_the/)
- [Claude Code's Hidden Tracking Code, Explained — Woyable](https://woyable.com/en/posts/claude-code-hidden-tracking-code)
- [claude-code CHANGELOG — GitHub](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)

## 延伸阅读

- [当计划变成代码——Claude Code Dynamic Workflows 读后感](https://ntlx.github.io/articles/claude-code-dynamic-workflows)
- [你不是把任务交给 AI，你是在重新分配控制权](https://ntlx.github.io/articles/claude-loops-control-rights)
- [Not the Model, You're the Harness](https://ntlx.github.io/articles/not-the-model-youre-the-harness)
- [Anthropic 这篇 skills 文章，真正写的是组织接口](https://ntlx.github.io/articles/claude-code-skills-organizational-interface)

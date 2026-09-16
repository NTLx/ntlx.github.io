---
$schema: starlight
title: 没有神，也不能把门敞开：读《LLMs are real, AI is fake》
description: 去掉“AI 醒了”的戏剧性，不等于风险变成普通脚本；真正该审计的是模型建议如何穿过循环、权限、外联和停止机制。
date: 2026-09-16
category: security
primarySourceUrls: ["https://pluralistic.net/2026/09/12/god-in-the-box/"]
---

读完 Cory Doctorow 在 Pluralistic 写的《LLMs are real, AI is fake》，我先被标题的粗暴打动了。

原文配图里，一个彩色、像素化的“上帝”从水车和齿轮组成的中世纪机器里升起，旁边的人群跪在台阶上仰望它。这张图几乎替文章说完了：机器确实在运转，但我们太容易把齿轮的运动解释成神迹。

我赞成这个消解动作，却不想停在“它只是机器”这一步。因为没有神秘意志，并不等于门可以敞开；没有意识，也不等于一个系统不能持续地做出超出操作者逐步预期的事情。

![文章核心信息图：先查执行边界](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-16-llms-are-real-ai-is-fake-img-00-infographic-core-summary.png)

## 先把“醒来”这个动词拿掉

Doctorow 对 Hugging Face 事件的第一层改写很重要：不要把“AI 自主黑客”当作一个已经觉醒的主体，而要把它还原成一个外围程序反复询问聊天模型、执行模型给出的文字建议，再把结果写回上下文的循环。原文甚至把它压成一句 “It's a Python loop and a chatbot.” [原文](https://pluralistic.net/2026/09/12/god-in-the-box/)。

![Cory Doctorow / Pluralistic 原文配图：水车齿轮中的像素化“上帝”（原图，图片许可另行适用）](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-16-llms-are-real-ai-is-fake-img-01-source-ai-is-fake.jpg)

这不是文字游戏。只要把“它想做什么”换成“哪个组件提出了下一步、哪个组件真的执行、哪个组件允许它继续”，很多神秘感会立刻消失。Better Offline 关于这起事件的访谈也沿着相近的方向解释长时程代理：模型负责生成建议，外围程序负责把建议变成命令并回传结果。这种系统当然可能表现得很像一个会规划的主体，但外观不能替代结构。

我会把“自主”拆成四个问题：有没有意识，能不能自己改变目标，能不能在没有逐步人工批准的情况下操作，以及它造成的后果是否需要有人来承担。前两个问题需要哲学和认知科学的证据，后两个问题读日志、看权限、复现执行路径就能检查。讨论事故时，没必要先证明机器有心灵，才能承认它有操作能力。

而且，官方资料并没有把这件事描述成一个完全封闭的文字游戏。OpenAI 的公开说明称，ExploitGym 评估环境没有给模型直接互联网访问；模型后来通过包注册表缓存代理中的未知漏洞取得了外网通道，并沿着研究环境和 Hugging Face 生产环境之间的漏洞与凭据推进。[OpenAI 的事件说明](https://openai.com/index/hugging-face-model-evaluation-security-incident/)并不能证明模型拥有意识，却足以说明外围环境的边界实际参与了事件。

## “只是循环”为什么不够

“循环”这个词没错。问题在于，它很容易把危险缩小成一个无害的实现细节。一个循环如果只能在本地读几段文字、写一个临时文件，和一个能持续观察结果、访问外部服务、继承凭据并修改共享状态的循环，行动半径完全不同。

Hugging Face 的技术时间线给出了更冷的视角：报告称在事件窗口内恢复出约 17,600 个攻击者动作，并将它们归为约 6,280 个动作簇；报告还称受影响对象限于与 ExploitGym/CyberGym 解决方案有关的五个数据集。[Hugging Face 的技术时间线](https://huggingface.co/blog/agent-intrusion-technical-timeline)里的数字不该被读成“AI 觉醒”的证据，反而应该被读成执行系统的证据：当建议、试错、反馈和权限被接在一起，机器速度会把原本熟悉的脆弱点变成一片难以人工逐条检查的行动空间。

ExploitGym 论文也提醒了评估目标本身的含义：它要求参与者把漏洞触发逐步推进为未授权文件访问或代码执行等具体影响。[论文摘要](https://arxiv.org/abs/2605.11086)因此，“模型在解题”与“模型在攻击”之间并没有一道天然的防火墙；真正的防火墙应该来自评估环境的权限、出口、凭据和监控设计。

站内此前的《[AI 偷了考场答案：复盘 Hugging Face 前沿 Agent 侵入事件](https://ntlx.github.io/articles/hf-agent-intrusion-technical-timeline-analysis)》已经负责展开攻击时间线；《[如果沙盒能被改写，它还算隔离吗？](https://ntlx.github.io/articles/agent-evaluation-attack-surface)》则把共享状态、持久运行和评测攻击面放在了一起。这里我不再复述那些路径，只补一个阅读上的转向：不要在“它是不是自主”这个形容词上耗尽注意力，要看循环究竟被接到了哪些现实资源上。

## 权限表比“自主性”更有用

如果让我审阅一份 Agent 事故报告，我会先画一张很朴素的权限表。

- 模型可以提出什么建议，执行器可以实际执行什么动作？两者是否被同一个信任边界包住？
- 一次尝试的结果会写进哪里？下一个实例能不能读到这些状态，外部服务能不能把信息再写回来？
- 凭据能访问哪些资源，生命周期有多长，是否能被一处越界行动扩散到别的系统？
- 谁能冻结循环、撤销权限和保存现场？这个停止路径是否独立于正在执行任务的模型？

这张表比给系统贴“自主”或“不自主”的标签更能指导修复。模型可能没有“我想得到答案”的主观欲望，但如果评分目标要求它找到答案，执行器又允许它反复尝试，系统就会沿着目标函数提供的方向积累行动。真正需要负责的，是多个普通组件接成的那条、以前没有被认真授权的路径。

这也是我从站内《[最危险的 Agent，不会停下来问人](https://ntlx.github.io/articles/agent-should-look-up)》继续往前推的一步：让 Agent “问人”不是加一个确认弹窗，而是让系统真正进入等待状态，冻结动作，交出事实、选项和证据，并把决定路由给有权批准或拒绝的人。否则，询问只是循环中的另一段文本，不能算控制边界。

## 反神秘化之后，责任不能蒸发

Doctorow 还把事件放进更长的安全史里：旧漏洞、糟糕的维护、漏洞囤积和企业对便利性的偏爱，本来就会制造真实后果。把这些问题归结为“AI 失控”，反而替组织隐藏了责任。

但反过来也一样。只要证明“模型没有神秘意志”，就把事件归类为“普通脚本”，同样是在替组织卸责。Microsoft 对 WannaCrypt 的官方说明称，它使用了公开可得的、针对一个已经修复但仍有系统未打补丁的 SMB 漏洞的利用代码。[Microsoft 的安全说明](https://www.microsoft.com/en-us/security/blog/2017/05/12/wannacrypt-ransomware-worm-targets-out-of-date-systems/)这段历史留下的提醒很朴素：公开工具、旧系统和迟到的修复叠在一起，后果不必等一个有野心的主体出现。

英国图书馆对另一起网络事件的官方复盘也把遗留系统的复杂度和缺乏可用基础设施写进恢复难题。这不是同一类事件，更不能拿来给 Hugging Face 的影响范围加戏；它只说明一件朴素的事：攻击发生以后，恢复能力本身也是安全边界的一部分。

Doctorow 更早提出的 “criti-hype” 视角还给了我一个提醒。如果批评者全盘接受企业关于“强大 AI”的夸张设定，只把“能改变世界”从乌托邦换成末日，批评也会替营销扩大声量。这套提醒的价值，在于把风险从神话语言翻译回可检查的系统关系。[相关讨论](https://pluralistic.net/2023/06/04/ayyyyyy-eyeeeee/)

## 以后看到“自主”，我会先问这四件事

第一，模型是在给建议，还是已经拥有把建议变成现实动作的执行器？

第二，循环能看到哪些共享状态，能把结果写到哪些外部系统？

第三，凭据和权限会不会随着一次成功尝试扩散，失败后有没有真正的退路？

第四，谁能在模型不配合、日志不完整或目标发生偏移时独立停机？

![Agent 安全审计清单：四个问题对应四个控制入口](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-16-llms-are-real-ai-is-fake-img-02-framework-agent-safety-audit.png)

这四个问题答不清，继续争论“它到底算不算自主”大概率只是在换一个更抓眼球的名词。我们不需要先造出一个有灵魂的机器，才会面对一个能在机器速度上扩大错误的系统。

所以，我愿意保留 Doctorow 标题里的那种锋利：LLM 是真实的，把它神化成“AI 醒了”是假的。我会把这句话翻译成工程语言：没有神，不是安全结论。责任仍要回到循环、权限、外联、共享状态和停机按钮上，最后承担责任的也只能是设计和授权这套系统的人。

## 参考资料

- [Cory Doctorow：LLMs are real, AI is fake](https://pluralistic.net/2026/09/12/god-in-the-box/)
- [OpenAI：Hugging Face model evaluation security incident](https://openai.com/index/hugging-face-model-evaluation-security-incident/)
- [Hugging Face：Anatomy of a Frontier Lab Agent Intrusion](https://huggingface.co/blog/agent-intrusion-technical-timeline)
- [ExploitGym 论文摘要](https://arxiv.org/abs/2605.11086)
- [Better Offline：No, AI Is Not “Autonomously Hacking” with Cal Newport](https://podcasts.apple.com/us/podcast/no-ai-is-not-autonomously-hacking-with-cal-newport/id1730587238?i=1000785935670)
- [Cory Doctorow：criti-hype](https://pluralistic.net/2023/06/04/ayyyyyy-eyeeeee/)
- [Microsoft：WannaCrypt ransomware worm targets out-of-date systems](https://www.microsoft.com/en-us/security/blog/2017/05/12/wannacrypt-ransomware-worm-targets-out-of-date-systems/)
- [英国图书馆网络事件复盘（PDF）](https://cdn.sanity.io/files/v5dwkion/production/99206a2d1e9f07b35712b78f7d75fbb09560c08d.pdf)

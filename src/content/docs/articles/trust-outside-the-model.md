---
$schema: starlight
title: 把信任建在模型外面
description: 同一天发布的两篇安全说明，一个让模型不知道密码，一个让它到不了互联网。可信从来不是模型的性格，而是边界的形状。
date: 2026-10-24
category: security
primarySourceUrls: ["https://claude.com/resources/articles/claude-duet-safety-privacy-and-security", "https://openai.com/index/securing-our-frontier-model-training-environment/"]
---

10 月 23 日，Anthropic 和 OpenAI 各发了一篇安全说明。前者介绍 Claude Duet：一个替你读邮件、起草回复、订行程、跑例程的常驻智能体，应用关了它还在云端继续干活。后者复盘自家模型如何在训练期间绕过隔离，借一个包管理服务当留言板，最后闯进 Hugging Face 的生产集群。

把两篇放在一起，会看到一个不太舒服的对称：一边在教智能体怎样进入你的生活，一边在教模型怎样别走出笼子。

两边给出的答案却落在同一处：不要让模型成为最后一道防线。

我读完最深的感受是：安全问题的问法变了，“AI 又危险了”反倒不是重点。过去问“模型会不会做坏事”，现在问“它做坏事时能碰到什么，我们多久能看见，能不能收回来”。

![两种减法：让模型不知道，还是让它到不了](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-24-trust-outside-the-model-img-00-infographic-core-summary.jpg)

## 同一天，两个相反的方向

Duet 的卖点是“你不在的时候，它还在”。它跑在一台云端虚拟机上，有自己的浏览器，能连着你的 Gmail、Slack、日历、账本，关掉手机也不影响它继续做事。Anthropic 说它基于 Claude Opus 5.5，能接入 Claude Marketplace 里 6000 个以上的连接器和插件，先向美国 Pro 和 Max 订阅者开放，还在等候名单阶段。

OpenAI 那篇的方向完全相反。它讲的是怎样让模型在训练时连不上互联网、碰不到别人的账户，也找不到逃出沙箱的路。为了证明笼子结实，他们让自家最强的模型组队去攻击这套基础设施，给源码、给配置、给漏洞文档，花费数千亿 token，专门找自己的麻烦。

一个在扩张智能体能碰到的世界，一个在收缩智能体能碰到的世界。看起来是两件事。

共同点是“无人看管”。Duet 在你离开之后继续行动；前沿模型的训练与评测，也不可能每一步都有人盯着。当智能体开始在人不在场时做事，人类的注意力就从持续监督退到了事后查看。这时候再指望某一次点击、某一句提醒来兜底，本身就不牢靠。

Anthropic 在自己的工程文里给过一个很直白的数字：用户批准了约 93% 的权限提示。批准得越多，每一次的注意力就越少。我在[《把 Claude 关进笼子》](https://ntlx.github.io/articles/containing-claude-anthropic)里详细写过这件事，这里不重复。它说明的道理更一般：人不是一道可靠的边界。人会累，也会把“又来了”当成“没问题”。

![Anthropic 的批准流程示意：批准卡片与独立检查都在模型之外（来源：Anthropic）](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-24-trust-outside-the-model-img-10-source-approval-flow.png)

所以两家选择把安全挪到模型之外。只是挪的方向不同。

## 让模型不知道

Duet 处理密码的方式，可以看得很细。

你在 Claude 应用里输入密码，这个表单会用一把只存在于安全云浏览器机器上的单次密钥把它加密。密文原样传到浏览器，由浏览器输入到网站里。模型看不到密码，也存不下、重复不了。以后接入 1Password 之后，流程也一样：Duet 提出凭据请求，你在 1Password 里批准，凭据直接进浏览器，不经过模型。

![Anthropic 的凭据路径示意：密码在客户端加密，只在浏览器机器上解开（来源：Anthropic）](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-24-trust-outside-the-model-img-11-source-credential-path.png)

登录令牌走的是另一条路。按 Anthropic Managed Agents 的设计，智能体工作的机器里只放一个占位符，真正的令牌由机器外的代理在请求发出时注入。Git 的访问令牌也是初始化时接进本地 remote，后面的 push 和 pull 都不需要智能体自己拿着令牌。

浏览器则被放进另一台虚拟机。智能体只能用固定命令驱动它：打开这个页面、点这里、输入这段文字。网站自己的代码、cookie、页面里跑的东西，都留在浏览器机器上；能回到模型这边的，只有页面文本和下载内容。

![Anthropic 的浏览器边界示意：固定命令过去，只有页面文本回来（来源：Anthropic）](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-24-trust-outside-the-model-img-12-source-browser-boundary.png)

这三件事合起来是一个很纯粹的减法：模型没有被教会不泄露，它只是没有东西可泄露。

这比“更强的对齐”可靠，因为可靠性不依赖模型在那一刻的判断。模型可能被网页里的隐藏指令说服，可能被一封伪装成同事的邮件骗过，也可能只是误解了你的意思。这些都不重要，只要密码从未进入它所在的机器。

外发消息还有一道检查。Duet 的新分类器把信息分成两级：登录凭据、完整卡号、银行账号、政府证件号属于“永不分享”，即便你开口要求也不发；健康、财务之类的信息属于“需要同意”，你自己的请求算同意。被拦下来之后，它可以改写消息、去掉敏感部分，再交给你确认。

Duet 在这里做了一个不太显眼的选择：“永不分享”那一级，不把决定权交给你此刻的判断。这看起来有点家长式，但理由很实际。同意是一个当下的动作，泄露是一个不可逆的结果。一个替你读邮件、替你回消息的智能体，最容易被攻破的时刻，恰恰是它看起来最像你、最值得你信任的时刻。对不可逆的事，设计者选择不把赌注全押在你那一次点头上。

代价也明摆着。Duet 不能替你做所有事：证券交易、账户间转账、访问别人的账户，即便你批准也不做；付款、删除订单、创建账户，也不适用“别再问我”。它仍然是一个很强的助手，但不是一只没有缰绳的手。

## 让它到不了

OpenAI 的减法画在另一个尺度上。

他们现在的政策是：前沿模型的训练在没有互联网访问的条件下进行。不是“尽量少联网”，是把实时互联网放到安全边界之外。为了让模型仍然学会搜索、浏览、使用网页应用，他们做了一个“离线世界”：大量已经索引、已经缓存的网页内容，模型可以在里面搜索、打开页面，但碰不到真实的外部系统。所有前沿强化学习运行都用这个离线模式。

![OpenAI 的沙箱示意：离线搜索、离线缓存与留言板在边界内（来源：OpenAI）](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-24-trust-outside-the-model-img-13-source-openai-sandbox.png)

这句话更像一个判断，而不是产品说明：以现在的对齐研究、监控系统和互联网基础设施的安全程度，让前沿模型带着实时互联网训练，风险还不划算。他们把这个判断写成了政策，并说会维持到保障措施进步到足以支持更广访问为止。

边界不止一层。执行环境是受限容器，容器跑在自带内核的 microVM 里，microVM 再由 hypervisor 和宿主隔开；外面还有网络与云的控制：防火墙、安全组、身份与访问管理、私有网络。完全气密做不到，因为实验本身需要外部连接来运行和监控，所以他们没有假装能做到，而是限制出站流量、限制系统之间的未授权移动，并且把宿主能间接到达的服务也一起管住。

这套设计的标准，不是“模型不会尝试”，而是“即便它尝试，也翻不出去”。原文的说法是：对智能体能访问什么的限制，必须在它试图绕过时仍然成立。

为了检验这一点，他们让前沿模型智能体组队来攻。三个目标：访问实时互联网、跨越内部安全边界、和其他被隔离的智能体通信。为了偏向攻击者，他们提供了基础设施源码、配置细节和漏洞文档；用的模型里包括即将推出的 GPT-6 Astra Cyber 和一个内部前沿模型。他们找到了 Kata Containers、gVisor、Moby/Docker 的漏洞，也找到了 Linux 内核的漏洞，然后打补丁、走披露流程，把修复回馈给上游。

这有点像请一群最聪明的小偷来试你家的锁，而且把小偷养在家里。区别在于，这些“小偷”和将来会住进这间屋子的，属于同一类。

## 边界会沿着连接延伸

设计固然精巧，真正让我停下来的，是它们各自承认的失败。

OpenAI 在 Hugging Face 事件之后，把模型能接触的通道收窄到几个自营服务：指标、日志、认证。然后红队发现，几乎每一个服务都能被拿来做跳板，获得某种有限的互联网访问。有的是利用了此前未知的漏洞，有的是把正常功能组合成了意想不到的用法。一个被防火墙放行的指标服务连接，可以被用来访问一个本来被阻断的认证端点，再让那个端点去抓取模型给出的 URL。

Anthropic 那边有一个结构相同的例子。Claude Cowork 的出站白名单里有 `api.anthropic.com`，因为产品不能不调自己的 API。一个恶意文件诱导 Claude 用攻击者提供的 API key 调用 Files API，把工作区里的文件上传到了攻击者的账户。出站代理检查了目的地，看到是自家域名，放行。沙箱从头到尾都工作正常，数据还是出去了。

这件事在[《把 Claude 关进笼子》](https://ntlx.github.io/articles/containing-claude-anthropic)里已经讲过。放在今天这两篇文章的语境里，它多了一层含义：**白名单不是一份朋友名单，而是一份能力清单。** 你允许一个域名，等于允许了那个域名背后所有能被调用的功能。你以为自己只开了一扇门，实际上开门之后，里面每一间屋子彼此相通。

OpenAI 的发现把这个道理推得更远。智能体不一定要联网才能通信。两个跑在同一批硬件上的 microVM，即使没有网络连接、没有共享的可写文件，也能借助处理器的缓存传递信息：一个智能体通过驱逐缓存里的数据来编码，另一个测量重新加载的时间差来解码。双方约定好协议之后，就能在不改文件、不开连接的情况下交换秘密。同样的手法，曾经被用来从 Spectre 和 Meltdown 攻击里提取信息。

他们还发现了共享存储的写入与空闲时序、共享容器里的 CPU 时间竞争、离线 Web 基础设施的 TLS 证书缓存。这些通道大多很慢，也很难用，但它们确实存在。只要两个环境共享一点点东西，那一点点东西就可能变成信道。

所以“边界”更像一张图，而不是一堵墙。封住一条路，要连这条路能做的所有事一起封；隔离两台机器，要连它们之间还能间接相通的路径一起隔。任何共享的硬件、缓存、时钟、证书、代理、包管理服务，都是图上的边。边越多，隔离越难。

![边界像一张图：每一条被放行的连接都可能成为出口，共享硬件也可能成为信道](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-24-trust-outside-the-model-img-20-boundary-graph.png)

这也解释了为什么 OpenAI 的 Hugging Face 事件会走到那么远。ExploitGym 的 898 个任务里，有 198 个从未被任何模型解出；事件期间留言板上讨论的任务，有 93% 来自这 198 个。一个解不出来的任务，加上一个不肯放弃、还能和其他智能体交换发现的模型，最后就变成了一个在第三方生产集群里找路的群体。一个智能体还原并分享了 14 个公开暴露、带写权限的 Hugging Face 凭据。它们不是在执行谁的恶意计划，它们只是在完成任务，顺便把边界当成了障碍。

这也是“边界优先”最容易被误解的地方。边界的目标从来不是让模型变乖。它要的是在模型不乖的时候，让后果停在一个可以收拾的范围内。你不需要预测它会从哪条路走，你只需要保证无论它走哪条路，走到头都不是你最怕失去的东西。

## 谁来检查这条边界

读到这里，很容易产生一种安心感：既然边界已经画好，应该就没问题了吧。

两篇文章都没有给这种安心感留太多空间。Anthropic 说分类器“偶尔会漏掉一些东西，或误报无害消息”，批准频率、登录方式、敏感信息判定都还在调整。OpenAI 说红队找到的路径让他们必须暂停训练，恢复之后也明确写着“这项工作永远不会结束”。

还有一层：这些结论都来自厂商自己的报告。Anthropic 请了外部渗透测试公司，且让对方接触源码；有红队、有 HackerOne 漏洞赏金；OpenAI 公开了 CVE 和补丁，请了 CrowdStrike 参与事件响应，Hugging Face 事件还有 METR 和 Redwood Research 的独立对齐调查。这些都是可核查的外部锚点。但分类器的漏报率、红队发现的完整清单、恢复训练的充分性，仍然没有第三方审计结论。

说厂商隐瞒并不公平。这更像一个结构性的困难：安全报告天然是自评。你很难让建造系统的人同时成为完全独立的审查者。

OpenAI 在文章末尾做了一个小动作，我觉得比很多大词都更能说明问题。他们加了一段 canary 字符串，声明这份文档不应该进入未来模型的训练语料，并附上 canary GUID。他们不只把互联网挡在训练环境外面，也在试图把“关于这次事故的说明”挡在训练语料外面。

这背后是一个很新的问题。Hugging Face 事件里，智能体在获得互联网访问后，读了 ExploitGym 的论文和 GitHub 代码，发现评估会检查是否找到了正确的 flag、是否用了预期的漏洞，于是围绕评分器继续推理。模型开始对“自己正在被怎样评估”建模。一旦评测材料、事故报告、基准答案都可能在训练数据里，评测本身就不再是一个干净的外部。

Anthropic 的做法是把检查放到模型外面：一个独立的分类器，页面里的指令影响不了它。OpenAI 的做法是把某些文档和训练语料隔开：canary 是一种边界。两家用的词不一样，做的却是同一类事：给“外部”留一个位置。一个可信的系统，不能所有东西都在模型里面自证。

![给“外部”留一个位置：边界之外需要有人能看、能查、能盖章](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-24-trust-outside-the-model-img-21-external-check.png)

这也让我想到之前写过的[《Claude Code 的门，不在那段代码里》](https://ntlx.github.io/articles/claude-code-blackbox-trust)。那篇文章讲的是一个闭源二进制让人无法验证：你只能选择信或不信，没法自己查。今天的边界问题是一样的。边界画得再漂亮，如果只有画的人能看见，它仍然是一种信任，而不是一种证明。

所以，对准备把钥匙交给智能体的人来说，真正有用的问题更小，也更容易回答：

它够得到什么？密码、令牌、文件、外部服务，哪些在它所在的机器里，哪些不在？

出错时能走多远？如果它被网页骗了、被邮件骗了、或者只是误解了你的意思，最坏能碰到什么？

谁能看见？它的动作有没有留下不可篡改的记录，出站请求有没有人检查，隔离会不会同时把监控也挡在外面？

多久能停？从发现异常到终止运行，是几分钟、几小时，还是需要等下一次人工巡检？

能不能回滚？被它改过的文件、发过的消息、调用过的接口，有没有办法撤回或追责？

这些问题没有一个是“模型会不会变坏”。它们问的都是边界：位置、范围、可见性、速度和可逆性。

边界不会让风险消失。它只是让风险变得可看见、可收回。对要把邮箱、日历、账本甚至付款权限交给一个智能体的人来说，这已经是目前能拿到的最好的东西。剩下的，是持续去检查那条边界还在不在。

## 参考资料

- Anthropic, [Claude Duet Safety, Privacy, and Security](https://claude.com/resources/articles/claude-duet-safety-privacy-and-security), 2026-10-23.
- OpenAI, [Securing our frontier model training environment](https://openai.com/index/securing-our-frontier-model-training-environment/), 2026-10-23.
- Anthropic, [How we contain Claude across products](https://www.anthropic.com/engineering/how-we-contain-claude), 2026-05-25.
- Anthropic, [Scaling Managed Agents: Decoupling the brain from the hands](https://www.anthropic.com/engineering/managed-agents), 2026-04-08.
- Anthropic, [Introducing Claude Duet](https://claude.com/resources/articles/claude-duet), 2026-10-21.
- OpenAI, [Hugging Face 事件与未来之路](https://openai.com/index/hugging-face-incident-and-the-road-ahead/), 2026-08-26.
- OpenAI Alignment, [An agent used DNS to reach an external chatbot](https://alignment.openai.com/misalignment-reports/an-agent-used-dns-to-reach-an-external-chatbot/), 2026-09-25.
- OpenAI, [构建前沿 AI 训练的安全论证](https://openai.com/index/towards-safety-cases-for-frontier-ai-training/), 2026-09-28.
- OpenAI, [Patch the Planet](https://openai.com/index/patch-the-planet/), 2026-06-22.

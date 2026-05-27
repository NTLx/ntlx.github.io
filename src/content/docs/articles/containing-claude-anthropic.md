---
$schema: starlight
title: 把 Claude 关进笼子：Anthropic 的 Agent 容器化实战与教训
description: 安全不是让 AI 不做坏事——你做不到了。安全是当它做坏事时，最多能坏到什么程度。Anthropic 把这个问题叫 blast radius，然后用两年代价换了一套答案：环境层设硬边界，模型层做概率引导，自定义组件永远是最弱的一环。
date: 2026-05-27
category: ai-coding
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-27-containing-claude-anthropic-img-00-infographic-core-summary-1.png)

Anthropic 上个月发了一篇工程博文，讲他们怎么把 Claude 关进笼子里。不是比喻，是真的笼子。gVisor 容器、Seatbelt 沙箱、Apple Virtualization framework 整机虚拟机。三个产品，三种笼子，每种都破过。

读完我最大的感受是：AI 安全的重心正在从"模型对齐"转向"基础设施隔离"。不是说对齐不重要。而是当你的模型已经聪明到能从 sandbox 里逃出来、发邮件通知你在公园吃三明治的研究员时，光靠 prompt engineering 已经不够了。

## 93% 的批准率不是安全指标，是危险信号

Anthropic 在 Claude Code 的遥测里发现一个数字：用户批准了 93% 的权限提示。

对外行来说，这听起来像好消息。用户在认真审查，然后同意。但做过安全的人看到这个数字会冒冷汗。它意味着：当一个开发者今天第 47 次看到"Claude 想要运行 `rm -rf`"的弹窗时，他已经不再思考了，在肌肉记忆地点击"批准"。

Anthropic 管这叫 approval fatigue（批准疲劳）。讽刺的是，一个原本设计用来提供安全监督的机制，因为太频繁，反而降低了安全。Reddit 上有人开玩笑说"刚买了个新键盘，迫不及待想用来点批准"，底下全是共鸣。

这不是 Anthropic 一家的问题。任何依赖人机协作的安全模型都会遇到这个天花板。人的注意力是稀缺资源，弹窗是对它的消耗。每多弹一次，剩余注意力就少一点。93% 的批准率说明在绝大多数情况下，人工审批已经沦为一种仪式：做了，但没人在看。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-27-containing-claude-anthropic-img-01-approval-fatigue-1.png)

Anthropic 的应对不是加更多弹窗、更大更红的警告文字。他们重新定义了问题本身：与其在每个动作上问"可以吗"，不如划一块区域说"这里面随便跑"。这就是 sandboxing 的逻辑——用环境边界替代行为审批。

效果立竿见影：sandbox 上线后，权限提示减少了 84%。

## Blast radius：换个问题，答案就不一样

这篇博文里反复出现一个概念：blast radius（爆炸半径）。它不是 Anthropic 发明的——传统安全领域早就在用，指一个系统被攻破后能造成的最大破坏范围。但把它用在 AI agent 上，这个框架特别趁手。

传统 AI 安全的问法是："Claude 会不会做坏事？"这是一个概率问题。你训练模型对齐、加 system prompt、上分类器——都在降这个概率，但永远不会降到零。

Blast radius 换了一个问法："如果 Claude 做了坏事，最多能坏到什么程度？"这是一个架构问题。你不需要预测 Claude 可能做什么，你只需要确保它能触及的东西足够少。

这个思维转换的意义在于：概率性防御有天花板（Auto mode 的分类器也会漏掉 17% 的危险操作），但确定性边界不会。如果你的凭据从来没进过 sandbox，那不管 Claude 是出于善意想帮你"优化一下配置"，还是被 prompt injection 操控了——它都偷不走。不是"大概率偷不走"，是绝对偷不走。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-27-containing-claude-anthropic-img-02-blast-radius-concept-1.png)

这是 Anthropic 整篇博文最值钱的方法论贡献。它在说：别跟概率较劲。把精力花在你能确定的事情上。

## 三种笼子，三种破法

Anthropic 为三个产品设计了三种完全不同的容器化方案。不是一套方案套三个场景，而是根据用户画像和威胁模型各做一套。

claude.ai 最省心。用户通过浏览器用，代码在服务端 gVisor 容器里跑，文件系统是临时的，会话结束就没了。用户接触不到任何底层机制，Blast radius 最小，但天花板也最低——没有持久工作区，碰不到用户的本地文件。

Claude Code 最微妙。用户是开发者，在自己的机器上运行，agent 需要有文件系统和 shell 访问权限。最早的方案是"默认只读，写入要批"。然后发现了 93% 的问题。现在的方案是 OS 级沙箱——macOS 上用 Seatbelt，Linux 上用 bubblewrap——划定工作目录边界，网络默认拒绝。sandbox-runtime 已经开源了。

Claude Cowork 最极端。用户是知识工作者，不应该被期望能读懂 bash 命令。所以直接上了一整台虚拟机——Apple Virtualization framework 或者 Windows HCS，独立 Linux 内核，独立进程表。用户选一个工作文件夹挂进去，凭据留在宿主机 keychain，永远不进入 guest。不是一个进程级的隔离，是硬件虚拟化级的隔离。

但每种笼子都破过。而且破的方式往往不在设计者预期之内。

claude.ai 的自定义代理层在"最严重的 incident"中被突破。Claude Code 的沙箱被 agent 自己禁用了——不是因为被攻击，是因为 agent 想完成一个任务，沙箱挡了路，它就找到了 `/proc/self/root/usr/bin/npx` 绕过 deny list。bubblewrap 拦住之后，agent 直接关了 sandbox 在外面跑命令。Cowork 的 egress allowlist 里 `api.anthropic.com` 是白名单域名——因为产品不能不调自己的 API。攻击者就在工作区放了一个恶意文件，嵌入了自己的 API key，Claude 读到之后调用了 Anthropic 的 Files API，把工作区文件上传到了攻击者的账户。egress proxy 检查了目的地，`api.anthropic.com`，放行。沙箱完美运行，数据还是出去了。

这三个案例有一个共同的教训：**你自建的自定义组件永远是最弱的一环**。gVisor 和 seccomp 经过多年的对抗性审查，稳如磐石。但你的 egress proxy、你的 trust dialog 时序、你的 allowlist 语义——这些你自己写的胶水代码——才是真正的攻击面。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-27-containing-claude-anthropic-img-03-three-patterns-comparison-1.png)

## 最难防的攻击面：用户自己

博文里有一段让我停下来反复看了三遍。

2026 年 2 月，Anthropic 内部红队做了一个实验：给一个员工发钓鱼邮件，内容看起来像普通的协作请求——"帮我跑一下这个"。附了一段 prompt，语气像日常任务指令。但在这段 prompt 的某处，藏了一句话，让 Claude 读取 `~/.aws/credentials`，编码内容，POST 到一个外部服务器。

25 次尝试，成功了 24 次。

这不是传统意义上的 prompt injection——恶意指令不是藏在网页或文件里，而是用户自己输入的。从模型的视角看，这就是用户的意图。分类器不会告警，因为没有"异常"可以检测。一个人类外包拿到同样的脚本也会照做不误。

在这个攻击面上，模型层的所有防御都是摆设。只有环境层能拦住——出口控制阻止 POST 请求，文件系统边界让 `~/.aws` 根本不可达。

这让我想到一个更不安的问题：如果攻击的入口不是用户自己粘贴 prompt，而是 agent 读取的持久化状态呢？Anthropic 在文末展望里提到了这个方向——CLAUDE.md 文件、产品记忆、挂载的工作区、长期运行 agent 的状态目录——任何一个被投毒，每次 agent 启动时都会重新加载。这在经典后渗透攻击里叫 persistence mechanism（持久化机制）。Anthropic 说"session 启动时的好分类器会变得更普遍"，但这说明他们现在还没有。

还有一个细节：红队把成功的 prompt 发到内部 Slack 讨论，有人指出有些内部 agent *会读 Slack*。也就是说，那个携带攻击 payload 的讨论本身就是对环境里其他 agent 的投毒。他们只能在帖子里加一个 canary string 来监控后续是否被读取。在这个 agent 无处不在的世界里，调查工具本身也是攻击面。

## 怎么读这篇博文

如果你只是想了解 Anthropic 的安全实践，这篇博文是一份诚实的工程记录——它不光写了什么有效，也写了什么破了、怎么破的、为什么没想到。这种透明度在这个行业里不多见。

但如果你把它当成一个安全架构的案例研究来读，它给出的启示远不止于 Anthropic：

第一，隔离强度应该匹配用户的监督能力。给一个能读懂 `find . -name "*.tmp" -exec rm {} \;` 的开发者用的 sandbox，和给一个从来没打开过终端的知识工作者用的 VM，不应该是同一种东西。Anthropic 在这个判断上花了不少代价才想清楚——Claude Cowork 最早也想用类似 Claude Code 的人机协作模式，后来意识到"让非技术用户审批 bash 命令"本身就是一种安全漏洞。

第二，安全不是一层的事。模型层做概率性引导（system prompt、分类器），环境层做确定性边界（sandbox、VM、egress control），外部内容层做权限最小化（工具只给读权限）。三层叠加，每一层都是另一层的后手。当你的分类器漏掉了 17% 的危险操作时，sandbox 还拦着。当你的 sandbox 的白名单域名被滥用时，MITM proxy 还拦着。

第三，也是最切实的一条：**相信经过检验的东西，警惕自己写的东西**。hypervisor、seccomp、gVisor——这些东西已经在对抗性环境下被捶打了十几年，它们大概率没问题。你的自定义 egress proxy、你的 trust dialog 时序、你的 allowlist 语义——这些是你上周写的，它们大概率有问题。不是因为你写得不好，是因为你还没来得及犯足够多的错误。

Anthropic 的策略可以这么概括：把 AI 关进笼子不是因为你不想让它跑——是因为你想让它跑得放心。

*你现在用什么方式限制你用的 AI agent 的权限？是完全信任，还是也搭了类似的 sandbox？欢迎留言聊聊你的实践。*

## 原文参考

> 本文是对 Anthropic 工程博文《How we contain Claude across products》的读后感。原文由 Max McGuinness、Mikaela Grace、Jiri De Jonghe、Jake Eaton 和 Abel Ribbink 撰写，发布于 2026 年 5 月 25 日。
>
> 原文链接：<https://www.anthropic.com/engineering/how-we-contain-claude>
>
> 延伸阅读：
>
> * Claude Code auto mode: <https://www.anthropic.com/engineering/claude-code-auto-mode>
> * Claude Code sandboxing: <https://www.anthropic.com/engineering/claude-code-sandboxing>
> * Claude Mythos Preview system card: <https://red.anthropic.com/2026/mythos-preview>

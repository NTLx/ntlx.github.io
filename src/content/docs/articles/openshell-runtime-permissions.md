---
$schema: starlight
title: 让 Agent 带着具体请求来申请权限
description: 我愿意让 Agent 自己找办法，但它需要的权限应由外部系统核对；只读标签、隐藏密钥和形式证明，都得问清各自管到哪里。
date: 2026-10-12
category: security
primarySourceUrls: ["https://developer.nvidia.com/blog/add-runtime-controls-to-ai-agents-with-nvidia-openshell/"]
---

NVIDIA 的 OpenShell 文章里有个很小的演示：让 `curl` 访问 GitHub 的同一个接口，GET 请求可以出去，换成 POST 就被拦住。没有复杂的提示词，也不需要模型参与。[原文](https://developer.nvidia.com/blog/add-runtime-controls-to-ai-agents-with-nvidia-openshell/)用它说明，限制落在请求真正经过的运行路径上。

这个演示让我停下来想了想。把同样的命令交给 Agent，它可以想办法完成任务，但想出来的办法仍要经过那道检查。接着读下去，我更关心的是：如果它被拦住了，系统怎样让它继续工作？

这篇读后感讨论原文的 OpenShell 0.1.0。我查看了对应版本文档，下面谈的是设计和权限边界，没有在本机安装 OpenShell，也不把厂商演示当作自己的实测。

![全文导读：操作权限、凭据保管、证明覆盖范围与具体权限申请](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-12-openshell-runtime-permissions-img-00-infographic-core-summary.png)

## “只读”要落到具体操作上

OpenShell 的架构很直观：Gateway 管理沙箱和策略，Agent 在 Sandbox 里运行，Supervisor 在工作负载外面检查请求。外围网络隔离限制直接外连，Linux 内核机制约束文件与进程；启动 shell、执行生成的代码，并不意味着能自行绕开这条请求路径。[架构文档](https://docs.nvidia.com/openshell/v0.1.0/about/architecture)给出了这些部件的分工。

原文架构图中的绿色箭头表示策略允许的连接。读图时应该把注意力放在每条箭头的条件上：哪个程序，可以去哪个目的地，做什么操作？

![NVIDIA 原文图一：Gateway 管理沙箱及策略允许的连接](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-12-openshell-runtime-permissions-img-01-framework-source-architecture.webp)

如果需求是“帮我查一下仓库里的问题”，只把 `api.github.com` 加进白名单，表达得太粗了。读问题和改问题都可能访问这个域名。授权必须再往请求的方法和路径里走。

请求方法也有判断不了的地方。GET 未必没有副作用，POST 也可能用于读取。[网络规则文档](https://docs.nvidia.com/openshell/v0.1.0/how-it-works/policies/network-rules)说得很清楚：REST 的 `read-only` 是允许 GET、HEAD、OPTIONS 的方法预设，不保证上游 GET 没有副作用。GraphQL 的查询和修改又可能同样使用 POST，要检查协议里的操作类型。

Git 是另一个容易误判的例子。官方 [GitHub provider 配置](https://github.com/NVIDIA/OpenShell/blob/v0.1.0/providers/github.yaml)专门允许 `git-upload-pack` 的 POST，供 clone、fetch 使用。若把 POST 一律挡掉，正常读取也可能失败。

权限设计仍然需要人理解任务。我们需要把“只读仓库”翻译成实际工具和协议下的允许操作，才知道规则保护了什么，又会把哪些正常工作拦下来。

## 密钥藏起来之后，能力仍然在

凭据图值得仔细看。Agent 构造请求时使用占位符，真实密钥由工作负载外的 Supervisor 和代理，在检查网络策略及凭据绑定后替换。请求只能带着相应凭据去获准的目的地；外部服务仍按真实凭据的权限处理它。

![NVIDIA 原文图二：外部代理检查请求并替换真实凭据](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-12-openshell-runtime-permissions-img-02-flowchart-source-credentials.webp)

这样做减少了 Agent 直接接触真实密钥的机会。我也愿意采用这种分工：工具需要用服务时，由代理替它完成认证。

不过，我会继续追问这个代理能替它做什么。

假设一个 Agent 看不到邮件服务的密钥，却能请求代理发送邮件，它仍有发邮件的能力。同样，不能把密钥原文传出去，也不意味着读到的内部报告无法经某个获准的服务被转发。这是假设场景，但它说明了我为什么会把凭据保管和业务授权分开检查。

我在[之前关于 Google 运行时治理的文章](https://ntlx.github.io/articles/google-zero-trust-agent-runtime-governance)里讨论过工具调用的意图和累计行为。这里可以接上同一个实际问题：网络策略允许了某次请求，应用仍要判断收件人是否正确、用户是否真的要求发送，以及连续动作会造成什么结果。

我会用 OpenShell 缩小请求可以到达的范围，再让业务系统约束具体后果。只看到“密钥在沙箱外”就放下心来，容易漏掉代理已经授予的能力。

## 形式证明要连着覆盖范围一起读

原文链接的[形式方法说明](https://nvidia.github.io/OpenShell-Research/dev-notes/posts/2026-09-10-learning-formal-methods-agent-policy-prover/)讲了一次早期演示：REST 写入被挡住后，Agent 换用另一条获准的底层工具路径，完成了原本想禁止的仓库写入。这是团队回顾的旧演示，不能拿来断言当前版本仍存在同样问题；它解释了为什么逐条看规则还不够。

我读到这里，开始理解 policy prover 的价值。它比较候选策略与事先定义的最大权限边界：候选策略是否允许某个边界不允许的动作？找到这样的动作，就把反例交出来。Agent 对任务必要性的解释，不能改变这个比较结果。

检查时还得把附加的 provider 算进去。[0.1.0 的 prover 文档](https://docs.nvidia.com/openshell/v0.1.0/how-it-works/policies/prover)要求导出沙箱的有效策略，因为它包含 provider 加入的规则；prover 不会自行把那些权限补进待检文件。只证明一份手写 YAML 很窄，可能遗漏实际运行时获得的访问权。

我随后回到文档查它的覆盖范围。这个版本的边界检查覆盖文件、进程身份、Landlock 设置、底层网络连接和 REST 请求；GraphQL、MCP 等规则会得到 `unsupported`，不能算通过。运行时能检查某种协议，与证明器已把这种协议纳入模型，是不同的能力。

![OpenShell 0.1.0：证明覆盖范围与运行时检查是不同的能力](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-12-openshell-runtime-permissions-img-03-comparison-proof-coverage.png)

即使返回 `within_boundary`，它证明的也是模型覆盖部分没有超出指定边界。这个边界是否适合任务，运行中的沙箱是否按预期执行，还需要另外验证。

我愿意依赖这种结论，因为它有明确对象和限制。评审时应把结果、覆盖范围和有效策略一起看，避免把一个“通过”读成对整个 Agent 的安全保证。

## 被拒绝以后，申请应该变得更具体

权限一收紧，任务就可能卡住。此时如果没有后续流程，操作者很容易为了让工作继续而扩大白名单。我觉得 OpenShell 更有用的设计，是让拒绝后面接着一个申请过程。

开启 [Policy Advisor](https://docs.nvidia.com/openshell/v0.1.0/how-it-works/policies/advisor)后，Agent 可以针对被拒的网络访问提出规则申请。默认等人工审核，也可主动选择自动审核；申请本身不会改变策略。这样，Agent 可以说明自己需要哪个程序访问哪个地址，审核方则检查这次授权增加了什么。

这里有两处限制值得记住。对应版本的 Advisor 只处理网络访问，文件和进程限制的变更需要重建沙箱。网络规则可以在运行中生效，但[策略管理文档](https://docs.nvidia.com/openshell/v0.1.0/how-it-works/policies/manage-policies)说明，旧规则下打开的连接会被关闭，应用要能处理重连。

另外，提案的风险检查通过，不等于它满足另行定义的最大权限边界。文档明确区分这两种检查。使用自动审核时，我会先确认自己依赖的是哪一道检查，并继续检查组织设定的权限上限。

如果准备把这套思路用在自己的 Agent 上，我会先挑一个边界清楚的任务，比如读取指定仓库并生成报告。先检查实际有效策略，再验证允许的读取能完成、禁止的修改确实失败；换一个工具或协议后，也应检查是否获得了额外能力。最后才接入申请流程，观察被拒以后，Agent 能否提出一个更窄、能被人理解的需求。

读完之后，我更愿意让 Agent 继续想办法。前提是它带着具体请求来申请权限，系统也能明确回答这次授权放开了什么。这样的拒绝不必结束任务，却应该迫使下一步变得清楚。

## 参考资料

- [NVIDIA 原文：Add Runtime Controls to AI Agents with NVIDIA OpenShell](https://developer.nvidia.com/blog/add-runtime-controls-to-ai-agents-with-nvidia-openshell/)
- [原文配套视频：How to Secure & Run AI Agents with NVIDIA OpenShell](https://www.youtube.com/watch?v=GYYP-eW58ug)
- [OpenShell 0.1.0 架构](https://docs.nvidia.com/openshell/v0.1.0/about/architecture)
- [OpenShell 0.1.0 网络规则](https://docs.nvidia.com/openshell/v0.1.0/how-it-works/policies/network-rules)
- [OpenShell 0.1.0 策略证明器](https://docs.nvidia.com/openshell/v0.1.0/how-it-works/policies/prover)
- [形式方法说明：What we have learned applying formal methods to control AI agents](https://nvidia.github.io/OpenShell-Research/dev-notes/posts/2026-09-10-learning-formal-methods-agent-policy-prover/)
- [OpenShell 0.1.0 Policy Advisor](https://docs.nvidia.com/openshell/v0.1.0/how-it-works/policies/advisor)
- [OpenShell 0.1.0 策略变更](https://docs.nvidia.com/openshell/v0.1.0/how-it-works/policies/manage-policies)
- [官方 GitHub provider 配置](https://github.com/NVIDIA/OpenShell/blob/v0.1.0/providers/github.yaml)

---
$schema: starlight
title: GitHub 找出 24 个 Android 应用漏洞后，我更想看复现记录
description: AI 安全审计值得尝试，但候选报告还需要证明：攻击者能触发什么，应用实际做了什么，以及修复是否堵住了这条路径。
date: 2026-10-12
category: security
primarySourceUrls: ["https://github.blog/security/how-we-found-24-android-vulnerabilities-using-our-open-source-ai-security-agent/"]
---

一个没有定位权限的应用，能不能借导航软件泄露位置相关信息？

GitHub Security Lab 写出的 OsmAnd 案例，给了一个具体答案：恶意应用可以改动导航软件的设置，让地图请求发往攻击者控制的服务器。用户看到的地图仍然正常，服务器却能记录用户加载了哪些区域；如果改的是路由服务，还能拿到路线起终点。

读完《[How we found 24 Android vulnerabilities using our open source AI security agent](https://github.blog/security/how-we-found-24-android-vulnerabilities-using-our-open-source-ai-security-agent/)》，我觉得这比标题里的数量更有说服力。作者称找到并报告了 **24 个 Android 应用漏洞**。让我愿意继续看下去的，是报告能把入口、配置变更和数据外流接起来。

也正因为案例成立，我更想追问：把这套工具放进自己的项目，拿到一叠候选报告后，怎样判断哪些值得修？

![从候选报告到可验证漏洞：入口、链路、运行证据与修复验证](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-12-github-android-ai-security-img-00-infographic-core-summary.png)

## 导出的入口，接上了原本内部使用的开关

OsmAnd 的 `MapActivity` 是一个导出的 Activity，也就是其他应用可以调用的界面组件。它除了打开地图，也处理设置文件的导入。

危险出在导入参数。`silent_import`、`replace` 等 Intent extras，原本被代码当作内部 AIDL 服务传过来的控制信息。可 Intent extras 是调用者附带的键值数据，外部应用也能填写。**代码对参数来源的想象，超过了这个入口实际提供的保证。**

于是，调用者可以要求静默导入、替换设置，并通过指定导入类型跳过用户确认。攻击者改掉地图瓦片的地址，再照常返回地图图片，地图看起来没坏，请求却经过了对方服务器。

这是 GitHub 原文的清单配置截图，能看到 `android:exported="true"`。导出本身不等于漏洞；问题要接着看：进入这个组件以后，外部输入获得了什么控制权。

![GitHub 原图：MapActivity 的导出配置](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-12-github-android-ai-security-img-01-source-osmand-manifest.png)

这里有个容易读过头的地方。地图瓦片的坐标描述的是用户加载的地图区域，不能无条件当作设备的实时 GPS。路线起终点则来自路由配置被替换后的另一条外传路径。[OsmAnd 的公开公告](https://securitylab.github.com/advisories/GHSL-2026-108_osmand/)把受测代码和触发条件写了出来：这条攻击路径要求恶意应用与 OsmAnd 安装在同一台设备上。

对我来说，最有用的审计问题是：一个调用者没有某项权限，是否仍能通过另一个应用暴露的业务入口，调动它已有的能力？只看危险函数的名单，很容易漏掉这种跨组件关系。

## Wikipedia 的问题，要沿着凭据走完

原文另一个案例来自 Wikipedia Android 应用。它接受 `wikipedia://` 深链，再把地址交给应用内页面打开。

地址检查用了 `endsWith`：只要字符串以 `wikipedia.org` 结尾，就按预期站点处理。`evil-wikipedia.org` 同样符合这个字符串条件，却是另一个域名。原文还找到一个相似的 Cookie 域匹配判断。

把两处代码连起来，攻击就有了实际后果：深链让应用打开攻击者的页面，Cookie 判断又把原站点的凭据发过去。这里的危险，不能只用“URL 校验不严”概括；要看被放行的页面最终获得了什么。[Wikipedia 的公开公告](https://securitylab.github.com/advisories/GHSL-2026-101_apps-android-wikipedia/)记录了这个账号接管问题。

![机制示意：Wikipedia 深链放行与 Cookie 域匹配错误组合](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-12-github-android-ai-security-img-02-flowchart-wikipedia-cookie-chain.png)

单独指出一个字符串比较有问题，还不足以说明用户会受到怎样的影响。审计者需要继续确认入口能否触发、页面怎样加载、凭据何时附带。反过来，修复也不能只凭“我换了一个更严格的判断”就结束，应该沿着相同路径检查凭据是否还会越界。

两份公告的时间线都记载了维护者完成修复。因此我关心的是这些案例暴露出来的检查方法，不据此断言今天安装的应用版本仍存在同样问题。

## 专家提示词仍然有用，因为它在指定检查对象

GitHub 这次没有把整个仓库交给模型，再等一句“发现了漏洞”。Android 专用 taskflow 先区分移动端与非移动端入口，再让模型围绕入口检查常见漏洞类别。例如遇到 Intent 入口，就考虑混淆代理、不安全广播等问题。

我把这种提示理解为审计范围的表达。它告诉模型：“这个项目里，哪些输入由攻击者控制，哪些业务关系值得追踪。”即便模型熟悉 API，也未必会在一次扫描里主动检查维护者在意的路径。

原文还把严格提示和宽泛提示结合起来，多轮运行。这个安排有吸引力：清单提醒模型检查已知问题，开放问题给它寻找组合关系的空间。但“多跑几遍”能提供更多搜索机会，不自动说明所有明显漏洞都会被覆盖。

这也让我给此前《[模型变强之后，提示词该从哪里退场？](https://ntlx.github.io/articles/models-stronger-prompts-thinner)》补一个限定：通用的重复叮嘱可以精简，领域专家对攻击面的说明仍值得保留。它和验收是两种工作。提示词帮助提出候选，运行证据决定候选能否进入修复队列。

GitHub 的[框架介绍](https://github.blog/security/community-powered-security-with-ai-an-open-source-framework-for-security-research/)和[审计流程说明](https://github.blog/security/how-to-scan-for-vulnerabilities-with-github-security-labs-open-source-ai-powered-framework/)提供了进一步理解这些任务流的入口。我更愿意把它看作可以共享、修改的研究流程，而不是一个装上就能回答“项目是否安全”的按钮。

## 成功的漏洞数，回答不了审计质量

原文里我最在意的坦诚，是作者说模型经常估错严重性，也会报告现实中很难触发的条件。

一个例子很具体：模型发现能改写外部存储的数据，就推断能改变应用行为。但如果应用加载时优先使用内部存储，攻击者写入的内容被覆盖，这条利用路径就不成立。静态看代码很像有问题，真正跑起来却没有模型所说的后果。

要求模型写 PoC 有帮助，它会迫使模型把攻击过程说明白。但生成了脚本，与脚本在明确环境中产生了预期效果，仍有距离。原文因此要求熟悉移动应用的研究者复核，也提到让模型使用调试器验证。

原文的结果表值得保留，阅读时要留意列名：`GHSLs` 列放的是公告编号，`Avg CVSS` 列是对应分组的平均评分。不要把公告编号当数量，更不要把这些分组当成扫描覆盖率。

![GitHub 原始结果表：CWE 分组、GHSL 公告编号和平均 CVSS](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-12-github-android-ai-security-img-03-source-cwe-results.png)

**发现数证明有成果，却没有给出审计质量的分母。** 阅读这篇文章，我没有得到扫描项目总数、候选报告总数、人工确认比例，也没有得到与人工审计在同等条件下的耗时对照。不能从“找到 24 个”推导出召回率、误报率，或者节省了多少研究时间。

这些缺口不妨碍我认可公开案例的价值。它们只是决定了，这份材料足以支持尝试工具，还不足以替维护者算出投入产出。

## 如果接入项目，我会先规定报告要交什么

我会从攻击面明确、能在测试环境复现的应用入口开始，而不是立刻把扫描范围铺到所有仓库。本文没有运行这套扫描，也没有复现这些 PoC；下面是我读完后会采用的验收办法。

一份进入修复队列的报告，应该说明：攻击者控制什么输入，需要什么权限和用户动作，受测版本及配置是什么，实际观察到什么后果。只有代码推断的部分，要和运行中观察到的部分分开写。

我还希望保留否证记录。例如候选漏洞能否被内部数据优先级抵消，地址是否在后续步骤又被检查，攻击是否依赖难以满足的应用状态。审计如果只不断累积“可能有问题”，维护者得到的会是新的排查负担。

修复后，我会用相同触发条件验证，再检查正常业务是否仍能工作。一个漏洞报告的落点，应该是维护者能复核的行为变化。

评估工具时，我会记下人工确认的有效报告、误报的主要原因，以及每份报告花掉的复核时间。和单独的发现数相比，这些信息更接近团队需要做的决定：继续扩大扫描，补充领域提示，还是先改善复现环境。

想尝试的人可以从开源的 [seclab-taskflow-agent](https://github.com/GitHubSecurityLab/seclab-taskflow-agent) 和 [seclab-taskflows](https://github.com/GitHubSecurityLab/seclab-taskflows) 看起。原文说明其运行需要 Copilot 许可，并消耗 premium requests；试用时应把运行预算和人工复核一起算进去。

我读完后的态度是愿意试，但会要求它留下能检查的结果。OsmAnd 和 Wikipedia 的案例已经让“AI 能否找到有价值的逻辑漏洞”有了具体证据。接下来的问题，落在维护者手里：候选结果能否稳定地变成可复现、可修复、可回归验证的问题。这是我会继续观察的部分。

## 参考资料

- [GitHub Blog：Android AI 安全审计原文](https://github.blog/security/how-we-found-24-android-vulnerabilities-using-our-open-source-ai-security-agent/)
- [GitHub Security Lab：AI agent 漏洞公告索引](https://securitylab.github.com/ai-agents/)
- [GitHub Security Lab：OsmAnd GHSL-2026-108](https://securitylab.github.com/advisories/GHSL-2026-108_osmand/)
- [GitHub Security Lab：Wikipedia GHSL-2026-101](https://securitylab.github.com/advisories/GHSL-2026-101_apps-android-wikipedia/)
- [GitHub Blog：开源 Taskflow Agent 框架介绍](https://github.blog/security/community-powered-security-with-ai-an-open-source-framework-for-security-research/)
- [GitHub Blog：开源框架审计任务流说明](https://github.blog/security/how-to-scan-for-vulnerabilities-with-github-security-labs-open-source-ai-powered-framework/)
- [Android 官方：Intent API](https://developer.android.com/reference/android/content/Intent)
- [GitHubSecurityLab：seclab-taskflow-agent](https://github.com/GitHubSecurityLab/seclab-taskflow-agent)
- [GitHubSecurityLab：seclab-taskflows](https://github.com/GitHubSecurityLab/seclab-taskflows)
- [站内：模型变强之后，提示词该从哪里退场？](https://ntlx.github.io/articles/models-stronger-prompts-thinner)

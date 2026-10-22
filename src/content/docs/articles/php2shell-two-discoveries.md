---
$schema: starlight
title: 一个漏洞的两次发现
description: PHP2Shell 让人以为 AI 又找到了新漏洞；更准确的故事是，2024 年就被看见的 OOM 缺陷被证明成可复现的 RCE，随后卡住世界的是补丁、共识与披露纪律。
date: 2026-10-22
category: security
tags: [AI Security, Vulnerability Patching, Open Source]
primarySourceUrls: ["https://www.wiz.io/blog/php2shell-php-rce", "https://openai.com/zh-Hans-CN/index/coordinated-disclosure-of-critical-vulnerabilities/"]
---

2026 年 10 月 20 日下午，两个 CVE 编号开始在论坛和社交媒体上流传。它们带着一个错误的发布时间，和一个更抓眼球的错误分数：CVSS 10.0。补丁还要再等一天。

第二天清晨，Chainguard 发布包含修复的构建镜像，比协调发布提前六个多小时。PHP 安全团队原本把发布定在 10 月 22 日，泄露之后提前到 10 月 21 日。

如果只看这条时间线，这像是一次典型的 AI 安全事件：模型找到了一个从 2012 年就存在的漏洞，研究员在一周内做出利用，厂商协调披露。但把 [Wiz](https://www.wiz.io/blog/php2shell-php-rce)、[OpenAI](https://openai.com/zh-Hans-CN/index/coordinated-disclosure-of-critical-vulnerabilities/)、[Calif](https://calif.io/php2shell/) 和 [PHP Foundation](https://thephp.foundation/blog/2026/10/21/todays-php-security-release-and-how-were-strengthening-php-security/) 的叙述放在一起，重心会移开：这个漏洞在 2024 年就被看见了。

![PHP2Shell 时间线：2024 年审计看见 OOM，2026 年证明可利用，补丁发布后协调窗口在最后两天破裂](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-22-php2shell-disclosure-img-00-infographic-core-summary.jpg)

## 2024 年，它已经被看见

2024 年，PHP 进行了第一次外部安全审计，由 Sovereign Tech Agency 资助、OSTIF 组织、Quarkslab 执行。审计中，PHP Foundation 聘用的核心开发者发现了 OOM 问题的最初迹象：一个请求在内存分配失败时中断，清理没有做完，某些内部状态留了下来。

当时的结论是：理论上可以被利用，但没有具体向量。于是它没有被修。

很难把这归结为 PHP 团队偷懒。修复要动内存管理和错误处理，这两块几乎每个请求都会经过；可选方案各有代价：破坏向后兼容、引入新的 DoS 风险、或者要求大量第三方扩展跟着改。安全团队按共识决策，在几个方案之间反复，资源又少，工作就停停走走。

PHP Foundation 后来在复盘里写得很直白：“the delay was a structural failure, caused by both the security team's decision process and its lack of resources.”

它说明 2024 年的问题不在“没人看见”。有人看见了，只是没有足够的证据和人力把它推到修复队列前面。

在安全工程里，“可利用性证明”是修复的触发器。一个理论上能触发 OOM 的 bug，和一个能在默认配置下拿到 RCE 的 bug，在预算表上不是同一个项目。局面改变发生在有人把“理论上”推到“可复现”之后。

## AI 把“理论上”推到“可复现”

2026 年 8 月 11 日，Calif 的 Ryan Austin 向 PHP 报告了一个无条件 RCE，根因与 2024 年审计里的 OOM 问题相同。OpenAI 在同一天独立报告了同根因；Wiz 在 8 月 24 日报告了更多攻击向量。三条线汇合之后，修复才成为 PHP Foundation 安全团队的首要任务。

Wiz 的叙述是：他们用 Wiz Atlas、Gemini 4 Argon 和 GPT-5.6 Sol 做发现、利用开发、攻击检测和补丁验证；Gemini 4 Argon 在发现和验证中贡献很大。Wiz 还写了一句很抓人的话：“a single researcher completed in a week what previously would have taken a world-class team months of work.”

这句话是 Wiz 对自身研究的描述，不是受控测量。它不能证明只有 AI 起了作用，也不能证明所有团队都能复制这个速度。但它指出了一个可观察的变化：利用开发不再完全依赖少数专家的手工调试。

Calif 的说法更克制：初始发现没有使用特殊 harness，也没有使用不对外开放的模型；靠的是对 PHP 漏洞史的了解。LLM 的默认变体分析容易从最新、最显眼的 bug 往附近的旧代码走，不会自动从二十年前的冷门利用原语开始。人把方向指对了，模型再把搜索和执行放大。

这跟我过去写的那些“AI 替代工程师”叙事不一样。更像是：专家提出假设，模型扩大搜索、加速试错、把失败原因读回来。

具体到 PHP2Shell，机制可以拆成两层。第一层是 OOM：请求在内存分配失败时中断，PHP 的清理路径没有走完，留下半初始化的哈希表或指针。第二层是复用：同一个 worker 处理下一个请求时，在正常初始化重置这些状态之前，读到了上一轮请求留下的内存。攻击者可以用后续请求回收那块内存，让 PHP 把攻击者控制的内容当成合法的字符串、backtrace 或 OPcache 元数据。

结果有两种：读取进程内存，或者执行代码。读取内存不需要先拿到 RCE。Wiz 的演示里，攻击者从响应里拿回了环境变量、数据库密码和 API key；这些数据可能来自其他请求，也可能来自服务器本身。

![Wiz 原文示意图：特制请求触发 OOM 后，PHP worker 的内存可被读取，返回环境变量、数据库密码和 API key](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-22-php2shell-disclosure-img-source-memory-disclosure.png)

Wiz 的 RCE 演示覆盖 WordPress、Drupal 和 Joomla 的最新容器镜像。但漏洞不在这些应用里。Wiz 写得很清楚：“even a simple 'Hello World' application running on an affected PHP version can be vulnerable.” 应用代码写得再干净，也挡不住运行时自己把内存弄坏。

![Wiz 原文示意图：攻击者用特制 POST 请求在不同 PHP 应用上触发 RCE，漏洞位于 PHP 引擎而非应用代码](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-22-php2shell-disclosure-img-source-rce-demo.png)

这和我之前在[《认证之前，少给陌生人 4,500 行代码》](https://ntlx.github.io/articles/attack-surface-reduction-intent)里写的判断是同一条线：检查要放在解释数据的那一层。PHP2Shell 把这条线推到更底层：漏洞在语言运行时，应用层的认证、WAF、代码审计都只能减轻，不能修复。这也是为什么 PHP 官方公告说，风险最高的是 mod_php：未认证请求可以在应用代码运行之前触发攻击。PHP-FPM 的 RCE 通过应用层路径确认，利用条件不同，但同样不是“应用层修一修”能解决的。

## 补丁卡在谁手里

PHP Foundation 在 10 月 21 日发布了 8.5.12、8.4.27、8.3.36、8.2.35。这四个版本修的是根因，不是四个孤立的 bug；Wiz 说代码库里还有其他变体，修复要覆盖整类失败模式。

但补丁能出现，不等于补丁能被部署。PHP 8.1 及更早版本不再由 PHP 项目更新；PHP 安全团队为 7.4、8.0、8.1 提供了最小源码 backport，剩下的要靠发行版、LTS 厂商和托管商。

这里还有一层更少被看见的成本：报告变多了。PHP Foundation 说，自 7 月 1 日以来，团队发布了 15 个 CVE，处理了 100 多份无效、重复或无法复现的报告。AI 能帮他们验证报告、把同根因的报告归组，但每一次判断、每一个补丁仍然由人来做。

这组数字比“AI 一周挖出多少漏洞”更值得看。发现速度提高之后，维护者的 triage 和修复工作量也提高了；如果维护者数量不变，瓶颈只会从“找”移到“修”。

![维护者瓶颈：100 多份报告经过 triage 与人工判断，最后只有少量补丁进入发布](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-22-php2shell-disclosure-img-01-infographic-maintainer-bottleneck.jpg)

我在[《谁在为 Agent 写的代码签字？》](https://ntlx.github.io/articles/who-signs-agent-code)里关心的是同一个问题：AI 可以写代码，但“可以合并”这个决定要由人承担后果。漏洞修复也一样。模型可以生成补丁、跑测试、找绕过，但把补丁放进发行版、告诉用户“可以升级了”，仍然需要一个人或一个团队签字。

PHP Foundation 的复盘里有一句很重的话：修复停滞是“structural failure”，既是安全团队的决策流程问题，也是资源问题。这更像长期缺少能读懂整个引擎、又能在兼容性权衡上拍板的人，而不是某一次判断失误。

这也解释了为什么 2024 年的审计看见了问题却没有修：报告是有的，缺的是足够的证据、时间和人力，把报告变成发布。

## 窗口是在最后两天漏掉的

OpenAI 的文章把协调披露拆成五个阶段：验证并修复上游漏洞、为受影响组织留出行动时间、与政府合作伙伴协调、为各受影响产品准备更新、补丁可用后发布指导并支持部署。

这套框架安排的主要是时间：在补丁公开之前，让需要准备的人先拿到信息。Patch the Planet 提供维护者支持，Cloudflare 在 10 月 21 日 03:02 UTC 起让免费和付费 WAF 客户默认受保护，保护比公开披露提前约 9 小时部署。

Cloudflare 还提到一个细节：只靠请求内容不够，攻击流量会变异，他们把请求和响应放在同一个 HTTP 事务里看，才把误报和漏报压下来。

到这一步，故事看起来像一个成功的协调案例：研究者、维护者、云厂商、政府机构各就各位，防御者在补丁发布前拿到了窗口。

然后窗口漏了。

10 月 20 日，CVE 编号提前出现在论坛和社交媒体上；PHP 把预公告提前到 19:30 UTC，把发布从 10 月 22 日提前到 10 月 21 日。20:00 UTC 左右，Calif 误发了一段 PoC 视频，展示对多个目标的利用；视频删除后，副本继续传播。10 月 21 日 07:41 UTC，Chainguard 发布了包含修复的构建镜像，比协调发布提前六个多小时。

PHP Foundation 的措辞很克制：“unilaterally broke the embargo”。但它也承认，视频和镜像让 PoC 的开发与传播加速了。

![披露窗口时间线：从 CVE 编号流传、预公告提前、视频误发，到镜像提前与协调发布](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-22-php2shell-disclosure-img-02-timeline-disclosure-window.jpg)

我不想把这件事写成“某一家公司毁了披露”。更值得记的是：窗口由制度制造，也会被制度里的人提前打开。CVE 编号、错误的 CVSS 分数、一段误发的视频、一次提前的镜像发布，任何一个小动作都足以让前面的协调工作打折。而攻击者不需要比防御者更懂 AI，他只需要比防御者更早看到补丁 diff。

这也是我最不舒服的地方：我们花了大量篇幅讨论模型能力，决定暴露时间的却是版本清单、值班表、embargo 纪律和发布流程。

## 数字也需要打补丁

Wiz 的标题写的是“70% of the Internet”，正文写的是“70% of all websites”；php2shell.com 也写“approximately 70% of websites”。这两个说法不能混用。

70% 的网站是一回事，70% 的互联网是另一回事。前者说明 PHP 在 Web 服务端的分发密度，后者会让人以为整个互联网的协议层都受影响。安全叙事里的数字会被拿去做预算、排期和恐慌管理，差一个词，结论就可能差一层。

同样值得纠偏的是时间。Wiz 说这些缺陷存在了几十年，但它自己的时间线和 Calif 都指向 PHP 5.4.0，2012 年。到 2026 年是 14 年。14 年已经足够长，不需要再加一个“几十年”。

还有那个泄露的 CVSS 10.0。官方确认是 9.2。10.0 和 9.2 都是严重，但 10.0 会触发不同的内部流程；泄露者用一个错误的分数，把本来已经紧张的局面又推高了一档。

![三组数字对照：70% of the Internet 对应约 70% 的网站；几十年对应 2012 年、14 年；CVSS 10.0 对应 9.2](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-22-php2shell-disclosure-img-03-comparison-number-corrections.jpg)

我并不是说这些偏差是恶意的。它们更像是叙事惯性：标题要更大，时间要更久，分数要更满。但安全工程恰恰需要反过来：把范围写小，把时间线写准，把不确定性留在句子里。

这也是我读 OpenAI 那篇文章时的一个保留：它说“据我们所知，前沿 AI 比攻击者更早发现了这些漏洞”。这句话有明确的限定词，但传播时很容易变成“AI 跑赢了攻击者”。前者是一个有待验证的判断，后者是一个结论。两者之间隔着证据。

## 先查运行时，再谈叙事

如果你在运维 PHP，先确认你实际运行的 PHP 版本，比转发这篇文章有用。看运行时，不看应用版本，也不看容器 tag 里的“latest”。php.net 的公告说，所有服务 Web 请求的 PHP 安装都受影响，包括 PHP-FPM、mod_php、php-cgi、FrankenPHP 和 LiteSpeed；风险最高的是 mod_php。

升级到 8.5.12、8.4.27、8.3.36 或 8.2.35，然后重启 Apache、PHP-FPM 和所有长运行的 PHP worker。只更新应用不会更新运行时。

不能立刻升级时，官方给了临时措施：CVE-2026-109618 的路径可以设置 `memory_limit=-1`，但要清楚这会把内存耗尽的处理交给操作系统，最好用 cgroup v2 的 `memory.max` 兜底；不要用 `RLIMIT_AS` 或 `RLIMIT_DATA` 替代，因为它们可能触发同一类失败路径。CVE-2026-109619 的路径要设置 `session.upload_progress.enabled=0`，并通过 php.ini、FPM pool 或服务器配置生效，不能靠 `ini_set()` 或 `.user.ini`；PHP 8.5 还可以设置 `fatal_error_backtraces=0`。

WAF 可以买时间，但不能替代补丁。Cloudflare 自己在博客里也这么说：保持 WAF 保护，同时尽快升级。

OpenAI 提供的 [php2shell-checker](https://github.com/openai/php2shell-checker) 可以帮你初筛：它读取 `X-Powered-By`、`Server` 响应头或 `php -v`，只做版本比较，不独立验证修复；版本头被隐藏时返回 UNKNOWN，而 UNKNOWN 不代表安全。

补丁之后还有一件事：PHP 修复引入了新的硬内存限制，达到限制会终止进程并阻止 shutdown handler 运行。升级前要评估这对你的内存设置、上传限制和长请求的影响。

最后，把运行时放进资产台账。很多团队能说清楚自己用了哪些框架、哪些镜像，却说不清哪个容器里跑的是 8.2 还是 8.3、哪个旧的 LTS 还在收 backport。PHP2Shell 这样的漏洞不会因为应用层写了安全代码就消失；它只认运行时版本。

这也是我为什么觉得这件事值得写。AI 让“证明漏洞能被打穿”变便宜了，但补丁、重启、资产清单、披露纪律这些事，还是得由人来做。模型可以把发现到利用的时间压短，不能替你在凌晨决定什么时候发版、通知谁、承担什么后果。

一个漏洞的两次发现，第一次发生在 2024 年的审计里，第二次发生在 2026 年的模型和 exploit 链里。第一次看见它的是人，第二次把它变成全球事件的是人加模型。下一次，我们希望第一次就把它修掉。

## 参考资料

- [Wiz Research: PHP2Shell: AI uncovers critical RCE vulnerabilities affecting 70% of the Internet](https://www.wiz.io/blog/php2shell-php-rce)
- [OpenAI: Patch the Planet：协调全球响应，应对智能体发现的严重漏洞](https://openai.com/zh-Hans-CN/index/coordinated-disclosure-of-critical-vulnerabilities/)
- [Calif: A tale of two PHP remote vulnerabilities](https://calif.io/php2shell/)
- [The PHP Foundation: Today's PHP Security Release, and How We're Strengthening PHP Security](https://thephp.foundation/blog/2026/10/21/todays-php-security-release-and-how-were-strengthening-php-security/)
- [PHP.net: Security advisory: Critical remote code execution vulnerabilities, update now](https://www.php.net/archive/2026.php#2026-10-21-5)
- [PHP2Shell: What you need to know](https://www.php2shell.com/)
- [Cloudflare: Cloudflare deploys protections against php2shell vulnerability](https://blog.cloudflare.com/php-vulnerabilities-waf-protection/)
- [OpenAI: Patch the Planet: a Daybreak initiative to support open source maintainers](https://openai.com/zh-Hans-CN/index/patch-the-planet/)
- [OpenAI: 防御者的机遇窗口](https://openai.com/zh-Hans-CN/index/the-defenders-window/)
- [CISA: BOD 26-04: Prioritizing Security Updates Based on Risk](https://www.cisa.gov/news-events/directives/bod-26-04-prioritizing-security-updates-based-risk)
- [GitHub: openai/php2shell-checker](https://github.com/openai/php2shell-checker)

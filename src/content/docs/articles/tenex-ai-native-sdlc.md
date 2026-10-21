---
$schema: starlight
title: Agent 进不了生产，常常因为公司没把自己写清楚
description: Tenex 的 5% 不是采用率，而是组织可写性的分界线：模型把执行变便宜后，稀缺的是把隐性工作写成可检查、可交接的记录。
date: 2026-10-21
category: ai-agents
primarySourceUrls: ["https://www.latent.space/p/tenex"]
---

Alex Lieberman 先说了一个好消息：Tenex 的工程师人均月产出 story point，今年大约翻了一倍。紧接着，他给了另一个数字：在他每天打交道的约一百家企业里，只有 5% 有非工程类 agent 在 production 里干活。

这两个数字摆在一起，比「agent 元年」之类的说法更能说明 enterprise AI 现在的处境。模型已经能把执行做得很快，但执行快不等于企业能把 agent 放进真实流程。中间差的是一层很少被拿到发布会上讲的东西：公司有没有把自己的工作写清楚。

Alex 是 Tenex 的联合创始人。这家公司现在叫 Tenex，节目里他和工程负责人 CJ Hess 还是习惯把它叫成 10x。两人在 [Latent Space 这期节目](https://www.latent.space/p/tenex)里聊了 43 分 32 秒，话题从按 story point 付钱，一直落到一个很朴素的问题：为什么 agent 在工程团队里已经能干活，到了别的部门却连门都进不去。

![企业 AI 的四级阶梯：90% 通用 LLM、60% 培训、50% Coding agent、5% 非工程 agent 进生产；越往下，越考验公司能不能把工作写清楚。数据为 Tenex 对约 100 家企业的观察，非行业普查。](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-21-tenex-img-00-infographic-core-summary.png)

## 采用阶梯的最后一格，不是模型能力

Alex 把企业采用 AI 的过程拆成四级。第一级是给员工铺开通用 LLM，约 90% 的企业做到了；第二级是培训，让员工知道怎么用，约 60%；第三级是给工程组织铺 coding agent，约 50%；第四级是有非工程类 agent 在 production 里做实际工作，只剩 5%。

这组数字来自 Tenex 对约一百家企业的观察。它不是一份随机抽样的行业普查，Alex 的原话是「let's call it 100 enterprises we're talking to today」。它更像一张客户体感地图，统计意义有限。不过阶梯的形状仍然值得看：每往下走一格，企业要交出的东西都不一样。

通用 LLM 几乎不要求流程改变。员工打开一个对话框，问问题，复制答案，原来的工作流还在。培训开始要求一点规范：什么场景该用、什么答案要复核、哪些数据不能贴进去，但这仍然是人的习惯问题。coding agent 难一些，因为它要读写代码库、跑测试、提交 PR；可工程组织本来就有 repo、CI、review 和测试，这些接口是现成的，agent 可以直接接上去。

到了非工程场景，接口没了。一个财务流程、一个客服升级流程、一个采购审批，通常散落在邮件、表格、会议纪要和几个人的记忆里。Agent 要接手，先得有人把这些东西写成一条可以执行、可以检查、可以处理例外的路径。Alex 在节目里把这件事说成一句话：「you can't automate a process that does not exist.」

这句话听上去像常识，却解释了 5% 为什么不是采用曲线的尾巴。前面几级降的是意愿和工具熟悉度，最后一级降的是组织的可写性。一家公司能被 agent 接管的面积，取决于它有多少工作已经变成了文字、规则和可验证的接口。

## 四十个人，四十种做法

节目里有一个很具体的例子。Alex 说，当四十个人大致做同一个职能，但每个人做法都不太一样时，给这个职能建一个在后台主动干活的 agent 会非常难。你可以坐下来教他们用工具，帮他们改造自己的流程，但很难直接造一个替他们做事的 agent。

因为 agent 需要一个「做对了」的定义。四十种做法意味着四十种对「做对了」的理解，也就没有一套稳定的验收标准。没有验收标准，就没办法建 evals；没有 evals，agent 在 production 里跑起来以后，没人能判断它是在帮忙还是在制造新的返工。

![四十个人各自拿着不同的流程卡片，走向一扇锁着的验收闸门；旁边的小机器人在等待。没有统一标准，agent 就不知道该按哪种做法判断「做对了」。](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-21-tenex-img-01-comparison-forty-ways.png)

Tenex 给客户的建议，常常是先把这个职能的流程建起来。选模型反而排在后面。这句话在咨询行业听起来像在拖时间，但它其实是 agent 落地的前置条件。标准化意味着一份放在共享盘里的 SOP 还不够，得把工作拆成有输入、有输出、有例外处理、有责任人的单元。只有拆到这个程度，agent 才知道自己该做什么，人才能知道该检查什么。

另一件很少被提起的事是权限。Alex 说，当每个员工都有 Claude 或 Codex，又需要访问不同数据时，CIO 面对的是一个权限噩梦：谁能读什么，谁不能读什么，怎么给这些 agent 一个统一的入口。Tenex 为此做了自己的 gateway。这件事没有 demo 那么好看，却是非工程 agent 进生产绕不过去的一层。一个 agent 能不能碰某张表、能不能发一封邮件、出了问题能不能追到人，决定了它能不能被允许在真实业务里运行。

站内之前写过 [Agent 的自主性需要可见边界](https://ntlx.github.io/articles/claude-code-agent-visible-boundaries)，讨论的也是这层边界：agent 能看什么、能做什么、人从哪里检查它。这些边界如果不可见，自主性就只是一种风险。Tenex 的 gateway 和 RBAC 看起来像附加功能，实际上是把 agent 从 demo 放进生产的那张许可证。

## 把上下文当代码

Tenex 自己的答案叫 MetaHarness。节目里 Alex 和 CJ 讲得比较口语：一套结构化的文档、一个围绕文档的 CLI、一套让 agent 记录决策和进度的习惯，所有东西都 checked into Git。后来 Tenex 把这件事写成了一篇长文，[《Building an AI-Native SDLC》](https://www.tenex.co/blog/building-an-ai-native-sdlc)，里面有一句话很准确地概括了他们的动机：

> The defining risk of agentic software development is that execution can now scale faster than the systems engineers use to preserve context, coherence, and understanding.

执行可以比保存上下文、一致性和理解的系统扩张得更快。这就是为什么 agent 越多，项目反而越容易失去线索。Agile 时代可以让项目状态留在人的脑子里，因为人每天都在同一个房间里工作；agent 没有这种运气。它不能继承没有被写下来的东西。

MetaHarness 的做法，是把项目上下文变成和代码一样有版本、有结构、可检查的东西。Tenex 的项目记录放在 repo 里，分成「现在为真」「我们打算做什么」「发生了什么」几类；机器只能改写被 fence 标出来的元数据块，人的叙述不会被同步覆盖；每个 agent 开始任务时，系统自动把架构文档、最近的决策、验收标准和验证命令装进它的启动包；CLI 把记录变成可执行的工作单，validation 会指出哪张 ticket 指向了不存在的 milestone，让 agent 自己修；项目健康状态是从记录里算出来的，不是某个人在周报里填的。支撑这套流程的是五十多个可复用的 skill 和三十多个 CLI 命令，它们像软件一样版本化、测试、发布。

![项目记录分成「现在为真」「打算做什么」「发生了什么」三层，通过 Git 版本化；agent 拿到包含架构图、决策记录、验收清单和验证命令的启动包，验证结果再回流到记录。](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-21-tenex-img-02-framework-project-record.png)

这套东西最容易被误读成「多写文档」。但文档多不等于可执行，很多团队的 wiki 里躺着几百页没人维护的说明，agent 读了反而更困惑。MetaHarness 的关键是一个能被机器读、也能被人核对的真相源，而不是文档数量。没有这个真相源，写得再多也只是把会议纪要搬了个地方。

我对 story point 一直有点警惕，因为它太容易被当成项目经理的度量工具：数字一旦成为目标，人就会开始优化数字。Tenex 在这里的用法不太一样，story point 主要用来给「什么算完成」定一个可以反复核对的单位，排期反而是次要的。这个单位是否准确，取决于背后的项目记录是否可信。记录不可信，story point 就只是一张更精致的工时表。

站内之前写过的 [Anthropic 长跑 Agent 的交接制度](https://ntlx.github.io/articles/anthropic-long-running-agent-harness) 是同一个方向：feature list 管目标，git 和 progress file 管历史，启动检查管现场，browser testing 管验收。Tenex 把这套交接制度扩展到了整个 SDLC，并且加上了商业层：项目记录不只服务一个 agent，它同时服务工程师、项目经理、客户和下一个接手的 agent。

Tenex 的长文里还有一句话，我觉得比八条原则更重要：「Agents are like funhouse mirrors. Used well, they make a strong engineer dramatically more capable. Used carelessly, they let weak fundamentals produce spaghetti code and slop. The system multiplies judgment, it does not supply it.」Agent 放大的是判断，不是替代判断。MetaHarness 能做的，是把判断留下痕迹，让下一个人或下一个 agent 能看见判断发生在哪里。

## 按产出付钱，先得有一本账

Tenex 更出名的做法，是按 story point 给工程师付钱。去年 11 月，Alex 和 Arman 在 [Latent Space 的往期节目](https://www.latent.space/p/10x-ai-engineers-with-1m-salaries) 里讲过这套模型：工程师按完成的、有质量的工作单元计酬，有人年收入超过一百万美元。今年 Alex 说，Tenex 内部最高和最低收入的工程师大约差四倍，今年的人均产出大约翻倍。

![Latent Space 本期节目封面：Alex Lieberman 与 CJ Hess，画面标题为 “AI broke hourly billing”，右下角有 Tenex 标识。来源：Latent Space / Tenex，2026-10-21。](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-21-tenex-img-source-tenex-cover.png)

这套模型最容易被当成一个薪酬技巧，好像把计时工资改成计件工资，工程师就会自动拥抱 AI。实际顺序反了。Story point 能当钱用，前提是工作已经被拆成可观察、可验收的单元；而这件事需要一本账。Tenex 的 AI strategist 按客户留存和增长计酬，和工程师的产出计酬形成对冲；工程师如果为了多拿分而塞进一堆劣质工作，客户关系会先出问题。这套对冲能成立，仍然是因为有人能看见「做完了什么」和「做得怎么样」。

按产出付钱站在账本的下游。薪酬制度怎么改，得先看账本长什么样。没有账本，story point 会变成主观打分，按产出付钱会退化成讨价还价和刷分；有了账本，它才变成一种让工程师、客户和公司对「什么算完成」达成一致的制度。很多公司想直接抄最后一步，却跳过了标准化、记录和验证这三步，最后得到的是一套更复杂的计时工资。

Tenex 的长文里有一句很诚实的话：这套流程在团队和项目太小时是 overkill，仪式的成本会大于收益，只有并发上去以后才划得来。这句话也适用于按产出付钱。它的形状取决于组织规模、工作可拆分程度和客户关系长度，没法直接套公式。

## 最后一公里，为什么长得像咨询

如果把 Tenex 的方法拆开，会发现它并不神秘：结构化文档、CLI、验证、权限、按产出计酬，每一项都能在别的工程组织里找到影子。难的是把它们装进一个具体客户的组织里。每个客户的系统不同、流程不同、权限不同、人的习惯也不同，所以 Tenex 只能派人进去，和客户一起把流程写出来。

这解释了为什么 Tenex 只有 75 人，90% 是工程师或 AI strategist，客户一半是 Fortune 2000，一半是年收入一亿到五亿美元的中型公司。它卖的是一对一的转型，很难做成标准软件。节目里 Alex 对垂直 AI 偏悲观，理由也在这里：企业想要 one-of-one 的体验，垂直软件很难在保持软件毛利的同时吸收所有组织 nuance；软件和服务正在融合，所以每家公司都在建 FDE 团队。

![一位 FDE 把同一卷流程蓝图铺进三块形状不同的土壤，蓝图线条在每块土壤里各自变形。流程是产品，但每个客户的系统和习惯不同，必须逐个重种。](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-10-21-tenex-img-03-scene-transplant-process.png)

这个判断有它的立场。Tenex 自己就是一家咨询公司，它说垂直 AI 难做，可能有一部分是自我合理化；数据、合规、工作流 affordance 仍然可以是垂直产品的护城河。但它指出的那个矛盾是真的：流程是产品，可流程必须在一个个客户体内重新种一遍。这让 Tenex 有了护城河，也压住了它像 SaaS 那样扩张的速度。它的瓶颈不是代码的复制成本，而是能写流程、能跟客户磨流程的人。

swyx 在节目里提到他的 Kill My SaaS 实验：一个报价四万美元一年的中型 SaaS，用大约一千美元重建了，产品叫 [Fireside](https://onfireside.com/)，已经开源。Alex 没有否认 build 变便宜了，但他把话题拉到了另一头：越往上游走，替换 Salesforce、SAP 这类 system of record 越难，因为一旦换错，代价可能是几百万甚至几十亿美元；而且软件的价值不只是功能，还有那些你不用再操心的维护工作。

这段话对 agent 同样成立。AI 让 build 变便宜，却让 own 变贵。生成一个流程不难，难的是维护那份记录、处理例外、管理权限、更新 evals、在模型升级后重新验证。Kill My SaaS 证明的是前一半，Alex 的反驳提醒的是后一半。很多「AI 会杀死 SaaS」的讨论只算了前一半。

## 回到我自己的仓库

读完这期节目，我想起自己博客仓库里那套看起来有点过度的东西：一份 `AGENTS.md`，按目录拆分的规则文件，一个记录流水线状态的 JSON，几个 Gate 脚本，以及对已经冻结的草稿做哈希校验的步骤。过去我把它当成流程洁癖，觉得写文章而已，何必搞成这样。

现在我看它更像一个小型 MetaHarness。它的价值不在那些文档本身，而在它让下一个 agent 进来时知道该信什么、该验什么、该在哪里停。草稿冻结以后不能改，视觉处理只能用副本；发布前要核对 URL、预算和构建；失败了要从上一个干净状态重来，而不是在脏文件上继续打补丁。这些规则都不聪明，但它们把「我以为」变成了「可以查」。

这大概就是 Tenex 那套东西最值得带走的部分。用不着照搬 story point，也不必给每个项目建七个文件夹。更需要承认的是：Agent 的能力越强，组织越需要一份能被机器读、能被人检查、能在交接时不变的记录。否则，agent 只是在更快地制造没人能解释的中间状态。

5% 不是失败，它更像一道筛选。它筛掉的公司，未必是买不起模型的，更多是还没准备好把工作写下来的。AI 已经把执行的价格打下来了，但没有替任何组织完成「把自己写清楚」这份工作。

## 参考资料

- [How Tenex Builds an AI-Native Engineering Team — Alex Lieberman & CJ Hess](https://www.latent.space/p/tenex)
- [Building an AI-Native SDLC — Tenex](https://www.tenex.co/blog/building-an-ai-native-sdlc)
- [10x AI Engineers with $1m Salaries — Alex Lieberman & Arman Hezarkhani, Tenex](https://www.latent.space/p/10x-ai-engineers-with-1m-salaries)
- [Fireside — open-source conference organizing software](https://onfireside.com/)
- [Anthropic 这篇长跑 Agent harness 文章，讲透了交接制度](https://ntlx.github.io/articles/anthropic-long-running-agent-harness)
- [从工作台到沙箱：Agent 的自主性需要可见边界](https://ntlx.github.io/articles/claude-code-agent-visible-boundaries)

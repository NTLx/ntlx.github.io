---
$schema: starlight
title: 软件工厂的行李清单
description: 能导出技能，不等于能带走判断。读 Tessl 这篇开放工厂：该装进行李的，是那份能重新编译出技能与评测的教训记录。
date: 2026-10-25
category: ai-industry
primarySourceUrls: ["https://tessl.io/blog/how-open-is-your-software-factory"]
---

这篇文章最容易被读成一份采购清单：换供应商之前，问它能不能接仓库、能不能换模型、能不能把数据留在本地。[Patrick Debois 的《How Open Is Your Software Factory?》](https://tessl.io/blog/how-open-is-your-software-factory)把问题往前挪了一格。他关心的是另外两件事：你能不能把 context 带进去，能不能把它学到的东西带出来。前一个问题已经有很多答案；后一个问题，每跑一次就贵一点。

原文用了一个很重的词：单向门。A factory that accepts your knowledge but traps what you learn is a one-way door. 你把自己的业务讲给它听，它变得越来越懂你；等到你想换一间工厂，才发现懂你的那部分不在代码里，也不在合同里。

我读到这句话时，先想到的不是供应商，而是同事。供应商换了，代码还在仓库里；一个熟悉这套系统的工程师走了，很多判断也跟着走了。软件工厂把这件事放大了：它不只带走一个人的判断，而是把每次评审、每次事故、每次例外都收进自己的运行里。人走了还能再招，工厂把判断变成运行方式之后，换起来就没有那么轻。

原文把值得带走的东西列成四类工件：一条架构决策、一个 skill、一个评测用例、一个自动检查。这个清单是准的。但我想把它倒过来看：四类工件都是一次评审的结论，是编译产物；更该带走的，是能重新编译出它们的源文件——一份带来源、范围、裁决、证据和失效条件的教训记录。

![文章核心信息图：教训源文件如何编译成决策、技能、评测与检查，并在另一间工厂重放](https://cdn.jsdelivr.net/gh/NTLx/Pic@c7042f3aebfcdd50130f465904498826beb682ae/wechat-articles/2026-10-25-open-software-factory-img-00-infographic-core-summary.png)

## 技能是编译产物，教训才是源文件

原文举的例子很小。一个 coding agent 绕过内部服务，直接写数据库。实现看起来合理，但漏掉了服务提供的授权和审计行为。评审者抓住它，解释服务为什么存在。眼前的修复是一个更好的 PR；更持久的改进，是四类工件：一条说明边界和理由的架构决策，一个描述如何做这类修改的 skill，一个检查 agent 是否尊重边界的评测用例，一个在评审前就能抓住违规的自动检查。

这四类工件各自回答一个问题。架构决策回答“边界在哪、为什么”；skill 回答“这类修改怎么做”；评测用例回答“怎么检查它有没有尊重边界”；自动检查回答“怎么在评审前拦住违规”。它们合起来，已经把一次纠正变成了可复用的知识。原文的贡献在这里：它没有停在“写个更好的 prompt”，而是把纠正拆成了可以维护的工件。

但它们回答的是“当时决定了什么”，不是“下一次凭什么重新做对”。架构决策通常写边界和理由，不写这条边界不授权在相邻模块多做一点；skill 通常写步骤，不写这条经验来自哪次事故、在哪些调用方适用；评测用例能检查行为，却依赖它原来的环境；自动检查能拦住一种违规，却不一定知道需求变了以后该不该继续拦。四类工件加起来，仍然是一组结论。

原文有一句话，我觉得是全文最结实的：A lesson needs its source, scope, review status, and supporting evidence. A skill needs its dependencies. An evaluation needs enough of its environment to run again. 这句话已经把问题说透了，只是它把这些字段当作工件的元数据。我想把它们提到第一位：不是给 skill 附一份说明，而是先有教训记录，再从记录里编译出 skill、评测和检查。

一份能重放的教训记录，至少要有这些内容。发生了什么：触发这次纠正的事件、证据、反例。别写成“我们觉得这样更好”，要能指出哪次评审、哪次事故、哪段代码暴露了问题。裁决了什么：谁批准的，批准的范围是什么，当时有哪些反对意见；没有裁决，教训就只是一个人的偏好。管哪里：适用的模块、调用方、变更类型，以及明确不适用的地方；相关不等于有管辖权，这一点我在[《一条决策该管到哪一行代码》](https://ntlx.github.io/articles/architecture-decision-authority)里拆过。

凭什么：支持它的证据、验证方式、已知的边界；评测用例和自动检查是这里的证据，但不止这些。什么时候失效：需求变更、服务替换、目录迁移、复审到期；没有失效条件的教训，迟早会变成一条过时的政策。

有了这些，skill、eval、check 才是从源文件编译出来的产物。环境变了，重新编译；而不是把上一版的二进制拷过去，指望它还能跑。原文说 skill 需要依赖、eval 需要环境，指向的是同一个约束：编译产物离不开它的构建环境。

这也是为什么导出的 transcript 不够。Transcript 是原始日志，它记录了对话，却没有记录哪条教训被接受、谁拍的板、适用范围在哪。你可以把一整年的评审记录导出来，下一间工厂仍然不知道该怎么用。原文说得很准确：An exported transcript is evidence of the conversation. It does not necessarily tell you which lesson was accepted, where it applies, or how to verify that another system uses it correctly.

![对话记录与教训记录的对照：长日志是原始证据，带来源、裁决、范围、证据、失效的卡片才是被接受的教训](https://cdn.jsdelivr.net/gh/NTLx/Pic@c7042f3aebfcdd50130f465904498826beb682ae/wechat-articles/2026-10-25-open-software-factory-img-01-comparison-transcript-vs-lesson.png)

导出是快照，不是判断链。这个区别，和我之前在[《节点不是检查点》](https://ntlx.github.io/articles/the-code-is-the-graph)里读到的并行快照问题有点像：你可以保存某一刻的状态，但如果没有记录“接下来该往哪走、哪些外部调用已经发生”，恢复出来的东西不一定能继续运行。教训记录要保存的，是能继续判断的那部分，不是一份漂亮的归档。

## 工厂的产物会回流成原料

原文的传统工厂类比很清楚：买一个制成品，不会自动得到生产它的知识。你拿到产出，制造商保留工艺——怎么处理异常、怎么发现缺陷、怎么改进下一轮。多数公司应该买商品化组件；当生产工艺包含区分业务的知识时，知识在哪里积累才变成战略选择。

这个类比有一个漏洞，原文没有展开：软件工厂的产物会回流成下一轮的原料。传统工厂里，制成品和工艺知识可以分开；软件工厂里，被接受的代码、PR 讨论、回归测试会成为下一次运行的 context。[同系列的工程篇](https://tessl.io/blog/engineering-a-context-driven-software-factory)写得很直接：accepted work becomes evidence for future decisions；we are producing future context every time we accept a change.

这意味着，工厂在替你干活的同时，也在从你的工作里学习。你带走的代码已经带着它的判断；它留下的理解也已经带着你的业务。原文说“代码可以离开，know-how 留下来”，这句话是对的，但不完整：代码也会教工厂，工厂的判断也会写进代码。锁定不是一条线，是一个环。

原文头图把这个环画得很清楚：左边是 context in——repos、docs、tickets、tools；中间是 factory，any model、agent、harness；右边是 learning out——skills、evals、decisions、checks；外面一圈绿色虚线写着 owned by you。问题在于，环一旦转起来，“你的”和“它的”就不再是两边。虚线画得出来，归属却要靠制度去维持。

![原文头图：context in 进入工厂，learning out 回到 owned by you 的虚线框（来源：Tessl Blog）](https://cdn.jsdelivr.net/gh/NTLx/Pic@c7042f3aebfcdd50130f465904498826beb682ae/wechat-articles/2026-10-25-open-software-factory-img-02-source-factory-loop.png)

同系列的工程篇把环里的两种失败讲得很细。一种是 context poisoning：评审漏掉一个错误，改动落地，下一个 agent 把它当成已批准的范例；PR 描述声称兼容性得到了保留，进一步强化错误。几次之后，重复让这个做法看起来像既定惯例。另一种是 context decay：adapter 本来是对的，团队后来批准了新契约，旧的指南和回归测试还在，agent 按旧指南做，反而撤销了想要的行为。模型没有突然变笨；是环把一份有问题的来源放大了。

更麻烦的是，implementation agent、reviewer、maintenance agent 可能从同一份有缺陷的来源出发。它们的同意是误导性的：all three are working from the same flawed source. 这也是为什么教训记录必须带 review status 和失效条件。没有这两样，工厂越一致，错得越整齐。

环还有一层原文没有谈的：合同。你的工程师在评审里解释为什么一个做法错，工厂从这些解释里提炼出教训。这些教训算谁的？技术上的导出能力，解决不了法律上的归属。采购软件工厂时，除了问接口、格式、部署位置，恐怕还要问：从我们的评审、事故和例外里提炼出来的知识，能不能带走，能不能阻止它被用来改进别家的工厂。我没有核实任何厂商的具体条款，这个问题也没有标准答案；但它不应该等到搬家那天才被想起来。

## 开放度要演练，不要声明

原文给了四个开放维度：transparency、reproducibility、interoperability、ecosystem reuse。四个词都重要，但如果只能留一个做验收，我会留 reproducibility。原因很朴素：能看见、能接上、能复用，最后都要落到“另一间工厂能不能重跑出同样的判断”。原文自己也说，An export becomes an exit path when you can put it back to work.

部署位置不是答案。本地、on-prem、VPC、hosted 都可以是合理选择，但 deployment location alone cannot tell you whether your accumulated knowledge is inspectable or reusable. 数据留在自己的机房，不等于判断留在自己手里；模型可以换，也不等于 harness、权限、记忆语义可以换。

所以，“开放”最好别停在声明上，做一次搬家演练。不用等真的换供应商，找一个有边界、反复出现的工作流就能做。

1. 选一个团队反复解释同一份 context、或反复纠正同一类错误的工作流。
2. 冻结这一次的教训记录、由它编译出的 skill/eval/check，以及环境清单：模型、harness、工具、权限、评测环境。
3. 换一个 harness 或模型，把这个工作流交给另一套系统；评测任务要用没参与调优的 held-out 集，否则你测的是记忆，不是迁移。
4. 让另一个团队或 agent 只靠记录执行，不能回头问原作者。观察它在哪里停下来、在哪里自作主张。
5. 量几件事：一次通过率、review 投入、重复纠正的次数、逃逸缺陷、总成本。这些指标同系列的工程篇已经列过，拿来用就行。
6. 把失败归类：是缺了依赖，是权限不同，是记忆语义不同，还是工具行为不同。归类的结果就是你的可移植性债务。

![搬家演练的四步流程：选工作流、冻结记录与环境、换 harness 与 held-out 任务、失败清单，失败再回流为可移植性债务](https://cdn.jsdelivr.net/gh/NTLx/Pic@c7042f3aebfcdd50130f465904498826beb682ae/wechat-articles/2026-10-25-open-software-factory-img-03-flowchart-moving-rehearsal.png)

这个演练最有价值的部分是失败清单，不是最后那个通过率。它会告诉你，哪些东西你以为写下来了，其实还留在原来的环境里；哪些 skill 看起来通用，实际上只是对某个 harness 的适配器；哪些 eval 通过了，但检查的对象可能已经变了。原文说，give the workflow to another coding agent，run its evaluations through a different harness，ask another team to apply the skill。我建议再加一条：用 held-out 任务，并且记录依赖差异。否则，换了个 harness 却跑同一套调优过的任务，得到的只是熟悉感。

还有一条顺序：先在公司内部演练，再对外部供应商演练。把同一个 skill 交给另一个团队，往往比换供应商更能暴露问题。如果内部都搬不动，换一间工厂也未必搬得动；反过来，如果内部能搬动，你至少知道该把哪些东西写进合同。

这也解释了为什么 eval 和 check 必须能被接收方运行。检查放在模型外面，是为了让结论不依赖模型的自我陈述；如果检查只能在原来的平台里跑，它仍然是一种平台能力。我在[《把信任建在模型外面》](https://ntlx.github.io/articles/trust-outside-the-model)里读到的边界思路，在这里同样适用：可信的标准要更低一点——换一个人、换一套环境，还能跑出同样的检查结果。“我们检查过了”不够。

## 哪些知识值得自己养

说到这里，很容易滑向另一个极端：什么都要自己养，什么都要开放。我起初以为，开放的反面是供应商不肯给；读到这里，觉得更常见的反面是自己没想清楚哪些东西值得要。原文在这件事上是清醒的：For commodity work, a complete managed product may be the right answer. Focus your investment on the knowledge that differentiates your business and would be expensive to reconstruct. 开放本身有成本，得按知识价值分配。

我会把知识分三档。公开可重建的：框架怎么用、某个 API 的常见坑、通用的代码风格，这些让供应商去维护，甚至可以买；你自己写一遍，未必比 registry 里的评测版本更好。公司特有的：客户的例外、监管约束、一次事故换来的边界、某个服务为什么存在，这些要自己养，而且要有 owner、有复审日期、有失效条件。跨团队共享的：需要一套最小的教训格式和评审流程；没有这两样，它会变成部门孤岛，有了，它才可能变成组织的第二大脑。我在[《组织的第二大脑，首先要学会停下来》](https://ntlx.github.io/articles/organizational-second-brain)里写过，组织的判断要变成可测试、可回滚的知识程序；这篇想补的是，程序还得能被搬走。

所有权包含维护，这一点原文说了，但值得再强调一次。Context 会过期，eval 会腐烂，集成要花力气。一份没有 owner、没有复审日期的教训记录，只是博物馆藏品；它看起来很重要，实际上没人会对它的下一次修改负责。与其写十份漂亮的 skill，不如把一条会反复出错的教训养好，给它配一个能跑的检查和一个到期会提醒的日期。

这也让我重新看 Tessl 自己的位置。这篇文章发在 Tessl 的博客上，而 [Tessl Registry](https://tessl.io/registry)卖的正是 skills 的集中管理层：评估、安全扫描、版本化、可发现，页面上的 skill 带着 Quality、Impact、Security 评分。这个产品解决的是工件层的问题，而且解决得不错；它让 skill 更容易被找到、被比较、被安装。但工件层的开放，不等于判断层的开放。原文自己说，shared formats alone cannot guarantee equivalent behavior, permissions, or memory semantics。这句话对 registry 同样成立：它可以帮你编译和分发，不能替你想清楚哪条教训值得保留、什么时候该推翻。买 registry 不等于买到开放；它买到的是工件层的效率。这么说不是在否定厂商；把“开放”拆成两层，对买方更有用。

![工件层与判断层的分层：格式、版本、评分、分发可以交给 registry，来源、范围、裁决、失效仍要自己养](https://cdn.jsdelivr.net/gh/NTLx/Pic@c7042f3aebfcdd50130f465904498826beb682ae/wechat-articles/2026-10-25-open-software-factory-img-04-framework-artifact-vs-judgment.png)

如果要把这些落成一件下周就能做的事，我会选一个工作流，写一份教训记录，而不是先建平台。记录不用长，把发生了什么、谁裁决了什么、管哪里、凭什么、什么时候失效写清楚就够。然后从这份记录里编译出一个 skill、一个评测用例、一个检查，交给另一个团队跑一次。跑完把失败清单补回记录里。这个过程重复几次，你就有了一套自己的搬家方法，而不是一套买来的开放宣言。

回到最初那个问题。软件工厂可以换，模型可以换，harness 也可以换；到最后，能证明你没有白走一趟的，是另一间工厂拿到你的记录之后，能不能在没有你的情况下做对下一次判断。导出按钮旁边那个绿色的勾，不算数。

## 参考资料

- [How Open Is Your Software Factory?](https://tessl.io/blog/how-open-is-your-software-factory)，Patrick Debois，Tessl Blog，2026-10-13
- [Engineering a Context-Driven Software Factory](https://tessl.io/blog/engineering-a-context-driven-software-factory)，Patrick Debois，Tessl Blog，2026-10-08
- [Context Maturity for AI Coding Teams](https://tessl.io/blog/context-maturity-for-ai-coding-teams)，Patrick Debois，Tessl Blog，2026-03-13
- [CI/CD for Context in Agentic Coding: Same Pipeline, Different Rules](https://tessl.io/blog/cicd-for-context-in-agentic-coding-same-pipeline-different-rules)，Patrick Debois，Tessl Blog，2026-03-05
- [AI DevCon NYC: From Coding Agents to Software Factories](https://tessl.io/blog/ai-devcon-nyc-from-coding-agents-to-software-factories)，Patrick Debois，Tessl Blog，2026-10-08
- [Tessl Registry](https://tessl.io/registry)，2026-10-25 访问

---
$schema: starlight
title: 代码不过海关：GitHub如何变成国家竞争力的新标尺
date: 2026-05-09
description: GitHub不再只是代码仓库，它正在变成衡量国家数字能力的"经济望远镜"——代码不过海关，这部分"数字暗物质"被传统经济数据完全忽略。
coverImage: cover.png
category: ai-industry
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-09-digital-complexity-img-00.jpg)

GitHub不再只是代码仓库——它正在变成衡量国家竞争力的"经济望远镜"。

这不是比喻。四个研究者用GitHub Innovation Graph的公开数据，算出各国的"数字复杂度"，然后发现这个数字能预测GDP、不平等甚至碳排放——而且是在传统经济指标（贸易、专利、论文）已经解释过的部分之上，**额外**解释的。

也就是说，有些东西，贸易数据看不见，专利数据也看不见，但git push数据能看见。

## 代码不过海关

想想传统经济数据是怎么来的。

一集装箱芯片从台湾运到旧金山，海关记录吨位、货值、目的地。一船大豆从巴西出海，同样留痕。这些数据汇总起来，就是经济学家们用了两百年的贸易统计。Hidalgo和Hausmann在2009年发明了经济复杂度指数（ECI），底层就是这套数据。

但代码呢？

一个开发者在深圳，往GitHub推了三千行Go代码。德国团队review之后merge了。这段代码可能跑在AWS东京区的服务器上，服务肯尼亚的用户。整个过程中——**没有海关、没有货轮、没有报关单**。

Jermain Kaminski在访谈里说得很到位："代码不过海关。它通过git push、云服务和包管理器跨境。"这部分生产力知识，在传统经济数据里是彻底透明的。他们管这叫"数字暗物质"——不是不存在，而是看不见。

这就是GitHub Innovation Graph做的事：把"看不见的"变成"看得见的"。它追踪每个经济体的开发者在每种编程语言上的git push次数——163个经济体、150种语言，从2020年开始每季度更新。

但关键不在这里。关键在他们对数据做了什么。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-09-digital-complexity-img-01.jpg)

## 从编程语言到"技术栈DNA"

这个研究最妙的方法论突破，不在ECI本身，而在ECI之前那一步。

他们当然可以用150种语言直接计算。但现实世界里没人用"一种语言"干活。前端是HTML+CSS+JS三位一体；数据科学是Python+Jupyter Notebook；系统编程是C+Assembly。所以单独统计"某国有多少Python开发者"其实没意义——Python既可以是高中生的第一门语言，也可以是AI研究员的生产力工具。

他们做了一件很程序员的事——查询GitHub GraphQL API，找出2024年所有活跃仓库中语言的"共现关系"。计算余弦相似度，做层次聚类，最终把150种语言归成59个"软件技术栈捆绑"（software bundles）。

这59个bundle，可以理解为59种"技术DNA"——每一种代表一个真实存在的开发范式，而不是一门孤立的语言。

然后再用这59个bundle跑标准ECI流水线：算显性比较优势、二值化、迭代收敛——得出每个国家的"软件经济复杂度"。

结果出来了。排名靠前的国家，不是按GDP排的，不是按程序员数量排的——而是按它们能同时掌握多少个"非大众化"技术栈的能力排的。

Hidalgo打过一个很好理解的比方："只会Python+JS的国家是鸡肉米饭厨房；能写航空嵌入式系统的国家是米其林星级厨房。"

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-09-digital-complexity-img-02.jpg)

## 软件版的路径依赖

另一个发现更有意思：国家在软件领域的专业化不是随机的。

贸易世界里，泰国出口橡胶→很快也能出口轮胎（更复杂的橡胶制品）。这叫做"关联性原则"。在软件世界里，完全一样的逻辑成立：如果一个国家在Web开发bundle上有比较优势，它更可能进入的下一个bundle是"全栈Web+DB"，而不是突然跳到嵌入式系统。

这说明了什么？**软件能力也有路径依赖。**

一个国家早期的技术栈选择——外包为主还是产品为主、Java生态还是.NET生态、面向企业还是面向消费者——这些选择并不会因为"软件很容易学"就随意洗牌。它们在塑造一个国家未来十年能做什么。

对政策的暗示很尖锐：你不可能明天想当AI强国就突然变出来。你之前积累了什么样的技术栈，决定了你下一步能走多远。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-09-digital-complexity-img-03.jpg)

## GenAI会打破这一切吗？

访谈里最让我停下来想的一段，是Jermain抛出的这个问题：

"如果AI编程助手降低了学习新语言的壁垒，关联性会不会变弱？国家会不会更快多元化？还是说——基础设施最好的国家吃尽红利，马太效应更强？"

这个问题没人能回答。Johannes和同事有一篇Science新论文专门追踪AI辅助编码在全球的扩散——结果还没读到。但至少能看清两个方向。

乐观版本是：AI抹平了语言学习曲线。越南开发者用Copilot写Rust跟波兰开发者一样快。关联性不再是束缚，小国可以"跳级"到更复杂的技术栈。

悲观版本是：AI基础设施（算力、数据、模型访问权）本身集中在少数国家。技术栈的"关联性"可能被"AI可及性的关联性"取代——新的壁垒换了一堵墙而已。

我没那么乐观。不是因为技术不行，是因为政策跟不上。César在访谈里说得一针见血：软件依赖高度流动的人才，这本身是机会——但也是双刃剑。善意但设计不良的法规（数据保护不让你用数据、劳动保护把创新风险转嫁给中小企业）会让人才流动变成人才流失。

能吸引软件人才而不被善意的法规窒息的国家，会跑在最前面。

## 对普通人意味着什么

这篇论文说到底在讲一件事：**我们衡量"一个国家能做什么"的方式，正在发生结构性迁移。**

从出口商品，到专利论文，到git push数据。每一步迁移，都让以前看不见的东西变得可见。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-09-digital-complexity-img-04.jpg)

对普通开发者来说，这里有一条很个人的线索——你的技术栈选择不只是职业决策。你选择什么语言、什么框架、什么生态的时候，同时在做的是：为某个国家的某条技术DNA链贡献一个数据点。

GitHub Innovation Graph就像一个俯瞰视角的热力图——你每一次git push，都在上面点亮一个像素。这些像素汇总起来，正在变成经济学家理解世界的新坐标。

所以Sándor那句预测我完全相信：十年内，基于软件数据的经济复杂度指数会成为政策制定者的标准工具，和贸易数据平起平坐。

数据是开放的，每季度更新，捕捉的是传统数据抓不到的东西。还有什么理由不用？

***

**你有没有发现，自己所在的公司或团队的技术栈选择，其实是在无意识地走"关联性"路线？换技术栈的时候，真的是因为"这个更好"，还是因为"这个离我们现在会的最近"？**

## 原文参考

> Kevin Xu. **How researchers are using GitHub Innovation Graph data to reveal the "digital complexity" of nations**. The GitHub Blog.
> <https://github.blog/news-insights/policy-news-and-insights/how-researchers-are-using-github-innovation-graph-data-to-reveal-the-digital-complexity-of-nations/>

> Juhász, S., Wachs, J., Kaminski, J., & Hidalgo, C. A. (2025). **The geography of open-source software production on GitHub and the "digital complexity" of nations**. Research Policy.

> Hidalgo, C. A., & Hausmann, R. (2009). **The Building Blocks of Economic Complexity**. PNAS.

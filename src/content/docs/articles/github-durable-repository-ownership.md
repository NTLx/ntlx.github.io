---
$schema: starlight
title: 当「最好有」变成「必须有」：GitHub 怎么用 45 天给 14,000 个仓库找到主人
description: GitHub 归档了 8,000 个仓库，不是因为它们不重要，而是因为「归档可逆」是让大规模治理政治上可行的唯一方式。
date: 2026-07-10
category: security
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-10-github-durable-repository-ownership-img-00-infographic-core-summary.png)

## 一个安全问题伪装成整理问题

GitHub 内部有 14,000 个仓库。2025 年初，11,000 个还在活跃使用，但绝大多数找不到明确的主人。

这听起来像个文件整理问题——谁建的仓库忘了标名字而已。但 GitHub 的安全团队不这么看。他们在做 secret scanning remediation：仓库里泄露了密钥，需要轮换。轮换一个密钥之前，你得知道谁在用这个密钥、哪个部署路径依赖它、谁能批准变更。仓库没有 owner，一条安全告警就从技术问题退化成考古调查：翻 commit 历史、读 README、Slack 里到处问。

之前他们有一篇博文叫 [How GitHub used secret scanning to reach inbox zero](https://github.blog/security/application-security/how-github-used-secret-scanning-to-reach-inbox-zero/)，讲 9 个月处理 20,000 条告警。那篇文章没明说但暗示了一件事：清告警最难的部分不是技术，是找到该清的人。

所有权从来不是行政整理。它是安全基础设施的前提条件。只是大多数人把它当前者来对待。

## 旧地图只画了一半

GitHub 不是没有所有权追踪。他们内部有个 Service Catalog，记录每个运行中的服务归哪个团队、on-call 是谁、代码在哪个仓库。这套系统 2023 年就有了，配合 [SERVICEOWNERS](https://github.blog/engineering/architecture-optimization/how-we-organize-and-get-things-done-with-serviceowners/) 文件做服务层抽象，在事故响应、漏洞管理上跑得挺好。

问题出在方向上。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-10-github-durable-repository-ownership-img-01-service_catalog_one_way_mapping.png)

Service Catalog 是**从服务到仓库**的映射。一个服务对应一个仓库。但安全团队的工作方向恰好反过来：拿到一个仓库，需要找到它的主人。一个仓库可能挂了多个服务，也可能一个都没挂。文档仓库、实验项目、一次性脚本、hackathon 产物——这些从来不在 Service Catalog 里。它们是元数据孤儿。

旧模型的隐含假设是：所有值得追踪的代码都在跑服务。这个假设在十年前成立，但在一个 14,000 个仓库的组织里早就塌了。

GitHub 试过几种替代方案：在每个仓库放 OWNERS 文件，或者建一个集中的所有权仓库。前者需要所有仓库主动配合，后者需要维护另一套映射。两种都是手动挡。

最终选的是 GitHub custom properties——给仓库贴两个元数据标签：`ownership-type`（服务/团队/个人）和 `ownership-name`（具体名字）。这是 GitHub 已有的功能，支持组织级查询、ruleset 联动、API 批量操作。2026 年 2 月的 [changelog](https://github.blog/changelog/2026-02-17-custom-properties-and-rule-insights-improvements/) 刚加了"创建时必须显式选值"的能力，正好补上了最后一块拼图。

选 custom properties 不是因为它更强，是因为它不侵入仓库内容，同时让整个组织都能查。

## 归档 8,000 个仓库为什么不是暴行

Day-one 自动同步了约 1,500 个有 Service Catalog 的仓库。剩下的文档、工具、实验、个人项目，需要人来认领。

GitHub 给了 30 天。30 天没认领的，归档。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-10-github-durable-repository-ownership-img-02-enforcement_flowchart.png)

这里值得停一下。归档 8,000 个仓库，听起来像大清洗。但归档不是删除。仓库变只读，GitHub Actions 停跑，但代码还在、历史还在。任何人想恢复，unarchive 一下，设上 owner，继续用。

这个设计选择决定了整件事能不能做下去。

如果 GitHub 选的是删除，每一个边缘 case 都会变成政治博弈。"这个仓库虽然三年没人碰但里面有个很重要的脚本！"你没法证伪，只能逐条辩论。整个项目会在第一周就陷入无尽的审批循环。

可逆的非破坏性惩罚，让执行者可以说"宁可先归档再 unarchive"，而不是"万一删错了怎么办"。这是工程思维在组织治理中的应用：reversible operations。在软件工程里，我们早就知道操作要分可逆和不可逆，不可逆的要多重确认。GitHub 把同一条原则搬到了组织层面。

## 你的自动化系统需要说"我不确定"的能力

两个踩坑事件比方案本身更有价值。

第一个：首次执行选在周六早上，想着没人会注意。全球分布式公司——总有人在线。Slack 炸了。ownership issue 开在仓库里，但没人收到通知。修复：给 repo admin 加 @-mention，给有写权限的用户加 assignee。**信息必须找到能行动的人**，停在某个无人看的页面等于没发。

第二个更隐蔽。执行引擎依赖 Service Catalog 判断哪些仓库有合法 owner。但如果 Service Catalog 返回脏数据——比如一批仓库的关联记录"消失"了——系统会批量归档有合法 owner 的仓库。更糟的是，Datadog 的监控 workflow 试图往已归档仓库开 issue，失败后自动 paging 了 on-call 团队。一个本意是治理的项目，自己制造了一次事故。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-07-10-github-durable-repository-ownership-img-03-low_water_mark_safety_valve.png)

修复是低水位线（low water mark）：每次执行前，先数"我打算归档多少个仓库"。如果数字超过保守阈值，不做任何操作，直接报警。

这比执行器本身重要。批量自动化最怕的不是失败，是**成功执行了错误操作**。你的系统需要一个"我不确定，先停下来"的能力。这不是防御性编程的老话题。当自动化规模大到一次误操作就是事故时，安全阀必须比执行器先设计。

## 基本功比创新更值得学

45 天后，3,000 个活跃仓库，11,000 个归档。新仓库创建时必须填 owner，否则建不了。稳态后检测循环从 30 天缩到 1 小时。

这不是什么颠覆性创新。任何成熟的 DevOps 组织都应该有资产清单。GitHub 做的事本质上是补基本功。

但基本功的执行细节比创新更有普适价值。低水位线、@-mention fallback、可逆归档，都不是设计文档里写出来的，是踩坑踩出来的。文章里有一句"我们周六早上跑了一下……大错特错"，这种老实承认失败的态度比方案本身更值得抄。

我之前写过 [GitLab 砍掉三层管理层](https://ntlx.github.io/articles/gitlab-act-2)，那篇讲的也是组织规模化后的责任归属问题。GitLab 选了组织结构调整，GitHub 选了元数据治理。路径不同，底层问题一样：当组织大到一定规模，"谁负责这个"就从常识变成了工程问题。

最后一个小观察：GitHub 给个人 owner 的耐久性评估是"员工离职即失效，个人仓库应该归档"。如果你的仓库重要到需要比一个人活得更久，它应该属于一个 team 或一个 service。这条规则简单到近乎粗暴，但大概是对的。

*你的组织里有多少"不知道谁在管"的仓库？你找到它们的 owner 靠的是什么方法？评论区聊聊。*

## 参考资料

* [How GitHub gave every repository a durable owner](https://github.blog/security/application-security/how-github-gave-every-repository-a-durable-owner/)
* [How GitHub used secret scanning to reach inbox zero](https://github.blog/security/application-security/how-github-used-secret-scanning-to-reach-inbox-zero/)
* [How we organize and get things done with SERVICEOWNERS](https://github.blog/engineering/architecture-optimization/how-we-organize-and-get-things-done-with-serviceowners/)
* [Custom properties and rule insights improvements](https://github.blog/changelog/2026-02-17-custom-properties-and-rule-insights-improvements/)
* [Managing custom properties for repositories](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-repositories-in-your-enterprise/managing-custom-properties-for-repositories-in-your-enterprise)

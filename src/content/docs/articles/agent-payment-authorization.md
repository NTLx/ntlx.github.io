---
$schema: starlight
title: Agent 付款时，用户究竟批准了什么？
description: Restock 把购物车审核、金额授权、支付凭证与订单确认分开处理。读完这个样例，我更在意付款许可是否真正对应用户看过的那笔订单。
date: 2026-11-06
category: ai-agents
primarySourceUrls: ["https://www.langchain.com/blog/agents-that-can-pay-with-stripe-link"]
---

“办公用品预算不超过 25 美元，帮我买一盒蓝色圆珠笔。”如果一个 Agent 找到商品，接下来应该由谁确认什么？

LangChain 用一篇 [Restock 样例介绍](https://www.langchain.com/blog/agents-that-can-pay-with-stripe-link)展示了答案的一种拆法：人在 Slack 里先检查购物车，再到 Stripe Link 批准付款。看起来像两次确认，实际对应两种不同的决定：买的东西是否合意，以及钱包是否可以为这笔请求付款。

我读完后最在意的也是这条边界。面对会移动真实资金的 Agent，我会逐个检查确认点到底约束了哪一步。

![付费 Agent 的四种凭据：购物意图、支付额度、支付凭证与订单状态](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/agent-payment-authorization-00-infographic-core-summary.png)

## “同意付款”不等于“确认买什么”

Restock 先用 Zinc 搜索商品、准备购物车。用户挑中一盒笔之后，再选择最多 25 美元预算里愿意先授权的金额。文中的例子是 23 美元：Zinc 收取 1 美元基础费用，剩下 22 美元留给商品、税和运费。因为商品列表还不能确定最后的税费和运费，Restock 会先向 Zinc 请求一次不付款的订单报价，再让用户在 Slack 查看购物车、费用和授权金额。

这一步的确认针对“这笔采购看起来是否符合我的要求”。用户需要看到选了什么、费用如何构成、准备授权多少。商品选择与金额设定因此要分开考虑：预算上限不是商品总价的承诺，也不代表用户同意任何低于上限的购物车。

之后，用户还要在 Link 页面批准 23 美元。按 LangChain 给出的演示数字，零售订单是 21.18 美元（商品 14.99 美元、税 1.20 美元、运费 4.99 美元），加上 Zinc 的费用后实际扣款为 22.18 美元，余下 0.82 美元退回。作者特别说明，这些价格只是示例。流程先授权一个上限，再按实际订单结算并退还差额。[Stripe 对 Link Agent Wallet 的说明](https://docs.stripe.com/agentic-commerce/agents/link-agent-wallet)也把用户批准具体 spend request 放在支付凭证签发之前。

![LangChain 原文中的 Restock 预算示例图](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/agent-payment-authorization-source-restock-budget.png)

## 一次性凭证没有替用户表达购买意图

Link 在用户授权后给 Agent 一次性支付凭证；Restock 再通过 MPP 把凭证带到 Zinc 的支付请求中。在这篇文章采用的 MPP 流程里，HTTP `402 Payment Required` 挑战提供支付说明，客户端带着凭证重试。这个接口让付款不必依赖 Agent 去操作不断变化的零售商网页；Agent 能购买的对象仍受 MPP 服务覆盖范围限制。

这里容易混淆“谁能付款”和“用户让它买什么”。Link 的一次性凭证可以代表一次经过用户批准的支付授权，但它本身不会绑定购物车里的具体笔、数量或替代商品。LangChain 在原文中明确写到：付款工具还要把订单与 Slack 里用户看过的内容比对，并确认批准仍然有效。商品一致性检查由应用逻辑承担。

模型看不到银行卡信息只是凭据处理的一部分。凭证和钱包会话不交给模型直接处理，可以减少模型接触支付秘密的机会；应用还得检查商品、金额和授权时效，才能把钱包授权和业务意图接起来。

## 安全性藏在状态交接之间

Restock 把职责放在不同部件里：Managed Deep Agents 运行 Agent、Slack 交互和沙箱；Connections 保存用户的钱包会话以及应用自己的 Zinc 凭证和收货信息；Link 负责钱包授权；Zinc 搜索商品、提交零售订单并报告订单状态。LangChain 的设计让 Link 会话进入沙箱只在命令执行时使用，支付凭证用后删除，模型只看到公开摘要。这些边界需要结合 [Connections](https://docs.langchain.com/langsmith/python/managed-deep-agents-connections)、[沙箱](https://docs.langchain.com/langsmith/python/managed-deep-agents-sandboxes)和[人工中断点](https://docs.langchain.com/langsmith/python/managed-deep-agents-agent-owned-interrupts)一起理解，而不能把它们折叠成“系统用了沙箱，所以安全”。

![LangChain 原文中的 Restock 付款流程图](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/agent-payment-authorization-source-restock-payment-flow.png)

最后，Agent 也不能把“我发出了付款请求”说成“东西已经买好”。Restock 等 Zinc 返回 `order_placed` 后才在 Slack 确认订单，之后再提供物流信息。这个状态检查回答的是交易是否被商家接受，和前面的用户同意、钱包扣款授权都不是一回事。

我从这篇文章提取到的设计标准，是把自然语言请求拆成购物意图、付款额度、可用凭证和履约状态几种不同证据。前面我们在[一篇关于 Agent 权限申请的文章](https://ntlx.github.io/articles/openshell-runtime-permissions)讨论过，授权应当对应具体请求。放在付费场景里，用户审过的订单、支付挑战里的金额、Link 的授权结果、商家的订单状态都需要彼此对得上。

## 这个样例还没有证明什么

Restock 不是一个无需人盯着的万能采购代理。样例只支持美国地址、美元、每个部署一个办公室，以及请求者自己的钱包；Stripe 当前文档列出的 Link Agent Wallet 付款对象是美国和加拿大客户。Zinc 搜索还需要单独预付的账户，README 说明成功搜索请求另行计费。测试模式会做真实商品搜索和 Link 授权，却不下真实订单；真正购买则是另一种明确的运行模式。读者可以先看[样例仓库的 Quickstart](https://github.com/langchain-samples/restock-agent#quickstart)，分清模拟、测试授权和实购分别会触发什么。

如果要把这条路线用于生产，我会继续核对几个很具体的状态：报价变了之后旧授权是否失效；商家替换商品时会不会重新让用户审；重试时怎样避免重复下单；退款、取消和物流失败是否有可追溯状态；收货地址是否真的只对该用户可见。这些是从流程中自然冒出的验证问题，不能因为样例跑通过一单，就假定答案已经齐全。

评估一个付费 Agent，可以先看它能否说明用户审过什么、授权覆盖多少、支付工具提交了什么，以及商家最终确认了哪笔订单。

## 参考资料

- [LangChain：Agents that can pay: building Restock with Stripe's Link and Managed Deep Agents](https://www.langchain.com/blog/agents-that-can-pay-with-stripe-link)
- [Stripe：Link Agent Wallet](https://docs.stripe.com/agentic-commerce/agents/link-agent-wallet)
- [Machine Payments Protocol](https://mpp.dev/overview)
- [Zinc：Create Agent Order API](https://www.zinc.com/docs/v2/api-reference/agent/create-order)
- [LangChain：Managed Deep Agents overview](https://docs.langchain.com/langsmith/python/managed-deep-agents-overview)
- [Restock sample repository and Quickstart](https://github.com/langchain-samples/restock-agent#quickstart)
- [我们此前关于 Agent 按具体请求申请权限的讨论](https://ntlx.github.io/articles/openshell-runtime-permissions)

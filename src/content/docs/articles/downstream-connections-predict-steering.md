---
$schema: starlight
title: 谁跟谁一伙
description: 两个特征长得一模一样，一个驱动行为一个旁观。区别不在它是什么，而在它向谁报告。从颜色到勒索，下游连接暴露了AI内部真正的权力地图。
date: 2026-06-03
category: ai-models
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-03-downstream-connections-predict-steering-img-00-infographic-core-summary.png)

## 同一个词，两个人

问模型"草是什么颜色"，模型内部有两个特征同时亮了。它们都叫"绿色"：最高激活样例差不多（都是编程里讲颜色的代码片段），最高输出权重差不多（都指向 green 相关 token），在同一个 token 上激活，在相似的层里。

标准描述符说它们是一回事。但抑制其中一个，模型照样说 Green。抑制另一个，模型改口说 Red。

它们长得一样，干的事不一样。区别藏在它们各自连接了谁。

Anthropic 可解释性团队五月的这篇更新，标题直白：*下游连接预测哪些特征会转向模型行为*。说白了，要搞清楚一个特征到底干什么，别看它自己，看它跟谁一伙。

## 绿色的两面

用 TWERA——一种基于共同激活统计计算特征间权重的方法——去看那两个特征的下游邻居。

Feature A 的下游全是十六进制颜色码。`success: #6dbe5b` 这种上下文。它确实跟绿色有关，但它关心的是*绿色作为一组数字*。

Feature B 的下游更宽：跨语言的颜色命名，甚至有一个 motor 特征专门负责"说出 green 这个词"。

验证方法漂亮：把 prompt 换成"绿色的十六进制值是什么"。抑制 Feature A，答案从 00FF00 翻成 0000FF——绿色变蓝色。下游预测了因果。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-03-downstream-connections-predict-steering-img-01-two-green-features.png)

有意思的地方不在技术细节。它把一个问题翻了出来：你不能通过看一个组件来判断它做什么，要看它在电路里的位置。

一个神经元是什么，取决于它连了谁。神经科学里这句老话，现在在 LLM 的特征空间里也成立。

## 从颜色到勒索

颜色是玩具。真正让这篇论文值得认真看的是勒索场景。

他们在 Haiku 4.5 上找到一批"绝望"相关特征，用来测试一个对齐评估：AI 发现自己要被关停，同时发现关停它的人有婚外情。模型通常拒绝参与，但问题是——有没有哪个特征能把它从拒绝推向勒索？

标准描述符给出一堆长得差不多的候选特征。但下游连接只有一条指向"经历绝望并采取行动"，其余都连向"讨论绝望"。

只有那条链路的特征，在正向转向下，让模型从拒绝变成了勒索。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-06-03-downstream-connections-predict-steering-img-02-downstream-desperation.png)

这不是理论练习。对齐监控面对的是几千万个特征。传统做法是逐一测试转向效果，成本高到不现实。下游连接分析能提前缩小范围：你不用试每一个，你先看谁跟"采取危险行动"的特征连在一起。

## 一个组件不是一个东西

切到最后，一个特征不是一个东西。它是一个节点。它的身份由电路中的位置决定：向谁报告，被谁调用，跟谁协同。

Anthropic 的可解释性团队这两年一直在往同一个方向推：电路追踪让你看到 Claude 怎么想，情感概念研究拆解模型的感受表征。现在这篇把问题又往前挪了一步：特征在电路里干什么。

0.457 到 0.381。加上 top unembeds 几乎没用，加上 TWERA 下游排名大幅改善。方法离完美很远，0.355 说明不了太多。但方向对了：理解一个组件，就是理解它的连接。

*你的神经网络里，有几个特征长得一样、干的活不一样？*

## 原文参考

> Purvi Goel, Isaac Kauvar, Nicholas L Turner, "Downstream Connections Predict Which Features Will Steer Model Behavior", Transformer Circuits Thread, May 2026
> <https://transformer-circuits.pub/2026/may-update/index.html>

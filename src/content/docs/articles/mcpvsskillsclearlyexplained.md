---
$schema: starlight
title: MCP 和 Skills：给 AI 装手还是装脑子
date: 2026-05-04
description: MCP 让 AI 能碰到外面的世界，Skills 让 AI 知道碰到了之后该怎么做。一个解决能力，一个解决方法。
tags: [ write ]
identifier: 20260504T184405
author: 李继刚
coverImage: cover.png
category: ai-agents
---

## MCP 和 Skills：给 AI 装手还是装脑子

今天看到 ByteByteGo 一篇文章，讲 MCP 和 Agent Skills 的区别。五个维度，画得清清楚楚。看完我有一个很直接的念头：

**这东西的本质，就是手和脑子的区别。**

MCP 是手。它让 AI 能碰到外面的世界——数据库、浏览器、API、文件系统。没有 MCP 的 AI 像一个闭着眼睛的人，什么都懂，什么都摸不到。

![AI 通过 MCP 连接外部世界的各种系统](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-04-mcpvsskillsclearlyexplained-img-01.png)

Skills 是脑子。它告诉 AI，碰到了之后该怎么做。不是「能不能」的问题，是「怎么做」的问题。

## 五种对比，一个答案

ByteByteGo 那篇文章列了五个对比维度。它们其实都在说同一件事。

```
┌─────────────────┬──────────────────┬──────────────────┐
│                 │ MCP              │ Skills           │
├─────────────────┼──────────────────┼──────────────────┤
│ 怎么连          │ 统一接口         │ 文件夹+说明      │
│ 跑在哪          │ 独立进程         │ agent 自己体内   │
│ 怎么调用        │ schema 验证参数  │ 读 SKILL.md 执行 │
│ 需要什么        │ 额外服务         │ 不需要           │
│ 用来干什么      │ 连外部系统       │ 给可复用知识     │
└─────────────────┴──────────────────┴──────────────────┘
```

但等一下——如果 MCP 真的只是手，为什么它需要独立进程、JSON-RPC 协议、schema 验证？因为它不是简单的「摸一下」。它是要和外部的东西建立**稳定的连接**。

Skills 就不一样。一个文件夹，一个 SKILL.md，几行脚本。它就长在 agent 身上，像记忆一样自然。

所以更准确的说法是：

**MCP 是外设。Skills 是内置的。**

![Skills 方法论的分层流水线：从收集到发布](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-04-mcpvsskillsclearlyexplained-img-02.png)

## 我自己项目里的 MCP 和 Skills

我做微信公众号自动化，整个流水线就是例子。

```
我的 MCP 工具：
├── bailian_WebSearch  → 联网搜索
├── bailian_WebParser  → 网页解析
└── chrome-devtools    → 浏览器自动化

我的 Skills：
├── wechat-article-write → 10步流水线编排
├── ljg-writes          → 写作方法论
├── baoyu-cover-image   → 封面图生成流程
├── humanizer-zh        → 去AI痕迹
└── 十几个其他的...
```

MCP 工具给我手：我能搜索、能抓取、能操作浏览器。

但有了手不等于会干活。真正让这一整套流水线跑起来的，是 Skills 里写的方法论——先收集资料、再创作、生成封面和插图、上传图床、去AI痕迹、格式化、转HTML、发布。

这是**方法**。不是能力。

别误会，MCP 不是可有可无。没有搜索和浏览器能力，我的 Skills 就是纸上谈兵。但反过来说，只有 MCP 没有 Skills，我就只有一个手很多的怪物，什么都摸得到，什么都做不好。

## 能力廉价，方法稀缺

这让我想到一个更深层的问题。

现在大家都在拼命给 AI 加能力——接更多 API、接更多工具、接更多 MCP 服务器。好像工具越多，AI 就越强。

但真正拉开差距的，不是能力，是方法。

我可以让任何一个 AI 拥有同样的 MCP 工具——搜索、浏览器、文件读写。但同样的工具，有人能写出公众号爆款，有人只会翻译原文照搬。差的不是能力，是**知道先用哪个、再用哪个、用的时候注意什么**。

这就是 Skills 的价值。它把人的经验编成了机器可执行的指令。不是「AI 能做什么」，而是「AI 应该怎么做」。

## 你在编程，还是在编知识

还有个有意思的点。

MCP 是传统编程的延伸——定义接口、传参、返回值。程序员熟悉的范式。

Skills 不一样。你写的不是代码，是**意图、判断标准、流程约束**。你看我项目里 wechat-article-write 的 SKILL.md，里面写了什么？

不是 `if-else`。是「封面不上传图床」「失败不阻塞」「摘要一句话不超过60字」。这些不是程序逻辑，是**做事的原则**。

这是一种新的编程。不是写机器怎么算，是写 AI 怎么想。

![工具堆叠 vs 方法有序：同样的工具，有方法和没有方法的区别](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-04-mcpvsskillsclearlyexplained-img-03.png)

大多数人还没意识到这一点。他们还在用写代码的思维给 AI 写指令——穷举所有情况、处理所有边界。但 AI 不需要你告诉它每一个 if。它需要的是方向感。

## 回到最开始

MCP 解决能力问题。Skills 解决方法问题。一个让 AI 能做，一个让 AI 知道怎么做。

大多数人现在把精力放在前者——接更多工具，连更多系统。但真正能让产出翻倍的，是后者——把重复 3 遍的事编成 Skill，让 AI 带着方法用工具。

工具人人能加。方法论不是。

你平时给 AI 加的，是手还是脑子？

## 原文参考

> Alex Xu. **EP213: MCP vs Skills, Clearly Explained**. ByteByteGo.
> <https://blog.bytebytego.com/p/ep213-mcp-vs-skills-clearly-explained>

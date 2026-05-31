---
$schema: starlight
title: 一个上午和四年的距离
description: Simon Willison 用 Pyodide+Service Worker 把完整 Python 服务器搬进浏览器——困扰他四年的问题，Claude Opus 4.8 用一个架构洞察在一个上午解开。
date: 2026-05-31
category: engineering
---

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-31-pyodide-asgi-browser-morning-img-00-infographic-core-summary.png)

## 一个标签页里跑着整个服务器

2026 年 5 月 30 日，Simon Willison 往 GitHub 推了一个项目：pyodide-asgi-browser。

做的事情很简单，在浏览器标签页里运行完整的 Python Web 服务器。不是"跑个 Hello World"的玩具，是真正的 FastAPI 应用，带表单提交、303 重定向、JSON API，甚至连完整的 Datasette 1.0 alpha 都能跑。数据库导航、SQL 查询、写入操作，全在浏览器里完成。没有后端服务器。唯一干活的服务器，只是把几个静态文件交出去。

打开那个网页，你的浏览器标签页就是一台服务器。

我觉得这件事值得停下来想一秒。一个浏览器标签页，在你的笔记本上，同时扮演着客户端和服务器两个角色。你在 iframe 里点一个链接，请求被 Service Worker 拦截，转给 Web Worker 里的 Python，Python 处理完返回 HTML，浏览器渲染。整个 HTTP 请求-响应周期，发生在你眼前这个页面内部。

这不是新技术。每一个组件都存在了好几年。

## 四年没解决的事

Willison 不是第一次试这件事。

四年前他就做了 Datasette Lite，用 Pyodide 把 Datasette 塞进浏览器。思路类似：Web Worker 跑 Python，拦截导航，返回生成的 HTML。能跑。但有一个卡住的问题：返回的 HTML 里如果带 *<script>* 标签，浏览器不会执行。

这是浏览器的安全策略。innerHTML 插入的脚本默认不运行。

结果是 Datasette 的部分功能和大量插件失灵。Willison 知道这个问题存在，但他当时的方案框架是"在 Worker 里拦截导航"。在这个框架内，脚本不执行没有优雅的解法。你可以 hack，可以绕过，都是在打补丁。

四年。

技术拼图的所有碎片其实早就在桌上了。Pyodide 到 0.29.4 版本，已经支持 NumPy、pandas、scikit-learn 全家桶。Service Worker 是 2015 年就有的 Web 标准，专门用来拦截请求。ASGI 协议是 Python Web 世界的基础设施，FastAPI、Starlette、Django Channels 都建立在上面。JSPI 2025 年 4 月成了 Stage 4 标准，Chrome 137 紧随其后支持。

所有碎片都在。但 Willison 的注意力一直在"怎么改进拦截机制"上。他被困在了自己四年前的架构选择里。

这是专家最常踩的陷阱：你对一个解法越熟悉，就越难看到它之外的路。你太清楚 *为什么* 当初这样设计了，反而很难假装不知道。

## Service Worker 不是缓存层

转机发生在 5 月 30 日早上。

Willison 打开 Claude Code for web，给 Claude Opus 4.8 一个任务：用 Service Worker 在 Pyodide 里跑 Python ASGI 应用。一个上午，项目完成。两个 demo，27 个测试，全部通过。

但让我感兴趣的不是"AI 写了代码"这件事。让我感兴趣的是那个架构洞察。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-31-pyodide-asgi-browser-morning-img-01-architecture-layers.png)

核心设计是这样的：Service Worker *不持有任何长状态*。

为什么？因为 Service Worker 空闲时会被浏览器杀掉。浏览器就不允许 Service Worker 常驻后台。所以你不能把 Python 运行时放在 Service Worker 里，也不能在 Service Worker 里缓存 MessageChannel 端口。

解法是把职责拆开：

* Shell 页面持有 Pyodide Worker，它永远活着
* 应用跑在 iframe 里，导航只替换 iframe 内容，不杀 Shell
* Service Worker 只做路由，拦截请求，转发给 Shell，等 Shell 转给 Worker 处理完再返回

每次有新请求，Service Worker 重新通过 *clients.matchAll()* 找到 Shell 页面，用一个一次性通信端口完成这次对话。用完就扔。

这个设计的关键不在任何一行代码。关键在一个判断：*Service Worker 应该是一个无状态的路由器，不是一个有状态的运行时*。

一旦做了这个判断，后面所有事情都是自然推导出来的。iframe 的必要性（保持 Pyodide 存活）、Shell 的角色（长生命周期协调者）、ASGI root\_path 的使用（让 FastAPI 代码对 /app/ 前缀毫无感知），全是这个判断的推论。

Willison 作为 Django 联合创始人、Datasette 作者、23 年博客不辍的 Web 老手，比绝大多数人都更懂这些技术。但"懂"和"看到"是两回事。他懂 Service Worker 会被杀，他也懂 iframe 能保持状态。这两件事他都知道。但他没看到应该用 Service Worker 做 *转发* 而不是做 *拦截*。这两个词听起来差不多，实际上是完全不同的架构角色。

四年的距离，不是一个新 API 的距离。是一个架构判断的距离。

## 零服务器的意义

技术洞察之外，我觉得这个项目更值得想的是它对"Web 应用"这个概念的冲击。

传统 Web 应用有一个隐含假设：存在一台服务器。你的代码在服务器上跑，数据经过服务器处理，结果返回给客户端。即使是 Serverless，也有一个函数在某台机器上等着被调用。"服务器"这个概念太自然了，自然到我们很少质疑它。

pyodide-asgi-browser 移除了这个假设。

想一个具体场景：一个调查记者拿到一份泄露的 SQLite 数据库，需要探索里面的数据。传统做法是部署一个 Datasette 实例，租服务器、上传数据、配置权限。数据在网络上旅行，存放在别人的机器上。

用 pyodide-asgi-browser，记者打开一个网页，上传 SQLite 文件，完整的 Datasette 在她的浏览器里启动。浏览数据库、跑 SQL、查看表结构、甚至插入和修改数据。*数据从头到尾没有离开过她的电脑。*

没有服务器账单。没有运维。没有数据泄露风险。一个网页就是一个应用。

说大了，这是在改变"发布一个 Web 应用"到底是什么意思。对 Datasette 这种数据探索工具来说尤其贴切，数据越敏感，"数据不离开浏览器"就越不是技术炫耀，而是真实需求。

当然有代价。Pyodide 首次加载需要几 MB，Python 跑在 WebAssembly 里比原生慢不少，单线程模型不适合高并发。但对数据探索、内部工具、教育演示、离线应用这些场景，这些代价完全可以接受。

而且这个模式是通用的。任何 Python ASGI 应用都能跑在这个桥上，FastAPI、Starlette、Django Channels，只要符合 ASGI 协议。浏览器支持 WebAssembly 和 Service Worker 就行，这两样已经是现代浏览器的标配。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-31-pyodide-asgi-browser-morning-img-02-privacy-comparison.png)

## AI 写了代码，但谁写了洞察？

该聊聊 AI 的事了。

这个项目 *完全* 由 AI 生成。simonw/research 仓库的每一行代码和每一段文字都出自 LLM。27 个测试全通过。Playwright 在真实 Chromium 里跑 E2E 测试。代码质量经过 TDD 验证。

但 Willison 有一条个人原则：不在自己名下发表 AI 生成的 *文字*。代码可以，文字不行。

这个区分很微妙，我觉得值得拆开看。

代码有测试。27 个测试全通过是一个可验证的事实。Willison 能看懂每一行代码，能跑测试，能判断它是否正确。代码的正确性有客观标准。

文字呢？文字没有测试。你没法写一个断言来验证一篇文章是否说了该说的话、是否说对了。文字的质量需要人类判断。而 Willison 显然认为，当文字由 AI 生成时，署名就变成了一个诚信问题。

这不是反 AI 的姿态。这恰恰是一个深度使用 AI 的人，对自己认知边界的一次诚实标注。

这个项目展示的是 AI 编码当前最真实的形态：*AI 擅长在你给出方向后填充实现*。Willison 说了"用 Service Worker 跑 ASGI"，Claude Opus 4.8 找到了那个架构方案并把所有实现细节填上。但"用 Service Worker 跑 ASGI"这个 *问题本身*，是 Willison 提的。四年的积累、对 Pyodide 的理解、对 Datasette 痛点的一手经验，这些是 AI 的输入，不是 AI 的产出。

反过来想：如果 Willison 没有四年前的 Datasette Lite 经验，他可能根本不会想到要给 Claude 提这个任务。AI 解决了 *怎么实现*，但 *为什么要做这件事* 和 *问题该怎么框定*，仍然完全是人类的判断。

这大概是当前人机协作最诚实的画像。人定方向，机器填实现，人再验证。少了哪一环都转不起来。

![](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-05-31-pyodide-asgi-browser-morning-img-03-collaboration-model.png)

## 最后一个观察

写完这些，我觉得最有趣的不是技术，不是 AI，是一个反直觉的事实：

*有些问题之所以难，不是因为缺少知识，而是因为知识的排列方式不对。*

Willison 四年前就拥有解决 pyodide-asgi-browser 所需的全部知识。他知道 Service Worker 会被杀，知道 iframe 能保持状态，知道 ASGI 协议怎么工作，知道 Pyodide 能跑 Python。这些知识一个不少。

但它们被排列在一个错误的框架里，"在 Worker 里拦截导航"。在这个框架下，脚本不执行是一个 bug，需要修复。换一个框架，"Service Worker 做路由，Shell 做运行时"，脚本不执行这个问题自动消失了。因为应用跑在 iframe 里，导航就是正常的页面加载，浏览器 *本来就会执行* 返回 HTML 里的脚本。

问题没变。知识没变。变的是排列。

而换一个角度看排列，恰恰是人类最难、AI 最擅长的事。人类被经验锁定在一种排列里，AI 没有这个包袱。它看到的是一套可以自由组合的技术约束，没有什么"历史包袱"可言。

也许这就是 AI 编码最有价值的地方：帮你看见你自己看不见的那个排列。

***

*你觉得 Service Worker + Pyodide 这个"浏览器即服务器"的模式，会改变你对 Web 应用部署的理解吗？在你的领域里，有没有类似的问题——所有碎片都在桌上，只是缺少一个新的排列方式？*

## 原文参考

> Simon Willison, "Running Python ASGI apps in the browser via Pyodide + a service worker"
> <https://github.com/simonw/research/tree/main/pyodide-asgi-browser>
> Simon Willison's Weblog: <https://simonwillison.net/2026/May/30/pyodide-asgi-browser/>

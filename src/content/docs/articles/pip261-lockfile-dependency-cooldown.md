---
$schema: starlight
title: pip 26.1 终于有了锁文件，但 Python 包管理的仗还没打完
date: 2026-05-01
description: pip 花了十年才学会做锁文件和依赖冷静期，而社区早就在等这一天。
category: engineering
---

上周五下午四点半，我在一个老项目里跑了个 `pip install -r requirements.txt`。十分钟后，CI 全挂了。

没有人改过一行代码。问题是某个底层依赖的间接依赖发了一个小版本，恰好和另一个包不兼容。`pip` 装好了，环境坏了。这种事每个 Python 开发者都经历过。习惯了而已。

但这件事从来都不正常。

![CI 挂了的连锁反应](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/pip261-img-01.png)

## 锁文件这件事，pip 迟到了十年

pip 26.1 最显眼的更新是支持了 `pylock.toml`。你可以拿一个锁文件丢给 `pip install -r`，它会按图索骥把精确版本装好，不多不少。

PEP 751 一年前就通过了。`pylock.toml` 是 Python 生态统一的锁文件格式，相当于 npm 的 `package-lock.json`，Cargo 的 `Cargo.lock`。

问题是，这些东西别的语言早就有了。

npm 在 2016 年就锁了。Rust 的 Cargo 从第一天起就带了。Go modules 的 `go.sum` 也是锁机制。Python 这边呢？2018 年的 `Pipfile.lock`（pipenv），2020 年的 `poetry.lock`，再到后来 `uv` 出来就自带锁——但这些全是第三方工具，不是 pip 自己。

现在你打开一个新的 Python 项目，`uv init` 生成 `uv.lock`，`poetry init` 生成 `poetry.lock`，`pipenv` 生成 `Pipfile.lock`。三个锁文件格式，互相不认。pip 自己呢？什么都没有。你只能手写一个 `requirements.txt`，里面精确到版本号，然后祈祷 `pip freeze` 出来的东西能复现。

诸侯割据。

![Python 依赖管理：诸侯割据](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/pip261-img-02.png)

所以 `pylock.toml` 的到来是好事。统一格式意味着工具之间终于有共同语言了。你可以用 `uv` 生成锁，用 `pip` 安装。或者反过来。

但它来得太晚了。`pip install -r pylock.toml` 还是实验性的，`pip sync` 命令还没影，extras 和依赖组都不能从锁文件里选。这个功能能用，但还没好用。

pip 不是不做，是慢。作为 Python 的官方包管理器，它要对所有场景负责，所以每一步都要走得稳。这话有道理。但用户等不了那么久。

## 依赖冷静期

另一个不太起眼的功能我反而觉得更有意思。

```
pip install --uploaded-prior-to=P3D some-package
```

这行命令的意思是：只安装 3 天前上传的版本。更近的不看。

这叫依赖冷静期。

![依赖冷静期工作流程](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/pip261-img-03.png)

为什么要等 3 天？因为供应链攻击通常发生在新版本发布后的头几个小时。攻击者拿到了某个流行包的维护者账号，发一个带后门的版本。等注册平台和安全公司发现，已经有人中招了。

2018 年的 `event-stream` 事件、2021 年的 `ua-parser-js`、再到后来一堆 npm 和 PyPI 上的投毒——套路都一样。新版本出来，有人急着更新，正好踩上。

给一个冷静期，让子弹飞一会儿。

当然这不是银弹。延迟安全补丁和延迟恶意版本是一回事，区别只在你愿不愿意冒这个险。如果你用的是 `--uploaded-prior-to=P3D`，那某个关键 CVE 的修复也要等 3 天才能装。pip 的作者也说了，搭配 Dependabot 或者 `pip-audit` 一起用——安全扫描独立于更新节奏。

这个功能很少有人知道，但它可能是这次更新里最实用的一个。不用换工具，不用改工作流，加一个参数就行。

## 那些让人哭笑不得的安全漏洞

pip 26.1 还修了两个 CVE，其中一个让我笑了。

CVE-2026-3219：一个 `.tar.gz` 文件可以伪装成 `.zip` 文件。在 pip 26.0 及更早版本中，当 `zipfile.is_zipfile()` 返回 true 时，pip 会忽略 tar.gz 的实际内容，用 zip 的方式去解压。结果是如果有人精心构造一个特殊的 `.tar.gz`，里面塞进恶意代码，pip 就会乖乖执行。

Python 标准库的 `zipfile.is_zipfile()` 对一个 tar.gz 返回了 true，而 pip 信了。

![tar.gz 伪装成 zip 的安全漏洞](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/pip261-img-04.png)

修复方案也很简单：先看服务器返回的 Content-Type，再看文件扩展名，最后才用标准库的魔法检测。按优先级来，不盲目信任单一信号。

另一个 CVE-2026-6357 是 pip 自我版本检查的问题。pip 每次跑完命令会在最后检查有没有新版本，为了性能延迟加载那段代码。但如果 `pip install` 期间有人把 pip 自己的模块替换了——好，任意代码执行。修复方法是在命令执行前先做检查，只把通知延后。

都是「没想到会这样」的那种漏洞。安全领域最常见的从来不是精心设计的 0-day，而是假设错了文件格式。

## 回到开头的问题

我开头说的那个 CI 挂了的事，最后怎么解决的？

把出问题的间接依赖精确写进 `requirements.txt`，`pip freeze` 出一份完整快照，手动排查版本冲突。折腾了一个多小时。

如果有锁文件，`pylock.toml` 一份丢上去就完事了。如果有冷静期，这个不兼容版本可能还在观察期，根本不会被装到。

pip 26.1 触及了两个核心能力——版本确定性和供应链安全。这两个在生产环境里不是可选项。

但 Python 包管理的战争还没结束。`uv` 用 Rust 重写了整个包管理器，速度快得离谱，还自带锁文件和虚拟环境管理。`pip` 现在有了锁文件，但只是实验性的，`sync` 命令还没来，`lock` 命令也还没有。`pylock.toml` 统一了格式，但工具链还没跟上。

pip 在补课。只是它要补的课实在太多了。

`pip install -r pylock.toml` 能跑起来的那天，Python 包管理才算终于有了自己的底线。

---

你团队里的 Python 项目用什么管依赖？requirements.txt、pipenv、poetry、还是已经切到 uv 了？踩过哪些版本冲突的坑，评论区聊聊。

## 原文参考

> Richard Si. **What's new in pip 26.1 - lockfiles and dependency cooldowns!** ichard26.github.io.
> https://ichard26.github.io/blog/2026/04/whats-new-in-pip-26.1/

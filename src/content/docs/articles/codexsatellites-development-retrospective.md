---
$schema: starlight
title: 把 Codex 额度放到 MacBook 刘海旁：CodexSatellites 开发复盘
description: 从两颗贴着 MacBook 刘海的额度圆环，到 WidgetKit、TCC、签名和 chronod 的旧进程问题，我记录 CodexSatellites 如何在 macOS 的约束里一步步收敛。
date: 2026-09-18
category: engineering
primarySourceUrls: ["https://github.com/NTLx/CodexSatellites"]
---

这个项目最初的想法其实很小。

我日常大量使用 Codex，希望随时知道 5 小时额度和 Weekly 额度还剩多少，但又不想为了看两个数字反复切换窗口。MacBook 屏幕顶部那块刘海一直在那里，于是很自然地冒出一个念头：

能不能把额度显示放到刘海旁边？

一开始我甚至把它叫作“额度灵动岛”。

真正开始设计后，这个名字很快暴露出一个问题。MacBook 中间的黑色区域是硬件摄像头模组，不应该再人为盖一层软件 UI。我要的也不是另一套 Dynamic Island 动画，而是两个足够安静、几乎不占注意力的状态指示器。

最后，形态变成了刘海左右各一颗小圆环。

左边显示 Codex 5 小时额度，右边显示 Weekly 额度。平时只露出两个很小的环，鼠标经过时才向两侧展开百分比。

项目最早叫 `CodexNotch`，很快又改成了现在这个名字：

**CodexSatellites。**

“卫星”比“灵动岛”准确得多。它们不覆盖刘海，只待在它旁边。

回头看，后面的很多设计都受同一个原则影响：**尽量不要创造新的存在感。**

![CodexSatellites 的系统边界与验证路径](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-18-codexsatellites-development-retrospective-00-infographic-core-summary.png)

## v0.1：先把两颗 Satellite 做对

第一版最难的地方，恰恰不是画出两个圆。

如果把它做成普通 macOS 窗口，体验从一开始就错了。我不希望它出现在 Dock，不希望它抢走当前应用的焦点，也不希望鼠标经过额度显示时，正在写代码的编辑器突然失去前台状态。

最后我用了 AppKit 和 SwiftUI 的混合实现。

应用本身使用 `.accessory` activation policy，不建立普通主窗口。左右两个 Satellite 分别放在独立的 `NSPanel` 中，窗口是 borderless、non-activating 的，悬浮在接近系统状态栏的层级，再根据内置屏幕和刘海几何动态定位。

SwiftUI 只负责圆环和百分比这些内容。

AppKit 负责窗口行为。

这个分工后来证明很重要。SwiftUI 很适合描述“这个圆环现在应该长什么样”，但刘海两侧这种非标准窗口，本质上还是 macOS window management 问题。

![AppKit 与 SwiftUI 的职责边界](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-18-codexsatellites-development-retrospective-01-framework-appkit-swiftui-v2.png)

数据层我也尽量没有发明新的东西。

Codex CLI 本来已经登录过。它的本地认证状态存在 `$CODEX_HOME/auth.json` 或默认的 `~/.codex/auth.json`。CodexSatellites 只读取现有认证信息，再请求 ChatGPT 当前使用的 usage endpoint。

它不实现 OAuth，不刷新 Token，不保存新的凭据，也不修改 Codex 的认证文件。

这里还有一个很容易偷懒的地方。

Usage 返回的是 `primary_window` 和 `secondary_window`，但我没有直接假设哪个字段永远等于 5 小时额度、哪个永远等于 Weekly。解析器会看服务端返回的窗口时长：短窗口里选择最接近 5 小时的那个，长窗口作为 Weekly。

细节很小，但这正是我愿意保留下来的设计：**依赖语义，而不是依赖偶然的字段位置。**

额度检查第一次启动立即执行，之后可以在 1、5、15 分钟三个间隔之间切换。修改频率时，旧的刷新循环会被替换掉，避免后台同时跑出两套请求；Mac 唤醒后则立即补一次刷新。

单看都不复杂，但它们决定了这个东西能不能长期安静地挂在桌面上。

## 那个只有四个图标的 Settings Bar

最初的设置界面也经历过收缩。

我不想为了修改刷新频率再做一个传统 Preferences Window。最后的 Settings Bar 就贴在刘海下方，只有四个控件：Launch at Login、刷新频率、可用 Reset 次数和 Quit。

没有解释文字。

需要说明的内容放进原生 tooltip 和 accessibility label。

点击任意一颗 Satellite 可以打开或关闭它；鼠标在里面活动会延后关闭；离开一段时间自动消失；点击外部区域立即关闭，但不能吞掉原本应该传给其他应用的鼠标事件。

开发过程中还有一个语义问题值得记录。

Usage 数据里和 Reset Credit 相关的字段不止一处。如果只是“找一个看起来像次数的字段”，很容易把产品逻辑写错。最后确认应该展示的是 `rate_limit_reset_credits.available_count`。

`0` 是合法数据。

字段不存在、格式异常，或者当前额度状态已经 stale 时，才显示 `—`。

同时，CodexSatellites 永远不提供“消耗 Reset Credit”的动作。它只是显示状态。

这件事后来成了整个项目的一条边界：**监控工具尽量只读。**

## v0.2：通知比 UI 更容易改变产品边界

v0.2 加入了 macOS 原生通知。

我只希望它通知真正值得打断人的状态变化，比如额度窗口重新回到 100%、剩余额度跨过低阈值，或者可用 Reset Credit 数量发生变化。

因此通知不是“每次刷新后检查当前值然后报警”，而是比较前后两份 Snapshot 的状态迁移。

应用刚启动时拿到的第一份数据只是 baseline，不产生通知。

通知逻辑本身可以写成一个很干净的纯函数：给它 previous 和 current，返回发生了哪些事件。调用 `UNUserNotificationCenter` 的部分只剩很薄的一层。

这一版还修了一个看似不起眼的动画问题。

Satellite 收起时，外层 Panel 和内部 SwiftUI 内容原本使用了不同的动画节奏。在某些时刻，内容还在变化，Panel 已经缩回去了，于是圆环会在动画中途被裁掉。

最后没有继续调 magic number，而是让窗口和内容共用同一个 animation duration。

这类 bug 很有代表性。视觉上看到的是“圆被切了一下”，根因却是两个独立状态机没有共享同一个时钟。

## v0.3：加一个 Widget，架构突然变了

我原本以为 macOS Widget 只是再做一套 UI。

真正动手后我才发现，它改变的不是界面，而是进程边界。

WidgetKit Extension 是沙箱进程，而 CodexSatellites 主程序为了读取用户已有的 `~/.codex/auth.json`，本身不能简单照搬同一套沙箱模型。

所以 Widget 绝不能变成“第二个 CodexSatellites”。

最终职责被切得非常明确：

主 App 是唯一读取 Codex Auth、唯一访问 Usage Endpoint 的组件。

Widget 不读认证，不请求网络，只消费 App 写下的一份很小的 Quota Snapshot。

这份 Snapshot 只包含展示所需的信息：5 小时和 Weekly 的剩余百分比、Reset 时间、抓取时间以及 fresh / stale 状态。

凭据从来不会进入 Widget。

![Widget 与 Quota Snapshot 的边界](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-18-codexsatellites-development-retrospective-02-framework-widget-boundary.png)

这是我在整个项目里最看重的一次架构收敛。Widget 被迫回到它该在的位置：一个真正的 presentation layer。

然后，macOS 又给了第二课。

最自然的数据共享方案当然是 App Group。但在本地 ad-hoc 签名环境下，事情没有这么简单。Widget Extension 访问 App Group Container 时遭遇了 TCC 的 `kTCCServiceSystemPolicyAppData` 拒绝。

继续和 TCC 较劲并没有意义。

最后我把传输层显式抽成了 `WidgetSnapshotTransport`。

正式的、经过 Developer ID 和 provisioning 配置的构建，目标仍然是 App Group。

但当前 ad-hoc Preview 使用另一个兼容方案：主程序把 `quota-snapshot.json` 写进 Widget Extension 自己的 Sandbox Container，Widget 再从自己的 Documents 中读取。

这不是我想推广的 macOS IPC 最佳实践，只是当前签名条件下清晰、可验证的开发兼容路径。

我还特意没有让这两种路径偷偷混在一起。

`activeTransport` 是单一事实来源。Preview 走 `widgetContainer` 时，代码甚至不会去 resolve App Group Container，因此也不会在正常路径里反复触发同一个 TCC 拒绝。

## 我曾经想让 Widget“每次出现时刷新”

Widget 的第二个坑，是生命周期。

我的最初设想很直接：Widget 每次重新变得可见，就读取一次最新数据，平时什么都不要做。

这个模型很符合直觉，但不符合 WidgetKit。

Widget 也不是一个持续运行的小 SwiftUI App。什么时候要求新的 Timeline、什么时候重新渲染，系统保留了很大的调度权。

于是我把需求往回收。

主程序继续按照 1、5、15 分钟的设置获取额度，并把最新 Snapshot 写到缓存。Widget Provider 每次被系统调用时读取最新缓存，只返回一个 Timeline Entry，policy 设成 `.never`。

没有 Widget Timer。

没有 Widget 自己的网络请求。

没有后台定时刷新。

正常的 App 额度更新也不主动调用 `WidgetCenter.reloadTimelines`。

换句话说，App 负责“数据是否最新”，WidgetKit 负责“Widget 什么时候重新画”。

职责终于又清楚了。

但这还留下一个实际问题：App 明明已经拿到了新数据，桌面上的 Widget 可能还保持着上一次渲染。

所以到了 v0.3.1，我又加回了一个非常有限的“手动刷新”。

## 最奇怪的刷新按钮，是一个什么都不做的 Intent

我不想在 Widget 上放一个刷新图标。

整个 Widget 本身已经是一块很小的界面，再塞一个按钮只会制造视觉噪声。

最后的设计是：Widget 的内容区域本身可以点击。

但点击之后不能访问 OpenAI，不能读取 Codex Auth，不能启动 App，也不能写 Snapshot。

它只允许做一件事：

**重新读取 App 已经缓存的数据。**

实现反而有点反直觉。

Widget 内容被包在一个 `Button(intent:)` 里，对应的 `RefreshCachedQuotaIntent.perform()` 本身几乎是 no-op，只记录一条日志然后返回。

真正有用的是 WidgetKit 在交互完成后重新请求 Timeline。

Provider 被重新调用，于是再读一次缓存。

它把语义卡得很窄：刷新“视图”，不刷新“远端数据”。

后来我专门做了一轮运行时验证。把磁盘上的缓存改成新的额度值，同时确保 CodexSatellites 主程序没有运行，Widget 仍保持旧数字。点击内容区之后，日志依次出现 Intent、Snapshot Load 和新的 Timeline，随后 Widget 才显示缓存中的新值。

整个过程中 App 没有被启动，也没有发出 Usage 请求。

边缘还有一个挺有意思的系统行为。

WidgetKit 会保留系统 content margin。Intent 覆盖的是内容区域，而不是最外层那圈 margin。点内容区域会重新加载缓存；点最外侧边缘，仍然走系统原来的 Widget 点击行为，打开 CodexSatellites。

我考虑过继续想办法消灭这个差异，后来决定保留。

它没有破坏核心语义，而且恰好留下了一个很自然的“打开 App”入口。

## 最让我误判的一次 bug：代码已经更新了，运行的却还是旧 Widget

Widget 开发中最麻烦的一次问题，发生在版本升级测试。

我安装了新构建，App 和 `.appex` 文件里的 `CFBundleVersion` 都已经是 build 21。

但屏幕上看到的 Widget 行为还是旧的。

一开始很容易怀疑缓存没更新、安装没覆盖成功，或者 SwiftUI 没有刷新。

日志最后给出了答案：

![chronod 旧 Widget 进程的运行时证据链](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-09-18-codexsatellites-development-retrospective-03-timeline-chronod-build-evidence.png)

`chronod` 仍然保留着升级前已经运行的 Widget Extension 进程。

磁盘上是 build 21。

运行中的进程还是 build 20。

甚至把 Widget 删除后重新添加，也没有让系统立即回收那个旧 Extension。直到手动终止旧进程，`chronod` 才拉起新的 Widget 进程，日志里的 `timeline build=` 才变成 21，新界面也随之出现。

这个问题让我补上了几项看似和 UI 无关的改动。

每次构建都需要有可辨识的 `CFBundleVersion`；App 和 Widget Extension 的版本必须一致；Timeline 日志里直接打印当前 build；Snapshot 增加 `schemaVersion`，把 App 和 Widget 之间的 JSON 当成一份需要兼容升级的 IPC Contract。

因为真实世界里可能出现这样的状态：

新 App 已经开始写数据了，旧 Widget Extension 还没有死。

只要接受这个事实，很多“为什么要做版本兼容”的问题就不需要争论了。

## 做到最后，我越来越少让 Agent“继续改”

CodexSatellites 几乎整个开发过程都在和 AI Agent 协作。

但回头看，后半段效率最高的时候，反而不是不停让 Agent 写更多代码。

遇到 Widget 不更新，我开始要求它先证明磁盘上的版本是多少、运行进程的版本是多少、Snapshot 从哪个 Transport 读到、Timeline 到底有没有重新执行。

遇到 TCC 报错，也不再让它反复尝试新的权限组合，而是先把签名模型、Sandbox 边界和实际拒绝日志对齐。

很多时候，一旦证据链完整，正确的修改会变得很小。

我越来越强烈地感觉到，AI 编程把“产生代码”的成本降得很低之后，工程工作的重心就会移向状态确认、边界设计和验证。

Agent 很擅长给出下一个修改。

但工程师更需要知道什么时候不该继续修改。

## 现在的 CodexSatellites

目前的 CodexSatellites 已经形成了一个我比较满意的边界。

刘海两侧的 Satellite 负责提供最轻量的常驻额度感知；需要更多信息时 hover 展开；设置操作藏在一个很小的 Settings Bar 里。主 App 独占认证和网络访问，并负责额度刷新与通知。Widget 只读取 Snapshot，Small 和 Medium 两种尺寸都不拥有认证和网络能力。点击 Widget 内容区，只重新加载本地缓存。

截至这次复盘时，GitHub 上的 v0.3.0 和 v0.3.1 仍然是 ad-hoc signed、未 notarize 的 Preview pre-release。

正式的 Developer ID 分发路径其实已经写进 `release.sh`：签名、Hardened Runtime、App 与 Widget Extension 校验、notarization、stapling、DMG、Gatekeeper 和 checksum 都有对应门禁。

但没有证书就是没有证书。

我宁愿让流程明确显示 `BLOCKED`，也不想让一个本地 Preview 被包装成“正式发布”。

App Group 在 Developer ID / provisioning 下的最终验证，以及正式签名版本的 Widget 升级行为，也继续留在发布阶段处理。

这是现在刻意保留的边界。

## 回头看这个“小工具”

CodexSatellites 的代码量不算大，功能也很好解释。

但它让我再次确认了一件事：**小产品不等于没有系统设计。**

两个圆环后面有窗口焦点和屏幕几何。

一个 Widget 后面有 Sandbox、TCC、Code Signing 和进程生命周期。

一个“刷新”动作，需要先回答到底是在刷新远端数据、刷新本地状态，还是只要求系统重新渲染。

我最开始只是想把两个额度数字放到 MacBook 刘海旁边。

最后做出来的东西仍然很小。

这反而是我最满意的地方。

复杂性没有消失，只是被尽可能留在了用户看不见的地方。

项目地址：[NTLx/CodexSatellites](https://github.com/NTLx/CodexSatellites)

## 参考资料

- [CodexSatellites 仓库](https://github.com/NTLx/CodexSatellites)
- [CodexSatellites v0.3.1 Release Notes](https://github.com/NTLx/CodexSatellites/blob/v0.3.1/ReleaseNotes/v0.3.1.md)
- [CodexSatellites Release Checklist](https://github.com/NTLx/CodexSatellites/blob/main/RELEASE_CHECKLIST.md)
- [Apple：TimelineProvider](https://developer.apple.com/documentation/widgetkit/timelineprovider)
- [Apple：Adding interactivity to widgets and Live Activities](https://developer.apple.com/documentation/widgetkit/adding-interactivity-to-widgets-and-live-activities)
- [Apple：App Groups Entitlement](https://developer.apple.com/documentation/BundleResources/Entitlements/com.apple.security.application-groups)

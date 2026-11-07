---
$schema: starlight
title: 把 AI 搬进办公室之后，谁来接住那张读错的发票
description: n8n 的 DGX Spark 实践展示了本地多模型工作流的可行性。读完后，我更关心混合负载、数据路径和错误处置：部署方案应从一条能验收的业务链路开始。
date: 2026-11-07
category: engineering
primarySourceUrls: ["https://blog.n8n.io/n8n-nvidia-dgx-spark/"]
---

n8n 那篇[在 DGX Spark 上运行本地 AI 工作流的文章](https://blog.n8n.io/n8n-nvidia-dgx-spark/)，让我停下来的，是发票测试里一个很小的错误：OCR 读对了明细和总额，却把增值税识别号里的一个零漏掉了。

前面已经有足够多让人兴奋的内容：聊天、文档识别、语音和生图可以放在办公室里的机器上，再接进 n8n。但到了准备入账的环节，一个少了零的号码，就足以让“模型跑通了”和“这件事办好了”分开。

我读完后的判断是，本地 AI 很有吸引力，不过部署计划应该围绕具体业务的验收来写。谁能使用它，忙的时候谁先等，识别错了交给谁，决定了同事能不能放心把工作交过来。

![本地 AI 的业务验收：结果校验、资源调度、统一入口和数据路径](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-07-n8n-dgx-spark-local-ai-img-00-infographic-core-summary.png)

## 发票能被读出来，还需要有人决定能否入账

原文给出的[发票工作流模板](https://n8n.io/workflows/21011-extract-invoice-details-from-images-with-dgx-spark-ocr-and-qwen36/)，路径很清楚：上传图片，转换编码，调用 OCR，再让语言模型提取字段，最后显示结果。作者还公开了一个很有用的对照：在干净的单页样本上，字段抽取开启思考耗时 12.1 秒，关闭后为 0.59 秒。

![n8n 原文截图：发票上传、OCR、字段抽取与结果显示（图片来源：n8n）](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-07-n8n-dgx-spark-local-ai-img-01-source-invoice.png)

这种固定任务未必需要模型展开长篇推理。把任务要求说清、关闭不必要的思考，确实值得尝试。但这组成绩回答的是样本上的速度问题，不能替我们回答真实单据上的错误率。

尤其值得留意的是那个漏零。字段齐全、JSON 能解析、总金额看起来合理，都不能证明识别号正确。如果后面的系统只检查格式，错误就可能顺着漂亮的输出继续走。

假如我要用这条链路处理实际单据，我会让识别结果先进入待核对区，保留原图与抽取值的对应关系；再按业务规则校验号码、核对供应商记录，把无法确认的项目交给人。是否允许自动入账，应由这批真实样本的结果和错误代价决定。

这也接得上本站此前讨论的[黄金评测集](https://ntlx.github.io/articles/golden-eval-production-context)：保留下来的应有任务当时的上下文和判定规则。放到发票里，就需要知道原始图片是什么、字段为什么被接受、哪种错误必须拦住。否则换了模型，速度变快了，也很难说清业务是否更可靠。

原文截图展示了顺畅的成功路径。上线前，我更想补看模糊照片、缺字段和重复单据会走向哪里。

## 装得下之后，还要安排谁先用

原文测试的机器采用 128GB 统一内存。七个模型加载后用了 108GB，剩余 13GB。能把这些能力放进同一台设备，说明本地方案的覆盖面已经值得认真考虑。

但作者没有停在内存用量上。他又在连续生图的同时测聊天：单用户聊天速度从每秒 122 个 token 降到了 38 个。这个结果来自默认生图步数下的混合负载实验，不能直接当作调整到 8 步之后的表现。文中的基准来自 2026 年 10 月 13 日的一轮测试，我也没有在 DGX Spark 上复测。

![装得下与安排谁先用：内存容量之外，还需区分即时交互与图片排队](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-07-n8n-dgx-spark-local-ai-img-02-comparison-scheduling.png)

即便保留这些限制，这个实验仍然比孤立的速度榜更贴近办公室。财务处理单据时，别的同事可能正在问文档；有人生成图片时，聊天不能毫无解释地一直变慢。

这里需要的是工作安排。需要即时响应的交互应设等待上限，能晚点完成的图片任务可以排队。若任务超时，要让提交者知道它仍在等、已经失败，还是需要重试。至于是否拆分设备，应先测清真实业务的干扰程度。

我会把“同事在忙时还能怎样使用”写进验收条件。装得下是内存问题，能否在约定时间内完成，是服务承诺。把两者分开，才知道下一笔投入应该买硬件，还是先改任务安排。

## 统一入口让维护有了落点

原文架构里，我比较认同的是 LiteLLM 这一层：n8n、开发工具和聊天应用通过统一入口访问模型，由入口路由到后端服务。聊天、OCR 和生图各有自己的路由名称。

![n8n 原文架构图：LiteLLM 将统一入口路由至本地后端（图片来源：n8n）](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/2026-11-07-n8n-dgx-spark-local-ai-img-03-source-stack.png)

[LiteLLM 的项目说明](https://github.com/BerriAI/litellm)也介绍了代理网关与虚拟密钥。对一个团队而言，这层入口的价值在于有地方管理调用：后端可以更换，客户端不必到处追着机器地址改配置；不同用途也有机会分别限制访问。

不过，接口兼容仍然需要按任务检查。原文接 n8n 时就提醒，要留意 Chat Model 节点的 Responses API 开关，让请求与这套后端使用的聊天补全接口对应。一个地址能接收聊天，并不证明它能以相同方式处理图片、工具调用或所有参数。

所以我更愿意对外提供经过验证的业务入口，例如“提取发票字段”，并说明输入、返回值和失败方式。这样维护者换模型时，有明确的行为可回归；使用者也不必理解背后每个容器的区别。

这样，维护者更换模型时，就能先检查这些业务入口，再让工作流继续使用。

## 数据留在本地，要沿着工作流走一遍

原文把隐私与数据主权作为采用本地方案的重要理由。我认同这个动机，但“本地”必须覆盖任务实际经过的路径。

例如，模型在办公室里完成识别，结果随后写入外部在线表格，这条流程的数据边界就与纯本地不同。它可能符合组织的要求，也可能不符合；需要检查的是实际流向，不能只看推理服务器摆在哪里。

我会沿着上传、识别、存储、日志和备份逐段看：哪些地方保留原图，谁能查看，错误信息里是否带着敏感字段，备份又去了哪里。本地模型提供了控制数据的一种方式，具体控制仍然需要配置和核对。

维护责任也一样。原文记录了容器版本不匹配、arm64 构建依赖和模型启动时的内存争用。它引用的 [Kokoro 社区构建方案](https://forums.developer.nvidia.com/t/running-kokoro-tts-on-nvidia-dgx-spark-arm64-gb10/368846)，就涉及依赖与构建顺序的修补。这些细节让我很难把本地部署想成买回来就能长期省心的设备。

不再按云端 token 付费，维护工作仍然存在。没有采购价格、使用频率和维护工时的比较，我不会从这篇实践推导出“本地更便宜”。

## 我会先交付一条可核对的链路

读完这篇文章，我愿意认真考虑办公室里的本地 AI 服务。但起步时，我会缩小功能范围，选一个输入和结果都能核对的任务，把真实材料、忙时表现、错误转人工和恢复方法一起试完。

如果手头没有 DGX Spark，原文指向的 [Self-hosted AI Starter Kit](https://github.com/n8n-io/self-hosted-ai-starter-kit)也可以作为探索起点。它的 README 明确说明尚未充分针对生产环境优化，适合用来验证想法，不能把启动成功当成上线验收。

我的验收记录会同时留下处理结果与等待时间。单独处理顺畅，还要试同事同时使用的情况；正确样本通过了，还要看读错的号码有没有被拦住。这些记录比先列出一长串模型，更能帮助决定下一步。

原文证明了一种值得尝试的组合方式。对我来说，接下来最值得做的是拿真实业务检验它：那张读错的发票，应当在什么位置停下来，由谁看见，又怎样重新进入流程。把这件事讲清楚，本地 AI 才有机会成为同事愿意依赖的服务。

## 参考资料

- [n8n：Run your n8n AI workflows on NVIDIA DGX Spark, with no cloud API](https://blog.n8n.io/n8n-nvidia-dgx-spark/)
- [NVIDIA：DGX Spark 官方产品资料](https://www.nvidia.com/en-us/products/workstations/dgx-spark/)
- [n8n：DGX Spark 发票抽取模板](https://n8n.io/workflows/21011-extract-invoice-details-from-images-with-dgx-spark-ocr-and-qwen36/)
- [n8n：Self-hosted AI Starter Kit](https://github.com/n8n-io/self-hosted-ai-starter-kit)
- [LiteLLM 项目说明](https://github.com/BerriAI/litellm)
- [NVIDIA 开发者论坛：Kokoro 在 DGX Spark 上的 arm64 构建](https://forums.developer.nvidia.com/t/running-kokoro-tts-on-nvidia-dgx-spark-arm64-gb10/368846)


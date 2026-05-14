---
$schema: starlight
title: 造轮子还是买轮子？Figma 数据管线重构背后的账本
date: 2025-02-12
description: 当数据同步从几小时拖延到几天，连现成的商业方案也买不起时，Figma 被迫走上自建增量同步的硬核之路。
category: engineering
---

![00\_infographic](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/figma-data-pipeline/00-infographic-core-summary.jpg)

2020 年，Figma 的数据同步架构非常简单：每天跑一次 cron 任务，执行 `SELECT * FROM <TABLE>`，把数据库每一行捞出来存入 **S3**，再倒入 **Snowflake**。

管道里没有流式处理，也没有 **CDC**。在当时的体量下，这套机制很管用，但随着业务扩张，问题开始显现。

![01\_scene](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/figma-data-pipeline/01-scene-rear-view-mirror.jpg)

## 全量同步的瓶颈：从几小时到几天的延迟

**FigJam** 发布和 **Dev Mode** 上线后，Figma 的用户日志急剧增加。初期几小时就能跑完的同步任务，到了 2023 年，处理大表需要花上好几天。

结果是数据分析团队只能根据几天前的数据来做决策。为了维持这种全量导出的方式，Figma 还需要维护专门的数据库副本，以防止同步任务影响主库性能，这每年会消耗**数百万美元**的基础设施费用。系统显然需要升级了。

## 自建还是购买？每年数百万美元的成本账本

面对瓶颈，Figma 最初考虑了市面上的 SaaS 解决方案，如 **Fivetran** 或 **Airbyte**，希望能直接解决问题。

但在实际评估中，Figma 发现通用工具很难利用他们底层的云服务特性：

* **资源利用率低**：Figma 使用的是 **Amazon RDS for PostgreSQL**，AWS 允许将快照直接低成本导出到 S3 而不影响在线性能。多数第三方工具不支持这种方式，这就意味着 Figma 仍需保留庞大的读库副本。
* **成本高昂**：在 Figma 当前的数据规模下，按行或算力收费的专有解决方案成本是内部自建方案的 **5 到 10 倍**。

高昂的费用促使他们决定自己开发。

![02\_scene](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/figma-data-pipeline/02-scene-build-vs-buy.jpg)

## 转向增量同步：冷启动、CDC 与数据校验

重构的核心是从全量覆盖改为**增量同步**。新架构整合了几个成熟的组件：

* **冷启动**：利用 **Amazon RDS** 的快照功能，将存量数据导入 S3。
* **捕获变化（CDC）**：通过托管在 **Amazon MSK** 上的 **Kafka Connect** 和 **Snowflake Connector**，实时捕获数据库变更。
* **增量合并**：在 Snowflake 内部，使用存储过程和定时任务合并源数据和增量日志。

为了保证同步的数据一致性，Figma 设计了**双工作流机制**，其中一条专用于验证。验证过程不仅核对行数，还会进行**单元格级别的比对**，以确保发现微小的更新差异。

![03\_scene](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/figma-data-pipeline/03-scene-surgical-precision.jpg)

## 重构的收益：延迟缩短 90%，节省数百万美元

新系统上线后，数据延迟从之前的 30 多小时缩短到了 **3 小时以内**。对于计费等核心表，甚至可以做到**半小时级别**的更新。

开发人员现在可以直接在 Snowflake 中查询当前状态和历史 CDC 数据。能够查看历史的变更快照，有助于更快速地排查线上问题。

经济上的回报也很直接。废除了全量查询副本后，自建系统每年为 Figma **节省了数百万美元**的基础设施支出。回看过去，2020 年的五行代码在当时以低成本扛起了业务，但随着规模的突破，转向增量同步成为了必然的选择。

***

*在你的团队里，也有那种「虽然烂但一直能跑」的旧系统吗？什么契机会让你们下定决心重构它？*

## 原文参考

> Figma. **How Figma Upgraded Data Pipeline from Multi-Day Latency to Real-Time**. ByteByteGo Newsletter.
> <https://blog.bytebytego.com/p/how-figma-upgraded-data-pipeline>

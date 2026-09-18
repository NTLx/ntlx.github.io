---
$schema: starlight
title: 我为什么先把 ServerFS 做成永久只读，后来又开放了写权限
description: ServerFS MCP 从“永久只读”走到按 workdir 显式开放受控写入。安全边界最后落在每个动作的前置条件、失败方式和审计记录上。
date: 2026-09-18
category: ai-agents
primarySourceUrls: ["https://github.com/NTLx/ServerFS_MCP"]
---

我做 ServerFS MCP，是因为想解决一个很具体的问题：**AI Agent 能不能直接看到 Linux 服务器此刻真实的文件状态？**

以前我让 Agent 帮我审查服务器上的项目，经常隔着一层转述。服务器上的另一个 Agent 读取文件、跑检查，再把结果告诉 ChatGPT。最后我看到的是报告，不是服务器本身。

代码有没有真的改？配置现在是什么？某个文件究竟存不存在？只要中间隔着一层转述，我就还得相信那个 Agent 没看漏、没理解错，也没有拿旧状态当新状态。

所以 ServerFS 的第一版目标非常克制：不给 Agent shell，不让它执行命令，也不做 RAG、索引或文件同步，只打开一个能够实时观察文件系统的窗口。

但 9 月 17 日开始开发，9 月 18 日晚上发布 v0.2.0 之前，这个窗口经历了一次变化：我先把“永久只读”写进产品定义，后来又亲手把它改成了“按 workdir 显式开放受控写入”。

这次变化让我重新想了一遍：安全到底是“不让 Agent 写”，还是“让 Agent 只能以清楚、可失败、可审计的方式写”。

![ServerFS 从只读观察走向受控写入的四段演进](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/serverfs-mcp-development-retrospective-00-infographic-core-summary.png)

## 一开始，我把 ServerFS 做成一扇只读的窗

`dev_plan.md` 对 v0.1 的定义很绝对：管理员把 Linux 目录配置成 workdir，通过 Docker Compose 和 OpenAI Secure MCP Tunnel 提供给 Agent；Agent 只看到 alias 和相对路径，不看到 `/srv/projects` 这样的宿主机真实路径。

它只有 6 个只读工具：

```text
list_workdirs
list_directory
find_files
search_text
read_text_file
stat_file
```

还有一个只读的 `serverfs://{workdir}/{path}` resource template。

当时我甚至专门要求：不要留下 `READ_ONLY=false`、`ENABLE_WRITE=true` 之类以后可以偷偷打开写权限的开关。只读不是配置项，而是产品定义。

现在回头看，这个起点依然是对的。因为我要解决的是观察问题，不是远程运维问题。需求只有“让我看到真实状态”，那就没有理由顺手给 Agent 一把能改服务器文件的刀。

而且 ServerFS 不保存文件副本。服务器上的文件发生变化，下一次调用直接读当前 filesystem；没有索引刷新延迟，也不存在 Agent 看到“昨天同步进去的知识库”的歧义。

这就是最初的 ServerFS：一个窄得不能再窄的观察窗口。

## 真正麻烦的不是读文件，而是路径

第一版很快就能工作。但“能工作”和“我敢把它接到真实服务器”是两件事。

v0.1 的 review 很快把问题从“工具能不能返回内容”推进到了“它究竟允许 Agent 触碰什么”。scoped search 的根路径可能和 deny policy 脱节；hidden file 规则必须在 list、find、search、read、stat、resource 每条通道保持一致；BOM 分页、超大 resource、`find_files` 的 `truncated` 语义和特殊文件类型，也都不能靠“差不多”带过。

最先让我停下来的问题，是路径安全。

如果实现方式是：

```text
先检查路径
→ 确认它没有越界
→ 再用这个路径打开文件
```

检查和真正打开之间就存在时间窗口。一个 symlink 可以在两个动作之间被替换；你检查的对象，和内核最后打开的对象，不一定还是同一个东西。

后来 ServerFS 的文件访问边界改成了 FD-based traversal：从 workdir 根目录的 file descriptor 开始，用 `openat(2)` 配合 `O_NOFOLLOW` 一层一层向下走。最终操作针对已经持有的目录 FD 和最终文件名完成，而不是把用户传来的字符串重新拼成路径交回内核解析。

![ServerFS 如何用 FD-based traversal 收紧路径边界](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/serverfs-mcp-development-retrospective-01-flowchart-fd-traversal.png)

这件事改变了我对项目的理解。我原来想做的是一个“只读文件 MCP”，最后真正需要设计的却是一条**文件系统能力边界**。

读、列目录、find、search、stat，看起来是不同功能；安全上却必须是一条通道：同一个 workdir、同一套 hidden policy、同一套 default/extra deny、同一套 symlink 规则。只要某个接口自己重新实现一遍路径判断，它就可能变成旁路。

这里还有一个我没有接受的建议。v0.1 默认会拒绝 `.env`、私钥、`.ssh` 等常见敏感路径。有人建议不要允许管理员关闭这套默认 deny，我最后没有照做。

我的实际开发目录里，确实存在需要让 Agent 查看隐藏文件、环境配置或其他被默认规则命中的内容。把默认规则做成永远无法解除，并没有消灭需求，只会迫使我换一条更危险的路径去完成工作。

最后保留了：

```env
SERVERFS_DISABLE_DEFAULT_DENY=true
```

但它只释放内置 credential deny；管理员自己配置的 `SERVERFS_EXTRA_DENY_GLOBS` 仍然有效，hidden policy 也是独立控制。

我最后把两件事拆开：默认值负责降低误操作，显式配置负责表达管理员确实知道自己要暴露什么。

## 当我真的开始使用它，永久只读变成了工作流断点

v0.1 做完以后，我已经可以让 ChatGPT 直接查看服务器上的真实项目。然后一个自然的问题出现了：既然 Agent 已经能看到文件，也能指出应该改哪里，为什么不能把经过确认的小修改直接完成？

我并不是突然觉得“给 Agent 写权限也没什么”。恰恰相反，是因为前面已经把读权限的边界想得足够细，我才开始考虑：写权限能不能也被拆成同样窄的接口。

于是 v0.1 那句“永久只读”被正式废止。新方案也不是一个 `write_file`，而是 5 个 mutation tools，总 tool surface 为 11 个：

```text
create_text_file
edit_text_file
delete_file
create_directory
delete_directory
```

这五个名字看起来有点啰嗦，却是故意的。

`create` 永远不能覆盖已有文件；`edit` 永远不能顺手创建一个不存在的文件。删除文件和删除目录不是一个接口，删除目录只能删除空目录，没有 recursive，也没有 `force`。

没有 rename、move、copy、chmod、chown，更没有 shell。Agent 如果猜错路径，系统应该报错，而不是“尽量帮它完成任务”。如果模型把 `config/app.yaml` 猜成 `config/apps.yaml`，`edit_text_file` 应该给出 `PATH_NOT_FOUND`，让它重新搜索，而不是悄悄创建一份新文件。

我不想采用万能的 `filesystem_operation`：工具数量少一点，并不自动代表接口更安全；对 Agent 来说，语义直接、前置条件明确、失败结果稳定，通常比一个参数很多的万能工具更实用。

权限也没有做成一个全局开关。每个 workdir 增加：

```env
WORKDIR_01_READ_ONLY=true
WORKDIR_02_READ_ONLY=false
```

默认仍然是 `true`。同一个变量同时控制两层东西：第一层是 ServerFS 自己的授权，第二层是 Docker bind mount。应用层和内核层必须同时放行；read-only workdir 调 mutation tool，先得到 `WORKDIR_READ_ONLY`，即使有人把挂载误配成可写也不能绕过应用授权。

旧的 v0.1 `.env` 里根本没有这个变量，所以升级到 v0.2 后不会突然获得写权限。容器 rootfs 仍然是 read-only，进程仍然是 non-root、`cap_drop: ALL`、`no-new-privileges`；只有管理员明确配置的 workdir 挂载可能可写。

## 写权限不是一个布尔值，而是一组失败条件

让我开始放心的，不是多了 5 个工具，而是每个工具都带着明确的失败条件。

`read_text_file` 和 `stat_file` 会返回一个 opaque `revision`。它以 `v1:` 开头，内部来自一组 stat 元数据的 SHA-256 摘要，但 inode、UID、GID 等细节不会暴露给 Agent。

编辑或删除时，Agent 必须把自己看到的 revision 带回来。如果文件已经变化，就得到 `REVISION_CONFLICT`，重新读取再决定。读取本身也会在前后做 fstat，变化时返回 `FILE_CHANGED_DURING_READ`，不把内容和错误的 revision 一起交出去。

编辑不是让模型重新提交整份文件，而是 exact-match replacement：

```text
old_text
new_text
expected_count
```

所有 edits 先在内存里验证，任何一个匹配数量不对，整个调用都失败，不碰磁盘。

文件发布也不是“打开最终路径然后写”：

```text
create: temp(O_EXCL) → 写完 → fsync(temp) → linkat(target) → 清理 temp → fsync(parent)
edit:   temp(O_EXCL) → 写完 → 复制 metadata → 再检 revision → renameat(target) → fsync(parent)
```

创建通过 `linkat(2)` 发布，天然不能覆盖已有目标；编辑先写同目录临时文件，再通过 `renameat(2)` 原子替换。读者看到的是完整旧版本或者完整新版本，不会撞上“文件刚写了一半”的中间态。

编辑还要保留原文件的 owner、mode 和 extended attributes。复制顺序固定为：

```text
ownership
→ mode
→ xattrs
```

因为如果先 `chmod` 再 `chown`，Linux 的 `chown(2)` 可能清掉 setuid/setgid bit；调用本身报告成功，文件却悄悄失去原来的权限语义。

![edit_text_file 的 revision、exact-match 与原子发布约束](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/serverfs-mcp-development-retrospective-02-framework-controlled-mutation.png)

到了这里，我已经很难再把 ServerFS 简单分类成“只读 MCP”或者“可写 MCP”。它更像一组被仔细切开的 filesystem capabilities：每一块能力都只负责一个动作，每个动作都知道什么时候必须失败。

## 最终不是“测试通过”四个字

v0.2 第一次实现后，review 又找到了几个很典型的缺口。

第一个是 `.serverfs-disabled`。这是 ServerFS 表示 disabled workdir slot 的内部 sentinel。如果 Agent 能在正常 workdir 里创建这个名字，一次普通文件写入就可能变成下一次启动时的故障：从 Agent 看只是创建一个隐藏文件，从 ServerFS 看却可能是 restart DoS。

最终 `.serverfs-disabled` 和原子发布使用的 `.serverfs-tmp-*` 一起变成永久 reserved namespace。无论是否允许 hidden files、是否关闭 default credential deny，这些名字都不能被列出、读取、搜索、创建、修改或删除。

第二个问题是 NUL gate。`create_text_file` 会拒绝含 NUL 的内容，但第一版 `edit_text_file` 的 `new_text` 没有同样的检查。这样 Agent 可以把一个文本文件改成之后所有文本通道都不接受的内容，最后只能删除。修复后，create 和 edit 对 NUL 的契约一致。

第三个问题是 directory fsync 的失败语义。目录项发布以后，fsync 失败意味着“这次变化对崩溃恢复的持久性没有得到保证”，并不意味着“什么都没发生”。如果工具返回 `MUTATION_IO_ERROR`，Agent 会以为可以安全重试，磁盘上却已经有了第一次变化。现在这类情况会记录 `directory_fsync_failed`，同时返回已经提交的 mutation。

这些 bug 让我意识到，涉及真实文件系统时，“Agent 能不能完成任务”只是最低标准。更麻烦的问题是：它完成任务后，有没有悄悄改变一些你根本没让它改变的东西；它说失败时，磁盘是不是真的没有变化。

当前 checkout 的最终测试结果是 **584 个测试通过**。v0.2 的验证还在独立 throwaway Compose stack 上跑 MCP surface smoke，覆盖 read-only 拒绝、创建、读取、编辑、revision conflict、删除、目录操作、reserved path、metadata preservation 和并发场景。生产栈提供真实 tunnel，没有拿来做 mutation 实验。

测试数量当然不能替代判断。v0.1 的 `foo/foo/test.txt` 路径回归就是一个提醒：如果测试 helper 打开的根目录和生产代码不同，整套测试可以全绿，真正的路径 bug 仍然活着。验证必须尽量走用户会调用的 MCP surface。

## 发布以后，系统才会告诉你还有什么没完成

更新 `serverfs-mcp` 容器以后，我又遇到了一个与业务代码无关、但和发布质量直接相关的坑。

`openai-tunnel` 容器还活着，`/readyz` 也继续返回 `200 ready`。但它持有的可能还是旧 MCP 容器建立时的 session。下一次 ChatGPT 调用，才会第一个发现后面的服务已经不是原来的那个。

![更新 MCP 容器后 tunnel session 仍可能保持旧状态](https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/serverfs-mcp-development-retrospective-03-flowchart-tunnel-session-trap.png)

我最后的处理很简单：重启 tunnel，让它重新握手：

```bash
docker compose restart openai-tunnel
```

新的 `mcp session initialized` 会报告运行中的 `server_version`。这件事后来被写进 `AGENTS.md`，并通过 PR #4 合并。它代表项目从“代码应该是什么样”走到了“真实部署以后，人会在哪些地方被健康检查骗到”。

收尾时还发现了另一个容易忽略的状态问题：生产 `.env` 的 `SERVERFS_IMAGE` 是固定 release tag，裸跑 `docker compose build` 会把本地构建结果重新标记到那个 tag。运行中的容器不会立刻变化，但下一次 `up -d` 可能静默换版。于是项目规范明确要求用 scratch tag 构建；生产升级走 `pull + up -d`。

9 月 18 日晚上，`v0.2.0` tag 发布，PR #3 的 controlled mutations 和 PR #4 的 tunnel trap 都进入 `main`。从第一个 v0.1 任务书到这个版本，不到两天。

我现在更愿意这样理解 Agent 的文件权限。

我现在会把安全边界写成一串具体规则：默认只读；写权限按 workdir 开启；create 和 edit 分开；没有递归删除；修改前先证明自己看到的还是当前版本；应用授权与 Docker mount 双重限制；每条访问通道走同一套 path policy；每次 mutation 都留下结构化审计记录。

我在[《多智能体的分水岭，是控制流有没有变清楚》](https://ntlx.github.io/articles/ai-agent-engineering-patterns-reading-response)里写过“能力最好通过可授权的窄接口暴露给 Agent”。那时这个判断主要来自别人的工程实践。ServerFS 让我自己把它做了一遍。

所以以后评价一个 Agent 工具，我不会先问它“能不能写”。我会先看三件事：它到底被允许做哪些动作，每个动作在哪些情况下必须失败，以及失败以后人能不能知道发生了什么。

ServerFS 最初只是为了看服务器文件而写的一扇小窗。它最后教我的，是怎样把“给 Agent 权限”这件事拆成一组可以被人理解、被系统拒绝、也被日志追溯的动作。

## 参考资料

- [ServerFS MCP](https://github.com/NTLx/ServerFS_MCP)
- [v0.1 原始设计任务书](https://github.com/NTLx/ServerFS_MCP/blob/main/dev_plan.md)
- [v0.2 设计基线](https://github.com/NTLx/ServerFS_MCP/blob/main/dev_plan_v0.2.md)
- [v0.2 controlled mutation PR #3](https://github.com/NTLx/ServerFS_MCP/pull/3)
- [OpenAI Tunnel restart trap PR #4](https://github.com/NTLx/ServerFS_MCP/pull/4)
- [ServerFS MCP v0.2.0](https://github.com/NTLx/ServerFS_MCP/releases/tag/v0.2.0)

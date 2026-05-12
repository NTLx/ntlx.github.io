# YouTube 字幕提取技能

<cite>
**本文档引用的文件**
- [SKILL.md](file://.agents/skills/baoyu-youtube-transcript/SKILL.md)
- [main.ts](file://.agents/skills/baoyu-youtube-transcript/scripts/main.ts)
- [youtube.ts](file://.agents/skills/baoyu-youtube-transcript/scripts/youtube.ts)
- [transcript.ts](file://.agents/skills/baoyu-youtube-transcript/scripts/transcript.ts)
- [storage.ts](file://.agents/skills/baoyu-youtube-transcript/scripts/storage.ts)
- [shared.ts](file://.agents/skills/baoyu-youtube-transcript/scripts/shared.ts)
- [types.ts](file://.agents/skills/baoyu-youtube-transcript/scripts/types.ts)
- [speaker-transcript.md](file://.agents/skills/baoyu-youtube-transcript/prompts/speaker-transcript.md)
- [main.test.ts](file://.agents/skills/baoyu-youtube-transcript/scripts/main.test.ts)
</cite>

## 目录
1. [简介](#简介)
2. [项目结构](#项目结构)
3. [核心组件](#核心组件)
4. [架构概览](#架构概览)
5. [详细组件分析](#详细组件分析)
6. [依赖关系分析](#依赖关系分析)
7. [性能考虑](#性能考虑)
8. [故障排除指南](#故障排除指南)
9. [结论](#结论)
10. [附录](#附录)

## 简介

baoyu-youtube-transcript 是一个专门用于从 YouTube 视频提取字幕、管理存储和进行说话人转录的技能。该技能提供了多种输出格式，支持多语言字幕处理，并具备智能的缓存机制和降级回退策略。

该技能的核心特性包括：
- 直接访问 YouTube 的 InnerTube API 获取字幕数据
- 自动降级到 yt-dlp 工具以绕过反爬虫机制
- 智能缓存系统，避免重复网络请求
- 多种输出格式支持（Markdown 和 SRT）
- 说话人识别的 AI 后处理流程
- 章节分割和时间轴同步功能

## 项目结构

该项目采用模块化的 TypeScript 架构，主要文件组织如下：

```mermaid
graph TB
subgraph "技能目录"
A[.agents/skills/baoyu-youtube-transcript/]
B[scripts/]
C[prompts/]
D[SKILL.md]
end
subgraph "脚本模块"
E[main.ts - 主入口]
F[youtube.ts - YouTube API]
G[transcript.ts - 字幕处理]
H[storage.ts - 存储管理]
I[shared.ts - 共享工具]
J[types.ts - 类型定义]
end
subgraph "提示模板"
K[speaker-transcript.md]
end
A --> B
A --> C
A --> D
B --> E
B --> F
B --> G
B --> H
B --> I
B --> J
C --> K
```

**图表来源**
- [SKILL.md:1-187](file://.agents/skills/baoyu-youtube-transcript/SKILL.md#L1-L187)
- [main.ts:1-254](file://.agents/skills/baoyu-youtube-transcript/scripts/main.ts#L1-L254)

**章节来源**
- [SKILL.md:20-118](file://.agents/skills/baoyu-youtube-transcript/SKILL.md#L20-L118)

## 核心组件

### 主要功能模块

该技能由以下核心组件构成：

1. **命令行接口** - 提供用户友好的命令行交互
2. **YouTube API 客户端** - 处理与 YouTube 的数据交互
3. **字幕解析器** - 支持多种字幕格式的解析
4. **存储管理系统** - 管理缓存和输出文件
5. **AI 后处理器** - 支持说话人识别的 AI 流程

### 数据流架构

```mermaid
flowchart TD
A[用户输入] --> B[参数解析]
B --> C{检查缓存}
C --> |有缓存| D[加载缓存数据]
C --> |无缓存| E[获取原始数据]
E --> F[YouTube API 调用]
F --> G[字幕解析]
G --> H[数据转换]
H --> I[生成输出]
D --> I
I --> J[保存文件]
J --> K[返回结果]
```

**图表来源**
- [main.ts:77-140](file://.agents/skills/baoyu-youtube-transcript/scripts/main.ts#L77-L140)
- [storage.ts:29-44](file://.agents/skills/baoyu-youtube-transcript/scripts/storage.ts#L29-L44)

**章节来源**
- [main.ts:29-75](file://.agents/skills/baoyu-youtube-transcript/scripts/main.ts#L29-L75)

## 架构概览

### 整体架构设计

```mermaid
graph TB
subgraph "用户层"
U[命令行用户]
end
subgraph "应用层"
M[main.ts - 主控制器]
P[参数解析器]
R[结果处理器]
end
subgraph "服务层"
Y[youtube.ts - YouTube 服务]
T[transcript.ts - 字幕处理]
S[storage.ts - 存储管理]
SH[shared.ts - 共享工具]
end
subgraph "数据层"
C[CACHE - 缓存数据]
O[OUTPUT - 输出文件]
L[LOG - 日志记录]
end
U --> M
M --> P
M --> Y
M --> S
Y --> T
Y --> SH
T --> SH
S --> C
S --> O
M --> R
R --> O
```

**图表来源**
- [main.ts:1-28](file://.agents/skills/baoyu-youtube-transcript/scripts/main.ts#L1-L28)
- [youtube.ts:1-25](file://.agents/skills/baoyu-youtube-transcript/scripts/youtube.ts#L1-L25)

### 错误处理架构

```mermaid
flowchart TD
A[API 请求] --> B{状态检查}
B --> |成功| C[数据处理]
B --> |失败| D[错误分类]
D --> E{可重试错误}
E --> |是| F[尝试备用客户端]
E --> |否| G[抛出错误]
F --> H{备用客户端成功}
H --> |是| C
H --> |否| I[降级到 yt-dlp]
I --> J{yt-dlp 成功}
J --> |是| C
J --> |否| G
C --> K[继续执行]
```

**图表来源**
- [youtube.ts:420-438](file://.agents/skills/baoyu-youtube-transcript/scripts/youtube.ts#L420-L438)
- [shared.ts:49-78](file://.agents/skills/baoyu-youtube-transcript/scripts/shared.ts#L49-L78)

**章节来源**
- [youtube.ts:236-283](file://.agents/skills/baoyu-youtube-transcript/scripts/youtube.ts#L236-L283)

## 详细组件分析

### YouTube API 服务

YouTube API 服务是整个技能的核心，负责与 YouTube 进行数据交互。

#### InnerTube 客户端实现

```mermaid
classDiagram
class InnerTubeClient {
+string id
+string clientName
+string clientVersion
+string clientHeaderName
+string userAgent
+Record extraContext
}
class InnerTubeSession {
+string apiKey
+string webClientVersion
+string visitorData
}
class VideoSource {
<<union>>
+InnerTubeSource
+YtDlpSource
}
class InnerTubeSource {
+string kind
+any data
+TranscriptInfo[] transcripts
}
class YtDlpSource {
+string kind
+YtDlpInfo info
+TranscriptInfo[] transcripts
}
InnerTubeClient --> InnerTubeSession : "创建会话"
InnerTubeSession --> InnerTubeSource : "构建源"
YtDlpSource --> VideoSource : "实现"
InnerTubeSource --> VideoSource : "实现"
```

**图表来源**
- [youtube.ts:29-66](file://.agents/skills/baoyu-youtube-transcript/scripts/youtube.ts#L29-L66)
- [types.ts:80-124](file://.agents/skills/baoyu-youtube-transcript/scripts/types.ts#L80-L124)

#### 多客户端轮询机制

系统实现了三种不同的客户端类型来应对不同的反爬虫策略：

| 客户端类型 | 平台 | 用户代理 | 特点 |
|------------|------|----------|------|
| Android | 移动端 | com.google.android.youtube/20.10.38 | 最难检测，适合高风险内容 |
| Web | 桌面端 | Chrome/134.0.0.0 | 标准桌面浏览器行为 |
| iOS | 移动端 | com.google.ios.youtube/20.10.4 | 苹果生态系统 |

**章节来源**
- [youtube.ts:29-66](file://.agents/skills/baoyu-youtube-transcript/scripts/youtube.ts#L29-L66)

### 字幕处理引擎

字幕处理引擎支持多种字幕格式的解析和转换。

#### 字幕格式解析器

```mermaid
flowchart TD
A[字幕数据] --> B{格式检测}
B --> |XML| C[parseTranscriptXml]
B --> |JSON3| D[parseTranscriptJson3]
B --> |SRT| E[parseSrt]
B --> |VTT| F[parseWebVtt]
C --> G[Snippet 数组]
D --> G
E --> G
F --> G
G --> H[句子分割]
H --> I[Sentence 数组]
I --> J[格式化输出]
```

**图表来源**
- [transcript.ts:94-100](file://.agents/skills/baoyu-youtube-transcript/scripts/transcript.ts#L94-L100)
- [transcript.ts:184-212](file://.agents/skills/baoyu-youtube-transcript/scripts/transcript.ts#L184-L212)

#### 句子分割算法

句子分割算法采用了智能的标点符号识别和 CJK 文本处理：

```mermaid
flowchart TD
A[字幕片段] --> B[查找标点符号]
B --> C{找到标点?}
C --> |是| D[计算分割位置]
C --> |否| E[返回原片段]
D --> F[按字符长度分配时间戳]
F --> G[合并CJK文本]
G --> H[创建句子对象]
E --> I[直接使用]
H --> J[句子数组]
I --> J
```

**图表来源**
- [transcript.ts:112-145](file://.agents/skills/baoyu-youtube-transcript/scripts/transcript.ts#L112-L145)
- [transcript.ts:102-110](file://.agents/skills/baoyu-youtube-transcript/scripts/transcript.ts#L102-L110)

**章节来源**
- [transcript.ts:12-46](file://.agents/skills/baoyu-youtube-transcript/scripts/transcript.ts#L12-L46)

### 存储管理系统

存储管理系统提供了完整的缓存和文件管理功能。

#### 缓存架构设计

```mermaid
erDiagram
CACHE {
string videoId PK
string directoryPath
datetime lastAccessed
int hitCount
}
VIDEO_DIR {
string path PK
string videoId
string title
string channel
datetime createdAt
}
META_JSON {
string path PK
string videoId
string title
string channel
string description
number duration
string language
array chapters
}
RAW_JSON {
string path PK
string videoId
array snippets
datetime fetchedAt
}
SENTENCES_JSON {
string path PK
string videoId
array sentences
datetime processedAt
}
CACHE ||--|| VIDEO_DIR : "映射"
VIDEO_DIR ||--|| META_JSON : "包含"
VIDEO_DIR ||--|| RAW_JSON : "包含"
VIDEO_DIR ||--|| SENTENCES_JSON : "包含"
```

**图表来源**
- [storage.ts:15-44](file://.agents/skills/baoyu-youtube-transcript/scripts/storage.ts#L15-L44)
- [SKILL.md:104-113](file://.agents/skills/baoyu-youtube-transcript/SKILL.md#L104-L113)

#### 文件组织结构

每个视频的缓存数据按照以下结构组织：

```
youtube-transcript/
├── .index.json                    # 视频ID索引
└── {channel-slug}/
    └── {title-full-slug}/
        ├── meta.json              # 视频元数据
        ├── transcript-raw.json    # 原始字幕片段
        ├── transcript-sentences.json # 句子级字幕
        ├── imgs/
        │   └── cover.jpg          # 封面图片
        ├── transcript.md          # Markdown输出
        └── transcript.srt         # SRT输出
```

**章节来源**
- [storage.ts:6-9](file://.agents/skills/baoyu-youtube-transcript/scripts/storage.ts#L6-L9)

### 说话人识别流程

说话人识别是一个复杂的 AI 后处理流程，需要额外的 AI 处理能力。

#### AI 处理工作流程

```mermaid
sequenceDiagram
participant U as 用户
participant S as Skill
participant A as AI Agent
participant P as Prompt
participant F as File
U->>S : 运行 --speakers 参数
S->>F : 生成原始字幕文件
S->>A : 启动子代理
A->>P : 加载提示模板
A->>F : 读取原始字幕
A->>A : 分析说话人
A->>A : 识别章节
A->>F : 写入处理后的字幕
A-->>U : 返回最终结果
```

**图表来源**
- [SKILL.md:156-176](file://.agents/skills/baoyu-youtube-transcript/SKILL.md#L156-L176)
- [speaker-transcript.md:1-119](file://.agents/skills/baoyu-youtube-transcript/prompts/speaker-transcript.md#L1-L119)

#### 提示模板规范

AI 处理遵循严格的规则集：

| 规则类别 | 具体要求 | 示例 |
|----------|----------|------|
| 转录保真度 | 完全保留原文，包括填充词 | "uh", "um", "like" |
| 说话人识别 | 优先使用元数据，其次分析内容 | 根据标题、频道、描述识别 |
| 章节生成 | 使用现有章节或基于主题变化创建 | 每个重要话题一个章节 |
| 格式规范 | 使用 `[HH:MM:SS → HH:MM:SS]` 时间戳 | "00:00:15 → 00:00:21" |

**章节来源**
- [speaker-transcript.md:17-75](file://.agents/skills/baoyu-youtube-transcript/prompts/speaker-transcript.md#L17-L75)

## 依赖关系分析

### 外部依赖

该技能的主要外部依赖包括：

```mermaid
graph LR
subgraph "运行时依赖"
A[Bun Runtime]
B[Node.js FS 模块]
C[Node.js Child Process]
D[Node.js Path 模块]
end
subgraph "可选依赖"
E[yt-dlp]
F[浏览器Cookie]
end
subgraph "内部模块"
G[main.ts]
H[youtube.ts]
I[transcript.ts]
J[storage.ts]
K[shared.ts]
L[types.ts]
end
G --> H
G --> I
G --> J
H --> K
I --> K
J --> L
K --> L
H --> E
H --> F
```

**图表来源**
- [main.ts:1-27](file://.agents/skills/baoyu-youtube-transcript/scripts/main.ts#L1-L27)
- [youtube.ts:1-5](file://.agents/skills/baoyu-youtube-transcript/scripts/youtube.ts#L1-L5)

### 内部模块耦合

```mermaid
graph TD
A[main.ts] --> B[youtube.ts]
A --> C[transcript.ts]
A --> D[storage.ts]
B --> E[shared.ts]
C --> E
D --> F[types.ts]
E --> F
B --> F
C --> F
```

**图表来源**
- [main.ts:5-27](file://.agents/skills/baoyu-youtube-transcript/scripts/main.ts#L5-L27)

**章节来源**
- [types.ts:1-124](file://.agents/skills/baoyu-youtube-transcript/scripts/types.ts#L1-L124)

## 性能考虑

### 缓存策略优化

系统采用了多层次的缓存策略来优化性能：

1. **索引缓存** - 快速定位视频目录
2. **元数据缓存** - 避免重复获取视频信息
3. **字幕缓存** - 原始字幕和处理后的字幕分别缓存
4. **图片缓存** - 封面图片本地存储

### 并发控制

虽然当前实现主要是单线程操作，但系统设计支持并发扩展：

```mermaid
flowchart TD
A[视频ID列表] --> B{并发限制}
B --> |达到限制| C[等待队列]
B --> |未达限制| D[开始处理]
C --> E[释放信号]
E --> D
D --> F[下载字幕]
F --> G[处理数据]
G --> H[写入缓存]
H --> I[生成输出]
I --> J[完成]
```

**图表来源**
- [main.ts:239-249](file://.agents/skills/baoyu-youtube-transcript/scripts/main.ts#L239-L249)

### 资源管理

系统在资源管理方面采用了以下策略：

- **内存管理** - 分批处理大型字幕数据
- **磁盘空间** - 智能清理过期缓存
- **网络带宽** - 重用已建立的连接
- **CPU 使用** - 异步处理减少阻塞

## 故障排除指南

### 常见错误类型

| 错误代码 | 描述 | 解决方案 |
|----------|------|----------|
| BOT_DETECTED | 检测到机器人 | 切换客户端或增加延迟 |
| IP_BLOCKED | IP 被封禁 | 使用代理或等待一段时间 |
| TRANSCRIPTS_DISABLED | 视频无字幕 | 检查视频设置或使用 yt-dlp |
| NO_TRANSCRIPT | 指定语言不存在 | 选择可用语言或启用翻译 |
| AGE_RESTRICTED | 年龄限制内容 | 设置环境变量使用浏览器Cookie |
| YT_DLP_FAILED | yt-dlp 执行失败 | 检查 yt-dlp 安装和权限 |

### 错误处理机制

```mermaid
flowchart TD
A[捕获异常] --> B{错误类型判断}
B --> |可恢复| C[自动重试]
B --> |不可恢复| D[用户提示]
C --> E{重试次数}
E --> |未达上限| F[切换策略]
E --> |已达上限| D
F --> A
D --> G[退出程序]
```

**图表来源**
- [shared.ts:49-78](file://.agents/skills/baoyu-youtube-transcript/scripts/shared.ts#L49-L78)

**章节来源**
- [SKILL.md:177-187](file://.agents/skills/baoyu-youtube-transcript/SKILL.md#L177-L187)

### 调试技巧

1. **启用详细日志** - 使用 `--verbose` 参数查看更多调试信息
2. **检查缓存状态** - 查看 `.index.json` 文件确认缓存是否正确
3. **验证网络连接** - 确认可以访问 YouTube API
4. **测试 yt-dlp** - 单独运行 `yt-dlp` 验证安装

## 结论

baoyu-youtube-transcript 技能是一个功能完整、架构清晰的 YouTube 字幕提取解决方案。它通过以下关键特性提供了优秀的用户体验：

1. **可靠性** - 多层降级机制确保在各种网络条件下都能工作
2. **效率** - 智能缓存系统大幅减少重复请求
3. **灵活性** - 支持多种输出格式和处理选项
4. **可扩展性** - 模块化设计便于功能扩展和维护

该技能特别适合需要批量处理 YouTube 内容的场景，如内容聚合、学习资料整理和多媒体项目制作。

## 附录

### API 集成示例

#### 基本使用

```bash
# 默认：英文 Markdown 格式
bun main.ts <youtube-url-or-id>

# 指定多语言优先级
bun main.ts <url> --languages zh,en,ja

# 禁用时间戳
bun main.ts <url> --no-timestamps

# 启用章节分割
bun main.ts <url> --chapters

# 启用说话人识别
bun main.ts <url> --speakers

# 导出 SRT 格式
bun main.ts <url> --format srt

# 翻译到指定语言
bun main.ts <url> --translate zh-Hans

# 列出可用字幕
bun main.ts <url> --list

# 强制重新获取
bun main.ts <url> --refresh
```

#### 高级配置

```bash
# 指定输出目录
bun main.ts <url> --output-dir ./my-transcripts

# 指定输出文件路径
bun main.ts <url> -o ./output.md

# 排除自动生成的字幕
bun main.ts <url> --exclude-generated

# 排除手动创建的字幕
bun main.ts <url> --exclude-manually-created
```

### 配置参数说明

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `<url-or-id>` | string[] | 必需 | YouTube URL 或视频ID（可多个） |
| `--languages` | string | "en" | 语言代码列表，逗号分隔 |
| `--format` | "text"\|"srt" | "text" | 输出格式 |
| `--translate` | string | 无 | 翻译目标语言代码 |
| `--list` | boolean | false | 仅列出可用字幕 |
| `--timestamps` | boolean | true | 包含时间戳 |
| `--no-timestamps` | boolean | false | 禁用时间戳 |
| `--chapters` | boolean | false | 启用章节分割 |
| `--speakers` | boolean | false | 启用说话人识别 |
| `--exclude-generated` | boolean | false | 排除自动生成字幕 |
| `--exclude-manually-created` | boolean | false | 排除手动创建字幕 |
| `--refresh` | boolean | false | 强制重新获取 |
| `-o, --output` | string | 自动生成 | 指定输出文件路径 |
| `--output-dir` | string | "youtube-transcript" | 指定输出目录 |

### 环境变量

| 变量名 | 描述 | 示例 |
|--------|------|------|
| `YOUTUBE_TRANSCRIPT_COOKIES_FROM_BROWSER` | 传递给 yt-dlp 的浏览器Cookie | `chrome`, `safari`, `firefox` 或 `chrome:Profile 1` |

### 输入格式支持

系统接受以下任何一种格式作为输入：

- 完整URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- 短链接: `https://youtu.be/dQw4w9WgXcQ`
- 嵌入URL: `https://www.youtube.com/embed/dQw4w9WgXcQ`
- Shorts URL: `https://www.youtube.com/shorts/dQw4w9WgXcQ`
- 视频ID: `dQw4w9WgXcQ`

### 输出格式说明

| 格式 | 扩展名 | 描述 |
|------|--------|------|
| `text` | `.md` | Markdown 格式，包含前置元数据 |
| `srt` | `.srt` | SubRip 字幕格式，用于视频播放器 |

### 存储后端选择

系统使用本地文件系统作为存储后端，具有以下特点：

1. **简单可靠** - 无需额外的数据库依赖
2. **易于备份** - 文件系统级别的备份和迁移
3. **可读性强** - 缓存数据以 JSON 格式存储，便于人工检查
4. **成本低** - 本地存储，无额外费用

### 缓存策略

缓存策略采用"懒加载"模式：

1. **首次访问** - 下载并缓存所有相关数据
2. **后续访问** - 直接从缓存读取，避免网络请求
3. **智能刷新** - 当语言变更或强制刷新时重新获取
4. **自动清理** - 通过索引文件跟踪和管理缓存

### 数据持久化机制

数据持久化采用以下机制：

1. **元数据持久化** - `meta.json` 存储视频基本信息
2. **字幕持久化** - `transcript-raw.json` 和 `transcript-sentences.json` 分别存储原始和处理后的字幕
3. **索引持久化** - `.index.json` 维护视频ID到目录路径的映射
4. **媒体持久化** - 封面图片保存在 `imgs/` 目录下

### 说话人识别流程

说话人识别是一个需要 AI 处理的后处理步骤：

1. **原始数据生成** - 使用 `--speakers` 参数生成包含 SRT 格式字幕的 Markdown 文件
2. **AI 处理** - 使用提示模板对原始字幕进行说话人标注和章节分割
3. **结果输出** - 生成最终的结构化转录文件

### 批量处理功能

系统支持同时处理多个视频：

```mermaid
flowchart LR
A[输入视频ID列表] --> B[逐个处理]
B --> C[检查缓存]
C --> |缓存存在| D[直接使用缓存]
C --> |缓存缺失| E[网络获取]
D --> F[生成输出]
E --> F
F --> G[保存文件]
G --> H[下一个视频]
```

**图表来源**
- [main.ts:239-249](file://.agents/skills/baoyu-youtube-transcript/scripts/main.ts#L239-L249)

### 并发控制和资源管理

当前实现采用串行处理模式，但系统设计支持并发扩展：

1. **资源限制** - 通过队列机制控制同时处理的视频数量
2. **内存管理** - 分批处理大型数据集，避免内存溢出
3. **网络优化** - 复用连接，减少网络开销
4. **磁盘I/O优化** - 批量写入，减少磁盘操作次数

### 外部视频平台集成

系统主要针对 YouTube 平台进行了优化，但其架构设计允许扩展到其他平台：

1. **抽象层设计** - `VideoSource` 接口支持不同平台的数据源
2. **统一接口** - 所有平台使用相同的处理流程
3. **可插拔架构** - 新平台只需实现相应的适配器

### 认证机制和速率限制

系统通过以下方式处理认证和速率限制：

1. **多客户端轮询** - 通过不同客户端身份绕过检测
2. **智能重试** - 对临时性错误进行指数退避重试
3. **降级策略** - 在检测到限制时自动切换到备用方案
4. **用户代理轮换** - 使用不同的浏览器指纹

### 错误处理最佳实践

```mermaid
flowchart TD
A[错误发生] --> B{错误分类}
B --> |网络错误| C[重试机制]
B --> |权限错误| D[用户指导]
B --> |数据错误| E[数据修复]
B --> |系统错误| F[优雅降级]
C --> G{重试次数}
G --> |未达上限| H[等待后重试]
G --> |已达上限| D
H --> A
D --> I[退出程序]
E --> J[继续执行]
F --> K[使用替代方案]
```

**图表来源**
- [shared.ts:49-78](file://.agents/skills/baoyu-youtube-transcript/scripts/shared.ts#L49-L78)
# GitHub 图片托管技能

<cite>
**本文档引用的文件**
- [SKILL.md](file://.agents/skills/github-image-hosting/SKILL.md)
- [upload.ts](file://.agents/skills/github-image-hosting/scripts/upload.ts)
- [package.json](file://.agents/skills/github-image-hosting/scripts/package.json)
- [wechat-image-processor.ts](file://.agents/skills/baoyu-post-to-wechat/scripts/wechat-image-processor.ts)
- [article-posting.md](file://.agents/skills/baoyu-post-to-wechat/references/article-posting.md)
- [image-text-posting.md](file://.agents/skills/baoyu-post-to-wechat/references/image-text-posting.md)
- [package.json](file://package.json)
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

GitHub 图片托管技能是一个基于 GitHub 的图片托管服务实现，专为在中国大陆地区提供可靠的 CDN 访问而设计。该技能通过 GitHub API 将图片上传到指定仓库，并生成 jsDelivr CDN URL，确保在微信公众号等平台上的稳定访问。

该技能的核心特点包括：
- 自动文件名冲突检测和处理
- 支持自定义文件名和目标文件夹
- 基于 jsDelivr 的 CDN 加速
- 与微信公众号文章发布流程的无缝集成
- 完整的错误处理和重试机制

## 项目结构

GitHub 图片托管技能位于项目的技能目录结构中，采用模块化的组织方式：

```mermaid
graph TB
subgraph "技能目录结构"
A[.agents/skills/] --> B[github-image-hosting/]
B --> C[scripts/]
C --> D[upload.ts]
C --> E[package.json]
B --> F[SKILL.md]
G[.agents/skills/] --> H[baoyu-post-to-wechat/]
H --> I[scripts/]
I --> J[wechat-image-processor.ts]
K[.agents/skills/] --> L[baoyu-url-to-markdown/]
L --> M[scripts/]
M --> N[lib/]
N --> O[media/]
O --> P[media-utils.ts]
end
```

**图表来源**
- [.agents/skills/github-image-hosting/SKILL.md:1-107](file://.agents/skills/github-image-hosting/SKILL.md#L1-L107)
- [.agents/skills/github-image-hosting/scripts/upload.ts:1-237](file://.agents/skills/github-image-hosting/scripts/upload.ts#L1-L237)

**章节来源**
- [.agents/skills/github-image-hosting/SKILL.md:1-107](file://.agents/skills/github-image-hosting/SKILL.md#L1-L107)
- [.agents/skills/github-image-hosting/scripts/upload.ts:1-237](file://.agents/skills/github-image-hosting/scripts/upload.ts#L1-L237)

## 核心组件

### 主要功能模块

GitHub 图片托管技能由以下几个核心组件构成：

1. **上传脚本** - 主要的上传逻辑实现
2. **配置文件** - 技能的元数据和使用说明
3. **依赖管理** - 包含运行时依赖的配置
4. **集成模块** - 与微信公众号发布流程的协作

### 数据结构设计

```mermaid
classDiagram
class UploadOptions {
+string imagePath
+string customName
+string folder
+boolean dryRun
}
class UploadResult {
+boolean success
+string filename
+string folder
+string githubUrl
+string cdnUrl
+string error
}
class GitHubAPI {
+ghApiGet(endpoint) string
+ghApiPost(endpoint, payload) string
+ghApiPatch(endpoint, payload) void
}
UploadOptions --> UploadResult : "生成"
GitHubAPI --> UploadResult : "返回"
```

**图表来源**
- [.agents/skills/github-image-hosting/scripts/upload.ts:24-38](file://.agents/skills/github-image-hosting/scripts/upload.ts#L24-L38)

**章节来源**
- [.agents/skills/github-image-hosting/scripts/upload.ts:24-38](file://.agents/skills/github-image-hosting/scripts/upload.ts#L24-L38)

## 架构概览

### 整体架构设计

```mermaid
sequenceDiagram
participant User as 用户
participant Script as 上传脚本
participant GitHub as GitHub API
participant CDN as jsDelivr CDN
User->>Script : 执行上传命令
Script->>Script : 解析参数和配置
Script->>GitHub : 获取现有文件列表
GitHub-->>Script : 返回文件列表
Script->>Script : 生成唯一文件名
Script->>GitHub : 创建 blob
GitHub-->>Script : 返回 blob SHA
Script->>GitHub : 创建 tree
GitHub-->>Script : 返回 tree SHA
Script->>GitHub : 创建 commit
GitHub-->>Script : 返回 commit SHA
Script->>GitHub : 更新分支引用
GitHub-->>Script : 确认更新
Script->>CDN : 生成 CDN URL
Script-->>User : 返回结果 JSON
Note over User,CDN : 使用 cdnUrl 在中国大陆稳定访问
```

**图表来源**
- [.agents/skills/github-image-hosting/scripts/upload.ts:136-220](file://.agents/skills/github-image-hosting/scripts/upload.ts#L136-L220)

### 与微信公众号的集成架构

```mermaid
graph TB
subgraph "微信公众号发布流程"
A[Markdown 文章] --> B[图片处理模块]
B --> C[GitHub 图片托管]
C --> D[jsDelivr CDN]
D --> E[微信编辑器]
subgraph "图片处理模块"
F[格式检测]
G[尺寸调整]
H[质量压缩]
I[透明度处理]
end
subgraph "GitHub 集成"
J[文件名生成]
K[冲突检测]
L[自动重命名]
M[批量上传]
end
F --> G
G --> H
H --> I
I --> J
J --> K
K --> L
L --> M
end
```

**图表来源**
- [.agents/skills/baoyu-post-to-wechat/scripts/wechat-image-processor.ts:113-125](file://.agents/skills/baoyu-post-to-wechat/scripts/wechat-image-processor.ts#L113-L125)
- [.agents/skills/baoyu-post-to-wechat/scripts/wechat-image-processor.ts:230-286](file://.agents/skills/baoyu-post-to-wechat/scripts/wechat-image-processor.ts#L230-L286)

## 详细组件分析

### 上传脚本实现

#### 参数解析机制

上传脚本采用命令行参数解析机制，支持多种配置选项：

```mermaid
flowchart TD
A[开始] --> B[解析命令行参数]
B --> C{检查参数类型}
C --> |--name| D[设置自定义文件名]
C --> |(--folder| E[设置目标文件夹]
C --> |(--dry-run)| F[启用预览模式]
C --> |文件路径| G[设置图片路径]
D --> H[继续解析]
E --> H
F --> H
G --> H
H --> I[验证必需参数]
I --> J{参数有效?}
J --> |是| K[返回配置对象]
J --> |否| L[显示使用说明并退出]
```

**图表来源**
- [.agents/skills/github-image-hosting/scripts/upload.ts:40-62](file://.agents/skills/github-image-hosting/scripts/upload.ts#L40-L62)

#### 文件名处理逻辑

文件名处理包含多个步骤来确保兼容性和唯一性：

```mermaid
flowchart TD
A[输入原始文件名] --> B[应用清理规则]
B --> C{检查特殊字符}
C --> |存在| D[替换为连字符]
C --> |不存在| E[保持不变]
D --> F[去除首尾连字符]
E --> F
F --> G[转换为小写]
G --> H[检查文件存在性]
H --> I{文件已存在?}
I --> |是| J[添加序号后缀]
I --> |否| K[使用当前文件名]
J --> L{文件仍存在?}
L --> |是| J
L --> |否| M[返回唯一文件名]
K --> M
```

**图表来源**
- [.agents/skills/github-image-hosting/scripts/upload.ts:116-126](file://.agents/skills/github-image-hosting/scripts/upload.ts#L116-L126)
- [.agents/skills/github-image-hosting/scripts/upload.ts:128-134](file://.agents/skills/github-image-hosting/scripts/upload.ts#L128-L134)

#### GitHub API 集成

脚本通过 GitHub CLI (gh) 与 GitHub API 进行交互，实现完整的 Git 操作流程：

```mermaid
sequenceDiagram
participant Script as 上传脚本
participant GH as GitHub CLI
participant API as GitHub API
Script->>GH : 获取当前分支 SHA
GH->>API : GET /repos/ : owner/ : repo/git/refs/heads/ : branch
API-->>GH : 返回 SHA
GH-->>Script : 返回 SHA
Script->>GH : 创建 blob
GH->>API : POST /repos/ : owner/ : repo/git/blobs
API-->>GH : 返回 blob SHA
Script->>GH : 创建 tree
GH->>API : POST /repos/ : owner/ : repo/git/trees
API-->>GH : 返回 tree SHA
Script->>GH : 创建 commit
GH->>API : POST /repos/ : owner/ : repo/git/commits
API-->>GH : 返回 commit SHA
Script->>GH : 更新分支引用
GH->>API : PATCH /repos/ : owner/ : repo/git/refs/heads/ : branch
API-->>GH : 确认更新
```

**图表来源**
- [.agents/skills/github-image-hosting/scripts/upload.ts:64-100](file://.agents/skills/github-image-hosting/scripts/upload.ts#L64-L100)
- [.agents/skills/github-image-hosting/scripts/upload.ts:173-201](file://.agents/skills/github-image-hosting/scripts/upload.ts#L173-L201)

**章节来源**
- [.agents/skills/github-image-hosting/scripts/upload.ts:40-62](file://.agents/skills/github-image-hosting/scripts/upload.ts#L40-L62)
- [.agents/skills/github-image-hosting/scripts/upload.ts:116-134](file://.agents/skills/github-image-hosting/scripts/upload.ts#L116-L134)
- [.agents/skills/github-image-hosting/scripts/upload.ts:173-201](file://.agents/skills/github-image-hosting/scripts/upload.ts#L173-L201)

### 微信公众号图片处理集成

#### 图片格式支持与限制

微信公众号对图片格式有严格限制，系统支持多种格式的自动转换：

| 支持格式 | 说明 | 处理方式 |
|---------|------|----------|
| PNG | 无损压缩，支持透明度 | 直接上传或转换为 JPG |
| JPG/JPEG | 有损压缩，最佳网页显示 | 直接上传 |
| GIF | 不支持 | 转换为静态图片 |
| WEBP | 不支持 | 转换为 JPG/PNG |
| SVG | 不支持 | 转换为 PNG |
| ICO | 不支持 | 转换为 PNG |

#### 图片尺寸和质量优化

系统采用多级优化策略，确保图片在微信公众号中的最佳显示效果：

```mermaid
flowchart TD
A[接收图片] --> B{检查文件大小}
B --> |超过1MB| C[开始压缩]
B --> |小于等于1MB| D[检查格式]
C --> E[调整尺寸]
E --> F[降低质量]
F --> G{仍超过1MB?}
G --> |是| F
G --> |否| H[格式转换]
D --> I{是否支持格式?}
I --> |是| J[直接上传]
I --> |否| K[转换为目标格式]
H --> L[生成最终图片]
K --> L
J --> L
L --> M[上传到 GitHub]
```

**图表来源**
- [.agents/skills/baoyu-post-to-wechat/scripts/wechat-image-processor.ts:113-125](file://.agents/skills/baoyu-post-to-wechat/scripts/wechat-image-processor.ts#L113-L125)
- [.agents/skills/baoyu-post-to-wechat/scripts/wechat-image-processor.ts:230-286](file://.agents/skills/baoyu-post-to-wechat/scripts/wechat-image-processor.ts#L230-L286)

**章节来源**
- [.agents/skills/baoyu-post-to-wechat/scripts/wechat-image-processor.ts:23-32](file://.agents/skills/baoyu-post-to-wechat/scripts/wechat-image-processor.ts#L23-L32)
- [.agents/skills/baoyu-post-to-wechat/scripts/wechat-image-processor.ts:230-286](file://.agents/skills/baoyu-post-to-wechat/scripts/wechat-image-processor.ts#L230-L286)

## 依赖关系分析

### 外部依赖

GitHub 图片托管技能依赖以下外部工具和服务：

```mermaid
graph TB
subgraph "运行时依赖"
A[bun runtime] --> B[TypeScript 运行时]
C[GitHub CLI (gh)] --> D[GitHub API]
E[jsDelivr CDN] --> F[全球 CDN 网络]
end
subgraph "内部依赖"
G[文件系统] --> H[路径处理]
I[子进程执行] --> J[命令行调用]
K[JSON 解析] --> L[配置处理]
end
subgraph "微信集成"
M[图片处理器] --> N[格式转换]
O[尺寸调整] --> P[质量压缩]
end
A --> G
C --> D
E --> F
M --> N
N --> O
O --> P
```

**图表来源**
- [.agents/skills/github-image-hosting/scripts/upload.ts:16-18](file://.agents/skills/github-image-hosting/scripts/upload.ts#L16-L18)
- [.agents/skills/github-image-hosting/scripts/upload.ts:102-114](file://.agents/skills/github-image-hosting/scripts/upload.ts#L102-L114)

### 内部模块依赖

```mermaid
graph LR
A[upload.ts] --> B[参数解析模块]
A --> C[文件名处理模块]
A --> D[GitHub API 模块]
A --> E[URL 生成模块]
F[wechat-image-processor.ts] --> G[格式检测模块]
F --> H[尺寸调整模块]
F --> I[质量压缩模块]
A --> F
```

**图表来源**
- [.agents/skills/github-image-hosting/scripts/upload.ts:136-220](file://.agents/skills/github-image-hosting/scripts/upload.ts#L136-L220)
- [.agents/skills/baoyu-post-to-wechat/scripts/wechat-image-processor.ts:113-125](file://.agents/skills/baoyu-post-to-wechat/scripts/wechat-image-processor.ts#L113-L125)

**章节来源**
- [.agents/skills/github-image-hosting/scripts/upload.ts:16-18](file://.agents/skills/github-image-hosting/scripts/upload.ts#L16-L18)
- [.agents/skills/github-image-hosting/scripts/upload.ts:102-114](file://.agents/skills/github-image-hosting/scripts/upload.ts#L102-L114)

## 性能考虑

### 上传性能优化

1. **批量操作**：支持单次上传多个图片文件
2. **智能重试**：网络异常时自动重试机制
3. **并发处理**：多个图片上传时的并发优化
4. **缓存策略**：避免重复的 API 调用

### CDN 性能特性

- **全球加速**：jsDelivr 提供全球 CDN 节点
- **边缘缓存**：智能缓存机制减少服务器负载
- **智能路由**：根据用户地理位置选择最优节点
- **HTTPS 支持**：安全传输保障

### 存储策略

- **分层存储**：按文件夹结构组织图片
- **版本控制**：Git 历史记录便于追踪
- **自动清理**：支持旧版本图片的清理
- **备份机制**：多节点备份确保可靠性

## 故障排除指南

### 常见问题及解决方案

#### GitHub 认证问题

**问题描述**：执行上传时提示认证失败

**可能原因**：
- GitHub CLI 未正确配置
- 缺少必要的权限
- Token 过期

**解决方案**：
1. 验证 GitHub CLI 配置
2. 检查仓库写权限
3. 重新生成访问 Token

#### 文件上传失败

**问题描述**：图片上传过程中断

**可能原因**：
- 网络连接不稳定
- 文件过大
- 权限不足

**解决方案**：
1. 检查网络连接
2. 减小文件大小
3. 确认仓库权限

#### CDN 访问问题

**问题描述**：CDN URL 无法正常访问

**可能原因**：
- CDN 缓存未更新
- 网络代理问题
- 地区限制

**解决方案**：
1. 清除浏览器缓存
2. 检查网络代理设置
3. 使用备用 URL

### 调试技巧

1. **启用详细日志**：使用 `--dry-run` 参数预览操作
2. **检查 API 响应**：验证 GitHub API 调用结果
3. **验证文件完整性**：确认上传文件的完整性和正确性

**章节来源**
- [.agents/skills/github-image-hosting/SKILL.md:91-96](file://.agents/skills/github-image-hosting/SKILL.md#L91-L96)

## 结论

GitHub 图片托管技能提供了一个完整、可靠的图片托管解决方案，特别适合需要在中国大陆地区稳定访问图片资源的场景。通过与 GitHub API 的深度集成和 jsDelivr CDN 的加速，该技能能够满足博客、微信公众号等多种应用场景的需求。

主要优势包括：
- **高可用性**：基于 GitHub 的稳定基础设施
- **全球加速**：jsDelivr CDN 确保快速访问
- **自动化程度高**：完整的文件名处理和冲突检测
- **易于集成**：与现有工作流程无缝对接
- **成本效益**：免费的 GitHub 仓库和 CDN 服务

未来可以考虑的功能增强：
- 更灵活的存储策略配置
- 更强大的图片处理能力
- 更完善的监控和告警机制
- 更丰富的 CDN 选项

## 附录

### 配置选项详解

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `--name` | 字符串 | 原始文件名 | 自定义文件名（不含扩展名） |
| `--folder` | 字符串 | `Jarvis` | 目标文件夹路径 |
| `--dry-run` | 布尔值 | `false` | 预览模式，不实际上传 |

### 使用示例

```bash
# 基本上传
bun skills/github-image-hosting/scripts/upload.ts /path/to/image.png

# 自定义文件名
bun skills/github-image-hosting/scripts/upload.ts /path/to/image.png --name my-custom-name

# 指定文件夹
bun skills/github-image-hosting/scripts/upload.ts /path/to/image.png --folder blog

# 预览模式
bun skills/github-image-hosting/scripts/upload.ts /path/to/image.png --dry-run
```

### 输出格式

成功时返回 JSON 格式的结果：

```json
{
  "success": true,
  "filename": "image.png",
  "folder": "Jarvis",
  "githubUrl": "https://github.com/NTLx/Pic/blob/master/Jarvis/image.png",
  "cdnUrl": "https://cdn.jsdelivr.net/gh/NTLx/Pic@master/Jarvis/image.png"
}
```

**章节来源**
- [.agents/skills/github-image-hosting/SKILL.md:16-68](file://.agents/skills/github-image-hosting/SKILL.md#L16-L68)
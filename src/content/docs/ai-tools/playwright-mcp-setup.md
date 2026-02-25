---
title: Playwright MCP 配置指南
description: 为 Claude Code 配置 Playwright MCP 的最佳实践方案，包含生产级调优、Token 优化和身份验证持久化配置。
---

# Claude Code Playwright MCP 配置指南

基于官方文档、社区核心开发者（如 Simon Willison 和 Microsoft 维护者）以及实战经验，以下是为 **Claude Code** 配置 **Playwright MCP** 的最佳实践方案。

核心结论是：**官方默认配置能用，但为了省钱（Token）和少报错，必须进行"生产级"调优。**

## 0. 快速配置（Plugin 配置文件修改）

:::caution[注意]
Playwright Plugin 更新时可能会覆盖以下配置文件，届时需要重新配置。
:::

### 需要修改的配置文件

Playwright Plugin 有两个配置文件需要同步修改：

1. **缓存目录配置**：
   ```
   ~/.claude/plugins/cache/claude-plugins-official/playwright/<hash>/.mcp.json
   ```

2. **市场目录配置**：
   ```
   ~/.claude/plugins/marketplaces/claude-plugins-official/external_plugins/playwright/.mcp.json
   ```

:::tip
`<hash>` 是 plugin 版本的哈希值，路径可能因版本更新而变化。使用 `find ~/.claude/plugins -name ".mcp.json" -path "*playwright*"` 查找。
:::

### 修改内容

将配置从：
```json
{
  "playwright": {
    "command": "npx",
    "args": ["@playwright/mcp@latest"]
  }
}
```

修改为：
```json
{
  "playwright": {
    "command": "npx",
    "args": ["-y", "@playwright/mcp@latest", "--vision"]
  }
}
```

**参数说明**：
- **`-y`**：自动确认 npx 安装，防止交互式提示卡住 MCP 工具
- **`--vision`**：启用视觉功能，允许 Claude 获取网页截图（关键优化）

### 验证方法

1. 重启 Claude Code 会话
2. 让 Claude 使用 Playwright 打开任意网页
3. 检查是否能获取截图（使用 `browser_take_screenshot` 或 `browser_snapshot`）

### 一键配置命令

在终端中执行以下命令，自动完成配置：

```bash
# 查找并修改所有 Playwright MCP 配置文件
find ~/.claude/plugins -name ".mcp.json" -path "*playwright*" | while read f; do
  echo "修改: $f"
  cat > "$f" << 'EOF'
{
  "playwright": {
    "command": "npx",
    "args": ["-y", "@playwright/mcp@latest", "--vision"]
  }
}
EOF
done
```

---

## 1. 最佳基础配置命令 (The "Golden" Setup)

不要只运行默认的安装命令。为了让 Claude 能"看到"页面（这对 Debug 至关重要）并保持调试能力，推荐使用以下组合参数：

```bash
# 在项目根目录下运行（项目级配置，推荐）
claude mcp add playwright npx -y @playwright/mcp@latest --vision

```

* **`--vision` (关键)**：启用视觉功能。默认的 Playwright MCP 只传回 DOM 树（文字），加上这个参数后，Claude 可以获取网页截图。**这是 Claude Code 相比其他 AI 最大的优势之一**，能大幅提升它修复 UI 错误的成功率。
* **`-y`**：自动确认安装，防止在自动化脚本中卡住。

## 2. 进阶配置：解决两大痛点

在 `~/.claude/config.json` 或项目的 `.claude/mcp.json` 中，你可以微调配置。

#### A. 痛点一：Token 消耗过大 (Token Optimization)

Playwright 默认的报错输出非常冗长（包含大量 HTML 及其属性），这会瞬间吃掉你的 Token 配额。
**解决方案**：强制 Playwright 使用简洁的 Reporter。

在你的 `playwright.config.ts` 文件中（如果没有就让 Claude 建一个），**必须**添加针对 CI/Claude 环境的配置：

```typescript
// playwright.config.ts
export default defineConfig({
  // ... 其他配置
  // 如果是在 CI 或 Claude 环境下，只输出简单的点或行，不要输出繁杂的列表
  reporter: process.env.CI || process.env.CLAUDE ? 'line' : 'list',
});

```

* **经验**：告诉 Claude 在运行测试时，始终带上环境变量，例如 `CLAUDE=true npx playwright test`。

#### B. 痛点二：登录状态丢失 (Auth Persistence)

Playwright 默认是"无痕模式"。如果你需要 Claude 帮你测试后台管理系统，每次都让它写登录代码很蠢且不稳定。
**解决方案**：配置 `storageState`。

1. **让 Claude 写一个专门的登录脚本** (`global-setup.ts`)，把 Cookies 存成 `auth.json`。
2. **配置 Playwright 加载这个文件**：
```typescript
// playwright.config.ts
use: {
  // 告诉 Playwright 复用这个登录状态
  storageState: 'auth.json',
},

```


3. **实战技巧**：你自己先手动运行一次登录脚本生成 `auth.json`，然后让 Claude 接手后续操作。这样它启动浏览器时就是"已登录"状态。

## 3. "Prompt Engineering" for Playwright

配置不仅仅是改文件，还包括你怎么"命令"它。Anthropic 官方演示和社区大神都遵循以下模式：

* **建立"Seed Test"（种子测试）**：
不要让 Claude 凭空猜测。在项目中放一个简单的 `tests/example.spec.ts`，里面包含你项目的基础 URL、登录逻辑和常用的 Selector 写法。
* *指令*："Read `tests/example.spec.ts` to understand my testing patterns, then write a new test for the checkout flow."
* *效果*：Claude 会模仿你的代码风格，而不是乱写。


* **明确"写代码"还是"执行操作"**：
* 如果你是**开发**：明确说 "Write a Playwright test spec file for X"。
* 如果你是**调试**：明确说 "Use Playwright MCP to navigate to X and tell me what you see"。
* *区别*：前者省 Token（只生成文本），后者耗 Token（会启动浏览器并传回大量数据）。



## 4. 避坑指南 (来自社区血泪史)

1. **避免让它"自我修复"太久**：Claude Code 有时会陷入"运行 -> 报错 -> 瞎改 Selector -> 运行"的死循环。
* *建议*：设定规则，"If the test fails twice, stop and show me the screenshot and error log."


2. **移动端视图**：如果你做的是响应式网页，Playwright 默认打开是大屏。
* *配置*：在 Prompt 中显式要求："Always test with a standard desktop viewport (1920x1080) unless specified otherwise."


3. **不要过度依赖 MCP**：
* 这听起来矛盾，但在写代码时，直接让 Claude 生成 `.ts` 文件然后你在终端自己运行 `npx playwright test`，往往比通过 MCP 让它"远程控制"运行更快、更省钱。**把 MCP 当作"眼睛"来调试，而不是唯一的"手"来运行。**



## 总结：最佳配置清单

1. **安装命令**：带上 `--vision`。
2. **配置文件**：`playwright.config.ts` 设置 `reporter: 'line'`。
3. **身份验证**：使用 `storageState` 复用登录态。
4. **操作习惯**：先提供示例代码（Seed Test），并在失败两次后人工介入。

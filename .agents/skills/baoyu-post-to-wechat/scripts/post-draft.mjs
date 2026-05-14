#!/usr/bin/env bun
/**
 * post-draft.mjs — 微信草稿发布的桥接脚本
 *
 * 由 publish-wechat.mjs 调用，负责将其参数转换为 wechat-api.ts 的 CLI 参数。
 *
 * publish-wechat.mjs 传入的参数:
 *   --html <path>    HTML 文件路径
 *   --cover <path>   封面图路径
 *   --title <title>  文章标题
 *   --theme <theme>  主题
 *   --color <color>  颜色
 *   --author <name>  作者
 *   --src <url>      sourceUrl（微信"阅读原文"链接）
 */

import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const SCRIPT_DIR = import.meta.dirname;
const WECHAT_API = resolve(SCRIPT_DIR, "wechat-api.ts");

// 解析参数（纯 JS，无 TypeScript 类型注解）
const args = process.argv.slice(2);
const parsed = {};
for (let i = 0; i < args.length; i++) {
  const key = args[i];
  if (key && key.startsWith("--") && args[i + 1]) {
    parsed[key.slice(2)] = args[i + 1];
    i++;
  }
}

const htmlPath = parsed.html;
const cover = parsed.cover;
const title = parsed.title;
const theme = parsed.theme || "default";
const color = parsed.color;
const author = parsed.author;
const src = parsed.src;

if (!htmlPath || !cover) {
  console.error("Error: --html and --cover are required");
  process.exit(1);
}

// 构建 wechat-api.ts 参数
const wechatArgs = [
  "run", WECHAT_API,
  htmlPath,
  "--title", title || "",
  "--theme", theme,
  "--type", "newspic",
  "--cover", cover,
];

if (color) wechatArgs.push("--color", color);
if (author) wechatArgs.push("--author", author);
// wechat-api.ts 需要支持 --source-url（见 Task #12 修复）
if (src) wechatArgs.push("--source-url", src);

const result = spawnSync("bun", wechatArgs, { stdio: "inherit" });
process.exit(result.status ?? 1);
#!/usr/bin/env bun
/**
 * Step 8: HTML 转换（微信轨专用）
 *
 * 用法:
 *   bun run step8-html-convert.mjs <date-slug> [--theme default] [--color blue]
 *
 * 行为:
 *   1. 从 article-local.md（本地 imgs/ 路径）生成 article-wechat.html
 *   2. 运行 validate-pipeline.sh html 验证
 *   3. 写状态: step 8 done
 *
 * 微信轨全程使用本地文件：wechat-api.ts 的 loadUploadAsset() 直接
 * fs.readFileSync 读取 imgs/ 下的图片，无需 CDN URL。
 * 博客轨不消费 HTML——Astro Starlight 直接消费 article.md（Markdown）。
 */

import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { writeStep, writeRunning } from "./state-lib.mjs";
import { postsRoot, repoRoot } from "./path-resolver.mjs";

const args = process.argv.slice(2);
let slug = null, theme = "default", color = "blue";
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--theme" && args[i + 1]) { theme = args[++i]; }
  else if (args[i] === "--color" && args[i + 1]) { color = args[++i]; }
  else if (!slug) { slug = args[i]; }
}
if (!slug) { process.stderr.write("usage: step8-html-convert.mjs <date-slug> [--theme T] [--color C]\n"); process.exit(1); }

writeRunning(slug, "8");

const base = resolve(postsRoot(), slug);
const localMd = resolve(base, "article-local.md");
if (!existsSync(localMd)) { process.stderr.write("step8: article-local.md missing\n"); process.exit(2); }

// 查找 baoyu-markdown-to-html 脚本
function findHtmlScript() {
  const candidates = [
    resolve(repoRoot(), ".agents/skills/baoyu-markdown-to-html"),
    resolve(process.env.HOME ?? "", ".claude/skills/baoyu-markdown-to-html"),
  ];
  for (const d of candidates) {
    const main = resolve(d, "scripts/main.ts");
    if (existsSync(main)) return main;
  }
  return null;
}

const htmlScript = findHtmlScript();
if (!htmlScript) { process.stderr.write("step8: baoyu-markdown-to-html/scripts/main.ts not found\n"); process.exit(2); }

const skillDir = resolve(repoRoot(), ".agents/skills/wechat-article-write");

// 从 article-local.md frontmatter 读取标题
const content = readFileSync(localMd, "utf8");
const fmMatch = content.match(/(^|\n)---\n([\s\S]*?)\n---/);
let title = "";
if (fmMatch) {
  const titleMatch = fmMatch[2].match(/^title:\s*(.+)$/m);
  if (titleMatch) title = titleMatch[1].trim();
}

process.stdout.write(`step8: converting ${localMd} to article-wechat.html...\n`);
const r = spawnSync("bun", [
  "run", htmlScript,
  localMd,
  "--theme", theme,
  "--title", title,
], { stdio: "inherit", encoding: "utf8", cwd: repoRoot() });

if (r.status !== 0) { process.stderr.write("step8: HTML conversion failed\n"); process.exit(2); }

// baoyu-markdown-to-html 输出固定为 {input}.html，即 article-local.html
// 重命名为 article-wechat.html（微信轨专用产物）
const localHtml = resolve(base, "article-local.html");
const wechatHtml = resolve(base, "article-wechat.html");
if (existsSync(localHtml)) {
  renameSync(localHtml, wechatHtml);
} else if (!existsSync(wechatHtml)) {
  process.stderr.write("step8: HTML output not found (expected article-local.html or article-wechat.html)\n");
  process.exit(2);
}

// 微信 WebView 不加载自定义字体，font-family 声明全部回退到系统默认，没有实际意义。
// 反而会引发双引号嵌套（style="font-family: "X""）被微信 API 解析器截断的问题。
// 处理：先将 font-family 值中的内层引号替换为单引号（消除 style 属性值截断），再删除整个声明。
let html = readFileSync(wechatHtml, "utf8");
// 第一步：消除 font-family 值中与外层 style="..." 冲突的引号
html = html.replace(/font-family:\s*((?:&quot;|")[^;,]+?(?:&quot;|")(?:\s*,\s*(?:&quot;|")[^;,]+?(?:&quot;|"))*)/g, (_m, quoted) => {
  return `font-family: ${quoted.replace(/&quot;/g, "'").replace(/"/g, "'")}`;
});
// 第二步：删除 font-family 声明（此时值内已无冲突引号，[^;]+ 可安全匹配到分号）
html = html.replace(/font-family:\s*[^;]+;/g, "");
// 清理残留：空 style 属性、连续分号、多余空格、style 值开头空白
html = html.replace(/style="\s*"/g, "");
html = html.replace(/;\s*;(?!\s*important)/g, ";");
html = html.replace(/; {2,}/g, "; ");
html = html.replace(/style=" /g, "style=\"");
writeFileSync(wechatHtml, html);

// 验证
const validate = resolve(skillDir, "scripts/validate-pipeline.sh");
const vr = spawnSync("bash", [validate, slug, "html"], { stdio: "pipe", encoding: "utf8" });
if (vr.status !== 0) {
  process.stderr.write(`step8: validation failed: ${vr.stderr}\n`);
  process.exit(2);
}

writeStep(slug, "8", "done", { theme, color, output: "article-wechat.html" });
process.stdout.write(JSON.stringify({ slug, step: 8, theme, color, output: "article-wechat.html" }) + "\n");
process.exit(0);

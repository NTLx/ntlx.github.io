#!/usr/bin/env bun
/**
 * config-lib.mjs — 集中配置解析（精简版）
 *
 * 从项目级 .baoyu-skills 目录下各 EXTEND.md 读取 baoyu 系列技能配置。
 * 原理：自己的默认值放在这里，脚本只从这里读；EXTEND.md 里的值覆盖默认值。
 * CLI 参数仍可覆盖一切。
 *
 * 设计约束：
 *   - 不修改第三方技能源码或 EXTEND 格式
 *   - 不引入外部 YAML 解析器（配置足够简单，正则即够）
 *   - 每个 getter 有硬编码 fallback，对应原各脚本中的默认值
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { repoRoot } from "./path-resolver.mjs";

const BAOYU_ROOT = resolve(repoRoot(), ".baoyu-skills");

// --- 简单的 frontmatter / key:value 解析 ---

function parseExtend(filePath) {
  if (!existsSync(filePath)) return {};
  const raw = readFileSync(filePath, "utf8");

  // 有 frontmatter 分隔符 → 只取 --- 之间的内容
  if (raw.startsWith("---\n")) {
    const end = raw.indexOf("\n---\n", 5);
    const block = end > 0 ? raw.slice(4, end) : raw.slice(4);
    return parseKeyValue(block);
  }
  // 无分隔符 → 整体解析（baoyu-cover-image 等无 frontmatter）
  return parseKeyValue(raw);
}

function parseKeyValue(text) {
  const out = {};
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf(":");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    // 去除引号
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    // 基本类型转换
    if (val === "true") val = true;
    else if (val === "false") val = false;
    else if (/^\d+$/.test(val)) val = parseInt(val, 10);
    else if (/^\d+\.\d+$/.test(val)) val = parseFloat(val);
    out[key] = val;
  }
  return out;
}

// --- 模块级缓存（每次进程内只读一次）---

let _cache = null;
function loadAll() {
  if (_cache) return _cache;
  _cache = {
    markdownToHtml: parseExtend(resolve(BAOYU_ROOT, "baoyu-markdown-to-html/EXTEND.md")),
    postToWechat:   parseExtend(resolve(BAOYU_ROOT, "baoyu-post-to-wechat/EXTEND.md")),
    coverImage:     parseExtend(resolve(BAOYU_ROOT, "baoyu-cover-image/EXTEND.md")),
    imagine:        parseExtend(resolve(BAOYU_ROOT, "baoyu-image-gen/EXTEND.md")),
    illustrator:    parseExtend(resolve(BAOYU_ROOT, "baoyu-article-illustrator/EXTEND.md")),
  };
  return _cache;
}

// --- 公开 getter ---

/** Step 5: baoyu-markdown-to-html 配置 */
export function getMarkdownToHtmlConfig() {
  const c = loadAll().markdownToHtml;
  return {
    theme:     c.default_theme     ?? "grace",
    color:     c.default_color     ?? "vermilion",
    fontSize:  c.default_font_size ?? "16px",
    cite:      c.default_cite      ?? false,
    keepTitle: c.default_keep_title ?? false,
  };
}

/** Step 6.2: baoyu-post-to-wechat 配置 */
export function getPostToWechatConfig() {
  const c = loadAll().postToWechat;
  return {
    author:        c.default_author         ?? "NTLx",
    theme:         c.default_theme          ?? "default",
    color:         c.default_color          ?? "blue",
    openComment:   c.need_open_comment      ?? 1,
    fansComment:   c.only_fans_can_comment  ?? 1,
  };
}

/** Step 4: baoyu-cover-image 配置 */
export function getCoverImageConfig() {
  const c = loadAll().coverImage;
  return {
    preferredBackend: c.preferred_image_backend ?? "openai",
    quickMode:        c.quick_mode               ?? true,
    language:         c.language                 ?? "zh",
    defaultAspect:    c.default_aspect           ?? "2.35:1",
  };
}

/** Step 4: baoyu-image-gen（图片后端选择）配置 */
export function getImagineConfig() {
  const c = loadAll().imagine;
  return {
    preferredBackend: c.preferred_image_backend ?? "openai",
    defaultModel:     c.default_model           ?? {},
  };
}

/** Step 4: baoyu-article-illustrator 配置 */
export function getArticleIllustratorConfig() {
  const c = loadAll().illustrator;
  return {
    preferredBackend: c.preferred_image_backend ?? "openai",
    preferredStyle:   c.preferred_style         ?? "vector-illustration",
    defaultOutputDir: c.default_output_dir      ?? "imgs-subdir",
  };
}

// 运行配置汇总（一次性获取所有需要的内容，方便一次性解构）
export function getAllConfig() {
  return {
    markdownToHtml: getMarkdownToHtmlConfig(),
    postToWechat:   getPostToWechatConfig(),
    coverImage:     getCoverImageConfig(),
    imagine:        getImagineConfig(),
    illustrator:    getArticleIllustratorConfig(),
  };
}

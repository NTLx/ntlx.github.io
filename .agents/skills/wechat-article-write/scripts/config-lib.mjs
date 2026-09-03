#!/usr/bin/env bun
/**
 * config-lib.mjs — 集中配置解析（精简版）
 *
 * 只读取本技能和发布适配所需的项目配置。
 * 原理：确定性脚本只读取它真正需要的项目配置；开放式能力不在这里路由。
 * CLI 参数仍可覆盖第三方工具本身，但本文章管线不使用它来改写图片 provider。
 *
 * 设计约束：
 *   - 不修改第三方技能源码或 EXTEND 格式
 *   - 不引入外部 YAML 解析器（配置足够简单，正则即够）
 *   - 每个 getter 只为本技能的确定性协议提供配置，不承担开放式 Skill 路由
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { repoRoot } from "./path-resolver.mjs";

// Tests and direct module consumers may run with the skill test directory as
// their CWD. The project-owned configuration must still resolve to this
// skill unless an isolated repository is explicitly supplied.
const PROJECT_SKILL_ROOT = process.env.PIPELINE_REPO_ROOT
  ? resolve(repoRoot(), ".agents/skills/wechat-article-write")
  : resolve(import.meta.dir, "..");

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
  // 无分隔符 → 整体解析（兼容简单的旧配置）
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
    wechatArticleWrite: parseExtend(resolve(PROJECT_SKILL_ROOT, "EXTEND.md")),
  };
  return _cache;
}

// --- 公开 getter ---

/** 唯一作者事实源：缺失配置直接 fail closed。 */
export function getWechatAuthorProfile() {
  const c = loadAll().wechatArticleWrite;
  const name = c.default_author;
  const bio = c.default_author_bio;
  if (typeof name !== "string" || name.trim() === "" || typeof bio !== "string" || bio.trim() === "") {
    throw new Error("wechat-article-write author profile is incomplete; configure default_author and default_author_bio in EXTEND.md");
  }
  const cleanName = name.trim();
  const cleanBio = bio.trim();
  return {
    name: cleanName,
    bio: cleanBio,
    signature: `我是 ${cleanName}，${cleanBio}。`,
  };
}

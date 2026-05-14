#!/usr/bin/env bun
/**
 * 安全地写回 / 删除 markdown 文件 frontmatter 字段。
 * 不会破坏已有内容，保留原 key 顺序，未知 key 追加在末尾。
 *
 * 用法:
 *   bun run set-frontmatter.mjs <file> set    <key> <value>
 *   bun run set-frontmatter.mjs <file> remove <key>
 *   bun run set-frontmatter.mjs <file> get    <key>      # stdout 输出值（不存在则空）
 *
 * 行为:
 * - 仅识别文件开头的 `---\n...\n---\n` block
 * - value 始终按 YAML scalar 处理；含特殊字符（: # ' " 等）时自动加双引号
 * - 不依赖第三方 yaml 解析器；专为本管线 frontmatter 这种扁平结构服务
 * 退出码: 0 成功；1 参数错误；2 文件不存在或缺少 frontmatter
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";

function loadDocument(path) {
  if (!existsSync(path)) {
    process.stderr.write(`set-frontmatter.mjs: file not found: ${path}\n`);
    process.exit(2);
  }
  const raw = readFileSync(path, "utf8");
  if (!raw.startsWith("---\n")) {
    return { raw, fmLines: [], body: raw, hasFm: false };
  }
  const end = raw.indexOf("\n---\n", 4);
  if (end === -1) {
    process.stderr.write(`set-frontmatter.mjs: unterminated frontmatter in ${path}\n`);
    process.exit(2);
  }
  const fmBlock = raw.slice(4, end);
  const body = raw.slice(end + 5);
  return { raw, fmLines: fmBlock.split("\n"), body, hasFm: true };
}

function findKeyIndex(lines, key) {
  const re = new RegExp(`^${escapeRegex(key)}\\s*:`);
  return lines.findIndex((line) => re.test(line));
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function quoteIfNeeded(value) {
  if (value === "") return '""';
  // 数组字面量 [a,b]、对象字面量 {a:b} 直接透传，由调用方保证合法
  if (/^\s*[\[{]/.test(value)) return value;
  // 纯数字 / 布尔 / null / 日期 不加引号
  if (/^-?\d+(\.\d+)?$/.test(value)) return value;
  if (/^(true|false|null|~)$/i.test(value)) return value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  // 含 YAML 特殊字符则加双引号
  if (/[:#'"\\\n]/.test(value)) {
    return '"' + value.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
  }
  return value;
}

function getValue(line) {
  const i = line.indexOf(":");
  if (i < 0) return "";
  let v = line.slice(i + 1).trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  return v;
}

function writeBack(path, fmLines, body) {
  const fm = "---\n" + fmLines.join("\n") + "\n---\n";
  writeFileSync(path, fm + body);
}

const [, , file, op, key, value] = process.argv;
if (!file || !op || !key) {
  process.stderr.write("usage: set-frontmatter.mjs <file> <set|remove|get> <key> [value]\n");
  process.exit(1);
}

const doc = loadDocument(file);
if (!doc.hasFm && op !== "set") {
  process.stderr.write(`set-frontmatter.mjs: ${file} has no frontmatter\n`);
  process.exit(2);
}

const lines = doc.fmLines;
const idx = findKeyIndex(lines, key);

if (op === "get") {
  process.stdout.write(idx >= 0 ? getValue(lines[idx]) + "\n" : "\n");
  process.exit(0);
}

if (op === "remove") {
  if (idx >= 0) {
    lines.splice(idx, 1);
    writeBack(file, lines, doc.body);
  }
  process.exit(0);
}

if (op === "set") {
  if (value === undefined) {
    process.stderr.write("set-frontmatter.mjs: set requires <value>\n");
    process.exit(1);
  }
  const lineText = `${key}: ${quoteIfNeeded(value)}`;
  if (!doc.hasFm) {
    writeBack(file, [lineText], doc.raw);
  } else if (idx >= 0) {
    lines[idx] = lineText;
    writeBack(file, lines, doc.body);
  } else {
    lines.push(lineText);
    writeBack(file, lines, doc.body);
  }
  process.exit(0);
}

process.stderr.write(`set-frontmatter.mjs: unknown op "${op}"\n`);
process.exit(1);

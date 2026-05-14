#!/usr/bin/env bun
/**
 * 基于关键词命中给文章推荐分类。
 *
 * 用法:
 *   bun run suggest-category.mjs <draft.md>
 * 输出（stdout）:
 *   {"recommended":"ai-coding","confidence":0.78,"alternative":"ai-agents","scores":{...}}
 * 退出码:
 *   0 成功；1 参数错误；2 文件不存在
 *
 * 关键词命中按 (1) frontmatter title/summary、(2) 二级标题、(3) 全文 三档加权。
 * 规则集与方案 Task 2.0 一致；可按需在 RULES 内扩展。
 */

import { existsSync, readFileSync } from "node:fs";

const RULES = {
  "ai-coding": [
    "agent", "coding", "cli", "vibe", "codex", "cursor", "copilot",
    "claude code", "claude-code", "qoder", "ide", "auto-complete", "tab",
    "代码生成", "辅助编程",
  ],
  "ai-agents": [
    "agent harness", "lifecycle", "mcp", "skill", "orchestrat", "multi-agent",
    "subagent", "tool use", "agent loop", "agent 框架", "工作流", "harness",
  ],
  "ai-industry": [
    "acquisition", "融资", "layoff", "裁员", "market", "openai", "anthropic",
    "投资", "商业", "估值", "营收", "ipo", "并购", "公司", "战略", "市场",
  ],
  "ai-models": [
    "model", "llm", "qwen", "deepseek", "gemini", "训练", "pretraining",
    "benchmark", "post-training", "rlhf", "蒸馏", "推理", "moe", "fine-tune",
    "上下文窗口", "tokenizer",
  ],
  security: [
    "security", "cve", "漏洞", "审计", "攻击", "firewall", "sandbox",
    "隔离", "supply chain", "auth", "rce", "提权", "exploit",
  ],
  engineering: [
    "pipeline", "infra", "postgres", "kafka", "lock", "性能", "架构",
    "database", "分布式", "高并发", "k8s", "kubernetes", "ci/cd",
    "可观测", "限流", "缓存", "分库分表",
  ],
};

const WEIGHTS = { title: 5, heading: 2, body: 1 };

function loadDoc(p) {
  if (!existsSync(p)) {
    process.stderr.write(`suggest-category.mjs: file not found: ${p}\n`);
    process.exit(2);
  }
  return readFileSync(p, "utf8");
}

function splitDoc(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return { fm: "", body: raw };
  return { fm: m[1], body: m[2] };
}

function extractFmField(fm, key) {
  const re = new RegExp(`^${key}\\s*:\\s*(.*)$`, "m");
  const m = fm.match(re);
  if (!m) return "";
  return m[1].trim().replace(/^["']|["']$/g, "");
}

function score(text, weight, scores) {
  const lower = text.toLowerCase();
  for (const [cat, keywords] of Object.entries(RULES)) {
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) {
        scores[cat] = (scores[cat] ?? 0) + weight;
      }
    }
  }
}

function rank(scores) {
  const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return { recommended: "ai-industry", confidence: 0, alternative: null };
  const top = entries[0];
  const total = entries.reduce((s, [, v]) => s + v, 0) || 1;
  const confidence = +(top[1] / total).toFixed(2);
  return {
    recommended: top[0],
    confidence,
    alternative: entries[1]?.[0] ?? null,
  };
}

const [, , file] = process.argv;
if (!file) {
  process.stderr.write("usage: suggest-category.mjs <draft.md>\n");
  process.exit(1);
}

const raw = loadDoc(file);
const { fm, body } = splitDoc(raw);
const title = extractFmField(fm, "title");
const summary = extractFmField(fm, "summary");
const headings = (body.match(/^##\s+.+$/gm) ?? []).join("\n");

const scores = {};
score(title + " " + summary, WEIGHTS.title, scores);
score(headings, WEIGHTS.heading, scores);
score(body, WEIGHTS.body, scores);

const result = { ...rank(scores), scores };
process.stdout.write(JSON.stringify(result) + "\n");

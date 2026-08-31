#!/usr/bin/env bun
/**
 * Best-effort audit trace for Agent-controlled adaptive stages.
 *
 * This is an observation aid, not workflow state and not a Skill router. It
 * accepts only bounded, operator-facing decision fields and appends one JSONL
 * record under the existing ignored posts/<slug>/ runtime directory.
 */

import { appendFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { postsRoot } from "./path-resolver.mjs";

export const TRACE_FILENAME = "orchestration-trace.jsonl";
const MAX_TEXT_LENGTH = 360;
const MAX_LIST_ITEMS = 8;
const MAX_ITEM_LENGTH = 120;

const SENSITIVE_VALUE_RE = /\b(api[\s_-]?key|access[\s_-]?token|refresh[\s_-]?token|secret|password|cookie|authorization)\b\s*[:=]\s*[^\s,;]+/gi;

function redact(value, maxLength = MAX_TEXT_LENGTH) {
  return String(value)
    .replace(SENSITIVE_VALUE_RE, "$1=[redacted]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function textOrUndefined(value, maxLength = MAX_TEXT_LENGTH) {
  if (value === undefined || value === null) return undefined;
  const text = redact(value, maxLength);
  return text || undefined;
}

function listOrEmpty(value) {
  const values = Array.isArray(value) ? value : (value ? String(value).split(",") : []);
  return [...new Set(values
    .map((item) => textOrUndefined(item, MAX_ITEM_LENGTH))
    .filter(Boolean))]
    .slice(0, MAX_LIST_ITEMS);
}

/** Build the allow-listed, bounded record written to the trace. */
export function buildTraceRecord(slug, input = {}, timestamp = new Date().toISOString()) {
  return {
    timestamp,
    slug: textOrUndefined(slug, MAX_ITEM_LENGTH),
    stage: textOrUndefined(input.stage, MAX_ITEM_LENGTH),
    gap: textOrUndefined(input.gap),
    candidates: listOrEmpty(input.candidates),
    selected: listOrEmpty(input.selected),
    reason: textOrUndefined(input.reason),
    gate: textOrUndefined(input.gate, MAX_ITEM_LENGTH),
    result: textOrUndefined(input.result, MAX_ITEM_LENGTH),
  };
}

/**
 * Append one trace event. Any filesystem failure is returned to the caller;
 * it is deliberately never thrown so an observability problem cannot fail a
 * stage whose artifact and Gate are otherwise valid.
 */
export function appendOrchestrationTrace(slug, input = {}, { root = postsRoot() } = {}) {
  const record = buildTraceRecord(slug, input);
  const dir = resolve(root, slug);
  const path = resolve(dir, TRACE_FILENAME);

  try {
    mkdirSync(dir, { recursive: true });
    appendFileSync(path, JSON.stringify(record) + "\n");
    return { ok: true, path, record };
  } catch {
    return { ok: false, path, record };
  }
}

function parseArgs(argv) {
  const input = {};
  const fields = new Set(["stage", "gap", "candidates", "selected", "reason", "gate", "result"]);

  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    if (!flag.startsWith("--") || !fields.has(flag.slice(2))) {
      throw new Error(`unknown trace option: ${flag}`);
    }
    const key = flag.slice(2);
    const value = argv[i + 1];
    if (value === undefined || value.startsWith("--")) {
      throw new Error(`missing value for ${flag}`);
    }
    input[key] = value;
    i += 1;
  }

  for (const key of ["stage", "gap", "gate", "result"]) {
    if (!textOrUndefined(input[key])) throw new Error(`--${key} is required`);
  }
  return input;
}

function main() {
  const [slug, ...argv] = process.argv.slice(2);
  if (!slug) {
    process.stderr.write("usage: orchestration-trace.mjs <date-slug> --stage <name> --gap <text> --gate <name> --result <result> [--candidates <a,b>] [--selected <a,b>] [--reason <text>]\n");
    process.exit(2);
  }

  try {
    const result = appendOrchestrationTrace(slug, parseArgs(argv));
    if (!result.ok) {
      process.stderr.write("orchestration-trace: WARN - trace unavailable; workflow continues\n");
      return;
    }
    process.stdout.write(JSON.stringify({ path: result.path, written: true }) + "\n");
  } catch (error) {
    process.stderr.write(`orchestration-trace: FAIL - ${error.message}\n`);
    process.exit(2);
  }
}

if (import.meta.main) main();

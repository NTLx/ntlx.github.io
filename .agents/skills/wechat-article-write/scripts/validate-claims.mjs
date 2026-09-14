#!/usr/bin/env bun
/**
 * validate-claims.mjs — draft.md 可证伪 claim 与 brief 事实账本的覆盖 Gate
 *
 * 本 Gate 证明**覆盖**，不证明**真假**：账本里伪造的来源片段同样会通过，
 * claim 与一手来源的对账始终是 Main 的责任。这里只保证一件事——draft 里每个
 * 可证伪主张在账本里都有对应行，于是「没有来源」会表现为**可见的缺席**，
 * 而不是一句读起来很顺的陈述。
 *
 * 只读：不写任何文件，不改 .pipeline-state.json。因此它可以在 Step 3 反复重跑，
 * 不会把 last_complete_step 推回去。
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { postDir } from "./path-resolver.mjs";
import { extractClaims, extractLedgerRows, uncoveredClaims } from "./claim-ledger-lib.mjs";

const args = process.argv.slice(2);
const slug = args.find((arg) => !arg.startsWith("--"));
const json = args.includes("--json");
const all = args.includes("--all");

if (!slug) {
  process.stderr.write("usage: validate-claims.mjs <date-slug> [--json] [--all]\n");
  process.exit(1);
}

const dir = postDir(slug);
const draftPath = resolve(dir, "draft.md");
const briefPath = resolve(dir, "understanding-brief.md");

function fail(message, extra = {}) {
  if (json) process.stdout.write(JSON.stringify({ slug, ok: false, errors: [message], ...extra }) + "\n");
  else process.stderr.write(`validate-claims: FAIL - ${message}\n`);
  process.exit(2);
}

if (!existsSync(draftPath)) fail(`draft.md missing: ${draftPath}`);
if (!existsSync(briefPath)) fail(`understanding-brief.md missing: ${briefPath}`);

const draft = readFileSync(draftPath, "utf8");
const ledger = extractLedgerRows(readFileSync(briefPath, "utf8"));

if (!ledger.found) fail("understanding-brief.md has no 允许援引的事实 ledger section");
if (ledger.malformed.length > 0) {
  fail(`ledger row missing source span / derived / rhetoric: ${ledger.malformed[0]}`);
}

const uncovered = uncoveredClaims(draft, ledger.rows);
const byClass = {};
for (const { cls } of uncovered) byClass[cls] = (byClass[cls] ?? 0) + 1;

// 输出纪律：默认只给分类计数与最多 5 条样例，不把整篇文章回灌进上下文。
const samples = (all ? uncovered : uncovered.slice(0, 5)).map((claim) => `${claim.cls}: ${claim.text}`);

if (uncovered.length > 0) {
  const summary = Object.entries(byClass).map(([cls, count]) => `${cls} ${count}`).join(", ");
  fail(`${uncovered.length} claim(s) not covered by the ledger (${summary})`, {
    uncovered: samples,
    uncovered_count: uncovered.length,
    by_class: byClass,
    ledger_rows: ledger.rows.length,
  });
}

const result = {
  slug,
  ok: true,
  ledger_rows: ledger.rows.length,
  scanned_claims: extractClaims(draft).length,
};
if (json) process.stdout.write(JSON.stringify(result) + "\n");
else process.stdout.write(`validate-claims: OK (${ledger.rows.length} ledger rows)\n`);
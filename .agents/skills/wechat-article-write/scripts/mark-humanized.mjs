#!/usr/bin/env bun
/**
 * Record that the current draft was processed by humanizer-zh.
 *
 * This command deliberately does not invoke a Skill, edit the draft, or mark
 * Step 3 complete. It only performs a read-only deterministic-normalization
 * check before recording the receipt. The Agent must perform and review
 * humanization first.
 */

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { loadState, saveState } from "./state-lib.mjs";
import { draftPathFor, humanizerSkillPath, sha256File, HUMANIZER_SKILL } from "./humanizer-lib.mjs";
import { repoRoot } from "./path-resolver.mjs";

const args = process.argv.slice(2);
const slug = args.find((arg) => !arg.startsWith("--"));
if (!slug || args.some((arg) => arg.startsWith("--"))) {
  process.stderr.write("usage: mark-humanized.mjs <date-slug>\n");
  process.exit(1);
}

function fail(message) {
  process.stderr.write(`mark-humanized: FAIL - ${message}\n`);
  process.exit(2);
}

const state = loadState(slug);
if (!state || state.last_complete_step < 2 || state.failed_step?.step === 2) {
  fail("Step 2 has not passed; run step2-write.mjs before marking humanization");
}

const draftPath = draftPathFor(slug);
const skillPath = humanizerSkillPath();
if (!existsSync(draftPath)) fail(`draft.md missing: ${draftPath}`);
if (!existsSync(skillPath)) fail(`humanizer-zh/SKILL.md missing: ${skillPath}`);

// Receipt creation is the draft-freeze boundary. Ensure every deterministic
// operation that could rewrite draft.md has completed before recording it.
const normalizeScript = resolve(repoRoot(), ".agents/skills/wechat-article-write/scripts/pre-humanizer-normalize.mjs");
if (!existsSync(normalizeScript)) fail(`pre-humanizer-normalize.mjs missing: ${normalizeScript}`);
const normalization = spawnSync("bun", ["run", normalizeScript, slug, "--check"], {
  cwd: repoRoot(),
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
});
if (normalization.status !== 0) {
  const details = normalization.stderr?.trim() || normalization.stdout?.trim() || `exit ${normalization.status}`;
  fail(`deterministic normalization is not complete; ${details}`);
}

state.humanizer = {
  status: "applied",
  skill: HUMANIZER_SKILL,
  draft_sha256: sha256File(draftPath),
  skill_sha256: sha256File(skillPath),
  applied_at: new Date().toISOString(),
};
saveState(slug, state);

process.stdout.write(JSON.stringify({ slug, humanizer: state.humanizer }) + "\n");

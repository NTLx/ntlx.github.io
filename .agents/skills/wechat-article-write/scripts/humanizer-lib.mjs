/**
 * Mandatory humanization receipt helpers.
 *
 * This module proves freshness only. It does not invoke humanizer-zh, judge
 * writing quality, or edit draft.md.
 */

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadState } from "./state-lib.mjs";
import { postsRoot, repoRoot } from "./path-resolver.mjs";

export const HUMANIZER_SKILL = "humanizer-zh";

export function humanizerSkillPath() {
  return resolve(repoRoot(), ".agents/skills", HUMANIZER_SKILL, "SKILL.md");
}

export function draftPathFor(slug) {
  return resolve(postsRoot(), slug, "draft.md");
}

export function sha256File(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

export function readHumanizerReceipt(state) {
  return state?.humanizer ?? null;
}

/**
 * Validate the receipt and both current hashes. The returned diagnostics are
 * deliberately explicit so every Gate can fail closed with the same rules.
 */
export function validateHumanizerReceipt({ state, draftPath, skillPath }) {
  const errors = [];
  const receipt = readHumanizerReceipt(state);

  if (receipt === "skip") {
    errors.push("legacy humanizer skip is no longer supported; run humanizer-zh and then mark-humanized.mjs");
    return { ok: false, errors, receipt };
  }
  if (!receipt || typeof receipt !== "object" || Array.isArray(receipt)) {
    errors.push("draft.md has not been processed by mandatory humanizer-zh");
    return { ok: false, errors, receipt };
  }
  if (receipt.status !== "applied" || receipt.skill !== HUMANIZER_SKILL) {
    errors.push("draft.md has not been processed by mandatory humanizer-zh");
  }
  if (!existsSync(draftPath)) {
    errors.push(`draft.md missing: ${draftPath}`);
  } else if (receipt.draft_sha256 && sha256File(draftPath) !== receipt.draft_sha256) {
    errors.push("draft.md changed after humanizer-zh; rerun humanizer and mark-humanized");
  } else if (!receipt.draft_sha256) {
    errors.push("humanizer receipt is missing draft_sha256; rerun humanizer and mark-humanized");
  }
  if (!existsSync(skillPath)) {
    errors.push("humanizer-zh/SKILL.md is missing; install the mandatory humanizer-zh Skill");
  } else if (receipt.skill_sha256 && sha256File(skillPath) !== receipt.skill_sha256) {
    errors.push("humanizer-zh/SKILL.md changed after receipt; rerun humanizer and mark-humanized");
  } else if (!receipt.skill_sha256) {
    errors.push("humanizer receipt is missing skill_sha256; rerun humanizer and mark-humanized");
  }

  return { ok: errors.length === 0, errors, receipt };
}

export function assertCurrentDraftHumanized(slug, options = {}) {
  const state = options.state ?? loadState(slug);
  const draftPath = options.draftPath ?? draftPathFor(slug);
  const skillPath = options.skillPath ?? humanizerSkillPath();
  const result = validateHumanizerReceipt({ state, draftPath, skillPath });
  if (!result.ok) throw new Error(result.errors.join("; "));
  return { ...result, state, draftPath, skillPath };
}

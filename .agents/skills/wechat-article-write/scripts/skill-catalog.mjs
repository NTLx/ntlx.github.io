#!/usr/bin/env bun
/**
 * skill-catalog.mjs — runtime Skill capability catalog
 *
 * Reads only the frontmatter of installed project Skills.  Full SKILL.md
 * files are deliberately left for progressive disclosure after the Agent has
 * selected a small candidate set.
 *
 * Usage:
 *   bun run skill-catalog.mjs
 *   bun run skill-catalog.mjs --json
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const SELF_NAME = "wechat-article-write";
const DEFAULT_SKILLS_ROOT = resolve(import.meta.dirname, "../..");

function stripInlineComment(value) {
  return value.replace(/\s+#.*$/, "").trim();
}

function parseScalar(value) {
  const cleaned = stripInlineComment(value);
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    return cleaned.slice(1, -1);
  }
  if (cleaned === "true") return true;
  if (cleaned === "false") return false;
  if (cleaned === "null") return null;
  return cleaned;
}

/** Parse the small subset of YAML needed from Skill frontmatter. */
export function parseSkillFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return {};

  const fields = {};
  let metadata = null;
  let inMetadata = false;
  let metadataIndent = 0;
  let block = null;

  for (const raw of match[1].split(/\r?\n/)) {
    const indent = raw.match(/^\s*/)?.[0].length ?? 0;
    const trimmed = raw.trim();

    if (block) {
      if (trimmed === "" || indent > block.indent) {
        block.lines.push(trimmed === "" ? "" : raw.slice(block.indent + 2));
        continue;
      }
      fields[block.key] = block.marker === "|"
        ? block.lines.join("\n").trim()
        : block.lines.join(" ").replace(/\s+/g, " ").trim();
      block = null;
    }

    if (!trimmed || trimmed.startsWith("#")) continue;

    const item = raw.match(/^(\s*)([A-Za-z_][A-Za-z0-9_-]*):(?:\s*(.*))?$/);
    if (!item) continue;
    const keyIndent = item[1].length;
    const key = item[2];
    const rawValue = (item[3] ?? "").trim();

    if (keyIndent === 0 && key === "metadata" && rawValue === "") {
      metadata = {};
      fields.metadata = metadata;
      inMetadata = true;
      metadataIndent = keyIndent;
      continue;
    }

    if (inMetadata && keyIndent <= metadataIndent) inMetadata = false;
    if (inMetadata && metadata) {
      metadata[key] = parseScalar(rawValue);
      continue;
    }

    if (/^(?:>|>-|>\+|\|-|\|\+)$/.test(rawValue)) {
      block = { key, indent: keyIndent, marker: rawValue.startsWith("|") ? "|" : ">", lines: [] };
      continue;
    }
    fields[key] = parseScalar(rawValue);
  }

  if (block) {
    fields[block.key] = block.marker === "|"
      ? block.lines.join("\n").trim()
      : block.lines.join(" ").replace(/\s+/g, " ").trim();
  }
  return fields;
}

function normalizeEntry(dirName, text) {
  const frontmatter = parseSkillFrontmatter(text);
  const entry = {
    name: String(frontmatter.name || dirName),
    description: String(frontmatter.description || "").replace(/\s+/g, " ").trim(),
  };

  const version = frontmatter.version ?? frontmatter.metadata?.version;
  if (version !== undefined && version !== null && String(version).length > 0) {
    entry.version = String(version);
  }

  const userInvocable = frontmatter.user_invocable ?? frontmatter.metadata?.user_invocable;
  if (userInvocable !== undefined && userInvocable !== null && String(userInvocable).length > 0) {
    entry.user_invocable = userInvocable;
  }
  return entry;
}

export function buildSkillCatalog(skillsRoot = DEFAULT_SKILLS_ROOT) {
  const root = typeof skillsRoot === "string" ? skillsRoot : skillsRoot.skillsRoot;
  if (!existsSync(root)) return [];

  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== SELF_NAME)
    .map((entry) => ({ name: entry.name, path: resolve(root, entry.name, "SKILL.md") }))
    .filter(({ path }) => existsSync(path))
    .map(({ name, path }) => normalizeEntry(name, readFileSync(path, "utf8")))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function formatCatalog(catalog) {
  const lines = [`Skill catalog (${catalog.length}; ${SELF_NAME} excluded):`];
  for (const skill of catalog) {
    const details = [];
    if (skill.version) details.push(`v${skill.version}`);
    if (skill.user_invocable === true || skill.user_invocable === "true") details.push("user-invocable");
    const suffix = details.length > 0 ? ` [${details.join(", ")}]` : "";
    lines.push(`- ${skill.name}${suffix} — ${skill.description || "(description unavailable)"}`);
  }
  return lines.join("\n") + "\n";
}

if (import.meta.main) {
  const catalog = buildSkillCatalog(process.env.PIPELINE_SKILLS_ROOT || DEFAULT_SKILLS_ROOT);
  if (process.argv.includes("--json")) {
    process.stdout.write(JSON.stringify(catalog, null, 2) + "\n");
  } else {
    process.stdout.write(formatCatalog(catalog));
  }
}

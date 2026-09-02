#!/usr/bin/env bun
/**
 * Normalize deterministic image/cover state before the humanizer receipt is
 * created. Once the receipt exists, draft.md is frozen until Step 5 ends.
 *
 * Usage:
 *   bun run pre-humanizer-normalize.mjs <date-slug>
 *   bun run pre-humanizer-normalize.mjs <date-slug> --check
 *
 * --check is used by mark-humanized.mjs. It is read-only and fails when the
 * normalizer would still rename an image, move a nested cover, or update the
 * coverImage frontmatter field.
 */

import { existsSync, mkdirSync, readFileSync, renameSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { postDir, repoRoot } from "./path-resolver.mjs";
import { readFmValue } from "./frontmatter-lib.mjs";

const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const positional = args.filter((arg) => !arg.startsWith("--"));

if (args.some((arg) => arg.startsWith("--") && arg !== "--check") || positional.length !== 1) {
  process.stderr.write("usage: pre-humanizer-normalize.mjs <date-slug> [--check]\n");
  process.exit(1);
}

const slug = positional[0];
const base = postDir(slug);
const draftPath = resolve(base, "draft.md");
const imgsDir = resolve(base, "imgs");
const normalizeScript = resolve(repoRoot(), ".agents/skills/wechat-article-write/scripts/normalize-image-formats.mjs");
const setFmScript = resolve(repoRoot(), ".agents/skills/wechat-article-write/scripts/set-frontmatter.mjs");

function fail(message) {
  process.stderr.write(`pre-humanizer-normalize: FAIL - ${message}\n`);
  process.exit(2);
}

if (!existsSync(base)) fail(`post directory missing: ${base}`);
if (!existsSync(draftPath)) fail(`draft.md missing: ${draftPath}`);
if (!existsSync(normalizeScript)) fail(`normalize-image-formats.mjs missing: ${normalizeScript}`);

function nestedCoverNames() {
  if (!existsSync(imgsDir)) return [];
  return ["cover.png", "00-cover.png", "cover.jpg", "00-cover.jpg"]
    .filter((name) => existsSync(resolve(imgsDir, name)));
}

function rootCoverNames() {
  return ["cover.png", "cover.jpg"].filter((name) => existsSync(resolve(base, name)));
}

function assertSingleRootCover() {
  const roots = rootCoverNames();
  if (roots.length > 1) {
    fail(`multiple root cover images: ${roots.join(", ")}; keep exactly one`);
  }
  return roots;
}

function rootCoverExt() {
  const roots = rootCoverNames();
  if (roots.length !== 1) return null;
  if (roots[0] === "cover.jpg") return "jpg";
  if (roots[0] === "cover.png") return "png";
  return null;
}

function runFormatNormalization(dryRun) {
  const normalizeArgs = ["run", normalizeScript, base];
  if (dryRun) normalizeArgs.push("--dry-run");
  const result = spawnSync("bun", normalizeArgs, {
    cwd: repoRoot(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.error || result.status !== 0) {
    const details = result.error?.message || result.stderr?.trim() || `exit ${result.status}`;
    fail(`normalize-image-formats failed: ${details}`);
  }
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  return `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
}

function moveNestedCovers() {
  const existingRootCovers = assertSingleRootCover();
  const nested = nestedCoverNames();
  if (nested.length === 0) return [];

  const moved = [];
  const existingRootCover = existingRootCovers[0] ?? null;
  if (existingRootCover) {
    const discardDir = resolve(imgsDir, "_discard");
    mkdirSync(discardDir, { recursive: true });
    for (const name of nested) {
      renameSync(resolve(imgsDir, name), resolve(discardDir, name));
      moved.push(`imgs/${name} -> imgs/_discard/${name}`);
    }
    return moved;
  }

  // Prefer the canonical cover name, then JPEG before PNG when both are
  // present. The format normalizer below settles the final extension.
  const selected = nested.find((name) => name === "cover.jpg")
    ?? nested.find((name) => name === "cover.png")
    ?? nested[0];
  const destination = resolve(base, "cover" + selected.slice(selected.lastIndexOf(".")));
  renameSync(resolve(imgsDir, selected), destination);
  moved.push(`imgs/${selected} -> ${destination}`);

  // Do not silently leave another cover candidate in imgs/.
  const remaining = nestedCoverNames();
  if (remaining.length > 0) {
    const discardDir = resolve(imgsDir, "_discard");
    mkdirSync(discardDir, { recursive: true });
    for (const name of remaining) {
      renameSync(resolve(imgsDir, name), resolve(discardDir, name));
      moved.push(`imgs/${name} -> imgs/_discard/${name}`);
    }
  }
  return moved;
}

if (checkOnly) {
  assertSingleRootCover();
  const nested = nestedCoverNames();
  const normalizeOutput = runFormatNormalization(true);
  const issues = [];
  if (nested.length > 0) issues.push(`nested cover requires relocation: ${nested.join(", ")}`);
  if (/renamed(?: cover)?:|target already exists, skipping/u.test(normalizeOutput)) {
    issues.push("image MIME/extension normalization is pending");
  }

  const draft = readFileSync(draftPath, "utf8");
  const ext = rootCoverExt();
  if (ext && readFmValue(draft, "coverImage") !== `cover.${ext}`) {
    issues.push(`coverImage must be cover.${ext}`);
  }

  if (issues.length > 0) {
    fail(`${issues.join("; ")}. Run pre-humanizer-normalize.mjs before humanizer-zh.`);
  }
  process.stdout.write("pre-humanizer-normalize: clean\n");
  process.exit(0);
}

const moved = moveNestedCovers();
for (const item of moved) process.stdout.write(`pre-humanizer-normalize: moved ${item}\n`);
runFormatNormalization(false);
assertSingleRootCover();

const ext = rootCoverExt();
if (ext) {
  const draft = readFileSync(draftPath, "utf8");
  if (readFmValue(draft, "coverImage") !== `cover.${ext}`) {
    const result = spawnSync("bun", ["run", setFmScript, draftPath, "set", "coverImage", `cover.${ext}`], {
      cwd: repoRoot(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    if (result.error || result.status !== 0) {
      const details = result.error?.message || result.stderr?.trim() || `exit ${result.status}`;
      fail(`coverImage normalization failed: ${details}`);
    }
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    process.stdout.write(`pre-humanizer-normalize: coverImage -> cover.${ext}\n`);
  }
}

process.stdout.write("pre-humanizer-normalize: PASS; draft is ready for humanizer-zh\n");

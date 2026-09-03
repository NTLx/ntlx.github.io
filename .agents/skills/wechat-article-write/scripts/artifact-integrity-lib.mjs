import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const MANIFEST_NAME = ".step5-artifacts.json";
const INPUT_FILES = Object.freeze([
  ["draft_sha256", "draft.md"],
  ["image_plan_sha256", "image-plan.json"],
  ["article_sha256", "article.md"],
  ["wechat_source_sha256", "article-wechat-source.md"],
]);

export function sha256File(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function manifestPath(postDir) {
  return resolve(postDir, MANIFEST_NAME);
}

function currentHashes(postDir, includeHtml = false) {
  const hashes = {};
  for (const [field, filename] of INPUT_FILES) {
    const path = resolve(postDir, filename);
    if (!existsSync(path)) throw new Error(`${filename} missing; cannot establish Step 5 artifact integrity`);
    hashes[field] = sha256File(path);
  }
  if (includeHtml) {
    const path = resolve(postDir, "article-wechat.html");
    if (!existsSync(path)) throw new Error("article-wechat.html missing; cannot establish Step 5 artifact integrity");
    hashes.wechat_html_sha256 = sha256File(path);
  }
  return hashes;
}

function readManifest(postDir) {
  const path = manifestPath(postDir);
  if (!existsSync(path)) throw new Error(`${MANIFEST_NAME} missing; rerun Step 5 prepare`);
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`${MANIFEST_NAME} invalid JSON: ${error.message}`);
  }
}

function compareManifest(postDir, manifest, { finalized = false } = {}) {
  const errors = [];
  const current = currentHashes(postDir, finalized);
  if (finalized && manifest.phase !== "finalized") errors.push("manifest.phase must be finalized");
  if (!finalized && !["prepared", "finalized"].includes(manifest.phase)) errors.push("manifest.phase must be prepared or finalized");
  for (const [field, filename] of INPUT_FILES) {
    if (manifest[field] !== current[field]) errors.push(`${filename} SHA256 does not match manifest; rerun Step 5`);
  }
  if (finalized && manifest.wechat_html_sha256 !== current.wechat_html_sha256) {
    errors.push("article-wechat.html SHA256 does not match manifest; rerun Step 5 finalize");
  }
  return errors;
}

export function writePreparedArtifactManifest(postDir) {
  const manifest = { version: 1, phase: "prepared", ...currentHashes(postDir) };
  writeFileSync(manifestPath(postDir), JSON.stringify(manifest, null, 2) + "\n");
  return manifest;
}

export function writeFinalizedArtifactManifest(postDir) {
  const prepared = readManifest(postDir);
  const errors = compareManifest(postDir, prepared);
  if (errors.length > 0) throw new Error(errors.join("; "));
  const manifest = { ...prepared, phase: "finalized", wechat_html_sha256: currentHashes(postDir, true).wechat_html_sha256 };
  writeFileSync(manifestPath(postDir), JSON.stringify(manifest, null, 2) + "\n");
  return manifest;
}

export function validatePreparedArtifactFreshness(postDir) {
  try { return compareManifest(postDir, readManifest(postDir)); }
  catch (error) { return [error.message]; }
}

export function assertPreparedArtifactFreshness(postDir) {
  const errors = validatePreparedArtifactFreshness(postDir);
  if (errors.length > 0) throw new Error(errors.join("; "));
  return true;
}

export function validateFinalizedArtifactFreshness(postDir) {
  try { return compareManifest(postDir, readManifest(postDir), { finalized: true }); }
  catch (error) { return [error.message]; }
}

export function assertFinalizedArtifactFreshness(postDir) {
  const errors = validateFinalizedArtifactFreshness(postDir);
  if (errors.length > 0) throw new Error(errors.join("; "));
  return true;
}

export function assertFinalizeInputsFresh(postDir) {
  const manifest = readManifest(postDir);
  const errors = compareManifest(postDir, manifest);
  if (errors.length > 0) throw new Error(errors.join("; "));
  return true;
}

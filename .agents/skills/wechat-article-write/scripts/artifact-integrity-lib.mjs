import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const MANIFEST_NAME = ".step5-artifacts.json";
const IMAGE_EXTENSIONS = /\.(?:png|jpe?g|webp|gif)$/iu;
// Upstream visual identity decides whether image hosting may run again. The other
// files are downstream outputs derived from that identity plus image-map.json.
const UPSTREAM_FILES = Object.freeze([
  ["draft_sha256", "draft.md"],
  ["image_plan_sha256", "image-plan.json"],
]);
const INPUT_FILES = Object.freeze([
  ...UPSTREAM_FILES,
  ["article_sha256", "article.md"],
  ["wechat_source_sha256", "article-wechat-source.md"],
]);
const UPSTREAM_FIELDS = Object.freeze([...UPSTREAM_FILES.map(([field]) => field), "imgs_sha256"]);

export function sha256File(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function imgsSha256(postDir) {
  const dir = resolve(postDir, "imgs");
  if (!existsSync(dir)) throw new Error("imgs/ missing; cannot establish Step 5 artifact integrity");
  const digest = createHash("sha256");
  for (const name of readdirSync(dir).filter((file) => IMAGE_EXTENSIONS.test(file)).sort()) {
    digest.update(`${name}:${sha256File(resolve(dir, name))}\n`);
  }
  return digest.digest("hex");
}

/** The upstream visual inputs that decide whether hosting must run again. */
export function upstreamIdentity(postDir) {
  const identity = { imgs_sha256: imgsSha256(postDir) };
  for (const [field, filename] of UPSTREAM_FILES) identity[field] = sha256File(resolve(postDir, filename));
  return identity;
}

export function upstreamIdentityMatches(postDir, manifest) {
  if (!manifest) return false;
  const current = upstreamIdentity(postDir);
  return UPSTREAM_FIELDS.every((field) => manifest[field] === current[field]);
}

/** Read the manifest when present; a missing or invalid manifest returns null. */
export function readArtifactManifest(postDir) {
  try { return readManifest(postDir); } catch { return null; }
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
  const manifest = { version: 2, phase: "prepared", ...currentHashes(postDir), imgs_sha256: imgsSha256(postDir) };
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

import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const MANIFEST_NAME = ".step5-artifacts.json";
const IMAGE_EXTENSIONS = /\.(?:png|jpe?g|webp|gif)$/iu;
// Hosting depends on body visuals; publication additionally freezes text and cover.
const UPSTREAM_FILES = Object.freeze([
  ["draft_sha256", "draft.md"],
  ["visual_draft_sha256", "visual-draft.md"],
]);
const INPUT_FILES = Object.freeze([
  ...UPSTREAM_FILES,
  ["article_sha256", "article.md"],
  ["wechat_source_sha256", "article-wechat-source.md"],
]);
const HOSTING_FIELDS = Object.freeze(["visual_draft_sha256", "imgs_sha256"]);

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

function imageMapSha256(postDir) {
  const path = resolve(postDir, "image-map.json");
  if (!existsSync(path)) throw new Error("image-map.json missing; cannot establish Step 5 artifact integrity");
  return sha256File(path);
}

// Cover identity includes the filename so format changes also invalidate publication.
function coverIdentity(postDir) {
  const covers = ["cover.png", "cover.jpg"].filter(name => existsSync(resolve(postDir, name)));
  if (covers.length !== 1) throw new Error("expected exactly one root cover for Step 5 artifact integrity");
  return { cover_file: covers[0], cover_sha256: sha256File(resolve(postDir, covers[0])) };
}

// Every manifest v4 records and verifies publication and hosting identity.
const AUX_HASHES = Object.freeze([
  ["imgs_sha256", "imgs/", imgsSha256],
  ["image_map_sha256", "image-map.json", imageMapSha256],
]);

/** The upstream visual inputs that decide whether hosting must run again. */
export function upstreamIdentity(postDir) {
  const identity = { imgs_sha256: imgsSha256(postDir) };
  identity.visual_draft_sha256 = sha256File(resolve(postDir, "visual-draft.md"));
  return identity;
}

export function upstreamIdentityMatches(postDir, manifest) {
  if (!manifest || ![3, 4].includes(manifest.version)) return false;
  const current = upstreamIdentity(postDir);
  return HOSTING_FIELDS.every((field) => manifest[field] === current[field]);
}

/** Publication inputs are stricter than the body-image hosting identity. */
export function publicationIdentityMatches(postDir, manifest) {
  if (manifest?.version !== 4 || !upstreamIdentityMatches(postDir, manifest)) return false;
  const cover = coverIdentity(postDir);
  return manifest.draft_sha256 === sha256File(resolve(postDir, "draft.md"))
    && manifest.cover_file === cover.cover_file && manifest.cover_sha256 === cover.cover_sha256;
}

/** Preserve the hosting result and existing track outputs during cover-only recovery. */
export function assertMappedArtifactsUnchanged(postDir, manifest) {
  for (const [field, name] of [["image_map_sha256", "image-map.json"], ...INPUT_FILES.slice(UPSTREAM_FILES.length)]) {
    if (manifest[field] !== sha256File(resolve(postDir, name))) {
      throw new Error(name + " SHA256 does not match frozen manifest; restore it before Step 5 prepare");
    }
  }
}

/** Read the manifest when present; a missing or invalid manifest returns null. */
export function readArtifactManifest(postDir) {
  try { return readManifest(postDir); } catch { return null; }
}

function manifestPath(postDir) {
  return resolve(postDir, MANIFEST_NAME);
}

function currentHashes(postDir, includeHtml = false) {
  const hashes = coverIdentity(postDir);
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
  if (manifest?.version !== 4) return ["Step 5 manifest version must be 4; rerun Step 5 prepare"];
  const errors = [];
  const current = currentHashes(postDir, finalized);
  if (finalized && manifest.phase !== "finalized") errors.push("manifest.phase must be finalized");
  if (!finalized && !["prepared", "finalized"].includes(manifest.phase)) errors.push("manifest.phase must be prepared or finalized");
  for (const field of ["cover_file", "cover_sha256"]) {
    if (manifest[field] !== current[field]) errors.push("cover SHA256/name does not match manifest; review cover in Step 4 and rerun Step 5 prepare");
  }
  for (const [field, filename] of INPUT_FILES) {
    if (manifest[field] !== current[field]) errors.push(`${filename} SHA256 does not match manifest; rerun Step 5`);
  }
  for (const [field, label, compute] of AUX_HASHES) {
    if (manifest[field] === undefined) {
      errors.push(`${field} missing from manifest v4`);
      continue;
    }
    if (manifest[field] !== compute(postDir)) errors.push(`${label} SHA256 does not match manifest; rerun Step 5`);
  }
  if (finalized && manifest.wechat_html_sha256 !== current.wechat_html_sha256) {
    errors.push("article-wechat.html SHA256 does not match manifest; rerun Step 5 finalize");
  }
  return errors;
}

export function writePreparedArtifactManifest(postDir) {
  const manifest = {
    version: 4,
    phase: "prepared",
    ...currentHashes(postDir),
    imgs_sha256: imgsSha256(postDir),
    image_map_sha256: imageMapSha256(postDir),
  };
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

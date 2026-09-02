import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { collectActiveAssets } from "./visual-plan-lib.mjs";

const DEFAULT_STYLE_FIELDS = ["bright", "high_saturation", "high_contrast", "clean_background", "crisp", "warm", "positive"];
const IMAGE_REVIEW_FILENAME = "image-review.json";

export function sha256File(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function readReceipt(postDir, receipt) {
  if (receipt !== undefined) return receipt;
  const path = resolve(postDir, IMAGE_REVIEW_FILENAME);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    return { __parse_error: error.message };
  }
}

function findAssetFile(postDir, asset) {
  const directory = asset.key === "cover" ? postDir : resolve(postDir, "imgs");
  const candidates = asset.outputCandidates.filter((candidate) => existsSync(resolve(directory, candidate)));
  return candidates.length === 1 ? resolve(directory, candidates[0]) : null;
}

function expectedRole(asset) {
  if (asset.key === "cover") return "cover";
  if (asset.key === "SLOT_IMG_00") return "header";
  return "body";
}

function expectedDensity(asset) {
  if (asset.key === "cover") return "none";
  if (asset.key === "SLOT_IMG_00") return "low";
  return ["low", "medium"];
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Validate the manually-authored visual QA receipt against current binaries.
 * No image interpretation happens here: semantic and visual judgments are
 * supplied by the Agent/multimodal reviewer, while this module checks that
 * those judgments are complete and still bound to the same files.
 */
export function validateImageReview({ postDir, imagePlan, draftBody, receipt, receiptPath } = {}) {
  const errors = [];
  const review = readReceipt(postDir, receipt);
  if (!review) return ["image-review.json is missing; review every active generated asset"];
  if (review.__parse_error) return [`image-review.json invalid JSON: ${review.__parse_error}`];
  if (review.version !== 1) errors.push("image-review.json.version must be 1");
  const expectedProfile = imagePlan?.visual_profile;
  if (review.visual_profile !== expectedProfile) errors.push(`image-review.json.visual_profile must be ${expectedProfile}`);
  if (!Array.isArray(review.assets)) {
    errors.push("image-review.json.assets must be an array");
    return errors;
  }

  const active = collectActiveAssets(imagePlan, draftBody);
  const activeByName = new Map();
  for (const asset of active) {
    const file = findAssetFile(postDir, asset);
    if (!file) {
      errors.push(`${asset.label} must have exactly one current image file before image review`);
      continue;
    }
    activeByName.set(basename(file), { asset, file });
  }

  const seen = new Set();
  for (const [index, entry] of review.assets.entries()) {
    const label = `image-review.assets[${index}]`;
    if (!isObject(entry)) {
      errors.push(`${label} must be an object`);
      continue;
    }
    if (typeof entry.asset !== "string" || entry.asset.trim() === "") {
      errors.push(`${label}.asset must be a non-empty string`);
      continue;
    }
    const current = activeByName.get(basename(entry.asset));
    if (!current) {
      errors.push(`${label}.asset is not an active generated asset: ${entry.asset}`);
      continue;
    }
    if (seen.has(basename(entry.asset))) errors.push(`${label}.asset is duplicated`);
    seen.add(basename(entry.asset));
    const assetLabel = current.asset.label;
    const role = expectedRole(current.asset);
    if (entry.role !== role) errors.push(`${label}.role must be ${role} for ${assetLabel}`);
    if (entry.sha256 !== sha256File(current.file)) errors.push(`${assetLabel} image-review SHA256 mismatch; review is stale`);
    for (const key of ["approved", "semantic_match", "legibility", "visible_text_ok"]) {
      if (entry[key] !== true) errors.push(`${assetLabel} image-review.${key} must be true`);
    }
    const density = expectedDensity(current.asset);
    if (Array.isArray(density) ? !density.includes(entry.text_density) : entry.text_density !== density) {
      errors.push(`${assetLabel} image-review.text_density must be ${Array.isArray(density) ? density.join(" or ") : density}`);
    }
    if (entry.has_long_copy !== false) errors.push(`${assetLabel} image-review.has_long_copy must be false`);
    if (!isObject(entry.style_review)) errors.push(`${assetLabel} image-review.style_review is required`);
    else if (expectedProfile === "bright-vivid-warm") {
      for (const key of DEFAULT_STYLE_FIELDS) {
        if (entry.style_review[key] !== true) errors.push(`${assetLabel} image-review.style_review.${key} must be true for bright-vivid-warm`);
      }
    } else if (entry.style_review.visual_override_match !== true) {
      // A custom profile has no default style fields to check, so at minimum the
      // receipt must confirm the render matches the user's explicit direction.
      errors.push(`${assetLabel} image-review.style_review.visual_override_match must be true for ${expectedProfile}`);
    }
    if (typeof entry.reviewer_note !== "string" || entry.reviewer_note.trim() === "") errors.push(`${assetLabel} image-review.reviewer_note is required`);
  }

  for (const [name, { asset }] of activeByName) {
    if (!seen.has(name)) errors.push(`${asset.label} is missing from image-review.json`);
  }
  return errors;
}

export function assertImageReview(options) {
  const errors = validateImageReview(options);
  if (errors.length > 0) throw new Error(errors.join("; "));
  return true;
}

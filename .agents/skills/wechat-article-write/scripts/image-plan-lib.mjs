import { existsSync, readFileSync } from "node:fs";
import { resolve, sep } from "node:path";
import { collectDraftSlots, resolveSlotImg, normalizeSlotDesc } from "./validation-lib.mjs";
import { collectMarkdownImages, collectSubstantiveSections } from "./markdown-structure-lib.mjs";

export const IMAGE_EXTENSIONS = /\.(?:png|jpe?g|webp|gif)$/iu;

export function readImagePlan(path) {
  if (!existsSync(path)) return null;
  try { return JSON.parse(readFileSync(path, "utf8")); }
  catch (error) { throw new Error(`invalid image-plan.json: ${error.message}`); }
}

function object(value) { return value !== null && typeof value === "object" && !Array.isArray(value); }
function nonEmpty(value) { return typeof value === "string" && value.trim() !== ""; }

export function validateImagePlan(imagePlan, draftBody, postDir) {
  const errors = [];
  const slots = collectDraftSlots(draftBody);
  const bodySlots = slots.filter((slot) => slot.slot > 0).sort((a, b) => a.slot - b.slot);
  const bodyNumbers = [...new Set(bodySlots.map((slot) => slot.slot))];
  const contiguous = bodyNumbers.every((slot, index) => slot === index + 1);
  if (!contiguous) errors.push("body SLOT numbers must be contiguous starting at SLOT_IMG_01");
  const expected = ["SLOT_IMG_00", ...bodySlots.map((slot) => `SLOT_IMG_${String(slot.slot).padStart(2, "0")}`)];
  if (!object(imagePlan)) return { ok: false, errors: ["image-plan.json must contain an object"], entries: [] };
  if (!nonEmpty(imagePlan.cover) || imagePlan.cover !== "cover.png" && imagePlan.cover !== "cover.jpg") {
    errors.push("image-plan.cover must be cover.png or cover.jpg");
  }
  if (!Array.isArray(imagePlan.images)) {
    errors.push("image-plan.images must be an array");
    return { ok: false, errors, entries: [] };
  }
  const entries = imagePlan.images;
  const actualSlots = entries.map((entry) => entry?.slot);
  if (JSON.stringify(actualSlots) !== JSON.stringify(expected)) {
    errors.push(`image-plan slot sequence must be ${expected.join(", ")}; found ${actualSlots.join(", ")}`);
  }
  const seen = new Set();
  for (const [index, entry] of entries.entries()) {
    const label = `image-plan.images[${index}]`;
    if (!object(entry)) { errors.push(`${label} must be an object`); continue; }
    if (!nonEmpty(entry.slot) || !/^SLOT_IMG_\d{2}$/u.test(entry.slot)) errors.push(`${label}.slot must be SLOT_IMG_NN`);
    if (seen.has(entry.slot)) errors.push(`${label}.slot is duplicated`);
    seen.add(entry.slot);
    if (!new Set(expected).has(entry.slot)) errors.push(`${label}.slot has no matching draft SLOT`);
    if (entry.kind !== "source" && entry.kind !== "generated") errors.push(`${label}.kind must be source or generated`);
    if (!nonEmpty(entry.file) || !entry.file.startsWith("imgs/") || !IMAGE_EXTENSIONS.test(entry.file)) errors.push(`${label}.file must be an imgs/ image path`);
    const localPath = resolve(postDir, entry.file ?? "");
    const imageRoot = resolve(postDir, "imgs") + sep;
    if (!localPath.startsWith(imageRoot)) errors.push(`${label}.file must remain under imgs/: ${entry.file}`);
    if (!existsSync(localPath)) errors.push(`${label}.file missing: ${entry.file}`);
    if (entry.kind === "source") {
      if (!/^https?:\/\//iu.test(String(entry.source ?? ""))) errors.push(`${label}.source must be an http(s) URL for source assets`);
      if (!nonEmpty(entry.reason)) errors.push(`${label}.reason is required for source assets`);
    }
    if (entry.slot === "SLOT_IMG_00" && (entry.kind !== "generated" || entry.file !== "imgs/00-infographic-core-summary.png")) {
      errors.push("SLOT_IMG_00 must be generated at imgs/00-infographic-core-summary.png");
    }
    if (entry.slot !== "SLOT_IMG_00") {
      const slot = resolveSlotImg(entry.slot);
      const expectedStem = `${String(slot.slot).padStart(2, "0")}-${normalizeSlotDesc(slot.desc)}`;
      if (slot.desc && !entry.file.startsWith(`imgs/${expectedStem}.`)) errors.push(`${label}.file must match its draft SLOT basename`);
    }
  }
  for (const slot of expected) if (!seen.has(slot)) errors.push(`image-plan is missing ${slot}`);

  const refs = collectMarkdownImages(draftBody).map((image) => image.src);
  const files = entries.map((entry) => entry.file);
  for (const ref of refs.filter((value) => value.startsWith("imgs/"))) if (!files.includes(ref)) errors.push(`draft image reference has no image-plan entry: ${ref}`);
  const sections = collectSubstantiveSections(draftBody);
  const slot00 = slots.find((slot) => slot.slot === 0);
  if (!slot00 || (sections[0] && slot00.index >= sections[0].start)) errors.push("SLOT_IMG_00 must be before the first substantive H2");
  const visuals = [...slots.map((slot) => ({ index: slot.index, slot: slot.slot })), ...collectMarkdownImages(draftBody).map((image) => ({ index: image.index, slot: null }))].sort((a, b) => a.index - b.index);
  if (visuals[0]?.slot !== 0) errors.push("SLOT_IMG_00 must be the first body visual");
  return { ok: errors.length === 0, errors, entries, expected };
}

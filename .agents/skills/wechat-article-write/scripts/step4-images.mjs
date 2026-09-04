#!/usr/bin/env bun
/** Step 4 Gate: validate final visual assets and their simple asset map. */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { markStepDone, markStepFailed, loadState } from "./state-lib.mjs";
import { postsRoot } from "./path-resolver.mjs";
import { extractBody, readFmValue } from "./frontmatter-lib.mjs";
import { collectDraftSlots, countWords, requiresBodyVisualCoverage } from "./validation-lib.mjs";
import { collectSubstantiveSections } from "./markdown-structure-lib.mjs";
import { validateImagePlan, readImagePlan } from "./image-plan-lib.mjs";
import { assertCoverPixelAspect, imageMime, usableImageFile } from "./image-asset-lib.mjs";
import { sha256File } from "./artifact-integrity-lib.mjs";

const slug = process.argv.slice(2).find((arg) => !arg.startsWith("--"));
if (!slug) { process.stderr.write("usage: step4-images.mjs <date-slug>\n"); process.exit(1); }

const base = resolve(postsRoot(), slug);
const draftPath = resolve(base, "draft.md");
const planPath = resolve(base, "image-plan.json");
const imgsDir = resolve(base, "imgs");

function fail(message) {
  process.stderr.write(`step4: FAIL - ${message}\n`);
  markStepFailed(slug, 4, message);
  process.exit(2);
}

if (!existsSync(draftPath)) fail(`draft.md missing: ${draftPath}`);
const state = loadState(slug);
const draftHash = sha256File(draftPath);
if ((state?.last_complete_step ?? 0) < 3 || state?.step3_draft_sha256 !== draftHash) {
  fail("draft.md changed after Step 3; rerun humanizer-zh and Step 3");
}

const draft = readFileSync(draftPath, "utf8");
const body = extractBody(draft);
const draftSlots = collectDraftSlots(body);
const bodySlotCount = draftSlots.filter((slot) => slot.slot > 0).length;
const substantiveSectionCount = collectSubstantiveSections(body).length;
const wordCount = countWords(body).total;
if (requiresBodyVisualCoverage({ wordCount, substantiveSectionCount }) && bodySlotCount === 0) {
  fail("normal long-form article requires at least one body visual SLOT beyond SLOT00; review understanding-brief.md visualizable nodes and add SLOT_IMG_01+");
}
const coverImage = readFmValue(draft, "coverImage");
const rootCovers = ["cover.png", "cover.jpg"].filter((file) => existsSync(resolve(base, file)));
if (rootCovers.length !== 1) fail(`expected exactly one root cover, found ${rootCovers.join(", ") || "none"}`);
if (coverImage !== rootCovers[0]) fail(`frontmatter.coverImage must be ${rootCovers[0]}`);
const coverPath = resolve(base, rootCovers[0]);
if (!usableImageFile(coverPath)) fail(`root cover is not a usable raster: ${rootCovers[0]}`);
const expectedMime = rootCovers[0].endsWith(".png") ? "image/png" : "image/jpeg";
if (imageMime(coverPath) !== expectedMime) fail(`root cover MIME does not match extension: ${rootCovers[0]}`);
try { assertCoverPixelAspect(coverPath); } catch (error) { fail(error.message); }

if (!existsSync(planPath)) fail(`image-plan.json missing: ${planPath}`);
let imagePlan;
try { imagePlan = readImagePlan(planPath); } catch (error) { fail(error.message); }
const planResult = validateImagePlan(imagePlan, body, base);
if (!planResult.ok) fail(`image-plan invalid: ${planResult.errors.join("; ")}`);
if (!existsSync(imgsDir)) fail("imgs/ directory missing");

for (const entry of planResult.entries) {
  const path = resolve(base, entry.file);
  if (!usableImageFile(path)) fail(`${entry.slot} is not a usable raster: ${entry.file}`);
  if (!imageMime(path)) fail(`${entry.slot} has an unknown image MIME: ${entry.file}`);
}

const slot00 = draftSlots.find((slot) => slot.slot === 0);
if (!slot00) fail("SLOT_IMG_00 is missing");
const files = readdirSync(imgsDir).filter((file) => /\.(?:png|jpe?g|webp|gif)$/iu.test(file));
const mapped = new Set(planResult.entries.map((entry) => entry.file.replace(/^imgs\//u, "")));
const stale = files.filter((file) => !mapped.has(file));
if (stale.length) process.stderr.write(`step4: WARNING unplanned images in imgs/: ${stale.join(", ")}\n`);

markStepDone(slug, 4, { imgs_dir: imgsDir, cover_ext: rootCovers[0].slice(6), image_count: planResult.entries.length });
process.stdout.write(JSON.stringify({ slug, step: 4, cover: rootCovers[0], image_count: planResult.entries.length }) + "\n");

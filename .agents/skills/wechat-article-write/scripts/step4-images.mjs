#!/usr/bin/env bun
/** Step 4: integrate visuals while preserving the frozen textual source. */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { markStepDone, markStepFailed, loadState } from "./state-lib.mjs";
import { postsRoot, assertProjectCwd } from "./path-resolver.mjs";
import { readFmValue } from "./frontmatter-lib.mjs";
import { assertCoverPixelAspect } from "./image-asset-lib.mjs";
import { sha256File } from "./artifact-integrity-lib.mjs";
import { initializeVisualDraft, validateVisualDraft, assertUsableRaster } from "./visual-draft-lib.mjs";

const args = process.argv.slice(2);
const slug = args.find(arg => !arg.startsWith("--"));
if (!slug || args.some(arg => arg.startsWith("--") && arg !== "--initialize-only")) {
  process.stderr.write("usage: step4-images.mjs <date-slug> [--initialize-only]\n");
  process.exit(1);
}
// Preflight: backend configuration resolves from cwd, so refuse to run anywhere but the project
// root. This stays outside the step try/catch because a wrong cwd would make markStepFailed write
// state to the wrong place.
try {
  assertProjectCwd();
} catch (error) {
  process.stderr.write(`step4: FAIL - ${error.message}\n`);
  process.exit(1);
}
const base = resolve(postsRoot(), slug);
try {
  const draftPath = resolve(base, "draft.md");
  if (!existsSync(draftPath)) throw new Error("draft.md missing");
  const state = loadState(slug);
  if ((state?.last_complete_step ?? 0) < 3 || state?.step3_draft_sha256 !== sha256File(draftPath)) {
    throw new Error("draft.md changed after Step 3; rerun humanizer-zh and Step 3");
  }
  if (args.includes("--initialize-only")) {
    const status = initializeVisualDraft(base);
    process.stdout.write(`step4: ${status} visual-draft.md\n`);
  } else {
    const draft = readFileSync(draftPath, "utf8");
    const visual = readFileSync(resolve(base, "visual-draft.md"), "utf8");
    const covers = ["cover.png", "cover.jpg"].filter(name => existsSync(resolve(base, name)));
    if (covers.length !== 1) throw new Error("expected exactly one root cover");
    if (readFmValue(draft, "coverImage") !== covers[0]) throw new Error(`frontmatter.coverImage must be ${covers[0]}`);
    await assertUsableRaster(resolve(base, covers[0]));
    assertCoverPixelAspect(resolve(base, covers[0]));
    const images = await validateVisualDraft(draft, visual, base);
    markStepDone(slug, 4, { visual_draft: "visual-draft.md", cover_ext: covers[0].slice(6), image_count: images.length });
    process.stdout.write(JSON.stringify({ slug, step: 4, cover: covers[0], image_count: images.length }) + "\n");
  }
} catch (error) {
  process.stderr.write(`step4: FAIL - ${error.message}\n`);
  markStepFailed(slug, 4, error.message);
  process.exit(2);
}

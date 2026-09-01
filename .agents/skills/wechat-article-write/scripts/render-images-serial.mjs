#!/usr/bin/env bun
/**
 * render-images-serial.mjs — the single article-image execution boundary.
 *
 * It consumes the current image plan and canonical prompt files.  Design and
 * prompt authoring happen before this script; this script only performs a
 * fail-closed runtime check and renders one active raster asset at a time.
 */

import { existsSync, readFileSync, statSync } from "node:fs";
import { basename, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { extractBody, parseFrontmatter } from "./frontmatter-lib.mjs";
import { repoRoot as configuredRepoRoot, postsRoot as configuredPostsRoot } from "./path-resolver.mjs";
import {
  collectActiveAssets,
  validateBaoyuDesign,
  validateVisualPlanTopology,
  readImagePlan,
} from "./visual-plan-lib.mjs";

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif"];

function defaultRunCommand(command, args, options) {
  return spawnSync(command, args, options);
}

function nonEmptyFile(path) {
  try {
    return existsSync(path) && statSync(path).isFile() && statSync(path).size > 0;
  } catch {
    return false;
  }
}

function usableImageFile(path) {
  if (!nonEmptyFile(path)) return false;
  try {
    const bytes = readFileSync(path);
    const ext = path.slice(path.lastIndexOf(".")).toLowerCase();
    if (ext === ".png") return bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    if (ext === ".jpg" || ext === ".jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    if (ext === ".gif") return bytes.length >= 6 && (bytes.subarray(0, 6).toString("ascii") === "GIF87a" || bytes.subarray(0, 6).toString("ascii") === "GIF89a");
    if (ext === ".webp") return bytes.length >= 12 && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP";
  } catch {
    return false;
  }
  return false;
}

function firstExistingOutput(baseDir, asset) {
  const outputDir = asset.key === "cover" ? baseDir : resolve(baseDir, "imgs");
  for (const filename of asset.outputCandidates) {
    const path = resolve(outputDir, filename);
    if (usableImageFile(path)) return path;
  }
  return null;
}

function outputPath(baseDir, asset) {
  const outputDir = asset.key === "cover" ? baseDir : resolve(baseDir, "imgs");
  return resolve(outputDir, `${asset.outputBasename}.png`);
}

function promptPath(baseDir, asset) {
  return resolve(baseDir, "imgs", "prompts", `${asset.promptBasename}.md`);
}

function assetAspect(asset) {
  const aspect = asset.design?.aspect;
  return typeof aspect === "string" && aspect.trim() ? aspect.trim() : "16:9";
}

function readArticlePlan(baseDir) {
  const draftPath = resolve(baseDir, "draft.md");
  const planPath = resolve(baseDir, "image-plan.json");
  if (!existsSync(draftPath)) throw new Error(`draft.md missing: ${draftPath}`);
  if (!existsSync(planPath)) throw new Error(`image-plan.json missing: ${planPath}`);

  const draft = readFileSync(draftPath, "utf8");
  const frontmatter = parseFrontmatter(draft);
  if (!frontmatter) throw new Error(`frontmatter missing in draft.md: ${draftPath}`);
  const imagePlan = readImagePlan(planPath);
  if (!imagePlan) throw new Error(`image-plan.json must contain an object: ${planPath}`);

  const body = extractBody(draft);
  const topology = validateVisualPlanTopology(imagePlan, body);
  if (!topology.ok) throw new Error(`visual plan topology invalid: ${topology.errors.join("; ")}`);
  return { imagePlan, body, frontmatter };
}

function runBackendRuntimeCheck({ repositoryRoot, runCommand }) {
  const script = resolve(repositoryRoot, ".agents/skills/wechat-article-write/scripts/check-image-backend.mjs");
  const result = runCommand("bun", ["run", script, "--runtime", "--json"], {
    cwd: repositoryRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  let payload = null;
  try {
    payload = JSON.parse(result.stdout ?? "{}");
  } catch {
    // The non-zero status below remains the primary diagnostic when the check
    // does not return its JSON contract.
  }
  if (result.error || result.status !== 0 || !payload?.ok) {
    const details = [
      ...(payload?.errors ?? []),
      result.stderr?.trim(),
    ].filter(Boolean).join("; ");
    throw new Error(`runtime image backend check failed; image stage is BLOCKED${details ? `: ${details}` : ""}`);
  }
  return payload;
}

function preflightPrompts(baseDir, assets) {
  for (const asset of assets) {
    const path = promptPath(baseDir, asset);
    if (basename(path, ".md") !== asset.promptBasename) {
      throw new Error(`${asset.label} canonical prompt basename mismatch: ${path}`);
    }
    if (!nonEmptyFile(path)) {
      throw new Error(`active canonical prompt missing or empty for ${asset.label}: ${path}`);
    }
  }
}

function verifyOutput(asset, path) {
  if (!usableImageFile(path)) {
    throw new Error(`image generation returned without a usable output for ${asset.label}: ${path}`);
  }
}

/**
 * Render active assets in fixed order.  `runCommand` and `backendCheck` are
 * injectable seams for tests; production uses Bun's synchronous child process
 * boundary, so the next invocation cannot start before the previous returns.
 */
export function renderImagesSerial({
  slug,
  repositoryRoot = configuredRepoRoot(),
  postsRoot = configuredPostsRoot(),
  force = false,
  dryRun = false,
  allowDefaultImagePlan = false,
  runCommand = defaultRunCommand,
  backendCheck = () => runBackendRuntimeCheck({ repositoryRoot, runCommand }),
} = {}) {
  if (!slug) throw new Error("slug is required");
  const baseDir = resolve(postsRoot, slug);
  const { imagePlan, body, frontmatter } = readArticlePlan(baseDir);
  if (!allowDefaultImagePlan) {
    const designErrors = validateBaoyuDesign(imagePlan);
    if (designErrors.length > 0) throw new Error(`Baoyu visual design contract invalid: ${designErrors.join("; ")}`);
  }

  const assets = collectActiveAssets(imagePlan, body, {
    blogSlug: frontmatter.blogSlug,
    slug,
  }).map((asset) => ({
    ...asset,
    promptPath: promptPath(baseDir, asset),
    outputPath: outputPath(baseDir, asset),
    existingPath: firstExistingOutput(baseDir, asset),
    aspect: assetAspect(asset),
  }));

  // This is intentionally before both runtime checks and generation.  A late
  // missing prompt must not spend generation quota on earlier assets.
  preflightPrompts(baseDir, assets);

  if (dryRun) return { slug, dryRun: true, assets, rendered: [], skipped: [] };

  backendCheck();

  const rendered = [];
  const skipped = [];
  for (const asset of assets) {
    const existing = asset.existingPath && nonEmptyFile(asset.existingPath)
      ? asset.existingPath
      : null;
    if (existing && !force) {
      skipped.push({ ...asset, existingPath: existing });
      continue;
    }

    const args = [
      "run",
      resolve(repositoryRoot, ".agents/skills/baoyu-image-gen/scripts/main.ts"),
      "--promptfiles", asset.promptPath,
      "--image", asset.outputPath,
      "--provider", "codex-cli",
      "--ar", asset.aspect,
    ];
    const result = runCommand("bun", args, {
      cwd: repositoryRoot,
      encoding: "utf8",
      stdio: "inherit",
      env: {
        ...process.env,
        BAOYU_IMAGE_GEN_MAX_WORKERS: "1",
        BAOYU_IMAGE_GEN_CODEX_CLI_CONCURRENCY: "1",
      },
    });
    if (result.error || result.status !== 0) {
      const detail = result.error?.message || result.stderr?.trim() || `exit ${result.status}`;
      throw new Error(`${asset.label} generation failed; serial renderer stopped before the next asset: ${detail}`);
    }
    verifyOutput(asset, asset.outputPath);
    rendered.push(asset);
  }

  return { slug, dryRun: false, assets, rendered, skipped };
}

function usage() {
  process.stderr.write("usage: render-images-serial.mjs <date-slug> [--dry-run] [--force] [--allow-default-image-plan]\n");
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.includes("--help")) {
    usage();
    process.exit(0);
  }
  const flags = new Set(["--dry-run", "--force", "--allow-default-image-plan"]);
  const positional = [];
  for (const arg of argv) {
    if (arg.startsWith("--")) {
      if (!flags.has(arg)) throw new Error(`unknown option: ${arg}`);
    } else {
      positional.push(arg);
    }
  }
  if (positional.length !== 1) {
    usage();
    process.exit(1);
  }

  const result = renderImagesSerial({
    slug: positional[0],
    dryRun: argv.includes("--dry-run"),
    force: argv.includes("--force"),
    allowDefaultImagePlan: argv.includes("--allow-default-image-plan"),
  });
  if (result.dryRun) {
    result.assets.forEach((asset, index) => {
      process.stdout.write(`${index + 1} ${asset.label} -> ${asset.outputPath}\n`);
    });
    process.stdout.write("\nprovider: codex-cli\nexecution: serial\nparallelism: 1\n");
  } else {
    process.stdout.write(JSON.stringify({
      slug: result.slug,
      rendered: result.rendered.map((asset) => asset.label),
      skipped: result.skipped.map((asset) => asset.label),
      provider: "codex-cli",
      execution: "serial",
      parallelism: 1,
    }) + "\n");
  }
}

if (import.meta.main) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`render-images-serial: BLOCKED - ${error.message}\n`);
    process.exit(2);
  }
}

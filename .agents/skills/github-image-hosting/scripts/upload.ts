#!/usr/bin/env bun
/**
 * GitHub Image Hosting Upload Script
 *
 * Uploads images to a configured GitHub repository and returns jsDelivr URLs.
 * Single-file and directory mode share the same content-aware batch core.
 */

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

let REPO_OWNER = "NTLx";
let REPO_NAME = "Pic";
let REPO_BRANCH = "master";
let DEFAULT_FOLDER = "blog";

// The built-in values are examples, not permission to write to a private repo.
let CONFIGURED = false;

const ENV_FILE_NAME = ".github-image-hosting.env";
const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

const DEFAULT_API_TIMEOUT = 30000;
const TREE_FETCH_TIMEOUT = 60000;
const POST_API_TIMEOUT = 300000;
const PATCH_API_TIMEOUT = 60000;
const NETWORK_RETRY_MAX = 2;
const NETWORK_RETRY_BASE_MS = 2000;
const REF_RETRY_MAX = 3;
const REF_RETRY_BASE_MS = 1000;

interface UploadOptions {
  imagePath: string;
  customName?: string;
  namePrefix?: string;
  folder: string;
  output?: string;
  dryRun: boolean;
}

interface LocalAsset {
  sourcePath: string;
  originalFilename: string;
  ext: string;
  baseName: string;
  bytes: Buffer;
  localGitBlobSha: string;
}

interface PlannedAsset extends LocalAsset {
  filename: string;
  repoPath: string;
  action: "uploaded" | "reused";
}

interface RemoteState {
  head: string;
  index: Map<string, string>;
}

interface BatchResult {
  plan: PlannedAsset[];
  map: Record<string, string>;
}

/** Walk up from CWD to find git project root. */
function findProjectRoot(): string | null {
  let dir = process.cwd();
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, ".git"))) return dir;
    dir = path.dirname(dir);
  }
  return null;
}

/** Parse simple KEY=VALUE env files (comments and blank lines are ignored). */
function parseEnvFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, "utf8");
  const config: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    config[key] = value;
  }
  return config;
}

/**
 * Apply project/user config. Repository configuration is considered present
 * only when both owner and name are explicitly supplied by an env file.
 */
function applyEnvConfig(): void {
  const userConfig = parseEnvFile(path.join(os.homedir(), ENV_FILE_NAME));
  const projectRoot = findProjectRoot();
  const projectConfig = projectRoot
    ? parseEnvFile(path.join(projectRoot, ENV_FILE_NAME))
    : {};

  const valueFor = (key: string): string | undefined =>
    projectConfig[key] || userConfig[key];

  const owner = valueFor("GITHUB_IMAGE_REPO_OWNER");
  const name = valueFor("GITHUB_IMAGE_REPO_NAME");
  const branch = valueFor("GITHUB_IMAGE_REPO_BRANCH");
  const folder = valueFor("GITHUB_IMAGE_DEFAULT_FOLDER");

  if (owner) REPO_OWNER = owner;
  if (name) REPO_NAME = name;
  if (branch) REPO_BRANCH = branch;
  if (folder) DEFAULT_FOLDER = folder;
  CONFIGURED = Boolean(owner && name);
}

function parseRepoSpec(spec: string, options: UploadOptions): void {
  const match = spec.match(/^([^/]+)\/([^@:]+)(?:@([^:]+))?(?::(.+))?$/);
  if (!match) throw new Error(`invalid --repo spec: ${spec}`);
  REPO_OWNER = match[1];
  REPO_NAME = match[2];
  if (match[3]) REPO_BRANCH = match[3];
  if (match[4]) options.folder = match[4];
  CONFIGURED = true;
}

function assertRepoConfigured(): void {
  if (!CONFIGURED) {
    console.error(
      "[upload] FAIL: 未配置图片托管仓库。" +
      "请在本仓库根目录创建 `.github-image-hosting.env`（推荐，会随仓库提交）或 `~/.github-image-hosting.env`，" +
      "写入 GITHUB_IMAGE_REPO_OWNER / GITHUB_IMAGE_REPO_NAME / GITHUB_IMAGE_REPO_BRANCH / GITHUB_IMAGE_DEFAULT_FOLDER，" +
      "或通过 `--repo owner/name@branch:folder` 显式指定。" +
      "不要依赖脚本内置默认仓库静默上传。"
    );
    process.exit(1);
  }
}

function parseArgs(): UploadOptions {
  const args = process.argv.slice(2);
  const options: UploadOptions = { imagePath: "", folder: DEFAULT_FOLDER, dryRun: false };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--name" && args[i + 1]) options.customName = args[++i];
    else if (arg === "--name-prefix" && args[i + 1]) options.namePrefix = args[++i];
    else if (arg === "--folder" && args[i + 1]) options.folder = args[++i];
    else if (arg === "--repo" && args[i + 1]) parseRepoSpec(args[++i], options);
    else if (arg === "--output" && args[i + 1]) options.output = args[++i];
    else if (arg === "--dry-run") options.dryRun = true;
    else if (!arg.startsWith("-") && !options.imagePath) options.imagePath = arg;
  }
  return options;
}

function errorText(error: any): string {
  return [error?.stderr, error?.stdout, error?.message, error]
    .filter(Boolean)
    .map(value => Buffer.isBuffer(value) ? value.toString("utf8") : String(value))
    .join(" ");
}

function isRetryableNetworkError(error: any): boolean {
  const code = error?.code ?? "";
  const message = errorText(error);
  return code === "ETIMEDOUT" || /ETIMEDOUT|ECONNRESET|ECONNREFUSED|EAI_AGAIN|timed out|\b502\b|\b503\b|\b504\b/i.test(message);
}

/** Retry network-level gh failures. Ownership stays inside this Skill. */
function execWithNetworkRetry(args: string[], timeout: number, label: string): string {
  for (let attempt = 0; attempt <= NETWORK_RETRY_MAX; attempt += 1) {
    try {
      return execFileSync("gh", args, {
        encoding: "utf8",
        timeout,
        stdio: ["pipe", "pipe", "pipe"],
      }).trim();
    } catch (error: any) {
      if (isRetryableNetworkError(error) && attempt < NETWORK_RETRY_MAX) {
        const delay = NETWORK_RETRY_BASE_MS * 2 ** attempt;
        console.warn(`[${label}] transient GitHub failure (attempt ${attempt + 1}/${NETWORK_RETRY_MAX + 1}), retrying in ${delay}ms...`);
        const end = Date.now() + delay;
        while (Date.now() < end) { /* synchronous CLI boundary */ }
        continue;
      }
      throw error;
    }
  }
  throw new Error(`${label}: retry loop exhausted`);
}

function ghApiJson(endpoint: string, timeout: number, label: string, inputFile?: string): any {
  const args = ["api", endpoint];
  if (inputFile) args.push("--input", inputFile);
  const raw = execWithNetworkRetry(args, timeout, label);
  try {
    return JSON.parse(raw);
  } catch (error: any) {
    throw new Error(`${label}: GitHub returned invalid JSON (${error.message})`);
  }
}

function withJsonPayload<T>(payload: object, fn: (filePath: string) => T): T {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "gh-api-payload-"));
  const tempFile = path.join(tempDir, "payload.json");
  fs.writeFileSync(tempFile, JSON.stringify(payload));
  try {
    return fn(tempFile);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

function ghApiPost(endpoint: string, payload: object): string {
  const result = withJsonPayload(payload, filePath =>
    ghApiJson(endpoint, POST_API_TIMEOUT, "ghApiPost", filePath));
  if (!result || typeof result.sha !== "string" || !result.sha) {
    throw new Error("ghApiPost: GitHub response did not contain a valid SHA");
  }
  return result.sha;
}

function ghApiPatch(endpoint: string, payload: object): void {
  withJsonPayload(payload, filePath => {
    execWithNetworkRetry(
      ["api", endpoint, "--method", "PATCH", "--input", filePath],
      PATCH_API_TIMEOUT,
      "ghApiPatch"
    );
  });
}

function getRemoteState(): RemoteState {
  const refEndpoint = `repos/${REPO_OWNER}/${REPO_NAME}/git/refs/heads/${REPO_BRANCH}`;
  const ref = ghApiJson(refEndpoint, DEFAULT_API_TIMEOUT, "getBranchHead");
  const head = ref?.object?.sha;
  if (typeof head !== "string" || !head) {
    throw new Error("getBranchHead: branch HEAD is missing or invalid");
  }

  const treeEndpoint = `repos/${REPO_OWNER}/${REPO_NAME}/git/trees/${head}?recursive=1`;
  const tree = ghApiJson(treeEndpoint, TREE_FETCH_TIMEOUT, "getRemoteIndex");
  if (tree?.truncated === true) {
    throw new Error("getRemoteIndex: GitHub tree response was truncated; refusing an incomplete index");
  }
  if (!Array.isArray(tree?.tree)) {
    throw new Error("getRemoteIndex: GitHub tree response did not contain a tree array");
  }

  const index = new Map<string, string>();
  for (const entry of tree.tree) {
    if (entry?.type !== "blob") continue;
    if (typeof entry.path !== "string" || !entry.path || typeof entry.sha !== "string" || !entry.sha) {
      throw new Error("getRemoteIndex: blob entry is missing path or SHA; refusing an unreliable index");
    }
    index.set(entry.path, entry.sha);
  }
  return { head, index };
}

function gitBlobSha(bytes: Buffer): string {
  return createHash("sha1")
    .update(`blob ${bytes.length}\0`, "utf8")
    .update(bytes)
    .digest("hex");
}

function normalizeFolder(folder: string): string {
  const normalized = folder.replace(/^\/+|\/+$/g, "");
  if (!normalized) throw new Error("target folder must not be empty");
  return normalized;
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^\w\u4e00-\u9fff.-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function stripTrailingExt(name: string, ext: string): string {
  const lower = name.toLowerCase();
  const lowerExt = ext.toLowerCase();
  if (lowerExt && lower.endsWith(lowerExt)) return name.slice(0, name.length - ext.length);
  for (const candidate of IMAGE_EXTS) {
    if (lower.endsWith(candidate)) return name.slice(0, name.length - candidate.length);
  }
  return name;
}

function makeLocalAsset(sourcePath: string, customName?: string): LocalAsset {
  if (!fs.existsSync(sourcePath) || !fs.statSync(sourcePath).isFile()) {
    throw new Error(`File not found: ${sourcePath}`);
  }
  const ext = path.extname(sourcePath);
  if (!IMAGE_EXTS.has(ext.toLowerCase())) throw new Error(`unsupported image extension: ${sourcePath}`);
  const originalBasename = path.basename(sourcePath, ext);
  const rawName = customName ? stripTrailingExt(customName, ext) : originalBasename;
  const baseName = sanitizeFilename(rawName);
  if (!baseName) throw new Error(`image name becomes empty after sanitization: ${sourcePath}`);
  const bytes = fs.readFileSync(sourcePath);
  return {
    sourcePath,
    originalFilename: path.basename(sourcePath),
    ext,
    baseName,
    bytes,
    localGitBlobSha: gitBlobSha(bytes),
  };
}

function listImagesInDir(dir: string): string[] {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    throw new Error(`directory not found: ${dir}`);
  }
  return fs.readdirSync(dir)
    .filter(file => IMAGE_EXTS.has(path.extname(file).toLowerCase()))
    .sort()
    .map(file => path.join(dir, file));
}

function loadLocalAssets(options: UploadOptions): LocalAsset[] {
  const stat = fs.existsSync(options.imagePath) ? fs.statSync(options.imagePath) : null;
  if (!stat) throw new Error(`File not found: ${options.imagePath}`);
  if (stat.isDirectory()) {
    const files = listImagesInDir(options.imagePath);
    if (files.length === 0) throw new Error(`no images found under directory: ${options.imagePath}`);
    return files.map(file => {
      const ext = path.extname(file);
      const base = path.basename(file, ext);
      const name = options.namePrefix ? `${options.namePrefix}-${base}` : base;
      return makeLocalAsset(file, name);
    });
  }
  return [makeLocalAsset(options.imagePath, options.customName)];
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Resolve a complete basename family before choosing a new suffix. */
function resolveCandidate(asset: LocalAsset, folder: string, remoteIndex: Map<string, string>): { filename: string; repoPath: string; action: "uploaded" | "reused" } {
  const family = new RegExp(
    `^${escapeRegExp(folder)}/${escapeRegExp(asset.baseName)}(?:-(\\d+))?${escapeRegExp(asset.ext)}$`
  );
  const candidates: Array<{ suffix: number; filename: string; repoPath: string; sha: string }> = [];

  for (const [repoPath, sha] of remoteIndex) {
    const match = repoPath.match(family);
    if (!match) continue;
    const suffix = match[1] ? Number.parseInt(match[1], 10) : 0;
    candidates.push({ suffix, filename: path.basename(repoPath), repoPath, sha });
  }
  candidates.sort((a, b) => a.suffix - b.suffix || a.repoPath.localeCompare(b.repoPath));

  const identical = candidates.find(candidate => candidate.sha === asset.localGitBlobSha);
  if (identical) {
    return { filename: identical.filename, repoPath: identical.repoPath, action: "reused" };
  }

  const usedSuffixes = new Set(candidates.map(candidate => candidate.suffix));
  let suffix = 0;
  while (usedSuffixes.has(suffix)) suffix += 1;
  const filename = suffix === 0
    ? `${asset.baseName}${asset.ext}`
    : `${asset.baseName}-${suffix}${asset.ext}`;
  return { filename, repoPath: `${folder}/${filename}`, action: "uploaded" };
}

function planBatch(assets: LocalAsset[], folder: string, remoteIndex: Map<string, string>): PlannedAsset[] {
  const workingIndex = new Map(remoteIndex);
  return assets.map(asset => {
    const candidate = resolveCandidate(asset, folder, workingIndex);
    if (candidate.action === "uploaded") workingIndex.set(candidate.repoPath, asset.localGitBlobSha);
    return { ...asset, ...candidate };
  });
}

function buildCdnUrls(filename: string, folder: string): { githubUrl: string; cdnUrl: string } {
  const repoPath = `${folder}/${filename}`;
  return {
    githubUrl: `https://github.com/${REPO_OWNER}/${REPO_NAME}/blob/${REPO_BRANCH}/${repoPath}`,
    cdnUrl: `https://cdn.jsdelivr.net/gh/${REPO_OWNER}/${REPO_NAME}@${REPO_BRANCH}/${repoPath}`,
  };
}

function isRefConflict(error: any): boolean {
  return /422|409|non-fast-forward|reference update failed|branch has changed/i.test(errorText(error));
}

function waitForRetry(delayMs: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, delayMs));
}

function createBlob(local: LocalAsset): string {
  const sha = ghApiPost(`repos/${REPO_OWNER}/${REPO_NAME}/git/blobs`, {
    encoding: "base64",
    content: local.bytes.toString("base64"),
  });
  if (sha !== local.localGitBlobSha) {
    throw new Error(`createBlob: GitHub returned ${sha}, expected local blob SHA ${local.localGitBlobSha}`);
  }
  return sha;
}

async function executeBatch(options: UploadOptions, assets: LocalAsset[]): Promise<BatchResult> {
  const folder = normalizeFolder(options.folder);
  const blobCache = new Map<string, string>();

  for (let attempt = 0; attempt < REF_RETRY_MAX; attempt += 1) {
    // A ref conflict always starts a fresh read and fresh content-aware plan.
    const remote = getRemoteState();
    const plan = planBatch(assets, folder, remote.index);
    const newAssets = plan.filter(asset => asset.action === "uploaded");

    if (newAssets.length === 0) {
      return { plan, map: Object.fromEntries(plan.map(asset => [asset.originalFilename, buildCdnUrls(asset.filename, folder).cdnUrl])) };
    }

    try {
      const blobShas = new Map<string, string>();
      for (const asset of newAssets) {
        let blobSha = blobCache.get(asset.localGitBlobSha);
        if (!blobSha) {
          blobSha = createBlob(asset);
          blobCache.set(asset.localGitBlobSha, blobSha);
        }
        blobShas.set(asset.localGitBlobSha, blobSha);
      }

      const treeSha = ghApiPost(`repos/${REPO_OWNER}/${REPO_NAME}/git/trees`, {
        base_tree: remote.head,
        tree: newAssets.map(asset => ({
          path: asset.repoPath,
          mode: "100644",
          type: "blob",
          sha: blobShas.get(asset.localGitBlobSha),
        })),
      });
      const commitSha = ghApiPost(`repos/${REPO_OWNER}/${REPO_NAME}/git/commits`, {
        message: `Add images: ${newAssets.map(asset => asset.filename).join(", ")}`,
        tree: treeSha,
        parents: [remote.head],
      });
      ghApiPatch(`repos/${REPO_OWNER}/${REPO_NAME}/git/refs/heads/${REPO_BRANCH}`, { sha: commitSha });

      return { plan, map: Object.fromEntries(plan.map(asset => [asset.originalFilename, buildCdnUrls(asset.filename, folder).cdnUrl])) };
    } catch (error: any) {
      const retryable = isRefConflict(error) || isRetryableNetworkError(error);
      if (retryable && attempt < REF_RETRY_MAX - 1) {
        const delay = REF_RETRY_BASE_MS * 2 ** attempt;
        console.warn(`[upload] remote transaction conflict/failure (attempt ${attempt + 1}/${REF_RETRY_MAX}), retrying in ${delay}ms...`);
        await waitForRetry(delay);
        continue;
      }
      throw new Error(`Upload transaction failed after ${attempt + 1} attempt(s): ${errorText(error)}`);
    }
  }

  throw new Error("Upload transaction failed: retry limit exceeded");
}

function writeAtomicJson(filePath: string, value: object): void {
  const target = path.resolve(filePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const temp = path.join(path.dirname(target), `.${path.basename(target)}.${process.pid}.${Date.now()}.tmp`);
  try {
    fs.writeFileSync(temp, JSON.stringify(value, null, 2) + "\n");
    fs.renameSync(temp, target);
  } catch (error) {
    try { fs.rmSync(temp, { force: true }); } catch {}
    throw error;
  }
}

function dryRunPlan(options: UploadOptions, assets: LocalAsset[]): PlannedAsset[] {
  const folder = normalizeFolder(options.folder);
  return assets.map(asset => {
    const filename = `${asset.baseName}${asset.ext}`;
    return { ...asset, filename, repoPath: `${folder}/${filename}`, action: "uploaded" };
  });
}

async function main(): Promise<void> {
  applyEnvConfig();
  const options = parseArgs();
  assertRepoConfigured();
  if (!options.imagePath) {
    throw new Error("usage: bun upload.ts <image-path-or-dir> [--name <name>|--name-prefix <prefix>] [--folder <folder>] [--repo <owner/name@branch:folder>] [--output <image-map.json>] [--dry-run]");
  }

  const assets = loadLocalAssets(options);
  const isDirectory = fs.statSync(options.imagePath).isDirectory();

  if (options.dryRun) {
    const plan = dryRunPlan(options, assets);
    if (isDirectory) {
      console.log(JSON.stringify({ success: true, dry_run: true, uploaded: 0, reused: 0, total: plan.length }, null, 2));
    } else {
      const folder = normalizeFolder(options.folder);
      const urls = buildCdnUrls(plan[0].filename, folder);
      console.log(JSON.stringify({ success: true, action: "preview", filename: plan[0].filename, folder, ...urls }, null, 2));
    }
    return;
  }

  const result = await executeBatch(options, assets);
  const uploaded = result.plan.filter(asset => asset.action === "uploaded").length;
  const reused = result.plan.length - uploaded;

  if (isDirectory) {
    if (options.output) writeAtomicJson(options.output, result.map);
    console.log(JSON.stringify({ success: true, uploaded, reused, total: result.plan.length }, null, 2));
    return;
  }

  const asset = result.plan[0];
  const folder = normalizeFolder(options.folder);
  const urls = buildCdnUrls(asset.filename, folder);
  console.log(JSON.stringify({
    success: true,
    action: asset.action,
    filename: asset.filename,
    folder,
    ...urls,
  }, null, 2));
}

main().catch(error => {
  console.error(`[upload] error: ${error?.message ?? error}`);
  process.exit(1);
});

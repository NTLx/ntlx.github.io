#!/usr/bin/env bun
/**
 * GitHub Image Hosting Upload Script
 *
 * Uploads images to NTLx/Pic repository using GitHub API and returns jsDelivr CDN URLs.
 *
 * Two invocation modes:
 *
 *   1) Single file:
 *      bun upload.ts <image-path> [--name <custom-name>] [--folder <folder>] [--repo <owner/name@branch:folder>]
 *
 *   2) Directory (batch):
 *      bun upload.ts <directory> --name-prefix <prefix> [--folder <folder>] [--repo <owner/name@branch:folder>] [--output <image-map.json>]
 *      → traverses all images in <directory>, uploads with name = `${prefix}-${basename-no-ext}`
 *      → writes image-map.json: { "<original-filename>": "<cdn-url>", ... }
 *
 * Options:
 *   --name <name>          Custom filename (without extension). Single-file mode only.
 *   --name-prefix <prefix> Filename prefix for directory mode.
 *   --folder <path>        Target folder in repo (default: blog). Equivalent to `:folder` part of --repo.
 *   --repo <spec>          Spec format: `owner/name@branch:folder`. Overrides REPO_OWNER/REPO_NAME/folder.
 *   --output <path>        Directory mode only: write image-map.json to <path>.
 *   --dry-run              Show what would be uploaded without actually uploading.
 *
 * Notes:
 *   - The script automatically strips a trailing extension from --name / --name-prefix-derived names
 *     to avoid double-extension bugs (e.g. `01-foo.jpg.jpg`).
 *   - Repository defaults can be configured via .github-image-hosting.env files:
 *       Project-level: <git-root>/.github-image-hosting.env  (higher priority)
 *       User-level:    ~/.github-image-hosting.env            (fallback)
 *     CLI args (--repo / --folder) override env config.
 *     Env keys: GITHUB_IMAGE_REPO_OWNER, GITHUB_IMAGE_REPO_NAME,
 *               GITHUB_IMAGE_REPO_BRANCH, GITHUB_IMAGE_DEFAULT_FOLDER
 */

import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

let REPO_OWNER = 'NTLx';
let REPO_NAME = 'Pic';
let REPO_BRANCH = 'master';
let DEFAULT_FOLDER = 'blog';

const ENV_FILE_NAME = '.github-image-hosting.env';

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);

interface UploadOptions {
  imagePath: string;
  customName?: string;
  namePrefix?: string;
  folder: string;
  output?: string;
  dryRun: boolean;
}

interface UploadResult {
  success: boolean;
  filename: string;
  folder: string;
  githubUrl: string;
  cdnUrl: string;
  error?: string;
}

/** Walk up from CWD to find git project root */
function findProjectRoot(): string | null {
  let dir = process.cwd();
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, '.git'))) return dir;
    dir = path.dirname(dir);
  }
  return null;
}

/** Parse simple KEY=VALUE env file (skips comments and blank lines) */
function parseEnvFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf-8');
  const config: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    config[key] = value;
  }
  return config;
}

/**
 * Apply config from env files to global defaults.
 * Priority: project-level .github-image-hosting.env > user-level ~/.github-image-hosting.env > hardcoded defaults.
 * CLI args (--repo / --folder) override env config later in parseArgs.
 */
function applyEnvConfig(): void {
  const KEYS = [
    ['GITHUB_IMAGE_REPO_OWNER', 'REPO_OWNER'],
    ['GITHUB_IMAGE_REPO_NAME', 'REPO_NAME'],
    ['GITHUB_IMAGE_REPO_BRANCH', 'REPO_BRANCH'],
    ['GITHUB_IMAGE_DEFAULT_FOLDER', 'DEFAULT_FOLDER'],
  ] as const;

  // User-level config (~/.github-image-hosting.env) — lower priority
  const userConfig = parseEnvFile(path.join(os.homedir(), ENV_FILE_NAME));

  // Project-level config (.github-image-hosting.env at git root) — higher priority
  const projectRoot = findProjectRoot();
  const projectConfig = projectRoot
    ? parseEnvFile(path.join(projectRoot, ENV_FILE_NAME))
    : {};

  // Apply user config first, then project config overrides it
  for (const [envKey, globalVar] of KEYS) {
    if (userConfig[envKey] || projectConfig[envKey]) {
      const value = projectConfig[envKey] || userConfig[envKey];
      switch (globalVar) {
        case 'REPO_OWNER':    REPO_OWNER    = value; break;
        case 'REPO_NAME':     REPO_NAME     = value; break;
        case 'REPO_BRANCH':   REPO_BRANCH   = value; break;
        case 'DEFAULT_FOLDER': DEFAULT_FOLDER = value; break;
      }
    }
  }
}

function parseRepoSpec(spec: string, options: UploadOptions): void {
  // owner/name@branch:folder
  const m = spec.match(/^([^/]+)\/([^@:]+)(?:@([^:]+))?(?::(.+))?$/);
  if (!m) {
    throw new Error(`invalid --repo spec: ${spec}`);
  }
  REPO_OWNER = m[1];
  REPO_NAME = m[2];
  if (m[3]) REPO_BRANCH = m[3];
  if (m[4]) options.folder = m[4];
}

function parseArgs(): UploadOptions {
  const args = process.argv.slice(2);
  const options: UploadOptions = {
    imagePath: '',
    folder: DEFAULT_FOLDER,
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--name' && args[i + 1]) {
      options.customName = args[++i];
    } else if (arg === '--name-prefix' && args[i + 1]) {
      options.namePrefix = args[++i];
    } else if (arg === '--folder' && args[i + 1]) {
      options.folder = args[++i];
    } else if (arg === '--repo' && args[i + 1]) {
      parseRepoSpec(args[++i], options);
    } else if (arg === '--output' && args[i + 1]) {
      options.output = args[++i];
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (!arg.startsWith('-') && !options.imagePath) {
      options.imagePath = arg;
    }
  }

  return options;
}

function ghApiGet(endpoint: string): string {
  const result = execFileSync('gh', ['api', endpoint, '--jq', '.sha // .object.sha // empty'], {
    encoding: 'utf-8',
    timeout: 30000,
    stdio: ['pipe', 'pipe', 'pipe']
  });
  return result.trim();
}

function ghApiPost(endpoint: string, payload: object): string {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gh-api-payload-'));
  const tempFile = path.join(tempDir, 'payload.json');
  fs.writeFileSync(tempFile, JSON.stringify(payload));
  try {
    const result = execFileSync('gh', ['api', endpoint, '--input', tempFile, '--jq', '.sha // empty'], {
      encoding: 'utf-8',
      timeout: 60000,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return result.trim();
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

function ghApiPatch(endpoint: string, payload: object): void {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gh-api-payload-'));
  const tempFile = path.join(tempDir, 'payload.json');
  fs.writeFileSync(tempFile, JSON.stringify(payload));
  try {
    execFileSync('gh', ['api', endpoint, '--input', tempFile], {
      encoding: 'utf-8',
      timeout: 30000,
      stdio: ['pipe', 'pipe', 'pipe']
    });
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

async function getExistingFiles(): Promise<Set<string>> {
  try {
    const result = execFileSync('gh', [
      'api',
      `repos/${REPO_OWNER}/${REPO_NAME}/git/trees/${REPO_BRANCH}?recursive=1`,
      '--jq',
      '.tree[].path',
    ], {
      encoding: 'utf-8',
      timeout: 30000,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return new Set(result.trim().split('\n').filter(Boolean));
  } catch {
    console.warn('Warning: Could not fetch existing files, proceeding without collision check');
    return new Set();
  }
}

function generateUniqueFilename(baseName: string, ext: string, folder: string, existingFiles: Set<string>): string {
  let filename = `${baseName}${ext}`;
  let counter = 1;

  while (existingFiles.has(`${folder}/${filename}`)) {
    filename = `${baseName}-${counter}${ext}`;
    counter++;
  }

  return filename;
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^\w\u4e00-\u9fff.-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

// 防止双扩展名（baoyu-imagine 输出 + 流水线传 --name 时已带 .jpg → 拼接后变 .jpg.jpg）
function stripTrailingExt(name: string, ext: string): string {
  const lower = name.toLowerCase();
  const lext = ext.toLowerCase();
  if (lext && lower.endsWith(lext)) {
    return name.slice(0, name.length - ext.length);
  }
  // 同时去除常见图片扩展名（即便传入 ext 不是图片）
  for (const e of IMAGE_EXTS) {
    if (lower.endsWith(e)) return name.slice(0, name.length - e.length);
  }
  return name;
}

async function uploadImage(options: UploadOptions): Promise<UploadResult> {
  const { imagePath, customName, folder, dryRun } = options;

  if (!fs.existsSync(imagePath)) {
    return {
      success: false,
      filename: '',
      folder,
      githubUrl: '',
      cdnUrl: '',
      error: `File not found: ${imagePath}`,
    };
  }

  const ext = path.extname(imagePath);
  const originalBasename = path.basename(imagePath, ext);
  // 去掉 customName 末尾可能重复的扩展名，再 sanitize
  const rawName = customName ? stripTrailingExt(customName, ext) : originalBasename;
  const baseName = sanitizeFilename(rawName);

  const existingFiles = await getExistingFiles();
  const filename = generateUniqueFilename(baseName, ext, folder, existingFiles);
  const repoPath = `${folder}/${filename}`;

  if (dryRun) {
    return {
      success: true,
      filename,
      folder,
      githubUrl: `https://github.com/${REPO_OWNER}/${REPO_NAME}/blob/${REPO_BRANCH}/${repoPath}`,
      cdnUrl: `https://cdn.jsdelivr.net/gh/${REPO_OWNER}/${REPO_NAME}@${REPO_BRANCH}/${repoPath}`,
    };
  }

  // Read file and encode once (reused across retries)
  const fileContent = fs.readFileSync(imagePath);
  const base64Content = fileContent.toString('base64');

  // Create blob once (immutable, reusable across retries)
  const blobSha = ghApiPost(`repos/${REPO_OWNER}/${REPO_NAME}/git/blobs`, {
    encoding: 'base64',
    content: base64Content
  });

  const MAX_RETRIES = 3;
  const BASE_DELAY_MS = 1000;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      // Re-read HEAD on every attempt (may have moved due to concurrent uploads)
      const currentSha = ghApiGet(`repos/${REPO_OWNER}/${REPO_NAME}/git/refs/heads/${REPO_BRANCH}`);

      // Create tree against current HEAD
      const treeSha = ghApiPost(`repos/${REPO_OWNER}/${REPO_NAME}/git/trees`, {
        base_tree: currentSha,
        tree: [{
          path: repoPath,
          mode: '100644',
          type: 'blob',
          sha: blobSha
        }]
      });

      // Create commit
      const commitSha = ghApiPost(`repos/${REPO_OWNER}/${REPO_NAME}/git/commits`, {
        message: `Add: ${filename}`,
        tree: treeSha,
        parents: [currentSha]
      });

      // Update reference
      ghApiPatch(`repos/${REPO_OWNER}/${REPO_NAME}/git/refs/heads/${REPO_BRANCH}`, { sha: commitSha });

      return {
        success: true,
        filename,
        folder,
        githubUrl: `https://github.com/${REPO_OWNER}/${REPO_NAME}/blob/${REPO_BRANCH}/${repoPath}`,
        cdnUrl: `https://cdn.jsdelivr.net/gh/${REPO_OWNER}/${REPO_NAME}@${REPO_BRANCH}/${repoPath}`,
      };
    } catch (error: any) {
      const msg = error?.stderr ?? error?.message ?? String(error);
      const isRefConflict = /422|409|non-fast-forward/i.test(msg);

      if (isRefConflict && attempt < MAX_RETRIES - 1) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt);
        console.warn(`[upload] ref conflict (attempt ${attempt + 1}/${MAX_RETRIES}), retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      return {
        success: false,
        filename,
        folder,
        githubUrl: '',
        cdnUrl: '',
        error: `Upload failed after ${attempt + 1} attempt(s): ${msg}`,
      };
    }
  }

  // Should not reach here, but satisfy TypeScript
  return {
    success: false,
    filename,
    folder,
    githubUrl: '',
    cdnUrl: '',
    error: 'Upload failed: max retries exceeded',
  };
}

function listImagesInDir(dir: string): string[] {
  return fs.readdirSync(dir)
    .filter((f) => IMAGE_EXTS.has(path.extname(f).toLowerCase()))
    .sort()
    .map((f) => path.join(dir, f));
}

async function uploadDirectory(options: UploadOptions): Promise<{ ok: boolean; map: Record<string, string>; results: UploadResult[] }> {
  const dir = options.imagePath;
  const files = listImagesInDir(dir);
  if (files.length === 0) {
    throw new Error(`no images found under directory: ${dir}`);
  }
  const map: Record<string, string> = {};
  const results: UploadResult[] = [];
  let ok = true;
  for (const file of files) {
    const ext = path.extname(file);
    const base = path.basename(file, ext); // e.g. 01-spectrum-comparison
    // name 由 prefix + base 拼接；upload 内部会再去掉重复 ext
    const name = options.namePrefix ? `${options.namePrefix}-${base}` : base;
    const r = await uploadImage({ ...options, imagePath: file, customName: name });
    results.push(r);
    if (r.success) {
      // image-map.json key 用本地原始文件名（含扩展名），与 apply-image-map.mjs 约定一致
      map[`${base}${ext}`] = r.cdnUrl;
    } else {
      ok = false;
      console.error(`[upload] FAIL: ${file} → ${r.error}`);
    }
  }
  return { ok, map, results };
}

// Main
applyEnvConfig(); // Load env config before parsing CLI args (CLI args override env)
const options = parseArgs();

if (!options.imagePath) {
  console.error('Usage: bun upload.ts <image-path-or-dir> [--name <name>|--name-prefix <prefix>] [--folder <folder>] [--repo <owner/name@branch:folder>] [--output <image-map.json>]');
  process.exit(1);
}

const stat = fs.existsSync(options.imagePath) ? fs.statSync(options.imagePath) : null;

if (stat && stat.isDirectory()) {
  // 目录模式
  uploadDirectory(options).then(({ ok, map, results }) => {
    if (options.output) {
      fs.mkdirSync(path.dirname(options.output), { recursive: true });
      fs.writeFileSync(options.output, JSON.stringify(map, null, 2) + '\n');
      console.log(`written: ${options.output} (${Object.keys(map).length} entries)`);
    } else {
      console.log(JSON.stringify({ map, results }, null, 2));
    }
    if (!ok) process.exit(1);
  }).catch((e) => {
    console.error(`[upload] error: ${e?.message ?? e}`);
    process.exit(1);
  });
} else {
  // 单文件模式
  uploadImage(options).then((r) => {
    if (r.success) {
      console.log(JSON.stringify(r, null, 2));
    } else {
      console.error(JSON.stringify(r, null, 2));
      process.exit(1);
    }
  });
}

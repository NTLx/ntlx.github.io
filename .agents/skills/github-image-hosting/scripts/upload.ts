#!/usr/bin/env bun
/**
 * GitHub Image Hosting Upload Script
 * 
 * Uploads images to NTLx/Pic repository using GitHub API and returns jsDelivr CDN URLs.
 * 
 * Usage:
 *   bun upload.ts <image-path> [--name <custom-name>] [--folder <folder>]
 * 
 * Options:
 *   --name <name>     Custom filename (without extension)
 *   --folder <path>   Target folder in repo (default: Jarvis)
 *   --dry-run         Show what would be uploaded without actually uploading
 */

import { spawnSync, execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const REPO_OWNER = 'NTLx';
const REPO_NAME = 'Pic';
const DEFAULT_FOLDER = 'Jarvis';

interface UploadOptions {
  imagePath: string;
  customName?: string;
  folder: string;
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
    } else if (arg === '--folder' && args[i + 1]) {
      options.folder = args[++i];
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (!arg.startsWith('-') && !options.imagePath) {
      options.imagePath = arg;
    }
  }

  return options;
}

function ghApiGet(endpoint: string): string {
  const result = execSync(`gh api ${endpoint} --jq '.sha // .object.sha // empty'`, {
    encoding: 'utf-8',
    timeout: 30000,
    stdio: ['pipe', 'pipe', 'pipe']
  });
  return result.trim();
}

function ghApiPost(endpoint: string, payload: object): string {
  const tempFile = `/tmp/gh-api-payload-${Date.now()}.json`;
  fs.writeFileSync(tempFile, JSON.stringify(payload));
  try {
    const result = execSync(`gh api ${endpoint} --input ${tempFile} --jq '.sha // empty'`, {
      encoding: 'utf-8',
      timeout: 60000,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return result.trim();
  } finally {
    fs.unlinkSync(tempFile);
  }
}

function ghApiPatch(endpoint: string, payload: object): void {
  const tempFile = `/tmp/gh-api-payload-${Date.now()}.json`;
  fs.writeFileSync(tempFile, JSON.stringify(payload));
  try {
    execSync(`gh api ${endpoint} --input ${tempFile}`, {
      encoding: 'utf-8',
      timeout: 30000,
      stdio: ['pipe', 'pipe', 'pipe']
    });
  } finally {
    fs.unlinkSync(tempFile);
  }
}

async function getExistingFiles(): Promise<Set<string>> {
  try {
    const result = execSync(`gh api repos/${REPO_OWNER}/${REPO_NAME}/git/trees/master?recursive=1 --jq '.tree[].path'`, {
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
  const baseName = sanitizeFilename(customName || originalBasename);

  const existingFiles = await getExistingFiles();
  const filename = generateUniqueFilename(baseName, ext, folder, existingFiles);
  const repoPath = `${folder}/${filename}`;

  if (dryRun) {
    return {
      success: true,
      filename,
      folder,
      githubUrl: `https://github.com/${REPO_OWNER}/${REPO_NAME}/blob/master/${repoPath}`,
      cdnUrl: `https://cdn.jsdelivr.net/gh/${REPO_OWNER}/${REPO_NAME}@master/${repoPath}`,
    };
  }

  try {
    // Read file and encode to base64
    const fileContent = fs.readFileSync(imagePath);
    const base64Content = fileContent.toString('base64');

    // Get current commit SHA
    const currentSha = ghApiGet(`repos/${REPO_OWNER}/${REPO_NAME}/git/refs/heads/master`);

    // Create blob
    const blobSha = ghApiPost(`repos/${REPO_OWNER}/${REPO_NAME}/git/blobs`, {
      encoding: 'base64',
      content: base64Content
    });

    // Create tree
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
    ghApiPatch(`repos/${REPO_OWNER}/${REPO_NAME}/git/refs/heads/master`, { sha: commitSha });

    return {
      success: true,
      filename,
      folder,
      githubUrl: `https://github.com/${REPO_OWNER}/${REPO_NAME}/blob/master/${repoPath}`,
      cdnUrl: `https://cdn.jsdelivr.net/gh/${REPO_OWNER}/${REPO_NAME}@master/${repoPath}`,
    };
  } catch (error) {
    return {
      success: false,
      filename,
      folder,
      githubUrl: '',
      cdnUrl: '',
      error: `Upload failed: ${error}`,
    };
  }
}

// Main
const options = parseArgs();

if (!options.imagePath) {
  console.error('Usage: bun upload.ts <image-path> [--name <custom-name>] [--folder <folder>]');
  process.exit(1);
}

uploadImage(options).then((r) => {
  if (r.success) {
    console.log(JSON.stringify(r, null, 2));
  } else {
    console.error(JSON.stringify(r, null, 2));
    process.exit(1);
  }
});
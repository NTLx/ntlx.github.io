---
name: github-image-hosting
description: Upload images to a GitHub repository for image hosting and return jsDelivr CDN URLs. Use when user wants to upload images for blog, WeChat articles, or needs CDN-accessible image URLs. Supports automatic filename collision detection, custom naming, and per-project repository configuration via .github-image-hosting.env files.
version: 1.1.0
author: NTLx
license: MIT
---

# GitHub Image Hosting

Upload images to a GitHub repository and get jsDelivr CDN URLs for reliable access in China. Repository is configurable via `.github-image-hosting.env` files.

## Agent Behavior Rules (Critical)

These rules prevent non-deterministic behavior. Follow them exactly.

1. **Never pass `--folder`** unless the user explicitly requests a different folder. The script reads the target folder from config files automatically. Passing `--folder` from agent intuition is the root cause of images scattering across inconsistent folders.

2. **Always trust the script's `cdnUrl` output.** The JSON response contains the exact CDN URL. Copy it verbatim. Never construct URLs by guessing `owner/name@branch/folder/filename` — the script may have applied collision-avoidance suffixes (`-1`, `-2`) that your guess won't match.

3. **Never run `gh api` directly** to upload images or query repository state. All GitHub operations are encapsulated in the upload script.

4. **Typical invocation is just the image path:**
   ```bash
   bun .agents/skills/github-image-hosting/scripts/upload.ts /path/to/image.png
   ```
   That's it. The script handles repo, branch, folder, collision detection, and CDN URL generation from config.

## Configuration

The target repository is resolved from (highest to lowest priority):

1. **CLI `--repo`** flag — one-off override for any invocation
2. **Project-level** `<git-root>/.github-image-hosting.env` — per-project config, tracked in git
3. **User-level** `~/.github-image-hosting.env` — personal default across all projects
4. **Hardcoded defaults** in the script — `NTLx/Pic@master` with folder `blog`

### Env file format

Create `.github-image-hosting.env` at the project git root (or `~/.github-image-hosting.env` for a user-level default):

```bash
# .github-image-hosting.env
GITHUB_IMAGE_REPO_OWNER=NTLx        # GitHub repo owner (username or org)
GITHUB_IMAGE_REPO_NAME=Pic          # GitHub repo name
GITHUB_IMAGE_REPO_BRANCH=master     # Branch to push images to
GITHUB_IMAGE_DEFAULT_FOLDER=blog    # Default folder path inside the repo
```

All four keys are optional — only override the values you want to change. If no env file exists, the script falls back to hardcoded defaults (`NTLx/Pic@master`, folder `blog`).

## When to Use

- Uploading images for blog posts, WeChat articles, or documentation
- Need CDN-accessible image URLs that work in China
- Hosting images for markdown documents or web content

## Quick Start

```bash
bun .agents/skills/github-image-hosting/scripts/upload.ts <image-path>
```

The script reads all config (repo, branch, folder) from `.github-image-hosting.env` files and outputs a JSON object with `cdnUrl`. Use that URL directly in your markdown/HTML.

**Output** (deterministic — copy `cdnUrl` verbatim):

```json
{
  "success": true,
  "filename": "image.png",
  "folder": "blog",
  "githubUrl": "https://github.com/NTLx/Pic/blob/master/blog/image.png",
  "cdnUrl": "https://cdn.jsdelivr.net/gh/NTLx/Pic@master/blog/image.png"
}
```

## Options

| Option | Description |
|--------|-------------|
| `--name <name>` | Custom filename (without extension) |
| `--folder <path>` | Target folder (default from config or `blog`) |
| `--repo <spec>` | Override repository: `owner/name@branch:folder` |
| `--dry-run` | Preview upload without actually uploading |

## Workflow

### Step 1: Prepare Image Path

Get the absolute or relative path to the image file.

### Step 2: Upload

```bash
# Basic upload (repo and folder from config)
bun skills/github-image-hosting/scripts/upload.ts /path/to/image.png

# Custom filename
bun skills/github-image-hosting/scripts/upload.ts /path/to/image.png --name my-custom-name

# Custom folder (overrides config default)
bun skills/github-image-hosting/scripts/upload.ts /path/to/image.png --folder screenshots

# One-off different repository
bun skills/github-image-hosting/scripts/upload.ts /path/to/image.png --repo AnotherUser/Images@main:blog

# Preview without uploading
bun skills/github-image-hosting/scripts/upload.ts /path/to/image.png --dry-run
```

### Step 3: Use CDN URL

The script returns:

```json
{
  "success": true,
  "filename": "image.png",
  "folder": "blog",
  "githubUrl": "https://github.com/NTLx/Pic/blob/master/blog/image.png",
  "cdnUrl": "https://cdn.jsdelivr.net/gh/NTLx/Pic@master/blog/image.png"
}
```

Use `cdnUrl` for reliable access in China.

## Features

### Filename Collision Detection

Automatically checks for existing files and appends `-1`, `-2`, etc. if needed.

**Example**:
- `image.png` exists → uploads as `image-1.png`
- `image-1.png` exists → uploads as `image-2.png`

### Sanitization

Filenames are automatically sanitized:
- Chinese characters preserved
- Special characters replaced with hyphens
- Lowercase conversion for consistency

### Default Folder

Folder defaults to `GITHUB_IMAGE_DEFAULT_FOLDER` from config (or `blog` if unset). Use `--folder` to override per invocation.

### Directory Mode Optimization

When uploading a directory of images (batch mode), the script fetches the repository file tree **once** and shares it across all uploads in the batch. This avoids N redundant API calls for N images, significantly reducing the chance of `ETIMEDOUT` errors on large repositories.

### Network Timeout Retry

All GitHub API calls (`gh api`) have built-in retry logic for network-level failures (`ETIMEDOUT`, `ECONNRESET`, `ECONNREFUSED`):
- File tree fetch: 60s timeout (accommodates large repos with 1000+ files)
- Other API calls: 30s timeout
- Up to 2 automatic retries with exponential backoff (2s → 4s) on network timeouts
- Git reference conflicts (422/409) are retried up to 3 times with exponential backoff

This means transient network issues should not require manual intervention from the caller.

## Requirements

- **`gh` CLI** authenticated with GitHub (the script uses `gh api` for all GitHub operations — no tokens in code)
- **`bun`** runtime
- **Write access** to the configured GitHub repository
- **`.github-image-hosting.env`** at project root (recommended, tracks repo config in git; if absent, hardcoded defaults apply)
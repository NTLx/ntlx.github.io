---
name: github-image-hosting
description: Upload images to a GitHub repository for image hosting and return jsDelivr CDN URLs. Use when user wants to upload images for blog, WeChat articles, or needs CDN-accessible image URLs. Supports automatic filename collision detection, custom naming, and per-project repository configuration via .github-image-hosting.env files.
---

# GitHub Image Hosting

Upload images to a GitHub repository and get jsDelivr CDN URLs for reliable access in China. Repository is configurable via `.github-image-hosting.env` files.

## Configuration

The target repository is resolved from (highest to lowest priority):

1. **CLI `--repo`** flag — one-off override for any invocation
2. **Project-level** `<git-root>/.github-image-hosting.env` — per-project config, tracked in git
3. **User-level** `~/.github-image-hosting.env` — personal default across all projects
4. **Hardcoded defaults** in the script — `NTLx/Pic@master` with folder `Jarvis`

### Env file format

Create `.github-image-hosting.env` at the project git root (or `~/.github-image-hosting.env` for a user-level default):

```bash
# .github-image-hosting.env
GITHUB_IMAGE_REPO_OWNER=NTLx        # GitHub repo owner (username or org)
GITHUB_IMAGE_REPO_NAME=Pic          # GitHub repo name
GITHUB_IMAGE_REPO_BRANCH=master     # Branch to push images to
GITHUB_IMAGE_DEFAULT_FOLDER=Jarvis  # Default folder path inside the repo
```

All four keys are optional — only override the values you want to change. If no env file exists, the script falls back to hardcoded defaults (`NTLx/Pic@master`, folder `Jarvis`).

## When to Use

- Uploading images for blog posts, WeChat articles, or documentation
- Need CDN-accessible image URLs that work in China
- Hosting images for markdown documents or web content

## Quick Start

```bash
bun skills/github-image-hosting/scripts/upload.ts <image-path>
```

**Output**: JSON with `cdnUrl` (jsDelivr) and `githubUrl` (original)

## Options

| Option | Description |
|--------|-------------|
| `--name <name>` | Custom filename (without extension) |
| `--folder <path>` | Target folder (default from config or `Jarvis`) |
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

# Custom folder
bun skills/github-image-hosting/scripts/upload.ts /path/to/image.png --folder blog

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
  "folder": "Jarvis",
  "githubUrl": "https://github.com/NTLx/Pic/blob/master/Jarvis/image.png",
  "cdnUrl": "https://cdn.jsdelivr.net/gh/NTLx/Pic@master/Jarvis/image.png"
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

Folder defaults to `GITHUB_IMAGE_DEFAULT_FOLDER` from config (or `Jarvis` if unset). Use `--folder` to override per invocation.

## Requirements

- **`gh` CLI** authenticated with GitHub (the script uses `gh api` for all GitHub operations — no tokens in code)
- **`bun`** runtime
- **Write access** to the configured GitHub repository
- **`.github-image-hosting.env`** at project root (recommended, tracks repo config in git; if absent, hardcoded defaults apply)
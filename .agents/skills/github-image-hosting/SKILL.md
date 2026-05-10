---
name: github-image-hosting
description: Upload images to GitHub repository (NTLx/Pic) for image hosting and return jsDelivr CDN URLs. Use when user wants to upload images for blog, WeChat articles, or needs CDN-accessible image URLs. Supports automatic filename collision detection and custom naming.
---

# GitHub Image Hosting

Upload images to NTLx/Pic repository and get jsDelivr CDN URLs for reliable access in China.

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
| `--folder <path>` | Target folder (default: Jarvis) |
| `--dry-run` | Preview upload without actually uploading |

## Workflow

### Step 1: Prepare Image Path

Get the absolute or relative path to the image file.

### Step 2: Upload

```bash
# Basic upload (auto-generated filename, Jarvis folder)
bun skills/github-image-hosting/scripts/upload.ts /path/to/image.png

# Custom filename
bun skills/github-image-hosting/scripts/upload.ts /path/to/image.png --name my-custom-name

# Custom folder
bun skills/github-image-hosting/scripts/upload.ts /path/to/image.png --folder blog

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

Images are uploaded to `Jarvis/` folder by default. Use `--folder` to specify a different location.

## Requirements

- `gh` CLI authenticated with GitHub
- `bun` runtime
- Write access to NTLx/Pic repository

## Example

```bash
# Upload Oh My OpenCode architecture diagram
bun skills/github-image-hosting/scripts/upload.ts \
  omo-infographic.png \
  --name omo-agents-architecture

# Result:
# CDN URL: https://cdn.jsdelivr.net/gh/NTLx/Pic@master/Jarvis/omo-agents-architecture.png
```
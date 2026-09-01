---
name: github-image-hosting
description: Upload images to a configured GitHub repository for CDN-accessible URLs. Use when a user or an supervising repository workflow needs to publish image assets.
license: MIT
metadata:
  author: NTLx
  version: "1.5.0"
---

# GitHub Image Hosting

This Skill publishes image files to a configured GitHub repository and returns
the real GitHub and jsDelivr URLs. GitHub's Git tree is the source of truth for
remote state; no local registry or image manifest is required.

## Configuration

Configuration is resolved in this order:

1. CLI `--repo owner/name@branch:folder` (one-off override)
2. Project `<git-root>/.github-image-hosting.env`
3. User `~/.github-image-hosting.env`

The repository must be explicitly configured. The script fails closed when no
owner and repository name are supplied; it never silently writes to the
built-in example values.

```bash
GITHUB_IMAGE_REPO_OWNER=NTLx
GITHUB_IMAGE_REPO_NAME=Pic
GITHUB_IMAGE_REPO_BRANCH=master
GITHUB_IMAGE_DEFAULT_FOLDER=blog
```

The default folder is suitable for ad-hoc use. A supervising deterministic
workflow may pass its protocol folder explicitly, for example
`--folder wechat-articles`. An ad-hoc caller should not guess a folder.

## Invocation

```bash
# Single file
bun .agents/skills/github-image-hosting/scripts/upload.ts /path/to/image.png

# Custom single-file name
bun .agents/skills/github-image-hosting/scripts/upload.ts /path/to/image.png \
  --name my-custom-name

# Directory batch and canonical flat image map
bun .agents/skills/github-image-hosting/scripts/upload.ts /path/to/imgs \
  --folder wechat-articles \
  --name-prefix 2026-09-01-example-img \
  --output /path/to/image-map.json

# One-off repository override
bun .agents/skills/github-image-hosting/scripts/upload.ts /path/to/image.png \
  --repo AnotherUser/Images@main:blog

# Local preview; no GitHub mutation
bun .agents/skills/github-image-hosting/scripts/upload.ts /path/to/image.png --dry-run
```

Supported options remain `--name`, `--name-prefix`, `--folder`, `--repo`,
`--output`, and `--dry-run`. `--name` is for single-file mode;
`--name-prefix` is for directory mode.

## Idempotency and collision semantics

Idempotency is the default behavior; there is no idempotency flag. For every
local file the script computes the Git blob SHA:

```text
SHA1("blob " + byteLength + "\0" + fileBytes)
```

The remote recursive Git tree is indexed as `repoPath → blob SHA`, considering
only `type === "blob"`. The complete basename family is scanned before a
decision is made:

- `foo.png` with the same blob SHA → reuse `foo.png`.
- `foo.png` with different bytes → choose the smallest free suffix,
  `foo-1.png`.
- `foo-1.png` already contains the local bytes → reuse `foo-1.png`, even when
  `foo.png` differs.
- Gaps are preserved while searching for an existing identical suffix.

An existing path is never overwritten. Human-readable names remain stable;
suffixes are introduced only when the logical name's bytes actually change.
This also preserves jsDelivr cache correctness.

Retrying the exact same file or directory is safe. If every asset is already
present with the same bytes, the result is a real CDN map and the run creates
zero blobs, trees, commits, or ref updates.

## Directory transaction

Directory mode performs one planning pass:

1. Read all local bytes and calculate their local Git blob SHAs.
2. Read the current branch HEAD and one complete recursive tree index.
3. Resolve every asset with content-aware collision rules.
4. Create each distinct new blob at most once for this batch.
5. Create one tree, one commit, and one branch ref update for all new paths.

If a ref changes concurrently, the Skill rereads HEAD and the complete remote
index and replans every path. It never retries a stale path plan. A concurrent
writer that won the race with identical content therefore becomes a reuse;
different content receives a new suffix.

## Fail-closed and retry rules

Failure to read branch HEAD, failure to parse a GitHub response, a malformed
tree, or `truncated: true` always fails the operation before any mutation. An
incomplete remote index is never treated as an empty repository, so an output
map is not replaced after a failed transaction.

GitHub network/transient failures and ref conflicts are retried inside this
Skill. Callers must not add their own upload retry loop or rerun the directory
uploader after an indeterminate result.

## Output contract

Single-file stdout retains the URL fields and adds `action`:

```json
{
  "success": true,
  "action": "uploaded",
  "filename": "image.png",
  "folder": "blog",
  "githubUrl": "https://github.com/NTLx/Pic/blob/master/blog/image.png",
  "cdnUrl": "https://cdn.jsdelivr.net/gh/NTLx/Pic@master/blog/image.png"
}
```

Directory `--output` is written atomically only after the remote transaction
succeeds, using the canonical flat map consumed by article pipelines:

```json
{
  "00-infographic.png": "https://cdn.jsdelivr.net/gh/NTLx/Pic@master/wechat-articles/00-infographic.png"
}
```

Directory stdout is a diagnostic summary with `success`, `uploaded`,
`reused`, and `total`; callers should consume `--output`, not parse diagnostics.

## Requirements

- `gh` authenticated with write access to the configured repository
- `bun` runtime
- Project or user `.github-image-hosting.env`, or an explicit `--repo`

Never invoke `gh api` directly for image operations. All GitHub API calls,
remote indexing, collision resolution, transaction handling, URL construction,
and retry behavior belong to this Skill.

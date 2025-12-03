---
title: Tmux 使用指南
description: Tmux 终端复用器使用
---

![Tmux Demo](https://cloud.githubusercontent.com/assets/553208/19740585/85596a5a-9bbf-11e6-8aa1-7c8d9829c008.gif)

This guide recommends using the popular [Oh My Tmux!](https://github.com/gpakosz/.tmux) configuration for a powerful and user-friendly Tmux experience.

## 1. Installation

To install this configuration:

```bash
cd
git clone https://github.com/gpakosz/.tmux.git
ln -s -f .tmux/.tmux.conf
cp .tmux/.tmux.conf.local .
```

## 2. Configuration

The configuration is split into two files:
- `~/.tmux.conf`: The main configuration file (do not edit this).
- `~/.tmux.conf.local`: Your local customizations (edit this file).

### Recommended Customizations

Add the following to your `~/.tmux.conf.local` to improve usability:

```bash
# Increase history size
set -g history-limit 50000

# Change prefix key to Backtick (`)
unbind C-b
set -g prefix `
bind ` send-prefix

# Move status line to top
set -g status-position top

# Enable mouse mode (optional)
set -g mouse on
```

## 3. Key Bindings

Here are some useful key bindings (assuming default prefix `C-b` or your custom prefix):

| Key | Action |
| :--- | :--- |
| `Prefix + c` | Create new window |
| `Prefix + n` | Next window |
| `Prefix + p` | Previous window |
| `Prefix + %` | Split window vertically |
| `Prefix + "` | Split window horizontally |
| `Prefix + z` | Toggle zoom pane |
| `Prefix + [` | Enter copy mode |
| `Prefix + r` | Reload configuration |

## 4. Features

- **Status Bar**: Informative status bar with CPU, memory, and battery usage.
- **Navigation**: Vim-like pane navigation (`h`, `j`, `k`, `l`).
- **Copy Mode**: Enhanced copy mode with system clipboard integration.

For more details, refer to the [official repository](https://github.com/gpakosz/.tmux).

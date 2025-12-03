---
title: VIM 插件推荐
description: VIM 常用插件和管理
---

This guide explains how to install and use [Vundle](https://github.com/VundleVim/Vundle.vim) to manage Vim plugins.

## 1. Installation

Create the bundle directory and clone the Vundle repository:

```bash
mkdir -p ~/.vim/bundle
git clone https://github.com/VundleVim/Vundle.vim.git ~/.vim/bundle/Vundle.vim
```

## 2. Configuration

Add the following configuration to your `~/.vimrc` file. Ensure that all `Plugin` commands are placed between `call vundle#begin()` and `call vundle#end()`.

```vim
set nocompatible              " be iMproved, required
filetype off                  " required

" set the runtime path to include Vundle and initialize
set rtp+=~/.vim/bundle/Vundle.vim
call vundle#begin()

" let Vundle manage Vundle, required
Plugin 'VundleVim/Vundle.vim'

" Add your plugins here
Plugin 'wakatime/vim-wakatime'
Plugin 'editorconfig/editorconfig-vim'

call vundle#end()            " required
filetype plugin indent on    " required

" General settings
set ruler
set nu
set backspace=2
set mouse=a
```

## 3. Install Plugins

Launch Vim and run the installation command:

```bash
vim +PluginInstall +qall
```

Or inside Vim, run:

```vim
:PluginInstall
```

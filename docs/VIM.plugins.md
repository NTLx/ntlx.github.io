# VundleVim

```bash
mkdir -p ~/.vim/bundle
git clone https://github.com/VundleVim/Vundle.vim.git ~/.vim/bundle/Vundle.vim
```

add blow in `~/.vimrc`:

```bash
set nocompatible              " be iMproved, required
filetype off                  " required
set rtp+=~/.vim/bundle/Vundle.vim
call vundle#begin()
Plugin 'VundleVim/Vundle.vim'
call vundle#end()            " required
filetype plugin indent on    " required
set ruler
set nu
set backspace=2
set mouse=a
Plugin 'wakatime/vim-wakatime'
Plugin 'editorconfig/editorconfig-vim'
```

install plugins:

```bash
vim +PluginInstall
```
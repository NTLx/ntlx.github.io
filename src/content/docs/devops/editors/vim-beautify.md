---
title: VIM 美化配置
description: VIM 编辑器美化和优化配置
---

![Vim Logo](https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Vimlogo.svg/640px-Vimlogo.svg.png?1573631685412)

This guide provides a comprehensive `.vimrc` configuration to enhance Vim's appearance and functionality, including status line improvements, syntax highlighting, and better navigation.

## Installation

1.  **Backup your existing configuration:**

    ```bash
    mv ~/.vimrc ~/.vimrc.bak
    ```

2.  **Apply the configuration:**

    Copy the following content to your `~/.vimrc` file.

```vim
" -- General Settings ----------------------------------------------------------
set ruler
filetype off
set backspace=2
set nu
set mouse=a

" -- Bootstrap -----------------------------------------------------------------
set encoding=utf-8  " set vim encoding to UTF-8
set nocompatible    " use vim defaults
set history=1000    " boost history
set undolevels=1000 " boost undo levels

" -- Tmux Integration ----------------------------------------------------------
if exists('$TMUX')
    set term=screen-256color
endif

if exists('$ITERM_PROFILE')
  if exists('$TMUX')
    let &t_SI = "\<Esc>[3 q"
    let &t_EI = "\<Esc>[0 q"
  else
    let &t_SI = "\<Esc>]50;CursorShape=1x7"
    let &t_EI = "\<Esc>]50;CursorShape=0x7"
  endif
endif

" -- Backup and Swap -----------------------------------------------------------
set backup
set writebackup
set swapfile

let s:vimdir=$HOME . "/.vim"
let &backupdir=s:vimdir . "/backup"
let &directory=s:vimdir . "/tmp"

if exists("*mkdir")
  if !isdirectory(s:vimdir)
    call mkdir(s:vimdir, "p")
  endif
  if !isdirectory(&backupdir)
    call mkdir(&backupdir, "p")
  endif
  if !isdirectory(&directory)
    call mkdir(&directory, "p")
  endif
endif

set backupskip+=*.tmp

if has("persistent_undo")
  let &undodir=&backupdir
  set undofile
endif

let &viminfo=&viminfo . ",n" . s:vimdir . "/.viminfo"

" -- Command Mode --------------------------------------------------------------
set wildmenu
set wildmode=longest:full,full
set wildignore+=.git,*.DS_Store
if exists ("&wildignorecase")
  set wildignorecase
endif

" -- Display -------------------------------------------------------------------
set title
set lazyredraw
set report=0
set cursorline

if has("gui_running")
  set cursorcolumn
endif

if exists("+showtabline")
  set showtabline=1
endif

" -- Status Line ---------------------------------------------------------------
if has("statusline")
  function! StatusLineUTF8()
    try
      let p = getpos('.')
      redir => utf8seq
      sil normal! g8
      redir End
      call setpos('.', p)
      return substitute(matchstr(utf8seq, '\x\+ .*\x'), '\<\x\x', '0x\U&', 'g')
    catch
      return '?'
    endtry
  endfunction

  function! StatusLineFileEncoding()
    return has("multi_byte") && strlen(&fenc) ? &fenc : ''
  endfunction

  function! StatusLineUTF8Bomb()
    return has("multi_byte") && &fenc == 'utf-8' && &bomb?'+bomb' : ''
  endfunction

  function! StatusLineCWD()
    let l:pwd = exists('$PWD') ? $PWD : getcwd()
    return substitute(fnamemodify(l:pwd, ':~'), '\(\~\?/[^/]*/\).*\(/.\{20\}\)', '\1...\2', '')
  endfunction

  set laststatus=2
  set statusline=
  set statusline+=%#Number#
  set statusline+=❐\ %02n
  set statusline+=\ \|\ 
  set statusline+=%*
  set statusline+=%#Identifier#
  set statusline+=%f
  set statusline+=%*
  set statusline+=%#Special#
  set statusline+=%m
  set statusline+=%#Statement#
  set statusline+=%r
  set statusline+=%h
  set statusline+=%w
  set statusline+=%#Type#
  set statusline+=[%{&ff}]
  set statusline+=[
  set statusline+=%{StatusLineFileEncoding()}
  set statusline+=%#Error#
  set statusline+=%{StatusLineUTF8Bomb()}
  set statusline+=%#Type#
  set statusline+=]
  set statusline+=%y
  set statusline+=\ \|\ 
  set statusline+=%*
  set statusline+=%#Directory#
  set statusline+=%{StatusLineCWD()}
  set statusline+=\ 
  set statusline+=%*
  set statusline+=%=
  set statusline+=%#Comment#
  set statusline+=%{v:register}
  set statusline+=\ 
  set statusline+=%#Statement#
  set statusline+=[U+\%04B]
  set statusline+=[%{StatusLineUTF8()}]
  set statusline+=\ \|\ 
  set statusline+=%#Comment#
  set statusline+=line\ %5l/%L\ 
  set statusline+=●\ %02p%%,\ 
  set statusline+=col\ %3v
endif

set showcmd
set cmdheight=1
set shortmess=astT

if (&t_Co > 2 || has("gui_running")) && has("syntax")
   syntax on
endif

match ErrorMsg '^\(<\|=\|>\)\{7\}\([^=].\+\)\?$'

if has("termguicolors")
    let &t_8f = "\<Esc>[38;2;%lu;%lu;%lum"
    let &t_8b = "\<Esc>[48;2;%lu;%lu;%lum"
    set termguicolors
endif

" -- Buffers -------------------------------------------------------------------
set autoread
set fsync

" -- Navigation ----------------------------------------------------------------
nnoremap <C-e> 2<C-e>
nnoremap <C-y> 2<C-y>
map <C-Up> <C-y>
map <C-Down> <C-e>

set startofline

nnoremap j gj
nnoremap <Down> gj
nnoremap k gk
nnoremap <Up> gk

set scrolljump=1
set scrolloff=4
set sidescroll=1
set sidescrolloff=4

" -- Editing -------------------------------------------------------------------
set showmode
set nowrap
set linebreak

if has("multi_byte")
  set showbreak=↪
else
  set showbreak=>
endif

set nojoinspaces
set showmatch
set matchtime=4
set matchpairs+=<:>
set virtualedit+=onemore
set smarttab

" -- Searching -----------------------------------------------------------------
set wrapscan
set incsearch
if (&t_Co > 2 || has("gui_running"))
  set hlsearch
endif

set ignorecase
set smartcase

" -- Spell Checking ------------------------------------------------------------
set spelllang=en
set nospell

" -- Snakemake Syntax Support --------------------------------------------------
source $VIMRUNTIME/syntax/python.vim
syn keyword pythonStatement    include workdir onsuccess onerror
syn keyword pythonStatement    ruleorder localrules configfile
syn keyword pythonStatement    touch protected temp wrapper
syn keyword pythonStatement    input output params message threads resources
syn keyword pythonStatement    version run shell benchmark snakefile log script
syn keyword pythonStatement    rule subworkflow nextgroup=pythonFunction skipwhite
syn keyword pythonBuiltin expand config temp protected
syn match pythonFunction "\%(\%(rule\s\|subworkflow\s\)\s*\)\@<=\h*" contained
syn sync match pythonSync grouphere NONE "^\s*\%(rule\|subworkflow\)\s\+\h\w*\s*"
let b:current_syntax = "snakemake"
```

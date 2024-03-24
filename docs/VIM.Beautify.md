![](https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Vimlogo.svg/640px-Vimlogo.svg.png?1573631685412)

> Beautify VIM through `~/.vimrc`

<!-- more -->

```bash
set ruler
filetype off
set backspace=2
set nu
set mouse=a



" -- bootstrap -----------------------------------------------------------------
set encoding=utf-8  " set vim encoding to UTF-8
set nocompatible    " the future is now, use vim defaults instead of vi ones
set history=1000    " boost commands and search patterns history
set undolevels=1000 " boost undo levels



" -- tmux integration ----------------------------------------------------------
if exists('$TMUX')
	set term=screen-256color
endif

if exists('$ITERM_PROFILE')
  if exists('$TMUX')
    let &amp;t_SI = "<Esc>[3 q"
    let &amp;t_EI = "<Esc>[0 q"
  else
    let &amp;t_SI = "<Esc>]50;CursorShape=1x7"
    let &amp;t_EI = "<Esc>]50;CursorShape=0x7"
  endif
end



" -- backup and swap files -----------------------------------------------------
set backup      " enable backup files
set writebackup " enable backup files
set swapfile    " enable swap files (useful when loading huge files)

let s:vimdir=$HOME . "/.vim"
let &backupdir=s:vimdir . "/backup"  " backups location
let &directory=s:vimdir . "/tmp"     " swap location

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

set backupskip+=*.tmp " skip backup for *.tmp

if has("persistent_undo")
  let &undodir=&backupdir
  set undofile  " enable persistent undo
endif

let &viminfo=&viminfo . ",n" . s:vimdir . "/.viminfo" " viminfo location



" -- command mode --------------------------------------------------------------
set wildmenu                    " enable tab completion menu
set wildmode=longest:full,full  " complete till longest common string, then full
set wildignore+=.git            " ignore the .git directory
set wildignore+=*.DS_Store      " ignore Mac finder/spotlight crap
if exists ("&wildignorecase")
  set wildignorecase
endif



" -- display -------------------------------------------------------------------
set title       " change the terminal title
set lazyredraw  " do not redraw when executing macros
set report=0    " always report changes
set cursorline  " highlight current line

if has("gui_running")
  set cursorcolumn  " highlight current column
endif

if exists("+showtabline")
  set showtabline=1 " only if there are at least two tabs (default)
endif

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

  set laststatus=2  " always show a status line
  " set exact status line format
  set statusline=
  set statusline+=%#Number#
  set statusline+=❐\ %02n                        " buffer number
  set statusline+=\ \|\                          " separator
  set statusline+=%*
  set statusline+=%#Identifier#
  set statusline+=%f                             " file path relative to CWD
  set statusline+=%*
  set statusline+=%#Special#
  set statusline+=%m                             " modified flag
  set statusline+=%#Statement#
  set statusline+=%r                             " readonly flag
  set statusline+=%h                             " help buffer flag
  set statusline+=%w                             " preview window flag
  set statusline+=%#Type#
  set statusline+=[%{&ff}]                       " file format
  set statusline+=[
  set statusline+=%{StatusLineFileEncoding()}    " file encoding
  set statusline+=%#Error#
  set statusline+=%{StatusLineUTF8Bomb()}        " UTF-8 bomb alert
  set statusline+=%#Type#
  set statusline+=]
  set statusline+=%y                             " type of file
  set statusline+=\ \|\                          " separator
  set statusline+=%*
  set statusline+=%#Directory#
  set statusline+=%{StatusLineCWD()}             " current working directory
  set statusline+=\                              " separator
  set statusline+=%*
  set statusline+=%=                             " left / right items separator
  set statusline+=%#Comment#
  set statusline+=%{v:register}                  " current register in effect
  set statusline+=\                              " separator
  set statusline+=%#Statement#
  set statusline+=[U+\%04B]                      " Unicode code point
  set statusline+=[%{StatusLineUTF8()}]          " UTF8 sequence
  set statusline+=\ \|\                          " separator
  set statusline+=%#Comment#
  set statusline+=line\ %5l/%L\                  " line number / number of lines
  set statusline+=●\ %02p%%,\                    " percentage through file
  set statusline+=col\ %3v                       " column number
endif

set showcmd     " show partial command line (default)
set cmdheight=1 " height of the command line

set shortmess=astT  " abbreviate messages

if (&t_Co > 2 || has("gui_running")) && has("syntax")
   syntax on  " turn syntax highlighting on, when terminal has colors or in GUI
endif

" highlight SCM merge conflict markers
match ErrorMsg '^\(<\|=\|>\)\{7\}\([^=].\+\)\?$'

if has("termguicolors")
    " fix bug for vim
    let &t_8f = "\<Esc>[38;2;%lu;%lu;%lum"
    let &t_8b = "\<Esc>[48;2;%lu;%lu;%lum"

    " enable true color
    set termguicolors
endif



" -- buffers -------------------------------------------------------------------
set autoread
set fsync             " sync after write



" -- navigation ----------------------------------------------------------------
" scroll slightly faster
nnoremap <C-e> 2<C-e>
nnoremap <C-y> 2<C-y>
map <C-Up> <C-y>
map <C-Down> <C-e>

set startofline " move to first non-blank of the line when using PageUp/PageDown

" scroll by visual lines, useful when wrapping is enabled
nnoremap j gj
nnoremap <Down> gj
nnoremap k gk
nnoremap <Up> gk

set scrolljump=1    " minimal number of lines to scroll vertically
set scrolloff=4     " number of lines to keep above and below the cursor
                    "   typing zz sets current line at the center of window
set sidescroll=1    " minimal number of columns to scroll horizontally
set sidescrolloff=4 " minimal number of columns to keep around the cursor



" -- editing -------------------------------------------------------------------
set showmode      " always show the current editing mode
set nowrap        " don't wrap lines
set linebreak     " yet if enabled break at word boundaries

if has("multi_byte")  " if multi_byte is available,
  set showbreak=↪     " use pretty Unicode marker
else                  " otherwise,
  set showbreak=>     " use ASCII character
endif

set nojoinspaces  " insert only one space after '.', '?', '!' when joining lines
set showmatch     " briefly jumps the cursor to the matching brace on insert
set matchtime=4   " blink matching braces for 0.4s
set matchpairs+=<:>         " make < and > match

"set virtualedit=insert    " allow the cursor to go everywhere (insert)
set virtualedit+=onemore  " allow the cursor to go just past the end of line
"set virtualedit+=block    " allow the cursor to go everywhere (visual block)

"set expandtab     " insert spaces instead of tab, CTRL-V+Tab inserts a real tab
"set tabstop=2     " 1 tab == 2 spaces
"set softtabstop=2 " number of columns used when hitting TAB in insert mode
set smarttab      " insert tabs on the start of a line according to shiftwidth

"set autoindent    " enable autoindenting
"set copyindent    " copy the previous indentation on autoindenting
"set shiftwidth=2  " indent with 2 spaces
"set shiftround    " use multiple of shiftwidth when indenting with '<' and '>'

" -- searching -----------------------------------------------------------------
set wrapscan    " wrap around when searching
set incsearch   " show match results while typing search pattern
if (&t_Co > 2 || has("gui_running"))
  set hlsearch  " highlight search terms
endif

set ignorecase  " case insensitive search
set smartcase   " case insensitive only if search pattern is all lowercase
                "   (smartcase requires ignorecase)
"set gdefault    " search/replace globally (on a line) by default

" -- spell checking ------------------------------------------------------------
set spelllang=en  " English only
set nospell       " disabled by default




" Language:    Snakemake (extended from python.vim)
" Maintainer:    Jay Hesselberth (jay.hesselberth@gmail.com)
" Last Change:    2016 Aug 19
" load settings from system python.vim (7.4)
source $VIMRUNTIME/syntax/python.vim
"
"" Snakemake rules, as of version 3.3
"
"" XXX N.B. several of the new defs are missing from this table i.e.
" subworkflow, touch etc
" rule       = "rule" (identifier | "") ":" ruleparams
" include    = "include:" stringliteral
" workdir    = "workdir:" stringliteral
" ni         = NEWLINE INDENT
" ruleparams = [ni input] [ni output] [ni params] [ni message] [ni threads]
" [ni (run | shell)] NEWLINE snakemake
" input      = "input" ":" parameter_list
" output     = "output" ":" parameter_list
" params     = "params" ":" parameter_list
" message    = "message" ":" stringliteral
" threads    = "threads" ":" integer
" resources  = "resources" ":" parameter_list
" version    = "version" ":" statement
" run        = "run" ":" ni statement
" shell      = "shell" ":" stringliteral
syn keyword pythonStatement    include workdir onsuccess onerror
syn keyword pythonStatement    ruleorder localrules configfile
syn keyword pythonStatement    touch protected temp wrapper
syn keyword pythonStatement    input output params message threads resources
syn keyword pythonStatement    version run shell benchmark snakefile log script
syn keyword pythonStatement    rule subworkflow nextgroup=pythonFunction skipwhite
syn keyword pythonBuiltin expand config temp protected
" similar to special def and class treatment from python.vim, except
" parenthetical part of def and class
syn match pythonFunction "\%(\%(rule\s\|subworkflow\s\)\s*\)\@<=\h*" contained
syn sync match pythonSync grouphere NONE "^\s*\%(rule\|subworkflow\)\s\+\h\w*\s*"
let b:current_syntax = "snakemake"
```
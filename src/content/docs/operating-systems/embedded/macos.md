---
title: MacOS 配置
description: MacOS 系统配置和工具
---

## 1. Terminal Tips

### Analyze Command History

Add this alias to your shell configuration to see your top 10 most used commands:

```bash
alias his="history | awk '{CMD[\$2]++;count++;}END{for (a in CMD)print CMD[a]\" \"CMD[a]/count*100\"% \"a;}' | grep -v \"./\" | column -c3 -s \" \" -t | sort -nr | nl | head -n10"
```

## 2. Zsh Configuration

### Install Zsh & Oh My Zsh

```bash
# Install Zsh via Homebrew
brew install zsh

# Install Oh My Zsh
sh -c "$(wget https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh -O -)"
```

### Install Plugins & Themes

**Syntax Highlighting**
```bash
cd ~/.oh-my-zsh/custom/plugins
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git
```

**Powerlevel10k Theme**
```bash
cd ~/.oh-my-zsh/custom/themes
git clone https://github.com/romkatv/powerlevel10k.git
```

### Configure Zsh

Add the theme to your `~/.zshrc`:

```bash
echo "ZSH_THEME=powerlevel10k/powerlevel10k" >> ~/.zshrc
```

Run the configuration wizard:

```bash
p10k configure
```

# Usage of MacOS

## General Settings in Terminal

```bash
alias his="history | awk '{CMD[\$2]++;count++;}END{for (a in CMD)print CMD[a]\" \"CMD[a]/count*100\"% \"a;}' | grep -v \"./\" | column -c3 -s \" \" -t | sort -nr | nl | head -n10"
```

## ZSH

```bash
# Install Zsh
brew install zsh

# Configure based on Oh my Zsh
sh -c "$(wget https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh -O -)"
cd ~/.oh-my-zsh/custom/plugins
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git
cd ~/.oh-my-zsh/custom/themes
git clone https://github.com/romkatv/powerlevel10k.git
echo "ZSH_THEME=powerlevel10k/powerlevel10k" >> ~/.zshrc
p10k configure
```
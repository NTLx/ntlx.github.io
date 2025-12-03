# Git Configuration & Tips

## 1. Configuration

### SSH Key Generation

Generate a new SSH key (RSA 4096-bit):

```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

### User Identity

Set your global username and email:

```bash
git config --global user.name "Your Name"
git config --global user.email "your_email@example.com"
```

### Proxy Settings

Configure Git to use a proxy (e.g., HTTP proxy at 127.0.0.1:8888):

```bash
git config --global http.proxy http://127.0.0.1:8888
git config --global https.proxy http://127.0.0.1:8888
```

To unset:
```bash
git config --global --unset http.proxy
git config --global --unset https.proxy
```

## 2. Modify Commit History

> [!WARNING]
> Rewriting history is destructive. Ensure you have a backup before proceeding. `git filter-branch` is deprecated; consider using [git-filter-repo](https://github.com/newren/git-filter-repo) for better performance and safety.

### Change Author Info (All Commits)

```bash
git filter-branch --env-filter 'export GIT_AUTHOR_EMAIL=new_email@example.com' --
```

### Change Specific Author Info

Replace `Old@Email`, `Changed Name`, and `Changed@Email` with actual values.

```bash
git filter-branch -f --env-filter '
OLD_EMAIL="Old@Email"
CORRECT_NAME="Changed Name"
CORRECT_EMAIL="Changed@Email"

if [ "$GIT_COMMITTER_EMAIL" = "$OLD_EMAIL" ]
then
    export GIT_COMMITTER_NAME="$CORRECT_NAME"
    export GIT_COMMITTER_EMAIL="$CORRECT_EMAIL"
fi
if [ "$GIT_AUTHOR_EMAIL" = "$OLD_EMAIL" ]
then
    export GIT_AUTHOR_NAME="$CORRECT_NAME"
    export GIT_AUTHOR_EMAIL="$CORRECT_EMAIL"
fi
' --tag-name-filter cat -- --branches --tags
```

## 3. Logs

### Filter by Author

```bash
git log --author="Author Name"
```

## 4. Tips

- **Git History Visualization:** Replace `.com` with `.githistory.xyz` in any GitHub file URL to see a visual history of that file.

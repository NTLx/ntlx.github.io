# Git

## Using proxy

```bash
ssh-keygen -t rsa -b 4096 -C "lx3325360@gmail.com"
git config --global user.name "NTLx"
git config --global user.email "lx3325360@gmail.com"
git config --global http.proxy http://127.0.0.1:8888
git config --global https.proxy http://127.0.0.1:8888
```

## Modify commit info

### Change Author Info

#### All

```bash
git filter-branch --env-filter 'export GIT_AUTHOR_EMAIL=new_author_email' --
```

> `GIT_AUTHOR_NAME`, `GIT_COMMITTER_EMAIL`, `GIT_COMMITTER_NAME` could also be modified

#### Specific

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

## Log

### See Specific Author

```bash
git log --author="Author Name"
```

## Tips

GitHub上随便点开一个文件，把url的.com替换成.githistory.xyz[有惊喜](https://twitter.com/i/status/1265839242145460224)
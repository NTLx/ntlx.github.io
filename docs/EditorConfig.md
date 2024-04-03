# Editor Config

An OS crossed format solution!

## 前言

与“规范”相关的一个事情：

在进行脚本开发时，不同的人有不同的书写习惯，比如 python 脚本有用 tab 缩进也有用 space 缩进的、yaml 配置文件有用 2 个 space 也有用 4 个 space 控制格式的。

这个问题在团队开发时更加凸显，尤其大家连编辑器的使用也不相同时。

为了书写规范化，现有一个简单易上手、跨编辑器且静默生效的代码风格定义和维护工具：EditorConfig，推荐在开发项目（例如 Git 仓库）中使用。

## EditorConfig 是什么

EditorConfig 是一套用于统一代码格式的解决方案，很多项目都有用到，比如 Bootstrap、jQuery、Underscore 和 Ruby 等等。[官方网站](https://editorconfig.org/)说的很简明，为了方便大家快速上手，这里是简单的翻译。

EditorConfig 可以帮助开发者在不同的编辑器和IDE之间定义和维护一致的代码风格。EditorConfig 包含一个用于定义代码格式的文件和一批编辑器插件，这些插件可以让编辑器读取配置文件并依此格式化代码。EditorConfig 的配置文件十分易读，并且可以很好的在VCS（Version Control System）下工作。

## 在哪里存放配置文件

当打开一个文件时，EditorConfig 插件会在打开文件的目录和其每一级父目录查找 `.editorconfig` 文件，直到有一个配置文件 `root=true`。

EditorConfig 配置文件从上往下读取，并且路径最近的文件最后被读取。匹配的配置属性按照属性应用在代码上，所以最接近代码文件的属性优先级最高。

## 下载插件

支持 VS Code、Vim、Atom、PyCharm 等众多编辑器/IDE，请去[官网](https://editorconfig.org/#download)查看是否需要安装插件以及下载相关。

## 示例配置文件

```ini
# EditorConfig is awesome: https://EditorConfig.org

# top-most EditorConfig file
root = true

# Unix-style newlines with a newline ending every file
[*]
end_of_line = lf
insert_final_newline = true

# Matches multiple files with brace expansion notation
# Set default charset
[*.{js,py,pl,sh,r}]
charset = utf-8

# 4 space indentation
[*.py]
indent_style = space
indent_size = 4

# 2 space indentation
[*.{yml,yaml}]
indent_style = space
indent_size = 2

# tab indentation (no size specified)
[*.{js,pl,sh,r,rule,Makefile}]
indent_style = tab

# Indentation override for all JS under lib directory
[lib/**.js]
indent_style = space
indent_size = 2

# Matches the exact files either package.json or .travis.yml
[{package.json,.travis.yml}]
indent_style = space
indent_size = 2
```

目前所有的属性名和属性值都是大小写不敏感的。编译时都会将其转为小写。通常，如果没有明确指定某个属性，则会使用编辑器的配置，而 EditorConfig 不会处理。

推荐不要指定某些EditorConfig属性。比如，`tab_width` 不需要特别指定，除非它与 `indent_size` 不同。同样的，当 `indent_style` 设为 `tab` 时，不需要配置 `indent_size`，这样才方便阅读者使用他们习惯的缩进格式。另外，如果某些属性并没有规范化（比如 `end_of_line`），就最好不要设置它。

[这里](https://github.com/editorconfig/editorconfig/wiki/Projects-Using-EditorConfig)是一些使用了 EditorConfig 的示例项目

注意：不是每种插件都支持所有的属性，具体可见[Wiki](https://github.com/editorconfig/editorconfig/wiki/EditorConfig-Properties)。

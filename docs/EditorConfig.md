# EditorConfig Guide

**A solution for consistent coding styles across different editors and IDEs.**

## 1. Introduction

In collaborative development, maintaining a consistent coding style is crucial. Different developers may use different editors with varying default settings (e.g., tabs vs. spaces, indentation size). This can lead to messy code and unnecessary diffs.

**EditorConfig** helps developers define and maintain consistent coding styles between different editors and IDEs. It consists of a file format for defining coding styles and a collection of text editor plugins that enable editors to read the file format and adhere to defined styles.

## 2. How It Works

When opening a file, the EditorConfig plugin looks for a file named `.editorconfig` in the directory of the opened file and in every parent directory. A search for `.editorconfig` files will stop if the root filepath is reached or an EditorConfig file with `root=true` is found.

EditorConfig files are read from top to bottom and the most recent rules found take precedence. Properties from matching EditorConfig sections are applied in the order they were read, so properties in closer files take precedence.

## 3. Installation

EditorConfig is supported by many editors and IDEs, including VS Code, Vim, JetBrains IDEs (IntelliJ, PyCharm, etc.), Atom, and more.

Check the [Download Page](https://editorconfig.org/#download) to see if your editor requires a plugin or has native support.

## 4. Configuration Example

Here is a sample `.editorconfig` file:

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

# 4 space indentation for Python
[*.py]
indent_style = space
indent_size = 4

# 2 space indentation for YAML
[*.{yml,yaml}]
indent_style = space
indent_size = 2

# Tab indentation for Shell, Perl, R, Makefiles
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

## 5. Tips

- **Case Insensitivity**: All property names and values are case-insensitive. They are parsed as lower-case.
- **Unspecified Properties**: If a property is not specified, the editor's default setting will be used.
- **Best Practices**:
    - Do not specify `tab_width` unless it differs from `indent_size`.
    - Avoid specifying `indent_size` when `indent_style` is set to `tab`, allowing developers to view code with their preferred tab width.

## 6. Resources

- [Official Website](https://editorconfig.org/)
- [Projects Using EditorConfig](https://github.com/editorconfig/editorconfig/wiki/Projects-Using-EditorConfig)
- [EditorConfig Properties Wiki](https://github.com/editorconfig/editorconfig/wiki/EditorConfig-Properties)

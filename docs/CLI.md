# Command Line Interface (CLI) Tips

![](https://lx-public-pic.oss-cn-shanghai.aliyuncs.com/PicGo/20191205093354.jpg)

This document collects useful CLI commands and tips.

## 1. grep

### Match Chinese Characters

Use Perl-compatible regular expressions (PCRE) to match Chinese characters (Han script).

```bash
grep -P '[\p{Han}]' filename
```

### Unicode Script Categories

You can use other Unicode script properties in PCRE. See [Regular-Expressions.info](https://www.regular-expressions.info/unicode.html#script) for more details.

**Common Scripts:**

```text
\p{Common} \p{Arabic} \p{Armenian} \p{Bengali} \p{Bopomofo} \p{Braille} 
\p{Buhid} \p{Canadian_Aboriginal} \p{Cherokee} \p{Cyrillic} \p{Devanagari} 
\p{Ethiopic} \p{Georgian} \p{Greek} \p{Gujarati} \p{Gurmukhi} \p{Han} 
\p{Hangul} \p{Hanunoo} \p{Hebrew} \p{Hiragana} \p{Inherited} \p{Kannada} 
\p{Katakana} \p{Khmer} \p{Lao} \p{Latin} \p{Limbu} \p{Malayalam} 
\p{Mongolian} \p{Myanmar} \p{Ogham} \p{Oriya} \p{Runic} \p{Sinhala} 
\p{Syriac} \p{Tagalog} \p{Tagbanwa} \p{TaiLe} \p{Tamil} \p{Telugu} 
\p{Thaana} \p{Thai} \p{Tibetan}
```

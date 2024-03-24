![](https://lx-public-pic.oss-cn-shanghai.aliyuncs.com/PicGo/20191205093354.jpg)

# CLI

## grep

Regular Expression to find Chinese Charactars:

```bash
grep -P '[\p{Han}]'
```

> [the Unicode-script category properties usable in any PCRE-supporting engine](https://www.regular-expressions.info/unicode.html#script)
> ```bash
> \p{Common} \p{Arabic} \p{Armenian} \p{Bengali} \p{Bopomofo} \p{Braille} \p{Buhid} \p{Canadian_Aboriginal} \p{Cherokee} \p{Cyrillic} \p{Devanagari} \p{Ethiopic} \p{Georgian} \p{Greek} \p{Gujarati} \p{Gurmukhi} \p{Han} \p{Hangul} \p{Hanunoo} \p{Hebrew} \p{Hiragana} \p{Inherited} \p{Kannada} \p{Katakana} \p{Khmer} \p{Lao} \p{Latin} \p{Limbu} \p{Malayalam} \p{Mongolian} \p{Myanmar} \p{Ogham} \p{Oriya} \p{Runic} \p{Sinhala} \p{Syriac} \p{Tagalog} \p{Tagbanwa} \p{TaiLe} \p{Tamil} \p{Telugu} \p{Thaana} \p{Thai} \p{Tibetan}
> ```
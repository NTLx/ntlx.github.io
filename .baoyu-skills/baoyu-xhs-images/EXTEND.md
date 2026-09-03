---
version: 1

watermark:
  enabled: false
  content: ""
  position: bottom-right

preferred_style:
  name: bright-vivid-warm
  description: "明亮鲜艳、高饱和高对比、干净背景、轮廓清晰、温暖积极的知识卡风格。"

preferred_layout: dense
language: zh
preferred_image_backend: baoyu-image-gen
generation_batch_size: 1

custom_styles:
  - name: bright-vivid-warm
    description: "明亮鲜艳、清晰易读、适合技术文章头部摘要卡。"
    color_palette:
      primary: ["#FF5A36", "#1769FF", "#18B979"]
      background: "#FFFDF8"
      accents: ["#FFD166", "#F25F8A"]
    visual_elements: "Clean background, crisp outlines, high contrast, compact knowledge-card hierarchy, warm-positive accents"
    typography: "Clear Chinese handwriting with strong legibility and restrained text density"
    best_for: "WeChat lead cards, technical summaries, knowledge cards"
---

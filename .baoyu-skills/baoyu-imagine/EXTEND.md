---
version: 1

default_provider: google
default_quality: 2k
default_aspect_ratio: "16:9"
default_image_size: 2K

default_model:
  google: gemini-3.1-flash-image-preview
  openai: gpt-image-2
  dashscope: qwen-image-2.0-pro
  seedream: doubao-seedream-5-0-260128

batch:
  max_workers: 10
  provider_limits:
    google:
      concurrency: 3
      start_interval_ms: 1500
    seedream:
      concurrency: 3
      start_interval_ms: 1500
    dashscope:
      concurrency: 3
      start_interval_ms: 1500
---
# wechat-article-write 运行时偏好

此文件只保存项目偏好；流程和 Gate 以 `SKILL.md` 与对应 reference 为准，第三方 Skill 的配置以其自身 `EXTEND.md` 为准。

```yaml
default_author: NTLx
default_author_bio: 热衷于分享 AI 观察与干货

visual_style_profile: bright-vivid-warm
visual_brightness: bright
visual_saturation: high
visual_contrast: high
visual_background: clean
visual_clarity: crisp
visual_mood: warm-positive

source_image_policy: prefer-reuse

quick_mode: true

default_publish_method: api

wechat_layout_default_theme: zen-whitespace
wechat_layout_secondary_theme: moyu-green
wechat_layout_generate_preview: true
```

作者、视觉偏好、原图策略、quick mode、发布方式和微信主题偏好由本技能读取；具体图片 style/layout、主题组件和 backend 行为由对应第三方 Skill 读取自己的配置并执行。

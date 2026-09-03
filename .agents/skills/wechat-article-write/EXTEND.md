# wechat-article-write 运行时偏好

此文件只保存项目偏好；流程和 Gate 以 `SKILL.md` 与对应 reference 为准，第三方 Skill 的配置以其自身 `EXTEND.md` 为准。

```yaml
default_author: NTLx
default_author_bio: 热衷于分享 AI 观察与干货

source_image_policy: prefer-reuse

quick_mode: true

wechat_layout_default_theme: zen-whitespace
wechat_layout_secondary_theme: moyu-green
```

作者、原图策略、quick mode 和微信主题偏好属于本工作流的项目偏好；发布方式与微信发布选项
由 `baoyu-post-to-wechat` 读取自己的配置，图片视觉偏好、style/layout、主题组件和 backend
行为也由对应第三方 Skill 读取自己的配置并执行。

# 图片策略

Parent decides whether the overall visual result meets editorial quality; Specialist Skills decide
the professional visual form inside their owned capability.

## Three visual layers

| Layer | Owner | Final artifact |
|---|---|---|
| Cover | `baoyu-cover-image` | exactly one root `cover.png` / `cover.jpg`, aspect 2.35:1 |
| Lead information summary | `baoyu-infographic` | `imgs/00-infographic-core-summary.*`, first body image before first substantive H2 |
| Body visual aids | `baoyu-article-illustrator` | local image insertions in `visual-draft.md` |

Main supplies the final article and necessary semantic context. Each owner performs its own content
analysis, visual choices, prompt creation, and generation through `baoyu-image-gen`. Project
preferences pin all three with `preferred_image_backend: baoyu-image-gen`. The backend owns
provider/model configuration and generation transport/retries; Main does not reproduce them or
bypass the owning visual Skill with runtime generation.

The illustrator must actually analyze every article, including short articles that need no body
illustration. It chooses useful positions and avoids mechanically matching images to H2s, duplicating
the lead summary, or repeating existing source evidence. Balanced density is the normal long-form
starting preference; minimal density suits short articles. Main reviews the result rather than
preplanning positions or counts. Normal long-form means substantive H2 >= 3 or substantive body
>= 1400; its weak backstop is at least one body visual beyond the lead. Short articles may have zero.
Cover and lead do not count as body aids. Source evidence can count when integrated into the article.

## Evidence reuse

正文已有高价值原图直接承载讨论结果时优先复用。来源依据保留在 `materials.md`、
`understanding-brief.md` 和文章上下文中。Main 将可用证据交给 illustrator 分析，避免重复生成；
本地最终 raster 与 Markdown 引用表达集成结果，不另建视觉控制 registry。

如果正文引用 `Figure N`、`Fig. N`、`图 N`、`Table N` 或 `表 N`，Main 逐项核对 source
编号、caption、正文 claim、最终本地图片，四者必须对应同一个 source asset。下载、转换或裁剪后
重新检查清晰度、完整性、裁切、时效性和误导风险。不得把生成的“高清重绘版”当成原始证据。
没有合适原图时，交回 illustrator 判断合适的视觉辅助形式。

## Final raster review and compression

Main MUST actual open/render the exact final raster file that downstream will consume before
returning `GATE: PASS`. Review the root cover and every referenced local image, including reused
source images; a preview, prompt, remote thumbnail, filename, MIME, or successful command does
not replace inspection. If the runtime cannot view the final raster, that visual unit is `BLOCKED`.

检查 semantic match、中文文字正确性、可读性、构图、裁切、虚构视觉元素和明显生成瑕疵，并判断是否
确实帮助理解。信息图缩放到典型公众号正文宽度后核心文字仍须可读。Source screenshot 以证据
真实性为先；核心证据无法读清时更换清晰 source 或放弃该图。生成文字错误交回同一 owner
定点重新生成，禁止程序化 paint-over；封面、头图、正文插图分别回到各自 Skill。

压缩只在最终 raster 过大、下游 size/format rejection、用户要求优化或发布性能需要时调用
`baoyu-compress-image`，它是唯一压缩 owner。Parent 不直接调用 sips、cwebp、ImageMagick、
Sharp 或 Pillow 实现压缩。优先同格式压缩；扩展名改变时同步更新 `visual-draft.md`。
压缩后重新打开最终 raster 审核，再执行 Step 4 Gate；不需要压缩则跳过此能力。

## Final artifact hygiene and machine Gate

`draft.md` 在 Step 3 后冻结。Step 4 从精确副本 `visual-draft.md` 开始，只加入本地 Markdown
图片，不能改写正文、H2、URL、引用、代码、参考资料或 frontmatter 语义字段。

`imgs/` 顶层只保留进入文章的最终 raster。Specialist 可保留 `imgs/outline.md`、`imgs/prompts/`
和 `imgs/candidates/`，这些是 private auxiliary artifacts，不进入 state、receipt 或正式 hosting 集合。
Main 不维护 prompt registry、producer metadata、backend receipt 或 review log。

`step4-images.mjs` 只验证：冻结 draft hash、去除新增 image nodes 后的 visual-draft parity、
root cover 唯一性与 MIME/比例/可用 raster、头部 infographic 唯一性与位置、全部图片路径位于
`imgs/` 内且文件存在并为已知 MIME 的可用 raster、正常长文至少一张 body visual。
脚本不判断设计风格和语义质量，也不读取 Specialist 的 outline、prompt 或执行记录。

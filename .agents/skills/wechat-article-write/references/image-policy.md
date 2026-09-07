# 图片策略

## Source reuse

正文视觉节点先检查材料中的可用原图。固定规则是 `prefer-reuse`：原图直接承载当前讨论结果时，
优先复用，并在 `image-plan.json` 记录最终 `kind: source`、本地 file、source URL 和 reason。

Source reuse changes visual origin, not whether a semantic visual node exists。高价值原图不能绕过
正文 SLOT：若原图承担正式正文视觉节点，必须规划 `SLOT_IMG_01+`、落盘到 `imgs/`、记录为
`kind: source`，并保留 source URL 与 reason。普通 Markdown 图片不自动满足 Visual Coverage。

## Source provenance review

如果正文显式引用 `Figure N`、`Fig. N`、`图 N`、`Table N` 或 `表 N`，assigned visual Executor
必须逐项核对以下四项：

- source figure/table number；
- source caption；
- 正文 body claim；
- 本地复用图片。

四者必须指向同一个 source asset，并检查清晰度、完整性、裁切、时效性和误导风险。审核失败时，
换用合适原图；没有合适原图则把该节点改为 `kind: generated`，保留同一语义节点。

source reuse 还必须检查最终会被下游消费的本地 raster，而不是只检查 source page 或原始远程图片：

```text
source page → identify correct figure → local final raster → actual inspection → PASS
```

下载、转换或裁剪可能造成错图、裁切、分辨率下降、文件损坏或 caption 不匹配。source original 与
`imgs/<file>` 不同时，审阅对象是 `imgs/<file>`；高价值 screenshot 以 source fidelity 优先，不能
伪造“高清重绘版”原始证据。

## Visual coverage

cover 不计入正文视觉，`SLOT_IMG_00` 也不计入正文视觉。

normal long-form 的条件是 substantive H2 >= 3，或 substantive body >= 1400。normal long-form
的 body visual minimum = 2；typical reader-response = 2–4。短文可以为 0 个 body visual，
但 normal long-form 不能因没有合适原图或视觉信息增益判断困难而豁免。

优先视觉化对比、流程、机制、层级、状态变化、决策框架、指标体系、因果关系、复杂 checklist 和
文章的关键原创增量；避免装饰图、重复 SLOT00，或按每个 H2 机械配图。没有合适 source image
只能改变视觉来源，不能删除仍然需要的 body visual SLOT。

## Review and machine Gate

semantic review 由 assigned visual Executor 完成。对 cover、SLOT00 和每个 body visual，Executor
MUST actual open/render the exact final raster file that downstream will consume before returning
`GATE: PASS`。final raster 是 `cover.png` / `cover.jpg` 以及 `imgs/` 中最终的 SLOT 文件，不是
generator preview、prompt、source webpage thumbnail、intermediate file、filename 或 metadata。
文件存在、MIME/尺寸正确、生成命令成功、source URL 可访问或 `image-plan.json` 正确，都只能证明
artifact exists，不能替代 visual review。

source asset 检查最终本地 raster 是否对应正确论点、编号和 caption，以及清晰度、完整性、裁切、
时效性和误导风险；generated asset 检查 semantic match、visual hierarchy、中文文本正确性、
legibility、text density、明显生成瑕疵、裁切和关键信息是否被截断，并判断视觉是否增加信息而非仅作装饰。
包含大量文字的信息图还要在缩放到典型微信公众号正文显示宽度后判断核心文字是否可读：不能把大量小字
塞进图，也不能要求读者必须放大才能理解核心信息。source screenshot 若文字偏小但仍有证据价值，
保留 source image，并在正文指出应关注的局部；只有核心证据无法读清时才换更高清 source 或放弃该 visual。

cover、SLOT00 和 body visuals 按 workflow 顺序 serial review；当前资产通过后才处理下一张。review
失败只改变该节点的 source 或生成结果，不删除语义节点，也不以装饰性评分替代 deterministic Gate。
如果当前 delegated visual execution context 无法实际 render/view 最终 raster，该 visual unit 必须
`BLOCKED`，不得标记 `PASS`；应 reroute 到具备视觉能力的 isolated Executor。可返回的短 handoff
例如：`GATE: PASS — final raster visually inspected`。无需持久化 review receipt、截图日志或其它新 artifact。

`step4-images.mjs` 只做 deterministic machine Gate：root cover uniqueness、MIME/扩展名、cover
ratio、SLOT00 basename、normal long-form minimum body visual coverage、body SLOT ↔
`image-plan.json` ↔ local file topology，以及图片文件存在性。它不做 style scoring，也不读取或要求
prompt、producer、receipt 等控制层产物。

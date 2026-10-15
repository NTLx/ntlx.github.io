# Editorial evaluation

Deterministic Gates protect invariants. They do not prove that an article is good.

Use this reference when changing the writing pipeline itself, when reviewing a suspicious production result, or when comparing two candidate outputs. Do not turn these editorial dimensions into fixed word-count, image-count, heading-count, or weighted-score Gates.

## Evaluation unit

Evaluate the finished reader-facing outputs, not whether intermediate steps were compliant:

- blog: `article.md` plus its rendered page when rendering changed;
- WeChat: `article-wechat.html` plus preview when layout changed;
- source evidence and `understanding-brief.md` only as supporting material for checking fidelity.

The stable regression corpus lives in `../evals/golden-set.json`. "Golden" means a stable set of evaluation cases. It does **not** mean every sentence, structure, or visual choice in those historical outputs should be copied.

## Six editorial dimensions

Review every affected case on these dimensions. Use `improved`, `same`, `regressed`, or `uncertain`; always attach concrete evidence. Do not collapse them into one composite score.

1. **Fidelity** — Are factual claims, numbers, names, quotations, source boundaries, and uncertainty faithful to the evidence?
2. **Reader value** — Does the article surface the important idea, judgement, or usable consequence rather than merely summarize material?
3. **Structure** — Does the sequence of sections help the reader build the argument naturally, without template-shaped repetition or unnecessary detours?
4. **Language** — Is the Chinese natural, concise, specific, and free from obvious model habits while preserving the author's intended voice?
5. **Visual explanation** — Do visuals materially improve understanding, appear where they help, avoid semantic duplication, and remain legible and accurate?
6. **Platform delivery** — Do Blog and WeChat preserve the intended content while using their platform-specific presentation well?

A deterministic Gate result may be cited as evidence for one narrow property, but `PASS` is never an editorial rating.

## Change hypothesis before modifying the pipeline

Any behavioral pipeline change should be expressible in four lines before implementation:

```text
Problem observed:
Affected editorial dimension(s):
Expected improvement:
Likely tradeoff / regression risk:
```

If the expected improvement cannot be tied to a reader-facing dimension, prefer not to change the pipeline. "More strict", "clearer ownership", or "another check passes" is not sufficient by itself.

## Regression protocol

Use the smallest representative subset that can falsify the change, then expand if the result is mixed or the change is broad.

- Drafting, understanding, humanization, or originality changes: compare at least 5 cases spanning long-form, technical/scientific, argumentative, product/news, and older production styles.
- Visual workflow changes: compare at least 4 cases covering generated visuals, reused/source figures where present, dense technical explanation, and layout-heavy articles.
- WeChat layout changes: compare at least 4 cases with different article lengths and visual densities, and inspect the final HTML/preview rather than validator output alone.
- Broad architecture changes affecting multiple stages: use the full stable corpus.

For each case, compare baseline and candidate side by side. Record only observable differences and their effect on the six dimensions. If a baseline itself is weak, record that weakness rather than preserving it as a target.

## Decision rule

Accept a behavioral pipeline change when:

- the intended reader-facing dimension improves on representative cases;
- no material regression is left unexplained in another dimension;
- any tradeoff is explicit and justified by the actual publishing goal;
- deterministic tests still pass for invariants.

Reject or revise the change when it only increases procedural compliance, test coverage, or architectural neatness without evidence of better final articles.

## Production review

For a normal article run, Main still makes an editorial judgement before freezing and publishing. This reference does not require a new persistent artifact or another blocking Gate for every article. Create a comparison note only when investigating a quality problem or evaluating a pipeline change.

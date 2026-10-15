# Article-level regression corpus

This directory exists to answer one question that deterministic pipeline tests cannot answer:

> Did a pipeline change make the finished articles better?

`golden-set.json` is the stable evaluation corpus. The cases intentionally span different dates, article shapes, evidence risks, and presentation risks. "Golden" means stable regression cases, not perfect examples to imitate.

## How to use it

1. Read `../references/editorial-evaluation.md`.
2. State the observed problem, affected editorial dimension, expected improvement, and likely tradeoff before changing the pipeline.
3. Choose the smallest representative subset from `golden-set.json` that could disprove the proposed fix. Broad changes use the full set.
4. Produce candidate outputs without overwriting the baseline post directories.
5. Compare baseline and candidate on the six editorial dimensions. Use `review-template.md` or an equivalent concise record.
6. Keep deterministic tests separate: they prove invariants, not prose or visual quality.

## Corpus maintenance

- Keep 10–20 stable cases; add a case only when it covers a materially different failure mode or article shape.
- Do not replace a hard case merely because a new pipeline performs poorly on it.
- Prefer real published production artifacts over synthetic fixtures.
- A baseline weakness is evidence, not a reason to force future outputs to copy it.
- When a post directory is intentionally removed, replace its case with another that preserves the same coverage before merging the deletion.

The unit test validates only corpus integrity and coverage metadata. It deliberately does not compute an editorial quality score.

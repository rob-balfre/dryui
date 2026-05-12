# Batch 3 Merged Skill Test

Date: 2026-05-11

This batch merged the strongest ideas from Batch 2 into a single experiment skill, then ran the same dashboard page task through `gpt-5.5` at low reasoning.

No production files or canonical skills were edited.

## Experiment Files

- Merged skill v1: `reports/skill-experiments/2026-05-11/batch-3/merged-best/SKILL.md`
- Merged skill v2: `reports/skill-experiments/2026-05-11/batch-3/merged-best-v2/SKILL.md`
- Task: `reports/skill-experiments/2026-05-11/batch-3/task.md`
- Output v1: `reports/skill-experiments/2026-05-11/batch-3/outputs/merged-best.md`
- Output v2: `reports/skill-experiments/2026-05-11/batch-3/outputs/merged-best-v2.md`
- Preview v2: `reports/skill-experiments/2026-05-11/batch-3/previews/merged-best-v2-preview.html`
- Screenshots v2: `reports/skill-experiments/2026-05-11/batch-3/screenshots/merged-best-v2-{mobile,tablet,desktop}.png`

## What Changed In The Merged Skill

- Kept Variant 1's target brief, full-page branch, and shell-owned container rule.
- Kept Variant 4's dashboard recipe: header, filters/actions, status strip, compact metrics, primary chart, insights/actions rail, full-width table.
- Kept Variant 3's three-candidate scoring, but only for substantial new pages.
- Added a metadata guard so generated code should not name unverified components or subparts.
- In v2, added a snippet integrity gate:
  - every component used must be imported;
  - every `grid-template-areas` token must have a matching `grid-area` rule;
  - every raw interior element needs a `data-layout` or `data-layout-area` hook;
  - do not claim `src/layout.css` avoids inline-size if it contains inline-size-related properties.

## Scores

| Run            | Instruction Score |   Visual Score | Result                                                                                                                                              |
| -------------- | ----------------: | -------------: | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Merged Best v1 |           33.5/40 | 25/30 intended | Good concept, but proposed CSS forgot `grid-area` assignments and markup used `Field.Root` without importing `Field`.                               |
| Merged Best v2 |             38/40 |          25/30 | Best run so far. It fixed component import parity, verified local component APIs, added `grid-area` rules, and self-corrected missing layout hooks. |

## V2 Visual Result

Rendered at 390px, 820px, and 1440px. Automated checks found no page-level horizontal overflow.

Visual strengths:

- Mobile keeps the expected operational order.
- Tablet uses two-column metrics and a readable chart.
- Desktop gives the chart dominance, puts insights beside it, keeps metrics compact, and gives the table full width below.

Residual visual risk:

- The proposed Svelte snippet uses fixed `Chart.Root width={760}` and `height={320}`. The report says visual CSS should constrain chart overflow, but a production implementation should prefer responsive chart sizing or verify the SVG is constrained in screenshots.

## V2 Instruction Quality

What improved:

- It checked local exports and nearby demos before naming APIs.
- It avoided unexported `EmptyState`, `Card`, `Switch`, and `DatePicker.Range`.
- It used standalone `Label` with `Field.Root`, matching local demos.
- It included `grid-area` for each named area.
- It ran a self-check, found raw text elements without layout hooks, patched its own report, then rechecked.

Remaining issues:

- It still chose a fairly large code sample, which may be too much for a compact skill prompt.
- It depends on visual CSS for chart/table overflow constraints, so the real skill should explicitly require screenshot evidence after implementation.
- The task file still mentions the v1 skill path in prose, though the v2 runner prompt correctly pointed the agent to the v2 skill.

## Winner

**Merged Best v2 is the winner of all experiments so far.**

It combines:

- Variant 1's mechanical container-query discipline.
- Variant 4's dashboard composition recipe.
- Variant 3's candidate scoring, but only when useful.
- A new integrity gate that catches the exact low-reasoning failures from v1.

## Pull Into Real Skill

The real `dryui-build` skill should take the v2 structure, but keep it concise:

- Target brief.
- Branch router.
- Full Page Branch.
- Dashboard Branch.
- Snippet Integrity Gate.
- Visual Check Gate.
- Component Metadata Guard.

The most important new rule is the snippet integrity gate. Without it, low-reasoning runs understand the intended layout but still miss mechanical details like `grid-area` and import parity.

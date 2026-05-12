# Batch 6 Layout Tightening Results

Ran five experimental `dryui-build` skill variants against three design-image references using Codex `gpt-5.5` with low reasoning:

- Kanban/project board: regression control.
- Settings/admin: previously weak because desktop shell/chrome was flattened.
- Knowledge/document reader: previously weak because the reader surface was too shallow.

Contact sheet:

- `reports/skill-experiments/2026-05-11/batch-6/screenshots/contact-sheet.png`
- `reports/skill-experiments/2026-05-11/batch-6/screenshots/contact-sheet.html`

## Variants

| Variant                 | Idea                                                       | Formal result      | Visual read                                                                                                                                  |
| ----------------------- | ---------------------------------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| V1 breakpoint blueprint | Force region map at mobile/tablet/desktop before coding    | 3/3 pass           | Reliable, but too wireframe/thin on settings and knowledge                                                                                   |
| V2 chrome first         | Extract topbar/nav/rails before content                    | 2/3 pass           | Good at persistent chrome and knowledge reader, but drifted from exact `@container <name> (min-width: ...)` syntax                           |
| V3 proportion weights   | Classify primary/secondary/chrome/utility by visual weight | 2 pass, 1 hang     | Best settings proportions, but imported `@dryui/ui` in kanban and knowledge hung                                                             |
| V4 app recipes          | Use recipes for dashboard/board/CRM/settings/knowledge     | 2/3 pass           | Best practical visual results; settings only failed because it used recipe names (`profile`, `security`) instead of a generic `primary` area |
| V5 visual repair loop   | Require build + browser screenshot repair                  | 1 pass, 2 timeouts | Knowledge looked strong, but mandatory repair made low-reasoning runs unreliable                                                             |

## Scores

Scores combine visual fidelity, layout contract, and reliability.

| Variant                 | Kanban | Settings | Knowledge | Overall |
| ----------------------- | -----: | -------: | --------: | ------: |
| V1 breakpoint blueprint |    7.0 |      5.5 |       6.0 |     6.2 |
| V2 chrome first         |    7.0 |      6.5 |       8.0 |     6.8 |
| V3 proportion weights   |    6.0 |      8.0 |       0.0 |     4.7 |
| V4 app recipes          |    8.5 |      8.0 |       7.0 |     7.8 |
| V5 visual repair loop   |    0.0 |      0.0 |       8.0 |     2.7 |

## What Worked

- A required breakpoint blueprint improved consistency. V1 passed all three, so the skill should keep an explicit mobile/tablet/desktop region map before CSS.
- Chrome-first extraction helped when the reference had persistent rails. V2 settings and knowledge kept the desktop shell better than the earlier baseline.
- Proportion language helped settings. V3 settings had the clearest primary/support hierarchy.
- App recipes produced the most faithful visual mappings. V4 kanban and settings were the strongest screenshots.

## What Failed

- Exact CSS syntax drifted unless the skill stated it as a literal contract. V2 used `@container page (width>=48rem)` instead of the required `@container <name> (min-width: 48rem)`.
- Recipe-specific names broke generic checks. V4 settings looked good but had no direct `data-layout-area="primary"`.
- Mandatory visual repair made the model loop. V5 settings and kanban timed out after 420 seconds.
- The proportion variant loosened the no-component rule. V3 kanban imported `Text` from `@dryui/ui`, which should be a hard fail for layout-only extraction.
- Knowledge readers need a stricter primary-surface rule. Some variants treated the reader as one of several equal columns instead of the dominant work surface.

## Recommended Tightening

- Use V1 as the backbone: task classification, breakpoint blueprint, literal container-query contract, and simple allowed files.
- Add a compact V4-style recipe table, but keep it advisory and short.
- Add V3's proportion rule in one place: identify `primary`, `secondary`, `chrome`, `utility`; primary must be largest at desktop.
- Require these direct page children for every full-page layout: `topbar` or `navigation`, `primary`, and optional `secondary`, `utility`, `rail`, `actions`.
- Allow recipe-specific meaning through labels/classes, not by replacing `primary`. Example: settings main form is still `data-layout-area="primary"`.
- Make the exact CSS contract copy-paste literal:
  - `[data-layout='<name>-shell'] { container: <name> / inline-size; }`
  - `@container <name> (min-width: 48rem)`
  - `@container <name> (min-width: 72rem)`
- Add a self-check command before finishing:
  - No imports in `src/routes/+page.svelte`.
  - No `@media`.
  - No widgets: `button`, `input`, `form`, `table`, `img`, `svg`.
  - `src/layout.css` contains the exact two `@container` queries.
- Keep visual checks in the harness, not as a mandatory skill step. The skill can say "if browser validation is available, inspect 390/820/1440 and repair once", but it should not require open-ended repair.

## Best Next Test Skill Shape

Combine:

- V1 breakpoint blueprint.
- V4 recipes.
- V3 simplified proportion weights.
- V2 desktop-chrome reminder.

Avoid:

- V5 mandatory repair loop.
- Recipe naming that omits `primary`.
- Any component imports in a layout-only pass.

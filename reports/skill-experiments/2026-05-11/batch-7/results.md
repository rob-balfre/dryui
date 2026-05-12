# Batch 7 Layout Skill Experiments

Date: 2026-05-11

Goal: combine the strongest layout-skeleton instructions and test them against the five generated web-app reference images at mobile, tablet, and desktop sizes.

## Runs

- V6 hybrid layout:
  - Result: formal 5/5, but failed the real contract.
  - Issue: allowed variable container names. Some outputs used `container: analytics / inline-size` with `@container page`, so the responsive query never matched the declared container.
  - Summary: `v6-summary.json`.

- V7 fixed page container:
  - Result: formal 5/5, source audit 5/5.
  - Contact sheet: `screenshots/contact-sheet.png`.
  - Improvement: fixed exact `container: page / inline-size` plus exact `@container page (min-width: 48rem)` and `72rem`.
  - Issue: knowledge produced a huge blank tablet/desktop region.
  - Root cause: nested elements reused `data-layout-area="primary"` inside the topbar; broad layout selectors then applied desktop sizing to the nested primitive.

- V8 shell area strict:
  - Result: formal 5/5, corrected source audit 5/5.
  - Contact sheet: `screenshots-v8/contact-sheet.png`.
  - Improvement: `data-layout-area` became shell-only, with shell-area CSS scoped through `[data-layout-area='page'] > ...`.
  - Visual score: best structural output overall. Knowledge no longer has the giant blank region.
  - Issue: too high-fidelity for the layout-only stage; it still copied labels, metrics, names, and domain content.

- V9 abstract blocks:
  - Result: formal 5/5, no-copy audit 2/5.
  - Contact sheet: `screenshots-v9/contact-sheet.png`.
  - Improvement: better abstract colored-block pressure. Analytics and knowledge passed the stricter no-copy audit.
  - Issue: kanban, CRM, and settings still copied some content labels. CRM also became too sparse compared with the reference.

## Winner

Use V8 as the structural base, then pull in V9's abstraction rules.

The critical additions for the real skill are:

- Fixed page container contract:
  - `container: page / inline-size`
  - `@container page (min-width: 48rem)`
  - `@container page (min-width: 72rem)`
- Shell-only `data-layout-area`:
  - `data-layout-area` only on `[data-layout-area='page']` and its direct children.
  - Nested blocks use `data-layout` and classes only.
- Direct-child shell selectors:
  - Use `[data-layout-area='page'] > [data-layout-area='<area>']`.
  - Avoid broad descendant selectors for shell areas.
- Visual blank-region check:
  - Every direct shell area should contain visible blocks near its top edge.
  - No large blank region caused by min-block sizing or nested area leakage.
- Abstract block mode:
  - No copied names, dates, metrics, statuses, document titles, project names, or customer names.
  - Use short generic region labels and colored primitives.
- Test harness additions:
  - Audit nested `data-layout-area`.
  - Audit broad shell-area selectors.
  - Add a no-copy content audit for design-to-layout skeleton runs.
  - Always generate mobile/tablet/desktop full-page contact sheets before judging.

## Recommendation

Bring V8's shell contract into `dryui-build`, but phrase the output mode like V9: "layout extraction, not UI implementation." Keep the no-copy audit as harness/test coverage rather than depending only on prompt wording.

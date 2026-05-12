# Batch 2 DryUI Build Skill Experiments

Date: 2026-05-11

This batch copied the full current `skills/dryui-build/SKILL.md` into experiment-only folders, then layered four candidate instruction sets on top. No production skill file was edited.

## Test Task

Build a full Svelte 5 page titled `Analytics Dashboard`.

Required behavior:

- Full page, not a component-only section.
- Mobile-first, container-query layout.
- Page shell owns the named container query.
- Inner child owns the responsive grid.
- Dashboard regions: header, filters/actions, summary metrics, primary chart, table, useful state/status surfaces.
- States: loading, empty, error, disabled, dense-data.
- Use DryUI primitives and `src/layout.css` discipline.
- Produce visual-check guidance for mobile, tablet, and desktop.

## Variants

- **Variant 1: Shell Gated** - strongest full-page branch and explicit page-shell/container-query contract.
- **Variant 2: Router Compact** - shorter target-router recipe with fewer added instructions.
- **Variant 3: Visual Tournament** - requires three candidate layouts, scoring, then a merged winner.
- **Variant 4: Dashboard Recipes** - dashboard-specific recipe with dashboard region vocabulary and state handling.

## Instruction Scores

Scored out of 40 across target classification, page shell/container contract, DryUI discipline, mobile-first/container behavior, dashboard hierarchy, state coverage, visual-check readiness, and implementation risk.

| Variant                      | Score | Notes                                                                                                                                                                                                                                                                                               |
| ---------------------------- | ----: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Variant 1: Shell Gated       | 37/40 | Best instruction-following. Correct shell-owned container, inner responsive grid, descendant-only `@container` rules, explicit dashboard and full-page branches, strong state behavior. Minor risk: `DataGrid.Root data={rows}` / row props still need metadata verification before implementation. |
| Variant 4: Dashboard Recipes | 34/40 | Best dashboard vocabulary and region list. Strong full-page shape and visual-check plan. Penalized for naming `EmptyState`, which is not currently exported in `packages/ui/src/index.ts`, despite the skill mentioning it as a preferred/common primitive.                                         |
| Variant 2: Router Compact    | 30/40 | Clean and compact. Weaker desktop layout guidance, weaker dashboard-specific recipe, and also names `EmptyState`. Uses `data-layout="analytics-dashboard-page"` for the inner grid rather than the stricter direct child `data-layout-area="page"` pattern.                                         |
| Variant 3: Visual Tournament | 29/40 | Best at forcing comparison before building. Penalized for heavier component hallucination risk: `Card`, `DatePicker.Range`, `EmptyState`, `Skeleton.Text`, `Skeleton.Block`, and `Switch` are not confirmed local exports.                                                                          |

Compliance judge agreed with the same winner: **Variant 1**.

## Visual Scores

Rendered at 390px mobile, 820px tablet, and 1440px desktop using the same static dashboard harness.

| Variant                      | Mobile | Tablet | Desktop |   Total | Notes                                                                                                                                                                       |
| ---------------------------- | -----: | -----: | ------: | ------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Variant 1: Shell Gated       |    7.5 |      8 |       7 | 22.5/30 | Good mobile/tablet stack and strict desktop grid, but the desktop table rail is too narrow and too tall; insights are pushed below the chart.                               |
| Variant 2: Router Compact    |    7.5 |      8 |       7 | 22.5/30 | Clean and stable, but desktop remains too stacked and the top-row filters become cramped/truncated. Good fallback if we want terse instructions, not the best page outcome. |
| Variant 3: Visual Tournament |      8 |      8 |     8.5 | 24.5/30 | Best balanced desktop composition from the tournament idea: chart plus insight rail, table below. State strip reads clearly.                                                |
| Variant 4: Dashboard Recipes |      8 |      8 |       9 |   25/30 | Best dashboard page visually. Chart stays dominant, insight rail supports rather than competes, metrics remain compact, table has full width below.                         |

Automated screenshot checks found no page-level horizontal overflow in any variant at mobile, tablet, or desktop.

## Screenshots

- Contact sheet: `reports/skill-experiments/2026-05-11/batch-2/screenshots/contact-sheet.png`
- Preview harness: `reports/skill-experiments/2026-05-11/batch-2/previews/dashboard-preview.html`
- Individual screenshots live in `reports/skill-experiments/2026-05-11/batch-2/screenshots/variant-{1..4}-{mobile,tablet,desktop}.png`

## Winner

**Best skill instructions: Variant 1, with Variant 4's dashboard recipe merged in.**

Reasoning:

- Variant 1 gives the model the strongest lint-safe mechanics: classify the task, run the full-page branch, put `container` on the page shell, put responsive grid on the direct inner child, and only style descendants inside `@container`.
- Variant 4 gives the model better dashboard-specific intent: header, filters/actions, status strip, compact metrics, primary chart, secondary insights/actions, and full-width table.
- Variant 3's tournament idea is useful, but should be conditional. It improves visual outcomes when the environment can spawn subagents or when the task is exploratory; it also increases the chance of component/API drift if not paired with metadata checks.

## Recommended Pull-In

Add these to the real `dryui-build` skill after the experiment phase:

- A **Target Router** before implementation: page, section, component, dashboard, form/workflow, or polish.
- A **Full Page Branch** requiring page shell owns `container: <name> / inline-size`, direct inner child owns the responsive grid, and `@container` rules style descendants only.
- A **Dashboard Branch** from Variant 4: task, density, stable regions, compact metrics, primary chart, secondary insight/action region, table, and state strip.
- A **State Checklist** from Variant 1: loading, empty, error, disabled, dense-data, with layout-preserving behavior for each.
- A **Visual Check Gate**: screenshots at 390, 820, and 1440; check overflow, clipped labels, wasted desktop space, card bloat, chart/table dominance, and state layout.
- A **Conditional Exploration Gate**: for substantial new pages, create three layout candidates locally or with subagents, score them, merge the winner, then implement. Keep this optional for small edits.
- A **Component Metadata Guard**: before naming compound parts in generated code, verify `packages/ui/src/<component>/<component>.meta.ts`, `index.ts`, or nearby usage. This matters because this batch repeatedly named components/parts that do not exist locally.

## Do Not Pull In

- Do not require a tournament for every UI edit; it is too heavy for small fixes.
- Do not include unverified component examples for `EmptyState`, `Card`, `Switch`, `DatePicker.Range`, or skeleton subparts unless the package exports are added first.
- Do not make desktop dashboard layouts keep chart and table stacked by default; it is safe but wastes the main viewport.

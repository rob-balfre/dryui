# Recommended `dryui-build` Section

This merges the winning gated workflow with the user's preferred branch-first task list.

## Target Router

Before implementation, identify the target:

- **Full page**: route, screen, dashboard, admin page, settings page, docs page.
- **Section**: hero, header, sidebar, table area, pricing block, footer.
- **Repeated component**: card, row, list item, toolbar item, table cell.
- **Form/workflow**: settings form, wizard, editor, onboarding, destructive action.
- **Polish pass**: improve spacing, hierarchy, states, responsive behavior, or visual refinement.

If the target is a dashboard or data surface, apply the dashboard branch first, then the full-page branch when it is a route or screen.

## Target Brief

Write this before code:

```text
Target brief: type=<page|section|component|form|polish>, subtype=<dashboard|docs|marketing|settings|other>, user=<role>, primary_task=<task>, density=<compact|standard|spacious>, required_states=<states>.
```

## Full Page Branch

For a full page:

1. Create one route root with a specific `data-layout="<page-name>"`.
2. In `src/layout.css`, add the matching selector.
3. Add `container: <page-name> / inline-size` to the page root.
4. Put all page and section `display: grid` / `display: flex` rules in `src/layout.css`.
5. Start with a mobile-first base layout.
6. Use `@container <page-name> (...)` for responsive shifts.
7. Use `data-layout-area` for children that participate in stable regions or named grid areas.
8. Keep `src/layout.css` structural only: display, grid, flex, container, tokenized spacing, alignment, and block-size constraints.
9. Keep color, background, border, shadow, radius, typography, position, z-index, width, height, and inline-size out of `src/layout.css`.
10. Verify mobile and desktop screenshots.

## Dashboard Branch

For a dashboard or data surface:

1. Pick the primary task: monitor, compare, triage, report, configure, or act.
2. Pick density: compact for admin/data, standard for mixed dashboards, spacious only for executive summaries.
3. Define regions before markup:
   - header
   - filter/action bar
   - summary metrics
   - primary visualization
   - data table or list
   - secondary detail/action area if needed
4. Put filters/actions before the data they affect.
5. Give the largest stable region to the primary chart, table, or work surface.
6. Use `Table` or `DataGrid` for tabular data, and `Chart` or `Sparkline` for visualized data.
7. Use cards only for KPIs, alerts, or distinct comparable units. Do not scaffold the whole page with cards.
8. Include loading, empty, error, disabled, and dense-data states.
9. Test long labels, many rows, narrow containers, and no-hover/coarse-pointer behavior.
10. Make sure the primary action remains visible after mobile collapse.

## Section Branch

For a page section:

1. Add a specific `data-layout="<section-name>"`.
2. Scope section structure in `src/layout.css`.
3. Use the parent page container query unless the section truly needs independent responsive behavior.
4. Do not add a page wrapper inside a section.
5. Ensure the section still works when surrounding content changes.

## Component Branch

For repeated components or fragments:

1. Prefer DryUI primitives and compound component APIs.
2. Use raw elements only for structural roles that DryUI does not cover.
3. Give raw structural elements a meaningful `data-layout`.
4. Put reusable component visuals in component CSS, not `src/layout.css`.
5. Add a component-level container query only when the same component must adapt to different allocated widths.

## Form/Workflow Branch

For forms and workflows:

1. Use DryUI form primitives.
2. Wrap controls in `Field.Root` with `Label`.
3. Group fields by user task.
4. Include validation, disabled, loading, success, and error states.
5. Keep the primary submit action singular and keyboard accessible.
6. Use `AlertDialog` for destructive confirmation.

## Self-Review Gate

Before finishing, answer:

- Did the correct target branch run?
- Does every page root or section root have a specific `data-layout`?
- Are page-level layout rules only in `src/layout.css`?
- Are responsive shifts done with named `@container` queries?
- Does `src/layout.css` avoid visual styling and width/height/inline-size hacks?
- Are required loading, empty, error, disabled, and dense-data states represented?
- Would DryUI lint reject any markup, component usage, or CSS rule?

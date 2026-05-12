---
name: dryui-build-experiment-c
description: Experimental DryUI UI build workflow using compact decision tables and page recipes. Use when testing whether terse recipes produce better low-reasoning compliance.
---

# DryUI Build Experiment C: Decision Tables

## Classify The Request

| If the user asks for                               | Build as           | First recipe     |
| -------------------------------------------------- | ------------------ | ---------------- |
| route, screen, dashboard, admin, settings, page    | full page          | Page recipe      |
| hero, pricing, table area, sidebar, header, footer | section            | Section recipe   |
| card, row, item, badge group, cell                 | component fragment | Component recipe |
| form, wizard, editor, settings flow                | workflow           | Workflow recipe  |
| make nicer, polish, improve layout                 | review/refine      | Review recipe    |

If the page contains tables, charts, metrics, filters, or admin work, also apply the Dashboard recipe.

## Page Recipe

- Root: one semantic route root with `data-layout="<route-name>"`.
- Container: root declares `container: <route-name> / inline-size` in `src/layout.css`.
- Areas: direct structural children use `data-layout-area`.
- Layout CSS: `src/layout.css` only.
- Responsive: mobile base plus `@container <route-name> (...)`.
- Prohibited in component styles: `display: grid`, `display: flex`, `@media` layout breakpoints, inline style, Svelte `style:`.
- Verification: mobile, desktop, long text, and no horizontal overflow.

## Dashboard Recipe

| Decision        | Rule                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------ |
| Primary purpose | Pick one: monitor, compare, triage, report, configure, act.                                            |
| Density         | Pick compact for admin/data, standard for mixed content, spacious only for executive summary.          |
| Regions         | Header, action/filter bar, KPI summary, primary visualization, data table, secondary detail if needed. |
| Dominance       | Primary visualization or table gets the largest stable grid area.                                      |
| Cards           | Use for KPIs or comparable units only; do not scaffold the page with cards.                            |
| Data            | Use `DataGrid`/`Table` and `Chart`/`Sparkline` when available.                                         |
| States          | Default, loading, empty, error, disabled, dense rows, long labels.                                     |
| Mobile          | Collapse to one column; keep filters/actions before affected data.                                     |

## Section Recipe

- Use `data-layout="<section-name>"`.
- Scope structure in `src/layout.css`.
- Use parent container query unless independent behavior is required.
- Do not add a page wrapper inside a section.

## Component Recipe

- Prefer DryUI primitives.
- Raw elements need a structural reason and `data-layout`.
- Component CSS handles visual styling.
- Add a component container query only when the component is reused at different widths.

## Workflow Recipe

- Use field/label primitives.
- Group by task.
- Include validation, loading, error, success, and disabled states.
- Primary submit action is singular and visible.

## Review Recipe

Score in this order:

1. Lint contract.
2. Task path and primary action.
3. Hierarchy and grouping.
4. Responsive collapse.
5. State coverage.
6. Visual polish.

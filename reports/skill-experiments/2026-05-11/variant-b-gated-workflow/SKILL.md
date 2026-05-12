---
name: dryui-build-experiment-b
description: Experimental DryUI UI build workflow using mandatory gates and checklists. Use when testing whether explicit gates improve low-reasoning layout reliability.
---

# DryUI Build Experiment B: Gated Workflow

## Gate 1: Target Brief

Write this before implementation:

```text
Target brief: type=<page|section|component|form|polish>, subtype=<dashboard|marketing|docs|settings|other>, user=<role>, primary_task=<task>, density=<compact|standard|spacious>, required_states=<states>.
```

If `type=page`, continue to Gate 2. If `subtype=dashboard`, apply the dashboard add-on in Gate 3.

## Gate 2: Page Layout Contract

For any full page:

- One page root owns `data-layout="<name>"`.
- That root creates `container: <name> / inline-size`.
- Every structural child gets `data-layout-area`.
- `src/layout.css` owns page and section structure.
- Route/component `<style>` blocks do not contain `display: grid`, `display: flex`, layout breakpoints, inline style, or Svelte `style:`.
- Responsive structure uses `@container <name>` only.
- Base layout is mobile-first.
- `src/layout.css` contains structure only: display, grid/flex, container, gap, alignment, spacing, and block-size constraints.

Stop and fix the plan if any bullet cannot be satisfied.

## Gate 3: Dashboard Add-On

For dashboard/data pages:

- Primary task is one of monitor, compare, triage, report, configure, or act.
- Metrics are grouped by meaning, not decoration.
- The largest region belongs to the most important data view.
- Filters/actions sit before the data they affect.
- A table uses `Table` or `DataGrid`; a chart uses `Chart` or `Sparkline`.
- Cards are allowed for KPIs, alerts, and distinct comparison units; cards are not allowed as page scaffolding.
- Dense data must not depend on hover-only controls.
- Include loading, empty, error, and dense-data states.

## Gate 4: Markup Draft

Draft markup in this order:

1. Page root.
2. Semantic regions.
3. DryUI components.
4. Raw structural elements with `data-layout` or `data-layout-area`.
5. State branches.

Avoid generic names: `wrapper`, `container`, `box`, `layout`, `inner`, `outer`.

## Gate 5: Layout CSS Draft

Draft `src/layout.css` in this order:

1. Page root selector with container.
2. Mobile base grid.
3. Area selectors.
4. Container queries for tablet/desktop.
5. State-safe constraints for media/text overflow.

Do not add visual styling to `src/layout.css`.

## Gate 6: Self-Review

Before finishing, answer:

- Does the route have no page-level layout CSS in component styles?
- Does every raw structural element have a matching layout reason?
- Does the dashboard still have a clear primary task on mobile?
- Are loading, empty, error, and dense-data states represented?
- Would DryUI lint reject any rule?

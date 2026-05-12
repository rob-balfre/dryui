---
name: dryui-build-experiment-a
description: Experimental DryUI UI build workflow using branch-first task lists by target type. Use when testing whether explicit page/section/component branches improve layout correctness.
---

# DryUI Build Experiment A: Branching Task List

## Start Here

Before writing code, identify the target:

- **Full page**
- **Section of a page**
- **Repeated component or list item**
- **Form or workflow**
- **Dashboard or data surface**
- **Polish pass**

If more than one applies, follow the most specific branch first. For a dashboard page, follow **Dashboard or data surface**, then **Full page**.

## Full Page

1. Create one root wrapper with a specific `data-layout="<page-name>"`.
2. In `src/layout.css`, create the matching selector.
3. Add `container: <page-name> / inline-size` to the page wrapper.
4. Put all page-level `display: grid` and `display: flex` in `src/layout.css`.
5. Use mobile-first base layout.
6. Use `@container <page-name> (...)` for responsive shifts.
7. Do not use `@media` for layout breakpoints.
8. Do not put color, background, border, shadow, text, position, z-index, width, height, or inline-size in `src/layout.css`.
9. Use `data-layout-area` for children that participate in named grid areas.
10. Verify mobile and desktop screenshots.

## Dashboard Or Data Surface

1. Name the primary user task: monitor, compare, triage, configure, report, or act.
2. Choose density: compact, standard, or spacious.
3. Define regions before markup:
   - header
   - filters/actions
   - summary metrics
   - primary visualization
   - data table or detail list
   - secondary detail/action area if needed
4. Use named grid areas when regions need stable placement.
5. Prefer data hierarchy over decorative cards.
6. Use cards only for distinct interactive or comparable units.
7. Use `Table` or `DataGrid` for tabular data.
8. Use `Chart` or `Sparkline` for chart content.
9. Include loading, empty, error, disabled, and dense-data states.
10. Test long labels, many rows, narrow containers, and primary action visibility after collapse.

## Section Of A Page

1. Add a specific `data-layout="<section-name>"`.
2. Scope section layout in `src/layout.css`.
3. Use the parent page container unless the section needs independent responsive behavior.
4. Do not create a second container query by default.
5. Ensure the section works when surrounding content changes.

## Repeated Component Or List Item

1. Prefer component CSS for visual styling.
2. Use `data-layout` only for structural raw elements.
3. Add a component-level container only if it must adapt to allocated space.
4. Avoid page assumptions inside reusable components.

## Form Or Workflow

1. Use DryUI form primitives.
2. Wrap controls in field/label structure.
3. Group fields by task.
4. Include validation, disabled, loading, success, and error states.
5. Keep the primary submit action obvious and keyboard accessible.

## Polish Pass

1. Check hierarchy.
2. Check spacing rhythm.
3. Check states.
4. Check responsive collapse.
5. Only then adjust visual styling.

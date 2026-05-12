# Batch 3 Task: Merged Best Analytics Dashboard Page

Use the assigned experiment-local DryUI build skill as the active skill:

`reports/skill-experiments/2026-05-11/batch-3/merged-best/SKILL.md`

Build a Svelte 5 dashboard page concept for DryUI.

Requirements:

- Target is a full page dashboard, not a single card or isolated component.
- The page title is `Analytics Dashboard`.
- Include summary metrics, a primary chart, filters/actions, a data table, a secondary insights/actions region, and useful state handling.
- Use only DryUI components that are verified local exports or explicitly mark APIs as needing verification.
- Use a page shell that owns the named container query.
- Put the responsive grid on the shell's direct inner child.
- Use `data-layout` and `data-layout-area` hooks.
- Put page and section structure in `src/layout.css`.
- Use mobile-first base layout with tablet and desktop `@container` shifts.
- Do not use raw `display: grid` or `display: flex` inside route/component style blocks.
- Do not use layout-wrapper components.
- Include loading, empty, error, disabled, and dense-data state handling.
- For this test, do not edit production files. Write only the requested report output.

Output expected:

1. Target brief.
2. Branch/variant/scoring work required by the assigned skill.
3. Winning implementation plan.
4. Proposed Svelte markup structure.
5. Proposed `src/layout.css` structure.
6. Visual check plan for mobile, tablet, desktop.
7. Self-review against the assigned test skill.

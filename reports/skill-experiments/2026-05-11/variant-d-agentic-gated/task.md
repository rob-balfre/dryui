# Experiment Task: Agentic Dashboard Page

Use `variant-d-agentic-gated/SKILL.md` as the active DryUI build skill.

Build a Svelte 5 dashboard page concept for DryUI.

Requirements:

- Target is a full page dashboard, not a single card or isolated component.
- The page title is "Analytics Dashboard".
- Include regions for summary metrics, a primary chart, filters/actions, and a data table.
- Use DryUI components where available.
- Use a page shell that owns the named container query.
- Put the responsive grid on an inner child.
- Use `data-layout` and `data-layout-area` hooks.
- Put page and section structure in `src/layout.css`.
- Use mobile-first base layout with tablet and desktop `@container` shifts.
- Do not use raw `display: grid` or `display: flex` inside route/component style blocks.
- Do not use layout-wrapper components.
- Include empty, loading, error, disabled, and dense-data state handling in the design.
- Use subagents or local variant sketches to create three variants, score them, and pick the best.

Output expected:

1. Target brief.
2. Three variant summaries with scores.
3. Winning/merged implementation plan.
4. Proposed Svelte markup structure.
5. Proposed `src/layout.css` structure.
6. Visual check plan for mobile, tablet, desktop.
7. Self-review against the test skill.

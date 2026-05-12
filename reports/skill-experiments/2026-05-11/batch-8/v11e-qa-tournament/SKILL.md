---
name: dryui-build
description: 'Experimental DryUI design-to-page skill that compares layout interpretations mentally, implements the best one, and performs screenshot-driven repair. Use when testing robust full-page generation from design references.'
---

# DryUI Full Page: QA Tournament

Build a finished DryUI page from the supplied app mockup image. Use a short internal tournament before coding: consider three layouts, pick the strongest, then implement and repair.

## Experiment Harness Rule

Run `bun run build` before finishing. Do not run `bun run dev`, `bun run check`, or a long-running screenshot/browser server during the agent step; the experiment harness performs browser capture and visual scoring after you finish.

Only edit `src/routes/+page.svelte`, `src/layout.css`, and `src/app.css` if necessary.

## Internal Tournament

Consider three candidates:

- Faithful: closest to the visual shell in the image.
- Dense: best use of desktop and tablet space.
- Mobile-first: best mobile order and reduction.

Pick the candidate that best satisfies:

- primary task is obvious;
- responsive behavior is clear;
- desktop fills the canvas;
- mobile is useful;
- DryUI components can represent the details without brittle APIs.

Do not write the tournament into the UI.

## Implementation Stages

Stage 1: layout map

- classify page as dashboard, board, CRM, settings, or knowledge;
- choose shell regions;
- choose mobile order, tablet split, desktop grid;
- decide guttered vs contiguous sections.

Stage 2: real DryUI page

- import `@dryui/ui`;
- use at least three of `Button`, `Input`, `Badge`, `Table`, `Tabs`, `Separator`;
- use simple static blocks for charts, document surfaces, boards, and previews;
- use concise invented content aligned to the app type;
- avoid copying exact mockup numbers, dates, names, and paragraphs.

Stage 3: repair

- run `bun run build`;
- check 390px, 820px, and 1440px;
- repair overflow, blank space, dark-on-dark surfaces, over-large side panels, and poor mobile order.

## Required Shell Contract

```svelte
<main data-layout="<type>-shell">
	<div data-layout-area="page">
		<header data-layout-area="topbar">...</header>
		<nav data-layout-area="navigation">...</nav>
		<section data-layout-area="primary">...</section>
		<aside data-layout-area="secondary">...</aside>
	</div>
</main>
```

- `page`, `primary`, and one of `topbar`/`navigation` are required.
- Optional shell areas: `rail`, `summary`, `secondary`, `utility`, `actions`.
- Each shell area appears once.
- `data-layout-area` is only for `[data-layout-area='page']` and direct shell children.
- Nested groups use `data-layout`, not `data-layout-area`.

## CSS Contract

`src/layout.css`:

- exact `container: page / inline-size`;
- exact `@container page (min-width: 48rem)`;
- exact `@container page (min-width: 72rem)`;
- all display/grid/flex/container/layout breakpoint rules;
- direct shell child selectors only;
- `grid-template-areas` at each breakpoint that changes the shell;
- `minmax(0, 1fr)` tracks;
- DryUI spacing tokens or `gap: 0` when panes touch.

Route `<style>`:

- visual only;
- no `display`, `grid-*`, `flex-*`, `container`, `@container`, `@media`;
- no `:global()`, `!important`, inline styles, or style directives.

## Visual Quality Bar

- App-like density, not landing-page composition.
- Shell content starts near the top; no dead first viewport.
- Primary surface is largest on desktop.
- Tablet is not just stretched mobile.
- Mobile is not an exhaustive desktop dump.
- Text fits and contrast is readable.
- The page remains light-readable under default DryUI theme imports.

---
name: dryui-build
description: 'Experimental DryUI design-to-page skill focused on dense app layout, viewport fill, and responsive repair after implementing real DryUI components. Use when testing high-fidelity app-page generation from mockup images.'
---

# DryUI Full Page: Density First

Build a finished DryUI app page from the design image. Treat the reference as an operational product screen, not a landing page.

## Experiment Harness Rule

Run `bun run build` before finishing. Do not run `bun run dev`, `bun run check`, or a long-running screenshot/browser server during the agent step; the experiment harness performs browser capture and visual scoring after you finish.

Edit only `src/routes/+page.svelte`, `src/layout.css`, and `src/app.css` if needed.

## Non-Negotiables

- The page must feel like a usable app screen on the first viewport.
- No landing hero, marketing copy, decorative gradients, or oversized editorial cards.
- Desktop must use the canvas. A 1440px viewport should not show a tiny app mockup with blank space around it.
- Mobile must be intentionally summarized. Do not stack every desktop cell or row if it creates a wasteful scroll dump.
- Match whether the reference has gutters. If panes touch, set shell or nested `gap: 0`; if separated, use DryUI space tokens.

## Three Passes

1. Structure: identify shell areas, primary task, mobile order, tablet grouping, and desktop panes.
2. Components: implement a real page using DryUI components and compact static content.
3. Repair: build, check 390/820/1440, then fix density, contrast, overflow, and whitespace.

## DryUI Component Set

Use this safe component set:

- `Button` for commands and icon buttons.
- `Input` for search/filter fields.
- `Badge` for statuses and compact metadata.
- `Table` for tabular CRM or activity rows.
- `Tabs` for modes or grouped sections.
- `Separator` for dense panel separation.

Avoid uncertain APIs. Use static layout blocks for charts, boards, timelines, and document previews.

## Shell Contract

Use one shell:

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

- Required: `page`, `primary`, and `topbar` or `navigation`.
- Optional shell areas: `rail`, `summary`, `secondary`, `utility`, `actions`.
- `data-layout-area` appears only on the page grid and its direct children.
- Nested nodes use `data-layout`.
- Every raw interior element has a meaningful `data-layout`; avoid names like wrapper, inner, box, ui, div, layout.

## `src/layout.css`

Structural CSS only:

- `[data-layout='<type>-shell'] { container: page / inline-size; }`
- `@container page (min-width: 48rem)`
- `@container page (min-width: 72rem)`
- no `@media`
- all `display: grid` and `display: flex` are here;
- all shell area selectors are direct child selectors from `[data-layout-area='page']`;
- route styles never contain display/grid/flex/container rules.

Use compact minimums:

- charts/workspaces should have stable `min-block-size`;
- side panels should not exceed primary;
- dense lists use fixed rhythm and `minmax(0, 1fr)`;
- use `overflow: hidden` only on visual inner primitives, not to hide broken page overflow.

## Visual Style

- Use light neutral surfaces, clear borders, and one or two accent colors from the reference.
- Text must fit its containers and remain readable in light and auto-dark screenshots.
- Use small headings inside panels.
- Button labels are short.
- Do not put fixed dark text on adaptive dark surfaces.

## Self-Audit

Before final:

- `bun run build` passes.
- `@dryui/ui` is imported and DryUI components are visible.
- exact `container: page / inline-size` and exact 48rem/72rem queries exist.
- no raw native controls, inline styles, `@media`, `:global()`, or `!important`.
- at 390px, 820px, and 1440px: no horizontal overflow, no blank shell regions, primary is dominant, and page density matches the app type.

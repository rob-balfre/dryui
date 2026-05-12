---
name: dryui-build
description: 'Experimental DryUI page skill for image-to-app layouts using a markup-only route, page container queries, and a hard layout CSS audit. Use when testing stage 1 layout extraction, stage 2 DryUI implementation, and stage 3 responsive visual repair.'
---

# DryUI Page Layout: Shell Audit

Build the supplied design image as a finished DryUI app page. Work mobile-first, then tablet, then desktop.

## File Contract

- `src/routes/+page.svelte`: markup, data hooks, imports, data arrays, and DryUI components only. Do not add a `<style>` block.
- `src/layout.css`: every `display: grid`, `display: flex`, `container`, `@container`, grid area, gap, alignment, and block-size rule.
- `src/app.css`: visual-only styling: color, background, border, radius, shadow, typography, and custom properties.
- Do not edit other files unless build fails for a missing import.

## Stage 1: Extract The Shell

Identify the screen type, primary task, required regions, and whether the reference has gutters between regions.

Use this direct-child shell shape:

```svelte
<main data-layout="<screen>-shell">
	<div data-layout-area="page">
		<header data-layout-area="topbar">...</header>
		<nav data-layout-area="navigation">...</nav>
		<section data-layout-area="primary">...</section>
		<aside data-layout-area="secondary">...</aside>
	</div>
</main>
```

- Required areas: `page`, `primary`, and `topbar` or `navigation`.
- Optional direct children: `rail`, `summary`, `secondary`, `utility`, `actions`.
- `data-layout-area` appears only on the page grid and its direct children.
- Nested elements use `data-layout="<specific-purpose>"`, never generic names like `wrapper`, `inner`, `box`, `container`, or `layout`.

## Stage 2: Implement The Page

- Use real DryUI components for controls: `Button`, `Input`, `Badge`, `Separator`, `Table`, and `Tabs`.
- Import from `@dryui/ui`; do not pass `class=` or `class:` to DryUI components.
- Use static visual blocks for charts, previews, kanban columns, timelines, and maps.
- Keep the first viewport dense and useful. Mobile should summarize; desktop should fill the canvas.
- Match the reference gutter logic: if regions touch in the image, set the relevant layout gap to `0`; if they are separated, use DryUI spacing tokens.

## Stage 3: Layout CSS And Repair

`src/layout.css` must include this exact container contract:

```css
[data-layout='<screen>-shell'] {
	container: page / inline-size;
	min-block-size: 100dvh;
}

[data-layout='<screen>-shell'] > [data-layout-area='page'] {
	display: grid;
	min-block-size: 100dvh;
	grid-template-areas: ...;
}

@container page (min-width: 48rem) { ... }
@container page (min-width: 72rem) { ... }
```

- Use direct child selectors for shell areas: `[data-layout='<screen>-shell'] > [data-layout-area='page'] > [data-layout-area='primary']`.
- Use `grid-template-areas` at mobile, tablet, and desktop.
- Use `minmax(0, 1fr)` for flexible tracks.
- Use stable `min-block-size` for charts, tables, boards, and preview panes.
- Do not use `@media`, `:global()`, `!important`, inline `style=`, or Svelte `style:` directives.

## Final Audit

Run `bun run build`.

Then run these searches and fix any output:

```sh
rg -n "<style|display:|@container|container:|grid-|flex" src/routes/+page.svelte
rg -n "@media|:global|!important|style=|style:" src src/layout.css
rg -n "display: *(grid|flex)|@container|container:|grid-template|grid-area|flex-" src/app.css
```

At 390px, 820px, and 1440px the page must have no horizontal overflow, no blank app shell, readable contrast, dominant primary content, and an intentional mobile summary.

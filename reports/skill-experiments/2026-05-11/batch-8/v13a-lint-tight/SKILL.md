---
name: dryui-build
description: 'Experimental DryUI page skill for image-to-app layouts using page container queries and the strict DryUI layout.css lint subset. Use when testing stage 1 extraction, stage 2 implementation, and stage 3 build/visual repair.'
---

# DryUI Page Layout: Lint Tight

Build the supplied design image as a finished DryUI app page. Use mobile-first layout, tablet refinement, then desktop.

## Three Stages

1. Identify the screen type, primary task, shell regions, mobile order, and whether panes touch or have gutters.
2. Implement the page with DryUI components and meaningful `data-layout` hooks.
3. Run `bun run build`; repair lint or compile errors before stopping.

## File Contract

- `src/routes/+page.svelte`: markup, imports, data arrays, and DryUI components only. No `<style>` block.
- `src/layout.css`: structural layout only.
- `src/app.css`: visual styling only.
- Do not edit other files unless `bun run build` fails because an import is missing.

## Shell Markup

Use one shell and one page grid:

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

- Required: `page`, `primary`, and `topbar` or `navigation`.
- Optional direct areas: `rail`, `summary`, `secondary`, `utility`, `actions`.
- `data-layout-area` appears only on the page grid and its direct children.
- Everything nested uses `data-layout="<specific-purpose>"`; never generic names like `wrapper`, `inner`, `box`, `container`, `layout`, or `ui`.

## DryUI Components

- Use `Button`, `Input`, `Badge`, `Separator`, `Table`, and `Tabs` from `@dryui/ui`.
- Do not pass `class=` or `class:` to DryUI components.
- Use static `data-layout` blocks for charts, kanban boards, preview panes, timelines, metrics, and maps.
- Do not inspect `node_modules` unless `bun run build` reports an import error.

## `src/layout.css` Rules

Start with this exact container contract:

```css
[data-layout='<screen>-shell'] {
	container: page / inline-size;
	min-block-size: 100dvh;
}

[data-layout='<screen>-shell'] > [data-layout-area='page'] {
	display: grid;
	min-block-size: 100dvh;
	grid-template-areas: ...;
	grid-template-columns: minmax(0, 1fr);
}

@container page (min-width: 48rem) { ... }
@container page (min-width: 72rem) { ... }
```

Only use these selector forms in `src/layout.css`:

- `[data-layout='name']`
- `[data-layout-area='name']`
- direct-child shell selectors using `>`

Never use these in `src/layout.css`:

- `display: none`, `display: block`, `display: contents`, `display: inline-flex`, or any display value except `grid` and `flex`
- `[data-ui]`, element selectors, pseudo selectors, `:first-child`, `:last-child`, `span`, `button`, or descendant selectors used to reach unnamed children
- `width`, `inline-size`, `min-inline-size`, `max-inline-size`, `height`, `position`, `z-index`, color, background, border, shadow, text, transform, transition, opacity
- `@media`, `:global()`, `!important`, inline `style=`, or Svelte `style:`

If an item should disappear at a breakpoint, prefer one content model that works across sizes. Do not hide/show alternate copies with CSS.

## Visual CSS

Use `src/app.css` for color, surfaces, borders, radius, typography, chart fills, and readable foreground/background pairs. Keep it free of `display: grid`, `display: flex`, `container`, `@container`, and grid/flex track rules.

## Final Audit

Before final, `bun run build` must pass.

Then run:

```sh
rg -n "<style|display:|@container|container:|grid-|flex" src/routes/+page.svelte
rg -n "display: *(none|block|contents|inline-flex)|data-ui|:first-child|:last-child|inline-size|position:|width:|height:" src/layout.css
rg -n "display: *(grid|flex)|@container|container:|grid-template|grid-area|flex-" src/app.css
```

Fix any output. The 390px, 820px, and 1440px captures must have no horizontal overflow, no blank shell, readable contrast, dominant primary content, and a compact mobile summary.

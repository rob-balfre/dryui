---
name: dryui-build
description: Experimental DryUI layout-only skill that prioritizes app shell chrome, rails, and persistent navigation before content blocks. Use when testing responsive page layout extraction from web app screenshots.
---

# DryUI Layout Blocks: Chrome First

Build a layout-only colored block prototype. Do not build the actual app UI.

Edit only `src/routes/+page.svelte` and `src/layout.css`. Do not import anything. Do not use DryUI components, icons, SVGs, images, charts, tables, forms, buttons, inputs, or realistic widgets.

## Extraction Order

When a design image is supplied, identify shell chrome before content:

1. Top app bar/header.
2. Left rail, sidebar, section nav, or bottom mobile nav.
3. Right inspector/help/AI/account panel.
4. Sticky footer/action bar.
5. Main content/workspace.
6. Secondary lists, KPI strips, activity, utilities.

If a desktop reference has a dark left navigation rail or sidebar, the desktop layout must include a left rail/side nav region. If mobile shows that navigation as top/bottom chrome, represent it as top/bottom chrome in the base layout and move it to the side only at desktop.

## Shell Pattern

```svelte
<main data-layout="<name>-shell">
	<div data-layout-area="page">
		<header data-layout-area="topbar">...</header>
		<nav data-layout-area="navigation">...</nav>
		<section data-layout-area="primary">...</section>
	</div>
</main>
```

Add only meaningful direct child regions. No generic wrapper areas.

## CSS Pattern

In `src/layout.css`:

```css
[data-layout='<name>-shell'] {
	container: <name> / inline-size;
}

[data-layout='<name>-shell'] [data-layout-area='page'] {
	display: grid;
	grid-template-areas:
		'topbar'
		'navigation'
		'primary';
}

@container <name> (min-width: 48rem) {
}
@container <name> (min-width: 72rem) {
}
```

The named container and `@container` name must match.

## Responsive Rules

- Mobile base: one column; nav is a top, tab, or bottom block.
- Tablet: preserve shell chrome, then let primary and one support region share width if the reference does.
- Desktop: place persistent rails first in the grid template. Common shapes:
  - `navigation topbar topbar`
  - `navigation primary secondary`
  - `navigation footer footer`
- For desktop rails, use fixed-ish tracks such as `12rem` to `16rem`; use `minmax(0, 1fr)` for primary content.
- Do not flatten a desktop app shell into a plain full-width form or list if the reference has a strong side rail.

## Spacing Decision

Use `gap: 0` for attached shell chrome and contiguous panes. Use tokenized gaps only where the reference has visible gutters. Do not show white/body background between attached panes.

## Visual Styling

In the route `<style>`, use distinct colored blocks and readable labels. Make chrome blocks visually different from content blocks: rails/nav can be dark, primary content can be larger/lighter.

## Failure Gates

- Missing desktop rail when one appears in the reference.
- Side rail appears on mobile before desktop.
- Primary content loses dominance to chrome/support blocks.
- `src/layout.css` lacks matched `container:` and `@container` names.
- Any import, real component, icon, image, chart, table, form, button, or input.
- Horizontal overflow or clipped labels at 390px, 820px, or 1440px.

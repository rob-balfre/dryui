---
name: dryui-layout
description: Phase 1 (Zones) of DryUI layout. Produce a page-level grid skeleton in a `.svelte` file plus the matching grid template in `src/layout.css`. Named regions, mobile-first base, `@container page (...)` queries for responsive shifts (never `@media`). All grid CSS lives in `src/layout.css`, scoped under `[data-layout="<name>"]`. Phase 1 markup uses plain HTML elements with `data-layout-area="<region>"` placeholders — no DryUI components yet (Phase 2 will place those). Use whenever a `.svelte` file in a DryUI consumer project needs page or section structure: named-area layouts, sidebar/main/header layouts, dashboard regions, responsive area shifts. The skill is satisfied when every rule below is greppable-clean and the layout renders correctly at narrow and wide viewports.
---

# DryUI Layout — Phase 1 (Zones)

Produce the page-level grid skeleton: named regions with placeholder content. Phase 2 (components) and Phase 3 (polish) come later. This skill stops at the structural shape.

## Setup (one-time per project)

Verify these before writing any layout. If missing, fix first.

**1. Body is the page container.** In `src/app.css`:

```css
body {
	container-type: inline-size;
	container-name: page;
}
```

Without this, every `@container page (...)` rule silently fails. Layouts cannot query their own width directly — the container lives one element above.

**2. `src/layout.css` exists and is imported.** In `src/routes/+layout.svelte`:

```svelte
<script lang="ts">
	import '../app.css';
	import '../layout.css';
</script>

{@render children?.()}
```

Create `src/layout.css` empty if not present.

## The pattern

Mark the layout root with `data-layout="<name>"`. Each region is a direct child carrying `data-layout-area="<area>"`. The grid template lives in `src/layout.css`, mobile-first, with `@container page (...)` adding wider breakpoints.

```svelte
<!-- src/routes/docs/+page.svelte -->
<div data-layout="docs">
	<header data-layout-area="masthead">masthead</header>
	<nav data-layout-area="nav">nav</nav>
	<main data-layout-area="main">main</main>
	<aside data-layout-area="aside">aside</aside>
	<footer data-layout-area="foot">foot</footer>
</div>
```

```css
/* src/layout.css */

[data-layout='docs'] {
	display: grid;
	grid-template-columns: 1fr;
	grid-template-areas:
		'masthead'
		'nav'
		'main'
		'aside'
		'foot';
	gap: 0.75rem;
	padding: 1rem;
	min-block-size: 100dvh;
}

[data-layout='docs'] > [data-layout-area='masthead'] {
	grid-area: masthead;
}
[data-layout='docs'] > [data-layout-area='nav'] {
	grid-area: nav;
}
[data-layout='docs'] > [data-layout-area='main'] {
	grid-area: main;
}
[data-layout='docs'] > [data-layout-area='aside'] {
	grid-area: aside;
}
[data-layout='docs'] > [data-layout-area='foot'] {
	grid-area: foot;
}

@container page (min-width: 64rem) {
	[data-layout='docs'] {
		grid-template-columns: 14rem minmax(0, 1fr) 22rem;
		grid-template-rows: auto 1fr auto;
		grid-template-areas:
			'masthead masthead masthead'
			'nav      main     aside'
			'foot     main     aside';
	}
}
```

## Hard rules

**Markup (in the `.svelte` file):**

- **R1.** Exactly one root element with `data-layout="<kebab-name>"`. The name is unique in the project.
- **R2.** For each _named_ region (any name appearing in the layout's `grid-template-areas`), the matching direct child of the root carries `data-layout-area="<region-name>"`. Auto-flow grids (no `grid-template-areas`) place children automatically and don't require `data-layout-area` on each child. Use semantic HTML elements (`<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`, `<section>`) where they fit; otherwise `<div>`.
- **R3.** Phase 1 region content is a short placeholder text label. No real components.
- **R4.** Nested layouts combine attributes on one element: `<section data-layout="admin-stats" data-layout-area="stats">`. Children of that element use their own `data-layout-area` values matched by the nested grid template.
- **R5.** No `<style>` block in the file.
- **R6.** No inline `style=` attributes; no Svelte `style:` directives.
- **R7.** No `class=` attributes. Phase 1 is zones only; classes belong to later phases.

**CSS (in `src/layout.css`):**

- **R8.** Every rule scoped under `[data-layout='<name>']`. No bare element selectors.
- **R9.** Base block targets the smallest viewport. When in doubt, mobile = single column (`grid-template-columns: 1fr`).
- **R10.** Every name in `grid-template-areas` has a matching `[data-layout='<name>'] > [data-layout-area='<area>'] { grid-area: <area>; }` rule. One per area.
- **R11.** Larger viewports add via `@container page (min-width: <Xrem>) { [data-layout='<name>'] { ... } }`. Never `@media`.
- **R12.** No `display: flex` anywhere in `src/layout.css`. Grid only.

**File scope:**

- **R13.** Every byte of layout CSS lives in `src/layout.css`. No grid or flex in component `<style>` blocks, ever.
- **R14.** No new files beyond the target `.svelte` (if new) and edits to `src/layout.css` and (if needed) `src/app.css` for setup.

## Track sizing

- Content-bearing tracks (main, body, article): `1fr` or `minmax(0, 1fr)`.
- Sidebars / rails: specific widths like `12rem`, `14rem`, `18rem`, `22rem`.
- Headers, footers, single-row sections: `auto`.
- **Never bare `auto` for content tracks** — at narrow widths and with placeholder content, `auto` collapses to label width and the layout looks broken.

## Pinning a footer to viewport bottom

Add a `1fr` empty row before the footer in `grid-template-areas`:

```css
[data-layout='page'] {
	grid-template-areas: 'masthead' 'main' '.' 'foot';
	grid-template-rows: auto auto 1fr auto;
	min-block-size: 100dvh;
}
```

The empty `'.'` row absorbs leftover vertical space; the footer sits below it at viewport bottom.

## Common shapes (snippets)

### Stacked (header / main / footer)

```css
[data-layout='stack'] {
	display: grid;
	grid-template-columns: 1fr;
	grid-template-areas: 'masthead' 'main' '.' 'foot';
	grid-template-rows: auto auto 1fr auto;
	min-block-size: 100dvh;
}
```

### Sidebar + main

Mobile single-col → desktop two-col.

```css
[data-layout='settings'] {
	display: grid;
	grid-template-columns: 1fr;
	grid-template-areas: 'masthead' 'nav' 'main';
}

@container page (min-width: 56rem) {
	[data-layout='settings'] {
		grid-template-columns: 14rem minmax(0, 1fr);
		grid-template-areas:
			'masthead masthead'
			'nav      main';
	}
}
```

### Card grid (auto-flow, no named areas)

```css
[data-layout='gallery'] {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
	gap: 1rem;
}
```

(No `> [data-layout-area=...]` rules needed; cards flow into auto-placed cells.)

### Centered (single area)

```css
[data-layout='auth'] {
	display: grid;
	place-items: center;
	min-block-size: 100dvh;
}
```

## Visualization (Phase 1 only)

Phase 1 zones are placeholder regions, not real components. To make them visible during development, add this rule once to `src/app.css`:

```css
[data-layout-area] {
	min-block-size: 2.5rem;
	padding: 0.75rem;
	border: 1px dashed #aaa;
	border-radius: 0.5rem;
	background: #fff;
	color: #555;
	font-size: 0.875rem;
	text-align: center;
}
```

Plain box + dashed outline + centered text. No `display: grid` (which would violate R13) and no rules for nested layouts (their own `[data-layout='<name>']` block in `layout.css` wins). Phase 2 (components) replaces the placeholders with real DryUI components and these visualization styles drop away naturally.

## Verification (greppable per-rule)

Run these after authoring. The skill is satisfied only when every check passes.

| What         | Check                                                                               |
| ------------ | ----------------------------------------------------------------------------------- | ----------------------------------------------- | ----------------------------------- |
| Setup #1     | `grep -E 'container-type:\s*inline-size' src/app.css` matches                       |
| Setup #2     | `grep "import '../layout.css'" src/routes/+layout.svelte` matches                   |
| R1           | the file contains exactly one `data-layout=` on the root element                    |
| R5, R6, R7   | the file is clean of `<style>`, `style=`, `style:`, `class=`                        |
| R10          | every area name in `grid-template-areas` has a matching `> [data-layout-area=` rule |
| R11          | `grep '@media' src/layout.css` is empty; `@container page` matches                  |
| R12          | `grep -E 'display:\s*(inline-)?flex' src/layout.css` is empty                       |
| R13          | `grep -rE 'display:\s\*(grid                                                        | (inline-)?flex)' src/**/\*.svelte src/**/\*.css | grep -v 'src/layout\.css'` is empty |
| R9           | view at 400px width → single column                                                 |
| R11 (visual) | view at 1280px width → `@container page` rules apply                                |

## Output gate

When the layout renders correctly at narrow and wide viewports and every rule passes, emit:

```
LAYOUT (zones) DONE
- file: <path>
- root: data-layout='<name>'
- areas: <comma-separated>
- breakpoints: base(, page@<Xrem>)
- src/layout.css: block scoped under [data-layout='<name>']
- visual: matches brief at narrow and wide
```

NEXT: Phase 2 (Components) — placing real DryUI components in each area. Not yet written.

## Tone

Quiet. One sentence on what you're about to do, then the edits. No design philosophy, no defending the rules. The skill is the rationale; you are the execution.

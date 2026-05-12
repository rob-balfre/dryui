---
name: dryui-build
description: 'Experimental DryUI page skill for image-to-app layouts using a copyable lint-safe layout template and a fixed menu of layout primitives. Use when testing reliable stage 1 extraction, stage 2 implementation, and stage 3 build repair.'
---

# DryUI Page Layout: Template First

Build the supplied design image as a finished DryUI app page. Use the template below first, then adapt content and visual styling.

## Experiment Harness Rule

Run `bun run build` before final. Do not run `bun run dev`, `bun run check`, browser screenshots, or extra search audits; the harness does source and visual checks after you finish.

## Files

- `src/routes/+page.svelte`: markup, imports, data arrays, and DryUI components only. No `<style>`.
- `src/layout.css`: copy the safe template below and only use its selector/property patterns.
- `src/app.css`: visual CSS only. No `display`, `grid`, `flex`, `container`, `@container`, or `@media`.

## Stage 1: Choose Content

Identify the reference as one of: dashboard, settings, CRM, kanban, knowledge workspace, or admin console.

Keep the shell fixed:

```svelte
<main data-layout="app-shell">
	<div data-layout-area="page">
		<header data-layout-area="topbar">...</header>
		<nav data-layout-area="navigation">...</nav>
		<section data-layout-area="primary">...</section>
		<aside data-layout-area="secondary">...</aside>
	</div>
</main>
```

Use these nested layout names only: `toolbar-cluster`, `brand-cluster`, `search-cluster`, `app-stack`, `panel-stack`, `metric-grid`, `content-grid`, `board-grid`, `list-stack`, `chart-grid`, `table-frame`, `preview-stack`.

## Stage 2: Implement UI

- Use `Button`, `Input`, `Badge`, `Separator`, `Table`, and `Tabs` from `@dryui/ui`.
- Do not pass `class=` or `class:` to DryUI components.
- Use static blocks for charts, boards, previews, timelines, and maps.
- Mobile should summarize the most important content; desktop should fill the shell.
- Do not inspect `node_modules` unless `bun run build` reports a missing import.

## Stage 3: Copy This `src/layout.css`

Use this as the whole structural stylesheet. You may remove unused primitive selectors, but do not add new selector forms or banned properties.

```css
[data-layout='app-shell'] {
	container: page / inline-size;
	min-block-size: 100dvh;
}

[data-layout='app-shell'] > [data-layout-area='page'] {
	display: grid;
	min-block-size: 100dvh;
	grid-template-areas:
		'topbar'
		'primary'
		'secondary'
		'navigation';
	grid-template-columns: minmax(0, 1fr);
	grid-template-rows: auto minmax(0, 1fr) auto auto;
	gap: var(--dry-space-3);
}

[data-layout='app-shell'] > [data-layout-area='page'] > [data-layout-area='topbar'] {
	grid-area: topbar;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: var(--dry-space-3);
}

[data-layout='app-shell'] > [data-layout-area='page'] > [data-layout-area='navigation'] {
	grid-area: navigation;
	display: grid;
	grid-template-columns: minmax(0, 1fr);
	gap: var(--dry-space-2);
}

[data-layout='app-shell'] > [data-layout-area='page'] > [data-layout-area='primary'] {
	grid-area: primary;
	display: grid;
	grid-template-columns: minmax(0, 1fr);
	gap: var(--dry-space-3);
}

[data-layout='app-shell'] > [data-layout-area='page'] > [data-layout-area='secondary'] {
	grid-area: secondary;
	display: grid;
	grid-template-columns: minmax(0, 1fr);
	gap: var(--dry-space-3);
}

[data-layout='toolbar-cluster'],
[data-layout='brand-cluster'],
[data-layout='search-cluster'] {
	display: flex;
	align-items: center;
	gap: var(--dry-space-2);
	flex-wrap: wrap;
}

[data-layout='toolbar-cluster'] {
	justify-content: flex-end;
}

[data-layout='app-stack'],
[data-layout='panel-stack'],
[data-layout='list-stack'],
[data-layout='preview-stack'] {
	display: grid;
	grid-template-columns: minmax(0, 1fr);
	gap: var(--dry-space-3);
}

[data-layout='metric-grid'],
[data-layout='content-grid'],
[data-layout='board-grid'] {
	display: grid;
	grid-template-columns: minmax(0, 1fr);
	gap: var(--dry-space-3);
}

[data-layout='chart-grid'] {
	display: grid;
	grid-template-columns: repeat(6, minmax(0, 1fr));
	align-items: end;
	gap: var(--dry-space-2);
	min-block-size: 14rem;
}

[data-layout='table-frame'] {
	display: grid;
	grid-template-columns: minmax(0, 1fr);
	min-block-size: 18rem;
}

@container page (min-width: 48rem) {
	[data-layout='app-shell'] > [data-layout-area='page'] {
		grid-template-areas:
			'topbar topbar'
			'primary primary'
			'secondary secondary'
			'navigation navigation';
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: var(--dry-space-4);
	}

	[data-layout='metric-grid'],
	[data-layout='content-grid'],
	[data-layout='board-grid'] {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}

@container page (min-width: 72rem) {
	[data-layout='app-shell'] > [data-layout-area='page'] {
		grid-template-areas:
			'navigation topbar topbar'
			'navigation primary secondary';
		grid-template-columns: 14rem minmax(0, 1fr) minmax(18rem, 0.35fr);
		grid-template-rows: auto minmax(0, 1fr);
		gap: var(--dry-space-4);
	}

	[data-layout='app-shell'] > [data-layout-area='page'] > [data-layout-area='navigation'] {
		align-content: start;
	}

	[data-layout='metric-grid'] {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	[data-layout='board-grid'],
	[data-layout='content-grid'] {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}
}
```

Do not use `@media`, `width`, `height`, `inline-size`, `position`, `display: none`, `display: block`, `[data-ui]`, pseudo selectors, or element selectors in `src/layout.css`.

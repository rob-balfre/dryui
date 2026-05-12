---
name: dryui-build
description: 'Experimental DryUI mobile-first fixture skill for image-to-app layout tests. Use when testing stage 1 page classification, stage 2 compact DryUI implementation, and stage 3 build/visual repair.'
---

# DryUI Page Layout: Mobile Compact Fixture

Build the supplied design image as a finished DryUI app page. Optimize for a clean build, lint-safe layout, and responsive shell fidelity before visual embellishment.

## Harness Rule

Run `bun run build` before final. Do not run dev servers, browser checks, extra audits, or broad package searches. The harness captures mobile, tablet, and desktop after you finish.

## Stage 1: Pick One Recipe

Identify the page as one of these recipes and keep the fixed shell:

- `dashboard`: metrics in primary, chart/table panels below, activity in secondary.
- `settings`: nav in navigation, form/status panels in primary, help/activity in secondary.
- `crm`: pipeline/list panels in primary, deal summary in secondary.
- `kanban`: board columns in primary, project health in secondary.
- `knowledge`: documents/search/results in primary, source summary in secondary.

Use this shell exactly:

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

## Stage 2: Build With Safe Elements

Use these imports only unless build reports a missing import:

```svelte
import {Badge} from '@dryui/ui/badge'; import {Button} from '@dryui/ui/button'; import {Heading} from
'@dryui/ui/heading'; import {Image} from '@dryui/ui/image'; import {Input} from '@dryui/ui/input'; import
{Link} from '@dryui/ui/link'; import {Separator} from '@dryui/ui/separator'; import {Table} from '@dryui/ui/table';
import {Text} from '@dryui/ui/text';
```

Do not use raw text/media/link elements: no `<p>`, `<span>`, `<strong>`, `<img>`, `<a>`, `<ul>`, or `<li>`. Use `Heading`, `Text`, `Image`, `Link`, `Button`, `Badge`, and `Table`.

Raw structural elements are allowed only when they have `data-layout` or `data-layout-area` and that layout name exists in `src/layout.css`.

Good panel pattern:

```svelte
<article data-layout="panel-stack" data-tone="surface">
	<div data-layout="section-heading">
		<Heading level={2}>Revenue mix</Heading>
		<Text color="muted" size="sm">Updated 4 minutes ago</Text>
	</div>
	<div data-layout="row-cluster">
		<Badge color="green">Live</Badge>
		<Button variant="outline">Open</Button>
	</div>
</article>
```

Rules:

- No `<style>` in `src/routes/+page.svelte`.
- No `class=` or `class:` on DryUI components.
- No inline `style=` or `style:` directives.
- Keep content real enough: headings, labels, metrics, statuses, and table rows.
- Keep repeated content compact: up to 4 metrics, 4 table/list rows, 3 board columns, 2 cards per board column, and 2 secondary panels.
- Keep navigation compact: 4 to 6 items. Mobile places navigation immediately below the topbar, so do not add a second sidebar at the end of the page.
- Prefer simple static blocks over complex chart mechanics. Use `data-layout="chart-grid"` with nested `data-layout="chart-bar"` wrappers if needed.

## Stage 3: Copy `src/layout.css` Exactly

Replace `src/layout.css` with this exact structural stylesheet. Do not add, remove, or edit selectors/properties.

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
		'navigation'
		'primary'
		'secondary';
	grid-template-columns: minmax(0, 1fr);
	grid-template-rows: auto auto minmax(0, 1fr) auto;
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
	align-content: start;
	gap: var(--dry-space-2);
}

[data-layout='app-shell'] > [data-layout-area='page'] > [data-layout-area='primary'],
[data-layout='app-shell'] > [data-layout-area='page'] > [data-layout-area='secondary'] {
	display: grid;
	grid-template-columns: minmax(0, 1fr);
	align-content: start;
	gap: var(--dry-space-3);
}

[data-layout='app-shell'] > [data-layout-area='page'] > [data-layout-area='primary'] {
	grid-area: primary;
}

[data-layout='app-shell'] > [data-layout-area='page'] > [data-layout-area='secondary'] {
	grid-area: secondary;
}

[data-layout='brand-cluster'],
[data-layout='toolbar-cluster'],
[data-layout='row-cluster'],
[data-layout='section-heading'] {
	display: flex;
	align-items: center;
	gap: var(--dry-space-2);
	flex-wrap: wrap;
}

[data-layout='toolbar-cluster'],
[data-layout='row-cluster'] {
	justify-content: flex-end;
}

[data-layout='app-stack'],
[data-layout='panel-stack'],
[data-layout='list-stack'],
[data-layout='table-frame'],
[data-layout='preview-stack'] {
	display: grid;
	grid-template-columns: minmax(0, 1fr);
	gap: var(--dry-space-3);
}

[data-layout='metric-grid'],
[data-layout='content-grid'],
[data-layout='board-grid'],
[data-layout='chart-grid'] {
	display: grid;
	grid-template-columns: minmax(0, 1fr);
	gap: var(--dry-space-3);
}

[data-layout='chart-bar'] {
	display: grid;
	align-items: end;
	min-block-size: 8rem;
}

@container page (min-width: 48rem) {
	[data-layout='app-shell'] > [data-layout-area='page'] {
		grid-template-areas:
			'topbar topbar topbar'
			'navigation primary secondary';
		grid-template-columns: 12rem minmax(0, 1fr) minmax(14rem, 0.45fr);
		gap: var(--dry-space-4);
	}

	[data-layout='metric-grid'],
	[data-layout='content-grid'],
	[data-layout='board-grid'],
	[data-layout='chart-grid'] {
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
	}

	[data-layout='metric-grid'] {
		grid-template-columns: repeat(4, minmax(0, 1fr));
	}

	[data-layout='content-grid'],
	[data-layout='board-grid'],
	[data-layout='chart-grid'] {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}
}
```

## Visual CSS

`src/app.css` is visual only. It may set colors, borders, radius, padding, margin, typography, shadows, custom properties, and overflow. It must not contain `display`, `grid`, `flex`, `container`, `@container`, or `@media`.

Add defensive visual constraints in `src/app.css`:

- `body { overflow-x: clip; }`
- Use readable high-contrast pairs: light panels with `#0f172a` text and muted text no lighter than `#475569`; dark navigation with text no darker than `#e5eefb`.
- Add `min-inline-size: 0`, `max-inline-size: 100%`, and `overflow-wrap: anywhere` to panel-like wrappers and long text surfaces.
- Keep mobile full-page height under roughly 3200px by using fewer rows/cards instead of hiding content.

---
name: dryui-build
description: 'Experimental DryUI CRM-density fixture with preview and root-CSS guards for image-to-app layout tests. Use when testing stage 1 page classification, stage 2 runtime-safe DryUI implementation, and stage 3 build/visual repair.'
---

# DryUI Page Layout: CRM-Density With Preview Guard

Build the supplied design image as a concise DryUI app page. Optimize for clean build output, lint-safe layout, responsive shell fidelity, and a readable first viewport before visual embellishment.

## Harness Rule

Run `bun run build` before final. Do not run dev servers, browser checks, extra audits, or broad package searches. The harness captures mobile, tablet, and desktop after you finish.

Work fast:

- Read the design image once, pick the closest recipe, then edit the three files directly.
- Do not inspect package internals unless `bun run build` reports a missing import.
- Prefer compact arrays plus `{#each}` loops over repeated markup.
- If uncertain about a visual detail, preserve the page structure and use clear text evidence rather than inventing a complex widget.

## Stage 1: Pick One Recipe And Budget

Identify the page as one of these recipes and keep the fixed shell:

- `dashboard`: one metric grid, one evidence panel, one activity panel, and up to two secondary insight panels.
- `settings`: one nav, two primary form/status panels, and up to two secondary help/billing/activity panels.
- `crm`: one metric grid, one deals panel, choose exactly one forecast/account panel, and one compact secondary activity/customer panel.
- `kanban`: one nav, one board grid with three columns and one card per column, plus up to two secondary detail/activity panels.
- `knowledge`: one light collections panel, one documents/results panel, one selected-document panel, and up to two secondary AI/source panels.

Hard budget: after the topbar and navigation, use no more than five top-level panels/cards total. A grid of metrics counts as one panel. Do not add storage, extra status, duplicate activity, or extra summary panels unless they replace another panel.

Mobile density budget:

- Target a useful mobile first viewport and keep the full mobile document under roughly 2800px tall.
- Use short mobile-safe page names in the topbar. If a title would wrap awkwardly in 320px, shorten it, for example `Knowledge` becomes `Knowledge Base` only when it fits, otherwise `Knowledge`.
- Do not let a single hero image, preview, or document mock consume the mobile page. Keep media as supporting evidence, not the main height driver.
- Prefer two compact secondary panels over three long panels. If the reference has many side utilities, merge them into one compact summary panel and one compact sources/activity panel.
- For settings pages, use two primary panels and at most two secondary panels. Each secondary panel should have at most two rows.
- For CRM pages, use four top-level panels after the topbar/nav: metric grid, deals, forecast or account, and one compact secondary. Do not include both a forecast panel and a full account/customer panel. If the reference shows both, merge the account/customer facts into the secondary panel.

Before editing, commit to this task list mentally:

1. Name the recipe.
2. Count the top-level panels allowed by the recipe.
3. Write `src/routes/+page.svelte` using only the fixed shell areas.
4. Copy `src/layout.css` exactly.
5. Write `src/app.css` as visual paint only.
6. Run `bun run build` once and fix only build errors.

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
{Link} from '@dryui/ui/link'; import {Separator} from '@dryui/ui/separator'; import {Text} from '@dryui/ui/text';
```

Do not use raw text/media/link elements: no `<p>`, `<span>`, `<strong>`, `<img>`, `<a>`, `<ul>`, or `<li>`. Use `Heading`, `Text`, `Image`, `Link`, `Button`, `Badge`, and `Separator`.

Do not import or use `Table`. A previous experiment proved `<Table>` can build but fail at runtime. Represent rows with `data-layout="list-stack"` and row wrappers that contain `Text`, `Badge`, and `Button`.

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
- Keep content real enough: headings, labels, metrics, statuses, and list rows.
- Keep repeated content compact: up to 3 metrics, 3 list rows, 3 board columns, 1 card per board column, and 1 to 2 secondary panels.
- For CRM specifically: use 3 metrics, 2 deal rows, 2 forecast/account facts, and 2 secondary activity/customer rows. Keep visible copy terse; a CRM page should target roughly 70 to 90 visible words, not 100+.
- For document, knowledge, or preview-heavy pages, use only 2 list rows, 2 key points, 2 sources, and 1 compact preview unless the supplied reference clearly depends on more.
- For knowledge/document preview areas, do not use `Image`. Build a compact text-and-badge preview inside `data-layout="preview-stack"` instead. A previous pass produced a 5800px-tall page because the Image component escaped the preview frame.
- Keep all topbar headings to one readable line on mobile. Use shorter labels rather than allowing awkward mid-word wraps.
- Keep navigation compact: 4 to 6 items. Mobile places navigation immediately below the topbar, so do not add a second sidebar at the end of the page.
- Avoid complex chart mechanics. For dashboard/analytics references, show the chart as compact evidence: metric cards, a short list, or a simple `data-layout="content-grid"` of labelled status panels. Do not create tall decorative bar charts, huge pills, radial charts, canvas, SVG, or proportional fake chart bars.
- Every section must earn its height. If it does not communicate a distinct part of the reference, remove it.
- Use light navigation for every recipe in this experiment. Do not create dark navigation. The earlier dark-nav experiments repeatedly produced unreadable Button/Badge text in the browser.
- Do not align or position DryUI internals with CSS. If a Button icon is not perfectly placed, accept the component default.
- Previews must be compact: put them inside a `data-layout="preview-stack"` wrapper and use `overflow: clip`, `border-radius`, and `aspect-ratio` in `src/app.css`. Do not use width, height, inline-size, block-size, min-inline-size, or max-inline-size outside the one defensive group.

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
		grid-template-columns: 11rem minmax(0, 1fr) minmax(13rem, 0.4fr);
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
		grid-template-columns: 13rem minmax(0, 1fr) minmax(17rem, 0.33fr);
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

It also must not contain these layout-ish properties anywhere:

- `justify-content`, `align-items`, `align-content`, `place-content`, `place-items`, `order`
- `gap`, `row-gap`, `column-gap`
- `position`, `inset`, `top`, `right`, `bottom`, `left`, `float`
- `width`, `height`, `inline-size`, `block-size`, `flex-shrink`, `flex-grow`, `flex-basis`

The only exception is the defensive selector group below, where `min-inline-size`, `max-inline-size`, and `overflow-wrap` are allowed. Paste this group exactly once, preferably near the top of `src/app.css`, and do not write `min-inline-size`, `max-inline-size`, `inline-size`, `block-size`, `width`, or `height` anywhere else.

Do not style `html` or `body > div` in `src/app.css`. Do not set `min-block-size` anywhere in `src/app.css`. In `body`, use only `margin: 0`, background, color, font-family, and `overflow-x: clip`.

```css
[data-layout-area='primary'],
[data-layout-area='secondary'],
[data-layout='panel-stack'],
[data-layout='table-frame'],
[data-layout='metric-grid'],
[data-layout='content-grid'],
[data-layout='list-stack'],
[data-layout='section-heading'],
[data-layout='row-cluster'],
[data-layout='brand-cluster'],
[data-layout='toolbar-cluster'] {
	min-inline-size: 0;
	max-inline-size: 100%;
	overflow-wrap: anywhere;
}
```

Do not use element selectors such as `button`, `svg`, `h1`, `p`, `a`, `section`, `article`, or `div` in `src/app.css`. Style via `[data-layout]`, `[data-layout-area]`, `[data-tone]`, and semantic data attributes only.

Add defensive visual constraints in `src/app.css`:

- `body { overflow-x: clip; }`
- Use readable high-contrast pairs: light panels with `#0f172a` text and muted text no lighter than `#475569`.
- Add `min-inline-size: 0`, `max-inline-size: 100%`, and `overflow-wrap: anywhere` to panel-like wrappers and long text surfaces.
- Use restrained spacing on mobile: page padding around 12px to 16px, panel padding around 12px to 16px, and no oversized headings.
- Keep mobile full-page height under roughly 2800px by using fewer rows/cards instead of hiding content.
- Never put dark or muted text on a dark surface. In this experiment, keep navigation light: white or near-white background, dark text, subtle border.
- Prefer subtle borders and flat panels over large shadows; the test judges layout and readability, not marketing polish.
- For `[data-layout='preview-stack']`, use a compact visual frame with `overflow: clip`, `aspect-ratio: 4 / 3`, and modest padding. Do not create tall portrait image wells on mobile. Populate it with Text, Badge, and Separator, not Image.

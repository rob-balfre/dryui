# Prototype Workbench Recipe

Use this for design-to-code prototypes, fixed-aspect design canvases, browser-window mockups, annotation passes, callouts, sticky notes, lasso overlays, and visual exploration pages.

Do not start these from the default full-page app shell. A workbench is a framed preview surface, not the product page itself.

## Failure To Avoid

The broken pattern is:

- `min-block-size: 100dvh` on the page shell.
- A stage row sized as `1fr`.
- A browser or design canvas with `aspect-ratio`.
- Extra notes or annotations inside the same grid.

That makes the grid resolve viewport height first, then lets the fixed-aspect child demand more block size from its inline track. Rows stretch, the page gets too tall, and the mockup no longer fits the first viewport.

The safe pattern is:

- No `min-block-size: 100dvh` on prototype workbenches.
- Workbench rows are `auto`, not viewport-filling `1fr`.
- The stage width is constrained by a grid track, not `width` or `inline-size`.
- `aspect-ratio` lives on the framed mockup in visual CSS.
- Annotation layers share the same grid area as the preview and render after it.
- Escape hatches are local and rare. Do not add blanket lint allows.

## When To Use This Instead Of Page Shell

Use the normal page shell when the target is the actual app screen.

Use this recipe when the target is a canvas for inspecting a screen: browser mockups, viewport comparison pages, prototype boards, visual experiments, design review pages, and annotated screenshots.

## Route Markup

```svelte
<script lang="ts">
	import { Badge, Button, Heading, Text } from '@dryui/ui';
</script>

<main data-layout="prototype-workbench" aria-labelledby="workbench-title">
	<div data-layout-area="page">
		<header data-layout="workbench-toolbar" data-layout-area="toolbar">
			<div data-layout-area="title">
				<Heading id="workbench-title" level={1}>Checkout prototype</Heading>
				<Text color="muted">Desktop browser mockup with review notes</Text>
			</div>

			<div data-layout="toolbar-actions" data-layout-area="actions">
				<Button type="button" variant="ghost">Mobile</Button>
				<Button type="button" variant="ghost">Tablet</Button>
				<Button type="button" variant="solid">Desktop</Button>
			</div>
		</header>

		<section data-layout="workbench-stage" data-layout-area="stage" aria-label="Prototype canvas">
			<figure data-layout="browser-mockup" data-canvas="desktop">
				<header data-layout="browser-chrome" data-layout-area="chrome" aria-label="Browser window">
					<div data-layout-area="controls" aria-hidden="true">
						<Badge color="gray">Preview</Badge>
					</div>
					<div data-layout-area="location">
						<Text color="muted">localhost:5173/checkout</Text>
					</div>
					<div data-layout-area="viewport-size">
						<Badge color="blue">1440 x 900</Badge>
					</div>
				</header>

				<div data-layout="mockup-viewport" data-layout-area="viewport">
					<section
						data-layout="mockup-screen"
						data-layout-area="surface"
						aria-label="Rendered screen"
					>
						<header data-layout-area="mockup-nav">
							<Text weight="semibold">Northstar Supply</Text>
						</header>

						<section data-layout-area="mockup-hero">
							<Heading level={2}>Checkout</Heading>
							<Text color="muted">Confirm shipping, payment, and delivery details.</Text>
						</section>

						<div data-layout="mockup-card-grid" data-layout-area="mockup-cards">
							<article data-layout-area="card-a">
								<Text weight="semibold">Shipping</Text>
								<Text color="muted">Address and delivery slot</Text>
							</article>
							<article data-layout-area="card-b">
								<Text weight="semibold">Payment</Text>
								<Text color="muted">Card and invoice details</Text>
							</article>
						</div>
					</section>

					<div
						data-layout="annotation-grid"
						data-layout-area="annotations"
						aria-label="Review notes"
					>
						<div data-layout-area="lasso-primary" data-lasso aria-hidden="true"></div>

						<article data-layout-area="note-primary" data-note>
							<Text weight="semibold">Compress header</Text>
							<Text color="muted">The first viewport should show the form start.</Text>
						</article>

						<article data-layout-area="callout-primary" data-callout>
							<Text weight="semibold">Primary action</Text>
							<Text color="muted">Keep the button visible at desktop size.</Text>
						</article>
					</div>
				</div>
			</figure>
		</section>

		<aside data-layout="workbench-notes" data-layout-area="notes" aria-label="Validation notes">
			<Heading level={2}>Checks</Heading>
			<Text color="muted"
				>No viewport-height shell. Canvas ratio stays stable at mobile, tablet, and desktop.</Text
			>
		</aside>
	</div>
</main>
```

## `src/layout.css`

Keep this file structural. Grid tracks, areas, container queries, spacing, block sizing, and alignment go here. Paint does not.

```css
[data-layout='prototype-workbench'] {
	container: page / inline-size;
	padding: var(--dry-space-3);
}

[data-layout='prototype-workbench'] > [data-layout-area='page'] {
	display: grid;
	grid-template-areas:
		'toolbar'
		'stage'
		'notes';
	grid-template-columns: minmax(0, 1fr);
	grid-template-rows: auto auto auto;
	gap: var(--dry-space-3);
}

[data-layout='prototype-workbench'] > [data-layout-area='page'] > [data-layout-area='toolbar'] {
	grid-area: toolbar;
}

[data-layout='prototype-workbench'] > [data-layout-area='page'] > [data-layout-area='stage'] {
	grid-area: stage;
}

[data-layout='prototype-workbench'] > [data-layout-area='page'] > [data-layout-area='notes'] {
	grid-area: notes;
}

[data-layout='workbench-toolbar'] {
	display: grid;
	grid-template-columns: minmax(0, 1fr);
	gap: var(--dry-space-3);
	align-items: start;
}

[data-layout='toolbar-actions'] {
	display: flex;
	flex-wrap: wrap;
	gap: var(--dry-space-2);
	justify-content: start;
}

[data-layout='workbench-stage'] {
	display: grid;
	grid-template-columns: minmax(0, 72rem);
	justify-content: center;
	align-items: start;
}

[data-layout='browser-mockup'] {
	display: grid;
	grid-template-areas:
		'chrome'
		'viewport';
	grid-template-columns: minmax(0, 1fr);
	grid-template-rows: auto minmax(0, 1fr);
}

[data-layout='browser-mockup'] > [data-layout-area='chrome'] {
	grid-area: chrome;
}

[data-layout='browser-mockup'] > [data-layout-area='viewport'] {
	grid-area: viewport;
}

[data-layout='browser-chrome'] {
	display: grid;
	grid-template-columns: auto minmax(0, 1fr) auto;
	gap: var(--dry-space-2);
	align-items: center;
}

[data-layout='mockup-viewport'] {
	display: grid;
	grid-template-areas: 'surface';
	grid-template-columns: minmax(0, 1fr);
	grid-template-rows: minmax(0, 1fr);
}

[data-layout='mockup-viewport'] > [data-layout-area='surface'],
[data-layout='mockup-viewport'] > [data-layout-area='annotations'] {
	grid-area: surface;
}

[data-layout='mockup-viewport'] > [data-layout-area='annotations'] {
	align-self: stretch;
	justify-self: stretch;
}

[data-layout='mockup-screen'] {
	display: grid;
	grid-template-areas:
		'mockup-nav'
		'mockup-hero'
		'mockup-cards';
	grid-template-columns: minmax(0, 1fr);
	grid-template-rows: auto minmax(0, 1fr) auto;
	gap: var(--dry-space-4);
}

[data-layout='mockup-screen'] > [data-layout-area='mockup-nav'] {
	grid-area: mockup-nav;
}

[data-layout='mockup-screen'] > [data-layout-area='mockup-hero'] {
	grid-area: mockup-hero;
}

[data-layout='mockup-screen'] > [data-layout-area='mockup-cards'] {
	grid-area: mockup-cards;
}

[data-layout='mockup-card-grid'] {
	display: grid;
	grid-template-columns: minmax(0, 1fr);
	gap: var(--dry-space-3);
}

[data-layout='annotation-grid'] {
	display: grid;
	grid-template-columns: repeat(16, minmax(0, 1fr));
	grid-template-rows: repeat(10, minmax(0, 1fr));
	gap: var(--dry-space-2);
}

[data-layout='annotation-grid'] > [data-layout-area='lasso-primary'] {
	grid-column: 2 / 11;
	grid-row: 3 / 8;
}

[data-layout='annotation-grid'] > [data-layout-area='note-primary'] {
	grid-column: 11 / 16;
	grid-row: 2 / 5;
}

[data-layout='annotation-grid'] > [data-layout-area='callout-primary'] {
	grid-column: 9 / 15;
	grid-row: 7 / 10;
}

[data-layout='annotation-grid'] > [data-layout-area='freeform-overlay'] {
	grid-column: 1 / -1;
	grid-row: 1 / -1;
}

[data-layout='workbench-notes'] {
	display: grid;
	grid-template-columns: minmax(0, 1fr);
	gap: var(--dry-space-2);
	align-content: start;
}

@container page (min-width: 48rem) {
	[data-layout='workbench-toolbar'] {
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
	}

	[data-layout='toolbar-actions'] {
		justify-content: end;
	}

	[data-layout='mockup-card-grid'] {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}

@container page (min-width: 72rem) {
	[data-layout='prototype-workbench'] > [data-layout-area='page'] {
		grid-template-areas:
			'toolbar toolbar'
			'stage notes';
		grid-template-columns: minmax(0, 1fr) minmax(16rem, 0.28fr);
		align-items: start;
	}
}
```

## `src/app.css`

Keep this file visual. Use tokens, data attributes, and no generic tag selectors. The aspect ratio is part of the painted mockup frame, not the page grid.

```css
body {
	margin: 0;
	font-family: var(--dry-font-sans);
	background: var(--dry-color-bg-base);
	color: var(--dry-color-text-strong);
	overflow-x: clip;
}

[data-layout='prototype-workbench'] {
	background: var(--dry-color-bg-base);
	color: var(--dry-color-text-strong);
}

[data-layout='workbench-toolbar'],
[data-layout='workbench-notes'] {
	padding: var(--dry-space-3);
	background: var(--dry-color-bg-raised);
	border: 1px solid var(--dry-color-border);
	border-radius: var(--dry-radius-md);
}

[data-layout='browser-mockup'] {
	aspect-ratio: 16 / 10;
	margin: 0;
	overflow: hidden;
	background: var(--dry-color-bg-raised);
	border: 1px solid var(--dry-color-border);
	border-radius: var(--dry-radius-lg);
	box-shadow: var(--dry-shadow-overlay);
}

[data-layout='browser-mockup'][data-canvas='mobile'] {
	aspect-ratio: 9 / 19.5;
}

[data-layout='browser-mockup'][data-canvas='square'] {
	aspect-ratio: 1;
}

[data-layout='browser-chrome'] {
	padding: var(--dry-space-2);
	background: var(--dry-color-bg-overlay);
	border-block-end: 1px solid var(--dry-color-border);
}

[data-layout='mockup-viewport'] {
	overflow: hidden;
	background: var(--dry-color-bg-base);
}

[data-layout='mockup-screen'] {
	padding: var(--dry-space-5);
	background: var(--dry-color-bg-base);
}

[data-layout='mockup-screen'] > [data-layout-area='mockup-nav'],
[data-layout='mockup-screen'] > [data-layout-area='mockup-hero'],
[data-layout='mockup-card-grid'] > [data-layout-area] {
	padding: var(--dry-space-4);
	background: var(--dry-color-bg-raised);
	border: 1px solid var(--dry-color-border);
	border-radius: var(--dry-radius-md);
}

[data-layout='annotation-grid'] {
	padding: var(--dry-space-4);
}

[data-note],
[data-callout] {
	padding: var(--dry-space-3);
	background: var(--dry-color-bg-floating);
	border: 1px solid var(--dry-color-stroke-warning);
	border-radius: var(--dry-radius-md);
	box-shadow: var(--dry-shadow-raised);
}

[data-callout] {
	border-color: var(--dry-color-stroke-brand);
}

[data-lasso] {
	border: 2px dashed var(--dry-color-stroke-brand-strong);
	border-radius: var(--dry-radius-lg);
	background: var(--dry-color-fill-brand-weak);
}
```

## Freeform Annotation Layer

Prefer the grid annotation layer above for sticky notes, callouts, and rectangular lasso regions. Do not inline raw `<svg>`, `<title>`, `<path>`, or `<text>` in route Svelte files; `dryui/no-raw-element` will flag them, and fake `data-layout` hooks on SVG children do not create real layout.

For route authors, keep annotations as DryUI/lint-compatible grid items:

```svelte
<div data-layout="annotation-grid" data-layout-area="annotations" aria-label="Review notes">
	<div data-layout-area="lasso-primary" data-lasso aria-hidden="true"></div>

	<article data-layout-area="note-primary" data-note>
		<Text weight="semibold">Tighten this group</Text>
		<Text color="muted">Move the form start into the first viewport.</Text>
	</article>

	<article data-layout-area="callout-primary" data-callout>
		<Text weight="semibold">Primary action</Text>
		<Text color="muted">Keep the button visible at desktop size.</Text>
	</article>
</div>
```

If a review genuinely needs bezier lasso paths tied to canvas coordinates, ask the foundation/package worker for a dedicated `FreeformAnnotations` component from a first-party component package or lint-owner directory. The route should only place that component inside a normal annotation grid item; it should not own the raw SVG internals.

```svelte
<div data-layout="annotation-grid" data-layout-area="annotations" aria-label="Review notes">
	<div data-layout-area="freeform-overlay" aria-hidden="true">
		<FreeformAnnotations variant="checkout-review" />
	</div>

	<article data-layout-area="note-primary" data-note>
		<Text weight="semibold">Tighten this group</Text>
		<Text color="muted">The SVG path lives inside the package component, not this route.</Text>
	</article>
</div>
```

Use the package-component pattern only for a single overlay that must track the canvas coordinate system. Do not use SVG to recreate the whole app UI.

## Narrow Escape Hatches

Default to no allow comments.

Allowed only when the comment is directly above the single declaration it justifies:

- `/* dryui-allow width */`: only for a measured component-internal control that cannot be represented by grid tracks or text measure units. Not for the workbench, stage, mockup, cards, or responsive sizing.
- `/* dryui-allow flex */`: only for isolated component internals that need one-dimensional intrinsic layout. Page, stage, chrome, notes, and annotation layouts belong in `src/layout.css`.
- `<!-- dryui-allow svelte-element -->`: only for finite semantic text tags such as `h1` through `h6`. Not for mockup wrappers.

Do not silence fixed-aspect canvas problems. Fix the shell and grid tracks.

## Visual Validation

Check screenshots at about `390px`, `820px`, and `1440px`.

Confirm:

- The workbench starts near the top; it does not vertically center or force a full-page hero.
- The browser mockup keeps its aspect ratio without horizontal overflow.
- The first viewport shows the toolbar and useful preview content.
- Desktop shows the notes beside the stage; mobile stacks them below.
- Annotation notes and lasso regions overlay the screen because they share the `surface` grid area and appear later in DOM order.
- Long labels wrap inside the mockup and notes.
- No `width`, `inline-size`, `height`, `position`, or blanket `dryui-allow` comments were added to make the picture fit.

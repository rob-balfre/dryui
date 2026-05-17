# Layout Boundaries For Agents

Use this when moving CSS between route files, `src/layout.css`, `src/app.css`, and reusable components. The goal is to keep page layout centralized without deleting the intrinsic layout that makes widgets render correctly.

## Fast Rule

- `src/layout.css`: page, section, and route composition. Put `display`, grid tracks, grid areas, container queries, parent/child gaps, and placement here.
- `src/app.css`: app-owned visual paint. Put colors, borders, radius, shadows, typography, overflow, and token overrides here.
- Component `<style>`: component-owned internals. Keep the display, gap, padding, alignment, and part layout a reusable widget needs to look correct wherever it is placed.

If a rule decides where something sits relative to page siblings, it belongs in `src/layout.css`. If it decides how that surface looks, it belongs in `src/app.css`. If it is part of the component's own anatomy, it stays inside the component.

## Boundary Checks

- A route shell, dashboard section, metric grid, sidebar/content split, toolbar row, or responsive page shift is layout.css work.
- A panel background, border, text tone, focus ring, shadow, radius, or theme token override is app.css work.
- A Window title bar, Card body spacing, TopNav brand/actions row, Chip icon/text/remove alignment, or custom primitive root display is component-internal work.
- Do not move component part selectors such as `[data-window-part]`, `[data-card-part]`, `[data-topnav-part]`, or `[data-chip-part]` into `src/layout.css`.
- Do not replace a primitive root with `display: contents` just to satisfy a page grid. Wrap it in a page layout hook instead.

## What Component Styles May Own

Component `<style>` may include:

- Root display needed by the widget surface, such as a Card stacking header/body/footer.
- Internal one-dimensional layout, such as a Chip aligning icon, label, and remove button.
- Internal padding and gap that define the widget contract.
- Part selectors, state selectors, and semantic `data-*` selectors owned by that component.
- Minimal component-local paint only when the packaged primitive contract owns it. App-specific surface paint still belongs in `src/app.css`.

Component `<style>` must not include:

- Route grids, page columns, section placement, or responsive shell templates.
- Parent layout assumptions such as "this card is the right rail" or "this nav spans the dashboard".
- Page-level width constraints, viewport sizing, or breakpoints.
- Generic tag styling that leaks outside the component.

## Lint Strategy

- Fix the boundary instead of disabling lint.
- Do not add `svelte-ignore`, broad lint disables, `:global()`, `!important`, `style=`, or `style:` directives.
- If lint rejects page layout in a component, move that rule to `src/layout.css`.
- If lint rejects visual paint in `src/layout.css`, move that rule to `src/app.css`.
- If lint flags component-internal `display: flex`, keep it local and use the narrow escape hatch only where supported:

```css
[data-chip] {
	/* dryui-allow flex */
	display: inline-flex;
	align-items: center;
	gap: var(--dry-space-1);
	padding: var(--dry-space-1) var(--dry-space-2);
}
```

Use an escape hatch for measured component internals only. Never use it to keep route shells, wrappers, cards, forms, navigation shells, or page sections in component CSS.

## Bad: Route Layout In A Component

```svelte
<!-- DashboardPanel.svelte -->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children?: Snippet } = $props();
</script>

<section data-dashboard-panel data-tone="panel">
	{#if children}
		{@render children()}
	{/if}
</section>

<style>
	[data-dashboard-panel] {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: var(--dry-space-4);
		padding: var(--dry-space-4);
		background: var(--dry-color-bg-raised);
		border-radius: var(--dry-radius-card);
		box-shadow: var(--dry-shadow-sm);
	}
</style>
```

This mixes page composition with paint and makes the component assume its parent layout.

## Good: Route Layout In layout.css, Paint In app.css

```svelte
<!-- +page.svelte -->
<main data-layout="dashboard-shell">
	<section data-layout-area="primary" data-tone="panel">
		<DashboardPanel />
	</section>
	<aside data-layout-area="secondary" data-tone="panel">
		<ActivityFeed />
	</aside>
</main>
```

```css
/* src/layout.css */
[data-layout='dashboard-shell'] {
	container: page / inline-size;
	display: grid;
	grid-template-areas:
		'primary'
		'secondary';
	grid-template-columns: minmax(0, 1fr);
	gap: var(--dry-space-4);
	padding: var(--dry-space-4);
}

[data-layout='dashboard-shell'] > [data-layout-area='primary'] {
	grid-area: primary;
}

[data-layout='dashboard-shell'] > [data-layout-area='secondary'] {
	grid-area: secondary;
}

@container page (min-width: 48rem) {
	[data-layout='dashboard-shell'] {
		grid-template-areas: 'primary secondary';
		grid-template-columns: minmax(0, 1fr) minmax(16rem, 0.35fr);
	}
}
```

```css
/* src/app.css */
[data-tone='panel'] {
	background: var(--dry-color-bg-raised);
	border-radius: var(--dry-radius-card);
	box-shadow: var(--dry-shadow-sm);
	color: var(--dry-color-text-strong);
}
```

## Bad: Stripping A Primitive To "Comply"

```svelte
<!-- Window.svelte -->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, children }: { title?: Snippet; children?: Snippet } = $props();
</script>

<section data-window>
	<header data-window-part="titlebar">
		{#if title}
			{@render title()}
		{/if}
	</header>
	<div data-window-part="body">
		{#if children}
			{@render children()}
		{/if}
	</div>
</section>

<style>
	[data-window] {
		background: var(--dry-color-bg-raised);
		border-radius: var(--dry-radius-card);
	}
</style>
```

Removing display, padding, and gap from a reusable primitive makes every use site rebuild the same widget anatomy in `src/layout.css`. That is the failure pattern.

## Good: Primitive Keeps Intrinsic Layout

```svelte
<!-- Window.svelte -->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		actions,
		children
	}: {
		title?: Snippet;
		actions?: Snippet;
		children?: Snippet;
	} = $props();
</script>

<section data-layout="window-surface" data-tone="window">
	<header data-layout-area="titlebar" data-window-part="titlebar">
		{#if title}
			{@render title()}
		{/if}
		{#if actions}
			{@render actions()}
		{/if}
	</header>
	<div data-layout-area="body" data-window-part="body">
		{#if children}
			{@render children()}
		{/if}
	</div>
</section>

<style>
	[data-layout='window-surface'] {
		/* dryui-allow flex */
		display: flex;
		/* dryui-allow flex */
		flex-direction: column;
		gap: var(--dry-space-3);
		padding: var(--dry-space-4);
	}

	[data-layout='window-surface'] > [data-layout-area='titlebar'] {
		/* dryui-allow flex */
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--dry-space-2);
	}

	[data-layout='window-surface'] > [data-layout-area='body'] {
		min-block-size: 0;
		overflow: auto;
	}
</style>
```

The raw structural elements have meaningful layout hooks, so consumer Svelte lint does not flag `dryui/no-raw-element`. The `dryui-allow flex` comment is directly above each flex declaration it suppresses; one comment does not cover later flex properties.

```css
/* src/app.css */
[data-tone='window'] {
	background: var(--dry-color-bg-raised);
	border-radius: var(--dry-radius-card);
	box-shadow: var(--dry-shadow-sm);
	color: var(--dry-color-text-strong);
}
```

The page still controls where `<Window />` lands:

```svelte
<section data-layout-area="preview">
	<Window>
		{#snippet title()}Preview{/snippet}
		{#snippet actions()}
			<Chip>Live</Chip>
		{/snippet}
		<PreviewSurface />
	</Window>
</section>
```

```css
/* src/layout.css */
[data-layout='editor-shell'] {
	container: page / inline-size;
	display: grid;
	grid-template-areas:
		'topnav'
		'preview'
		'inspector';
	gap: var(--dry-space-4);
}

[data-layout='editor-shell'] > [data-layout-area='preview'] {
	grid-area: preview;
}
```

## Bad: Rebuilding Chip Layout In layout.css

```css
/* src/layout.css */
[data-layout='filter-row'] [data-chip] {
	display: inline-flex;
	gap: var(--dry-space-1);
	padding: var(--dry-space-1) var(--dry-space-2);
}
```

`src/layout.css` should not reach inside a primitive. It should only arrange the row that contains the chips.

## Good: Layout Arranges The Group, Chip Owns The Chip

```svelte
<div data-layout="filter-row">
	<Chip>Open</Chip>
	<Chip>Assigned</Chip>
	<Chip>Blocked</Chip>
</div>
```

```css
/* src/layout.css */
[data-layout='filter-row'] {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: var(--dry-space-2);
}
```

The Chip component keeps its own icon, text, active state, padding, and remove-button alignment internally.

## Review Checklist

- Every `data-layout` used by page markup has a matching selector in `src/layout.css`.
- `src/layout.css` selectors target `[data-layout]` or `[data-layout-area]`, not component parts.
- `src/app.css` has no `display`, grid, flex, gap, container query, or placement rules.
- Reusable primitives still render correctly when dropped into an empty grid cell.
- No lint ignore comments were added.
- Any `dryui-allow` comment is local to a component-internal declaration and has no page-layout responsibility.

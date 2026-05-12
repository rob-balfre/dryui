---
name: dryui-build
description: Builds and edits Svelte 5 user interfaces with DryUI components, layout hooks, theme tokens, and accessibility rules. Use when creating or modifying app UI, pages, routes, forms, dashboards, component compositions, visual polish, or design-to-code work with @dryui/ui.
---

# DryUI Build

Build real Svelte 5 UI with DryUI. This skill is only for UI implementation and polish. It does not install DryUI, scaffold projects, run live feedback, or resolve feedback submissions.

## First Decision

Classify the task before editing:

- Full page or design image to page: use the **Page Shell** workflow below.
- Section of a page: keep the existing page shell and add only the section areas needed.
- Component or form: use the component, theme, Svelte, and validation rules without creating a page shell.

When the user provides a mockup or asks for a dashboard, admin page, settings page, CRM, kanban, knowledge base, inbox, calendar, finance, inventory, course, or other app page, treat it as full-page work unless they explicitly ask for a component.

## Lint First

DryUI lint rules are the contract. If lint, the compiler, or component metadata disagrees with a visual idea, restructure the markup or CSS instead of bypassing the rule.

- Use `@dryui/ui` primitives when DryUI provides one. Do not recreate controls with raw HTML.
- DryUI does not ship a layout component. Use plain markup with `data-layout` and `data-layout-area`.
- Page and section layout lives in `src/layout.css`, scoped under `[data-layout='<name>']`.
- All consumer `display: grid` and `display: flex` declarations live in `src/layout.css` or `@container` blocks inside it.
- In `src/layout.css`, use only lint-safe `display` values such as `grid` or `flex`; never add `display: block`, `contents`, `flow-root`, or reset-style display values.
- Route and component `<style>` blocks must not contain page-level layout. For full-page work, do not use route `<style>` blocks at all.
- Responsive layout is mobile-first and uses `@container page (...)`; never `@media` for layout breakpoints.
- `src/layout.css` is structural only: display, grid, flex, container, tokenized spacing, alignment, and block-size constraints. No color, background, border, shadow, opacity, transition, transform, font, text, position, z-index, width, height, or inline-size.
- Visual CSS belongs in `src/app.css` or component CSS and uses real `--dry-*` tokens such as `--dry-color-bg-base`, `--dry-color-text`, and `--dry-color-border`, or app-owned custom properties.
- Set `body { font-family: var(--dry-font-sans); }` in `src/app.css` so dialogs, popovers, and top-layer UI inherit the app font.

Do not add these to get past lint or compiler pressure:

- `:global()`
- `!important`
- `all: unset`
- `<svelte:element>`
- `<!-- svelte-ignore ... -->`
- inline `style=`
- `style:` directives
- raw native controls when a DryUI component exists
- width or inline-size hacks to force unrelated layout fit

## Workflow

1. Restate the target UI in one line: user, screen, primary task, density.
2. Inspect nearby app patterns and existing DryUI usage.
3. Check component metadata before guessing APIs: `packages/ui/src/<component>/<component>.meta.ts`, then `index.ts`, then source.
4. Classify full page, section, or component and choose the smallest layout surface.
5. Implement with `@dryui/ui`, Svelte 5 runes, `data-layout` hooks, `src/layout.css`, and DryUI tokens.
6. Run deterministic validation for the changed files.
7. For visual work, verify mobile, tablet, and desktop screenshots.

## Page Shell

Use this workflow for new full pages and design-image-to-code tasks.

1. Name the page type.
2. Choose a short route-specific shell name ending in `-shell`, for example `dashboard-shell`, `support-shell`, or `inventory-shell`.
3. Put `container: page / inline-size` on the shell itself.
4. Use one top-level `[data-layout-area='page']` grid inside the shell.
5. Use one each of `topbar`, `navigation`, `primary`, and optionally `secondary`.
6. Keep mobile first; add at least two `@container page (min-width: ...)` breakpoints for tablet and desktop.
7. Keep the mobile document under roughly `2800px` by reducing rows, cards, and duplicated panels.
8. Run build plus visual checks at mobile, tablet, and desktop before finishing.

Default shell:

```svelte
<main data-layout="dashboard-shell">
	<div data-layout-area="page">
		<header data-layout-area="topbar">...</header>
		<nav data-layout-area="navigation">...</nav>
		<section data-layout-area="primary">...</section>
		<aside data-layout-area="secondary">...</aside>
	</div>
</main>
```

Rules:

- Do not create duplicate shell areas.
- Do not put `data-layout-area` on nested primitive text wrappers.
- Do not create dark navigation by default. Use light navigation unless the reference clearly requires dark and you verify contrast.
- Keep the topbar title to one readable mobile line. Shorten labels rather than allowing awkward mid-word wraps.
- Navigation should have 4 to 6 items and appear immediately after the topbar on mobile.
- After topbar and navigation, use no more than five top-level panels. A metric grid counts as one panel.
- Prefer rows, compact metrics, and concise evidence panels over fake charts, oversized previews, SVG decoration, canvas, or tall media wells.
- For tabular references, prefer `data-layout="list-stack"` rows unless you have verified the DryUI `Table` runtime path in this app.
- For preview-heavy references, build compact text-and-badge previews inside `data-layout="preview-stack"`. Do not let image or document previews dominate mobile height.

## Page Layout CSS

For a new full page, add this structure to `src/layout.css`, replacing `dashboard-shell` consistently with the chosen shell name. Keep layout selectors direct and specific.

```css
[data-layout='dashboard-shell'] {
	container: page / inline-size;
	min-block-size: 100dvh;
}

[data-layout='dashboard-shell'] > [data-layout-area='page'] {
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

[data-layout='dashboard-shell'] > [data-layout-area='page'] > [data-layout-area='topbar'] {
	grid-area: topbar;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: var(--dry-space-3);
}

[data-layout='dashboard-shell'] > [data-layout-area='page'] > [data-layout-area='navigation'] {
	grid-area: navigation;
	display: grid;
	grid-template-columns: minmax(0, 1fr);
	align-content: start;
	gap: var(--dry-space-2);
}

[data-layout='dashboard-shell'] > [data-layout-area='page'] > [data-layout-area='primary'],
[data-layout='dashboard-shell'] > [data-layout-area='page'] > [data-layout-area='secondary'] {
	display: grid;
	grid-template-columns: minmax(0, 1fr);
	align-content: start;
	gap: var(--dry-space-3);
}

[data-layout='dashboard-shell'] > [data-layout-area='page'] > [data-layout-area='primary'] {
	grid-area: primary;
}

[data-layout='dashboard-shell'] > [data-layout-area='page'] > [data-layout-area='secondary'] {
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
[data-layout='preview-stack'],
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
	[data-layout='dashboard-shell'] > [data-layout-area='page'] {
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
	[data-layout='dashboard-shell'] > [data-layout-area='page'] {
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

When editing an existing full page, preserve its established shell name and area names if they already satisfy this contract.

## Visual CSS

For full-page work, `src/app.css` is visual paint. It may set colors, borders, radius, padding, margin, typography, shadows, custom properties, and overflow. It must not contain `display`, `grid`, `flex`, `container`, `@container`, or `@media`.

It also must not contain these layout-ish properties outside the defensive group below:

- `justify-content`, `align-items`, `align-content`, `place-content`, `place-items`, `order`
- `gap`, `row-gap`, `column-gap`
- `position`, `inset`, `top`, `right`, `bottom`, `left`, `float`
- `width`, `height`, `inline-size`, `block-size`, `flex-shrink`, `flex-grow`, `flex-basis`

Add this defensive group once for full-page work. Do not write `min-inline-size`, `max-inline-size`, `inline-size`, `block-size`, `width`, or `height` elsewhere unless you are constraining replaced media and verify it does not become layout.

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

Additional visual rules:

- `body` may use only `margin: 0`, background, color, font-family, and `overflow-x: clip`.
- Do not style `html`, `body > div`, or generic elements such as `button`, `svg`, `h1`, `p`, `a`, `section`, `article`, `div`, `ul`, or `li` in `src/app.css`.
- Style via `[data-layout]`, `[data-layout-area]`, `[data-tone]`, and semantic data attributes.
- Use readable high-contrast pairs. For light panels, use dark text near `#0f172a`; muted text should not be lighter than roughly `#475569`.
- Do not put dark or muted text on dark surfaces. If dark surfaces are required, set explicit light foregrounds and verify them in browser screenshots.
- Use restrained spacing on mobile: page padding around `12px` to `16px`, panel padding around `12px` to `16px`, and no oversized headings.
- Prefer subtle borders and flat panels over large shadows.
- For `[data-layout='preview-stack']`, use a compact frame with `overflow: clip`, `aspect-ratio: 4 / 3`, modest padding, and text content. Avoid tall portrait wells on mobile.

## Markup

- Every interior raw structural element needs `data-layout="<specific-name>"` or `data-layout-area="<area>"`.
- Use `data-layout-area` only for children that participate in named grid areas.
- Do not use generic layout names: `ui`, `wrapper`, `box`, `container`, `div`, `block`, `el`, `elem`, `element`, `layout`, `inner`, `outer`.
- Do not pass `class=` to DryUI components. Use wrappers, component props, `data-*` attributes, or custom properties.
- Prefer `Button`, `Input`, `Select`, `DatePicker`, `Dialog`, `AlertDialog`, `Separator`, `DataGrid`, and verified `Table` usage over native route-level controls.
- Wrap each form control in `Field.Root` with `Label`.
- Use `AlertDialog` for destructive confirmation.
- Add `aria-label` to icon-only buttons and `type="submit"` to primary form submit buttons.
- Keep repeated page content compact: up to 3 to 4 metrics, 3 to 5 list rows, 3 board columns, and 1 to 2 secondary panels unless the user explicitly asks for dense data.

## Components

Assume a DryUI component is compound until metadata or nearby usage proves otherwise. Compound components use `.Root`; parts stay inside the matching root.

Common compound families include Accordion, AlertDialog, Breadcrumb, Collapsible, ColorPicker, Combobox, CommandPalette, ContextMenu, DataGrid, DatePicker, Dialog, Drawer, DropdownMenu, EmptyState, Field, FileUpload, FloatButton, Pagination, Popover, RadioGroup, RichTextEditor, Select, Splitter, Stepper, Table, Tabs, TagsInput, Toast, ToggleGroup, Toolbar, Tooltip, Tour, and Transfer.

## Theme

- Import DryUI theme CSS before rendering components and choose one document theme mode: light imports `default.css` and leaves `<html>` bare; system imports both themes and sets `class="theme-auto"`; explicit imports both and sets `data-theme="light"` or `data-theme="dark"`.
- `color-scheme` is not a theme switch. Do not set `color-scheme: light dark` or use `light-dark()` as the only dark-mode implementation; DryUI dark tokens come from `data-theme` or `.theme-auto`.
- App-owned custom properties must resolve to readable foreground/background pairs in every enabled mode. If using `light-dark()`, verify both resolutions and keep it out of image-overlay contrast decisions.
- For art-directed light surfaces with fixed custom ink/cream colors, keep nav, chips, cards, and panels on app-owned light backgrounds too. Do not place fixed dark text or icons on adaptive DryUI background tokens such as `--dry-color-bg-base`, `--dry-color-bg-raised`, or `--dry-color-bg-overlay`, because `.theme-auto` on a dark OS can turn those surfaces dark while custom text stays dark.
- Text over photos, video, canvas, charts, or gradients needs an actual contrast layer above the media and below the content, or a fixed text color chosen for that surface.
- Auto/system pages must be checked in light and dark. If both cannot be verified, keep the app light-only and leave `<html>` bare.
- Override semantic tokens such as brand, danger, success, text, stroke, focus, spacing, and type aliases. Do not invent `--dry-*` names or nonexistent surface tokens such as `--dry-color-surface`, `--dry-color-panel`, or `--dry-color-background`.
- Do not resize the whole UI by changing `html` or `body` font-size; avoid raw hex, `rgb()`, and raw px spacing when a DryUI token exists. App-owned fixed colors are allowed only when paired and verified for contrast.

## Svelte

- Use Svelte 5 runes: `$state`, `$derived`, `$props`, `$bindable`, and `$effect`.
- Prefer `$derived` for computed values. Do not use `$effect` to maintain derived state.
- Use typed, destructured `$props`; use `$bindable` only for props that support two-way binding.
- Use snippets instead of slots.
- Use event props such as `onclick`, `oninput`, and `onsubmit`; do not mix legacy `on:` handlers into new code.
- Guard browser-only APIs from SSR. Do not read `window`, `document`, `localStorage`, or layout measurements at module evaluation time.
- Treat `$effect` as an escape hatch for browser lifecycle work, observers, listeners, maps, canvas, timers, and cleanup.

## Motion

Build the no-animation version first. Use CSS transitions, Svelte transitions, View Transitions, or scroll-driven animations only after layout and accessibility are correct.

- Respect `prefers-reduced-motion`.
- Prefer opacity and transform. Do not animate layout tracks, width, height, inline-size, or critical spacing.
- Do not use motion to hide missing loading, disabled, empty, or error states.
- Keep `view-transition-name` sparse and specific.

## Visual Checks

For full-page, dashboard, and design-to-code work, run browser checks after build:

- Mobile around `390px`.
- Tablet around `820px`.
- Desktop around `1440px`.

Check:

- The shell starts near the top and fills the viewport width without horizontal overflow.
- Mobile content is useful in the first viewport and the full page is not overlong.
- Tablet and desktop use the container-query layout, not a stretched mobile stack.
- Primary content is visually dominant on desktop.
- Navigation, active states, badges, and muted text remain readable.
- Screenshots are not blank, dark-on-dark, clipped, or overlapped.

If a visual check fails, fix source discipline first: shell, areas, `src/layout.css`, then app paint.

## Validation

- For `.svelte` route or app work, run the local Svelte check or package check that covers the changed files.
- For `packages/ui/` component work, run `bun run --filter '@dryui/ui' build`.
- For docs UI work, run the docs check/build wrapper used by the repo.
- For skill content changes, run `bun run validate:skills`.
- Report any validation you could not run and why.

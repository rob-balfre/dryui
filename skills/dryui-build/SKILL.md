---
name: dryui-build
description: Builds and edits Svelte 5 user interfaces with DryUI components, layout hooks, theme tokens, and accessibility rules. Use when creating or modifying app UI, pages, routes, forms, dashboards, component compositions, visual polish, or design-to-code work with @dryui/ui.
---

# DryUI Build

Build real Svelte 5 UI with DryUI. This skill is only for UI implementation and polish. It does not install DryUI, scaffold projects, run live feedback, or resolve feedback submissions.

## DryUI Contract Detection

If a project imports `@dryui/ui`, has `src/layout.css`, or enables `@dryui/lint`, this skill dominates UI decisions for that scope. Keep DryUI primitives, `data-layout` hooks, theme tokens, and lint boundaries in charge even if another framework pattern or generic Svelte habit seems faster.

## Lint Rules — Read First

These are the rules `@dryui/lint` enforces. They are the contract — if lint, the Svelte compiler, or component metadata disagrees with a visual idea, restructure the markup or CSS instead of bypassing the rule. Bulk-silencing lint produces unstyled, broken pages because the rules and `src/layout.css` are coupled.

### Banned in `.svelte` files

- No `:global()`. Use scoped styles, `data-*` attributes, CSS custom properties, or component props.
- No `!important`. Fix specificity at the source.
- No `all: unset`. Reset only the specific properties you need.
- No `<svelte:element this={x}>`. Use explicit `{#if}/{:else}` branches with concrete tags. The `<!-- dryui-allow svelte-element -->` escape hatch is for finite semantic tag sets only (`h1`-`h6`).
- No `<!-- svelte-ignore css_unused_selector -->` or other ignore comments. Fix the underlying issue.
- No inline `style=` attributes. Use scoped CSS with custom properties.
- No `style:` directives. Use component props, `--dry-*` custom properties, or the `<style>` block.
- No `{@attach ...}`. Use component props or CSS custom properties.
- No leaked transcript or tool artifacts such as `toolu_*`, `<tool_use>`, `<task-notification>`, `<subagent_notification>`, `TaskOutput`, or `TodoWrite`.
- No `<a>` without `href`. Use `<button>` for non-navigation actions.
- No `<hr>`. Use `<Separator />` so token overrides apply.
- No raw `<button>`, `<input>`, `<select>`, etc. when a DryUI primitive exists. Allowed only inside the matching `packages/ui/<component>/` directory.
- No `class=` on DryUI components. They do not forward `class` to the rendered element. Use `--dry-*` custom properties, `data-*` attributes, component props, or wrap in a `data-layout` element. (`<Button>` has a back-compat `className` alias; most components do not.)

### Banned CSS values

- No `width`, `inline-size`, or their `min-/max-` variants. Grid children are sized by the track — use `grid-template-columns`/`-rows`. Allowed only for typographic measure in `ch`/`em`/`ex` (e.g. `max-width: 55ch`). The `/* dryui-allow width */` escape hatch is for measured component-internal control geometry only — never for page constraints, cards, panels, columns, or responsive sizing.
- No `display: flex` at page or section level. Use grid in `src/layout.css`. For chip rows use `<ChipGroup.Root>`. The `/* dryui-allow flex */` escape hatch is for isolated component internals that need one-dimensional intrinsic layout — never for wrappers, cards, forms, navigation shells, or page sections.
- No raw `display: grid` in component or route `<style>` blocks. Move page-level grid declarations to `src/layout.css`, scoped under `[data-layout='<name>']`.
- No `@media (min-width: …)` for sizing — never `@media` for layout breakpoints. Use `@container page (...)`. `@media (prefers-reduced-motion)` and `@media (prefers-color-scheme)` are still allowed.
- No `outline: 2px solid var(--dry-color-focus-ring)`. Use `outline: var(--dry-focus-ring)` followed by `outline-offset: 2px` (outset) or `-1px` (inset).

### `data-layout` discipline

- DryUI does not ship a layout component. Use plain markup with `data-layout` and `data-layout-area`, then declare the matching grid in `src/layout.css`.
- Every interior raw structural element needs `data-layout="<specific-name>"` or `data-layout-area="<area>"`.
- Banned generic names: `ui`, `wrapper`, `box`, `container`, `div`, `block`, `el`, `elem`, `element`, `layout`, `inner`, `outer`. They produce unstyled output because no matching grid exists in `src/layout.css`.
- Every page or section `data-layout` name needs a matching grid declared in `src/layout.css`. If a wrapper has no real layout job, replace it with a DryUI component (`Heading`, `Text`, `Badge`, `Avatar`) or remove it.
- Reusable component internals may use specific `data-layout` and `data-layout-area` hooks styled by that component only when the hook describes intrinsic widget anatomy, such as a window titlebar/body or chip icon/label/remove row. Do not move those part selectors into `src/layout.css`.
- Use `data-layout-area` only for children that participate in named grid areas inside a `data-layout` parent.

### `src/layout.css` is structural-only

- Only `@container` wrappers allowed at-rule. No `@media`, no `@supports`, no `@import`.
- Selectors must target `[data-layout]` or `[data-layout-area]`. No tag, class, id, or descendant-combinator-only selectors.
- Allowed properties: `display`, `grid-*`, `flex` (component-internal only), `container`/`container-type`/`container-name`, `gap`/`row-gap`/`column-gap`, tokenized `margin-*`/`padding-*`, `align-*`, `justify-*`, `place-*`, and `block-size`/`min-block-size`/`max-block-size`.
- Allowed `display` values: `grid`, `inline-grid`, `flex`, `inline-flex`, `contents`. No `block`, `flow-root`, `inline`, or reset-style values.
- Banned: color, background, border, shadow, opacity, transition, transform, font, text, position, z-index, `width`/`height`/`inline-size`, raw `px` spacing, hex/rgb colors.

### `src/app.css` is visual paint

- **Required**: `body { font-family: var(--dry-font-sans); }` so popovers, dialogs, and native top-layer content inherit the app font.
- Allowed: color, border, radius, padding, margin, typography, shadows, custom properties, `overflow`.
- Banned: `display`, `grid-*`, `flex-*`, `container`, `@container`, `@media`, `gap`, `justify-*`, `align-*`, `place-*`, `order`, `position`, `inset`, `top`/`right`/`bottom`/`left`, `float`, `width`, `height`, `inline-size`, `block-size`, `flex-shrink`/`flex-grow`/`flex-basis`.
- Do not style generic tags: `html`, `body > div`, `button`, `svg`, `h1`-`h6`, `p`, `a`, `section`, `article`, `div`, `ul`, `li`. Style via `[data-layout]`, `[data-layout-area]`, `[data-tone]`, and other semantic data attributes.
- `body` itself may only use `margin: 0`, background, color, font-family, and `overflow-x: clip`.
- Named container query roots live on `[data-layout]` selectors in `src/layout.css`, for example `container: page / inline-size;` on the route shell. Do not put `container-type` or `container-name` on `body` in `src/app.css`.

### Components and accessibility

- This skill ships `data/component-manifest.json` and `data/lint-rules.json` for deterministic agent lookup without MCP or CLI tools.
- Use `node <skill-base-dir>/scripts/check-component.mjs --search dialog` to find components, `node <skill-base-dir>/scripts/check-component.mjs Button` to inspect imports/props/parts/a11y/CSS vars/quick start, and `node <skill-base-dir>/scripts/check-component.mjs Button variant=solid size=icon` to validate prop names and enum-like values.
- Use `node <skill-base-dir>/scripts/check-component.mjs --lint dryui/no-width` or `node <skill-base-dir>/scripts/check-component.mjs --lint-search label` to explain lint failures before guessing at fixes.
- Compound prop checks must target the part, for example `node <skill-base-dir>/scripts/check-component.mjs Select.Root open=true` or `node <skill-base-dir>/scripts/check-component.mjs Accordion.Item value=a`.
- Compound components use `.Root` — parts must live inside the matching root. Common: `Accordion`, `AlertDialog`, `Breadcrumb`, `Collapsible`, `ColorPicker`, `Combobox`, `CommandPalette`, `ContextMenu`, `DataGrid`, `DatePicker`, `Dialog`, `Drawer`, `DropdownMenu`, `EmptyState`, `Field`, `FileUpload`, `FloatButton`, `Pagination`, `Popover`, `RadioGroup`, `RichTextEditor`, `Select`, `Splitter`, `Stepper`, `Table`, `Tabs`, `TagsInput`, `Toast`, `ToggleGroup`, `Toolbar`, `Tooltip`, `Tour`, `Transfer`.
- Wrap every form control in `<Field.Root>` with `<Label>`.
- `<Avatar>` requires `alt` and `fallback` props.
- Icon-only `<Button>` requires `aria-label`.
- Primary form submit `<Button>` requires `type="submit"`.
- Use `<AlertDialog>` for destructive confirmation.

### Before inventing primitives

Search component metadata before creating app chrome, card, chip, badge, avatar, callout, or navigation lookalikes:

- App chrome/navigation: check `Sidebar`, `NavigationMenu`, `MegaMenu`, `Menubar`, `Breadcrumb`, `Toolbar`, `ButtonGroup`, `Tabs`, and `Link`.
- Cards/surfaces: search `card`; use existing display primitives when they fit, otherwise use semantic `data-layout` wrappers plus `src/app.css` paint rather than inventing a fake DryUI component.
- Chips/badges: check `Chip`, `ChipGroup.Root`, and `Badge`.
- Avatars/identity: check `Avatar` and `LogoMark`; `<Avatar>` needs `alt` and `fallback`.
- Callouts/feedback: check `Alert`, `Toast`, `Tooltip`, and `AlertDialog`; if it is only an annotation note, compose `Text`/`Badge` inside a `data-layout` surface.
- Forms/search: check `Field`, `Label`, `Input`, `Select`, `Combobox`, `CommandPalette`, `TagsInput`, and `Textarea`.

Use `check-component.mjs --search <term>` first, then inspect the exact component before using props or parts. If metadata does not contain the primitive you expected, document the fallback instead of guessing an API.

### When lint feels inconvenient

Do not disable lint. Recover in this order:

1. Run `check-component.mjs --lint <rule>` or read the failing rule message.
2. Move page/section layout to `src/layout.css`; move visual paint to `src/app.css`; keep only true primitive anatomy in component styles.
3. Replace raw native controls with DryUI primitives, or add specific `data-layout`/`data-layout-area` hooks only when the element has a real layout role.
4. For component-internal `display: flex`, `flex-*`, or measured `width`, use a `dryui-allow` comment only directly above the single declaration it suppresses.
5. Rerun validation. If it still fails, report the rule, file, desired UI, and the smallest shared change needed.

### Theme tokens

- Import `@dryui/ui/themes/default.css` (and `dark.css` if used) BEFORE local CSS. Local CSS imported first gets clobbered by theme defaults.
- Choose theme support deliberately:
  - Light-only: import `default.css` and leave `<html>` bare.
  - Explicit light/dark: import `default.css` and `dark.css`, then set `data-theme="light"` or `data-theme="dark"` on `<html>`.
  - System-aware auto: import `default.css` and `dark.css`, then set `class="theme-auto"` on `<html>`. Use `data-theme="light"` or `data-theme="dark"` only when the app needs to override auto.
- Full-theme files (`*.theme.css` or `/* @dryui-theme */` directive) must define every semantic token.
- For 1-10 site-wide tweaks, scope token overrides under `.page`/`body`, not `:root`. For 1-5 per-route tweaks, put them in a scoped component `<style>`. Do not scatter `--dry-*` overrides on `:root`.
- Do not invent `--dry-*` names. Non-existent: `--dry-color-surface`, `--dry-color-panel`, `--dry-color-background`. Real surface tokens: `--dry-color-bg-base`, `--dry-color-bg-raised`, `--dry-color-bg-overlay`.
- Do not resize the whole UI via `html`/`body` `font-size`. Do not use raw hex, `rgb()`, or raw `px` spacing when a DryUI token exists.
- `color-scheme: light dark` and `light-dark()` are not theme switches — DryUI dark tokens come from `data-theme="dark"` or `.theme-auto`.
- `contrast-color()` is Baseline 2026 newly available since April 2026, but progressive enhancement is still required. Keep static foreground/background fallback tokens first, then override with `contrast-color()` inside `@supports (color: contrast-color(red))`. It only returns `black` or `white`, so do not use it where the design needs a branded semantic foreground or where middle-tone backgrounds still need manual contrast verification.
- App-owned custom properties must resolve to readable foreground/background pairs in every enabled mode. Verify light, explicit dark, and `.theme-auto` if the app supports them; do not assume `light-dark()` or `contrast-color()` proves the pair is accessible.

## First Decision

Classify the task before editing:

- Full page or design image to page: use the **Page Shell** workflow below.
- Section of a page: keep the existing page shell and add only the section areas needed.
- Component or form: use the component, theme, Svelte, and validation rules without creating a page shell.
- Prototype/workbench: use the **Prototype Workbench** reference for browser mockups, fixed-aspect canvases, sticky notes, callouts, lasso overlays, and visual exploration pages.

When the user provides a mockup or asks for a dashboard, admin page, settings page, CRM, kanban, knowledge base, inbox, calendar, finance, inventory, course, or other app page, treat it as full-page work unless they explicitly ask for a component.

Workbench mode is first-class. If the deliverable is a review canvas rather than the product page itself, do not start from the `100dvh` page shell; load `references/prototype-workbench.md` before writing markup or CSS.

## Extra References

Load only the reference that matches the problem:

- `references/layout-boundaries.md`: when moving CSS between route files, `src/layout.css`, `src/app.css`, and custom reusable primitives. Use this before deleting `display`, `gap`, `padding`, or alignment from primitives such as Window, Card, TopNav, Chip, or app chrome.
- `references/prototype-workbench.md`: when implementing fixed-aspect canvases, browser-window mockups, annotation layers, sticky notes, callouts, lasso overlays, or visual exploration pages. Use this instead of the default `100dvh` page shell.
- `references/design-to-code-agent-team.md`: when coordinating subagents for design-to-code. The parent must accept foundation work before page workers start and must run a final visual QA pass.

## Workflow

1. Restate the target UI in one line: user, screen, primary task, density.
2. Inspect nearby app patterns and existing DryUI usage. If the project has `@dryui/ui`, `@dryui/lint`, or `src/layout.css`, keep this skill's rules in charge.
3. Check component metadata before guessing APIs or inventing primitives. In an installed skill, run `node <skill-base-dir>/scripts/check-component.mjs Button`, `node <skill-base-dir>/scripts/check-component.mjs --search navigation`, or `node <skill-base-dir>/scripts/check-component.mjs --lint dryui/no-width`; in this repo, also inspect `packages/ui/src/<component>/<component>.meta.ts`, then `index.ts`, then source.
4. Classify full page, section, component, prototype workbench, or multi-agent design-to-code task. Load the matching reference above when applicable.
5. For Svelte/SvelteKit uncertainty, use the Svelte MCP tools: `list-sections`, `get-documentation`, then `svelte-autofixer`.
6. Implement with `@dryui/ui`, Svelte 5 runes, `data-layout` hooks, `src/layout.css`, and DryUI tokens.
7. Run deterministic validation for the changed files.
8. For visual work, verify mobile, tablet, and desktop screenshots. Text presence or HTTP 200 is not enough.

## Building a page

For full pages and design-to-code work:

- Shell name: route-specific, ending in `-shell` (e.g. `dashboard-shell`, `support-shell`).
- Container query lives on the shell itself; one `[data-layout-area='page']` grid inside.
- Areas: one each of `topbar`, `navigation`, `primary`, optionally `secondary`. Mobile first; promote to multi-column at `48rem` (tablet) and `72rem` (desktop).
- After topbar and nav, use at most 5 top-level panels (a metric grid counts as one). Topbar title fits one mobile line; nav has 4-6 items. Light navigation by default — only go dark when the design verifies contrast.

### Shell markup

```svelte
<main data-layout="dashboard-shell">
	<div data-layout-area="page">
		<header data-layout-area="topbar">…</header>
		<nav data-layout-area="navigation">…</nav>
		<section data-layout-area="primary">…</section>
		<aside data-layout-area="secondary">…</aside>
	</div>
</main>
```

The shell wraps a single `page` grid; areas slot into named tracks. Reuse this skeleton for every full page; only the shell name changes.

### Shell grid (`src/layout.css`)

```css
[data-layout='dashboard-shell'] {
	container: page / inline-size;
	min-block-size: 100dvh;
}
[data-layout='dashboard-shell'] > [data-layout-area='page'] {
	display: grid;
	grid-template-areas: 'topbar' 'navigation' 'primary' 'secondary';
	grid-template-columns: minmax(0, 1fr);
	gap: var(--dry-space-3);
}
```

Container query on the shell, grid on `page`. Areas stack vertically on mobile — each child sits in its named row.

### Container breakpoint

```css
@container page (min-width: 48rem) {
	[data-layout='dashboard-shell'] > [data-layout-area='page'] {
		grid-template-areas:
			'topbar topbar topbar'
			'navigation primary secondary';
		grid-template-columns: 11rem minmax(0, 1fr) minmax(13rem, 0.4fr);
	}
}
```

Use `@container page (...)`, never `@media`. Add a second breakpoint at `72rem` to tighten desktop columns.

## Layout primitives

Reusable layout shapes keyed by a `data-layout` name. Declare once in `src/layout.css`, drop the markup anywhere.

### Cluster (horizontal row)

```css
[data-layout='toolbar-cluster'] {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: var(--dry-space-2);
	justify-content: flex-end;
}
```

Use for toolbars, brand+title rows, chip rows, action groups. Page-level `flex` is only allowed inside `src/layout.css`.

### Stack (vertical grid)

```css
[data-layout='panel-stack'] {
	display: grid;
	grid-template-columns: minmax(0, 1fr);
	gap: var(--dry-space-3);
}
```

Use for vertical lists of panels or list rows. `minmax(0, 1fr)` stops wide children from pushing the track open.

### Responsive metric grid

```css
[data-layout='metric-grid'] {
	display: grid;
	grid-template-columns: minmax(0, 1fr);
	gap: var(--dry-space-3);
}
@container page (min-width: 48rem) {
	[data-layout='metric-grid'] {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}
@container page (min-width: 72rem) {
	[data-layout='metric-grid'] {
		grid-template-columns: repeat(4, minmax(0, 1fr));
	}
}
```

For KPI tiles and repeating same-shape cards: 1-col mobile, 2-col tablet, 4-col desktop.

### Defensive text wrapping (`src/app.css`)

```css
[data-layout-area='primary'],
[data-layout='panel-stack'],
[data-layout='metric-grid'],
[data-layout='list-stack'] {
	overflow-wrap: anywhere;
}
```

Add when long labels, URLs, or table-like content can spill out of a grid track. Keep track sizing in `src/layout.css` with `minmax(0, 1fr)`; do not add width or inline-size rules to `src/app.css`.

## Components

Check `packages/ui/src/<component>/<component>.meta.ts` before guessing APIs. Assume compound (`.Root` + parts) until metadata proves otherwise.

### Form field

```svelte
<Field.Root>
	<Label>Email</Label>
	<Input type="email" name="email" required />
</Field.Root>
```

Wrap every input in `Field.Root` with `Label` — Field provides accessible association, error state, and spacing.

### Compound component

```svelte
<Select.Root bind:value={role}>
	<Select.Trigger>
		<Select.Value placeholder="Pick a role" />
	</Select.Trigger>
	<Select.Content>
		<Select.Item value="admin">Admin</Select.Item>
		<Select.Item value="member">Member</Select.Item>
	</Select.Content>
</Select.Root>
```

All parts live inside the matching `.Root`. Same shape for `Dialog`, `Popover`, `Tabs`, `Combobox`, `DropdownMenu`, etc.

### Visual override via custom properties

```svelte
<div data-layout="kpi-tile">
	<Badge>Live</Badge>
</div>

<style>
	[data-layout='kpi-tile'] {
		--dry-badge-bg: var(--dry-color-fill-success-weak);
		--dry-badge-color: var(--dry-color-text-success);
		padding: var(--dry-space-3);
		background: var(--dry-color-bg-raised);
		border-radius: var(--dry-radius-md);
	}
</style>
```

DryUI components do not accept `class=`. Override visuals by setting real `--dry-*` custom properties on a `data-layout` wrapper, or via component props. Do not invent extra token aliases.

## Svelte MCP

When the official Svelte MCP is available, prefer it over memory for Svelte and SvelteKit specifics:

- Setup names: local stdio command `npx -y @sveltejs/mcp`; remote URL `https://mcp.svelte.dev/mcp`; server name `svelte`.
- Docs flow: call `list-sections` first, then `get-documentation` for all relevant sections.
- Validation flow: run `svelte-autofixer` on changed `.svelte`, `.svelte.ts`, and `.svelte.js` files until it returns no actionable suggestions.
- Skip `playground-link` for project files; it is only for throwaway snippets the user asks to open in the Svelte Playground.

## Svelte 5

```svelte
<script lang="ts">
	type Props = { items: Item[]; onpick?: (item: Item) => void };
	let { items, onpick }: Props = $props();

	let query = $state('');
	let filtered = $derived(items.filter((i) => i.name.includes(query)));
</script>

<Input bind:value={query} placeholder="Search" />
{#each filtered as item}
	<Button variant="ghost" onclick={() => onpick?.(item)}>{item.name}</Button>
{/each}
```

Typed `$props`, `$state` for local UI state, `$derived` for computed values (never `$effect` to maintain state). Use `onclick`, not `on:click`. Snippets, not slots. Guard `window`/`document` access from SSR inside `$effect`.

## Motion

Build the no-animation version first. Use CSS transitions, Svelte transitions, View Transitions, or scroll-driven animations only after layout and accessibility are correct.

- Respect `prefers-reduced-motion`.
- Prefer opacity and transform. Do not animate layout tracks, width, height, inline-size, or critical spacing.
- Do not use motion to hide missing loading, disabled, empty, or error states.
- Keep `view-transition-name` sparse and specific.

## Visual Checks

For full-page, dashboard, prototype/workbench, and design-to-code work, run browser checks after build. Do not close visual work with SSR-only output, static markup inspection, HTTP 200, text presence, or build/check alone; those only prove the route exists, not that the interface renders correctly.

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

When Playwright is installed, run the bundled smoke helper as a coarse guardrail after screenshots:

```sh
node <skill-base-dir>/scripts/visual-smoke.mjs http://localhost:5174/dashboard --text "Dashboard" --viewport 390x844 --screenshot /tmp/dryui-mobile.png
node <skill-base-dir>/scripts/visual-smoke.mjs http://localhost:5174/dashboard --text "Dashboard" --viewport 820x900 --screenshot /tmp/dryui-tablet.png
node <skill-base-dir>/scripts/visual-smoke.mjs http://localhost:5174/dashboard --text "Dashboard" --viewport 1440x900 --screenshot /tmp/dryui-desktop.png
```

The helper catches non-200 routes, missing text, near-blank bodies, horizontal overflow, giant headers, zero-sized main/window regions, and obvious header/content overlap. It does not replace human screenshot review, and text-only checks are never sufficient for visual acceptance.

## Validation

- For `.svelte` route or app work, run the local Svelte check or package check that covers the changed files.
- For `packages/ui/` component work, run `bun run --filter '@dryui/ui' build`.
- For docs UI work, run the docs check/build wrapper used by the repo.
- For skill content changes, run `bun run validate:skills`.
- Report any validation you could not run and why.

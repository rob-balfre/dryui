---
name: dryui-build
description: Experimental DryUI page-layout skill that builds colored block page prototypes with mobile-first container queries. Use when testing page layout, responsive regions, dashboards, shells, or full-page structure before detailed UI styling.
---

# DryUI Page Layout Blocks

This experimental skill only proves page structure. Build labelled colored blocks that represent page regions. Do not build a polished UI, charts, product cards, photos, or final component styling unless the user explicitly asks after the layout passes.

## Output

Edit only:

- `src/routes/+page.svelte`
- `src/layout.css`

The page must communicate structure through block labels such as Header, Navigation, KPI Strip, Primary Workspace, Secondary Panel, Activity List, and Footer.

Do not import anything for this prototype. No `@dryui/ui`, no Lucide icons, no app icons, no chart/table widgets, and no component libraries. Use only native semantic HTML elements and CSS.

## Construction Order

1. Decide whether the request is a full page or a section.
2. If a design, screenshot, mockup, or reference image is supplied, decide the section spacing mode before markup: `contiguous` or `guttered`.
3. For a full page, create exactly one page shell: `<main data-layout="<name>-shell">`.
4. Put one direct child inside the shell: `<div data-layout-area="page">`.
5. Add semantic child regions with `data-layout-area`, not generic wrappers.
6. Put all grid/flex/container rules in `src/layout.css`.
7. Put only block color, borders, text color, and typography in the route `<style>` block.

## Section Spacing Decision

Before writing layout CSS, inspect the handed design:

- If adjacent page sections touch edge-to-edge, use `spacing=contiguous`.
- If the design shows visible gutters, page padding, or white space between regions, use `spacing=guttered`.
- If no design is supplied, default to `spacing=guttered` for readability.

For `spacing=contiguous`:

- Do not add visible white gaps between grid sections.
- Set the page grid `gap: 0`.
- Set page padding to `0` unless the reference shows an outer margin.
- Do not let the shell/body background show between colored regions.
- Use borders or internal block color contrast only when the reference shows seams or dividers.

For `spacing=guttered`:

- Use tokenized gaps such as `gap: var(--dry-space-4)`.
- Use tokenized page padding when the reference shows an outer margin.

Preserve the chosen spacing mode across mobile, tablet, and desktop unless the supplied design clearly changes spacing at a breakpoint.

## Required Container Pattern

Every full page must use this pattern in `src/layout.css`:

```css
[data-layout='<name>-shell'] {
	container: <name> / inline-size;
}

[data-layout='<name>-shell'] [data-layout-area='page'] {
	display: grid;
	grid-template-areas:
		'header'
		'navigation'
		'summary'
		'primary'
		'secondary'
		'list'
		'footer';
	gap: 0; /* contiguous designs */
	padding: 0; /* use tokenized padding only when the design shows outer gutters */
}

@container <name> (min-width: 48rem) {
	/* tablet changes */
}

@container <name> (min-width: 72rem) {
	/* desktop changes */
}
```

Use the actual page name instead of `<name>`. Rename areas when the task needs different regions, but keep the same mobile-first pattern.

If `spacing=guttered`, replace the example `gap` and `padding` with tokenized spacing that matches the reference design. If `spacing=contiguous`, keep `gap: 0` and avoid padding that creates unintended background strips.

## Mobile Rules

- The base layout is mobile.
- The base `grid-template-areas` must be one column only.
- Do not put a sidebar beside content in the base layout.
- Do not use `grid-template-columns` with multiple columns in the base page rule.
- Navigation is a stacked/top region on mobile. It may become a sidebar only inside the desktop `@container`.
- Use `minmax(0, 1fr)` in tablet/desktop grid tracks that hold content.

## Tablet Rules

Inside `@container <name> (min-width: 48rem)`:

- Use the extra width deliberately.
- Summary/KPI blocks may become two columns.
- Primary and secondary regions may sit side by side if both remain readable.
- Do not introduce a permanent sidebar yet unless the page is explicitly navigation-heavy.

## Desktop Rules

Inside `@container <name> (min-width: 72rem)`:

- Use named grid areas to create the desktop composition.
- A navigation/sidebar column is allowed here, not before.
- Keep the primary work region visually dominant.
- Avoid full-width KPI bands that push the primary work surface too low.

## Block Styling Rules

In the route `<style>` block:

- Use distinct fixed block colors so visual screenshots reveal the layout immediately.
- Keep labels readable on every block.
- Use simple native elements only: `section`, `header`, `nav`, `aside`, `footer`, `p`, `strong`.
- Do not use icons, SVGs, images, component imports, or decorative UI details.
- Do not use raw hex values that are too close in lightness for adjacent blocks.
- Do not rely on dark mode. This prototype may be light-only.

## Failure Gates

Before finishing, inspect your own files. Treat any item below as a failure to fix:

- `src/layout.css` has `container:` but no `@container`.
- `src/layout.css` has fewer than two `@container` blocks for a full page.
- The base page grid has more than one area name in any row.
- A sidebar/content two-column layout appears outside a desktop `@container`.
- `@media` is used for layout.
- The page has horizontal overflow at 390px.
- Any region label is clipped or unreadable at 390px, 820px, or 1440px.
- A contiguous reference design produces visible white/body-background gaps between sections.
- A guttered reference design loses its intended breathing room or outer margin.
- `src/routes/+page.svelte` contains an `import` statement.
- The prototype uses icons, images, charts, cards, forms, or final UI widgets instead of labelled layout blocks.

## Visual Check

For visual work, check screenshots at:

- 390px mobile
- 820px tablet
- 1440px desktop

Pass only if the screenshots show three visibly different, coherent layouts with no horizontal overflow or clipped labels.

---
name: dryui-build
description: 'Experimental DryUI design-to-page skill that starts with a conservative component palette, then wraps it in strict container-query layout. Use when testing reliable real-component page generation from mockup images.'
---

# DryUI Full Page: Component First

Build the supplied image as a real DryUI page. Reliability matters: prefer proven DryUI APIs and simple static composition over clever custom widgets.

## Experiment Harness Rule

Run `bun run build` before finishing. Do not run `bun run dev`, `bun run check`, or a long-running screenshot/browser server during the agent step; the experiment harness performs browser capture and visual scoring after you finish.

Only edit `src/routes/+page.svelte`, `src/layout.css`, and `src/app.css` if needed.

## Safe Component Examples

Use these shapes:

```svelte
<script lang="ts">
	import { Badge, Button, Input, Separator, Table, Tabs } from '@dryui/ui';
</script>
```

```svelte
<Button size="sm" variant="solid">Save</Button>
<Input size="sm" aria-label="Search" placeholder="Search" />
<Badge size="sm" variant="soft" color="green">Active</Badge>
<Separator />
```

```svelte
<Table.Root>
	<Table.Header>
		<Table.Row><Table.Head>Name</Table.Head></Table.Row>
	</Table.Header>
	<Table.Body>
		<Table.Row><Table.Cell>Account</Table.Cell></Table.Row>
	</Table.Body>
</Table.Root>
```

Do not pass `class` to DryUI components. Put layout and visual styling on wrappers with `data-layout`.

## Process

1. Classify the page type: dashboard, board, CRM, settings, or knowledge.
2. Build the page shell and direct shell areas.
3. Fill each shell area with a small set of real DryUI components and simple static blocks.
4. Use `src/layout.css` for all layout.
5. Run `bun run build`.
6. Check mobile, tablet, and desktop behavior and repair.

## Shell Areas

Use one shell:

```svelte
<main data-layout="<type>-shell">
	<div data-layout-area="page">
		<header data-layout-area="topbar">...</header>
		<nav data-layout-area="navigation">...</nav>
		<section data-layout-area="primary">...</section>
		<aside data-layout-area="secondary">...</aside>
	</div>
</main>
```

Allowed shell areas: `rail`, `topbar`, `navigation`, `summary`, `primary`, `secondary`, `utility`, `actions`.

Rules:

- `page`, `primary`, and `topbar` or `navigation` are mandatory.
- Do not duplicate shell areas.
- `data-layout-area` is direct shell only.
- Nested content uses specific `data-layout` names.
- Raw interior elements need `data-layout`.

## Layout CSS Rules

In `src/layout.css`:

- Exact shell container: `container: page / inline-size`.
- Exact breakpoints: `@container page (min-width: 48rem)` and `@container page (min-width: 72rem)`.
- Mobile first.
- Use `grid-template-areas`.
- Use direct child selectors for shell areas.
- Use `minmax(0, 1fr)`.
- Use DryUI spacing tokens.
- Use `gap: 0` when the reference panes are contiguous.
- Never use `@media`.

Route `<style>`:

- No `display`, `grid-*`, `flex-*`, `container`, `@container`, or `@media`.
- Only visual styling: colors, borders, radius, shadow, type, internal padding, stable min-block-size.

## Content Rules

- Match the reference layout and product category, but use concise invented content.
- Do not copy exact names, numbers, dates, or paragraphs from the image.
- Prefer dense app UI over big decorative cards.
- Use charts/boards/readers as static blocks if no DryUI component exists.
- Keep `primary` visually largest on desktop.

## Visual Repair Checklist

At 390px, 820px, and 1440px:

- no horizontal overflow;
- controls fit;
- text contrast is readable;
- shell uses width well;
- topbar/navigation placement matches the reference;
- secondary/utility panels do not dominate;
- mobile is useful without endless repeated filler.

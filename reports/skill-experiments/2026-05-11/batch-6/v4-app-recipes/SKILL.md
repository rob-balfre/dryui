---
name: dryui-build
description: Experimental DryUI layout-only skill with app-type layout recipes for extracting colored block page structure from mockups. Use when testing dashboards, boards, CRM workspaces, settings consoles, and knowledge/document readers.
---

# DryUI Layout Blocks: App Recipes

Build only a colored block layout prototype from the requested page or supplied design. Do not recreate detailed UI.

Only edit:

- `src/routes/+page.svelte`
- `src/layout.css`

Do not import anything. Do not use DryUI components, Lucide, icons, images, charts, tables, forms, buttons, inputs, avatars, cards, or realistic widgets.

## Choose A Recipe

Classify the page before coding and use the closest recipe.

### Dashboard

Regions: topbar, navigation, summary/KPI, primary chart/workspace, insights, activity, utilities.

Desktop: nav may become left rail; summary stays compact; primary and insight/activity form the main work area.

### Board / Kanban

Regions: topbar, tabs, toolbar, board, task detail, activity, mobile bottom nav.

Desktop: left rail if present; board is dominant; task detail is a right rail; activity is low-priority.

### CRM / Record Workspace

Regions: navigation, workspace header, KPI strip, main table/pipeline, account/detail panel, forecast, recent activity.

Desktop: navigation rail, main workspace, right account/detail column, forecast/activity below.

### Settings / Admin Console

Regions: topbar, section navigation, profile/main settings, security, billing, help, status, activity, action bar.

Desktop: if reference has a left rail, include it. Main settings form/profile area dominates; help/status/activity sit right; action bar is compact.

### Knowledge / Document Reader

Regions: topbar, collections/nav, document list, document reader, AI summary/assistant, storage/utility.

Desktop: collections left, document list middle-left, reader dominant, AI summary right. The reader must be tall and larger than list/AI panels.

## Required Shell

```svelte
<main data-layout="<name>-shell">
	<div data-layout-area="page">
		<!-- recipe regions -->
	</div>
</main>
```

Each direct child of `page` must be a semantic region with a meaningful `data-layout-area`.

## Required CSS Pattern

```css
[data-layout='<name>-shell'] {
	container: <name> / inline-size;
}

[data-layout='<name>-shell'] [data-layout-area='page'] {
	display: grid;
	grid-template-areas:
		'topbar'
		'primary'
		'secondary';
}

@container <name> (min-width: 48rem) {
}
@container <name> (min-width: 72rem) {
}
```

The `container:` name and `@container` name must match exactly.

## Breakpoints

- Mobile: one column only, ordered by actual mobile reference.
- Tablet `48rem`: use a two-pane or grouped layout only where the recipe/reference supports it.
- Desktop `72rem`: use the recipe’s desktop composition and preserve persistent rails.
- Use `minmax(0, 1fr)` in content tracks and make the recipe’s primary region dominant.

## Spacing

Determine `contiguous`, `guttered`, or `mixed` from the reference. Use zero gaps for attached panes and token gaps for visible gutters.

## Styling

Use fixed colored blocks and readable labels in route `<style>`. Keep labels short but specific to the recipe.

## Failure Gates

- Chosen recipe’s primary region is not dominant.
- Knowledge reader desktop lacks a tall reader pane.
- Settings/admin desktop lacks a left rail when the reference has one.
- Board desktop lacks a dominant board region.
- Missing matched `container:` and `@container` names.
- Any import, component, icon, image, chart, table, form, button, or input.
- Horizontal overflow or clipped labels at 390px, 820px, or 1440px.

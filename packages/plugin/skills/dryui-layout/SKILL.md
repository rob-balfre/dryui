---
name: dryui-layout
description: 'Place DryUI Svelte 5 components inside `AreaGrid.Root` and wire responsive behavior with container queries. Use whenever a `.svelte` file needs page or section structure (named areas, sidebar/main/header layouts, dashboard-style regions, responsive shifts, fluid grids), or when a brief mentions "layout", "grid", "AreaGrid", "wireframe", "page structure", "responsive", or container queries. The agent only does structure: it picks `AreaGrid.Root`, names the areas, sets the template family, and adds `@container` rules. It does not pick non-layout components, write copy, choose tokens, wire forms, or run validation — those hand off.'
---

# DryUI Layout

Single job: place DryUI components inside `AreaGrid.Root` and handle responsive sizing through container queries. Stop at the structure boundary.

## Hard rules

1. **One `AreaGrid.Root` per file.** No nesting. Lint: `dryui/area-grid-single-root`.
2. **Children are DryUI components only.** No `<div>`, `<span>`, `<section>`, `<svelte:element>`, or any other raw tag inside the grid. Lint: `dryui/no-raw-element`.
3. **Styling input is CSS custom properties only.** Use Svelte's `--prop` syntax (`--dry-grid-area-name="header"`). No `class=`, no `style=`, no `style:` directives. Lint: `dryui/no-component-class`, `dryui/no-inline-style`, `dryui/no-style-directive`.
4. **Grid only through `AreaGrid.Root`.** No raw `display: grid` anywhere. Lint: `dryui/no-raw-grid`.

If you want a behavior these rules forbid, the layout is wrong, not the rules. Restructure: split into sibling AreaGrids, push placement into the parent's template, or hand off to the agent that owns the missing piece.

## `AreaGrid.Root` API

Props (real, from the component source):

- `maxWidth`: `'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'` — defaults `xl` (80rem / 1280px). The grid sits in a centered column that caps at the chosen size; outer breathing on narrower viewports comes from `min(100% - 2rem, …)`. Pick `'full'` only for app shells where chrome (topbar, sidebar) genuinely needs viewport bleed (Jira, Linear, mail clients, IDE-style apps). Sizes: sm 40rem, md 48rem, lg 64rem, xl 80rem, 2xl 96rem.
- `fill`: `boolean` — when `true`, the grid stretches to at least viewport height (`min-block-size: 100dvh`). **Always pass `fill` for page-level layouts** (anything in `+page.svelte`); without it the grid collapses to content height and the rest of the viewport sits dark below. Omit only when the AreaGrid is a section inside a larger layout.
- `debug`: `boolean` — visualizes area boxes during development. Strip before commit.
- `seams`: `boolean` — draws 1px seam lines between grid tracks for development. Off by default; opt in only when laying out the grid. Strip before commit.

There is no `gap` and no `padding` _attribute_ — those are footguns and stay banned. Lint: `dryui/area-grid-no-gap`, `dryui/area-grid-no-padding`.

What AreaGrid does expose for whitespace is two layers of _namespaced_ padding, set via Svelte `--prop` syntax:

- **Shell padding** (`--dry-area-grid-shell-padding[-block|-inline]`): inset between the centered max-width cap and the grid tracks. Use this when the page needs vertical air around the grid (top/bottom strip on a hero, breathing room above an app shell), or extra horizontal breathing inside the cap on top of the default `100% - 2rem` gutter.
- **Grid padding** (`--dry-area-grid-padding[-block|-inline]`): inset between the grid's own box and its tracks. Use this when every region should be inset from the grid edge by the same amount — e.g., a card-shell-style frame.

Inter-region spacing (between two areas) is still each region's surface concern (border, padding, background). If you want gutters between tracks, that's `gap`, which AreaGrid does not yet expose; restructure or push the spacing into the regions.

The Root sets `container-type: inline-size` on itself, so every child can use container queries against the grid's own width.

## Templates (presets)

Six named templates encode the most common layouts so you don't author template-areas strings unless you need a custom shape. Set via the `template` prop. Each preset corresponds to a layout from [1linelayouts.com](https://1linelayouts.com/), translated into named areas where applicable.

| `template`   | Areas                                                                                | When to use                                                                      |
| ------------ | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| `centered`   | `content` (single area, both axes centered via `place-items`)                        | Auth screen, splash, error page, single-card empty state.                        |
| `sidebar`    | `aside`, `main`                                                                      | Docs, settings, two-pane app shell. Sidebar is `minmax(150px, 25%)`, main `1fr`. |
| `stack`      | `masthead`, `main`, `foot`                                                           | Page with fixed header/footer and flexible main (Pancake Stack).                 |
| `holy-grail` | `masthead`, `nav`, `main`, `aside`, `foot`                                           | Classic three-column page with full-width header and footer.                     |
| `12-span`    | none (children flow into 12 numbered columns)                                        | Marketing or dashboard sections that compose from a 12-column rhythm.            |
| `card-grid`  | none (children flow with `repeat(auto-fit, minmax(--dry-area-grid-min-track, 1fr))`) | Card lists, gallery, RAM-style auto-responsive grids.                            |

When `template` is set, you do **not** need to pass `--dry-area-grid-template-areas` (the lint relaxes `area-grid-required-var`). Each preset still composes with `-wide` and `-xl` overrides if you want to swap shapes at breakpoints.

Optional knobs (Svelte `--prop` syntax):

| Property                      | Used by     | Default |
| ----------------------------- | ----------- | ------- |
| `--dry-area-grid-sidebar-min` | `sidebar`   | `150px` |
| `--dry-area-grid-sidebar-max` | `sidebar`   | `25%`   |
| `--dry-area-grid-min-track`   | `card-grid` | `16rem` |

```svelte
<AreaGrid.Root template="sidebar" --dry-area-grid-sidebar-min="14rem">
	<Nav --dry-grid-area-name="aside" />
	<Article --dry-grid-area-name="main" />
</AreaGrid.Root>

<AreaGrid.Root template="card-grid" --dry-area-grid-min-track="14rem">
	<Card.Root>…</Card.Root>
	<Card.Root>…</Card.Root>
	<Card.Root>…</Card.Root>
</AreaGrid.Root>
```

Reach for hand-authored template-areas (next section) only when no preset fits: bespoke dashboards, asymmetric splits, or layouts that swap structure at breakpoints in ways the preset table can't express.

## Template areas family

Set the template via Svelte `--prop` syntax on `AreaGrid.Root`. Each variant has a `-wide` (≥720px container) and `-xl` (≥1024px container) override.

| Property                                | Purpose                                            |
| --------------------------------------- | -------------------------------------------------- |
| `--dry-area-grid-template-areas`        | Required base template.                            |
| `--dry-area-grid-template-columns`      | Track sizes for columns. Defaults `minmax(0,1fr)`. |
| `--dry-area-grid-template-rows`         | Track sizes for rows. Defaults `none`.             |
| `--dry-area-grid-template-areas-wide`   | Override at ≥720px container width.                |
| `--dry-area-grid-template-columns-wide` | …columns at ≥720px.                                |
| `--dry-area-grid-template-rows-wide`    | …rows at ≥720px.                                   |
| `--dry-area-grid-template-areas-xl`     | Override at ≥1024px container width.               |
| `--dry-area-grid-template-columns-xl`   | …columns at ≥1024px.                               |
| `--dry-area-grid-template-rows-xl`      | …rows at ≥1024px.                                  |

The base template is required. Lint: `dryui/area-grid-required-var`.

### Padding (optional)

| Property                               | Purpose                                             |
| -------------------------------------- | --------------------------------------------------- |
| `--dry-area-grid-shell-padding`        | Both axes of shell padding (inside the max-width).  |
| `--dry-area-grid-shell-padding-block`  | Vertical-only override (top/bottom of the shell).   |
| `--dry-area-grid-shell-padding-inline` | Horizontal-only override (left/right of the shell). |
| `--dry-area-grid-padding`              | Both axes of grid padding (around the tracks).      |
| `--dry-area-grid-padding-block`        | Vertical-only override (top/bottom of the grid).    |
| `--dry-area-grid-padding-inline`       | Horizontal-only override (left/right of the grid).  |

Each axis-specific var falls back to the shorthand, then to `0`. Both layers are off by default; opt in only when the layout actually needs it. Track sizes are computed inside the grid's content area, so seam rendering stays correct under grid padding without any extra wiring.

## Placement

Each child carries `--dry-grid-area-name="<name>"` (Svelte `--prop` syntax). The name must appear in the active template, including any `-wide` / `-xl` overrides in use, or the lint flags an orphan.

When you don't yet know which component will fill an area (Layout's job is structure, not content), use `<AreaGrid.Placeholder area="<name>" />`. It renders a deterministic pastel box labelled with the area name so the layout is immediately visible. Hand off and the next agent swaps each placeholder for a real component.

```svelte
<script>
	import { AreaGrid } from '@dryui/ui';
</script>

<AreaGrid.Root
	--dry-area-grid-template-areas="'masthead' 'nav' 'main' 'aside' 'foot'"
	--dry-area-grid-template-areas-wide="'masthead masthead masthead' 'nav main aside' 'foot foot foot'"
	--dry-area-grid-template-columns-wide="12rem minmax(0, 1fr) 16rem"
>
	<AreaGrid.Placeholder area="masthead" />
	<AreaGrid.Placeholder area="nav" />
	<AreaGrid.Placeholder area="main" />
	<AreaGrid.Placeholder area="aside" />
	<AreaGrid.Placeholder area="foot" />
</AreaGrid.Root>
```

When you do know the component (because the brief named it, or you're editing a file that already has placed children), the same `--dry-grid-area-name` syntax applies on any DryUI component:

```svelte
<Card.Root --dry-grid-area-name="masthead">…</Card.Root>
```

Lint guards on placement:

- `dryui/area-grid-missing-area` — child names a track the template does not declare.
- `dryui/area-grid-missing-root` — `--dry-grid-area-name` set on a child outside any `AreaGrid.Root`.
- `dryui/area-grid-no-area-part` — wrong AreaGrid sub-part used.
- `dryui/area-grid-invalid-template` — malformed template-areas string.
- `dryui/area-grid-invalid-var` — legacy variable name.

## Sizing tracks well

A layout that passes lint can still render as garbage. The rules below produce layouts that look right when previewed with `<AreaGrid.Placeholder>` content, not just when filled with real components.

**Never use bare `auto` for content-bearing tracks.** With the placeholder (a small label) as the only content, `auto` collapses to label width and the layout looks broken. Reserve `auto` for tracks where you genuinely want intrinsic sizing — typically headers, footers, and a `composer` row (auto height because the input bar's height is what it is).

**Content tracks take `1fr` or a specific size.** A "main content" track that should absorb leftover space uses `1fr` (or `minmax(0, 1fr)` to let it shrink). A sidebar or rail uses a specific width like `14rem` / `18rem`.

**Centered card patterns** (single area centered on an empty page — auth, error, empty state, splash):

- Column tracks: `minmax(0, 1fr) min(28rem, 100% - 2rem) minmax(0, 1fr)` — outer columns absorb space, middle column is a real card width that shrinks gracefully on narrow viewports.
- Row tracks: `minmax(0, 1fr) minmax(20rem, auto) minmax(0, 1fr)` — outer rows absorb space, middle row has a minimum so the placeholder previews as a card-shaped box, growing to fit real content.

```svelte
<AreaGrid.Root
	fill
	--dry-area-grid-template-areas="'. . .' '. form .' '. . .'"
	--dry-area-grid-template-columns="minmax(0, 1fr) min(28rem, 100% - 2rem) minmax(0, 1fr)"
	--dry-area-grid-template-rows="minmax(0, 1fr) minmax(20rem, auto) minmax(0, 1fr)"
>
	<AreaGrid.Placeholder area="form" />
</AreaGrid.Root>
```

**Sidebar + main patterns:** sidebar takes a specific width (`14rem`, `16rem`, `18rem`); main takes `minmax(0, 1fr)`. Never `auto` for either.

**Three-pane patterns** (folders | list | preview): two narrow rails with specific widths, one panel takes `minmax(0, 1fr)` to absorb leftover.

If you find yourself reaching for `auto` on a content track, stop and ask whether the track has a natural size (it doesn't — placeholders don't carry intrinsic dimensions for you).

## Container queries

`AreaGrid.Root` already wires `container-type: inline-size` and ships built-in breakpoints at 720px (wide) and 1024px (xl) for the template family above. Reach for an explicit `@container` query when:

- The breakpoint sits between the built-ins, or higher than 1024px.
- A specific area needs to reflow internally (e.g., a sidebar that stacks at narrow container width).
- A placed component needs different behavior than its area's track size implies.

```svelte
<style>
	[data-card-shell] {
		container-type: inline-size;
	}

	@container (min-width: 480px) {
		[data-card-shell] {
			--dry-card-padding: var(--dry-space-6);
		}
	}
</style>
```

Use `@container` for any responsive sizing. Never `@media`. Width-by-measure (`ch`, `ex`, `em`) is the only carve-out and is set on the component prop, not in a class.

## Self-check before handoff

Run `dryui check <file>` (or MCP `check`). The layout-relevant rules to satisfy:

- `dryui/area-grid-single-root`
- `dryui/area-grid-required-var`
- `dryui/area-grid-missing-area`
- `dryui/area-grid-missing-root`
- `dryui/area-grid-invalid-template`
- `dryui/area-grid-invalid-var`
- `dryui/area-grid-no-area-part`
- `dryui/area-grid-no-gap`
- `dryui/area-grid-no-padding`
- `dryui/no-global`
- `dryui/no-raw-grid`
- `dryui/no-raw-element`
- `dryui/no-component-class`
- `dryui/no-inline-style`
- `dryui/no-style-directive`
- `dryui/no-layout-component` (Grid, Stack, Flex are banned)

If the lint flags something this skill does not cover, treat the lint as authoritative and hand off rather than working around it.

## Out of scope (hand off)

The Layout skill does not pick which DryUI component goes in each area, choose tokens, wire form a11y, write copy, or run final validation. The placeholders in the grid get filled by other agents.

| Boundary                                     | Hand off to            |
| -------------------------------------------- | ---------------------- |
| Which component fills `main` / `aside` / …   | **Component agent**    |
| Token / palette / typography choices         | **Theme agent**        |
| `Field.Root`, ARIA, focus, keyboard          | **Forms / a11y agent** |
| Microcopy, headings, body text               | **Content agent**      |
| Final `dryui check`, fixing every diagnostic | **Validate agent**     |

## Handoff format

End every Layout response with this block so the next agent has clean inputs:

```
LAYOUT DONE
- file: <path>
- root: AreaGrid.Root, maxWidth=<>, fill=<true|false>
- padding: shell=<value|none>, grid=<value|none>
- areas: <list of names>
- breakpoints: base, wide@720, xl@1024 (+ any custom @container rules added)
- placeholders:
    <area> → <DryUI component placeholder> (pending: <agent>)
NEXT: <agent name>
```

Do not nominate a specific replacement component for the placeholder — that is the next agent's call. Just say "this area is empty, Component agent owns it."

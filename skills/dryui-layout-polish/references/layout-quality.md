# Layout Quality Reference

Use this reference for the post-`dryui-layout` pass. The goal is not decoration. The goal is a page skeleton whose structure already communicates priority, grouping, density, and responsive behavior before components arrive.

## Table of Contents

- DryUI constraints
- Surface modes
- Diagnosis checklist
- Red flags and fixes
- Spacing and density
- Responsive structure
- Verification

## DryUI Constraints

- Layout mechanics live in `src/layout.css`, scoped by `[data-layout='<name>']`.
- `.svelte` files expose zones with one root `data-layout` element and direct children using `data-layout-area`.
- Use `@container page (min-width: ...)` for page layout shifts. Do not use `@media` for layout breakpoints.
- Use `--dry-space-*` tokens for gaps and padding. Known practical anchors: `--dry-space-2` for compact pairs, `--dry-space-3` for tight groups, `--dry-space-4` for default body spacing, `--dry-space-6` for section breathing room, and `--dry-space-8` for large separations.
- Do not add `width`, `min-width`, `max-width`, `inline-size`, `min-inline-size`, or `max-inline-size` to force a layout. Fix the parent grid tracks instead.
- Do not add cards, components, colors, shadows, or typography changes in this pass.

## Surface Modes

Choose the mode from the brief and route.

`product`: dashboards, settings, docs, admin, editors, CRM, SaaS, internal tools. Favor predictable grids, compact but legible density, stable rails, and consistent repeated structure. The layout should be easy to scan repeatedly.

`expressive`: landing pages, portfolio surfaces, brand pages, editorial pages, demos. Allow more contrast in spacing, asymmetry, and section rhythm, but still keep the DryUI layout rules intact.

Default to `product` when unsure.

## Diagnosis Checklist

Answer these before editing:

- Primary focus: what should the eye find first within two seconds?
- Secondary focus: what supports the primary action or information?
- Grouping: are related zones close, and unrelated zones separated?
- Rhythm: are all gaps identical, or is there a useful beat of tight and generous space?
- Density: does the page feel cramped, wasteful, or appropriate for its use?
- Tracks: are sidebars, main content, and supporting panels sized for their job?
- Breakpoints: does each layout shift happen because content needs it, not because of a device guess?
- Mobile base: is the narrow layout a coherent order, not just desktop stacked by accident?

## Red Flags and Fixes

### Everything Has The Same Gap

Problem: equal spacing everywhere makes the hierarchy flat.

Fix: use smaller gaps inside a group and larger gaps between groups. Example: `--dry-space-3` inside a header stack, `--dry-space-6` between header and main content, `--dry-space-4` inside repeated body zones.

### The Page Is A Centered Stack

Problem: centered vertical stacks often look like placeholders, especially for product UI.

Fix: give the layout a readable spine. For product pages, left-align major areas and use a stable nav/main/support structure. For expressive pages, use asymmetry intentionally, such as a wider main area and narrower supporting rail.

### Main Content Is Squeezed

Problem: a fixed sidebar or support panel leaves the main track too narrow.

Fix: use `minmax(0, 1fr)` for the main track, then reduce rail sizes or delay the multi-column breakpoint. Common rails: `12rem` to `16rem` for navigation, `18rem` to `22rem` for supporting detail.

### Supporting Content Competes With Primary Content

Problem: aside, filters, or meta areas have the same spatial weight as the main area.

Fix: shrink or move support zones later in the visual order. On narrow layouts, put primary content before support unless the support is required to use the page.

### Breakpoint Fires Too Early

Problem: desktop columns appear while content still feels cramped.

Fix: raise the `@container page` threshold or keep a two-stage layout: single column base, two columns at medium width, full rails only at wide width.

### Repeated Zones Feel Monotonous

Problem: every section has the same height, gap, and track role.

Fix: vary structure at the layout level. Let summary/status zones form an auto-fit peer grid, while main work zones use named areas. Do not vary by adding decorative cards.

### Empty Footer Floats Midpage

Problem: short pages leave footer directly below content with awkward unused space.

Fix: add an empty `'.'` row before the footer and use `grid-template-rows: auto auto 1fr auto` with `min-block-size: 100dvh`.

## Spacing and Density

Use proximity as the main grouping tool.

- Tight pairs: label plus value, heading plus short subtitle, icon plus label.
- Normal groups: form section, toolbar row, card-grid placeholder, list placeholder.
- Large separations: page header to body, unrelated panels, footer separation.

For product surfaces:

- Keep nav/main/support relationships predictable.
- Use compact internal gaps where repeated scanning matters.
- Prefer consistent rail widths and stable area placement.
- Avoid hero-like emptiness unless the page is an onboarding or empty state.

For expressive surfaces:

- Allow one dominant area to breathe.
- Use larger section separations and more varied area spans.
- Keep mobile order clear and literal; expressive desktop structure should not make mobile confusing.

## Responsive Structure

Start with the narrow order first. A good narrow order usually reads:

1. masthead or title
2. primary action or primary content
3. secondary navigation or filters if needed
4. supporting content
5. footer

For wider layouts, choose a structure by job:

- Sidebar plus main: persistent navigation or settings sections.
- Main plus support rail: reading/detail pages, dashboards with context.
- Three-column shell: only when nav, main, and support all need simultaneous visibility.
- Auto-fit peer grid: repeated equal-priority zones such as stats, cards, or shortcuts.
- Centered single area: authentication, empty state, focused setup. Use sparingly.

Do not add more than two `@container page` thresholds unless the content clearly needs three distinct structures.

## Verification

Before finishing:

- At narrow width, the page has one coherent reading order.
- At wide width, the main area is obviously primary.
- Related zones are visibly grouped without needing cards.
- Support zones do not steal attention from primary zones.
- No layout rule relies on hardcoded colors, arbitrary spacing, inline styles, classes, route-level CSS, or `@media`.
- The relevant project check/build command passes.

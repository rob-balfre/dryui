# DryUI Accessibility Audit

Date: 2026-04-18

Scope: `packages/ui`, selected `packages/primitives` dependencies, and representative docs pages under `apps/docs`.

Standards baseline:

- WCAG 2.2 A, AA, AAA
- WAI-ARIA Authoring Practices 1.2 for custom widgets

Important constraint:

- This is an engineering audit, not a formal conformance claim.
- A library-wide AAA claim is not supportable here. W3C explicitly notes that Level AAA should not generally be required for entire sites or apps because some AAA criteria are not universally achievable.

References:

- WCAG overview: https://www.w3.org/WAI/standards-guidelines/wcag/
- WCAG 2.2 conformance note: https://www.w3.org/WAI/WCAG22/Understanding/refer-to-wcag
- WAI-ARIA APG 1.2: https://www.w3.org/TR/2021/NOTE-wai-aria-practices-1.2/

## Executive Summary

DryUI is not in a state where I would describe the component library as WCAG 2.2 AA-compliant across the board, and it is not close to a defensible AAA position.

The good news is that the baseline is better than a typical pre-alpha library:

- many primitives use native controls or reasonable ARIA roles
- focus-visible states are present in many places
- several widgets include keyboard support and live-region announcements

The limiting factor is the advanced widget layer. A small set of composite components currently introduce semantic mismatches, invalid ARIA, or APG pattern drift that block a credible repo-wide AA statement:

- `Menubar`
- `Tree`
- `Carousel`
- `NotificationCenter`
- `Transfer`
- `RichTextEditor`
- `Chart`

My current assessment:

- Basic semantic components: mostly AA-capable when used correctly by consumers
- Advanced composite widgets: mixed, with multiple blockers
- Library-wide A: plausible for large portions of the surface, but not yet proven
- Library-wide AA: not supportable today
- Library-wide AAA: no

## Method

I used three inputs:

1. Static code review of high-risk widgets and their supporting primitives:

- menus
- tree navigation
- carousel
- drag and drop
- charts
- editor controls
- transfer/listbox patterns
- notification/popup patterns

2. Browser-level snapshot audits against the docs app running locally:

- `/components/button`: Lighthouse accessibility `98`
- `/components/menubar`: Lighthouse accessibility `98`
- `/components/tree`: Lighthouse accessibility `98`
- `/components/carousel`: Lighthouse accessibility `93`

3. Documentation/process coverage review:

- `packages/mcp/src/spec.json` currently exposes `160` components
- only `9` components include explicit `a11y` guidance in the docs/spec output

The browser audits were useful for catching obvious markup errors, but they did not catch several of the more important APG and interaction-model problems below. The code review is the stronger signal here.

## Findings

### High

1. Menubar popups are not programmatically named.

Evidence:

- `packages/ui/src/menubar/menubar-content.svelte:86-103`
- `packages/ui/src/menubar/menubar-button-trigger.svelte:59-70`

Problem:

- `Menubar.Content` sets `aria-labelledby={\`menubar-trigger-${menuCtx.menuId}\`}`.
- `Menubar.Trigger` never sets that `id`; it only sets `data-menubar-trigger={menuCtx.menuId}`.

Impact:

- screen readers can encounter a `role="menu"` without a valid accessible name source
- this weakens orientation and announcement quality in one of the highest-risk widget patterns

Assessment:

- blocks a confident AA statement for `Menubar`

2. Tree does not implement the APG tree pattern cleanly.

Evidence:

- `packages/primitives/src/tree/tree-root.svelte:55-156`
- `packages/primitives/src/tree/tree-item.svelte:24-34`
- `packages/primitives/src/tree/tree-item-label.svelte:16-33`

Problem:

- focus moves to a nested `role="button"` label instead of the `treeitem`
- `treeitem` itself is not focusable
- label click both selects and toggles expansion unconditionally
- `aria-expanded` is applied on every `treeitem`, not only parents with child groups

Impact:

- assistive technology may not announce tree state consistently
- keyboard behavior diverges from established tree expectations
- selection vs expansion semantics are conflated

Assessment:

- this is a structural pattern issue, not a small bug
- `Tree` needs a semantics pass before I would rate it AA-ready

### Medium

3. Carousel mixes tab semantics with toggle semantics, and autoplay has no built-in pause/stop control.

Evidence:

- `packages/ui/src/carousel/carousel-button-dots.svelte:12-25`
- `packages/ui/src/carousel/carousel-button-thumbnails.svelte:16-35`
- `packages/ui/src/carousel/carousel-slide.svelte:19-27`
- `packages/ui/src/carousel/carousel-root.svelte:99-105`

Problem:

- dot buttons use `role="tab"` and `aria-selected`, but also set `aria-pressed`
- slides are rendered as `role="group"` instead of `tabpanel`
- tabs do not expose `aria-controls`
- autoplay starts a timer whenever `autoplay` is truthy, with no built-in pause/stop affordance

Browser confirmation:

- Lighthouse on `/components/carousel` flagged invalid ARIA: `aria-pressed` is not allowed on `role="tab"`

Impact:

- invalid ARIA today
- APG mismatch for tab-like navigation
- potential WCAG 2.2.2 risk if teams enable autoplay for content moving longer than 5 seconds

Assessment:

- `Carousel` should be treated as below AA until its navigation semantics are normalized

4. NotificationCenter announces the wrong popup type.

Evidence:

- `packages/ui/src/notification-center/notification-center-trigger-button.svelte:23-33`
- `packages/ui/src/notification-center/notification-center-panel.svelte:82-100`

Problem:

- trigger uses `aria-haspopup="dialog"`
- popup panel is `role="region"`, not `dialog`

Impact:

- assistive tech is told to expect a dialog, but receives a landmark-like region instead
- this is an announcement and expectation mismatch on a popup surface

Assessment:

- medium severity; easy to fix, but it is real semantic drift

5. Transfer mixes listbox semantics with nested checkboxes.

Evidence:

- `packages/ui/src/transfer/transfer-list-input.svelte:60-111`

Problem:

- the container is `role="listbox"` with `aria-multiselectable="true"`
- each option is a `<label role="option">`
- each option contains a live checkbox control

Impact:

- this creates overlapping interaction models
- screen readers may announce both option and checkbox semantics
- keyboard expectations for multi-select listbox vs checkbox list do not align cleanly

Assessment:

- this should become either:
  - a pure listbox with roving option focus and selection state, or
  - a checkbox list / grid pattern

6. Rich text editor link input is unlabeled.

Evidence:

- `packages/ui/src/rich-text-editor/rich-text-editor-toolbar-button-input.svelte:380-420`

Problem:

- the URL input in the link popover has a placeholder but no `<label>`, `aria-label`, or `aria-labelledby`

Impact:

- placeholder text is not a sufficient accessible name
- screen-reader users can land on an unlabeled form control inside an already complex widget

Assessment:

- medium severity and straightforward to fix

7. Interactive charts rely on focusable SVG shapes with suppressed a11y warnings.

Evidence:

- `packages/ui/src/chart/chart-bars.svelte:36-61`
- `packages/ui/src/chart/chart-donut.svelte:55-83`

Problem:

- clickable `<rect>` and `<circle>` elements are given `role="button"` and `tabindex`
- Svelte accessibility warnings are explicitly suppressed to allow this
- there is no built-in textual fallback such as a data table or summary

Impact:

- browser/AT support for interactive SVG controls is inconsistent
- the chart can be keyboard reachable and still be a weak experience for screen-reader users

Assessment:

- not a guaranteed failure in every stack, but high implementation risk for AA robustness

### Low

8. ScrollArea hardcodes every instance as a labeled region.

Evidence:

- `packages/ui/src/scroll-area/scroll-area.svelte:13-24`

Problem:

- every instance is `role="region"` with `aria-label="Scrollable content"`

Impact:

- repeated generic regions add landmark noise
- many scroll containers should remain unnamed structural wrappers unless the consumer provides a meaningful label

Assessment:

- low severity, but worth correcting across a library

9. Alert titles are fixed to `h5`, which caused heading-order failures on docs pages.

Evidence:

- `packages/ui/src/alert/alert.svelte:54-60`
- component pages render an "Accessibility" callout via `DocsCallout`, which delegates to `Alert`

Browser confirmation:

- Lighthouse flagged heading-order issues on docs component pages

Impact:

- the alert component is forcing document-outline decisions onto consumers
- docs pages inherit heading-order problems even when the surrounding page hierarchy is otherwise sensible

Assessment:

- low to medium severity
- probably better as a styled text element or configurable heading level

## What Looks Stronger

These areas looked materially better and appear closer to AA-capable usage when consumers supply labels and accessible content:

- `Button`
- `Input`
- `Select`
- `Combobox`
- `Dialog` / `Drawer` via native `<dialog>`
- `Tooltip`
- `FileUpload`
- `Splitter`
- `ColorPicker` sliders

That does not mean they are AAA-ready. It means I did not find comparable pattern-level blockers in the sampled code.

## Systemic Gaps

1. Accessibility guidance coverage is too thin.

Only `9 / 160` components currently expose `a11y` notes in the generated docs/spec output. That is not enough for a library that includes many custom widgets.

2. There is no evidence of automated accessibility regression coverage at the widget-state level.

The local docs pages score reasonably well in static Lighthouse snapshots, but that did not catch:

- the broken menubar labeling relationship
- the tree pattern drift
- the notification center popup-type mismatch

3. AAA is not a realistic target for a library-wide claim without stricter guarantees around:

- contrast across all shipped themes and token overrides
- target size and focus appearance across all component states
- motion controls for autoplaying or animated surfaces
- accessible alternatives for charts and other visual-only widgets

## Recommended Next Actions

1. Fix semantic blockers first.

- Menubar labeling
- Carousel tab semantics
- NotificationCenter popup type
- RichTextEditor link-input labeling

2. Rework the APG-sensitive widgets.

- Tree
- Transfer
- Chart

3. Add automated accessibility regression tests.

- Playwright + axe for open/interactive states
- cover menus, dialogs, carousel controls, tree navigation, transfer selection, editor link popover

4. Expand component-level accessibility guidance in `spec.json`.

- every interactive component should document:
  - required labeling
  - keyboard model
  - known limitations
  - consumer responsibilities

5. Treat AAA as an opt-in surface-by-surface aspiration, not a repo-wide target.

## Bottom Line

DryUI has a decent baseline for a pre-alpha library, but the advanced widget layer is not yet at a point where I would recommend marketing it as broadly AA-compliant, and definitely not AAA-compliant.

If the current medium/high findings are fixed and covered by automated interaction-state accessibility tests, the library could move toward a credible AA posture for most core components. It is not there today.

# DryUI Accessibility Remediation Plan

Date: 2026-04-19

Source: [accessibility-audit-2026-04-18.md](./accessibility-audit-2026-04-18.md)

Primary goal:

- make DryUI credibly WCAG 2.2 AA-ready across the core interactive component surface

Non-goals:

- do not claim library-wide AAA conformance
- do not optimize for legacy compatibility unless a component rewrite explicitly needs a migration note

## Exit Criteria

DryUI is ready to call "AA-ready" only when all of the following are true:

- every High and Medium issue from the audit is fixed
- representative docs pages for every interactive widget pass automated accessibility checks in CI
- APG-sensitive widgets have explicit keyboard-model tests
- docs/spec output includes accessibility guidance for every interactive component
- theme-level contrast checks pass for the default shipped themes on core controls and text surfaces

## Workstreams

## 1. Establish The Compliance Target And Test Harness

- Define the target publicly and internally as WCAG 2.2 AA for the component library, not AAA.
- Add a dedicated accessibility validation lane to CI.
- Add interaction-state accessibility tests, not just static page snapshots.
- Add a small representative matrix of docs pages to use as the compliance gate.

Checklist:

- [ ] Add a repo-level accessibility policy doc that states:
  - target standard is WCAG 2.2 AA
  - AAA is not a repo-wide claim
  - APG alignment is required for custom widgets
- [ ] Add automated browser a11y checks for representative docs pages:
  - `/components/menubar`
  - `/components/tree`
  - `/components/carousel`
  - `/components/notification-center`
  - `/components/transfer`
  - `/components/rich-text-editor`
  - `/components/chart`
- [ ] Add widget-state coverage:
  - closed state
  - open state
  - focus traversal state
  - keyboard interaction state
  - error or empty state where relevant
- [ ] Fail CI on invalid ARIA, unlabeled controls, focus traps, and obvious landmark/heading regressions.

Definition of done:

- a new CI job exists and blocks merges on accessibility regressions
- automated checks reproduce the current carousel invalid-ARIA issue before the fixes land

## 2. Fix High-Severity Widget Blockers First

These are the blockers that currently prevent a credible AA claim.

### 2.1 Menubar

Files:

- `packages/ui/src/menubar/menubar-button-trigger.svelte`
- `packages/ui/src/menubar/menubar-content.svelte`

Checklist:

- [ ] Give each trigger a real `id` that matches the popup's `aria-labelledby` target.
- [ ] Verify menu content has a stable accessible name when opened.
- [ ] Verify trigger focus returns correctly on close.
- [ ] Add keyboard tests for:
  - left/right top-level navigation
  - down-arrow opening
  - escape closing
  - focus return to trigger
- [ ] Add docs accessibility notes for `Menubar`.

Definition of done:

- popup menu name is announced correctly by AT-facing tooling
- keyboard behavior matches the APG menubar pattern

### 2.2 Tree

Files:

- `packages/primitives/src/tree/tree-root.svelte`
- `packages/primitives/src/tree/tree-item.svelte`
- `packages/primitives/src/tree/tree-item-label.svelte`
- `packages/primitives/src/tree/tree-item-children.svelte`
- mirrored `packages/ui` wrapper if needed

Checklist:

- [ ] Rebuild the tree around actual `treeitem` focus semantics instead of nested `role="button"` labels.
- [ ] Apply `aria-expanded` only to parent nodes that actually own child groups.
- [ ] Separate selection behavior from expand/collapse behavior.
- [ ] Implement APG-consistent keyboard handling:
  - up/down move between visible items
  - right expands or enters children
  - left collapses or moves to parent
  - home/end move to first/last visible item
- [ ] Add tests for collapsed, expanded, leaf, and parent nodes.
- [ ] Add docs accessibility notes for `Tree`.

Definition of done:

- the focused element is the `treeitem`, not an inner fake button
- expansion and selection are announced consistently

## 3. Fix The Medium-Severity Semantics And Interaction Gaps

### 3.1 Carousel

Files:

- `packages/ui/src/carousel/carousel-root.svelte`
- `packages/ui/src/carousel/carousel-slide.svelte`
- `packages/ui/src/carousel/carousel-button-dots.svelte`
- `packages/ui/src/carousel/carousel-button-thumbnails.svelte`

Checklist:

- [ ] Remove `aria-pressed` from anything using `role="tab"`.
- [ ] Decide on one pattern and implement it fully:
  - either a tabbed carousel model
  - or a non-tab carousel model with plain buttons
- [ ] If using tabs:
  - add `aria-controls`
  - map slides/panels correctly
  - expose proper selected state only
- [ ] Add a built-in autoplay pause/stop control when `autoplay` is enabled.
- [ ] Respect reduced motion and pause on focus/hover where appropriate.
- [ ] Add tests for:
  - keyboard navigation
  - selected-state announcement
  - autoplay pause behavior
- [ ] Add docs accessibility notes for `Carousel`.

Definition of done:

- Lighthouse and automated a11y checks no longer flag invalid ARIA
- autoplay no longer risks WCAG 2.2.2 violations

### 3.2 NotificationCenter

Files:

- `packages/ui/src/notification-center/notification-center-trigger-button.svelte`
- `packages/ui/src/notification-center/notification-center-panel.svelte`

Checklist:

- [ ] Align trigger and popup semantics.
- [ ] Choose one of:
  - dialog-like popup with `role="dialog"`
  - non-dialog popup without `aria-haspopup="dialog"`
- [ ] Ensure focus management matches the chosen pattern.
- [ ] Add keyboard tests for open, close, and focus return.
- [ ] Add docs accessibility notes for `NotificationCenter`.

Definition of done:

- the trigger advertises the popup type truthfully

### 3.3 Transfer

Files:

- `packages/ui/src/transfer/transfer-list-input.svelte`

Checklist:

- [ ] Pick a single semantic model:
  - multi-select listbox
  - checkbox list
  - grid if richer row semantics are needed
- [ ] Remove the mixed `role="option"` + nested checkbox model.
- [ ] Implement keyboard behavior that matches the chosen pattern.
- [ ] Add tests for selection, select-all, filtering, and disabled items.
- [ ] Add docs accessibility notes for `Transfer`.

Definition of done:

- screen readers no longer receive conflicting option and checkbox semantics

### 3.4 RichTextEditor

Files:

- `packages/ui/src/rich-text-editor/rich-text-editor-toolbar-button-input.svelte`
- `packages/ui/src/rich-text-editor/rich-text-editor-content.svelte`

Checklist:

- [ ] Add an explicit label or accessible name to the link URL input.
- [ ] Verify the link editing flow is keyboard-complete.
- [ ] Ensure focus lands in the link input when opened and returns predictably when closed.
- [ ] Add tests for:
  - toolbar roving tabindex
  - unlabeled-control regression
  - link apply/cancel with keyboard
- [ ] Add docs accessibility notes for `RichTextEditor`.

Definition of done:

- no unlabeled controls remain in the editor UI

### 3.5 Chart

Files:

- `packages/ui/src/chart/chart-bars.svelte`
- `packages/ui/src/chart/chart-donut.svelte`
- primitive mirrors if shared

Checklist:

- [ ] Decide whether charts are:
  - presentational with separate accessible summaries
  - or interactive controls with robust accessible alternatives
- [ ] Remove or justify every `svelte-ignore a11y` suppression in chart code.
- [ ] Provide a built-in text alternative for interactive charts:
  - summary
  - data table
  - accessible value list
- [ ] Re-evaluate whether SVG shapes should be focus targets directly.
- [ ] Add tests for accessible names and fallback content exposure.
- [ ] Add docs accessibility notes for `Chart`.

Definition of done:

- chart data is available in a reliable text form
- no unsupported interactive SVG pattern remains by default

## 4. Clean Up The Lower-Severity Semantic Debt

### 4.1 ScrollArea

Files:

- `packages/ui/src/scroll-area/scroll-area.svelte`

Checklist:

- [ ] Stop hardcoding every instance as `role="region"` with a generic label.
- [ ] Make labeling opt-in or only apply region semantics when the consumer supplies a meaningful name.
- [ ] Add docs guidance for when to label a scrollable region.

### 4.2 Alert Heading Structure

Files:

- `packages/ui/src/alert/alert.svelte`
- `apps/docs/src/lib/components/DocsCallout.svelte`

Checklist:

- [ ] Stop forcing a fixed `h5` inside `Alert`.
- [ ] Replace it with one of:
  - configurable heading level
  - non-heading styled title text
  - consumer-supplied semantic title slot
- [ ] Re-run docs page audits to confirm heading-order regressions are gone.

## 5. Expand Accessibility Guidance Across The Catalog

Current state from the audit:

- `160` components in spec output
- only `9` include explicit `a11y` notes

Checklist:

- [ ] Add `a11y` guidance to every interactive component in `packages/mcp/src/spec.json` generation flow.
- [ ] For each interactive component, document:
  - required labeling
  - keyboard model
  - consumer responsibilities
  - known limitations
  - form-submission caveats where relevant
- [ ] Prioritize these categories first:
  - overlay
  - navigation
  - input
  - form
  - feedback where live regions are involved

Definition of done:

- every interactive component page has an accessibility section

## 6. Add Theme-Level Contrast And Focus Validation

The audit did not prove theme-wide AA contrast compliance. That needs explicit coverage.

Checklist:

- [ ] Create a theme contract for minimum contrast on:
  - body text
  - muted text
  - button text
  - form controls
  - focus indicators
  - selected states
  - disabled states where contrast still matters for discoverability
- [ ] Validate shipped themes:
  - `default`
  - `dark`
  - `aurora`
  - `midnight`
  - `terminal`
- [ ] Add automated checks for focus visibility and contrast on core controls.

Definition of done:

- shipped themes meet AA contrast requirements on core UI paths

## 7. Remove Or Explain Accessibility Suppressions

Current suppressions called out in the audit exist in:

- chart
- splitter
- scroll-area
- color-picker swatch
- transfer
- list
- flip-card
- data-grid

Checklist:

- [ ] Review every `svelte-ignore a11y` suppression in `packages/ui` and `packages/primitives`.
- [ ] For each one, do one of:
  - remove it by fixing semantics
  - keep it with a code comment explaining the valid custom pattern
  - replace the pattern entirely
- [ ] Track suppressions as explicit debt until the count trends toward zero.

Definition of done:

- no unexplained accessibility suppressions remain in shipped components

## Suggested Delivery Order

1. Test harness and CI gate
2. Menubar
3. Tree
4. Carousel
5. NotificationCenter
6. Transfer
7. RichTextEditor
8. Chart
9. ScrollArea and Alert cleanup
10. Docs/spec coverage expansion
11. Theme contrast validation
12. Suppression cleanup sweep

## Suggested Milestones

### Milestone 1: Stop The Known AA Blockers

- [ ] CI accessibility lane exists
- [ ] Menubar fixed
- [ ] Tree fixed
- [ ] Carousel invalid ARIA fixed

Ship criterion:

- core blockers removed

### Milestone 2: Normalize Composite Widget Semantics

- [ ] NotificationCenter fixed
- [ ] Transfer fixed
- [ ] RichTextEditor fixed
- [ ] Chart fallback model defined and implemented

Ship criterion:

- advanced widgets are no longer carrying known semantic contradictions

### Milestone 3: Make The Claim Credible

- [ ] docs/spec accessibility guidance expanded
- [ ] theme contrast checks added
- [ ] suppression sweep completed
- [ ] representative docs pages pass automated a11y checks in CI

Ship criterion:

- DryUI can credibly describe itself as targeting WCAG 2.2 AA for its core interactive surface

## Immediate Next PRs

If the goal is to start now with the highest leverage sequence, the first three PRs should be:

1. `a11y: add CI accessibility gate and representative widget audits`
2. `a11y: fix menubar naming and keyboard regression coverage`
3. `a11y: rebuild tree semantics to align with APG`

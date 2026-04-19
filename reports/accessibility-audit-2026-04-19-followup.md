# DryUI Accessibility Follow-up Audit

Date: 2026-04-19

Scope:

- post-remediation follow-up across the remaining component surface in `packages/ui`
- spot checks of mirrored `packages/primitives` implementations where the UI wrapper inherits the same semantics

Status update:

- later on 2026-04-19, every blocker identified in this follow-up was remediated on `main`
- the detailed findings below are preserved as a historical snapshot of what the audit found before the fixes landed
- see `Post-Remediation Verification` and `Bottom Line` for the current status

Related reports:

- [accessibility-audit-2026-04-18.md](./accessibility-audit-2026-04-18.md)
- [accessibility-remediation-plan-2026-04-19.md](./accessibility-remediation-plan-2026-04-19.md)

## Executive Summary

The April 18 blockers that were previously identified in `Menubar`, `Tree`, `Carousel`, `NotificationCenter`, `Transfer`, `RichTextEditor`, `Chart`, `ScrollArea`, and `Alert` were remediated in the last pass. The component library is in materially better shape than it was in the original audit.

However, I still would not make a blanket repository-wide WCAG 2.2 AA claim for the full component catalog yet.

The remaining problems are concentrated in a smaller set of advanced or composite widgets:

- `HoverCard`
- `CountrySelect`
- `DragAndDrop`
- `MegaMenu`
- `Accordion` / `Collapsible`

The overall picture now is:

- previously audited blockers: improved and regression-covered
- basic controls: generally in good shape from the sampled review
- remaining repo-wide AA blockers: a handful of composite widgets still drift from truthful ARIA semantics or expose unnecessary landmark noise
- repo-wide AAA: still not supportable

## Method

This follow-up audit used:

1. Static review of the remaining high-risk widgets in `packages/ui` and mirrored primitives.
2. Verification that the previously added accessibility browser suites are present and the UI build still passes.
3. Pattern searches for:
   - popup-type mismatches
   - overuse or misuse of `role="region"`
   - listbox/option semantics on non-listbox widgets
   - focus and keyboard behavior risks on composite controls

Notes:

- `bun run --filter '@dryui/ui' build` passed on 2026-04-19.
- The build output did not reveal new Svelte a11y compiler warnings, which reinforces the usual limitation: the remaining issues are mostly pattern-level and will not be caught by compile-time checks alone.

## Current Findings

### High

1. HoverCard still exposes inconsistent popup semantics, and keyboard reachability is fragile.

Evidence:

- `packages/ui/src/hover-card/hover-card-trigger.svelte:24-35`
- `packages/ui/src/hover-card/hover-card-content.svelte:43-56`
- `packages/primitives/src/hover-card/hover-card-trigger.svelte:24-34`
- `packages/primitives/src/hover-card/hover-card-content.svelte:36-47`

Problem:

- the trigger advertises `aria-haspopup="true"` and `aria-expanded`
- the UI wrapper content has no explicit popup role or relationship back to the trigger
- the primitive content uses `role="dialog"`, but the trigger closes on `blur`, which makes moving focus from the trigger into interactive hover-card content unreliable or impossible

Impact:

- screen readers are told to expect a popup-type interaction, but the semantics differ between the UI and primitive layers
- if consumers place interactive content inside the hover card, keyboard users can lose the popup before they can reach it

Assessment:

- this still blocks a confident AA-ready statement for `HoverCard`
- the component should either become a strictly non-interactive descriptive surface or implement one popup model consistently

### Medium

2. CountrySelect mixes searchable picker behavior with invalid listbox semantics.

Evidence:

- `packages/ui/src/country-select/country-select-button-input.svelte:218-257`

Problem:

- the trigger advertises `aria-haspopup="listbox"`
- the popup uses `role="listbox"`
- the popup then places a live search `<input>` inside that listbox
- each option is rendered with the shared `Button` component, meaning the underlying element is a real `<button>` that is reassigned to `role="option"`

Impact:

- the popup is not a clean listbox pattern
- screen readers and keyboard users get a hybrid control that does not match combobox or listbox expectations
- the use of button elements as listbox options is especially brittle

Assessment:

- this is a real semantics problem, not just a stylistic preference
- `CountrySelect` needs to become either:
  - a proper combobox/listbox pattern with `aria-activedescendant`, or
  - a searchable dialog/popover picker with plain buttons and no listbox role

3. DragAndDrop presents a reorderable collection as a listbox/options widget.

Evidence:

- `packages/ui/src/drag-and-drop/drag-and-drop-root.svelte:730-750`
- `packages/ui/src/drag-and-drop/drag-and-drop-item.svelte:64-80`
- `packages/ui/src/drag-and-drop/drag-and-drop-handle.svelte:33-43`

Problem:

- the root is `role="listbox"`
- each sortable item is `role="option"`
- the control is not a selection widget; it is a reorderable drag-and-drop surface
- the handle exposes `role="button"` plus `aria-pressed`, but only pointer handlers are attached there
- arrow keys reorder items directly from the item itself, which does not align cleanly with the listbox mental model being announced to assistive tech

Impact:

- assistive technology receives listbox semantics for a widget that is really a sortable collection
- users can be told they are navigating options when the actual behavior is moving items

Assessment:

- medium severity because the widget does provide announcements and a keyboard path
- still a blocker for calling this component AA-ready as implemented

4. MegaMenu trigger semantics still do not match the popup it opens.

Evidence:

- `packages/ui/src/mega-menu/mega-menu-button-trigger.svelte:36-46`
- `packages/ui/src/mega-menu/mega-menu-panel.svelte:80-99`
- mirrored primitives:
  - `packages/primitives/src/mega-menu/mega-menu-trigger.svelte`
  - `packages/primitives/src/mega-menu/mega-menu-panel.svelte`

Problem:

- the trigger uses `aria-haspopup="true"`
- the popup surface is a `role="region"` labelled by the trigger, not a menu

Impact:

- assistive tech is told to expect a popup/menu-type surface while the implementation exposes a labelled region
- this is the same kind of popup-type drift that previously existed in `NotificationCenter`

Assessment:

- medium severity
- the component should either:
  - expose truthful non-menu disclosure semantics, or
  - implement a real menu/menuitem pattern

### Low

5. Accordion and Collapsible still expose unnamed regions.

Evidence:

- `packages/ui/src/accordion/accordion-content.svelte:15-23`
- `packages/ui/src/collapsible/collapsible-content.svelte:22-30`

Problem:

- both content panels use `role="region"`
- neither panel sets `aria-labelledby` or another accessible name source

Impact:

- unnamed regions add low-value landmark noise
- this does not usually break the widget, but it weakens structural announcements for screen-reader users

Assessment:

- low severity
- the simplest fix is usually:
  - remove `role="region"` unless it is truly needed, or
  - wire `aria-labelledby` to the trigger when region semantics are intentionally kept

## What Looks Better Now

Compared to the April 18 audit, these areas no longer stand out as current blockers:

- `Menubar`
- `Tree`
- `Carousel`
- `NotificationCenter`
- `Transfer`
- `RichTextEditor`
- `Chart`
- `ScrollArea`
- `Alert`

I also did not find a new blocker in the sampled review of:

- `Select`
- `Combobox`
- `Tabs`
- `Dialog`
- `Drawer`
- `Toast`
- `NavigationMenu`

That is not the same as a formal certification. It means they did not surface a comparably strong pattern-level issue in this follow-up pass.

## Coverage Gap

The current dedicated a11y browser suites are focused on the components that were remediated in the previous pass:

- `a11y-menubar-notification.browser.test.ts`
- `a11y-tree.browser.test.ts`
- `a11y-carousel.browser.test.ts`
- `a11y-transfer-rte.browser.test.ts`
- `a11y-chart-scrollarea-alert.browser.test.ts`

The components called out in this follow-up report do not yet have comparable dedicated accessibility regression coverage:

- `HoverCard`
- `CountrySelect`
- `DragAndDrop`
- `MegaMenu`
- `Accordion` / `Collapsible`

## Recommended Next Actions

1. Fix `HoverCard` first.
   - Decide whether it is non-interactive descriptive content or a true popup surface.
   - Remove misleading popup attributes if it stays non-interactive.
   - If it stays interactive, make keyboard traversal into the content reliable and use one popup model consistently across UI and primitives.

2. Rebuild `CountrySelect` around a single picker pattern.
   - Do not keep the current `listbox` plus search-input plus button-option hybrid.

3. Rework `DragAndDrop` semantics.
   - Treat it as a sortable collection with instructions and live announcements rather than a listbox/options control.

4. Normalize `MegaMenu` popup semantics.
   - Make the trigger advertise the popup truthfully.

5. Remove or properly label `region` usage in `Accordion` and `Collapsible`.

6. Add browser-level a11y regression tests for all of the above before making a broader compliance claim.

## Post-Remediation Verification

The blockers listed in this report were fixed on `main` later on 2026-04-19 and re-verified with dedicated browser coverage.

Verification completed:

- `bunx vitest --browser --run tests/browser/a11y-*.browser.test.ts tests/browser/mega-menu.browser.test.ts`
- result: `10` files passed, `36` tests passed
- `bun run --filter '@dryui/primitives' build`
- `bun run --filter '@dryui/ui' build`

The remediated follow-up set now includes:

- `HoverCard`
- `CountrySelect`
- `DragAndDrop`
- `MegaMenu`
- `Accordion`
- `Collapsible`

The previously remediated set remains covered as well:

- `Menubar`
- `NotificationCenter`
- `Tree`
- `Carousel`
- `Transfer`
- `RichTextEditor`
- `Chart`
- `ScrollArea`
- `Alert`

## Bottom Line

The unresolved composite-widget issues identified in this follow-up have now been fixed on `main`.

Based on the audited component surface and the verification run above, DryUI can now be described as:

- credibly WCAG 2.2 AA-ready across the audited interactive component surface on the current `main` branch
- regression-covered for the remediated widget set listed above
- still not making a blanket AAA claim
- still not a formal third-party certification or a guarantee for every docs page, theme variant, or consumer integration

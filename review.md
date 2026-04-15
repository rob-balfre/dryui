# Hammerfall DryUI Review

Date: 2026-04-15

## Scope

This review covers the DryUI-based Hammerfall rebuild in `hammerfall-dryui`.

- 22 route files
- 12 view components in `src/lib/views`
- 9 reusable Hammerfall components in `src/lib/components/hammerfall`
- 23 `@dryui/ui` import sites
- Bun-based SvelteKit project with `@dryui/ui`, `@dryui/cli`, and `@dryui/lint`

Current validation status:

- `dryui detect` reports the project as ready
- `bun run lint` is clean
- `bun run check` is clean
- `dryui doctor` reports 2 theme warnings and 0 errors

## Overall Assessment

DryUI was good enough to build the full Hammerfall view layer and keep the codebase structurally consistent. It works well as a disciplined primitive layer for cards, forms, badges, buttons, containers, breadcrumbs, and layout shells.

The main limitation is not capability in the abstract. The main limitation is migration ergonomics. DryUI is strongest when the product is allowed to look like DryUI. It is much harder when the goal is visual parity with an existing enterprise product that has older spacing, iconography, color treatment, and layout expectations.

Short version:

- Good for greenfield or design-system-led work
- Good for enforcing consistency in a Svelte 5 codebase
- Harder than it should be for pixel-parity migration work
- Tooling is useful, but some rules are stricter or less consistent than the real implementation path needs

## What Worked Well

### 1. Project setup is straightforward

The Bun + SvelteKit + DryUI setup is simple once the right pieces are in place:

- `@dryui/ui`
- theme CSS imports
- `@dryui/lint`
- preprocessor integration in `svelte.config.js`

This was easy to verify and easy to keep running once configured.

### 2. DryUI primitives scaled across many views

A relatively small set of primitives handled most of the UI:

- `Card`
- `Button`
- `Field`
- `Input`
- `Select`
- `Badge`
- `Breadcrumb`
- `Container`
- `Heading`
- `Text`
- `Separator`
- `Textarea`

This was enough to cover the majority of the Hammerfall view rebuild without needing a second UI library.

Representative files where this worked well:

- `src/lib/views/SearchResultsView.svelte`
- `src/lib/views/ItinerarySummaryView.svelte`
- `src/lib/components/hammerfall/ResultCard.svelte`
- `src/lib/components/hammerfall/CartPanel.svelte`

### 3. The structural discipline is valuable

The strictness helps once the team accepts it:

- compound components stay consistent
- form fields are more likely to stay accessible
- the code reads predictably across routes
- design tokens create a central place for system-level overrides

This helped avoid the usual migration drift where each screen ends up using a different local pattern.

### 4. The lint and review tools are genuinely useful

DryUI's tooling caught real issues during the project:

- invalid props
- missing required structure
- bad patterns introduced while translating legacy UI

That part is valuable. The project ended in a clean state because the tooling was strict enough to force cleanup.

## Where DryUI Fought the Work

### 1. Visual parity with an existing product required a lot of custom CSS anyway

The Hammerfall rebuild still needed a large amount of branded CSS in `src/app.css` and several custom layout classes:

- legacy background treatments
- brand-specific colors
- panel chrome
- shell spacing
- route-specific layout behavior
- public vs internal themes

This is not a failure, but it shows the real role DryUI played here:

- DryUI provided stable primitives
- custom CSS did most of the parity work

That means DryUI is not yet a full migration accelerator for legacy products. It is more of a strict UI foundation that still expects substantial bespoke styling around it.

### 2. The rules around layout and styling are sometimes too rigid for migration work

The biggest friction came from strict style rules such as:

- `no-width`
- `no-global`
- strong bias toward grid-only layout patterns

Those rules make sense as defaults, but they become painful when integrating third-party icons or matching an older UI exactly.

Real example from this project:

- Lucide icons were introduced to replace local SVG UI icons
- wrapper-based sizing initially caused DryUI preprocessor failures because of `:global(svg)` and width-based icon sizing
- the fix was to move icon sizing into Lucide `size={...}` props and keep wrappers extremely minimal

That worked, but it took avoidable iteration.

DryUI needs a documented and supported story for:

- third-party SVG icon components
- icon-only buttons
- inline decorative icons
- layout wrappers used only for parity work

### 3. Dynamic components can trigger false positives

In `PublicSectorCard.svelte`, a dynamic icon component like `<Icon />` caused DryUI lint to treat it as if it were a DryUI component with the wrong API:

- invalid prop errors
- missing required prop errors

The practical fix was to remove the dynamic component and expand it into explicit `if/else` branches for each icon.

That is a bad tradeoff. The linter should be able to distinguish:

- DryUI components imported from `@dryui/ui`
- regular Svelte components
- dynamic components that are clearly not DryUI compounds

### 4. CLI lint and preprocessor behavior do not feel fully aligned

During the icon migration, there was a period where:

- `dryui lint` passed
- `svelte-check` failed because the DryUI preprocessor rejected the same styling pattern

That is one of the most important pieces of feedback from this project.

If the preprocessor is stricter than the standalone lint command, the team gets a confusing development loop:

1. lint says the code is acceptable
2. typecheck/preprocess says it is not
3. the developer has to reverse-engineer which tool is authoritative

DryUI should have one clear source of truth for rule enforcement, or at minimum much clearer messaging about where the rule boundary changes.

### 5. Theme diagnostics appear to use a weak contrast heuristic

`dryui doctor` and `dryui diagnose` report low contrast warnings for the main Hammerfall text tokens in `src/app.css`.

The warnings are:

- `--dry-color-text-strong` on `--dry-color-bg-base`
- `--dry-color-text-weak` on `--dry-color-bg-base`

Actual WCAG contrast ratios for those pairs are:

- `#2d3840` on `#f4f5f7` = `10.99`
- `#64707a` on `#f4f5f7` = `4.65`

Those are not low-contrast failures in the way the current warning wording suggests.

This matters because false positives reduce trust in the theme doctor. If a tool claims clearly acceptable colors are risky, teams will start ignoring the warnings entirely.

### 6. Guidance and practical reality are not fully aligned

The DryUI guidance strongly pushes:

- token-only styling
- grid-only layout
- minimal custom CSS

The real Hammerfall implementation that passes validation still uses:

- extensive branded CSS
- some flex utilities in `src/app.css`
- many direct color values for parity
- a hybrid approach where DryUI primitives sit inside a custom visual system

That mismatch is important feedback. The product and docs should acknowledge two valid adoption modes:

- design-system-first greenfield usage
- legacy migration / parity usage

Right now the guidance feels optimized for the first case while the real project pressure was the second.

## Evidence from the Project

### Strong DryUI fit

These files show DryUI working well as a clean primitive layer:

- `src/lib/views/SearchResultsView.svelte`
- `src/lib/views/ItinerarySummaryView.svelte`
- `src/lib/components/hammerfall/ResultCard.svelte`
- `src/lib/components/hammerfall/CartPanel.svelte`

These are good examples of:

- compound component usage
- structured content shells
- low-friction composition
- readable Svelte 5 markup

### High-friction parity work

These files show where the migration required more negotiation with the rules:

- `src/lib/views/NewBookingView.svelte`
- `src/lib/views/ManageBookingsView.svelte`
- `src/lib/views/LoginView.svelte`
- `src/lib/components/hammerfall/HammerHeader.svelte`
- `src/lib/components/hammerfall/PublicSectorCard.svelte`
- `src/app.css`

This is where most of the project friction appeared:

- legacy shell recreation
- pixel-parity spacing
- branded headers
- public/private theme split
- icon interoperability
- route-specific visual language

## Concrete Feedback for DryUI

### 1. Add an official "legacy migration" mode to the docs

DryUI needs a first-class guide for teams translating an existing product rather than building a new one.

That guide should cover:

- how strict to be with tokens during migration
- when custom CSS is acceptable
- how to recreate legacy spacing and shell chrome without fighting the linter
- how to introduce DryUI incrementally

### 2. Document an official icon strategy

DryUI should explicitly document the recommended approach for:

- Lucide
- icon-only buttons
- nav icons
- decorative icons inside form and card layouts
- size and color control patterns that pass lint and preprocess cleanly

This would have saved time immediately.

### 3. Fix lint and preprocessor parity

This is likely the single highest-value tooling improvement.

`dryui lint`, `dryui doctor`, and the `dryuiLint()` preprocessor should agree on rule outcomes for the same code.

If exact parity is not possible, the tooling must explain:

- which rules are only enforced in preprocess
- which rules are advisory in CLI mode
- which tool should block CI

### 4. Improve dynamic component detection

The linter should not treat every capitalized component as a DryUI component.

It should understand:

- imported source module
- dynamic component patterns
- non-DryUI Svelte components

False positives in this area force uglier code for no product benefit.

### 5. Replace the current contrast heuristic with WCAG or APCA

The current brightness-difference approach appears too coarse.

Use a real contrast model and report:

- measured ratio
- target threshold
- whether the failure applies to body text, large text, or UI chrome

That would make the output trustworthy and actionable.

### 6. Provide a sanctioned escape hatch for strict rules

Some rules should remain strict, but there should be a documented path for exceptions in parity-heavy work.

Examples:

- scoped per-file rule disable
- scoped per-selector disable
- "migration mode" config
- a small set of explicitly supported exceptions for icon wrappers and interop cases

Without this, teams either contort the code or silently work around the system.

## Internal Recommendations for Hammerfall

These are project-side improvements, separate from upstream DryUI feedback.

### 1. Reduce the amount of one-off shell CSS in `src/app.css`

The theme file is doing too many jobs:

- DryUI token overrides
- Hammerfall brand system
- shared utility classes
- route-level shell behavior

This should be split over time so the boundary between system tokens and app-level styling is clearer.

### 2. Consolidate repeated enterprise patterns into local components

Examples:

- header + panel shells
- status banners
- filter panels
- route-specific section headers

DryUI gives the primitives, but Hammerfall still needs a stronger local component layer so parity logic does not stay duplicated across views.

### 3. Keep Lucide as the UI icon standard

That decision is now the right one for the DryUI project:

- cleaner than carrying legacy SVG icon imports
- easier to size consistently
- easier to audit
- easier to theme

Brand marks and illustrations should remain custom assets.

### 4. Revisit token naming and token boundaries

The project currently mixes:

- `--dry-*` semantic tokens
- `--hf-*` app tokens
- direct color values

That is understandable during migration, but it should be tightened if the DryUI build is going to live long-term.

## Final Verdict

DryUI succeeded as the foundation for a full Svelte rebuild of Hammerfall's view layer. That is a meaningful positive result.

The main lesson is that DryUI is strongest as a disciplined primitive system, not yet as a frictionless migration framework for visually exact enterprise rewrites.

If DryUI improves:

- lint/preprocessor parity
- icon interoperability guidance
- dynamic component detection
- contrast diagnostics
- migration-focused documentation

then it becomes materially easier to recommend for large parity-driven rewrites like this one.

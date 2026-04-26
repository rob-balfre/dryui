# HeroUI Theme Builder Audit For DryUI

## Scope

Reference page: <https://heroui.com/themes?lightness=0.7712331152153334&chroma=0.11949973822037381&hue=281.6396234331059>

DryUI surfaces inspected:

- `apps/docs/src/routes/theme-wizard/+page.svelte`
- `apps/docs/src/lib/theme-wizard/PreviewComponents.svelte`
- `packages/theme-wizard/src/components/WizardShell.svelte`
- `packages/theme-wizard/src/components/HsbPicker.svelte`
- `apps/docs/src/routes/+layout.svelte`
- `packages/ui/skills/dryui/rules/theming.md`
- `ACCESSIBILITY.md`

Screenshots captured during the audit:

- Desktop reference: `reports/assets/heroui-themes-1440-clean.png`
- Mobile reference: `reports/assets/heroui-themes-mobile.png`

This audit is about interaction model, layout density, visual hierarchy, and implementation priorities. It is not a recommendation to copy HeroUI CSS, naming, or component internals.

## Executive Summary

HeroUI feels tighter because it is designed as an editor. DryUI's current theme wizard is still structured like a docs page: large title, explanatory copy, menu toolbar, separate action row, then the preview. That creates vertical ceremony before the user reaches the thing they came to manipulate.

The strongest improvement for DryUI is to convert `/theme-wizard` into a full-height workbench:

- compact top bar
- framed preview canvas visible immediately
- persistent primary controls in a bottom or side rail
- advanced controls in popovers or drawers
- preview modes that show real product scenes

Before polish work, the current route also needs contract and hydration cleanup. `dryui check` reports blockers in the wizard and preview files, and Chrome inspection of the local route showed a hydration warning that replaced the intended wizard with unrelated component API content.

## What HeroUI Is Doing Better

### Measured Desktop Structure

Measured in Chrome at `1440 x 1000`.

| Area                   |                       HeroUI measurement | Why it helps                                                           |
| ---------------------- | ---------------------------------------: | ---------------------------------------------------------------------- |
| Page side padding      |                                   `24px` | Keeps the app surface close to viewport edges without feeling cramped. |
| Top nav                |                              `56px` high | Navigation is present but does not compete with the work surface.      |
| Preview shell          |           `1392 x 816`, starts at `y=72` | The first viewport is mostly preview.                                  |
| Outer shell radius     |                                   `24px` | Gives the preview a clear app-frame affordance.                        |
| Inner preview viewport |        about `1376 x 770`, radius `16px` | Creates hierarchy without nested cards.                                |
| Preview canvas padding | about `32px` vertical, `16px` horizontal | Leaves room for components without wasting the frame.                  |
| Component grid         |                      about `1020px` wide | The preview composition is intentionally narrower than the frame.      |
| Grid columns           |                  about `256 / 360 / 340` | Unequal columns feel composed rather than generic.                     |
| Component grid gap     |                                   `32px` | Dense but scannable.                                                   |
| Bottom controls        |                       about `1072 x 112` | Primary controls stay near the preview.                                |
| Control modules        |                     usually `160px` wide | Every setting has a predictable footprint.                             |
| Labels                 |        about `14px / 20px`, weight `500` | Product-scale type, not hero-scale type.                               |
| Inputs/selects         |               `36px` high, `12px` radius | Dense, familiar controls.                                              |
| Sliders                |                         about `160 x 24` | Compact direct manipulation.                                           |
| Buttons                |                    `32px` or `36px` high | Strong density without feeling tiny.                                   |

### Measured Mobile Structure

Measured at `390 x 844`.

| Area            | HeroUI behavior                     | Why it helps                                     |
| --------------- | ----------------------------------- | ------------------------------------------------ |
| Preview shell   | about `358 x 696`                   | The preview remains the dominant object.         |
| Bottom rail     | about `69px` high                   | Controls do not push the preview down.           |
| Theme selector  | about `286 x 40`                    | Primary choice remains large enough to touch.    |
| Icon action     | `40 x 40`                           | Common action stays accessible without labels.   |
| Preview content | vertically scrolls inside the frame | Mobile is still a tool, not a stacked docs page. |

### Design Patterns Worth Borrowing

HeroUI uses a tool-first frame. The page has no large heading block above the work. Brand, undo, redo, preview tabs, theme toggle, share, and code actions live in a light top bar. The preview consumes the first viewport.

HeroUI keeps primary controls persistent. Accent, base/neutral, font, radius, radius form, and theme are always visible in the desktop bottom rail. This is faster than opening a menu for every adjustment.

HeroUI normalizes control rhythm. A module is usually label plus control, `4px` label-control gap, `16px` module gap, `160px` width, and `36px` control height. Repetition creates polish because the user can predict every control's shape.

HeroUI's preview is one cohesive app canvas. The outer shell and inner viewport provide enough framing. The preview content itself does not need a page title, doc container, or extra section wrapper.

HeroUI's preview has dense, varied states. It shows form fields, select, checkbox, switch, radio, slider, tabs, listbox, avatars, OTP, buttons, profile card, billing alert, account dialog, gallery cards, and an unsaved changes dialog. This makes the theme feel real quickly.

HeroUI uses product-scale type. Most labels and card titles sit around `14px`. The wizard never uses marketing-scale type inside the work surface.

HeroUI's mobile version remains an editor. The preview still comes first, and the controls collapse into a fixed bottom rail instead of a long stack above the preview.

## Current DryUI Gaps

### 1. The Wizard Still Reads As A Docs Page

Current code:

- `apps/docs/src/routes/theme-wizard/+page.svelte:316` starts a standalone `.wizard-page`.
- `apps/docs/src/routes/theme-wizard/+page.svelte:317` wraps the header in `Container size="xl"`.
- `apps/docs/src/routes/theme-wizard/+page.svelte:318` renders a centered header.
- `apps/docs/src/routes/theme-wizard/+page.svelte:320` renders the large `Theme Wizard` heading.
- `apps/docs/src/routes/theme-wizard/+page.svelte:323` renders explanatory copy.
- `apps/docs/src/routes/theme-wizard/+page.svelte:328` renders controls in a separate `Container size="md"`.
- `apps/docs/src/routes/theme-wizard/+page.svelte:612` renders reset/export actions as a second row.
- `apps/docs/src/routes/theme-wizard/+page.svelte:640` only then starts the preview band.

This is a good documentation composition, but it is not the best product-tool composition. The preview arrives after too much preamble.

Recommended direction: move the title into a compact top bar, put preview tabs in that bar, and make the preview frame the first visual object.

### 2. Controls Are Compact But Too Hidden

Current code:

- The primary controls are all behind `MegaMenu` triggers at `apps/docs/src/routes/theme-wizard/+page.svelte:341`.
- Trigger labels are visually hidden until the container reaches `52rem` at `apps/docs/src/routes/theme-wizard/+page.svelte:732`.
- Export actions are not integrated with the control surface at `apps/docs/src/routes/theme-wizard/+page.svelte:612`.

The toolbar is visually compact, but each adjustment requires an open-close interaction. HeroUI makes the highest-frequency theme knobs visible at all times.

Recommended direction: keep primary knobs persistent:

- accent color
- neutral/base tint
- font family
- radius
- density or radius form
- light/dark/custom theme mode

Keep presets, full color picker, contrast details, filters, and export CSS in popovers, drawers, or a command/menu area.

### 3. Preview Composition Is Broad, But Not Diagnostic Enough

Current code:

- `apps/docs/src/lib/theme-wizard/PreviewComponents.svelte:143` starts the preview.
- `apps/docs/src/lib/theme-wizard/PreviewComponents.svelte:513` uses `repeat(3, minmax(0, 1fr))`.
- `apps/docs/src/lib/theme-wizard/PreviewComponents.svelte:520` spans the left pair across two columns.

The preview demonstrates many DryUI components, but the scene mixes payments, AI chat, compute configuration, sortable modules, search, URL fields, and security settings in one long waterfall. Breadth is useful, but it is harder to compare theme quality.

Recommended direction: introduce preview tabs or segmented modes:

- `Components`: a dense state matrix for primitives and states.
- `Dashboard`: table, metric row, filters, chart/list, empty and loading states.
- `Forms`: inputs, selects, validation, checkboxes, radio, field help, disabled states.
- `Cards`: profile, billing, dialog, toast, hover or selected states.
- `Agent UI`: prompt, rich text, command surface, feedback states.

Each mode should fit a defined viewport and be tuned for density, not just component coverage.

### 4. Equal Columns Feel More Generic Than Composed Columns

HeroUI uses an intentionally uneven desktop preview rhythm around `256 / 360 / 340`. DryUI currently uses a generic 3-column grid.

Recommended direction:

```css
.preview-mosaic {
	grid-template-columns: minmax(14rem, 16rem) minmax(20rem, 24rem) minmax(18rem, 22rem);
	gap: var(--dry-space-4);
	justify-content: center;
}
```

This is not final code, but it captures the idea: align to product-like modules with fixed, readable widths. Let the frame be large, but keep the content composition intentionally sized.

### 5. Product Typography Should Be Tighter

Current code:

- `apps/docs/src/routes/theme-wizard/+page.svelte:693` uses `font-size: clamp(2rem, 4vw, 2.75rem)`.
- `apps/docs/src/routes/theme-wizard/+page.svelte:695` uses negative letter spacing.
- `packages/theme-wizard/src/components/WizardShell.svelte:123` also uses fluid heading type.

For a product tool, use fixed rem scale and smaller headings. HeroUI's page works because the controls and preview own the hierarchy.

Recommended direction:

- top bar title: `0.875rem` or `1rem`, weight `650`
- tab labels: `0.875rem`, weight `500`
- control labels: `0.8125rem` or `0.875rem`, weight `500`
- preview card titles: `0.875rem` or `1rem`
- avoid negative letter spacing in the tool surface

### 6. Some Preview Styling Adds Noise Instead Of Testing Tokens

Current examples:

- `apps/docs/src/lib/theme-wizard/PreviewComponents.svelte:432` nests cards inside a card for compute environment choices.
- `apps/docs/src/lib/theme-wizard/PreviewComponents.svelte:594` uses a decorative gradient on activity pills.
- `apps/docs/src/lib/theme-wizard/PreviewComponents.svelte:599` adds glow-like shadow treatment.
- `apps/docs/src/routes/theme-wizard/+page.svelte:858` hardcodes `white`.
- `apps/docs/src/routes/theme-wizard/+page.svelte:859` hardcodes `rgba(0, 0, 0, 0.3)`.
- `apps/docs/src/routes/theme-wizard/+page.svelte:909` has a hardcoded fallback hex color.

The preview should mostly test tokens, state, density, and component affordance. Decorative gradients and glows can make the preview look busier while teaching less about the theme.

Recommended direction:

- replace nested cards with rows, list items, segmented controls, or unframed selected items
- avoid decorative glow unless testing a glow component
- prefer `--dry-*` tokens and color-mix over raw `white`, `rgba`, or fallback hex values
- keep visual effects isolated to explicit component demos, not the core theme preview

### 7. Mobile Should Collapse Into A Tool Rail, Not A Long Stack

HeroUI's mobile version keeps the preview first and uses a bottom control rail. DryUI's current route structure puts title, description, toolbar, and action row before preview, which is likely to feel especially expensive on mobile.

Recommended direction:

- preserve the preview frame as the main object
- bottom rail contains active theme selector and one action button
- advanced controls open as a bottom sheet or drawer
- preview tabs become a horizontally scrollable segmented control
- export/copy actions move into a menu

## Current Quality Blockers

These are not purely aesthetic. They should be treated as P0 or P1 work before deeper polish.

### DryUI Checker Findings

Command used through MCP: `dryui check`.

`apps/docs/src/routes/theme-wizard/+page.svelte`:

- `line 347`: `<MegaMenu.Panel>` does not accept `align`.
- `line 385`: `<MegaMenu.Panel>` does not accept `align`.
- `line 429`: `<MegaMenu.Panel>` does not accept `align`.
- `line 476`: `<MegaMenu.Panel>` does not accept `align`.
- `line 529`: `<MegaMenu.Panel>` does not accept `align`.
- `line 576`: `<MegaMenu.Panel>` does not accept `align`.
- `line 642`: `TokenScope` is flagged as an unknown DryUI component. This may mean the checker needs to learn the export, or the import pattern should change.

`apps/docs/src/lib/theme-wizard/PreviewComponents.svelte`:

- `line 336`: `<DragAndDrop.Group>` does not accept `onMove`.
- `line 351`: `<DragAndDrop.Root>` does not accept `listId`.
- `line 359`: `<DragAndDrop.Item>` is missing required `index`.
- `line 360`: `<DragAndDrop.Handle>` is missing required `index`.
- `line 418`: `<RichTextEditor.Toolbar>` is missing required `children`.

`packages/theme-wizard/src/components/HsbPicker.svelte`:

- `line 236`: hex `Input` may be missing an accessible label.

### Browser Hydration Finding

Local route inspected: `http://localhost:5200/theme-wizard`.

The server HTML contains the intended Theme Wizard markup, but Chrome logged:

```text
Failed to hydrate: TypeError: element.getAttribute is not a function
```

The stack points through `container.svelte`, `+page.svelte`, `+layout.svelte`, and `root.svelte`. After hydration, the browser showed unrelated component API content beginning with `Styled quick start` instead of the wizard.

This should be reproduced independently before visual refactoring. A polished workbench is not useful if the live route can hydrate into the wrong surface.

## Proposed North Star Layout

### Desktop

```text
+------------------------------------------------------------------------------+
| logo / Theme Wizard   undo redo   Components Dashboard Forms ...   actions    |
+------------------------------------------------------------------------------+
|                                                                              |
|  app-frame                                                                    |
|  +------------------------------------------------------------------------+  |
|  | preview viewport                                                        |  |
|  | dense, realistic product scenes with mode tabs                          |  |
|  | independent scroll area                                                  |  |
|  +------------------------------------------------------------------------+  |
|                                                                              |
+------------------------------------------------------------------------------+
| Accent     Base     Font family     Radius     Density     Theme     Export   |
+------------------------------------------------------------------------------+
```

Key constraints:

- top bar: about `56px`
- page padding: `16px` to `24px`
- preview shell: fills remaining height
- bottom rail: about `88px` to `112px`
- primary control modules: about `160px` wide
- control height: `36px` to `40px`
- preview content max width: about `1020px` to `1120px`
- preview uses fixed, composed columns, not generic equal columns

### Mobile

```text
+--------------------------------------+
| logo        Theme Wizard      actions |
+--------------------------------------+
| preview frame                         |
| scrollable product scene              |
|                                      |
+--------------------------------------+
| [Custom theme selector          v] [shuffle] |
+--------------------------------------+
```

Key constraints:

- preview remains first
- bottom rail remains fixed
- one visible selector plus one primary icon action
- advanced controls open in a bottom sheet
- no text clipping in controls

## Implementation Plan

### P0: Make The Existing Wizard Trustworthy

Target files:

- `apps/docs/src/routes/theme-wizard/+page.svelte`
- `apps/docs/src/lib/theme-wizard/PreviewComponents.svelte`
- `packages/theme-wizard/src/components/HsbPicker.svelte`

Work:

- Resolve invalid `MegaMenu.Panel align` usage.
- Decide whether `TokenScope` checker support is missing or the route import should change.
- Align drag/drop and rich-text preview markup with current DryUI component contracts.
- Add an accessible label to the hex input in `HsbPicker.svelte`.
- Reproduce and fix the hydration warning that swaps the visible route content.

Acceptance:

- `dryui check apps/docs/src/routes/theme-wizard/+page.svelte` has no blockers.
- `dryui check apps/docs/src/lib/theme-wizard/PreviewComponents.svelte` has no blockers.
- `dryui check packages/theme-wizard/src/components/HsbPicker.svelte` has no blockers.
- Browser console has no hydration warning on `http://localhost:5200/theme-wizard`.

### P1: Convert The Page Into A Workbench

Target files:

- `apps/docs/src/routes/theme-wizard/+page.svelte`
- potentially a new local component under `apps/docs/src/lib/theme-wizard/`

Work:

- Replace the centered docs-style header with a compact workbench bar.
- Move reset/copy/download into the top bar or bottom control rail.
- Create a full-height grid: top bar, preview frame, control rail.
- Keep preview visible in the first viewport at `1440 x 900`.
- Use a stable app-frame surface with one outer shell and one inner viewport.

Acceptance:

- At `1440 x 900`, preview, preview tabs, and primary controls are visible without scrolling.
- At `1024 x 768`, preview remains visible and controls do not wrap into a tall stack.
- At `390 x 844`, preview remains first and controls collapse into a bottom rail.

### P2: Make Primary Controls Persistent

Target files:

- `apps/docs/src/routes/theme-wizard/+page.svelte`
- optional local control components under `apps/docs/src/lib/theme-wizard/`

Work:

- Promote accent, base/neutral, font, radius, density/radius form, and theme mode into always-visible controls.
- Keep presets, full color picker, contrast, filters, and advanced export controls behind menus.
- Normalize control widths and heights.
- Add immediate visual feedback: swatches, current values, and selected state.

Acceptance:

- Changing the main theme values requires no menu open on desktop.
- Each persistent control has a consistent label/value/control rhythm.
- Keyboard focus order follows the visual order of the rail.

### P3: Rebuild Preview Modes Around Diagnostic Scenes

Target files:

- `apps/docs/src/lib/theme-wizard/PreviewComponents.svelte`
- possible split files under `apps/docs/src/lib/theme-wizard/previews/`

Work:

- Split the preview into tabs or modes.
- Use fewer, more purposeful modules per mode.
- Replace nested-card composition with rows, panels, grouped controls, dialogs, and app sections.
- Add explicit states: default, hoverable, selected, disabled, loading, error, warning, success, focus.
- Keep copy terse. Components should demonstrate the theme without explanatory prose.

Acceptance:

- Every mode fits its intended viewport without accidental clipping.
- Each mode tests a different theme risk: forms, navigation, cards, data density, overlays, status colors.
- The preview can be visually compared in light and dark.

### P4: Consolidate Public Wizard Components

Target files:

- `packages/theme-wizard/src/components/WizardShell.svelte`
- `packages/theme-wizard/src/steps/*`
- `packages/theme-wizard/src/index.ts`
- `apps/docs/src/routes/theme-wizard/+page.svelte`

Work:

- Decide whether the exported multi-step shell is still canonical.
- If yes, evolve it toward the workbench model or clearly separate it as a CLI/onboarding wizard.
- If no, retire or de-emphasize the old shell before it drifts further from the docs route.

Acceptance:

- There is one documented layout model for the theme wizard.
- The docs route and package exports no longer imply two unrelated wizard experiences.

## Design Rules For The Redesign

- Product register: design serves the task. Avoid landing-page hero composition.
- Use `--dry-*` tokens and scoped overrides, not copied HeroUI CSS.
- Use fixed product type sizes, not fluid heading scale.
- Keep accent color meaningful: primary actions, selected state, focus, and semantic feedback.
- Do not nest cards inside cards.
- Keep cards for actual bounded modules, not for every grouping.
- Use compact, familiar controls: segmented controls, sliders, selects, swatches, icon buttons with labels or tooltips.
- Preserve accessibility contracts from `ACCESSIBILITY.md`.
- If changing `.svelte` files, follow the repo Svelte MCP requirement before finalizing code changes.

## Verification Plan

For implementation work, use these gates:

```bash
dryui check apps/docs/src/routes/theme-wizard/+page.svelte
dryui check apps/docs/src/lib/theme-wizard/PreviewComponents.svelte
dryui check packages/theme-wizard/src/components/HsbPicker.svelte
bun run docs:check
bun run build:docs
bun run test:docs-visual
```

If `.svelte` files are edited, also run the Svelte MCP autofixer on changed Svelte code and repeat until it reports no actionable issues.

Visual QA should include:

- `1440 x 900` desktop
- `1024 x 768` tablet/small laptop
- `390 x 844` mobile
- light theme
- dark theme
- one high-chroma accent
- one muted low-chroma accent
- keyboard focus through top bar, preview tabs, and control rail

## Definition Of Done

The redesigned DryUI theme wizard should meet these concrete outcomes:

- The first viewport reads as a working editor, not a docs landing section.
- Preview and primary controls are visible together on desktop.
- Mobile keeps the preview first and controls in a compact bottom rail or sheet.
- Primary theme changes require fewer clicks than the current MegaMenu-first flow.
- The preview shows realistic, dense product states across multiple modes.
- Contract checks pass with no DryUI blockers.
- Browser console has no hydration warnings on the route.
- Visual screenshots show no text clipping, incoherent overlap, or accidental nested-card weight.

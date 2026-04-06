# Theme Wizard — Dogfooding Gap Analysis

The theme wizard is one of the most visually compelling pages in the DryUI docs. Its immersive full-page color experience, real-time palette derivation, image-to-palette extraction, and WCAG contrast checking are excellent — and the design should be preserved. But it was built with extensive custom CSS and hand-rolled components instead of DryUI's own library. This document maps every gap between what the wizard does custom and what DryUI offers, so we can systematically close those gaps — improving the framework while we dogfood it.

---

## Scope

**Files analysed:**

- `apps/docs/src/routes/theme-wizard/+page@.svelte` — landing page (most custom CSS)
- `apps/docs/src/lib/theme-wizard/components/HsbPicker.svelte` — custom HSB canvas picker
- `apps/docs/src/lib/theme-wizard/components/AlphaSlider.svelte` — custom standalone alpha slider
- `apps/docs/src/lib/theme-wizard/components/ContrastBadge.svelte` — WCAG contrast badge
- `apps/docs/src/lib/theme-wizard/components/TokenPreview.svelte` — token swatch + name display
- `apps/docs/src/lib/theme-wizard/components/StepIndicator.svelte` — wizard stepper (already uses DryUI Stepper)
- `apps/docs/src/lib/theme-wizard/steps/BrandColor.svelte`
- `apps/docs/src/lib/theme-wizard/steps/NeutralPalette.svelte`
- `apps/docs/src/lib/theme-wizard/steps/Backgrounds.svelte`
- `apps/docs/src/lib/theme-wizard/steps/StatusColors.svelte`
- `apps/docs/src/lib/theme-wizard/steps/Shadows.svelte`
- `apps/docs/src/lib/theme-wizard/steps/PreviewExport.svelte`

**What the step components already do well:** BrandColor, NeutralPalette, StatusColors, Shadows, and PreviewExport already use `Card`, `Grid`, `Stack`, `Flex`, `Slider`, `Button`, `Badge`, `SegmentedControl`, and `Stepper` from DryUI. The gaps are concentrated in the landing page and the custom picker components.

---

## Category A: Use What Exists

DryUI components that already exist and should replace custom code. No framework changes needed — just swap in the component.

### A1. Raw `<dialog>` → Dialog

**What the wizard does:** The color creation modal uses a raw `<dialog class="create-dialog">` with 30+ lines of custom CSS (dark background, backdrop, border-radius, padding, click-to-close).

**DryUI has:** `Dialog.Root > Dialog.Content` with built-in backdrop, focus trap, close-on-click-outside, and theme-aware styling.

**Files:** `+page@.svelte`
**Effort:** S

---

### A2. Raw `<button class="preset-card">` → Button or Card

**What the wizard does:** Preset palette cards are raw `<button>` elements with `appearance: none`, custom hover opacity, and flex column layout (~30 lines of CSS for `.preset-card`, `.preset-strip`, `.preset-swatch`, `.preset-label`).

**DryUI has:** `Button` (ghost variant) for clickable actions, or `Card.Root` with `as="button"` for richer card-style buttons.

**Files:** `+page@.svelte`
**Effort:** S

---

### A3. Raw `<label>` + `<span>` → Field.Root + Label

**What the wizard does:** `HsbPicker.svelte` uses `<label class="input-group">` + `<span class="input-label">` with custom CSS (flex column, 10px uppercase, letter-spacing) to label the H/S/B number inputs.

**DryUI has:** `Field.Root > Label + NumberInput` — the standard form field pattern with consistent styling.

**Files:** `HsbPicker.svelte`
**Effort:** S

---

### A4. Toggle + raw spans → SegmentedControl

**What the wizard does:** The light/dark mode switch uses a `Toggle` flanked by two raw `<span class="mode-label">` elements with custom opacity toggling (~20 lines of CSS).

**DryUI has:** `SegmentedControl.Root > SegmentedControl.Item` — a two-option toggle with built-in active state styling.

**Files:** `+page@.svelte`
**Effort:** S

---

### A5. Raw `<button class="image-close">` → Button

**What the wizard does:** The image close button is a raw `<button>` styled as a 24px circle with absolute positioning, custom background, hover transition (~20 lines of CSS).

**DryUI has:** `Button` with `variant="ghost"`, `size="sm"`, and an icon child. Positioning would still be custom but the button itself doesn't need to be.

**Files:** `+page@.svelte`
**Effort:** XS

---

### A6. Raw `<input type="color">` → ColorPicker

**What the wizard does:** `Backgrounds.svelte` uses three native `<input type="color">` elements with custom CSS for the base/raised/overlay background color controls. The landing page also uses one in the dialog.

**DryUI has:** `ColorPicker.Root` with `ColorPicker.Area + HueSlider + Input + Swatch` — a full-featured color picker. For inline use, `ColorPicker.Swatch` can be made interactive.

**Files:** `Backgrounds.svelte`, `+page@.svelte`
**Effort:** S

---

### A7. Hardcoded spacing → `--dry-space-*` tokens

**What the wizard does:** All spacing is hardcoded pixel values: `gap: 80px`, `padding: 48px 24px`, `gap: 32px`, `gap: 8px`, `gap: 24px`, `gap: 12px`, etc.

**DryUI has:** `--dry-space-0.5` through `--dry-space-20` (4px base unit). Most wizard values map cleanly: 8px = `--dry-space-2`, 12px = `--dry-space-3`, 16px = `--dry-space-4`, 24px = `--dry-space-6`, 32px = `--dry-space-8`, 48px = `--dry-space-12`.

**Files:** All files — `+page@.svelte`, `HsbPicker.svelte`, `AlphaSlider.svelte`, all step components.
**Effort:** M (many small changes across all files)

---

### A8. Hardcoded typography → Text/Heading + `--dry-font-*` tokens

**What the wizard does:** Font sizes, families, and weights are hardcoded everywhere:

- `font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace` (repeated 5+ times)
- `font-size: clamp(2.5rem, 5vw, 4rem)`, `0.7rem`, `0.8rem`, `0.85rem`, `10px`, `11px`, `13px`, `14px`
- `font-weight: 600`, `text-transform: uppercase`, `letter-spacing: 0.05em–0.1em`

**DryUI has:** `--dry-font-mono`, `--dry-font-sans`, `--dry-type-small-size`, `--dry-type-small-leading`, plus `Text` and `Heading` components.

**Files:** All files.
**Effort:** M

---

## Category B: Enhance Existing

DryUI components that exist but need specific improvements to support the wizard's use cases. These improvements benefit the framework broadly.

### B1. ColorPicker needs HSB channel inputs

**What the wizard does:** `HsbPicker.svelte` renders three `NumberInput` fields for Hue (0-360), Saturation (0-100), and Brightness (0-100), plus a hex `Input` — all wired to custom HSB↔hex conversion logic with bidirectional sync.

**DryUI has:** `ColorPicker.Input` supports `format: 'hex' | 'rgb' | 'hsl'` — no `'hsb'`/`'hsv'` format. The primitive's context already exposes `hsv`, `setFromHsv`, `setSaturationValue`, `setHue` internally — the data layer is ready.

**What's needed:** Either:

- Add `format: 'hsv'` to `ColorPicker.Input`, or
- Add a `ColorPicker.ChannelInput` sub-component that renders individual channel inputs (H, S, V/B number fields) reading from the existing context

**Why it benefits DryUI:** Any design tool, theme builder, or color-heavy app needs HSB input. This is table-stakes for a professional color picker.

**Files:** `packages/primitives/src/color-picker/color-picker-input.svelte`, `packages/ui/src/color-picker/`
**Effort:** M

---

### B2. ColorPicker.AlphaSlider needs standalone mode

**What the wizard does:** `AlphaSlider.svelte` is used in `NeutralPalette.svelte` to adjust opacity of neutral tokens — completely outside any `ColorPicker.Root` context. It layers a checkerboard + color gradient track behind a DryUI `Slider`.

**DryUI has:** `ColorPicker.AlphaSlider` which calls `getColorPickerCtx()` — it crashes if used outside `ColorPicker.Root`.

**What's needed:** Either:

- Extract a standalone `AlphaSlider` component that accepts `value`, `color`, and `onchange` props directly (no context dependency), or
- Add an `independent` prop to `ColorPicker.AlphaSlider` that bypasses context and uses prop-driven state

**Why it benefits DryUI:** Opacity/alpha controls appear in many contexts beyond color picking: layer opacity, gradient stops, material editors, image filters.

**Files:** `packages/primitives/src/color-picker/`, `packages/ui/src/color-picker/`
**Effort:** M

---

### B3. Swatch strip / palette preview component

**What the wizard does:** Multiple places render a horizontal strip of color squares as a palette preview:

- Main hero: 5 token swatches in a `div.swatch-strip` with `clamp()` sizing
- Presets: 5 tiny swatches per preset in `div.preset-strip`
- Image extraction: variable-length swatch strip in `div.extracted-strip`

**DryUI has:** `ColorPicker.Swatch` (single swatch) and `OptionSwatchGroup` (selection with labels/metadata). Neither provides a simple "row of color chips as a palette preview" pattern.

**What's needed:** A `SwatchStrip` or `PalettePreview` component — a flex row of color chips without selection semantics. Props: `colors: string[]`, `size`, optional `labels`. Could live in the ColorPicker family or standalone.

**Why it benefits DryUI:** Palette previews appear in theme pickers, design system docs, color scheme selectors, and data visualization config.

**Files:** New component in `packages/ui/src/`
**Effort:** S

---

### B4. FileUpload.Dropzone needs a callback-only mode

**What the wizard does:** The landing page dialog has a drag/drop zone (`div.drop-zone`) that accepts images and immediately processes them via canvas to extract colors. It uses raw `ondragover/ondragleave/ondrop` handlers with ~20 lines of custom drop zone CSS.

**DryUI has:** `FileUpload.Root > FileUpload.Dropzone` which manages a file list internally (add, display, remove). It's designed for form-style file management, not "drop → process → done" workflows.

**What's needed:** An `onDrop` callback prop on `FileUpload.Dropzone` (or a new `DropZone` standalone component) that fires with the dropped files without managing internal state. The styled drop zone (dashed border, hover state, active state) is the reusable part.

**Why it benefits DryUI:** Processing workflows (image upload → crop, CSV → parse, file → validate) all need a styled drop zone that hands off files immediately rather than managing a list.

**Files:** `packages/primitives/src/file-upload/`, `packages/ui/src/file-upload/`
**Effort:** M

---

### B5. Export color-utils from primitives

**What the wizard does:** `derivation.ts` reimplements hex↔HSL, HSL↔HSB, and WCAG contrast ratio calculations (~200 lines of color math).

**DryUI has:** `packages/primitives/src/color-picker/color-utils.ts` with `hexToRgb`, `rgbToHex`, `rgbToHsv`, `hsvToRgb`, `rgbToHsl`, `hslToRgb`, `hsvToHsl`, `hslToHsv`, `parseColor`, `formatRgb`, `formatHsl`, `isValidHex`, `clamp` — but these are **not exported** from the package's public API.

**What's needed:** Export `color-utils.ts` functions from `@dryui/primitives` (or a dedicated `@dryui/color` entry point). Optionally add `contrastRatio(color1, color2)` since the wizard needs WCAG checking.

**Why it benefits DryUI:** Any app using DryUI for color-related features shouldn't need to reimplement color math that's already in the primitives.

**Files:** `packages/primitives/src/index.ts`, `packages/primitives/src/color-picker/color-utils.ts`
**Effort:** S

---

## Category B+ : Layout Primitives for Minimalist Pages

The theme wizard's landing page is a masterclass in minimalist layout: full-viewport, vertically centred, generous whitespace, zero visual chrome. Building this with DryUI today requires falling back to custom CSS because the layout system has gaps that push you toward decorated patterns instead.

### The real problem

DryUI's core layout primitives (Stack, Flex, Grid) are actually **zero-decoration** — they add no backgrounds, borders, shadows, or border-radius. But the ecosystem steers you away from them for page-level layout:

1. **PageLayout** is the only "page-level" component, and it forces borders + shadows + background on every region. It's designed for dashboards, not landing pages.
2. **Stack has no `justify` prop** — you can't vertically centre content in a full-height Stack without dropping to custom CSS.
3. **Gap tokens stop at `xl`** — the wizard uses `gap: 80px` for its spacious feel, which doesn't map to any DryUI token. The largest gap (`xl`) is too small for section-level spacing.
4. **No full-height shorthand** — `min-height: 100vh` has to be applied via inline `style` on every page.
5. **Grid can't handle responsive asymmetric layouts** — the `responsive` prop only collapses equal columns. Real layouts need sidebar widths, asymmetric ratios, and media-query breakpoints.
6. **No composition recipes for minimalist pages** — `compose "app shell"` gives you AppBar + Container + Stack, but there's no recipe for "full-page centred hero" or "immersive colour landing" or even "simple centred content page". The recipe vocabulary assumes chrome.

The result: every minimalist page in the docs app is built with custom CSS, while every decorated dashboard page uses DryUI. That's backwards — the layout system should handle both.

---

### B6. Stack needs `justify` prop

**What the wizard does:** The `.hero` element uses `display: flex; flex-direction: column; align-items: center; justify-content: center` — a vertically and horizontally centred column.

**DryUI has:** `Stack` exposes `align` (cross-axis) but not `justify` (main-axis). You must use `Flex` instead, which defeats the purpose of having a simpler vertical-layout primitive.

**What's needed:** Add `justify?: 'start' | 'center' | 'end' | 'between'` to Stack. One prop, maps directly to `justify-content`.

**Why it benefits DryUI:** Centred splash pages, vertically distributed content, space-between footer layouts — all common patterns that currently require dropping from Stack to Flex.

**Effort:** XS

---

### B7. Larger gap / spacing tokens for section-level layout

**What the wizard does:** `gap: 80px` between the hero and the presets nav. `padding: 48px 24px` on the page. These are deliberate, generous section-level spaces that create the minimalist feel.

**DryUI has:** Space tokens up to `--dry-space-20` (80px at 4px base). The layout components (Stack, Flex, Grid) only expose 4 gap sizes: `sm`, `md`, `lg`, `xl`. The wizard's 80px gap doesn't map to any named prop value.

**What's needed:** Two changes:

1. **Expose larger named gaps** on layout components — add `2xl` and `3xl` (or `section` / `page`) to the gap prop enum, mapping to `--dry-space-16` (64px) and `--dry-space-20` (80px).
2. **Allow arbitrary gap values** — accept `gap="var(--dry-space-20)"` or `gap={20}` (in space-token units) as an escape hatch for custom spacing.

**Why it benefits DryUI:** Section-level spacing is fundamental to page design. Without it, every page that needs breathing room drops to custom CSS, and the layout components become irrelevant for page-level composition.

**Effort:** S

---

### B8. Full-height / centred page layout shorthand

**What the wizard does:** `.page { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; }` — 5 lines of CSS that DryUI can't express without inline styles.

**DryUI has:** No prop on any layout component for `min-height: 100vh`. You must write `style="min-height: 100vh"` on Flex or Stack. The Hero component handles centering internally but it's a content component (Heading + Subheading + Actions), not a generic layout primitive.

**What's needed:** Either:

- A `fullHeight` prop on Flex/Stack (like PageLayout already has) that adds `min-height: 100vh`, or
- A `Page` or `Screen` layout primitive: `<Page centered>` → full-viewport, vertically centred, zero decoration. Think of it as the minimalist counterpart to PageLayout.

**Why it benefits DryUI:** Every landing page, splash screen, onboarding flow, empty state, and error page needs this. It's the most common page-level pattern after "sidebar + content".

**Effort:** S

---

### B9. Grid needs responsive asymmetric layouts

**What the wizard does:** The preview fixtures use grids like `grid-template-columns: 1fr 380px` (content + fixed sidebar) and `2fr 1fr 1fr 1fr auto` (search bar) with `@media` breakpoints to collapse on mobile.

**DryUI has:** Grid supports `columns={N}` (equal-width) and `template="..."` (raw CSS string). The `responsive` prop only collapses equal columns via container queries (1 col → 2 col → N col). There's no way to express "1fr 380px, collapsing to 1fr below 900px" without custom CSS.

**What's needed:**

- A `collapse` or `breakpoint` prop that specifies when `template` should fall back to single-column. Example: `<Grid template="1fr 380px" collapse="md">` → uses the template above the breakpoint, 1fr below it.
- Alternatively, accept an array: `template={["1fr", "1fr 380px"]}` where index 0 is mobile, index 1 is desktop.

**Why it benefits DryUI:** Sidebar layouts, form + summary panels, search bars with filters — the most common real-world grid patterns are asymmetric with a collapse point. Equal-column grids are the easy case.

**Effort:** M

---

### B10. Composition recipes for minimalist pages

**What the wizard does:** It exists as proof that you can build a beautiful, immersive page that doesn't look like a dashboard. But there's no DryUI recipe that would guide someone to this pattern.

**DryUI has:** `compose "app shell"` returns AppBar + Container + Stack. `compose "dashboard"` returns PageLayout. There's no recipe for clean, undecorated page patterns.

**What's needed:** New composition recipes in `composition-data.ts`:

- **"centred page"** — `Stack` (or `Page`) with `fullHeight`, `justify="center"`, `align="center"`, `gap="2xl"`. No Card, no AppBar unless opted in.
- **"hero landing"** — full-viewport centred hero + content sections below, using generous spacing tokens.
- **"simple content page"** — Container + Stack with body text, no sidebar, no PageLayout.

These recipes teach the mindset: not every page needs boxes. Whitespace and alignment communicate structure.

**Why it benefits DryUI:** Composition recipes shape how people build with the framework. If the only page-level recipe is "dashboard with sidebar", every app will look like a dashboard. Adding minimalist recipes expands what DryUI can express.

**Effort:** S

---

## Category C: Build New

Components or utilities DryUI doesn't have yet, which the wizard's custom implementations reveal a need for.

### C1. TokenPreview component

**What the wizard does:** `TokenPreview.svelte` renders a small color swatch (24px) + monospace token name + optional value, with text truncation. Used throughout the step components to display generated CSS custom properties.

**DryUI has:** Nothing purpose-built for this. The wizard uses `Flex` for layout and custom CSS for the swatch/text styling.

**What's needed:** A `TokenPreview` (or `ColorToken` / `DesignToken`) component. Props: `name`, `value` (color string), `showValue`, `size`. Renders a swatch + monospace label with truncation.

**Why it benefits DryUI:** Design system documentation, theme explorers, token catalogs, Storybook-style tools — anywhere you display design tokens. This is particularly meta: a component library should have a component for displaying its own tokens.

**Effort:** S

---

### C2. Image color extraction utility

**What the wizard does:** `+page@.svelte` has a `extractColorsFromFile()` function (~40 lines) that:

1. Draws a dropped image to a 64x64 canvas
2. Reads pixel data and buckets by hue (36 buckets, 10deg each)
3. Filters out near-white, near-black, and low-saturation pixels
4. Returns top 5 dominant colors as hex strings

**DryUI has:** Nothing for image processing.

**What's needed:** An `extractColorsFromImage(file: File, count?: number): Promise<string[]>` utility in `@dryui/primitives` (or alongside the color-utils). Not a component — a pure function.

**Why it benefits DryUI:** Image-to-palette is a common feature in theme builders, design tools, and creative apps. Shipping it as a utility alongside the ColorPicker makes the ecosystem more complete.

**Effort:** M

---

## What Should Stay as Application Code

These are **not** component gaps — they're application logic specific to the theme wizard:

- **Derivation engine** (`derivation.ts`) — theme generation from brand HSB is wizard business logic
- **Preset data** (`presets.ts`) — content, not a component
- **Mock UI panels** (`NeutralPalette.svelte` panels) — demo content showing how tokens apply
- **Elevation layer demo** (`Backgrounds.svelte` stack) — visual teaching aid, not reusable
- **URL share codec** — application feature
- **The immersive colour transitions** — the dynamic `background-color` and `color` transitions driven by brand input are art direction, not a component pattern. The _layout_ structure (full-page centred column) should be expressible with DryUI (see B8), but the colour-reactive styling is application logic.

---

## Prioritised Implementation Order

### Phase 1: Layout Primitives — Make Minimalist Pages Possible

_These are foundational. Every subsequent phase benefits from being able to express page layouts without custom CSS._

1. **B6** — Add `justify` prop to Stack (XS — one prop, one CSS rule)
2. **B7** — Add larger gap tokens (`2xl`, `3xl`) to layout components (S)
3. **B8** — Add `fullHeight` prop or `Page` primitive for full-viewport centred layouts (S)
4. **B10** — Add composition recipes for "centred page", "hero landing", "simple content page" (S)

### Phase 2: Quick Wins — Use What Exists

_Swap in existing DryUI components with zero framework changes._

5. **A1** — Replace raw `<dialog>` with `Dialog.Root`
6. **A2** — Replace raw preset buttons with `Button`/`Card.Root`
7. **A4** — Replace Toggle + spans with `SegmentedControl`
8. **A3** — Replace raw labels with `Field.Root + Label`
9. **A5** — Replace raw close button with `Button`
10. **A6** — Replace native `<input type="color">` with `ColorPicker`

### Phase 3: Token Discipline

_Replace hardcoded values with design tokens. Validates the token system._

11. **A7** — Replace hardcoded spacing with `--dry-space-*` tokens
12. **A8** — Replace hardcoded typography with `--dry-font-*` / `Text` / `Heading`

### Phase 4: ColorPicker Ecosystem

_Enhance the ColorPicker to be more composable. Biggest framework improvement._

13. **B5** — Export color-utils from `@dryui/primitives` (unblocks B1, C2)
14. **B1** — Add HSB channel inputs to ColorPicker
15. **B2** — Extract standalone AlphaSlider
16. **B3** — Build SwatchStrip / PalettePreview component

### Phase 5: Grid + Drop Zone + Utilities

17. **B9** — Add responsive collapse to Grid for asymmetric layouts (M)
18. **B4** — Add callback-only mode to FileUpload.Dropzone
19. **C2** — Add `extractColorsFromImage()` utility

### Phase 6: Design Token Display

20. **C1** — Build TokenPreview component

---

## Summary

| Category                         | Count       | Effort          |
| -------------------------------- | ----------- | --------------- |
| A: Use what exists               | 8 gaps      | Mostly S, two M |
| B: Enhance existing (components) | 5 gaps      | Mix of S and M  |
| B+: Layout primitives            | 5 gaps      | XS to M         |
| C: Build new                     | 2 gaps      | S + M           |
| **Total**                        | **20 gaps** |                 |

The two biggest wins for DryUI as a framework:

1. **Phase 1 (Layout Primitives)** — closes the gap that forces every minimalist page into custom CSS. Adding `justify` to Stack, larger gap tokens, a full-height shorthand, and minimalist composition recipes means DryUI can express clean, undecorated pages as naturally as it expresses dashboards. The theme wizard is proof that this design language works — now the framework needs to support it.

2. **Phase 4 (ColorPicker Ecosystem)** — making the color picker more composable (standalone alpha slider, HSB channel inputs, exported color utils) turns it from a single-purpose widget into a professional color toolkit. The theme wizard stress-tests exactly the boundaries that need expanding.

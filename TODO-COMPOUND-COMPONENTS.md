# `@dryui/ui` compound component upgrade

Source: 10-cluster audit of `packages/ui/src/` on 2026-04-30. ~175 files audited (155 component dirs + 6 theme files + internal primitives + token-scope). Standards: `skills/dryui/rules/theming.md` and the `feedback_css_var_defaults` rule (default via `var(--name, fallback)` on consumption, never `--name: default` on the rendered element).

## Audit totals

- 23 block, 49 warn, 13 nit, 90 clean.
- Most of the library is already disciplined. Fixes concentrate in three systemic patterns plus a small number of one-off color leaks.

Phases run top to bottom. Theme work in Phase 0 unblocks everything downstream.

## Verification (2026-05-04)

Re-verified every item below against the `dryui-rescue` branch source. Net progress:

- Initial audit: **0 items strictly done, 6 PARTIAL, 101 still TODO out of 107.**
- After Phase 0 wave: **6 done, 5 PARTIAL, 96 TODO** out of 107.
- After Phase 1 wave: **34 done, 5 PARTIAL, 68 TODO** out of 107.

Per phase:

- **Phase 0** (theme files): ✅ 6 of 6 complete. `themes/component-defaults.css` extracted; midnight/aurora/terminal ship full status family; aurora light has overlay-backdrop; purple semantic token row added to every theme.
- **Phase 1** (color literals): ✅ 28 of 28 complete. New `--dry-color-glass-tint` palette token added to every theme (consumed by `glass.svelte`); purple row consumed by `badge` and `tag`; markdown-renderer rewritten from parens-less `:global { … }` to per-selector `:global(...)`. New component tokens: `--dry-spotlight-rim-color`, `--dry-chromatic-shift-{r,g,b}`, `--dry-data-grid-pinned-shadow`, `--dry-video-embed-shadow`, `--dry-option-picker-preview-tint-{light,dark}`, `--dry-qr-{bg,fg}`. Drag-and-drop keyframes now read `--dry-shadow-{md,lg}` once at drag-start via `getComputedStyle`.
- **Phase 2** (root-defaulted tokens): 0 done, 2 partial (`chip-group-root`, `icon`), 27 TODO. `toggle-group-root` still uses bare `[data-size='*']` selectors, not `:where(...)`.
- **Phase 3** (grid placement seam): 0 done, 1 partial (`avatar` slot path only), 21 TODO. `multi-select-combobox`'s outer `[data-multi-select-wrapper]` is still bare; rest spreads to the inner root.
- **Phase 4** (token contracts): 0 done, 2 partial (`splitter` z-index only; `textarea` has `--dry-input-*` fallthrough but no namespace), 13 TODO.
- **Phase 5** (cleanup): 0 done, 7 TODO. `chat-thread.svelte` still has `await tick()` at lines 81 and 101.

Items annotated `**[partial]**` below have visible movement but do not meet the full fix criterion.

## Phase 0. Theme files (highest leverage, every component cascades through these)

- [x] `packages/ui/src/themes/default.css:114-128`: extract `--dry-toggle-{track-bg,track-stroke,selected-bg,selected-stroke,thumb-bg,hover-bg,press-bg,disabled-fill,disabled-stroke,focus-ring,label-color,label-disabled-color}` and `--dry-beam-default-blend` into a new `themes/component-defaults.css` so theme files only carry semantic tokens (`--dry-color-*`).
- [x] `packages/ui/src/themes/dark.css:76-92, 325-341`: same extraction. The `[data-theme='dark']` and `.theme-auto:not([data-theme='light'])` blocks duplicate the override; collapse into one CSS layer when extracting.
- [x] `packages/ui/src/themes/midnight.css`: ship complete status palette (currently missing the entire error/warning/success/info family across `text/fill/fill-hover/fill-weak/stroke/stroke-strong/icon/on-`). Theme only renders correctly today because default.css cascades fill the gaps.
- [x] `packages/ui/src/themes/aurora.css`: same. Both `[data-theme='aurora']` and `[data-theme='aurora-dark']` blocks ship without the status family. Also align `--dry-color-overlay-backdrop` between the two blocks.
- [x] `packages/ui/src/themes/terminal.css:177-184`: ship missing status sub-tokens (`stroke`, `icon`, `on-*`, `fill-hover`, `fill-weak`). Today the partial palette inherits default.css values tuned for a light brand, producing visible mismatches in dark terminal mode.
- [x] Add semantic purple token row to all themes: `--dry-color-fill-purple`, `--dry-color-fill-purple-hover`, `--dry-color-fill-purple-weak`, `--dry-color-text-purple`, `--dry-color-stroke-purple`, `--dry-color-on-purple`. Consumed by `badge` and `tag` purple variants (Phase 2).

## Phase 1. Hardcoded color literals in component `<style>` (block)

Each is a strict rule-1 violation: a `#hex`, `rgb()`, `rgba()`, `hsl()`, `oklch()`, or bare CSS color keyword in a `<style>` block where it is not effect-internal math.

- [x] `packages/ui/src/code-block/code-block-button.svelte:168-178, 283, 289-326`: entire syntax theme hardcoded. ~14 hex literals for token-type colors plus root-defaulted surface tokens. Move to `var(--dry-code-token-{keyword,string,…}, <hex>)` consumption pattern and tier into `themes/component-defaults.css` so themes can rebind.
- [x] `packages/ui/src/markdown-renderer/markdown-renderer.svelte:81`: replace `[data-markdown-renderer-root] :global { ... }` parens-less form with `:global(...)` per-selector form, scoped to the renderer root. Today the block leaks all descendant element selectors globally.
- [x] `packages/ui/src/avatar/avatar.svelte:176`: drop `border: 2px solid var(--dry-color-bg-raised, #ffffff)` literal fallback. The semantic token is universal.
- [x] `packages/ui/src/qr-code/qr-code.svelte:93`: drop `--dry-qr-bg: #fff` static default. Paint canvas from the resolved CSS var via `getComputedStyle`. Also fix the JS prop defaults `bgColor = '#fff'` / `fgColor = '#000'` (lines 17-18) to read tokens.
- [x] `packages/ui/src/video-embed/video-embed-button.svelte:139, 169`: replace `rgb(15 23 42 / 0.3)` drop-shadow with `var(--dry-shadow-md)`. Drop `#0f0f0f` background fallback (`--dry-color-fill` is universal).
- [x] `packages/ui/src/data-grid/data-grid-cell.svelte:30` and `data-grid/data-grid-button-input-column.svelte:209`: replace `box-shadow: 2px 0 4px -2px rgb(15 23 42 / 0.1)` pinned-cell shadows with a new `--dry-data-grid-pinned-shadow` token consuming `var(--dry-shadow-elevation-1, ...)`.
- [x] `packages/ui/src/data-grid/data-grid-button-input-column.svelte:261`, `data-grid/data-grid-input-select-all.svelte:50`, `data-grid/data-grid-input-select-cell.svelte:38`: drop `#3b82f6` fallback after `--dry-color-fill-brand` (token cascades reliably).
- [x] `packages/ui/src/mega-menu/mega-menu-link.svelte:83-84,93,97,112,123,135` + `mega-menu-panel.svelte:103,105` + `mega-menu-column.svelte:31`: drop `#f3f4f6`, `#e2e8f0`, `#1a1a2e`, `#64748b`, `rgba(0,0,0,0.1)` literal fallbacks inside `var()`.
- [x] `packages/ui/src/tour/tour-root.css:12`: replace `color-mix(in srgb, var(--dry-color-fill-brand) 35%, white 25%)` with a token. Add `--dry-color-on-brand` (or new `--dry-color-fill-brand-strong`) and use it in the mix.
- [x] `packages/ui/src/tour/tour-root.css:126`: replace `[data-part='prevButton'] { background: transparent; }` with a faint surface token (e.g., `--dry-color-bg-raised` or a new `--dry-color-fill-subtle`).
- [x] `packages/ui/src/star-rating/star-rating-root.svelte:55`: replace `--dry-star-rating-color: #f59e0b` with `var(--dry-color-fill-warning)` consumed via `var(--dry-star-rating-color, var(--dry-color-fill-warning))` at the SVG fill site.
- [x] `packages/ui/src/badge/badge.svelte:150,195,199,252,254,298`: replace hardcoded `hsl(280, 65%, 55%)` purple variants with `var(--dry-color-fill-purple)` etc. (depends on Phase 0 purple token).
- [x] `packages/ui/src/tag/tag-button.svelte:138,183,184,232,233`: same purple replacement.
- [x] `packages/ui/src/option-picker/option-picker-preview.svelte:77,86,88,91,92`: replace bare `white` and `black` keywords in gradient stops + inset shadows. Either neutral token references (`var(--dry-color-text-strong)` over `var(--dry-color-bg-raised)`) or new `--dry-option-picker-preview-tint-{light,dark}` tokens consumed at the same sites.
- [x] `packages/ui/src/aurora/aurora.svelte:174-176, 186-188, 192-194, 198-200, 204-206, 210-212`: drop the `[data-aurora][data-palette='*']` blocks that root-default `--dry-aurora-color-{1,2,3}: rgba(...)`. Move the rgba literals into `var(--dry-aurora-color-1, rgba(...))` fallbacks at consumption sites (lines 237, 244, 251, 287). Keep palette switching in the `customPalette` JS branch via private `--_aurora-color-*`.
- [x] `packages/ui/src/gradient-mesh/gradient-mesh.svelte:23, 98-116, 188-191`: change JS prop default `colors = ['#7b68ee', ...]` to `undefined`. Move `--dry-mesh-color-{1..4}` literals to consumption fallbacks. The `@property` initialValues at 98-116 must stay literal (CSS spec) but the visible defaults should cascade through `var(..., initial)`.
- [x] `packages/ui/src/god-rays/god-rays.svelte:17, 88`: change JS `color = 'rgba(255, 255, 255, 0.15)'` to `undefined`. Drop root-defaulted `--dry-rays-color`. Add fallback to consumption gradient stops at lines 41-42.
- [x] `packages/ui/src/spotlight/spotlight.svelte:24, 182, 235-236`: change JS `color = 'rgba(59, 130, 246, 0.28)'` to `undefined`. Drop root-defaulted `--dry-spotlight-color`. Expose `--dry-spotlight-rim-color` with `rgba(255,255,255,0.12)` as fallback at lines 235-236.
- [x] `packages/ui/src/chromatic-shift/chromatic-shift.svelte:140-142, 147-148`: expose `--dry-chromatic-shift-{r,g,b}` tokens consumed via `var(--name, rgba(...))` so the channel colors theme.
- [x] `packages/ui/src/app-frame/app-frame.svelte:85, 89, 93`: replace inline `#ff5f56` / `#ffbd2e` / `#27c93f` traffic-light dot fallbacks with new `--dry-color-traffic-{close,min,max}` palette tokens (or `--dry-app-frame-dot-{close,min,max}` defaulting to those palette tokens).
- [x] `packages/ui/src/glass/glass.svelte:14, 45`: drop the JS prop default `tint = 'rgba(255,255,255,0.08)'` and the matching CSS fallback. Add `--dry-color-glass-tint` palette token, then `var(--dry-glass-tint, var(--dry-color-glass-tint, ...))` on consumption.
- [x] `packages/ui/src/card/card-root.svelte:98`: drop `#3b82f6` final fallback in the `--dry-card-selected-ring-color` chain. Three-layer cascade already provides it through `--dry-color-fill-brand`.
- [x] `packages/ui/src/tooltip/tooltip-content.svelte:58`: decide on the frosted-tooltip effect. Either keep `color-mix(... 95%, transparent)` and document explicitly as a `glass-tooltip` recipe, or default `--dry-tooltip-bg` to a solid `--dry-color-bg-inverse`.
- [x] `packages/ui/src/drag-and-drop/drag-and-drop-root.svelte:200, 545, 549, 663, 667`: rgba shadows in JS-applied keyframes bypass the token chain. Read shadow tokens once at drag-start via `getComputedStyle` and pass into Web Animations keyframes.
- [x] `packages/ui/src/map/map-marker.svelte:77, 79` + `map-root.svelte:216`: drop raw `#ffffff`, `0 4px 6px -1px rgba(0,0,0,0.1)`, `#e2e8f0` fallbacks behind already-defined semantic tokens.
- [x] `packages/ui/src/sparkline/sparkline.svelte:94`: drop `#3b82f6` literal fallback (or replace with `currentColor`).
- [x] `packages/ui/src/gauge/gauge.svelte:100, 101`: drop `#e2e8f0` and `#3b82f6` literal fallbacks.
- [x] `packages/ui/src/progress/progress.svelte:267, 276`: drop `#1a1a2e` and `#64748b` literal fallbacks.

## Phase 2. Root-defaulted token violations (block, per `feedback_css_var_defaults` rule)

Setting `--dry-<component>-*: <default>` on the rendered element defeats Svelte `--prop` inheritance from a parent scope. Fix uniformly: delete the leading `--dry-foo-*: default;` block on the component root and inline the default into each `var(--dry-foo-*, default)` consumption.

- [ ] `packages/ui/src/listbox/listbox-root.svelte:101-105` (`--dry-listbox-{bg,border,radius,padding}`)
- [ ] `packages/ui/src/listbox/listbox-item.svelte:44-54` (`--dry-listbox-item-*`)
- [ ] `packages/ui/src/checkbox/checkbox-input.svelte:113-117` (`--dry-checkbox-{size,radius,bg,border,check-color}`)
- [ ] `packages/ui/src/segmented-control/segmented-control-root.svelte:115-117` (`--dry-sc-{radius,selected-bg,selected-border}`)
- [ ] `packages/ui/src/option-picker/option-picker-item.svelte:159-168` (`--dry-option-picker-{preview,label,description,meta}-*`)
- [ ] `packages/ui/src/transfer/transfer-root.svelte:130-139` (10 `--dry-transfer-*` tokens)
- [ ] `packages/ui/src/file-upload/file-upload-dropzone.svelte:84-88, 127-137` (`--dry-fu-{border,bg,padding,min-height,font-size}`)
- [ ] `packages/ui/src/button-group/button-group.svelte:40-41, 52, 56, 60` (`--dry-button-group-radius`, `-hover-z-index`)
- [ ] **[partial]** `packages/ui/src/chip-group/chip-group-root.svelte:87, 91, 95` (`--dry-chip-group-gap` reassigned per `[data-gap='*']`). Use `--_chip-group-gap-default` private as the fallback. _As of 2026-05-04: leading root-default block is gone, but the per-`[data-gap]` selectors still reassign `--dry-chip-group-gap` directly instead of writing through a private._
- [ ] `packages/ui/src/tag/tag-button.svelte:109-247`: variant blocks reassign `--dry-tag-bg/-color/-border` on the same `[data-tag]` element. Rework to write `--_tag-bg-default` privates and read `--dry-tag-bg` with private fallback at the single consumption site (the `badge` private-default pattern is the template).
- [ ] **[partial]** `packages/ui/src/icon/icon.svelte:48-79` (`--dry-icon-{size,color}` reassigned per `[data-size]` / `[data-color]`). _As of 2026-05-04: consumption sites at lines 41-42 already use `var(--dry-icon-size, var(--dry-space-5))` / `var(--dry-icon-color, currentColor)`, so the consumption pattern is right. The size/color enum selectors still reassign the public tokens directly; switch them to `--_icon-{size,color}-default` privates so the public token stays overrideable from a parent._
- [ ] `packages/ui/src/float-button/float-button-root.svelte:82-85` (`--dry-fab-{offset,gap,position,z-index}`)
- [ ] `packages/ui/src/link/link.svelte:52` (`--dry-link-hover-color` defined on the `<a>` element it reads)
- [ ] `packages/ui/src/format-bytes/format-bytes.svelte:54-55`
- [ ] `packages/ui/src/format-date/format-date.svelte:75-76`
- [ ] `packages/ui/src/format-number/format-number.svelte:54-55`
- [ ] `packages/ui/src/relative-time/relative-time.svelte:62-63`
- [ ] `packages/ui/src/image/image.svelte:56-60`
- [ ] `packages/ui/src/image-comparison/image-comparison.svelte:124-133`
- [ ] `packages/ui/src/logo-mark/logo-mark.svelte:59-62`
- [ ] `packages/ui/src/link-preview/link-preview-trigger.svelte:42-43` + `link-preview-content.svelte:52-57`
- [ ] `packages/ui/src/table-of-contents/table-of-contents-root.svelte:82-91`
- [ ] `packages/ui/src/markdown-renderer/markdown-renderer.svelte:59-71` (defaults assigned on `[data-markdown-renderer-root]`)
- [ ] `packages/ui/src/chat-thread/chat-thread.svelte:180-185, 191` (`--dry-chat-thread-{gap,message-gap}` defined and consumed bare on `[data-chat-thread]`)
- [ ] `packages/ui/src/code-block/code-block-button.svelte:168-178` (overlap with Phase 1)
- [ ] `packages/ui/src/toggle-group/toggle-group-root.svelte:84-105`: size-scoped overrides at `[data-size='sm|md|lg']`. Wrap in `:where(...)` to drop specificity to zero so consumer overrides win.
- [ ] `packages/ui/src/beam/beam.svelte:63-67`, `glow/glow.svelte:44-47`, `halftone/halftone.svelte:64-68`: redundant root token blocks. Consumption already uses `var(--name, fallback)`. Drop the blocks for consistency.

## Phase 3. Grid placement seam (warn)

`{...rest}` lands on an inner element, so `style="--dry-grid-area-name: …"` from a parent grid does not reach the outermost layout participant. Fix by either forwarding rest+class+style onto the outer wrapper or eliminating the wrapper.

### Form text inputs

- [ ] `packages/ui/src/input/input.svelte:26-40` (rest on inner `<input>`, wrapper `<span>` bare)
- [ ] `packages/ui/src/textarea/textarea.svelte:23-37` (same pattern)
- [ ] `packages/ui/src/number-input/number-input-button.svelte:33` (wrapper `<div>` bare)
- [ ] `packages/ui/src/tags-input/tags-input-root.svelte:67-78` (wrapper `<div>` bare)

### Form selectors

- [ ] `packages/ui/src/select/select-root-input.svelte:11-31, 81` (extend Props from `HTMLAttributes<HTMLDivElement>`)
- [ ] `packages/ui/src/combobox/combobox-input-root.svelte:5-19, 91`
- [ ] `packages/ui/src/multi-select-combobox/multi-select-combobox-root-input.svelte:219` (outer `[data-multi-select-wrapper]` bare)
- [ ] `packages/ui/src/transfer/transfer-list-input.svelte:49, 60` (rest split — outer gets className only)
- [ ] `packages/ui/src/file-select/file-select-root.svelte:5-13, 107` (no class, no rest in Props)
- [ ] `packages/ui/src/time-input/time-input.svelte:19-26, 77-84` (no rest declared)
- [ ] `packages/ui/src/radio-group/radio-group-item-input.svelte:41` (rest on `<input>` not `<label>`)

### Other

- [ ] `packages/ui/src/numeric/numeric.svelte:9, 29` (no rest, fixed class with no merge)
- [ ] `packages/ui/src/scroll-to-top/scroll-to-top-button.svelte:11-19, 73-85`
- [ ] `packages/ui/src/icon/icon.svelte:5-13` (extend `HTMLAttributes<HTMLSpanElement>`)
- [ ] `packages/ui/src/icon-swap/icon-swap.svelte:4-10`
- [ ] `packages/ui/src/qr-code/qr-code.svelte:74` (rest on inner `<canvas>`)
- [ ] **[partial]** `packages/ui/src/avatar/avatar.svelte:59-67` (rest on inner span when status/badge slot is used). _As of 2026-05-04: the no-slot path forwards rest correctly onto the outer span, but the status/badge slot path still spreads rest onto the inner span and leaves the outer wrapper bare._
- [ ] `packages/ui/src/chip/chip-button.svelte:50-74` (rest forwarded to inner Button instead of `.chip-wrap`)
- [ ] `packages/ui/src/tag/tag-button.svelte:31-37` (rest on inner `[data-tag]` span instead of outer wrapper)
- [ ] `packages/ui/src/motion/{enter,exit,stagger}.svelte`: extend Props with `HTMLAttributes`, spread `{...rest}` on the `<svelte:element>`.

## Phase 4. Token contract gaps (warn)

Add `--dry-<component>-*` overrides backed by semantic tokens.

- [ ] `chip` (`packages/ui/src/chip/chip-button.svelte:79-94`): expose `--dry-chip-{bg,color,border,active-bg}` on `.chip-wrap`. Currently only private `--_chip-*` exists; consumers must override `--dry-btn-*` to reach the chip.
- [ ] `radio-group` (`packages/ui/src/radio-group/radio-group-item-input.svelte:48-150`): introduce `--dry-radio-{bg,border,checked-bg,checked-border}` surface.
- [ ] `multi-select-combobox`: define `--dry-multi-select-*` surface (none today).
- [ ] `file-select`: introduce `--dry-fs-{bg,border,radius,padding-x,padding-y}` (or `--dry-file-select-*`) surface.
- [ ] `drop-zone`: introduce `--dry-drop-zone-{padding,border,radius,active-bg}`.
- [ ] `chart`: expose `--dry-chart-series-1` through `--dry-chart-series-N` (5–8 tonal cascade against brand + accents). Use index-modulo selection in `chart-bars`/`chart-donut`/`chart-stacked-bar` when `point.color` is unset. Today multi-series charts collapse to a single brand color or render unpainted (`chart-stacked-bar.svelte:64`).
- [ ] `gauge`: expose `--dry-gauge-zone-1..N` for arc segmentation (optional).
- [ ] `pagination`: define a `--dry-pagination-*` surface or document that the component delegates entirely to inherited button tokens.
- [ ] `toolbar`: expose `--dry-toolbar-{bg,border,radius,padding}`.
- [ ] `accordion`: expose `--dry-accordion-border` for theming consistency.
- [ ] **[partial]** `splitter`: expose `--dry-splitter-handle-{line-color,grip-color,grip-color-hover}` overrides backed by existing token defaults. _As of 2026-05-04: only `--dry-splitter-handle-z-index` is exposed (in `splitter-handle.svelte:89`); the three color tokens are still missing._
- [ ] `menubar`: expose `--dry-menubar-{bg,border,radius}` to mirror command-palette and dropdown-menu.
- [ ] **[partial]** `textarea`: namespace tokens to `--dry-textarea-*` falling through to `--dry-input-*` then `--dry-form-control-*`. Today textarea reuses `--dry-input-*` directly so consumers cannot theme inputs and textareas independently. _As of 2026-05-04: the `--dry-input-*` → `--dry-form-control-*` fallthrough is in place, but the outer `--dry-textarea-*` namespace layer has not been added._
- [ ] `number-input`: same. Add `--dry-number-input-*` falling through to `--dry-input-*`.
- [ ] `toggle/toggle-button.svelte:69`: add `var(--dry-toggle-thumb-bg, var(--dry-color-bg-raised))` fallback to the SVG `fill` (currently bare `var()` resolves to nothing).

## Phase 5. Cleanup

- [ ] `packages/ui/src/chat-thread/chat-thread.svelte:2, 81, 102`: replace `await tick()` with `requestAnimationFrame` or a microtask flush. `tick()` is banned per the `feedback_no_tick` rule. Also replace 220ms keyframe magic number with `var(--dry-duration-normal)` + `var(--dry-ease-out)`.
- [ ] `packages/ui/src/file-upload/file-upload-list.svelte:23-36` and `file-upload-item.svelte:20-62`: dead CSS. Selectors target `[data-fu-list]` / `[data-fu-item]` attributes the rendered DOM never sets. Either add the attributes or delete the style blocks.
- [ ] `packages/ui/src/marquee/marquee.svelte`: rename internal wiring `--marquee-{duration,gap,shift}` to `--_marquee-*` (or fold into `--dry-marquee-*` namespace) so they collide with neither consumer overrides nor public tokens.
- [ ] `packages/ui/src/notification-center/notification-center-panel.svelte:130, 132, 134`, `notification-center-item.svelte:47`: drop redundant hex fallbacks inside `var()`. Theme tokens always load.
- [ ] `packages/ui/src/toast/toast-root.svelte:155, 163, 167`: same.
- [ ] `packages/ui/src/stepper/stepper-step-button.svelte:76, 107`: token-wrap the indicator-empty fill (`var(--dry-color-fill-base, transparent)` rather than bare `transparent`) so theming docs can explain the convention.
- [ ] `packages/ui/src/flip-card/flip-card-root.svelte:92-93`: rename `--dry-btn-{bg,border}: transparent` overrides on the toggle-shell to a dedicated `--dry-flip-card-toggle-overlay-*` so the "ghost clickable" pattern reads explicitly.

## Out of scope (already clean, do not touch)

The following components passed all checks. Use them as references when applying fixes elsewhere:

**Layout primitives**: `container`, `splitter`, `spacer`, `aspect-ratio`, `scroll-area`, `focus-trap`, `portal`, `visually-hidden`, `sidebar`.

**Surfaces**: `alert`, `alert-dialog`, `dialog`, `drawer`, `popover`, `hover-card`, `backdrop`.

**Form text inputs**: `input-group`, `phone-input`, `pin-input`, `prompt-input`, `rich-text-editor`.

**Form selectors**: `toggle` (token contract is best-in-class), `combobox` (theming clean, only seam fix).

**Date/time/sliders**: `calendar`, `range-calendar`, `date-field`, `date-picker`, `date-range-picker`, `date-time-input`, `color-picker`, `alpha-slider`, `slider`, `rating`, `field`, `fieldset`, `label`, `separator`.

**Buttons**: `button`, `theme-toggle`, `clipboard`, `hotkey`.

**Data display**: `table`, `list`, `description-list`, `tree`, `pagination` (root only), `infinite-scroll`, `virtual-list`, `progress-ring`.

**Text/format/media**: `heading`, `text`, `typography`, `image`, `image-comparison`, `logo-mark`, `svg`, `link-preview`, `table-of-contents` (modulo Phase 2 fixes).

**Navigation**: `accordion`, `breadcrumb`, `command-palette`, `context-menu`, `dropdown-menu`, `menubar`, `navigation-menu`, `tabs`, `toolbar`, `carousel`, `collapsible`.

**Feedback/animation**: `toast`, `notification-center`, `spinner`, `shimmer`, `skeleton`, `typing-indicator`, `reveal`, `mask-reveal`, `marquee` (modulo Phase 5 rename), `beam`, `border-beam`, `chromatic-aberration`, `displacement`, `glow`, `halftone`, `noise`, `shader-canvas`, `adjust`, `kbd`.

**Specialized**: `diagram`, `timeline`, `token-scope`.

**Internal primitives** (`packages/ui/src/internal/`): `calendar-grid-button`, `close-button-base`, `menu-{group,item,label,separator}`, `modal-content`, `nav-arrow-button`, `picker-popover-content`. All shared-private and theming-clean.

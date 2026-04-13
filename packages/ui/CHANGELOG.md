# @dryui/ui

## 1.0.0

### Major Changes

- [`5e900f5`](https://github.com/rob-balfre/dryui/commit/5e900f52e89bf204edbf540bba8b24a7ea1a0acb) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Remove `Flex`, `Stack`, and `Grid` primitives.

  These primitives contradicted the DryUI layout philosophy ("Layout is raw CSS grid — do not use Grid, Stack, or Flex components") and had zero internal consumers. Removed to align the published surface with the documented rule. Use raw `display: grid` with CSS custom properties and `@container` queries instead — see the `dryui-css` skill or CLAUDE.md for the canonical patterns.

- [`313e94c`](https://github.com/rob-balfre/dryui/commit/313e94c3cd6dbcaa4924b51f365529078ed14d42) Thanks [@rob-balfre](https://github.com/rob-balfre)! - **Breaking:** Remove `OptionSwatchGroup` — use `OptionPicker` instead. `OptionPicker.Preview` replaces `OptionSwatchGroup.Swatch` and supports the same color/shape props, so the migration is a mechanical rename:

  ```svelte
  <!-- before -->
  <OptionSwatchGroup.Root bind:value={color}>
  	<OptionSwatchGroup.Item value="sage">
  		<OptionSwatchGroup.Swatch color="#7da174" />
  		<OptionSwatchGroup.Label>Sage</OptionSwatchGroup.Label>
  	</OptionSwatchGroup.Item>
  </OptionSwatchGroup.Root>

  <!-- after -->
  <OptionPicker.Root bind:value={color}>
  	<OptionPicker.Item value="sage">
  		<OptionPicker.Preview color="#7da174" />
  		<OptionPicker.Label>Sage</OptionPicker.Label>
  	</OptionPicker.Item>
  </OptionPicker.Root>
  ```

  The shared selection context has moved from `option-swatch-group/context.svelte` to `option-picker/context.svelte` (exported as `setOptionPickerCtx` / `getOptionPickerCtx`). Consumers that only used the public compound API are unaffected.

### Minor Changes

- [`313e94c`](https://github.com/rob-balfre/dryui/commit/313e94c3cd6dbcaa4924b51f365529078ed14d42) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Add `Shimmer` — a warm highlight sweep that animates across wrapped text and inline icons together. Uses a duplicated-content streak layer with an animated `mask-image: linear-gradient()` so the effect paints uniformly over glyphs and `currentColor` SVG strokes (e.g. lucide icons) in a single element. Exposes `color` and `duration` props plus `--dry-shimmer-{color,duration,gap}` CSS custom properties. Automatically freezes under `prefers-reduced-motion: reduce`.

- [`06e99c6`](https://github.com/rob-balfre/dryui/commit/06e99c612e40398b7febb8e1af938ec1bcd73a8e) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Add shared state tokens: `--dry-focus-ring` and `--dry-state-disabled-opacity` (duration tokens `--dry-duration-fast`/`--dry-duration-normal`/`--dry-duration-slow` and `--dry-ease-default` already existed and are now the single source of truth).

  Migrated 37 focus-ring sites, 17 disabled-state sites, and 11 raw-duration sites in `@dryui/ui` to consume these tokens (the two flip-card sites intentionally retain `var(--dry-flip-card-duration, 0.6s)` for the long flip animation). Consumers can now restyle focus and disabled state by overriding a single CSS variable.

  `@dryui/lint` gains a new `dryui/prefer-focus-ring-token` rule that flags any new occurrences of `outline: 2px solid var(--dry-color-focus-ring)` literals in scoped styles.

- [`d0ec666`](https://github.com/rob-balfre/dryui/commit/d0ec666287883253a9a31ff455483bc00cadc4bb) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Diagram: close out the deferred work tracked in `packages/ui/src/diagram/PLAN.md`.
  - `DiagramCluster.labelPosition` accepts `'top-left'` (default) or `'left'`. The layout reserves the gutter on the chosen edge and `<Diagram />` rotates the label group via `transform="rotate(-90 …)"`.
  - Forward edge labels slide along the polyline to stay `LABEL_BORDER_AVOID_PX` (28) away from cluster boundaries via the new `computeLabelAnchor` helper and `superNodeIds` option.
  - `layoutNested` is now recursive, supporting nested directed clusters and flat clusters nested inside directed clusters.
  - Cross-boundary back edges anchor at the inner node instead of the cluster super-node. `layoutLayeredPass` is split into `computeLayeredPositions` + `finishLayeredPass` so the orchestrator can derive global inner-node positions and feed them to `computeEdgePaths` via `backEdgeAnchorOverrides`. Forward cross-boundary edges intentionally keep super-node anchoring.
  - Two-tier caching: a `WeakMap` on `computeLayout` for full-result identity caching and an LRU `subLayoutCache` keyed on leaf sub-layout content so unchanged inner clusters skip the pipeline on subsequent calls.

- [`06e99c6`](https://github.com/rob-balfre/dryui/commit/06e99c612e40398b7febb8e1af938ec1bcd73a8e) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Add `--dry-form-control-*` shared token family for input, textarea, combobox, and color-picker form controls. Per-component `--dry-<name>-*` overrides still work — they now resolve through the shared family by default, so consumers can restyle all form controls with one change.

### Patch Changes

- Updated dependencies [[`313e94c`](https://github.com/rob-balfre/dryui/commit/313e94c3cd6dbcaa4924b51f365529078ed14d42), [`06e99c6`](https://github.com/rob-balfre/dryui/commit/06e99c612e40398b7febb8e1af938ec1bcd73a8e), [`d0ec666`](https://github.com/rob-balfre/dryui/commit/d0ec666287883253a9a31ff455483bc00cadc4bb), [`5e900f5`](https://github.com/rob-balfre/dryui/commit/5e900f52e89bf204edbf540bba8b24a7ea1a0acb), [`313e94c`](https://github.com/rob-balfre/dryui/commit/313e94c3cd6dbcaa4924b51f365529078ed14d42)]:
  - @dryui/primitives@1.0.0

## 0.5.2

### Patch Changes

- [`1d519e3`](https://github.com/rob-balfre/dryui/commit/1d519e3c7287f569f9ae69e7c464b34ac49dff9b) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Fix `Select.Trigger` content alignment — when the trigger stretches to fill its container, the value label now sits at the inline-start and the chevron indicator at the inline-end, instead of both being center-grouped. Implemented by wrapping the trigger `Button` in a grid root that sets `--dry-btn-justify: space-between` and `--dry-btn-align: center`.

- Updated dependencies [[`1d519e3`](https://github.com/rob-balfre/dryui/commit/1d519e3c7287f569f9ae69e7c464b34ac49dff9b)]:
  - @dryui/primitives@0.5.2

## 0.5.1

### Patch Changes

- [`79e4ab5`](https://github.com/rob-balfre/dryui/commit/79e4ab5740624fa6f2236c63367722314c3db210) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Re-sync `@dryui/primitives` and `@dryui/ui` versions and lock them together via the `fixed` changesets config.

  Previously the packages were under `linked: [["@dryui/primitives", "@dryui/ui"]]`, which only enforces equal versions _when both packages are already being bumped in the same release_. Earlier releases that listed only `@dryui/ui` in a changeset left `@dryui/primitives` behind, so they drifted (ui was at `0.5.0` while primitives was still at `0.4.0`).

  This release:
  - Moves the pair to `fixed: [["@dryui/primitives", "@dryui/ui"]]`, which forces both packages to bump together even if a future changeset only lists one of them.
  - Bumps both packages so they realign on the same version and `@dryui/ui`'s internal `@dryui/primitives` dep range is refreshed to the new major.minor.

- Updated dependencies [[`79e4ab5`](https://github.com/rob-balfre/dryui/commit/79e4ab5740624fa6f2236c63367722314c3db210)]:
  - @dryui/primitives@0.5.1

## 0.5.0

### Minor Changes

- [`fa63bd3`](https://github.com/rob-balfre/dryui/commit/fa63bd3e027637b0b9e41f07fd52eaa1d4fafadf) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Add `OptionPicker` compound component and refactor theme wizard controls.
  - **New `OptionPicker`** — a selectable-tile compound component with `Root` / `Item` / `Preview` / `Label` / `Description` / `Meta` parts. Supports vertical/horizontal orientation, a `columns` prop, per-item `layout="stacked"` and `size="visual" | "compact"` variants, and preview slots for presets, fonts, and shape hints.
  - **`OptionSwatchGroup`** — add `columns` prop on `Root` (1–4), a `size="compact"` variant on `Item` for swatch-only grids, and refactor the swatch color wiring onto an `{@attach}` instead of an `$effect` on raw `style.cssText`.
  - **`Button`** — expose `--dry-btn-trigger-open-bg` / `-color` / `-border` CSS vars so trigger buttons can be styled independently when `aria-expanded="true"`.
  - **`MegaMenu`** — panel background is now themable via `--dry-mega-menu-panel-bg`, and `MegaMenu.Link` renders hover/selected states (`data-selected`, `aria-pressed="true"`, `aria-current="true"`) with matching `--dry-mega-menu-link-{hover,selected}-{bg,border,shadow}` hooks.
  - **`Sidebar`** — `sidebar-item` switches from `grid-auto-flow: column` to an explicit `max-content 1fr max-content` template so items can render a leading icon, a flex label, and an optional trailing element (e.g. an external-link glyph).
  - **MCP spec** — register `OptionPicker` metadata so it appears in `spec.json`, `contract.v1.json`, and `llms*.txt` (145 components total).

## 0.4.1

### Patch Changes

- [`f8c88f9`](https://github.com/rob-balfre/dryui/commit/f8c88f986fedf09002659a635512ffc3fe2a0173) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Fix `MultiSelectCombobox` token layout and Button `icon-sm`/`icon-lg` sizing.
  - `MultiSelectCombobox.Root`: tokens were stacking one-per-row instead of wrapping inline. Root cause: `grid-template-columns: repeat(auto-fill, minmax(min-content, max-content))` is invalid under the CSS Grid spec — `auto-fill`/`auto-fit` require a `<fixed-size>` min, and `min-content` isn't fixed, so the browser fell back to single-column layout. Replaced with `repeat(auto-fit, minmax(48px, max-content))` + `justify-content: start` so tokens pack from the left and empty tracks collapse.
  - `Button` `icon-sm` and `icon-lg` sizes were both hardcoded to `height: var(--dry-space-12)` (48px), matching `icon`. Fixed so the three icon sizes mirror the pattern of `sm`/`md`/`lg`: icon-sm → 32px, icon → 48px, icon-lg → 56px. This makes the `×` close button inside `MultiSelectCombobox` and similar pill tokens render at an appropriate 32px instead of dominating the pill at 48px.

## 0.4.0

### Minor Changes

- [`67a4de9`](https://github.com/rob-balfre/dryui/commit/67a4de9e7c3812e65d1bb61bea6fcbaf1ed192bd) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Ban `<svelte:element this={x}>` anti-pattern across the library, fix Toggle misalignment, and simplify a few compound components.

  **Breaking changes**
  - `Card.Root`: dropped `'a'` from the `as` prop union. Only `'div'` (default) and `'button'` are supported. Replace `<Card.Root as="a" href="/foo">` with `<a href="/foo"><Card.Root>…</Card.Root></a>` or use an interactive card via `as="button"` + `onclick`.
  - `LinkPreview.Trigger`: `href` is now required. Previously optional with no navigation target, which produced an invalid anchor at runtime.
  - `PinInput`: renamed the cell state type from `PinInputCell` to `PinInputCellState` so it no longer collides with the `PinInput.Cell` component. The old type alias is removed — update imports from `import type { PinInputCell } from '@dryui/primitives'` to `import type { PinInputCellState } from '@dryui/primitives'`.

  **Non-breaking changes**
  - `Button`: added `--dry-btn-justify`, `--dry-btn-align`, and `--dry-btn-min-height` CSS custom properties so consumers (like `Toggle`) can override layout defaults without fighting the base styles.
  - `Toggle`: thumb no longer overflows the track on the right edge. Root cause was `Button`'s hardcoded `justify-content: center` and `min-height: var(--dry-space-12)` — now variable-driven. Also fixed `--_thumb-travel` for `sm` and `md` sizes to subtract the 2px border width, matching the existing `lg` pattern.
  - `MegaMenu.Link` and `Card.Root`: replaced `<svelte:element this={…}>` with explicit `{#if}/{:else}` branches rendering concrete `<button>` / `<a>` / `<div>` tags. Element-specific UA resets (appearance, background, border, font, text-align) now live in scoped styles so the rendered elements look correct regardless of which branch is taken.
  - `PageHeader.Title`: unchanged — still `<svelte:element this={\`h${level}\`}>`for h1–h6. The new`dryui/no-svelte-element`lint rule exempts this via a`<!-- dryui-allow svelte-element -->` comment.
  - Removed the unused internal `result-card-shell.svelte` (zero imports).

### Patch Changes

- Updated dependencies [[`67a4de9`](https://github.com/rob-balfre/dryui/commit/67a4de9e7c3812e65d1bb61bea6fcbaf1ed192bd)]:
  - @dryui/primitives@0.4.0

## 0.3.0

### Minor Changes

- [`533de8c`](https://github.com/rob-balfre/dryui/commit/533de8cbb1b8414122c2f0c4406ecd67694e3aa4) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Add DragAndDrop.Group component for nested sortable groups. Enhance Diagram with tree, radial, and Sankey layout engines plus interactive pan/zoom and edge routing.

### Patch Changes

- Updated dependencies [[`533de8c`](https://github.com/rob-balfre/dryui/commit/533de8cbb1b8414122c2f0c4406ecd67694e3aa4)]:
  - @dryui/primitives@0.3.0

## 0.2.2

### Patch Changes

- Fix sidebar content padding using `0px` instead of `0` for CSS custom property compatibility

## 0.2.1

### Patch Changes

- [`05aee9b`](https://github.com/rob-balfre/dryui/commit/05aee9b834136baa38fc1428a544953fc48816aa) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Fix CommandPalette scroll-through — results list now scrolls internally instead of scrolling the page behind the dialog

## 0.2.0

### Minor Changes

- [`2b501d2`](https://github.com/rob-balfre/dryui/commit/2b501d258f4f7397e0d5642d72d0867a407372a3) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Review-driven improvements from dogfooding a flight search app.

  **@dryui/ui**
  - Add `LogoMark` component for brand marks, status indicators, and category badges
  - Add `options` prop shorthand to `Select.Root` for simple dropdowns (`<Select.Root options={['A','B']} />`)

  **@dryui/primitives**
  - Add `options` and `placeholder` props to `SelectRootProps`

  **@dryui/mcp**
  - Add `tokens` tool for `--dry-*` CSS token discovery with category filtering
  - Batch-friendly `info` tool — accepts comma-separated component names
  - Smarter `prefer-grid-layout` reviewer suggestion — suppresses for complex grids (>3 tracks, named areas, subgrid, minmax, repeat)
  - Add `aligned-card-list` composition recipe (CSS subgrid pattern)

  **@dryui/cli**
  - Add `tokens` command for `--dry-*` CSS token listing
  - Batch-friendly `info` command — accepts comma-separated names

  **@dryui/lint**
  - Allow `display: inline-flex` (no longer flagged by `dryui/no-flex`)
  - Add `/* dryui-allow flex */` comment to suppress flex violations per declaration

### Patch Changes

- Updated dependencies [[`2b501d2`](https://github.com/rob-balfre/dryui/commit/2b501d258f4f7397e0d5642d72d0867a407372a3)]:
  - @dryui/primitives@0.2.0

## 0.1.13

### Patch Changes

- [`1d85a8b`](https://github.com/rob-balfre/dryui/commit/1d85a8b0ecec8242d97b686edf697765591bfd7b) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Fixed effect loop in map marker and popup components by using `untrack()` when reading previous instances during cleanup.

- Updated dependencies [[`1d85a8b`](https://github.com/rob-balfre/dryui/commit/1d85a8b0ecec8242d97b686edf697765591bfd7b)]:
  - @dryui/primitives@0.1.13

## 0.1.12

### Patch Changes

- [`5e3c4ec`](https://github.com/rob-balfre/dryui/commit/5e3c4ec2c52773938b86c8021875cc3c742994bb) Thanks [@rob-balfre](https://github.com/rob-balfre)! - fix: eliminate flash-on-load across 25+ components by adding CSS fallback defaults

  Components previously set initial styles via JS `@attach` + `setProperty` which runs after first paint, causing a visible flash/glitch on page load. Now scoped `<style>` blocks include CSS fallback defaults matching default prop values, so first paint renders correctly. The `@attach` still overrides reactively when props change.

- Updated dependencies [[`5e3c4ec`](https://github.com/rob-balfre/dryui/commit/5e3c4ec2c52773938b86c8021875cc3c742994bb)]:
  - @dryui/primitives@0.1.12

## 0.1.11

### Patch Changes

- Add base CSS resets to default theme — importing default.css now sets box-sizing, margin, background, color, and min-height automatically. No separate reset CSS needed.

## 0.1.10

### Patch Changes

- Republish with correct dist/ exports (prepack hook now runs during publish)

- Updated dependencies []:
  - @dryui/primitives@0.1.10

## 0.1.9

### Patch Changes

- [`c0445e0`](https://github.com/rob-balfre/dryui/commit/c0445e0132440576293d851f3020a91bad3126f7) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Fix published package exports pointing to src/ instead of dist/

  npm publish was shipping package.json with exports pointing to `./src/` paths,
  but only `dist/` was included in the package. Added prepack/postpack scripts
  that rewrite exports to `./dist/` paths before publishing and restore afterward.

- Updated dependencies [[`c0445e0`](https://github.com/rob-balfre/dryui/commit/c0445e0132440576293d851f3020a91bad3126f7)]:
  - @dryui/primitives@0.1.9

## 0.1.8

### Patch Changes

- Native plugin/skill install for all major AI coding tools
  - Claude Code plugin: `claude plugin marketplace add rob-balfre/dryui && claude plugin install dryui@rob-balfre/dryui`
  - Codex: `$skill-installer install` with MCP dependency in agents/openai.yaml
  - Copilot/Cursor/Windsurf: `npx degit` for Agent Skills + MCP config
  - Zed: AGENTS.md + MCP config
  - Updated docs tools page with 6 agent tabs

## 0.1.7

### Patch Changes

- [`2a73f9d`](https://github.com/rob-balfre/dryui/commit/2a73f9d6344c596f0f678417b6ce4ed1b9d95e01) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Fix backdrop centering and notification center panel positioning
  - Backdrop: use align-items instead of place-items so children can control their own inline sizing
  - NotificationCenter: use popovertarget on trigger instead of manual toggle handler
  - NotificationCenter panel: nudge into viewport when anchor positioning overflows
  - NotificationCenter panel: responsive width via min(), hide when not popover-open
  - NotificationCenter: replace hardcoded color fallbacks with theme tokens
  - NotificationCenter: use color-mix for unread item background
  - NotificationCenter trigger: add cursor pointer

- [`2515334`](https://github.com/rob-balfre/dryui/commit/2515334757c50a26121884abeb3daecfe927cd6d) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Fix date/time component rendering and replace native time input
  - Fix container-type: inline-size collapse bug in DatePicker calendar, DateField, and Select
  - Replace native `<input type="time">` in TimeInput with DryUI Select dropdowns (hour + minute)
  - Fix DateRangePicker: seamless cell-level range band, readable text on range endpoints
  - Switch DateTimeInput from DateField to DatePicker for calendar popup
  - Add min-height to Select trigger with sm variant override
  - Fix DateField segment focus style for click interactions

- Updated dependencies [[`2a73f9d`](https://github.com/rob-balfre/dryui/commit/2a73f9d6344c596f0f678417b6ce4ed1b9d95e01)]:
  - @dryui/primitives@0.1.7

## 0.1.6

### Patch Changes

- fix(carousel): slides now fill full viewport width

  `grid-auto-columns` was using `minmax(0, 100%)` which allowed columns to shrink to content size, causing all slides to appear side-by-side. Changed to `100%` so each slide is always exactly the container's full width.

## 0.1.5

### Patch Changes

- fix: republish with correct exports (publishConfig swap was missing in v0.1.4)

  The previous publish shipped package.json exports pointing to ./src/ instead of ./dist/,
  causing Vite 7+ to fail with "Failed to resolve entry for package". This republish
  ensures the publishConfig.exports swap is applied correctly.

- Updated dependencies []:
  - @dryui/primitives@0.1.5

## 0.1.4

### Patch Changes

- Update components with improved scoped styles, @attach migration, and new theme tokens. Add browser tests for date-field, field, image-comparison, and input-group.

- Updated dependencies []:
  - @dryui/primitives@0.1.4

## 0.1.3

### Patch Changes

- Improve button-group with context-based orientation, enhance rich-text-editor with placeholder and data attributes, refine virtual-list defaults, and clean up stale data attributes from map, file-upload, date-range-picker, and range-calendar components.

- Updated dependencies []:
  - @dryui/primitives@0.1.3

## 0.1.2

### Patch Changes

- Fix theme CSS exports pointing to src/ instead of dist/, causing unresolved imports on fresh installs

## 0.1.1

### Patch Changes

- Fix workspace:\* dependencies that broke npm installs

## 0.1.0

### Minor Changes

- [`a3ced6e`](https://github.com/rob-balfre/dryui/commit/a3ced6ef72d256a07977b3803e9e9e5df881bfa2) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Add 58 new components and theme creator

  **58 new components:** AppBar, Backdrop, ButtonGroup, Calendar, Carousel, Chart, ChatMessage, ChatThread, Chip, ChipGroup, CountrySelect, DateField, DateRangePicker, DateTimeInput, DescriptionList, Fieldset, FlipCard, FormatBytes, FormatDate, FormatNumber, Gauge, Heading, HoverCard, Image, ImageComparison, Kbd, Link, LinkPreview, List, Listbox, LogoCloud, Map, MegaMenu, Menubar, Navbar, NavigationMenu, NotificationCenter, PageHeader, PageLayout, PhoneInput, ProgressRing, PromptInput, RangeCalendar, RelativeTime, SeatMap, SegmentedControl, Sidebar, Sparkline, StatCard, TableOfContents, Text, TimeInput, Timeline, Tree, TypingIndicator, Typography, VideoEmbed, WaveDivider

  **56 with styled UI layer;** Heading and Text are primitives-only exports

  **Theme changes:** replaced hardcoded dark-mode overrides with `color-mix()`, migrated transition durations to `--dry-duration-*` tokens, changed `--dry-text-base-size` from `1rem` to `1.125rem`, added `--dry-color-surface-overlay` dark token

### Patch Changes

- Updated dependencies [[`a3ced6e`](https://github.com/rob-balfre/dryui/commit/a3ced6ef72d256a07977b3803e9e9e5df881bfa2)]:
  - @dryui/primitives@0.1.0

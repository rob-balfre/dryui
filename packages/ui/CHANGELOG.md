# @dryui/ui

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

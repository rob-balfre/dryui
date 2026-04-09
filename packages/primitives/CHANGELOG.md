# @dryui/primitives

## 0.1.13

### Patch Changes

- [`1d85a8b`](https://github.com/rob-balfre/dryui/commit/1d85a8b0ecec8242d97b686edf697765591bfd7b) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Fixed effect loop in map marker and popup components by using `untrack()` when reading previous instances during cleanup.

## 0.1.12

### Patch Changes

- [`5e3c4ec`](https://github.com/rob-balfre/dryui/commit/5e3c4ec2c52773938b86c8021875cc3c742994bb) Thanks [@rob-balfre](https://github.com/rob-balfre)! - fix: eliminate flash-on-load across 25+ components by adding CSS fallback defaults

  Components previously set initial styles via JS `@attach` + `setProperty` which runs after first paint, causing a visible flash/glitch on page load. Now scoped `<style>` blocks include CSS fallback defaults matching default prop values, so first paint renders correctly. The `@attach` still overrides reactively when props change.

## 0.1.10

### Patch Changes

- Republish with correct dist/ exports (prepack hook now runs during publish)

## 0.1.9

### Patch Changes

- [`c0445e0`](https://github.com/rob-balfre/dryui/commit/c0445e0132440576293d851f3020a91bad3126f7) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Fix published package exports pointing to src/ instead of dist/

  npm publish was shipping package.json with exports pointing to `./src/` paths,
  but only `dist/` was included in the package. Added prepack/postpack scripts
  that rewrite exports to `./dist/` paths before publishing and restore afterward.

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

## 0.1.5

### Patch Changes

- fix: republish with correct exports (publishConfig swap was missing in v0.1.4)

  The previous publish shipped package.json exports pointing to ./src/ instead of ./dist/,
  causing Vite 7+ to fail with "Failed to resolve entry for package". This republish
  ensures the publishConfig.exports swap is applied correctly.

## 0.1.4

### Patch Changes

- Update components with improved scoped styles, @attach migration, and new theme tokens. Add browser tests for date-field, field, image-comparison, and input-group.

## 0.1.3

### Patch Changes

- Improve button-group with context-based orientation, enhance rich-text-editor with placeholder and data attributes, refine virtual-list defaults, and clean up stale data attributes from map, file-upload, date-range-picker, and range-calendar components.

## 0.1.0

### Minor Changes

- [`a3ced6e`](https://github.com/rob-balfre/dryui/commit/a3ced6ef72d256a07977b3803e9e9e5df881bfa2) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Add 58 new components and theme creator

  **58 new components:** AppBar, Backdrop, ButtonGroup, Calendar, Carousel, Chart, ChatMessage, ChatThread, Chip, ChipGroup, CountrySelect, DateField, DateRangePicker, DateTimeInput, DescriptionList, Fieldset, FlipCard, FormatBytes, FormatDate, FormatNumber, Gauge, Heading, HoverCard, Image, ImageComparison, Kbd, Link, LinkPreview, List, Listbox, LogoCloud, Map, MegaMenu, Menubar, Navbar, NavigationMenu, NotificationCenter, PageHeader, PageLayout, PhoneInput, ProgressRing, PromptInput, RangeCalendar, RelativeTime, SeatMap, SegmentedControl, Sidebar, Sparkline, StatCard, TableOfContents, Text, TimeInput, Timeline, Tree, TypingIndicator, Typography, VideoEmbed, WaveDivider

  **56 with styled UI layer;** Heading and Text are primitives-only exports

  **Theme changes:** replaced hardcoded dark-mode overrides with `color-mix()`, migrated transition durations to `--dry-duration-*` tokens, changed `--dry-text-base-size` from `1rem` to `1.125rem`, added `--dry-color-surface-overlay` dark token

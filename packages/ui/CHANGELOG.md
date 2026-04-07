# @dryui/ui

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

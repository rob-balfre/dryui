# Component Coverage Matrix

Generated: 2026-04-20T07:19:44.279Z

Scope: public `@dryui/ui` components from `packages/mcp/src/spec.json`.

## Summary By Tier

| Tier  | Components | Browser Specs | Unit Tests | Docs Demos | Docs Routes | Docs Visual Tests |
| ----- | ---------: | ------------: | ---------: | ---------: | ----------: | ----------------: |
| tier0 |         24 |            24 |         10 |         24 |          24 |                24 |
| tier1 |          6 |             6 |          0 |          6 |           6 |                 6 |
| tier2 |        117 |            21 |         28 |        117 |         117 |               117 |

## High-Risk Gaps

- Tier 0 components without a dedicated browser spec: none
- Components without browser or unit tests: AlertDialog, AlphaSlider, AppFrame, AspectRatio, Aurora, Backdrop, Breadcrumb, ButtonGroup, ChatThread, Chip, ChipGroup, ChromaticAberration, ChromaticShift, Clipboard, CommandPalette, DateTimeInput, DescriptionList, Displacement, DropZone, Fieldset, FileUpload, FlipCard, FloatButton, FocusTrap, FormatBytes, FormatDate, FormatNumber, Gauge, Glass, Glow, GodRays, GradientMesh, Halftone, InfiniteScroll, Kbd, LinkPreview, Listbox, LogoMark, Marquee, MaskReveal, NavigationMenu, Noise, NumberInput, OptionPicker, Pagination, Portal, Progress, ProgressRing, QRCode, Rating, RelativeTime, Reveal, ScrollToTop, SegmentedControl, Shimmer, Skeleton, Slider, Spacer, Sparkline, Spinner, Splitter, Spotlight, StarRating, Stepper, Svg, TableOfContents, Tag, TagsInput, TimeInput, Timeline, Toast, ToggleGroup, Toolbar, Tour, TypingIndicator, VideoEmbed, VirtualList, VisuallyHidden
- Components without a docs route or docs demo: none

## Full Matrix

| Component           | Tier  | Category    | Browser Specs | Unit Tests | Docs Demos | Docs Route                        | Docs Visual |
| ------------------- | ----- | ----------- | ------------: | ---------: | ---------: | --------------------------------- | ----------- |
| Button              | tier0 | action      |             2 |         10 |         17 | /components/button                | yes         |
| Calendar            | tier0 | form        |             2 |          0 |          1 | /components/calendar              | yes         |
| Checkbox            | tier0 | input       |             1 |          0 |          2 | /components/checkbox              | yes         |
| Combobox            | tier0 | form        |             2 |          1 |          1 | /components/combobox              | yes         |
| ContextMenu         | tier0 | overlay     |             1 |          0 |          1 | /components/context-menu          | yes         |
| DatePicker          | tier0 | form        |             1 |          1 |          1 | /components/date-picker           | yes         |
| DateRangePicker     | tier0 | form        |             1 |          0 |          1 | /components/date-range-picker     | yes         |
| Dialog              | tier0 | overlay     |             1 |          3 |          1 | /components/dialog                | yes         |
| Drawer              | tier0 | overlay     |             1 |          0 |          1 | /components/drawer                | yes         |
| DropdownMenu        | tier0 | overlay     |             1 |          0 |          1 | /components/dropdown-menu         | yes         |
| Field               | tier0 | form        |             2 |          1 |          3 | /components/field                 | yes         |
| FileSelect          | tier0 | input       |             1 |          1 |          1 | /components/file-select           | yes         |
| HoverCard           | tier0 | overlay     |             1 |          0 |          1 | /components/hover-card            | yes         |
| Input               | tier0 | input       |             5 |          5 |          4 | /components/input                 | yes         |
| MegaMenu            | tier0 | navigation  |             1 |          0 |          1 | /components/mega-menu             | yes         |
| Menubar             | tier0 | navigation  |             2 |          0 |          1 | /components/menubar               | yes         |
| MultiSelectCombobox | tier0 | form        |             1 |          0 |          1 | /components/multi-select-combobox | yes         |
| Popover             | tier0 | overlay     |             1 |          1 |          1 | /components/popover               | yes         |
| RadioGroup          | tier0 | input       |             1 |          0 |          1 | /components/radio-group           | yes         |
| RangeCalendar       | tier0 | form        |             1 |          0 |          1 | /components/range-calendar        | yes         |
| Select              | tier0 | form        |             3 |          1 |          1 | /components/select                | yes         |
| Textarea            | tier0 | input       |             1 |          1 |          1 | /components/textarea              | yes         |
| Toggle              | tier0 | action      |             3 |          0 |          2 | /components/toggle                | yes         |
| Tooltip             | tier0 | overlay     |             1 |          0 |          1 | /components/tooltip               | yes         |
| Carousel            | tier1 | display     |             1 |          0 |          1 | /components/carousel              | yes         |
| Chart               | tier1 | display     |             1 |          0 |          1 | /components/chart                 | yes         |
| NotificationCenter  | tier1 | overlay     |             1 |          0 |          1 | /components/notification-center   | yes         |
| RichTextEditor      | tier1 | input       |             1 |          0 |          1 | /components/rich-text-editor      | yes         |
| Transfer            | tier1 | input       |             1 |          0 |          1 | /components/transfer              | yes         |
| Tree                | tier1 | display     |             1 |          0 |          1 | /components/tree                  | yes         |
| Accordion           | tier2 | display     |             2 |          0 |          1 | /components/accordion             | yes         |
| Adjust              | tier2 | visual      |             0 |          1 |          1 | /components/adjust                | yes         |
| Alert               | tier2 | feedback    |             1 |          2 |          1 | /components/alert                 | yes         |
| AlertDialog         | tier2 | overlay     |             0 |          0 |          1 | /components/alert-dialog          | yes         |
| AlphaSlider         | tier2 | input       |             0 |          0 |          1 | /components/alpha-slider          | yes         |
| AppFrame            | tier2 | layout      |             0 |          0 |          1 | /components/app-frame             | yes         |
| AspectRatio         | tier2 | layout      |             0 |          0 |          1 | /components/aspect-ratio          | yes         |
| Aurora              | tier2 | layout      |             0 |          0 |          1 | /components/aurora                | yes         |
| Avatar              | tier2 | display     |             1 |          2 |          1 | /components/avatar                | yes         |
| Backdrop            | tier2 | overlay     |             0 |          0 |          1 | /components/backdrop              | yes         |
| Badge               | tier2 | display     |             0 |          3 |         13 | /components/badge                 | yes         |
| Beam                | tier2 | visual      |             0 |          1 |          1 | /components/beam                  | yes         |
| BorderBeam          | tier2 | visual      |             0 |          1 |          1 | /components/border-beam           | yes         |
| Breadcrumb          | tier2 | navigation  |             0 |          0 |          1 | /components/breadcrumb            | yes         |
| ButtonGroup         | tier2 | action      |             0 |          0 |          1 | /components/button-group          | yes         |
| Card                | tier2 | display     |             2 |          9 |          7 | /components/card                  | yes         |
| ChatThread          | tier2 | display     |             0 |          0 |          1 | /components/chat-thread           | yes         |
| Chip                | tier2 | action      |             0 |          0 |          1 | /components/chip                  | yes         |
| ChipGroup           | tier2 | action      |             0 |          0 |          1 | /components/chip-group            | yes         |
| ChromaticAberration | tier2 | visual      |             0 |          0 |          1 | /components/chromatic-aberration  | yes         |
| ChromaticShift      | tier2 | visual      |             0 |          0 |          1 | /components/chromatic-shift       | yes         |
| Clipboard           | tier2 | action      |             0 |          0 |          1 | /components/clipboard             | yes         |
| CodeBlock           | tier2 | display     |             1 |          5 |          2 | /components/code-block            | yes         |
| Collapsible         | tier2 | display     |             1 |          0 |          1 | /components/collapsible           | yes         |
| ColorPicker         | tier2 | input       |             0 |          4 |          1 | /components/color-picker          | yes         |
| CommandPalette      | tier2 | overlay     |             0 |          0 |          1 | /components/command-palette       | yes         |
| Container           | tier2 | layout      |             0 |          1 |          1 | /components/container             | yes         |
| DataGrid            | tier2 | display     |             1 |          2 |          1 | /components/data-grid             | yes         |
| DateField           | tier2 | form        |             1 |          0 |          1 | /components/date-field            | yes         |
| DateTimeInput       | tier2 | input       |             0 |          0 |          1 | /components/date-time-input       | yes         |
| DescriptionList     | tier2 | display     |             0 |          0 |          1 | /components/description-list      | yes         |
| Diagram             | tier2 | display     |             0 |          1 |          1 | /components/diagram               | yes         |
| Displacement        | tier2 | visual      |             0 |          0 |          1 | /components/displacement          | yes         |
| DragAndDrop         | tier2 | interaction |             1 |          0 |          1 | /components/drag-and-drop         | yes         |
| DropZone            | tier2 | input       |             0 |          0 |          1 | /components/drop-zone             | yes         |
| Fieldset            | tier2 | form        |             0 |          0 |          1 | /components/fieldset              | yes         |
| FileUpload          | tier2 | input       |             0 |          0 |          1 | /components/file-upload           | yes         |
| FlipCard            | tier2 | display     |             0 |          0 |          1 | /components/flip-card             | yes         |
| FloatButton         | tier2 | action      |             0 |          0 |          1 | /components/float-button          | yes         |
| FocusTrap           | tier2 | utility     |             0 |          0 |          1 | /components/focus-trap            | yes         |
| FormatBytes         | tier2 | display     |             0 |          0 |          1 | /components/format-bytes          | yes         |
| FormatDate          | tier2 | display     |             0 |          0 |          1 | /components/format-date           | yes         |
| FormatNumber        | tier2 | display     |             0 |          0 |          1 | /components/format-number         | yes         |
| Gauge               | tier2 | display     |             0 |          0 |          2 | /components/gauge                 | yes         |
| Glass               | tier2 | visual      |             0 |          0 |          1 | /components/glass                 | yes         |
| Glow                | tier2 | visual      |             0 |          0 |          1 | /components/glow                  | yes         |
| GodRays             | tier2 | visual      |             0 |          0 |          1 | /components/god-rays              | yes         |
| GradientMesh        | tier2 | visual      |             0 |          0 |          1 | /components/gradient-mesh         | yes         |
| Halftone            | tier2 | visual      |             0 |          0 |          1 | /components/halftone              | yes         |
| Heading             | tier2 | display     |             0 |          1 |          5 | /components/heading               | yes         |
| Hotkey              | tier2 | utility     |             1 |          1 |          1 | /components/hotkey                | yes         |
| Icon                | tier2 | display     |             0 |          1 |          1 | /components/icon                  | yes         |
| Image               | tier2 | display     |             1 |          0 |          1 | /components/image                 | yes         |
| ImageComparison     | tier2 | display     |             1 |          0 |          1 | /components/image-comparison      | yes         |
| InfiniteScroll      | tier2 | display     |             0 |          0 |          1 | /components/infinite-scroll       | yes         |
| InputGroup          | tier2 | input       |             1 |          0 |          1 | /components/input-group           | yes         |
| Kbd                 | tier2 | display     |             0 |          0 |          4 | /components/kbd                   | yes         |
| Label               | tier2 | form        |             0 |          1 |          4 | /components/label                 | yes         |
| Link                | tier2 | navigation  |             1 |          0 |          2 | /components/link                  | yes         |
| LinkPreview         | tier2 | overlay     |             0 |          0 |          1 | /components/link-preview          | yes         |
| List                | tier2 | display     |             0 |          2 |          1 | /components/list                  | yes         |
| Listbox             | tier2 | input       |             0 |          0 |          1 | /components/listbox               | yes         |
| LogoMark            | tier2 | display     |             0 |          0 |          1 | /components/logo-mark             | yes         |
| Map                 | tier2 | display     |             0 |          4 |          1 | /components/map                   | yes         |
| MarkdownRenderer    | tier2 | display     |             0 |          1 |          1 | /components/markdown-renderer     | yes         |
| Marquee             | tier2 | display     |             0 |          0 |          1 | /components/marquee               | yes         |
| MaskReveal          | tier2 | visual      |             0 |          0 |          1 | /components/mask-reveal           | yes         |
| NavigationMenu      | tier2 | navigation  |             0 |          0 |          1 | /components/navigation-menu       | yes         |
| Noise               | tier2 | layout      |             0 |          0 |          1 | /components/noise                 | yes         |
| NumberInput         | tier2 | input       |             0 |          0 |          2 | /components/number-input          | yes         |
| OptionPicker        | tier2 | input       |             0 |          0 |          1 | /components/option-picker         | yes         |
| Pagination          | tier2 | navigation  |             0 |          0 |          1 | /components/pagination            | yes         |
| PhoneInput          | tier2 | input       |             1 |          0 |          1 | /components/phone-input           | yes         |
| PinInput            | tier2 | input       |             0 |          1 |          1 | /components/pin-input             | yes         |
| Portal              | tier2 | utility     |             0 |          0 |          1 | /components/portal                | yes         |
| Progress            | tier2 | feedback    |             0 |          0 |          1 | /components/progress              | yes         |
| ProgressRing        | tier2 | feedback    |             0 |          0 |          1 | /components/progress-ring         | yes         |
| PromptInput         | tier2 | input       |             1 |          0 |          1 | /components/prompt-input          | yes         |
| QRCode              | tier2 | display     |             0 |          0 |          1 | /components/qr-code               | yes         |
| Rating              | tier2 | input       |             0 |          0 |          1 | /components/rating                | yes         |
| RelativeTime        | tier2 | display     |             0 |          0 |          1 | /components/relative-time         | yes         |
| Reveal              | tier2 | display     |             0 |          0 |          1 | /components/reveal                | yes         |
| ScrollArea          | tier2 | layout      |             1 |          0 |          1 | /components/scroll-area           | yes         |
| ScrollToTop         | tier2 | action      |             0 |          0 |          1 | /components/scroll-to-top         | yes         |
| SegmentedControl    | tier2 | form        |             0 |          0 |          1 | /components/segmented-control     | yes         |
| Separator           | tier2 | layout      |             0 |          2 |          3 | /components/separator             | yes         |
| ShaderCanvas        | tier2 | visual      |             0 |          1 |          1 | /components/shader-canvas         | yes         |
| Shimmer             | tier2 | visual      |             0 |          0 |          1 | /components/shimmer               | yes         |
| Sidebar             | tier2 | navigation  |             0 |          2 |          1 | /components/sidebar               | yes         |
| Skeleton            | tier2 | feedback    |             0 |          0 |          1 | /components/skeleton              | yes         |
| Slider              | tier2 | input       |             0 |          0 |          2 | /components/slider                | yes         |
| Spacer              | tier2 | layout      |             0 |          0 |          1 | /components/spacer                | yes         |
| Sparkline           | tier2 | display     |             0 |          0 |          1 | /components/sparkline             | yes         |
| Spinner             | tier2 | feedback    |             0 |          0 |          1 | /components/spinner               | yes         |
| Splitter            | tier2 | layout      |             0 |          0 |          1 | /components/splitter              | yes         |
| Spotlight           | tier2 | display     |             0 |          0 |          1 | /components/spotlight             | yes         |
| StarRating          | tier2 | display     |             0 |          0 |          1 | /components/star-rating           | yes         |
| Stepper             | tier2 | navigation  |             0 |          0 |          1 | /components/stepper               | yes         |
| Svg                 | tier2 | utility     |             0 |          0 |          1 | /components/svg                   | yes         |
| Table               | tier2 | display     |             0 |          1 |          1 | /components/table                 | yes         |
| TableOfContents     | tier2 | navigation  |             0 |          0 |          1 | /components/table-of-contents     | yes         |
| Tabs                | tier2 | navigation  |             1 |          1 |          1 | /components/tabs                  | yes         |
| Tag                 | tier2 | display     |             0 |          0 |          1 | /components/tag                   | yes         |
| TagsInput           | tier2 | input       |             0 |          0 |          1 | /components/tags-input            | yes         |
| Text                | tier2 | display     |             2 |          3 |         25 | /components/text                  | yes         |
| ThemeToggle         | tier2 | action      |             1 |          1 |          1 | /components/theme-toggle          | yes         |
| TimeInput           | tier2 | input       |             0 |          0 |          1 | /components/time-input            | yes         |
| Timeline            | tier2 | display     |             0 |          0 |          1 | /components/timeline              | yes         |
| Toast               | tier2 | feedback    |             0 |          0 |          1 | /components/toast                 | yes         |
| ToggleGroup         | tier2 | action      |             0 |          0 |          2 | /components/toggle-group          | yes         |
| Toolbar             | tier2 | navigation  |             0 |          0 |          1 | /components/toolbar               | yes         |
| Tour                | tier2 | overlay     |             0 |          0 |          1 | /components/tour                  | yes         |
| TypingIndicator     | tier2 | display     |             0 |          0 |          1 | /components/typing-indicator      | yes         |
| Typography          | tier2 | display     |             1 |          3 |          1 | /components/typography            | yes         |
| VideoEmbed          | tier2 | display     |             0 |          0 |          1 | /components/video-embed           | yes         |
| VirtualList         | tier2 | display     |             0 |          0 |          1 | /components/virtual-list          | yes         |
| VisuallyHidden      | tier2 | utility     |             0 |          0 |          1 | /components/visually-hidden       | yes         |

## Detailed File Matches

### Button

- Tier: tier0
- Category: action
- Browser specs: tests/browser/button.browser.test.ts, tests/browser/code-block.browser.test.ts
- Browser support files: tests/browser/fixtures/button-harness.svelte, tests/browser/fixtures/docs-component-page-data.ts, tests/browser/fixtures/feedback-overlay-harness.svelte
- Unit tests: packages/cli/src/**tests**/info.test.ts, packages/feedback-server/tests/dev-url.test.ts, packages/lint/src/preprocessor.test.ts, packages/lint/src/rules.test.ts, packages/mcp/src/reviewer.test.ts, tests/unit/highlighter/integration.test.ts, tests/unit/highlighter/registry.test.ts, tests/unit/highlighter/svelte.test.ts, tests/unit/markdown-parser/ast.test.ts, tests/unit/mcp/toon.test.ts
- Docs demos: apps/docs/src/lib/demos/AlertDialogDemo.svelte, apps/docs/src/lib/demos/AppFrameDemo.svelte, apps/docs/src/lib/demos/AuroraDemo.svelte, apps/docs/src/lib/demos/BackdropDemo.svelte, apps/docs/src/lib/demos/ButtonDemo.svelte, apps/docs/src/lib/demos/ButtonGroupDemo.svelte, apps/docs/src/lib/demos/CardDemo.svelte, apps/docs/src/lib/demos/CommandPaletteDemo.svelte, apps/docs/src/lib/demos/DialogDemo.svelte, apps/docs/src/lib/demos/DrawerDemo.svelte, apps/docs/src/lib/demos/DropdownMenuDemo.svelte, apps/docs/src/lib/demos/FocusTrapDemo.svelte, apps/docs/src/lib/demos/PopoverDemo.svelte, apps/docs/src/lib/demos/PortalDemo.svelte, apps/docs/src/lib/demos/TooltipDemo.svelte, apps/docs/src/lib/demos/TourDemo.svelte, apps/docs/src/lib/demos/VisuallyHiddenDemo.svelte
- Docs route: /components/button
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Calendar

- Tier: tier0
- Category: form
- Browser specs: tests/browser/calendar.browser.test.ts, tests/browser/range-calendar.browser.test.ts
- Browser support files: tests/browser/fixtures/calendar-harness.svelte, tests/browser/fixtures/range-calendar-harness.svelte
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/CalendarDemo.svelte
- Docs route: /components/calendar
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Checkbox

- Tier: tier0
- Category: input
- Browser specs: tests/browser/checkbox.browser.test.ts
- Browser support files: tests/browser/fixtures/checkbox-harness.svelte
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/CheckboxDemo.svelte, apps/docs/src/lib/demos/FieldsetDemo.svelte
- Docs route: /components/checkbox
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Combobox

- Tier: tier0
- Category: form
- Browser specs: tests/browser/combobox.browser.test.ts, tests/browser/multi-select-combobox.browser.test.ts
- Browser support files: tests/browser/fixtures/combobox-harness.svelte, tests/browser/fixtures/multi-select-combobox-harness.svelte
- Unit tests: packages/mcp/src/reviewer.test.ts
- Docs demos: apps/docs/src/lib/demos/ComboboxDemo.svelte
- Docs route: /components/combobox
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### ContextMenu

- Tier: tier0
- Category: overlay
- Browser specs: tests/browser/context-menu.browser.test.ts
- Browser support files: tests/browser/fixtures/context-menu-harness.svelte, tests/browser/fixtures/primitives-remediation-menu-harness.svelte
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/ContextMenuDemo.svelte
- Docs route: /components/context-menu
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### DatePicker

- Tier: tier0
- Category: form
- Browser specs: tests/browser/date-picker.browser.test.ts
- Browser support files: tests/browser/fixtures/date-picker-harness.svelte
- Unit tests: tests/unit/interactive-coverage-policy.test.ts
- Docs demos: apps/docs/src/lib/demos/DatePickerDemo.svelte
- Docs route: /components/date-picker
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### DateRangePicker

- Tier: tier0
- Category: form
- Browser specs: tests/browser/date-range-picker.browser.test.ts
- Browser support files: tests/browser/fixtures/date-range-picker-harness.svelte, tests/browser/fixtures/docs-component-page-data.ts
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/DateRangePickerDemo.svelte
- Docs route: /components/date-range-picker
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Dialog

- Tier: tier0
- Category: overlay
- Browser specs: tests/browser/dialog.browser.test.ts
- Browser support files: tests/browser/fixtures/dialog-harness.svelte, tests/browser/fixtures/docs-component-page-data.ts, tests/browser/fixtures/overlay-surface-harness.svelte
- Unit tests: packages/cli/src/**tests**/info.test.ts, packages/mcp/src/reviewer.test.ts, tests/unit/mcp/toon.test.ts
- Docs demos: apps/docs/src/lib/demos/DialogDemo.svelte
- Docs route: /components/dialog
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Drawer

- Tier: tier0
- Category: overlay
- Browser specs: tests/browser/drawer.browser.test.ts
- Browser support files: tests/browser/fixtures/drawer-harness.svelte, tests/browser/fixtures/overlay-surface-harness.svelte
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/DrawerDemo.svelte
- Docs route: /components/drawer
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### DropdownMenu

- Tier: tier0
- Category: overlay
- Browser specs: tests/browser/dropdown-menu.browser.test.ts
- Browser support files: tests/browser/fixtures/dropdown-menu-harness.svelte, tests/browser/fixtures/primitives-remediation-menu-harness.svelte
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/DropdownMenuDemo.svelte
- Docs route: /components/dropdown-menu
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Field

- Tier: tier0
- Category: form
- Browser specs: tests/browser/date-field.browser.test.ts, tests/browser/field.browser.test.ts
- Browser support files: tests/browser/fixtures/composite-inputs-harness.svelte, tests/browser/fixtures/date-field-harness.svelte, tests/browser/fixtures/field-harness.svelte, tests/browser/fixtures/input-harness.svelte, tests/browser/fixtures/primitives-remediation-semantics-harness.svelte, tests/browser/fixtures/textarea-harness.svelte
- Unit tests: packages/mcp/src/reviewer.test.ts
- Docs demos: apps/docs/src/lib/demos/DialogDemo.svelte, apps/docs/src/lib/demos/FieldDemo.svelte, apps/docs/src/lib/demos/NumberInputDemo.svelte
- Docs route: /components/field
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### FileSelect

- Tier: tier0
- Category: input
- Browser specs: tests/browser/file-select.browser.test.ts
- Browser support files: tests/browser/fixtures/file-select-harness.svelte
- Unit tests: tests/unit/file-select.test.ts
- Docs demos: apps/docs/src/lib/demos/FileSelectDemo.svelte
- Docs route: /components/file-select
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### HoverCard

- Tier: tier0
- Category: overlay
- Browser specs: tests/browser/a11y-hover-card.browser.test.ts
- Browser support files: tests/browser/fixtures/hover-card-a11y-harness.svelte
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/HoverCardDemo.svelte
- Docs route: /components/hover-card
- Docs visual tests: tests/playwright/docs-overlay.visual.spec.ts, tests/playwright/docs-visual.spec.ts

### Input

- Tier: tier0
- Category: input
- Browser specs: tests/browser/input-group.browser.test.ts, tests/browser/input.browser.test.ts, tests/browser/phone-input.browser.test.ts, tests/browser/primitives-remediation.browser.test.ts, tests/browser/prompt-input.browser.test.ts
- Browser support files: tests/browser/fixtures/composite-inputs-harness.svelte, tests/browser/fixtures/field-harness.svelte, tests/browser/fixtures/input-group-harness.svelte, tests/browser/fixtures/input-harness.svelte, tests/browser/fixtures/primitives-remediation-semantics-harness.svelte
- Unit tests: node_modules/.bun/zod@4.3.6/node_modules/zod/src/v4/classic/tests/brand.test.ts, node_modules/.bun/zod@4.3.6/node_modules/zod/src/v4/mini/tests/brand.test.ts, packages/cli/src/**tests**/info.test.ts, packages/cli/src/**tests**/project-planner.test.ts, packages/mcp/src/reviewer.test.ts
- Docs demos: apps/docs/src/lib/demos/DialogDemo.svelte, apps/docs/src/lib/demos/FieldDemo.svelte, apps/docs/src/lib/demos/FocusTrapDemo.svelte, apps/docs/src/lib/demos/InputDemo.svelte
- Docs route: /components/input
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### MegaMenu

- Tier: tier0
- Category: navigation
- Browser specs: tests/browser/mega-menu.browser.test.ts
- Browser support files: tests/browser/**screenshots**/mega-menu.browser.test.ts/mega-menu-accessibility-closes-the-panel-when-the-open-trigger-is-clicked-again-1.png, tests/browser/fixtures/mega-menu-harness.svelte, tests/browser/fixtures/theme-wizard-controls-harness.svelte
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/MegaMenuDemo.svelte
- Docs route: /components/mega-menu
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Menubar

- Tier: tier0
- Category: navigation
- Browser specs: tests/browser/a11y-menubar-notification.browser.test.ts, tests/browser/menubar.browser.test.ts
- Browser support files: tests/browser/**screenshots**/a11y-menubar-notification.browser.test.ts/menubar-and-notification-center-accessibility-keeps-notification-center-trigger-and-panel-semantics-truthful-and-restores-focus-on-escape-1.png, tests/browser/**screenshots**/a11y-menubar-notification.browser.test.ts/menubar-and-notification-center-accessibility-labels-the-open-menu-from-the-rendered-trigger-id-1.png, tests/browser/**screenshots**/a11y-menubar-notification.browser.test.ts/menubar-and-notification-center-accessibility-moves-focus-across-top-level-triggers-without-opening--and-switches-menus-when-already-open-1.png, tests/browser/fixtures/menubar-harness.svelte
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/MenubarDemo.svelte
- Docs route: /components/menubar
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### MultiSelectCombobox

- Tier: tier0
- Category: form
- Browser specs: tests/browser/multi-select-combobox.browser.test.ts
- Browser support files: tests/browser/fixtures/multi-select-combobox-harness.svelte
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/MultiSelectComboboxDemo.svelte
- Docs route: /components/multi-select-combobox
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Popover

- Tier: tier0
- Category: overlay
- Browser specs: tests/browser/popover.browser.test.ts
- Browser support files: tests/browser/fixtures/feedback-overlay-harness.svelte, tests/browser/fixtures/popover-harness.svelte, tests/browser/fixtures/primitives-remediation-overlay-harness.svelte
- Unit tests: tests/unit/interactive-coverage-policy.test.ts
- Docs demos: apps/docs/src/lib/demos/PopoverDemo.svelte
- Docs route: /components/popover
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### RadioGroup

- Tier: tier0
- Category: input
- Browser specs: tests/browser/radio-group.browser.test.ts
- Browser support files: tests/browser/fixtures/radio-group-harness.svelte
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/RadioGroupDemo.svelte
- Docs route: /components/radio-group
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### RangeCalendar

- Tier: tier0
- Category: form
- Browser specs: tests/browser/range-calendar.browser.test.ts
- Browser support files: tests/browser/fixtures/range-calendar-harness.svelte
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/RangeCalendarDemo.svelte
- Docs route: /components/range-calendar
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Select

- Tier: tier0
- Category: form
- Browser specs: tests/browser/file-select.browser.test.ts, tests/browser/multi-select-combobox.browser.test.ts, tests/browser/select.browser.test.ts
- Browser support files: tests/browser/fixtures/file-select-harness.svelte, tests/browser/fixtures/multi-select-combobox-harness.svelte, tests/browser/fixtures/primitives-remediation-menu-harness.svelte, tests/browser/fixtures/select-harness.svelte
- Unit tests: packages/lint/src/rules.test.ts
- Docs demos: apps/docs/src/lib/demos/SelectDemo.svelte
- Docs route: /components/select
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Textarea

- Tier: tier0
- Category: input
- Browser specs: tests/browser/textarea.browser.test.ts
- Browser support files: tests/browser/fixtures/textarea-harness.svelte
- Unit tests: packages/lint/src/rules.test.ts
- Docs demos: apps/docs/src/lib/demos/TextareaDemo.svelte
- Docs route: /components/textarea
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Toggle

- Tier: tier0
- Category: action
- Browser specs: tests/browser/theme-bootstrap.browser.test.ts, tests/browser/toggle-onclick.browser.test.ts, tests/browser/toggle.browser.test.ts
- Browser support files: tests/browser/fixtures/toggle-harness.svelte
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/DrawerDemo.svelte, apps/docs/src/lib/demos/ToggleDemo.svelte
- Docs route: /components/toggle
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Tooltip

- Tier: tier0
- Category: overlay
- Browser specs: tests/browser/tooltip.browser.test.ts
- Browser support files: tests/browser/fixtures/primitives-remediation-overlay-harness.svelte, tests/browser/fixtures/tooltip-harness.svelte
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/TooltipDemo.svelte
- Docs route: /components/tooltip
- Docs visual tests: tests/playwright/docs-overlay.visual.spec.ts, tests/playwright/docs-visual.spec.ts

### Carousel

- Tier: tier1
- Category: display
- Browser specs: tests/browser/a11y-carousel.browser.test.ts
- Browser support files: tests/browser/fixtures/carousel-a11y-harness.svelte
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/CarouselDemo.svelte
- Docs route: /components/carousel
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Chart

- Tier: tier1
- Category: display
- Browser specs: tests/browser/a11y-chart-scrollarea-alert.browser.test.ts
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/ChartDemo.svelte
- Docs route: /components/chart
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### NotificationCenter

- Tier: tier1
- Category: overlay
- Browser specs: tests/browser/a11y-menubar-notification.browser.test.ts
- Browser support files: tests/browser/fixtures/notification-center-a11y-harness.svelte
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/NotificationCenterDemo.svelte
- Docs route: /components/notification-center
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### RichTextEditor

- Tier: tier1
- Category: input
- Browser specs: tests/browser/a11y-transfer-rte.browser.test.ts
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/RichTextEditorDemo.svelte
- Docs route: /components/rich-text-editor
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Transfer

- Tier: tier1
- Category: input
- Browser specs: tests/browser/a11y-transfer-rte.browser.test.ts
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/TransferDemo.svelte
- Docs route: /components/transfer
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Tree

- Tier: tier1
- Category: display
- Browser specs: tests/browser/a11y-tree.browser.test.ts
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/TreeDemo.svelte
- Docs route: /components/tree
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Accordion

- Tier: tier2
- Category: display
- Browser specs: tests/browser/a11y-accordion-collapsible.browser.test.ts, tests/browser/accordion.browser.test.ts
- Browser support files: tests/browser/fixtures/a11y-accordion-collapsible-harness.svelte, tests/browser/fixtures/accordion-harness.svelte
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/AccordionDemo.svelte
- Docs route: /components/accordion
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Adjust

- Tier: tier2
- Category: visual
- Browser specs: none
- Browser support files: none
- Unit tests: tests/unit/mcp/toon.test.ts
- Docs demos: apps/docs/src/lib/demos/AdjustDemo.svelte
- Docs route: /components/adjust
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Alert

- Tier: tier2
- Category: feedback
- Browser specs: tests/browser/a11y-chart-scrollarea-alert.browser.test.ts
- Browser support files: tests/browser/fixtures/overlay-surface-harness.svelte, tests/browser/fixtures/ui-compounds-coverage-harness.svelte
- Unit tests: packages/lint/src/rules.test.ts, packages/mcp/src/reviewer.test.ts
- Docs demos: apps/docs/src/lib/demos/AlertDemo.svelte
- Docs route: /components/alert
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### AlertDialog

- Tier: tier2
- Category: overlay
- Browser specs: none
- Browser support files: tests/browser/fixtures/overlay-surface-harness.svelte
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/AlertDialogDemo.svelte
- Docs route: /components/alert-dialog
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### AlphaSlider

- Tier: tier2
- Category: input
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/AlphaSliderDemo.svelte
- Docs route: /components/alpha-slider
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### AppFrame

- Tier: tier2
- Category: layout
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/AppFrameDemo.svelte
- Docs route: /components/app-frame
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### AspectRatio

- Tier: tier2
- Category: layout
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/AspectRatioDemo.svelte
- Docs route: /components/aspect-ratio
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Aurora

- Tier: tier2
- Category: layout
- Browser specs: none
- Browser support files: tests/browser/fixtures/motion-surfaces-harness.svelte
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/AuroraDemo.svelte
- Docs route: /components/aurora
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Avatar

- Tier: tier2
- Category: display
- Browser specs: tests/browser/avatar.browser.test.ts
- Browser support files: none
- Unit tests: packages/mcp/src/reviewer.test.ts, packages/mcp/src/workspace-audit.test.ts
- Docs demos: apps/docs/src/lib/demos/AvatarDemo.svelte
- Docs route: /components/avatar
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Backdrop

- Tier: tier2
- Category: overlay
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/BackdropDemo.svelte
- Docs route: /components/backdrop
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Badge

- Tier: tier2
- Category: display
- Browser specs: none
- Browser support files: none
- Unit tests: packages/lint/src/rules.test.ts, tests/unit/interactive-coverage-policy.test.ts, tests/unit/mcp/toon.test.ts
- Docs demos: apps/docs/src/lib/demos/AdjustDemo.svelte, apps/docs/src/lib/demos/AuroraDemo.svelte, apps/docs/src/lib/demos/BadgeDemo.svelte, apps/docs/src/lib/demos/DataGridDemo.svelte, apps/docs/src/lib/demos/DragAndDropDemo.svelte, apps/docs/src/lib/demos/DrawerDemo.svelte, apps/docs/src/lib/demos/FlipCardDemo.svelte, apps/docs/src/lib/demos/GlassDemo.svelte, apps/docs/src/lib/demos/HotkeyDemo.svelte, apps/docs/src/lib/demos/PortalDemo.svelte, apps/docs/src/lib/demos/SeparatorDemo.svelte, apps/docs/src/lib/demos/ShaderCanvasDemo.svelte, apps/docs/src/lib/demos/SplitterDemo.svelte
- Docs route: /components/badge
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Beam

- Tier: tier2
- Category: visual
- Browser specs: none
- Browser support files: none
- Unit tests: tests/unit/border-beam-radius.test.ts
- Docs demos: apps/docs/src/lib/demos/BeamDemo.svelte
- Docs route: /components/beam
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### BorderBeam

- Tier: tier2
- Category: visual
- Browser specs: none
- Browser support files: none
- Unit tests: tests/unit/border-beam-radius.test.ts
- Docs demos: apps/docs/src/lib/demos/BorderBeamDemo.svelte
- Docs route: /components/border-beam
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Breadcrumb

- Tier: tier2
- Category: navigation
- Browser specs: none
- Browser support files: tests/browser/fixtures/primitives-remediation-semantics-harness.svelte
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/BreadcrumbDemo.svelte
- Docs route: /components/breadcrumb
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### ButtonGroup

- Tier: tier2
- Category: action
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/ButtonGroupDemo.svelte
- Docs route: /components/button-group
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Card

- Tier: tier2
- Category: display
- Browser specs: tests/browser/a11y-hover-card.browser.test.ts, tests/browser/card.browser.test.ts
- Browser support files: tests/browser/fixtures/card-harness.svelte, tests/browser/fixtures/motion-surfaces-harness.svelte, tests/browser/fixtures/primitives-remediation-semantics-harness.svelte
- Unit tests: packages/cli/src/**tests**/info.test.ts, packages/cli/src/**tests**/project-planner.test.ts, packages/cli/src/**tests**/run.test.ts, packages/cli/src/**tests**/scaffold.test.ts, packages/lint/src/rules.test.ts, packages/mcp/src/project-planner.test.ts, packages/mcp/src/reviewer.test.ts, packages/mcp/src/tools/check.test.ts, packages/mcp/src/workspace-audit.test.ts
- Docs demos: apps/docs/src/lib/demos/BackdropDemo.svelte, apps/docs/src/lib/demos/BorderBeamDemo.svelte, apps/docs/src/lib/demos/CardDemo.svelte, apps/docs/src/lib/demos/DrawerDemo.svelte, apps/docs/src/lib/demos/MapDemo.svelte, apps/docs/src/lib/demos/PortalDemo.svelte, apps/docs/src/lib/demos/TourDemo.svelte
- Docs route: /components/card
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### ChatThread

- Tier: tier2
- Category: display
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/ChatThreadDemo.svelte
- Docs route: /components/chat-thread
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Chip

- Tier: tier2
- Category: action
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/ChipDemo.svelte
- Docs route: /components/chip
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### ChipGroup

- Tier: tier2
- Category: action
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/ChipGroupDemo.svelte
- Docs route: /components/chip-group
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### ChromaticAberration

- Tier: tier2
- Category: visual
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/ChromaticAberrationDemo.svelte
- Docs route: /components/chromatic-aberration
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### ChromaticShift

- Tier: tier2
- Category: visual
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/ChromaticShiftDemo.svelte
- Docs route: /components/chromatic-shift
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Clipboard

- Tier: tier2
- Category: action
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/ClipboardDemo.svelte
- Docs route: /components/clipboard
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### CodeBlock

- Tier: tier2
- Category: display
- Browser specs: tests/browser/code-block.browser.test.ts
- Browser support files: none
- Unit tests: tests/unit/highlighter/css.test.ts, tests/unit/highlighter/generic.test.ts, tests/unit/highlighter/integration.test.ts, tests/unit/highlighter/registry.test.ts, tests/unit/highlighter/svelte.test.ts
- Docs demos: apps/docs/src/lib/demos/BorderBeamDemo.svelte, apps/docs/src/lib/demos/CodeBlockDemo.svelte
- Docs route: /components/code-block
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Collapsible

- Tier: tier2
- Category: display
- Browser specs: tests/browser/a11y-accordion-collapsible.browser.test.ts
- Browser support files: tests/browser/fixtures/a11y-accordion-collapsible-harness.svelte
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/CollapsibleDemo.svelte
- Docs route: /components/collapsible
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### ColorPicker

- Tier: tier2
- Category: input
- Browser specs: none
- Browser support files: none
- Unit tests: tests/unit/color-picker-channel.test.ts, tests/unit/color-utils.test.ts, tests/unit/extract-colors.test.ts, tests/unit/primitives/extract-colors.test.ts
- Docs demos: apps/docs/src/lib/demos/ColorPickerDemo.svelte
- Docs route: /components/color-picker
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### CommandPalette

- Tier: tier2
- Category: overlay
- Browser specs: none
- Browser support files: tests/browser/fixtures/feedback-overlay-harness.svelte, tests/browser/fixtures/overlay-surface-harness.svelte
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/CommandPaletteDemo.svelte
- Docs route: /components/command-palette
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Container

- Tier: tier2
- Category: layout
- Browser specs: none
- Browser support files: none
- Unit tests: packages/mcp/src/reviewer.test.ts
- Docs demos: apps/docs/src/lib/demos/ContainerDemo.svelte
- Docs route: /components/container
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### DataGrid

- Tier: tier2
- Category: display
- Browser specs: tests/browser/primitives-remediation.browser.test.ts
- Browser support files: tests/browser/fixtures/primitives-remediation-data-grid-harness.svelte
- Unit tests: tests/unit/highlighter/integration.test.ts, tests/unit/highlighter/svelte.test.ts
- Docs demos: apps/docs/src/lib/demos/DataGridDemo.svelte
- Docs route: /components/data-grid
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### DateField

- Tier: tier2
- Category: form
- Browser specs: tests/browser/date-field.browser.test.ts
- Browser support files: tests/browser/fixtures/date-field-harness.svelte
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/DateFieldDemo.svelte
- Docs route: /components/date-field
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### DateTimeInput

- Tier: tier2
- Category: input
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/DateTimeInputDemo.svelte
- Docs route: /components/date-time-input
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### DescriptionList

- Tier: tier2
- Category: display
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/DescriptionListDemo.svelte
- Docs route: /components/description-list
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Diagram

- Tier: tier2
- Category: display
- Browser specs: none
- Browser support files: none
- Unit tests: tests/unit/diagram-layout.test.ts
- Docs demos: apps/docs/src/lib/demos/DiagramDemo.svelte
- Docs route: /components/diagram
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Displacement

- Tier: tier2
- Category: visual
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/DisplacementDemo.svelte
- Docs route: /components/displacement
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### DragAndDrop

- Tier: tier2
- Category: interaction
- Browser specs: tests/browser/a11y-drag-and-drop.browser.test.ts
- Browser support files: tests/browser/fixtures/drag-and-drop-a11y-harness.svelte
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/DragAndDropDemo.svelte
- Docs route: /components/drag-and-drop
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### DropZone

- Tier: tier2
- Category: input
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/DropZoneDemo.svelte
- Docs route: /components/drop-zone
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Fieldset

- Tier: tier2
- Category: form
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/FieldsetDemo.svelte
- Docs route: /components/fieldset
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### FileUpload

- Tier: tier2
- Category: input
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/FileUploadDemo.svelte
- Docs route: /components/file-upload
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### FlipCard

- Tier: tier2
- Category: display
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/FlipCardDemo.svelte
- Docs route: /components/flip-card
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### FloatButton

- Tier: tier2
- Category: action
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/FloatButtonDemo.svelte
- Docs route: /components/float-button
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### FocusTrap

- Tier: tier2
- Category: utility
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/FocusTrapDemo.svelte
- Docs route: /components/focus-trap
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### FormatBytes

- Tier: tier2
- Category: display
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/FormatBytesDemo.svelte
- Docs route: /components/format-bytes
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### FormatDate

- Tier: tier2
- Category: display
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/FormatDateDemo.svelte
- Docs route: /components/format-date
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### FormatNumber

- Tier: tier2
- Category: display
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/FormatNumberDemo.svelte
- Docs route: /components/format-number
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Gauge

- Tier: tier2
- Category: display
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/DiagramDemo.svelte, apps/docs/src/lib/demos/GaugeDemo.svelte
- Docs route: /components/gauge
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Glass

- Tier: tier2
- Category: visual
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/GlassDemo.svelte
- Docs route: /components/glass
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Glow

- Tier: tier2
- Category: visual
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/GlowDemo.svelte
- Docs route: /components/glow
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### GodRays

- Tier: tier2
- Category: visual
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/GodRaysDemo.svelte
- Docs route: /components/god-rays
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### GradientMesh

- Tier: tier2
- Category: visual
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/GradientMeshDemo.svelte
- Docs route: /components/gradient-mesh
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Halftone

- Tier: tier2
- Category: visual
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/HalftoneDemo.svelte
- Docs route: /components/halftone
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Heading

- Tier: tier2
- Category: display
- Browser specs: none
- Browser support files: none
- Unit tests: packages/mcp/src/reviewer.test.ts
- Docs demos: apps/docs/src/lib/demos/FlipCardDemo.svelte, apps/docs/src/lib/demos/HeadingDemo.svelte, apps/docs/src/lib/demos/SeparatorDemo.svelte, apps/docs/src/lib/demos/SplitterDemo.svelte, apps/docs/src/lib/demos/VisuallyHiddenDemo.svelte
- Docs route: /components/heading
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Hotkey

- Tier: tier2
- Category: utility
- Browser specs: tests/browser/hotkey.browser.test.ts
- Browser support files: none
- Unit tests: tests/unit/hotkey.test.ts
- Docs demos: apps/docs/src/lib/demos/HotkeyDemo.svelte
- Docs route: /components/hotkey
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Icon

- Tier: tier2
- Category: display
- Browser specs: none
- Browser support files: none
- Unit tests: packages/mcp/src/reviewer.test.ts
- Docs demos: apps/docs/src/lib/demos/IconDemo.svelte
- Docs route: /components/icon
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Image

- Tier: tier2
- Category: display
- Browser specs: tests/browser/image-comparison.browser.test.ts
- Browser support files: tests/browser/fixtures/image-comparison-harness.svelte
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/ImageDemo.svelte
- Docs route: /components/image
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### ImageComparison

- Tier: tier2
- Category: display
- Browser specs: tests/browser/image-comparison.browser.test.ts
- Browser support files: tests/browser/fixtures/image-comparison-harness.svelte
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/ImageComparisonDemo.svelte
- Docs route: /components/image-comparison
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### InfiniteScroll

- Tier: tier2
- Category: display
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/InfiniteScrollDemo.svelte
- Docs route: /components/infinite-scroll
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### InputGroup

- Tier: tier2
- Category: input
- Browser specs: tests/browser/input-group.browser.test.ts
- Browser support files: tests/browser/fixtures/input-group-harness.svelte
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/InputGroupDemo.svelte
- Docs route: /components/input-group
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Kbd

- Tier: tier2
- Category: display
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/CommandPaletteDemo.svelte, apps/docs/src/lib/demos/FlipCardDemo.svelte, apps/docs/src/lib/demos/HotkeyDemo.svelte, apps/docs/src/lib/demos/KbdDemo.svelte
- Docs route: /components/kbd
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Label

- Tier: tier2
- Category: form
- Browser specs: none
- Browser support files: tests/browser/fixtures/composite-inputs-harness.svelte, tests/browser/fixtures/field-harness.svelte, tests/browser/fixtures/input-harness.svelte, tests/browser/fixtures/primitives-remediation-semantics-harness.svelte, tests/browser/fixtures/textarea-harness.svelte
- Unit tests: packages/mcp/src/reviewer.test.ts
- Docs demos: apps/docs/src/lib/demos/DialogDemo.svelte, apps/docs/src/lib/demos/FieldDemo.svelte, apps/docs/src/lib/demos/LabelDemo.svelte, apps/docs/src/lib/demos/NumberInputDemo.svelte
- Docs route: /components/label
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Link

- Tier: tier2
- Category: navigation
- Browser specs: tests/browser/ui-remediation.browser.test.ts
- Browser support files: tests/browser/fixtures/link-harness.svelte, tests/browser/fixtures/primitives-remediation-semantics-harness.svelte
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/LinkDemo.svelte, apps/docs/src/lib/demos/MapDemo.svelte
- Docs route: /components/link
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### LinkPreview

- Tier: tier2
- Category: overlay
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/LinkPreviewDemo.svelte
- Docs route: /components/link-preview
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### List

- Tier: tier2
- Category: display
- Browser specs: none
- Browser support files: tests/browser/fixtures/ui-compounds-coverage-harness.svelte
- Unit tests: packages/cli/src/**tests**/list.test.ts, packages/mcp/src/reviewer.test.ts
- Docs demos: apps/docs/src/lib/demos/ListDemo.svelte
- Docs route: /components/list
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Listbox

- Tier: tier2
- Category: input
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/ListboxDemo.svelte
- Docs route: /components/listbox
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### LogoMark

- Tier: tier2
- Category: display
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/LogoMarkDemo.svelte
- Docs route: /components/logo-mark
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Map

- Tier: tier2
- Category: display
- Browser specs: none
- Browser support files: none
- Unit tests: node_modules/.bun/zod@3.25.76/node_modules/zod/src/v3/tests/map.test.ts, node_modules/.bun/zod@3.25.76/node_modules/zod/src/v4/classic/tests/map.test.ts, node_modules/.bun/zod@4.3.6/node_modules/zod/src/v3/tests/map.test.ts, node_modules/.bun/zod@4.3.6/node_modules/zod/src/v4/classic/tests/map.test.ts
- Docs demos: apps/docs/src/lib/demos/MapDemo.svelte
- Docs route: /components/map
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### MarkdownRenderer

- Tier: tier2
- Category: display
- Browser specs: none
- Browser support files: none
- Unit tests: tests/unit/markdown-parser/ast.test.ts
- Docs demos: apps/docs/src/lib/demos/MarkdownRendererDemo.svelte
- Docs route: /components/markdown-renderer
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Marquee

- Tier: tier2
- Category: display
- Browser specs: none
- Browser support files: tests/browser/fixtures/motion-surfaces-harness.svelte
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/MarqueeDemo.svelte
- Docs route: /components/marquee
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### MaskReveal

- Tier: tier2
- Category: visual
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/MaskRevealDemo.svelte
- Docs route: /components/mask-reveal
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### NavigationMenu

- Tier: tier2
- Category: navigation
- Browser specs: none
- Browser support files: tests/browser/fixtures/primitives-remediation-semantics-harness.svelte
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/NavigationMenuDemo.svelte
- Docs route: /components/navigation-menu
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Noise

- Tier: tier2
- Category: layout
- Browser specs: none
- Browser support files: tests/browser/fixtures/motion-surfaces-harness.svelte
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/NoiseDemo.svelte
- Docs route: /components/noise
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### NumberInput

- Tier: tier2
- Category: input
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/BorderBeamDemo.svelte, apps/docs/src/lib/demos/NumberInputDemo.svelte
- Docs route: /components/number-input
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### OptionPicker

- Tier: tier2
- Category: input
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/OptionPickerDemo.svelte
- Docs route: /components/option-picker
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Pagination

- Tier: tier2
- Category: navigation
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/PaginationDemo.svelte
- Docs route: /components/pagination
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### PhoneInput

- Tier: tier2
- Category: input
- Browser specs: tests/browser/phone-input.browser.test.ts
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/PhoneInputDemo.svelte
- Docs route: /components/phone-input
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### PinInput

- Tier: tier2
- Category: input
- Browser specs: none
- Browser support files: tests/browser/fixtures/composite-inputs-harness.svelte
- Unit tests: tests/unit/pin-input.test.ts
- Docs demos: apps/docs/src/lib/demos/PinInputDemo.svelte
- Docs route: /components/pin-input
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Portal

- Tier: tier2
- Category: utility
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/PortalDemo.svelte
- Docs route: /components/portal
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Progress

- Tier: tier2
- Category: feedback
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/ProgressDemo.svelte
- Docs route: /components/progress
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### ProgressRing

- Tier: tier2
- Category: feedback
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/ProgressRingDemo.svelte
- Docs route: /components/progress-ring
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### PromptInput

- Tier: tier2
- Category: input
- Browser specs: tests/browser/prompt-input.browser.test.ts
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/PromptInputDemo.svelte
- Docs route: /components/prompt-input
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### QRCode

- Tier: tier2
- Category: display
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/QRCodeDemo.svelte
- Docs route: /components/qr-code
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Rating

- Tier: tier2
- Category: input
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/RatingDemo.svelte
- Docs route: /components/rating
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### RelativeTime

- Tier: tier2
- Category: display
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/RelativeTimeDemo.svelte
- Docs route: /components/relative-time
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Reveal

- Tier: tier2
- Category: display
- Browser specs: none
- Browser support files: tests/browser/fixtures/docs-component-page-data.ts, tests/browser/fixtures/motion-surfaces-harness.svelte
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/RevealDemo.svelte
- Docs route: /components/reveal
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### ScrollArea

- Tier: tier2
- Category: layout
- Browser specs: tests/browser/a11y-chart-scrollarea-alert.browser.test.ts
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/ScrollAreaDemo.svelte
- Docs route: /components/scroll-area
- Docs visual tests: tests/playwright/docs-shell.visual.spec.ts, tests/playwright/docs-visual.spec.ts

### ScrollToTop

- Tier: tier2
- Category: action
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/ScrollToTopDemo.svelte
- Docs route: /components/scroll-to-top
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### SegmentedControl

- Tier: tier2
- Category: form
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/SegmentedControlDemo.svelte
- Docs route: /components/segmented-control
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Separator

- Tier: tier2
- Category: layout
- Browser specs: none
- Browser support files: none
- Unit tests: packages/lint/src/rules.test.ts, packages/mcp/src/reviewer.test.ts
- Docs demos: apps/docs/src/lib/demos/DragAndDropDemo.svelte, apps/docs/src/lib/demos/DrawerDemo.svelte, apps/docs/src/lib/demos/SeparatorDemo.svelte
- Docs route: /components/separator
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### ShaderCanvas

- Tier: tier2
- Category: visual
- Browser specs: none
- Browser support files: none
- Unit tests: tests/unit/motion/webgl-context.test.ts
- Docs demos: apps/docs/src/lib/demos/ShaderCanvasDemo.svelte
- Docs route: /components/shader-canvas
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Shimmer

- Tier: tier2
- Category: visual
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/ShimmerDemo.svelte
- Docs route: /components/shimmer
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Sidebar

- Tier: tier2
- Category: navigation
- Browser specs: none
- Browser support files: none
- Unit tests: apps/docs/src/lib/theme-wizard/sidebar-contract.test.ts, tests/unit/sidebar-contract.test.ts
- Docs demos: apps/docs/src/lib/demos/SidebarDemo.svelte
- Docs route: /components/sidebar
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Skeleton

- Tier: tier2
- Category: feedback
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/SkeletonDemo.svelte
- Docs route: /components/skeleton
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Slider

- Tier: tier2
- Category: input
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/BorderBeamDemo.svelte, apps/docs/src/lib/demos/SliderDemo.svelte
- Docs route: /components/slider
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Spacer

- Tier: tier2
- Category: layout
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/SpacerDemo.svelte
- Docs route: /components/spacer
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Sparkline

- Tier: tier2
- Category: display
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/SparklineDemo.svelte
- Docs route: /components/sparkline
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Spinner

- Tier: tier2
- Category: feedback
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/SpinnerDemo.svelte
- Docs route: /components/spinner
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Splitter

- Tier: tier2
- Category: layout
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/SplitterDemo.svelte
- Docs route: /components/splitter
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Spotlight

- Tier: tier2
- Category: display
- Browser specs: none
- Browser support files: tests/browser/fixtures/motion-surfaces-harness.svelte
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/SpotlightDemo.svelte
- Docs route: /components/spotlight
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### StarRating

- Tier: tier2
- Category: display
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/StarRatingDemo.svelte
- Docs route: /components/star-rating
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Stepper

- Tier: tier2
- Category: navigation
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/StepperDemo.svelte
- Docs route: /components/stepper
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Svg

- Tier: tier2
- Category: utility
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/SvgDemo.svelte
- Docs route: /components/svg
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Table

- Tier: tier2
- Category: display
- Browser specs: none
- Browser support files: tests/browser/fixtures/ui-compounds-coverage-harness.svelte
- Unit tests: packages/lint/src/rules.test.ts
- Docs demos: apps/docs/src/lib/demos/TableDemo.svelte
- Docs route: /components/table
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### TableOfContents

- Tier: tier2
- Category: navigation
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/TableOfContentsDemo.svelte
- Docs route: /components/table-of-contents
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Tabs

- Tier: tier2
- Category: navigation
- Browser specs: tests/browser/tabs.browser.test.ts
- Browser support files: tests/browser/fixtures/tabs-harness.svelte, tests/browser/fixtures/tabs-overflow-harness.svelte
- Unit tests: packages/mcp/src/reviewer.test.ts
- Docs demos: apps/docs/src/lib/demos/TabsDemo.svelte
- Docs route: /components/tabs
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Tag

- Tier: tier2
- Category: display
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/TagDemo.svelte
- Docs route: /components/tag
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### TagsInput

- Tier: tier2
- Category: input
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/TagsInputDemo.svelte
- Docs route: /components/tags-input
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Text

- Tier: tier2
- Category: display
- Browser specs: tests/browser/context-menu.browser.test.ts, tests/browser/textarea.browser.test.ts
- Browser support files: tests/browser/fixtures/context-menu-harness.svelte, tests/browser/fixtures/primitives-remediation-menu-harness.svelte, tests/browser/fixtures/textarea-harness.svelte
- Unit tests: packages/cli/src/**tests**/info.test.ts, packages/mcp/src/reviewer.test.ts, tests/unit/motion/webgl-context.test.ts
- Docs demos: apps/docs/src/lib/demos/AdjustDemo.svelte, apps/docs/src/lib/demos/AlertDialogDemo.svelte, apps/docs/src/lib/demos/AppFrameDemo.svelte, apps/docs/src/lib/demos/AuroraDemo.svelte, apps/docs/src/lib/demos/BackdropDemo.svelte, apps/docs/src/lib/demos/BeamDemo.svelte, apps/docs/src/lib/demos/ContainerDemo.svelte, apps/docs/src/lib/demos/DialogDemo.svelte, apps/docs/src/lib/demos/DrawerDemo.svelte, apps/docs/src/lib/demos/FlipCardDemo.svelte, apps/docs/src/lib/demos/GlassDemo.svelte, apps/docs/src/lib/demos/GodRaysDemo.svelte, apps/docs/src/lib/demos/HotkeyDemo.svelte, apps/docs/src/lib/demos/LogoMarkDemo.svelte, apps/docs/src/lib/demos/MapDemo.svelte, apps/docs/src/lib/demos/NumberInputDemo.svelte, apps/docs/src/lib/demos/PortalDemo.svelte, apps/docs/src/lib/demos/SeparatorDemo.svelte, apps/docs/src/lib/demos/ShaderCanvasDemo.svelte, apps/docs/src/lib/demos/SpacerDemo.svelte, apps/docs/src/lib/demos/SplitterDemo.svelte, apps/docs/src/lib/demos/SpotlightDemo.svelte, apps/docs/src/lib/demos/TextDemo.svelte, apps/docs/src/lib/demos/TourDemo.svelte, apps/docs/src/lib/demos/VisuallyHiddenDemo.svelte
- Docs route: /components/text
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### ThemeToggle

- Tier: tier2
- Category: action
- Browser specs: tests/browser/theme-bootstrap.browser.test.ts
- Browser support files: none
- Unit tests: tests/unit/theme-controller.test.ts
- Docs demos: apps/docs/src/lib/demos/ThemeToggleDemo.svelte
- Docs route: /components/theme-toggle
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### TimeInput

- Tier: tier2
- Category: input
- Browser specs: none
- Browser support files: tests/browser/fixtures/composite-inputs-harness.svelte
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/TimeInputDemo.svelte
- Docs route: /components/time-input
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Timeline

- Tier: tier2
- Category: display
- Browser specs: none
- Browser support files: tests/browser/fixtures/ui-compounds-coverage-harness.svelte
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/TimelineDemo.svelte
- Docs route: /components/timeline
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Toast

- Tier: tier2
- Category: feedback
- Browser specs: none
- Browser support files: tests/browser/fixtures/primitives-remediation-semantics-harness.svelte
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/ToastDemo.svelte
- Docs route: /components/toast
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### ToggleGroup

- Tier: tier2
- Category: action
- Browser specs: none
- Browser support files: tests/browser/fixtures/theme-wizard-controls-harness.svelte
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/BorderBeamDemo.svelte, apps/docs/src/lib/demos/ToggleGroupDemo.svelte
- Docs route: /components/toggle-group
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Toolbar

- Tier: tier2
- Category: navigation
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/ToolbarDemo.svelte
- Docs route: /components/toolbar
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Tour

- Tier: tier2
- Category: overlay
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/TourDemo.svelte
- Docs route: /components/tour
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### TypingIndicator

- Tier: tier2
- Category: display
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/TypingIndicatorDemo.svelte
- Docs route: /components/typing-indicator
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### Typography

- Tier: tier2
- Category: display
- Browser specs: tests/browser/docs-component-page.browser.test.ts
- Browser support files: tests/browser/fixtures/docs-component-page-data.ts, tests/browser/fixtures/docs-component-page-harness.svelte
- Unit tests: packages/mcp/src/reviewer.test.ts, tests/unit/mcp/generate-spec.test.ts, tests/unit/mcp/reviewer.test.ts
- Docs demos: apps/docs/src/lib/demos/TypographyDemo.svelte
- Docs route: /components/typography
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### VideoEmbed

- Tier: tier2
- Category: display
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/VideoEmbedDemo.svelte
- Docs route: /components/video-embed
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### VirtualList

- Tier: tier2
- Category: display
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/VirtualListDemo.svelte
- Docs route: /components/virtual-list
- Docs visual tests: tests/playwright/docs-visual.spec.ts

### VisuallyHidden

- Tier: tier2
- Category: utility
- Browser specs: none
- Browser support files: none
- Unit tests: none
- Docs demos: apps/docs/src/lib/demos/VisuallyHiddenDemo.svelte
- Docs route: /components/visually-hidden
- Docs visual tests: tests/playwright/docs-visual.spec.ts

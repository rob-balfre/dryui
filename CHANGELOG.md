# Changelog

Pre-alpha. Everything is subject to change.

## What's in the box

### Packages

- **@dryui/primitives** — 163 headless, unstyled components with full keyboard and accessibility support
- **@dryui/ui** — 196 styled components with scoped CSS and `--dry-*` variable theming
- **@dryui/mcp** — MCP server for component lookup, composition, validation, and theme diagnosis
- **@dryui/cli** — CLI for setup snippets, component info, and workspace audit
- **@dryui/lint** — Svelte preprocessor enforcing CSS grid-only layout and container queries

### Components

**Forms** — Accordion, Button, ButtonGroup, Calendar, Checkbox, Chip, ChipGroup, ColorPicker, Combobox, CountrySelect, DateField, DatePicker, DateRangePicker, DateTimeInput, Field, Fieldset, FileSelect, FileUpload, Input, InputGroup, Label, Listbox, MultiSelectCombobox, NumberInput, OptionSwatchGroup, PhoneInput, PinInput, PromptInput, RadioGroup, RangeCalendar, Rating, RichTextEditor, SegmentedControl, Select, Slider, StarRating, TagsInput, Textarea, TimeInput, Toggle, ToggleGroup

**Navigation** — AppFrame, Breadcrumb, CommandPalette, Footer, MegaMenu, Menubar, Navbar, NavigationMenu, PageHeader, Pagination, Sidebar, Stepper, Tabs, TableOfContents, Toolbar

**Overlays** — AlertDialog, ContextMenu, Dialog, Drawer, DropdownMenu, FloatButton, HoverCard, LinkPreview, Popover, Tooltip, Tour

**Data display** — Avatar, AvatarGroup, Badge, Card, Carousel, Chart, CodeBlock, DataGrid, DescriptionList, Gauge, Icon, Image, ImageComparison, Kbd, List, MarkdownRenderer, Progress, ProgressRing, QRCode, Separator, Skeleton, Sparkline, Spinner, StatCard, Table, Tag, Text, Heading, Timeline, TokenPreview, Tree, Typography, User, VirtualList

**Feedback** — Alert, EmptyState, NotificationCenter, Toast

**Communication** — ChatMessage, ChatThread, TypingIndicator

**Layout & containers** — AspectRatio, Collapsible, Container, InfiniteScroll, ScrollArea, Spacer, Splitter

**Interaction** — Clipboard, DragAndDrop, DropZone, FocusTrap, Hotkey, ScrollToTop, Transfer

**Decorative** — Aurora, Backdrop, Beam, ChromaticAberration, ChromaticShift, Displacement, FlipCard, Glass, GlassSurface, Glow, GodRays, GradientMesh, Halftone, Hero, LogoCloud, Marquee, MaskReveal, Noise, PromoMosaic, Reveal, ShaderCanvas, Spotlight, Surface, SwatchStrip, Svg, Thumbnail, VideoEmbed, WaveDivider

**Formatting** — FormatBytes, FormatDate, FormatNumber, RelativeTime

**Utility** — Link, Portal, VisuallyHidden

**Travel & commerce** — AddOnSelector, AmenityGrid, BookingConfirmation, CommerceHeader, ComparisonTable, CurrencySelector, FareClassPicker, FeatureSplitSection, FilterSidebar, FlexibleDatesGrid, FlightTimeline, GuestRoomSelector, HotelGallery, ItineraryTimeline, LocationAutocomplete, LoyaltyPointsDisplay, MapListToggle, Map, MultiCitySearchForm, PassengerClassSelector, PaymentCardInput, PriceCalendar, PriceSummaryPanel, PromoCodeInput, RecentSearches, ResultCardCar, ResultCardFlight, ResultCardHotel, ReviewCard, RoomTypePicker, RouteMap, SearchFormTabs, SeatMap, SortBar, SystemMap, TripCard, TrustBadges

### Theming

- Two-tier token system: semantic tokens (`--dry-color-text-strong`) and component tokens (`--dry-card-bg`)
- Light and dark themes with `theme-auto` system preference support
- Theme creator tool in docs for building custom themes from a single brand color

### Architecture

- Zero external runtime dependencies — native browser APIs only (`<dialog>`, Popover API, CSS Anchor Positioning)
- Svelte 5 runes exclusively (`$state`, `$derived`, `$props`)
- CSS grid layout, container queries, scoped styles
- Documentation site with interactive examples

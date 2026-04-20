export type ComponentSurface = 'primitive';

export interface ComponentMetaEntry {
	description: string;
	category: string;
	tags: string[];
	surface?: ComponentSurface;
}

export interface DocsNavCategory {
	label: string;
	items: string[];
}

export const componentMeta: Record<string, ComponentMetaEntry> = {
	Accordion: {
		description: 'Collapsible content sections, single or multiple mode',
		category: 'display',
		tags: ['disclosure', 'collapse', 'expand', 'faq']
	},
	Alert: {
		description: 'Contextual feedback message with variant styling',
		category: 'feedback',
		tags: ['message', 'notification', 'info', 'warning', 'error']
	},
	AlertDialog: {
		description: 'Modal dialog requiring user confirmation',
		category: 'overlay',
		tags: ['modal', 'confirm', 'dialog', 'destructive']
	},
	AspectRatio: {
		description: 'Constrains child content to a specific aspect ratio',
		category: 'layout',
		tags: ['image', 'video', 'ratio', 'responsive', 'media', 'frame']
	},
	Adjust: {
		description:
			'CSS filter adjustment wrapper for brightness, contrast, saturation, and hue shifts',
		category: 'visual',
		tags: ['filter', 'adjust', 'brightness', 'contrast', 'color']
	},
	Avatar: {
		description: 'User profile image with fallback initials',
		category: 'display',
		tags: ['user', 'profile', 'image', 'initials']
	},
	Backdrop: {
		description: 'Full-screen overlay behind modals and dialogs',
		category: 'overlay',
		tags: ['overlay', 'modal', 'backdrop', 'scrim']
	},
	Badge: {
		description: 'Small status indicator label',
		category: 'display',
		tags: ['status', 'count', 'label', 'tag']
	},
	Beam: {
		description:
			'Animated linear light streak surface for directional highlights and shimmer accents',
		category: 'visual',
		tags: ['beam', 'light', 'streak', 'shimmer', 'effect']
	},
	BorderBeam: {
		description:
			'Animated border-travel beam with masked ring highlights, bloom, and line-trace presets',
		category: 'visual',
		tags: ['border', 'beam', 'glow', 'ring', 'highlight', 'effect']
	},
	Shimmer: {
		description: 'Warm highlight sweep that travels across wrapped text and inline icons together',
		category: 'visual',
		tags: ['shimmer', 'shine', 'highlight', 'text', 'icon', 'animation', 'effect']
	},
	Breadcrumb: {
		description: 'Navigation trail showing page hierarchy',
		category: 'navigation',
		tags: ['nav', 'path', 'hierarchy', 'trail']
	},
	Button: {
		description: 'Interactive button or link-styled action for submissions and calls to action',
		category: 'action',
		tags: ['form', 'action', 'click', 'submit', 'cta', 'link-button']
	},
	ButtonGroup: {
		description: 'Groups related buttons with shared styling',
		category: 'action',
		tags: ['button', 'group', 'toolbar', 'actions']
	},
	Calendar: {
		description: 'Interactive calendar grid for date navigation',
		category: 'form',
		tags: ['date', 'calendar', 'picker', 'month', 'locale']
	},
	Card: {
		description: 'Contained content surface with header/content/footer sections',
		category: 'display',
		tags: ['surface', 'container', 'content', 'panel']
	},
	Carousel: {
		description: 'Scrollable content carousel with slide navigation',
		category: 'display',
		tags: ['slider', 'carousel', 'scroll', 'gallery', 'slideshow']
	},
	Chart: {
		description: 'SVG-based chart with bars, lines, and axes',
		category: 'display',
		tags: ['chart', 'graph', 'bar', 'line', 'data', 'visualization']
	},
	ChatThread: {
		description: 'Conversation thread container with restart action and auto-scroll behavior',
		category: 'display',
		tags: ['chat', 'thread', 'conversation', 'log']
	},
	Checkbox: {
		description: 'Boolean toggle input with indeterminate state',
		category: 'input',
		tags: ['form', 'toggle', 'boolean', 'check']
	},
	Chip: {
		description: 'Interactive pill for filters, selections, and inline state',
		category: 'action',
		tags: ['chip', 'pill', 'filter', 'selection', 'tag']
	},
	ChipGroup: {
		description: 'Single or multi-select chip cluster',
		category: 'action',
		tags: ['chip', 'group', 'filters', 'selection']
	},
	ChromaticShift: {
		description: 'RGB channel separation effect with hover and animation triggers',
		category: 'visual',
		tags: ['chromatic', 'aberration', 'rgb', 'glitch', 'effect', 'animation']
	},
	ChromaticAberration: {
		description: 'Soft channel-offset wrapper for chromatic distortion on surfaces and media',
		category: 'visual',
		tags: ['chromatic', 'aberration', 'rgb', 'distortion', 'effect']
	},
	Clipboard: {
		description: 'Copy text to clipboard with native Clipboard API',
		category: 'action',
		tags: ['copy', 'clipboard', 'paste', 'text']
	},
	CodeBlock: {
		description: 'Code display with optional line numbers and copy button',
		category: 'display',
		tags: ['code', 'syntax', 'pre', 'monospace', 'copy']
	},
	Collapsible: {
		description: 'Expandable/collapsible content panel',
		category: 'display',
		tags: ['disclosure', 'collapse', 'expand', 'toggle']
	},
	ColorPicker: {
		description: 'Color selection with area, hue/alpha sliders, and eyedropper',
		category: 'input',
		tags: ['form', 'color', 'picker', 'palette']
	},
	Combobox: {
		description: 'Searchable text input with filterable dropdown suggestions',
		category: 'form',
		tags: ['form', 'search', 'autocomplete', 'filter', 'select', 'typeahead', 'searchable-select']
	},
	CommandPalette: {
		description: 'Searchable command menu dialog',
		category: 'overlay',
		tags: ['modal', 'search', 'command', 'shortcut', 'palette', 'navigation', 'launcher']
	},
	Container: {
		description: 'Centered content container with max-width',
		category: 'layout',
		tags: ['wrapper', 'center', 'max-width']
	},
	ContextMenu: {
		description: 'Right-click menu with actions',
		category: 'overlay',
		tags: ['menu', 'right-click', 'context', 'actions']
	},
	DataGrid: {
		description: 'Enhanced table with sorting, filtering, and pagination',
		category: 'display',
		tags: ['data', 'grid', 'table', 'sort', 'filter', 'paginate']
	},
	DateField: {
		description: 'Form-first locale-aware segmented date input',
		category: 'form',
		tags: ['date', 'input', 'field', 'segment', 'locale', 'form', 'date-input']
	},
	DatePicker: {
		description: 'Calendar popup date picker with locale support',
		category: 'form',
		tags: ['form', 'date', 'calendar', 'picker', 'locale', 'popover']
	},
	DateRangePicker: {
		description: 'Date range selection with calendar popup',
		category: 'form',
		tags: ['date', 'range', 'picker', 'calendar', 'period']
	},
	DateTimeInput: {
		description: 'Combined date and time input with locale-aware segments',
		category: 'input',
		tags: ['date', 'time', 'datetime', 'input', 'form', 'locale']
	},
	DescriptionList: {
		description: 'Responsive term and value list for summaries and specs',
		category: 'display',
		tags: ['details', 'summary', 'metadata', 'definitions']
	},
	Dialog: {
		description: 'Modal dialog using native dialog element',
		category: 'overlay',
		tags: ['modal', 'overlay', 'dialog', 'popup']
	},
	Displacement: {
		description: 'SVG turbulence displacement filter for organic distortion effects',
		category: 'visual',
		tags: ['displacement', 'distortion', 'turbulence', 'filter', 'svg', 'animation']
	},
	DragAndDrop: {
		description: 'Reorderable list with drag and keyboard support',
		category: 'interaction',
		tags: ['drag', 'drop', 'reorder', 'sortable', 'list']
	},
	Drawer: {
		description: 'Slide-in panel from any edge',
		category: 'overlay',
		tags: ['modal', 'panel', 'slide', 'sidebar']
	},
	DropdownMenu: {
		description: 'Trigger-activated dropdown with menu items',
		category: 'overlay',
		tags: ['menu', 'dropdown', 'actions', 'popover']
	},
	Field: {
		description: 'Form field wrapper with label, description, and error',
		category: 'form',
		tags: ['form', 'field', 'label', 'error', 'validation']
	},
	Fieldset: {
		description: 'Structured field grouping with legend, description, and content',
		category: 'form',
		tags: ['form', 'group', 'legend', 'settings']
	},
	FileSelect: {
		description: 'Select a file or folder path via external picker',
		category: 'input',
		tags: ['form', 'file', 'folder', 'path', 'select', 'picker']
	},
	FileUpload: {
		description: 'File selection with drag-and-drop dropzone',
		category: 'input',
		tags: ['form', 'file', 'upload', 'drag', 'drop']
	},
	FlipCard: {
		description: 'Flippable card with front and back faces',
		category: 'display',
		tags: ['card', 'flip', 'hover', 'click', '3d', 'animation']
	},
	FloatButton: {
		description: 'Floating action button with expandable actions',
		category: 'action',
		tags: ['fab', 'float', 'action', 'button', 'expand']
	},
	FocusTrap: {
		description: 'Traps keyboard focus within a container element',
		category: 'utility',
		tags: ['a11y', 'focus', 'trap', 'modal', 'keyboard']
	},
	FormatBytes: {
		description: 'Formats byte values with Intl.NumberFormat',
		category: 'display',
		tags: ['format', 'bytes', 'file-size', 'number']
	},
	FormatDate: {
		description: 'Formats dates with Intl.DateTimeFormat',
		category: 'display',
		tags: ['format', 'date', 'time', 'intl', 'locale']
	},
	FormatNumber: {
		description: 'Formats numbers with Intl.NumberFormat',
		category: 'display',
		tags: ['format', 'number', 'currency', 'percent']
	},
	Gauge: {
		description: 'SVG gauge indicator with configurable arc, thresholds, and label',
		category: 'display',
		tags: ['gauge', 'meter', 'dial', 'svg', 'dashboard', 'threshold']
	},
	Glass: {
		description: 'Translucent glass wrapper with blur, tint, and saturation control',
		category: 'visual',
		tags: ['glass', 'blur', 'frosted', 'surface', 'translucent']
	},
	GodRays: {
		description:
			'Volumetric radial light rays surface with configurable origin, spread, and intensity',
		category: 'visual',
		tags: ['rays', 'light', 'volumetric', 'hero', 'effect']
	},
	Glow: {
		description: 'Soft glow effect wrapper with configurable color, intensity, and animation',
		category: 'visual',
		tags: ['glow', 'light', 'shadow', 'neon', 'effect', 'animation']
	},
	GradientMesh: {
		description: 'Animated multi-color gradient mesh background with optional interactivity',
		category: 'visual',
		tags: ['gradient', 'mesh', 'background', 'animation', 'interactive', 'color']
	},
	Halftone: {
		description: 'SVG halftone dot pattern overlay with configurable size, angle, and color',
		category: 'visual',
		tags: ['halftone', 'dots', 'pattern', 'texture', 'print', 'overlay']
	},
	Heading: {
		description: 'Standalone semantic heading export for starter-kit typography',
		category: 'display',
		tags: ['text', 'heading', 'title', 'typography']
	},
	Hotkey: {
		description: 'Keyboard shortcut handler with modifier support',
		category: 'utility',
		tags: ['keyboard', 'shortcut', 'hotkey', 'keybinding']
	},
	HoverCard: {
		description: 'Card popup on hover with delay-based open/close',
		category: 'overlay',
		tags: ['hover', 'card', 'preview', 'popup']
	},
	Icon: {
		description: 'Sized and colored SVG icon wrapper with accessibility label',
		category: 'display',
		tags: ['icon', 'svg', 'size', 'color', 'accessible']
	},
	Image: {
		description: 'Image with loading states and fallback support',
		category: 'display',
		tags: ['image', 'lazy', 'loading', 'fallback']
	},
	ImageComparison: {
		description: 'Before/after image comparison slider',
		category: 'display',
		tags: ['image', 'compare', 'slider', 'before-after']
	},
	InfiniteScroll: {
		description: 'Loads more content when user scrolls near bottom',
		category: 'display',
		tags: ['infinite', 'scroll', 'load', 'pagination', 'lazy']
	},
	Input: {
		description: 'Text input with size variants',
		category: 'input',
		tags: ['form', 'text', 'input', 'field']
	},
	Kbd: {
		description: 'Keyboard shortcut display element',
		category: 'display',
		tags: ['keyboard', 'shortcut', 'key', 'kbd']
	},
	Label: {
		description: 'Form label with size variants',
		category: 'form',
		tags: ['form', 'label', 'text', 'accessibility']
	},
	Link: {
		description: 'Styled anchor with external and disabled states',
		category: 'navigation',
		tags: ['link', 'anchor', 'href', 'external']
	},
	LinkPreview: {
		description: 'Link preview popup on hover',
		category: 'overlay',
		tags: ['link', 'preview', 'hover', 'popup', 'popover', 'card']
	},
	List: {
		description: 'Structured list with items, icons, and subheaders',
		category: 'display',
		tags: ['list', 'item', 'icon', 'dense']
	},
	Listbox: {
		description: 'Single or multi-select list with keyboard navigation',
		category: 'input',
		tags: ['listbox', 'select', 'option', 'keyboard']
	},
	LogoMark: {
		description: 'Brand mark, status indicator, or category badge with image or fallback text',
		category: 'display',
		tags: ['logo', 'mark', 'brand', 'indicator', 'badge', 'icon']
	},
	Map: {
		description: 'Interactive map container with markers, popups, layers, and controls',
		category: 'display',
		tags: ['map', 'geo', 'marker', 'popup', 'layer', 'geojson']
	},
	MaskReveal: {
		description: 'Intersection-observer mask transition with circle, diamond, or wipe shapes',
		category: 'visual',
		tags: ['mask', 'reveal', 'transition', 'intersection-observer', 'animation', 'clip-path']
	},
	MarkdownRenderer: {
		description: 'Renders markdown text as styled HTML',
		category: 'display',
		tags: ['markdown', 'text', 'render', 'prose', 'content']
	},
	Marquee: {
		description: 'Scrolling text/content ticker with CSS animations',
		category: 'display',
		tags: ['scroll', 'ticker', 'animation', 'text']
	},
	MegaMenu: {
		description: 'Horizontal navigation with large dropdown panels and columns',
		category: 'navigation',
		tags: ['menu', 'mega-menu', 'navigation', 'dropdown', 'panel', 'flyout']
	},
	Menubar: {
		description: 'Horizontal menu bar with dropdown menus',
		category: 'navigation',
		tags: ['menu', 'menubar', 'dropdown', 'navigation']
	},
	Noise: {
		description:
			'Texture overlay that adds grain and atmosphere to surfaces without external assets',
		category: 'layout',
		tags: ['texture', 'grain', 'surface', 'overlay', 'shader-like']
	},
	NavigationMenu: {
		description: 'Site-level navigation with flyout content panels',
		category: 'navigation',
		tags: ['navigation', 'menu', 'flyout', 'mega-menu']
	},
	NotificationCenter: {
		description: 'Notification panel with trigger, groups, and items',
		category: 'overlay',
		tags: ['notification', 'bell', 'alerts', 'inbox', 'popover', 'unread', 'feedback', 'status']
	},
	NumberInput: {
		description: 'Numeric input with increment/decrement controls',
		category: 'input',
		tags: ['form', 'number', 'input', 'counter']
	},
	Pagination: {
		description: 'Page navigation with previous/next and page links',
		category: 'navigation',
		tags: ['nav', 'pages', 'paging', 'navigation']
	},
	PhoneInput: {
		description: 'Phone number input with country code selector',
		category: 'input',
		tags: ['form', 'phone', 'telephone', 'input', 'country-code', 'international']
	},
	PinInput: {
		description: 'Segmented input for PIN/OTP codes with single hidden input architecture',
		category: 'input',
		tags: ['form', 'pin', 'otp', 'code', 'verification']
	},
	Popover: {
		description: 'Floating content panel anchored to a trigger',
		category: 'overlay',
		tags: ['popup', 'floating', 'tooltip', 'popover']
	},
	Portal: {
		description: 'Renders children into a different DOM location',
		category: 'utility',
		tags: ['teleport', 'portal', 'mount', 'target']
	},
	Progress: {
		description: 'Progress bar indicator',
		category: 'feedback',
		tags: ['loading', 'progress', 'bar', 'percentage']
	},
	ProgressRing: {
		description: 'Circular progress ring with SVG rendering',
		category: 'feedback',
		tags: ['progress', 'ring', 'circular', 'loading']
	},
	PromptInput: {
		description: 'AI-style prompt input with auto-resize and submit',
		category: 'input',
		tags: ['prompt', 'input', 'chat', 'ai', 'textarea']
	},
	QRCode: {
		description: 'QR code generator using Canvas 2D API',
		category: 'display',
		tags: ['qr', 'code', 'barcode', 'canvas', 'generate']
	},
	RadioGroup: {
		description: 'Single selection from multiple options',
		category: 'input',
		tags: ['form', 'radio', 'select', 'option', 'group']
	},
	RangeCalendar: {
		description: 'Calendar for selecting date ranges',
		category: 'form',
		tags: ['date', 'range', 'calendar', 'selection']
	},
	Rating: {
		description: 'Star rating input with half-star support',
		category: 'input',
		tags: ['form', 'stars', 'rating', 'review', 'score']
	},
	Aurora: {
		description:
			'Ambient gradient surface with browser-native animated color fields and static fallback',
		category: 'layout',
		tags: ['background', 'gradient', 'ambient', 'shader-like', 'hero']
	},
	Reveal: {
		description:
			'IntersectionObserver-powered entry transitions with reduced-motion and no-dependency fallbacks',
		category: 'display',
		tags: ['animation', 'reveal', 'intersection-observer', 'stagger', 'motion']
	},
	RelativeTime: {
		description: 'Displays relative time with auto-updating',
		category: 'display',
		tags: ['time', 'relative', 'ago', 'auto-update']
	},
	RichTextEditor: {
		description: 'Basic rich text editor with formatting toolbar',
		category: 'input',
		tags: ['editor', 'rich-text', 'wysiwyg', 'contenteditable', 'formatting']
	},
	ShaderCanvas: {
		description: 'WebGL shader canvas with built-in presets and theme color integration',
		category: 'visual',
		tags: ['shader', 'webgl', 'canvas', 'glsl', 'animation', 'background', 'preset']
	},
	ScrollArea: {
		description: 'Custom scrollable area with styled scrollbars',
		category: 'layout',
		tags: ['scroll', 'overflow', 'scrollbar']
	},
	ScrollToTop: {
		description: 'Button that scrolls to top of page or container',
		category: 'action',
		tags: ['scroll', 'navigation', 'top', 'button']
	},
	SegmentedControl: {
		description: 'Compact segmented switch for mutually exclusive options',
		category: 'form',
		tags: ['segmented', 'switcher', 'single-select', 'view-toggle', 'tabs', 'toggle']
	},
	Select: {
		description: 'Closed dropdown select for choosing one option from a fixed list',
		category: 'form',
		tags: ['form', 'select', 'dropdown', 'option', 'choice', 'non-searchable']
	},
	MultiSelectCombobox: {
		description: 'Searchable multi-select combobox with removable selected tokens',
		category: 'form',
		tags: ['form', 'multiselect', 'combobox', 'autocomplete', 'tokens', 'chips']
	},
	Separator: {
		description: 'Visual divider between content',
		category: 'layout',
		tags: ['divider', 'line', 'hr', 'separator']
	},
	Sidebar: {
		description: 'Collapsible side navigation panel',
		category: 'navigation',
		tags: ['sidebar', 'navigation', 'panel', 'collapsible']
	},
	Skeleton: {
		description: 'Loading placeholder animation',
		category: 'feedback',
		tags: ['loading', 'placeholder', 'shimmer', 'skeleton']
	},
	Slider: {
		description: 'Range input slider with thumb control',
		category: 'input',
		tags: ['form', 'range', 'slider', 'value']
	},
	Spacer: {
		description: 'Empty space component for spacing',
		category: 'layout',
		tags: ['space', 'gap', 'margin', 'padding']
	},
	Sparkline: {
		description: 'Compact inline SVG sparkline chart',
		category: 'display',
		tags: ['sparkline', 'chart', 'inline', 'trend', 'svg', 'data']
	},
	Spinner: {
		description: 'Loading spinner animation',
		category: 'feedback',
		tags: ['loading', 'spinner', 'wait', 'processing']
	},
	Spotlight: {
		description:
			'Pointer-reactive radial highlight surface for cards, hero blocks, and interactive panels',
		category: 'display',
		tags: ['spotlight', 'pointer', 'hover', 'surface', 'motion']
	},
	Splitter: {
		description: 'Resizable split panels with drag handle',
		category: 'layout',
		tags: ['split', 'resize', 'panel', 'drag']
	},
	Stepper: {
		description: 'Step-by-step progress indicator',
		category: 'navigation',
		tags: ['steps', 'wizard', 'progress', 'workflow', 'multi-step', 'form']
	},
	Svg: {
		description: 'Accessible SVG wrapper with viewBox and aria-label defaults',
		category: 'utility',
		tags: ['svg', 'icon', 'graphic', 'accessible', 'vector']
	},
	Table: {
		description: 'Data table with header, body, footer sections',
		category: 'display',
		tags: ['data', 'table', 'grid', 'rows', 'columns']
	},
	TableOfContents: {
		description: 'Auto-generated table of contents from headings',
		category: 'navigation',
		tags: ['toc', 'navigation', 'headings', 'scroll-spy']
	},
	Tabs: {
		description: 'Tabbed content navigation',
		category: 'navigation',
		tags: ['tabs', 'nav', 'switch', 'panel']
	},
	TagsInput: {
		description: 'Input for managing a list of tags',
		category: 'input',
		tags: ['form', 'tags', 'chips', 'multi', 'input']
	},
	Text: {
		description: 'Standalone body copy export for starter-kit typography',
		category: 'display',
		tags: ['text', 'copy', 'paragraph', 'typography']
	},
	Textarea: {
		description: 'Multi-line text input',
		category: 'input',
		tags: ['form', 'text', 'multiline', 'textarea']
	},
	TimeInput: {
		description: 'Native time input with form control integration',
		category: 'input',
		tags: ['time', 'input', 'form', 'clock']
	},
	Timeline: {
		description: 'Vertical timeline for activity feeds and history',
		category: 'display',
		tags: ['timeline', 'activity', 'feed', 'history', 'events']
	},
	Toast: {
		description: 'Temporary notification message',
		category: 'feedback',
		tags: ['notification', 'toast', 'snackbar', 'alert']
	},
	Toggle: {
		description: 'Pressable toggle button',
		category: 'action',
		tags: ['button', 'toggle', 'pressed', 'switch']
	},
	ToggleGroup: {
		description: 'Group of toggle buttons with single/multiple selection',
		category: 'action',
		tags: ['button', 'toggle', 'group', 'select']
	},
	Toolbar: {
		description: 'Horizontal button group for actions',
		category: 'navigation',
		tags: ['actions', 'toolbar', 'buttons', 'bar']
	},
	Tooltip: {
		description: 'Hover/focus popup with descriptive text',
		category: 'overlay',
		tags: ['hover', 'info', 'tooltip', 'hint']
	},
	Tour: {
		description: 'Step-by-step guided tour overlay with spotlight',
		category: 'overlay',
		tags: ['tour', 'guide', 'spotlight', 'onboarding', 'walkthrough']
	},
	Transfer: {
		description: 'Dual-list transfer component for moving items between lists',
		category: 'input',
		tags: ['transfer', 'dual-list', 'move', 'select', 'shuttle']
	},
	Tree: {
		description: 'Hierarchical tree view with expand/collapse',
		category: 'display',
		tags: ['tree', 'hierarchy', 'expand', 'collapse', 'nested']
	},
	TypingIndicator: {
		description: 'Animated three-dot typing status indicator',
		category: 'display',
		tags: ['typing', 'status', 'chat', 'loading']
	},
	Typography: {
		description: 'Standalone semantic text exports: heading, text, code, blockquote',
		category: 'display',
		tags: ['text', 'heading', 'typography', 'prose', 'standalone']
	},
	VideoEmbed: {
		description: 'Video player embed for YouTube, Vimeo, and native sources',
		category: 'display',
		tags: ['video', 'embed', 'youtube', 'vimeo', 'player', 'media']
	},
	VirtualList: {
		description: 'Renders only visible items from large lists for performance',
		category: 'display',
		tags: ['virtual', 'list', 'scroll', 'performance', 'large']
	},
	VisuallyHidden: {
		description: 'Hides content visually but keeps it accessible to screen readers',
		category: 'utility',
		tags: ['a11y', 'screen-reader', 'hidden', 'accessible']
	},
	InputGroup: {
		description:
			'Compound input wrapper that combines prefixes, suffixes, separators, select slots, and actions',
		category: 'input',
		tags: ['input', 'field', 'affix', 'addon', 'control']
	},
	OptionPicker: {
		description:
			'Selectable option tiles with preview, label, and description for presets, fonts, shapes, and other visual choices',
		category: 'input',
		tags: ['picker', 'selection', 'options', 'tiles', 'preset', 'preview']
	},
	AlphaSlider: {
		description: 'Slider for selecting alpha/opacity values in color pickers',
		category: 'input',
		tags: ['alpha', 'opacity', 'slider', 'color', 'picker']
	},
	DropZone: {
		description: 'Drag-and-drop file drop zone area',
		category: 'input',
		tags: ['drag', 'drop', 'file', 'upload', 'zone']
	},
	StarRating: {
		description: 'Read-only star rating display with filled and outlined variants',
		category: 'display',
		tags: ['star', 'rating', 'review', 'score', 'display']
	},
	Tag: {
		description: 'Small labeled tag element with color and variant support',
		category: 'display',
		tags: ['tag', 'label', 'chip', 'badge', 'category', 'status']
	},
	Diagram: {
		description:
			'Config-driven diagram component with auto-layout, curved edges, clusters, swimlanes, and annotations',
		category: 'display',
		tags: ['diagram', 'graph', 'flow', 'architecture', 'network', 'sequence', 'visualization']
	},
	AffixGroup: {
		description: 'Grouped input shell for prefixes, suffixes, separators, and actions',
		category: 'input',
		tags: ['input', 'affix', 'prefix', 'suffix', 'separator', 'action'],
		surface: 'primitive'
	},
	AppFrame: {
		description:
			'Windowed app chrome with traffic-light dots, title, and actions around a content area',
		category: 'layout',
		tags: ['app-shell', 'frame', 'layout', 'header', 'chrome', 'traffic-lights']
	},
	AvatarGroup: {
		description: 'Compact cluster of avatars with overflow and presence status',
		category: 'display',
		tags: ['avatar', 'group', 'people', 'stack', 'presence'],
		surface: 'primitive'
	},
	ChatMessage: {
		description: 'Single chat row with role, avatar, name, and typing state',
		category: 'display',
		tags: ['chat', 'message', 'conversation', 'assistant', 'typing'],
		surface: 'primitive'
	},
	EmptyState: {
		description: 'Placeholder state with icon, title, description, and action',
		category: 'display',
		tags: ['empty', 'state', 'placeholder', 'onboarding', 'action'],
		surface: 'primitive'
	},
	Footer: {
		description: 'Site footer layout with brand, link groups, and copyright',
		category: 'layout',
		tags: ['footer', 'site', 'links', 'brand', 'copyright'],
		surface: 'primitive'
	},
	Hero: {
		description: 'Hero section wrapper with heading, subheading, and actions',
		category: 'layout',
		tags: ['hero', 'landing', 'banner', 'heading', 'actions'],
		surface: 'primitive'
	},
	LogoCloud: {
		description: 'Grid of linked brand logos with responsive alignment',
		category: 'display',
		tags: ['logo', 'brand', 'cloud', 'partners', 'gallery'],
		surface: 'primitive'
	},
	PageHeader: {
		description: 'Page-level header with eyebrow, title, description, metadata, and actions',
		category: 'layout',
		tags: ['page-header', 'title', 'metadata', 'actions', 'eyebrow'],
		surface: 'primitive'
	},
	SelectableTileGroup: {
		description: 'Selectable tile set for single-choice options with keyboard support',
		category: 'input',
		tags: ['tile', 'selection', 'picker', 'option', 'keyboard'],
		surface: 'primitive'
	},
	StatCard: {
		description: 'Compact KPI card with label, value, and trend',
		category: 'display',
		tags: ['stat', 'metric', 'card', 'kpi', 'trend'],
		surface: 'primitive'
	},
	Surface: {
		description: 'Simple surface wrapper for background treatment',
		category: 'layout',
		tags: ['surface', 'background', 'container', 'panel'],
		surface: 'primitive'
	},
	User: {
		description: 'User identity block with name, description, and optional content',
		category: 'display',
		tags: ['user', 'profile', 'identity', 'name', 'description'],
		surface: 'primitive'
	},
	WaveDivider: {
		description: 'Decorative SVG wave divider for section separation',
		category: 'visual',
		tags: ['divider', 'wave', 'decorative', 'section', 'svg'],
		surface: 'primitive'
	}
};

export const docsNavCategories: DocsNavCategory[] = [
	{
		label: 'Layout',
		items: ['Container', 'AppFrame', 'Separator', 'ScrollArea', 'Splitter', 'Spacer']
	},
	{
		label: 'Nav',
		items: [
			'Link',
			'Breadcrumb',
			'Tabs',
			'Pagination',
			'Sidebar',
			'NavigationMenu',
			'MegaMenu',
			'Menubar',
			'Accordion',
			'Collapsible',
			'Tree',
			'Stepper',
			'TableOfContents',
			'Toolbar'
		]
	},
	{
		label: 'Content',
		items: [
			'Card',
			'Text',
			'Heading',
			'List',
			'DescriptionList',
			'Timeline',
			'MarkdownRenderer',
			'CodeBlock',
			'ChatThread',
			'Kbd',
			'Marquee',
			'Typography'
		]
	},
	{
		label: 'Data',
		items: [
			'Table',
			'DataGrid',
			'Chart',
			'Sparkline',
			'Gauge',
			'Diagram',
			'Map',
			'QRCode',
			'FormatNumber',
			'FormatBytes',
			'FormatDate',
			'RelativeTime',
			'InfiniteScroll',
			'VirtualList'
		]
	},
	{
		label: 'Media',
		items: [
			'Image',
			'Avatar',
			'Icon',
			'AspectRatio',
			'VideoEmbed',
			'Carousel',
			'ImageComparison',
			'FlipCard',
			'LogoMark'
		]
	},
	{
		label: 'Forms',
		items: [
			'Input',
			'Textarea',
			'NumberInput',
			'PhoneInput',
			'Checkbox',
			'RadioGroup',
			'Select',
			'Combobox',
			'MultiSelectCombobox',
			'Listbox',
			'Slider',
			'AlphaSlider',
			'ColorPicker',
			'DateField',
			'DatePicker',
			'DateRangePicker',
			'DateTimeInput',
			'TimeInput',
			'Calendar',
			'RangeCalendar',
			'FileSelect',
			'FileUpload',
			'DropZone',
			'PromptInput',
			'RichTextEditor',
			'PinInput',
			'TagsInput',
			'InputGroup',
			'Field',
			'Fieldset',
			'Label'
		]
	},
	{
		label: 'Controls',
		items: [
			'Button',
			'ButtonGroup',
			'Toggle',
			'ToggleGroup',
			'Chip',
			'ChipGroup',
			'SegmentedControl',
			'OptionPicker',
			'Rating',
			'StarRating',
			'Transfer',
			'Clipboard',
			'DragAndDrop',
			'FloatButton',
			'ScrollToTop'
		]
	},
	{
		label: 'Overlay',
		items: [
			'Dialog',
			'AlertDialog',
			'Drawer',
			'Popover',
			'HoverCard',
			'Tooltip',
			'DropdownMenu',
			'ContextMenu',
			'CommandPalette',
			'NotificationCenter',
			'LinkPreview',
			'Tour',
			'Backdrop'
		]
	},
	{
		label: 'Status',
		items: [
			'Alert',
			'Toast',
			'Badge',
			'Tag',
			'Progress',
			'ProgressRing',
			'Skeleton',
			'Spinner',
			'TypingIndicator'
		]
	},
	{
		label: 'Effects',
		items: [
			'Aurora',
			'Glow',
			'Shimmer',
			'Reveal',
			'Spotlight',
			'Beam',
			'BorderBeam',
			'Glass',
			'Noise',
			'GradientMesh',
			'Adjust',
			'ChromaticAberration',
			'ChromaticShift',
			'Displacement',
			'GodRays',
			'Halftone',
			'MaskReveal',
			'ShaderCanvas'
		]
	},
	{
		label: 'Utils',
		items: ['Hotkey', 'FocusTrap', 'Portal', 'Svg', 'VisuallyHidden']
	}
];

export const primitiveComponentNames = Object.entries(componentMeta)
	.filter(([, meta]) => meta.surface === 'primitive')
	.map(([name]) => name);

export const docsNavComponentNames = docsNavCategories.flatMap((category) => category.items);

export const skillCompoundComponents = [
	'Accordion',
	'AlertDialog',
	'Breadcrumb',
	'Calendar',
	'Card',
	'Carousel',
	'Chart',
	'ChipGroup',
	'Collapsible',
	'ColorPicker',
	'Combobox',
	'CommandPalette',
	'ContextMenu',
	'DataGrid',
	'DateField',
	'DatePicker',
	'DateRangePicker',
	'DescriptionList',
	'Dialog',
	'DragAndDrop',
	'Drawer',
	'DropdownMenu',
	'Field',
	'Fieldset',
	'FileSelect',
	'FileUpload',
	'FlipCard',
	'FloatButton',
	'HoverCard',
	'InputGroup',
	'LinkPreview',
	'List',
	'Listbox',
	'Map',
	'MegaMenu',
	'Menubar',
	'MultiSelectCombobox',
	'NavigationMenu',
	'NotificationCenter',
	'OptionPicker',
	'Pagination',
	'PinInput',
	'Popover',
	'RadioGroup',
	'RangeCalendar',
	'RichTextEditor',
	'SegmentedControl',
	'Select',
	'Sidebar',
	'Splitter',
	'StarRating',
	'Stepper',
	'Table',
	'TableOfContents',
	'Tabs',
	'TagsInput',
	'Timeline',
	'Toast',
	'ToggleGroup',
	'Toolbar',
	'Tooltip',
	'Tour',
	'Transfer',
	'Tree',
	'Typography'
] as const;

/**
 * Docs-nav and skill-curation surfaces for DryUI components.
 *
 * This module used to host the hand-authored `componentMeta` record of every
 * component's description, category, tags, and surface. That data now lives
 * beside each component as `<name>.meta.ts` (see
 * `packages/mcp/src/load-component-meta.ts`) so adding or renaming a component
 * updates its metadata in one place.
 *
 * What remains here:
 *   - `ComponentSurface` / `ComponentMetaEntry` types (consumed by the loader
 *     and `generate-spec.ts`).
 *   - `docsNavCategories` + `docsNavComponentNames`: the curated docs IA,
 *     authoritative for the website nav and checked by the spec-coverage
 *     validator.
 *   - `skillCompoundComponents`: the curated skill list, cross-checked against
 *     `spec.json`'s `compound: true` set by the validator.
 */
export type ComponentSurface = 'primitive';

export interface ComponentMetaEntry {
	description: string;
	category: string;
	tags: string[];
	surface?: ComponentSurface;
}

interface DocsNavCategory {
	label: string;
	items: string[];
}

export const docsNavCategories: DocsNavCategory[] = [
	{
		label: 'Layout',
		items: ['Container', 'AreaGrid', 'AppFrame', 'Separator', 'ScrollArea', 'Splitter', 'Spacer']
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
			'VirtualList',
			'Numeric'
		]
	},
	{
		label: 'Media',
		items: [
			'Image',
			'Avatar',
			'Icon',
			'IconSwap',
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
			'ThemeToggle',
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
			'ShaderCanvas',
			'Enter',
			'Exit',
			'Stagger'
		]
	},
	{
		label: 'Utils',
		items: ['Hotkey', 'FocusTrap', 'Portal', 'Svg', 'VisuallyHidden']
	}
];

export const docsNavComponentNames = docsNavCategories.flatMap((category) => category.items);

export const skillCompoundComponents = [
	'Accordion',
	'AlertDialog',
	'AreaGrid',
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

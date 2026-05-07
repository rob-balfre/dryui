interface NavItem {
	name: string;
	kind: 'ui';
}

interface NavCategory {
	label: string;
	items: NavItem[];
}

const docsNavCategories: { label: string; items: string[] }[] = [
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
			'GodRays',
			'GradientMesh',
			'Adjust',
			'ChromaticAberration',
			'ChromaticShift',
			'Displacement',
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
		items: ['Hotkey', 'FocusTrap', 'Portal', 'Svg', 'TokenScope', 'VisuallyHidden']
	}
];

export const categories: NavCategory[] = docsNavCategories.map(({ label, items }) => ({
	label,
	items: items.map((name) => ({ name, kind: 'ui' }))
}));

export function toSlug(name: string): string {
	return name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export function allComponentNames(): string[] {
	return categories.flatMap((c) => c.items.map((item) => item.name));
}

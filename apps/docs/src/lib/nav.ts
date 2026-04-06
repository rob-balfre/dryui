export type CatalogKind = 'ui' | 'primitive';

export interface NavItem {
	name: string;
	kind: CatalogKind;
}

interface NavCategory {
	label: string;
	items: NavItem[];
}

function ui(name: string): NavItem {
	return { name, kind: 'ui' };
}

export interface LayoutPreset {
	id: string;
	name: string;
	description: string;
	thumbnail: string;
	components: string[];
	regions: string[];
	snippet: string;
}

export const layoutPresets: LayoutPreset[] = [];

export const categories: NavCategory[] = [
	{
		label: 'Layout',
		items: [
			ui('AspectRatio'),
			ui('Container'),
			ui('ScrollArea'),
			ui('Separator'),
			ui('Spacer'),
			ui('Splitter')
		]
	},
	{
		label: 'Navigation',
		items: [
			ui('Breadcrumb'),
			ui('Link'),
			ui('MegaMenu'),
			ui('Menubar'),
			ui('NavigationMenu'),
			ui('Pagination'),
			ui('Sidebar'),
			ui('Stepper'),
			ui('TableOfContents'),
			ui('Tabs'),
			ui('Toolbar')
		]
	},
	{
		label: 'Display',
		items: [
			ui('Accordion'),
			ui('Avatar'),
			ui('Badge'),
			ui('Card'),
			ui('Carousel'),
			ui('Chart'),
			ui('ChatThread'),
			ui('CodeBlock'),
			ui('Collapsible'),
			ui('DataGrid'),
			ui('DescriptionList'),
			ui('FlipCard'),
			ui('FormatBytes'),
			ui('FormatDate'),
			ui('FormatNumber'),
			ui('Gauge'),
			ui('Heading'),
			ui('Icon'),
			ui('Image'),
			ui('ImageComparison'),
			ui('InfiniteScroll'),
			ui('Kbd'),
			ui('LinkPreview'),
			ui('List'),
			ui('Map'),
			ui('MarkdownRenderer'),
			ui('Marquee'),
			ui('QRCode'),
			ui('RelativeTime'),
			ui('Sparkline'),
			ui('Table'),
			ui('Text'),
			ui('Timeline'),
			ui('Tree'),
			ui('TypingIndicator'),
			ui('Typography'),
			ui('VideoEmbed'),
			ui('VirtualList')
		]
	},
	{
		label: 'Action',
		items: [
			ui('Button'),
			ui('ButtonGroup'),
			ui('Chip'),
			ui('ChipGroup'),
			ui('Clipboard'),
			ui('FloatButton'),
			ui('ScrollToTop'),
			ui('Toggle'),
			ui('ToggleGroup')
		]
	},
	{
		label: 'Input',
		items: [
			ui('Checkbox'),
			ui('ColorPicker'),
			ui('CountrySelect'),
			ui('FileSelect'),
			ui('FileUpload'),
			ui('Input'),
			ui('InputGroup'),
			ui('NumberInput'),
			ui('OptionSwatchGroup'),
			ui('PhoneInput'),
			ui('PinInput'),
			ui('PromptInput'),
			ui('RadioGroup'),
			ui('Rating'),
			ui('RichTextEditor'),
			ui('Slider'),
			ui('TagsInput'),
			ui('Textarea'),
			ui('Transfer')
		]
	},
	{
		label: 'Form',
		items: [
			ui('Calendar'),
			ui('Combobox'),
			ui('MultiSelectCombobox'),
			ui('DateField'),
			ui('DatePicker'),
			ui('DateRangePicker'),
			ui('DateTimeInput'),
			ui('Field'),
			ui('Fieldset'),
			ui('Label'),
			ui('Listbox'),
			ui('RangeCalendar'),
			ui('SegmentedControl'),
			ui('Select'),
			ui('TimeInput')
		]
	},
	{
		label: 'Overlay',
		items: [
			ui('AlertDialog'),
			ui('Backdrop'),
			ui('CommandPalette'),
			ui('ContextMenu'),
			ui('Dialog'),
			ui('Drawer'),
			ui('DropdownMenu'),
			ui('HoverCard'),
			ui('NotificationCenter'),
			ui('Popover'),
			ui('Tooltip'),
			ui('Tour')
		]
	},
	{
		label: 'Feedback',
		items: [
			ui('Alert'),
			ui('Progress'),
			ui('ProgressRing'),
			ui('Skeleton'),
			ui('Spinner'),
			ui('Toast')
		]
	},
	{
		label: 'Visual',
		items: [
			ui('Adjust'),
			ui('Aurora'),
			ui('Beam'),
			ui('ChromaticAberration'),
			ui('ChromaticShift'),
			ui('Displacement'),
			ui('Glass'),
			ui('Glow'),
			ui('GodRays'),
			ui('GradientMesh'),
			ui('Halftone'),
			ui('MaskReveal'),
			ui('Noise'),
			ui('Reveal'),
			ui('ShaderCanvas'),
			ui('Spotlight')
		]
	},
	{
		label: 'Interaction',
		items: [ui('DragAndDrop')]
	},
	{
		label: 'Utility',
		items: [ui('FocusTrap'), ui('Hotkey'), ui('Portal'), ui('Svg'), ui('VisuallyHidden')]
	},
	{
		label: 'Tools',
		items: [ui('SystemMap'), ui('Thumbnail')]
	},
];

export function toSlug(name: string): string {
	return name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export function fromSlug(slug: string): NavItem | undefined {
	for (const cat of categories) {
		for (const item of cat.items) {
			if (toSlug(item.name) === slug) return item;
		}
	}
	return undefined;
}

export function allComponentNames(): string[] {
	return categories.flatMap((c) => c.items.map((item) => item.name));
}

export function getComponentItem(name: string): NavItem | undefined {
	for (const category of categories) {
		for (const item of category.items) {
			if (item.name === name) return item;
		}
	}
	return undefined;
}

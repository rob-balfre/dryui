import { existsSync, readFileSync } from 'node:fs';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { componentCompositions, compositionRecipes } from './composition-data';
import { aiSurface } from './ai-surface.js';
import {
	componentMeta as manifestComponentMeta,
	type ComponentMetaEntry
} from './component-catalog.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const uiSrc = resolve(__dirname, '../../ui/src');
const primSrc = resolve(__dirname, '../../primitives/src');
const outPath = resolve(__dirname, 'spec.json');

type PropShape = {
	type: string;
	default?: string;
	required?: boolean;
	bindable?: boolean;
	acceptedValues?: string[];
	description?: string;
	note?: string;
};
type DataAttributeShape = {
	name: string;
	description?: string;
	values?: string[];
};
type ForwardedPropsShape = {
	baseType: string;
	via: 'rest';
	element?: string;
	examples?: string[];
	omitted?: string[];
	note: string;
};
type StructureShape = {
	tree: string[];
	note?: string;
};
type PartShape = {
	props: Record<string, PropShape>;
	forwardedProps?: ForwardedPropsShape | null;
};
type ComponentShape = {
	import: string;
	description: string;
	category: string;
	tags: string[];
	compound: boolean;
	props?: Record<string, PropShape>;
	parts?: Record<string, PartShape>;
	forwardedProps?: ForwardedPropsShape | null;
	groups?: { name: string; props: string[] }[];
	structure?: StructureShape | null;
	a11y?: string[];
	cssVars: Record<string, string>;
	dataAttributes: DataAttributeShape[];
	example: string;
};

const COMPONENT_META = manifestComponentMeta;

const BINDABLE_MAP: Record<string, string[]> = {
	'input/input.svelte': ['value'],
	'textarea/textarea.svelte': ['value'],
	'number-input/number-input.svelte': ['value'],
	'slider/slider.svelte': ['value'],
	'phone-input/phone-input.svelte': ['value'],
	'pin-input/pin-input-root.svelte': ['value'],
	'rating/rating.svelte': ['value'],
	'radio-group/radio-group.svelte': ['value'],
	'radio-group/radio-group-root.svelte': ['value'],
	'toggle/toggle.svelte': ['pressed'],
	'checkbox/checkbox.svelte': ['checked'],
	'switch/switch.svelte': ['checked'],
	'tags-input/tags-input-root.svelte': ['value'],
	'file-upload/file-upload-root.svelte': ['files'],
	'toggle-group/toggle-group-root.svelte': ['value'],
	'color-picker/color-picker-root.svelte': ['value', 'alpha'],
	'select/select-root.svelte': ['open', 'value'],
	'combobox/combobox-root.svelte': ['open', 'value'],
	'popover/popover-root.svelte': ['open'],
	'date-picker/datepicker-root.svelte': ['open', 'value'],
	'float-button/float-button-root.svelte': ['open'],
	'rich-text-editor/rich-text-editor-root.svelte': ['value'],
	'tour/tour-root.svelte': ['active'],
	'transfer/transfer-root.svelte': ['sourceItems', 'targetItems'],
	'calendar/calendar-root.svelte': ['value'],
	'carousel/carousel-root.svelte': ['activeIndex'],
	'date-field/date-field-root.svelte': ['value'],
	'date-time-input/date-time-input.svelte': ['value'],
	'date-range-picker/date-range-picker-root.svelte': ['open', 'startDate', 'endDate'],
	'hover-card/hover-card-root.svelte': ['open'],
	'image-comparison/image-comparison.svelte': ['position'],
	'link-preview/link-preview-root.svelte': ['open'],
	'listbox/listbox-root.svelte': ['value'],
	'notification-center/notification-center-root.svelte': ['items', 'open'],
	'range-calendar/range-calendar-root.svelte': ['startDate', 'endDate'],
	'chip-group/chip-group-root.svelte': ['value'],
	'segmented-control/segmented-control-root.svelte': ['value'],
	'sidebar/sidebar-root.svelte': ['collapsed'],
	'stepper/stepper-root.svelte': ['activeStep'],
	'table-of-contents/table-of-contents-root.svelte': ['activeId'],
	'time-input/time-input.svelte': ['value'],
	'tree/tree-root.svelte': ['selectedItem']
};

const ELEMENT_NAME_MAP: Record<string, string> = {
	HTMLAnchorAttributes: 'a',
	HTMLButtonAttributes: 'button',
	HTMLInputAttributes: 'input',
	HTMLSelectAttributes: 'select',
	HTMLTextAreaAttributes: 'textarea',
	HTMLCanvasElement: 'canvas',
	HTMLDListElement: 'dl',
	HTMLDivElement: 'div',
	HTMLHeadingElement: 'h*',
	HTMLElement: 'element',
	HTMLLIElement: 'li',
	HTMLOListElement: 'ol',
	HTMLParagraphElement: 'p',
	HTMLQuoteElement: 'blockquote',
	HTMLSpanElement: 'span',
	HTMLTableCellElement: 'td',
	HTMLTableElement: 'table',
	HTMLTableRowElement: 'tr',
	HTMLTableSectionElement: 'tbody',
	HTMLTimeElement: 'time',
	HTMLUListElement: 'ul',
	SVGSVGElement: 'svg'
};

const FORWARDED_PROP_EXAMPLES: Record<string, string[]> = {
	a: ['href', 'target', 'rel'],
	blockquote: ['id', 'style', 'aria-label'],
	button: ['type', 'disabled', 'name'],
	canvas: ['width', 'height', 'aria-label'],
	div: ['id', 'style', 'role'],
	dl: ['id', 'style', 'role'],
	element: ['id', 'class', 'aria-label'],
	'h*': ['id', 'style', 'aria-label'],
	input: ['name', 'autocomplete', 'inputmode'],
	li: ['id', 'role', 'value'],
	ol: ['id', 'style', 'aria-labelledby'],
	p: ['id', 'style', 'aria-describedby'],
	select: ['name', 'multiple', 'autocomplete'],
	span: ['id', 'style', 'aria-label'],
	table: ['id', 'style', 'aria-describedby'],
	tbody: ['id', 'style', 'aria-describedby'],
	td: ['colspan', 'rowspan', 'headers'],
	textarea: ['name', 'rows', 'placeholder'],
	time: ['datetime', 'id', 'aria-label'],
	tr: ['id', 'aria-selected', 'role'],
	ul: ['id', 'style', 'aria-labelledby']
};

const PROP_NOTES: Record<string, string> = {
	'Button.href':
		'When provided, Button renders an anchor instead of a button for link-style actions.',
	'Combobox.Root.name':
		'Adds a hidden input so the selected value participates in native form submission.',
	'Container.size': 'Preset container width, not an arbitrary CSS length.',
	'DateField.Root.name':
		'Adds a hidden input so the selected date participates in native form submission as YYYY-MM-DD.',
	'DatePicker.Root.name':
		'Adds a hidden input so the selected date participates in native form submission as YYYY-MM-DD.',
	'NumberInput.size':
		'Adjusts input density and its default maximum width for compact counter-style fields.',
	'Select.Root.name':
		'Adds a hidden input so the selected value participates in native form submission.',
	'Stepper.Root.activeStep': 'Bindable current step index for controlled multi-step flows.',
	'Text.color':
		'Use muted or secondary for supporting copy without reaching for inline color styles.',
	'Text.size': 'Applies DryUI text scale tokens for compact or emphasized body copy.',
	'Typography.Text.color':
		'Use muted or secondary for supporting copy without reaching for inline color styles.',
	'Typography.Text.size': 'Applies DryUI text scale tokens for compact or emphasized body copy.'
};

const GENERIC_PROP_DESCRIPTIONS: Record<string, string> = {
	activeStep: 'Current step index for a controlled multi-step flow.',
	align: 'Alignment for child content along the cross axis.',
	alt: 'Accessible alternative text announced when the media itself is not visible.',
	as: 'Underlying HTML element to render for the component.',
	checked: 'Current checked state for controlled or bindable usage.',
	children: 'Content rendered inside the component.',
	color: 'Semantic color or tone applied to the component.',
	defaultValue: 'Initial uncontrolled value before user interaction.',
	description: 'Supporting copy that explains the current control or section.',
	disabled: 'Prevents interaction and applies disabled styling.',
	download: 'Requests download behavior when the component renders as a link.',
	href: 'Destination URL when the component renders as a link.',
	id: 'Unique HTML id used for labels, aria relationships, or targeted styling.',
	label: 'Visible label text shown for the control or item.',
	level: 'Semantic heading level to render.',
	max: 'Maximum allowed value.',
	min: 'Minimum allowed value.',
	name: 'Field name used during native form submission.',
	onSelect: 'Callback fired when the item is selected.',
	open: 'Whether the overlay or disclosure is currently open.',
	orientation: 'Horizontal or vertical layout direction.',
	placeholder: 'Hint text shown when no value is selected or entered.',
	rel: 'Relationship between the current document and the linked resource.',
	selected: 'Whether the current item is selected.',
	side: 'Preferred side for overlay placement.',
	size: 'Size preset affecting density, spacing, or typography.',
	src: 'Source URL for image, video, or other media content.',
	step: 'Step interval used when incrementing numeric values.',
	target: 'Browsing context used for link navigation.',
	title: 'Primary heading or label text.',
	type: 'HTML type attribute or component-specific type selector.',
	value: 'Current controlled or bindable value.',
	variant: 'Visual style preset for the component.',
	wrap: 'Controls whether child content can wrap onto multiple lines.'
};

const PROP_DESCRIPTIONS: Record<string, string> = {
	'Accordion.Root.type': 'Accordion behavior mode for single or multiple expanded items.',
	'Badge.color': 'Semantic tone applied to the badge background, border, or text treatment.',
	'Badge.size': 'Badge density preset for compact metadata or standard labels.',
	'Badge.variant': 'Badge treatment ranging from filled emphasis to subtle outline styles.',
	'BorderBeam.active':
		'Whether the beam is currently glowing. Disabling it plays the fade-out sequence before the effect becomes idle.',
	'BorderBeam.borderRadius':
		'Optional border radius override for the beam host. When omitted, the first child radius is detected automatically.',
	'BorderBeam.colorVariant':
		'Beam palette preset matching the upstream colorful, mono, ocean, or sunset glow treatments.',
	'BorderBeam.onActivate': 'Callback fired after the beam fade-in animation completes.',
	'BorderBeam.onDeactivate': 'Callback fired after the beam fade-out animation completes.',
	'BorderBeam.size':
		'Effect mode preset: compact control ring (`sm`), full border glow (`md`), or bottom-edge line trace (`line`).',
	'BorderBeam.strength': 'Intensity multiplier for the beam stroke, inner glow, and bloom layers.',
	'BorderBeam.theme':
		'Color tuning for dark or light surfaces, or system preference when set to `auto`.',
	'Button.color': 'Semantic tone for primary or destructive button actions.',
	'Button.size': 'Button density preset, including icon-only sizing variants.',
	'Button.variant': 'Button treatment from solid primary actions to ghost and inline link styles.',
	'Card.Root.selected': 'Applies selected-state styling for interactive card surfaces.',
	'Dialog.Close.children': 'Label or content rendered inside the dismiss control.',
	'Dialog.Content.children': 'Main dialog surface content rendered inside the modal.',
	'Dialog.Root.open': 'Controls whether the dialog is currently shown.',
	'Dialog.Trigger.children': 'Interactive element that opens the dialog.',
	'Input.size': 'Input density preset for compact, default, or spacious form layouts.',
	'Input.type': 'Native input type such as text, email, password, or search.',
	'Input.value': 'Bindable text value for controlled input usage.',
	'Select.Root.open': 'Controls whether the select menu is currently expanded.',
	'Select.Root.value': 'Bindable selected value for the current option set.',
	'Tabs.Root.value': 'Bindable current tab value for controlled tab interfaces.',
	'Tabs.Trigger.value': 'Tab identifier that activates the matching content panel.',
	'Typography.Heading.level': 'Heading level used to render semantic h1 through h6 output.',
	'Typography.Text.as': 'Text element to render for inline, block, or paragraph copy.'
};

const A11Y_NOTES: Record<string, string[]> = {
	Accordion: [
		'Use descriptive trigger text so the hidden content is understandable before expansion.',
		'Keep each trigger paired with its matching content so keyboard and screen-reader relationships stay intact.'
	],
	Button: [
		'Provide discernible text or an aria-label for icon-only buttons.',
		'Use the href prop for navigation so the element keeps link semantics.'
	],
	Checkbox: ['Pair the checkbox with visible text or an aria-label so its purpose is announced.'],
	Dialog: [
		'Always provide a clear heading so the dialog context is announced when it opens.',
		'Ensure there is an obvious close path for both keyboard and pointer users.'
	],
	Input: [
		'Pair Input with a visible Label or an aria-label so the field purpose is announced.',
		'Use native type, autocomplete, and name attributes for expected keyboard and form behavior.'
	],
	Popover: [
		'Avoid placing essential actions in hover-only or transient content; keyboard users must be able to reopen the popover.'
	],
	Select: [
		'Provide surrounding field context and a name when the selected value needs to submit with a form.'
	],
	Switch: ['Use switches for immediate on/off settings and pair them with visible labels.'],
	ThemeToggle: [
		'Keep the default aria-label or pass a custom one so the purpose of the button is announced.',
		'The Alt-click and Escape shortcuts return to system mode; do not remove them in custom wrappers so users can opt back into prefers-color-scheme.'
	],
	Tabs: [
		'Give each Tabs.Trigger concise, descriptive text so keyboard and screen-reader users can scan options quickly.',
		'Keep Tabs.List and Tabs.Content as siblings under Tabs.Root to preserve roving focus and aria wiring.'
	],
	Toast: ['Do not rely on toast content as the only place critical workflow information appears.']
};

const CATEGORY_A11Y_NOTES: Record<string, string[]> = {
	action: [
		'Provide discernible text or an aria-label for controls that do not expose visible text.',
		'Use button semantics for in-place actions and link semantics for navigation.'
	],
	display: [
		'Treat the component as presentational unless it exposes interactive affordances, and label any interactive affordances explicitly.',
		'Keep heading, reading, and focus order aligned with the surrounding content.'
	],
	feedback: [
		'Do not rely on transient feedback as the only place critical workflow information appears.',
		'Label dismiss or retry actions explicitly so their purpose is announced.'
	],
	form: [
		'Pair the control with a visible label or aria-label and keep helper or error text programmatically associated.',
		'Provide native name, autocomplete, and value wiring when the component participates in form submission.'
	],
	input: [
		'Pair the control with a visible label or aria-label and keep helper or error text programmatically associated.',
		'Preserve expected keyboard entry, selection, and state announcements for the chosen input pattern.'
	],
	interaction: [
		'Provide a clear accessible name for every interactive target and keep the action model consistent.',
		'Match keyboard behavior to the established widget pattern rather than inventing a custom key map.'
	],
	layout: [
		'This component does not add meaning by itself; ensure child content supplies the required headings, labels, and landmarks.',
		'Only add landmark or region semantics when the section has a unique, meaningful label.'
	],
	navigation: [
		'Use concise, descriptive labels so navigation items are understandable when announced out of context.',
		'Preserve the expected keyboard model and expose current or selected state where relevant.'
	],
	overlay: [
		'Ensure the trigger, popup role, and focus return behavior all describe the same interaction model.',
		'Provide an obvious keyboard dismissal path and avoid putting essential actions in hover-only content.'
	],
	visual: [
		'Treat the effect as decorative and keep underlying content understandable without color, blur, or motion alone.',
		'Respect reduced-motion and contrast requirements when animation or filtering is enabled.'
	]
};

function hasAnyTag(meta: ComponentMetaEntry, tags: string[]): boolean {
	return tags.some((tag) => meta.tags.includes(tag));
}

function buildGeneratedA11yNotes(meta: ComponentMetaEntry): string[] {
	const fallbackNotes = CATEGORY_A11Y_NOTES.display ?? [];
	const notes = [...(CATEGORY_A11Y_NOTES[meta.category] ?? fallbackNotes)];

	if (hasAnyTag(meta, ['alert', 'message', 'notification', 'toast'])) {
		notes.push(
			'Choose live-region urgency carefully and do not make short-lived announcements the only source of important information.'
		);
	}

	if (hasAnyTag(meta, ['carousel', 'slideshow', 'slider'])) {
		notes.push(
			'If content auto-advances, provide pause or stop controls and respect reduced-motion preferences.'
		);
	}

	if (hasAnyTag(meta, ['chart', 'graph', 'data', 'visualization'])) {
		notes.push(
			'Expose the essential data in text form, such as a summary, value list, or table, rather than relying on the graphic alone.'
		);
	}

	if (hasAnyTag(meta, ['dialog', 'drawer', 'menu', 'menubar', 'modal', 'popover', 'tooltip'])) {
		notes.push(
			'Keep the opening control labeled, ensure focus moves predictably on open and close, and expose the popup type truthfully.'
		);
	}

	if (hasAnyTag(meta, ['editor', 'formatting', 'rich-text', 'contenteditable'])) {
		notes.push(
			'Label editor toolbars and popovers explicitly, and ensure formatting actions remain keyboard-complete.'
		);
	}

	if (hasAnyTag(meta, ['scroll', 'overflow', 'scrollbar'])) {
		notes.push(
			'Only add region semantics when the scrollable surface has a unique, meaningful label.'
		);
	}

	if (hasAnyTag(meta, ['tree', 'hierarchy', 'nested'])) {
		notes.push(
			'Keep focus on the treeitem and follow the standard arrow-key tree model for expand, collapse, and traversal.'
		);
	}

	return [...new Set(notes)];
}

function getA11yNotes(name: string, meta: ComponentMetaEntry): string[] {
	return A11Y_NOTES[name] ?? buildGeneratedA11yNotes(meta);
}

type DataAttributeMeta = {
	description: string;
	values?: string[];
};

const GENERIC_DATA_ATTRIBUTE_META: Record<string, DataAttributeMeta> = {
	'data-active': {
		description: 'Present on the active item or current target within the component.'
	},
	'data-disabled': {
		description: 'Present when the component or part is disabled.'
	},
	'data-invalid': {
		description: 'Present when the current field value is invalid.'
	},
	'data-orientation': {
		description: 'Reflects the current horizontal or vertical orientation.',
		values: ['horizontal', 'vertical']
	},
	'data-selected': {
		description: 'Present when the current item is selected.'
	},
	'data-side': {
		description: 'Indicates the resolved placement side for the overlay surface.',
		values: ['top', 'right', 'bottom', 'left']
	}
};

const DATA_ATTRIBUTE_META: Record<string, DataAttributeMeta> = {
	'Accordion.data-state': {
		description: 'Reflects whether the current accordion item is expanded or collapsed.',
		values: ['open', 'closed']
	},
	'Collapsible.data-state': {
		description: 'Reflects whether the collapsible content is expanded or collapsed.',
		values: ['open', 'closed']
	},
	'CommandPalette.data-state': {
		description: 'Reflects whether the command palette dialog is open or closed.',
		values: ['open', 'closed']
	},
	'Dialog.data-state': {
		description: 'Reflects whether the dialog is open or closed.',
		values: ['open', 'closed']
	},
	'BorderBeam.data-active': {
		description: 'Present while the beam is rendering its active glow and bloom layers.'
	},
	'BorderBeam.data-beam': {
		description: 'Per-instance marker on the beam host used to scope the injected effect styles.'
	},
	'BorderBeam.data-beam-bloom': {
		description: 'Bloom layer element that renders the outer glow spill around the active beam.'
	},
	'BorderBeam.data-fading': {
		description: 'Present while the beam is playing its fade-out sequence.'
	},
	'BorderBeam.data-size': {
		description: 'Reflects the current effect mode preset.',
		values: ['sm', 'md', 'line']
	},
	'Drawer.data-state': {
		description: 'Reflects whether the drawer is open or closed.',
		values: ['open', 'closed']
	},
	'Popover.data-state': {
		description: 'Reflects whether the popover is open or closed.',
		values: ['open', 'closed']
	},
	'Select.data-state': {
		description:
			'Reflects whether the select surface is expanded or whether an option is active, depending on the part.',
		values: ['open', 'closed', 'checked', 'unchecked']
	},
	'Tabs.data-state': {
		description: 'Reflects whether the tab trigger or panel is active.',
		values: ['active', 'inactive']
	}
};

const PROP_GROUPS: Record<string, { name: string; props: string[] }[]> = {
	Button: [
		{ name: 'Appearance', props: ['variant', 'size', 'color', 'disabled'] },
		{ name: 'Link / Navigation', props: ['href', 'rel', 'target', 'download'] },
		{ name: 'Content', props: ['children', 'type'] }
	]
};

const STRUCTURE_NOTES: Record<string, string> = {
	Stepper:
		'Stepper.List wraps Stepper.Step and Stepper.Separator. Bind activeStep on Root when controlling the current step.',
	Tabs: 'Tabs.List groups the triggers, while Tabs.Content stays as a sibling of Tabs.List under Tabs.Root.',
	Typography:
		'Typography is a namespaced set of standalone text parts. Use Typography.Heading or Typography.Text directly; there is no Typography.Root wrapper.'
};

function cssVarDescription(varName: string): string {
	// Full variable name overrides for compound-component-specific tokens
	const fullMap: Record<string, string> = {
		'--dry-pin-bg': 'Cell background color',
		'--dry-pin-border': 'Cell border color',
		'--dry-pin-font-size': 'Cell font size',
		'--dry-pin-radius': 'Cell border radius',
		'--dry-pin-size': 'Cell width and height',
		'--dry-pin-caret-color': 'Caret color',
		'--dry-pin-separator-color': 'Separator color',
		'--dry-separator-color': 'Line color',
		'--dry-separator-spacing': 'Margin around the line'
	};
	if (fullMap[varName]) return fullMap[varName];

	const suffix = varName.replace(/^--dry-\w+-/, '');
	const map: Record<string, string> = {
		bg: 'Background color',
		color: 'Text color',
		border: 'Border color',
		radius: 'Border radius',
		padding: 'Padding',
		'padding-x': 'Horizontal padding',
		'padding-y': 'Vertical padding',
		'font-size': 'Font size',
		shadow: 'Box shadow',
		'max-width': 'Maximum width',
		size: 'Size',
		height: 'Height',
		gap: 'Gap spacing',
		weight: 'Font weight',
		leading: 'Line height',
		width: 'Width',
		track: 'Track color',
		'track-height': 'Track height',
		'thumb-size': 'Thumb size',
		'min-height': 'Minimum height'
	};

	return (
		map[suffix] ??
		suffix
			.split('-')
			.map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
			.join(' ')
	);
}

function collectDataAttributes(source: string): string[] {
	const attrs = new Set<string>();

	// Match data attributes in HTML (data-foo=, data-foo>, data-foo ) and CSS selectors ([data-foo])
	for (const match of source.matchAll(/\b(data-[\w-]+)(?=[=\s>\]'])/g)) {
		const attr = match[1];
		if (attr) attrs.add(attr);
	}

	return [...attrs].sort();
}

function parseInterface(source: string, name: string): Record<string, PropShape> {
	const marker = `export interface ${name}`;
	const idx = source.indexOf(marker);
	if (idx === -1) return {};

	const braceStart = source.indexOf('{', idx);
	if (braceStart === -1) return {};

	let depth = 0;
	let end = braceStart;
	for (let i = braceStart; i < source.length; i += 1) {
		const char = source[i];
		if (char === '{') depth += 1;
		if (char === '}') {
			depth -= 1;
			if (depth === 0) {
				end = i;
				break;
			}
		}
	}

	const body = source.slice(braceStart + 1, end);
	const props: Record<string, PropShape> = {};

	for (const line of body.split('\n')) {
		const trimmed = line.trim();
		const match = trimmed.match(/^(\w+)(\?)?:\s*(.+?);?\s*$/);
		if (!match) continue;

		const propName = match[1];
		const optional = match[2];
		const rawType = match[3];
		if (!propName || !rawType) continue;

		props[propName] = {
			type: rawType.replace(/;$/, '').trim(),
			required: !optional
		};
	}

	return props;
}

function parseInterfaceBaseType(source: string, name: string): string | null {
	const marker = `export interface ${name}`;
	const idx = source.indexOf(marker);
	if (idx === -1) return null;

	const braceStart = source.indexOf('{', idx);
	if (braceStart === -1) return null;

	const header = source.slice(idx, braceStart);
	const match = header.match(/extends\s+(.+)$/s);
	return match?.[1]?.trim() ?? null;
}

function parseTypeAliasBaseType(source: string, name: string): string | null {
	const match = new RegExp(`export type ${name}\\s*=\\s*([^;]+);`).exec(source);
	return match?.[1]?.trim() ?? null;
}

function extractAcceptedValues(rawType: string): string[] | undefined {
	const unionParts = rawType
		.split('|')
		.map((part) => part.trim())
		.filter(Boolean);
	if (unionParts.length < 2) return undefined;

	const values: string[] = [];
	for (const part of unionParts) {
		const quoted = part.match(/^'([^']+)'$/);
		if (quoted?.[1]) {
			values.push(quoted[1]);
			continue;
		}

		if (/^-?\d+(\.\d+)?$/.test(part) || part === 'true' || part === 'false' || part === 'null') {
			values.push(part);
			continue;
		}

		return undefined;
	}

	return values.length > 0 ? values : undefined;
}

function tagNameForBaseType(baseType: string): string | undefined {
	if (ELEMENT_NAME_MAP[baseType]) return ELEMENT_NAME_MAP[baseType];

	const htmlAttributesMatch = baseType.match(/HTMLAttributes<(\w+)>/);
	if (htmlAttributesMatch?.[1] && ELEMENT_NAME_MAP[htmlAttributesMatch[1]]) {
		return ELEMENT_NAME_MAP[htmlAttributesMatch[1]];
	}

	const svgAttributesMatch = baseType.match(/SVGAttributes<(\w+)>/);
	if (svgAttributesMatch?.[1] && ELEMENT_NAME_MAP[svgAttributesMatch[1]]) {
		return ELEMENT_NAME_MAP[svgAttributesMatch[1]];
	}

	return undefined;
}

function describeForwardedProps(baseType: string | null): ForwardedPropsShape | null {
	if (!baseType || !(baseType.includes('HTML') || baseType.includes('SVG'))) return null;

	let normalized = baseType.trim();
	let omitted: string[] = [];

	const omitMatch = normalized.match(/^Omit<(.+?),\s*(.+)>$/);
	if (omitMatch?.[1]) {
		normalized = omitMatch[1].trim();
		omitted = [...(omitMatch[2]?.matchAll(/'([^']+)'/g) ?? [])]
			.map((match) => match[1])
			.filter((value): value is string => Boolean(value));
	}

	const element = tagNameForBaseType(normalized);
	const examples = element ? (FORWARDED_PROP_EXAMPLES[element] ?? []) : [];
	const target = element ? `<${element}>` : baseType.includes('SVG') ? 'native SVG' : 'native HTML';

	return {
		baseType: baseType.trim(),
		via: 'rest',
		...(element ? { element } : {}),
		...(examples.length > 0 ? { examples } : {}),
		...(omitted.length > 0 ? { omitted } : {}),
		note: `Forwards ${target} attributes via rest props.`
	};
}

function noteForProp(
	componentName: string,
	propName: string,
	partName?: string
): string | undefined {
	if (partName) {
		const partKey = `${componentName}.${partName}.${propName}`;
		if (PROP_NOTES[partKey]) return PROP_NOTES[partKey];
	}

	return PROP_NOTES[`${componentName}.${propName}`];
}

function descriptionForProp(
	componentName: string,
	propName: string,
	partName?: string
): string | undefined {
	if (partName) {
		const partKey = `${componentName}.${partName}.${propName}`;
		if (PROP_DESCRIPTIONS[partKey]) return PROP_DESCRIPTIONS[partKey];
	}

	return PROP_DESCRIPTIONS[`${componentName}.${propName}`] ?? GENERIC_PROP_DESCRIPTIONS[propName];
}

function resolvePropTypeReference(
	typeExpression: string,
	source: string,
	sourcePath?: string,
	stack = new Set<string>()
): string {
	const trimmed = typeExpression.trim();
	if (!trimmed) return trimmed;

	const indexedMatch = trimmed.match(/^(\w+)\[['"]([^'"]+)['"]\]$/);
	if (indexedMatch?.[1] && indexedMatch[2]) {
		const props = resolvePropsFromTypeExpression(indexedMatch[1], source, sourcePath, stack);
		return props[indexedMatch[2]]?.type ?? trimmed;
	}

	const identifierMatch = trimmed.match(/^(\w+)$/);
	if (!identifierMatch?.[1]) return trimmed;

	const typeName = identifierMatch[1];
	const visitKey = `${sourcePath ?? 'inline'}:${typeName}:prop-type`;
	if (stack.has(visitKey)) return trimmed;

	stack.add(visitKey);

	try {
		const aliasType = parseTypeAliasBaseType(source, typeName);
		if (aliasType) {
			return resolvePropTypeReference(aliasType, source, sourcePath, stack);
		}

		const importedType = resolveImportedTypeSource(source, typeName, sourcePath);
		if (!importedType) return trimmed;

		return resolvePropTypeReference(
			importedType.exportedName,
			importedType.source,
			importedType.sourcePath,
			stack
		);
	} finally {
		stack.delete(visitKey);
	}
}

function enrichProps(
	props: Record<string, PropShape>,
	componentName: string,
	partName?: string,
	source?: string,
	sourcePath?: string
): Record<string, PropShape> {
	for (const [propName, prop] of Object.entries(props)) {
		if (source) {
			prop.type = resolvePropTypeReference(prop.type, source, sourcePath);
		}

		const acceptedValues = extractAcceptedValues(prop.type);
		if (acceptedValues) {
			prop.acceptedValues = acceptedValues;
		}

		const description = descriptionForProp(componentName, propName, partName);
		if (description) {
			prop.description = description;
		}

		const note = noteForProp(componentName, propName, partName);
		if (note) {
			prop.note = note;
		}
	}

	return props;
}

function deriveStructure(example: string, name: string): StructureShape | null {
	const lines: string[] = [];
	const seen = new Set<string>();
	const stack: string[] = [];
	const tagPattern = /<\/?([A-Z][A-Za-z0-9.]*)[^>]*?\/?>/g;

	for (const match of example.matchAll(tagPattern)) {
		const fullTag = match[0];
		const tagName = match[1];
		if (!fullTag || !tagName || !tagName.startsWith(`${name}.`)) continue;

		const isClosing = fullTag.startsWith('</');
		const isSelfClosing = fullTag.endsWith('/>');

		if (isClosing) {
			stack.pop();
			continue;
		}

		const depth = stack.length;
		const key = `${stack.join('>')}::${tagName}`;
		if (!seen.has(key)) {
			lines.push(`${'  '.repeat(depth)}${tagName}`);
			seen.add(key);
		}

		if (!isSelfClosing) {
			stack.push(tagName);
		}
	}

	if (lines.length === 0) return null;

	return {
		tree: lines,
		...(STRUCTURE_NOTES[name] ? { note: STRUCTURE_NOTES[name] } : {})
	};
}

function describeDataAttribute(componentName: string, attrName: string): DataAttributeShape {
	const meta =
		DATA_ATTRIBUTE_META[`${componentName}.${attrName}`] ?? GENERIC_DATA_ATTRIBUTE_META[attrName];

	if (!meta) {
		return { name: attrName };
	}

	return {
		name: attrName,
		description: meta.description,
		...(meta.values ? { values: meta.values } : {})
	};
}

/**
 * When a type alias like `type ChipProps = ChipBaseProps & Omit<...>` exists,
 * extract the first referenced identifier and try to parse it as an interface
 * in the same source file.
 */
function resolveTypeAliasToInterface(
	source: string,
	name: string,
	componentName: string,
	partName?: string
): Record<string, PropShape> {
	const aliasType = parseTypeAliasBaseType(source, name);
	if (!aliasType) return {};

	const firstType = aliasType.split(/[&|]/)[0]?.trim();
	if (!firstType) return {};

	const identMatch = firstType.match(/^(\w+)$/);
	if (identMatch?.[1]) {
		return enrichProps(parseInterface(source, identMatch[1]), componentName, partName, source);
	}

	return {};
}

function splitTopLevel(input: string, separator: string): string[] {
	const parts: string[] = [];
	let start = 0;
	let angleDepth = 0;
	let parenDepth = 0;
	let bracketDepth = 0;
	let braceDepth = 0;
	let quote: "'" | '"' | null = null;

	for (let i = 0; i < input.length; i += 1) {
		const char = input[i];
		const prev = input[i - 1];

		if ((char === "'" || char === '"') && prev !== '\\') {
			quote = quote === char ? null : (quote ?? (char as "'" | '"'));
			continue;
		}

		if (quote) continue;

		if (char === '<') angleDepth += 1;
		else if (char === '>') angleDepth = Math.max(0, angleDepth - 1);
		else if (char === '(') parenDepth += 1;
		else if (char === ')') parenDepth = Math.max(0, parenDepth - 1);
		else if (char === '[') bracketDepth += 1;
		else if (char === ']') bracketDepth = Math.max(0, bracketDepth - 1);
		else if (char === '{') braceDepth += 1;
		else if (char === '}') braceDepth = Math.max(0, braceDepth - 1);
		else if (
			char === separator &&
			angleDepth === 0 &&
			parenDepth === 0 &&
			bracketDepth === 0 &&
			braceDepth === 0
		) {
			parts.push(input.slice(start, i).trim());
			start = i + 1;
		}
	}

	parts.push(input.slice(start).trim());
	return parts.filter(Boolean);
}

function unwrapGeneric(typeExpression: string, genericName: string): string | null {
	const prefix = `${genericName}<`;
	if (!typeExpression.startsWith(prefix) || !typeExpression.endsWith('>')) {
		return null;
	}

	return typeExpression.slice(prefix.length, -1).trim();
}

function parseQuotedPropNames(typeExpression: string): string[] {
	return [...typeExpression.matchAll(/'([^']+)'/g)]
		.map((match) => match[1])
		.filter((value): value is string => Boolean(value));
}

function resolveImportPath(specifier: string, sourcePath?: string): string | null {
	if (!sourcePath || !specifier.startsWith('.')) return null;

	const basePath = resolve(dirname(sourcePath), specifier);
	const candidates = /\.[a-z]+$/i.test(basePath)
		? [
				basePath,
				basePath.replace(/\.js$/i, '.ts'),
				basePath.replace(/\.js$/i, '.tsx'),
				basePath.replace(/\.mjs$/i, '.ts'),
				basePath.replace(/\.mjs$/i, '.tsx')
			]
		: [
				basePath,
				`${basePath}.ts`,
				`${basePath}.tsx`,
				`${basePath}.js`,
				join(basePath, 'index.ts'),
				join(basePath, 'index.tsx'),
				join(basePath, 'index.js')
			];

	return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

function resolveImportedTypeSource(
	source: string,
	typeName: string,
	sourcePath?: string
): { exportedName: string; source: string; sourcePath: string } | null {
	if (!sourcePath) return null;

	for (const match of source.matchAll(
		/(?:import\s+(?:type\s+)?|export\s+type\s+)\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g
	)) {
		const bindings = match[1];
		const specifier = match[2];
		if (!bindings || !specifier) continue;

		for (const binding of bindings.split(',')) {
			const normalized = binding.trim().replace(/^type\s+/, '');
			if (!normalized) continue;

			const bindingMatch = normalized.match(/^(\w+)(?:\s+as\s+(\w+))?$/);
			if (!bindingMatch?.[1]) continue;

			const importedName = bindingMatch[1];
			const localName = bindingMatch[2] ?? importedName;
			if (localName !== typeName) continue;

			const importPath = resolveImportPath(specifier, sourcePath);
			if (!importPath) return null;

			return {
				exportedName: importedName,
				source: readFileSync(importPath, 'utf8'),
				sourcePath: importPath
			};
		}
	}

	return null;
}

function resolvePropsFromTypeExpression(
	typeExpression: string,
	source: string,
	sourcePath?: string,
	stack = new Set<string>()
): Record<string, PropShape> {
	const trimmed = typeExpression.trim();
	if (!trimmed) return {};

	const intersections = splitTopLevel(trimmed, '&');
	if (intersections.length > 1) {
		return intersections.reduce<Record<string, PropShape>>((merged, part) => {
			Object.assign(merged, resolvePropsFromTypeExpression(part, source, sourcePath, stack));
			return merged;
		}, {});
	}

	const omitInner = unwrapGeneric(trimmed, 'Omit');
	if (omitInner) {
		const [targetType, omittedProps] = splitTopLevel(omitInner, ',');
		const props = resolvePropsFromTypeExpression(targetType ?? '', source, sourcePath, stack);
		for (const propName of parseQuotedPropNames(omittedProps ?? '')) {
			delete props[propName];
		}
		return props;
	}

	const pickInner = unwrapGeneric(trimmed, 'Pick');
	if (pickInner) {
		const [targetType, pickedProps] = splitTopLevel(pickInner, ',');
		const props = resolvePropsFromTypeExpression(targetType ?? '', source, sourcePath, stack);
		const selected = new Set(parseQuotedPropNames(pickedProps ?? ''));
		return Object.fromEntries(Object.entries(props).filter(([propName]) => selected.has(propName)));
	}

	const partialInner = unwrapGeneric(trimmed, 'Partial');
	if (partialInner) {
		const props = resolvePropsFromTypeExpression(partialInner, source, sourcePath, stack);
		for (const value of Object.values(props)) {
			value.required = false;
		}
		return props;
	}

	const identifierMatch = trimmed.match(/^(\w+)$/);
	if (!identifierMatch?.[1]) return {};

	const typeName = identifierMatch[1];
	const visitKey = `${sourcePath ?? 'inline'}:${typeName}`;
	if (stack.has(visitKey)) return {};

	stack.add(visitKey);

	try {
		const props = parseInterface(source, typeName);
		const baseType =
			parseInterfaceBaseType(source, typeName) ?? parseTypeAliasBaseType(source, typeName);

		if (Object.keys(props).length > 0 || baseType) {
			return {
				...(baseType ? resolvePropsFromTypeExpression(baseType, source, sourcePath, stack) : {}),
				...props
			};
		}

		const importedType = resolveImportedTypeSource(source, typeName, sourcePath);
		if (!importedType) return {};

		return resolvePropsFromTypeExpression(
			importedType.exportedName,
			importedType.source,
			importedType.sourcePath,
			stack
		);
	} finally {
		stack.delete(visitKey);
	}
}

function resolveForwardedPropsFromTypeExpression(
	typeExpression: string,
	source: string,
	sourcePath?: string,
	stack = new Set<string>()
): ForwardedPropsShape | null {
	const trimmed = typeExpression.trim();
	if (!trimmed) return null;

	const direct = describeForwardedProps(trimmed);
	if (direct) return direct;

	const intersections = splitTopLevel(trimmed, '&');
	if (intersections.length > 1) {
		for (const part of intersections) {
			const resolved = resolveForwardedPropsFromTypeExpression(part, source, sourcePath, stack);
			if (resolved) return resolved;
		}
	}

	for (const genericName of ['Omit', 'Pick', 'Partial', 'Readonly']) {
		const inner = unwrapGeneric(trimmed, genericName);
		if (!inner) continue;

		const [targetType] = splitTopLevel(inner, ',');
		return resolveForwardedPropsFromTypeExpression(targetType ?? '', source, sourcePath, stack);
	}

	const identifierMatch = trimmed.match(/^(\w+)$/);
	if (!identifierMatch?.[1]) return null;

	const typeName = identifierMatch[1];
	const visitKey = `${sourcePath ?? 'inline'}:${typeName}:forwarded`;
	if (stack.has(visitKey)) return null;

	stack.add(visitKey);

	try {
		const baseType =
			parseInterfaceBaseType(source, typeName) ?? parseTypeAliasBaseType(source, typeName);
		if (baseType) {
			return resolveForwardedPropsFromTypeExpression(baseType, source, sourcePath, stack);
		}

		const importedType = resolveImportedTypeSource(source, typeName, sourcePath);
		if (!importedType) return null;

		return resolveForwardedPropsFromTypeExpression(
			importedType.exportedName,
			importedType.source,
			importedType.sourcePath,
			stack
		);
	} finally {
		stack.delete(visitKey);
	}
}

function parsePropContract(
	source: string,
	name: string,
	componentName: string,
	partName?: string
): { props: Record<string, PropShape>; forwardedProps: ForwardedPropsShape | null } {
	let props = parseInterface(source, name);

	// If no interface found, try resolving a type alias (e.g. type ChipProps = ChipBaseProps & ...)
	if (Object.keys(props).length === 0) {
		props = resolveTypeAliasToInterface(source, name, componentName, partName);
	} else {
		props = enrichProps(props, componentName, partName, source);
	}

	return {
		props,
		forwardedProps: describeForwardedProps(
			parseInterfaceBaseType(source, name) ?? parseTypeAliasBaseType(source, name)
		)
	};
}

function parseCompoundParts(source: string, name: string): string[] | null {
	const match = new RegExp(`export const ${name}:\\s*\\{`).exec(source);
	if (!match) return null;

	const start = (match.index ?? 0) + match[0].length - 1;
	let depth = 0;
	let end = start;
	for (let i = start; i < source.length; i += 1) {
		const char = source[i];
		if (char === '{') depth += 1;
		if (char === '}') {
			depth -= 1;
			if (depth === 0) {
				end = i;
				break;
			}
		}
	}

	const body = source.slice(start + 1, end);
	const parts: string[] = [];
	for (const line of body.split('\n')) {
		const partMatch = line.trim().match(/^(\w+):\s*typeof\s+/);
		if (partMatch?.[1]) parts.push(partMatch[1]);
	}

	return parts.length > 0 ? parts : null;
}

function partPropInterfaceNames(componentName: string, partName: string): string[] {
	const names = [`${componentName}${partName}Props`];
	if (partName !== 'Root') names.push(`${partName}Props`);

	// Handle overlapping names: e.g. BookingConfirmation + ConfirmationHeader
	// should also try BookingConfirmationHeaderProps (deduplicated)
	const partWords = partName.match(/[A-Z][a-z]*/g) ?? [];
	for (let i = 1; i <= partWords.length; i++) {
		const prefix = partWords.slice(0, i).join('');
		if (componentName.endsWith(prefix)) {
			const remainder = partWords.slice(i).join('');
			if (remainder) {
				const deduped = `${componentName}${remainder}Props`;
				if (!names.includes(deduped)) names.push(deduped);
			}
		}
	}

	// Handle shared prefix: e.g. BookingConfirmation + BookingReference
	// should also try BookingConfirmationReferenceProps (strip shared start)
	const compWords = componentName.match(/[A-Z][a-z]*/g) ?? [];
	for (let i = 1; i <= Math.min(compWords.length, partWords.length); i++) {
		if (compWords.slice(0, i).join('') === partWords.slice(0, i).join('')) {
			const remainder = partWords.slice(i).join('');
			if (remainder) {
				const prefixed = `${componentName}${remainder}Props`;
				if (!names.includes(prefixed)) names.push(prefixed);
			}
		}
	}

	return names;
}

function parsePartContract(
	source: string,
	componentName: string,
	partName: string,
	sourcePath?: string
): { props: Record<string, PropShape>; forwardedProps: ForwardedPropsShape | null } {
	for (const ifaceName of partPropInterfaceNames(componentName, partName)) {
		const props = resolvePropsFromTypeExpression(ifaceName, source, sourcePath);
		const baseType =
			parseInterfaceBaseType(source, ifaceName) ?? parseTypeAliasBaseType(source, ifaceName);
		if (Object.keys(props).length > 0 || baseType) {
			return {
				props: enrichProps(props, componentName, partName, source, sourcePath),
				forwardedProps:
					(baseType
						? resolveForwardedPropsFromTypeExpression(baseType, source, sourcePath)
						: null) ?? describeForwardedProps(baseType)
			};
		}
	}

	return { props: {}, forwardedProps: null };
}

function parseDefaults(svelteSource: string): Record<string, string> {
	const defaults: Record<string, string> = {};
	const propsMatch = svelteSource.match(/let\s*\{([^}]+)\}[^=]*=\s*\$props\(\)/s);
	if (!propsMatch?.[1]) return defaults;

	for (const match of propsMatch[1].matchAll(/(\w+)\s*=\s*([^,\n}]+)/g)) {
		const name = match[1]?.trim();
		let value = match[2]?.trim();
		if (!name || !value || name === 'class' || name === 'className') continue;

		// Unwrap $bindable(value) → value
		const bindable = value.match(/^\$bindable\(([^)]*)\)$/);
		if (bindable) value = bindable[1]?.trim() || '';
		if (!value) continue;

		defaults[name] = value;
	}
	return defaults;
}

const DIR_OVERRIDES: Record<string, string> = { QRCode: 'qr-code' };

function dirForComponent(name: string): string {
	if (DIR_OVERRIDES[name]) return DIR_OVERRIDES[name];
	return name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/** Per-component example overrides for richer, realistic usage patterns. */
const EXAMPLE_OVERRIDES: Record<string, string> = {
	Button:
		'<Button variant="solid" onclick={handleClick}>Save</Button>\n<Button href="/getting-started" variant="outline">Continue</Button>',
	Combobox:
		'<Combobox.Root bind:value={selectedFramework} name="framework">\n  <Combobox.Input placeholder="Search frameworks..." />\n  <Combobox.Content>\n    <Combobox.Item value="svelte" index={0}>Svelte</Combobox.Item>\n    <Combobox.Item value="react" index={1}>React</Combobox.Item>\n  </Combobox.Content>\n</Combobox.Root>',
	MultiSelectCombobox:
		'<MultiSelectCombobox.Root bind:value={selectedFrameworks} bind:query={frameworkQuery} name="frameworks">\n  <MultiSelectCombobox.SelectionList>\n    {#each selectedFrameworks as framework}\n      <MultiSelectCombobox.SelectionItem value={framework}>\n        {framework}\n        <MultiSelectCombobox.SelectionRemove value={framework} />\n      </MultiSelectCombobox.SelectionItem>\n    {/each}\n  </MultiSelectCombobox.SelectionList>\n  <MultiSelectCombobox.Input placeholder="Search frameworks..." />\n  <MultiSelectCombobox.Content>\n    <MultiSelectCombobox.Item value="svelte">Svelte</MultiSelectCombobox.Item>\n    <MultiSelectCombobox.Item value="react">React</MultiSelectCombobox.Item>\n  </MultiSelectCombobox.Content>\n</MultiSelectCombobox.Root>',
	Input: '<Input type="email" bind:value={email} placeholder="you@example.com" />',
	Textarea: '<Textarea bind:value={message} placeholder="Write a message\u2026" />',
	NumberInput: '<NumberInput bind:value={quantity} min={0} max={100} step={1} size="sm" />',
	Checkbox: '<Checkbox bind:checked={agreed}>I agree to the terms</Checkbox>',
	Switch: '<Switch bind:checked={darkMode}>Dark mode</Switch>',
	Slider: '<Slider bind:value={volume} min={0} max={100} />',
	Rating: '<Rating bind:value={score} />',
	Badge: '<Badge variant="soft">Active</Badge>',
	Alert:
		'<Alert variant="info">\n  {#snippet description()}Your changes have been saved.{/snippet}\n</Alert>',
	Progress: '<Progress value={65} max={100} />',
	Spinner: '<Spinner size="md" />',
	Skeleton: '<Skeleton width="200px" height="1rem" />',
	Separator: '<Separator />',
	Spacer: '<Spacer size="lg" />',
	Container: '<Container>\n  <p>Centered content</p>\n</Container>',
	Avatar: '<Avatar src="/avatar.jpg" alt="Jane" fallback="JD" />',
	ChatThread:
		'<ChatThread messageCount={messages.length}>\n  {#snippet children({ index })}\n    <ChatMessage role={messages[index].role} name={messages[index].name}>\n      {messages[index].message}\n    </ChatMessage>\n  {/snippet}\n</ChatThread>',
	Chip: '<Chip variant="soft" color="blue">Policy friendly</Chip>',
	ChipGroup:
		'<ChipGroup.Root type="multiple" bind:value={selectedFilters}>\n  <ChipGroup.Item value="direct">Direct</ChipGroup.Item>\n  <ChipGroup.Item value="flexible">Flexible</ChipGroup.Item>\n  <ChipGroup.Item value="wifi">Wi-fi</ChipGroup.Item>\n</ChipGroup.Root>',
	Tooltip:
		'<Tooltip.Root>\n  <Tooltip.Trigger>\n    <Button variant="ghost">Hover me</Button>\n  </Tooltip.Trigger>\n  <Tooltip.Content>Extra information</Tooltip.Content>\n</Tooltip.Root>',
	Card: '<Card.Root>\n  <Card.Header>Title</Card.Header>\n  <Card.Content>\n    <p>Card body content goes here.</p>\n  </Card.Content>\n  <Card.Footer>\n    <Button variant="solid">Action</Button>\n  </Card.Footer>\n</Card.Root>',
	Dialog:
		'<Dialog.Root bind:open={showDialog}>\n  <Dialog.Trigger>\n    <Button>Open Dialog</Button>\n  </Dialog.Trigger>\n  <Dialog.Content>\n    <Dialog.Header>Confirm</Dialog.Header>\n    <p>Are you sure?</p>\n    <Dialog.Footer>\n      <Button variant="outline" onclick={() => showDialog = false}>Cancel</Button>\n      <Button variant="solid" onclick={handleConfirm}>Confirm</Button>\n    </Dialog.Footer>\n  </Dialog.Content>\n</Dialog.Root>',
	Tabs: '<Tabs.Root bind:value={activeTab}>\n  <Tabs.List>\n    <Tabs.Trigger value="one">Tab 1</Tabs.Trigger>\n    <Tabs.Trigger value="two">Tab 2</Tabs.Trigger>\n  </Tabs.List>\n  <Tabs.Content value="one">First panel</Tabs.Content>\n  <Tabs.Content value="two">Second panel</Tabs.Content>\n</Tabs.Root>',
	Accordion:
		'<Accordion.Root>\n  <Accordion.Item value="a">\n    <Accordion.Trigger>Section A</Accordion.Trigger>\n    <Accordion.Content>Content for section A.</Accordion.Content>\n  </Accordion.Item>\n  <Accordion.Item value="b">\n    <Accordion.Trigger>Section B</Accordion.Trigger>\n    <Accordion.Content>Content for section B.</Accordion.Content>\n  </Accordion.Item>\n</Accordion.Root>',
	Select:
		'<Select.Root bind:value={selected} bind:open={selectOpen} name="selection">\n  <Select.Trigger>\n    <Select.Value placeholder="Choose\u2026" />\n  </Select.Trigger>\n  <Select.Content>\n    <Select.Item value="a">Alpha</Select.Item>\n    <Select.Item value="b">Beta</Select.Item>\n  </Select.Content>\n</Select.Root>',
	Popover:
		'<Popover.Root bind:open={popoverOpen}>\n  <Popover.Trigger>\n    <Button variant="outline">Info</Button>\n  </Popover.Trigger>\n  <Popover.Content>\n    <p>Popover details here.</p>\n  </Popover.Content>\n</Popover.Root>',
	Drawer:
		'<Drawer.Root bind:open={drawerOpen}>\n  <Drawer.Trigger>\n    <Button>Open Drawer</Button>\n  </Drawer.Trigger>\n  <Drawer.Content side="right">\n    <Drawer.Header>Settings</Drawer.Header>\n    <p>Drawer body content.</p>\n  </Drawer.Content>\n</Drawer.Root>',
	DropdownMenu:
		'<DropdownMenu.Root>\n  <DropdownMenu.Trigger>\n    <Button variant="ghost">Menu</Button>\n  </DropdownMenu.Trigger>\n  <DropdownMenu.Content>\n    <DropdownMenu.Item onclick={handleEdit}>Edit</DropdownMenu.Item>\n    <DropdownMenu.Item onclick={handleDelete}>Delete</DropdownMenu.Item>\n  </DropdownMenu.Content>\n</DropdownMenu.Root>',
	Table:
		'<Table.Root>\n  <Table.Header>\n    <Table.Row>\n      <Table.Head>Name</Table.Head>\n      <Table.Head>Status</Table.Head>\n    </Table.Row>\n  </Table.Header>\n  <Table.Body>\n    <Table.Row>\n      <Table.Cell>Alice</Table.Cell>\n      <Table.Cell><Badge variant="soft">Active</Badge></Table.Cell>\n    </Table.Row>\n  </Table.Body>\n</Table.Root>',
	Field:
		'<Field.Root>\n  <Label>Username</Label>\n  <Input bind:value={username} />\n</Field.Root>',
	Fieldset:
		'<Fieldset.Root>\n  <Fieldset.Legend>Notification preferences</Fieldset.Legend>\n  <Fieldset.Description>Choose how release updates reach your team.</Fieldset.Description>\n  <Fieldset.Content>\n    <Checkbox checked={true}>Email digests</Checkbox>\n    <Checkbox>SMS alerts</Checkbox>\n  </Fieldset.Content>\n</Fieldset.Root>',
	DescriptionList:
		'<DescriptionList.Root>\n  <DescriptionList.Item>\n    <DescriptionList.Term>Workspace</DescriptionList.Term>\n    <DescriptionList.Description>North America expansion</DescriptionList.Description>\n  </DescriptionList.Item>\n  <DescriptionList.Item>\n    <DescriptionList.Term>Status</DescriptionList.Term>\n    <DescriptionList.Description>Reviewing launch checklist</DescriptionList.Description>\n  </DescriptionList.Item>\n</DescriptionList.Root>',
	DateField:
		'<DateField.Root bind:value={departureDate} name="departureDate">\n  <DateField.Segment type="month" />\n  <DateField.Separator />\n  <DateField.Segment type="day" />\n  <DateField.Separator />\n  <DateField.Segment type="year" />\n</DateField.Root>',
	DatePicker:
		'<DatePicker.Root bind:value={departureDate} name="departureDate">\n  <DatePicker.Trigger placeholder="Select departure date" />\n  <DatePicker.Content>\n    <DatePicker.Calendar />\n  </DatePicker.Content>\n</DatePicker.Root>',
	SegmentedControl:
		'<SegmentedControl.Root bind:value={tripType}>\n  <SegmentedControl.Item value="one-way">One way</SegmentedControl.Item>\n  <SegmentedControl.Item value="round-trip">Round trip</SegmentedControl.Item>\n  <SegmentedControl.Item value="multi-city">Multi-city</SegmentedControl.Item>\n</SegmentedControl.Root>',
	Heading: '<Heading level={2}>Launch readiness</Heading>',
	Text: '<Text as="p" color="secondary" size="sm">Use Text for supporting copy, labels, and starter-kit body content.</Text>',
	ThemeToggle: '<ThemeToggle storageKey="my-app-theme" />',
	TypingIndicator: '<TypingIndicator aria-label="Assistant is typing" />',
	Typography:
		'<Typography.Heading level={2}>Launch readiness</Typography.Heading>\n<Typography.Text color="muted" size="sm">Use Typography.Text for supporting copy and metadata.</Typography.Text>',
	Breadcrumb:
		'<Breadcrumb.Root>\n  <Breadcrumb.List>\n    <Breadcrumb.Item>\n      <Breadcrumb.Link href="/">Home</Breadcrumb.Link>\n    </Breadcrumb.Item>\n    <Breadcrumb.Separator />\n    <Breadcrumb.Item>\n      <Breadcrumb.Link href="/docs">Docs</Breadcrumb.Link>\n    </Breadcrumb.Item>\n    <Breadcrumb.Separator />\n    <Breadcrumb.Item>\n      <Breadcrumb.Link current>Current</Breadcrumb.Link>\n    </Breadcrumb.Item>\n  </Breadcrumb.List>\n</Breadcrumb.Root>',
	Stepper:
		'<Stepper.Root bind:activeStep={activeStep}>\n  <Stepper.List>\n    <Stepper.Step step={0}>Account</Stepper.Step>\n    <Stepper.Separator step={0} />\n    <Stepper.Step step={1}>Profile</Stepper.Step>\n    <Stepper.Separator step={1} />\n    <Stepper.Step step={2}>Review</Stepper.Step>\n  </Stepper.List>\n</Stepper.Root>',
	Timeline:
		'<Timeline.Root>\n  <Timeline.Item>\n    <Timeline.Icon />\n    <Timeline.Content>\n      <Timeline.Title>Event title</Timeline.Title>\n      <Timeline.Description>Event description</Timeline.Description>\n      <Timeline.Time>2 hours ago</Timeline.Time>\n    </Timeline.Content>\n  </Timeline.Item>\n</Timeline.Root>',
	DateTimeInput: '<DateTimeInput bind:value={appointmentDate} name="appointment" />',
	FlipCard:
		'<FlipCard.Root trigger="hover">\n  <FlipCard.Front>Front content</FlipCard.Front>\n  <FlipCard.Back>Back content</FlipCard.Back>\n</FlipCard.Root>',
	Gauge:
		'<Gauge value={72} min={0} max={100} thresholds={[{ value: 30, color: "red" }, { value: 70, color: "orange" }, { value: 90, color: "green" }]} />',
	Map: '<Map.Root center={[-122.4, 37.8]} zoom={12}>\n  <Map.Marker position={[-122.4, 37.8]}>\n    <Map.Popup>San Francisco</Map.Popup>\n  </Map.Marker>\n  <Map.Controls navigation fullscreen />\n</Map.Root>',
	MegaMenu:
		'<MegaMenu.Root>\n  <MegaMenu.Trigger>Products</MegaMenu.Trigger>\n  <MegaMenu.Panel>\n    <MegaMenu.Column title="Platform">\n      <MegaMenu.Link href="/analytics">Analytics</MegaMenu.Link>\n      <MegaMenu.Link href="/automation">Automation</MegaMenu.Link>\n    </MegaMenu.Column>\n  </MegaMenu.Panel>\n</MegaMenu.Root>',
	NotificationCenter:
		'<NotificationCenter.Root bind:items={notifications} bind:open={panelOpen}>\n  <NotificationCenter.Trigger>\n    {#snippet children({ unreadCount })}\n      <Button>Notifications ({unreadCount})</Button>\n    {/snippet}\n  </NotificationCenter.Trigger>\n  <NotificationCenter.Panel>\n    <NotificationCenter.Group label="Today">\n      <NotificationCenter.Item id="1" variant="info">New deployment complete</NotificationCenter.Item>\n    </NotificationCenter.Group>\n  </NotificationCenter.Panel>\n</NotificationCenter.Root>',
	PhoneInput: '<PhoneInput bind:value={phone} defaultCountry="US" placeholder="(555) 123-4567" />',
	PinInput:
		'<PinInput.Root bind:value={pin} length={6} oncomplete={handleVerify}>\n  {#snippet children({ cells })}\n    <PinInput.Group>\n      {#each cells.slice(0, 3) as cell}\n        <PinInput.Cell {cell} />\n      {/each}\n    </PinInput.Group>\n    <PinInput.Separator />\n    <PinInput.Group>\n      {#each cells.slice(3) as cell}\n        <PinInput.Cell {cell} />\n      {/each}\n    </PinInput.Group>\n  {/snippet}\n</PinInput.Root>',
	Sparkline: '<Sparkline data={[5, 10, 3, 8, 12, 7]} width={120} height={30} />',
	VideoEmbed:
		'<VideoEmbed src="https://youtube.com/watch?v=dQw4w9WgXcQ" provider="youtube" title="Video title" />',
	// Travel Booking Components
	AddOnSelector:
		'<AddOnSelector.Root bind:selected={addOns}>\n  <AddOnSelector.Item value="baggage" maxQuantity={3}>\n    <AddOnSelector.ItemLabel>Extra Baggage</AddOnSelector.ItemLabel>\n    <AddOnSelector.ItemPrice>$25/bag</AddOnSelector.ItemPrice>\n  </AddOnSelector.Item>\n</AddOnSelector.Root>',
	AmenityGrid:
		'<AmenityGrid.Root>\n  <AmenityGrid.Amenity icon="wifi" label="Free WiFi" />\n  <AmenityGrid.Amenity icon="pool" label="Pool" />\n  <AmenityGrid.Amenity icon="parking" label="Parking" />\n</AmenityGrid.Root>',
	BookingConfirmation:
		'<BookingConfirmation.Root variant="success">\n  <BookingConfirmation.ConfirmationHeader title="Booking Confirmed!" />\n  <BookingConfirmation.BookingReference reference="ABC123" copyable />\n  <BookingConfirmation.ItinerarySummary>JFK → LAX, Mar 15</BookingConfirmation.ItinerarySummary>\n</BookingConfirmation.Root>',
	ComparisonTable:
		'<ComparisonTable.Root columns={["Economy", "Premium", "Business"]} highlightedColumn={1}>\n  <ComparisonTable.Header>\n    <ComparisonTable.HeaderCell>Feature</ComparisonTable.HeaderCell>\n  </ComparisonTable.Header>\n  <ComparisonTable.Body>\n    <ComparisonTable.Row>\n      <ComparisonTable.Cell>Baggage</ComparisonTable.Cell>\n      <ComparisonTable.Cell>1 bag</ComparisonTable.Cell>\n      <ComparisonTable.Cell>2 bags</ComparisonTable.Cell>\n      <ComparisonTable.Cell>3 bags</ComparisonTable.Cell>\n    </ComparisonTable.Row>\n  </ComparisonTable.Body>\n</ComparisonTable.Root>',
	CurrencySelector: '<CurrencySelector.Root bind:value={currency} />',
	FareClassPicker:
		'<FareClassPicker.Root bind:value={fareClass}>\n  <FareClassPicker.Option value="economy" label="Economy" price={199} currency="USD">\n    <FareClassPicker.FeatureList>\n      <FareClassPicker.FeatureItem included>1 carry-on</FareClassPicker.FeatureItem>\n    </FareClassPicker.FeatureList>\n  </FareClassPicker.Option>\n</FareClassPicker.Root>',
	FilterSidebar:
		'<FilterSidebar.Root>\n  <FilterSidebar.Group title="Price Range">\n    <FilterSidebar.PriceRange min={0} max={1000} bind:value={priceRange} />\n  </FilterSidebar.Group>\n  <FilterSidebar.Group title="Stops">\n    <FilterSidebar.CheckboxFilter options={stops} bind:selected={selectedStops} />\n  </FilterSidebar.Group>\n</FilterSidebar.Root>',
	FlexibleDatesGrid:
		'<FlexibleDatesGrid.Root departDates={departDates} returnDates={returnDates} prices={priceMatrix} bind:selectedDepart bind:selectedReturn />',
	FlightTimeline:
		'<FlightTimeline.Root>\n  <FlightTimeline.Segment>\n    <FlightTimeline.Departure time="8:00 AM" airport="JFK" city="New York" />\n    <FlightTimeline.Duration value="5h 30m" />\n    <FlightTimeline.Arrival time="11:30 AM" airport="LAX" city="Los Angeles" />\n    <FlightTimeline.FlightInfo airline="American Airlines" flightNumber="AA 100" />\n  </FlightTimeline.Segment>\n</FlightTimeline.Root>',
	GuestRoomSelector:
		'<GuestRoomSelector.Root bind:rooms={rooms}>\n  <GuestRoomSelector.Trigger />\n  <GuestRoomSelector.Content />\n</GuestRoomSelector.Root>',
	HotelGallery:
		'<HotelGallery.Root images={hotelImages} bind:lightboxOpen>\n  <HotelGallery.CategoryTabs />\n  <HotelGallery.Grid columns={3} maxVisible={6} />\n  <HotelGallery.Lightbox />\n</HotelGallery.Root>',
	ItineraryTimeline:
		'<ItineraryTimeline.Root>\n  <ItineraryTimeline.Day date="March 15" label="Day 1">\n    <ItineraryTimeline.Activity type="flight">\n      <ItineraryTimeline.ActivityTime>8:00 AM</ItineraryTimeline.ActivityTime>\n      <ItineraryTimeline.ActivityTitle>Flight to Paris</ItineraryTimeline.ActivityTitle>\n    </ItineraryTimeline.Activity>\n  </ItineraryTimeline.Day>\n</ItineraryTimeline.Root>',
	LocationAutocomplete:
		'<LocationAutocomplete.Root bind:value={airport}>\n  <LocationAutocomplete.Input placeholder="Search airports..." />\n  <LocationAutocomplete.Content>\n    <LocationAutocomplete.Group label="Airports">\n      <LocationAutocomplete.Item value="JFK" index={0} code="JFK">John F. Kennedy International</LocationAutocomplete.Item>\n    </LocationAutocomplete.Group>\n  </LocationAutocomplete.Content>\n</LocationAutocomplete.Root>',
	LoyaltyPointsDisplay:
		'<LoyaltyPointsDisplay.Root>\n  <LoyaltyPointsDisplay.Balance points={45000} />\n  <LoyaltyPointsDisplay.Tier tier="gold" />\n  <LoyaltyPointsDisplay.TierProgress current={45000} target={75000} nextTier="Platinum" />\n</LoyaltyPointsDisplay.Root>',
	MapListToggle:
		'<MapListToggle.Root bind:view={view} bind:selectedId>\n  <MapListToggle.ToggleBar />\n  <MapListToggle.MapPanel>Map content</MapListToggle.MapPanel>\n  <MapListToggle.ListPanel>List content</MapListToggle.ListPanel>\n</MapListToggle.Root>',
	MultiCitySearchForm:
		'<MultiCitySearchForm.Root bind:legs={flightLegs}>\n  {#each flightLegs as leg, i}\n    <MultiCitySearchForm.FlightLeg index={i}>\n      <MultiCitySearchForm.LegNumber index={i} />\n    </MultiCitySearchForm.FlightLeg>\n  {/each}\n  <MultiCitySearchForm.AddLegButton />\n</MultiCitySearchForm.Root>',
	PassengerClassSelector:
		'<PassengerClassSelector.Root bind:passengers bind:cabinClass>\n  <PassengerClassSelector.Trigger />\n  <PassengerClassSelector.Content />\n</PassengerClassSelector.Root>',
	PaymentCardInput:
		'<PaymentCardInput.Root bind:cardNumber bind:expiry bind:cvv>\n  <PaymentCardInput.CardNumber />\n  <PaymentCardInput.Expiry />\n  <PaymentCardInput.CVV />\n  <PaymentCardInput.CardIcon />\n</PaymentCardInput.Root>',
	PriceCalendar:
		'<PriceCalendar.Root bind:value={selectedDate} prices={datePrices}>\n  <PriceCalendar.Header>\n    <PriceCalendar.Prev />\n    <PriceCalendar.Heading />\n    <PriceCalendar.Next />\n  </PriceCalendar.Header>\n  <PriceCalendar.Grid />\n  <PriceCalendar.Legend />\n</PriceCalendar.Root>',
	PriceSummaryPanel:
		'<PriceSummaryPanel.Root currency="USD" sticky>\n  <PriceSummaryPanel.LineItem label="Base fare" amount={299} quantity={2} />\n  <PriceSummaryPanel.Discount label="Promo code" amount={50} />\n  <PriceSummaryPanel.Tax amount={87.50} />\n  <PriceSummaryPanel.Total amount={635.50} />\n</PriceSummaryPanel.Root>',
	PromoCodeInput:
		'<PromoCodeInput.Root bind:value={promoCode} status="idle" onApply={applyPromo} />',
	RecentSearches:
		'<RecentSearches.Root>\n  <RecentSearches.Chip label="NYC → LAX, Mar 15-22" />\n  <RecentSearches.Chip label="Paris Hotels, Apr 1-5" />\n</RecentSearches.Root>',
	Reveal:
		'<Reveal variant="slide-up" delay={120}>\n  <Card.Root>\n    <Card.Content>Stage content as it enters the viewport.</Card.Content>\n  </Card.Root>\n</Reveal>',
	ResultCardCar:
		'<ResultCardCar.Root>\n  <ResultCardCar.Image src="/car.jpg" />\n  <ResultCardCar.Details>\n    <ResultCardCar.Category>SUV</ResultCardCar.Category>\n    <ResultCardCar.Specs items={[{icon: "seats", label: "5"}]} />\n    <ResultCardCar.Price>$65/day</ResultCardCar.Price>\n  </ResultCardCar.Details>\n</ResultCardCar.Root>',
	ResultCardFlight:
		'<ResultCardFlight.Root>\n  <ResultCardFlight.Airline>American Airlines</ResultCardFlight.Airline>\n  <ResultCardFlight.Route>\n    <ResultCardFlight.Segment departure="8:00 AM" arrival="11:30 AM" />\n  </ResultCardFlight.Route>\n  <ResultCardFlight.Duration>5h 30m</ResultCardFlight.Duration>\n  <ResultCardFlight.Stops>Direct</ResultCardFlight.Stops>\n  <ResultCardFlight.Price>$299</ResultCardFlight.Price>\n</ResultCardFlight.Root>',
	ResultCardHotel:
		'<ResultCardHotel.Root>\n  <ResultCardHotel.Image src="/hotel.jpg" />\n  <ResultCardHotel.Details>\n    <ResultCardHotel.Name>Grand Hotel</ResultCardHotel.Name>\n    <ResultCardHotel.Rating score={8.5} label="Excellent" />\n    <ResultCardHotel.Price>$189/night</ResultCardHotel.Price>\n  </ResultCardHotel.Details>\n</ResultCardHotel.Root>',
	ReviewCard:
		'<ReviewCard.Root>\n  <ReviewCard.Reviewer>\n    <ReviewCard.ReviewerAvatar fallback="JD" />\n    <ReviewCard.ReviewerName>Jane Doe</ReviewCard.ReviewerName>\n    <ReviewCard.ReviewDate date="2026-03-01" />\n  </ReviewCard.Reviewer>\n  <ReviewCard.ReviewRating rating={9} scale={10} />\n  <ReviewCard.ReviewText>Excellent hotel with great service!</ReviewCard.ReviewText>\n</ReviewCard.Root>',
	RoomTypePicker:
		'<RoomTypePicker.Root bind:value={selectedRoom}>\n  <RoomTypePicker.RoomOption value="standard" label="Standard Room">\n    <RoomTypePicker.RoomPrice>$189/night</RoomTypePicker.RoomPrice>\n  </RoomTypePicker.RoomOption>\n  <RoomTypePicker.RoomOption value="deluxe" label="Deluxe Room">\n    <RoomTypePicker.RoomPrice>$289/night</RoomTypePicker.RoomPrice>\n  </RoomTypePicker.RoomOption>\n</RoomTypePicker.Root>',
	RouteMap:
		'<RouteMap.Root>\n  <RouteMap.Origin lat={40.6413} lng={-73.7781} label="JFK" />\n  <RouteMap.Destination lat={33.9425} lng={-118.4081} label="LAX" />\n  <RouteMap.FlightPath />\n</RouteMap.Root>',
	SearchFormTabs:
		'<SearchFormTabs.Root bind:value={searchType}>\n  <SearchFormTabs.Tab value="flights" icon="flights" label="Flights" />\n  <SearchFormTabs.Tab value="hotels" icon="hotels" label="Hotels" />\n  <SearchFormTabs.Tab value="cars" icon="cars" label="Cars" />\n  <SearchFormTabs.TabPanel value="flights">Flight search form</SearchFormTabs.TabPanel>\n</SearchFormTabs.Root>',
	SortBar:
		'<SortBar.Root bind:value={sortBy} bind:direction={sortDir}>\n  <SortBar.Option value="price">Price</SortBar.Option>\n  <SortBar.Option value="duration">Duration</SortBar.Option>\n  <SortBar.Option value="departure">Departure</SortBar.Option>\n</SortBar.Root>',
	Spotlight:
		'<Spotlight intensity={32}>\n  <Card.Root>\n    <Card.Content>Hover to pull a radial highlight across the surface.</Card.Content>\n  </Card.Root>\n</Spotlight>',
	TripCard:
		'<TripCard.Root variant="upcoming">\n  <TripCard.Image src="/paris.jpg" alt="Paris" />\n  <TripCard.Details>\n    <TripCard.Destination>Paris, France</TripCard.Destination>\n    <TripCard.Dates start="Mar 15" end="Mar 22" />\n    <TripCard.Status status="confirmed" />\n  </TripCard.Details>\n</TripCard.Root>',
	TrustBadges:
		'<TrustBadges.Root variant="inline">\n  <TrustBadges.Badge icon="shield" label="Secure Checkout" />\n  <TrustBadges.Badge icon="guarantee" label="Money-Back Guarantee" />\n</TrustBadges.Root>',
	Aurora:
		'<Aurora palette="ocean">\n  <Card.Root>\n    <Card.Content>Ambient backgrounds stay native and no-dependency.</Card.Content>\n  </Card.Root>\n</Aurora>',
	Noise:
		'<Noise opacity={0.12} blend="soft-light">\n  <Card.Root>\n    <Card.Content>Grain adds atmosphere without loading an external texture.</Card.Content>\n  </Card.Root>\n</Noise>'
};

function generateExample(name: string, compound: boolean, parts?: string[]): string {
	if (EXAMPLE_OVERRIDES[name]) return EXAMPLE_OVERRIDES[name];

	if (!compound) return `<${name}>Content</${name}>`;

	if (parts && !parts.includes('Root')) {
		return parts.map((part) => `<${name}.${part}>...</${name}.${part}>`).join('\n');
	}

	const lines = [`<${name}.Root>`];
	for (const part of parts ?? []) {
		if (part === 'Root') continue;
		lines.push(`  <${name}.${part}>...</${name}.${part}>`);
	}
	lines.push(`</${name}.Root>`);
	return lines.join('\n');
}

async function readText(filePath: string): Promise<string> {
	return readFile(filePath, 'utf8');
}

async function main(): Promise<void> {
	console.log('Generating spec...');

	const indexSrc = await readText(join(uiSrc, 'index.ts'));
	const componentNames: string[] = [];

	for (const match of indexSrc.matchAll(
		/export \{ (\w+)[\s,}].*? from '\.\/([\w-]+)\/index\.js'/g
	)) {
		const name = match[1];
		const first = name?.slice(0, 1) ?? '';
		if (!name || first === first.toLowerCase()) continue;
		if (!componentNames.includes(name)) componentNames.push(name);
	}

	const components: Record<string, ComponentShape> = {};

	for (const name of componentNames) {
		const dir = dirForComponent(name);
		const dirPath = join(uiSrc, dir);
		const indexPath = join(dirPath, 'index.ts');
		const indexContent = await readText(indexPath);

		// Read primitives source as fallback for inherited/re-exported props
		let primContent: string | null = null;
		let primIndexPath: string | null = null;
		try {
			primIndexPath = join(primSrc, dir, 'index.ts');
			primContent = await readText(primIndexPath);
		} catch {
			/* no primitives source for this component */
		}

		const meta = manifestComponentMeta[name];
		if (!meta) {
			console.warn(`  Missing metadata for ${name}`);
			continue;
		}

		const parts = parseCompoundParts(indexContent, name);
		const compound = parts !== null;
		const example = generateExample(name, compound, parts ?? undefined);
		let propsOrParts: Pick<ComponentShape, 'props' | 'parts' | 'forwardedProps'>;

		if (compound) {
			const partsObj: Record<string, PartShape> = {};
			for (const part of parts) {
				const contract = parsePartContract(indexContent, name, part, indexPath);
				const parsed = contract.props;
				let fwdProps = contract.forwardedProps;

				// Merge props from primitives for this part
				if (primContent && primIndexPath) {
					const primContract = parsePartContract(primContent, name, part, primIndexPath);
					for (const [key, val] of Object.entries(primContract.props)) {
						if (!parsed[key]) parsed[key] = val;
					}
					if (!fwdProps && primContract.forwardedProps) {
						fwdProps = primContract.forwardedProps;
					}
				}

				const bindableProps = findBindableProps(dir, part);

				const partKebab = part.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
				const svelteFile = join(dirPath, `${dir}-${partKebab}.svelte`);
				try {
					const defaults = parseDefaults(await readText(svelteFile));
					for (const [key, val] of Object.entries(defaults)) {
						if (parsed[key]) parsed[key].default = val;
					}
				} catch {
					/* file may not exist */
				}

				for (const [key, value] of Object.entries(parsed)) {
					if (bindableProps.includes(key)) value.bindable = true;
				}

				partsObj[part] = {
					props: parsed,
					...(fwdProps ? { forwardedProps: fwdProps } : {})
				};
			}
			propsOrParts = { parts: partsObj };
		} else {
			const contract = parsePropContract(indexContent, `${name}Props`, name);
			const parsed = contract.props;
			let fwdProps = contract.forwardedProps;

			// Merge props from primitives (base props that UI extends or re-exports)
			if (primContent) {
				const primContract = parsePropContract(primContent, `${name}Props`, name);
				for (const [key, val] of Object.entries(primContract.props)) {
					if (!parsed[key]) parsed[key] = val;
				}
				if (!fwdProps && primContract.forwardedProps) {
					fwdProps = primContract.forwardedProps;
				}
			}

			const bindableProps = findBindablePropsSimple(dir);

			const entries = await readdir(dirPath, { withFileTypes: true });
			for (const entry of entries) {
				if (!entry.isFile() || !entry.name.endsWith('.svelte')) continue;
				try {
					const defaults = parseDefaults(await readText(join(dirPath, entry.name)));
					for (const [key, val] of Object.entries(defaults)) {
						if (parsed[key]) parsed[key].default = val;
					}
				} catch {
					/* skip */
				}
			}

			for (const [key, value] of Object.entries(parsed)) {
				if (bindableProps.includes(key)) value.bindable = true;
			}

			propsOrParts = {
				props: parsed,
				...(fwdProps ? { forwardedProps: fwdProps } : {})
			};
		}

		const cssVars: Record<string, string> = {};
		const dataAttributes = new Set<string>();
		const entries = await readdir(dirPath, { withFileTypes: true });

		async function scanForStyleSurface(
			filePath: string,
			filters?: { cssVarPrefixes?: string[]; dataAttrPrefixes?: string[] }
		): Promise<void> {
			let source: string;
			try {
				source = await readText(filePath);
			} catch {
				return;
			}

			const cssVarPrefixes = filters?.cssVarPrefixes;
			const dataAttrPrefixes = filters?.dataAttrPrefixes;

			for (const match of source.matchAll(/^\s*(--dry-[\w-]+)\s*:/gm)) {
				const varName = match[1];
				if (!varName) continue;
				if (cssVarPrefixes && !cssVarPrefixes.some((p) => varName.startsWith(p))) continue;
				cssVars[varName] = cssVarDescription(varName);
			}
			// Private-alias fallback pattern `--_dry-btn-bg: var(--dry-btn-bg, <fallback>)`
			// — the first var() argument is the consumer-facing override point.
			for (const match of source.matchAll(/^\s*--_dry-[\w-]+\s*:\s*var\(\s*(--dry-[\w-]+)/gm)) {
				const varName = match[1];
				if (!varName) continue;
				if (cssVarPrefixes && !cssVarPrefixes.some((p) => varName.startsWith(p))) continue;
				cssVars[varName] = cssVarDescription(varName);
			}

			for (const attr of collectDataAttributes(source)) {
				if (dataAttrPrefixes && !dataAttrPrefixes.some((p) => attr.startsWith(p))) continue;
				dataAttributes.add(attr);
			}
		}

		for (const entry of entries) {
			if (!entry.isFile()) continue;
			if (!entry.name.endsWith('.module.css') && !entry.name.endsWith('.svelte')) continue;
			await scanForStyleSurface(join(dirPath, entry.name));
		}

		// Shared style surfaces that these compound components render through.
		// The unified modal-content.svelte owns the dialog/panel markup + styles
		// for Dialog/Drawer/AlertDialog, so its data-* and --dry-* contract
		// needs to be reflected in each component's spec. Filter by component
		// prefix so each component advertises only its own data-* surface
		// (--dry-* filtering is broader since several shared tokens, e.g.
		// --dry-radius-nested, land inside component-specific scopes).
		const SHARED_STYLE_SURFACES: Record<
			string,
			{ path: string; cssVarPrefixes: string[]; dataAttrPrefixes: string[] }[]
		> = {
			Dialog: [
				{
					path: 'internal/modal-content.svelte',
					cssVarPrefixes: ['--dry-dialog-', '--dry-radius-nested', '--dry-overlay-'],
					dataAttrPrefixes: ['data-dialog-']
				}
			],
			Drawer: [
				{
					path: 'internal/modal-content.svelte',
					cssVarPrefixes: ['--dry-drawer-', '--dry-overlay-'],
					dataAttrPrefixes: ['data-drawer-', 'data-side']
				}
			],
			AlertDialog: [
				{
					path: 'internal/modal-content.svelte',
					cssVarPrefixes: ['--dry-dialog-', '--dry-overlay-'],
					dataAttrPrefixes: ['data-alert-dialog-']
				}
			]
		};
		for (const surface of SHARED_STYLE_SURFACES[name] ?? []) {
			await scanForStyleSurface(join(uiSrc, surface.path), {
				cssVarPrefixes: surface.cssVarPrefixes,
				dataAttrPrefixes: surface.dataAttrPrefixes
			});
		}

		const primDirPath = join(primSrc, dir);
		try {
			const primEntries = await readdir(primDirPath, { withFileTypes: true });
			for (const entry of primEntries) {
				if (!entry.isFile()) continue;
				if (!entry.name.endsWith('.module.css') && !entry.name.endsWith('.svelte')) continue;
				const source = await readText(join(primDirPath, entry.name));

				for (const match of source.matchAll(/^\s*(--dry-[\w-]+)\s*:/gm)) {
					const varName = match[1];
					if (varName) cssVars[varName] = cssVarDescription(varName);
				}
				for (const match of source.matchAll(/^\s*--_dry-[\w-]+\s*:\s*var\(\s*(--dry-[\w-]+)/gm)) {
					const varName = match[1];
					if (varName) cssVars[varName] = cssVarDescription(varName);
				}

				for (const attr of collectDataAttributes(source)) {
					dataAttributes.add(attr);
				}
			}
		} catch {
			/* no primitive directory fallback */
		}

		const a11yNotes = getA11yNotes(name, meta);

		components[name] = {
			import: '@dryui/ui',
			description: meta.description,
			category: meta.category,
			tags: meta.tags,
			compound,
			...propsOrParts,
			...(PROP_GROUPS[name] ? { groups: PROP_GROUPS[name] } : {}),
			...(compound ? { structure: deriveStructure(example, name) } : {}),
			a11y: a11yNotes,
			cssVars: Object.fromEntries(Object.entries(cssVars).sort(([a], [b]) => a.localeCompare(b))),
			dataAttributes: [...dataAttributes].sort().map((attr) => describeDataAttribute(name, attr)),
			example
		};
	}

	// Pass 2: scan primitives for components without UI layer
	for (const name of Object.keys(manifestComponentMeta)) {
		if (components[name]) continue; // already found in UI
		const dir = dirForComponent(name);
		const dirPath = join(primSrc, dir);
		const indexPath = join(dirPath, 'index.ts');
		let indexContent: string;
		try {
			indexContent = await readText(indexPath);
		} catch {
			continue; // directory doesn't exist
		}

		const meta = manifestComponentMeta[name];
		if (!meta) continue;

		const parts = parseCompoundParts(indexContent, name);
		const compound = parts !== null;
		const example = generateExample(name, compound, parts ?? undefined);
		let propsOrParts: Pick<ComponentShape, 'props' | 'parts' | 'forwardedProps'>;

		if (compound) {
			const partsObj: Record<string, PartShape> = {};
			for (const part of parts) {
				const contract = parsePartContract(indexContent, name, part, indexPath);
				const parsed = contract.props;
				const bindableProps = findBindableProps(dir, part);

				const partKebab = part.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
				const svelteFile = join(dirPath, `${dir}-${partKebab}.svelte`);
				try {
					const defaults = parseDefaults(await readText(svelteFile));
					for (const [key, val] of Object.entries(defaults)) {
						if (parsed[key]) parsed[key].default = val;
					}
				} catch {
					/* file may not exist */
				}

				for (const [key, value] of Object.entries(parsed)) {
					if (bindableProps.includes(key)) value.bindable = true;
				}

				partsObj[part] = {
					props: parsed,
					...(contract.forwardedProps ? { forwardedProps: contract.forwardedProps } : {})
				};
			}
			propsOrParts = { parts: partsObj };
		} else {
			const contract = parsePropContract(indexContent, `${name}Props`, name);
			const parsed = contract.props;
			const bindableProps = findBindablePropsSimple(dir);

			const entries = await readdir(dirPath, { withFileTypes: true });
			for (const entry of entries) {
				if (!entry.isFile() || !entry.name.endsWith('.svelte')) continue;
				try {
					const defaults = parseDefaults(await readText(join(dirPath, entry.name)));
					for (const [key, val] of Object.entries(defaults)) {
						if (parsed[key]) parsed[key].default = val;
					}
				} catch {
					/* skip */
				}
			}

			for (const [key, value] of Object.entries(parsed)) {
				if (bindableProps.includes(key)) value.bindable = true;
			}

			propsOrParts = {
				props: parsed,
				...(contract.forwardedProps ? { forwardedProps: contract.forwardedProps } : {})
			};
		}

		const dataAttributes = new Set<string>();
		const entries = await readdir(dirPath, { withFileTypes: true });
		for (const entry of entries) {
			if (!entry.isFile()) continue;
			const source = await readText(join(dirPath, entry.name));
			if (entry.name.endsWith('.module.css') || entry.name.endsWith('.svelte')) {
				for (const attr of collectDataAttributes(source)) {
					dataAttributes.add(attr);
				}
			}
		}

		const a11yNotes = getA11yNotes(name, meta);

		components[name] = {
			import: '@dryui/primitives',
			description: meta.description,
			category: meta.category,
			tags: meta.tags,
			compound,
			...propsOrParts,
			...(PROP_GROUPS[name] ? { groups: PROP_GROUPS[name] } : {}),
			...(compound ? { structure: deriveStructure(example, name) } : {}),
			a11y: a11yNotes,
			cssVars: {},
			dataAttributes: [...dataAttributes].sort().map((attr) => describeDataAttribute(name, attr)),
			example
		};
	}

	const _pkgRaw: unknown = JSON.parse(await readText(resolve(uiSrc, '../package.json')));
	if (
		typeof _pkgRaw !== 'object' ||
		_pkgRaw === null ||
		!('name' in _pkgRaw) ||
		!('version' in _pkgRaw)
	) {
		throw new Error('Invalid package.json: missing name or version');
	}
	const packageJson = { name: String(_pkgRaw.name), version: String(_pkgRaw.version) };
	const spec = {
		version: packageJson.version,
		package: packageJson.name,
		themeImports: {
			default: `${packageJson.name}/themes/default.css`,
			dark: `${packageJson.name}/themes/dark.css`
		},
		components,
		composition: {
			components: Object.fromEntries(
				componentCompositions.map((c) => [c.component.toLowerCase(), c])
			),
			recipes: Object.fromEntries(compositionRecipes.map((r) => [r.name, r]))
		},
		ai: aiSurface
	};

	await writeFile(outPath, JSON.stringify(spec, null, 2));
	console.log(`${Object.keys(components).length} components`);
	console.log('Done');
}

function findBindableProps(dir: string, part: string): string[] {
	const all: string[] = [];
	const partKebab = part.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

	for (const [filePath, props] of Object.entries(BINDABLE_MAP)) {
		if (!filePath.startsWith(`${dir}/`)) continue;
		const fileName = filePath.split('/')[1] ?? '';
		if (
			fileName.includes(partKebab) ||
			(part === 'Root' && (fileName.includes('-root') || fileName === `${dir}.svelte`))
		) {
			all.push(...props);
		}
	}

	return all;
}

function findBindablePropsSimple(dir: string): string[] {
	const all: string[] = [];
	for (const [filePath, props] of Object.entries(BINDABLE_MAP)) {
		if (filePath.startsWith(`${dir}/`)) all.push(...props);
	}
	return all;
}

export {
	parseCompoundParts,
	parsePartContract,
	generateExample,
	partPropInterfaceNames,
	parseDefaults
};

if (import.meta.main) {
	await main();
}

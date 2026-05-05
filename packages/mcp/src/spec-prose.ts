import type { ComponentMetaEntry } from './component-catalog.js';
import type { DataAttributeShape, PropMetadataResolver } from './spec-source-extraction.js';

export type StructureShape = {
	tree: string[];
	note?: string;
};

export type PropGroupShape = {
	name: string;
	props: string[];
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
	'Heading.maxMeasure':
		'Caps the rendered inline size in ch units: narrow~22ch, default~45ch, wide~65ch. Use narrow for editorial hero headlines. Replaces the grid-wrapper hack that existed while dryui/no-width banned max-width.',
	'Heading.variant':
		"variant='display' uses --dry-font-display, which defaults to --dry-font-sans. For a distinct display typeface (e.g., a serif), override --dry-font-display on body or a scoped wrapper, not :root. See recipe: serif-display.",
	'NumberInput.size':
		'Adjusts input density and its default maximum width for compact counter-style fields.',
	'Select.Root.name':
		'Adds a hidden input so the selected value participates in native form submission.',
	'Stepper.Root.activeStep': 'Bindable current step index for controlled multi-step flows.',
	'Text.color':
		'Use muted or secondary for supporting copy without reaching for inline color styles.',
	'Text.maxMeasure':
		'Caps the rendered inline size in ch units: narrow~48ch, default~65ch, wide~80ch. Defaults are wider than Heading because body copy reads better on a longer measure.',
	'Text.size': 'Applies DryUI text scale tokens for compact or emphasized body copy.',
	'Typography.Heading.maxMeasure':
		'Caps the rendered inline size in ch units: narrow~22ch, default~45ch, wide~65ch. Use narrow for editorial hero headlines.',
	'Typography.Heading.variant':
		"variant='display' uses --dry-font-display, which defaults to --dry-font-sans. Override --dry-font-display on body or a scoped wrapper (not :root) for a distinct display typeface.",
	'Typography.Text.color':
		'Use muted or secondary for supporting copy without reaching for inline color styles.',
	'Typography.Text.maxMeasure':
		'Caps the rendered inline size in ch units: narrow~48ch, default~65ch, wide~80ch.',
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
	maxMeasure:
		'Caps rendered inline size on an ergonomic text measure (ch unit). Pass narrow, default, or wide, or false to opt out.',
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
	'Button.color':
		"Semantic tone. 'primary' and 'danger' are brand/error. 'ink' renders a solid near-black editorial CTA that auto-inverts in dark theme via --dry-color-bg-inverse/--dry-color-text-inverse. Any other string is passed through as a data-color hook for custom presets.",
	'Button.size': 'Button density preset, including icon-only sizing variants.',
	'Button.variant': 'Button treatment from solid primary actions to ghost and inline link styles.',
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
	'Button.data-color': {
		description:
			"Reflects the resolved color preset. 'ink' is a solid near-black editorial CTA that auto-inverts in dark theme.",
		values: ['primary', 'danger', 'ink']
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

const PROP_GROUPS: Record<string, PropGroupShape[]> = {
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

export function getA11yNotes(name: string, meta: ComponentMetaEntry): string[] {
	return A11Y_NOTES[name] ?? buildGeneratedA11yNotes(meta);
}

export function propGroupsForComponent(name: string): PropGroupShape[] | undefined {
	return PROP_GROUPS[name];
}

export function cssVarDescription(varName: string): string {
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

export function noteForProp(
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

export function descriptionForProp(
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

export const propMetadataResolver: PropMetadataResolver = {
	descriptionForProp,
	noteForProp
};

export function deriveStructure(example: string, name: string): StructureShape | null {
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

export function describeDataAttribute(componentName: string, attrName: string): DataAttributeShape {
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

import {
	createCompoundTree,
	createDocument,
	createNode,
	createTextNode,
	semanticThemeTokens,
	studioSpec,
	type LayoutDocument,
	type LayoutNode,
	type PropValue,
	type StudioPropSpec
} from '@dryui/canvas';

export type ThemePreference = 'system' | 'light' | 'dark';
export type InspectorTab = 'props' | 'style' | 'theme' | 'children';

export interface PaletteItem {
	id: string;
	component: string;
	name: string;
	category: string;
	description: string;
	badge: string;
	tone: 'primary' | 'neutral' | 'accent';
}

export interface InspectorControl {
	key: string;
	label: string;
	scope: 'prop' | 'style' | 'cssVar' | 'text';
	kind: 'text' | 'textarea' | 'toggle' | 'select' | 'color';
	value: string | boolean;
	options?: readonly string[] | undefined;
	hint?: string | undefined;
}

export interface InspectorNode {
	id: string;
	component: string;
	part: string | null;
	title: string;
	summary: string;
	props: InspectorControl[];
	styles: InspectorControl[];
	cssVars: InspectorControl[];
	children: LayoutNode[];
}

export interface ThemeToken {
	name: `--dry-${string}`;
	label: string;
	value: string;
}

export interface ChatMessage {
	id: string;
	role: 'user' | 'assistant';
	content: string;
}

const FALLBACK_THEME_VALUES: Record<string, string> = {
	'--dry-color-bg': '#f4f1eb',
	'--dry-color-border': '#d7d1c7',
	'--dry-color-border-hover': '#c8beae',
	'--dry-color-danger': '#bf3434',
	'--dry-color-danger-active': '#992b2b',
	'--dry-color-danger-hover': '#a82f2f',
	'--dry-color-focus-ring': '#5e89ff',
	'--dry-color-input-bg': '#ffffff',
	'--dry-color-input-border': '#cfc6bb',
	'--dry-color-muted': '#ebe5db',
	'--dry-color-on-primary': '#ffffff',
	'--dry-color-primary': '#2647c9',
	'--dry-color-primary-active': '#1837a9',
	'--dry-color-primary-hover': '#1f3fb7',
	'--dry-color-success': '#1f8a54',
	'--dry-color-surface': '#fffdfa',
	'--dry-color-surface-raised': '#f7f2ea',
	'--dry-color-text': '#1f1d19',
	'--dry-color-text-secondary': '#686258',
	'--dry-color-warning': '#c2871f'
};

function titleCase(value: string): string {
	return value
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.replace(/[-_]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
		.replace(/\b\w/g, (match) => match.toUpperCase());
}

function stripQuotes(value: string): string {
	return value.replace(/^['"]|['"]$/g, '');
}

function extractOptions(type: string): string[] | undefined {
	if (!type.includes('|')) {
		return undefined;
	}

	const options = type
		.split('|')
		.map((option) => stripQuotes(option.trim()))
		.filter((option) => option !== 'Snippet' && option !== 'undefined' && option !== 'null');

	return options.length > 0 ? options : undefined;
}

function normalizeThemeValue(name: string, value: string | undefined): string {
	if (value && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim())) {
		return value.trim();
	}

	return FALLBACK_THEME_VALUES[name] ?? '#ffffff';
}

function toFormValue(value: PropValue | undefined, fallback = ''): string | boolean {
	if (typeof value === 'boolean') {
		return value;
	}

	if (typeof value === 'number') {
		return String(value);
	}

	if (typeof value === 'string') {
		return stripQuotes(value);
	}

	if (value === null || value === undefined) {
		return fallback;
	}

	return JSON.stringify(value);
}

function controlKind(type: string, key: string): InspectorControl['kind'] {
	if (type === 'boolean') {
		return 'toggle';
	}

	if (key.startsWith('--dry-') || /(color|bg|border|ring)/i.test(key)) {
		return 'color';
	}

	if (extractOptions(type)) {
		return 'select';
	}

	if (/description|body|copy|text/i.test(key)) {
		return 'textarea';
	}

	return 'text';
}

function ensureTextChild(node: LayoutNode, text: string): void {
	const existing = node.children.find((child: LayoutNode) => child.component === '__text__');

	if (existing) {
		existing.text = text;
		return;
	}

	node.children = [createTextNode(text), ...node.children];
}

function findPart(node: LayoutNode, part: string): LayoutNode {
	const child = node.children.find((entry: LayoutNode) => entry.part === part);

	if (!child) {
		throw new Error(`Expected ${node.component}.${part} in the demo document.`);
	}

	return child;
}

function createPropControl(
	key: string,
	definition: StudioPropSpec,
	value: PropValue | undefined
): InspectorControl {
	const options = extractOptions(definition.type);
	const fallback = definition.default ? stripQuotes(definition.default) : '';

	return {
		key,
		label: titleCase(key),
		scope: 'prop',
		kind: controlKind(definition.type, key),
		value:
			definition.type === 'boolean'
				? Boolean(value ?? stripQuotes(definition.default ?? '') === 'true')
				: toFormValue(value, fallback),
		options,
		hint: definition.bindable ? 'Bindable' : definition.required ? 'Required' : undefined
	};
}

export function createPaletteItems(): PaletteItem[] {
	return (
		Object.entries(studioSpec.components) as [string, (typeof studioSpec.components)[string]][]
	)
		.map(([name, component]) => ({
			id: name,
			component: name,
			name,
			category: component.category,
			description: component.description,
			badge: component.compound ? 'Compound' : 'Component',
			tone: (component.category === 'layout'
				? 'primary'
				: component.category === 'overlay'
					? 'accent'
					: 'neutral') as PaletteItem['tone']
		}))
		.sort((left, right) =>
			left.category === right.category
				? left.name.localeCompare(right.name)
				: left.category.localeCompare(right.category)
		);
}

export function createDemoDocument(): LayoutDocument {
	const document = createDocument('DryUI Studio');
	document.root.children = [];

	const hero = createCompoundTree('Card');
	ensureTextChild(findPart(hero, 'Header'), 'DryUI Studio');
	ensureTextChild(
		findPart(hero, 'Content'),
		'Compose pages with real DryUI components, then tune props, CSS variables, and theme tokens from the same workspace.'
	);

	const footer = findPart(hero, 'Footer');
	footer.children = [
		createNode({
			component: 'Flex',
			props: {
				gap: 'sm'
			},
			children: [
				createNode({
					component: 'Button',
					props: {
						variant: 'solid'
					},
					children: [createTextNode('Open Studio')]
				}),
				createNode({
					component: 'Button',
					props: {
						variant: 'outline'
					},
					children: [createTextNode('Review Theme')]
				})
			]
		})
	];

	const rail = createNode({
		component: 'Flex',
		props: {
			gap: 'sm'
		},
		children: [
			createNode({
				component: 'Badge',
				props: {
					variant: 'soft',
					color: 'blue'
				},
				children: [createTextNode('palette')]
			}),
			createNode({
				component: 'Badge',
				props: {
					variant: 'soft',
					color: 'green'
				},
				children: [createTextNode('theme')]
			}),
			createNode({
				component: 'Badge',
				props: {
					variant: 'soft',
					color: 'purple'
				},
				children: [createTextNode('gesture-ready')]
			})
		]
	});

	const commandBar = createNode({
		component: 'Input',
		props: {
			value: 'Search components or issue a command'
		}
	});

	document.root.children.push(hero, rail, commandBar);
	return document;
}

export function buildInspectorNode(node: LayoutNode | null): InspectorNode | null {
	if (!node) {
		return null;
	}

	if (node.component === '__text__') {
		return {
			id: node.id,
			component: node.component,
			part: null,
			title: 'Text node',
			summary: 'Inline copy rendered directly on the canvas.',
			props: [
				{
					key: 'text',
					label: 'Text',
					scope: 'text',
					kind: 'textarea',
					value: node.text ?? ''
				}
			],
			styles: [],
			cssVars: [],
			children: []
		};
	}

	const component = studioSpec.components[node.component];
	if (!component) {
		return {
			id: node.id,
			component: node.component,
			part: node.part,
			title: node.label ?? node.component,
			summary: 'This component is not present in the current DryUI spec.',
			props: [],
			styles: [],
			cssVars: [],
			children: node.children
		};
	}
	const propSpec = (node.part ? component.parts?.[node.part]?.props : component.props) ?? {};

	return {
		id: node.id,
		component: node.component,
		part: node.part,
		title: `${node.component}${node.part ? `.${node.part}` : ''}`,
		summary: component.description,
		props: Object.entries(propSpec)
			.filter(([key]) => key !== 'children')
			.map(([key, definition]) => createPropControl(key, definition, node.props[key])),
		styles: [
			{
				key: 'width',
				label: 'Width',
				scope: 'style',
				kind: 'text',
				value: node.style.width ?? ''
			},
			{
				key: 'padding',
				label: 'Padding',
				scope: 'style',
				kind: 'select',
				value: node.style.padding ?? 'none',
				options: ['none', 'xs', 'sm', 'md', 'lg', 'xl']
			},
			{
				key: 'gap',
				label: 'Gap',
				scope: 'style',
				kind: 'select',
				value: node.style.gap ?? 'md',
				options: ['none', 'xs', 'sm', 'md', 'lg', 'xl']
			},
			{
				key: 'visible',
				label: 'Visible',
				scope: 'style',
				kind: 'toggle',
				value: node.visible
			}
		],
		cssVars: Object.entries(component.cssVars).map(([name, label]) => ({
			key: name,
			label: String(label),
			scope: 'cssVar',
			kind: controlKind('string', name),
			value: node.cssVarOverrides[name] ?? ''
		})),
		children: node.children
	};
}

export function buildThemeTokens(document: LayoutDocument): ThemeToken[] {
	return semanticThemeTokens.map((name: (typeof semanticThemeTokens)[number]) => ({
		name,
		label: titleCase(name.replace('--dry-color-', '')),
		value: normalizeThemeValue(name, document.theme.vars[name])
	}));
}

export function createMessages(): ChatMessage[] {
	return [
		{
			id: 'msg-1',
			role: 'assistant',
			content:
				'Ask for a component or layout change and the Studio chat can preview the command sequence.'
		}
	];
}

export function readThemePreference(): ThemePreference {
	if (typeof window === 'undefined') {
		return 'system';
	}

	const stored = window.localStorage.getItem('dryui-studio-theme');
	return stored === 'light' || stored === 'dark' ? stored : 'system';
}

export function applyThemePreference(preference: ThemePreference): void {
	if (typeof document === 'undefined') {
		return;
	}

	const root = document.documentElement;
	root.classList.toggle('theme-auto', preference === 'system');

	if (preference === 'system') {
		delete root.dataset.theme;
		window.localStorage.removeItem('dryui-studio-theme');
		return;
	}

	root.dataset.theme = preference;
	window.localStorage.setItem('dryui-studio-theme', preference);
}

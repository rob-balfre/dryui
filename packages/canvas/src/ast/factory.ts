import { getComponentSpec, getPartSpec, semanticThemeTokens } from '../spec.js';
import type {
	CanvasStyle,
	FactoryNodeOptions,
	LayoutDocument,
	LayoutNode,
	ThemePreset
} from './types.js';

const DEFAULT_CANVAS_STYLE: CanvasStyle = {
	layout: 'stack',
	gap: 'md'
};

const DEFAULT_THEME_VARS: ThemePreset['vars'] = {
	'--dry-color-bg': 'var(--dry-gray-25)',
	'--dry-color-surface': 'var(--dry-gray-0)',
	'--dry-color-surface-raised': 'var(--dry-gray-50)',
	'--dry-color-border': 'var(--dry-gray-200)',
	'--dry-color-border-hover': 'var(--dry-gray-300)',
	'--dry-color-text': 'var(--dry-gray-900)',
	'--dry-color-text-secondary': 'var(--dry-gray-600)',
	'--dry-color-primary': 'var(--dry-blue-600)',
	'--dry-color-primary-hover': 'var(--dry-blue-700)',
	'--dry-color-primary-active': 'var(--dry-blue-800)',
	'--dry-color-on-primary': '#ffffff',
	'--dry-color-danger': 'var(--dry-red-600)',
	'--dry-color-danger-hover': 'var(--dry-red-700)',
	'--dry-color-danger-active': 'var(--dry-red-800)',
	'--dry-color-warning': 'var(--dry-yellow-500)',
	'--dry-color-success': 'var(--dry-green-600)',
	'--dry-color-muted': 'var(--dry-gray-100)',
	'--dry-color-input-bg': 'var(--dry-gray-0)',
	'--dry-color-input-border': 'var(--dry-gray-300)',
	'--dry-color-focus-ring': 'color-mix(in srgb, var(--dry-blue-600) 35%, transparent)'
};

let idCounter = 0;

function nextId(prefix = 'node'): string {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return `${prefix}-${crypto.randomUUID()}`;
	}

	idCounter += 1;
	return `${prefix}-${Date.now()}-${idCounter}`;
}

function titleCase(value: string): string {
	return value
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.replace(/[-_]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
		.replace(/\b\w/g, (match) => match.toUpperCase());
}

function defaultLabel(component: string, part: string | null): string {
	return part ? `${component} ${part}` : titleCase(component);
}

function defaultText(component: string, part: string | null): string {
	const fallback = defaultLabel(component, part);

	switch (part) {
		case 'Header':
			return `${component} heading`;
		case 'Content':
			return `${component} content`;
		case 'Footer':
			return `${component} actions`;
		case 'Trigger':
			return `${component} trigger`;
		case 'Body':
			return `${component} body`;
		case 'Title':
			return `${component} title`;
		case 'Description':
			return `${component} description`;
		case 'Label':
			return `${component} label`;
		case 'Value':
			return `${component} value`;
		default:
			return component === 'Button' ? 'Button' : fallback;
	}
}

function createsChildren(component: string, part: string | null): boolean {
	if (component === '__text__') {
		return false;
	}

	const partSpec = part ? getPartSpec(component, part) : null;
	const propSpec = partSpec?.props ?? getComponentSpec(component)?.props;
	return Boolean(propSpec?.children?.required);
}

function withDefaultTextChildren(component: string, part: string | null): LayoutNode[] {
	if (!createsChildren(component, part)) {
		return [];
	}

	return [createTextNode(defaultText(component, part))];
}

export function createNode(options: FactoryNodeOptions): LayoutNode {
	const node: LayoutNode = {
		id: options.id ?? nextId('node'),
		component: options.component,
		part: options.part ?? null,
		props: { ...(options.props ?? {}) },
		cssVarOverrides: { ...(options.cssVarOverrides ?? {}) },
		style: {
			...DEFAULT_CANVAS_STYLE,
			...(options.style ?? {})
		},
		children: [
			...(options.children ?? withDefaultTextChildren(options.component, options.part ?? null))
		],
		locked: options.locked ?? false,
		visible: options.visible ?? true,
		...(options.text !== undefined ? { text: options.text } : {}),
		...(options.label !== undefined
			? { label: options.label }
			: { label: defaultLabel(options.component, options.part ?? null) })
	};

	return node;
}

export function createTextNode(text = 'Text'): LayoutNode {
	return createNode({
		component: '__text__',
		label: 'Text',
		text,
		children: []
	});
}

export function cloneNode(node: LayoutNode): LayoutNode {
	return {
		...node,
		props: structuredClone(node.props),
		cssVarOverrides: structuredClone(node.cssVarOverrides),
		style: structuredClone(node.style),
		children: node.children.map((child) => cloneNode(child))
	};
}

export function cloneNodeWithFreshIds(node: LayoutNode): LayoutNode {
	return {
		...cloneNode(node),
		id: nextId('node'),
		children: node.children.map((child) => cloneNodeWithFreshIds(child))
	};
}

export function createCompoundTree(component: string): LayoutNode {
	const componentSpec = getComponentSpec(component);

	if (!componentSpec?.compound || !componentSpec.parts) {
		return createNode({ component });
	}

	const partEntries = Object.keys(componentSpec.parts);
	const rootPart = partEntries.includes('Root') ? 'Root' : (partEntries[0] ?? null);

	if (!rootPart) {
		return createNode({ component });
	}

	const children = partEntries
		.filter((part) => part !== rootPart)
		.map((part) =>
			createNode({
				component,
				part
			})
		);

	return createNode({
		component,
		part: rootPart,
		children
	});
}

export function createThemePreset(
	mode: ThemePreset['mode'] = 'light',
	vars: Partial<ThemePreset['vars']> = {}
): ThemePreset {
	const safeVars = Object.entries(vars).reduce<Record<string, string>>(
		(accumulator, [key, value]) => {
			if (value !== undefined) {
				accumulator[key] = value;
			}

			return accumulator;
		},
		{}
	);
	const merged: Record<string, string> = {
		...DEFAULT_THEME_VARS,
		...safeVars
	};

	for (const token of semanticThemeTokens) {
		merged[token] ??= DEFAULT_THEME_VARS[token] ?? '';
	}

	return {
		id: mode === 'custom' ? nextId('theme') : mode,
		label: mode === 'custom' ? 'Custom' : titleCase(mode),
		mode,
		vars: merged
	};
}

export function createDocument(name = 'Untitled Studio Document'): LayoutDocument {
	const timestamp = new Date().toISOString();

	return {
		version: 1,
		id: nextId('doc'),
		name,
		createdAt: timestamp,
		updatedAt: timestamp,
		canvas: {
			width: 1440,
			height: 'auto',
			background: 'var(--dry-color-bg)'
		},
		theme: createThemePreset('light'),
		root: createNode({
			component: 'Stack',
			props: {
				gap: 'lg'
			},
			style: {
				padding: 'xl',
				width: '100%'
			},
			children: [createCompoundTree('Card')],
			label: 'Page'
		})
	};
}

import { collectRawSvelteLocations, findTargetElement } from './svelte-meta.js';

const DRYUI_FILE_PATTERNS = [
	/\/packages\/ui\/src\/([^/]+)\//i,
	/\/node_modules\/@dryui\/ui\/src\/([^/]+)\//i,
	/\/@dryui\/ui\/src\/([^/]+)\//i
];

const ATTRIBUTE_KEYS = [
	'variant',
	'size',
	'color',
	'tone',
	'align',
	'orientation',
	'shape',
	'position',
	'status',
	'side',
	'part',
	'state'
] as const;

const CLASS_PROP_GROUPS = {
	variant: new Set([
		'solid',
		'outline',
		'ghost',
		'soft',
		'secondary',
		'link',
		'default',
		'elevated',
		'interactive'
	]),
	size: new Set(['sm', 'md', 'lg', 'icon', 'icon-sm', 'icon-lg']),
	color: new Set([
		'primary',
		'danger',
		'gray',
		'brand',
		'info',
		'success',
		'warning',
		'error',
		'neutral',
		'blue',
		'cyan',
		'green',
		'yellow',
		'orange',
		'red',
		'indigo'
	]),
	align: new Set(['left', 'center', 'right']),
	orientation: new Set(['horizontal', 'vertical'])
} as const;

function isPropLikeLocalToken(token: string): boolean {
	return Object.values(CLASS_PROP_GROUPS).some((group) => group.has(token));
}

function collectRawSvelteFiles(target: EventTarget | null): string[] {
	return collectRawSvelteLocations(target).map((location) => location.file);
}

function toComponentName(value: string): string {
	return value
		.split(/[-_]+/)
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join('');
}

function detectComponentFromFiles(target: EventTarget | null): string | null {
	for (const file of collectRawSvelteFiles(target)) {
		for (const pattern of DRYUI_FILE_PATTERNS) {
			const match = file.match(pattern);
			if (match?.[1]) {
				return toComponentName(match[1]);
			}
		}
	}

	return null;
}

function normalizeClassToken(token: string): string[] {
	const trimmed = token.trim();
	const normalized = trimmed.replace(/^_+/, '');

	if (trimmed.startsWith('_')) {
		const localOnlyMatch = normalized.match(/^([A-Za-z0-9-]+)_[A-Za-z0-9-]+(?:_\d+)?$/);
		if (localOnlyMatch?.[1]) {
			return ['', localOnlyMatch[1]];
		}
	}

	const moduleMatch = normalized.match(/^([a-z0-9-]+)_([A-Za-z0-9-]+)(?:__|_[A-Za-z0-9-]+$)/);
	if (moduleMatch) {
		return [moduleMatch[1] ?? '', moduleMatch[2] ?? ''];
	}

	const localOnlyMatch = normalized.match(/^([A-Za-z0-9-]+)_[A-Za-z0-9-]+(?:_\d+)?$/);
	if (localOnlyMatch?.[1]) {
		return ['', localOnlyMatch[1]];
	}

	if (/^[a-z][a-z0-9-]*$/.test(normalized)) {
		return ['', normalized];
	}

	return [];
}

function collectClassTokenGroups(element: Element): Map<string, Set<string>> {
	const groups = new Map<string, Set<string>>();
	let current: Element | null = element;
	let depth = 0;

	while (current && depth < 3) {
		for (const token of getClassTokens(current)) {
			const [prefix, local] = normalizeClassToken(token);
			if (!prefix || !local) continue;

			let group = groups.get(prefix);
			if (!group) {
				group = new Set<string>();
				groups.set(prefix, group);
			}

			group.add(normalizePropValue(local));
		}

		current = current.parentElement;
		depth += 1;
	}

	return groups;
}

function collectLocalClassTokens(element: Element, depthLimit: number): Set<string> {
	const locals = new Set<string>();
	let current: Element | null = element;
	let depth = 0;

	while (current && depth < depthLimit) {
		for (const token of getClassTokens(current)) {
			const [, local] = normalizeClassToken(token);
			if (local) {
				locals.add(normalizePropValue(local));
			}
		}

		current = current.parentElement;
		depth += 1;
	}

	return locals;
}

function getRuntimeSignatureToken(token: string): { signature: string; local: string } | null {
	const trimmed = token.trim();
	if (!trimmed.startsWith('_')) {
		return null;
	}

	const normalized = trimmed.replace(/^_+/, '');
	const match = normalized.match(/^([A-Za-z0-9-]+)_([A-Za-z0-9-]+)(?:_\d+)?$/);
	if (!match?.[1] || !match[2]) {
		return null;
	}

	return {
		signature: match[2],
		local: normalizePropValue(match[1])
	};
}

function collectRuntimeSignatureGroups(
	element: Element,
	depthLimit: number
): Map<string, Set<string>> {
	const groups = new Map<string, Set<string>>();
	let current: Element | null = element;
	let depth = 0;

	while (current && depth < depthLimit) {
		for (const token of getClassTokens(current)) {
			const normalized = getRuntimeSignatureToken(token);
			if (!normalized) continue;

			let group = groups.get(normalized.signature);
			if (!group) {
				group = new Set<string>();
				groups.set(normalized.signature, group);
			}

			group.add(normalized.local);
		}

		current = current.parentElement;
		depth += 1;
	}

	return groups;
}

function detectComponentFromClassTokens(element: Element): string | null {
	for (const [prefix, locals] of collectClassTokenGroups(element)) {
		if (!locals.has('wrapper')) continue;
		if (!locals.has(prefix) && !locals.has('root')) continue;
		return toComponentName(prefix);
	}

	const tagName = element.tagName.toLowerCase();
	const currentRuntimeGroups = collectRuntimeSignatureGroups(element, 1);
	const nearbyRuntimeGroups = collectRuntimeSignatureGroups(element, 3);

	for (const [signature, currentLocals] of currentRuntimeGroups) {
		const nearbyLocals = nearbyRuntimeGroups.get(signature);
		if (!nearbyLocals?.has('wrapper')) continue;

		const hasPropToken = Array.from(currentLocals).some((local) => isPropLikeLocalToken(local));
		if (currentLocals.has(tagName) && hasPropToken) {
			return toComponentName(tagName);
		}
	}

	return null;
}

function getClassTokens(element: Element): string[] {
	return (element.getAttribute('class') ?? '')
		.split(/\s+/)
		.map((token) => token.trim())
		.filter(Boolean);
}

function normalizePropValue(value: string): string {
	return value.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`).replace(/^-/, '');
}

function collectProps(element: Element): string[] {
	const props = new Set<string>();
	let current: Element | null = element;
	let depth = 0;

	while (current && depth < 4) {
		for (const key of ATTRIBUTE_KEYS) {
			const value = current.getAttribute(`data-${key}`);
			if (value === null) continue;
			props.add(value === '' ? key : `${key}=${normalizePropValue(value)}`);
		}

		for (const token of getClassTokens(current)) {
			const [, local] = normalizeClassToken(token);
			if (!local) continue;

			const normalized = normalizePropValue(local);
			if (CLASS_PROP_GROUPS.variant.has(normalized)) props.add(`variant=${normalized}`);
			if (CLASS_PROP_GROUPS.size.has(normalized)) props.add(`size=${normalized}`);
			if (CLASS_PROP_GROUPS.color.has(normalized)) props.add(`color=${normalized}`);
			if (CLASS_PROP_GROUPS.align.has(normalized)) props.add(`align=${normalized}`);
			if (CLASS_PROP_GROUPS.orientation.has(normalized)) props.add(`orientation=${normalized}`);
		}

		current = current.parentElement;
		depth += 1;
	}

	return Array.from(props);
}

export function detectDryUIComponent(target: EventTarget | null): string | undefined {
	const element = findTargetElement(target);
	if (!element) return undefined;

	const component = detectComponentFromFiles(target) ?? detectComponentFromClassTokens(element);
	if (!component) return undefined;

	const props = collectProps(element);
	return props.length > 0 ? `${component} ${props.join(' ')}` : component;
}

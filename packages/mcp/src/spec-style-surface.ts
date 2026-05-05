import { collectDataAttributes } from './spec-source-extraction.js';
import { cssVarDescription } from './spec-prose.js';

export type StyleSurfaceFilters = {
	cssVarPrefixes?: readonly string[];
	dataAttrPrefixes?: readonly string[];
};

export type SharedStyleSurface = StyleSurfaceFilters & {
	path: string;
};

export type StyleSurfaceAccumulator = {
	cssVars: Record<string, string>;
	dataAttributes: Set<string>;
};

export type StyleSurfaceShape = {
	cssVars: Record<string, string>;
	dataAttributes: string[];
};

const SHARED_STYLE_SURFACES: Record<string, SharedStyleSurface[]> = {
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

export function createStyleSurfaceAccumulator(): StyleSurfaceAccumulator {
	return {
		cssVars: {},
		dataAttributes: new Set<string>()
	};
}

export function isStyleSurfaceFile(name: string): boolean {
	return name.endsWith('.svelte') || name.endsWith('.css');
}

export function sharedStyleSurfacesForComponent(
	componentName: string
): readonly SharedStyleSurface[] {
	return SHARED_STYLE_SURFACES[componentName] ?? [];
}

export function addStyleSurfaceSource(
	surface: StyleSurfaceAccumulator,
	source: string,
	filters?: StyleSurfaceFilters
): void {
	const cssVarPrefixes = filters?.cssVarPrefixes;
	const dataAttrPrefixes = filters?.dataAttrPrefixes;

	for (const match of source.matchAll(/^\s*(--dry-[\w-]+)\s*:/gm)) {
		const varName = match[1];
		if (!varName) continue;
		if (!hasAllowedPrefix(varName, cssVarPrefixes)) continue;
		surface.cssVars[varName] = cssVarDescription(varName);
	}

	for (const match of source.matchAll(/^\s*--_dry-[\w-]+\s*:\s*var\(\s*(--dry-[\w-]+)([^;]*);/gm)) {
		const primary = match[1];
		const rest = match[2] ?? '';
		if (!primary) continue;
		if (!hasAllowedPrefix(primary, cssVarPrefixes)) continue;
		surface.cssVars[primary] = cssVarDescription(primary);

		for (const inner of rest.matchAll(/var\(\s*(--dry-[\w-]+)/g)) {
			const fallback = inner[1];
			if (!fallback) continue;
			if (!primary.startsWith(fallback)) continue;
			if (!hasAllowedPrefix(fallback, cssVarPrefixes)) continue;
			surface.cssVars[fallback] = cssVarDescription(fallback);
		}
	}

	for (const attr of collectDataAttributes(source)) {
		if (!hasAllowedPrefix(attr, dataAttrPrefixes)) continue;
		surface.dataAttributes.add(attr);
	}
}

export function finalizeStyleSurface(surface: StyleSurfaceAccumulator): StyleSurfaceShape {
	return {
		cssVars: Object.fromEntries(
			Object.entries(surface.cssVars).sort(([a], [b]) => a.localeCompare(b))
		),
		dataAttributes: [...surface.dataAttributes].sort()
	};
}

function hasAllowedPrefix(value: string, prefixes?: readonly string[]): boolean {
	return !prefixes || prefixes.some((prefix) => value.startsWith(prefix));
}

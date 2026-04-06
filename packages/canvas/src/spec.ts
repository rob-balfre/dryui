import rawSpec from '@dryui/mcp/spec';

export interface StudioPropSpec {
	type: string;
	required?: boolean;
	default?: string;
	bindable?: boolean;
}

export interface StudioPartSpec {
	props?: Record<string, StudioPropSpec> | null;
}

export interface StudioComponentSpec {
	import: string;
	description: string;
	category: string;
	tags: string[];
	compound: boolean;
	props?: Record<string, StudioPropSpec> | null;
	parts?: Record<string, StudioPartSpec> | null;
	cssVars: Record<string, string>;
	dataAttributes: (string | { name: string; description?: string })[];
	example: string;
}

export interface StudioSpec {
	version: string;
	package: string;
	themeImports: {
		default: string;
		dark: string;
	};
	components: Record<string, StudioComponentSpec>;
}

export const studioSpec = rawSpec as StudioSpec;

export const semanticThemeTokens = [
	'--dry-color-bg',
	'--dry-color-border',
	'--dry-color-border-hover',
	'--dry-color-danger',
	'--dry-color-danger-active',
	'--dry-color-danger-hover',
	'--dry-color-focus-ring',
	'--dry-color-input-bg',
	'--dry-color-input-border',
	'--dry-color-muted',
	'--dry-color-on-primary',
	'--dry-color-primary',
	'--dry-color-primary-active',
	'--dry-color-primary-hover',
	'--dry-color-success',
	'--dry-color-surface',
	'--dry-color-surface-raised',
	'--dry-color-text',
	'--dry-color-text-secondary',
	'--dry-color-warning'
] as const;

export type SemanticThemeToken = (typeof semanticThemeTokens)[number];

export function listComponentNames(): string[] {
	return Object.keys(studioSpec.components);
}

export function getComponentSpec(name: string): StudioComponentSpec | null {
	return studioSpec.components[name] ?? null;
}

export function getPartSpec(name: string, part: string): StudioPartSpec | null {
	return getComponentSpec(name)?.parts?.[part] ?? null;
}

export function isCompoundComponent(name: string): boolean {
	return Boolean(getComponentSpec(name)?.compound);
}

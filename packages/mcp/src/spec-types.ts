// Canonical type definitions derived from the spec.json structure.
// Shared between @dryui/mcp and @dryui/cli.

import type { AiSurfaceManifest } from './ai-surface.js';

export interface PropDef {
	readonly type: string;
	readonly required?: boolean;
	readonly bindable?: boolean;
	readonly default?: string;
	readonly acceptedValues?: string[];
	readonly description?: string;
	readonly note?: string;
}

export interface DataAttributeDef {
	readonly name: string;
	readonly description?: string;
	readonly values?: string[];
}

export interface ForwardedPropsDef {
	readonly baseType: string;
	readonly via: string;
	readonly element?: string;
	readonly examples?: string[];
	readonly omitted?: string[];
	readonly note: string;
}

export interface StructureDef {
	readonly tree: string[];
	readonly note?: string;
}

export interface PartDef {
	readonly props: Record<string, PropDef>;
	readonly forwardedProps?: ForwardedPropsDef | null;
}

export interface ComponentDef {
	readonly import: string;
	readonly description: string;
	readonly category: string;
	readonly tags: string[];
	readonly compound: boolean;
	readonly props?: Record<string, PropDef>;
	readonly parts?: Record<string, PartDef>;
	readonly forwardedProps?: ForwardedPropsDef | null;
	readonly structure?: StructureDef | null;
	readonly a11y?: string[];
	readonly cssVars: Record<string, string>;
	readonly dataAttributes: DataAttributeDef[];
	readonly example: string;
}

export interface CompositionAlternativeDef {
	readonly rank: number;
	readonly component: string;
	readonly useWhen: string;
	readonly snippet: string;
}

export interface CompositionAntiPatternDef {
	readonly pattern: string;
	readonly reason: string;
	readonly fix: string;
}

export interface CompositionComponentDef {
	readonly component: string;
	readonly useWhen: string;
	readonly alternatives: readonly CompositionAlternativeDef[];
	readonly antiPatterns: readonly CompositionAntiPatternDef[];
	readonly combinesWith: readonly string[];
}

export interface CompositionRecipeDef {
	readonly name: string;
	readonly description: string;
	readonly tags: readonly string[];
	readonly components: readonly string[];
	readonly snippet: string;
}

export interface Spec {
	readonly version: string;
	readonly package: string;
	readonly themeImports: { readonly default: string; readonly dark: string };
	readonly components: Record<string, ComponentDef>;
	readonly ai?: AiSurfaceManifest;
	readonly composition?: {
		readonly components: Record<string, CompositionComponentDef>;
		readonly recipes: Record<string, CompositionRecipeDef>;
	};
}

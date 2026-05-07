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

export interface PartDef {
	readonly props: Record<string, PropDef>;
	readonly forwardedProps?: ForwardedPropsDef | null;
}

export interface PropGroupDef {
	readonly name: string;
	readonly props: readonly string[];
}

export interface DocsComponentPageEntry {
	readonly name: string;
	readonly slug: string;
	readonly description: string;
	readonly category: string;
	readonly sourcePackage: string;
	readonly compound: boolean;
	readonly props: Record<string, PropDef> | null;
	readonly parts: Record<string, PartDef> | null;
	readonly forwardedProps: ForwardedPropsDef | null;
	readonly groups: readonly PropGroupDef[] | null;
	readonly a11y: string[];
	readonly cssVars: Record<string, string>;
	readonly dataAttributes: DataAttributeDef[];
	readonly rootImport: string;
	readonly subpathImport: string;
	readonly quickStartCode: string;
}

export interface DocsComponentPagesManifest {
	readonly layoutHints: readonly string[];
	readonly components: Record<string, DocsComponentPageEntry>;
}

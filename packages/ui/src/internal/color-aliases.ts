export const COLOR_ALIASES = {
	info: 'blue',
	success: 'green',
	warning: 'yellow',
	danger: 'red'
} as const;

export type BaseColor = 'gray' | 'blue' | 'red' | 'green' | 'yellow' | 'purple' | 'orange';
export type SemanticColor = keyof typeof COLOR_ALIASES;
export type AliasableColor = BaseColor | SemanticColor;

const BASE_COLORS: ReadonlySet<string> = new Set<BaseColor>([
	'gray',
	'blue',
	'red',
	'green',
	'yellow',
	'purple',
	'orange'
]);

function isSemanticColor(c: string): c is SemanticColor {
	return c in COLOR_ALIASES;
}

function isBaseColor(c: string): c is BaseColor {
	return BASE_COLORS.has(c);
}

export function resolveAlias(color: AliasableColor | undefined, fallback: BaseColor): BaseColor {
	const resolved = color ?? fallback;
	if (isSemanticColor(resolved)) {
		return COLOR_ALIASES[resolved];
	}

	return isBaseColor(resolved) ? resolved : fallback;
}

export declare const COLOR_ALIASES: {
	readonly info: 'blue';
	readonly success: 'green';
	readonly warning: 'yellow';
	readonly danger: 'red';
};
export type BaseColor = 'gray' | 'blue' | 'red' | 'green' | 'yellow' | 'purple' | 'orange';
export type SemanticColor = keyof typeof COLOR_ALIASES;
export type AliasableColor = BaseColor | SemanticColor;
export declare function resolveAlias(
	color: AliasableColor | undefined,
	fallback: BaseColor
): BaseColor;

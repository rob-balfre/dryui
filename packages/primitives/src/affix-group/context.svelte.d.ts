export interface AffixGroupContext {
	readonly size: 'sm' | 'md' | 'lg';
	readonly disabled: boolean;
	readonly invalid: boolean;
	readonly orientation: 'horizontal' | 'vertical';
}
export declare const setAffixGroupCtx: (ctx: AffixGroupContext) => AffixGroupContext,
	getAffixGroupCtx: () => AffixGroupContext;

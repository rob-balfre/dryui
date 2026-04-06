import { createContext } from '../utils/create-context.js';

export interface AffixGroupContext {
	readonly size: 'sm' | 'md' | 'lg';
	readonly disabled: boolean;
	readonly invalid: boolean;
	readonly orientation: 'horizontal' | 'vertical';
}
export const [setAffixGroupCtx, getAffixGroupCtx] = createContext<AffixGroupContext>('affix-group');

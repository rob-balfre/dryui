import { createContext } from '../utils/create-context.js';

interface SelectableTileGroupContext {
	readonly value: string;
	readonly disabled: boolean;
	readonly orientation: 'horizontal' | 'vertical';
	select: (value: string) => void;
	isSelected: (value: string) => boolean;
}
export const [setSelectableTileGroupCtx, getSelectableTileGroupCtx] =
	createContext<SelectableTileGroupContext>('selectable-tile-group');

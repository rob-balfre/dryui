import { createContext } from '../utils/create-context.js';

interface ChipGroupContext {
	readonly type: 'single' | 'multiple';
	readonly disabled: boolean;
	readonly value: string[];
	toggle: (itemValue: string) => void;
	isSelected: (itemValue: string) => boolean;
}
export const [setChipGroupCtx, getChipGroupCtx] = createContext<ChipGroupContext>('chip-group');

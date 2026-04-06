import { createContext } from '../utils/create-context.js';

interface ToggleGroupContext {
	readonly type: 'single' | 'multiple';
	readonly disabled: boolean;
	readonly value: string[];
	toggle: (itemValue: string) => void;
	isSelected: (itemValue: string) => boolean;
}
export const [setToggleGroupCtx, getToggleGroupCtx] =
	createContext<ToggleGroupContext>('toggle-group');

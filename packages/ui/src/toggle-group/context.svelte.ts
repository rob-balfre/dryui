import { createContext } from '@dryui/primitives';

interface ToggleGroupContext {
	readonly type: 'single' | 'multiple';
	readonly disabled: boolean;
	readonly value: string[];
	readonly orientation: 'horizontal' | 'vertical';
	toggle: (itemValue: string) => void;
	isSelected: (itemValue: string) => boolean;
}
export const [setToggleGroupCtx, getToggleGroupCtx] =
	createContext<ToggleGroupContext>('toggle-group');

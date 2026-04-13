import { createContext } from '@dryui/primitives';

interface OptionPickerContext {
	readonly value: string;
	readonly disabled: boolean;
	readonly orientation: 'horizontal' | 'vertical';
	select: (value: string) => void;
	isSelected: (value: string) => boolean;
}
export const [setOptionPickerCtx, getOptionPickerCtx] =
	createContext<OptionPickerContext>('option-picker');

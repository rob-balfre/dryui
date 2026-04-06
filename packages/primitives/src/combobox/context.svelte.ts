import { createContext } from '../utils/create-context.js';

export interface ComboboxContext {
	readonly open: boolean;
	readonly inputValue: string;
	readonly value: string;
	readonly displayText: string;
	readonly disabled: boolean;
	readonly activeIndex: number;
	readonly inputId: string;
	readonly contentId: string;
	inputEl: HTMLInputElement | null;
	show: () => void;
	close: () => void;
	toggle: () => void;
	select: (value: string, text: string) => void;
	setInputValue: (val: string) => void;
	setActiveIndex: (index: number) => void;
}
export const [setComboboxCtx, getComboboxCtx] = createContext<ComboboxContext>('combobox');

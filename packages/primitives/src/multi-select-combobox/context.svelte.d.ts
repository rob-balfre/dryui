export interface MultiSelectComboboxContext {
	readonly open: boolean;
	readonly query: string;
	readonly value: string[];
	readonly disabled: boolean;
	readonly maxSelections: number;
	readonly activeItemId: string;
	readonly itemCount: number;
	readonly inputId: string;
	readonly contentId: string;
	readonly anchorEl: HTMLElement | null;
	inputEl: HTMLInputElement | null;
	show: () => void;
	close: () => void;
	setQuery: (value: string, notify?: boolean) => void;
	setActiveItem: (id: string) => void;
	registerItem: (id: string) => void;
	unregisterItem: (id: string) => void;
	getEnabledItems: () => HTMLElement[];
	isSelected: (value: string) => boolean;
	canSelect: (value: string) => boolean;
	selectValue: (value: string) => boolean;
	removeValue: (value: string) => void;
	removeLastValue: () => void;
	focusInput: () => void;
}
export declare const setMultiSelectComboboxCtx: (
		ctx: MultiSelectComboboxContext
	) => MultiSelectComboboxContext,
	getMultiSelectComboboxCtx: () => MultiSelectComboboxContext;

import { createContext } from '@dryui/primitives';

export interface SelectContext {
	readonly open: boolean;
	readonly value: string;
	readonly displayText: string;
	readonly triggerId: string;
	readonly contentId: string;
	readonly disabled: boolean;
	triggerEl: HTMLElement | null;
	show: () => void;
	close: () => void;
	toggle: () => void;
	select: (value: string, text: string) => void;
}

export const [setSelectCtx, getSelectCtx] = createContext<SelectContext>('select');

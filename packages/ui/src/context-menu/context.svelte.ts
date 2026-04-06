import { createContext } from '@dryui/primitives';

export interface ContextMenuContext {
	readonly open: boolean;
	readonly triggerId: string;
	readonly contentId: string;
	triggerEl: HTMLElement | null;
	position: { x: number; y: number };
	show: () => void;
	close: () => void;
	toggle: () => void;
}

export const [setContextMenuCtx, getContextMenuCtx] =
	createContext<ContextMenuContext>('context-menu');

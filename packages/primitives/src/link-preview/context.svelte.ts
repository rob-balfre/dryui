import { createContext } from '../utils/create-context.js';

interface LinkPreviewContext {
	readonly open: boolean;
	readonly triggerId: string;
	readonly contentId: string;
	triggerEl: HTMLElement | null;
	show: () => void;
	close: () => void;
	showImmediate: () => void;
	closeImmediate: () => void;
}
export const [setLinkPreviewCtx, getLinkPreviewCtx] =
	createContext<LinkPreviewContext>('link-preview');

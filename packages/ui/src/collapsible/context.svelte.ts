import { createContext, createId } from '@dryui/primitives';

interface CollapsibleContext {
	readonly open: boolean;
	readonly disabled: boolean;
	readonly contentId: string;
	toggle: () => void;
}
export const [setCollapsibleCtx, getCollapsibleCtx] =
	createContext<CollapsibleContext>('collapsible');

export { createId };

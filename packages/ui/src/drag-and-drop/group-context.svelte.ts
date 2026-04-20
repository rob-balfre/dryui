import { createContext } from '@dryui/primitives';

export interface DragAndDropGroupContext {
	register(listId: string, element: HTMLElement): void;
	unregister(listId: string): void;
	getRoots(): Map<string, HTMLElement>;
	readonly activeTarget: { listId: string; index: number } | null;
	setActiveTarget(listId: string | null, index: number | null): void;
	move(fromListId: string, fromIndex: number, toListId: string, toIndex: number): void;
}

const [_setGroupCtx, _getGroupCtx] = createContext<DragAndDropGroupContext>('drag-and-drop-group');

export function setGroupCtx(ctx: DragAndDropGroupContext) {
	return _setGroupCtx(ctx);
}

export function getGroupCtx(): DragAndDropGroupContext | null {
	return _getGroupCtx() ?? null;
}

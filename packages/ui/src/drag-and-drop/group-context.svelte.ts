import { getContext, setContext, hasContext } from 'svelte';

const GROUP_KEY = Symbol('drag-and-drop-group');

export interface DragAndDropGroupContext {
	register(listId: string, element: HTMLElement): void;
	unregister(listId: string): void;
	getRoots(): Map<string, HTMLElement>;
	readonly activeTarget: { listId: string; index: number } | null;
	setActiveTarget(listId: string | null, index: number | null): void;
	move(fromListId: string, fromIndex: number, toListId: string, toIndex: number): void;
}

export function setGroupCtx(ctx: DragAndDropGroupContext) {
	setContext(GROUP_KEY, ctx);
}

export function getGroupCtx(): DragAndDropGroupContext | null {
	return hasContext(GROUP_KEY) ? getContext<DragAndDropGroupContext>(GROUP_KEY) : null;
}

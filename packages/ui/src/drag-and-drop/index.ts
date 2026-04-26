import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type { DragAndDropItemProps, DragAndDropHandleProps } from '@dryui/primitives';

export interface DragAndDropRootProps<T = unknown> extends HTMLAttributes<HTMLDivElement> {
	items: T[];
	onReorder: (items: T[]) => void;
	orientation?: 'vertical' | 'horizontal';
	listId?: string;
	children: Snippet;
}

export interface DragAndDropGroupProps {
	onMove: (fromListId: string, fromIndex: number, toListId: string, toIndex: number) => void;
	children: Snippet;
}

import DragAndDropRoot from './drag-and-drop-root.svelte';
import DragAndDropItem from './drag-and-drop-item.svelte';
import DragAndDropHandle from './drag-and-drop-handle.svelte';
import DragAndDropGroup from './drag-and-drop-group.svelte';

export const DragAndDrop: {
	Root: typeof DragAndDropRoot;
	Item: typeof DragAndDropItem;
	Handle: typeof DragAndDropHandle;
	Group: typeof DragAndDropGroup;
} = {
	Root: DragAndDropRoot,
	Item: DragAndDropItem,
	Handle: DragAndDropHandle,
	Group: DragAndDropGroup
};

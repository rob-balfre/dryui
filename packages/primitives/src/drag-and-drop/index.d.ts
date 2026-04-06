import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export type { DragAndDropContext } from './context.svelte.js';
export interface DragAndDropRootProps<T = unknown> extends HTMLAttributes<HTMLDivElement> {
    items: T[];
    onReorder: (items: T[]) => void;
    orientation?: 'vertical' | 'horizontal';
    children: Snippet;
}
export interface DragAndDropItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
    index: number;
    children: Snippet<[{
        isDragging: boolean;
        isOver: boolean;
    }]>;
}
export interface DragAndDropHandleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
    index: number;
    children?: Snippet | undefined;
}
import DragAndDropRoot from './drag-and-drop-root.svelte';
import DragAndDropItem from './drag-and-drop-item.svelte';
import DragAndDropHandle from './drag-and-drop-handle.svelte';
export declare const DragAndDrop: {
    Root: typeof DragAndDropRoot;
    Item: typeof DragAndDropItem;
    Handle: typeof DragAndDropHandle;
};

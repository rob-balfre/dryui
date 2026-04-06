export type {
	DragAndDropRootProps,
	DragAndDropItemProps,
	DragAndDropHandleProps
} from '@dryui/primitives';
import DragAndDropRoot from './drag-and-drop-root.svelte';
import DragAndDropItem from './drag-and-drop-item.svelte';
import DragAndDropHandle from './drag-and-drop-handle.svelte';
export declare const DragAndDrop: {
	Root: typeof DragAndDropRoot;
	Item: typeof DragAndDropItem;
	Handle: typeof DragAndDropHandle;
};

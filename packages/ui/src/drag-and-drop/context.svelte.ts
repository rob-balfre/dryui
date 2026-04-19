import { createContext } from '@dryui/primitives';

export interface DragAndDropContext {
	readonly draggedIndex: number | null;
	readonly overIndex: number | null;
	readonly isDragging: boolean;
	readonly orientation: 'vertical' | 'horizontal';
	readonly hasHandle: boolean;
	readonly foreignOverIndex: number | null;
	readonly instructionsId: string;
	readonly itemCount: number;
	registerHandle: () => void;
	startDrag: (index: number, event: PointerEvent) => void;
	handleDragOver: (index: number) => void;
	endDrag: () => void;
	cancelDrag: () => void;
	moveItem: (fromIndex: number, direction: 'up' | 'down') => void;
	announce: (message: string) => void;
}
export const [setDragAndDropCtx, getDragAndDropCtx] =
	createContext<DragAndDropContext>('drag-and-drop');

export interface DragAndDropContext {
	readonly draggedIndex: number | null;
	readonly overIndex: number | null;
	readonly isDragging: boolean;
	readonly orientation: 'vertical' | 'horizontal';
	readonly hasHandle: boolean;
	registerHandle: () => void;
	startDrag: (index: number, event: PointerEvent) => void;
	handleDragOver: (index: number) => void;
	endDrag: () => void;
	cancelDrag: () => void;
	moveItem: (fromIndex: number, direction: 'up' | 'down') => void;
	announce: (message: string) => void;
}
export declare const setDragAndDropCtx: (ctx: DragAndDropContext) => DragAndDropContext,
	getDragAndDropCtx: () => DragAndDropContext;

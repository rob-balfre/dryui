export interface DragAndDropGroupContext {
    register(listId: string, element: HTMLElement): void;
    unregister(listId: string): void;
    getRoots(): Map<string, HTMLElement>;
    readonly activeTarget: {
        listId: string;
        index: number;
    } | null;
    setActiveTarget(listId: string | null, index: number | null): void;
    move(fromListId: string, fromIndex: number, toListId: string, toIndex: number): void;
}
export declare function setGroupCtx(ctx: DragAndDropGroupContext): void;
export declare function getGroupCtx(): DragAndDropGroupContext | null;

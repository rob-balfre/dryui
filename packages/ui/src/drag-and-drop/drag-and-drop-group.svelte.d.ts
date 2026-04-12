import type { Snippet } from 'svelte';
interface Props {
    onMove: (fromListId: string, fromIndex: number, toListId: string, toIndex: number) => void;
    children: Snippet;
}
declare const DragAndDropGroup: import("svelte").Component<Props, {}, "">;
type DragAndDropGroup = ReturnType<typeof DragAndDropGroup>;
export default DragAndDropGroup;

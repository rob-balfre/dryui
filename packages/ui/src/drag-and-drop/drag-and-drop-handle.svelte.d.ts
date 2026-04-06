import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	index: number;
	children?: Snippet;
}
declare const DragAndDropHandle: import('svelte').Component<Props, {}, ''>;
type DragAndDropHandle = ReturnType<typeof DragAndDropHandle>;
export default DragAndDropHandle;

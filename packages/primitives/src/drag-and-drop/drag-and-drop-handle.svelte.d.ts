import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	index: number;
	children?: Snippet | undefined;
}
declare const DragAndDropHandle: import('svelte').Component<Props, {}, ''>;
type DragAndDropHandle = ReturnType<typeof DragAndDropHandle>;
export default DragAndDropHandle;

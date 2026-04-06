import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	index: number;
	children: Snippet<
		[
			{
				isDragging: boolean;
				isOver: boolean;
			}
		]
	>;
}
declare const DragAndDropItem: import('svelte').Component<Props, {}, ''>;
type DragAndDropItem = ReturnType<typeof DragAndDropItem>;
export default DragAndDropItem;

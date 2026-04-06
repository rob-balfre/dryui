import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	accept?: string;
	onDrop?: (files: File[]) => void;
	children?: Snippet;
}
declare const DropZone: import('svelte').Component<Props, {}, ''>;
type DropZone = ReturnType<typeof DropZone>;
export default DropZone;

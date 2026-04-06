import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	position?: number;
	orientation?: 'horizontal' | 'vertical';
	before: Snippet;
	after: Snippet;
	handle?: Snippet;
}
declare const ImageComparison: import('svelte').Component<Props, {}, 'position'>;
type ImageComparison = ReturnType<typeof ImageComparison>;
export default ImageComparison;

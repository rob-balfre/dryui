import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends HTMLButtonAttributes {
	children?: Snippet;
}
declare const CarouselNext: import('svelte').Component<Props, {}, ''>;
type CarouselNext = ReturnType<typeof CarouselNext>;
export default CarouselNext;

import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends HTMLButtonAttributes {
	children?: Snippet;
}
declare const CarouselPrev: import('svelte').Component<Props, {}, ''>;
type CarouselPrev = ReturnType<typeof CarouselPrev>;
export default CarouselPrev;

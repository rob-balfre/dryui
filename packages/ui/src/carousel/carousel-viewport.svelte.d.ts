import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const CarouselViewport: import('svelte').Component<Props, {}, ''>;
type CarouselViewport = ReturnType<typeof CarouselViewport>;
export default CarouselViewport;

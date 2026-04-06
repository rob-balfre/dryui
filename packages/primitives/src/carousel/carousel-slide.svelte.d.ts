import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const CarouselSlide: import('svelte').Component<Props, {}, ''>;
type CarouselSlide = ReturnType<typeof CarouselSlide>;
export default CarouselSlide;

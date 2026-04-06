import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	orientation?: 'horizontal' | 'vertical';
	loop?: boolean;
	autoplay?: number | false;
	children: Snippet;
}
declare const CarouselRoot: import('svelte').Component<Props, {}, ''>;
type CarouselRoot = ReturnType<typeof CarouselRoot>;
export default CarouselRoot;

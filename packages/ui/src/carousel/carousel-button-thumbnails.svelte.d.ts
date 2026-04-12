import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	position?: 'bottom' | 'left' | 'right';
	children: Snippet<[{ index: number; isActive: boolean; scrollTo: (index: number) => void }]>;
}
declare const CarouselThumbnails: import('svelte').Component<Props, {}, ''>;
type CarouselThumbnails = ReturnType<typeof CarouselThumbnails>;
export default CarouselThumbnails;

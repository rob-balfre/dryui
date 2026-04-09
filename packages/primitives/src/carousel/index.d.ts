import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
export interface CarouselRootProps extends HTMLAttributes<HTMLDivElement> {
	orientation?: 'horizontal' | 'vertical';
	loop?: boolean;
	autoplay?: number | false;
	children: Snippet;
}
export interface CarouselViewportProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
export interface CarouselSlideProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
export interface CarouselPrevProps extends HTMLButtonAttributes {
	children?: Snippet;
}
export interface CarouselNextProps extends HTMLButtonAttributes {
	children?: Snippet;
}
export interface CarouselDotsProps extends HTMLAttributes<HTMLDivElement> {}
export interface CarouselThumbnailsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	position?: 'bottom' | 'left' | 'right';
	children: Snippet<
		[
			{
				index: number;
				isActive: boolean;
				scrollTo: (index: number) => void;
			}
		]
	>;
}
import CarouselRoot from './carousel-root.svelte';
import CarouselViewport from './carousel-viewport.svelte';
import CarouselSlide from './carousel-slide.svelte';
import CarouselPrev from './carousel-prev.svelte';
import CarouselNext from './carousel-next.svelte';
import CarouselDots from './carousel-dots.svelte';
import CarouselThumbnails from './carousel-thumbnails.svelte';
export declare const Carousel: {
	Root: typeof CarouselRoot;
	Viewport: typeof CarouselViewport;
	Slide: typeof CarouselSlide;
	Prev: typeof CarouselPrev;
	Next: typeof CarouselNext;
	Dots: typeof CarouselDots;
	Thumbnails: typeof CarouselThumbnails;
};

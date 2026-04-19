import { createContext } from '@dryui/primitives';

interface CarouselContext {
	readonly activeIndex: number;
	readonly totalSlides: number;
	readonly orientation: 'horizontal' | 'vertical';
	readonly canScrollPrev: boolean;
	readonly canScrollNext: boolean;
	readonly autoplayEnabled: boolean;
	readonly autoplayPaused: boolean;
	readonly autoplayRunning: boolean;
	scrollTo: (index: number) => void;
	syncActiveIndex: (index: number) => void;
	scrollPrev: () => void;
	scrollNext: () => void;
	toggleAutoplay: () => void;
	getSlideId: (index: number) => string;
	registerViewport: (el: HTMLElement) => void;
	registerSlide: () => number;
	unregisterSlide: () => void;
}
export const [setCarouselCtx, getCarouselCtx] = createContext<CarouselContext>('carousel');

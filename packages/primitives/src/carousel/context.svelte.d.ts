interface CarouselContext {
	readonly activeIndex: number;
	readonly totalSlides: number;
	readonly orientation: 'horizontal' | 'vertical';
	readonly canScrollPrev: boolean;
	readonly canScrollNext: boolean;
	scrollTo: (index: number) => void;
	scrollPrev: () => void;
	scrollNext: () => void;
	registerViewport: (el: HTMLElement) => void;
	registerSlide: () => number;
	unregisterSlide: () => void;
}
export declare function setCarouselCtx(ctx: CarouselContext): CarouselContext;
export declare function getCarouselCtx(): CarouselContext;
export {};

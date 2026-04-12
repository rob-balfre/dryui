export type { CarouselRootProps, CarouselViewportProps, CarouselSlideProps, CarouselPrevProps, CarouselNextProps, CarouselDotsProps, CarouselThumbnailsProps } from '@dryui/primitives';
import CarouselRoot from './carousel-root.svelte';
import CarouselViewport from './carousel-viewport.svelte';
import CarouselSlide from './carousel-slide.svelte';
import CarouselPrev from './carousel-button-prev.svelte';
import CarouselNext from './carousel-button-next.svelte';
import CarouselDots from './carousel-button-dots.svelte';
import CarouselThumbnails from './carousel-button-thumbnails.svelte';
export declare const Carousel: {
    Root: typeof CarouselRoot;
    Viewport: typeof CarouselViewport;
    Slide: typeof CarouselSlide;
    Prev: typeof CarouselPrev;
    Next: typeof CarouselNext;
    Dots: typeof CarouselDots;
    Thumbnails: typeof CarouselThumbnails;
};

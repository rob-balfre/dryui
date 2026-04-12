import type { ScrollToTopProps as PrimitiveScrollToTopProps } from '@dryui/primitives';

export interface ScrollToTopProps extends Omit<PrimitiveScrollToTopProps, 'children'> {
	position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
	class?: string;
}

export { default as ScrollToTop } from './scroll-to-top-button.svelte';

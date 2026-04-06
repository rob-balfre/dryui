import type { Snippet } from 'svelte';

export interface ScrollToTopProps {
	threshold?: number;
	target?: HTMLElement | undefined;
	behavior?: ScrollBehavior;
	children: Snippet<[{ visible: boolean; scrollToTop: () => void }]>;
}

export { default as ScrollToTop } from './scroll-to-top.svelte';

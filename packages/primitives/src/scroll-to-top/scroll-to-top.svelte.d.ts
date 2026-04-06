import type { Snippet } from 'svelte';
interface Props {
	threshold?: number;
	target?: HTMLElement | undefined;
	behavior?: ScrollBehavior;
	children: Snippet<
		[
			{
				visible: boolean;
				scrollToTop: () => void;
			}
		]
	>;
}
declare const ScrollToTop: import('svelte').Component<Props, {}, ''>;
type ScrollToTop = ReturnType<typeof ScrollToTop>;
export default ScrollToTop;

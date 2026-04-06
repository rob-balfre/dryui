interface Props {
	threshold?: number;
	target?: HTMLElement;
	behavior?: ScrollBehavior;
	position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
	class?: string;
}
declare const ScrollToTop: import('svelte').Component<Props, {}, ''>;
type ScrollToTop = ReturnType<typeof ScrollToTop>;
export default ScrollToTop;

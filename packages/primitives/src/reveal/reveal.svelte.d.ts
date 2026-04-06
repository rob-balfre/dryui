import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	variant?: 'fade' | 'slide-up' | 'scale-in' | 'blur-up' | 'mask-up';
	once?: boolean;
	threshold?: number;
	delay?: number;
	duration?: number;
	distance?: number | string;
	children: Snippet;
}
declare const Reveal: import('svelte').Component<Props, {}, ''>;
type Reveal = ReturnType<typeof Reveal>;
export default Reveal;

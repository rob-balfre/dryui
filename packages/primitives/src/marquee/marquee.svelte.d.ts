import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	speed?: number;
	direction?: 'left' | 'right' | 'up' | 'down';
	pauseOnHover?: boolean;
	fade?: boolean;
	gap?: string;
	children: Snippet;
}
declare const Marquee: import('svelte').Component<Props, {}, ''>;
type Marquee = ReturnType<typeof Marquee>;
export default Marquee;

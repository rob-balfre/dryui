import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export interface MarqueeProps extends HTMLAttributes<HTMLDivElement> {
	speed?: number;
	direction?: 'left' | 'right' | 'up' | 'down';
	pauseOnHover?: boolean;
	fade?: boolean;
	gap?: string;
	children: Snippet;
}
export { default as Marquee } from './marquee.svelte';

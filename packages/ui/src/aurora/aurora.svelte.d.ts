import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	palette?: 'sunrise' | 'ocean' | 'forest' | 'cosmic' | readonly [string, string, string];
	speed?: 'slow' | 'normal' | 'fast' | number;
	children?: Snippet;
}
declare const Aurora: import('svelte').Component<Props, {}, ''>;
type Aurora = ReturnType<typeof Aurora>;
export default Aurora;

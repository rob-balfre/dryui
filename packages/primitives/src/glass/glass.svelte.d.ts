import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	blur?: number;
	tint?: string;
	saturation?: number;
	children: Snippet;
}
declare const Glass: import('svelte').Component<Props, {}, ''>;
type Glass = ReturnType<typeof Glass>;
export default Glass;

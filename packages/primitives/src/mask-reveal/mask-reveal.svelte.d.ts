import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	shape?: 'circle' | 'linear' | 'diagonal' | 'diamond';
	direction?: 'in' | 'out';
	once?: boolean;
	threshold?: number;
	duration?: number;
	children?: Snippet;
}
declare const MaskReveal: import('svelte').Component<Props, {}, ''>;
type MaskReveal = ReturnType<typeof MaskReveal>;
export default MaskReveal;

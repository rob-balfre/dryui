import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import { type MaskRevealProps as PrimitiveMaskRevealProps } from '@dryui/primitives/mask-reveal';
interface Props extends HTMLAttributes<HTMLDivElement> {
	shape?: PrimitiveMaskRevealProps['shape'];
	direction?: PrimitiveMaskRevealProps['direction'];
	once?: PrimitiveMaskRevealProps['once'];
	threshold?: PrimitiveMaskRevealProps['threshold'];
	duration?: PrimitiveMaskRevealProps['duration'];
	children: Snippet;
}
declare const MaskReveal: import('svelte').Component<Props, {}, ''>;
type MaskReveal = ReturnType<typeof MaskReveal>;
export default MaskReveal;

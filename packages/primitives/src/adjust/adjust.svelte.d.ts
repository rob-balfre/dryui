import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { BlendMode } from '../internal/blend-modes.js';
interface Props extends HTMLAttributes<HTMLDivElement> {
	brightness?: number;
	contrast?: number;
	saturate?: number;
	hueRotate?: number;
	grayscale?: number;
	sepia?: number;
	invert?: number;
	blur?: number;
	blendMode?: BlendMode;
	children: Snippet;
}
declare const Adjust: import('svelte').Component<Props, {}, ''>;
type Adjust = ReturnType<typeof Adjust>;
export default Adjust;

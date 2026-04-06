import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { BlendMode } from '../internal/blend-modes.js';
interface Props extends HTMLAttributes<HTMLDivElement> {
	radius?: number;
	intensity?: number;
	color?: string;
	followPointer?: boolean;
	blendMode?: BlendMode;
	children: Snippet;
}
declare const Spotlight: import('svelte').Component<Props, {}, ''>;
type Spotlight = ReturnType<typeof Spotlight>;
export default Spotlight;

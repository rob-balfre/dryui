import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { BlendMode } from '../internal/blend-modes.js';
interface Props extends HTMLAttributes<HTMLDivElement> {
	color?: string;
	intensity?: number;
	radius?: number;
	blendMode?: BlendMode;
	children: Snippet;
}
declare const Glow: import('svelte').Component<Props, {}, ''>;
type Glow = ReturnType<typeof Glow>;
export default Glow;

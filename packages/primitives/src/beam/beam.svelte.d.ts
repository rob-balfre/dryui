import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { BlendMode } from '../internal/blend-modes.js';
interface Props extends HTMLAttributes<HTMLDivElement> {
	color?: string;
	width?: number;
	angle?: number;
	speed?: number;
	intensity?: number;
	blendMode?: BlendMode;
	children?: Snippet;
}
declare const Beam: import('svelte').Component<Props, {}, ''>;
type Beam = ReturnType<typeof Beam>;
export default Beam;

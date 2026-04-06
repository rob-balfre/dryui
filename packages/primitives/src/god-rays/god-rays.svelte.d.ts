import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { BlendMode } from '../internal/blend-modes.js';
interface Props extends HTMLAttributes<HTMLDivElement> {
	color?: string;
	rayCount?: number;
	intensity?: number;
	center?: {
		x: number;
		y: number;
	};
	speed?: number;
	blendMode?: BlendMode;
	children?: Snippet;
}
declare const GodRays: import('svelte').Component<Props, {}, ''>;
type GodRays = ReturnType<typeof GodRays>;
export default GodRays;

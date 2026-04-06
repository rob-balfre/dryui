import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { BlendMode } from '../internal/blend-modes.js';
interface Props extends HTMLAttributes<HTMLDivElement> {
	palette?: 'sunrise' | 'ocean' | 'forest' | 'cosmic' | readonly [string, string, string];
	speed?: 'slow' | 'normal' | 'fast' | number;
	intensity?: number;
	waviness?: number;
	colorSpace?: 'srgb' | 'oklch' | 'oklab';
	blendMode?: BlendMode;
	layerOpacity?: number;
	children?: Snippet;
}
declare const Aurora: import('svelte').Component<Props, {}, ''>;
type Aurora = ReturnType<typeof Aurora>;
export default Aurora;

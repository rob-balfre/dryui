import type { SVGAttributes } from 'svelte/elements';

export interface WaveDividerProps extends SVGAttributes<SVGSVGElement> {
	shape?: 'wave' | 'curve' | 'angle' | 'zigzag';
	flip?: boolean;
	color?: string;
	height?: number;
}

export { default as WaveDivider } from './wave-divider.svelte';

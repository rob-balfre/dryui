import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type BorderBeamSize = 'sm' | 'md' | 'line';
export type BorderBeamTheme = 'auto' | 'light' | 'dark';
export type BorderBeamColorVariant = 'colorful' | 'mono' | 'ocean' | 'sunset';

export interface BorderBeamProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	size?: BorderBeamSize;
	colorVariant?: BorderBeamColorVariant;
	theme?: BorderBeamTheme;
	staticColors?: boolean;
	duration?: number;
	active?: boolean;
	borderRadius?: number | string;
	brightness?: number;
	saturation?: number;
	hueRange?: number;
	strength?: number;
	onActivate?: () => void;
	onDeactivate?: () => void;
	children?: Snippet;
}

export { default as BorderBeam } from './border-beam.svelte';

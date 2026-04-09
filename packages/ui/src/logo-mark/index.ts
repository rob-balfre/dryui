import type { HTMLAttributes } from 'svelte/elements';

export interface LogoMarkProps extends HTMLAttributes<HTMLSpanElement> {
	src?: string;
	alt?: string;
	fallback?: string;
	size?: 'sm' | 'md' | 'lg';
	shape?: 'square' | 'rounded' | 'circle';
	color?: 'brand' | 'neutral' | 'error' | 'warning' | 'success' | 'info';
}

export { default as LogoMark } from './logo-mark.svelte';

import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface TextProps extends Omit<HTMLAttributes<HTMLElement>, 'class'> {
	as?: 'p' | 'span' | 'div';
	color?: 'default' | 'muted' | 'secondary';
	size?: 'xs' | 'sm' | 'md' | 'lg';
	font?: 'sans' | 'mono';
	weight?: 'normal' | 'medium' | 'semibold' | 'bold';
	variant?: 'default' | 'label';
	/**
	 * Caps the rendered inline size in ch units so body copy wraps on ergonomic
	 * measure. `false` (default) keeps the existing behaviour of no cap.
	 * `narrow` ≈ 48ch, `default` ≈ 65ch, `wide` ≈ 80ch.
	 */
	maxMeasure?: 'narrow' | 'default' | 'wide' | false;
	children?: Snippet;
}

export { default as Text } from './text.svelte';

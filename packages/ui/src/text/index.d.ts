import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export interface TextProps extends HTMLAttributes<HTMLElement> {
	as?: 'p' | 'span' | 'div';
	color?: 'default' | 'muted' | 'secondary';
	size?: 'xs' | 'sm' | 'md' | 'lg';
	font?: 'sans' | 'mono';
	weight?: 'normal' | 'medium' | 'semibold' | 'bold';
	variant?: 'default' | 'label';
	children: Snippet;
}
export { default as Text } from './text.svelte';

import type { Snippet } from 'svelte';

export interface IconProps {
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
	color?: 'primary' | 'muted' | 'current';
	label?: string;
	class?: string;
	children: Snippet;
}

export { default as Icon } from './icon.svelte';

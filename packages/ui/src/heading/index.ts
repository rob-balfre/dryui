import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
	level?: 1 | 2 | 3 | 4 | 5 | 6;
	variant?: 'default' | 'display';
	className?: HTMLAttributes<HTMLHeadingElement>['class'];
	children: Snippet;
}

export { default as Heading } from './heading.svelte';

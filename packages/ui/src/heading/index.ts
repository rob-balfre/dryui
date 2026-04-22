import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
	level?: 1 | 2 | 3 | 4 | 5 | 6;
	variant?: 'default' | 'display';
	/**
	 * Caps the rendered inline size in ch units so editorial headlines wrap on
	 * ergonomic measure. `false` (default) keeps the existing behaviour of no
	 * cap. `narrow` ≈ 22ch, `default` ≈ 45ch, `wide` ≈ 65ch.
	 */
	maxMeasure?: 'narrow' | 'default' | 'wide' | false;
	className?: HTMLAttributes<HTMLHeadingElement>['class'];
	children: Snippet;
}

export { default as Heading } from './heading.svelte';

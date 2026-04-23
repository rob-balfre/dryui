import type { HTMLAttributes } from 'svelte/elements';

export interface PluralizeProps extends HTMLAttributes<HTMLSpanElement> {
	count: number;
	noun?: string;
	singular?: string;
	plural?: string;
}

export { default as Pluralize } from './pluralize.svelte';

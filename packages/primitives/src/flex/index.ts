import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface FlexProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}

export { default as Flex } from './flex.svelte';

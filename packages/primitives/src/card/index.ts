import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { SvelteComponent } from 'svelte';

export interface CardRootProps extends HTMLAttributes<HTMLElement> {
	as?: 'div' | 'a' | 'button';
	selected?: boolean;
	orientation?: 'vertical' | 'horizontal';
	children: Snippet;
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}

import CardRoot from './card-root.svelte';
import CardHeader from '../internal/snippet-div.svelte';
import CardContent from '../internal/snippet-div.svelte';
import CardFooter from '../internal/snippet-div.svelte';

export const Card: {
	Root: typeof CardRoot;
	Header: typeof CardHeader;
	Content: typeof CardContent;
	Footer: typeof CardFooter;
} = {
	Root: CardRoot,
	Header: CardHeader,
	Content: CardContent,
	Footer: CardFooter
};
